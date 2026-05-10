#!/usr/bin/env bash
# Bündelt supabase/migrations/0*.sql zu supabase/migrations/00_alle_in_einem.sql.
# Wird genutzt für den 1-Klick-Run im Supabase-Dashboard SQL-Editor.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIG_DIR="$REPO_ROOT/supabase/migrations"
OUT="$MIG_DIR/00_alle_in_einem.sql"
TMP="$(mktemp)"

{
  echo "-- ╔══════════════════════════════════════════════════════════════════════════╗"
  echo "-- ║  Shalem Care · alle Supabase-Migrationen in einer Datei                   ║"
  echo "-- ║                                                                            ║"
  echo "-- ║  GENERIERT von scripts/build-all-in-one.sh — nicht direkt editieren.     ║"
  echo "-- ║                                                                            ║"
  echo "-- ║  Verwendung:                                                                ║"
  echo "-- ║    1. Inhalt komplett kopieren                                              ║"
  echo "-- ║    2. Supabase Dashboard → SQL Editor → New query                          ║"
  echo "-- ║    3. Einfügen → Run                                                        ║"
  echo "-- ║                                                                            ║"
  echo "-- ║  Idempotent: kann mehrfach ausgeführt werden, alle CREATEs sind            ║"
  echo "-- ║  if-not-exists, alle Policies drop-if-exists.                              ║"
  echo "-- ║                                                                            ║"
  echo "-- ║  Bei Fehlern bricht das Run beim Punkt ab und zeigt die Zeilennummer —    ║"
  echo "-- ║  scroll dorthin, lies die Meldung, fix manuell oder schick mir die         ║"
  echo "-- ║  Zeile zum Debug.                                                           ║"
  echo "-- ╚══════════════════════════════════════════════════════════════════════════╝"
  echo ""
  for f in "$MIG_DIR"/0*.sql; do
    name="$(basename "$f")"
    [ "$name" = "00_alle_in_einem.sql" ] && continue
    echo ""
    echo "-- ════════════════════════════════════════════════════════════════════════════"
    echo "-- ║ $name"
    echo "-- ════════════════════════════════════════════════════════════════════════════"
    echo ""
    cat "$f"
  done
} > "$TMP"

mv "$TMP" "$OUT"
echo "✓ $(wc -l < "$OUT") Zeilen geschrieben nach: $OUT"
