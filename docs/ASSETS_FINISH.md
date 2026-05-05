# Asset-Brief · Final-Schliff (Phase F)

**Stand:** 2026-05-05 · **Pipeline:** GPT Image 2.0 (Stills, Grid-Prompts) + Seedance 2.0 (sehr selektiv für Loops)
**Ziel:** Polish-Layer · UI-Icons · Status-States · Avatar-Vervollständigung · OG-Cards-Lücken · Mikro-Patterns. Wenige neue Videos — der visuelle Stack ist mit ~15 Loops bereits dicht.

Setzt die Stilsprache der vorherigen Briefe (Block 1–24) fort:
> `bone, sage, dusty rose, oxidized brass, slate blue` — soft watercolor + clean ink line. Approachable not clinical. No text in images, no logos.

## Globale Grid-Prompt-Regel

Bei Icon-Sets nutze ich **9-up Grids** (3×3) statt einzeln zu generieren — spart Renderings und garantiert visuelle Konsistenz innerhalb einer Familie. Schneide nach Generation einzeln aus.

```
9-up grid layout, 3x3 cells, each cell 1024x1024, thin sage divider
lines between cells, identical watercolor + ink style across all cells,
shared bone background, no labels, no text. [...individual cell briefs...]
```

GPT Image 2.0 ist gut darin, einen 3072×3072-Output mit 9 erkennbaren Sub-Bildern zu liefern. Pipeline-Tipp: Suffix immer `"all nine cells must share the same color palette and brushstroke weight."`

---

## Block 25 · Status-Icon-Grid (1 Render → 9 Icons)

Kritische Lücke: aktuell nutzt die App generische Symbole (✓, ✗, …) für Status-Anzeigen. Diese 9 Icons machen die Status-Sprache erkennbar.

### 25.1 · `/icons/status-grid.png` — Master-Grid 3072×3072

```
9-up grid, 3x3 cells of 1024x1024, watercolor + clean ink line, bone
background, sage and brass accents. All cells must share identical
brushstroke weight and color saturation. No text.

Cell 1 (top-left, "success"): a single small olive sprig in a pottery
cup, leaves slightly trembling — symbol for "abgeschlossen / verifiziert".
Sage + brass.

Cell 2 (top-mid, "in-progress"): three small hand-drawn dots in a row,
the middle one larger than the others, slight motion blur — "in
Bearbeitung". Bone + dusty rose.

Cell 3 (top-right, "warning"): a single oil lamp glow, flame steady but
brighter than usual, short wisp of smoke — "achtsam, Aufmerksamkeit".
Brass + ochre.

Cell 4 (mid-left, "error"): a small bowl of water with a stone resting
on its surface, ripples around the stone — gentle "etwas stockt".
Slate blue + bone. NO red, NO drama.

Cell 5 (mid-center, "info"): a single open book with a sage-ribbon
bookmark, lying flat. Bone + sage.

Cell 6 (mid-right, "loading"): three concentric watercolor rings, the
outer ring softer than the inner — radiating patience. Bone + brass.

Cell 7 (bottom-left, "empty"): an empty wooden tea-tray with a single
folded napkin, suggesting "noch nichts da, aber bereit". Bone + brass.

Cell 8 (bottom-mid, "private"): a small folded letter sealed with wax,
wax stamp visible but unclear — "vertraulich". Brass + dusty rose.

Cell 9 (bottom-right, "shared"): two small cups touching at the rim,
sharing a single visible breath of steam. Sage + bone. Symbolizes
"gemeinsam / cross-profession".
```

**Output zerteilen** in: `/icons/status-success.png`, `/icons/status-progress.png`, `/icons/status-warning.png`, `/icons/status-error.png`, `/icons/status-info.png`, `/icons/status-loading.png`, `/icons/status-empty.png`, `/icons/status-private.png`, `/icons/status-shared.png`.

---

## Block 26 · Aktions-Icon-Grid (Verifizierung-Pipeline)

Für die Verifizieren-Wizard-Page und das Treuhand/Compliance-Modul.

### 26.1 · `/icons/aktion-grid.png` — Master-Grid 3072×3072

```
9-up grid, 3x3 cells of 1024x1024, watercolor + clean ink. Bone
background, sage + brass + dusty rose accents, identical style across
all cells. No text.

Cell 1 (top-left, "upload"): a hand placing a folded letter into a
small wooden box, halfway in. Bone + brass.

Cell 2 (top-mid, "scan"): a magnifying glass lying flat over a sheet
of paper, soft watercolor light through the lens. Sage + bone.

Cell 3 (top-right, "sign"): a fountain pen mid-stroke on cream paper,
ink pooling slightly. Brass + dusty rose.

Cell 4 (mid-left, "verify"): a wax seal pressed half-onto a folded
document, the impression visible but soft. Brass.

Cell 5 (mid-center, "approve"): two hands meeting in a quiet handshake
across a table, only forearms visible. Sage + bone.

Cell 6 (mid-right, "reject"): a single hand returning a folded letter
back across the table, palm facing up — gentle, not dismissive.
Slate blue + bone.

Cell 7 (bottom-left, "edit"): a hand lifting a thin piece of paper
slightly, ready to amend. Bone + brass.

Cell 8 (bottom-mid, "download"): a folded letter being lifted out of
a wooden box. Bone + brass. (Inverse von cell 1.)

Cell 9 (bottom-right, "delete"): a small clay bowl with crumbled paper,
no fire — quiet retirement, not destruction. Bone + ochre.
```

**Output zerteilen** in: `/icons/aktion-upload.png`, `/icons/aktion-scan.png`, `/icons/aktion-sign.png`, `/icons/aktion-verify.png`, `/icons/aktion-approve.png`, `/icons/aktion-reject.png`, `/icons/aktion-edit.png`, `/icons/aktion-download.png`, `/icons/aktion-delete.png`.

---

## Block 27 · Persona-Avatar-Lücken (Einzelbilder, kein Grid)

Aktuell in `/people/` und `/portraits/`: ~10 Persona-Bilder. Es fehlen Avatare für 5 Personas die regelmäßig in den Cockpits referenziert werden.

| Datei | Person | Briefing |
|---|---|---|
| `/people/person-mh-lead.png` | Mira Hartwig (WBL St. Lukas) | Square 1024×1024, watercolor portrait silhouette, three-quarter view from the left. A woman in her late 50s, kind face, steady gaze, hair tied back. Wearing a soft cardigan in sage. Bone background. Approachable, not clinical. No badge, no logo. |
| `/people/person-bf-lead.png` | Bernd Friedhof (Tour-Süd Augsburg) | Square 1024×1024, watercolor portrait silhouette, three-quarter view from the right. Bavarian man in his 50s, weathered hands, glasses, warm smile-lines. Wearing a casual blue shirt under a brass-toned vest. Bone background. |
| `/people/person-wm-lead.png` | Werner Marsch (Wasserturm Berlin) | Square 1024×1024, watercolor portrait silhouette. Berlin nursing-home lead, mid-60s, salt-and-pepper beard, reading glasses on the forehead. Slate-blue cardigan. Bone background. |
| `/people/person-fk-004.png` | Felix Kaminski (Pflege-Frühdienst) | Square 1024×1024, young pflege-fachkraft mid-20s, three-quarter portrait, alert and attentive eyes. Sage-green pflege-shirt visible at shoulders. Bone background. |
| `/people/person-rt-017.png` | Rita Tschirner (Hospiz-Ehrenamt) | Square 1024×1024, woman in her late 70s, gentle eyes, long grey hair pinned up, wearing a knitted dusty-rose cardigan. Hands folded. Bone background. Symbolizes "ehrenamtliche Würde, Erfahrung". |

---

## Block 28 · Mikro-Patterns (3 Stills für Section-Backgrounds)

Subtile Watercolor-Texturen die hinter Sektionen liegen können — niemals dominant, immer als 5–8% Opacity-Layer.

### 28.1 · `/patterns/sage-leaves.png` — 2048×1024

```
Wide watercolor texture, 2048x1024, scattered sage leaves and small
brass twigs over bone background. Loose, organic, not symmetric.
Designed to be tiled or used as low-opacity section background.
No text, no focal subject.
```

### 28.2 · `/patterns/brass-grain.png` — 2048×1024

```
Watercolor texture, 2048x1024, soft brass-toned vertical grain like
parchment held to morning light. Bone underlay, subtle dust-rose
flecks. For section backgrounds at low opacity.
```

### 28.3 · `/patterns/slate-mist.png` — 2048×1024

```
Watercolor texture, 2048x1024, soft slate-blue mist drifting laterally
across bone background. Like fog over an early morning lake. For
"Compliance" + "Treuhand" section backgrounds.
```

---

## Block 29 · OG-Cards Vervollständigung (5 fehlende Stück)

Aus Block 18 noch ausstehend. Alle 1200×630, gleiche Komposition wie bestehende OG-Cards.

### 29.1 · `/og/db-status.png`
```
Wide editorial 1200x630, top-down: a small wooden card-catalog drawer
half-pulled-out, several index cards visible, each card labeled (visible
shape, no readable text) with a small handwritten symbol. Symbolizes
"Stamm-Daten gepflegt." Bone, sage, brass. No text.
```

### 29.2 · `/og/inbox.png`
```
Wide editorial 1200x630, three small wooden post-office cubbyholes,
each with a different folded letter sticking out (sage, brass, dusty
rose). Warm side-light from left. Bone background. No text.
```

### 29.3 · `/og/genossenschaft-onboarding.png`
```
Wide editorial 1200x630, top-down: a hand half-pressed a wax seal onto
a folded membership-letter, seal still cooling. A second folded letter
beside it, tied with a sage ribbon. Bone, brass. No text.
```

### 29.4 · `/og/heilerziehung.png`
```
Wide editorial 1200x630, two pairs of hands binding a soft wool scarf
together — symbolizes "Teilhabe-Begleitung." Bone, dusty rose, sage.
No faces visible. No text.
```

### 29.5 · `/og/hauswirtschaft.png`
```
Wide editorial 1200x630, top-down: a soft-focus pot on a warm hearth-
stone, a folded dishtowel beside it, a single ripe apple on a wooden
board. Bone, brass, dusty rose. No text.
```

---

## Block 30 · Audio-Visualizer-Loops (sehr klein, sehr selektiv — 2 Loops)

Der einzige Video-Block in diesem Brief. Diese Loops dienen als visuelles Pendant zu den ElevenLabs-Stimmen — winzige Watercolor-Wellen, die "spricht gerade" signalisieren.

### 30.1 · `/loops/voice-lana-wave.mp4` — 4 s Loop · 256×64

```
4-second seamless loop, 256x64 px (Banner-Strip), watercolor: a soft
sage-green horizontal waveform like ink-on-water — gentle pulse with
4 peaks per loop, organic not technical. Bone background. Symbolizes
"Lana spricht."
```

### 30.2 · `/loops/voice-dennis-wave.mp4` — 4 s Loop · 256×64

```
4-second seamless loop, 256x64 px, watercolor: a soft slate-blue
horizontal waveform, slightly slower pulse than voice-lana (3 peaks per
loop, deeper amplitude). Bone background. Symbolizes "Dennis spricht."
```

Werden hinter den Voice-Buttons (`<AudioPrompt>`) als 8% Opacity-Layer gelegt — nur sichtbar wenn der Voice-Button "playing"-Zustand hat.

---

## Liefer-Checkliste

**Stills (GPT Image 2.0):**
- 25.1 Status-Grid (1 Render → 9 Icons)
- 26.1 Aktions-Grid (1 Render → 9 Icons)
- 27.1–27.5 Avatar-Einzelbilder (5 Renders)
- 28.1–28.3 Mikro-Patterns (3 Renders)
- 29.1–29.5 OG-Cards (5 Renders)

→ **23 Renders insgesamt**, davon 2 Grid-Renders die in 18 einzelne Icons zerschnitten werden = effektiv **41 Asset-Files**.

**Loops (Seedance 2.0):**
- 30.1, 30.2 — **2 Loops** total (gegenüber den 15+ aus vorherigen Briefs · bewusst minimal)

---

## Pipeline-Hinweise

**Grid-Generation:** GPT Image 2.0 hält 3×3-Grids gut wenn:
- Cell-Beschreibungen konsistent in der Länge (3–5 Zeilen pro Cell)
- Suffix `"all nine cells must share identical brushstroke weight, color saturation, and bone background"`
- Keine numerische Beschriftung in den Cells (keine "1", "2" sichtbar)

**Zerschneiden:** Output ist 3072×3072. Schneide auf 9 × 1024×1024-Tiles (top-left, top-mid, top-right, …, bottom-right). Tools: ImageMagick `convert -crop 1024x1024 grid.png cell_%d.png` oder einfach Photoshop-Slices.

**Watercolor-Konsistenz:** wenn Renders sich zwischen Sessions stilistisch unterscheiden, hängt es meistens an *seed*-Drift. Gib bei einer ganzen Welle den exakt gleichen Suffix:
> `loose handmade feel, paint-bleed edges, slightly imperfect — not digital-clean. Brush size 4mm, ink line 0.3mm.`

---

## Abgrenzung zu vorherigen Blöcken

Was **NICHT** Teil dieses Briefes ist:
- Hero-Bilder · alle bereits in Block 13–24 ausgeliefert
- Onboarding-Tour-Loops · komplett (Block 24)
- Klartext-Begleiter-Header · komplett (Block 17)
- Demo-Modi-Visuals · komplett (Block 20)
- Persona-Stills für die 12 Hauptpersonas · vorhanden in `/portraits/`

Dieser Brief schließt die letzten Lücken ohne neue Erzähl-Schichten zu öffnen.
