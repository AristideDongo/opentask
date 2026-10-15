# Configuration

## Variables de l’API

L’API valide sa configuration au démarrage et s’arrête avec un message explicite si une variable est invalide.

| Variable                     | Obligatoire | Défaut                               | Sensible | Rôle                                                                                                                                 |
| ---------------------------- | :---------: | ------------------------------------ | :------: | ------------------------------------------------------------------------------------------------------------------------------------ |
| `PUBLIC_URL`                 |     oui     | —                                    |          | URL publique de l’interface ; liens des e-mails et contrôle d’origine (CSRF).                                                        |
| `DATABASE_URL`               |     oui     | —                                    |   oui    | Connexion PostgreSQL.                                                                                                                |
| `AUTH_SECRET`                |     oui     | —                                    |   oui    | Signe les sessions (32 caractères minimum). Le changer déconnecte tout le monde. Refusé en production s’il vaut la valeur d’exemple. |
| `NODE_ENV`                   |     non     | `development`                        |          | `production` en déploiement.                                                                                                         |
| `API_PORT`                   |     non     | `4000`                               |          | Port d’écoute de l’API.                                                                                                              |
| `REQUIRE_EMAIL_VERIFICATION` |     non     | `false`                              |          | Exige la vérification de l’adresse avant la première connexion.                                                                      |
| `SMTP_URL`                   |     non     | —                                    |   oui    | Serveur d’envoi (`smtp://…` ou `smtps://…`). Sans lui, les liens sont écrits dans les logs hors production.                          |
| `MAIL_FROM`                  |     non     | `OpenTask <no-reply@opentask.local>` |          | Expéditeur des e-mails.                                                                                                              |
| `LOG_LEVEL`                  |     non     | `info`                               |          | `fatal`, `error`, `warn`, `info`, `debug`, `trace` ou `silent`.                                                                      |
| `RATE_LIMIT_ENABLED`         |     non     | `true`                               |          | Limitation de débit (connexion, inscription, API).                                                                                   |
| `TRUST_PROXY_HOPS`           |     non     | `1`                                  |          | Nombre de proxys devant l’API ; une valeur fausse fausse la limitation de débit.                                                     |

## Variables du déploiement Docker Compose

À renseigner dans `infra/docker/.env.prod` (copie de `infra/docker/.env.prod.example`) :

| Variable                       | Rôle                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `DOMAIN`                       | Nom de domaine pour le profil `https` (Caddy).                                                 |
| `POSTGRES_USER`, `POSTGRES_DB` | Utilisateur et base PostgreSQL (`opentask` par défaut).                                        |
| `POSTGRES_PASSWORD`            | Mot de passe PostgreSQL (`openssl rand -base64 32`). **Sensible.**                             |
| `SOURCE_URL`                   | Lien vers le code source affiché dans l’interface (obligation AGPL si vous modifiez OpenTask). |
| `WEB_BIND`, `WEB_PORT`         | Adresse et port du conteneur web sans le profil `https` (`127.0.0.1:8080`).                    |
| `OPENTASK_VERSION`             | Étiquette des images construites (`local` par défaut).                                         |
| `MCP_ALLOW_WRITE`              | `false` pour n’exposer que les outils MCP de lecture.                                          |
| `MCP_ALLOWED_ORIGINS`          | Origines navigateur autorisées sur `/mcp`, séparées par des virgules (vide par défaut).        |
| `MCP_RATE_LIMIT_PER_MINUTE`    | Requêtes MCP par minute et par jeton (`120`).                                                  |

Les variables propres au serveur MCP sont détaillées dans [la page MCP](../mcp/#deploiement).

## E-mails

Les e-mails (vérification d’adresse, réinitialisation du mot de passe, invitations) passent par `SMTP_URL`. Sans SMTP en production, les invitations restent utilisables grâce au lien affiché dans **Membres**, mais la réinitialisation de mot de passe et la vérification d’adresse ne fonctionnent pas.
