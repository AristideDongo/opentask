import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  PUBLIC_URL: z.url().transform((u) => u.replace(/\/$/, '')),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32, { error: 'AUTH_SECRET doit contenir au moins 32 caractères.' }),
  REQUIRE_EMAIL_VERIFICATION: booleanString.default(false),
  SMTP_URL: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
  MAIL_FROM: z.string().default('OpenTask <no-reply@opentask.local>'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  RATE_LIMIT_ENABLED: booleanString.default(true),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),
  STORAGE_DIR: z.string().min(1).default('storage'),
  MAX_UPLOAD_MB: z.coerce.number().positive().max(512).default(10),
});

export type Env = z.infer<typeof EnvSchema>;

export const ENV = Symbol('ENV');

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Configuration invalide :\n${issues}`);
  }
  if (parsed.data.NODE_ENV === 'production' && /change-me/.test(parsed.data.AUTH_SECRET)) {
    throw new Error(
      'AUTH_SECRET utilise encore la valeur d’exemple : générez un secret avec `openssl rand -base64 48`.',
    );
  }
  return parsed.data;
}
