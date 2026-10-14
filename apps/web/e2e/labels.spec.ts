import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('tags colorés de projet, création de tâche complète et Kanban', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/register');
  await page.getByLabel('Votre nom').fill('Léa');
  await page.getByLabel('Adresse e-mail').fill(`lea.${Date.now()}@example.org`);
  await page.getByLabel('Mot de passe').fill('phrase de passe solide');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await page.getByLabel('Nom du workspace').fill('Agence');
  await page.getByRole('button', { name: 'Créer le workspace' }).click();
  await page.getByRole('button', { name: 'Nouveau projet' }).first().click();
  await page.getByLabel('Nom du projet').fill('Site client');
  await page.getByRole('button', { name: 'Créer le projet' }).click();
  await expect(page.getByRole('heading', { name: 'Site client', level: 1 })).toBeVisible();

  await page.getByRole('button', { name: 'Tags' }).click();
  const manager = page.getByRole('dialog', { name: 'Gérer les tags' });
  await manager.getByLabel('Nom du tag').last().fill('Bug');
  await manager.getByRole('button', { name: 'Couleur #c62828' }).last().click();
  await manager.getByRole('button', { name: 'Créer le tag' }).click();
  await expect(manager.getByRole('textbox', { name: 'Nom du tag' }).first()).toHaveValue('Bug');
  await manager.getByLabel('Nom du tag').last().fill('Design');
  await manager.getByRole('button', { name: 'Couleur #1565c0' }).last().click();
  await manager.getByRole('button', { name: 'Créer le tag' }).click();
  await expect(manager.getByRole('textbox', { name: 'Nom du tag' })).toHaveCount(3);
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(accessibility.violations.map((v) => v.id)).toEqual([]);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Nouvelle tâche' }).click();
  const form = page.getByRole('dialog', { name: 'Nouvelle tâche' });
  await form.getByLabel('Titre').fill('Corriger le menu mobile');
  await form.getByLabel('Priorité').selectOption('high');
  await form.getByRole('checkbox', { name: 'Bug' }).check();
  await form.getByRole('button', { name: 'Créer la tâche' }).click();
  await expect(page.getByText('Tâche créée.')).toBeVisible();

  await page.getByRole('tab', { name: 'Kanban' }).click();
  const todo = page.getByRole('region', { name: 'À faire' });
  const card = todo.getByRole('listitem').filter({ hasText: 'Corriger le menu mobile' });
  await expect(card.getByText('Bug', { exact: true })).toHaveCSS(
    'background-color',
    'rgb(198, 40, 40)',
  );

  await page.getByRole('button', { name: 'Ajouter une tâche dans En cours' }).click();
  const columnForm = page.getByRole('dialog', { name: 'Nouvelle tâche dans « En cours »' });
  await columnForm.getByLabel('Titre').fill('Maquette de l’accueil');
  await columnForm.getByRole('checkbox', { name: 'Design' }).check();
  await columnForm.getByRole('button', { name: 'Créer la tâche' }).click();
  const inProgress = page.getByRole('region', { name: 'En cours' });
  await expect(inProgress.getByText('Maquette de l’accueil')).toBeVisible();
  await expect(inProgress.getByText('Design', { exact: true })).toBeVisible();

  await page.getByLabel('Tags', { exact: true }).selectOption({ label: 'Design' });
  await expect(page.getByText('Corriger le menu mobile')).toHaveCount(0);
  await expect(inProgress.getByText('Maquette de l’accueil')).toBeVisible();

  const board = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(
    board.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);
});
