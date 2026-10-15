# Outils MCP

Tous les outils prennent les identifiants en paramètre (`workspaceId`, `projectId`, `taskId`) ; commencez par `opentask_list_workspaces`, puis `opentask_list_projects`. Les listes sont paginées : `limit` (25 par défaut, 100 au maximum) et `offset` ; la réponse indique `total` et `nextOffset`.

## Lecture

| Outil                          | Rôle                                                                                                                                | Route de l’API utilisée                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `opentask_get_current_user`    | Profil minimal de l’utilisateur du jeton (identifiant, nom, langue, fuseau horaire)                                                 | `GET /me`                                 |
| `opentask_list_workspaces`     | Workspaces accessibles et rôle dans chacun                                                                                          | `GET /workspaces`                         |
| `opentask_list_projects`       | Projets d’un workspace, avec colonnes, tags et compteurs                                                                            | `GET /workspaces/:id/projects`            |
| `opentask_list_tasks`          | Tâches d’un projet : filtres (statut, colonne, priorité, personne, tag, texte), tri, pagination                                     | `GET /workspaces/:id/projects/:pid/tasks` |
| `opentask_get_task`            | Détail d’une tâche (description tronquée à 2 000 caractères, sous-tâches)                                                           | `GET /workspaces/:id/tasks/:tid`          |
| `opentask_list_comments`       | Commentaires d’une tâche (1 000 caractères au plus chacun)                                                                          | `GET /workspaces/:id/tasks/:tid`          |
| `opentask_search`              | Projets par nom et tâches par titre dans un workspace (30 premiers projets parcourus ; le résultat signale une recherche partielle) | `GET …/projects`, `GET …/tasks?q=`        |
| `opentask_get_project_summary` | Résumé factuel : tâches par colonne, terminées, en retard, sans personne assignée, prochaines échéances                             | `GET …/projects/:pid`, `GET …/tasks`      |
| `opentask_list_my_tasks`       | Mes tâches ouvertes ; option `overdueOnly`                                                                                          | `GET /workspaces/:id/my-tasks`            |

## Écriture

Exigent un jeton avec la permission `write`, un rôle suffisant dans le workspace (membre ou plus), et `MCP_ALLOW_WRITE` différent de `false`.

| Outil                         | Effet                                                                                | Route de l’API utilisée                    |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| `opentask_create_task`        | Crée une tâche (ou une sous-tâche avec `parentId`)                                   | `POST /workspaces/:id/projects/:pid/tasks` |
| `opentask_update_task`        | Modifie titre, description, priorité ou échéance — seuls les champs fournis changent | `PATCH /workspaces/:id/tasks/:tid`         |
| `opentask_change_task_status` | Déplace la tâche vers une colonne (`columnId`) ou un type de colonne (`status`)      | `PATCH /workspaces/:id/tasks/:tid`         |
| `opentask_assign_task`        | Assigne la tâche à un membre du workspace, ou retire l’assignation (`null`)          | `PATCH /workspaces/:id/tasks/:tid`         |
| `opentask_add_comment`        | Ajoute un commentaire signé par l’utilisateur du jeton                               | `POST /workspaces/:id/tasks/:tid/comments` |

Chaque outil d’écriture retourne la ressource telle que l’API l’a enregistrée ; en cas de refus, il retourne l’erreur de l’API (`FORBIDDEN`, `NOT_FOUND`, `VALIDATION_FAILED`…) et rien n’est modifié.

## Prompts

| Prompt                    | Arguments                  | Produit                                       |
| ------------------------- | -------------------------- | --------------------------------------------- |
| `opentask_weekly_review`  | `workspaceId`              | Revue de la semaine à partir de mes tâches    |
| `opentask_project_status` | `workspaceId`, `projectId` | Compte rendu factuel d’avancement d’un projet |
| `opentask_overdue_tasks`  | `workspaceId`              | Mes tâches en retard regroupées par projet    |

Les prompts demandent à l’assistant de lire les données avec les outils ; ils ne modifient rien.

## Ajouter un outil

Voir [Contribuer](../developers/contributing.md#ajouter-un-outil-mcp).
