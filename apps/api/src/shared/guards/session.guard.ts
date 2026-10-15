import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { scopeForMethod } from '@opentask/contracts/tokens/api-token';
import type { Request } from 'express';
import type { TokenIdentity } from '../../domains/api-tokens/types/api-token.types';
import { assertTokenScope, isApiToken } from '../../domains/api-tokens/helpers/api-token.helper';
import type { AuthService } from '../../infrastructures/auth/auth.service';
import { PUBLIC_ROUTE } from '../decorators/public.decorator';
import { SESSION_ONLY_ROUTE } from '../decorators/session-only.decorator';
import { ApiException } from '../errors/api.exception';

export interface AuthenticatedUser {
  id: string;
  via: 'session' | 'token';
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

export interface TokenAuthenticator {
  execute(token: string): Promise<TokenIdentity | null>;
}

const bearerToken = (req: Request) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return isApiToken(token) ? token : null;
};

const UNAUTHENTICATED = () =>
  new ApiException(401, 'UNAUTHENTICATED', 'Session absente ou expirée.');

export class SessionGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokenAuthenticator,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, targets);
    const sessionOnly = this.reflector.getAllAndOverride<boolean>(SESSION_ONLY_ROUTE, targets);
    const req = context.switchToHttp().getRequest<Request>();
    const token = bearerToken(req);
    if (token) {
      if (sessionOnly) {
        throw new ApiException(
          403,
          'FORBIDDEN',
          'Cette opération exige une session, pas un jeton d’API.',
        );
      }
      const identity = await this.tokens.execute(token);
      if (!identity) throw UNAUTHENTICATED();
      assertTokenScope(identity, scopeForMethod(req.method));
      req.user = { id: identity.userId, via: 'token' };
      return true;
    }
    const user = await this.auth.sessionUser(req.headers);
    if (user) req.user = { id: user.id, via: 'session' };
    if (isPublic || user) return true;
    throw UNAUTHENTICATED();
  }
}
