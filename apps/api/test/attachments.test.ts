import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { testEnv } from './env';
import { type Agent, useTestApp, workspaceWith } from './helpers';

const ctx = useTestApp();

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);
const HTML = Buffer.from('<html><script>alert(1)</script></html>');

const upload = (
  agent: Agent,
  path: string,
  content: Buffer,
  filename: string,
  contentType: string,
) => agent.post(path).attach('file', content, { filename, contentType });

async function projectTask(agent: Agent, ws: string) {
  const project = await agent
    .post(`/api/v1/workspaces/${ws}/projects`)
    .send({ name: 'Site' })
    .expect(201);
  const task = await agent
    .post(`/api/v1/workspaces/${ws}/projects/${project.body.id}/tasks`)
    .send({ title: 'Maquette' })
    .expect(201);
  return task.body.id as string;
}

async function generalChannel(agent: Agent, ws: string) {
  const channels = await agent.get(`/api/v1/workspaces/${ws}/channels`).expect(200);
  return channels.body.items[0].id as string;
}

describe('fichiers joints aux tâches', () => {
  it('joint une image à une tâche, l’affiche et la supprime', async () => {
    const alice = await ctx.signUp('Alice');
    const ws = await workspaceWith(alice);
    const taskId = await projectTask(alice, ws);

    const res = await upload(
      alice,
      `/api/v1/workspaces/${ws}/tasks/${taskId}/attachments`,
      PNG,
      'maquette.png',
      'image/png',
    ).expect(201);
    expect(res.body).toMatchObject({
      fileName: 'maquette.png',
      mimeType: 'image/png',
      isImage: true,
      size: PNG.length,
    });
    expect(res.body.url).toBe(`/api/v1/workspaces/${ws}/attachments/${res.body.id}/content`);

    const detail = await alice.get(`/api/v1/workspaces/${ws}/tasks/${taskId}`).expect(200);
    expect(detail.body.attachments.map((a: { id: string }) => a.id)).toEqual([res.body.id]);

    const content = await alice.get(res.body.url).buffer(true).expect(200);
    expect(content.headers['content-type']).toBe('image/png');
    expect(content.headers['content-disposition']).toMatch(/^inline;/);
    expect(content.headers['x-content-type-options']).toBe('nosniff');
    expect(Buffer.compare(content.body as Buffer, PNG)).toBe(0);

    await alice.delete(`/api/v1/workspaces/${ws}/attachments/${res.body.id}`).expect(204);
    await alice.get(res.body.url).expect(404);
  });

  it('ne laisse jamais le navigateur exécuter un fichier déguisé en image', async () => {
    const alice = await ctx.signUp('Alice');
    const ws = await workspaceWith(alice);
    const taskId = await projectTask(alice, ws);
    const res = await upload(
      alice,
      `/api/v1/workspaces/${ws}/tasks/${taskId}/attachments`,
      HTML,
      'photo.png',
      'image/png',
    ).expect(201);
    expect(res.body.isImage).toBe(false);
    const content = await alice.get(res.body.url).expect(200);
    expect(content.headers['content-type']).toBe('application/octet-stream');
    expect(content.headers['content-disposition']).toMatch(/^attachment;/);
    expect(content.headers['content-security-policy']).toContain("default-src 'none'");
  });

  it('refuse les fichiers trop volumineux, vides ou absents', async () => {
    const alice = await ctx.signUp('Alice');
    const ws = await workspaceWith(alice);
    const taskId = await projectTask(alice, ws);
    const big = Buffer.alloc(1024 * 1024 + 1, 1);
    const tooBig = await upload(
      alice,
      `/api/v1/workspaces/${ws}/tasks/${taskId}/attachments`,
      big,
      'gros.bin',
      'application/octet-stream',
    ).expect(413);
    expect(tooBig.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    await upload(
      alice,
      `/api/v1/workspaces/${ws}/tasks/${taskId}/attachments`,
      Buffer.alloc(0),
      'vide.txt',
      'text/plain',
    ).expect(400);
    await alice.post(`/api/v1/workspaces/${ws}/tasks/${taskId}/attachments`).send({}).expect(400);
  });

  it('applique les rôles et l’isolation des workspaces', async () => {
    const [alice, guest, mallory] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Gina'),
      ctx.signUp('Mallory'),
    ]);
    const ws = await workspaceWith(alice, [{ agent: guest, role: 'guest' }]);
    const taskId = await projectTask(alice, ws);
    const res = await upload(
      alice,
      `/api/v1/workspaces/${ws}/tasks/${taskId}/attachments`,
      PNG,
      'a.png',
      'image/png',
    ).expect(201);

    await upload(
      guest,
      `/api/v1/workspaces/${ws}/tasks/${taskId}/attachments`,
      PNG,
      'b.png',
      'image/png',
    ).expect(403);
    await guest.get(res.body.url).expect(200);
    await guest.delete(`/api/v1/workspaces/${ws}/attachments/${res.body.id}`).expect(403);

    await mallory.get(res.body.url).expect(404);
    await mallory.delete(`/api/v1/workspaces/${ws}/attachments/${res.body.id}`).expect(404);
    const otherWs = await workspaceWith(mallory, [], 'Globex');
    await mallory
      .get(`/api/v1/workspaces/${otherWs}/attachments/${res.body.id}/content`)
      .expect(404);
  });

  it('supprime les fichiers du disque avec la tâche', async () => {
    const alice = await ctx.signUp('Alice');
    const ws = await workspaceWith(alice);
    const taskId = await projectTask(alice, ws);
    const res = await upload(
      alice,
      `/api/v1/workspaces/${ws}/tasks/${taskId}/attachments`,
      PNG,
      'a.png',
      'image/png',
    ).expect(201);
    const row = await ctx.built.prisma.attachment.findUniqueOrThrow({ where: { id: res.body.id } });
    const path = join(testEnv().STORAGE_DIR, row.storageKey);
    expect(existsSync(path)).toBe(true);
    await alice.delete(`/api/v1/workspaces/${ws}/tasks/${taskId}`).expect(204);
    expect(existsSync(path)).toBe(false);
  });
});

describe('fichiers dans les canaux', () => {
  it('envoie un message avec des fichiers et sans texte', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const ws = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    const channelId = await generalChannel(alice, ws);
    const image = await upload(
      alice,
      `/api/v1/workspaces/${ws}/attachments`,
      PNG,
      'capture.png',
      'image/png',
    ).expect(201);
    const pdf = await upload(
      alice,
      `/api/v1/workspaces/${ws}/attachments`,
      Buffer.from('%PDF-1.7'),
      'rapport.pdf',
      'application/pdf',
    ).expect(201);

    await bob.get(image.body.url).expect(404);

    const message = await alice
      .post(`/api/v1/workspaces/${ws}/channels/${channelId}/messages`)
      .send({ attachmentIds: [image.body.id, pdf.body.id] })
      .expect(201);
    expect(message.body.body).toBe('');
    expect(message.body.attachments.map((a: { fileName: string }) => a.fileName)).toEqual([
      'capture.png',
      'rapport.pdf',
    ]);
    await bob.get(image.body.url).expect(200);

    await alice
      .post(`/api/v1/workspaces/${ws}/channels/${channelId}/messages`)
      .send({ body: 'encore', attachmentIds: [image.body.id] })
      .expect(400);
    await alice
      .post(`/api/v1/workspaces/${ws}/channels/${channelId}/messages`)
      .send({ body: '  ' })
      .expect(400);

    await alice
      .delete(`/api/v1/workspaces/${ws}/channels/${channelId}/messages/${message.body.id}`)
      .expect(200);
    await alice.get(image.body.url).expect(404);
  });

  it('ne permet pas de joindre le fichier de quelqu’un d’autre', async () => {
    const [alice, bob] = await Promise.all([ctx.signUp('Alice'), ctx.signUp('Bob')]);
    const ws = await workspaceWith(alice, [{ agent: bob, role: 'member' }]);
    const channelId = await generalChannel(alice, ws);
    const file = await upload(
      alice,
      `/api/v1/workspaces/${ws}/attachments`,
      PNG,
      'a.png',
      'image/png',
    ).expect(201);
    const res = await bob
      .post(`/api/v1/workspaces/${ws}/channels/${channelId}/messages`)
      .send({ body: 'vol', attachmentIds: [file.body.id] })
      .expect(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    const page = await bob
      .get(`/api/v1/workspaces/${ws}/channels/${channelId}/messages`)
      .expect(200);
    expect(page.body.items).toEqual([]);
  });

  it('réserve les fichiers d’un canal privé à ses membres', async () => {
    const [alice, bob, carol] = await Promise.all([
      ctx.signUp('Alice'),
      ctx.signUp('Bob'),
      ctx.signUp('Carol'),
    ]);
    const ws = await workspaceWith(alice, [
      { agent: bob, role: 'member' },
      { agent: carol, role: 'admin' },
    ]);
    const channel = await alice
      .post(`/api/v1/workspaces/${ws}/channels`)
      .send({ name: 'Direction', isPrivate: true, memberIds: [bob.userId] })
      .expect(201);
    const file = await upload(
      alice,
      `/api/v1/workspaces/${ws}/attachments`,
      PNG,
      'secret.png',
      'image/png',
    ).expect(201);
    await alice
      .post(`/api/v1/workspaces/${ws}/channels/${channel.body.id}/messages`)
      .send({ attachmentIds: [file.body.id] })
      .expect(201);
    await bob.get(file.body.url).expect(200);
    await carol.get(file.body.url).expect(404);
  });
});
