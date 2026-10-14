import { describe, expect, it } from 'vitest';
import { useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();

describe('membres', () => {
  it('liste les membres avec leur rôle', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const id = await workspaceWith(alice, [{ agent: bob, role: 'guest' }]);
    const res = await bob.get(`/api/v1/workspaces/${id}/members`).expect(200);
    expect(res.body.items.map((m: { name: string; role: string }) => [m.name, m.role])).toEqual([
      ['Alice', 'owner'],
      ['Bob', 'guest'],
    ]);
  });

  it('changements de rôle autorisés et interdits', async () => {
    const [alice, bob, carol, dave] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
      ctx.signUp('Dave'),
    ]);
    const id = await workspaceWith(alice, [
      { agent: bob, role: 'admin' },
      { agent: carol, role: 'member' },
      { agent: dave, role: 'admin' },
    ]);
    const url = (userId: string) => `/api/v1/workspaces/${id}/members/${userId}`;

    expect((await bob.patch(url(carol.userId)).send({ role: 'guest' }).expect(200)).body.role).toBe(
      'guest',
    );
    await bob.patch(url(carol.userId)).send({ role: 'admin' }).expect(403);
    await bob.patch(url(dave.userId)).send({ role: 'member' }).expect(403);
    await bob.patch(url(alice.userId)).send({ role: 'member' }).expect(403);
    await carol.patch(url(bob.userId)).send({ role: 'guest' }).expect(403);
    await alice.patch(url(bob.userId)).send({ role: 'owner' }).expect(400);
    await alice.patch(url(dave.userId)).send({ role: 'member' }).expect(200);
    await alice.patch(url('inconnu')).send({ role: 'member' }).expect(404);
  });

  it('retrait et départ volontaire', async () => {
    const [alice, bob, carol] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
    ]);
    const id = await workspaceWith(alice, [
      { agent: bob, role: 'member' },
      { agent: carol, role: 'member' },
    ]);
    await bob.delete(`/api/v1/workspaces/${id}/members/${carol.userId}`).expect(403);
    await bob.delete(`/api/v1/workspaces/${id}/members/${bob.userId}`).expect(204);
    await alice.delete(`/api/v1/workspaces/${id}/members/${alice.userId}`).expect(403);

    const audit = await alice.get(`/api/v1/workspaces/${id}/audit-logs`).expect(200);
    expect(audit.body.items[0]).toMatchObject({ action: 'member.left', targetId: bob.userId });
  });
});
