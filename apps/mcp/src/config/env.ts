import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

const url = z.url().transform((u) => u.replace(/\/$/, ''));

const StdioEnvSchema = z.object({
  OPENTASK_URL: url,
  OPENTASK_TOKEN: z
    .string()
    .startsWith('otk_', { error: 'OPENTASK_TOKEN doit être un jeton d’API OpenTask (otk_…).' }),
  MCP_ALLOW_WRITE: booleanString.default(true),
});

const HttpEnvSchema = z.object({
  OPENTASK_API_URL: url.default('http://localhost:4000'),
  MCP_PORT: z.coerce.number().int().positive().default(4100),
  MCP_ALLOW_WRITE: booleanString.default(true),
  MCP_ALLOWED_ORIGINS: z
    .string()
    .default('')
    .transform((v) =>
      v
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    ),
  MCP_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(120),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),
});

export type StdioEnv = z.infer<typeof StdioEnvSchema>;
export type HttpEnv = z.infer<typeof HttpEnvSchema>;

function parse<T>(schema: z.ZodType<T>, source: NodeJS.ProcessEnv): T {
  const parsed = schema.safeParse(source);
  if (parsed.success) return parsed.data;
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Configuration du serveur MCP invalide :\n${issues}`);
}

export const loadStdioEnv = (source = process.env) => parse(StdioEnvSchema, source);
export const loadHttpEnv = (source = process.env) => parse(HttpEnvSchema, source);
