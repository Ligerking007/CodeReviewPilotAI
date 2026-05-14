import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

type UpsertGithubUserInput = {
  githubUserId: string;
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  encryptedAccessToken: string;
  tokenIv: string;
  tokenAuthTag: string;
  scopes: string[];
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertGithubUser(input: UpsertGithubUserInput) {
    const account = await this.prisma.githubAccount.findUnique({
      where: { githubUserId: input.githubUserId },
      include: { user: true }
    });

    if (account) {
      return this.prisma.user.update({
        where: { id: account.userId },
        data: {
          name: input.name,
          email: input.email,
          avatarUrl: input.avatarUrl,
          githubAccounts: {
            update: {
              where: { githubUserId: input.githubUserId },
              data: {
                username: input.username,
                encryptedAccessToken: input.encryptedAccessToken,
                tokenIv: input.tokenIv,
                tokenAuthTag: input.tokenAuthTag,
                scopes: input.scopes
              }
            }
          }
        }
      });
    }

    return this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        avatarUrl: input.avatarUrl,
        githubAccounts: {
          create: {
            githubUserId: input.githubUserId,
            username: input.username,
            encryptedAccessToken: input.encryptedAccessToken,
            tokenIv: input.tokenIv,
            tokenAuthTag: input.tokenAuthTag,
            scopes: input.scopes
          }
        }
      }
    });
  }

  async getDefaultGithubAccount(userId: string) {
    const account = await this.prisma.githubAccount.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    if (!account) {
      throw new NotFoundException('GitHub account not connected');
    }

    return account;
  }
}
