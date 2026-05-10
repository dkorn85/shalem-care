#!/usr/bin/env bash
#
# Supabase-Migrations ausführen via psql.
# Tablet-/Termux-freundlich · keine GUI, keine CLI, nur psql.
#
# Setup (einmalig):
#   pkg install postgresql      # in Termux
#   echo 'export SHALEM_PG_URL="postgresql://postgres.gpchwlqeqejxvynewjns:DEIN-DB-PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"' >> ~/.shalem-care.env
#   chmod 600 ~/.shalem-care.env
#   echo 'source ~/.shalem-care.env' >> ~/.bashrc   # (in Termux: ~/.profile)
#
# Wo finde ich den Connection-String?
#   Supabase Dashboard → Project Settings → Database → Connection string
#   Tab "Transaction" für die Pooler-URL nehmen (Port 6543).
#   Den DB-Password musst du beim Projekt-Setup gesetzt haben — falls
#   vergessen: dort unten "Reset database password".
#
# Verwendung:
#   ./scripts/migrate.sh 0001                # eine bestimmte Migration
#   ./scripts/migrate.sh                     # alle ausführen (mit Bestätigung)
#   ./scripts/migrate.sh --list              # zeigt was im Repo liegt
#   ./scripts/migrate.sh --status            # checkt was schon ausgeführt ist
#
# Verhalten:
#   · Jede Migration läuft in einer Transaktion — bricht alles ab wenn
#     einer der Befehle fehlschlägt.
#   · Migrationen sind idempotent (`if not exists` / `drop policy if exists`),
#     also kannst du sie auch nochmal laufen lassen wenn unsicher.
#   · Keine Migration-State-Tabelle — wir tracken nicht, welche Migration
#     wann lief. Das passt zu unserem fail-soft-Hybrid-Ansatz.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIG_DIR="$REPO_ROOT/supabase/migrations"

# ENV-Datei laden falls vorhanden
ENV_FILE="${SHALEM_ENV_FILE:-$HOME/.shalem-care.env}"
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

farbe_rot()    { printf '\033[31m%s\033[0m\n' "$*"; }
farbe_gruen()  { printf '\033[32m%s\033[0m\n' "$*"; }
farbe_gelb()   { printf '\033[33m%s\033[0m\n' "$*"; }
farbe_blau()   { printf '\033[36m%s\033[0m\n' "$*"; }

if ! command -v psql >/dev/null 2>&1; then
  farbe_rot "✕ psql nicht gefunden."
  echo
  echo "Termux:   pkg install postgresql"
  echo "Debian:   sudo apt install postgresql-client"
  echo "macOS:    brew install postgresql"
  exit 1
fi

if [ -z "${SHALEM_PG_URL:-}" ]; then
  farbe_rot "✕ SHALEM_PG_URL nicht gesetzt."
  echo
  echo "Setup:"
  echo "  Dashboard → Project Settings → Database → Connection string"
  echo "  Tab 'Transaction' (Port 6543) wählen."
  echo
  echo "Dann:"
  echo "  echo 'export SHALEM_PG_URL=\"postgresql://...\"' >> ~/.shalem-care.env"
  echo "  chmod 600 ~/.shalem-care.env"
  echo "  source ~/.shalem-care.env"
  exit 1
fi

# Connection mit Test-Query prüfen
test_verbindung() {
  if ! psql "$SHALEM_PG_URL" -tA -c "select 1" >/dev/null 2>&1; then
    farbe_rot "✕ Verbindung fehlgeschlagen."
    echo "  URL prüfen: $SHALEM_PG_URL"
    echo "  Fix: Dashboard → Database → Connection string nochmal kopieren."
    exit 1
  fi
}

list_migrations() {
  ls "$MIG_DIR"/*.sql 2>/dev/null | sort
}

status_check() {
  test_verbindung
  farbe_blau "── Existierende Tabellen im Schema 'public' ──"
  psql "$SHALEM_PG_URL" -c "
    select tablename, rowsecurity as rls_aktiv
    from pg_tables
    where schemaname = 'public'
    order by tablename;
  "
  echo
  farbe_blau "── Migration-Files im Repo ──"
  list_migrations | xargs -n1 basename
}

run_migration() {
  local file="$1"
  local name
  name="$(basename "$file")"
  farbe_gelb "── Führe aus: $name ──"
  if psql "$SHALEM_PG_URL" --single-transaction -v ON_ERROR_STOP=1 -f "$file"; then
    farbe_gruen "✓ $name OK"
  else
    farbe_rot "✕ $name fehlgeschlagen — Migration abgebrochen."
    return 1
  fi
}

# ─── CLI-Routing ────────────────────────────────────────────────

case "${1:-}" in
  --list|-l)
    farbe_blau "Migrationen im Repo:"
    list_migrations | xargs -n1 basename
    exit 0
    ;;
  --status|-s)
    status_check
    exit 0
    ;;
  --help|-h|"")
    if [ -z "${1:-}" ]; then
      farbe_blau "Alle Migrationen ausführen?"
      echo "Folgende werden in Reihenfolge ausgeführt:"
      list_migrations | xargs -n1 basename | sed 's/^/  · /'
      echo
      read -rp "Fortfahren? (j/N) " -n 1 antwort
      echo
      if [ "${antwort,,}" != "j" ]; then
        farbe_gelb "Abgebrochen."
        exit 0
      fi
      test_verbindung
      for f in $(list_migrations); do
        run_migration "$f" || exit 1
      done
      farbe_gruen "✓ Alle Migrationen durchgelaufen."
      exit 0
    fi
    cat <<'HELP'
Verwendung:
  ./scripts/migrate.sh                 # alle Migrationen (mit Bestätigung)
  ./scripts/migrate.sh 0001            # nur Migration 0001
  ./scripts/migrate.sh 0001_klient_wunsch  # auch Teil-Name OK
  ./scripts/migrate.sh --list          # zeigt alle .sql-Files
  ./scripts/migrate.sh --status        # zeigt existierende Tabellen + RLS

ENV:
  SHALEM_PG_URL          # Postgres-Connection-String (Pflicht)
  SHALEM_ENV_FILE        # alternativer Pfad zur ENV-Datei
                          # (default: ~/.shalem-care.env)
HELP
    exit 0
    ;;
  *)
    # Suche nach Migration mit dem gegebenen Prefix/Substring
    pattern="$1"
    files=()
    while IFS= read -r f; do
      files+=("$f")
    done < <(list_migrations | grep -F "$pattern" || true)

    if [ "${#files[@]}" -eq 0 ]; then
      farbe_rot "✕ Keine Migration mit '$pattern' gefunden."
      farbe_blau "Verfügbar:"
      list_migrations | xargs -n1 basename | sed 's/^/  · /'
      exit 1
    fi

    if [ "${#files[@]}" -gt 1 ]; then
      farbe_gelb "Mehrere Treffer:"
      for f in "${files[@]}"; do
        echo "  · $(basename "$f")"
      done
      exit 1
    fi

    test_verbindung
    run_migration "${files[0]}"
    ;;
esac
