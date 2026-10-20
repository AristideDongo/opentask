import { describe, expect, it } from 'vitest';
import { openEvents, useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();

describe('mentions', () => {
  it('mentionne un membre dans un message et le prévient en temps réel', async () => {
    const [alice, bob, mallory] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Mallory'),
    ]);
    const ws = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    const channels = await alice.get(`/api/v1/workspaces/${ws}/channels`).expect(200);
    const channelId = channels.body.items[0].id;
    const bobEvents = await openEvents(ctx, bob, ws);
    const aliceEvents = await openEvents(ctx, alice, ws);
    try {
      const message = await alice
        .post(`/api/v1/workspaces/${ws}/channels/${channelId}/messages`)
        .send({ body: `Bonjour <@${bob.userId}> et <@${mallory.userId}>, revue à 14 h` })
        .expect(201);
      expect(message.body.mentions).toEqual([{ id: bob.userId, name: 'Bob' }]);

      const event = await bobEvents.next('mention.created');
      expect(event).toMatchObject({
        by: { id: alice.userId, name: 'Alice' },
        target: { kind: 'message', channelId, channelName: 'Général', messageId: message.body.id },
      });
      expect(event.excerpt).toBe('Bonjour @Bob et @quelqu’un, revue à 14 h');
      expect(await aliceEvents.none('mention.created', 300)).toBe(true);

      const edited = await alice
        .patch(`/api/v1/workspaces/${ws}/channels/${channelId}/messages/${message.body.id}`)
        .send({ body: `Finalement <@${bob.userId}> seul` })
        .expect(200);
      expect(edited.body.mentions).toEqual([{ id: bob.userId, name: 'Bob' }]);
      expect(await bobEvents.none('mention.created', 300)).toBe(true);
    } finally {
      bobEvents.close();
      aliceEvents.close();
    }
  });

  it('ne mentionne pas dans un canal privé quelqu’un qui ne peut pas le lire', async () => {
    const [alice, bob, carol] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
    ]);
    const ws = await workspaceWith(alice, [
      { agent: bob, role: 'member' },
      { agent: carol, role: 'member' },
    ]);
    const channel = await alice
      .post(`/api/v1/workspaces/${ws}/channels`)
      .send({ name: 'Projet X', isPrivate: true, memberIds: [bob.userId] })
      .expect(201);
    const carolEvents = await openEvents(ctx, carol, ws);
    try {
      const message = await alice
        .post(`/api/v1/workspaces/${ws}/channels/${channel.body.id}/messages`)
        .send({ body: `<@${bob.userId}> <@${carol.userId}> point d’étape` })
        .expect(201);
      expect(message.body.mentions).toEqual([{ id: bob.userId, name: 'Bob' }]);
      expect(await carolEvents.none('mention.created', 400)).toBe(true);
    } finally {
      carolEvents.close();
    }
  });

  it('mentionne un membre dans un commentaire de tâche', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const ws = await workspaceWith(alice, [{ agent: bob, role: 'guest' }]);
    const project = await alice
      .post(`/api/v1/workspaces/${ws}/projects`)
      .send({ name: 'Site' })
      .expect(201);
    const task = await alice
      .post(`/api/v1/workspaces/${ws}/projects/${project.body.id}/tasks`)
      .send({ title: 'Relire la page d’accueil' })
      .expect(201);
    const bobEvents = await openEvents(ctx, bob, ws);
    try {
      const comment = await alice
        .post(`/api/v1/workspaces/${ws}/tasks/${task.body.id}/comments`)
        .send({ body: `<@${bob.userId}> peux-tu relire ?` })
        .expect(201);
      expect(comment.body.mentions).toEqual([{ id: bob.userId, name: 'Bob' }]);
      const event = await bobEvents.next('mention.created');
      expect(event).toMatchObject({
        target: {
          kind: 'comment',
          projectId: project.body.id,
          taskId: task.body.id,
          taskTitle: 'Relire la page d’accueil',
        },
      });
      const detail = await bob.get(`/api/v1/workspaces/${ws}/tasks/${task.body.id}`).expect(200);
      expect(detail.body.comments[0].mentions).toEqual([{ id: bob.userId, name: 'Bob' }]);
    } finally {
      bobEvents.close();
    }
  });
});
