# 0009 — Arborescence par domaines (API) et par features (interface), packages database et auth

**Statut : acceptée** — remplace l’arborescence décrite dans [0002](0002-architecture-en-couches.md).

## Contexte

Les packages `domain` et `application` séparaient règles et cas d’usage de l’API, mais imposaient des ports et des dépôts en mémoire sans bénéfice concret pour une seule implémentation. L’équipe a adopté des conventions d’arborescence explicites pour l’API (domaines) et l’interface (features), et veut isoler tout ce qui touche à Prisma et à better-auth dans des packages dédiés.

## Décision

```text
packages/contracts   schémas Zod, registre des routes, OpenAPI, décisions de permission partagées
packages/database    schéma Prisma, migrations, client généré, classe Database (transactions)
packages/auth        configuration better-auth, hachage Argon2id, handler HTTP et lecture de session
apps/api/src
  domains/<domaine>/       repository/, use-cases/, mappers/, helpers/, types/, errors/, *.const.ts, *.module.ts
  infrastructures/         adaptateurs NestJS de database, auth, mail, temps réel, logs
  presentations/<feature>/ contrôleurs HTTP et module
  shared/                  configuration, erreurs, filtres, gardes, pipes, utilitaires
apps/web/src
  features/<feature>/      components/, hooks/, mappers/, servers/ (*.service, *.loader, *.actions),
                           *.validators.ts, *.types.ts, *.const.ts, index.tsx (module de route)
  shared/                  components/, hooks/, mappers/, servers/, types/, constants/, utils/
```

- Un cas d’usage par classe ; un cas d’usage n’en appelle jamais un autre. Les dépôts sont des classes concrètes qui utilisent `PrismaService` et traduisent les erreurs Prisma (`P2002`) en erreurs de domaine.
- Les règles pures (helpers) sont synchrones et reçoivent des « faits » lus au préalable par le dépôt.
- `packages/database` et `packages/auth` ne dépendent d’aucun framework HTTP ; l’API les enveloppe dans `infrastructures/` (`PrismaService extends Database`, `AuthService`).
- Côté interface, aucun `fetch` hors de `servers/` (ESLint l’impose) ; les composants reçoivent des ViewModels produits par des mappers.
- Les contrats sont importés fichier par fichier (`@opentask/contracts/tasks/task`), jamais par un index global.
- Pas de commentaires dans le code : les noms portent l’intention ; la documentation vit dans `docs/`.

## Conséquences

- Les tests en mémoire des cas d’usage sont remplacés par des tests unitaires des helpers et des mappers, et par les tests d’intégration de l’API sur PostgreSQL.
- L’image Docker de l’API embarque `packages/database` pour appliquer les migrations au démarrage.
