import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReview(userId: string, reservationId: number, content: string) {
    // 예약이 존재하고, checkedInAt이 할당된 경우에만 리뷰를 생성
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id: reservationId },
      include: { review: true },
    });

    if (!reservation || !reservation.checkedInAt || reservation.review) {
      throw new Error("Review can't created");
    }

    return this.prismaService.review.create({
      data: {
        content,
        reservationId,
        userId,
      },
    });
  }
}
