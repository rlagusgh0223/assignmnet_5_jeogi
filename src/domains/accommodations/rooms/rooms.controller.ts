import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Partner, User } from '@prisma/client';
import { DPartner } from 'src/decorators/partner.decorator';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import day from 'src/utils/day';
import { RoomsService } from './rooms.service';

@Controller('/accommodations/:accommodationId/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}
  @Post('/:roomId/reservations')
  @Private('user')
  makeReservation(
    @DUser() user: User,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body('date') date: string,
  ) {
    return this.roomsService.makeReservation(
      user.id,
      roomId,
      day(date).startOf('day').toDate(),
    );
  }

  // 8번문제를 해결하기 위해 Reservation에 checkedInAt을 작성한다
  // makeReservation이 있는 상태라면 checkedInAt을 작성할 수 있다고 하면 되지 않을까
  @Post('/:roomId/checkedIn')
  @Private('partner')
  makeCheckedIn(
    @DPartner() partner: Partner,
    @Body('reservedAt') reservedAt: string,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body('date') date: string,
  ) {
    return this.roomsService.makeCheckedIn(
      partner.id,
      day(reservedAt).toDate(),
      roomId,
      day(date).startOf('day').toDate(),
    );
  }

  // 10번 문제를 해결해야 하는데....
  @Delete('/:roomId/cancelReservations')
  async cancelReservation(@Param('roomId', ParseIntPipe) roomId: string) {
    return this.roomsService.cancelReservation(roomId);
  }
}
