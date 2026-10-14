import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('colonnes du Kanban : ajouter, renommer par double-clic, déplacer une carte, supprimer', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('/register');
  await page.getByLabel('Votre nom').fill('Noé');
  await page.getByLabel('Adresse e-mail').fill(`noe.${Date.now()}@example.org`);
  await page.getByLabel('Mot de passe').fill('phrase de passe solide');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await page.getByLabel('Nom du workspace').fill('Atelier');
  await page.getByRole('button', { name: 'Créer le workspace' }).click();
  await page.getByRole('button', { name: 'Nouveau projet' }).first().click();
  await page.getByLabel('Nom du projet').fill('Refonte');
  await page.getByRole('button', { name: 'Créer le projet' }).click();
  await page.getByLabel('Nouvelle tâche').fill('Préparer la démo');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Ouvrir la tâche Préparer la démo' })).toBeVisible();
  await page.getByRole('tab', { name: 'Kanban' }).click();

  await page.getByRole('button', { name: 'Ajouter une colonne' }).click();
  await page.getByLabel('Nom de la colonne').fill('Tests QA');
  await page.keyboard.press('Enter');
  const qa = page.getByRole('region', { name: 'Tests QA' });
  await expect(qa).toBeVisible();

  await page.getByRole('region', { name: 'À faire' }).getByRole('heading').dblclick();
  const input = page.getByLabel('Nom de la colonne');
  await expect(input).toBeFocused();
  await input.fill('Backlog');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Backlog' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'À faire' })).toHaveCount(0);

  await page.getByRole('region', { name: 'En revue' }).getByRole('heading').dblclick();
  await page.getByLabel('Nom de la colonne').fill('Ne pas garder');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('region', { name: 'En revue' })).toBeVisible();

  await page.getByLabel('Colonne de Préparer la démo').selectOption({ label: 'Tests QA' });
  await expect(qa.getByText('Préparer la démo')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('region', { name: 'Backlog' })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Tests QA' }).getByText('Préparer la démo'),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(
    results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);

  await page.getByRole('button', { name: 'Actions de la colonne Tests QA' }).click();
  await page.getByRole('menuitem', { name: 'Supprimer la colonne' }).click();
  const dialog = page.getByRole('dialog', { name: 'Supprimer la colonne « Tests QA » ?' });
  await dialog.getByLabel('Ses 1 tâche(s) iront dans :').selectOption({ label: 'Terminé' });
  await dialog.getByRole('button', { name: 'Supprimer la colonne' }).click();
  await expect(page.getByRole('region', { name: 'Tests QA' })).toHaveCount(0);
  await expect(
    page.getByRole('region', { name: 'Terminé' }).getByText('Préparer la démo'),
  ).toBeVisible();
  await expect(page.getByText('1 / 1 terminée(s)')).toBeVisible();
});
