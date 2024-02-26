import { Injectable } from '@nestjs/common';
import { Accommodation, Prisma, Reservation, Room } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createRoom(
    accommodationId: Accommodation['id'],
    dataWithoutAccommodationId: Prisma.RoomCreateWithoutAccommodationInput,
  ) {
    const data: Prisma.RoomUncheckedCreateInput = {
      accommodationId,
      ...dataWithoutAccommodationId,
    };
    const room = await this.prismaService.room.create({ data });
    return room;
  }

  async deleteRoom(roomId: Room['id']) {
    const room = await this.prismaService.room.delete({
      where: { id: roomId },
    });
    return room;
  }

  async makeReservation(
    reservedById: Reservation['reservedById'],
    roomId: Reservation['roomId'],
    date: Reservation['date'],
  ) {
    const reservation = await this.prismaService.reservation.update({
      where: { roomId_date: { roomId, date } },
      data: { reservedAt: new Date(), reservedById },
    });
    return reservation;
  }

  async makeCheckedIn(
    reservedById: Reservation['reservedById'],
    reservedAt: Reservation['reservedAt'],
    roomId: Reservation['roomId'],
    date: Reservation['date'],
  ) {
    // 해당 roomId와 date에 대한 예약이 있는지 확인
    const checkReservation = await this.prismaService.reservation.findUnique({
      where: { roomId_date: { roomId, date } },
    });

    // 예약이 없거나 reservedAt이 설정되지 않은 경우 에러
    if (!checkReservation || !checkReservation.reservedAt) {
      throw new Error('No Reservation');
    }

    // 예약이 존재하고 reservedAt이 있는 경우, checkedInAt을 현재 시간으로 업데이트
    const reservation = await this.prismaService.reservation.update({
      where: { roomId_date: { roomId, date } },
      data: { checkedInAt: new Date() },
    });
    return reservation;
  }

  async cancelReservation(roomId: string) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id: roomId },
      include: { room: true },
    });

    if (!reservation) throw new Error('Reservation not found');

    await this.prismaService.reservation.update({
      where: { id: roomId },
      data: { reservedAt: new Date() },
    });
  }
}
