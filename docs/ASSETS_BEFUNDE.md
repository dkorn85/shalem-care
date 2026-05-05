# Asset-Brief · Befunde / Akte / Anamnese (RuFlow-Phase D)

**Stand:** 2026-05-05 · **Pipeline:** GPT Image 2.0 (Stills) + Seedance 2.0 (Loops)
**Ziel:** Visuelle Anker für die neue Befunde-Akte mit dualer Schulmedizin-/Tibetisch-Lesart.
Die SVG-Komponenten (Spine, Gait, Lab) liefern bereits funktional korrekte Diagramme —
diese Assets ergänzen sie um atmosphärische Bebilderung der Akte.

## Globale Regeln

> Editorial medical illustration aesthetic, soft watercolor + clean ink line.
> Color palette: bone, sage, dusty rose, oxidized brass, slate blue. No
> Instagram filter, no medical drama. Anatomy approximate-correct, not
> textbook precise — we want approachable not clinical. No text, no logos,
> no labels. Negative space for content overlay.

**Anti-Pattern:** vermeide Schock-Wunden, vermeide Stockfoto-Gesichter,
vermeide Plastik-Stethoskope-um-den-Hals, keine Hochglanz-Klinik.

---

## Block 7 · Befunde-Akte Header-Visuals (Stills, GPT Image 2.0)

### 7.1 · `/og/befunde.png` — OG-Card

```
Wide editorial composition 1200x630, top-down flat-lay on warm wood: a soft-
covered patient record opened to a hand-drawn spine diagram with two annotated
points; next to it a small ceramic bowl of dried herbs (juniper, ginger,
gentian) and a single tibetan medicine prayer-bead string. Soft morning light
left. Bone, sage, brass palette. No text, no logos.
```

### 7.2 · `/akte/header-multi-view.png` — Hero für /klient/akte/befunde

```
Square 1600x1600, soft watercolor + ink. Six small framed panels arranged
loosely: a stylized spine in lateral view, a blood-drop with three rings, a
walking figure mid-stride, a yin-yang of two intertwined herbs, a small
mountain silhouette, and a flickering oil lamp. Composition evokes a
"map of self." Bone, sage, dusty rose, brass. No text.
```

### 7.3 · `/akte/header-anamnese.png`

```
Editorial illustration 1600x1200, two hands meeting across a small wooden
table — one hand holding a fountain pen, the other resting open. A soft
notebook between them. Symbolizes "the conversation as the first treatment."
Soft warm window light from left. Bone, sage, brass. No text.
```

### 7.4 · `/akte/header-behandlung.png`

```
Editorial illustration 1600x1200, four hands of different ages reaching
together to support a small young plant in a clay pot. The pot sits on a
warm wooden surface. Symbolizes interdisciplinary care — pflege, arzt,
therapie, sozialarbeit. Bone, sage, dusty rose, brass. No text.
```

---

## Block 8 · Tibetisch-Medizinisch Visualisierungen (Stills)

### 8.1 · `/tibetisch/nyepa-drei.png` — Drei-Säfte-Diagramm

```
Square 1200x1200, soft watercolor symbolic diagram, three concentric circles
arranged in a triangle: top-left a feather (rLung — wind), top-right a small
flame (Tripa — fire), bottom-center a water-drop on a leaf (Beken — earth/water).
Thin connecting ink lines forming the triangle. Bone background, sage and
dusty rose accents. No text, no labels — pure symbolic shorthand.
```

### 8.2 · `/tibetisch/elemente-fuenf.png`

```
Square 1200x1200, five horizontal panels stacked: empty sky (raum), wisps
of cloud (luft), a single flame (feuer), a water drop on a stone (wasser),
a small handful of soil with a seed (erde). Soft watercolor, bone background.
No text.
```

### 8.3 · `/tibetisch/lebensgrundlagen-drei.png`

```
Square 1200x1200, three small ink-vignettes side by side: a seated figure
in profile (lus — body), a mouth in soft profile with breath visible (ngag —
speech/breath), a stylized cloud with a single thought-line (yi — mind).
Bone, sage. No text.
```

---

## Block 9 · Wirbelsäulen-Schadenstypen (Educational Stills)

Werden zukünftig auf der Wirbelsäulen-Diagramm-Seite als Icon-Sets neben
den Schadensmarkern eingeblendet (Phase 2). Pro Schadenstyp ein 200×200
Vector-Style-Symbol.

### 9.1–9.16 · `/medizin/schaden/{key}.png`

Pro Schadenstyp wird derselbe Prompt-Skeleton genutzt:

```
Square 400x400, single-color soft pencil-and-ink medical illustration on
bone background, anatomically schematic (not photorealistic), 30 % screen-
opacity. Subject:
  - bandscheibenvorfall:     "lumbar disc with posterior bulge into nerve root, lateral view"
  - bandscheibenprotrusion:  "lumbar disc with mild posterior bulge, lateral view"
  - spondylose:              "vertebrae with osteophyte spurs at the rims, lateral view"
  - spondylolisthese:        "two adjacent vertebrae offset, slipping forward"
  - skoliose:                "spine with three-curve S-shape, frontal view"
  - kyphose:                 "thoracic spine with exaggerated forward curve, lateral view"
  - lordose:                 "lumbar spine with exaggerated inward curve, lateral view"
  - morbus_bechterew:        "spine with vertebrae fused into a continuous bamboo-like column"
  - fraktur:                 "single vertebra with fracture line"
  - osteoporose:             "vertebra with sponge-like loss of bone density"
  - spinalkanalstenose:      "lumbar spine cross-section showing narrowed spinal canal"
  - facettengelenksarthrose: "facet joint between two vertebrae with worn cartilage"
  - blockierung:             "two adjacent vertebrae with restricted motion arrow"
  - muskelhartspann:         "paraspinal muscles with knotted thickening"
  - myelopathie:             "spinal cord with compression sign"
  - wurzelreizung:           "exiting nerve root with red glow at compression point"
No text, no labels, no logos. Style: instructional handbook woodcut, modern.
```

---

## Block 10 · Anamnese-Stimmungs-Bilder (Schema-Header)

Eines pro Berufsgruppe — Kopfzeile auf der Anamnese-Page.

### 10.1 · `/anamnese/header-pflege.png`

```
Editorial 1400x600, hands of a caregiver gently arranging a soft pillow under
an older person's hip in a sunny room. Backview, no faces visible. Bone, sage,
dusty rose. Negative space upper-right.
```

### 10.2 · `/anamnese/header-arzt.png`

```
Editorial 1400x600, a fountain pen resting on an open paper folder beside a
ceramic cup of tea. Bookshelf softly out of focus. No people visible. Bone,
slate blue, brass. Negative space upper-right.
```

### 10.3 · `/anamnese/header-therapie.png`

```
Editorial 1400x600, a folded yoga mat on warm wooden floor next to a small
foam roller and a single elastic band. Tall window light from left. Bone,
sage. No people, no logos.
```

### 10.4 · `/anamnese/header-sozial.png`

```
Editorial 1400x600, three small chairs arranged in a triangle around a low
wooden table with a single notebook open. Soft afternoon light. Bone, dusty
rose, sage. No people. Suggests dialog before words.
```

### 10.5 · `/anamnese/header-erziehung.png`

```
Editorial 1400x600, a child's drawing of a sun and a tree pinned to a wooden
wall, beside a small handful of building blocks. Soft daylight. Bone, primary
color accents kept muted. No text.
```

### 10.6 · `/anamnese/header-heilerz.png`

```
Editorial 1400x600, two hands signing in deutsche Gebärdensprache against a
warm wooden background, captured mid-gesture from waist-up framing, no faces.
Bone, sage, brass.
```

### 10.7 · `/anamnese/header-hauswirt.png`

```
Editorial 1400x600, a wooden tray with three small bowls — one with grain,
one with chopped vegetables, one with herbs — beside a folded linen napkin.
Soft window light. Bone, sage, brass.
```

### 10.8 · `/anamnese/header-ehrenamt.png`

```
Editorial 1400x600, two hands of different ages holding a small worn paperback
book together. Warm afternoon light. Bone, dusty rose. No faces.
```

---

## Block 11 · Atmosphärische Loops für die Akte (Seedance 2.0)

### 11.1 · `/loops/akte-puls.mp4` — sanfter Puls-Indikator

```
Macro close, slow heartbeat-rhythm pulsing of a single drop of water on a
stone surface, viewed top-down. The drop never breaks — only oscillates with
a slow rhythm matching a resting heart rate (~60 bpm). Cool daylight.
6 seconds, perfectly loopable. 1920x1080, 30fps.
```

### 11.2 · `/loops/akte-atem.mp4` — Atem-Visualisierung

```
Wide soft macro of a single sheer linen curtain breathing once in a slow
draft, then settling, then breathing again. Background: soft warm bokeh of
a window. 7 seconds, loopable. 1920x1080, 24fps.
```

### 11.3 · `/loops/akte-ganzheit.mp4` — Mandala-Andeutung

```
Top-down macro of three small bowls of dried herbs being arranged into a
triangle by a single hand. The hand places them slowly, then the camera
pulls back 5 % to reveal the symmetric arrangement. 8 seconds, loopable.
1920x1080, 24fps. Mood: composing wholeness from parts.
```

---

## Liefer-Reihenfolge (Empfehlung)

1. **Erstwelle:** Block 7 (Akte-Header) — gibt allen drei neuen Subseiten
   sofort visuelle Identität.
2. **Zweitwelle:** Block 10 (Anamnese-Header pro Beruf) — macht den
   Berufs-Tab-Wechsel atmosphärisch erlebbar.
3. **Drittwelle:** Block 8 (Tibetisch-Diagramme) — werden in DualeDeutung
   als kleine Inline-Symbole gerendert.
4. **Viertwelle:** Block 9 (Wirbelsäulen-Schadensikons) — sind zwar im
   Spine-Diagramm farblich kodiert, ersetzen die Farbe später durch
   echte schematische Icons.
5. **Polish:** Block 11 (Atmo-Loops) — feiner Hintergrund auf der Akte-
   Übersicht.

## Naming-Konvention

- Stills: `kebab-case.png` unter `apps/web/public/{akte,tibetisch,
  anamnese,medizin/schaden,og}/`
- Loops: `kebab-case.mp4` unter `apps/web/public/loops/`

Wenn die Bilder kommen, einfach in die jeweiligen Pfade legen — die
Komponenten zeigen sie automatisch (Fallback ist eingebaut).
