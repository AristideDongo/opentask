#!/usr/bin/env sh
# Sauvegarde PostgreSQL d’OpenTask au format « custom » de pg_dump (compressé, restaurable sélectivement).
#
#   infra/scripts/backup.sh [fichier-de-sortie]
#
# Variables :
#   COMPOSE_FILE   fichier compose utilisé (défaut : docker-compose.yml du dépôt)
#   ENV_FILE       fichier d’environnement compose (optionnel, ex. infra/docker/.env.prod)
#   DB_SERVICE     service PostgreSQL (défaut : postgres)
#   POSTGRES_USER / POSTGRES_DB  identifiants (défaut : opentask / opentask)
#   BACKUP_DIR     dossier de destination (défaut : ./backups)
set -eu

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.yml}
DB_SERVICE=${DB_SERVICE:-postgres}
POSTGRES_USER=${POSTGRES_USER:-opentask}
POSTGRES_DB=${POSTGRES_DB:-opentask}
BACKUP_DIR=${BACKUP_DIR:-./backups}

compose() {
  if [ -n "${ENV_FILE:-}" ]; then docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
  else docker compose -f "$COMPOSE_FILE" "$@"; fi
}

mkdir -p "$BACKUP_DIR"
OUT=${1:-"$BACKUP_DIR/opentask-$(date -u +%Y%m%dT%H%M%SZ).dump"}
umask 077

compose exec -T "$DB_SERVICE" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-privileges > "$OUT.partial"
mv "$OUT.partial" "$OUT"

# Vérifie que l’archive est lisible avant de déclarer la sauvegarde réussie.
compose exec -T "$DB_SERVICE" pg_restore --list < "$OUT" > /dev/null
echo "Sauvegarde écrite : $OUT ($(wc -c < "$OUT" | tr -d ' ') octets)"
