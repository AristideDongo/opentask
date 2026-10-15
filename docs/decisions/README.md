# Décisions d’architecture (ADR)

Chaque décision importante est consignée ici : contexte, décision, conséquences. Une décision « Proposée » attend une validation explicite des responsables du projet.

| N°                                             | Décision                                                        | Statut    |
| ---------------------------------------------- | --------------------------------------------------------------- | --------- |
| [0001](0001-licence-agpl.md)                   | Licence AGPL-3.0-only                                           | Proposée  |
| [0002](0002-architecture-en-couches.md)        | Monorepo, DDD léger et couches                                  | Remplacée |
| [0003](0003-authentification.md)               | Authentification par better-auth, sessions par cookie           | Acceptée  |
| [0004](0004-interface-spa.md)                  | Interface monopage servie sur la même origine que l’API         | Acceptée  |
| [0005](0005-pas-de-worker-au-mvp.md)           | Pas de Redis ni de worker tant que le besoin n’est pas avéré    | Acceptée  |
| [0006](0006-roles-et-isolation.md)             | Rôles, propriétaire unique et isolation des workspaces          | Acceptée  |
| [0007](0007-hierarchie-projets.md)             | Hiérarchie Workspace → Projet → Liste → Tâche                   | Proposée  |
| [0008](0008-temps-reel-sse.md)                 | Temps réel par Server-Sent Events                               | Acceptée  |
| [0009](0009-structure-features-et-domaines.md) | Domaines (API), features (interface), packages database et auth | Acceptée  |
| [0010](0010-composants-shadcn.md)              | Composants d’interface partagés : shadcn/ui dans `packages/ui`  | Acceptée  |
| [0011](0011-serveur-mcp-et-jetons-api.md)      | Serveur MCP et jetons d’API personnels                          | Acceptée  |
