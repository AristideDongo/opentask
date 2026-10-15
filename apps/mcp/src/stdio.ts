import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createOpenTaskClient } from './client/opentask-client';
import { loadStdioEnv } from './config/env';
import { stderrLogger } from './config/logger';
import { createOpenTaskServer } from './server';

try {
  const env = loadStdioEnv();
  const server = createOpenTaskServer({
    client: createOpenTaskClient(env.OPENTASK_URL, env.OPENTASK_TOKEN),
    allowWrites: env.MCP_ALLOW_WRITE,
    logger: stderrLogger,
  });
  await server.connect(new StdioServerTransport());
  stderrLogger.info('Serveur MCP OpenTask démarré (stdio)', {
    url: env.OPENTASK_URL,
    writes: env.MCP_ALLOW_WRITE,
  });
} catch (error) {
  stderrLogger.error(error instanceof Error ? error.message : 'Démarrage impossible');
  process.exit(1);
}
