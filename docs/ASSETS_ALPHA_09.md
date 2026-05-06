# Asset-Brief · Alpha-0.9 → 1.0-Polish

**Stand:** 2026-05-06 · **Pipeline:** GPT Image 2.0 (Stills) + Sora-2 / Seedance (Loops) + Pixella „Remove Background"

> **Style-Anker** (unverändert über alle Briefe): `bone, sage, dusty rose, oxidized brass, slate blue` — soft watercolor + clean ink line. **No text, no logos, no recognizable brand marks.** Approachable, dignified, not clinical.

GPT-Image-2.0-Suffix für **alle** Stills:
> `"soft watercolor + ink line, palette: bone, sage, dusty rose, oxidized brass, slate blue. No text, no logos, no brand marks. Approachable, dignified, not clinical."`

## Audit-Befund (2026-05-06)

- **0** broken Asset-References im Code (alle href/src/bild/loop-Pfade existieren in public/)
- **13/13** neue Icons aus Block 37-43 sind verdrahtet
- **4/4** neue Loops sind verdrahtet (atmo-begleitung, atmo-bestatter, topf-fluss, ki-bruecke-pulse)
- **2** ungenutzte Header-Dateien (`header-anamnese.png`, `header-inbox.png`) — dead assets, sollten geprunt oder neu eingebaut werden
- **6** Profilbild-Fallback-Avatare (Block 40) noch nicht generiert
- **3** Surfaces ohne dedizierten Hero (`/entwickler` recycelt KI-Brücke-Hero, `/admin/api-clients` ohne Hero, `/station/[klientId]` ohne Hero)

---

## Block 44 · Profilbild-Fallback-Avatare (6 Stills · Greenscreen)

**Wozu:** wenn Mitglied/Klient noch kein eigenes Profilbild hochgeladen hat, zeigt der `ProfilbildUpload`-Component aktuell eine Initialen-Bubble mit Brand-Gradient. Schöner: 6 generische Stand-In-Avatare die der User beim Onboarding wählen kann.

**Filename-Pattern:** `apps/web/public/portraits/fallback-{01-06}-{hue}.png` (1:1, 512×512, Chroma-Green #00B140 → Pixella keyen).

### 44.1–44.6 · Pattern (sechsmal mit anderem Hue-Marker)

```
Square portrait 512x512, soft watercolor + ink line. A simplified
human silhouette from the shoulders up, abstracted, no facial features
(just a soft suggestion of eyes and mouth via shading). Hue:
[SAGE GREEN | DUSTY ROSE | SLATE BLUE | OXIDIZED BRASS | WARM BONE | SOFT MINT].
Background flat solid #00B140 chroma green, no shadows, no spill.
No text, no logos, no specific facial features (intentional generic
stand-in). Approachable, dignified. Render the silhouette so it works
at 64px and 128px equally.
```

Filenames:
- `fallback-01-sage.png` — sage green
- `fallback-02-rose.png` — dusty rose
- `fallback-03-slate.png` — slate blue
- `fallback-04-brass.png` — oxidized brass
- `fallback-05-bone.png` — warm bone
- `fallback-06-mint.png` — soft mint

**Wo eingebaut:** [components/ProfilbildUpload.tsx](../apps/web/components/ProfilbildUpload.tsx) — neuer „Standard-Avatar wählen"-Modus statt nur Initialen-Bubble bei leerem Profilbild.

---

## Block 45 · Eigene Heros für 3 Surfaces (3 Stills · 16:9)

### 45.1 · `apps/web/public/akte/header-entwickler.png` (16:9, 2400×1500)

```
Wide horizontal scene 2400x1500, soft watercolor + ink line. A weathered
wooden workbench with hands of two abstract figures (no faces) leaning
in from opposite sides — one holding a small brass key, the other holding
a small wooden token shaped like an octagon (representing API token).
Between them on the bench: a single open notebook with handwritten lines
(unreadable, just texture). Soft morning light from upper-right.
Palette: bone background, sage notebook, oxidized brass key + token,
dusty rose hands, slate blue shadow accents. No text, no logos, no
brand marks. Approachable, professional, like a craftsmen's atelier.
Composition: bench fills lower-third, sky+light open above for headline.
```

**Wo eingebaut:** [/entwickler-Page](../apps/web/app/entwickler/page.tsx) — `bild`-Prop ersetzen (`/akte/header-entwickler.png` statt aktuell recyceltem `/akte/header-ki-bruecke.png`).

### 45.2 · `apps/web/public/akte/header-api-clients.png` (16:9, 2400×1500)

```
Wide horizontal scene 2400x1500, soft watercolor + ink line. A bird's-eye
view of an octagonal table with 5-6 small abstract figures sitting around
it, each holding a different colored thread that meets in a knot at the
center of the table. The threads are sage, dusty rose, slate blue,
oxidized brass — each thread is different but knot is woven together.
Light source: directly above (subtle radial highlight). Palette: bone
table, sage/rose/slate/brass threads, soft slate blue shadows. No text,
no logos, no brand marks. Approachable, collaborative, like a guild
meeting. Composition: table centered, edges fade out for canvas open
space.
```

**Wo eingebaut:** [/admin/api-clients](../apps/web/app/admin/api-clients/page.tsx) — neue HeroBanner-Section über der Liste.

### 45.3 · `apps/web/public/akte/header-station.png` (16:9, 2400×1500)

```
Wide horizontal scene 2400x1500, soft watercolor + ink line. A simplified
floor-plan view of a small station/Wohnbereich-Raum from a slight 3/4
angle: three doorways to soft-lit rooms, a central corridor with warm
floorboards, a window at the end with morning light flooding in. Two
small abstract figures in different soft pastels are visible — one in
a doorway, one walking down the corridor. No faces, no specific clothing
details. Palette: bone walls + corridor, sage doors, dusty rose figures,
oxidized brass window-frame, slate blue shadows. No text, no logos.
Approachable, daily-life, like a calm care-home in morning hour.
Composition: corridor leads eye toward window-light at horizon.
```

**Wo eingebaut:** [/station/[klientId]/page.tsx](../apps/web/app/station/%5BklientId%5D/page.tsx) — neue HeroBanner-Section vor dem Klient-Header.

---

## Block 46 · Empty-States für neue Module (3 Stills · 1:1, 800×800)

**Wozu:** wenn ein Topf-Saldo-View leer ist, Pool keine offenen Stellen hat, Station-Cockpit keine Nachrichten — heute zeigt die UI nur Text. Empty-State-Visuals erhöhen Wow-Faktor und Verständnis.

### 46.1 · `apps/web/public/empty/topf-leer.png` (1:1, 800×800)

```
Square 800x800, soft watercolor + ink line. An empty open ceramic bowl
seen from 3/4 above, with a single sage-green seedling sprouting from
the very center — suggesting "der Topf wartet auf den ersten Zufluss".
Palette: bone background, sage seedling, oxidized brass bowl rim,
soft dusty rose shadow. No text, no logos. Centered composition,
inviting empty space around bowl.
```

### 46.2 · `apps/web/public/empty/pool-leer.png` (1:1, 800×800)

```
Square 800x800, soft watercolor + ink line. Two abstract chairs at a
small round wooden table — one chair occupied (suggested by a folded
warm coat draped over it), one chair empty and turned slightly invitingly.
Soft window-light from upper-left. Palette: bone background, sage chair-
occupied, slate blue empty-chair, oxidized brass table, warm dusty rose
coat. No text, no logos. Composition: table centered, scene speaks
"hier ist Platz für dich".
```

### 46.3 · `apps/web/public/empty/cockpit-leer.png` (1:1, 800×800)

```
Square 800x800, soft watercolor + ink line. A simple wooden bench
along a window-side, with one cup of tea steaming on a small ledge
next to it — suggesting "alles ist ruhig, niemand hat heute geschrieben".
Light coming softly through window. Palette: bone wall, sage bench,
oxidized brass cup, dusty rose tea-steam, slate blue shadow. No text,
no logos. Composition: wide negative space, calming silence.
```

---

## Block 47 · Lana-Call-Demo-Polish (1 Loop · 1 Still)

### 47.1 · `apps/web/public/loops/lana-call-ring.mp4` (Loop, 16:9, 6s, 30fps)

```
Soft watercolor + ink line, 16:9, 1920x1080, 6 seconds, seamless loop.
A stylized smartphone (no specific brand) lying on a wooden surface, a
gentle pulsing concentric-ring radiating outward from the speaker
with each ring 1.5 seconds apart — visualizing an incoming call. Soft
ambient warm light from above. Palette: bone surface, sage rings,
oxidized brass phone-frame, dusty rose-warm light. No text, no logos.
Loop-cut seamless: ring fades out exactly as new ring starts.
```

**Wo eingebaut:** [components/LanaCallDemo.tsx](../apps/web/components/LanaCallDemo.tsx) — als Background-Loop hinter der Klingelnden-Avatar-Bubble.

### 47.2 · `apps/web/public/akte/lana-portrait.png` (1:1, 512×512, Greenscreen)

```
Square portrait 512x512, soft watercolor + ink line. A warm, dignified
woman in her late 30s, brown shoulder-length hair gently tied back,
attentive hazel eyes, slight knowing smile, wearing a soft sage-green
cardigan over a bone-cream blouse. Looking slightly past camera as if
listening attentively. Background: flat solid #00B140 chroma green,
no shadows, no spill (Pixella keying after). Palette: bone, sage,
dusty rose accent, oxidized brass earring. No text, no logos. The
expression should suggest warmth + presence, not stock-photo-cheerful.
```

**Wo eingebaut:** [components/LanaCallDemo.tsx](../apps/web/components/LanaCallDemo.tsx) — ersetzt das aktuelle gradient-`L`-Initial in der Avatar-Bubble. Auch nutzbar in Profil-Card auf /profil + im Audio-Toggle-Hint.

---

## Block 48 · Wundverlauf-Foto-Stub (1 Still · 4:3)

**Wozu:** Wundverlauf-Modul ist im Plan, aber kein Demo-Asset. Aktuell zeigt `/wunde/helga-sakraldekubitus-day-30.png` einen historischen Stand. Für die Demo-Story (Heilung über 60 Tage) brauchen wir 3 Sequenz-Bilder.

### 48.1–48.3 · Wundverlauf Helga (3 Stills · 1024×768)

Filename-Pattern: `apps/web/public/wunde/helga-sakraldekubitus-day-{0,30,60}.png`

**Tag 0 (existing? regenerate für Konsistenz):**
```
Wide 1024x768, soft watercolor + ink line. A close-up illustrated view
of a sacral pressure ulcer at initial stage — round wound, ~3 cm
diameter, pink-red base with edges starting to demarcate. Surrounding
skin slightly reddened. Soft clinical lighting, no faces, no body parts
beyond the wound area itself. Palette: dusty rose wound, bone surrounding
skin, slate blue shadow, oxidized brass measurement-grid faintly in
corner. No text, no medical brand markings, no scale-bars with numbers.
This is illustrative, not clinical-photographic — gentle abstraction.
```

**Tag 30 (existing — keep):**
Wie aktueller Stand `helga-sakraldekubitus-day-30.png`.

**Tag 60 (new):**
```
Wide 1024x768, soft watercolor + ink line. The same area as Day 0/30,
now showing a healed scar — small pale-pink mark, ~1 cm, surrounded by
healthy bone-tone skin with normal texture. Soft clinical lighting,
no faces. Palette: bone skin, very faint dusty rose scar-trace, slate
blue gentle shadow. No text, no logos. Illustrative, gentle abstraction.
The composition should feel like resolution and dignity.
```

**Wo eingebaut:** [components/StationFotoUpload.tsx](../apps/web/components/StationFotoUpload.tsx) Wundfoto-Demo-Daten + neue Wundverlauf-Sub-Route falls gebaut.

---

## Block 49 · Solidar-Topf-Auszahlungs-Bestätigung (1 Still · 1:1)

### 49.1 · `apps/web/public/empty/topf-auszahlung.png` (1:1, 800×800)

**Wozu:** wenn ein Solidar-Claim auf "ausgezahlt" gewechselt wurde, zeigt die UI nur einen Status-Wechsel. Ein Bild macht den Moment greifbar.

```
Square 800x800, soft watercolor + ink line. Two pairs of hands:
the upper pair (representing the cooperative) gently passes a small
warm-glowing sage-green parcel down to the lower pair (representing
the recipient member). The parcel has no text, no specific shape —
just suggests "support, given quietly". Soft warm light from above.
Palette: bone background, sage parcel-glow, oxidized brass hands-warmth,
dusty rose accents. No text, no logos. Composition: vertical, gentle
descent of object, hands meet at center.
```

**Wo eingebaut:** [components/SolidarClaimAktion.tsx](../apps/web/components/SolidarClaimAktion.tsx) — neuer Erfolgs-Toast nach `genehmigeClaim()` mit diesem Visual.

---

## Priorisierung für die nächste Generierungs-Runde

| Rang | Asset | Wirkung | Aufwand |
|------|-------|---------|---------|
| 1 | Block 47 · Lana-Portrait + Ring-Loop | hoch — größter Wow-Demo-Moment | 2 Generierungen |
| 2 | Block 44 · Profilbild-Fallback-Avatare | hoch · Onboarding-Flow | 6 Generierungen |
| 3 | Block 45 · 3 Surface-Heros (entwickler / api-clients / station) | mittel · Marken-Konsistenz | 3 Generierungen |
| 4 | Block 48 · Wundverlauf-Sequenz | mittel · Demo-Story | 2 neue (Tag 0 + Tag 60) |
| 5 | Block 46 · 3 Empty-States | niedrig · Polish | 3 Generierungen |
| 6 | Block 49 · Topf-Auszahlung | niedrig · Polish | 1 Generierung |

**Total für 1.0-Reife:** **17 weitere Generierungen** (12 Stills + 1 Loop + 4 Optional). Bei der bisherigen Pipeline-Geschwindigkeit (~5 Min/Asset inkl. Pixella-Keying) sind das ~90 Min für ein klar polierteres Erscheinungsbild der Alpha.

## Was nicht produziert werden muss

- **Header-Anamnese / Header-Inbox** — bereits vorhanden, aber nirgendwo verlinkt. Entscheidung: **prunen** oder einbauen. Empfehlung: prunen (Asset-Hygiene wichtiger als unklare Wiedernutzung).
- **Dark-Mode-Varianten** — DSGVO-FA + Pilot-Reife haben Vorrang vor Dark-Mode-Polish.
- **Voll-Voice-Modus-Visual** — `aria-live`-Region ist unsichtbar by design, kein Asset nötig.

---

## Quick-Win für SOFORT (ohne neue Assets)

Falls keine Render-Zeit für Block 44–49: zwei Header-Dateien aus public/akte/ prunen, die nirgendwo verlinkt sind:
```
apps/web/public/akte/header-anamnese.png  (unused)
apps/web/public/akte/header-inbox.png     (unused)
```

→ ~20 KB Asset-Hygiene + cleaner repo. Im Code keine Referenzen, also safe to delete.
