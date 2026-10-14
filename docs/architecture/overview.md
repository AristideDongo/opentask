# Vue d’ensemble de l’architecture

## Composants

```text
Navigateur ──► nginx (conteneur web) ──► fichiers statiques de la SPA
                     │
                     └── /api/* ──► API NestJS (conteneur api) ──► PostgreSQL
                                        │
                                        └── SMTP (optionnel)
```

En développement, Vite joue le rôle de nginx et relaie `/api` vers `localhost:4000`.

## Chemin d’une requête

```text
SPA (formulaire validé par le schéma Zod partagé)
  → nginx /api/v1/...
  → Express : pino-http (identifiant de requête, logs) → helmet → contrôle d’origine (CSRF) → JSON
  → NestJS : ThrottlerGuard → SessionGuard (better-auth) → contrôleur
  → ZodPipe (contrat partagé)        validation et nettoyage des entrées
  → cas d’usage (apps/api/src/domains/<domaine>/use-cases)
       assertIsMember()              404 si l’utilisateur n’est pas membre
       assertCan…() (helpers)        403 si le rôle ne suffit pas (décisions de packages/contracts)
       prisma.transaction(...)       écritures + entrée d’audit, atomiques
  → dépôts (domains/<domaine>/repository) sur packages/database
  → mapper → schéma de réponse Zod (contrat vérifié à chaque réponse)
  → ApiErrorFilter : { error: { code, message, details?, requestId } }
```

## Modèle de données

| Table                                            | Rôle                                                                                   |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `users`, `sessions`, `accounts`, `verifications` | Identité (better-auth). `users` porte aussi `locale` et `timezone`.                    |
| `workspaces`                                     | Workspace (nom, dates).                                                                |
| `workspace_members`                              | Appartenance et rôle ; clé primaire `(workspace_id, user_id)`.                         |
| `invitations`                                    | Invitation par e-mail : rôle, hachage du jeton, expiration, acceptation ou révocation. |
| `audit_logs`                                     | Journal des opérations d’administration (acteur, action, cible, métadonnées).          |

Règles : identifiants UUID v7 pour les entités OpenTask (triables par date), clés étrangères avec `ON DELETE CASCADE` depuis le workspace, `SET NULL` pour les auteurs supprimés, index sur les clés étrangères et sur `(workspace_id, created_at, id)` pour la pagination du journal. La suppression d’un workspace est définitive ; il n’y a pas encore d’archivage.

Le schéma est dans `packages/database/prisma/schema.prisma` et les migrations SQL versionnées dans `packages/database/prisma/migrations`.

## Erreurs

| Code                 | HTTP | Cas                                                                         |
| -------------------- | ---- | --------------------------------------------------------------------------- |
| `VALIDATION_FAILED`  | 400  | Entrée invalide (`details` : chemin et message par champ), JSON illisible   |
| `UNAUTHENTICATED`    | 401  | Session absente ou expirée                                                  |
| `FORBIDDEN`          | 403  | Rôle insuffisant, ou origine de requête refusée                             |
| `NOT_FOUND`          | 404  | Ressource inexistante **ou** inaccessible                                   |
| `CONFLICT`           | 409  | Déjà membre, invitation plus en attente, doublon                            |
| `INVITATION_INVALID` | 410  | Lien d’invitation inconnu, expiré, révoqué, déjà utilisé, ou mauvais compte |
| `RATE_LIMITED`       | 429  | Trop de requêtes                                                            |
| `INTERNAL_ERROR`     | 500  | Erreur inattendue (journalisée avec l’identifiant de requête)               |

Les routes `/api/v1/auth/*` (better-auth) renvoient leur propre format `{ code, message }`.

## Observabilité

- Logs JSON sur stdout (pino), un événement par requête avec identifiant (`x-request-id`, repris de nginx). Les cookies, en-têtes d’autorisation et jetons présents dans les URL sont masqués.
- `GET /api/v1/health` : vivacité du processus. `GET /api/v1/health/ready` : disponibilité de la base (503 sinon). Utilisés par les health checks Docker.

## Tests

| Niveau                                     | Où                                          | Base            |
| ------------------------------------------ | ------------------------------------------- | --------------- |
| Contrats et permissions                    | `packages/contracts/src/**/*.spec.ts`       | —               |
| Helpers de domaine                         | `apps/api/src/**/*.spec.ts`                 | —               |
| Mappers et utilitaires de l’interface      | `apps/web/src/**/*.spec.ts`                 | —               |
| API, permissions, isolation, sécurité HTTP | `apps/api/test/*.test.ts` (supertest)       | `opentask_test` |
| Parcours utilisateur et accessibilité      | `apps/web/e2e/*.spec.ts` (Playwright + axe) | `opentask_e2e`  |
| Restauration de sauvegarde                 | `infra/scripts/verify-restore.sh`           | base courante   |
