import type { Server } from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { type BuiltApp, buildApp } from '../src/app';
import { PUBLIC_URL, testEnv } from './env';

export type Agent = ReturnType<typeof request.agent> & {
  userId: string;
  email: string;
  name: string;
  cookie: string;
};

export interface TestContext {
  built: BuiltApp;
  server: Server;
  baseUrl: string;
  signUp(name: string, email?: string): Promise<Agent>;
  anonymous(): ReturnType<typeof request.agent>;
}

let counter = 0;
export function useTestApp(envOverrides: Record<string, string> = {}): TestContext {
  const ctx = {} as TestContext;

  beforeAll(async () => {
    ctx.built = await buildApp(testEnv(envOverrides));
    await ctx.built.app.listen(0, '127.0.0.1');
    ctx.server = ctx.built.app.getHttpServer() as Server;
    const address = ctx.server.address();
    ctx.baseUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
    ctx.anonymous = () => request.agent(ctx.server).set('Origin', PUBLIC_URL);
    ctx.signUp = async (name, email) => {
      const agent = ctx.anonymous() as Agent;
      const address = email ?? `${name.toLowerCase()}-${++counter}@example.org`;
      const res = await agent
        .post('/api/v1/auth/sign-up/email')
        .send({ name, email: address, password: 'un-mot-de-passe-solide' })
        .expect(200);
      agent.userId = res.body.user.id;
      agent.cookie = ([] as string[])
        .concat(res.headers['set-cookie'] ?? [])
        .map((c) => c.split(';')[0])
        .join('; ');
      agent.email = address;
      agent.name = name;
      return agent;
    };
  });

  beforeEach(async () => {
    await ctx.built.prisma.$executeRawUnsafe(
      'TRUNCATE TABLE audit_logs, invitations, workspace_members, workspaces, verifications, sessions, accounts, users CASCADE',
    );
  });

  afterAll(async () => {
    await ctx.built.app.close();
  });

  return ctx;
}
export async function workspaceWith(
  owner: Agent,
  members: { agent: Agent; role: 'admin' | 'member' | 'guest' }[] = [],
  name = 'Acme',
): Promise<string> {
  const ws = await owner.post('/api/v1/workspaces').send({ name }).expect(201);
  for (const { agent, role } of members) {
    const inv = await owner
      .post(`/api/v1/workspaces/${ws.body.id}/invitations`)
      .send({ email: agent.email, role })
      .expect(201);
    const token = new URL(inv.body.inviteUrl).pathname.split('/').pop();
    await agent.post(`/api/v1/invitations/${token}/accept`).send({}).expect(200);
  }
  return ws.body.id as string;
}

export interface EventStream {
  next(type: string, timeoutMs?: number): Promise<Record<string, unknown>>;
  none(type: string, ms?: number): Promise<boolean>;
  closed: Promise<void>;
  close(): void;
  status: number;
}
export async function openEvents(
  ctx: TestContext,
  agent: Agent,
  workspaceId: string,
): Promise<EventStream> {
  const controller = new AbortController();
  const res = await fetch(`${ctx.baseUrl}/api/v1/workspaces/${workspaceId}/events`, {
    headers: { cookie: agent.cookie, accept: 'text/event-stream' },
    signal: controller.signal,
  });
  const received: { type: string; data: Record<string, unknown> }[] = [];
  const waiters = new Set<() => void>();
  let resolveClosed!: () => void;
  const closed = new Promise<void>((r) => (resolveClosed = r));

  void (async () => {
    if (!res.body) return resolveClosed();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
        buffer += decoder.decode(chunk, { stream: true });
        let index: number;
        while ((index = buffer.indexOf('\n\n')) >= 0) {
          const block = buffer.slice(0, index);
          buffer = buffer.slice(index + 2);
          const type = /^event: (.*)$/m.exec(block)?.[1] ?? 'message';
          const data = /^data: (.*)$/m.exec(block)?.[1];
          received.push({ type, data: data ? JSON.parse(data) : {} });
          for (const w of waiters) w();
        }
      }
    } catch {
      received.push({ type: 'closed', data: {} });
    }
    resolveClosed();
    for (const w of waiters) w();
  })();

  const take = (type: string) => {
    const i = received.findIndex((e) => e.type === type);
    return i >= 0 ? received.splice(i, 1)[0]!.data : undefined;
  };

  return {
    status: res.status,
    closed,
    close: () => controller.abort(),
    next(type, timeoutMs = 3000) {
      return new Promise((resolve, reject) => {
        const check = () => {
          const found = take(type);
          if (found) {
            waiters.delete(check);
            clearTimeout(timer);
            resolve(found);
          }
        };
        const timer = setTimeout(() => {
          waiters.delete(check);
          reject(new Error(`Événement « ${type} » non reçu`));
        }, timeoutMs);
        waiters.add(check);
        check();
      });
    },
    async none(type, ms = 400) {
      await new Promise((r) => setTimeout(r, ms));
      return !received.some((e) => e.type === type);
    },
  };
}
