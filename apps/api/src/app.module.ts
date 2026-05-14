import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiReviewModule } from './ai-review/ai-review.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma.module';
import { GithubModule } from './github/github.module';
import { HistoryModule } from './history/history.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GithubModule,
    AiReviewModule,
    HistoryModule
  ],
  controllers: [AppController]
})
export class AppModule {}
