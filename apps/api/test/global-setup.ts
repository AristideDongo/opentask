import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { TEST_DATABASE_URL } from './env';

const databasePackage = fileURLToPath(new URL('../../../packages/database', import.meta.url));

export default function setup() {
  execFileSync('node_modules/.bin/prisma', ['migrate', 'deploy'], {
    cwd: databasePackage,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'pipe',
  });
}
