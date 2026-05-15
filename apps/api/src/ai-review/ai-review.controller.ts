import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthUser } from '../common/types';
import { AiReviewService } from './ai-review.service';
import { CreateReviewDto } from './dto';

@Controller('ai-review')
@UseGuards(JwtAuthGuard)
export class AiReviewController {
  constructor(private readonly aiReview: AiReviewService) {}

  // OpenAI-backed reviews are intentionally stricter than the global API limit.
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @Post('reviews')
  createReview(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.aiReview.createReview(user.sub, dto);
  }
}
