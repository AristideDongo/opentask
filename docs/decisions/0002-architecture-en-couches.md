# 0002 — Monorepo, DDD léger et couches

**Statut : remplacée** par [0009](0009-structure-features-et-domaines.md) pour l’arborescence.

## Contexte

L’interface et l’API doivent partager leurs contrats ; les règles de permission doivent être testables isolément et ne pas dépendre d’un framework ; la spécification demande une Clean Architecture « là où elle apporte une séparation utile », sans sur-ingénierie.

## Décision

```text
packages/domain       règles pures : rôles, permissions, invariants (aucune dépendance)
packages/application  cas d’usage + ports (interfaces de dépôts, horloge, jetons, e-mail)
packages/contracts    schémas Zod publics, registre des routes, génération OpenAPI
apps/api              NestJS (HTTP) + adaptateurs : Prisma, better-auth, SMTP
apps/web              React Router en mode SPA
```

- Les packages internes sont consommés **en source TypeScript** (pas de build intermédiaire). L’API est empaquetée par tsup, qui inclut les packages `@opentask/*` dans le bundle ; Vite fait de même pour l’interface.
- Les dépendances de l’API sont **câblées explicitement** dans `apps/api/src/app.ts` (fabriques et `@Inject`), sans recours aux métadonnées de types émises par le compilateur. Le code fonctionne ainsi à l’identique sous tsx, Vitest et tsup (esbuild).
- `Persistence.transaction(work)` fournit des dépôts liés à une transaction : chaque cas d’usage qui écrit plusieurs entités et son entrée d’audit le fait atomiquement.
- ESLint interdit tout import de framework dans `domain`, `application` et `contracts`.
- Les contrôles d’accès passent par `requireMembership()` (application) puis les fonctions de `domain/permissions`. L’interface réutilise ces mêmes fonctions pour afficher ou masquer des actions, mais seule l’API fait foi.

## Conséquences

- Les cas d’usage sont testés en mémoire (`@opentask/application/testing`), rapidement, et les adaptateurs Prisma par des tests d’intégration sur PostgreSQL.
- Ajouter un module (projets, tâches) suit le même chemin : contrat → règle de domaine → cas d’usage → dépôt Prisma → contrôleur → test d’isolation.
