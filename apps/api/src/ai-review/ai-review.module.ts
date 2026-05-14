import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { GithubModule } from '../github/github.module';
import { AiReviewController } from './ai-review.controller';
import { AiReviewService } from './ai-review.service';

@Module({
  imports: [ConfigModule, AuthModule, GithubModule],
  controllers: [AiReviewController],
  providers: [AiReviewService],
  exports: [AiReviewService]
})
export class AiReviewModule {}
