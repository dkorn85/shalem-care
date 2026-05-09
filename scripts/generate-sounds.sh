#!/usr/bin/env bash
# Generiert die 8 UI-Sounds via ElevenLabs Sound Effects API.
#
# Voraussetzung: ELEVENLABS_API_KEY als Env-Var gesetzt
#   export ELEVENLABS_API_KEY="sk_..."
#
# Aufruf:
#   bash scripts/generate-sounds.sh
#
# Output: apps/web/public/sounds/<name>.mp3 für alle 8 Sound-Keys.
#
# Kosten: ~10 Credits/Sound × 8 = ~80 Credits. Free-Tier hat 10k/Monat,
# also völlig im Rahmen. Wiederholbar — generiert bei jedem Lauf neu,
# ältere Datei wird überschrieben.
#
# API-Doku: https://elevenlabs.io/docs/api-reference/text-to-sound-effects

set -euo pipefail

if [[ -z "${ELEVENLABS_API_KEY:-}" ]]; then
  echo "✕ ELEVENLABS_API_KEY ist nicht gesetzt." >&2
  echo "  Hol dir einen Key auf https://elevenlabs.io/app/settings/api-keys" >&2
  echo "  Dann: export ELEVENLABS_API_KEY=sk_..." >&2
  exit 1
fi

OUT_DIR="apps/web/public/sounds"
mkdir -p "$OUT_DIR"

API_URL="https://api.elevenlabs.io/v1/sound-generation"

# ─── Sound-Definitionen ──────────────────────────────────────────────────
# Format: NAME|DURATION_SEC|PROMPT_INFLUENCE|PROMPT
# prompt_influence: 0.0 = freier (Variation), 1.0 = strikter (Prompt-treu).
# Default 0.5, hier teils höher (klick/stempel mehr prompt-treu für Konsistenz).

read -r -d '' SOUNDS <<'EOF' || true
klick|0.5|0.7|A very short soft tap sound at the very beginning followed by complete silence. Like a single fingertip touching a smooth glass surface. Warm organic no metallic edge. Just a brief gentle "tup" almost felt rather than heard. Low-mid frequencies no echo. Sound completes in 100ms then silent.
erfolg|0.5|0.6|A short warm bell tone like a tiny brass meditation chime struck gently. Two soft notes ascending a small interval (perfect fourth) quick decay. Calm and confirming not celebratory. Subtle reverb tail. Inspired by gentle iOS notification chimes but warmer and more acoustic.
fehler|0.5|0.6|A muffled descending two-tone buzz. Soft and apologetic not harsh. Like a gentle "uh-oh" played on a wooden percussion instrument. Two notes descending a minor third very brief. No sharp edges no electronic grit feels like wood not glass.
navigation|0.5|0.6|A soft whoosh sound like turning a page in a heavy book or sweeping a hand across paper. Subtle airflow with a gentle low-frequency tail. Organic and tactile no synthesizer feel. Very quiet and brief sound completing in 200ms.
warnung|0.5|0.6|A soft warm warning chime three quick gentle taps on a low wooden block slightly resonant. Calm but attention-getting like a gentle hand on the shoulder. No alarm no urgency felt rather than heard. Inspired by Japanese temple wood blocks (mokugyō) but smaller and softer.
lana|0.5|0.5|A delicate sparkling shimmer like tiny glass beads cascading. Brief ascending arpeggio of soft mallets or vibraphone three or four notes moving up gently. Magical but understated no fairy-dust cliché. Subtle warmth slight reverb. Inspired by Apple Intelligence chimes but more organic and warmer.
stempel|0.5|0.7|The organic sound of a rubber stamp pressing onto paper a soft "thump" with a brief paper-rustle aftertone. Wooden handle ink cushion real office feel. Warm low frequency no metallic ring. Brief and satisfying like sealing an envelope. Acoustic and physical.
konfetti|1.5|0.5|A celebratory but gentle uplifting sound soft crystalline shimmer rising with a quick warm chord at the start (major triad on a glockenspiel or music box) followed by a delicate sparkle cascade falling like confetti. Joyful but not loud like a tiny indoor party. Acoustic instruments only no synthesizer. About 1.5 seconds total.
EOF

# ─── Pro Sound: API-Call ────────────────────────────────────────────────

echo "→ Generiere 8 Sounds nach $OUT_DIR/"
echo ""

while IFS='|' read -r NAME DURATION INFLUENCE PROMPT; do
  [[ -z "$NAME" ]] && continue
  OUTFILE="$OUT_DIR/${NAME}.mp3"
  echo "  · ${NAME}.mp3  (${DURATION}s, influence=${INFLUENCE})"

  # JSON-Body bauen via printf — vermeidet Shell-Escape-Probleme bei $PROMPT
  BODY=$(printf '{"text":%s,"duration_seconds":%s,"prompt_influence":%s}' \
    "$(printf '%s' "$PROMPT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')" \
    "$DURATION" \
    "$INFLUENCE")

  HTTP_STATUS=$(curl -sS -o "$OUTFILE" -w "%{http_code}" \
    -X POST "$API_URL" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -H "Accept: audio/mpeg" \
    -d "$BODY")

  if [[ "$HTTP_STATUS" != "200" ]]; then
    echo "    ✕ HTTP $HTTP_STATUS"
    cat "$OUTFILE" >&2
    rm -f "$OUTFILE"
  else
    SIZE=$(wc -c < "$OUTFILE" | tr -d ' ')
    echo "    ✓ ${SIZE} bytes"
  fi
done <<< "$SOUNDS"

echo ""
echo "→ Fertig. Files:"
ls -la "$OUT_DIR"/*.mp3 2>/dev/null || echo "  (keine generiert)"
echo ""
echo "→ Sound-Toggle (🔇/🔊) rechts unten in jeder App-Seite aktivieren"
echo "  und auf einen Aktions-Button klicken (z.B. /admin/stationen/[id] →"
echo "  Aufnahme), um die Sounds live zu hören."
