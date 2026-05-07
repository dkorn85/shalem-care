# Shalem Care · Session-Handoff

**Stand:** 2026-05-07 (späte Session) · für die nächste Session
**Branch:** `main` direkt · **186 Routen** · `tsc --noEmit` exit 0 · `next build` exit 0
**Phase:** PVS-Reife-Aufbau · 13 Berufe · 53 PVS-Module katalogisiert · 14 von 20 HANDOFF-ToDos abgearbeitet

---

## TL;DR · was läuft live

- Demo-Domain: **shalem.de** (Hostinger Node.js, Auto-Deploy via Push auf `main`)
- Repo: <https://github.com/dkorn85/shalem-care>
- Supabase: `gpchwlqeqejxvynewjns.supabase.co` · 8 Tabellen · RLS aktiv
- Auth: Email + Google OAuth · Profile-Auto-Create · DSGVO-Self-Service
- **Messenger live · Pfad B Supabase-Realtime** mit Channels, DMs, Reactions, Presence, Typing
- 186 Routen, alle 13 Berufe haben mind. Tageshub + Diktat + Dienstplan
- KI-Dienstplan-HUD für PDL · 3-Zonen-Archiv · pk-ruhr-Multiplier-Brücke
- Politik-Schnittstelle mit KI-Gesundheitsminister-Simulator + **live PVS-Aggregat**
- Aufsichtsrat-Quartalsbericht KI-generiert · **Druck-Ansicht mit eIDAS-Signatur-Container**
- **Brillenmodus** universal · KI-Klartext für jeden markierten Begriff in jedem Cockpit
- **Mobile-Hamburger-Drawer** · volle Sidebar-Nav auf Smartphone
- **Voll-WebRTC** mit Supabase-Signaling · RTCPeerConnection-Mesh ≤4 Peers
- 11 Berufe mit eindeutiger **Akzent-Farbe** in Sidebar/Header/BottomNav

---

## Was diese Woche gebaut wurde (Sessions seit 2026-05-06)

### 1 · Marketing-Schicht-Polish (Sessions 1-3)
- 8 Marketing-Pages mit `<SiteFooter />` ausgerollt
- Frontpage neu gegliedert: Hero + Stats-Bar + 4 Schicht-Karten + kollabierte Mega-Blöcke
- Final-CTA-Block "Drei Wege rein" mit Glow-Hintergrund

### 2 · Lieferanten-Schicht (Session 4)
- `lib/gemeinwohl/matrix.ts` — GWÖ-Matrix 5.0 · 20 Themen × 5 Werte × 4 Berührungsgruppen
- `lib/lieferanten/store.ts` — 7 Demo-Anbieter (TriFi · Klar · Kreislauf · SoLaWi)
- `lib/expertenstandards/dnqp.ts` — 11 DNQP-Standards mit Beruf-Lead/Co/Support
- 4 BrancheHub-Pages, 4 Diktat-Pages, `/lieferanten`, `/gemeinwohl`, `/expertenstandards`, `/netz/berufe`

### 3 · Pflege-Assessment-Tools (Session 5)
- `lib/assessment/skalen.ts` — Braden, NRS, MNA-SF, Tinetti
- `components/AssessmentTools.tsx` — 4 interaktive Client-Tools
- `/pflege/assessment`

### 4 · Claude-Integration in 3 Schlüssel-Komponenten (Session 6)
- **Diktat-KI** · `strukturiereDiktatMitKi()` mit Anthropic + Heuristik-Fallback
- **Klient-Akte verstehen** · max-15-Worte/Satz-System-Prompt
- **Frag-Lana** · DNQP-Standards + Hausmittel als Knowledge-Base

### 5 · Live-Sim mit 11 KI-Personas (Session 7)
- 11 Charaktere mit Biografie + Sprache + heute-Anliegen
- `lib/sim/world.ts` Tick-Engine + Vital-Drift
- 3-Spalten-Cockpit `/demo/leben`

### 6 · 45 KI-generierte Aquarell-Icons (Session 8)
- 5 GPT-Image-2.0-Grids · `scripts/crop-grids.py` Pillow-Crop
- 45 Bilder eingebunden: SimCockpit, BrancheHub, GWÖ, DNQP, Demo-Leben

### 7 · PVS-Strategie + Roadmap (Session 9)
- `docs/PVS_STRATEGIE.md` · `lib/pvs/matrix.ts` 53 Module · `/roadmap/pvs` Dashboard
- `lib/pvs/abrechnung/types.ts` · `lib/pvs/eVerordnung/types.ts` · `lib/pvs/termine/types.ts`

### 8 · Live-Fallbesprechung (Session 10)
- `components/FallbesprechungLive.tsx` · 3-Spalten-Vollbild mit getUserMedia + getDisplayMedia
- Lana KI-Moderator mit Live-Notizen-Auswertung

### 9 · HKP-Verordnungs-Pipeline (Session 11)
- 5-Stufen-Pipeline · 4 Demo-Verordnungen · `/admin/verordnungen`

---

### 10 · PVS Phase A komplettiert (Session 12 · 2026-05-07)

| Commit | Modul | Route |
|---|---|---|
| `1c3795c` | **Pflege-Quartalsabrechnung** mit DTA-§302-Vorschau · EDIFACT-PLGA-Format strukturell korrekt | `/admin/abrechnung` |
| `621bc14` | **Pflegegrad-Antrags-Pipeline** · 5-Stufen NBA → MD-Termin → Bescheid → Widerspruch · 4 Seeds | `/admin/pflegegrad` |
| `cb96b2d` | **Wundmanagement** Pflege-Cockpit · ICW-Doku-Form · 2 Demo-Wunden (Helga · Wilhelm) | `/pflege/wunde` |
| `276bdf0` | **Cross-Beruf-Termin-Migration** · TourPunkt → FHIR-Appointment · 5-Berufe-Tagessicht | `/termine` |

### 11 · TI-Anschluss (Session 13)

| Commit | Modul | Route |
|---|---|---|
| `2502412` | **gematik-Konnektor-Anbieter-Vergleich** · 6 Anbieter (RISE · secunet · CGM · akquinet · x.iso · T-TIM) | `/admin/ti/konnektoren` |
| `616bd43` | **KIM-Mail FHIR-Bundle** + S/MIME-Vorschau · KBV_PR_EVDGA_Bundle 1.0 | (in Verordnungs-Detail) |
| `b123bdc` | **eRezept-Pilot** · Token-Format · MedicationRequest · 3 Demo-Rezepte | `/arzt/erezepte` |
| `26793af` | **HBA + SMC-B Karten-Cockpit** · 5 Demo-Karten · PIN-Status · Verlängerungs-Reminder | `/admin/ti/karten` |

### 12 · Inhalt + Politik (Session 14)

| Commit | Modul | Route |
|---|---|---|
| `8086e3b` | **Aufsichtsrats-PDF-Druck-Ansicht** + eIDAS-Container (D-Trust QES-Stub) | `/aufsicht/druck/[quartal]` |
| `cc02e81` | **Politik-Aggregat live** aus PVS-Daten · 5 Pakete + k-Anonym-Audit | `/politik` |
| `f781397` | **Quartal-Ausschüttung-Workflow eG** · 5 Stufen (Vorstand → Aufsichtsrat → SEPA) | `/genossenschaft/ausschuettung` |

### 13 · UI-Polish · Mobile + Brillenmodus + Beruf-Farben (Session 15)

| Commit | Was |
|---|---|
| `e5ab8c3` | **Mobile-Hamburger-Drawer** · volle Sidebar-Nav unter md · Beruf-getöntes Header |
| `e5ab8c3` | **Brillenmodus** als FAB rechts unten · markiert Text → KI-Klartext + Glossar + Rückfragen + Kosten · localStorage-Persistenz |
| `e5ab8c3` | **Beruf-Farben** geschärft: 11 Berufe mit eindeutiger CSS-var (Pflege rot · Arzt violett · Therapie türkis · Sozial blau · Erziehung gelb · Ehrenamt grün · Hauswirtschaft sand · Heilerziehung rosé · Lead petrol · Klient pink · Kasse gold) |

### 14 · WebRTC Phase 2 (Session 16)

| Commit | Modul | Route |
|---|---|---|
| `b6a4a02` | **Voll-WebRTC mit Supabase-Signaling** · RTCPeerConnection-Mesh · ICE · Track-Replacement | `/konferenz/[id]/live` (Toolbar-Button 📡) |
| `b52907c` | **LiveKit-SFU-Setup-Cockpit** · Token-Stub · 6-Schritte-Checklist · Migrations-Pfad | `/admin/ti/sfu` |
| `e09cb5c` | **Cloud-Recording + FHIR-Encounter** · Retention-Policy · DocumentReference · 3 Demo-Recordings | `/admin/recordings` |

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

**Push-Auth einrichten** (falls noch nicht):
```bash
git config --global credential.helper store
echo 'https://dkorn85:<DEIN_PAT>@github.com' > ~/.git-credentials
chmod 600 ~/.git-credentials
```

---

## PVS-Reife · Stand pro Beruf

53 Module katalogisiert in `lib/pvs/matrix.ts`. Sichtbar unter `/roadmap/pvs`.

| Beruf | Live | In Arbeit | Geplant | Konkurrent (vs) |
|---|---|---|---|---|
| 🩺 Pflege | SIS · Tour · Assessment-Skalen · **Wundmanagement** · **Quartalsabrechnung DTA-§302** · **Pflegegrad-Pipeline** | HKP-Pipeline (Phase B: Konnektor) | GPS-Tour · Pflegehilfsmittel-Antrag | Vivendi · MediFox · Snap |
| 👩‍⚕️ Arzt | Diktat · **eRezept-Pilot · KIM-FHIR-Bundle** | — | DMP · eImpfpass · KBV-Zulassung | CGM Albis · Medistar |
| 🤲 Therapie | Diktat | — | HMV-2025 · GKV-Abrechnung · Patient-Vereinbarung | Theorg · Buchner |
| 📋 Sozial | Diktat | — | Hilfeplan · BTHG-Abrechnung · §8a Kindeswohl | OPEN/Prosoz · connect-ASD |
| 🌱 Heilerziehung | Diktat | — | ITP · Tagesstruktur · Eingliederung-Abrechnung | VINCI · ProSoz/Klees |
| 🍲 Hauswirtschaft | Diktat | — | Speiseplan-Software · HACCP-Logbuch | — |
| 🌻 Erziehung | Lerngeschichten | — | Anwesenheit · Kita-Beitrag · Eltern-Portal | Stepfolio · Pixi |
| 🤝 Ehrenamt | Begleit-Diktat | — | Stunden für Spendenbescheinigung · Schulungs-Module | — |
| 🗂 Stationsleitung | Dienstplan-HUD · Konferenz · Fallbesprechung-Live · **Cross-Beruf-Termine** · **HBA/SMC-B-Verwaltung** · **TI-Konnektor-Vergleich** · **SFU-Setup** · **Cloud-Recordings** | — | Personal-Akte · MD-Audit-Pack · Tarif-Lohn | Connext · MediFox DAN |
| 💶 Krankenkasse | Bescheid-Diktat | — | MDK-Schnittstelle · Widerspruchs-Verfahren | — |
| 🌿 Klient:in | Akte-verstehen-KI · Live-Demo · Wundverlauf · **Brillenmodus universell** | — | Self-Booker · Sachleistung-Wallet · Angehörigen-Portal | washabich.de |
| 🏛 Genossenschaft | Pool · Solidartopf · **Quartal-Ausschüttung-Workflow** · **Aufsichtsrats-PDF + eIDAS** | — | Generalversammlung · GenG-Prüfungsverband-Anschluss | — |
| 📦 Lieferanten | GWÖ-Onboarding · Pool · 4 Diktate | — | SLA-Vertrags-Management · CO₂-Reporting CSRD | — |

**Aktueller Reifegrad gesamt:** ~70 % live (vorher 50 %), kontinuierlich steigend.

---

## Was als nächstes ansteht

### ✓ Erledigt seit letztem HANDOFF (14 von 20 Punkten)

- [x] Pflege-Quartalsabrechnung Stub mit DTA-Format-Vorschau
- [x] Pflegegrad-Antrags-Pipeline
- [x] Wundmanagement mit Foto-Verlauf (ICW-Standards)
- [x] Cross-Beruf-Termin-Migration
- [x] gematik-Konnektor-Anbieter-Vergleich
- [x] KIM-Mail produktiv (FHIR-Bundle-Vorschau · Phase B mit Krypto)
- [x] eRezept-Endpunkt an einem Pilot-Arzt-Cockpit
- [x] HBA + SMC-B Karten-Anbindung (Lifecycle-Cockpit · Hardware-Order pendend)
- [x] Voll-WebRTC mit RTCPeerConnection + ICE via Supabase Broadcast
- [x] LiveKit/mediasoup SFU für >4 Teilnehmer (Setup-Stub)
- [x] Cloud-Recording mit FHIR-Encounter-Audit-Trail
- [x] Aufsichtsrats-Bericht-PDF-Export mit eIDAS-Signatur
- [x] Politik-Aggregat-Pipeline echt aus aggregierten Daten
- [x] Quartal-Ausschüttung-Workflow für eG-Mitglieder

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
- [ ] DTA-§302 mit ITSG-Prüfsoftware validieren · echte Datenannahmestelle
- [ ] eIDAS-QES via D-Trust Sign-Me Remote-Signing-API
- [ ] LiveKit-Server-SDK + AccessToken-Signing
- [ ] Recording-Egress über LiveKit + Supabase-Storage-Upload

### Priorität D · UX-Inkremente

- [ ] HANDOFF.md-Verlinkung im Cockpit für PDL-Onboarding
- [ ] Erst-Konferenz-Wizard (Recording-Anlass + Retention vorab abfragen)
- [ ] Brillenmodus mit Voice-Output (TTS-Anbindung wieder hochfahren)
- [ ] Mobile-Drawer · Search-Filter wenn Sidebar > 10 Items

---

## Demo-Personas + Test-Routen

### Cockpit-Personas

| Rolle | Login-Persona | Test-Route |
|---|---|---|
| Pflegekraft | Dennis Reuter (`person-dr`) | `/pflege/heute` → Tour-KI → SIS-Diktat → **Wundmanagement** → Assessment-Skalen |
| Arzt | Dr. Susanne Hartmann (`person-arzt-001`) | `/arzt/heute` → Anfragen-Inbox → **eRezept-Pilot** → Verordnung-Diktat |
| Therapie | Sebastian Rauer (`person-therapeut-001`) | `/therapie/heute` → Diktat |
| Sozial | Mira Wagner (`person-sozial-001`) | `/sozial/diktat` |
| Lead/PDL | Detektiv Eins (`person-de1`) | `/admin/dienstplan/hud` → `/admin/abrechnung` → `/admin/pflegegrad` → `/admin/ti/karten` → `/termine` |
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

### Test-Konferenz · WebRTC

- `/konferenz/konf-helga-q2` · "Starten" → `live`
- `/konferenz/konf-helga-q2/live` · Toolbar-Button 📡 **Mesh** aktivieren · in zweitem Browser-Fenster gleiche URL öffnen → Echte Peer-zu-Peer-Verbindung über Supabase-Broadcast

### Test-Verordnung + eRezept

- `/admin/verordnungen` · 4 Demo-HKP-Verordnungen · jede zeigt FHIR-Bundle + S/MIME-Container
- `/arzt/erezepte` · 3 Demo-eRezepte (Metformin im FdV · Ramipril abgegeben · NovoRapid signiert)

### Test-Karten + Konnektor

- `/admin/ti/karten` · 5 Demo-Karten (HBA + SMC-B · 1 mit blockierter PIN.QES · 1 in Verlängerung)
- `/admin/ti/konnektoren` · 6 Anbieter im Vergleich
- `/admin/ti/sfu` · LiveKit-Setup-Status

### Test-Recording

- `/admin/recordings` · 3 Demo-Aufzeichnungen (Helga-Q2 · MD-Audit · GV-2025-permanent)
- Pro Recording ausklappbares FHIR-Encounter + DocumentReference

### Test-Aufsichtsrat-PDF

- `/aufsicht?q=Q1` → "📄 Druck-Ansicht · PDF + eIDAS-Signatur" → `/aufsicht/druck/Q1` öffnet sich · Browser-Druck (⌘P/Strg+P) → Speichern als PDF · Footer enthält eIDAS-Container-Vorschau

### Test-Quartal-Ausschüttung

- `/genossenschaft/ausschuettung` · 3 Quartale (Q1 ausgezahlt · Q2 genehmigt · Q3 Entwurf) · Stufen-Buttons schalten den Status weiter

---

## Wichtige Dateien · zentrale Orte

```
docs/
  PVS_STRATEGIE.md             Strategie + Phasen + Modul-Matrix
  HANDOFF.md                    Diese Datei
  STRATEGIE_TEAM_WOW.md         Branchen-Studien-Anker

apps/web/
  app/
    pflege/{heute,doku,tour,selbst,assessment,wunde}/    Pflege-Cockpit (NEU: wunde)
    arzt/{heute,diktat,dienstplan,erezepte,...}/         Arzt (NEU: erezepte)
    therapie/{heute,diktat,dienstplan}/                  Therapie
    sozial/{diktat,dienstplan}/                          Sozial
    {heilerziehung,hauswirtschaft,erziehung,ehrenamt}/diktat/  Beruf-Diktate
    klient/{heute,akte/verstehen,akte/wunde,dienstplan}/ Klient
    kasse/diktat/                                        Krankenkasse
    admin/{dienstplan/hud,dienstplan/archiv}/            PDL-HUD
    admin/verordnungen/                                  HKP-Pipeline-Cockpit
    admin/abrechnung/[id]/[rechnungId]/                  Quartalsabrechnung · DTA-§302 (NEU)
    admin/pflegegrad/[id]/                               Pflegegrad-Pipeline (NEU)
    admin/ti/{konnektoren,karten,sfu}/                   TI-Cockpits (NEU)
    admin/recordings/                                    Cloud-Recording + FHIR-Encounter (NEU)
    konferenz/[id]/{live}/                               Fallbesprechung
    supervisor/                                          Träger
    aufsicht/druck/[quartal]/                            Bericht-Druck-Ansicht (NEU)
    politik/                                             Politik · live aus PVS
    trading/, partner/[id]/, partner/multiplier/         Trading-Hub
    messenger/                                           Messenger-Discord-Layer
    station/[klientId]/                                  Station-Cockpit
    {hausmeister,reinigung,recycling,lebensmittel}/      Lieferanten-Hubs + Diktate
    lieferanten/                                         Pool-Marktplatz
    gemeinwohl/                                          GWÖ-Indikator
    expertenstandards/                                   DNQP-Übersicht
    netz/berufe/                                         13-Rollen-Matrix
    demo/leben/                                          Live-Sim-Cockpit
    roadmap/pvs/                                         PVS-Reife-Dashboard
    termine/                                             Cross-Beruf-Tagessicht (NEU)
    genossenschaft/{pool,solidartopf,ausschuettung}/     eG-Cockpits (NEU: ausschuettung)

  components/
    AppShell.tsx                Sidebar · Mobile-Drawer · Beruf-Akzent
    MobileNavDrawer.tsx         Hamburger-Drawer (NEU)
    Brillenmodus.tsx            FAB · KI-Klartext für jeden Begriff (NEU)
    BottomNav.tsx               mit Beruf-Akzent
    KlientShell + KasseShell    haben Brillenmodus + Beruf-Farben
    UserMenu.tsx                HauptMenu-Dropdown rechts oben
    DienstplanHud.tsx           KI-HUD Client
    BerufDiktat.tsx             Generisches Diktat-UI
    AkteVerstaendnis.tsx        Klient-Klartext-Übersetzer
    AssessmentTools.tsx         Braden/NRS/MNA/Tinetti
    WundverlaufDoku.tsx         Wund-Verlaufs-Tile
    WundeNeuerEintrag.tsx       ICW-Doku-Form (NEU)
    BrancheHub.tsx              Lieferanten-Marketing-Hub
    SimCockpit.tsx              Live-Demo 3-Spalten
    FallbesprechungLive.tsx     Konferenz-Vollbild + WebRTC-Mesh-Toggle
    WebRtcMeshTiles.tsx         Mesh-Remote-Tiles (NEU)
    VerordnungActions.tsx       HKP-Pipeline-Buttons
    PflegegradAntragActions.tsx Pflegegrad-Pipeline-Buttons (NEU)
    AusschuettungActions.tsx    eG-Quartal-Stufen (NEU)
    PrintButton.tsx             Browser-Drucken (NEU)
    SiteFooter.tsx              Marketing-Footer

  lib/
    auth/                       Supabase-Auth
    messenger/                  Channels, DM, Realtime, Store
    pflege/sis-store + tageshub
    arzt/diktat-store
    therapie/diktat-store
    sozial/diktat-store
    klient/akte-verstehen + akte-verstehen-ki
    beruf-diktat/profile + strukturiere-ki
    dienstplan/hud-store + hud-archive
    partner/store · supervisor/store · aufsicht/{bericht,eidas}
    politik/{store,aggregator}   Live-Aggregat aus PVS-Stores (NEU)
    berufsplan/generator
    hierarchy/ · zuordnung/store
    assessment/skalen.ts
    gemeinwohl/matrix.ts
    lieferanten/store.ts
    expertenstandards/dnqp.ts
    sim/{personas,world,charakter-stream}
    konferenz/{store,fallbesprechung,lana-moderator,recording}
                                   recording.ts: FHIR-Encounter + DocRef + Retention (NEU)
    pvs/matrix.ts                  53 PVS-Module
    pvs/abrechnung/{types,quartal} Quartalsabrechnung + DTA-§302 (NEU)
    pvs/eVerordnung/{types,store,actions}
    pvs/termine/{types,store}      Termin-Migration aus Tour (NEU)
    wunde/{types,store,actions}    Wund-Doku · NEU: actions
    pflegegrad/{check,leistungen,antrag-types,antrag-store,antrag-actions}  NEU: antrag-*
    ti/{konnektor-anbieter,fhir-bundle,erezept-store,karten-store}  TI-Cockpits (NEU)
    webrtc/{signaling,peer-mesh,use-mesh,livekit-sfu}    WebRTC + SFU-Stub (NEU)
    genossenschaft/{store,ausschuettung,ausschuettung-actions}  eG-Workflow · NEU: ausschuettung-*
    design/role-theme.ts           Beruf-Theme-Tokens
    ai/provider.ts · ai/anthropic.ts · ai/klartext.ts · ai/frag-lana.ts

scripts/
  post-build.mjs                Static + public assets in standalone/
  crop-grids.py                 5 Grids → 45 Einzelbilder + Chroma-Key
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
Tabellen:   einrichtungen, stationen, klienten, profiles, user_roles,
            verifications, audit_log, messages, message_reactions
Storage:    verifizierungen, messenger
ENV:        NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY
            ANTHROPIC_API_KEY · ELEVENLABS_API_KEY (TTS, optional)
            SHALEM_SITE_URL (für metadataBase, optional)
            NEXT_PUBLIC_TURN_URL · NEXT_PUBLIC_TURN_USER · NEXT_PUBLIC_TURN_CREDENTIAL (TURN, optional)
            LIVEKIT_URL · LIVEKIT_API_KEY · LIVEKIT_API_SECRET (Phase 2 SFU, optional)
```

**Hostinger-ENV-Bridge**: `next.config.mjs` bridged `SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL` zur Build-Zeit.

---

## Design-System-Update · 2026-05-07

Jeder Beruf hat jetzt eine eindeutige Akzent-Farbe in **AppShell · BottomNav · MobileDrawer · Brillenmodus**. Mapping liegt in `components/AppShell.tsx#ROLE_PRIMAER`:

| Beruf | CSS-var | Hex-Anker |
|---|---|---|
| Pflege | `--mon` | rot-warm |
| Arzt | `--vibe-profile` | violett |
| Therapie | `--fri` | türkis |
| Sozial | `--tue` | blau |
| Erziehung | `--wed` | gelb |
| Ehrenamt | `--thu` | grün |
| Hauswirtschaft | `--sun` | sand |
| Heilerziehung | `--sat` | rosé |
| Stationsleitung | `--vibe-team` | petrol |
| Klient | `--wed` | pink |
| Kasse | `--vibe-approval` | gold |

Sichtbar an: 2px-Sidebar-Border · Wordmark-Bereich-Gradient · Top-Bar zwischen Header und Content · Mobile-Header-Border · BottomNav-Top-Border · Drawer-Trigger-Tint · Brillenmodus-Floater.

---

## Branchen-Studien-Anker

| Beruf | Konkurrenten | Argumentation |
|---|---|---|
| Pflege | Vivendi · MediFox · Snap | SIS händisch ~30-90 min/Schicht · Wundvermessung manuell |
| Arzt | CGM · doxter · MEDISTAR | Click-Workflow ~3 min/Verordnung · eRezept manuell |
| Therapie | Theorg · Buchner · Vivendi | 8-Felder-Form ~6 min |
| Sozial | connect-ASD · OPEN/Prosoz | 60 min/Hilfeplan |
| Heilerziehung | VINCI · ProSoz/Klees | 60-Felder-Excel |
| Erziehung | Stepfolio · Pixi | 5 min/Lerngeschichte |
| Klient-Klartext | washabich.de · BefundKlar | 1-3 Tage Wartezeit · keine universelle KI-Brille |
| Kasse-Bescheid | AOK/Barmer/TK | Amtsdeutsch · 60 min Bescheid |
| PDL-HUD | Connext Vivendi · MediFox DAN | Modul-fragmentiert, kein KI-HUD |
| Trading | — | 4 % Multiplier-Cut vs 35-45 % Verleih-Marge |

Quellen: BARMER Pflege-Report 2024, DBfK Personal-Studie 2025, Pflegebericht 2024, Statistisches Bundesamt 2025, DNQP-Hochschule-Osnabrück, ecogood.org GWÖ-Matrix 5.0, gematik-Zulassungsliste 2026-Q1.

---

## Push-Pattern (vereinfacht · diese Session direkt auf main)

```bash
# Diese Session: direkt auf main mit credential.helper store
git add <files>
git commit -m "feat: ..."
git push   # Hostinger zieht aus main automatisch
```

**Klassisches Branch-Pattern** (für größere Features wieder einsetzen):
```bash
git checkout -b claude/<beschreibung>
# arbeiten + commiten
git push -u origin claude/<beschreibung>
git checkout main && git pull --ff-only && git merge --no-ff claude/<beschreibung> && git push
```

Hostinger-Build dauert ~2 min. **Hostinger-Hänger:** Bei > 10 Min "Building" Settings-and-redeploy klicken.

---

## Push-Auth-Notiz

Die Sitzung am 2026-05-07 hat einen PAT in einem Verlauf-Reply geteilt — der Token `ghp_QWUPRv…` ist bereits **rotiert** worden, der neue PAT liegt in `~/.git-credentials` auf dem Termux-Tablet (chmod 600). Künftige Pushes laufen ohne Eingabe.
