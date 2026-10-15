import { createHash } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { API_TOKEN_PREFIX } from '@opentask/contracts/tokens/api-token';
import express, { type Request, type Response } from 'express';
import { createOpenTaskClient } from '../client/opentask-client';
import { OpenTaskApiError } from '../client/opentask-client.errors';
import type { HttpEnv } from '../config/env';
import type { Logger } from '../config/logger';
import { createRateLimiter } from '../helpers/rate-limit.helper';
import { createOpenTaskServer } from '../server';

const MAX_BODY = '256kb';

const jsonRpcError = (res: Response, status: number, code: number, message: string) =>
  res.status(status).json({ jsonrpc: '2.0', error: { code, message }, id: null });

const bearerToken = (req: Request) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return token.startsWith(API_TOKEN_PREFIX) ? token : null;
};

const tokenKey = (token: string) => createHash('sha256').update(token).digest('hex');

export function createHttpApp(env: HttpEnv, logger: Logger, fetcher: typeof fetch = fetch) {
  const app = express();
  const limiter = createRateLimiter(env.MCP_RATE_LIMIT_PER_MINUTE);
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY_HOPS);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/mcp', (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && !env.MCP_ALLOWED_ORIGINS.includes(origin)) {
      jsonRpcError(res, 403, -32000, 'Origine non autorisée.');
      return;
    }
    next();
  });

  app.post('/mcp', express.json({ limit: MAX_BODY }), async (req, res) => {
    const token = bearerToken(req);
    if (!token) {
      res.setHeader('WWW-Authenticate', 'Bearer realm="opentask"');
      jsonRpcError(res, 401, -32001, 'Jeton d’API OpenTask requis (Authorization: Bearer otk_…).');
      return;
    }
    if (!limiter.allow(tokenKey(token))) {
      jsonRpcError(res, 429, -32002, 'Trop de requêtes : réessayez dans une minute.');
      return;
    }
    const client = createOpenTaskClient(env.OPENTASK_API_URL, token, fetcher);
    try {
      await client.get('/me');
    } catch (error) {
      if (error instanceof OpenTaskApiError && error.status === 401) {
        res.setHeader('WWW-Authenticate', 'Bearer realm="opentask", error="invalid_token"');
        jsonRpcError(res, 401, -32001, 'Jeton d’API invalide, révoqué ou expiré.');
        return;
      }
      logger.error('API OpenTask injoignable', {
        status: error instanceof OpenTaskApiError ? error.status : 0,
      });
      jsonRpcError(res, 502, -32003, 'L’instance OpenTask est indisponible.');
      return;
    }
    const server = createOpenTaskServer({ client, allowWrites: env.MCP_ALLOW_WRITE, logger });
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch {
      logger.error('Échec du traitement d’une requête MCP');
      if (!res.headersSent)
        jsonRpcError(res, 500, -32603, 'Erreur interne du serveur MCP OpenTask.');
    }
  });

  app.all('/mcp', (_req, res) => {
    res.setHeader('Allow', 'POST');
    jsonRpcError(
      res,
      405,
      -32000,
      'Méthode non prise en charge : ce serveur fonctionne sans session (POST uniquement).',
    );
  });

  return app;
}
