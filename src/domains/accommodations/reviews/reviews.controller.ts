import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import { ReviewsService } from './reviews.service';

// 9번 해보려고 했는데 쉽지 않다...
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Private('user')
  createReview(
    @DUser() user: User,
    @Body('reservationId') reservationId: number,
    @Body('content') content: string,
  ) {
    return this.reviewsService.createReview(user.id, reservationId, content);
  }
}
