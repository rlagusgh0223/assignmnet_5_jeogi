import { Body, Controller, Post } from '@nestjs/common';
import { PartnersLogInDto, PartnersSignUpDto } from './partners.dto';
import { PartnersService } from './partners.service';

@Controller('accounts/partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post('sign-up') // url-path의미
  async signUp(@Body() dto: PartnersSignUpDto) {
    const accessToken = await this.partnersService.signUp(dto);
    return { accessToken };
  }

  @Post('log-in') // url-path의미
  async logIn(@Body() dto: PartnersLogInDto) {
    const accessToken = await this.partnersService.logIn(dto);
    return { accessToken };
  }
}
