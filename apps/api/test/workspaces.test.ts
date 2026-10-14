import { describe, expect, it } from 'vitest';
import { useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();

describe('workspaces', () => {
  it('crée, liste, renomme et supprime un workspace', async () => {
    const alice = await ctx.signUp('Alice');
    const created = await alice.post('/api/v1/workspaces').send({ name: '  Acme  ' }).expect(201);
    expect(created.body).toMatchObject({ name: 'Acme', myRole: 'owner', memberCount: 1 });
    const id = created.body.id;

    const list = await alice.get('/api/v1/workspaces').expect(200);
    expect(list.body.items.map((w: { id: string }) => w.id)).toEqual([id]);

    const renamed = await alice
      .patch(`/api/v1/workspaces/${id}`)
      .send({ name: 'Acme SAS' })
      .expect(200);
    expect(renamed.body.name).toBe('Acme SAS');

    await alice.delete(`/api/v1/workspaces/${id}`).send({ confirmName: 'Acme' }).expect(400);
    await alice.delete(`/api/v1/workspaces/${id}`).send({ confirmName: 'Acme SAS' }).expect(204);
    await alice.get(`/api/v1/workspaces/${id}`).expect(404);
  });

  it('valide les entrées et renvoie le détail des erreurs', async () => {
    const alice = await ctx.signUp('Alice');
    const res = await alice.post('/api/v1/workspaces').send({ name: '' }).expect(400);
    expect(res.body.error).toMatchObject({
      code: 'VALIDATION_FAILED',
      details: [{ path: 'name', message: expect.any(String) }],
    });
    await alice
      .post('/api/v1/workspaces')
      .set('content-type', 'application/json')
      .send('{"name": ')
      .expect(400);
  });

  it('applique les rôles côté serveur', async () => {
    const [alice, bob, carol] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
    ]);
    const id = await workspaceWith(alice, [
      { agent: bob, role: 'admin' },
      { agent: carol, role: 'member' },
    ]);

    await carol.patch(`/api/v1/workspaces/${id}`).send({ name: 'X' }).expect(403);
    await bob.patch(`/api/v1/workspaces/${id}`).send({ name: 'Acme 2' }).expect(200);
    await bob.delete(`/api/v1/workspaces/${id}`).send({ confirmName: 'Acme 2' }).expect(403);
    await carol.get(`/api/v1/workspaces/${id}/audit-logs`).expect(403);
    await carol.get(`/api/v1/workspaces/${id}/invitations`).expect(403);
  });

  it('transfère la propriété', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const id = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);

    await bob
      .post(`/api/v1/workspaces/${id}/transfer-ownership`)
      .send({ userId: alice.userId })
      .expect(403);
    const res = await alice
      .post(`/api/v1/workspaces/${id}/transfer-ownership`)
      .send({ userId: bob.userId })
      .expect(200);
    expect(res.body.myRole).toBe('admin');
    expect((await bob.get(`/api/v1/workspaces/${id}`).expect(200)).body.myRole).toBe('owner');
  });

  it('pagine le journal d’audit', async () => {
    const alice = await ctx.signUp('Alice');
    const id = await workspaceWith(alice);
    for (let i = 0; i < 4; i++) {
      await alice
        .patch(`/api/v1/workspaces/${id}`)
        .send({ name: `Acme ${i}` })
        .expect(200);
    }
    const first = await alice.get(`/api/v1/workspaces/${id}/audit-logs?limit=3`).expect(200);
    expect(first.body.items).toHaveLength(3);
    expect(first.body.items[0]).toMatchObject({
      action: 'workspace.updated',
      actor: { id: alice.userId, name: 'Alice' },
      metadata: { name: { from: 'Acme 2', to: 'Acme 3' } },
    });
    const second = await alice
      .get(`/api/v1/workspaces/${id}/audit-logs?limit=3&cursor=${first.body.nextCursor}`)
      .expect(200);
    expect(second.body.items.map((e: { action: string }) => e.action)).toEqual([
      'workspace.updated',
      'workspace.created',
    ]);
    expect(second.body.nextCursor).toBeNull();
  });
});
