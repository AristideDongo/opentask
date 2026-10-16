import AxeBuilder from '@axe-core/playwright';
import { type Page, expect, test } from '@playwright/test';

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

test('la page d’accueil présente OpenTask et mène à la connexion et à l’inscription', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Le travail d’équipe, sans abonnement imposé.' }),
  ).toBeVisible();
  await expectAccessible(page);

  const header = page.getByRole('banner');
  await header.getByRole('link', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/');
  await page.getByRole('link', { name: 'Créer un compte gratuit' }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test('la documentation est consultable et recherchable, guide MCP compris', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('banner').getByRole('link', { name: 'Documentation' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Tout pour utiliser/ })).toBeVisible();

  const sidebar = page
    .getByRole('complementary')
    .getByRole('navigation', { name: 'Documentation' });
  await sidebar.getByRole('link', { name: 'Connecter Claude Code' }).click();
  await expect(page).toHaveURL(/\/docs\/mcp\/claude$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Connecter Claude Code' }),
  ).toBeVisible();
  await expect(sidebar.getByRole('link', { name: 'Connecter Claude Code' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByText('claude mcp add --transport http')).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('link', { name: 'jeton d’API', exact: true }).first().click();
  await expect(page).toHaveURL(/\/docs\/user\/api-tokens$/);

  await page.getByRole('button', { name: 'Rechercher' }).click();
  const search = page.getByRole('dialog', { name: 'Rechercher dans la documentation' });
  await search.getByRole('textbox').fill('révoquer jeton');
  await search.getByRole('link', { name: /Jetons d’API/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Jetons d’API' })).toBeVisible();
});

test('une page de documentation inconnue affiche une page introuvable', async ({ page }) => {
  await page.goto('/docs/nexiste/pas');
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
  await page.getByRole('link', { name: 'Retour à la documentation' }).click();
  await expect(page).toHaveURL(/\/docs$/);
});

test('une personne connectée retrouve l’application depuis la page d’accueil', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Votre nom').fill('Lina');
  await page.getByLabel('Adresse e-mail').fill(`lina.${Date.now()}@example.org`);
  await page.getByLabel('Mot de passe').fill('phrase de passe solide');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page.getByRole('heading', { name: 'Créez votre premier workspace' })).toBeVisible();

  await page.goto('/');
  await page.getByRole('banner').getByRole('link', { name: 'Ouvrir l’application' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
});
