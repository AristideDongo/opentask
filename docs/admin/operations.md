# Exploitation

## Santé et logs

- `GET /api/v1/health` : le processus répond. `GET /api/v1/health/ready` : la base est joignable (`503` sinon). Les health checks Docker les utilisent.
- Logs JSON sur la sortie standard, un événement par requête avec un identifiant (`x-request-id`). Cookies, en-têtes d’autorisation et jetons présents dans les URL sont masqués.

```sh
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod logs -f api
```

## Sauvegardes

Voir [Sauvegarde et restauration](../deployment/backup-restore.md). Testez régulièrement une restauration : une sauvegarde jamais restaurée n’est pas une sauvegarde.

## Mettre à jour

```sh
git pull
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up -d --build
```

Les migrations de base de données sont appliquées au démarrage de l’API. **Faites une sauvegarde avant chaque mise à jour.** Lisez le [journal des modifications](https://github.com/AristideDongo/opentask/blob/main/CHANGELOG.md) avant de mettre à jour.

## Revenir en arrière

Les migrations ne sont pas annulées automatiquement. Pour revenir à une version précédente : arrêtez les conteneurs, restaurez la sauvegarde faite avant la mise à jour, revenez au commit précédent (`git checkout <version>`), puis reconstruisez.

## Activer ou désactiver le serveur MCP

Le serveur MCP est un service optionnel : ajoutez `--profile mcp` à la commande `up` pour le démarrer, ou retirez-le pour l’arrêter. `MCP_ALLOW_WRITE=false` le limite à la lecture.

## Désinstaller

::: danger Suppression définitive
La commande suivante supprime les conteneurs **et les volumes**, donc toutes les données. Faites une sauvegarde avant.
:::

```sh
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod down --volumes
```
