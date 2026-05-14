import { Body, Controller, Get, HttpCode, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString, MinLength } from 'class-validator';
import { Response } from 'express';
import { AuthService } from './auth.service';

class GithubTokenLoginDto {
  @IsString()
  @MinLength(20)
  token!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService
  ) {}

  @Get('github')
  redirectToGithub(@Res() response: Response) {
    const params = new URLSearchParams({
      client_id: this.config.getOrThrow<string>('GITHUB_CLIENT_ID'),
      redirect_uri: this.config.getOrThrow<string>('GITHUB_CALLBACK_URL'),
      scope: 'read:user user:email repo',
      allow_signup: 'true'
    });

    response.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  }

  @Get('github/callback')
  async githubCallback(@Query('code') code: string, @Res() response: Response) {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.config.getOrThrow<string>('GITHUB_CLIENT_ID'),
        client_secret: this.config.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
        code,
        redirect_uri: this.config.getOrThrow<string>('GITHUB_CALLBACK_URL')
      })
    });
    const tokenJson = (await tokenResponse.json()) as { access_token?: string; scope?: string; error?: string };

    if (!tokenJson.access_token) {
      response.redirect(`${this.config.getOrThrow<string>('APP_WEB_REDIRECT_URL')}?error=github_oauth_failed`);
      return;
    }

    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        authorization: `Bearer ${tokenJson.access_token}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28'
      }
    });
    const profile = (await profileResponse.json()) as {
      id: number;
      login: string;
      name?: string;
      email?: string;
      avatar_url?: string;
    };

    const { appToken } = await this.auth.loginWithGithub({
      githubUserId: String(profile.id),
      username: profile.login,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      accessToken: tokenJson.access_token,
      scopes: tokenJson.scope?.split(',').filter(Boolean) ?? []
    });

    const redirectUrl = new URL(this.config.getOrThrow<string>('APP_WEB_REDIRECT_URL'));
    redirectUrl.searchParams.set('token', appToken);
    response.redirect(redirectUrl.toString());
  }

  @Post('github-token')
  async loginWithGithubToken(@Body() body: GithubTokenLoginDto) {
    return this.auth.loginWithGithubToken(body.token.trim());
  }

  @HttpCode(204)
  @Get('logout')
  logout() {
    return;
  }
}
