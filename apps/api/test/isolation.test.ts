import { describe, expect, it } from 'vitest';
import { useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();

describe('isolation des workspaces', () => {
  it('toutes les routes d’un workspace répondent 404 à un non-membre', async () => {
    const [alice, mallory] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Mallory')]);
    const id = await workspaceWith(alice);
    const inv = await alice
      .post(`/api/v1/workspaces/${id}/invitations`)
      .send({ email: 'someone@example.org' })
      .expect(201);

    const attempts = [
      () => mallory.get(`/api/v1/workspaces/${id}`),
      () => mallory.patch(`/api/v1/workspaces/${id}`).send({ name: 'pwned' }),
      () => mallory.delete(`/api/v1/workspaces/${id}`).send({ confirmName: 'Acme' }),
      () =>
        mallory
          .post(`/api/v1/workspaces/${id}/transfer-ownership`)
          .send({ userId: mallory.userId }),
      () => mallory.get(`/api/v1/workspaces/${id}/members`),
      () =>
        mallory.patch(`/api/v1/workspaces/${id}/members/${alice.userId}`).send({ role: 'guest' }),
      () => mallory.delete(`/api/v1/workspaces/${id}/members/${alice.userId}`),
      () => mallory.get(`/api/v1/workspaces/${id}/invitations`),
      () => mallory.post(`/api/v1/workspaces/${id}/invitations`).send({ email: mallory.email }),
      () => mallory.delete(`/api/v1/workspaces/${id}/invitations/${inv.body.id}`),
      () => mallory.get(`/api/v1/workspaces/${id}/audit-logs`),
    ];
    for (const [index, attempt] of attempts.entries()) {
      const res = await attempt();
      expect(res.status, `tentative n°${index}`).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    }

    const ghost = await mallory
      .get('/api/v1/workspaces/01999999-0000-7000-8000-000000000000')
      .expect(404);
    const real = await mallory.get(`/api/v1/workspaces/${id}`).expect(404);
    expect(ghost.body.error.message).toBe(real.body.error.message);

    expect((await mallory.get('/api/v1/workspaces').expect(200)).body.items).toEqual([]);
    const ws = await alice.get(`/api/v1/workspaces/${id}`).expect(200);
    expect(ws.body.name).toBe('Acme');
  });

  it('projets, tâches, équipes et canaux d’un autre workspace sont introuvables', async () => {
    const [alice, mallory] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Mallory')]);
    const acme = await workspaceWith(alice, [], 'Acme');
    const evil = await workspaceWith(mallory, [], 'Evil');
    const p = (await alice.post(`/api/v1/workspaces/${acme}/projects`).send({ name: 'P' })).body.id;
    const t = (
      await alice.post(`/api/v1/workspaces/${acme}/projects/${p}/tasks`).send({ title: 'T' })
    ).body.id;
    const team = (await alice.post(`/api/v1/workspaces/${acme}/teams`).send({ name: 'Eq' })).body
      .id;
    const c = (await alice.get(`/api/v1/workspaces/${acme}/channels`)).body.items[0].id;

    for (const ws of [evil, acme]) {
      const attempts = [
        () => mallory.get(`/api/v1/workspaces/${ws}/projects/${p}`),
        () => mallory.get(`/api/v1/workspaces/${ws}/projects/${p}/tasks`),
        () => mallory.post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`).send({ title: 'x' }),
        () => mallory.get(`/api/v1/workspaces/${ws}/tasks/${t}`),
        () => mallory.patch(`/api/v1/workspaces/${ws}/tasks/${t}`).send({ title: 'x' }),
        () => mallory.delete(`/api/v1/workspaces/${ws}/tasks/${t}`),
        () => mallory.post(`/api/v1/workspaces/${ws}/tasks/${t}/comments`).send({ body: 'x' }),
        () => mallory.get(`/api/v1/workspaces/${ws}/teams/${team}`),
        () => mallory.put(`/api/v1/workspaces/${ws}/teams/${team}/members/${mallory.userId}`),
        () => mallory.get(`/api/v1/workspaces/${ws}/channels/${c}`),
        () => mallory.get(`/api/v1/workspaces/${ws}/channels/${c}/messages`),
        () => mallory.post(`/api/v1/workspaces/${ws}/channels/${c}/messages`).send({ body: 'x' }),
        () => mallory.put(`/api/v1/workspaces/${ws}/channels/${c}/members/${mallory.userId}`),
      ];
      for (const [index, attempt] of attempts.entries()) {
        const res = await attempt();
        expect(
          res.status,
          `${ws === evil ? 'via son workspace' : 'direct'}, tentative n°${index}`,
        ).toBe(404);
      }
    }
    await mallory
      .post(`/api/v1/workspaces/${evil}/projects`)
      .send({ name: 'X', teamId: team })
      .expect(400);
  });

  it('un administrateur d’un workspace n’a aucun droit sur un autre', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const acme = await workspaceWith(alice, [], 'Acme');
    const globex = await workspaceWith(bob, [], 'Globex');
    const globexInv = await bob
      .post(`/api/v1/workspaces/${globex}/invitations`)
      .send({ email: 'x@example.org' })
      .expect(201);

    await alice.delete(`/api/v1/workspaces/${acme}/invitations/${globexInv.body.id}`).expect(404);
    await alice
      .patch(`/api/v1/workspaces/${acme}/members/${bob.userId}`)
      .send({ role: 'guest' })
      .expect(404);
    await bob.get(`/api/v1/workspaces/${globex}/invitations`).expect(200);
  });

  it('un membre retiré perd immédiatement l’accès', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const id = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    await bob.get(`/api/v1/workspaces/${id}`).expect(200);
    await alice.delete(`/api/v1/workspaces/${id}/members/${bob.userId}`).expect(204);
    await bob.get(`/api/v1/workspaces/${id}`).expect(404);
  });
});
