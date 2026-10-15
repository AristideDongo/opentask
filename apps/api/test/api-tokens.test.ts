import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { type Agent, useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();

async function createToken(agent: Agent, scopes: ('read' | 'write')[] = ['read', 'write']) {
  const res = await agent
    .post('/api/v1/me/api-tokens')
    .send({ name: 'Claude', scopes })
    .expect(201);
  return res.body as { id: string; token: string; hint: string };
}

const withToken = (token: string) => {
  const client = request(ctx.server);
  return {
    get: (path: string) => client.get(path).set('Authorization', `Bearer ${token}`),
    post: (path: string, body: object) =>
      client.post(path).set('Authorization', `Bearer ${token}`).send(body),
    delete: (path: string) => client.delete(path).set('Authorization', `Bearer ${token}`),
  };
};

describe('jetons d’API', () => {
  it('crée un jeton affiché une seule fois, puis le liste sans le secret', async () => {
    const alice = await ctx.signUp('Alice');
    const created = await createToken(alice);
    expect(created.token).toMatch(/^otk_[A-Za-z0-9_-]{43}$/);
    expect(created.hint).toBe(`${created.token.slice(0, 12)}…`);

    const list = await alice.get('/api/v1/me/api-tokens').expect(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0]).not.toHaveProperty('token');
    expect(JSON.stringify(list.body)).not.toContain(created.token);
  });

  it('authentifie les requêtes de lecture et met à jour la dernière utilisation', async () => {
    const alice = await ctx.signUp('Alice');
    const id = await workspaceWith(alice);
    const { token } = await createToken(alice, ['read']);

    const me = await withToken(token).get('/api/v1/me').expect(200);
    expect(me.body.id).toBe(alice.userId);
    await withToken(token).get(`/api/v1/workspaces/${id}`).expect(200);

    const list = await alice.get('/api/v1/me/api-tokens').expect(200);
    expect(list.body.items[0].lastUsedAt).not.toBeNull();
  });

  it('exige la permission write pour toute modification', async () => {
    const alice = await ctx.signUp('Alice');
    const reader = await createToken(alice, ['read']);
    const res = await withToken(reader.token).post('/api/v1/workspaces', { name: 'X' }).expect(403);
    expect(res.body.error.code).toBe('FORBIDDEN');

    const writer = await createToken(alice, ['read', 'write']);
    await withToken(writer.token).post('/api/v1/workspaces', { name: 'X' }).expect(201);
  });

  it('ne permet pas de gérer les jetons avec un jeton', async () => {
    const alice = await ctx.signUp('Alice');
    const { id, token } = await createToken(alice);
    await withToken(token).get('/api/v1/me/api-tokens').expect(403);
    await withToken(token)
      .post('/api/v1/me/api-tokens', { name: 'x', scopes: ['read'] })
      .expect(403);
    await withToken(token).delete(`/api/v1/me/api-tokens/${id}`).expect(403);
  });

  it('refuse un jeton inconnu, révoqué ou expiré', async () => {
    const alice = await ctx.signUp('Alice');
    await withToken('otk_inconnu').get('/api/v1/me').expect(401);

    const revoked = await createToken(alice);
    await alice.delete(`/api/v1/me/api-tokens/${revoked.id}`).expect(204);
    await withToken(revoked.token).get('/api/v1/me').expect(401);

    const expired = await createToken(alice);
    await ctx.built.prisma.apiToken.update({
      where: { id: expired.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const res = await withToken(expired.token).get('/api/v1/me').expect(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('applique les mêmes permissions et la même isolation que la session', async () => {
    const [alice, mallory] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Mallory')]);
    const id = await workspaceWith(alice);
    const { token } = await createToken(mallory);
    const res = await withToken(token).get(`/api/v1/workspaces/${id}`).expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    await withToken(token).get(`/api/v1/workspaces/${id}/projects`).expect(404);
  });

  it('ne laisse pas révoquer le jeton d’un autre utilisateur', async () => {
    const [alice, mallory] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Mallory')]);
    const { id, token } = await createToken(alice);
    await mallory.delete(`/api/v1/me/api-tokens/${id}`).expect(404);
    await withToken(token).get('/api/v1/me').expect(200);
  });

  it('perd l’accès au workspace quand le membre en est retiré', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const id = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    const { token } = await createToken(bob);
    await withToken(token).get(`/api/v1/workspaces/${id}`).expect(200);
    await alice.delete(`/api/v1/workspaces/${id}/members/${bob.userId}`).expect(204);
    await withToken(token).get(`/api/v1/workspaces/${id}`).expect(404);
  });

  it('limite le nombre de jetons et valide les entrées', async () => {
    const alice = await ctx.signUp('Alice');
    await alice
      .post('/api/v1/me/api-tokens')
      .send({ name: '', scopes: ['read'] })
      .expect(400);
    await alice
      .post('/api/v1/me/api-tokens')
      .send({ name: 'x', scopes: ['admin'] })
      .expect(400);
    for (let i = 0; i < 20; i++) await createToken(alice, ['read']);
    const res = await alice
      .post('/api/v1/me/api-tokens')
      .send({ name: 'trop', scopes: ['read'] })
      .expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});
