import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSign } from 'crypto';

type InstallationTokenResponse = {
  token: string;
  expires_at: string;
  permissions?: Record<string, string>;
  repository_selection?: string;
};

@Injectable()
export class GithubAppService {
  constructor(private readonly config: ConfigService) {}

  async createInstallationAccessToken(installationId: string): Promise<InstallationTokenResponse> {
    const jwt = this.createAppJwt();
    const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${jwt}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub App installation token request failed with ${response.status}`);
    }

    return (await response.json()) as InstallationTokenResponse;
  }

  createAppJwt() {
    const appId = this.config.get<string>('GITHUB_APP_ID');
    const privateKey = this.config.get<string>('GITHUB_APP_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    if (!appId || !privateKey) {
      throw new InternalServerErrorException('GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are required');
    }

    const now = Math.floor(Date.now() / 1000);
    const header = this.base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = this.base64Url(
      JSON.stringify({
        iat: now - 60,
        exp: now + 9 * 60,
        iss: appId
      })
    );
    const signingInput = `${header}.${payload}`;
    const signature = createSign('RSA-SHA256').update(signingInput).sign(privateKey, 'base64url');

    return `${signingInput}.${signature}`;
  }

  private base64Url(value: string) {
    return Buffer.from(value).toString('base64url');
  }
}
