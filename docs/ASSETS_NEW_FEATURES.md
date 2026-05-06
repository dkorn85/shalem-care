# Asset-Brief · neue Features (Solidar-Topf, Pool, KI-Brücke, Profil)

**Stand:** 2026-05-06 · **Pipeline:** GPT Image 2.0 (Stills) + Sora-2 / Seedance (Loops)
**Ziel:** Den neu gebauten Surfaces dedizierte Bilder geben statt `/akte/header-konferenz.png` zu recyceln.

> **Style-Anker** wie immer: `bone, sage, dusty rose, oxidized brass, slate blue` — soft watercolor + clean ink line. **No text, no logos, no recognizable medical brand names**. Approachable, not clinical.

GPT-Image-2.0-Suffix für **alle** Stills:
> `"soft watercolor + ink line, palette: bone, sage, dusty rose, oxidized brass, slate blue. No text, no logos, no brand marks. Approachable, dignified, not clinical."`

## Hintergrund-Strategie (Transparenz-Realität)

GPT Image 2.0 / Pixella liefern keine echten Alpha-Pixel. Drei pragmatische Pfade je nach Asset:

| Asset-Typ | Hintergrund-Strategie | Post-Processing |
|-----------|----------------------|-----------------|
| **Portraits/Personen** (40.x Fallback-Avatare) | flat chroma-green `#00B140`, no shadows, no spill | Pixella „Remove Background" oder `magick in.png -fuzz 8% -transparent "#00B140" out.png` |
| **Line-Icons auf Bone-Cards** (41.x, 43.x) | flat solid `#FAFAF8` bone (= App-Surface) | keins — das Icon sitzt optisch transparent auf der Karte |
| **Line-Icons auf Akzent-Chips** (37.2, 37.3, 38.2, 39.2, 42.x) | flat chroma-green `#00B140` | wie Portraits keyen, sonst ist Bone-Rand auf Sage-Chip sichtbar |
| **Heros** (37.1, 38.1, 39.1) | volle Watercolor-Komposition mit Hintergrund | keins — Bild wird flächig genutzt |
| **Loops** (37.4, 39.3) | dunkle Watercolor-Komposition | im CSS via `mix-blend-mode: soft-light` (Pattern in [HeroBanner.tsx:77](../apps/web/components/HeroBanner.tsx)) |

Pragmatik: bei Icons die hauptsächlich **auf Bone-Karten** liegen (Status-Tiles, Inline-Lines) lohnt der Chroma-Key-Aufwand nicht — generier auf Bone und nutze sie direkt. Nur bei farbigen Chip-Backgrounds (`rgb(var(--mon) / 0.15)` etc.) ist Chroma-Key nötig.

---

## Block 37 · Solidar-Topf · Krankheits-/Verdienstausfall-Schutz (3 Stills · 1 Loop)

### 37.1 · `/akte/header-solidartopf.png` · Hero (16:9, 2400×1500)

```
Wide horizontal scene 2400x1500, soft watercolor + ink line. Six pairs
of hands of mixed ages and skin tones forming a circle that holds a
single ceramic bowl in the center. The bowl glows with a warm sage-green
gold tint, suggesting collected coins or grain. Above the bowl, faint
flowing lines connect to each pair of hands like an invisible promise
ledger. Background: warm bone with dusty rose mist, soft bokeh of a
window with morning light. Palette: bone, sage, dusty rose, oxidized
brass, slate blue. No text, no logos, no brand marks. Approachable,
dignified, not clinical. Composition: bowl off-center to the right,
hands forming an open ring, lower-third has empty space for headline
overlay.
```

### 37.2 · `/icons/topf-schutz.png` · Solidar-Icon (1:1, 512×512, transparent)

```
Square 512x512 transparent PNG, soft watercolor + ink line icon.
Stylized open ceramic bowl seen from 3/4 above, holding a single
sprouting sage-green leaf, with a faint golden ring above the bowl rim
suggesting collective contribution. Palette: bone, sage, oxidized brass.
No text, no logos. Background flat solid #FAFAF8 bone (same as app surface — looks transparent on cards). For chips with colored backgrounds, regenerate with chroma-green #00B140 background and key out in Pixella/ImageMagick.. Icon is centered with
balanced negative space, suitable as 64-128px tile.
```

### 37.3 · `/icons/krankschutz.png` · Krank-aber-getragen (1:1, 512×512)

```
Square 512x512 transparent PNG, soft watercolor + ink line icon.
A small crescent-moon shape resting on an open palm seen from below;
above the moon a single line connects to a soft glowing dot suggesting
'someone else is awake for you'. Palette: bone, slate blue, dusty rose.
No text. Background transparent. Use cases: Krankmeldung-Card,
Solidar-Profil-Tile, Status-Chip 'getragen'.
```

### 37.4 · `/loops/topf-fluss.mp4` · ambient loop (16:9, 8s, 30fps)

```
Soft watercolor + ink line, 16:9, 1920x1080, 8 seconds, seamless loop.
Continuous slow flow of golden-sage liquid pouring from many small
streams into one central ceramic bowl. The bowl never overflows — the
streams arrive and the level rises and falls in a gentle breathing
rhythm. No people, no faces. Palette: bone background, sage liquid,
oxidized brass highlights, dusty rose mist. No text, no logos. Loop-cut
seamless: end frame matches start frame.
```

---

## Block 38 · Genossenschafts-Pool · Arbeitsamt-Ersatz (2 Stills)

### 38.1 · `/akte/header-pool.png` · Hero (16:9, 2400×1500)

```
Wide horizontal scene 2400x1500, soft watercolor + ink line. Side-by-
side comparison: left half shows a steep vertical pyramid of small
abstract figures with one large figure at the top — muted, slightly
desaturated, foggy. Right half shows the same number of figures
arranged in a flat horizontal ring around an open table — warmer,
sharper, with a single shared object on the table (a key, a contract).
A thin line in the middle separates the two halves but does not divide
the canvas hard — it fades out top and bottom. Palette: bone, slate
blue (left), sage + dusty rose (right). No text, no labels on figures,
no logos. Approachable, dignified.
```

### 38.2 · `/icons/match-pool.png` · Pool-Match-Icon (1:1, 512×512)

```
Square 512x512 transparent PNG, soft watercolor + ink line icon.
Two overlapping circles forming a Venn-Diagram shape, each circle a
different soft pastel (sage and slate-blue), and inside the overlap a
small sprouting sage leaf. The circles have hand-drawn ink contours.
No text. Background transparent. Use case: KI-Match-Score-Tile,
Pool-Stelle-Card.
```

---

## Block 39 · KI-Berufs-Brücke (2 Stills · 1 Loop)

### 39.1 · `/akte/header-ki-bruecke.png` · Hero für /ki-Showcase (16:9, 2400×1500)

```
Wide horizontal scene 2400x1500, soft watercolor + ink line. A small
wooden footbridge over a calm stream, connecting two riverbanks of
different earth tones (left bank sage, right bank dusty-rose). On each
bank stands a small abstract figure (no faces, just silhouettes in
warm clothing), reaching toward the other across the bridge. Above the
bridge, faint glowing thread-lines suggest words or thoughts crossing.
Palette: bone background, sage left, dusty rose right, oxidized brass
bridge, slate blue stream. No text, no logos. Composition: bridge
spans the lower-third, sky open for headline.
```

### 39.2 · `/icons/bruecke-uebersetzung.png` · Übersetzungs-Icon (1:1, 512×512)

```
Square 512x512 transparent PNG, soft watercolor + ink line. Two
speech-bubble shapes (one round, one rectangular) connected by a thin
arched bridge line. Inside each bubble a single abstract glyph — the
left one a circle, the right one a square — implying different
languages. Bridge in oxidized brass, bubbles in sage and slate blue.
No text. Background transparent. Use case: KI-Berufs-Brücke-Trigger
neben jedem fachlichen Eintrag.
```

### 39.3 · `/loops/ki-bruecke-pulse.mp4` · KI-Brücke arbeitet (16:9, 6s, 30fps)

```
Soft watercolor + ink line, 16:9, 1920x1080, 6 seconds, seamless loop.
The same wooden footbridge from 39.1 in close-up. Faint glowing pulses
of pale-gold light travel back and forth across the bridge in gentle
rhythm — left to right, then right to left. Bridge breathing-stable,
water below has faint ripples. Palette: bone, sage, oxidized brass,
slate blue. No people, no text. Loop-cut seamless.
```

---

## Block 40 · Profilbild-Fallback-Set (6 Stills · 1:1, 512×512)

Zweck: wenn Mitglied/Klient noch kein eigenes Profilbild hochgeladen
hat, zeigt der `ProfilbildUpload`-Component aktuell eine Initialen-
Bubble mit Brand-Gradient. Schöner: **6 generische Stand-In-Avatare**
in der Stilsprache der Portrait-Reihe `10_X`, neutral-warm, keine
spezifische Person. User kann beim Onboarding einen davon wählen
("ich will erst mal ohne Foto") oder das System rotiert zufällig.

```
Pattern für alle 6: Square portrait 512x512, soft watercolor + ink line.
A simplified human silhouette from the shoulders up, abstracted, no
facial features (just a soft suggestion of eyes and mouth via shading).
Each variant a different pastel hue:

  /portraits/fallback-01-sage.png      — sage green base
  /portraits/fallback-02-rose.png      — dusty rose
  /portraits/fallback-03-slate.png     — slate blue
  /portraits/fallback-04-brass.png     — oxidized brass
  /portraits/fallback-05-bone.png      — warm bone
  /portraits/fallback-06-mint.png      — soft mint

Background a soft radial gradient of the same hue, no harsh edges.
Palette per variant. No text, no logos, no specific facial features
(this is intentional — generic stand-in). Approachable, dignified.
Render the silhouette so it works at 64px and 128px equally.
```

---

## Block 41 · Pool-Bewerbungs-Status-Icons (3 Stills · 1:1, 256×256)

Zweck: aktuell ist der `PoolBewerbungForm` nur Text + ein farbiger
Stripe. Ein 24-32px Status-Icon pro Bewerbungs-Phase macht den
Workflow klarer.

### 41.1 · `/icons/bewerbung-eingegangen.png`

```
Square 256x256 transparent PNG, soft watercolor + ink line icon. A
small folded letter shape, the seal a tiny sage-green dot. Subtle
shadow indicating it has just landed on a surface. Palette: bone, sage,
oxidized brass. No text. Background transparent.
```

### 41.2 · `/icons/bewerbung-pruefung.png`

```
Square 256x256 transparent PNG, soft watercolor + ink line icon. The
same letter shape from 41.1 but slightly tilted, with a faint
magnifying-glass arc above it. Palette: bone, slate blue, oxidized
brass. No text. Background transparent.
```

### 41.3 · `/icons/bewerbung-zusage.png`

```
Square 256x256 transparent PNG, soft watercolor + ink line icon. A
small key passed between two hands (only fingertips visible). Key in
oxidized brass, hands in soft bone tone. Palette: bone, sage, oxidized
brass, dusty rose accent. No text. Background transparent.
```

---

## Block 42 · Sprache-Niveau-Icons (4 Stills · 1:1, 256×256)

Zweck: im Profil-Menschlich-Bereich werden Sprachen mit Niveau gezeigt
(`muttersprache | verhandlung | alltag | grundkenntnis`). Aktuell nur
farbige Chip-Hintergründe — ein Icon pro Niveau hebt den Status.

### 42.1 · `/icons/sprache-mutter.png` (sage)

```
Square 256x256 transparent PNG, soft watercolor + ink line icon. Three
concentric circles drawn freehand, each a slightly thicker sage-green
ink line — the innermost line filled solid sage. Suggests deep rooting.
Palette: bone background (transparent in PNG), sage. No text.
```

### 42.2 · `/icons/sprache-verhandlung.png` (slate blue)

```
Square 256x256 transparent PNG, soft watercolor + ink line icon. Two
concentric circles, the outer thin and dashed slate-blue, the inner
solid filled slate-blue. Suggests confident but not native command.
Palette: bone background, slate blue. No text.
```

### 42.3 · `/icons/sprache-alltag.png` (sun)

```
Square 256x256 transparent PNG, soft watercolor + ink line icon. One
solid filled circle in warm sun-yellow with a single short tangent
line touching the right edge — open to growth. Palette: bone, soft
sun-yellow. No text.
```

### 42.4 · `/icons/sprache-grund.png` (mute)

```
Square 256x256 transparent PNG, soft watercolor + ink line icon. A
single thin dashed circle outline in fg-mute neutral grey. Suggests
basic awareness, not yet command. Palette: bone, neutral grey. No text.
```

---

## Block 43 · Voice-Wave-Icons (2 Stills · 1:1)

Zweck: Aria-Live-Region + Audio-Toggle haben aktuell kein Icon.
Screenreader-User profitieren weniger, sehende User aber stark — der
Sprach-Layer wird sichtbar.

### 43.1 · `/icons/voice-on.png` (1:1, 256×256)

```
Square 256x256 transparent PNG, soft watercolor + ink line icon. A
small speaker silhouette with three concentric arcs flowing outward to
the right, the arcs in oxidized brass with sage-green tips. Palette:
bone, sage, oxidized brass. No text. Background transparent. Use case:
GlobalLiveRegion active state, AudioMuteToggle "an"-Zustand.
```

### 43.2 · `/icons/voice-off.png` (1:1, 256×256)

```
Square 256x256 transparent PNG, soft watercolor + ink line icon. The
same speaker silhouette as 43.1, but the arcs are absent and a single
soft diagonal stroke in dusty-rose crosses through the speaker. Palette:
bone, dusty rose, soft slate blue. No text. Background transparent.
```

---

## Priorisierung für die nächste Generierungs-Runde

| Rang | Asset | Wirkung | Aufwand |
|------|-------|---------|---------|
| 1 | 37.1 Solidar-Topf-Hero | sehr hoch — neue Marken-Erzählung | 1 Generierung |
| 2 | 38.1 Pool-Hero | hoch — Vergleich Pyramide/Ring ist *die* Story | 1 Generierung (komplexer Prompt, ggf. 2-3 Iterationen) |
| 3 | 37.2 + 37.3 Solidar-Icons | hoch — werden auf Profil + Krank-Card genutzt | 2 Generierungen |
| 4 | 39.1 KI-Brücke-Hero | mittel — macht /ki-Page eigenständig | 1 Generierung |
| 5 | 40.x Profilbild-Fallback (6×) | mittel — erst nach Onboarding-Flow nötig | 6 Generierungen, schneller Pattern |
| 6 | 41.x Bewerbungs-Status-Icons | niedrig — Pool funktioniert auch ohne | 3 Generierungen |
| 7 | 42.x Sprache-Niveau-Icons | niedrig — Chips reichen erstmal | 4 Generierungen |
| 8 | 43.x Voice-Wave-Icons | niedrig — bestehender AudioMuteToggle reicht | 2 Generierungen |

**Total:** 8 Stills (Block 37–39) als nächste sinnvolle Runde, danach 9 weitere bei Bedarf. **Loops** (37.4 + 39.3) erst nach Stills, da sie sich stilistisch an den Stills orientieren.

## Wo werden die Assets im Code eingebaut

- **37.1** → [app/genossenschaft/solidartopf/page.tsx:75](../apps/web/app/genossenschaft/solidartopf/page.tsx) `bild`-Prop ersetzen (`/akte/header-solidartopf.png` statt `/akte/header-konferenz.png`)
- **37.2** → neue Card im [app/profil/page.tsx](../apps/web/app/profil/page.tsx) Solidar-Tile, ersetzt das aktuelle `🤝`-Emoji
- **38.1** → [app/genossenschaft/pool/page.tsx:65](../apps/web/app/genossenschaft/pool/page.tsx) `bild`-Prop ersetzen
- **39.1** → [app/ki/page.tsx](../apps/web/app/ki/page.tsx) `<header>` als HeroBanner mit dem neuen Bild
- **40.x** → [components/ProfilbildUpload.tsx](../apps/web/components/ProfilbildUpload.tsx) neuer Pickup-Mode "Standard-Avatar wählen"
- **41.x** → [components/PoolBewerbungForm.tsx](../apps/web/components/PoolBewerbungForm.tsx) Status-Anzeige
- **42.x** → [components/ProfilMenschlich.tsx](../apps/web/components/ProfilMenschlich.tsx) Sprach-Niveau-Chips
- **43.x** → neue Audio-Indikator-Anzeige in [app/layout.tsx](../apps/web/app/layout.tsx) für Voice-Layer-Status
