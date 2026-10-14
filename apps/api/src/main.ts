import { buildApp } from './app';
import { loadEnv } from './shared/config/env';

async function main() {
  const env = loadEnv();
  const { app, logger } = await buildApp(env);
  await app.listen(env.API_PORT, '0.0.0.0');
  logger.info({ port: env.API_PORT, publicUrl: env.PUBLIC_URL }, 'API OpenTask démarrée');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
