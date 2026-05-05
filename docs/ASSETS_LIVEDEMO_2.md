# Asset-Brief · Live-Demo-Erweiterung 2 (Phase F)

**Stand:** 2026-05-05 · **Pipeline:** GPT Image 2.0 (Stills) + Seedance 2.0 (Loops)
**Ziel:** Schließt die letzten visuellen Lücken für eine echt-wirkende
Live-Demo. Auth-Story, Demo-Modi-Banner, Hauswirtschaft- und
Heilerziehung-Subroutes, Stripe-Treuhand-Modul, Compliance-Visuals,
Onboarding-Tour-Loops.

Setzt die Sprache der Briefe Block 1–18 fort: `bone, sage, dusty rose,
oxidized brass, slate blue`. Editorial watercolor + clean ink line.
Approachable, not clinical. Keine Stockfotos, keine Logos, kein Text in
den Bildern.

## Globale Regeln (Wiederholung)

> Editorial illustration aesthetic, soft watercolor + clean ink line.
> Color palette: bone, sage, dusty rose, oxidized brass, slate blue.
> Approachable not clinical. Negative space for content overlay. No
> text, no logos, no labels, no captions. Loose handmade feel,
> paint-bleed edges, slightly imperfect — not digital-clean.

**Anti-Pattern:** keine Stockfoto-Lächeln, kein Hochglanz, keine
Apparate-Pornografie, keine Schloss-Symbole im Hollywood-Stil, keine
Geld-Cliché-Bilder (Goldmünzen-Stapel, Banker-Aktentaschen), keine
"Hacker mit Hoodie"-Klischees.

**Format-Defaults:**
- Hero-Stills: 1600×900 (16:9), PNG-export
- Square-Stills: 1200×1200, PNG-export
- OG-Cards: 1200×630, PNG-export
- Mobile-Loops: 1080×1920 vertical, 24 fps, 8–12 s, MP4 H.264
- Banner-Loops: 1080×1080 oder 1920×1080, 24 fps, 6–8 s

---

## Block 19 · Auth-Story-Visuals (Stills)

Die `/registrieren`-Seite nutzt bereits `/warum/wer-traegt.png` als Hero —
funktional, aber nicht spezifisch für den Auth-Kontext. Dieser Block
liefert dedizierte Visuals für die Drei-Stufen-Geschichte (Basis ·
Identität geprüft · Echtheits-zertifiziert) sowie OG-Cards für `/anmelden`
und `/registrieren`.

### 19.1 · `/auth/header-registrieren.png` — Hero für `/registrieren` · 1600×900

```
Wide editorial illustration 1600x900, soft watercolor + ink: a small
wooden side-door of a German Altbau, slightly ajar, warm light spilling
out from inside onto a stone threshold. On the threshold three small
objects in a quiet row: a brass house-key, a folded ID-card-sized paper
(unmarked), and a small wax-sealed envelope. Outside the door, soft
late-afternoon daylight. The composition leaves the upper-third empty
for a headline overlay. Symbolizes "the door of trust opens in three
steps." Bone, sage, dusty rose, oxidized brass. No text, no logos, no
modern lock hardware visible. Loose handmade feel.
```

### 19.2 · `/auth/vertrauen-basis.png` — Stufe 1 · 1200×1200

```
Square 1200x1200, watercolor + ink: a single open hand holding a small
folded paper note with a thin sage-ribbon tied around it. The paper is
unsealed, casually trusted. Bone background, sage + dusty rose washes.
Symbolizes "Basis — du bist da, das genügt für den ersten Schritt." No
text on paper, no logos. Loose paint-bleed edges.
```

### 19.3 · `/auth/vertrauen-verifiziert.png` — Stufe 2 · 1200×1200

```
Square 1200x1200, watercolor + ink: two hands meeting over a wooden
table — one hand offering a soft-bound certificate (folded once, edge
visible), the other hand reaching to receive with a small magnifying
loupe rested on the table beside them. The loupe is decorative-brass,
not technical. Bone background, slate-blue + brass accents. Symbolizes
"Identität geprüft — wir haben hingeschaut." No text on certificate.
```

### 19.4 · `/auth/vertrauen-hoch.png` — Stufe 3 · 1200×1200

```
Square 1200x1200, watercolor + ink: a single hand pressing a brass wax-
seal stamp onto a small folded letter on warm wood. The wax — dusty
rose — is half-cooled, the imprint barely shows but is unmistakably
unique. Beside the letter, a small tarnished signet ring rests on a
linen cloth. Bone background, brass + dusty rose. Symbolizes "Echtheits-
zertifiziert — die Prägung lässt sich nicht fälschen." No text, no logos,
no modern security iconography.
```

### 19.5 · `/auth/empty-keine-konten.png` — Empty-State · 1200×1200

```
Square 1200x1200, watercolor + ink: a single empty wooden cubbyhole
shelf seen straight-on, eight or nine compartments, all empty except for
a thin slip of paper resting in the bottom-right slot — slightly
catching warm light. The shelf is clean, well-cared-for, just not yet
populated. Bone background, soft warm-wood. Symbolizes "noch keine
Konten — hier wird Platz gehalten." No text, no labels. Loose handmade.
```

### 19.6 · `/og/registrieren.png` — OG-Card · 1200×630

```
Wide editorial 1200x630: three small watercolor symbols in a horizontal
row on warm wood, separated by thin ink-arrows pointing right — a
folded paper note (basis), a folded certificate with a tiny loupe
(verifiziert), a wax-sealed letter (hoch). Negative space upper-third
for headline overlay, lower-left for sub-title. Bone, sage, dusty
rose, brass. No text, no logos.
```

### 19.7 · `/og/anmelden.png` — OG-Card für `/anmelden` · 1200×630

```
Wide editorial 1200x630: a single warm-glowing brass house-key resting
on a folded linen cloth on wood, soft daylight from upper-left, a faint
shadow of a doorframe suggested in the background bokeh. Negative space
upper-right for headline overlay. Symbolizes "willkommen zurück."
Bone, brass, sage. No text, no logos, no modern lock cylinders.
```

---

## Block 20 · Demo-Modi-Banner (Stills + Loops)

Der Demo-Banner oben in der App rotiert zwischen drei Modi: Viewer
(passiver Beobachter), Superuser (sieht alles, kann nichts kaputt
machen), Tester (mit echten Test-Daten). Jeder Modus bekommt ein
kleines, ikonisches Still + optional einen 4-s-Loop für die Hover-
Animation.

### 20.1 · `/demo/modus-viewer.png` — Iconic Still · 1080×1080

```
Square 1080x1080, watercolor + ink: a single pair of soft round
spectacles resting on an open journal, the lenses catching a faint warm
reflection. The journal is open but shows only abstract handwritten
marks — illegible. Bone background, slate-blue + brass washes.
Symbolizes "Viewer — du schaust, du veränderst nichts." Calm, not
voyeuristic. No text, no eye-icons.
```

### 20.2 · `/demo/modus-superuser.png` — Iconic Still · 1080×1080

```
Square 1080x1080, watercolor + ink: a small brass key-ring with three
keys hanging from a thin sage cord, suspended just above a wooden table.
A faint shadow of the keys falls onto the table. Bone background, brass
+ sage. Symbolizes "Superuser — alle Türen, ruhig getragen." Approachable,
not commanding. No text, no padlocks, no power-icons.
```

### 20.3 · `/demo/modus-tester.png` — Iconic Still · 1080×1080

```
Square 1080x1080, watercolor + ink: a small wooden practice-target made
of three concentric rings painted in faded sage, dusty rose and bone,
with a single wooden dart resting on the rim — not in the center.
Beside the target a small notebook half-open. Bone background, warm
wood. Symbolizes "Tester — wir üben mit echtem Werkzeug." Playful, not
gamified. No text, no scores, no bullseye drama.
```

### 20.4 · `/loops/demo-modus-viewer.mp4` — 4 s loop · 1080×1080

```
4-second seamless loop, 1080x1080, animated watercolor: the spectacles
from 20.1 — one lens catches a slow shimmer of warm light that drifts
across the glass once and fades. The journal page flutters minimally as
if a faint draft. Bone background. Last frame matches first frame
exactly. No text, no flashing.
```

### 20.5 · `/loops/demo-modus-superuser.mp4` — 4 s loop · 1080×1080

```
4-second seamless loop, 1080x1080, animated watercolor: the three keys
from 20.2 sway gently once on their cord, the brass catches a slow
warm highlight, then settles. Shadow on the table breathes with the
sway. Bone background, brass + sage. Loopable. No text.
```

### 20.6 · `/loops/demo-modus-tester.mp4` — 4 s loop · 1080×1080

```
4-second seamless loop, 1080x1080, animated watercolor: the dart from
20.3 wobbles once on the rim of the target, the target rings shimmer
as if paint still drying. Notebook page lifts a fraction. Bone
background. Loopable, no impact-shake, no text, no score-display.
```

---

## Block 21 · Hauswirtschaft + Heilerziehung Sub-Route Headers (Stills)

Sechs Sub-Routes brauchen Header-Visuals. Format einheitlich
1600×900, Negative-Space oben für Headline-Overlay.

### 21.1 · `/hauswirtschaft/header-einkauf.png` — `/hauswirtschaft/einkauf` · 1600×900

```
Wide editorial 1600x900, watercolor + ink: a flat-lay top-down on a
warm wooden kitchen counter — a woven shopping basket holds a loaf of
rye bread, a small bunch of carrots with greens, a glass jar of milk
sealed with a paper lid, two apples, a folded shopping list (illegible
handwriting). Beside the basket a small brass house-key on a linen
napkin. Soft warm side-light. Bone, sage, dusty rose, brass.
Symbolizes "Einkauf — was heute heimkommt." Negative space upper third.
No labels on jars, no brand names, no text.
```

### 21.2 · `/hauswirtschaft/header-kochen.png` — `/hauswirtschaft/kochen` · 1600×900

```
Wide editorial 1600x900, watercolor + ink: side-view of a warm enamel
pot on a stovetop, gentle steam rising in slow watercolor curls. Beside
the pot a wooden spoon resting on a folded linen cloth, a small ceramic
bowl of chopped herbs, a single peeled apple. Late-afternoon window-
light from left. Bone background, sage + brass + dusty rose.
Symbolizes "Kochen — Wärme ins Haus." No people, no faces, no text.
Loose handmade.
```

### 21.3 · `/hauswirtschaft/header-reinigung.png` — `/hauswirtschaft/reinigung` · 1600×900

```
Wide editorial 1600x900, watercolor + ink: a quiet kitchen corner
after the work — a clean white porcelain sink with a single folded
linen dishcloth draped over its edge, a small jar of soft soap, a sprig
of rosemary in a glass of water on the windowsill, soft window-light
from the right. Bone, sage, brass. Symbolizes "Reinigung — nicht
sterilisieren, sondern pflegen." No chemicals, no plastic bottles,
no text.
```

### 21.4 · `/heilerziehung/header-teilhabe.png` — `/heilerziehung/teilhabe` · 1600×900

```
Wide editorial 1600x900, watercolor + ink: two pairs of hands on a
warm wooden table — one pair (older, weathered) showing the other
(younger, soft) how to fold a paper boat. The half-finished paper boat
sits between them. No faces, only forearms and hands. Bone, sage,
dusty rose. Symbolizes "Teilhabe — gemeinsam etwas können." Negative
space upper third. No text, no logos, no clinical signifiers.
```

### 21.5 · `/heilerziehung/header-bildung.png` — `/heilerziehung/bildung` · 1600×900

```
Wide editorial 1600x900, watercolor + ink: a small wooden classroom
table seen from above — an open soft-bound notebook with abstract
hand-drawn shapes (circles, arrows, a small house outline), a wooden
geometric block (a sage-painted cube), three colored pencils in a
ceramic cup. No people. Soft warm window-light from upper-left. Bone,
sage, dusty rose, brass. Symbolizes "Bildung — Lernen im eigenen
Tempo." No text on notebook, no alphabet, no school-logos.
```

### 21.6 · `/heilerziehung/header-tagesstruktur.png` — `/heilerziehung/tagesstruktur` · 1600×900

```
Wide editorial 1600x900, watercolor + ink: a soft-paper weekly grid
hand-drawn on a wooden table — seven gentle vertical columns, each
column has small icons painted in instead of words: a sun, a bowl, a
walking-stick, a book, a flower, a small house, a moon. A hand
(weathered, calm) rests at the right edge of the grid, holding a
fountain pen but not writing. Bone background, sage + brass + dusty
rose. Symbolizes "Tagesstruktur — der Tag bekommt Form, nicht Druck."
No text in the grid cells, no numbers.
```

---

## Block 22 · Stripe-Treuhand-Modul (Stills + Loop)

Geld-Bewegung in der Genossenschaft braucht Visuals, die **Treuhand-
Stewardship** transportieren — kein Banking-Cliché. Treuhand-Briefkasten
als Sammelstelle, Auszahlungs-Bestätigung als Akt, Ausschüttungs-
Diagramm als geteilter Kreis.

### 22.1 · `/treuhand/header-modul.png` — Hero für `/treuhand` · 1600×900

```
Wide editorial 1600x900, watercolor + ink: side-view of a small wooden
village-bench with a brass-clasped wooden lockbox sitting on it. The
lockbox is open just a fraction — inside, the edges of folded letters
in different soft tones (sage, dusty rose, brass, slate, bone) peek
out. Beside the box, a small ledger book with a sage ribbon. Soft
late-afternoon light from upper-left. Bone, brass, sage palette.
Symbolizes "Treuhand — was hier liegt, ist nicht meins, sondern für
euch verwahrt." No coins visible, no banknotes, no logos. Negative
space upper-third for headline.
```

### 22.2 · `/treuhand/briefkasten.png` — Treuhand-Briefkasten · 1200×1200

```
Square 1200x1200, watercolor + ink: front-view of a small wall-mounted
wooden mailbox, brass slot at the top, brass nameplate (blank, no
text), a small sage-painted wooden door at the bottom with a tiny
clasp. Two folded letters — one cream, one dusty rose — peek out of
the slot. Bone background, soft daylight from above. Symbolizes "hier
geht etwas hinein, hier kommt etwas später wieder heraus." No text on
nameplate, no logos.
```

### 22.3 · `/treuhand/auszahlung-bestaetigung.png` — Auszahlungs-Visual · 1200×1200

```
Square 1200x1200, watercolor + ink: top-down on warm wood — a single
folded letter, half-opened, with a wax-seal already broken (the seal
fragments resting beside it on a linen cloth), revealing inside a
hand-drawn small abstract sum-symbol (a soft watercolor circle, no
numbers). A fountain pen rests beside the letter, ink still wet on the
nib. Bone, brass, dusty rose. Symbolizes "Auszahlung bestätigt — die
Prägung war echt, das Geld ist unterwegs." No legible numbers, no text,
no banknotes, no Stripe-logos.
```

### 22.4 · `/treuhand/ausschuettung-diagramm.png` — Ausschüttungs-Diagramm · 1600×900

```
Wide editorial 1600x900, watercolor + ink: a hand-painted ring divided
into seven uneven wedges of different soft tones — sage (largest),
dusty rose, brass, slate-blue, bone, ochre, lavender — drawn loosely as
if painted with a wide brush. From the edge of each wedge a thin ink
line extends outward to a tiny corresponding watercolor mark (a leaf,
a candle, a key, a feather, a spoon, a book, a star) — symbolizing
which role receives what proportion. Bone background, very generous
negative space. Symbolizes "Ausschüttung — der Kreis verteilt sich, jeder
Anteil bekommt ein Gesicht." No labels, no percentages, no text.
```

### 22.5 · `/treuhand/treuhand-uhr.png` — Cooldown / Sperrfrist · 1200×1200

```
Square 1200x1200, watercolor + ink: a small brass pocket-watch resting
face-up on a folded linen napkin on warm wood. The watch-face shows no
numerals — only soft hand-painted hour-marks and two slim ink hands
positioned at a calm angle. A faint warm reflection on the brass
casing. Bone, brass, sage. Symbolizes "Sperrfrist — gut Ding hat eine
Reife-Zeit." No legible time, no numbers, no Apple-Watch.
```

### 22.6 · `/loops/treuhand-fluss.mp4` — Geld-Fluss-Loop · 8 s · 1920×1080

```
8-second seamless loop, 1920x1080, animated watercolor: top-down view
of a wooden table. A hand enters from the left edge holding a small
folded letter, places it gently into a small open lockbox in the center.
The letter settles. Lockbox lid drifts half-closed. Then a second hand
enters from the right, takes a different folded letter out of the same
lockbox, withdraws. Lockbox lid drifts half-open again. Loops back to
start. No faces, only sleeves and hands of different fabric. Bone,
brass, sage. Symbolizes "Geld kommt herein, Geld geht hinaus — verwahrt
dazwischen." No coins, no banknotes, no text, no logos. 12fps frame-
rate feel, subtle paint-shimmer.
```

---

## Block 23 · Compliance / Audit (Stills + Mikro-Icons)

BSI-Schloss, Datenschutz-Hand-Schild, Audit-Log-Icons. Hier ist das
Kernrisiko Klischee — wir wollen Vertrauen ausstrahlen, ohne in
Hochsicherheits-Theater abzurutschen.

### 23.1 · `/compliance/bsi-schloss.png` — BSI-Konformität · 1200×1200

```
Square 1200x1200, watercolor + ink: a small brass padlock — the kind
that hangs on a wooden garden-gate, not a vault — resting on a folded
linen cloth on warm wood. The padlock is closed, key visible on a thin
ring beside it. A small sprig of rosemary lies next to the lock.
Bone background, brass + sage. Symbolizes "BSI-konform — verschlossen
wie ein gut gebauter Garten, nicht wie ein Banktresor." Approachable,
not paranoid. No text, no shield-icons, no certificate-stamps.
```

### 23.2 · `/compliance/datenschutz-hand.png` — Datenschutz-Schild · 1200×1200

```
Square 1200x1200, watercolor + ink: a single open hand seen from above,
palm up, gently cupping a folded paper letter. A second hand (smaller
hint at frame edge) rests above as if shielding without touching. Bone
background, sage + dusty rose washes. Symbolizes "Datenschutz — was du
mir gibst, decke ich zu." No actual shield-shapes, no padlock, no
GDPR-iconography, no text.
```

### 23.3 · `/compliance/audit-ledger.png` — Audit-Log-Hero · 1600×900

```
Wide editorial 1600x900, watercolor + ink: side-angle on a wooden desk
— a thick soft-bound ledger book lies open, hand-written abstract
entries fill the left page in even rows (illegible handwriting, just
ink-rhythm). A fountain pen rests on the right page, mid-line. A small
brass desk-lamp casts warm light from the right. Beside the ledger, a
small stack of folded receipts tied with sage ribbon. Bone, brass,
sage. Symbolizes "Audit-Log — alles wird mitgeschrieben, Hand-Ehre."
No legible text, no timestamps, no numbers, no logos.
```

### 23.4 · `/compliance/icon-eintrag.png` — Audit-Icon "Eintrag" · 256×256

```
Symbolic icon, square 256x256, watercolor + minimal ink line: a single
thin horizontal ink stroke being drawn on cream paper, the nib of a
fountain pen just visible at the right end of the stroke. Bone
background, brass + sage. Symbolizes "ein Eintrag wurde gemacht." No
text, no checkmark.
```

### 23.5 · `/compliance/icon-pruefen.png` — Audit-Icon "Geprüft" · 256×256

```
Symbolic icon, square 256x256, watercolor + minimal ink line: a small
brass loupe resting at an angle over a sheet of paper showing two
abstract horizontal ink lines. Bone background. Symbolizes "wurde
hingeschaut." No text, no eye-icon, no magnify-glass-cliché-handle.
```

### 23.6 · `/compliance/icon-siegel.png` — Audit-Icon "Versiegelt" · 256×256

```
Symbolic icon, square 256x256, watercolor + minimal ink line: a small
dusty-rose wax-seal pressed onto cream paper, the imprint slightly
abstract — no recognizable crest, just a soft round shape with a hint
of pattern. Bone background. Symbolizes "diese Spur ist versiegelt."
No text, no recognizable logos.
```

### 23.7 · `/og/treuhand.png` — OG-Card für `/treuhand` · 1200×630

```
Wide editorial 1200x630: side-angle on a wooden bench with the brass-
clasped lockbox from 22.1, a folded letter halfway in, soft warm light
from upper-left. Negative space upper-right for headline overlay,
lower-left for sub-title. Bone, brass, sage. No text, no logos.
```

### 23.8 · `/og/compliance.png` — OG-Card für `/compliance` · 1200×630

```
Wide editorial 1200x630: top-down on warm wood with the open ledger from
23.3, fountain pen, brass desk-lamp warm-spot reaching from the right
edge. Negative space upper-third for headline. Bone, brass, sage. No
text, no logos.
```

---

## Block 24 · Onboarding-Tour-Loops (Seedance 2.0)

Vier 12-s-Loops, die einen ersten User durch je eine charakteristische
Plattform-Geste führen. Format vertikal mobile-first, weil die
Onboarding-Tour primär auf dem Handy gestartet wird.

### 24.1 · `/loops/onboarding-klient-self-booker.mp4` — 12 s vertikal · 1080×1920

```
12-second seamless loop, 1080x1920 vertical, animated watercolor: top-
down view of a wooden bedside table. A hand (older, weathered) enters
from the right holding a small wooden token painted with a sage-leaf
symbol. The hand places the token gently onto an open soft-paper
calendar grid (the grid is hand-drawn, abstract, no numbers — just
seven columns with soft watercolor blocks). The token settles into one
of the cells. The hand withdraws. The cell glows warm-brass for two
seconds, then fades. Loops back to start. Bone, sage, brass, dusty
rose. Symbolizes "Klient bucht selbst einen Termin — eine Geste,
eine Bestätigung." No text on calendar, no numbers, no faces. 12fps
frame-rate feel, subtle paint-shimmer.
```

### 24.2 · `/loops/onboarding-pflege-schichtplan.mp4` — 12 s vertikal · 1080×1920

```
12-second seamless loop, 1080x1920 vertical, animated watercolor: top-
down on a warm wooden desk. A hand-drawn weekly schedule grid lies open,
each cell holds a small abstract watercolor shape (a candle, a leaf, a
spoon, a star) representing a shift-type. A hand enters from the left,
gently picks up one shape (a candle) from one cell and places it into
an empty cell two columns over. The candle wobbles, settles. Then the
hand draws a thin sage-ink line connecting the two cells — like a
hand-off arrow. Hand withdraws. Loops. Bone, sage, brass, dusty rose.
Symbolizes "Pflegekraft tauscht eine Schicht — sichtbar, kollegial."
No text, no numbers, no faces. Subtle paint-shimmer.
```

### 24.3 · `/loops/onboarding-konferenz-beobachten.mp4` — 12 s vertikal · 1080×1920

```
12-second seamless loop, 1080x1920 vertical, animated watercolor: side-
view of a small round wooden table with five empty chairs arranged
around it. On the table, a single soft notebook open, a fountain pen
resting on the page, a steaming tea cup. The viewer's perspective is
slightly elevated — as if standing in a doorway watching from outside.
Slowly, five small floating speech-marks (rounded watercolor blobs in
sage, dusty rose, brass, slate, bone) drift up from above the chairs
and softly fade — as if voices being spoken without anyone visible. The
notebook pages lift faintly. Loops back to start. Bone, sage, brass.
Symbolizes "Konferenz beobachten — du bist dabei, ohne im Weg zu
stehen." No text inside speech-marks, no faces, no chairs occupied.
```

### 24.4 · `/loops/onboarding-genossenschaft-beitritt.mp4` — 12 s vertikal · 1080×1920

```
12-second seamless loop, 1080x1920 vertical, animated watercolor: top-
down on a warm wooden table. A hand enters from the right holding a
folded membership-letter. The hand places the letter onto the table,
unfolds it once (revealing only abstract watercolor handwriting marks,
no real text). Then the hand picks up a small brass wax-seal stamp from
beside an inkwell of dusty-rose wax, presses it onto the letter — the
wax cools visibly for two seconds, the imprint forms. The hand
withdraws. The letter glows warm-brass for one second, then fades.
Loops. Bone, brass, sage, dusty rose. Symbolizes "Beitritt zur
Genossenschaft — ein Akt, eine Prägung." No text on letter, no logos
on stamp.
```

### 24.5 · `/loops/onboarding-notfall-beruhigt.mp4` — 12 s vertikal · 1080×1920 (Bonus)

```
12-second seamless loop, 1080x1920 vertical, animated watercolor: side-
view of a small bedside table at night (continuation of 15.1's
language). A small cord-pendant rests on the table next to a glass of
water and a worry-stone. Slowly, the pendant glows warm-amber for two
seconds (someone has pressed the call-button), then a thin ink-line
begins to draw itself outward from the pendant — extending across the
table, out of frame to the left, and a small candle at the edge of
frame ignites in response. The candle steadies. The pendant returns to
calm. Loops back to start. Bone, slate-blue, brass, dusty rose.
Symbolizes "Notruf — du drückst, jemand ist schon unterwegs." No text,
no flashing red, no medical equipment. Calm reassurance only.
```

---

## Liefer-Reihenfolge (Empfehlung)

**Erstwelle — muss zuerst gerendert werden** (für die echt-wirkende Auth-
Story und Demo-Banner-Rotation):
1. **19.1** `/auth/header-registrieren.png` — ersetzt den geliehenen
   `/warum/wer-traegt.png`-Hero auf `/registrieren`.
2. **19.2 · 19.3 · 19.4** Drei Vertrauensstufen — diese Bilder
   transportieren die ganze Auth-Story und werden auf der `/registrieren`-
   Seite direkt unter dem Hero eingebettet.
3. **20.1 · 20.2 · 20.3** Demo-Modi-Banner-Stills — drei Iconic-Bilder,
   die im Banner oben rotieren. Loops (20.4–20.6) können nachgereicht
   werden, weil die App auf Stills zurückfällt.
4. **22.1** `/treuhand/header-modul.png` — Hero des neuen Stripe-
   Treuhand-Moduls; ohne dieses Bild wirkt die Route nackt.

**Zweitwelle** (Sub-Routes + OG-Cards):
5. Block 21 komplett (sechs Sub-Route-Header) — sobald
   `/hauswirtschaft/{einkauf,kochen,reinigung}` und
   `/heilerziehung/{teilhabe,bildung,tagesstruktur}` in der Routen-
   Liste auftauchen.
6. **19.5 · 19.6 · 19.7** Empty-State + zwei Auth-OG-Cards.
7. **23.7 · 23.8** OG-Cards Treuhand + Compliance.

**Drittwelle** (Compliance + Treuhand-Tiefe):
8. Block 22 Reststücke (22.2–22.6 inkl. Loop).
9. Block 23 komplett (BSI-Schloss, Datenschutz-Hand, Audit-Ledger,
   drei Mikro-Icons).

**Viertwelle** (Onboarding-Tour, Polish):
10. Block 24 — vier 12-s-Loops + Bonus-Notfall-Loop. Diese sind
    aufwändig in Seedance, aber massiv wirkungsvoll für eine erste
    Präsentation.

## Liefer-Checkliste

**Stills (GPT Image 2.0):**
- Block 19: 19.1–19.7 → 7 Stills
- Block 20: 20.1–20.3 → 3 Stills
- Block 21: 21.1–21.6 → 6 Stills
- Block 22: 22.1–22.5 → 5 Stills
- Block 23: 23.1–23.8 → 8 Stills (inkl. drei Mikro-Icons + zwei OG)

**Total Stills: 29**

**Loops (Seedance 2.0):**
- Block 20: 20.4–20.6 → 3 kurze Banner-Loops
- Block 22: 22.6 → 1 Treuhand-Loop
- Block 24: 24.1–24.5 → 5 Onboarding-Loops

**Total Loops: 9**

**Gesamt: 38 Assets** (29 Stills + 9 Loops). Liegt am oberen Ende der
~25–30er-Schätzung — Block 23 kam mit drei Mikro-Icons + zwei OG-Cards
größer raus als geplant, weil Compliance ohne Icon-Vokabular nackt
wirkt. Wenn knapp: Block 24.5 (Bonus-Notfall-Loop) und 23.4–23.6
(Mikro-Icons) lassen sich als spätere Polish-Welle nachschieben — die
Erstwelle (1–4 oben) ist das, was die Live-Demo unmittelbar echt
wirken lässt.

## Naming-Konvention

- Stills: `kebab-case.png`, abgelegt unter `apps/web/public/{auth,
  demo,hauswirtschaft,heilerziehung,treuhand,compliance,og}/`.
- Loops: `kebab-case.mp4`, abgelegt unter `apps/web/public/loops/`.
- Existsync-Fallback wie in den Vorgänger-Briefen: fehlt eine Datei,
  zeigt die App das passende SVG-Substitut oder den Eyebrow-Text der
  Sektion. So lassen sich Assets in beliebiger Reihenfolge nachreichen.

## Pipeline-Notiz

Wiederholt aus dem Vorgänger-Brief: Wenn ein GPT-Image-2.0-Asset zu
"digital-clean" rauskommt, Prompt-Suffix `"loose handmade feel,
paint-bleed edges, slightly imperfect"` ergänzen. Wenn Seedance-Loops
zu "video-haft" wirken: `"animated watercolor illustration in motion,
12fps frame-rate feel, subtle paint-shimmer."` Bei den Banner-Loops
(20.4–20.6) explizit `"4 second loop, last frame matches first frame
exactly"` mitgeben — sonst Cut-Sprung sichtbar.

Bei den Treuhand-Visuals (Block 22) **ausdrücklich** das Prompt-Suffix
`"no coins, no banknotes, no credit-cards, no banking icons"`
mitgeben — GPT Image 2.0 tendiert bei Geld-Begriffen sonst zu
Klischee-Bebilderung.
