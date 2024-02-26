import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { PrismaService } from 'src/db/prisma/prisma.service';
import generateRandomId from 'src/utils/generateRandomId';
import { UsersLogInDto, UsersSignUpDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async signUp(dto: UsersSignUpDto) {
    const { email, password } = dto;
    const data: Prisma.UserCreateInput = {
      id: generateRandomId(),
      email,
      encryptedPassword: await hash(password, 12),
    };
    const user = await this.prismaService.user.create({
      data,
      select: { id: true, email: true },
    });
    const accessToken = this.generateAccessToken(user);

    return accessToken;
  }

  async logIn(dto: UsersLogInDto) {
    const { email, password } = dto;

    // 이메일로 유저찾기
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true, email: true, encryptedPassword: true },
    });
    // ㄴ 없으면 에러
    if (!user) throw new NotFoundException('No User found');

    // 패스워드 검증
    const isCoreectPassword = compare(password, user.encryptedPassword);
    // ㄴ 패스워드 맞지 않으면 에러
    if (!isCoreectPassword) throw new BadRequestException('Incorrect password');

    // 액세스 토큰 만들어서 돌려주기
    const accessToken = this.generateAccessToken(user);
    return accessToken;
  }

  generateAccessToken(user: Pick<User, 'id' | 'email'>) {
    //User에서 id와 email은 꼭 넣어줘
    const { id: subject, email } = user;
    const secretKey = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
    const accessToken = sign({ email, accountType: 'user' }, secretKey, {
      subject,
      expiresIn: '5d',
    });
    return accessToken;
  }
}
