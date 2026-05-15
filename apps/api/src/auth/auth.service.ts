import { ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { UsersService } from '../users/users.service';
import { isGithubUsernameAllowed } from './github-allowlist';
import { TokenCryptoService } from './token-crypto.service';

const execFileAsync = promisify(execFile);

export type GithubProfile = {
  githubUserId: string;
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  accessToken: string;
  scopes: string[];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly tokenCrypto: TokenCryptoService
  ) {}

  async loginWithGithub(profile: GithubProfile) {
    // Enforce access before token persistence so disallowed users never create a stored GitHub account link.
    this.assertGithubUsernameAllowed(profile.username);

    const encrypted = this.tokenCrypto.encrypt(profile.accessToken);
    const user = await this.users.upsertGithubUser({
      ...profile,
      ...encrypted
    });

    const appToken = await this.jwt.signAsync({
      sub: user.id,
      githubUsername: profile.username
    });

    return { appToken, user };
  }

  private assertGithubUsernameAllowed(username: string) {
    const allowlist = this.config.get<string>('GITHUB_ALLOWED_USERNAMES');

    if (!isGithubUsernameAllowed(username, allowlist)) {
      throw new ForbiddenException('This GitHub account is not allowed to use CodeReviewPilot AI.');
    }
  }

  async loginWithGithubToken(accessToken: string) {
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28'
      }
    });

    if (!profileResponse.ok) {
      throw new UnauthorizedException('Invalid GitHub token or missing user access');
    }

    const profile = (await profileResponse.json()) as {
      id: number;
      login: string;
      name?: string;
      email?: string;
      avatar_url?: string;
    };
    const scopes = profileResponse.headers
      .get('x-oauth-scopes')
      ?.split(',')
      .map((scope) => scope.trim())
      .filter(Boolean);

    return this.loginWithGithub({
      githubUserId: String(profile.id),
      username: profile.login,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      accessToken,
      scopes: scopes?.length ? scopes : ['fine-grained-personal-access-token']
    });
  }

  async loginWithGithubCli() {
    let stdout: string;
    try {
      const result = await execFileAsync('gh', ['auth', 'token'], { timeout: 5000 });
      stdout = result.stdout;
    } catch {
      throw new InternalServerErrorException('GitHub CLI auth is unavailable. Install gh and run `gh auth login` on this machine.');
    }

    const accessToken = stdout.trim();
    if (!accessToken) {
      throw new UnauthorizedException('GitHub CLI returned an empty token. Run `gh auth login` on this machine.');
    }

    return this.loginWithGithubToken(accessToken);
  }
}
