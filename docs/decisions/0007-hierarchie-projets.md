# 0007 — Hiérarchie Workspace → Projet → Tâche → Sous-tâche

**Statut : acceptée** (version 0.2.0)

## Contexte

La spécification propose Workspace → Espaces → Dossiers → Listes → Tâches, tout en demandant de ne pas imposer plusieurs niveaux à qui veut seulement « un projet et des tâches ».

## Décision

- **Workspace → Projet → Tâche → Sous-tâche** (un seul niveau de sous-tâches, dans le même projet).
- Les **équipes** regroupent des membres du workspace ; un projet peut être rattaché à une équipe (facultatif). Elles ne restreignent pas encore l’accès : tout membre du workspace voit tous les projets.
- **Tags par projet** (nom, couleur `#rrggbb`) : chaque équipe définit son vocabulaire ; une tâche porte au plus 10 tags de son propre projet (50 tags par projet). Les membres les gèrent, les invités les consultent.
- **Colonnes du Kanban par projet**, créées, renommées, réordonnées et supprimées par l’équipe (20 au plus). Chaque colonne a un **type** parmi À faire, En cours, En revue, Terminé : il est recopié dans le statut des tâches (`tasks.status`) et décide de leur achèvement, ce qui garde « Mes tâches », l’avancement et la date d’achèvement indépendants des noms choisis. Un nouveau projet démarre avec quatre colonnes, nommées dans la langue de son créateur.
- Ordre manuel par colonne (position flottante, insertion entre deux voisines), pour les tâches comme pour les colonnes : le Kanban et la vue Liste partagent les mêmes données.
- Les « listes », « espaces » et « dossiers » pourront s’ajouter plus tard comme regroupements optionnels, sans migration des tâches.

## Conséquences

- Routes imbriquées sous le workspace (`/workspaces/:id/projects/:pid/tasks`, `/workspaces/:id/tasks/:tid`) : chaque accès vérifie l’appartenance au workspace, et chaque ressource porte `workspace_id`.
- L’assignation est contrainte en base : clé étrangère composite vers `workspace_members`. Un membre qui quitte le workspace est désassigné de ses tâches.
