# 0011 — Serveur MCP et jetons d’API personnels

**Statut : acceptée**

## Contexte

Les utilisateurs veulent consulter et modifier leurs tâches depuis un assistant IA (Claude, ChatGPT) via le Model Context Protocol. Le serveur MCP ne doit jamais contourner les permissions d’OpenTask ni recevoir le mot de passe de l’utilisateur.

## Décision

- **Jetons d’API personnels** (`otk_…`) créés depuis la page Profil : rattachés à un utilisateur, permissions `read` et/ou `write`, durée de 30, 90 ou 365 jours, révocables, stockés uniquement sous forme de hachage SHA-256, au maximum 20 par utilisateur. Ils sont acceptés par l’API via `Authorization: Bearer`. `read` autorise `GET`, `write` toute modification. La gestion des jetons exige une session (`@SessionOnly`) : un jeton ne peut pas créer ni révoquer de jetons.
- **Serveur MCP dans `apps/mcp`**, construit avec le SDK TypeScript officiel (`@modelcontextprotocol/sdk` 1.32.1, MIT). C’est un **adaptateur de l’API REST** : chaque outil appelle une route existante avec le jeton de l’utilisateur. Il n’accède ni à Prisma ni à PostgreSQL ; permissions, rôles et isolation des workspaces restent appliqués par l’API.
- **Deux transports** : `stdio` (processus local lancé par le client, `OPENTASK_URL` + `OPENTASK_TOKEN`) et **Streamable HTTP sans session** (`POST /mcp`, jeton transmis par le client à chaque requête). Le mode sans session évite tout état partagé entre utilisateurs.
- **Outils** : 9 en lecture, 5 en écriture (créer, modifier, changer de colonne, assigner, commenter). Aucune suppression. Les écritures peuvent être désactivées (`MCP_ALLOW_WRITE=false`). Entrées validées par les schémas Zod des contrats ; listes paginées (25 par défaut, 100 au maximum) ; textes longs tronqués ; contenu saisi par les utilisateurs signalé comme donnée non fiable.
- **Défenses** : contrôle de l’en-tête `Origin` (protection contre le DNS rebinding), limitation de débit par jeton, corps limité à 256 Ko, journaux sur `stderr` sans jeton ni contenu, déploiement optionnel (profil Compose `mcp`).

## Limites connues

- **ChatGPT** : le mode développeur de ChatGPT n’accepte que des serveurs distants avec OAuth ou sans authentification. OpenTask ne fournit pas encore de serveur d’autorisation OAuth ; la piste retenue est `@better-auth/oauth-provider` (même version que better-auth). Tant que ce n’est pas fait, ChatGPT n’est pas pris en charge.
- **Claude** : la configuration `stdio` et HTTP avec en-tête `Authorization` correspond à la documentation de Claude Code ; les tests automatisés utilisent le client officiel du SDK, pas Claude Code lui-même.
- Les ressources MCP ne sont pas encore exposées ; trois prompts le sont (`opentask_weekly_review`, `opentask_project_status`, `opentask_overdue_tasks`).
