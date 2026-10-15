# Contribuer

Le guide complet est dans [CONTRIBUTING.md](https://github.com/AristideDongo/opentask/blob/main/CONTRIBUTING.md). L’essentiel :

## Environnement

```sh
cp .env.example .env
pnpm install
pnpm db:up && pnpm db:migrate
pnpm dev
```

## Vérifications avant une pull request

```sh
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm openapi   # si vous avez modifié des contrats ; commitez docs/api/openapi.json
pnpm test:e2e  # parcours Playwright
```

La branche `main` est protégée : toute modification passe par une pull request dont la CI est verte.

## Organisation du code

| Dossier              | Contenu                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| `packages/contracts` | Schémas Zod partagés, registre des routes, OpenAPI, décisions de permission |
| `packages/database`  | Prisma : schéma, migrations, client                                         |
| `packages/auth`      | better-auth : configuration, Argon2id, sessions                             |
| `packages/ui`        | Composants shadcn/ui partagés                                               |
| `apps/api`           | API NestJS : `domains/`, `infrastructures/`, `presentations/`, `shared/`    |
| `apps/web`           | Interface React Router : `features/`, `shared/`                             |
| `apps/mcp`           | Serveur MCP                                                                 |
| `apps/site`          | Site public                                                                 |
| `apps/docs`          | Cette documentation (VitePress, source dans `docs/`)                        |

Les règles d’architecture sont décrites dans [l’ADR 0009](../decisions/0009-structure-features-et-domaines.md).

## Ajouter un outil MCP {#ajouter-un-outil-mcp}

1. Vérifiez que l’opération existe dans l’API et qu’elle est testée : le serveur MCP n’ajoute jamais de logique métier.
2. Créez `apps/mcp/src/tools/read/<nom>.tool.ts` ou `tools/write/<nom>.tool.ts` avec `defineTool` : nom stable préfixé `opentask_`, description qui annonce les effets de bord, schéma d’entrée construit à partir des contrats Zod, appel de l’API via le client fourni.
3. Enregistrez-le dans `apps/mcp/src/tools/index.ts`.
4. Ajoutez des tests dans `apps/mcp/test/` : cas nominal, entrée invalide, accès à un autre workspace, permission insuffisante.
5. Documentez-le dans [la liste des outils](../mcp/tools.md).

## Documentation

La documentation est écrite en Markdown dans `docs/` et publiée avec VitePress :

```sh
pnpm --filter @opentask/docs dev     # http://localhost:5190
pnpm --filter @opentask/docs build   # échoue si un lien interne est cassé
```

## Signaler une vulnérabilité

Ouvrez une [issue](https://github.com/AristideDongo/opentask/issues) en décrivant le problème sans publier de preuve d’exploitation détaillée ; les mainteneurs vous recontacteront.
