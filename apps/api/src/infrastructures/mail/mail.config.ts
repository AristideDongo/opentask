import { createTransport } from 'nodemailer';
import type { Env } from '../../shared/config/env';

export const MAIL_RETRY_DELAYS_MS = [1_000, 5_000, 30_000];

export const createMailTransport = (env: Pick<Env, 'SMTP_URL'>) =>
  env.SMTP_URL ? createTransport(env.SMTP_URL) : null;
