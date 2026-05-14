import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TokenCryptoService } from './token-crypto.service';

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
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly tokenCrypto: TokenCryptoService
  ) {}

  async loginWithGithub(profile: GithubProfile) {
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
}
