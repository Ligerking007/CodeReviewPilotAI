import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsUrl } from 'class-validator';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthUser } from '../common/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GithubService } from './github.service';

class PrDetailsDto {
  @IsUrl({ require_protocol: true })
  prUrl!: string;
}

@Controller('github')
@UseGuards(JwtAuthGuard)
export class GithubController {
  constructor(private readonly github: GithubService) {}

  @Post('pull-request')
  async getPullRequest(@CurrentUser() user: AuthUser, @Body() body: PrDetailsDto) {
    const bundle = await this.github.getPullRequestBundle(user.sub, body.prUrl);
    return {
      owner: bundle.owner,
      repo: bundle.repo,
      prNumber: bundle.prNumber,
      pullRequest: bundle.pullRequest,
      files: bundle.files,
      commits: bundle.commits
    };
  }
}
