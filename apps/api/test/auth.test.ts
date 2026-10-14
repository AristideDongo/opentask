import { describe, expect, it } from 'vitest';
import { useTestApp } from './helpers';

const ctx = useTestApp();

describe('authentification', () => {
  it('inscription → session → profil', async () => {
    const alice = await ctx.signUp('Alice');
    const me = await alice.get('/api/v1/me').expect(200);
    expect(me.body).toMatchObject({
      name: 'Alice',
      email: alice.email,
      locale: 'fr',
      timezone: 'UTC',
    });
  });

  it('hache les mots de passe avec Argon2id', async () => {
    const alice = await ctx.signUp('Alice');
    const account = await ctx.built.prisma.account.findFirstOrThrow({
      where: { userId: alice.userId },
    });
    expect(account.password).toMatch(/^\$argon2id\$/);
  });

  it('refuse un mot de passe trop court', async () => {
    await ctx
      .anonymous()
      .post('/api/v1/auth/sign-up/email')
      .send({ name: 'Bob', email: 'bob@example.org', password: 'court' })
      .expect(400);
  });

  it('connexion, mauvais mot de passe et déconnexion', async () => {
    const alice = await ctx.signUp('Alice');
    await ctx
      .anonymous()
      .post('/api/v1/auth/sign-in/email')
      .send({ email: alice.email, password: 'mauvais-mot-de-passe' })
      .expect(401);

    const fresh = ctx.anonymous();
    await fresh
      .post('/api/v1/auth/sign-in/email')
      .send({ email: alice.email, password: 'un-mot-de-passe-solide' })
      .expect(200);
    await fresh.get('/api/v1/me').expect(200);
    await fresh.post('/api/v1/auth/sign-out').send({}).expect(200);
    await fresh.get('/api/v1/me').expect(401);
  });

  it('la demande de réinitialisation ne révèle pas si le compte existe', async () => {
    const alice = await ctx.signUp('Alice');
    const ask = (email: string) =>
      ctx
        .anonymous()
        .post('/api/v1/auth/request-password-reset')
        .send({ email, redirectTo: 'http://opentask.test/reset-password' });
    const known = await ask(alice.email);
    const unknown = await ask('inconnu@example.org');
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(known.status);
    expect(unknown.body).toEqual(known.body);
  });

  it('renvoie une erreur 401 au format stable sans session', async () => {
    const res = await ctx.anonymous().get('/api/v1/me').expect(401);
    expect(res.body).toEqual({
      error: {
        code: 'UNAUTHENTICATED',
        message: expect.any(String),
        requestId: expect.any(String),
      },
    });
    expect(res.headers['x-request-id']).toBe(res.body.error.requestId);
  });

  it('met à jour le profil avec validation', async () => {
    const alice = await ctx.signUp('Alice');
    const res = await alice
      .patch('/api/v1/me')
      .send({ name: '  Alice Martin ', locale: 'en', timezone: 'Africa/Abidjan' })
      .expect(200);
    expect(res.body).toMatchObject({
      name: 'Alice Martin',
      locale: 'en',
      timezone: 'Africa/Abidjan',
    });

    const bad = await alice.patch('/api/v1/me').send({ timezone: 'Nowhere/Land' }).expect(400);
    expect(bad.body.error.code).toBe('VALIDATION_FAILED');
    expect(bad.body.error.details[0].path).toBe('timezone');
  });

  it('ne laisse pas l’inscription définir les champs protégés', async () => {
    const res = await ctx.anonymous().post('/api/v1/auth/sign-up/email').send({
      name: 'Eve',
      email: 'eve@example.org',
      password: 'un-mot-de-passe-solide',
      locale: 'en',
      emailVerified: true,
    });
    const user = await ctx.built.prisma.user.findUnique({ where: { email: 'eve@example.org' } });
    if (res.status === 200) expect(user).toMatchObject({ locale: 'fr', emailVerified: false });
    else expect(user).toBeNull();
  });
});

describe('vérification d’adresse obligatoire', () => {
  const strict = useTestApp({ REQUIRE_EMAIL_VERIFICATION: 'true' });

  it('bloque la connexion tant que l’adresse n’est pas vérifiée', async () => {
    await strict
      .anonymous()
      .post('/api/v1/auth/sign-up/email')
      .send({ name: 'Zoé', email: 'zoe@example.org', password: 'un-mot-de-passe-solide' })
      .expect(200);
    const res = await strict
      .anonymous()
      .post('/api/v1/auth/sign-in/email')
      .send({ email: 'zoe@example.org', password: 'un-mot-de-passe-solide' });
    expect(res.status).toBe(403);
  });
});
