# Membres, invitations et rôles

## Rôles

| Action                                            | Invité | Membre | Admin | Propriétaire |
| ------------------------------------------------- | :----: | :----: | :---: | :----------: |
| Voir le workspace, les membres, projets et tâches |   ✓    |   ✓    |   ✓   |      ✓       |
| Commenter une tâche                               |   ✓    |   ✓    |   ✓   |      ✓       |
| Créer et modifier projets et tâches               |        |   ✓    |   ✓   |      ✓       |
| Créer un canal, lire les canaux publics           |        |   ✓    |   ✓   |      ✓       |
| Supprimer un projet                               |        |        |   ✓   |      ✓       |
| Inviter, gérer les invitations et les équipes     |        |        |   ✓   |      ✓       |
| Renommer le workspace, lire le journal d’audit    |        |        |   ✓   |      ✓       |
| Supprimer le workspace, transférer la propriété   |        |        |       |      ✓       |

Ces règles sont vérifiées par le serveur à chaque requête. Une personne qui n’est pas membre d’un workspace reçoit une erreur « introuvable » : l’existence du workspace n’est pas révélée. Le détail est décrit dans [l’ADR 0006](../decisions/0006-roles-et-isolation.md).

## Inviter quelqu’un

Dans **Membres**, saisissez l’adresse e-mail et le rôle (un administrateur ne peut pas accorder le rôle d’administrateur ; seul le propriétaire le peut). La personne reçoit un lien par e-mail ; le lien est aussi affiché pour être transmis autrement. Il expire et ne fonctionne qu’une fois, avec le compte de l’adresse invitée.

## Changer un rôle, retirer un membre

Depuis **Membres**, selon vos droits. Un membre retiré perd immédiatement l’accès, y compris via ses [jetons d’API](./api-tokens.md). Le propriétaire doit transférer la propriété (**Paramètres**) avant de quitter le workspace.
