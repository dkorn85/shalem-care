# Asset-Audit · Design-Review der aktuellen Verwendung

**Stand:** 2026-05-05 · **Reviewer:** Senior-UI-Design-Pass
**Quellen:** ASSETS_FLOWSTATE.md, ASSETS_BEFUNDE.md, ASSETS_LIVEDEMO.md, ASSETS_LIVEDEMO_2.md
**Scope:** Alle `<Image src=…>` und `<video …>` in `apps/web/app/` + `apps/web/components/`

---

## Zusammenfassung der Beobachtung

Der User hat den Punkt richtig erkannt: **mehrere Hero-Assets mit 1600×900
oder 1600×1200 Watercolor-Komposition werden derzeit als 4:3- oder 16:9-Cards
neben Headlines gerendert** (typisches `lg:col-span-5 aspect-[4/3]`-Pattern).
Das hat zwei Probleme:

1. Die Bilder waren mit "Negative-Space oben für Headline-Overlay"
   gepromptet — dieser Negativraum geht in der Card-Lösung verloren oder
   wird abgeschnitten.
2. Watercolor-Charakter (paint-bleed-Edges, lockere Pinselstriche) lebt
   von Maßstab. In einer 480-px-Card auf Desktop wirken die Bilder
   "Stockfoto-clean", obwohl sie es nicht sind.

Außerdem werden zwei Mikro-Icon-Assets (256×256, schemaartig gepromptet)
in Kontexten verwendet, die deutlich größer sind als das Asset-Briefing
sie eingeplant hat — sie wirken dort weichgezeichnet oder verloren.

Der dominanteste Anti-Pattern: das **Cockpit-Header-Pattern**
`grid lg:grid-cols-12 / Text col-span-7 / Bild col-span-5 aspect-[4/3]`,
das in mindestens 9 Routen identisch verwendet wird, drückt jedes
1600er-Hero-Asset in einen ~480-px-Tile und wiederholt sich monoton.

---

## Major-Befunde · signifikante Fehlbenutzung

### M1 · Anamnese-Header werden im Briefing als 1400×600-Stoff für die ganze Sektion gedacht, in der App aber als 4:3-Card gequetscht

**Dateien:**
- `apps/web/app/heilerziehung/page.tsx:40` — `/anamnese/header-heilerz.png`
- `apps/web/app/ehrenamt/page.tsx:57` — `/anamnese/header-ehrenamt.png`
- `apps/web/app/erziehung/page.tsx:59` — `/anamnese/header-erziehung.png`
- `apps/web/app/hauswirtschaft/page.tsx:51` — `/anamnese/header-hauswirt.png`
- `apps/web/app/sozial/page.tsx:60` — `/anamnese/header-sozial.png`
- `apps/web/app/therapie/page.tsx:60` — `/anamnese/header-therapie.png`

**Aktuelle Verwendung:** `lg:col-span-5 aspect-[4/3] rounded-2xl object-cover` —
also ~480×360 px Card neben einer 7-col-Textspalte.

**Intendierte Auflösung (Brief 10.1–10.8):** 1400×600 wide editorial mit
*"Negative space upper-right"* — explizit als Banner-/Spalten-Streifen
konzipiert, nicht als Quadrat-Card.

**Refactoring-Vorschlag:** Identisches Layout-Pattern wie auf `/warum`
(Header full-bleed `aspect-[16/9]` mit Gradient-Overlay nach unten,
Headline + Subline auf dem Bild). Die 1400×600-Komposition mit
Negativraum oben-rechts entfaltet dann genau die intendierte
"Stimmungs-vor-Worten"-Wirkung. Alternativ: dieselbe Komposition als
`aspect-[16/7]`-Banner über die volle Cockpit-Breite, mit Text
*darunter* (statt seitlich), Headline auf dem Bild wenn dort genug
Negativraum ist.

### M2 · `/akte/header-multi-view.png` ist 1600×1600 mit "loose framed-panels-Komposition" — wird als 5-col-Card gerendert

**Datei:** `apps/web/app/klient/akte/befunde/page.tsx:74`

**Aktuelle Verwendung:** `lg:col-span-5 aspect-square rounded-2xl object-cover` —
das Quadrat passt zwar zur Auflösung, aber die *Sektions-Komposition*
mit sechs gerahmten Panels ist als Hero gedacht, der den Akte-Einstieg
visuell einrahmt.

**Intendierte Auflösung (Brief 7.2):** 1600×1600 Square, "Composition evokes a
*map of self*" — also ein Bild, das eine ganze Seite tragen soll.

**Refactoring-Vorschlag:** Volle Seitenbreite als Hero-Banner mit
`aspect-[21/9]` oder als Background eines `min-h-[40vh]`-Sections mit
zentrierter Headline und Gradient-Wash. Die "map of self"-Idee braucht
Platz, sonst sieht der User nur sechs winzige Mini-Symbole, die in
einer Card verschwimmen.

### M3 · `/akte/header-behandlung.png` (1600×1200, "vier Hände heben Pflanze") als 4:3-Card neben Headline

**Datei:** `apps/web/app/klient/akte/behandlung/page.tsx:79`

**Aktuelle Verwendung:** `lg:col-span-5 aspect-[4/3]` neben col-span-7-Text.

**Intendierte Auflösung (Brief 7.4):** 1600×1200 mit Top-Down-Komposition,
explizit als interdisziplinäres Hero gedacht ("symbolisiert
interdisziplinäre Care").

**Refactoring-Vorschlag:** Full-bleed Hero mit Text-Overlay, oder
`grid-cols-12` mit Bild als col-span-12 und Text *unter* dem Bild
(wie auf `/warum`). Die Vier-Hände-Komposition ist genau die
emotionale Entladung dieses Cockpit-Tabs — sie verdient eine
ganze Sektion, nicht eine Card.

### M4 · `/treuhand/header-modul.png` (1600×900, Lockbox auf Bank) wird als col-span-5 aspect-16/9 gerendert

**Datei:** `apps/web/app/treuhand/page.tsx:39`

**Aktuelle Verwendung:** `lg:col-span-5 aspect-[16/9]` Card neben col-span-7-Text.

**Intendierte Auflösung (Brief 22.1):** 1600×900 mit *"Negative space
upper-third for headline"* — explizit als Hero mit Headline-Overlay
gepromptet.

**Refactoring-Vorschlag:** Hero full-bleed `aspect-[16/7]` über die ganze
AppShell-Breite mit Headline im oberen Drittel auf dem Bild,
Subline gegen unten gefadet. Direkt darunter beginnt das Treuhand-
Modul. Der Negativraum oben rechts kommt dann tatsächlich zur Geltung.

### M5 · `/inbox/icon-erledigt.png` (256×256 Mikro-Icon) wird als 128×128 Hero-Bestätigung gerendert

**Datei:** `apps/web/app/registrieren/verifizieren/eingereicht/page.tsx:18`

**Aktuelle Verwendung:** `relative w-32 h-32 mx-auto` mit `object-contain` —
also eine 128-px-Kerze als zentraler emotionaler Anker einer
Bestätigungs-Seite.

**Intendierte Auflösung (Brief 14.3):** 256×256 *"Symbolic icon...
will be used at small sizes"* — explizit als kleines Status-Symbol
für die Inbox-Liste konzipiert (Inbox-Chip neben Text), nicht als
zentrales Hero-Element.

**Refactoring-Vorschlag:** Entweder ein dediziertes Bestätigungs-Hero
einplanen (z.B. *"folded-letter sealed with sage ribbon, top-down on
wood, 1600×900"*) oder das Layout umbauen, sodass das Mikro-Icon
in den Headline-Body eingebettet ist (32–48 px neben dem H1, nicht
zentral 128 px). Die Kerze ist als 32-px-Listen-Marker designt — sie
hat nicht genug Detail, um eine ganze Hero-Page zu tragen.

### M6 · `/onboarding/welcome.png` (Schlussstein, 1200×1200) wird als 128×128-Bestätigungs-Icon UND als col-span-5 Card verwendet

**Dateien:**
- `apps/web/app/genossenschaft/beitreten/page.tsx:256` — als 128-px-Confirm-Tile (`object-contain`)
- `apps/web/app/genossenschaft/page.tsx:175` — als full-width Hero-Bild in einer Card (`width=1200 height=900`)

**Aktuelle Verwendung beitreten:** Quadrat 128×128, `object-contain` —
die Schlussstein-Komposition (drei Hände + Brass-Keystone) verliert
in dieser Größe ihre Lesbarkeit.

**Intendierte Auflösung (Bestand-Asset, vgl. Block 4 Briefing):** 1200×1200
square, watercolor-illustriertes Mitglieds-Pakt-Motiv für Onboarding-
Stories — gedacht als emotionaler Anker.

**Refactoring-Vorschlag:**
- Auf `/genossenschaft/beitreten` Confirm-Step: Das Welcome-Bild als
  Hintergrund einer ganzen Confirm-Card mit Gradient-Overlay statt
  als 128-px-Tile. So bleibt das Schlussstein-Motiv lesbar UND der
  Moment fühlt sich groß an.
- `/genossenschaft` Mondragon-Section: hier ist die Verwendung okay —
  aber besser als full-bleed Sektions-Hero statt eingerahmter Card.

---

## Mittel · Asset wirkt gequetscht oder anonym

### Mi1 · `/warum/wer-traegt.png` ist 1600×1200 Top-Down-Komposition, wird als 4:3-Card gerendert

**Datei:** `apps/web/app/warum/page.tsx:98`

**Aktuelle Verwendung:** `lg:col-span-7 aspect-[4/3] object-cover` — passt
zwar relativ ähnlich zum 4:3-Original (1600×1200 → 4:3), aber neben
einer kompakten Textspalte ist das Tuch-mit-acht-Händen-Motiv
verkleinert auf ~700 px.

**Intendierte Auflösung (Brief 16.4):** 1600×1200 als wertversprechendes
Cooperative-Hero — *"viele Hände tragen einen Schlaf"*.

**Refactoring-Vorschlag:** Auf dieser Seite (Marketing-Page) macht ein
zwei-spalten Layout Sinn, *aber* die Bild-Spalte sollte größer sein
(col-span-8 oder 9), Textspalte enger. Oder: Sektions-Background mit
Text in lesbarer Box davor.

### Mi2 · `/warum/honorar-vs-genossenschaft.png` (1600×900 Side-by-Side-Diagramm) als 7-col Card

**Datei:** `apps/web/app/warum/page.tsx:44`

**Aktuelle Verwendung:** `lg:col-span-7 aspect-[16/9]` — okay-Lesbarkeit, aber
das Vergleichs-Diagramm "Pyramide vs Ring" ist genau das, was dem
User die Differenzierung intuitiv erklärt — es sollte größer und
zentral sein, nicht halb-rechts.

**Refactoring-Vorschlag:** Diese eine Sektion full-bleed (aspect-21/9)
mit Erklärungs-Text *unter* dem Diagramm in einer max-w-prose-Box.
Das Ring-vs-Pyramide-Visual ist das Wertversprechen — es verdient
Bühne.

### Mi3 · `/warum/anteile-vier-prozent.png` (1200×1200 Pie-Diagramm) als col-span-5 aspect-square

**Datei:** `apps/web/app/warum/page.tsx:67`

**Aktuelle Verwendung:** `aspect-square col-span-5` — das ist exakt die
Auflösung, aber wieder neben Text, was den Pie auf ~400 px schrumpft.

**Refactoring-Vorschlag:** Hier dürfte die aktuelle Lösung okay
funktionieren, weil das Pie-Diagramm einfach ist. Wenn jedoch die
"loose paint-bleed"-Qualität wichtig ist: größer (col-span-6+) oder
als Hintergrund mit Zahlen-Overlay rechts.

### Mi4 · `/treuhand/ausschuettung-diagramm.png` (1600×900) als 7-col 16:9 Card

**Datei:** `apps/web/app/treuhand/page.tsx:89`

**Aktuelle Verwendung:** `lg:col-span-7 aspect-[16/9]` — der Ring mit sieben
Wedges + ink-line-Auswüchsen verliert Detail in der Card-Größe.

**Refactoring-Vorschlag:** Wie Mi2 — full-bleed mit Erklärungs-Text
darunter oder mit Glass-Overlay-Box rechts.

### Mi5 · `/notfall/eskalation-kette.png` (1200×1200, fünf Kerzen im Bogen) als col-span-5 aspect-square

**Datei:** `apps/web/app/notfall/page.tsx:113`

**Aktuelle Verwendung:** Korrekte 1:1-Auflösung, aber `lg:col-span-5`
quetscht das diagramm-artige Motiv neben eine 7-spaltige Liste — das
schwächt beide Seiten.

**Refactoring-Vorschlag:** Bild über volle Breite als visuelle Sektion
*zwischen* Hero und Eskalations-Liste. Kerzen-im-Bogen-Komposition ist
narrativ stark — sie braucht Atemraum.

### Mi6 · `/auth/header-registrieren.png` Verwendung ist gut, aber Vertrauens-Tiles werden als 4:3-Cards gerendert

**Datei:** `apps/web/app/registrieren/page.tsx:106`

**Aktuelle Verwendung der Drei Tiles:** `aspect-[4/3] object-cover` — die
1200×1200-Vertrauens-Stufen-Bilder (19.2/19.3/19.4) sind quadratisch
gepromptet, werden aber im 4:3-Container beschnitten.

**Refactoring-Vorschlag:** `aspect-square` statt `aspect-[4/3]` — exakt
zur Auflösung passend. Das verhindert, dass z.B. das Wax-Seal-Motiv
oben oder unten abgeschnitten wird.

### Mi7 · `KlartextBegleiter` Banner ist 80vw groß für ein 1600×600-Asset — passt theoretisch, aber Höhe bei `h-20 sm:h-24` schluckt fast alles

**Datei:** `apps/web/components/KlartextBegleiter.tsx:43-44`

**Aktuelle Verwendung:** `relative w-full h-20 sm:h-24` (80–96 px hoch) bei
1600×600-Asset = Verhältnis ~16:0.6 statt der 16:6 des Originals.
Der untere Drittel des Bildes (mit Watercolor-Sprechblasen) wird
beschnitten oder unten gequetscht.

**Refactoring-Vorschlag:** Höhe auf `h-28 sm:h-32` (~128 px) erhöhen
und `object-cover object-center` lassen. Oder die Auflösung des Briefs
revidieren (1600×400 statt 600 für diesen flachen Banner-Use-Case).

---

## Minor · kleinere Verbesserungen

### Mn1 · `/tibetisch/nyepa-drei.png` als 56-px-Mikro-Watermark — okay, aber zu klein

**Datei:** `apps/web/components/DualeDeutung.tsx:40`

**Aktuelle Verwendung:** `w-14 h-14` (56 px) als dekorative Top-Right-Marke
mit `opacity-50`.

**Intendierte Auflösung (Brief 8.1):** 1200×1200 — das ist viel mehr Detail
als 56 px tragen können.

**Vorschlag:** Größer (96 px) und ohne Opacity-Reduktion, oder eine
dedizierte vereinfachte Version (3-Symbol-Icon) für diesen
Embedded-Use-Case generieren.

### Mn2 · Drei Compliance-Säulen (`bsi-schloss`, `datenschutz-hand`, `audit-ledger`) als gleichformatige aspect-square-Cards

**Datei:** `apps/web/app/compliance/page.tsx:148`

**Aktuelle Verwendung:** Alle drei in `aspect-square col-span-1` — aber
`audit-ledger.png` ist im Brief 23.3 als 1600×900 hero gepromptet
(side-angle Schreibtisch), nicht als 1:1.

**Vorschlag:** `audit-ledger.png` ist außerdem schon Hero (Zeile 60) — als
Säule unten zeigt es in 1:1 zentriert nur einen Ausschnitt. Eine
dedizierte 1:1-Variante "Audit-Log" oder ein anderes 1:1-Asset
verwenden, sonst Bild-Doppelung.

### Mn3 · Persona-Portraits in `Avatar` und `PersonaSwitcher` werden bei 32–48 px gerendert

**Dateien:**
- `apps/web/components/Avatar.tsx:133`
- `apps/web/components/PersonaSwitcher.tsx:222`
- `apps/web/components/AndereBegleiter.tsx:45`
- `apps/web/app/klient/begleiter/page.tsx:105`

**Aktuelle Verwendung:** `sizes="32px"` / `36px` / `48px` für
Greenscreen-Portraits, die als 1600×1600 vorliegen.

**Vorschlag:** Das ist die bestimmungsgemäße Verwendung von
Greenscreen-Portraits — keine Änderung nötig, nur Hinweis: hier
wäre eine 256×256-Pre-Rendered-Avatar-Variante schneller fürs
LCP. Evtl. ein Build-Step `next/image` lädt sie ja bereits richtig.

### Mn4 · `/auth/vertrauen-hoch.png` wird auf `/registrieren/demo` als "real"-Modus-Bild verwendet

**Datei:** `apps/web/app/registrieren/demo/page.tsx:15-19`

**Aktuelle Verwendung:** `MODUS_BILD.real = "/auth/vertrauen-hoch.png"` —
also das Wax-Seal-Motiv wird im Demo-Modi-Karusell als "real-account"-
Symbol verwendet.

**Vorschlag:** Funktioniert, aber semantisch-doppelt belegt (auf
`/registrieren` ist es "Echtheits-zertifiziert", hier ist es
"echter Account"). Klar genug für jetzt — bei Phase-3-Polish dediziertes
"echter-account"-Asset einplanen.

### Mn5 · Demo-Modi-Loops (`demo-modus-*.mp4`) werden mit `opacity-0 group-hover:opacity-100` über das Still gelegt — `group` fehlt aber am Parent

**Datei:** `apps/web/app/registrieren/demo/page.tsx:127-132`

Das ist ein Bug, kein Asset-Problem, aber relevant: die Loops
laufen *immer*, weil das `group`-Klassen-Anchor am Link fehlt.
Entweder `className="group ..."` ergänzen oder Loops ganz entfernen
und stattdessen den Still mit Hover-Saturation animieren.

---

## Top-5-Reparatur-Aufträge (sofort umsetzbar)

> ≤200 Wörter — die größten Hebel mit kleinstem Aufwand:

1. **Anamnese-Header-Pattern überarbeiten (M1).** Sechs Cockpits
   (`heilerziehung`, `ehrenamt`, `erziehung`, `hauswirtschaft`, `sozial`,
   `therapie`) verwenden alle dasselbe Quetsch-Pattern. Eine zentrale
   `<CockpitHero>`-Komponente bauen mit full-bleed `aspect-[16/7]` +
   Gradient-Overlay nach unten + Headline auf dem Bild. Spart Code,
   gibt jedem Beruf seine eigene Atmosphäre.

2. **Treuhand-Hero (M4) full-bleed machen.** Das Lockbox-Motiv ist das
   Vertrauenssignal des Geld-Moduls — als Card neben Text geht das
   verloren.

3. **Akte-Header `header-multi-view` (M2) und `header-behandlung` (M3)
   als Section-Backgrounds einsetzen** statt Card-Inhalt. Die "Map of
   Self"-Komposition braucht Bühne.

4. **Bestätigungs-Seiten (M5/M6) entcouplen:** das 256-px-Inbox-Icon
   *nicht* als 128-px-Hero verwenden. Entweder dediziertes Confirm-
   Asset rendern oder Icon klein neben H1 platzieren.

5. **`KlartextBegleiter`-Höhe von h-20/24 auf h-28/32 erhöhen (Mi7).**
   Sonst werden die Watercolor-Sprechblasen, die das Asset auszeichnen,
   abgeschnitten und der Banner wirkt anonym.

---

## Strukturelle Empfehlung (nicht Major, aber wichtig)

**Cockpit-Header-Pattern konsolidieren.** Die `grid-cols-12 / col-span-7
Text + col-span-5 aspect-[4/3] Bild`-Konstellation taucht in mindestens
9 Routen auf — und das ist genau die Konstellation, die jedes
1600er-Hero-Asset zu einer 480-px-Card macht. Eine geteilte
`<CockpitHeader>`-Komponente mit zwei Varianten (`compact-card` für
echte Square-Assets wie 7.2 oder Vertrauens-Stufen-Tiles, und
`full-bleed` für Hero-Assets mit Negativraum) würde sowohl
Wartbarkeit als auch visuelle Wirkung verbessern.
