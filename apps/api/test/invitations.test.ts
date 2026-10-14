import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();
const tokenOf = (inviteUrl: string) => new URL(inviteUrl).pathname.split('/').pop()!;

describe('invitations', () => {
  it('parcours complet : invitation, aperçu public, acceptation', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const id = await workspaceWith(alice);

    const created = await alice
      .post(`/api/v1/workspaces/${id}/invitations`)
      .send({ email: bob.email.toUpperCase(), role: 'guest' })
      .expect(201);
    expect(created.body).toMatchObject({ email: bob.email, role: 'guest', status: 'pending' });
    expect(created.body.inviteUrl).toMatch(/^http:\/\/opentask\.test\/invite\/[\w-]{43}$/);
    const token = tokenOf(created.body.inviteUrl);

    const row = await ctx.built.prisma.invitation.findUniqueOrThrow({
      where: { id: created.body.id },
    });
    expect(row.tokenHash).toBe(createHash('sha256').update(token).digest('hex'));
    expect(JSON.stringify(row)).not.toContain(token);

    const preview = await ctx.anonymous().get(`/api/v1/invitations/${token}`).expect(200);
    expect(preview.body).toEqual({
      workspaceName: 'Acme',
      inviterName: 'Alice',
      email: bob.email,
      role: 'guest',
      status: 'pending',
    });

    const list = await alice.get(`/api/v1/workspaces/${id}/invitations`).expect(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0]).not.toHaveProperty('inviteUrl');

    await ctx.anonymous().post(`/api/v1/invitations/${token}/accept`).send({}).expect(401);
    const accepted = await bob.post(`/api/v1/invitations/${token}/accept`).send({}).expect(200);
    expect(accepted.body).toEqual({ workspaceId: id });

    const ws = await bob.get(`/api/v1/workspaces/${id}`).expect(200);
    expect(ws.body).toMatchObject({ myRole: 'guest', memberCount: 2 });
    expect(
      (await alice.get(`/api/v1/workspaces/${id}/invitations`).expect(200)).body.items,
    ).toEqual([]);
  });

  it('refuse l’acceptation par un autre compte que le destinataire', async () => {
    const [alice, bob, mallory] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Mallory'),
    ]);
    const id = await workspaceWith(alice);
    const inv = await alice
      .post(`/api/v1/workspaces/${id}/invitations`)
      .send({ email: bob.email })
      .expect(201);
    const res = await mallory
      .post(`/api/v1/invitations/${tokenOf(inv.body.inviteUrl)}/accept`)
      .send({})
      .expect(410);
    expect(res.body.error.code).toBe('INVITATION_INVALID');
    await mallory.get(`/api/v1/workspaces/${id}`).expect(404);
  });

  it('une invitation révoquée ne peut plus être utilisée', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const id = await workspaceWith(alice);
    const inv = await alice
      .post(`/api/v1/workspaces/${id}/invitations`)
      .send({ email: bob.email })
      .expect(201);
    await alice.delete(`/api/v1/workspaces/${id}/invitations/${inv.body.id}`).expect(204);
    await alice.delete(`/api/v1/workspaces/${id}/invitations/${inv.body.id}`).expect(409);
    const token = tokenOf(inv.body.inviteUrl);
    expect(
      (await ctx.anonymous().get(`/api/v1/invitations/${token}`).expect(200)).body.status,
    ).toBe('revoked');
    await bob.post(`/api/v1/invitations/${token}/accept`).send({}).expect(410);
  });

  it('un jeton inconnu renvoie 410 sans information', async () => {
    const res = await ctx.anonymous().get('/api/v1/invitations/inconnu').expect(410);
    expect(res.body.error.code).toBe('INVITATION_INVALID');
  });

  it('deux acceptations simultanées ne créent qu’une seule adhésion', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const id = await workspaceWith(alice);
    const inv = await alice
      .post(`/api/v1/workspaces/${id}/invitations`)
      .send({ email: bob.email })
      .expect(201);
    const token = tokenOf(inv.body.inviteUrl);
    const results = await Promise.all([
      bob.post(`/api/v1/invitations/${token}/accept`).send({}),
      bob.post(`/api/v1/invitations/${token}/accept`).send({}),
    ]);
    expect(results.map((r) => r.status)).toContain(200);
    expect(await ctx.built.prisma.workspaceMember.count({ where: { workspaceId: id } })).toBe(2);
  });

  it('les droits d’invitation suivent les rôles', async () => {
    const [alice, bob, carol] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
    ]);
    const id = await workspaceWith(alice, [
      { agent: bob, role: 'admin' },
      { agent: carol, role: 'member' },
    ]);
    await carol
      .post(`/api/v1/workspaces/${id}/invitations`)
      .send({ email: 'x@example.org' })
      .expect(403);
    await bob
      .post(`/api/v1/workspaces/${id}/invitations`)
      .send({ email: 'x@example.org', role: 'admin' })
      .expect(403);
    await bob
      .post(`/api/v1/workspaces/${id}/invitations`)
      .send({ email: 'x@example.org', role: 'member' })
      .expect(201);
    await alice
      .post(`/api/v1/workspaces/${id}/invitations`)
      .send({ email: 'y@example.org', role: 'owner' })
      .expect(400);
    await alice
      .post(`/api/v1/workspaces/${id}/invitations`)
      .send({ email: carol.email })
      .expect(409);
  });
});
