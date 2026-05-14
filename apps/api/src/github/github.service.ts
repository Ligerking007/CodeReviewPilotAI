import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
    const response = await this.githubRequest(path, token);

    if (response.status === 404) {
      const publicResponse = await this.githubRequest(path);
      if (publicResponse.ok) {
        return (await publicResponse.json()) as T;
      }

      throw new NotFoundException(
        'GitHub pull request was not found or your token cannot access this repository. Check the PR URL and fine-grained token permissions: Metadata read, Contents read, Pull requests read.'
      );
    }

    if (!response.ok) {
      await this.throwGithubError(response);
    }

    return (await response.json()) as T;
  }

  private async throwGithubError(response: Response): Promise<never> {
    const payload = (await response.json().catch(() => undefined)) as { message?: string; documentation_url?: string } | undefined;
    const message = payload?.message ?? `GitHub API failed with ${response.status}`;
    const documentation = payload?.documentation_url ? ` See: ${payload.documentation_url}` : '';

    if (response.status === 403) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      const reset = response.headers.get('x-ratelimit-reset');
      const rateLimit =
        remaining === '0' && reset
          ? ` GitHub rate limit resets at ${new Date(Number(reset) * 1000).toISOString()}.`
          : '';

      throw new ForbiddenException(
        `${message}.${rateLimit}${documentation} For private repositories, check that your fine-grained token has access to this repository and permissions: Metadata read, Contents read, Pull requests read. If the repository is in an organization, authorize SSO for the token.`
      );
    }

    if (response.status === 429) {
      throw new HttpException(`${message}.${documentation}`, HttpStatus.TOO_MANY_REQUESTS);
    }

    throw new Error(`${message}.${documentation}`);
  }

  private githubRequest(path: string, token?: string) {
    return fetch(`https://api.github.com${path}`, {
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28'
      }
    });
  }
}
