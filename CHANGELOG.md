# Changelog

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet adopte le [versionnage sémantique](https://semver.org/lang/fr/).

## [Non publié]

### Modifié

- **Nouvelle arborescence** (ADR 0009) : l’API est organisée en `domains/`, `infrastructures/`, `presentations/` et `shared/` ; l’interface en `features/` et `shared/` avec services, loaders, actions, mappers et ViewModels.
- Prisma (schéma, migrations, client) déménage dans **`packages/database`**, better-auth dans **`packages/auth`**. Commandes : `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:migrate:dev`.
- Les packages `domain` et `application` sont supprimés ; les décisions de permission sont partagées via `packages/contracts`.

### Supprimé

- `SECURITY.md` : les signalements passent par les issues publiques.

### Ajouté

- **Jetons d’API personnels** (Profil → Jetons d’API) : permissions lecture/écriture, durée de 30, 90 ou 365 jours, révocables ; acceptés par l’API via `Authorization: Bearer`.
- **Serveur MCP** (`apps/mcp`) pour les assistants IA : transports stdio et HTTP, 9 outils de lecture, 5 d’écriture (aucune suppression), 3 prompts, mêmes permissions que l’API. Pris en charge par Claude Code ; ChatGPT en développement (OAuth requis). Service Docker Compose optionnel (`--profile mcp`) (ADR 0011).
- **Site public** (`apps/site`) en français et en anglais : présentation, fonctionnalités avec leur statut réel, auto-hébergement, MCP, installation, communauté et FAQ. Prérendu en HTML statique, avec métadonnées SEO, `sitemap.xml`, `robots.txt` et page 404 (ADR 0012).
- **Site de documentation** (`apps/docs`, VitePress) construit à partir de `docs/` : recherche intégrée, contrôle des liens au build, guides utilisateur, configuration et exploitation, API REST, MCP (Claude Code, ChatGPT, outils, sécurité, dépannage), contribution et dépannage (ADR 0013).

- **Colonnes du Kanban personnalisables par projet** : ajouter une colonne (« Ajouter une colonne » en fin de tableau), la **renommer par double-clic sur son titre** (Entrée pour valider, Échap pour annuler), changer son type, la déplacer à gauche ou à droite, la supprimer en choisissant la colonne qui reçoit ses tâches. Toutes ces actions sont aussi disponibles au clavier via le menu « … » de la colonne.
- Chaque colonne a un **type** (À faire, En cours, En revue, Terminé) qui décide si ses tâches sont terminées ; changer le type met à jour les tâches de la colonne.
- La vue Liste est groupée par colonne et se filtre par colonne ; le formulaire de tâche et le panneau de détail proposent les colonnes du projet.
- Routes `GET/POST /workspaces/:id/projects/:pid/columns`, `PATCH/DELETE …/columns/:columnId` ; `columnId` à la création, à la modification et en filtre des tâches.

- **Tags de projet** : chaque projet définit ses propres tags (nom et couleur, palette lisible ou couleur libre), gérés depuis le bouton « Tags » de l’en-tête du projet. Le texte du tag passe automatiquement en blanc ou en noir pour rester lisible.
- Plusieurs tags par tâche, affichés sur les cartes du Kanban, dans la vue Liste et dans « Mes tâches » ; filtre par tag.
- Bouton **Nouvelle tâche** ouvrant un formulaire complet (titre, description, statut, priorité, assignation, échéance, tags), et bouton **Ajouter** en bas de chaque colonne du Kanban pour créer directement dans ce statut.
- Routes `GET/POST /workspaces/:id/projects/:pid/labels` et `PATCH/DELETE …/labels/:labelId` ; `labelIds` à la création et à la modification d’une tâche ; filtre `labelId`.

## [0.2.0] — 2026-10-13

Projets, tâches, équipes et discussion en temps réel.

### Ajouté

- **Barre latérale** façon ClickUp : Vue d’ensemble, Mes tâches, Membres, Paramètres, puis sections Projets, Canaux et Équipes, chacune avec un bouton de création selon les droits.
- **Projets** (rattachables à une équipe) et **tâches** : statut, priorité, échéance, assignation, description, sous-tâches, commentaires, date d’achèvement automatique.
- **Vue Liste** groupée par statut, avec recherche, filtres (statut, priorité, personne) et tris, synchronisés avec l’URL.
- **Vue Kanban** avec glisser-déposer et ordre manuel ; alternative au clavier par le sélecteur de statut de chaque carte.
- **Panneau de détail** de tâche ouvert par-dessus la liste ou le Kanban (URL partageable).
- **Mes tâches** : tâches ouvertes assignées, groupées par échéance (en retard, aujourd’hui, à venir).
- **Équipes** : création et gestion par les administrateurs, page d’équipe (membres et projets).
- **Canaux de discussion** publics ou privés, canal « Général » créé avec chaque workspace (et ajouté aux workspaces existants), messages modifiables et supprimables, chargement de l’historique, compteurs de non-lus.
- **Temps réel par SSE** : messages, tâches, projets, équipes et membres se mettent à jour sans recharger ; diffusion filtrée par permissions, flux coupé lors du retrait d’un membre ([ADR 0008](docs/decisions/0008-temps-reel-sse.md)).
- Accueil du workspace : avancement des projets, mes tâches ouvertes, discussions, activité.
- 35 routes d’API supplémentaires, documentées dans l’OpenAPI.

### Modifié

- Les projets existants ont reçu automatiquement les colonnes À faire, En cours, En revue et Terminé, et chaque tâche a rejoint la colonne de son statut (migration `kanban_columns`).
- Hiérarchie retenue : Workspace → Projet → Tâche → Sous-tâche ([ADR 0007](docs/decisions/0007-hierarchie-projets.md)).

## [0.1.0] — 2026-10-13

Première livraison : fondation technique, identité, workspaces et permissions (phases 0 à 2 de la feuille de route).

### Ajouté

- Monorepo Turborepo + pnpm : `apps/api` (NestJS), `apps/web` (React Router, SPA), `packages/contracts`, `packages/domain`, `packages/application`.
- Authentification par e-mail et mot de passe (better-auth) : inscription, connexion, déconnexion, vérification d’adresse (optionnelle), réinitialisation du mot de passe, mots de passe hachés en Argon2id.
- Profil : nom, langue (français / anglais), fuseau horaire.
- Workspaces : création, renommage, suppression confirmée par le nom, transfert de propriété.
- Rôles propriétaire, administrateur, membre, invité, appliqués côté serveur ; isolation stricte entre workspaces (404 pour un non-membre).
- Invitations par e-mail et lien à usage unique (jeton haché, expiration 7 jours, révocation).
- Journal d’audit des opérations d’administration, paginé par curseur.
- API REST versionnée `/api/v1`, format d’erreur stable, document OpenAPI généré depuis les contrats.
- Sécurité : cookies de session `HttpOnly`/`SameSite=Lax`, contrôle d’origine (CSRF), limitation de débit, en-têtes de sécurité, logs structurés sans secrets.
- Interface accessible (WCAG 2.1 AA vérifié par axe), thèmes clair et sombre, responsive.
- Docker Compose de développement et de production, health checks, scripts de sauvegarde, restauration et vérification de restauration.
- CI GitHub Actions : format, lint, types, contrats, tests, build, E2E, détection de secrets, audit des dépendances.
