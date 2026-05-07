# Shalem Care · Session-Handoff

**Stand:** 2026-05-06 · für die nächste Session (Termux / Tablet / Desktop)
**Branch:** `claude/agitated-germain-e73b91` · **131 Routen** · `tsc --noEmit` exit 0 · `next build` exit 0
**Phase:** Plattform-Funktional · alle 12 Berufe + 4 Aufsichts-Ebenen + Politik-Schnittstelle

---

## TL;DR · was läuft live

- Demo-Domain: **shalem.de** (Hostinger Node.js, Auto-Deploy via Push auf `main`)
- Repo: <https://github.com/dkorn85/shalem-care>
- Supabase: `gpchwlqeqejxvynewjns.supabase.co` · 8 Tabellen · RLS aktiv
- Auth: Email + Google OAuth · Profile-Auto-Create · DSGVO-Self-Service
- **Messenger live · Pfad B Supabase-Realtime** mit Channels, DMs, Reactions, Presence, Typing
- 131 Routen, alle 12 Berufe haben mind. Tageshub + Diktat + Dienstplan
- KI-Dienstplan-HUD für PDL · 3-Zonen-Archiv · pk-ruhr-Multiplier-Brücke
- Politik-Schnittstelle mit KI-Gesundheitsminister-Simulator (6 Stellschrauben)
- Aufsichtsrat-Quartalsbericht KI-generiert (KonTraG / GenG §38)

---

## Termux-Setup auf Tablet · neu starten

```bash
# Falls Repo noch nicht da:
pkg install git nodejs-lts
git clone https://github.com/dkorn85/shalem-care.git
cd shalem-care/apps/web
npm install --include=dev

# ENV-Vars in .env.local (oder Termux-env via export):
echo 'NEXT_PUBLIC_SUPABASE_URL=https://gpchwlqeqejxvynewjns.supabase.co' > .env.local
echo 'NEXT_PUBLIC_SUPABASE_ANON_KEY=<aus Supabase-Dashboard>' >> .env.local

# Dev-Server:
npm run dev   # localhost:3000

# Type-check:
npm run type-check

# Build (Achtung Termux-Heap, ggf. NODE_OPTIONS="--max-old-space-size=2048"):
npm run build
```

**Pull aktueller Stand bevor du loslegst:**
```bash
cd shalem-care
git fetch origin
git checkout main
git pull --ff-only
```

---

## Was steht und wo

### Berufe (12) · alle Hub + Diktat + Dienstplan

| Beruf | Tageshub | Diktat | Dienstplan |
|---|---|---|---|
| 🩺 Pflege | `/pflege/heute` | `/pflege/doku/[klientId]` (SIS · 6 Felder · Sprache) | `/pflege` + `/pflege/tour` |
| 👩‍⚕️ Arzt | `/arzt/heute` | `/arzt/diktat` (Verordnung · ICD-10 · GoÄ) | `/arzt/dienstplan` |
| 🤲 Therapie | `/therapie/heute` | `/therapie/diktat` (HMV-Codes · ICF · VAS) | `/therapie/dienstplan` |
| 📋 Sozial | `/sozial` | `/sozial/diktat` (BTHG · ICF · SMART) | `/sozial/dienstplan` |
| 🌱 Heilerziehung | `/heilerziehung` | `/heilerziehung/diktat` (BTHG-Teilhabe · 6 Felder) | `/heilerziehung/dienstplan` |
| 🍲 Hauswirtschaft | `/hauswirtschaft` | `/hauswirtschaft/diktat` (Speisen · Hygiene · Vorrat) | `/hauswirtschaft/dienstplan` |
| 🌻 Erziehung | `/erziehung` | `/erziehung/diktat` (Lerngeschichte Margret-Carr) | — |
| 🤝 Ehrenamt | `/ehrenamt` | `/ehrenamt/diktat` (Hospiz-Begleit-Protokoll) | `/ehrenamt/dienstplan` |
| 🗂 Stationsleitung | `/admin` | — | `/admin/dienstplan/hud` (KI-HUD) |
| 💶 Krankenkasse | `/kasse` | `/kasse/diktat` (Bescheid · §§ SGB V/XI · Klartext) | — |
| 🌿 Klient:in | `/klient/heute` | — (Akte verstehen statt Diktat) | `/klient/dienstplan` |
| 🏛 Genossenschaft | `/genossenschaft` | — | — |

### Klient · Akte verstehen
- `/klient/akte/verstehen` · KI-Klartext-Übersetzer für Arztbriefe, Befunde, MD-Gutachten, Pflegepläne
- 33-Begriffs-Glossar · 5-Sektionen-Output · Reading-Level-Score · Lana-Vorlesen-CTA
- 2 Demo-Dokumente (Arztbrief Pulmologie + MD-Gutachten Helga)

### Pflegekraft-Selbstpflege
- `/pflege/selbst` · Energie + Stress + Schlaf + Mikro-Pausen + Stimmungs-Check
- BARMER-38%-Burnout-Argumentation + DBfK-Studien-Block

### Stations-Cockpit
- `/station/[klientId]` · Multi-Berufe-Live-Sicht
- MultiBerufTimeline (Stunden-Achse mit Profession-Lanes)
- LanaKiBerater (5 Sektionen + Frag-Lana-Chat-Stub)
- KI-Berufs-Brücke + Live-Chat + Vital + Foto + Akte-Files

### Aufsichts- & Politik-Ebenen
- `/supervisor` · Träger-Vorstand · Cross-Einrichtungs-Aggregat · 7-KPI-Strip · Health-Score · KI-Strategie-Vorschläge · 6-Stufen-Eskalation · Verantwortungs-Mapping (SGB-XI/GenG/KonTraG)
- `/aufsicht` · Aufsichtsrats-Quartalsbericht · KI-generiert · 7 Sektionen · Risiko-Ampel · KonTraG/GenG-konform
- `/politik` · 5 Aggregat-Daten-Pakete für BMG/MD/Sozialminister/ver.di/Länder · Steuerbescheid-Erklärung · KI-Gesundheitsminister-Simulator (6 Stellschrauben → 6 Output-Metriken + Risiko-Bewertung)
- `/trading` · Trading-Hub mit pk-ruhr.de + 2 weiteren Partnern · Multiplier-Mechanik visualisiert
- `/partner/[id]` + `/partner/multiplier` · Detail + 4-Akte-Konvergenz-Story

### Messenger · Pfad B aktiv (Supabase Realtime)
- 6 Channel-Kategorien · 37+ Demo-Channels + alle registrierten User als DM
- Realtime: postgres_changes auf messages + reactions · presence-channel · typing-broadcast
- DB: `messages` mit `dm_participants uuid[]` + `message_reactions` Tabelle + RPCs `list_dm_partners()` + `mark_dm_read()` + `reactions_for_messages()`
- Graceful Degradation wenn `NEXT_PUBLIC_SUPABASE_URL` fehlt → "statisch · Env fehlt"-Badge
- `/messenger?dm=<userId>` öffnet 1:1 mit anderem registriertem User
- Reactions: 7 Standard-Emojis · live-syncen · `has_self`-Flag aus DB
- Threads via `parent_id` (Schema vorhanden, UI-Stub)

### KI-Dienstplan-HUD
- `/admin/dienstplan/hud` · editierbar · Save-Button mit Mutations-Log
- `/admin/dienstplan/archiv` · 3-Zonen (◀ Archiv · ● Aktuell · ▶ Zukunft 3M KI-Sim)
- KI-Trends pro Station: Krankheits-/Urlaubs-/Bedarfs-Quote · Konfidenz-Score
- 27 Demo-Snapshots im Archiv

---

## DB-Schema · Supabase

```
einrichtungen     · 6 Demo (KEM, St. Lukas, KMN, APL, Charité, Wasserturm)
stationen         · 14 Demo
klienten          · 20 Demo (Helga + 19 weitere)
profiles          · auth-user-Profile mit haupt_rolle, demo_mode, demo_person_id
user_roles        · multi-rolle pro user
verifications     · Storage-Upload + Pruefer-Workflow
audit_log         · alle Auth-Tabellen + Trigger · prev_hash/this_hash für Phase-2
messages          · body + mentions[] + hashtags[] + dm_participants[] + parent_id
message_reactions · (message_id, user_id, emoji) UNIQUE
```

Storage-Buckets: `verifizierungen`, `messenger`.

RPCs: `list_dm_partners()`, `mark_dm_read(uuid)`, `reactions_for_messages(uuid[])`, `audit_stats_self()`.

Realtime-Publication enthält: `messages`, `message_reactions` (REPLICA IDENTITY FULL).

---

## Was als nächstes ansteht

### Priorität A · Funktional vervollständigen
- [ ] **TI-Messenger gematik-Anbindung** (Pflicht ab Dezember 2026 für eAU/eRezept) — Famedly-Partnerschaft konkretisieren
- [ ] **Hash-Kette Audit-Log** (Tamper-Evidence) — Spalten `prev_hash`/`this_hash` sind angelegt, Cron-Job + Verify fehlt
- [ ] **Messenger-Voicemail-Player** (Aufnahme funktioniert) → Wave-Visualizer beim Abspielen
- [ ] **Messenger Phase 3** · CareTeam-RLS pro Klient-Channel statt allgemeiner Sichtbarkeit

### Priorität B · KI-Schicht ausbauen
- [ ] **Anthropic-Stream im LanaKiBerater** statt Heuristik-Stub (im Stations-Cockpit + Akte-verstehen + Frag-Lana)
- [ ] **ElevenLabs-STT** für alle Diktat-Tools (heute Mediarecorder, Phase-2 echter STT)
- [ ] **ElevenLabs-TTS-Vorlesen** für Klartext-Brücken (Lana liest Akte/Brief vor)

### Priorität C · Phase-2-Brocken
- [ ] **Stripe Connect Treuhand-Modul** echte Stripe-Integration (heute Stub)
- [ ] **Push-Notifications** (Web-Push VAPID + Service-Worker) für Notruf + Messenger-Mentions
- [ ] **Slot-Migration nach Supabase** (heute in-memory)

### Priorität D · Inhalt + Politik
- [ ] **Aufsichtsrats-Bericht-PDF-Export** mit eIDAS-Signatur
- [ ] **Politik-Aggregat-Pipeline** echt aus aggregierten Daten (heute statische Demo)
- [ ] **Quartal-Ausschüttung-Workflow** für eG-Mitglieder

### Priorität E · Pending User-Aktionen (organisatorisch)
- [ ] UG-Notar-Termin (1-2 Wochen)
- [ ] DSB extern beauftragen (~200-300 €/Mo)
- [ ] AÜG-Anwalt für Cross-Träger-Tausch (4-8 Wochen)
- [ ] Genossenschafts-Anwalt-Erstgespräch
- [ ] pk-ruhr.de tatsächlich kontaktieren für reale Multiplier-Brücke

---

## Demo-Personas + Test-Routen

| Rolle | Login-Persona | Test-Route |
|---|---|---|
| Pflegekraft | Dennis Reuter (`person-dr`) | `/pflege/heute` → Tour-KI → SIS-Diktat |
| Arzt | Dr. Susanne Hartmann (`person-arzt-001`) | `/arzt/heute` → Anfragen-Inbox → Verordnung-Diktat |
| Therapie | Sebastian Rauer (`person-therapeut-001`) | `/therapie/heute` → Diktat |
| Sozial | Mira Wagner (`person-sozial-001`) | `/sozial/diktat` |
| Lead/PDL | Detektiv Eins (`person-de1`) | `/admin/dienstplan/hud` → Edit-Modus → Save |
| Klient | Helga Reinhardt (`klient-hr`) | `/klient/heute` → Akte verstehen |
| Aufsicht | Detektiv Eins | `/aufsicht?q=Q1` |
| Politik | Demo-Sicht | `/politik` → KI-Sim-Stellschrauben |
| Trading | Demo-Sicht | `/trading` → pk-ruhr-Detail |

Wechsel zwischen Rollen: **HauptMenu-Dropdown** im Header (oben rechts).

---

## Push-Pattern für Termux

```bash
# Branch erstellen
git checkout -b claude/<beschreibung>

# Arbeiten + commiten wie üblich
git add <files>
git commit -m "feat: ..."

# Push branch
git push -u origin claude/<beschreibung>

# Merge in main + push (User muss manuell zulassen)
git checkout main
git pull --ff-only origin main
git merge --no-ff claude/<beschreibung> -m "merge: ..."
git push origin main
```

Hostinger zieht aus `main` automatisch. Build dauert ~2 min.

---

## Wichtige Dateien · zentrale Orte

```
apps/web/
  app/
    pflege/{heute,doku,tour,selbst}/    Pflege · komplett
    arzt/{heute,diktat,dienstplan}/     Arzt
    therapie/{heute,diktat,dienstplan}/ Therapie
    sozial/{diktat,dienstplan}/          Sozial
    {heilerziehung,hauswirtschaft,erziehung,ehrenamt}/diktat/   Beruf-Diktate
    klient/{heute,akte/verstehen,dienstplan}/    Klient
    kasse/diktat/                        Krankenkasse
    admin/dienstplan/{hud,archiv}/       PDL-HUD
    supervisor/                          Träger
    aufsicht/                            Aufsichtsrat
    politik/                             Politik + KI-Minister
    trading/, partner/[id]/, partner/multiplier/   Trading-Hub
    messenger/                           Messenger-Discord-Layer
    station/[klientId]/                  Station-Cockpit

  components/
    AppShell.tsx           sidebar nav (alle Berufs-Navs hier)
    UserMenu.tsx           HauptMenu-Dropdown rechts oben
    DienstplanHud.tsx      KI-HUD client
    BerufDiktat.tsx        generisches Diktat-UI
    SisDiktat, ArztDiktat, TherapieDiktat, SozialDiktat   spezialisiert
    AkteVerstaendnis.tsx   Klient-Klartext-Übersetzer
    GesundheitsministerSim.tsx
    MessengerLive.tsx + MessengerShell.tsx
    LanaKiBerater.tsx + MultiBerufTimeline.tsx (Stations-Cockpit)
    VoicemailPlayer.tsx

  lib/
    auth/                  Supabase-Auth (browser-client + server-client getrennt)
    messenger/             channels, dm, realtime, store
    pflege/sis-store + tageshub
    arzt/diktat-store
    therapie/diktat-store
    sozial/diktat-store
    klient/akte-verstehen
    beruf-diktat/profile   generisch (heilerz/hauswirt/erz/ehrenamt/kasse)
    dienstplan/hud-store + hud-archive
    partner/store          pk-ruhr.de + 2 weitere
    supervisor/store
    aufsicht/bericht
    politik/store          AggregatPaket + Steuerbescheid + simuliereSzenario
    berufsplan/generator   Cross-Profession-Termine
    hierarchy/             Einrichtungen + Stationen + Personen + Klienten
    zuordnung/store        CareTeam-Caseloads
```

---

## Aktuelle Stack-Übersicht

```
Frontend:  Next.js 15 App Router · React 19 · TypeScript · Tailwind 3
Backend:   Supabase (Frankfurt eu-central-1) · PostgREST · RLS · Storage · Auth
Realtime:  Supabase Realtime (postgres_changes + presence + broadcast)
Audio:     ElevenLabs Voice-IDs Lana + Dennis (TTS, STT in Phase 2)
Hosting:   Hostinger Node.js (Auto-Deploy via GitHub-Push auf main)
Repo:      github.com/dkorn85/shalem-care
DB:        gpchwlqeqejxvynewjns.supabase.co
Tabellen:  einrichtungen, stationen, klienten, profiles, user_roles,
           verifications, audit_log, messages, message_reactions
Storage:   verifizierungen, messenger
ENV:       NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
           ELEVENLABS_API_KEY (für TTS-Build, optional)
```

**Hostinger-ENV-Bridge**: `next.config.mjs` bridged `SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL` zur Build-Zeit, falls Hostinger nur die nicht-public Variante setzt.

---

## Branchen-Studien-Anker

Vergleichs-Argumentation in den Diktat-/Verstehen-Tools:

- **Pflege**: vs Vivendi, MediFox, Snap (SIS händisch · ~30-90 min/Schicht)
- **Arzt**: vs CGM, doxter, MEDISTAR (Click-Workflow · 3 min/Verordnung)
- **Therapie**: vs Theorg, Buchner, Vivendi (8-Felder-Form · ~6 min)
- **Sozial**: vs connect-ASD, care4, OPEN/Prosoz (60 min/Hilfeplan)
- **Heilerziehung**: vs VINCI, ProSoz/Klees (60-Felder-Excel)
- **Erziehung**: vs Stepfolio, Pixi (5 min/Lerngeschichte)
- **Klient-Klartext**: vs washabich.de, BefundKlar (1-3 Tage Wartezeit)
- **Kasse-Bescheid**: vs AOK/Barmer/TK (Amtsdeutsch · 60 min Bescheid)
- **PDL-HUD**: vs Connext Vivendi, MediFox DAN (modul-fragmentiert, kein KI-HUD)
- **Trading**: 4% Multiplier-Cut vs 35-45% Verleih-Marge

Quellen: BARMER Pflege-Report 2024 (38% Burnout), DBfK Personal-Studie 2025, Pflegebericht 2024, Statistisches Bundesamt 2025.

---

## Status zum Session-Ende 2026-05-06 / 2026-05-07 (Polish + Marketing-Schicht)

Build clean · main = HEAD · Hostinger zieht.

**12 Pushes in dieser Session — komplette Marketing- und Edukativ-Schicht
oben drauf:**

Polish-Phase:
- `f844f61` feat: Shalem-konforme Error-Pages (`app/error.tsx`, `app/not-found.tsx`,
  `app/global-error.tsx`) — keine nüchternen Next-Default-404er mehr; alle Fehler
  zeigen Rainbow-Bar + Portal-Quicklinks + Reset-Button.
- `ac7507a` fix: AUDIT_DEADLINKS abgearbeitet — `/willkommen` ist keine
  Redirect-Wüste mehr, sondern echte Onboarding-Page mit 10 Portalen; 6 Wordmark-/
  Home-Links auf `/` umgestellt; `#wie-funktioniert`-Anchor auf
  `/genossenschaft` taggt jetzt die Plattform-Bilanz-Section; leerer
  Satzung-Link in `/genossenschaft/beitreten` entschärft.
- `8e9dd1c` feat: `/kontakt`-Page mit 8 dedizierten Anliegen-Pfaden
  (allgemein/pflege/klient/träger/partner/presse/datenschutz/security) +
  3-FAQ-Block; verlinkt aus Landing-Footer und `/willkommen`.
- `9762033` feat: `/sitemap.xml` (40+ Marketing-Routen mit Priority +
  ChangeFrequency) + `/robots.txt` (Marketing erlaubt, alle auth-Cockpits +
  `/api/` + `/auth/` + Verifikations-Strecke gesperrt; Sitemap- + Host-Direktiven).
- `efc8651` docs: HANDOFF + AUDIT_DEADLINKS auf Stand 2026-05-06.

Edukativ-Schicht:
- `ec300fe` feat: `/leistungen` · Pflegekassen-Leistungsrechner SGB XI 2025
  mit PG-Switch (1–5), 4 Hauptleistungen + 6 Zusatzleistungen, Quellenangabe.
  Beträge zentral in `lib/pflegegrad/leistungen.ts`.
- `5dee8c4` feat: `/pflegegrad-check` · NBA-Selbstcheck mit 6 Modulen +
  22 Fragen, korrekte NBA-Gewichtung (Modul 4/5 alternativ), Schwellen-
  Mapping nach Tabelle, Ergebnis-Deeplink zu `/leistungen?pg=X`.
- `83d5bb0` feat: `/tarif` · Tarifrechner Verleiher 30–50% vs. Genossenschaft
  4% mit Slidern + Marge-Presets, Side-by-side-Vergleich, „X € mehr/Monat"-
  Hervorhebung, Aufschlüsselung 2/1/1.
- `70fd42d` feat: `/glossar` · 30 Pflege-Begriffe (PG/NBA/ePA/AÜG/BTHG…)
  in Klartext, 7 Kategorien mit Farbcode, Such-Filter.

Marketing-Schicht:
- `3f9416c` feat: `/faq` · 4 Kategorien × 4-5 Fragen (Klient / Pflege /
  Träger / Recht-Datenschutz), Sprung-Anker, details/summary statt JS-State.
- `fcdf05d` feat: `/pflegekraft-werden` · B2C-Onboarding-Hub mit
  6 Versprechen + 3-Schritt-Pfad + 3 Top-Fragen. CTA zu `team@shalem.de`.
- `6810fc0` feat: `/traeger-werden` · B2B-Onboarding-Hub mit 6 Argumenten
  + 3-Schritt-Pilot-Pfad + 3 Top-Fragen. CTA zu `traeger@shalem.de`.

**Neue Routen (12 zusätzliche öffentliche Pages):** `/error`, `/global-error`,
`/not-found` (implizit), `/sitemap.xml`, `/robots.txt`, `/kontakt`,
`/leistungen`, `/pflegegrad-check`, `/tarif`, `/glossar`, `/faq`,
`/pflegekraft-werden`, `/traeger-werden` — plus Umbau von `/willkommen`.

**Neue Libraries:** `lib/pflegegrad/leistungen.ts` (SGB-XI-Sätze 2025),
`lib/pflegegrad/check.ts` (NBA-Module + Score-Logik), `lib/glossar/eintraege.ts`
(30 Begriffe mit Kategorie + Klartext + Deeplink).

**Neue Komponenten:** `PgCheckWizard` (Client, useState),
`TarifRechner` (Client, useState), `GlossarFilter` (Client, useMemo).

**Vorherige Commits aus früheren Sessions:**
- HauptMenu cleanup (Pfad-Anzeigen entfernt) + Messenger-Discord-Layer
- Echte 1:1-DMs zwischen registrierten Usern + Therapie-Layer
- HUD Phase 2 (editierbar+Archiv) + Trading-Hub mit pk-ruhr + Arzt-Diktat
- Pflege-Layer tief (SIS-Sprachdiktat + Tour + Selbstpflege + Tageshub)
- HauptMenu-Farben + Dienstplan-Integration in 6 Berufe + Stations-Cockpit-KI
- Voicemail-Player mit Wave-Visualizer
- KI-Dienstplan-HUD für PDL
- Messenger Phase 2 Pfad B (Supabase Realtime)
- Sozial-Diktat + Klient-Akte-Verstehen + Supervisor + Politik + KI-Gesundheitsminister
- Messenger graceful degradation + 4 Beruf-Diktate + Aufsichtsrat-Bericht
- Klient-Tageshub + Krankenkasse-Bescheid-Diktat (final)

**AUDIT_DEADLINKS.md vollständig abgearbeitet** — Status siehe dort.

Nächste Session kann sofort einsteigen — alles dokumentiert, alles im main, alles deploybar.
