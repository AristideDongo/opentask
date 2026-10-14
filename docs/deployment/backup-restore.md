# Sauvegarde et restauration

Toutes les données d’OpenTask sont dans PostgreSQL (il n’y a pas encore de pièces jointes). Une sauvegarde de la base suffit donc.

## Sauvegarder

```sh
COMPOSE_FILE=infra/docker/docker-compose.prod.yml ENV_FILE=infra/docker/.env.prod \
  infra/scripts/backup.sh
```

Le script écrit `backups/opentask-<date>.dump` (format personnalisé de `pg_dump`, compressé, permissions `600`) puis vérifie que l’archive est lisible. Exemple de tâche cron quotidienne :

```cron
15 3 * * * cd /srv/opentask && COMPOSE_FILE=infra/docker/docker-compose.prod.yml ENV_FILE=infra/docker/.env.prod infra/scripts/backup.sh >> /var/log/opentask-backup.log 2>&1
```

Copiez les sauvegardes **hors du serveur**, chiffrées si possible (par exemple `restic` ou `age`). Une sauvegarde contient les adresses e-mail et les hachages de mots de passe des utilisateurs.

## Restaurer

```sh
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod stop api
COMPOSE_FILE=infra/docker/docker-compose.prod.yml ENV_FILE=infra/docker/.env.prod \
  infra/scripts/restore.sh backups/opentask-20261013T031500Z.dump
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod start api
```

Le script demande de taper `oui` (ou `--yes` pour l’automatisation), recrée la base puis restaure. Pour restaurer dans une autre base sans toucher la production : `RESTORE_DB=opentask_copie`.

Sur une instance vierge, démarrez seulement `postgres`, restaurez, puis démarrez le reste : l’API appliquera ensuite les éventuelles migrations plus récentes.

## Tester régulièrement la restauration

```sh
COMPOSE_FILE=infra/docker/docker-compose.prod.yml ENV_FILE=infra/docker/.env.prod \
  infra/scripts/verify-restore.sh
```

Le script sauvegarde, restaure dans une base temporaire, compare le nombre de lignes de chaque table puis supprime la copie. Une sauvegarde jamais restaurée n’est pas une sauvegarde.

## Export des données

L’export CSV et JSON des workspaces et des tâches arrivera avec la gestion des tâches (critère du MVP). D’ici là, la sauvegarde PostgreSQL est un format ouvert et documenté (voir le modèle de données dans `docs/architecture/overview.md`).
