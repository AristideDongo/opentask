import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AuthService } from '../../infrastructures/auth/auth.service';
import { PUBLIC_ROUTE } from '../decorators/public.decorator';
import { ApiException } from '../errors/api.exception';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

export class SessionGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest<Request>();
    const user = await this.auth.sessionUser(req.headers);
    if (user) req.user = user;
    if (isPublic || user) return true;
    throw new ApiException(401, 'UNAUTHENTICATED', 'Session absente ou expirée.');
  }
}
