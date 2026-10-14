import AxeBuilder from '@axe-core/playwright';
import { type Browser, type Locator, type Page, expect, test } from '@playwright/test';

const PASSWORD = 'phrase de passe solide';
const run = Date.now();
const emailOf = (name: string) => `${name.toLowerCase()}.w${run}@example.org`;

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

async function drag(page: Page, from: Locator, to: Locator) {
  const a = (await from.boundingBox())!;
  const b = (await to.boundingBox())!;
  await page.mouse.move(a.x + 20, a.y + 10);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(
      a.x + 20 + ((b.x + 40 - a.x - 20) * i) / 10,
      a.y + 10 + ((b.y + 60 - a.y - 10) * i) / 10,
      { steps: 2 },
    );
  }
  await page.mouse.up();
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

test('projets, tâches, Kanban et discussion en temps réel entre deux personnes', async ({
  browser,
}) => {
  test.setTimeout(150_000);

  const alice = await newUser(browser, 'Alice');
  await alice.getByLabel('Nom du workspace').fill('Studio Lumière');
  await alice.getByRole('button', { name: 'Créer le workspace' }).click();
  await expect(alice.getByRole('heading', { name: 'Studio Lumière' })).toBeVisible();
  const workspacePath = new URL(alice.url()).pathname;
  await alice.getByRole('link', { name: 'Membres', exact: true }).click();
  await alice.getByLabel('Adresse e-mail').fill(emailOf('Bob'));
  await alice.getByRole('button', { name: 'Envoyer l’invitation' }).click();
  const inviteUrl = await alice.getByRole('textbox', { name: 'Inviter une personne' }).inputValue();

  const bob = await newUser(browser, 'Bob');
  await bob.goto(new URL(inviteUrl).pathname);
  await bob.getByRole('button', { name: 'Rejoindre le workspace' }).click();
  await expect(bob.getByRole('heading', { name: 'Studio Lumière' })).toBeVisible();

  await alice.getByRole('button', { name: 'Nouveau projet' }).first().click();
  await alice.getByLabel('Nom du projet').fill('Court métrage');
  await alice.getByRole('button', { name: 'Créer le projet' }).click();
  await expect(alice.getByRole('heading', { name: 'Court métrage', level: 1 })).toBeVisible();
  for (const title of ['Écrire le scénario', 'Trouver les décors', 'Monter le film']) {
    await alice.getByLabel('Nouvelle tâche').fill(title);
    await alice.keyboard.press('Enter');
    await expect(alice.getByRole('link', { name: `Ouvrir la tâche ${title}` })).toBeVisible();
  }
  await expectAccessible(alice);

  await alice.getByRole('link', { name: 'Ouvrir la tâche Trouver les décors' }).click();
  const panel = alice.getByRole('dialog');
  await panel.getByLabel('Assignée à').selectOption({ label: 'Bob' });
  await panel.getByLabel('Priorité').selectOption('urgent');
  await panel.getByLabel('Écrire un commentaire').fill('Repérages samedi ?');
  await panel.getByRole('button', { name: 'Commenter' }).click();
  await expect(panel.getByText('Repérages samedi ?')).toBeVisible();
  await expectAccessible(alice);
  await alice.keyboard.press('Escape');
  await expect(alice).not.toHaveURL(/\/t\//);

  await bob.getByRole('link', { name: 'Mes tâches', exact: true }).click();
  await expect(bob.getByRole('link', { name: 'Trouver les décors' })).toBeVisible();

  const projectPath = new URL(alice.url()).pathname;
  await alice.goto(`${projectPath}?view=board`);
  await bob.goto(`${projectPath}?view=board`);
  await expect(bob.getByText('Temps réel connecté')).toBeAttached();
  await expect(alice.getByText('Temps réel connecté')).toBeAttached();
  const bobInProgress = bob.getByRole('region', { name: 'En cours' });
  await expect(bobInProgress.getByText('Écrire le scénario')).toHaveCount(0);
  await alice.getByLabel('Colonne de Écrire le scénario').selectOption({ label: 'En cours' });
  await expect(
    alice.getByRole('region', { name: 'En cours' }).getByText('Écrire le scénario'),
  ).toBeVisible();
  await expect(bobInProgress.getByText('Écrire le scénario')).toBeVisible();

  await drag(
    alice,
    alice.getByRole('listitem').filter({ hasText: 'Monter le film' }),
    alice.getByRole('region', { name: 'Terminé' }),
  );
  await expect(
    alice.getByRole('region', { name: 'Terminé' }).getByText('Monter le film'),
  ).toBeVisible();
  await expect(
    bob.getByRole('region', { name: 'Terminé' }).getByText('Monter le film'),
  ).toBeVisible();
  await expectAccessible(alice);

  await alice.getByRole('button', { name: 'Nouveau canal' }).click();
  await alice.getByLabel('Nom du canal').fill('tournage');
  await alice.getByRole('button', { name: 'Créer le canal' }).click();
  await expect(alice.getByRole('heading', { name: 'tournage' })).toBeVisible();
  const bobChannelLink = bob.getByRole('navigation').getByRole('link', { name: 'tournage' });
  await expect(bobChannelLink).toBeVisible();

  await alice.getByLabel('Message dans tournage').fill('On tourne samedi à 9 h 🎬');
  await alice.keyboard.press('Enter');
  await expect(alice.getByText('On tourne samedi à 9 h 🎬')).toBeVisible();
  await expect(bobChannelLink).toContainText('1');

  await bobChannelLink.click();
  await expect(bob.getByText('On tourne samedi à 9 h 🎬')).toBeVisible();
  await bob.getByLabel('Message dans tournage').fill('Parfait, j’apporte la caméra');
  await bob.getByRole('button', { name: 'Envoyer' }).click();
  await expect(alice.getByText('Parfait, j’apporte la caméra')).toBeVisible();
  await expectAccessible(alice);

  await bob.getByRole('button', { name: 'Nouveau canal' }).click();
  await bob.getByLabel('Nom du canal').fill('surprise');
  await bob.getByLabel('Canal privé').check();
  await bob.getByRole('button', { name: 'Créer le canal' }).click();
  await expect(bob.getByRole('heading', { name: 'surprise' })).toBeVisible();
  await expect(alice.getByRole('navigation').getByRole('link', { name: 'surprise' })).toHaveCount(
    0,
  );

  await alice.goto(workspacePath);
  await alice.getByRole('button', { name: 'Nouvelle équipe' }).click();
  await alice.getByLabel('Nom de l’équipe').fill('Image');
  await alice.getByRole('checkbox', { name: /Bob/ }).check();
  await alice.getByRole('button', { name: 'Créer l’équipe' }).click();
  await expect(alice.getByRole('heading', { name: 'Image', level: 1 })).toBeVisible();
  await expect(
    alice.getByRole('main').getByRole('listitem').filter({ hasText: 'Bob' }),
  ).toBeVisible();
  await expect(bob.getByRole('navigation').getByRole('link', { name: /Image/ })).toBeVisible();
  await expectAccessible(alice);
});
