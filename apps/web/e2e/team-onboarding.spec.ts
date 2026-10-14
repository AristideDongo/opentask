import AxeBuilder from '@axe-core/playwright';
import { type Browser, type Page, expect, test } from '@playwright/test';

const PASSWORD = 'phrase de passe solide';
const run = Date.now();
const emailOf = (name: string) =>
  `${name
    .normalize('NFD')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()}.${run}@example.org`;

async function register(page: Page, name: string, path: string | null = '/register') {
  if (path) await page.goto(path);
  await page.getByLabel('Votre nom').fill(name);
  await page.getByLabel('Adresse e-mail').fill(emailOf(name));
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
}

async function newUserPage(browser: Browser) {
  const context = await browser.newContext({ locale: 'fr-FR' });
  return context.newPage();
}

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

test('une équipe se constitue de bout en bout, sans fuite entre workspaces', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const alice = await newUserPage(browser);
  await alice.goto('/login');
  await expectAccessible(alice);
  await register(alice, 'Alice');
  await expect(alice.getByRole('heading', { name: 'Créez votre premier workspace' })).toBeVisible();
  await alice.getByLabel('Nom du workspace').fill('Atelier Nord');
  await alice.getByRole('button', { name: 'Créer le workspace' }).click();
  await expect(alice.getByRole('heading', { name: 'Atelier Nord' })).toBeVisible();
  const workspaceUrl = alice.url();
  await expectAccessible(alice);

  await alice.getByRole('link', { name: 'Membres', exact: true }).click();
  await alice.getByLabel('Adresse e-mail').fill(emailOf('bob'));
  await alice.getByRole('button', { name: 'Envoyer l’invitation' }).click();
  await expect(alice.getByText(`Invitation envoyée à ${emailOf('bob')}.`)).toBeVisible();
  const inviteUrl = await alice.getByRole('textbox', { name: 'Inviter une personne' }).inputValue();
  expect(inviteUrl).toMatch(/\/invite\/[\w-]+$/);
  await expect(alice.getByRole('heading', { name: 'Invitations en attente' })).toBeVisible();
  await expectAccessible(alice);

  const bob = await newUserPage(browser);
  await bob.goto(new URL(inviteUrl).pathname);
  await expect(
    bob.getByRole('heading', { name: 'Invitation à rejoindre Atelier Nord' }),
  ).toBeVisible();
  await bob.getByRole('link', { name: 'Créer un compte' }).click();
  await bob.waitForURL(/\/register\?redirectTo=%2Finvite%2F/);
  await register(bob, 'Bob', null);
  await bob.getByRole('button', { name: 'Rejoindre le workspace' }).click();
  await expect(bob.getByRole('heading', { name: 'Atelier Nord' })).toBeVisible();
  await expect(bob.getByText('Participe aux projets du workspace.')).toBeVisible();

  await alice.reload();
  await alice.getByLabel('Rôle de Bob').selectOption('admin');
  await expect(alice.getByText('Rôle de Bob modifié.')).toBeVisible();
  await alice.getByRole('link', { name: 'Paramètres', exact: true }).click();
  await expect(alice.getByText('Alice a modifié un rôle (Membre → Administrateur)')).toBeVisible();
  await expectAccessible(alice);

  const mallory = await newUserPage(browser);
  await register(mallory, 'Mallory');
  await expect(
    mallory.getByRole('heading', { name: 'Créez votre premier workspace' }),
  ).toBeVisible();
  await mallory.goto(new URL(workspaceUrl).pathname);
  await expect(mallory.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
  const workspaceId = new URL(workspaceUrl).pathname.split('/').pop();
  const apiResponse = await mallory.request.get(`/api/v1/workspaces/${workspaceId}`);
  expect(apiResponse.status()).toBe(404);

  await bob.goto(`${new URL(workspaceUrl).pathname}/members`);
  await expect(bob.getByRole('heading', { name: 'Inviter une personne' })).toBeVisible();
});

test('les erreurs de connexion sont expliquées', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByText('Adresse e-mail invalide.')).toBeVisible();
  await page.getByLabel('Adresse e-mail').fill('personne@example.org');
  await page.getByLabel('Mot de passe').fill('mauvais mot de passe');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('alert')).toHaveText('Adresse e-mail ou mot de passe incorrect.');
});

test('une page protégée renvoie vers la connexion puis revient', async ({ page }) => {
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login\?redirectTo=%2Fprofile$/);
  await register(page, 'Chloé', '/register?redirectTo=%2Fprofile');
  await expect(page.getByRole('heading', { name: 'Profil' })).toBeVisible();
  await page.getByLabel('Langue').selectOption('en');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
  await expectAccessible(page);
});
