import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GithubController } from './github.controller';
import { GithubAppService } from './github-app.service';
import { GithubService } from './github.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [GithubController],
  providers: [GithubService, GithubAppService],
  exports: [GithubService, GithubAppService]
})
export class GithubModule {}
