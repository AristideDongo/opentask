import { describe, expect, it } from 'vitest';
import { useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();

describe('tags de projet', () => {
  it('crée des tags colorés, les pose sur les tâches et filtre par tag', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const ws = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    const p = (
      await alice.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P' }).expect(201)
    ).body.id;
    const base = `/api/v1/workspaces/${ws}/projects/${p}`;

    const bug = await bob
      .post(`${base}/labels`)
      .send({ name: ' Bug ', color: '#C62828' })
      .expect(201);
    expect(bug.body).toEqual({ id: expect.any(String), name: 'Bug', color: '#c62828' });
    const design = (
      await bob.post(`${base}/labels`).send({ name: 'Design', color: '#1565c0' }).expect(201)
    ).body;
    await bob.post(`${base}/labels`).send({ name: 'Bug', color: '#000000' }).expect(409);
    await bob.post(`${base}/labels`).send({ name: 'X', color: 'rouge' }).expect(400);

    const task = await alice
      .post(`${base}/tasks`)
      .send({ title: 'Corriger le menu', labelIds: [bug.body.id, design.id] })
      .expect(201);
    expect(task.body.labels.map((l: { name: string }) => l.name)).toEqual(['Bug', 'Design']);
    await alice.post(`${base}/tasks`).send({ title: 'Sans tag' }).expect(201);

    const filtered = await alice.get(`${base}/tasks?labelId=${design.id}`).expect(200);
    expect(filtered.body.items.map((t: { title: string }) => t.title)).toEqual([
      'Corriger le menu',
    ]);

    const updated = await alice
      .patch(`/api/v1/workspaces/${ws}/tasks/${task.body.id}`)
      .send({ labelIds: [design.id] })
      .expect(200);
    expect(updated.body.labels).toEqual([{ id: design.id, name: 'Design', color: '#1565c0' }]);

    await bob.patch(`${base}/labels/${design.id}`).send({ color: '#2e7d32' }).expect(200);
    const project = await alice.get(base).expect(200);
    expect(project.body.labels).toEqual([
      { id: bug.body.id, name: 'Bug', color: '#c62828' },
      { id: design.id, name: 'Design', color: '#2e7d32' },
    ]);

    await bob.delete(`${base}/labels/${design.id}`).expect(204);
    const after = await alice.get(`/api/v1/workspaces/${ws}/tasks/${task.body.id}`).expect(200);
    expect(after.body.labels).toEqual([]);
  });

  it('refuse un tag d’un autre projet', async () => {
    const alice = await ctx.signUp('Alice');
    const ws = await workspaceWith(alice);
    const p1 = (await alice.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P1' })).body.id;
    const p2 = (await alice.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P2' })).body.id;
    const foreign = (
      await alice
        .post(`/api/v1/workspaces/${ws}/projects/${p2}/labels`)
        .send({ name: 'Autre', color: '#546e7a' })
    ).body.id;
    await alice
      .post(`/api/v1/workspaces/${ws}/projects/${p1}/tasks`)
      .send({ title: 'T', labelIds: [foreign] })
      .expect(400);
    await alice
      .patch(`/api/v1/workspaces/${ws}/projects/${p1}/labels/${foreign}`)
      .send({ name: 'x' })
      .expect(404);
  });

  it('les invités voient les tags sans pouvoir les gérer', async () => {
    const [alice, gina] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Gina')]);
    const ws = await workspaceWith(alice, [{ agent: gina, role: 'guest' }]);
    const p = (await alice.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P' })).body.id;
    const base = `/api/v1/workspaces/${ws}/projects/${p}`;
    const label = (await alice.post(`${base}/labels`).send({ name: 'Urgent', color: '#c62828' }))
      .body;
    expect((await gina.get(`${base}/labels`).expect(200)).body.items).toHaveLength(1);
    await gina.post(`${base}/labels`).send({ name: 'Moi', color: '#c62828' }).expect(403);
    await gina.patch(`${base}/labels/${label.id}`).send({ name: 'x' }).expect(403);
    await gina.delete(`${base}/labels/${label.id}`).expect(403);
  });

  it('un non-membre ne voit ni ne modifie les tags', async () => {
    const [alice, mallory] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Mallory')]);
    const ws = await workspaceWith(alice);
    const p = (await alice.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P' })).body.id;
    const base = `/api/v1/workspaces/${ws}/projects/${p}`;
    const label = (await alice.post(`${base}/labels`).send({ name: 'Bug', color: '#c62828' })).body;
    await mallory.get(`${base}/labels`).expect(404);
    await mallory.post(`${base}/labels`).send({ name: 'x', color: '#c62828' }).expect(404);
    await mallory.delete(`${base}/labels/${label.id}`).expect(404);
  });
});
