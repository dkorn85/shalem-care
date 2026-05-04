# Asset-Prompts v0.9 — was fehlt für den Hochglanz

> Stand: nach v0.9 Glow-up. Diese Liste ergänzt `docs/ASSETS.md` mit Prompts für noch fehlende visuelle und Audio-Assets.
>
> **Pipeline:** Higgsfield Marketing Studio + Nanobanan für statisch, Seedance 2.0 für animierte Loops, ElevenLabs für Audio. CapCut für Post.
>
> **Aesthetic-Klammer:** Soft-Rainbow + Apple-clean. Pure Backgrounds (Off-White `#FAFAF8`), generous whitespace, photography mit naturalem Licht — nie hyperreal-grell. Typografie Plus Jakarta Sans im Kopf behalten — Assets sollen mit der UI atmen, nicht gegen sie laufen.

---

## I. Hero-Video für die Landing — neue Variante

**Aktuell:** `/loops/09_loop_corridor_morning_16x9.mp4` (Krankenhaus-Korridor mit Morgenlicht). Solide, aber wir brauchen Variation für A/B-Tests und für Phase-1-Pilot-Pitch.

### Prompt 1A — "Hände, die etwas weiterreichen" (Übergabe-Metapher)
**Modell:** Seedance 2.0
**Aspect:** 16:9, 6 Sekunden, locked-off camera

```
Subject: Two pairs of hands meeting in the foreground — one carer's hand,
soft scrubs sleeve in muted teal, passing a folder or a small object to
another carer's hand, warm undertones. Both hands realistic, mid-30s and
mid-50s, naturally aged, no jewelry, no rings.

Action: Slow handover, subtle pause as the second hand accepts. Tiny smile
visible only at the corner of one mouth in the upper edge of frame, not full face.

Environment: Soft natural daylight from a window at left, off-white wall,
shallow depth of field. Hospital corridor or care home, modern but warm.

Camera: Static, locked-off tripod shot. Eye-level on the hands. No pan,
no zoom, no parallax. 50mm lens equivalent, f/2.8.

Style: Documentary realism, IMAX color grade. No glamor, no slow-motion
lens flares, no dramatic shadows. Like a still photograph that breathes.

Constraints: Camera locked-off, perfectly still. No music cues. Loop-able
last frame matches first frame. No text. No logos. Faces strictly out of
frame. Hands are the protagonists.
```

### Prompt 1B — "Sonne durchs Fenster, Pflanze, Stille"
**Modell:** Seedance 2.0
**Aspect:** 16:9, 4 Sekunden Loop

```
Subject: A single potted monstera or fiddle-leaf fig plant on a wide
windowsill, sunlight pouring through the window from camera-right.
Lightweight white curtain billows gently with imagined breeze.

Action: Curtain moves softly. Light dust motes float in the sun beam.
Plant leaves sway 1-2cm, organic.

Environment: Empty corridor or break room visible behind, soft-focus.
Off-white walls, terracotta floor. Time: late morning.

Camera: Static. Slight depth, plant in mid-ground.

Style: Apple-clean photography, naturally lit, warm shadows. Reference:
Hyatt or Aman hotel lifestyle photography.

Constraints: Camera locked-off. Loop-able. No people. No text. No music.
Wind motion completely smooth, 2-second cycle.
```

### Prompt 1C — "Wegmarkierung am Boden, Fußschritte vorbei"
**Modell:** Seedance 2.0, 5 Sek

```
Subject: Top-down view of a clean linoleum floor in a care facility.
A subtle painted way-finding line in soft teal runs left-to-right.
A pair of soft-soled white nursing shoes walks past, only feet visible
from knee down, neutral khaki trousers.

Action: Walk-through, unhurried pace. About 1.2 m/s. Shoes touch the
ground naturally — heel, ball, push off. Two steps in frame.

Environment: Even fluorescent + natural light mix. Floor is clean but
lived-in (one tiny scuff visible).

Camera: Top-down, locked. 90° angle to floor. 24mm equivalent. Static.

Style: Calm documentary, no music. Like an Apple ad about quiet diligence.

Constraints: Camera locked. Faces never in frame. Loop-able — second
walker enters from same side as first exits. No text on floor or shoes.
```

---

## II. Onboarding-Illustrationen (für Pilot-Onboarding-Flow)

Wenn neue Mitglieder sich für die Genossenschaft anmelden, brauchen wir
3-4 freundliche Vector-Illustrationen die durch den Flow führen.

### Prompt 2A — "Welcome / Genossenschaft beigetreten"
**Modell:** Nanobanan (Image Generation)
**Aspect:** 4:3, ~1200×900

```
Flat vector illustration in soft-rainbow palette (#FF6B6B, #FFA94D, #FFD53E,
#73DD66, #5DC9D4, #748FFC, #B197FC). White background.

Three abstract figures (no faces, just stylized shapes) standing in a
loose circle, holding what looks like a triangular keystone shape together.
The keystone is the Shalem Merkaba symbol — two interlocking triangles in
gold-amber wireframe.

Composition: Centered, generous negative space top and bottom. Figures
each in a different rainbow color. Their hands meet at the keystone.

Style: Geometric abstraction, very flat (no gradient shading), thin line
weight (1.5px), Susan Kare meets Bauhaus. Feels welcoming, not corporate.

Constraints: No realistic faces. No text. No depth shadows. Pure flat.
Background pure white. No watermarks.
```

### Prompt 2B — "Skill-Profil / Was kannst du?"
**Modell:** Nanobanan
**Aspect:** 4:3

```
Flat vector illustration. A figure (abstracted, no face) faces a floating
panel with three rounded badge-shapes hovering near them. Each badge
shows a small icon: a heart (Pflege), a wrench (Praxis), a leaf (Kontinuität).

Style: Same soft-rainbow palette. Figure in teal, badges each in different
rainbow colors. Light dotted leader-lines connect figure to badges.

Composition: Off-center figure to left, badges floating mid-right.
Generous whitespace.

Constraints: Flat, no shadows, no faces. Thin lines 1.5px. White background.
```

### Prompt 2C — "Erste Schicht angenommen — Confetti-Moment"
**Modell:** Nanobanan, 4:3

```
Flat vector illustration showing a checkmark badge (rounded square)
in the center, with abstract confetti shapes (small triangles, circles,
squiggles) bursting outward in soft-rainbow colors. The checkmark itself
is in calm teal (#1D9E75).

Composition: Confetti explodes outward from center, but very gentle —
no chaos. Maybe 12-16 confetti pieces total. Generous whitespace.

Style: Apple onboarding-screen illustration aesthetic. Flat, no gradients,
no shadows. Rounded edges everywhere.

Constraints: Pure white background. No faces. No text. Confetti pieces
each in a single color from the rainbow palette.
```

### Prompt 2D — "Empty State: Keine offenen Schichten"
**Modell:** Nanobanan, 1:1

```
Flat vector illustration. A small calendar grid (3×3 squares) in light
gray, with one square highlighted in soft teal. A small figure (abstract,
no face) stands next to the calendar, hand on chin, slightly tilted head
(curiosity pose). One squiggly question-mark shape floating above figure.

Composition: Centered, calendar and figure roughly equal weight. Plenty
of whitespace.

Style: Calm, friendly. Soft palette: gray + teal + amber accent on the
question mark. Very flat. Thin lines.

Constraints: White background. No realistic face. No text in image.
```

---

## III. Sound Effects (ElevenLabs)

Subtle audio cues für drei Schlüssel-Momente. Sehr leise, sehr kurz, nicht aufdringlich.

### Prompt 3A — "Schicht angeboten / Markt-Eintrag"
**Modell:** ElevenLabs Sound Effect
**Duration:** 0.4s

```
A soft, single warm woodblock tap, like a gentle "tock" — not metallic,
not digital. Acoustic. Like placing a coin on a wooden table softly.
Decay quick, no reverb tail beyond 100ms. Single occurrence, no rhythm.
Mid-low frequency around 800Hz fundamental.
```

### Prompt 3B — "Tausch akzeptiert / Match gefunden"
**Modell:** ElevenLabs SFX
**Duration:** 0.6s

```
A short, ascending two-note chime in a major third interval. Bell-like
but soft, like a small singing bowl gently struck twice. Warm overtones.
Notes around 600Hz and 750Hz. Total duration under 600ms. Light reverb,
~200ms tail. Not synthesized — feels organic.
```

### Prompt 3C — "Genehmigung / Approval erteilt"
**Modell:** ElevenLabs SFX
**Duration:** 0.5s

```
A single confident "ding" — like a hotel concierge bell, once. Bright
but not piercing. ~1200Hz fundamental with rich overtones. Clean attack,
medium decay (300ms tail). Affirmative without being celebratory.
```

---

## IV. Voiceover Snippets für Pitch-Video

Für ein 90-Sekunden-Pitch-Video das du beim Genossenschaftsberater oder Pilot-Träger zeigst.

### Prompt 4A — Sprecher-Stimme
**Modell:** ElevenLabs TTS, Voice: Juniper oder ähnlich (warm, female, mid-30s, German)

**Skript:**
```
Pflege ist Beziehungsarbeit. Aber das Vertragsmodell behandelt sie wie
Industriearbeit. Verwaltungsebenen fressen 30 bis 50 Prozent des Geldes,
das eigentlich für Pflege da wäre.

Shalem Care ist anders. Eine Plattform, die ihren Mitgliedern gehört.
Wie Mondragon, aber für Pflege. Mit KI-Disposition wie bei einem Rettungsdienst —
aber ohne Notfall-Stress. Open Source, weil Pflege Gemeingut ist.

Drei Sichten. Eine Plattform. Ein Ziel: Pflegekräfte werden Mit-Eigentümer,
Klienten werden gesehen, Träger werden zu Service-Partnern. Vier Prozent
Plattform-Cut statt fünfzig Prozent Verleiher-Marge.

Phase eins läuft. Pilot ab Q3 2026 in Essen. Mach mit — als Mitglied,
als Pilot-Partner, als Code-Beitragender.

Shalem. Vollständig. Heil. Im Frieden.
```

### Prompt 4B — Background Music
**Modell:** ElevenLabs Music
**Duration:** 95s

```
Ambient, hopeful, minimal. Sparse piano melody, soft string pad layered
underneath. Tempo: 72 BPM, very subdued. No drums, no percussion until
the last 10 seconds where a single hand-claps rhythm gently enters.
Key: D major. Mood: Sunday morning warmth, public radio documentary,
Brian Eno's "Music for Airports" if it had hope. Not corporate, not
elevator-music. Like a Studio Ghibli credits sequence in tone.
```

---

## V. Iconography für Pflegegrade

Aktuell zeigen wir Pflegegrade als reine Zahlen. Eine kleine visuelle Ergänzung würde der Klient-Sicht und Erlös-Page Ruhe geben.

### Prompt 5 — Pflegegrad-Icons 1 bis 5
**Modell:** Nanobanan
**Aspect:** Square SVG-style, fünf Varianten

```
Five flat icon designs, one per pflegegrad level.

Each icon shows a small figure standing/sitting in different states of
support. Style: extremely simple line-art, single-color (will be re-tinted
in CSS), thin strokes (2px equivalent). 24×24 unit grid.

PG 1: Standing figure, alone, slight cane.
PG 2: Standing figure, one helper hand visible at side (just a hand shape).
PG 3: Sitting figure on chair, one helper hand.
PG 4: Reclined figure on lounger, two helper hands.
PG 5: Bed icon with figure outline, three soft support shapes around.

Constraints: All same proportions. Pure outline, no fills. No faces.
No emotional depiction. Universal. Will be used in dignified clinical
contexts. Not infantilizing.
```

---

## VI. Datenschutz-Visualisierung

Für die DSGVO-Erklär-Page: eine ruhige Vector-Grafik die zeigt "deine Daten gehören dir".

### Prompt 6
**Modell:** Nanobanan
**Aspect:** 16:9 oder 4:3

```
Flat vector illustration. A figure on the left side holds a small
luminous shape (key shape, simplified). Lines extend from this key to
small data icons floating around — a heart-pulse waveform, a calendar,
a location pin, a star (rating). All connections are dotted lines that
pass through the figure first, then to the icons.

The visual metaphor: data flows through the figure, not around them. The
figure is the gatekeeper.

Style: soft-rainbow palette. Background: off-white. Clean, minimal.

Constraints: No face, abstract figure. Thin 1.5px lines. No depth shadows.
No corporate gloss. Friendly.
```

---

## VII. Mood-Board Referenzen (für Stil-Kontrolle)

Für den Designer:in oder die KI-Pipeline, hier sind die ästhetischen Anker:

- **Apple iOS 17/18 Health App** — flat, generous whitespace, soft color encoding für Health-Werte
- **Linear.app Onboarding** — minimaler Vektor, sparsame Animation, niemals laut
- **Studio Ghibli backgrounds** — natürliches Licht, Ruhe, Wärme
- **Susan Kare Mac-Icons** — geometrische Abstraktion, freundlich-precise
- **Charlotte Reed** (UK Pflege-Fotografin) — wie man Pflege würdevoll fotografiert

**Was wir nicht wollen:**
- Stockphoto-Pflegekraft-mit-Senior-im-Vordergrund
- Hyperreale 3D-Renderings
- Glow-Lens-Flares
- Gradients mit aggressiver Sättigung
- Dramatic spotlights
- "Heroische" Blickwinkel von unten

---

## Priorität

Wenn nur drei Assets gebaut werden können vor dem ersten Pilot-Pitch:

1. **Prompt 4A (Pitch-Voiceover)** — direkt einsetzbar im Investorengespräch
2. **Prompt 1B (Sonne durchs Fenster)** — neutralster Hero-Loop, alle Träger akzeptieren das visuell
3. **Prompt 2C (Confetti-Moment)** — feiert die ersten gewonnenen Schichten in der App

Die anderen Assets sind für Phase 1.5+ wenn die Plattform skaliert.
