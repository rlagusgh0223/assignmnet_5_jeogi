import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  Accommodation,
  AccommodationType,
  Partner,
  Prisma,
  Room,
} from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { RoomsService } from './rooms/rooms.service';

@Injectable()
export class AccommodationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roomsService: RoomsService,
  ) {}

  async createAccommodation(data: Prisma.AccommodationUncheckedCreateInput) {
    const accommodation = await this.prismaService.accommodation.create({
      data,
    });
    return accommodation;
  }

  async getAccommodations(type?: AccommodationType) {
    const accommodations = await this.prismaService.accommodation.findMany({
      where: { type },
    });

    return accommodations;
  }

  async getAccommodation(accommodationId: number) {
    const accommodations = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId },
      include: { rooms: true }, // rooom이 연결된다
    });

    return accommodations;
  }

  async addRoomToAccommodation(
    partner: Pick<Partner, 'id'>,
    accommodationId: Accommodation['id'],
    data: Parameters<typeof this.roomsService.createRoom>[1],
  ) {
    // 1. 지금 요청한 partner가 accommodation의 소유자가 맞는지 확인
    // ㄴ 아니면 돌아가
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId, partnerId: partner.id },
    });
    if (!accommodation) throw new ForbiddenException();

    // 2. 숙소에 방을 추가하기
    // 방을 create -> rooms.service
    const room = await this.roomsService.createRoom(accommodationId, data);
    return room;
  }

  async deleteRoomFromAccommodation(
    partner: Pick<Partner, 'id'>,
    accommodationId: Accommodation['id'],
    roomId: Room['id'],
  ) {
    // 1. 지금 요청한 partner가 accomodation의 소유자가 맞아?
    // 아니면 돌아가
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId, partnerId: partner.id },
    });
    if (!accommodation) throw new ForbiddenException();
    // 2. 숙소에 방 취소하기
    const room = await this.roomsService.deleteRoom(roomId);
    return room;
  }

  // async addImageToAccommodation{
  //   await fstat.writeFile(`./public/${file.originalname}`)

  // }
}
