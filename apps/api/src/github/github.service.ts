import { Injectable, NotFoundException } from '@nestjs/common';
import { TokenCryptoService } from '../auth/token-crypto.service';
import { UsersService } from '../users/users.service';
import { GithubChangedFile, GithubCommit, GithubPullRequest } from './github.types';
import { parsePullRequestUrl } from './pr-url';

@Injectable()
export class GithubService {
  constructor(
    private readonly users: UsersService,
    private readonly tokenCrypto: TokenCryptoService
  ) {}

  parsePullRequestUrl = parsePullRequestUrl;

  async getPullRequestBundle(userId: string, prUrl: string) {
    const parsed = parsePullRequestUrl(prUrl);
    const token = await this.getUserGithubToken(userId);
    const [pullRequest, files, commits] = await Promise.all([
      this.githubFetch<GithubPullRequest>(token, `/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.prNumber}`),
      this.githubFetch<GithubChangedFile[]>(token, `/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.prNumber}/files?per_page=100`),
      this.githubFetch<GithubCommit[]>(token, `/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.prNumber}/commits?per_page=100`)
    ]);

    return {
      ...parsed,
      pullRequest,
      files,
      commits
    };
  }

  private async getUserGithubToken(userId: string) {
    const account = await this.users.getDefaultGithubAccount(userId);
    return this.tokenCrypto.decrypt({
      encryptedAccessToken: account.encryptedAccessToken,
      tokenIv: account.tokenIv,
      tokenAuthTag: account.tokenAuthTag
    });
  }

  private async githubFetch<T>(token: string, path: string): Promise<T> {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28'
      }
    });

    if (response.status === 404) {
      throw new NotFoundException('GitHub resource not found or not accessible');
    }

    if (!response.ok) {
      throw new Error(`GitHub API failed with ${response.status}`);
    }

    return (await response.json()) as T;
  }
}
