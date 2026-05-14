import { isValidPullRequestUrl } from './pr-url';

describe('isValidPullRequestUrl', () => {
  it('validates GitHub PR URLs', () => {
    expect(isValidPullRequestUrl('https://github.com/openai/example/pull/42')).toBe(true);
    expect(isValidPullRequestUrl('https://github.com/openai/example/issues/42')).toBe(false);
    expect(isValidPullRequestUrl('bad-url')).toBe(false);
  });
});
