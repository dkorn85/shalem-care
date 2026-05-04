# Was an Assets noch fehlt — Brief für Designer:innen / KI-Generatoren

Stand: 2026-05-04. Was schon im Repo liegt, ist unten gelistet. Was
noch fehlt, ist priorisiert nach **Wirkung × Aufwand**.

---

## Schon vorhanden

```
public/brand/         01_logo_hero_1x1.png · 01b_logo_hero_alt_1x1.png · 02_og_card_16x9.png
public/hero/          06a_hero_window_back · 06c_hero_hands_detail · 07_lead_tablet · 07b_lead_tablet_loop
public/loops/         08_loop_geometry_breath · 09_loop_corridor_morning · hero-haende · hero-sonne · hero-weg
public/portraits/     10_1 .. 10_8 (Pflege, Sozial, Erzieh, Beratung, Ergo, Heiler, Hauswirt, Ehrenamt)
public/pflegegrade/   pg1 .. pg5
public/empty/         03_empty_breath · 04_plan_published · 05_swap_success
public/onboarding/    welcome · skills · empty-state · confetti
public/anim/          11_anim_match · 12_anim_approved
public/datenschutz/   keys.png
public/icon.png · public/opengraph-image.png · public/favicon.ico
```

Das Set ist überraschend komplett. Was wirklich noch fehlt — und was
die Demo deutlich aufwertet — ist eine kurze Liste.

---

## Priorität A · für die Demo-Präsentation kritisch

### 1. Klient-Persona-Avatare (8–12 Stück)
Stilistisch: illustrierte Köpfe wie die `portraits/10_X`-Reihe, aber
freundliche Senior:innen-Gesichter. Demo-Personas:

| ID         | Name                | Pflegegrad | Kontext                                    |
| ---------- | ------------------- | ---------- | ------------------------------------------ |
| klient-hr  | Helga Reinhardt     | 3          | 78, Demenz mittel, mobil mit Rollator      |
| klient-wb  | Wilhelm Brand       | 4          | Diabetes II, Wundmgmt Ferse                |
| klient-eg  | Elfriede Gramberg   | 5          | Bettlägerig, palliativ                     |
| klient-rk  | Reinhardt Kuhn      | 2          | Selbstständig, braucht Med-Stellung        |
| klient-im  | Ingrid Mayrhofer    | 3          | Parkinson, mobil mit Stock                 |
| klient-fl  | Friedrich Liebenau  | 2          | Wohnt allein, Tochter besucht 2×/Woche     |
| klient-mc  | Maria Chmielewski   | 4          | 8 Mo nach Schlaganfall, Therapie läuft     |
| klient-ko  | Konrad Obermair     | 4          | Geriatrie 5, München                       |

- Format: 1024×1024 PNG, transparenter Hintergrund.
- Stil: warm, würdig, KEIN Stock-Foto-Look. Keine Krankheits-Klischees.
- Ablage: `public/klienten/<id>.png`
- Wird angezeigt in: Klient-Kacheln (Stationsansicht), Klient-Detail-Header,
  Lead-Doku-Übersicht, Arzt-Patient:innen-Liste.

### 2. Pflegekraft- und Arzt-Avatare (~24 Stück)
Aktuell zeigen wir nur Initialen-Kreise. Das wirkt steril. Die
Hauptpersonas:

**Pflege/Lead** (~18): Dennis Reuter (DR), Lana Schmidt (LS), Tom Weber (TW),
Mira-Ki (MK), Detektiv Eins (D1), Maren Köhler (MK), Jonas Bertram (JB),
Rebecca Kowalski (RK), Martina Heinen (MH), Anika Hofmeister (AH), Tobias
Grünwald (TG), Petra Lindgren (PL), Felix Kaminski (FK), Aylin Sözen (AS),
Jana Möbius (JM), Robin Westphal (RW), Sven Trautmann (ST), Eda Demir (ED).

**Arzt/Therapie** (~5): Dr. Susanne Hartmann, Dr. Igor Vasilev, Dr. Marie
Lehmann, Dr. Frank Krüger, Dipl.-Psych. Lara Brüning.

- Format: 512×512 PNG, transparent.
- Stil: gleicher illustrierter Look wie die `portraits/`-Reihe.
- Ablage: `public/people/<person-id>.png`
- Diversität: Alter, Hautfarbe, Geschlecht, Tracht (mit/ohne Kopftuch,
  mit/ohne Bart, mit/ohne Brille). Es geht ums Repräsentieren der
  realen Pflegelandschaft.

### 3. Demo-Screencast (60–90 s, MP4)
Der visuelle Aufhänger für jeden Pitch und jede Pressemitteilung.

- Klick-Pfad: Landing → Demo-Tour-Modal → Pflegekraft-Pfad alle 4 Stops →
  Arzt-Pfad → Klient-Pfad. Tempo zügig, kurze Hold-Frames bei wichtigen
  Detail-Karten (KI-Briefing, Burnout-Warning, eRezept-Code).
- Format: 1920×1080 MP4 (H.264), 60–90 s, ohne Ton (oder mit Klavier-Loop).
- Ablage: `public/hero/demo-tour.mp4` (+ `.webm` Alternative).
- Verwendung: Hero-Video auf Landing, Twitter-Card, Press-Kit-PDF.

### 4. Maskable-Icon für PWA (1 PNG)
Das aktuelle `01_logo_hero_1x1.png` hat ein zu großes Inhaltsfeld
für maskable-Display (Android schneidet rund/quadratisch).

- Format: 1024×1024 PNG mit ~80 % Safe-Area in der Mitte.
- Hintergrund: einfarbig oder Brand-Gradient.
- Ablage: `public/icon-maskable.png`
- Eintragen in `app/manifest.ts` als `purpose: "maskable"`.

---

## Priorität B · gut für Marketing & SEO

### 5. Open-Graph-Bilder pro Hauptbereich (4 Stück)
Bislang nur ein generisches OG-Card. Eigene OG-Bilder für jeden
Haupt-Eingang erhöhen die Click-Through-Rate beim Teilen.

- Format: 1200×630 PNG, je Seite eigenes Motiv + Haupt-Headline.
- Bedarf:
  - `og/dienst.png` — Stationsansicht-Screenshot mit Headline „Stationsansicht — alles in einer Schicht"
  - `og/erloes.png` — Erlös-Diagramm-Visual mit „Erlös nach Kostenträger"
  - `og/arzt.png` — Anfrage-Karte mit „Verordnung in 3 Klicks"
  - `og/krankmeldung.png` — „Krank melden — Vertretung kümmert sich"
- Eintragen via `generateMetadata` pro Route.

### 6. Datenschutz-Infografik
Eine 1-Seiten-Visualisierung:
- Daten verlassen die EU nicht
- Wer sieht was (Pflegekraft / Lead / Arzt / Klient)
- Welche Resources (FHIR-Tree)
- AGPLv3-Auditierbarkeit

Format: 800×1600 PNG, eingebettet in `/datenschutz`.

### 7. Funktions-Schaubild auf Landing
Aktuell beschreiben wir Funktionen in Text. Eine Infografik (Diagramm
oder isometrische Illustration) der drei Mitglieder + Schlussstein
hilft beim ersten Eindruck.

Format: 1600×1000 PNG/SVG, Ablage `public/diagram/cooperative-keystone.svg`

### 8. Social-Cards für Twitter/LinkedIn (separat zur OG)
- Twitter: 1200×675 PNG
- LinkedIn: 1200×627 PNG
- Format-spezifisch optimiert (Twitter-Card sieht oben/unten beschnitten aus).

---

## Priorität C · nice-to-have

### 9. Favicon-Set (komplett)
Aktuell nur `icon.png`. Empfehlung:
- `favicon.ico` (16×16, 32×32, 48×48 multi-resolution)
- `apple-touch-icon.png` (180×180)
- `icon-192.png`, `icon-512.png` (für PWA)

### 10. 404 + 500 Page-Assets
Bilderzeile für die Error-Pages — bisher generisch. Idee: dezenter
Schriftzug + Empty-State-Bild (`public/empty/03_empty_breath_4x3.png`
ist schon brauchbar, könnte aber dediziert sein).

### 11. Brand-Book PDF
6–10 Seiten, Logo-Spec, Farben, Typografie, Tone-of-Voice. Ablage:
`public/brand/shalem-brand-book.pdf`

### 12. Onboarding-Tour als animierte Loop-Videos
Pro Persona ein 15-s-Loop, der beim Hover über die Persona-Karte auf
der Landing startet. Ergänzt das statische Portrait-Bild.

### 13. Sample-Doku-Screenshots (DE/EN)
Hochauflösende Screenshots der wichtigsten Flächen für Pitch-Decks /
Pressemappen — 2560×1600 PNG.

---

## Wie generieren?

**Schnell + günstig:** KI-Bildgeneratoren (Midjourney, DALL-E 3, Flux):
- Konsistenter Charakter über Prompt-Pinning
- Für Avatare: `--cref` mit einem Master-Sketch arbeiten
- Stil-Anker: „warm, dignified, illustrated, watercolor + line, soft palette,
  no medical clichés, age 60-85, neutral background"

**Solider:** Eine Illustratorin / einen Illustrator mit Brand-Brief beauftragen.
Budget für die A-Liste (32 Avatare + 1 Demo-Video + 1 Maskable-Icon)
realistisch: 1500–3500 €.

**Tickets als Issue-Liste:**
Wenn du willst, lege ich die A/B/C-Punkte als GitHub-Issues mit Labels
`assets`, `priority:A` etc. an — dann kann sie ein/e Designer:in
abarbeiten oder du verteilst sie per Auftrag.

---

## Demo-Pitch-Material (separat zu Code-Assets)

Was du für eine LIVE-Präsentation parat haben solltest:

- **Pitch-Deck** (10–12 Slides): Problem · Lösung · Demo · Markt · Genossenschaftsmodell · Roadmap · Team · Kontakt.
- **One-Pager-PDF** (1 Seite): die Zahlen aus `/presse`, das Boilerplate, ein Screenshot.
- **Demo-Skript** (1 Seite): die Klick-Pfade aus dem DemoTour-Modal als Spickzettel.
- **Q&A-Liste** (DSGVO, MDK, FHIR, eRezept, Konkurrenz, Geschäftsmodell).

Sag wenn du eines davon schreiben sollst — Pitch-Deck und Demo-Skript
kann ich aus dem aktuellen Stand sofort generieren.
