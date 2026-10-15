import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createOpenTaskClient } from '../src/client/opentask-client';
import { silentLogger } from '../src/config/logger';
import { createOpenTaskServer } from '../src/server';
import { API_URL, PUBLIC_URL } from './env';

let counter = 0;

export interface TestUser {
  id: string;
  name: string;
  email: string;
  cookie: string;
}

export async function api<T = unknown>(
  user: TestUser | null,
  method: string,
  path: string,
  body?: unknown,
) {
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers: {
      origin: PUBLIC_URL,
      ...(user ? { cookie: user.cookie } : {}),
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(`${method} ${path} → ${response.status} ${await response.text()}`);
  return (response.status === 204 ? undefined : await response.json()) as T;
}

export async function signUp(name: string): Promise<TestUser> {
  const email = `${name.toLowerCase()}-${Date.now()}-${++counter}@example.org`;
  const response = await fetch(`${API_URL}/api/v1/auth/sign-up/email`, {
    method: 'POST',
    headers: { origin: PUBLIC_URL, 'content-type': 'application/json' },
    body: JSON.stringify({ name, email, password: 'un-mot-de-passe-solide' }),
  });
  if (!response.ok) throw new Error(`inscription impossible : ${response.status}`);
  const cookie = response.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  const body = (await response.json()) as { user: { id: string } };
  return { id: body.user.id, name, email, cookie };
}

export async function createToken(
  user: TestUser,
  scopes: ('read' | 'write')[] = ['read', 'write'],
) {
  return api<{ id: string; token: string }>(user, 'POST', '/me/api-tokens', {
    name: 'MCP',
    scopes,
  });
}

export async function invite(
  owner: TestUser,
  workspaceId: string,
  member: TestUser,
  role = 'member',
) {
  const invitation = await api<{ inviteUrl: string }>(
    owner,
    'POST',
    `/workspaces/${workspaceId}/invitations`,
    {
      email: member.email,
      role,
    },
  );
  const token = new URL(invitation.inviteUrl).pathname.split('/').pop();
  await api(member, 'POST', `/invitations/${token}/accept`, {});
}

export interface Fixture {
  alice: TestUser;
  workspaceId: string;
  projectId: string;
  columns: { id: string; name: string; category: string }[];
}

export async function workspaceWithProject(): Promise<Fixture> {
  const alice = await signUp('Alice');
  const workspace = await api<{ id: string }>(alice, 'POST', '/workspaces', { name: 'Acme' });
  const project = await api<{ id: string; columns: Fixture['columns'] }>(
    alice,
    'POST',
    `/workspaces/${workspace.id}/projects`,
    { name: 'Site web' },
  );
  return { alice, workspaceId: workspace.id, projectId: project.id, columns: project.columns };
}

export async function connect(token: string, allowWrites = true) {
  const server = createOpenTaskServer({
    client: createOpenTaskClient(API_URL, token),
    allowWrites,
    logger: silentLogger,
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: 'opentask-test', version: '1.0.0' });
  await client.connect(clientTransport);
  return client;
}

export type CallResult = {
  isError?: boolean;
  content: { type: string; text: string }[];
  structuredContent?: Record<string, unknown>;
};

export const call = async (client: Client, name: string, args: Record<string, unknown> = {}) =>
  (await client.callTool({ name, arguments: args })) as CallResult;

export const text = (result: CallResult) => result.content.map((c) => c.text).join('\n');
