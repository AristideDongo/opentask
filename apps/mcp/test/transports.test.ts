import { spawn } from 'node:child_process';
import type { Server } from 'node:http';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadHttpEnv } from '../src/config/env';
import { silentLogger } from '../src/config/logger';
import { createHttpApp } from '../src/transports/http-app';
import { API_URL } from './env';
import { api, createToken, workspaceWithProject } from './fixtures';

const appDir = fileURLToPath(new URL('..', import.meta.url));

describe('transport HTTP (Streamable HTTP, sans session)', () => {
  let server: Server;
  let url: string;

  beforeAll(async () => {
    const env = loadHttpEnv({
      OPENTASK_API_URL: API_URL,
      MCP_ALLOWED_ORIGINS: 'https://client.example',
      MCP_RATE_LIMIT_PER_MINUTE: '1000',
      TRUST_PROXY_HOPS: '0',
    });
    server = createHttpApp(env, silentLogger).listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const address = server.address();
    url = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}/mcp`;
  });

  afterAll(() => {
    server.close();
  });

  const rpc = (
    headers: Record<string, string>,
    body: unknown = { jsonrpc: '2.0', id: 1, method: 'tools/list' },
  ) =>
    fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        ...headers,
      },
      body: JSON.stringify(body),
    });

  it('exige un jeton valide', async () => {
    const missing = await rpc({});
    expect(missing.status).toBe(401);
    expect(missing.headers.get('www-authenticate')).toContain('Bearer');
    expect((await rpc({ authorization: 'Bearer otk_faux' })).status).toBe(401);
    expect((await rpc({ authorization: 'Bearer pas-un-jeton' })).status).toBe(401);
  });

  it('refuse les origines non autorisées et les méthodes de session', async () => {
    const { alice } = await workspaceWithProject();
    const { token } = await createToken(alice);
    const evil = await rpc({ authorization: `Bearer ${token}`, origin: 'https://evil.example' });
    expect(evil.status).toBe(403);
    const allowed = await rpc({
      authorization: `Bearer ${token}`,
      origin: 'https://client.example',
    });
    expect(allowed.status).not.toBe(403);
    const get = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
    expect(get.status).toBe(405);
  });

  it('fonctionne avec le client officiel et respecte la révocation', async () => {
    const { alice, workspaceId } = await workspaceWithProject();
    const { id, token } = await createToken(alice, ['read']);
    const client = new Client({ name: 'opentask-test', version: '1.0.0' });
    await client.connect(
      new StreamableHTTPClientTransport(new URL(url), {
        requestInit: { headers: { authorization: `Bearer ${token}` } },
      }),
    );
    const { tools } = await client.listTools();
    expect(tools.length).toBeGreaterThanOrEqual(9);
    const result = await client.callTool({
      name: 'opentask_list_projects',
      arguments: { workspaceId },
    });
    expect(result.isError).toBeFalsy();
    await client.close();

    await api(alice, 'DELETE', `/me/api-tokens/${id}`);
    expect((await rpc({ authorization: `Bearer ${token}` })).status).toBe(401);
  });

  it('limite la taille des requêtes', async () => {
    const { alice } = await workspaceWithProject();
    const { token } = await createToken(alice);
    const huge = await rpc(
      { authorization: `Bearer ${token}` },
      { jsonrpc: '2.0', id: 1, method: 'x', params: { pad: 'x'.repeat(300_000) } },
    );
    expect(huge.status).toBe(413);
  });
});

describe('transport stdio', () => {
  it('ne publie que le protocole sur stdout et fonctionne avec le client officiel', async () => {
    const { alice } = await workspaceWithProject();
    const { token } = await createToken(alice, ['read']);
    const transport = new StdioClientTransport({
      command: 'node_modules/.bin/tsx',
      args: ['src/stdio.ts'],
      cwd: appDir,
      env: {
        ...process.env,
        OPENTASK_URL: API_URL,
        OPENTASK_TOKEN: token,
        MCP_ALLOW_WRITE: 'false',
      } as Record<string, string>,
      stderr: 'pipe',
    });
    const client = new Client({ name: 'opentask-test', version: '1.0.0' });
    await client.connect(transport);
    const { tools } = await client.listTools();
    expect(tools.every((t) => t.annotations?.readOnlyHint)).toBe(true);
    const me = await client.callTool({ name: 'opentask_get_current_user', arguments: {} });
    expect(me.structuredContent).toMatchObject({ name: 'Alice' });
    await client.close();
  });

  it('refuse de démarrer sans configuration valide, en écrivant l’erreur sur stderr', async () => {
    const child = spawn('node_modules/.bin/tsx', ['src/stdio.ts'], {
      cwd: appDir,
      env: { ...process.env, OPENTASK_URL: 'pas-une-url', OPENTASK_TOKEN: 'secret' },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    const code = await new Promise((resolve) => child.on('exit', resolve));
    expect(code).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toContain('OPENTASK_TOKEN');
    expect(stderr).not.toContain('secret"');
  });
});
