#!/usr/bin/env sh
# Test de restauration : sauvegarde la base, la restaure dans une base temporaire
# et compare le nombre de lignes de chaque table. À exécuter régulièrement (et en CI).
set -eu

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.yml}
DB_SERVICE=${DB_SERVICE:-postgres}
POSTGRES_USER=${POSTGRES_USER:-opentask}
SOURCE_DB=${POSTGRES_DB:-opentask}
CHECK_DB=${SOURCE_DB}_restore_check
DIR=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

compose() {
  if [ -n "${ENV_FILE:-}" ]; then docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
  else docker compose -f "$COMPOSE_FILE" "$@"; fi
}

counts() {
  compose exec -T "$DB_SERVICE" psql -U "$POSTGRES_USER" -d "$1" -At -c \
    "SELECT string_agg(t || '=' || n, ' ' ORDER BY t) FROM (
       SELECT 'users' t, count(*) n FROM users UNION ALL
       SELECT 'workspaces', count(*) FROM workspaces UNION ALL
       SELECT 'workspace_members', count(*) FROM workspace_members UNION ALL
       SELECT 'invitations', count(*) FROM invitations UNION ALL
       SELECT 'audit_logs', count(*) FROM audit_logs UNION ALL
       SELECT 'accounts', count(*) FROM accounts UNION ALL
       SELECT '_prisma_migrations', count(*) FROM _prisma_migrations) c;"
}

POSTGRES_DB=$SOURCE_DB "$DIR/backup.sh" "$TMP/check.dump" > /dev/null
RESTORE_DB=$CHECK_DB "$DIR/restore.sh" "$TMP/check.dump" --yes > /dev/null

before=$(counts "$SOURCE_DB")
after=$(counts "$CHECK_DB")
compose exec -T "$DB_SERVICE" psql -U "$POSTGRES_USER" -d postgres -q -c "DROP DATABASE \"$CHECK_DB\" WITH (FORCE);"

echo "Source    : $before"
echo "Restaurée : $after"
[ "$before" = "$after" ] && echo "OK : la sauvegarde se restaure à l’identique." || { echo "ÉCHEC : écart détecté." >&2; exit 1; }
