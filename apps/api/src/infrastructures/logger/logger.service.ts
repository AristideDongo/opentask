import { pino } from 'pino';
import { LOG_REDACTED_PATHS } from './logger.config';

export const LOGGER = Symbol('LOGGER');

export const createLogger = (level: string) =>
  pino({
    level,
    base: { service: 'opentask-api' },
    redact: { paths: LOG_REDACTED_PATHS, censor: '[redacted]' },
  });

export type Logger = ReturnType<typeof createLogger>;
