import { defineConfig, devices } from '@playwright/test';

const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? 'postgresql://opentask:opentask@localhost:5432/opentask_e2e';
const WEB_PORT = 5174;
const API_PORT = 4200;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    locale: 'fr-FR',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @opentask/api exec tsx src/main.ts',
      url: `http://localhost:${API_PORT}/api/v1/health/ready`,
      reuseExistingServer: false,
      env: {
        NODE_ENV: 'test',
        API_PORT: String(API_PORT),
        PUBLIC_URL: `http://localhost:${WEB_PORT}`,
        DATABASE_URL: E2E_DATABASE_URL,
        AUTH_SECRET: 'e2e-secret-e2e-secret-e2e-secret-e2e-secret',
        LOG_LEVEL: 'warn',
        RATE_LIMIT_ENABLED: 'false',
        TRUST_PROXY_HOPS: '1',
        SMTP_URL: '',
      },
    },
    {
      command: `pnpm exec vite --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}/login`,
      reuseExistingServer: false,
      env: { API_PROXY_TARGET: `http://localhost:${API_PORT}` },
    },
  ],
});
