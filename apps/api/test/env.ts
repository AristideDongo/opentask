import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config } from 'dotenv';
import type { Env } from '../src/shared/config/env';
import { loadEnv } from '../src/shared/config/env';

config({ path: ['../../.env', '.env'], quiet: true });

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://opentask:opentask@localhost:5432/opentask_test';

export const PUBLIC_URL = 'http://opentask.test';

export const testEnv = (overrides: Record<string, string> = {}): Env =>
  loadEnv({
    NODE_ENV: 'test',
    PUBLIC_URL,
    DATABASE_URL: TEST_DATABASE_URL,
    AUTH_SECRET: 'test-secret-test-secret-test-secret-test-secret',
    LOG_LEVEL: 'silent',
    RATE_LIMIT_ENABLED: 'false',
    TRUST_PROXY_HOPS: '0',
    STORAGE_DIR: join(tmpdir(), 'opentask-test-storage'),
    MAX_UPLOAD_MB: '1',
    ...overrides,
  });
