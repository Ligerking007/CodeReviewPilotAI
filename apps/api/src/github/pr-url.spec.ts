import { BadRequestException } from '@nestjs/common';
import { parsePullRequestUrl } from './pr-url';

describe('parsePullRequestUrl', () => {
  it('parses valid GitHub PR URLs', () => {
    expect(parsePullRequestUrl('https://github.com/openai/example/pull/123')).toEqual({
      owner: 'openai',
      repo: 'example',
      prNumber: 123
    });
  });

  it('rejects invalid URLs', () => {
    expect(() => parsePullRequestUrl('https://github.com/openai/example/issues/123')).toThrow(BadRequestException);
    expect(() => parsePullRequestUrl('https://gitlab.com/openai/example/pull/123')).toThrow(BadRequestException);
  });
});
