# Qu’est-ce qu’OpenTask ?

OpenTask est une plateforme open source de gestion du travail d’équipe : workspaces, membres et rôles, projets et tâches, vues Liste et Kanban, commentaires, équipes et discussion en temps réel. Elle s’installe sur votre propre serveur avec Docker Compose et stocke tout dans PostgreSQL.

## Principes

- **Gratuit, sans quota artificiel** : aucune limite de projets, de tâches ou de membres. Licence [AGPL-3.0-only](https://github.com/AristideDongo/opentask/blob/main/LICENSE).
- **Auto-hébergeable** : aucun service propriétaire obligatoire ; vos données restent dans votre base.
- **Permissions vérifiées par le serveur** : l’interface, l’API et le serveur MCP appliquent exactement les mêmes règles.
- **Ouvert aux outils** : API REST documentée (OpenAPI), jetons d’API personnels, serveur MCP.

## Ce qui est disponible

| Fonctionnalité                                     | État             |
| -------------------------------------------------- | ---------------- |
| Comptes, workspaces, rôles, invitations, audit     | Disponible       |
| Projets, tâches, sous-tâches, commentaires         | Disponible       |
| Vues Liste et Kanban, colonnes et tags par projet  | Disponible       |
| Équipes, discussion en temps réel (canaux)         | Disponible       |
| API REST, jetons d’API                             | Disponible       |
| Serveur MCP (Claude Code : stdio et HTTP)          | Disponible       |
| Serveur MCP pour ChatGPT (OAuth requis)            | En développement |
| Notifications, export, recherche globale, webhooks | Prévu            |

Le détail figure dans [l’état du MVP](../product/mvp-status.md), les [limites connues](../product/known-limitations.md) et la [feuille de route](../product/roadmap.md).

## Prérequis

- **Pour utiliser OpenTask** : un navigateur récent et un compte sur une instance.
- **Pour l’héberger** : un serveur Linux avec Docker et Docker Compose v2 (voir [l’installation](../deployment/installation.md)).
- **Pour contribuer** : Node.js 24, pnpm 12 et Docker (voir [contribuer](../developers/contributing.md)).

## Liens

- Dépôt : [github.com/AristideDongo/opentask](https://github.com/AristideDongo/opentask)
- Signaler un bug ou proposer une idée : [issues GitHub](https://github.com/AristideDongo/opentask/issues)
- Journal des modifications : [CHANGELOG](https://github.com/AristideDongo/opentask/blob/main/CHANGELOG.md)
