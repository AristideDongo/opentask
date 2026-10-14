import { execFileSync } from 'node:child_process';
import { Client } from 'pg';

const url =
  process.env.E2E_DATABASE_URL ?? 'postgresql://opentask:opentask@localhost:5432/opentask_e2e';

export default async function globalSetup() {
  execFileSync('pnpm', ['--filter', '@opentask/database', 'exec', 'prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });
  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query(
    'TRUNCATE TABLE audit_logs, invitations, workspace_members, workspaces, verifications, sessions, accounts, users CASCADE',
  );
  await client.end();
}
