import AxeBuilder from '@axe-core/playwright';
import { type Browser, type Page, expect, test } from '@playwright/test';

const PASSWORD = 'phrase de passe solide';
const run = Date.now();
const emailOf = (name: string) => `${name.toLowerCase()}.f${run}@example.org`;
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

async function newUser(browser: Browser, name: string) {
  const page = await (await browser.newContext({ locale: 'fr-FR' })).newPage();
  await page.goto('/register');
  await page.getByLabel('Votre nom').fill(name);
  await page.getByLabel('Adresse e-mail').fill(emailOf(name));
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page.getByRole('heading', { name: 'Créez votre premier workspace' })).toBeVisible();
  return page;
}

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map(
      (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
    ),
  ).toEqual([]);
}

test('images sur une tâche, fichiers dans un canal et mentions notifiées', async ({ browser }) => {
  test.setTimeout(150_000);

  const alice = await newUser(browser, 'Alice');
  await alice.getByLabel('Nom du workspace').fill('Atelier Nova');
  await alice.getByRole('button', { name: 'Créer le workspace' }).click();
  await expect(alice.getByRole('heading', { name: 'Atelier Nova' })).toBeVisible();
  const workspacePath = new URL(alice.url()).pathname;
  await alice.getByRole('link', { name: 'Membres', exact: true }).click();
  await alice.getByLabel('Adresse e-mail').fill(emailOf('Bob'));
  await alice.getByRole('button', { name: 'Envoyer l’invitation' }).click();
  const inviteUrl = await alice.getByRole('textbox', { name: 'Inviter une personne' }).inputValue();

  const bob = await newUser(browser, 'Bob');
  await bob.goto(new URL(inviteUrl).pathname);
  await bob.getByRole('button', { name: 'Rejoindre le workspace' }).click();
  await expect(bob.getByRole('heading', { name: 'Atelier Nova' })).toBeVisible();
  await expect(bob.getByText('Temps réel connecté')).toBeAttached();

  await alice.goto(workspacePath);
  await alice.getByRole('button', { name: 'Nouveau projet' }).first().click();
  await alice.getByLabel('Nom du projet').fill('Identité');
  await alice.getByRole('button', { name: 'Créer le projet' }).click();
  await alice.getByLabel('Nouvelle tâche').fill('Maquette du logo');
  await alice.keyboard.press('Enter');
  await alice.getByRole('link', { name: 'Ouvrir la tâche Maquette du logo' }).click();
  const panel = alice.getByRole('dialog');

  await panel
    .locator('input[type=file]')
    .setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: PNG });
  await expect(panel.getByRole('img', { name: 'logo.png' })).toBeVisible();

  const comment = panel.getByLabel('Écrire un commentaire');
  await comment.fill('@Bo');
  await panel
    .getByRole('listbox', { name: 'Personnes à mentionner' })
    .getByRole('option', { name: 'Bob' })
    .click();
  await comment.pressSequentially('peux-tu valider ?');
  await panel.getByRole('button', { name: 'Commenter' }).click();
  await expect(panel.getByText('@Bob')).toBeVisible();
  await expectAccessible(alice);

  const toast = bob.getByRole('status').filter({ hasText: 'Alice vous a mentionné' });
  await expect(toast).toContainText('« Maquette du logo »');
  await toast.getByRole('link', { name: 'Voir' }).click();
  await expect(bob.getByRole('dialog').getByRole('img', { name: 'logo.png' })).toBeVisible();
  await bob.keyboard.press('Escape');

  await alice.keyboard.press('Escape');
  await alice.getByRole('navigation').getByRole('link', { name: 'Général' }).click();
  await alice.locator('input[type=file]').setInputFiles({
    name: 'devis.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7'),
  });
  const composer = alice.getByLabel('Message dans Général');
  await composer.fill('Le devis pour @Bo');
  await alice.keyboard.press('Enter');
  await composer.pressSequentially(' à relire');
  await expect(alice.getByRole('button', { name: 'Envoyer' })).toBeEnabled();
  await alice.keyboard.press('Enter');
  await expect(alice.getByRole('link', { name: 'Télécharger devis.pdf' })).toBeVisible();
  await expectAccessible(alice);

  const channelToast = bob
    .getByRole('status')
    .filter({ hasText: 'Alice vous a mentionné dans #Général' });
  await channelToast.getByRole('link', { name: 'Voir' }).click();
  await expect(bob.getByRole('link', { name: 'Télécharger devis.pdf' })).toBeVisible();
  await expect(bob.getByText('@Bob')).toBeVisible();
});
