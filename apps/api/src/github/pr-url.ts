import { BadRequestException } from '@nestjs/common';

export type ParsedPullRequestUrl = {
  owner: string;
  repo: string;
  prNumber: number;
};

export function parsePullRequestUrl(value: string): ParsedPullRequestUrl {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new BadRequestException('Invalid GitHub pull request URL');
  }

  if (url.hostname !== 'github.com') {
    throw new BadRequestException('Only github.com pull request URLs are supported');
  }

  const [owner, repo, pullSegment, prNumberRaw] = url.pathname.split('/').filter(Boolean);
  const prNumber = Number(prNumberRaw);

  if (!owner || !repo || pullSegment !== 'pull' || !Number.isInteger(prNumber) || prNumber <= 0) {
    throw new BadRequestException('URL must match https://github.com/owner/repo/pull/123');
  }

  return { owner, repo, prNumber };
}
