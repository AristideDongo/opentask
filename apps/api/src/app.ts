import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { AppModule } from './app.module';
import { AUTH_BASE_PATH } from '@opentask/auth/auth.const';
import { AuthService } from './infrastructures/auth/auth.service';
import { type Logger, createLogger } from './infrastructures/logger/logger.service';
import type { PrismaClient } from '@opentask/database/client';
import { PrismaService } from './infrastructures/prisma/prisma.service';
import { RealtimeService } from './infrastructures/realtime/realtime.service';
import type { Env } from './shared/config/env';
import { originCheck } from './shared/middlewares/origin-check.middleware';
import { redactUrl } from './shared/utils/redact-url';

export const API_GLOBAL_PREFIX = 'api/v1';

export interface BuiltApp {
  app: NestExpressApplication;
  prisma: PrismaClient;
  logger: Logger;
  realtime: RealtimeService;
}

export async function buildApp(env: Env, overrides: { logger?: Logger } = {}): Promise<BuiltApp> {
  const logger = overrides.logger ?? createLogger(env.LOG_LEVEL);
  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(env, logger), {
    bodyParser: false,
    logger: env.NODE_ENV === 'test' ? false : ['error', 'warn'],
  });
  const auth = app.get(AuthService);

  app.set('trust proxy', env.TRUST_PROXY_HOPS);
  app.disable('x-powered-by');
  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const incoming = req.headers['x-request-id'];
        const id =
          typeof incoming === 'string' && /^[\w-]{1,64}$/.test(incoming) ? incoming : randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      autoLogging: { ignore: (req) => req.url?.startsWith('/api/v1/health') ?? false },
      serializers: {
        req: (req: { id: string; method: string; url: string }) => ({
          id: req.id,
          method: req.method,
          url: redactUrl(req.url),
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
      customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : 'info'),
    }),
  );
  app.use(helmet());
  app.use(`${AUTH_BASE_PATH}/*splat`, (req: express.Request, res: express.Response) =>
    auth.handle(req, res, req.ip ?? ''),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(`/${API_GLOBAL_PREFIX}`, originCheck(env.PUBLIC_URL));
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.enableShutdownHooks();

  return { app, prisma: app.get(PrismaService).client, logger, realtime: app.get(RealtimeService) };
}
