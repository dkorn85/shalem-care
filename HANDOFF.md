# Shalem Care · Session-Handoff

**Stand:** 2026-05-07 · für die nächste Session (Termux / Tablet / Desktop)
**Branch:** `claude/keen-ramanujan-a94771` · **156 Routen** · `tsc --noEmit` exit 0 · `next build` exit 0
**Phase:** PVS-Reife-Aufbau · 13 Berufe · 4 Lieferanten-Branchen · 53 PVS-Module katalogisiert

---

## TL;DR · was läuft live

- Demo-Domain: **shalem.de** (Hostinger Node.js, Auto-Deploy via Push auf `main`)
- Repo: <https://github.com/dkorn85/shalem-care>
- Supabase: `gpchwlqeqejxvynewjns.supabase.co` · 8 Tabellen · RLS aktiv
- Auth: Email + Google OAuth · Profile-Auto-Create · DSGVO-Self-Service
- **Messenger live · Pfad B Supabase-Realtime** mit Channels, DMs, Reactions, Presence, Typing
- 156 Routen, alle 13 Berufe haben mind. Tageshub + Diktat + Dienstplan
- KI-Dienstplan-HUD für PDL · 3-Zonen-Archiv · pk-ruhr-Multiplier-Brücke
- Politik-Schnittstelle mit KI-Gesundheitsminister-Simulator (6 Stellschrauben)
- Aufsichtsrat-Quartalsbericht KI-generiert (KonTraG / GenG §38)
- **Neu seit 06.05.2026:** PVS-Strategie + Reife-Matrix · HKP-Pipeline live ·
  Live-Konferenz mit Lana-Moderator · 11-Personas-Sim mit Chat · 4 Lieferanten-
  Branchen mit GWÖ-Score · DNQP-Assessment-Skalen · 45 KI-Aquarell-Icons

---

## Was diese Woche gebaut wurde (Sessions seit 2026-05-06)

### 1 · Marketing-Schicht-Polish (Sessions 1-3)
- 8 Marketing-Pages mit `<SiteFooter />` ausgerollt
- Frontpage neu gegliedert: Hero + Stats-Bar + 4 Schicht-Karten + kollabierte Mega-Blöcke (Pflege-Handbuch, Heilkunst)
- Final-CTA-Block "Drei Wege rein" mit Glow-Hintergrund

### 2 · Lieferanten-Schicht (Session 4)
- `lib/gemeinwohl/matrix.ts` — GWÖ-Matrix 5.0 adaptiert · 20 Themen × 5 Werte × 4 Berührungsgruppen · 0-1000 Punkte · 4 Stufen
- `lib/lieferanten/store.ts` — 7 Demo-Anbieter (TriFi eG, Klar eG, Kreislauf eG, SoLaWi Rhein, plus konventionelle Vergleichs-Anbieter)
- `lib/expertenstandards/dnqp.ts` — alle 11 DNQP-Standards mit Beruf-Lead/Co/Support + Lieferanten-Mapping
- 4 BrancheHub-Pages: `/hausmeister`, `/reinigung`, `/recycling`, `/lebensmittel`
- 4 Diktat-Pages für die neuen Berufe
- `/lieferanten` Pool-Marktplatz
- `/gemeinwohl` Indikator-Erklärung
- `/expertenstandards` 11-Standards-Übersicht
- `/netz/berufe` 13-Rollen × 25 Verknüpfungen × Standard-Berufs-Matrix

### 3 · Pflege-Assessment-Tools (Session 5)
- `lib/assessment/skalen.ts` — Braden, NRS, MNA-SF, Tinetti mit Berechnung + Risikoklasse + Empfehlungen
- `components/AssessmentTools.tsx` — 4 interaktive Client-Tools mit Live-Berechnung
- `/pflege/assessment` Page im Pflege-Cockpit

### 4 · Claude-Integration in 3 Schlüssel-Komponenten (Session 6)
- **Diktat-KI** — `strukturiereDiktatMitKi()` Server-Action mit Anthropic, fällt auf Heuristik zurück
- **Klient-Akte verstehen** — `verstehendeAkteMitKi()` mit max-15-Worte/Satz-System-Prompt
- **Frag-Lana** — DNQP-Standards + Hausmittel als Knowledge-Base, Quellen-Verweise

### 5 · Live-Sim mit 11 KI-Personas (Session 7)
- `lib/sim/personas.ts` — 11 Charaktere (Helga, Petra, Dennis, Dr. Hartmann, Sebastian, Helmut, Mehmet, Aisha, Marie, Renate, Detektiv Eins) mit Biografie + Sprache + heute-Anliegen
- `lib/sim/world.ts` — Tick-Engine, Vital-Drift, 6 Skript-Event-Templates
- `lib/sim/charakter-stream.ts` — `simulierePersonaAussage()` mit Claude
- `components/SimCockpit.tsx` — 3-Spalten-Cockpit, Tick alle 6s, Speed 0.5/1/2/4×, Chat-Eingabe an Personas
- `/demo/leben` Live-Demo-Page

### 6 · 45 KI-generierte Aquarell-Icons (Session 8)
- 5 GPT-Image-2.0-Grids (3×3): Berufs-Portraits, Akte-Header, GWÖ-Glyphen, Sim-Persona-Avatare (chroma-keyed), DNQP-Standards-Glyphen
- `scripts/crop-grids.py` Pillow-Crop + Chroma-Key
- Alle 45 Bilder eingebunden: SimCockpit-Avatare, BrancheHub-Header, GWÖ-Themen-Glyphen, Expertenstandards-Glyphen, Demo-Leben-Hero

### 7 · PVS-Strategie + Roadmap (Session 9)
- `docs/PVS_STRATEGIE.md` — vollständiges Strategie-Dokument
- `lib/pvs/matrix.ts` — 53 Module katalogisiert über 13 Berufe, 5 Phasen
- `/roadmap/pvs` — Live-Dashboard mit Reifegrad pro Beruf
- `lib/pvs/abrechnung/types.ts` — 11 Kostenträger, 18 Leistungs-Arten, EBM/HKP/HMV-Stammdaten
- `lib/pvs/eVerordnung/types.ts` — 12 Verordnungs-Typen, KIM-Mail-Stub
- `lib/pvs/termine/types.ts` — Cross-Beruf-Termin mit FHIR-Appointment

### 8 · Live-Fallbesprechung mit Video + Akte + Chat (Session 10)
- `lib/konferenz/fallbesprechung.ts` — RtcTeilnehmer, Layout-Modi, Akte-Tabs, Audit-Events
- `components/FallbesprechungLive.tsx` — Vollbild 3-Spalten: Akte-Panel, Tile-Grid mit `getUserMedia`, Screen-Share via `getDisplayMedia`, Chat-Sidebar, Toolbar (Mic/Cam/Screen/Hand/Rec)
- `/konferenz/[id]/live` — Vollbild-Konferenz-Page
- KonferenzLive-Component bekommt "🎥 Beitreten · Video-Modus"-Button bei Status `live`

### 9 · HKP-Verordnungs-Pipeline (Session 11)
- `lib/pvs/eVerordnung/store.ts` + `actions.ts` — 5-Stufen-Pipeline (Arzt → KIM → Kasse → Pflege → Abrechnung)
- 4 Demo-Verordnungen geseedet
- `/admin/verordnungen` Liste mit Pipeline-Fortschritts-Bar
- `/admin/verordnungen/[id]` Detail mit 5-Schritt-Karten + Action-Button
- `/admin/verordnungen/neu` Form mit HKP-Ziffer-Dropdown + Plausibilitätsprüfung

### 10 · Lana KI-Moderator für Live-Konferenz (Session 11)
- `lib/konferenz/lana-moderator.ts` — `lanaModeriert()` mit PreReads + Audit-Trail + Live-Notizen als Input
- Output: 2-3-Sätze-Zusammenfassung, max 4 Beschluss-Vorschläge (was/wer/bis), max 4 offene Fragen
- Lana-Slot oben im Akte-Panel der Live-Konferenz

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

**Pull aktueller Stand bevor du loslegst:**
```bash
cd shalem-care
git fetch origin
git checkout main
git pull --ff-only
```

---

## PVS-Reife · Stand pro Beruf

53 Module katalogisiert in `lib/pvs/matrix.ts`. Sichtbar unter `/roadmap/pvs`.

| Beruf | Live | In Arbeit | Geplant | Konkurrent (vs) |
|---|---|---|---|---|
| 🩺 Pflege | SIS · Tour · Assessment-Skalen | HKP-Pipeline | Pflegegrad-Antrag · Wundmanagement · Quartalsabrechnung · GPS-Tour | Vivendi · MediFox · Snap |
| 👩‍⚕️ Arzt | Diktat | — | eRezept · EBM/GoÄ · DMP · eImpfpass · KBV-Zulassung | CGM Albis · Medistar |
| 🤲 Therapie | Diktat | — | HMV-2025 · GKV-Abrechnung · Patient-Vereinbarung | Theorg · Buchner |
| 📋 Sozial | Diktat | — | Hilfeplan · BTHG-Abrechnung · §8a Kindeswohl | OPEN/Prosoz · connect-ASD |
| 🌱 Heilerziehung | Diktat | — | ITP · Tagesstruktur · Eingliederung-Abrechnung | VINCI · ProSoz/Klees |
| 🍲 Hauswirtschaft | Diktat | — | Speiseplan-Software · HACCP-Logbuch | — |
| 🌻 Erziehung | Lerngeschichten | — | Anwesenheit · Kita-Beitrag · Eltern-Portal | Stepfolio · Pixi |
| 🤝 Ehrenamt | Begleit-Diktat | — | Stunden für Spendenbescheinigung · Schulungs-Module | — |
| 🗂 Stationsleitung | Dienstplan-HUD · Konferenz-Modul · Fallbesprechung-Live | — | Personal-Akte · MD-Audit-Pack · Tarif-Lohn | Connext · MediFox DAN |
| 💶 Krankenkasse | Bescheid-Diktat | — | MDK-Schnittstelle · Widerspruchs-Verfahren | — |
| 🌿 Klient:in | Akte-verstehen-KI · Live-Demo | — | Self-Booker · Sachleistung-Wallet · Angehörigen-Portal | washabich.de |
| 🏛 Genossenschaft | Pool · Solidartopf | — | Generalversammlung · Quartal-Ausschüttung | — |
| 📦 Lieferanten | GWÖ-Onboarding · Pool · 4 Diktate | — | SLA-Vertrags-Management · CO₂-Reporting CSRD | — |

**Aktueller Reifegrad gesamt:** ~50 % live, kontinuierlich steigend.

---

## Was als nächstes ansteht

### Priorität A · PVS Phase A vervollständigen
- [ ] **Pflege-Quartalsabrechnung Stub** mit DTA-Format-Vorschau
- [ ] **Pflegegrad-Antrags-Pipeline** (NBA-Bogen → MD-Termin → Bescheid → Widerspruch)
- [ ] **Wundmanagement** mit Foto-Verlauf (ICW-Standards)
- [ ] **Cross-Beruf-Termin-Migration** existierende Pflege-Tour-Daten in das neue Termin-Modell

### Priorität B · TI-Anschluss vorbereiten
- [ ] **gematik-Konnektor-Anbieter-Vergleich** (RISE / x.iso / CGM eHealth-Cloud)
- [ ] **KIM-Mail produktiv** (heute Stub) — S/MIME-FHIR-Bundle-Versand
- [ ] **eRezept-Endpunkt** an einem Pilot-Arzt-Cockpit
- [ ] **HBA + SMC-B Karten-Anbindung** in einem Test-Standort

### Priorität C · WebRTC Phase 2
- [ ] **Voll-WebRTC** mit RTCPeerConnection + ICE via Supabase Broadcast
- [ ] **LiveKit/mediasoup SFU** für >4 Teilnehmer
- [ ] **Cloud-Recording** mit FHIR-Encounter-Audit-Trail

### Priorität D · Inhalt + Politik
- [ ] **Aufsichtsrats-Bericht-PDF-Export** mit eIDAS-Signatur
- [ ] **Politik-Aggregat-Pipeline** echt aus aggregierten Daten (heute Demo)
- [ ] **Quartal-Ausschüttung-Workflow** für eG-Mitglieder

### Priorität E · Pending User-Aktionen (organisatorisch)
- [ ] UG-Notar-Termin (1-2 Wochen)
- [ ] DSB extern beauftragen (~200-300 €/Mo)
- [ ] AÜG-Anwalt für Cross-Träger-Tausch (4-8 Wochen)
- [ ] Genossenschafts-Anwalt-Erstgespräch
- [ ] pk-ruhr.de tatsächlich kontaktieren für reale Multiplier-Brücke
- [ ] Pilot-Träger-Akquise (KEM, St. Lukas, APL aus Demo-Set)

---

## Demo-Personas + Test-Routen

### Cockpit-Personas

| Rolle | Login-Persona | Test-Route |
|---|---|---|
| Pflegekraft | Dennis Reuter (`person-dr`) | `/pflege/heute` → Tour-KI → SIS-Diktat → Assessment-Skalen |
| Arzt | Dr. Susanne Hartmann (`person-arzt-001`) | `/arzt/heute` → Anfragen-Inbox → Verordnung-Diktat |
| Therapie | Sebastian Rauer (`person-therapeut-001`) | `/therapie/heute` → Diktat |
| Sozial | Mira Wagner (`person-sozial-001`) | `/sozial/diktat` |
| Lead/PDL | Detektiv Eins (`person-de1`) | `/admin/dienstplan/hud` → `/admin/verordnungen` → `/konferenz/konf-helga-q2` |
| Klient | Helga Reinhardt (`klient-hr`) | `/klient/heute` → Akte verstehen → Live-Demo |

### Sim-Personas (Live-Demo)

11 Charaktere von Claude live gespielt unter `/demo/leben`:
- **Helga** Reinhardt (Klientin, 76 J)
- **Petra** Schmidt-Reinhardt (Tochter, 52 J)
- **Dennis** Reuter (Pflege-Mit-Eigentümer, 31 J)
- **Dr. Susanne Hartmann** (Hausärztin, 48 J)
- **Sebastian** Rauer (Physio, 35 J)
- **Helmut** Brandt (Hauswirtschaftsleitung, 58 J)
- **Mehmet** Yıldırım (TriFi-Hausmeister, 42 J)
- **Aisha** Mwangi (Klar-Reinigung, 38 J)
- **Marie** Kowalski (SoLaWi-Lieferung, 29 J)
- **Renate** Schäfer (Hospiz-Ehrenamt, 67 J)
- **Detektiv Eins** (PDL Etage 3)

### Test-Konferenz

- `/konferenz/konf-helga-q2` (Q2-Fallkonferenz · Status `pre_read_offen`)
- "Starten" → Status `live`
- "🎥 Beitreten · Video-Modus" → `/konferenz/konf-helga-q2/live`
- Akte-Panel links: "✦ Lana moderieren lassen" → KI-Zusammenfassung

### Test-Verordnung

- `/admin/verordnungen` (4 Demo-Verordnungen)
- `/admin/verordnungen/vo-hr-blutdruck` (Pipeline-Stufe `kim-versendet`)
- "💶 Genehmigen (Kasse)" → `genehmigt` → "🩺 Erbringung starten" → ...

---

## Wichtige Dateien · zentrale Orte

```
docs/
  PVS_STRATEGIE.md             Strategie + Phasen + Modul-Matrix
  HANDOFF.md                    Diese Datei
  STRATEGIE_TEAM_WOW.md         Branchen-Studien-Anker

apps/web/
  app/
    pflege/{heute,doku,tour,selbst,assessment}/    Pflege-Cockpit
    arzt/{heute,diktat,dienstplan,...}/            Arzt
    therapie/{heute,diktat,dienstplan}/             Therapie
    sozial/{diktat,dienstplan}/                     Sozial
    {heilerziehung,hauswirtschaft,erziehung,ehrenamt}/diktat/   Beruf-Diktate
    klient/{heute,akte/verstehen,dienstplan}/      Klient
    kasse/diktat/                                   Krankenkasse
    admin/dienstplan/{hud,archiv}/                  PDL-HUD
    admin/verordnungen/                             HKP-Pipeline-Cockpit
    konferenz/[id]/{live}/                          Fallbesprechung
    supervisor/                                     Träger
    aufsicht/                                       Aufsichtsrat
    politik/                                        Politik + KI-Minister
    trading/, partner/[id]/, partner/multiplier/    Trading-Hub
    messenger/                                      Messenger-Discord-Layer
    station/[klientId]/                             Station-Cockpit
    {hausmeister,reinigung,recycling,lebensmittel}/diktat/   Lieferanten-Diktate
    {hausmeister,reinigung,recycling,lebensmittel}/  Lieferanten-Hubs
    lieferanten/                                    Pool-Marktplatz
    gemeinwohl/                                     GWÖ-Indikator
    expertenstandards/                              DNQP-Übersicht
    netz/berufe/                                    13-Rollen-Matrix
    demo/leben/                                     Live-Sim-Cockpit
    roadmap/pvs/                                    PVS-Reife-Dashboard

  components/
    AppShell.tsx           Sidebar Nav
    UserMenu.tsx           HauptMenu-Dropdown rechts oben
    DienstplanHud.tsx      KI-HUD Client
    BerufDiktat.tsx        Generisches Diktat-UI
    SisDiktat, ArztDiktat, TherapieDiktat, SozialDiktat   Spezialisiert
    AkteVerstaendnis.tsx   Klient-Klartext-Übersetzer
    AssessmentTools.tsx    Braden/NRS/MNA/Tinetti
    BrancheHub.tsx         Lieferanten-Marketing-Hub-Pattern
    DiktatStandalonePage.tsx  Lieferanten-Diktat-Page-Wrapper
    SimCockpit.tsx         Live-Demo 3-Spalten-Cockpit
    FallbesprechungLive.tsx Konferenz-Vollbild-Modus
    VerordnungActions.tsx   HKP-Pipeline-Buttons
    VerordnungNeuForm.tsx   HKP-Erstellungs-Form
    LanaKiBerater.tsx + MultiBerufTimeline.tsx (Stations-Cockpit)
    SiteFooter.tsx         Marketing-Footer mit 7 Spalten

  lib/
    auth/                       Supabase-Auth
    messenger/                  Channels, DM, Realtime, Store
    pflege/sis-store + tageshub
    arzt/diktat-store
    therapie/diktat-store
    sozial/diktat-store
    klient/akte-verstehen + akte-verstehen-ki
    beruf-diktat/profile        Generisch (12 Profile inkl. Lieferanten)
    beruf-diktat/strukturiere-ki  KI-Strukturierung (Server-Action)
    dienstplan/hud-store + hud-archive
    partner/store               pk-ruhr + 2 weitere
    supervisor/store
    aufsicht/bericht
    politik/store
    berufsplan/generator
    hierarchy/                  Einrichtungen + Stationen + Personen + Klienten
    zuordnung/store             CareTeam-Caseloads
    assessment/skalen.ts        DNQP-Skalen-Berechnung
    gemeinwohl/matrix.ts        GWÖ-Matrix 5.0
    lieferanten/store.ts        7 Lieferanten + KPIs
    expertenstandards/dnqp.ts   11 DNQP-Standards
    sim/personas.ts             11 Live-Sim-Charaktere
    sim/world.ts                Tick-Engine + Vital-Drift
    sim/charakter-stream.ts     KI-Persona-Aussage (Server-Action)
    konferenz/store.ts          Pre-Reads + Agenda + Beschlüsse
    konferenz/fallbesprechung.ts  Live-Modus + Audit
    konferenz/lana-moderator.ts   KI-Moderation (Server-Action)
    pvs/matrix.ts               53 PVS-Module katalogisiert
    pvs/abrechnung/types.ts     Kostenträger + Leistungs-Arten + EBM/HKP/HMV
    pvs/eVerordnung/types.ts    12 Verordnungs-Typen + KIM-Stub
    pvs/eVerordnung/store.ts    HKP-Store + 5-Stufen-Pipeline
    pvs/eVerordnung/actions.ts  7 Server-Actions für die Pipeline
    pvs/termine/types.ts        Cross-Beruf-Termin + FHIR-Appointment
    ai/provider.ts              Anthropic/DeepSeek/Mock auto-detect
    ai/anthropic.ts             Direkter Fetch-Provider
    ai/klartext.ts              Berufs-Klartext-Übersetzung
    ai/frag-lana.ts             Pflege-Beratung (Server-Action)

scripts/
  post-build.mjs                Static + public assets in standalone/ kopieren
  crop-grids.py                 5 Grids → 45 Einzelbilder + Chroma-Key
```

---

## Stack-Übersicht

```
Frontend:   Next.js 15 App Router · React 19 · TypeScript · Tailwind 3
Backend:    Supabase (Frankfurt eu-central-1) · PostgREST · RLS · Storage · Auth
Realtime:   Supabase Realtime (postgres_changes + presence + broadcast)
Audio/Video MediaRecorder (Diktat) · getUserMedia + getDisplayMedia (Konferenz-Live)
KI:         Anthropic Claude (Haiku 4.5 Default · konfigurierbar) · DeepSeek-Fallback · Mock
Hosting:    Hostinger Node.js (Auto-Deploy via GitHub-Push auf main)
Repo:       github.com/dkorn85/shalem-care
DB:         gpchwlqeqejxvynewjns.supabase.co
Tabellen:   einrichtungen, stationen, klienten, profiles, user_roles,
            verifications, audit_log, messages, message_reactions
Storage:    verifizierungen, messenger
ENV:        NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY
            ANTHROPIC_API_KEY · ELEVENLABS_API_KEY (TTS, optional)
            SHALEM_SITE_URL (für metadataBase, optional)
```

**Hostinger-ENV-Bridge**: `next.config.mjs` bridged `SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL` zur Build-Zeit.

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
| Trading | — | 4% Multiplier-Cut vs 35-45% Verleih-Marge |

Quellen: BARMER Pflege-Report 2024 (38% Burnout), DBfK Personal-Studie 2025, Pflegebericht 2024, Statistisches Bundesamt 2025, DNQP-Hochschule-Osnabrück, ecogood.org GWÖ-Matrix 5.0.

---

## Push-Pattern

```bash
# Branch erstellen
git checkout -b claude/<beschreibung>

# Arbeiten + commiten
git add <files>
git commit -m "feat: ..."

# Push branch
git push -u origin claude/<beschreibung>

# Merge in main + push
git checkout main
git pull --ff-only origin main
git merge --no-ff claude/<beschreibung> -m "merge: ..."
git push origin main
```

Hostinger zieht aus `main` automatisch. Build dauert ~2 min.

**Hostinger-Hänger:** Wenn Build-Status > 10 Min auf "Building", Settings-and-redeploy klicken — Hostinger-VPS-Hänger, kein Code-Bug. Build-Output 705 MB Standalone ist normal.
