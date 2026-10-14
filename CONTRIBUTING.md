# Contribuer à OpenTask

Merci de votre intérêt ! Ce guide explique comment installer le projet, les conventions et ce qu’on attend d’une pull request.

## Installer l’environnement

```sh
cp .env.example .env     # remplacez AUTH_SECRET
pnpm install
pnpm db:up && pnpm db:migrate
pnpm dev
```

Les tests d’intégration utilisent la base `opentask_test`, et les tests E2E la base `opentask_e2e`. Les deux sont créées automatiquement par `docker-compose.yml` au premier démarrage du volume PostgreSQL. Si votre volume existait déjà :

```sh
docker compose exec postgres psql -U opentask -c 'CREATE DATABASE opentask_test' -c 'CREATE DATABASE opentask_e2e'
```

Pour les tests E2E : `pnpm --filter @opentask/web exec playwright install chromium`, puis `pnpm test:e2e`.

## Règles d’architecture

Voir l’[ADR 0009](docs/decisions/0009-structure-features-et-domaines.md) pour l’arborescence complète.

- **Les contrats Zod (`packages/contracts`) sont la source de vérité** des entrées et sorties. Toute nouvelle route y est déclarée (registre `api/routes.ts`) : un test vérifie qu’elle existe et qu’elle applique la bonne authentification. Importez un fichier précis (`@opentask/contracts/tasks/task`), jamais la racine du package.
- **Prisma vit dans `packages/database`, better-auth dans `packages/auth`.** L’API les enveloppe dans `apps/api/src/infrastructures/`.
- **API** : un domaine par dossier dans `apps/api/src/domains/` (`repository/`, `use-cases/`, `mappers/`, `helpers/`, `types/`, `errors/`). Une classe par cas d’usage ; un cas d’usage n’en appelle jamais un autre. Les contrôleurs vivent dans `presentations/` ; `domains/`, `infrastructures/` et `shared/` n’importent jamais `presentations/`.
- **Interface** : une feature par dossier dans `apps/web/src/features/` (`components/`, `hooks/`, `mappers/`, `servers/`, `index.tsx`). Aucun `fetch` hors de `servers/` ; les composants reçoivent des ViewModels produits par des mappers. Composants en kebab-case, hooks en `useXxx.ts`.
- **Les permissions sont vérifiées dans les cas d’usage**, jamais seulement dans l’interface. Un utilisateur sans accès à un workspace reçoit `404`, jamais `403`.
- **Les opérations qui modifient plusieurs entités passent par `prisma.transaction()`** ; les opérations d’administration sont auditées.
- **Pas de commentaires dans le code** : nommez plutôt que commenter.

## Nouvelle dépendance

Expliquez dans la PR son utilité et sa licence (compatible AGPL-3.0). Épinglez une version exacte publiée depuis plus de quelques jours : pnpm refuse les versions trop récentes (protection de la chaîne d’approvisionnement), et les scripts d’installation doivent être autorisés explicitement dans `pnpm-workspace.yaml`.

## Avant d’ouvrir une pull request

```sh
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm openapi   # si vous avez modifié des contrats ; commitez docs/api/openapi.json
```

- Ajoutez les tests pertinents : helpers et mappers (`*.spec.ts`), routes (intégration avec PostgreSQL), parcours (Playwright).
- Toute route d’un workspace doit avoir un test d’isolation (`apps/api/test/isolation.test.ts`).
- Mettez à jour la documentation, `.env.example` et `CHANGELOG.md` si nécessaire.
- Un changement d’architecture important s’accompagne d’un ADR dans `docs/decisions/`.
- Textes d’interface : français et anglais (`apps/web/src/shared/constants/messages/` ; le typage refuse une clé manquante).

## Messages de commit

Format conseillé : `type(portée): description` — par exemple `feat(api): pagination du journal d’audit`, `fix(web): alignement du formulaire d’invitation`.

## Signaler un bug ou proposer une fonctionnalité

Ouvrez une issue avec les étapes de reproduction, le comportement attendu et observé, et la version.
