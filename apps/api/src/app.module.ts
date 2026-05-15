import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AiReviewModule } from './ai-review/ai-review.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma.module';
import { GithubModule } from './github/github.module';
import { HistoryModule } from './history/history.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';

function getPositiveNumber(value: string | number | undefined, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: getPositiveNumber(config.get<string>('RATE_LIMIT_TTL_MS'), 60_000),
          limit: getPositiveNumber(config.get<string>('RATE_LIMIT_MAX'), 120)
        }
      ]
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GithubModule,
    AiReviewModule,
    HistoryModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
