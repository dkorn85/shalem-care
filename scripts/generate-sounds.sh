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
aufnahme-start|0.5|0.6|A soft warm pulse like a heartbeat starting up. Single low gentle tone with subtle low-frequency rumble fade-in. Calm signal that recording or capture has begun. No mechanical click no tape-deck snap. Organic and reassuring like a hand on the shoulder.
aufnahme-stop|0.5|0.6|A soft conclusion sound short two-note descending tone like gently closing a journal. Warm wooden tonewood or marimba quality quick decay no reverb. Final but not abrupt. Inspired by old reel-to-reel tape stops but very subtle and modern.
diagnose-set|0.5|0.6|A delicate wooden ink-pen scratch-and-stop. Very brief organic friction sound followed by a tiny resolution tone like setting a pen down on paper. Earthy warm low-mid frequencies. Documentation feeling not technological.
konferenz-join|0.5|0.5|Two warm ascending notes a perfect fifth apart on a soft electric piano or felt piano. Welcoming and present not chimey. Brief reverb tail. Inspired by Zoom join sound but warmer more human less corporate.
konferenz-leave|0.5|0.5|Two warm descending notes a perfect fifth apart on a soft electric piano or felt piano. Calm exit sound peaceful not sad. Mirror of the join sound. Brief reverb.
bett-belegt|0.5|0.6|A soft wooden knock-and-settle sound like placing a small wooden box on a table. Brief tactile thud with a subtle low-frequency tail. Domestic peaceful no clinical edge.
bett-frei|0.5|0.6|A light airy upward whoosh like opening a window in a quiet room. Soft breath-like quality very brief almost felt rather than heard. Resolution and lightness no medical sterility.
export-fertig|0.5|0.6|Two crisp soft popping clicks in quick succession like a postal stamp twice or a paper-cutter snipping. Confident finished feeling subtle warmth. Brief and satisfying.
swipe|0.5|0.6|A quick airy whoosh like sweeping a hand across silk. Smooth horizontal motion sound brief no echo. Light and tactile gestural.
tick|0.5|0.7|A very short single soft wooden tick like a metronome at low intensity. Brief organic warm. Brief silence after the tick. Used for one-second timer beats — must be quiet enough to repeat without irritating.
applaus|2.0|0.5|A small gentle indoor applause from a few people about three seconds total. Soft hand claps overlapping warm room acoustic no large crowd no whistling. Inspired by a jazz club golf clap but warmer and friendlier. Quiet and dignified.
gong|2.0|0.5|A deep warm bronze gong struck softly with a felt mallet long resonant decay. Calm and grounded like a Buddhist meditation gong. Low frequency rumble underneath single bell tone above. Used for shift change or end of major work block. Peaceful never alarming.
EOF

# ─── Pro Sound: API-Call ────────────────────────────────────────────────

echo "→ Generiere 8 Sounds nach $OUT_DIR/"
echo ""

FILTER="${1:-all}"   # bash scripts/generate-sounds.sh aufnahme-start,gong  →  nur diese

while IFS='|' read -r NAME DURATION INFLUENCE PROMPT; do
  [[ -z "$NAME" ]] && continue
  if [[ "$FILTER" != "all" ]]; then
    if [[ ",$FILTER," != *",$NAME,"* ]]; then
      continue
    fi
  fi
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
