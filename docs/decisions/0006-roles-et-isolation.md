# 0006 — Rôles, propriétaire unique et isolation des workspaces

**Statut : acceptée**

## Décision

| Action                                                    | Propriétaire | Admin | Membre | Invité |
| --------------------------------------------------------- | :----------: | :---: | :----: | :----: |
| Voir le workspace et ses membres                          |      ✓       |   ✓   |   ✓    |   ✓    |
| Renommer le workspace                                     |      ✓       |   ✓   |        |        |
| Inviter, révoquer une invitation, lire le journal d’audit |      ✓       |   ✓   |        |        |
| Inviter ou nommer un administrateur                       |      ✓       |       |        |        |
| Changer le rôle d’un membre ou d’un invité                |      ✓       |   ✓   |        |        |
| Changer le rôle d’un administrateur                       |      ✓       |       |        |        |
| Retirer un membre ou un invité                            |      ✓       |   ✓   |        |        |
| Retirer un administrateur                                 |      ✓       |       |        |        |
| Transférer la propriété, supprimer le workspace           |      ✓       |       |        |        |
| Quitter le workspace                                      |              |   ✓   |   ✓    |   ✓    |

- **Un seul propriétaire par workspace.** La propriété ne s’attribue ni par invitation ni par changement de rôle, uniquement par transfert explicite (l’ancien propriétaire devient administrateur). Il ne peut pas y avoir de workspace sans propriétaire.
- **Un non-membre reçoit `404 NOT_FOUND`** sur toute ressource d’un workspace, y compris si elle existe. Un membre sans le droit requis reçoit `403 FORBIDDEN`.
- Chaque table rattachée à un workspace porte `workspace_id` ; les dépôts filtrent toujours par ce champ, y compris pour les accès par identifiant (une invitation est cherchée par `id` **et** `workspace_id`).
- Les invitations sont liées à une adresse e-mail : seul un compte avec cette adresse peut les accepter. Le jeton (256 bits) n’est stocké que haché (SHA-256), affiché une seule fois à la création, valable 7 jours, à usage unique (mise à jour conditionnelle contre les acceptations concurrentes).

## Conséquences

- La matrice est testée exhaustivement dans `packages/contracts/src/workspaces/permissions.spec.ts`, et l’isolation route par route dans `apps/api/test/isolation.test.ts`.
- Les rôles par projet ou par liste viendront avec les projets ; ils devront rester bornés par le rôle dans le workspace.
