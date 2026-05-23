import { AiReviewService } from './ai-review.service';

const createService = () =>
  new AiReviewService(
    {
      get: jest.fn(),
      getOrThrow: jest.fn().mockReturnValue('test-openai-key')
    } as any,
    {} as any,
    {} as any
  );

const createBundle = (overrides: Partial<Parameters<AiReviewService['buildPrompt']>[0]> = {}) =>
  ({
    owner: 'octo-org',
    repo: 'pilot-api',
    prNumber: 42,
    pullRequest: {
      id: 1,
      number: 42,
      title: 'Improve consent review flow',
      body: 'Adds validation and logging around consent download.',
      html_url: 'https://github.com/octo-org/pilot-api/pull/42',
      state: 'open',
      user: { login: 'developer' },
      base: {
        ref: 'main',
        repo: {
          full_name: 'octo-org/pilot-api',
          html_url: 'https://github.com/octo-org/pilot-api'
        }
      },
      head: { ref: 'feature/consent', sha: 'abcdef1234567890' }
    },
    files: [
      {
        filename: 'src/consent.ts',
        status: 'modified',
        additions: 10,
        deletions: 2,
        changes: 12,
        patch: '+'.repeat(13000)
      },
      {
        filename: 'assets/icon.png',
        status: 'modified',
        additions: 0,
        deletions: 0,
        changes: 0
      }
    ],
    commits: [
      {
        sha: 'abcdef1234567890',
        commit: {
          message: 'Add consent validation'
        }
      }
    ],
    ...overrides
  }) as Parameters<AiReviewService['buildPrompt']>[0];

describe('AiReviewService buildPrompt', () => {
  it('builds an English review prompt with PR metadata and changed files', () => {
    const prompt = createService().buildPrompt(createBundle(), 'en');

    expect(prompt).toContain('produce a JSON object in English');
    expect(prompt).toContain('Improve consent review flow');
    expect(prompt).toContain('Repository: octo-org/pilot-api');
    expect(prompt).toContain('PR: #42');
    expect(prompt).toContain('Author: developer');
    expect(prompt).toContain('File: src/consent.ts');
    expect(prompt).toContain('File: assets/icon.png');
    expect(prompt).toContain('[binary or patch unavailable]');
  });

  it('uses Thai when requested', () => {
    const prompt = createService().buildPrompt(createBundle(), 'th');

    expect(prompt).toContain('produce a JSON object in Thai');
  });

  it('limits each file patch before adding it to the prompt', () => {
    const prompt = createService().buildPrompt(createBundle(), 'en');

    expect(prompt).not.toContain('+'.repeat(12001));
    expect(prompt).toContain('+'.repeat(12000));
  });
});
