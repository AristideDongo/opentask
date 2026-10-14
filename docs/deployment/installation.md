# Installation et exploitation

## Prérequis

- Un serveur Linux avec Docker et Docker Compose v2.
- 1 vCPU et 1 Go de RAM suffisent pour une petite équipe (ordre de grandeur à confirmer par des mesures ; aucune capacité n’est garantie à ce stade).
- Un nom de domaine pointant vers le serveur pour HTTPS, et un compte SMTP pour les e-mails (recommandé).

## Installation

```sh
git clone <url-du-dépôt> opentask && cd opentask
cp infra/docker/.env.prod.example infra/docker/.env.prod
```

Éditez `infra/docker/.env.prod` :

| Variable                     | Description                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PUBLIC_URL`                 | URL publique, par exemple `https://taches.example.org`. Sert aux liens des e-mails et au contrôle d’origine.                                           |
| `POSTGRES_PASSWORD`          | `openssl rand -base64 32`                                                                                                                              |
| `AUTH_SECRET`                | `openssl rand -base64 48` : signe les sessions. Le changer déconnecte tout le monde.                                                                   |
| `SMTP_URL`, `MAIL_FROM`      | Serveur d’envoi, par exemple `smtp://user:pass@smtp.example.org:587`.                                                                                  |
| `REQUIRE_EMAIL_VERIFICATION` | `true` recommandé si SMTP est configuré.                                                                                                               |
| `TRUST_PROXY_HOPS`           | Nombre de proxys devant l’API : `1` (nginx du conteneur web), `2` avec Caddy ou un autre proxy HTTPS. Une valeur fausse fausse la limitation de débit. |
| `SOURCE_URL`                 | Lien vers le code source affiché dans l’interface (obligation AGPL si vous modifiez OpenTask).                                                         |

### Avec HTTPS automatique (Caddy)

```sh
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod --profile https up -d --build
```

Caddy obtient et renouvelle les certificats Let’s Encrypt pour `DOMAIN` (ports 80 et 443).

### Derrière votre propre proxy HTTPS

```sh
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up -d --build
```

Le conteneur `web` écoute sur `127.0.0.1:8080` (`WEB_BIND`, `WEB_PORT`). Votre proxy doit transmettre `Host` et `X-Forwarded-For`.

## Ce qui se passe au démarrage

1. PostgreSQL démarre ; ses données sont dans le volume `opentask-prod_postgres-data`.
2. L’API applique les migrations en attente (`prisma migrate deploy`, idempotent), puis démarre. Une configuration invalide arrête le conteneur avec un message explicite.
3. `web` démarre quand l’API est saine (`/api/v1/health`).

Vérification : `curl -s https://taches.example.org/api/v1/health/ready` doit renvoyer `{"status":"ok",...}`.

## Ports et volumes

| Service                  | Port                                 | Volume                              |
| ------------------------ | ------------------------------------ | ----------------------------------- |
| `web` (nginx)            | 8080, publié sur `WEB_BIND:WEB_PORT` | —                                   |
| `api`                    | 4000, interne                        | —                                   |
| `postgres`               | 5432, interne                        | `postgres-data` (**à sauvegarder**) |
| `caddy` (profil `https`) | 80, 443                              | `caddy-data` (certificats)          |

Ne supprimez jamais le volume `postgres-data` (`docker compose down -v`) sur une instance réelle.

## Mise à jour

1. Sauvegardez : voir [backup-restore.md](backup-restore.md).
2. Lisez le `CHANGELOG.md` de la nouvelle version (notes de migration).
3. `git pull` puis `docker compose … up -d --build`. Les migrations s’appliquent au démarrage de l’API.

### Retour arrière

Les migrations ne sont pas réversibles automatiquement. Pour revenir à la version précédente : arrêtez l’API, restaurez la sauvegarde faite avant la mise à jour, puis redéployez l’ancienne version (`git checkout <tag>` et `up -d --build`).

## Logs

```sh
docker compose -f infra/docker/docker-compose.prod.yml logs -f api
```

Logs JSON, un événement par requête avec `req.id` (identique à l’en-tête `x-request-id`).
