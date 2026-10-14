import { describe, expect, it } from 'vitest';
import { openEvents, useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();

describe('canaux et messages', () => {
  it('chaque workspace a un canal Général ; messages paginés, édités, supprimés', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const ws = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    const channels = await bob.get(`/api/v1/workspaces/${ws}/channels`).expect(200);
    expect(channels.body.items).toMatchObject([
      { name: 'Général', isPrivate: false, unreadCount: 0 },
    ]);
    const c = channels.body.items[0].id;

    for (let i = 1; i <= 3; i++) {
      await alice
        .post(`/api/v1/workspaces/${ws}/channels/${c}/messages`)
        .send({ body: `Message ${i}` })
        .expect(201);
    }
    const unread = await bob.get(`/api/v1/workspaces/${ws}/channels`).expect(200);
    expect(unread.body.items[0].unreadCount).toBe(3);
    await bob.post(`/api/v1/workspaces/${ws}/channels/${c}/read`).expect(204);
    expect((await bob.get(`/api/v1/workspaces/${ws}/channels`)).body.items[0].unreadCount).toBe(0);

    const page1 = await bob
      .get(`/api/v1/workspaces/${ws}/channels/${c}/messages?limit=2`)
      .expect(200);
    expect(page1.body.items.map((m: { body: string }) => m.body)).toEqual([
      'Message 3',
      'Message 2',
    ]);
    const page2 = await bob
      .get(
        `/api/v1/workspaces/${ws}/channels/${c}/messages?limit=2&cursor=${page1.body.nextCursor}`,
      )
      .expect(200);
    expect(page2.body.items.map((m: { body: string }) => m.body)).toEqual(['Message 1']);

    const id = page1.body.items[0].id;
    await bob
      .patch(`/api/v1/workspaces/${ws}/channels/${c}/messages/${id}`)
      .send({ body: 'pirate' })
      .expect(403);
    await bob.delete(`/api/v1/workspaces/${ws}/channels/${c}/messages/${id}`).expect(403);
    const edited = await alice
      .patch(`/api/v1/workspaces/${ws}/channels/${c}/messages/${id}`)
      .send({ body: 'Message 3 (corrigé)' })
      .expect(200);
    expect(edited.body.editedAt).not.toBeNull();
    const deleted = await alice
      .delete(`/api/v1/workspaces/${ws}/channels/${c}/messages/${id}`)
      .expect(200);
    expect(deleted.body).toMatchObject({ body: '', deletedAt: expect.any(String) });
    await bob
      .post(`/api/v1/workspaces/${ws}/channels/${c}/messages`)
      .send({ body: '   ' })
      .expect(400);
  });

  it('un canal privé est invisible pour les non-membres, administrateurs compris', async () => {
    const [alice, bob, carol] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
    ]);
    const ws = await workspaceWith(alice, [
      { agent: bob, role: 'member' },
      { agent: carol, role: 'admin' },
    ]);
    const secret = await bob
      .post(`/api/v1/workspaces/${ws}/channels`)
      .send({ name: 'RH', isPrivate: true, memberIds: [alice.userId] })
      .expect(201);
    const c = secret.body.id;

    const names = async (agent: typeof alice) =>
      (await agent.get(`/api/v1/workspaces/${ws}/channels`)).body.items.map(
        (x: { name: string }) => x.name,
      );
    expect(await names(alice)).toContain('RH');
    expect(await names(carol)).not.toContain('RH');
    await carol.get(`/api/v1/workspaces/${ws}/channels/${c}`).expect(404);
    await carol.get(`/api/v1/workspaces/${ws}/channels/${c}/messages`).expect(404);
    await carol
      .post(`/api/v1/workspaces/${ws}/channels/${c}/messages`)
      .send({ body: 'hello' })
      .expect(404);
    await carol.put(`/api/v1/workspaces/${ws}/channels/${c}/members/${carol.userId}`).expect(404);

    await bob.put(`/api/v1/workspaces/${ws}/channels/${c}/members/${carol.userId}`).expect(200);
    await carol.get(`/api/v1/workspaces/${ws}/channels/${c}/messages`).expect(200);
    await carol
      .delete(`/api/v1/workspaces/${ws}/channels/${c}/members/${carol.userId}`)
      .expect(200);
    await carol.get(`/api/v1/workspaces/${ws}/channels/${c}`).expect(404);
  });

  it('les invités n’accèdent qu’aux canaux dont ils sont membres', async () => {
    const [alice, gina] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Gina')]);
    const ws = await workspaceWith(alice, [{ agent: gina, role: 'guest' }]);
    expect((await gina.get(`/api/v1/workspaces/${ws}/channels`)).body.items).toEqual([]);
    await gina.post(`/api/v1/workspaces/${ws}/channels`).send({ name: 'Moi' }).expect(403);
    const projet = await alice
      .post(`/api/v1/workspaces/${ws}/channels`)
      .send({ name: 'Client', memberIds: [gina.userId] })
      .expect(201);
    const items = (await gina.get(`/api/v1/workspaces/${ws}/channels`)).body.items;
    expect(items.map((x: { name: string }) => x.name)).toEqual(['Client']);
    await gina
      .post(`/api/v1/workspaces/${ws}/channels/${projet.body.id}/messages`)
      .send({ body: 'Bonjour' })
      .expect(201);
  });

  it('gestion du canal par son créateur ou un administrateur', async () => {
    const [alice, bob, carol] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
    ]);
    const ws = await workspaceWith(alice, [
      { agent: bob, role: 'member' },
      { agent: carol, role: 'member' },
    ]);
    const c = (
      await bob.post(`/api/v1/workspaces/${ws}/channels`).send({ name: 'Projets' }).expect(201)
    ).body;
    expect(c.canManage).toBe(true);
    await carol.patch(`/api/v1/workspaces/${ws}/channels/${c.id}`).send({ name: 'X' }).expect(403);
    await bob
      .patch(`/api/v1/workspaces/${ws}/channels/${c.id}`)
      .send({ description: 'Suivi' })
      .expect(200);
    await bob.post(`/api/v1/workspaces/${ws}/channels`).send({ name: 'Projets' }).expect(409);
    await alice.delete(`/api/v1/workspaces/${ws}/channels/${c.id}`).expect(204);
  });
});

describe('temps réel (SSE)', () => {
  it('diffuse les messages aux membres connectés', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const ws = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    const c = (await alice.get(`/api/v1/workspaces/${ws}/channels`)).body.items[0].id;

    const stream = await openEvents(ctx, bob, ws);
    expect(stream.status).toBe(200);
    await stream.next('ready');
    await alice
      .post(`/api/v1/workspaces/${ws}/channels/${c}/messages`)
      .send({ body: 'Salut Bob' })
      .expect(201);
    const event = await stream.next('message.created');
    expect(event).toMatchObject({
      type: 'message.created',
      message: { channelId: c, body: 'Salut Bob', author: { name: 'Alice' } },
    });

    const p = (await alice.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P' })).body.id;
    await stream.next('project.changed');
    await alice
      .post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`)
      .send({ title: 'T' })
      .expect(201);
    expect(await stream.next('task.changed')).toMatchObject({ projectId: p });
    stream.close();
  });

  it('ne diffuse pas les messages d’un canal privé aux non-membres', async () => {
    const [alice, bob, carol] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
    ]);
    const ws = await workspaceWith(alice, [
      { agent: bob, role: 'member' },
      { agent: carol, role: 'admin' },
    ]);
    const c = (
      await alice
        .post(`/api/v1/workspaces/${ws}/channels`)
        .send({ name: 'Privé', isPrivate: true, memberIds: [bob.userId] })
    ).body.id;
    const bobStream = await openEvents(ctx, bob, ws);
    const carolStream = await openEvents(ctx, carol, ws);
    await Promise.all([bobStream.next('ready'), carolStream.next('ready')]);

    await alice
      .post(`/api/v1/workspaces/${ws}/channels/${c}/messages`)
      .send({ body: 'confidentiel' })
      .expect(201);
    expect(await bobStream.next('message.created')).toMatchObject({
      message: { body: 'confidentiel' },
    });
    expect(await carolStream.none('message.created')).toBe(true);
    bobStream.close();
    carolStream.close();
  });

  it('refuse le flux à un non-membre et le coupe quand un membre est retiré', async () => {
    const [alice, bob, mallory] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Mallory'),
    ]);
    const ws = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    const denied = await openEvents(ctx, mallory, ws);
    expect(denied.status).toBe(404);

    const stream = await openEvents(ctx, bob, ws);
    await stream.next('ready');
    expect(ctx.built.realtime.connectionCount(ws)).toBe(1);
    await alice.delete(`/api/v1/workspaces/${ws}/members/${bob.userId}`).expect(204);
    await stream.closed;
    expect(ctx.built.realtime.connectionCount(ws)).toBe(0);
  });

  it('applique le nouveau rôle d’une connexion ouverte', async () => {
    const [alice, gina] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Gina')]);
    const ws = await workspaceWith(alice, [{ agent: gina, role: 'guest' }]);
    const c = (await alice.get(`/api/v1/workspaces/${ws}/channels`)).body.items[0].id;
    const stream = await openEvents(ctx, gina, ws);
    await stream.next('ready');

    await alice
      .post(`/api/v1/workspaces/${ws}/channels/${c}/messages`)
      .send({ body: 'avant' })
      .expect(201);
    expect(await stream.none('message.created')).toBe(true);
    await alice
      .patch(`/api/v1/workspaces/${ws}/members/${gina.userId}`)
      .send({ role: 'member' })
      .expect(200);
    await alice
      .post(`/api/v1/workspaces/${ws}/channels/${c}/messages`)
      .send({ body: 'après' })
      .expect(201);
    expect(await stream.next('message.created')).toMatchObject({ message: { body: 'après' } });
    stream.close();
  });
});
