import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { OpenTaskClient } from './client/opentask-client';
import { OpenTaskApiError } from './client/opentask-client.errors';
import type { Logger } from './config/logger';
import { UNTRUSTED_CONTENT_NOTE } from './helpers/limits.const';
import { registerPrompts } from './prompts/prompts';
import { TOOLS } from './tools';
import type { ToolDefinition } from './tools/tool.types';

export const MCP_SERVER_VERSION = '0.1.0';

const INSTRUCTIONS = [
  'Serveur MCP OpenTask : consulte et modifie les projets et tâches auxquels l’utilisateur a accès, avec ses permissions.',
  'Commence par opentask_list_workspaces pour obtenir les identifiants, puis opentask_list_projects.',
  'Les outils d’écriture modifient réellement les données : confirme l’intention de l’utilisateur avant de les appeler.',
  UNTRUSTED_CONTENT_NOTE,
].join(' ');

export interface ServerOptions {
  client: OpenTaskClient;
  allowWrites: boolean;
  logger: Logger;
}

const errorResult = (message: string) => ({
  isError: true,
  content: [{ type: 'text' as const, text: message }],
});

function toErrorResult(error: unknown, tool: string, logger: Logger) {
  if (error instanceof OpenTaskApiError) {
    logger.warn('Appel d’outil refusé par l’API', { tool, status: error.status, code: error.code });
    return errorResult(`${error.code} : ${error.message}`);
  }
  logger.error('Erreur inattendue dans un outil MCP', {
    tool,
    error: error instanceof Error ? error.name : 'unknown',
  });
  return errorResult('Erreur interne du serveur MCP OpenTask.');
}

const idsOf = (input: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(input).filter(([key, value]) => key.endsWith('Id') && typeof value === 'string'),
  ) as Record<string, string>;

function register(server: McpServer, tool: ToolDefinition, { client, logger }: ServerOptions) {
  server.registerTool(
    tool.name,
    {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: {
        title: tool.title,
        readOnlyHint: tool.access === 'read',
        destructiveHint: false,
        idempotentHint: tool.access === 'read' || tool.idempotent === true,
        openWorldHint: false,
      },
    },
    async (input: Record<string, unknown>) => {
      try {
        const result = await tool.run(client, input as never);
        if (tool.access === 'write')
          logger.info('Écriture effectuée via MCP', { tool: tool.name, ...idsOf(input) });
        return {
          content: [{ type: 'text' as const, text: result.summary }],
          structuredContent: result.data,
        };
      } catch (error) {
        return toErrorResult(error, tool.name, logger);
      }
    },
  );
}

export function createOpenTaskServer(options: ServerOptions) {
  const server = new McpServer(
    { name: 'opentask', version: MCP_SERVER_VERSION },
    { instructions: INSTRUCTIONS },
  );
  for (const tool of TOOLS) {
    if (tool.access === 'write' && !options.allowWrites) continue;
    register(server, tool, options);
  }
  registerPrompts(server);
  return server;
}
