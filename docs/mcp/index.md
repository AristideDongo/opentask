# MCP et assistants IA

Le [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) est un protocole ouvert qui permet à un assistant IA d’appeler des outils. Le serveur MCP d’OpenTask expose une sélection d’opérations — consulter des projets et des tâches, en créer, en modifier, commenter — **avec les permissions de l’utilisateur qui l’a configuré**.

## Architecture

```text
Assistant IA (Claude Code…)
   │  MCP : stdio ou HTTP
   ▼
Serveur MCP (apps/mcp)
   │  HTTPS + jeton d’API
   ▼
API OpenTask : rôles, permissions, isolation
   │
   ▼
PostgreSQL
```

- Le serveur MCP est un **adaptateur de l’API REST** : il n’accède jamais directement à la base. Chaque appel d’outil devient une requête à l’API avec votre [jeton d’API](../user/api-tokens.md), qui applique rôles, permissions et isolation des workspaces.
- Il est construit avec le SDK TypeScript officiel (`@modelcontextprotocol/sdk` 1.32.1).
- Aucun outil de suppression n’est exposé ([ADR 0011](../decisions/0011-serveur-mcp-et-jetons-api.md)).

## Deux transports

| Transport       | Où tourne le serveur                     | Pour                                   | Authentification                                       |
| --------------- | ---------------------------------------- | -------------------------------------- | ------------------------------------------------------ |
| `stdio`         | Sur votre poste, lancé par le client MCP | Claude Code ; instance privée possible | Variable `OPENTASK_TOKEN`                              |
| Streamable HTTP | Sur le serveur, à l’adresse `/mcp`       | Clients distants                       | En-tête `Authorization: Bearer otk_…` à chaque requête |

Le serveur HTTP fonctionne **sans session** : chaque requête est authentifiée et traitée indépendamment, sans état partagé entre utilisateurs. HTTPS est obligatoire en production.

## Compatibilité testée

| Client                                      | Mode                     | État                                                                                                                   |
| ------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Client MCP officiel (SDK TypeScript 1.32.1) | stdio et HTTP            | Testé automatiquement (découverte, lecture, écriture, erreurs) — 15 octobre 2026                                       |
| Claude Code                                 | stdio, HTTP avec en-tête | Configuration conforme à la [documentation de Claude Code](https://code.claude.com/docs/en/mcp) ; [guide](./claude.md) |
| Claude Desktop                              | —                        | Non testé                                                                                                              |
| ChatGPT                                     | HTTP distant             | **Pas encore pris en charge** : exige OAuth ([détails](./chatgpt.md))                                                  |

## Déploiement {#deploiement}

Avec Docker Compose, le serveur MCP est un service optionnel, servi à l’adresse `https://<votre-domaine>/mcp` :

```sh
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod --profile mcp up -d --build
```

| Variable                    | Défaut                  | Rôle                                                                                                                               |
| --------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `MCP_ALLOW_WRITE`           | `true`                  | `false` n’expose que les outils de lecture.                                                                                        |
| `MCP_ALLOWED_ORIGINS`       | vide                    | Origines navigateur autorisées ; toute autre requête portant un en-tête `Origin` est refusée (protection contre le DNS rebinding). |
| `MCP_RATE_LIMIT_PER_MINUTE` | `120`                   | Requêtes par minute et par jeton.                                                                                                  |
| `OPENTASK_API_URL`          | `http://localhost:4000` | Adresse de l’API vue depuis le serveur MCP (`http://api:4000` dans Docker Compose).                                                |
| `MCP_PORT`                  | `4100`                  | Port d’écoute.                                                                                                                     |

En développement : `pnpm --filter @opentask/mcp dev` (avec `OPENTASK_API_URL=http://localhost:4000`).

## Voir aussi

- [Connecter Claude](./claude.md) · [ChatGPT](./chatgpt.md) · [Outils disponibles](./tools.md) · [Sécurité et confidentialité](./security.md) · [Dépannage](./troubleshooting.md)
