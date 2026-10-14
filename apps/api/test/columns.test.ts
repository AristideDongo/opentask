import { describe, expect, it } from 'vitest';
import { type Agent, useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();

async function project(agent: Agent, ws: string) {
  const p = (await agent.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P' }).expect(201))
    .body;
  return { p, base: `/api/v1/workspaces/${ws}/projects/${p.id}` };
}

const names = (columns: { name: string }[]) => columns.map((c) => c.name);

describe('colonnes du Kanban', () => {
  it('un nouveau projet a quatre colonnes, nommées dans la langue du créateur', async () => {
    const alice = await ctx.signUp('Alice');
    const ws = await workspaceWith(alice);
    const { p } = await project(alice, ws);
    expect(names(p.columns)).toEqual(['À faire', 'En cours', 'En revue', 'Terminé']);
    expect(p.columns.map((c: { category: string }) => c.category)).toEqual([
      'todo',
      'in_progress',
      'in_review',
      'done',
    ]);

    await alice.patch('/api/v1/me').send({ locale: 'en' }).expect(200);
    const { p: english } = await project(alice, ws);
    expect(names(english.columns)).toEqual(['To do', 'In progress', 'In review', 'Done']);
  });

  it('ajoute, renomme, réordonne une colonne et y déplace une tâche', async () => {
    const alice = await ctx.signUp('Alice');
    const ws = await workspaceWith(alice);
    const { p, base } = await project(alice, ws);
    const [todo, , review, done] = p.columns;

    const qa = await alice
      .post(`${base}/columns`)
      .send({ name: ' Tests QA ', beforeColumnId: done.id })
      .expect(201);
    expect(qa.body).toMatchObject({ name: 'Tests QA', category: 'in_progress' });
    await alice.patch(`${base}/columns/${todo.id}`).send({ name: 'Backlog' }).expect(200);
    let columns = (await alice.get(`${base}/columns`).expect(200)).body.items;
    expect(names(columns)).toEqual(['Backlog', 'En cours', 'En revue', 'Tests QA', 'Terminé']);

    await alice
      .patch(`${base}/columns/${qa.body.id}`)
      .send({ beforeColumnId: review.id })
      .expect(200);
    columns = (await alice.get(`${base}/columns`).expect(200)).body.items;
    expect(names(columns)).toEqual(['Backlog', 'En cours', 'Tests QA', 'En revue', 'Terminé']);

    const task = await alice
      .post(`${base}/tasks`)
      .send({ title: 'Vérifier', columnId: qa.body.id })
      .expect(201);
    expect(task.body).toMatchObject({
      column: { id: qa.body.id, name: 'Tests QA' },
      status: 'in_progress',
    });
    const moved = await alice
      .patch(`/api/v1/workspaces/${ws}/tasks/${task.body.id}`)
      .send({ columnId: done.id })
      .expect(200);
    expect(moved.body).toMatchObject({
      status: 'done',
      column: { name: 'Terminé' },
      completedAt: expect.any(String),
    });

    const filtered = await alice.get(`${base}/tasks?columnId=${done.id}`).expect(200);
    expect(filtered.body.items.map((t: { title: string }) => t.title)).toEqual(['Vérifier']);
  });

  it('changer le type d’une colonne met à jour ses tâches', async () => {
    const alice = await ctx.signUp('Alice');
    const ws = await workspaceWith(alice);
    const { base } = await project(alice, ws);
    const livre = (await alice.post(`${base}/columns`).send({ name: 'Livré' }).expect(201)).body;
    const task = (
      await alice.post(`${base}/tasks`).send({ title: 'T', columnId: livre.id }).expect(201)
    ).body;
    expect(task.completedAt).toBeNull();

    await alice.patch(`${base}/columns/${livre.id}`).send({ category: 'done' }).expect(200);
    const done = (await alice.get(`/api/v1/workspaces/${ws}/tasks/${task.id}`).expect(200)).body;
    expect(done).toMatchObject({ status: 'done', completedAt: expect.any(String) });
    await alice
      .patch(`/api/v1/workspaces/${ws}/tasks/${task.id}`)
      .send({ assigneeId: alice.userId })
      .expect(200);
    expect((await alice.get(`/api/v1/workspaces/${ws}/my-tasks`)).body.items).toEqual([]);
  });

  it('supprime une colonne en déplaçant ses tâches, jamais la dernière', async () => {
    const alice = await ctx.signUp('Alice');
    const ws = await workspaceWith(alice);
    const { p, base } = await project(alice, ws);
    const [todo, doing, review, done] = p.columns;
    await alice.post(`${base}/tasks`).send({ title: 'A', columnId: review.id }).expect(201);
    await alice.post(`${base}/tasks`).send({ title: 'B', columnId: review.id }).expect(201);
    await alice.post(`${base}/tasks`).send({ title: 'C', columnId: doing.id }).expect(201);

    await alice.delete(`${base}/columns/${review.id}`).send({}).expect(409);
    await alice.delete(`${base}/columns/${review.id}`).send({ moveTasksTo: doing.id }).expect(204);
    const inDoing = (await alice.get(`${base}/tasks?columnId=${doing.id}`)).body.items;
    expect(inDoing.map((t: { title: string }) => t.title)).toEqual(['C', 'A', 'B']);

    await alice.delete(`${base}/columns/${done.id}`).send({}).expect(204);
    await alice.delete(`${base}/columns/${todo.id}`).send({}).expect(204);
    await alice.delete(`${base}/columns/${doing.id}`).send({ moveTasksTo: doing.id }).expect(409);
    const task = (await alice.get(`${base}/tasks`)).body.items[0];
    const res = await alice
      .patch(`/api/v1/workspaces/${ws}/tasks/${task.id}`)
      .send({ status: 'done' })
      .expect(400);
    expect(res.body.error.message).toMatch(/Terminé/);
  });

  it('refuse une colonne d’un autre projet et protège les droits', async () => {
    const [alice, gina, mallory] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Gina'),
      ctx.signUp('Mallory'),
    ]);
    const ws = await workspaceWith(alice, [{ agent: gina, role: 'guest' }]);
    const { base: base1 } = await project(alice, ws);
    const { p: p2 } = await project(alice, ws);
    await alice.post(`${base1}/tasks`).send({ title: 'T', columnId: p2.columns[0].id }).expect(400);
    await alice.patch(`${base1}/columns/${p2.columns[0].id}`).send({ name: 'x' }).expect(404);

    await gina.get(`${base1}/columns`).expect(200);
    await gina.post(`${base1}/columns`).send({ name: 'Moi' }).expect(403);
    await mallory.get(`${base1}/columns`).expect(404);
    await mallory.post(`${base1}/columns`).send({ name: 'x' }).expect(404);
  });
});
