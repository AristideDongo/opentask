# OpenTask

OpenTask est une plateforme open source de gestion du travail d’équipe, réellement gratuite et auto-hébergeable : workspaces, membres, rôles et invitations aujourd’hui ; projets, tâches, vues Liste/Kanban, commentaires et notifications ensuite.

- **Gratuit, sans quota artificiel** : aucune limite de projets, de tâches ou de membres.
- **Auto-hébergeable** : une installation Docker Compose, sans service propriétaire obligatoire.
- **Vos données restent à vous** : schéma documenté, sauvegardes PostgreSQL standard, export prévu au MVP.
- **Sécurité de base incluse** : permissions vérifiées côté serveur, isolation stricte des workspaces, journal d’audit.

> **État du projet : pré-version (0.1.0).** La fondation technique, l’authentification, les workspaces et les permissions sont livrés et testés. La gestion des tâches est la prochaine étape. Voir [l’état du MVP](docs/product/mvp-status.md) et les [limites connues](docs/product/known-limitations.md).

## Démarrage rapide (développement)

Prérequis : Node.js 24, pnpm 12 (`corepack enable` ou `npm i -g pnpm@12`), Docker.

```sh
cp .env.example .env            # puis remplacez AUTH_SECRET : openssl rand -base64 48
pnpm install
pnpm db:up                      # PostgreSQL + Mailpit (e-mails : http://localhost:8025)
pnpm db:migrate
pnpm dev                        # API : http://localhost:4000 · Interface : http://localhost:5173
```

Ouvrez http://localhost:5173, créez un compte puis un workspace.

## Installation en production

Voir [docs/deployment/installation.md](docs/deployment/installation.md). En résumé :

```sh
cp infra/docker/.env.prod.example infra/docker/.env.prod   # renseignez secrets, URL, SMTP
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up -d --build
```

Sauvegarde et restauration : [docs/deployment/backup-restore.md](docs/deployment/backup-restore.md).

## Commandes

| Commande                           | Rôle                                                        |
| ---------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                         | API et interface en mode développement                      |
| `pnpm lint` / `pnpm typecheck`     | ESLint et TypeScript sur tout le monorepo                   |
| `pnpm test`                        | Tests unitaires et intégration API (PostgreSQL requis)      |
| `pnpm test:e2e`                    | Parcours Playwright avec contrôles d’accessibilité axe      |
| `pnpm build`                       | Build de production (bundle API, SPA statique)              |
| `pnpm openapi`                     | Régénère `docs/api/openapi.json` depuis les contrats        |
| `pnpm --filter @opentask/docs dev` | Site de documentation (VitePress) sur http://localhost:5190 |

## Architecture

```text
apps/api            API NestJS : domains/, infrastructures/, presentations/, shared/
apps/web            Interface React Router (SPA) : features/ et shared/, Tailwind, Radix
packages/contracts  Schémas Zod partagés : entrées/sorties, permissions, OpenAPI
packages/database   Prisma : schéma, migrations, client, transactions
packages/auth       better-auth : configuration, Argon2id, sessions
packages/ui         Composants shadcn/ui partagés et thème OpenTask
infra/              Dockerfiles, compose de production, scripts de sauvegarde
apps/docs           Site de documentation (VitePress, source dans docs/)
docs/               Guides, architecture, décisions (ADR), déploiement, sécurité, produit
```

Détails : [docs/architecture/overview.md](docs/architecture/overview.md) et [décisions d’architecture](docs/decisions/).

## Contribuer

Les contributions sont bienvenues : lisez [CONTRIBUTING.md](CONTRIBUTING.md) et le [code de conduite](CODE_OF_CONDUCT.md). Bugs, idées et questions de sécurité : ouvrez une issue.

## Licence

[AGPL-3.0-only](LICENSE). Si vous proposez une version modifiée d’OpenTask comme service réseau, vous devez en rendre le code source disponible à ses utilisateurs (variable `SOURCE_URL`, voir la documentation d’installation).
