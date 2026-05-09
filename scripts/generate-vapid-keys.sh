#!/usr/bin/env bash
# Erzeugt einmalig VAPID-Keys für Web-Push.
# Output: zwei ENV-Vars zum Eintragen in Hostinger / .env.local
#
# Aufruf:
#   bash scripts/generate-vapid-keys.sh
#
# Die Keys werden NICHT automatisch in eine Datei geschrieben — das machst
# du manuell, damit sie nicht versehentlich ins Repo wandern.

set -euo pipefail

cd "$(dirname "$0")/../apps/web"

if ! npm ls web-push --silent >/dev/null 2>&1; then
  echo "✕ web-push fehlt. Bitte erst: npm install web-push @types/web-push" >&2
  exit 1
fi

KEYS=$(npx --no-install web-push generate-vapid-keys --json 2>/dev/null)

PUBLIC=$(echo "$KEYS" | python3 -c 'import json,sys; print(json.load(sys.stdin)["publicKey"])')
PRIVATE=$(echo "$KEYS" | python3 -c 'import json,sys; print(json.load(sys.stdin)["privateKey"])')

cat <<EOF

→ VAPID-Keys erzeugt. In Hostinger ENV oder .env.local eintragen:

NEXT_PUBLIC_VAPID_PUBLIC_KEY=$PUBLIC
VAPID_PRIVATE_KEY=$PRIVATE
VAPID_SUBJECT=mailto:hallo@shalem.de

→ Public-Key landet im Client-Bundle (NEXT_PUBLIC_…), das ist okay.
→ Private-Key NIEMALS in NEXT_PUBLIC_… legen — nur server-side.

→ Nach Setzen + Neustart funktioniert:
   curl -X POST https://shalem.de/api/push/test \\
     -H "Content-Type: application/json" \\
     -d '{"titel":"Hallo aus dem Server","beschreibung":"Push funktioniert"}'

EOF
