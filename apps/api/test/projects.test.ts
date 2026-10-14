import { describe, expect, it } from 'vitest';
import { useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();

describe('projets et tâches', () => {
  it('crée un projet, des tâches, et les filtre', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const ws = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    const project = await alice
      .post(`/api/v1/workspaces/${ws}/projects`)
      .send({ name: 'Site web', description: 'Refonte' })
      .expect(201);
    expect(project.body).toMatchObject({
      name: 'Site web',
      team: null,
      taskCounts: { todo: 0, done: 0 },
    });
    const p = project.body.id;

    const t1 = await bob
      .post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`)
      .send({
        title: 'Maquettes',
        priority: 'high',
        dueDate: '2026-11-02',
        assigneeId: alice.userId,
      })
      .expect(201);
    expect(t1.body).toMatchObject({
      title: 'Maquettes',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-11-02',
      assignee: { id: alice.userId, name: 'Alice' },
      createdBy: { id: bob.userId },
    });
    await bob
      .post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`)
      .send({ title: 'Contenus' })
      .expect(201);
    await bob
      .post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`)
      .send({ title: 'Recette', status: 'in_review' })
      .expect(201);

    const all = await alice.get(`/api/v1/workspaces/${ws}/projects/${p}/tasks`).expect(200);
    expect(all.body.items.map((t: { title: string }) => t.title)).toEqual([
      'Maquettes',
      'Contenus',
      'Recette',
    ]);
    const high = await alice
      .get(`/api/v1/workspaces/${ws}/projects/${p}/tasks?priority=high`)
      .expect(200);
    expect(high.body.items).toHaveLength(1);
    const unassigned = await alice
      .get(`/api/v1/workspaces/${ws}/projects/${p}/tasks?assigneeId=none`)
      .expect(200);
    expect(unassigned.body.items).toHaveLength(2);
    const search = await alice
      .get(`/api/v1/workspaces/${ws}/projects/${p}/tasks?q=RECET`)
      .expect(200);
    expect(search.body.items.map((t: { title: string }) => t.title)).toEqual(['Recette']);

    const mine = await alice.get(`/api/v1/workspaces/${ws}/my-tasks`).expect(200);
    expect(mine.body.items).toMatchObject([{ title: 'Maquettes', projectName: 'Site web' }]);

    const counts = await alice.get(`/api/v1/workspaces/${ws}/projects/${p}`).expect(200);
    expect(counts.body.taskCounts).toEqual({ todo: 2, in_progress: 0, in_review: 1, done: 0 });
  });

  it('déplace une tâche dans le Kanban et date son achèvement', async () => {
    const alice = await ctx.signUp('Alice');
    const ws = await workspaceWith(alice);
    const p = (
      await alice.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P' }).expect(201)
    ).body.id;
    const create = (title: string, status = 'todo') =>
      alice
        .post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`)
        .send({ title, status })
        .expect(201);
    const a = (await create('A')).body;
    const b = (await create('B')).body;
    const c = (await create('C', 'done')).body;

    await alice
      .patch(`/api/v1/workspaces/${ws}/tasks/${b.id}`)
      .send({ beforeTaskId: a.id })
      .expect(200);
    let todo = await alice
      .get(`/api/v1/workspaces/${ws}/projects/${p}/tasks?status=todo`)
      .expect(200);
    expect(todo.body.items.map((t: { title: string }) => t.title)).toEqual(['B', 'A']);

    const moved = await alice
      .patch(`/api/v1/workspaces/${ws}/tasks/${a.id}`)
      .send({ status: 'done', beforeTaskId: c.id })
      .expect(200);
    expect(moved.body.completedAt).not.toBeNull();
    const done = await alice
      .get(`/api/v1/workspaces/${ws}/projects/${p}/tasks?status=done`)
      .expect(200);
    expect(done.body.items.map((t: { title: string }) => t.title)).toEqual(['A', 'C']);

    const reopened = await alice
      .patch(`/api/v1/workspaces/${ws}/tasks/${a.id}`)
      .send({ status: 'todo' })
      .expect(200);
    expect(reopened.body.completedAt).toBeNull();
    todo = await alice.get(`/api/v1/workspaces/${ws}/projects/${p}/tasks?status=todo`).expect(200);
    expect(todo.body.items.map((t: { title: string }) => t.title)).toEqual(['B', 'A']);

    await alice
      .patch(`/api/v1/workspaces/${ws}/tasks/${b.id}`)
      .send({ beforeTaskId: c.id })
      .expect(400);
  });

  it('sous-tâches, commentaires et détail', async () => {
    const [alice, guest] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Gina')]);
    const ws = await workspaceWith(alice, [{ agent: guest, role: 'guest' }]);
    const p = (
      await alice.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P' }).expect(201)
    ).body.id;
    const parent = (
      await alice.post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`).send({ title: 'Parent' })
    ).body;
    const sub = await alice
      .post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`)
      .send({ title: 'Sous-tâche', parentId: parent.id, status: 'done' })
      .expect(201);
    await alice
      .post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`)
      .send({ title: 'Trop profond', parentId: sub.body.id })
      .expect(400);

    await guest
      .post(`/api/v1/workspaces/${ws}/tasks/${parent.id}/comments`)
      .send({ body: 'Je regarde' })
      .expect(201);
    const detail = await guest.get(`/api/v1/workspaces/${ws}/tasks/${parent.id}`).expect(200);
    expect(detail.body).toMatchObject({
      projectName: 'P',
      subtaskCount: 1,
      subtaskDoneCount: 1,
      commentCount: 1,
      subtasks: [{ title: 'Sous-tâche' }],
      comments: [{ body: 'Je regarde', author: { name: 'Gina' } }],
    });
    const list = await alice.get(`/api/v1/workspaces/${ws}/projects/${p}/tasks`).expect(200);
    expect(list.body.items).toHaveLength(1);
  });

  it('applique les rôles : invité en lecture, suppression par l’auteur ou un admin', async () => {
    const [alice, bob, carol, gina] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
      ctx.signUp('Gina'),
    ]);
    const ws = await workspaceWith(alice, [
      { agent: bob, role: 'member' },
      { agent: carol, role: 'member' },
      { agent: gina, role: 'guest' },
    ]);
    await gina.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'X' }).expect(403);
    const p = (await bob.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P' }).expect(201))
      .body.id;
    const task = (
      await bob.post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`).send({ title: 'T' })
    ).body;

    await gina.get(`/api/v1/workspaces/${ws}/projects/${p}/tasks`).expect(200);
    await gina
      .post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`)
      .send({ title: 'N' })
      .expect(403);
    await gina
      .patch(`/api/v1/workspaces/${ws}/tasks/${task.id}`)
      .send({ status: 'done' })
      .expect(403);
    await carol.delete(`/api/v1/workspaces/${ws}/tasks/${task.id}`).expect(403);
    await bob.delete(`/api/v1/workspaces/${ws}/projects/${p}`).expect(403);
    await bob.delete(`/api/v1/workspaces/${ws}/tasks/${task.id}`).expect(204);
    await alice.delete(`/api/v1/workspaces/${ws}/projects/${p}`).expect(204);
  });

  it('assignation : uniquement à un membre, et retirée au départ du membre', async () => {
    const [alice, bob, outsider] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Olga'),
    ]);
    const ws = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    const p = (
      await alice.post(`/api/v1/workspaces/${ws}/projects`).send({ name: 'P' }).expect(201)
    ).body.id;
    await alice
      .post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`)
      .send({ title: 'T', assigneeId: outsider.userId })
      .expect(400);
    const task = (
      await alice
        .post(`/api/v1/workspaces/${ws}/projects/${p}/tasks`)
        .send({ title: 'T', assigneeId: bob.userId })
    ).body;
    await bob.delete(`/api/v1/workspaces/${ws}/members/${bob.userId}`).expect(204);
    const after = await alice.get(`/api/v1/workspaces/${ws}/tasks/${task.id}`).expect(200);
    expect(after.body.assignee).toBeNull();
  });
});

describe('équipes', () => {
  it('les administrateurs gèrent les équipes, tout le monde les voit', async () => {
    const [alice, bob, carol] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
    ]);
    const ws = await workspaceWith(alice, [
      { agent: bob, role: 'member' },
      { agent: carol, role: 'admin' },
    ]);
    await bob.post(`/api/v1/workspaces/${ws}/teams`).send({ name: 'Design' }).expect(403);
    const team = await carol
      .post(`/api/v1/workspaces/${ws}/teams`)
      .send({ name: 'Design', memberIds: [bob.userId] })
      .expect(201);
    expect(team.body.members).toEqual([{ id: bob.userId, name: 'Bob' }]);
    await carol.post(`/api/v1/workspaces/${ws}/teams`).send({ name: 'Design' }).expect(409);

    const t = team.body.id;
    const withAlice = await carol
      .put(`/api/v1/workspaces/${ws}/teams/${t}/members/${alice.userId}`)
      .expect(200);
    expect(withAlice.body.members).toHaveLength(2);

    await alice
      .post(`/api/v1/workspaces/${ws}/projects`)
      .send({ name: 'Charte', teamId: t })
      .expect(201);
    const seen = await bob.get(`/api/v1/workspaces/${ws}/teams/${t}`).expect(200);
    expect(seen.body.projectCount).toBe(1);

    await bob.delete(`/api/v1/workspaces/${ws}/members/${bob.userId}`).expect(204);
    const after = await alice.get(`/api/v1/workspaces/${ws}/teams/${t}`).expect(200);
    expect(after.body.members).toEqual([{ id: alice.userId, name: 'Alice' }]);

    await carol.delete(`/api/v1/workspaces/${ws}/teams/${t}`).expect(204);
    const projects = await alice.get(`/api/v1/workspaces/${ws}/projects`).expect(200);
    expect(projects.body.items[0].team).toBeNull();
  });
});
