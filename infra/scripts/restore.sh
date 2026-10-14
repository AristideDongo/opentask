#!/usr/bin/env sh
# Restaure une sauvegarde produite par backup.sh. ÉCRASE la base cible.
#
#   infra/scripts/restore.sh <fichier.dump> [--yes]
#
# Arrêtez l’API pendant la restauration : docker compose stop api
# Variables : identiques à backup.sh, plus RESTORE_DB pour restaurer dans une autre base.
set -eu

DUMP=${1:?Usage : restore.sh <fichier.dump> [--yes]}
CONFIRM=${2:-}
COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.yml}
DB_SERVICE=${DB_SERVICE:-postgres}
POSTGRES_USER=${POSTGRES_USER:-opentask}
TARGET_DB=${RESTORE_DB:-${POSTGRES_DB:-opentask}}

compose() {
  if [ -n "${ENV_FILE:-}" ]; then docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
  else docker compose -f "$COMPOSE_FILE" "$@"; fi
}

[ -f "$DUMP" ] || { echo "Fichier introuvable : $DUMP" >&2; exit 1; }

if [ "$CONFIRM" != "--yes" ]; then
  printf "La base « %s » va être remplacée par %s. Continuer ? [oui/N] " "$TARGET_DB" "$DUMP"
  read -r answer
  [ "$answer" = "oui" ] || { echo "Annulé."; exit 1; }
fi

compose exec -T "$DB_SERVICE" psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 -q \
  -c "DROP DATABASE IF EXISTS \"$TARGET_DB\" WITH (FORCE);" \
  -c "CREATE DATABASE \"$TARGET_DB\" OWNER \"$POSTGRES_USER\";"
compose exec -T "$DB_SERVICE" pg_restore -U "$POSTGRES_USER" -d "$TARGET_DB" --no-owner --exit-on-error < "$DUMP"
echo "Restauration terminée dans « $TARGET_DB »."
