import { Injectable } from '@nestjs/common';
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
}
