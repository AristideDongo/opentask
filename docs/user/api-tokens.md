# Jetons d’API

Un jeton d’API permet à un outil — le [serveur MCP](../mcp/) pour un assistant IA, un script — d’agir **en votre nom, avec vos droits**. Il ne donne jamais plus d’accès que votre compte : si vous perdez un rôle ou quittez un workspace, le jeton perd cet accès aussi.

## Créer un jeton

1. Ouvrez **Profil → Jetons d’API**.
2. Donnez-lui un nom (par exemple « Claude Code »), choisissez les permissions et la durée (30, 90 ou 365 jours).
3. **Copiez le jeton immédiatement** : il commence par `otk_` et ne sera plus jamais affiché.

| Permission | Autorise                                                          |
| ---------- | ----------------------------------------------------------------- |
| Lecture    | Les requêtes de consultation (`GET`)                              |
| Écriture   | Les modifications : créer et modifier des tâches, commenter, etc. |

Un jeton ne peut pas créer ni révoquer d’autres jetons : ces opérations exigent une connexion normale. Vous pouvez avoir 20 jetons au maximum.

## Révoquer un jeton

**Révoquer** dans la liste : les outils qui l’utilisent perdent immédiatement l’accès. Révoquez tout jeton exposé par erreur (dépôt Git, capture d’écran, conversation).

## Bonnes pratiques

- Un jeton par outil, avec la permission minimale nécessaire.
- Ne collez jamais un jeton ni votre mot de passe dans une conversation avec un assistant.
- Stockez-le comme un mot de passe (gestionnaire de secrets, variable d’environnement).
