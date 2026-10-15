import { loadHttpEnv } from './config/env';
import { stderrLogger } from './config/logger';
import { createHttpApp } from './transports/http-app';

try {
  const env = loadHttpEnv();
  createHttpApp(env, stderrLogger).listen(env.MCP_PORT, () => {
    stderrLogger.info('Serveur MCP OpenTask démarré (HTTP)', {
      port: env.MCP_PORT,
      writes: env.MCP_ALLOW_WRITE,
    });
  });
} catch (error) {
  stderrLogger.error(error instanceof Error ? error.message : 'Démarrage impossible');
  process.exit(1);
}
