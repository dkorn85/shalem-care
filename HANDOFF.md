# Shalem Care · Session-Handoff

**Stand:** 2026-05-08 · für die nächste Session
**Branch:** `main` direkt · **208 Routen** · `tsc --noEmit` exit 0
**Phase:** PVS-Reife-Aufbau · 13 Berufe · 15 Mini-Games ·
**Expertise-Modus** auf **17 Cockpits** durchgängig · 4 KI-Funktionen ·
**Schein-Optik** für Kasse mit 5 KI-Bild-Assets · Ehrenamt-Begleit-Cockpit live ·
[Expertise-Konzept-Doc](docs/EXPERTISE_KONZEPT.md) als Maßstab für künftige Cockpits

---

## TL;DR · was läuft live

- Demo-Domain: **shalem.de** (Hostinger Node.js, Auto-Deploy via Push auf `main`)
- Repo: <https://github.com/dkorn85/shalem-care>
- Supabase: `gpchwlqeqejxvynewjns.supabase.co` · 8 Tabellen · RLS aktiv
- Auth: Email + Google OAuth · Profile-Auto-Create · DSGVO-Self-Service
- **Messenger live · Pfad B Supabase-Realtime** mit Channels, DMs, Reactions, Presence, Typing
- 201 Routen, alle 13 Berufe haben Heute-Hub + Diktat + Dienstplan
- KI-Dienstplan-HUD für PDL · 3-Zonen-Archiv · pk-ruhr-Multiplier-Brücke
- Politik-Schnittstelle mit KI-Gesundheitsminister-Simulator + live PVS-Aggregat
- Aufsichtsrats-Bericht mit Druck-Ansicht + eIDAS-Signatur-Container
- **Brillenmodus** universal · KI-Klartext für jeden markierten Begriff
- **Mobile-Hamburger-Drawer** · volle Sidebar-Nav auf Smartphone
- **Voll-WebRTC** mit Supabase-Signaling · RTCPeerConnection-Mesh ≤4 Peers
- 11 Berufe mit eindeutiger **Akzent-Farbe** in Sidebar/Header/BottomNav
- **🎮 Game-Mode** als optionaler Spielmodus · 15 Mini-Games über alle Berufe
- **◯◐● Expertise-Modus** Lerne / Praxis / Profi pro Beruf · 17 Cockpits durchgängig (auch Kasse-Portal über KasseShell, auch Genossenschaft via `expertiseRolleOverride`)
- **📜 Schein-Optik** im Kasse-Portal · Original-Look Muster 1 (gelb) / Muster 12 (rosé) / formaler Bescheid-Brief mit Briefkopf · 5 KI-generierte Stempel-/Papier-Assets via mix-blend-mode komponiert
- **🤝 Ehrenamt-Begleit-Cockpit** mit Stimmungs-Sparkline 1–5 (DHPV-Curriculum), Lebenslagen-Tags, Trübe-Warnung bei 2× ≤2 in Folge, Biografie nach Schuchardt
- **5 echte Beruf-Cockpits** neu: Therapie-Patient-Verlauf · HW-Wochenplan · Sozial-Hilfepläne · HE-Teilhabe · Erz-Lerngeschichten
- **4 zusätzliche KI-Funktionen:** Therapie-Verlaufsbrief · ICF-Vorschlag (Sozial) · DGE-Speiseplan-Vorschlag · Carr-Lerngeschichte-Entwurf

---

## Was diese Woche gebaut wurde (Sessions seit 2026-05-06)

### 1 · Marketing-Schicht-Polish (Sessions 1-3)
- 8 Marketing-Pages mit `<SiteFooter />` ausgerollt
- Frontpage neu gegliedert · Final-CTA-Block "Drei Wege rein"

### 2 · Lieferanten-Schicht (Session 4)
- `lib/gemeinwohl/matrix.ts` · `lib/lieferanten/store.ts` · `lib/expertenstandards/dnqp.ts`
- 4 BrancheHub-Pages, `/lieferanten`, `/gemeinwohl`, `/expertenstandards`, `/netz/berufe`

### 3 · Pflege-Assessment-Tools (Session 5)
- `lib/assessment/skalen.ts` · 4 interaktive Client-Tools · `/pflege/assessment`

### 4 · Claude-Integration (Session 6)
- Diktat-KI · Klient-Akte verstehen · Frag-Lana

### 5 · Live-Sim mit 11 KI-Personas (Session 7)
- 3-Spalten-Cockpit `/demo/leben`

### 6 · 45 KI-generierte Aquarell-Icons (Session 8)
- 5 GPT-Image-2.0-Grids · `scripts/crop-grids.py`

### 7 · PVS-Strategie + Roadmap (Session 9)
- `docs/PVS_STRATEGIE.md` · 53 Module · `/roadmap/pvs`

### 8 · Live-Fallbesprechung (Session 10)
- `components/FallbesprechungLive.tsx` · Lana KI-Moderator

### 9 · HKP-Verordnungs-Pipeline (Session 11)
- 5-Stufen-Pipeline · 4 Demo-Verordnungen · `/admin/verordnungen`

### 10 · PVS Phase A komplettiert (Session 12 · 2026-05-07)

| Commit | Modul | Route |
|---|---|---|
| `1c3795c` | Pflege-Quartalsabrechnung mit DTA-§302-Vorschau | `/admin/abrechnung` |
| `621bc14` | Pflegegrad-Antrags-Pipeline · 5 Stufen NBA → Bescheid | `/admin/pflegegrad` |
| `cb96b2d` | Wundmanagement Pflege-Cockpit · ICW-Doku-Form | `/pflege/wunde` |
| `276bdf0` | Cross-Beruf-Termin-Migration · TourPunkt → FHIR-Appointment | `/termine` |

### 11 · TI-Anschluss (Session 13)

| Commit | Modul | Route |
|---|---|---|
| `2502412` | gematik-Konnektor-Anbieter-Vergleich · 6 Anbieter | `/admin/ti/konnektoren` |
| `616bd43` | KIM-Mail FHIR-Bundle + S/MIME-Vorschau | (Verordnungs-Detail) |
| `b123bdc` | eRezept-Pilot · 3 Demo-Rezepte mit Token + AccessCode | `/arzt/erezepte` |
| `26793af` | HBA + SMC-B Karten-Cockpit · 5 Demo-Karten · PIN-Status | `/admin/ti/karten` |

### 12 · Inhalt + Politik (Session 14)

| Commit | Modul | Route |
|---|---|---|
| `8086e3b` | Aufsichtsrats-PDF-Druck-Ansicht + eIDAS-Container | `/aufsicht/druck/[q]` |
| `cc02e81` | Politik-Aggregat live aus PVS-Daten · k-Anonym-Audit | `/politik` |
| `f781397` | Quartal-Ausschüttung-Workflow eG · 5 Stufen | `/genossenschaft/ausschuettung` |

### 13 · UI-Polish · Mobile + Brillenmodus + Beruf-Farben (Session 15)

`e5ab8c3` Mobile-Hamburger-Drawer · Brillenmodus universell als FAB ·
11 Berufe bekommen eindeutige CSS-var Akzent-Farbe in AppShell/BottomNav.

### 14 · WebRTC Phase 2 (Session 16)

| Commit | Modul | Route |
|---|---|---|
| `b6a4a02` | RTCPeerConnection-Mesh über Supabase-Broadcast · ≤4 Peers | `/konferenz/[id]/live` |
| `b52907c` | LiveKit-SFU-Setup-Cockpit · Token-Stub · 6-Schritte-Checklist | `/admin/ti/sfu` |
| `e09cb5c` | Cloud-Recording + FHIR-Encounter · Retention-Policy | `/admin/recordings` |

### 17 · Schein-Optik Kasse · Ehrenamt-Workflow · GenG-Expertise · Layout-Fix (Session 19 · 2026-05-08)

**Schein-Optik im Kasse-Portal (`5965d47`, `ba3bbd9`):**

| Komponente | Datei | Look |
|---|---|---|
| `<MusterZwoelfHKP>` | `components/scheine/MusterZwoelfHKP.tsx` | rosé HKP-Verordnung mit Vordruck-Linien, IK/LANR/BSNR-Grid, Maßnahmen-Tabelle |
| `<MusterEinsAU>` | `components/scheine/MusterEinsAU.tsx` | kanariengelbe AU-Bescheinigung mit roten Druck-Linien, Diagnose+ICD-Chips |
| `<KassenBescheidBrief>` | `components/scheine/KassenBescheidBrief.tsx` | formaler Brief mit Wellen-Logo, Anschriften-Fenster, Rechtsbehelfsbelehrung |
| `<KlartextSpalte>` | `components/scheine/KlartextSpalte.tsx` | Side-by-side Original ↔ Lana-Klartext + Glossar + nächste Schritte |

**5 KI-generierte Bild-Assets** (`public/scheine/`):
- `stempel-praxis.png` · runder Praxis-Stempel mit BSNR/LANR · `nano_banana_2`
- `stempel-bewilligt.png` · grüner „BEWILLIGT"-Tintenstempel
- `stempel-abgelehnt.png` · roter „ABGELEHNT"-Tintenstempel
- `papier-textur.png` · kachelbare Briefpapier-Faserung
- `wm-eau.png` · diagonales eAU-KIM-Wasserzeichen

Alles via `mix-blend-mode: multiply` komponiert — weißer Hintergrund verschwindet, nur die Tinte bleibt. Geheuristik in `lib/kasse/bescheid-daten.ts` baut aus jedem `KassenVorgang` automatisch den passenden Schein + ein vorgangs-spezifisches Klartext-Paket.

**Ehrenamt-Begleit-Cockpit (`17a89f4`):**

| Datei | Was |
|---|---|
| `lib/ehrenamt/begleit-store.ts` | 3 Klient:innen mit 5–8 Termin-Verläufen · Stimmung 1–5 (DHPV) · Lebenslagen-Tags · Tendenz-Helper |
| `/ehrenamt/begleitung` | Liste mit Tendenz-Chips · Lerne: Schuchardt-Biografie · Profi: Lebenslagen-Verteilung |
| `/ehrenamt/begleitung/[id]` | Sparkline-Verlauf · Trübe-Warnung bei 2× Stimmung ≤2 in Folge · Biografie · Lebenslagen-Chips · vereinbarte Grenzen · Termin-Liste |

**Genossenschaft-Expertise (`fea69bd`, `d301111`):**

| Cockpit | Lerne (Mitglied) | Profi (Aufsichtsrat) |
|---|---|---|
| `/genossenschaft/pool` | GenG § 1 + BAP-Marge | Pool-Auslastung · Bedarfe/Stellen-Match · Marge-Ersparnis |
| `/genossenschaft/solidartopf` | GenG § 17 + Cap-Logik | Reserve-Status · Claim-Quote · Cap-Tage · § 17-Bezug |
| `/genossenschaft/ausschuettung` | GenG § 19 + Workflow Vorstand→AR→SEPA | Genehmigungs-Stau · Auszahlungs-Quote · Σ YTD · § 19-Rechtsbasis |

`AppShell` bekam `expertiseRolleOverride`-Prop, damit GenG-Pages mit `role="nurse"`/`role="lead"` trotzdem den Genossenschafts-Toggle zeigen.

**Layout-Fix (`367ba48`):**
GameMode-FAB (`bottom-36` mobile = 144px) verdeckte Inhalt — `pb-24` reichte nicht. AppShell jetzt `pb-48 lg:pb-32`, KasseShell nachgezogen + Footer mit `pb-24 lg:pb-10`.

**Konzept-Doc (`735ad08`):**
[`docs/EXPERTISE_KONZEPT.md`](docs/EXPERTISE_KONZEPT.md) hält pro Beruf systematisch fest, wer in welcher Stufe was sieht (Pflege: Azubi/Pflegekraft/Pflegeprofi · Arzt: Assistenz/Facharzt/Oberarzt · …) und gibt Faustregeln für künftige Cockpits.

### 16 · 5 echte Beruf-Cockpits · Expertise-Modus · 4 KI-Funktionen (Session 18 · 2026-05-08)

**5 neue Beruf-Cockpits — von Diktat-only zu echten Workflows:**

| Commit | Cockpit | Route(n) | Was es bringt |
|---|---|---|---|
| `fcc2b8d` | **Therapie-Patient-Verlauf** | `/therapie/patienten`, `/therapie/patient/[id]` | VAS / ROM / MRC als Sparkline · Tendenz-Chip · ICF + SMART-Ziele · Termin-Historie |
| `fcc2b8d` | **HW-Wochenplan** | `/hauswirtschaft/wochenplan` | DGE-konformer 7-Tage-Plan · 6 Kostformen · LMIV-Allergen-Filter |
| `953a125` | **Sozial-Hilfepläne** | `/sozial/hilfeplan`, `/sozial/hilfeplan/[id]` | ICF-Bedarfsbogen · SMART-Ziele · Maßnahmen-Status · Reviews · SGB IX/XII/VIII/XI |
| `953a125` | **Heilerziehung-Teilhabe** | `/heilerziehung/teilhabe`, `/.../[id]` | BTHG-Teilhabeplan · Selbstvertretung · Persönliches Budget · HPK-Zyklus |
| `76d4be3` | **Erz-Lerngeschichten** | `/erziehung/lerngeschichten`, `/.../[id]`, `/.../neu` | Carr-Lerngeschichten · BBP-Bildungsbereiche · Lerndispositionen |

**4 KI-Funktionen pro Cockpit (Anthropic Haiku 4.5 · Mock-Fallback):**

| Commit | KI-Box | Cockpit |
|---|---|---|
| `57db143` | **Therapie-Verlaufsbrief** · 4 Sitzungen → Brief an Hausarzt | Therapie-Patient-Detail |
| `57db143` | **ICF-Vorschlag** · Bedarfs-Text → b/d/e-Code-Vorschläge | Sozial-Hilfeplan |
| `76d4be3` | **DGE-Speiseplan** · Klient + Kostform → Wochenplan-Vorschlag | HW-Wochenplan |
| `76d4be3` | **Carr-Lerngeschichte** · Beobachtung → Entwurf + BBP-Tags | Erz-Lerngeschichten/neu |

**Expertise-Modus · Lerne / Praxis / Profi (`2c1c52b`):**

- Globaler `<ExpertiseChip />` im AppShell-Header — Default `praxis`, persistiert pro Beruf in `localStorage["shalem.expertise.<rolle>"]`
- 11 Berufe haben rollen-spezifische Labels (Pflege: Azubi/Pflegekraft/Pflegeprofi · Arzt: Assistenz/Facharzt/Oberarzt · …)
- `<LerneTipp rolle>` blendet Glossar-Banner für Casual/Azubi ein
- `<NurAbProfi rolle>` zeigt erweiterte KPI-Blöcke nur im Profi-Modus
- `<NurAb / NurBis / NurBeiLevel>` als Komfort-Wrapper

**In 13 Cockpits eingezogen** (Commits `685e50e`, `fce8fe4`, `1e6ce2c`, `3ead59c`, `a5555cb`, `9a0d007`, `c9dde2a`, `ab7fcf7` plus initiale Wires):

| Cockpit | Lerne-Tipp | Profi-Block |
|---|---|---|
| Pflege/Heute | DBfK-Glossar | Performance-Tracking · Caseload · Cross-Termine · HKP-VOs |
| Arzt/Heute | AU/HKP/ICD/DMP-Glossar | Akut-Quote · CGM-Click-Vergleich · Diktat-Ersparnis |
| Therapie/Patienten-Liste | VAS/ROM/MRC | Outcome-Verteilung fallend/stabil/steigend |
| Therapie/Patient-Detail | (initial) | (initial) |
| Sozial/Hilfeplan-Liste | SGB IX/XII/VIII/XI · SMART | SGB-Verteilung · DGCC-Caseload |
| Sozial/Hilfeplan-Detail | (initial) | (initial) |
| HE/Teilhabe-Liste | BTHG/ICF/P-Budget | P-Budget-Quote · Ziele · HPK |
| HE/Teilhabe-Detail | Carr-ICF-Lesart | Bedarf-Schnitt · Hochbedarf · HPK-Tage |
| HW/Wochenplan | DGE/LMIV/IDDSI | Wareneinsatz · Bio-Anteil · HACCP · Reste |
| Erz/Lerngeschichten-Liste | Carr-Methodik | Bildungsbereich-Verteilung |
| Erz/Lerngeschichte-Detail | Carr-Disposition | Carr-Profil · Tag-Vielseitigkeit |
| Ehrenamt/Cockpit | § 3 Nr. 26a EStG · Rollenklarheit | Stunden-YTD · Steuer-Spielraum · DHPV-Curriculum |
| Kasse/Portal | eAU/HKP/Krankengeld · Status-Spur | Genehm/Rückfr/Ablehn-Quote · § 13 Abs. 3a Fiktion |
| Admin/Dienstplan-HUD | ArbZG · Co-Pilot-Aktionen | Einrichtungen · Quals · 26-Wo-Horizont · PpUGV-Risiko |

### 15 · Game-Mode · Mini-Games über alle Berufe (Session 17 · 2026-05-08)

**Konzept:** Aus langweiligen Aufgaben werden Spiele · alles optional über
🎮-Toggle rechts unten · Default aus, gemerkt in localStorage.

**8 Power-Mini-Games (PDL · Pflege · Klient):**

| Commit | Spiel | Route |
|---|---|---|
| `e9154cc` | **Dienstplan-Arena** · Auto-Pilot/Manuell/Sparring · Combo-Score · Konfetti | `/admin/dienstplan/arena` |
| `3816512` | **Genehmigungs-Sprint** · Tinder-Stack für ALLE Approvals · KI-Empfehlung pro Karte | `/admin/genehmigungen/sprint` |
| `c645b2c` | **NBA-Sprint** · Pflegegrad-Antrag als One-Question-Quiz · Live-PG-Prognose | `/pflegegrad-check/sprint` |
| `16ecb4f` | **Wund-Tendenz-Quiz** · Vorher/Nachher · DNQP-Hinweise pro Antwort | `/pflege/wunde/quiz` |
| `5f977d3` | **Diktat-Booster** · Rapid-Fire SIS-Feld-Klassifizierung · 8-Sek-Timer | `/pflege/diktat/booster` |
| `b4409bd` | **Bescheid-Quiz** · Amtsdeutsch → Klartext · Lana-Erklärung | `/klient/bescheid-quiz` |
| `54b549e` | **MD-Audit-Hunt** · Multi-Select Akten-Lücken finden · DNQP/MDK-Standards | `/admin/audit/hunt` |
| `dfec313` | **Wirtschaftlichkeits-Sandbox** · Slider-Spielwiese · Münzen-Regen | `/admin/wirtschaft/sandbox` |

**Game-Mode-Infrastruktur:**

| Commit | Was |
|---|---|
| `046b3a3` | Globaler Toggle 🎮 · `useGameMode()` Hook mit localStorage · Custom-Event-Sync · Alle Hero-Karten gewrappt in `<GameModeOnly>` |

**7 Beruf-Quizze (Default-bisher-trockene Cockpits):**

| Commit | Spiel | Route | Kategorien |
|---|---|---|---|
| `3faa6ea` | **ICD-10-Sprint** · Symptom → Code · 12-Sek-Timer | `/arzt/quiz` | Kreislauf · Endokrin · Psyche · Muskel · Atemweg · Haut |
| `3faa6ea` | **HMV-Code-Match** · Indikation → Heilmittel-Code | `/therapie/quiz` | WS1 · EX1 · ZN1 · SP1 · PS1 · Lymph |
| `3faa6ea` | **Paragraphen-Hunt** · Lebenslage → § | `/sozial/quiz` | SGB IX/XII/VIII · WBVG · BGB · § 7a SGB XI |
| `3faa6ea` | **ICF-Lebenswelten** · Beobachtung → ICF-d | `/heilerziehung/quiz` | d1/d3/d4/d5/d6/d7/d9 |
| `3faa6ea` | **Kostform-Puzzle** · Klient → Diät | `/hauswirtschaft/quiz` | Diabetes · Schluck · Natriumarm · Vollkost · Hochkalor · Religiös |
| `3faa6ea` | **Bildungs-Bingo** · Beobachtung → BBP-Feld | `/erziehung/quiz` | Sprache · Natur · Mathe · Musik · Werte · Körper |
| `3faa6ea` | **Begleit-Bingo** · Begegnung → Reaktion | `/ehrenamt/quiz` | Zuhören · Biographie · Praktisch · Pflege · Spirit · Aktivieren |

**Geteilte Mini-Game-Mechanik:**
- Vollbild ohne Sidebar (`fixed inset-0 z-50`)
- Tastatur 1-N für Antwort, ←/→/Space/B/Backspace für Navigation
- Combo-Streak mit Phrasen-Eskalation („Doppel" → „Combo" → „On Fire")
- Live-Score · Punkte je Combo-Stufe · Konfetti am Ende
- Lern-Hinweis-Box nach jeder Antwort mit fachlicher Begründung
- Erfolgs-Phrase pro Trefferquote (perfekt/gut/solide/schwach)

---

## Termux-Setup auf Tablet · neu starten

```bash
# Falls Repo noch nicht da:
pkg install git nodejs-lts
git clone https://github.com/dkorn85/shalem-care.git
cd shalem-care/apps/web
npm install --include=dev

# ENV-Vars in .env.local:
echo 'NEXT_PUBLIC_SUPABASE_URL=https://gpchwlqeqejxvynewjns.supabase.co' > .env.local
echo 'NEXT_PUBLIC_SUPABASE_ANON_KEY=<aus Supabase-Dashboard>' >> .env.local
echo 'ANTHROPIC_API_KEY=<aus Anthropic-Console>' >> .env.local

# Type-check:
npm run type-check

# Build (Hostinger-Heap):
NODE_OPTIONS=--max-old-space-size=2048 npm run build

# Dev-Server:
npm run dev   # localhost:3000
```

**Push-Auth einrichten** (falls noch nicht):
```bash
git config --global credential.helper store
echo 'https://dkorn85:<DEIN_PAT>@github.com' > ~/.git-credentials
chmod 600 ~/.git-credentials
```

---

## PVS-Reife · Stand pro Beruf

53 Module katalogisiert in `lib/pvs/matrix.ts`. Sichtbar unter `/roadmap/pvs`.

| Beruf | Live | KI-Funktion | Game-Mode | Expertise |
|---|---|---|---|---|
| 🩺 Pflege | SIS · Tour · Assessment · Wundmanagement · Quartalsabrechnung · Pflegegrad-Pipeline | Diktat · Akte-verstehen · Frag-Lana | Diktat-Booster · Wund-Tendenz-Quiz | ✓ Heute |
| 👩‍⚕️ Arzt | Diktat · eRezept-Pilot · KIM-FHIR-Bundle | Diktat-Strukturierung | ICD-10-Sprint | ✓ Heute |
| 🤲 Therapie | Diktat · **Patient-Verlauf mit VAS/ROM/MRC-Sparkline** | Diktat · **Verlaufsbrief-KI** | HMV-Code-Match | ✓ Liste+Detail |
| 📋 Sozial | Diktat · **Hilfepläne mit ICF + SMART-Zielen** | Diktat · **ICF-Vorschlag-KI** | Paragraphen-Hunt | ✓ Liste+Detail |
| 🌱 Heilerziehung | Diktat · **Teilhabepläne BTHG + P-Budget** | Diktat | ICF-Lebenswelten | ✓ Liste+Detail |
| 🍲 Hauswirtschaft | Diktat · **DGE-Wochenplan + Allergen-Filter** | Diktat · **Speiseplan-KI** | Kostform-Puzzle | ✓ Wochenplan |
| 🌻 Erziehung | Diktat · **Carr-Lerngeschichten** | Diktat · **Lerngeschichte-Entwurf-KI** | Bildungs-Bingo | ✓ Liste+Detail |
| 🤝 Ehrenamt | Begleit-Diktat · Aufwands-Rechner · **Begleit-Cockpit mit Stimmungs-Sparkline** | — | Begleit-Bingo | ✓ Cockpit + Liste + Detail |
| 🗂 Stationsleitung | HUD · Konferenz · Cross-Beruf-Termine · TI-Cockpits · SFU-Setup · Cloud-Recordings | KI-Dienstplan-HUD | Dienstplan-Arena · Genehmigungs-Sprint · Audit-Hunt · Wirtschaft-Sandbox | ✓ HUD |
| 💶 Krankenkasse | Bescheid-Diktat · Eingangskorb · **Schein-Optik Muster 1/12 + Bescheid-Brief mit KI-Stempel-Assets** | — | — | ✓ Portal + Vorgang |
| 🏛 Genossenschaft | Pool · Solidartopf · Quartal-Ausschüttung · Aufsichtsrats-PDF + eIDAS | — | — | **✓ Pool + Solidartopf + Ausschüttung** |
| 🌿 Klient:in | Akte-verstehen · Live-Demo · Wundverlauf · Brillenmodus | KI-Klartext | NBA-Sprint · Bescheid-Quiz | (Sonderfall · feste „teilhabe") |
| 📦 Lieferanten | GWÖ-Onboarding · Pool · 4 Diktate | — | — | — |

**Aktueller Reifegrad gesamt:** ~85 % live · 15 Mini-Games, 8 Berufe haben echte Workflow-Cockpits über das Diktat hinaus (jetzt auch Ehrenamt), Expertise-Modus durchgängig auf 17 Cockpits inkl. Kasse-Portal und Genossenschaft, Schein-Optik mit Original-Look + KI-Stempeln.

---

## Was als nächstes ansteht

### ✓ Erledigt seit letztem HANDOFF (14 von 20 Original-ToDos + viel mehr)

- [x] Pflege-Quartalsabrechnung Stub mit DTA-Format-Vorschau
- [x] Pflegegrad-Antrags-Pipeline
- [x] Wundmanagement mit Foto-Verlauf (ICW-Standards)
- [x] Cross-Beruf-Termin-Migration
- [x] gematik-Konnektor-Anbieter-Vergleich
- [x] KIM-Mail produktiv (FHIR-Bundle-Vorschau)
- [x] eRezept-Endpunkt an einem Pilot-Arzt-Cockpit
- [x] HBA + SMC-B Karten-Anbindung (Lifecycle-Cockpit)
- [x] Voll-WebRTC mit RTCPeerConnection + ICE via Supabase Broadcast
- [x] LiveKit/mediasoup SFU für >4 Teilnehmer (Setup-Stub)
- [x] Cloud-Recording mit FHIR-Encounter-Audit-Trail
- [x] Aufsichtsrats-Bericht-PDF-Export mit eIDAS-Signatur
- [x] Politik-Aggregat-Pipeline echt aus aggregierten Daten
- [x] Quartal-Ausschüttung-Workflow für eG-Mitglieder

**Plus zusätzlich:**
- [x] Mobile-Hamburger-Drawer
- [x] Brillenmodus universal (KI-Klartext)
- [x] 11 Berufe mit eindeutiger Akzent-Farbe
- [x] 15 Mini-Games hinter optionalem 🎮-Toggle
- [x] 5 echte Beruf-Cockpits (Therapie · Sozial · HE · HW · Erz) über das Diktat hinaus
- [x] 4 zusätzliche KI-Funktionen pro Cockpit
- [x] Expertise-Modus Lerne / Praxis / Profi · global im AppShell + KasseShell + 17 Cockpits gewired (inkl. Genossenschaft via override)
- [x] Schein-Optik im Kasse-Portal (Muster 1/12 + Bescheid-Brief) mit 5 KI-Bild-Assets
- [x] Ehrenamt-Begleit-Cockpit als echtes Workflow-Cockpit (Stimmungs-Sparkline + Lebenslagen)
- [x] Layout-Bug: Bottom-Padding für FAB-Stack korrigiert
- [x] Expertise-Konzept-Doc als Maßstab für künftige Cockpits

### Priorität A · Pending User-Aktionen (organisatorisch)

- [ ] **UG-Notar-Termin** (1-2 Wochen)
- [ ] **DSB extern beauftragen** (~200-300 €/Mo)
- [ ] **AÜG-Anwalt** für Cross-Träger-Tausch (4-8 Wochen)
- [ ] **Genossenschafts-Anwalt-Erstgespräch**
- [ ] **pk-ruhr.de tatsächlich kontaktieren** für reale Multiplier-Brücke
- [ ] **Pilot-Träger-Akquise** (KEM, St. Lukas, APL aus Demo-Set)

### Priorität B · TI-Hardware (sobald Standort produktiv)

- [ ] HBA-Karten bestellen (medisign / D-Trust Sign-Me-Konto)
- [ ] SMC-B-Karte für Shalem Care eG i.G. beantragen
- [ ] RISE-Test-Account 30 Tage anlegen
- [ ] KIM-Postfach `Shalem.Care@arz.kim.telematik` aktivieren
- [ ] Pilot-Standort definieren (Essen-Mitte als Demo-Heimat?)
- [ ] Erstes echtes eRezept versenden

### Priorität C · Phase B · echte Krypto + Versand

- [ ] FHIR-Bundle KBV-Profil-Validierung (HAPI FHIR Validator)
- [ ] S/MIME-Signatur via SMC-B-Karte (echter PKCS#7-Container)
- [ ] DTA-§302 mit ITSG-Prüfsoftware validieren
- [ ] eIDAS-QES via D-Trust Sign-Me Remote-Signing-API
- [ ] LiveKit-Server-SDK + AccessToken-Signing
- [ ] Recording-Egress über LiveKit + Supabase-Storage-Upload

### Priorität D · UX-Inkremente

- [ ] HANDOFF.md-Verlinkung im Cockpit für PDL-Onboarding
- [ ] Erst-Konferenz-Wizard (Recording-Anlass + Retention vorab)
- [ ] Brillenmodus mit Voice-Output (TTS wieder hochfahren)
- [ ] Mobile-Drawer · Search-Filter wenn Sidebar > 10 Items
- [ ] Game-Mode · Highscore-Liste pro Beruf (anonym, ohne Login)
- [ ] Game-Mode · Lana-Phrasen je Beruf-Persönlichkeit personalisieren
- [ ] Pflege-Sub-Cockpits Expertise (`/pflege/wunde`, `/pflege/assessment`, `/pflege/tour`)
- [ ] Versicherten-Sicht für Bescheide (Klient bekommt seinen Bescheid in Klartext)
- [ ] echte Stempel-Bild-Assets im Print-Stylesheet (`@media print`)
- [ ] Schein-Optik-Konzept auf andere Berufe ausweiten (Therapie-Heilmittel-VO, Sozial-Hilfeplan-Antrag)

---

## Demo-Personas + Test-Routen

### Cockpit-Personas

| Rolle | Login-Persona | Test-Route |
|---|---|---|
| Pflegekraft | Dennis Reuter (`person-dr`) | `/pflege/heute` → Tour-KI → Wundmanagement → Assessment-Skalen |
| Arzt | Dr. Susanne Hartmann (`person-arzt-001`) | `/arzt/heute` → eRezept-Pilot → Verordnung-Diktat |
| Therapie | Sebastian Rauer (`person-therapeut-001`) | `/therapie/heute` → Diktat |
| Sozial | Mira Wagner (`person-sozial-001`) | `/sozial/diktat` |
| Lead/PDL | Detektiv Eins (`person-de1`) | `/admin/dienstplan/hud` → `/admin/abrechnung` → `/admin/pflegegrad` → `/admin/ti/karten` → `/termine` |
| Klient | Helga Reinhardt (`klient-hr`) | `/klient/heute` → Akte verstehen → Live-Demo |

### Game-Mode-Test-Pfad

1. Beliebiges Cockpit öffnen (z.B. `/admin`, `/arzt`, `/therapie`, `/sozial`)
2. Rechts unten 🎮-Toggle klicken → Toast „Mini-Games sichtbar"
3. Hero-Card erscheint im Cockpit · Klick → Vollbild-Spiel
4. Tastatur durchspielen (1-N für Antworten, ←/→ für Navigation)
5. Toggle wieder aus → klassischer Look kehrt zurück

### Test-Konferenz · WebRTC

- `/konferenz/konf-helga-q2` · "Starten" → `live`
- `/konferenz/konf-helga-q2/live` · Toolbar-Button 📡 **Mesh** aktivieren
- In zweitem Browser-Fenster gleiche URL → echte Peer-zu-Peer-Verbindung über Supabase-Broadcast

### Test-Verordnung + eRezept

- `/admin/verordnungen` · 4 Demo-HKP-Verordnungen mit FHIR-Bundle + S/MIME-Container
- `/arzt/erezepte` · 3 Demo-eRezepte (Metformin · Ramipril · NovoRapid)

### Test-Karten + Konnektor + SFU

- `/admin/ti/karten` · 5 Demo-Karten (HBA + SMC-B · 1 mit blockierter PIN.QES)
- `/admin/ti/konnektoren` · 6 Anbieter im Vergleich
- `/admin/ti/sfu` · LiveKit-Setup-Status

### Test-Recording

- `/admin/recordings` · 3 Demo-Aufzeichnungen (Helga-Q2 · MD-Audit · GV-2025-permanent)
- Pro Recording ausklappbares FHIR-Encounter + DocumentReference

### Test-Aufsichtsrat-PDF

- `/aufsicht?q=Q1` → "📄 Druck-Ansicht" → `/aufsicht/druck/Q1`
- Browser-Druck (⌘P/Strg+P) → Speichern als PDF
- Footer enthält eIDAS-Container-Vorschau

### Test-Quartal-Ausschüttung

- `/genossenschaft/ausschuettung` · 3 Quartale · Stufen-Buttons schalten Status weiter

---

## Wichtige Dateien · zentrale Orte

```
docs/
  PVS_STRATEGIE.md             Strategie + Phasen + Modul-Matrix
  HANDOFF.md                    Diese Datei
  EXPERTISE_KONZEPT.md          3 Stufen pro Beruf systematisch (Azubi/Praxis/Profi)
  STRATEGIE_TEAM_WOW.md         Branchen-Studien-Anker

apps/web/
  app/
    pflege/{heute,doku,tour,selbst,assessment,wunde,diktat/booster}/    Pflege-Cockpit
    arzt/{heute,diktat,erezepte,quiz,...}/                              Arzt
    therapie/{heute,diktat,quiz,patienten,patient/[id]}/                Therapie + Verlauf
    sozial/{diktat,quiz,hilfeplan,hilfeplan/[id]}/                      Sozial + Hilfeplan
    heilerziehung/{diktat,quiz,teilhabe,teilhabe/[id]}/                 HE + Teilhabe
    hauswirtschaft/{diktat,quiz,wochenplan}/                            HW + DGE-Plan
    erziehung/{diktat,quiz,lerngeschichten,lerngeschichten/{[id],neu}}/ Erz + Carr
    ehrenamt/{begleitung,protokoll,quiz}/                               EA
    klient/{heute,akte/verstehen,akte/wunde,bescheid-quiz}/             Klient
    kasse/diktat/                                                        Kasse
    admin/{dienstplan/{hud,archiv,arena}}/                               PDL
      genehmigungen/{,sprint}/ · verordnungen/ · abrechnung/[id]/[rId]/
      pflegegrad/[id]/ · ti/{konnektoren,karten,sfu}/
      recordings/ · audit/hunt/ · wirtschaft/sandbox/
    konferenz/[id]/{live}/                                              Fallbesprechung
    pflegegrad-check/{,sprint}/                                          Pflegegrad-Quiz
    aufsicht/druck/[quartal]/                                            Bericht-Druck
    politik/ · termine/ · genossenschaft/{pool,solidartopf,ausschuettung}/

  components/
    AppShell.tsx                Sidebar · Mobile-Drawer · Beruf-Akzent · ExpertiseChip-Slot · expertiseRolleOverride
    KasseShell.tsx              Kostenträger-Portal-Shell · ExpertiseChip-Slot · pb-Korrektur
    ExpertiseChip.tsx           Lerne/Praxis/Profi-FAB-Toggle pro Beruf
    ExpertiseGate.tsx           <NurAbProfi>, <NurBeiLerne>, <NurAb / NurBis>
    LerneTipp.tsx               Glossar-Banner für Casual/Azubi · nur im lerne-Modus
    Sparkline.tsx               Mini-Chart für VAS/ROM/MRC + Stimmung 1–5
    scheine/MusterEinsAU.tsx    AU gelb · Muster 1 KBV-Look
    scheine/MusterZwoelfHKP.tsx HKP rosé · Muster 12 KBV-Look
    scheine/KassenBescheidBrief.tsx Bescheid-Brief mit Briefkopf + Stempel
    scheine/KlartextSpalte.tsx  Side-by-side Original ↔ Klartext + Glossar
    IcfVorschlagBox.tsx         Sozial-Bedarfs-Text → ICF-Codes (Lana)
    TherapieBriefBox.tsx        Therapie-Sitzungen → Hausarzt-Brief (Lana)
    SpeiseplanKiBox.tsx         HW-Klient + Kostform → Wochenplan-Vorschlag (Lana)
    LerngeschichteEntwurfBox.tsx Beobachtung → Carr-Lerngeschichte (Lana)
    WochenplanGrid.tsx          7×5-Mahlzeiten-Grid mit Allergen-Filter
    Brillenmodus.tsx · GameModeToggle.tsx · GameModeWrapper.tsx
    KategorieMatch.tsx · QuizHeroCard.tsx
    [+ alle früheren · siehe git history]

  lib/
    ui/expertise.ts             useExpertise · ExpertiseLevel · LEVEL_RANK · localStorage
    ui/game-mode.ts             useGameMode-Hook
    therapie/verlauf.ts         Patient-Karteikarten · termine · tendenzVas
    therapie/verlaufsbrief-ki.ts Anthropic-Wrap mit Mock-Fallback
    sozial/hilfeplan-store.ts    Hilfeplan-Daten · ICF-Bewertungen
    sozial/icf-vorschlag-ki.ts   Bedarfs-Text → ICF-Codes
    heilerziehung/teilhabe-store.ts BTHG-Klient · Bedarf · Ziele · P-Budget
    hauswirtschaft/wochenplan.ts Mahlzeiten · Allergen-Codes · DGE
    hauswirtschaft/speiseplan-ki.ts Kostform-Plan-Vorschlag
    erziehung/lerngeschichten-store.ts BBP-Bereiche · Carr-Dispositionen
    erziehung/lerngeschichte-ki.ts Beobachtung → Entwurf
    ehrenamt/begleit-store.ts   3 Klient:innen · Stimmung 1–5 · Lebenslagen · Tendenz-Helper
    kasse/bescheid-daten.ts     Heuristik VorgangsTyp → Schein + Klartext-Paket

  public/scheine/
    stempel-praxis.png · stempel-bewilligt.png · stempel-abgelehnt.png
    papier-textur.png · wm-eau.png  (KI-generiert via nano_banana_2)
    games/quiz-{arzt,therapie,sozial,heilerziehung,hauswirtschaft,erziehung,ehrenamt}.ts
    dienstplan/arena-score.ts · approval/sprint-{store,actions}.ts
    audit/hunt-faelle.ts · wirtschaft/sandbox-modell.ts
    klient/bescheid-quiz.ts · beruf-diktat/booster-snippets.ts · wunde/quiz.ts
    [+ alle früheren · siehe git history]

scripts/
  post-build.mjs · crop-grids.py
```

---

## Stack-Übersicht

```
Frontend:   Next.js 15 App Router · React 19 · TypeScript · Tailwind 3
Backend:    Supabase (Frankfurt eu-central-1) · PostgREST · RLS · Storage · Auth
Realtime:   Supabase Realtime (postgres_changes + presence + broadcast)
WebRTC:     RTCPeerConnection + Supabase-Broadcast-Signaling (Mesh ≤4 Peers)
Audio/Video MediaRecorder (Diktat) · getUserMedia + getDisplayMedia (Konferenz-Live)
KI:         Anthropic Claude (Haiku 4.5 Default) · DeepSeek-Fallback · Mock
Hosting:    Hostinger Node.js (Auto-Deploy via GitHub-Push auf main)
Repo:       github.com/dkorn85/shalem-care
DB:         gpchwlqeqejxvynewjns.supabase.co
ENV:        NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY
            ANTHROPIC_API_KEY · ELEVENLABS_API_KEY (TTS, optional)
            SHALEM_SITE_URL (für metadataBase, optional)
            NEXT_PUBLIC_TURN_URL · NEXT_PUBLIC_TURN_USER · NEXT_PUBLIC_TURN_CREDENTIAL (TURN, optional)
            LIVEKIT_URL · LIVEKIT_API_KEY · LIVEKIT_API_SECRET (Phase 2 SFU, optional)
```

---

## Design-System · Beruf-Farben

Jeder Beruf hat eine eindeutige Akzent-Farbe in **AppShell · BottomNav · MobileDrawer · Brillenmodus**. Mapping in `components/AppShell.tsx#ROLE_PRIMAER`:

| Beruf | CSS-var |
|---|---|
| Pflege | `--mon` (rot-warm) |
| Arzt | `--vibe-profile` (violett) |
| Therapie | `--fri` (türkis) |
| Sozial | `--tue` (blau) |
| Erziehung | `--wed` (gelb) |
| Ehrenamt | `--thu` (grün) |
| Hauswirtschaft | `--sun` (sand) |
| Heilerziehung | `--sat` (rosé) |
| Stationsleitung | `--vibe-team` (petrol) |
| Klient | `--wed` (pink) |
| Kasse | `--vibe-approval` (gold) |

Sichtbar an: 2px-Sidebar-Border · Wordmark-Bereich-Gradient · Top-Bar zwischen Header und Content · Mobile-Header-Border · BottomNav-Top-Border · Drawer-Trigger-Tint · Brillenmodus-Floater.

---

## Game-Mode · Quick-Reference

**Toggle:** 🎮-FAB rechts unten · Default AUS · localStorage `shalem.game-mode`.

**15 Mini-Games:**

| Cockpit | Game-Route | Mechanik |
|---|---|---|
| Admin/PDL | `/admin/dienstplan/arena` | Auto-Pilot/Manuell/Sparring |
| Admin/PDL | `/admin/genehmigungen/sprint` | Tinder-Stack mit KI-Empfehlung |
| Admin/PDL | `/admin/audit/hunt` | Multi-Select-Lückensuche |
| Admin/PDL | `/admin/wirtschaft/sandbox` | Slider-Spielwiese mit Münzen-Regen |
| Pflege | `/pflege/diktat/booster` | 8-Sek-Rapid-Fire SIS-Felder |
| Pflege | `/pflege/wunde/quiz` | Vorher/Nachher-Tendenz |
| Klient | `/pflegegrad-check/sprint` | One-Question-Quiz mit Live-PG |
| Klient | `/klient/bescheid-quiz` | Amtsdeutsch-Multiple-Choice |
| Arzt | `/arzt/quiz` | ICD-10 Code-Bereiche |
| Therapie | `/therapie/quiz` | HMV-Codes |
| Sozial | `/sozial/quiz` | Paragraphen-Hunt |
| Heilerziehung | `/heilerziehung/quiz` | ICF-Lebenswelten |
| Hauswirtschaft | `/hauswirtschaft/quiz` | Kostform-Puzzle |
| Erziehung | `/erziehung/quiz` | BBP-Bildungsbereiche |
| Ehrenamt | `/ehrenamt/quiz` | Begleit-Reaktionen |

**Geteilte Mechanik:**
- Tastatur 1-N für Antwort · ←/→/Space/B für Navigation
- Combo-Streak mit Phrasen-Eskalation
- Lern-Hinweis-Box mit Begründung nach jeder Antwort
- Konfetti am Ende
- Erfolgs-Phrasen pro Trefferquote (perfekt/gut/solide/schwach)

---

## Branchen-Studien-Anker

| Beruf | Konkurrenten | Argumentation |
|---|---|---|
| Pflege | Vivendi · MediFox · Snap | SIS händisch ~30-90 min/Schicht |
| Arzt | CGM · doxter · MEDISTAR | Click-Workflow ~3 min/Verordnung |
| Therapie | Theorg · Buchner · Vivendi | 8-Felder-Form ~6 min |
| Sozial | connect-ASD · OPEN/Prosoz | 60 min/Hilfeplan |
| Heilerziehung | VINCI · ProSoz/Klees | 60-Felder-Excel |
| Erziehung | Stepfolio · Pixi | 5 min/Lerngeschichte |
| Klient-Klartext | washabich.de · BefundKlar | 1-3 Tage Wartezeit |
| Kasse-Bescheid | AOK/Barmer/TK | Amtsdeutsch · 60 min Bescheid |
| PDL-HUD | Connext Vivendi · MediFox DAN | Modul-fragmentiert, kein KI-HUD |
| Trading | — | 4 % Multiplier-Cut vs 35-45 % Verleih-Marge |
| Game-Modus | — | branchen-erste Gamification für Pflege-Software |

Quellen: BARMER Pflege-Report 2024, DBfK Personal-Studie 2025, Pflegebericht 2024, Statistisches Bundesamt 2025, DNQP-Hochschule-Osnabrück, ecogood.org GWÖ-Matrix 5.0, gematik-Zulassungsliste 2026-Q1.

---

## Push-Pattern

```bash
# Diese Session: direkt auf main mit credential.helper store
git add <files>
git commit -m "feat: ..."
git push   # Hostinger zieht aus main automatisch
```

**Hostinger-Hänger:** Bei > 10 Min "Building" Settings-and-redeploy klicken.

---

## Push-Auth-Notiz

Der PAT liegt in `~/.git-credentials` auf dem Termux-Tablet (chmod 600). Pushes laufen ohne weitere Eingabe.
