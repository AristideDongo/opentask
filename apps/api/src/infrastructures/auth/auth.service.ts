import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'node:http';
import { Inject, Injectable } from '@nestjs/common';
import { type Auth, createAuth } from '@opentask/auth/auth';
import { ENV, type Env } from '../../shared/config/env';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly auth: Auth;

  constructor(
    @Inject(ENV) env: Env,
    @Inject(PrismaService) prisma: PrismaService,
    @Inject(MailService) mail: MailService,
  ) {
    this.auth = createAuth(
      {
        publicUrl: env.PUBLIC_URL,
        secret: env.AUTH_SECRET,
        requireEmailVerification: env.REQUIRE_EMAIL_VERIFICATION,
        rateLimitEnabled: env.RATE_LIMIT_ENABLED,
      },
      {
        prisma: prisma.client,
        mailer: {
          sendPasswordReset: (email, name, url, locale) =>
            mail.enqueuePasswordReset(email, name, url, locale),
          sendVerification: (email, name, url, locale) =>
            mail.enqueueVerification(email, name, url, locale),
        },
      },
    );
  }

  sessionUser(headers: IncomingHttpHeaders) {
    return this.auth.sessionUser(headers);
  }

  handle(req: IncomingMessage, res: ServerResponse, clientIp: string) {
    return this.auth.handle(req, res, clientIp);
  }
}
