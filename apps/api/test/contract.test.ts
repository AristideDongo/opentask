import { type RouteContract, routes } from '@opentask/contracts/api/routes';
import { describe, expect, it } from 'vitest';
import { PUBLIC_URL } from './env';
import { useTestApp } from './helpers';

const ctx = useTestApp();

const concretePath = (path: string) => `/api/v1${path.replace(/:[A-Za-z]+/g, 'x')}`;

describe('contrats', () => {
  it.each((routes as readonly RouteContract[]).filter((r) => r.auth === 'session' && !r.external))(
    '$method $path existe et exige une session',
    async (route) => {
      const res = await ctx.anonymous()[route.method](concretePath(route.path)).send({});
      expect(res.status).toBe(401);
    },
  );

  it.each((routes as readonly RouteContract[]).filter((r) => r.auth === 'public'))(
    '$method $path est accessible sans session',
    async (route) => {
      const res = await ctx.anonymous()[route.method](concretePath(route.path)).send({});
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(404);
    },
  );

  it('publie le document OpenAPI', async () => {
    const res = await ctx.anonymous().get('/api/v1/openapi.json').expect(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(Object.keys(res.body.paths)).toContain('/api/v1/workspaces/{workspaceId}');
  });

  it('les health checks répondent', async () => {
    await ctx.anonymous().get('/api/v1/health').expect(200, { status: 'ok' });
    await ctx
      .anonymous()
      .get('/api/v1/health/ready')
      .expect(200, { status: 'ok', checks: { database: 'ok' } });
  });

  it('renvoie 404 au format stable pour une route inconnue', async () => {
    const res = await ctx.anonymous().get('/api/v1/nope').expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('sécurité HTTP', () => {
  it('refuse les requêtes modifiantes d’une autre origine (CSRF)', async () => {
    const alice = await ctx.signUp('Alice');
    const res = await alice
      .post('/api/v1/workspaces')
      .set('Origin', 'https://evil.example')
      .send({ name: 'X' })
      .expect(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    await alice
      .post('/api/v1/workspaces')
      .set('Origin', PUBLIC_URL)
      .send({ name: 'X' })
      .expect(201);
    await alice
      .post('/api/v1/workspaces')
      .set('Sec-Fetch-Site', 'cross-site')
      .send({ name: 'X' })
      .expect(403);
  });

  it('pose des en-têtes de sécurité et un cookie HttpOnly', async () => {
    const res = await ctx
      .anonymous()
      .post('/api/v1/auth/sign-up/email')
      .send({ name: 'Alice', email: 'alice@example.org', password: 'un-mot-de-passe-solide' })
      .expect(200);
    const cookie = ([] as string[]).concat(res.headers['set-cookie'] ?? []).join(';');
    expect(cookie).toMatch(/opentask\.session_token=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    const health = await ctx.anonymous().get('/api/v1/health');
    expect(health.headers['x-content-type-options']).toBe('nosniff');
    expect(health.headers['x-powered-by']).toBeUndefined();
  });
});

describe('limitation de débit', () => {
  const limited = useTestApp({ RATE_LIMIT_ENABLED: 'true' });

  it('limite les tentatives de connexion par adresse IP', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) {
      const res = await limited
        .anonymous()
        .post('/api/v1/auth/sign-in/email')
        .send({ email: 'nobody@example.org', password: 'mauvais-mot-de-passe' });
      statuses.push(res.status);
    }
    expect(statuses).toContain(429);
  });
});
