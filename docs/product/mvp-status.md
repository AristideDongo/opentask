# État du MVP

Suivi des critères d’acceptation du MVP (§ 18 de la spécification). Mis à jour à chaque livraison.

**Livraison 0.2.0** : phases 0 à 2, cœur de la phase 3 (projets, tâches, Liste, Kanban, commentaires) et discussion en temps réel.

| Critère                                                                | État       | Preuve                                                                                                           |
| ---------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| Un utilisateur peut créer un compte et un workspace                    | ✅         | `apps/api/test/auth.test.ts`, E2E `team-onboarding.spec.ts`                                                      |
| Un propriétaire peut inviter et retirer un membre                      | ✅         | `invitations.test.ts`, `members.test.ts`, E2E                                                                    |
| Les rôles sont appliqués côté serveur                                  | ✅         | matrice `packages/contracts/src/workspaces/permissions.ts`, `workspaces.test.ts`, `members.test.ts`              |
| Les données de deux workspaces sont isolées                            | ✅         | `isolation.test.ts` (chaque route), E2E (URL directe et API)                                                     |
| Une équipe peut créer des projets, tâches et sous-tâches               | ✅         | `apps/api/test/projects.test.ts`, E2E `work-and-chat.spec.ts` (listes : voir ADR 0007)                           |
| Les tâches peuvent être filtrées, triées, affichées en Liste ou Kanban | ✅         | `projects.test.ts` (filtres, tri, déplacement), E2E (Kanban, glisser-déposer)                                    |
| Les commentaires et l’activité sont enregistrés                        | ✅         | Commentaires de tâches, journal d’audit, discussion en canaux                                                    |
| Les notifications internes fonctionnent                                | ⏳ Phase 4 | —                                                                                                                |
| Les tâches peuvent être exportées                                      | ⏳ Phase 4 | —                                                                                                                |
| Les principales actions sont couvertes par des tests                   | ✅         | 121 tests unitaires et de cas d’usage, 105 tests d’intégration API (dont SSE), 4 parcours E2E avec contrôles axe |
| Docker Compose permet une installation reproductible                   | ✅         | Images construites et pile de production testée (migrations, santé, persistance après recréation)                |
| Les migrations et la restauration sont documentées et testées          | ✅         | `docs/deployment/`, `infra/scripts/verify-restore.sh` exécuté sur la pile de production                          |
| Aucun secret n’est commité                                             | ✅         | `.gitignore`, gitleaks en CI                                                                                     |
| La documentation explique les limites connues                          | ✅         | [known-limitations.md](known-limitations.md)                                                                     |
| Le produit reste utilisable sans service propriétaire externe          | ✅         | Aucune dépendance réseau externe ; SMTP optionnel ; police embarquée                                             |

## Parcours E2E minimum (§ 15)

| Étape                                                              | État                                              |
| ------------------------------------------------------------------ | ------------------------------------------------- |
| 1. Inscription et création d’un workspace                          | ✅                                                |
| 2. Invitation d’un deuxième utilisateur                            | ✅                                                |
| 3. Création d’un projet                                            | ✅                                                |
| 4. Création, assignation et échéance d’une tâche                   | ✅                                                |
| 5. Changement de statut et commentaire par le membre               | ✅ (statut en temps réel chez les autres membres) |
| 6. Notification du créateur                                        | ⏳ Phase 4                                        |
| 7. Un utilisateur sans accès ne voit pas la ressource (URL ou API) | ✅ (au niveau du workspace)                       |
| 8. Export des données par l’administrateur                         | ⏳ Phase 4                                        |
| 9. Restauration d’une sauvegarde dans une instance vierge          | ✅ (script, hors Playwright)                      |

## Décisions encore ouvertes (§ 22)

| Décision                          | Proposition actuelle                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| Nom définitif et dépôt            | « OpenTask », nom de travail : vérifier marque, domaine et dépôt                         |
| Licence                           | AGPL-3.0-only ([ADR 0001](../decisions/0001-licence-agpl.md)), à confirmer               |
| Auto-hébergé, hébergé ou les deux | Auto-hébergé d’abord ; rien n’empêche une offre hébergée                                 |
| Hiérarchie exacte                 | Workspace → Projet → Liste → Tâche ([ADR 0007](../decisions/0007-hierarchie-projets.md)) |
| Authentification                  | E-mail et mot de passe au MVP ; SSO plus tard via better-auth                            |
| Stockage des fichiers             | Local au départ, interface compatible S3 ensuite (non commencé)                          |
| Notifications par e-mail          | Infrastructure d’envoi prête ; notifications en phase 4                                  |
| Personnalisation des statuts      | Statuts par projet, ensemble initial fixe                                                |
| Télémétrie                        | Aucune. Télémétrie de better-auth désactivée explicitement                               |
| Gouvernance                       | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, ADR ; adresse de contact sécurité à définir     |
