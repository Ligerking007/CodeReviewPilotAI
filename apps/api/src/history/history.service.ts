import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.reviewHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { result: true },
      take: 50
    });
  }
}
