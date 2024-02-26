import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const DPartner = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.partner;
  },
);
