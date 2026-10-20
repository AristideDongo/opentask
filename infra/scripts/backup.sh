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
#   FILES_SERVICE  service qui stocke les fichiers envoyés (défaut : api) ; ignoré s’il ne tourne pas
#   STORAGE_DIR    dossier des fichiers dans ce service (défaut : /app/storage)
set -eu

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.yml}
DB_SERVICE=${DB_SERVICE:-postgres}
POSTGRES_USER=${POSTGRES_USER:-opentask}
POSTGRES_DB=${POSTGRES_DB:-opentask}
BACKUP_DIR=${BACKUP_DIR:-./backups}
FILES_SERVICE=${FILES_SERVICE:-api}
STORAGE_DIR=${STORAGE_DIR:-/app/storage}

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

# Les fichiers envoyés (images, pièces jointes) vivent hors de la base : on les archive à côté.
if compose ps --status running --services 2>/dev/null | grep -qx "$FILES_SERVICE"; then
  FILES_OUT="${OUT%.dump}.files.tar.gz"
  compose exec -T "$FILES_SERVICE" tar -C "$STORAGE_DIR" -czf - . > "$FILES_OUT.partial"
  mv "$FILES_OUT.partial" "$FILES_OUT"
  echo "Fichiers archivés : $FILES_OUT ($(wc -c < "$FILES_OUT" | tr -d ' ') octets)"
else
  echo "Service « $FILES_SERVICE » arrêté ou absent : fichiers envoyés non archivés."
fi
