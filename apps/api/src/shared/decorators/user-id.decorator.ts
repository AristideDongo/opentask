import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';
import { ApiException } from '../errors/api.exception';

export const UserId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const user = ctx.switchToHttp().getRequest<Request>().user;
  if (!user) throw new ApiException(401, 'UNAUTHENTICATED', 'Session absente ou expirée.');
  return user.id;
});
