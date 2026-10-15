# Dépannage MCP

| Symptôme                                                  | Cause probable et solution                                                                                                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Le serveur stdio s’arrête au démarrage                    | Configuration invalide : le message sur la sortie d’erreur indique la variable (`OPENTASK_URL` doit être une URL, `OPENTASK_TOKEN` commencer par `otk_`). |
| `401` « Jeton d’API OpenTask requis »                     | L’en-tête `Authorization: Bearer otk_…` est absent ou mal formé.                                                                                          |
| `401` « invalide, révoqué ou expiré » / `UNAUTHENTICATED` | Créez un nouveau jeton dans **Profil → Jetons d’API**.                                                                                                    |
| `FORBIDDEN` sur une écriture                              | Jeton en lecture seule, rôle insuffisant (invité) ou écritures désactivées par l’administrateur.                                                          |
| `NOT_FOUND`                                               | Identifiant inexistant ou ressource d’un workspace dont vous n’êtes pas membre.                                                                           |
| `403` « Origine non autorisée »                           | Requête envoyée par un navigateur depuis une origine absente de `MCP_ALLOWED_ORIGINS`.                                                                    |
| `429`                                                     | Plus de `MCP_RATE_LIMIT_PER_MINUTE` requêtes par minute avec ce jeton.                                                                                    |
| `502` « L’instance OpenTask est indisponible »            | Le serveur MCP n’atteint pas l’API : vérifiez `OPENTASK_API_URL` et l’état du conteneur `api`.                                                            |
| `405` sur `GET /mcp`                                      | Normal : le serveur fonctionne sans session et n’accepte que `POST`.                                                                                      |
| L’assistant ne voit pas les outils d’écriture             | `MCP_ALLOW_WRITE=false` est actif.                                                                                                                        |
