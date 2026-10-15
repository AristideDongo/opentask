import { type ChildProcess, execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { API_PORT, API_URL, MCP_TEST_DATABASE_URL, PUBLIC_URL } from './env';

const root = (path: string) => fileURLToPath(new URL(`../../../${path}`, import.meta.url));

let api: ChildProcess | undefined;

async function ensureDatabase() {
  const url = new URL(MCP_TEST_DATABASE_URL);
  const name = url.pathname.slice(1);
  url.pathname = '/postgres';
  const admin = new Client({ connectionString: url.toString() });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
  if (exists.rowCount === 0) await admin.query(`CREATE DATABASE "${name.replace(/"/g, '')}"`);
  await admin.end();
}

async function waitForApi() {
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      if ((await fetch(`${API_URL}/api/v1/health/ready`)).ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error('L’API de test n’a pas démarré.');
}

export async function setup() {
  await ensureDatabase();
  execFileSync('node_modules/.bin/prisma', ['migrate', 'deploy'], {
    cwd: root('packages/database'),
    env: { ...process.env, DATABASE_URL: MCP_TEST_DATABASE_URL },
    stdio: 'pipe',
  });
  api = spawn('node_modules/.bin/tsx', ['src/main.ts'], {
    cwd: root('apps/api'),
    env: {
      ...process.env,
      NODE_ENV: 'test',
      API_PORT: String(API_PORT),
      PUBLIC_URL,
      DATABASE_URL: MCP_TEST_DATABASE_URL,
      AUTH_SECRET: 'mcp-secret-mcp-secret-mcp-secret-mcp-secret',
      LOG_LEVEL: 'silent',
      RATE_LIMIT_ENABLED: 'false',
      TRUST_PROXY_HOPS: '0',
      SMTP_URL: '',
    },
    stdio: 'ignore',
  });
  await waitForApi();
}

export function teardown() {
  api?.kill();
}
