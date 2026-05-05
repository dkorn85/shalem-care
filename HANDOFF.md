# Shalem Care · Session-Handoff

**Stand:** 2026-05-05 · für die nächste Session
**Branch:** `claude/tender-nightingale-f1bb8b` · 76 Routen · `tsc --noEmit` exit 0 · `next build` exit 0

---

## Was läuft live

- Demo-Domain: **shalem.de** (Hostinger Node.js, Auto-Deploy via GitHub-Push)
- Repo: <https://github.com/dkorn85/shalem-care>
- Demo-Mode: `NEXT_PUBLIC_DEMO_MODE=1` aktiviert Banner + Persona-Switcher (Dropdown mit 12 Rollen)
- 23 echte Bildgebungs-PNGs (Röntgen/CT/MRT/Sono) im Befunde-Cockpit
- **Supabase-DB live** unter `gpchwlqeqejxvynewjns.supabase.co` (Hostinger → Supabase Frankfurt) — 12 Klient:innen + 3 Einrichtungen + 3 Stationen geseedet, RLS-Policies aktiv. Status-Anzeige `/admin/db-status`.
- **Auth-Schema** — `profiles`, `user_roles`, `verifications`-Tabellen mit RLS, Auto-Profile-Erstellung beim Signup.
- **NEU: Auth funktional** — `@supabase/supabase-js` + `@supabase/ssr` integriert. **Google-OAuth ist live** (Client-ID + Secret in Supabase konfiguriert). `/registrieren` → `/registrieren/start?provider=google` → Google-Login → `/auth/callback` (Code-Exchange) → `/registrieren/verifizieren`. Email-Signup als Fallback. Doku `docs/AUTH_SETUP.md`.

---

## Stand der Plattform · Demo-komplett

### Rollen + Cockpits (12)

| Rolle | Persona | Route | Sub-Routes |
|---|---|---|---|
| 🩺 Pflege | Dennis Reuter (P7) | `/pflege` | `/dienst`, `/tausch`, `/profil`, `/profil/krankmeldung` |
| 👩‍⚕️ Arzt | Dr. Susanne Hartmann | `/arzt` | `/anfragen`, `/anfragen/[id]`, `/patienten`, `/patient/[id]` |
| 🤲 Therapie | Sebastian Rauer (Physio/MLD) | `/therapie` | `/heute`, `/patienten`, `/abrechnung` |
| 📋 Sozialarbeit | Mira Wagner (DGCC-CM) | `/sozial` | `/faelle`, `/hilfeplan`, `/schutz`, `/md-begutachtung` |
| 🌻 Erziehung | Yvonne Berger | `/erziehung` | `/gruppen`, `/lerngeschichten` |
| 🤝 Ehrenamt | Rita Schöndorf (Hospiz) | `/ehrenamt` | `/begleitung`, `/protokoll` |
| 🌱 Heilerziehung | Anika Stein (BTHG) | `/heilerziehung` | — |
| 🍲 Hauswirtschaft | Helmut Brandt (LMHV) | `/hauswirtschaft` | — |
| 🗂 Stationsleitung | Detektiv Eins (P9) | `/admin` | `/dienstplan`, `/disposition`, `/team`, `/team/[id]`, `/erloes`, `/zahlungen`, `/auswertung`, `/aktivitaet`, `/dokumentation`, `/genehmigungen` |
| 💶 Krankenkasse | Sandra Lehmann (AOK) | `/kasse` | `/abrechnung`, `/vorgang/[id]` |
| 🌿 Klient:in | Helga Reinhardt (PG 3, 78 J.) | `/klient` | `/akte`, `/akte/befunde`, `/akte/wunde`, `/akte/anamnese`, `/akte/behandlung`, `/begleiter`, `/notizen`, `/buchen`, `/anfrage`, `/bewertung` |
| 🏛 Genossenschaft | öffentliche Sicht | `/genossenschaft` | `/beitreten` |

### Cross-Profession-Layer

- **`/netz`** — Komplettübersicht als neuronales Netz mit Echtzeit-Synapsen, Pulse-Animation auf aktiven Edges, Live-Aktivitätsfeed (auto-refresh 30 s)
- **`/konferenz/[id]`** — interdisziplinäre Fall-/Hilfeplan-Konferenz mit Pre-Reads pro Beruf
- **`/klient/begleiter`** — Klient sieht alle 8 Begleiter:innen + Konferenz-Slot
- **`AndereBegleiter`** + **`MeineKlienten`** Komponenten in 4–5 Cockpits eingebaut
- **`CrossProfessionInbox`** — pro Beruf abarbeitbare Inbox aus Aktivitäts-Feed-Events mit `zielBeruf`. Status: offen / in Arbeit / erledigt. Quick-Actions: Übernehmen · Erledigt · Delegieren an anderen Beruf. Eingebaut in `/arzt`, `/pflege`, `/therapie`, `/sozial`, `/admin`. KPI-Tiles oben (offen, in Arbeit, heute fertig, akut).
- **NEU: `KonferenzLive`** — Live-Mode auf `/konferenz/[id]` mit Start/Beenden/Vertagen-Knöpfen. Während `status === "live"`: auto-save Live-Notizen-Textarea, Agenda mit Status-Buttons (besprochen / vertagen / zurück), Beschluss-Composer (was/wer/bis), Beschluss-Liste mit Status-Toggle (offen/in Arbeit/erledigt) + Löschen. Bei abgeschlossenen Konferenzen wird das Live-Protokoll als statisches Read-only angezeigt.

---

## Datenmodell · 20 Klient:innen über 7 Stationen

| Pflegeheim | Klient:innen | PG |
|---|---|---|
| St. Lukas Bochum WB-A | Helga · Wilhelm · Elfriede · Otto · Gertrud | 3/4/5/4/5 |
| St. Lukas Bochum WB-B | Peter · Alma | 3/4 |
| Prenzl-Berg Berlin | Reinhardt · Ingrid · Volker · Margot | 2/3/3/4 |
| Augsburg ambulant | Friedrich · Maria · Hannelore · Rolf | 2/4/3/2 |
| München-Nord Geri | Konrad · Edith · Josef | 4/4/5 |
| Charité Pädiatrie | Jonas (10 J.) | 3 |
| Klinikum Essen | Bertha | 3 |

### Care-Team-Zuordnung (`lib/zuordnung/store.ts`)

16 Caseloads über 8 Berufsgruppen — jede Persona hat einen klaren `klientIds[]` und `zustaendigkeitsbereich`.

---

## Fachliche Tiefe (was an Logik drin ist)

- **NBA-Modul** vollständig (`lib/nba/module.ts`) — 27 Items × 6 Module × BMG-Gewichtung. Helga 53.7 Pkt → PG 4
- **Wundverlauf** mit DNQP-Standard, EPUAP-Klassifikation. Sakraldekubitus 12.6 → 2.8 cm² in Heilung
- **AU-Kaskade** Phase 1 (§ 3 EFZG · § 44 SGB V · § 145 SGB III · BEM-Trigger)
- **Tibetische Medizin** mit 3 Säften (rLung/Tripa/Beken) + 10 Schulmed↔Tibet-Mappings
- **Anamnese-Schemas** für alle 8 Berufsgruppen (SIS, ICF, BTHG, KitaG-konform)
- **Genossenschaft** mit 11 Mitgliedern, 87 Anteilen, 8.700 € Einlage, simulierter Q1-Ausschüttung
- **Self-Booker** PG ≥ 2 mit transparenten Marktpreisen + 84 % Pflegekraft-Anteil
- **Konferenz-Modul** mit 6 Typen, Pre-Reads, Agenda, Beschluss-Tracking

### Bildgebung-Assets (23 PNGs)

Alle unter `apps/web/public/befunde/demo/`:
- Wirbelsäule: LWS · BWS · HWS in lateral/AP/sagittal/axial
- Schädel: CT axial/coronar · MRT axial/sagittal/coronar
- Thorax: AP + lateral
- Knie: MRT sag + cor
- Carotiden: Sono links + rechts

ImagingGallery zeigt sie automatisch via `existsSync` — Fallback SVG-Anatomie wenn Datei fehlt.

---

## Geld-Kalkulation

**TVöD-P 2026** (lib/tariff.ts): P7 22,50 € · P8 24,10 € · P9 26,30 € · P10 28,70 €

**Plattform-Cut Genossenschaft:** 4 % statt 30–50 % bei Honorar-Verleihern. Davon 2 % Betrieb · 1 % Rücklage · 1 % Quartals-Ausschüttung.

**Self-Booker-Anteile:** Pflegekraft 82–86 % · Plattform 4 % · Pflegekassen-Direktabrechnung über DTA SGB XI Anlage 5.

**`/admin/team`** zeigt für alle Pflegekräfte: Stundensatz · Wochenstunden · Std/Mo · Brutto/Mo · Caseload · ArbZG-Status, plus Summary-KPI-Bar.

---

## Echtzeit-Layer

**`lib/aktivitaet/feed.ts`** — 16 Event-Typen, 28 Demo-Events seeded über 24 h.

**`/netz`** rendert das Genossenschafts-Netz als animiertes SVG:
- 9 Knoten (8 Berufe + Klient zentral, Lead unten)
- 16 Basis-Edges
- Pulse-Animation auf aktiven Edges (Events letzte 5 Min)
- Aktivitäts-Feed daneben mit Live-Stream
- Caseload-Matrix
- 12-Cockpit-Schnellzugang

---

## Architektur-Map

### Stores

```
lib/au-cascade/phases.ts            AU→KG→ALG-Phasen (rein funktional)
lib/bem/store.ts                    § 167 II SGB IX Workflow
lib/wiedereingliederung/store.ts    § 74 SGB V Hamburger Modell
lib/agentur/arbeit-api.ts           ALG 1 + Nahtlosigkeit + DRV-Reha-Stub
lib/fortbildung/{katalog,store}.ts  25 Module über 8 Berufsgruppen
lib/befund/{types,store}.ts         Imaging/Labor/Gangbild/Wirbelsäule
lib/tibetisch/lehre.ts              Sowa-Rigpa-Lehre + Deutungs-Katalog
lib/anamnese/schemas.ts             8 Berufs-Schemas
lib/wunde/{types,store}.ts          DNQP-konforme Wunddoku
lib/genossenschaft/store.ts         Anteile + Mitglieder + Plattform-Bilanz
lib/selfbooker/store.ts             Self-Buchung mit transparenten Marktpreisen
lib/team-um-klient/store.ts         CareTeam-Map (Helga-Universum)
lib/konferenz/{store,actions}.ts    Fallkonferenz mit Pre-Reads + Agenda + Live-Mode
lib/zuordnung/store.ts              Person→Klient:innen-Caseloads
lib/nba/module.ts                   NBA Pflegegrad-Begutachtung
lib/aktivitaet/feed.ts              Event-Stream zwischen Berufen
lib/inbox/{store,actions}.ts        Cross-Profession-Inbox aus dem Feed
lib/db/supabase.ts                  REST-Client (PostgREST, fetch-basiert, no SDK)
lib/klient/db-driver.ts             DB-first Klient-Loader mit Seed-Fallback
```

### UI-Komponenten

```
RolePortal · PersonaSwitcher · SpineDiagram · LabTable · ImagingGallery
GaitAnalysis · DualeDeutung · AnamneseFormular · WundverlaufDoku
AUKaskade · BemCard · WiedereingliederungCard · KonferenzCard
AndereBegleiter · MeineKlienten · Berufsnetz · AktivitaetsFeed
BerufCockpitCard · CrossProfessionInbox · KonferenzLive
```

---

## Asset-Briefe (in `docs/`)

| Brief | Status |
|---|---|
| ASSETS_FLOWSTATE.md (Block 1–6) | ✓ ausgeliefert |
| ASSETS_BEFUNDE.md (Block 7–11) | ✓ ausgeliefert |
| ASSETS_IMAGING.md (Block 12) | ✓ 23 Dateien ausgeliefert |
| ASSETS_LIVEDEMO.md (Block 13–18) | ✓ 25 von 27 ausgeliefert · Block 18 OG-Cards (db-status, inbox, onboarding, heilerziehung, hauswirtschaft) noch ausstehend |
| AUTH_SETUP.md | OAuth-Provider-Konfiguration in Supabase Dashboard (Google, Apple, Microsoft, GitHub, Verimi, yes®, gematik) + Storage-Bucket + Phase-2-TODO-Liste |
| STRATEGIE_LIVE.md | NEU · Reife-Einschätzung pro Domain · 4-Phasen-Roadmap zum Pilot-Live · Konkurrenz-Positionierung · Top-3-Engpass |
| ASSETS_LIVEDEMO_2.md | ✓ 37 von 38 ausgeliefert (Block 19-24) — fehlend: 19.7 og/anmelden |
| AUDIT_DEADLINKS.md | NEU · 13 Befunde aus 76 Routen — 4 echte tote Links jetzt gefixt |
| TECH_ROADMAP.md | NEU · Auth-Vervollständigung · DB-Migration · Realtime/Push · Compliance — pro Item Aufwand+Blocker |
| AUDIT_DESIGN.md | NEU · Asset-Skalierungs-Audit · 6 Major-Befunde, 7 Mittel, 5 Minor — Hero-Bilder werden in 9+ Routen als kleine Cards gequetscht |
| PLAN_MODULAR.md | NEU · Modularisierungs-Plan · 5 Top-Komponenten (AccentCard, HeroBanner, SectionHeader, MediaSplit, RevealOnScroll) — ~1200 LoC weg |
| AUDIO_PLAN.md | NEU · ElevenLabs-Sound-Strategie · 22 Audio-Files, 2 Stimm-Profile (Klara/Jonas), Phase-B-Klone von Dennis+Lana mit DSGVO-Pfad |
| ASSETS_FINISH.md | NEU · Final-Schliff Block 25-30 · Status-Icon-Grid (9-up · 1 Render → 9 Icons), Aktions-Icon-Grid, 5 Avatar-Lücken, 3 Mikro-Patterns, 5 OG-Cards, 2 Audio-Visualizer-Loops · 23 Renders → 41 Files |
| PHASE_2_INTEGRATION.md | Migrations-Pfade aller 22 Stores |
| ROADMAP_NEXT.md | 14 Inhalts-Themen mit Priorisierung |

---

## Was als nächstes ansteht

### Priorität A · Demo-Story-Tiefe
- [x] ~~**Konferenz live-mode**~~ — Notizen auto-save, Agenda-Status-Buttons, Beschluss-Composer, Live-Protokoll bei abgeschlossen
- [x] ~~**Cross-Profession-Inbox**~~ — eingebaut in 5 Cockpits (Arzt, Pflege, Therapie, Sozial, Lead) mit Übernehmen/Erledigt/Delegieren-Aktionen
- [ ] **Demo-Tour-Update** — Lead-Loop fehlt noch (`loop-persona-lead.mp4`)
- [ ] **Klartext-Wrapper Spread** — auf Befunde + Wundverlauf + Anamnese-Antworten

### Priorität B · Phase-2-Vorbereitung
- [x] ~~**Supabase-DB Klient:innen**~~ — Schema (einrichtungen/stationen/klienten) + RLS + 12 Klient:innen seeded · DB-Driver mit Seed-Fallback · `/admin/db-status` zeigt Quelle live
- [ ] **Supabase weiter ausrollen** — Personen/Slots/Verordnungen/Wunddoku in DB migrieren (Driver-Pattern wie bei klienten)
- [ ] **Stripe Connect Treuhand-Modul** (lib/treuhand/store.ts)
- [ ] **Push-Notifications** (Web-Push VAPID, Service-Worker)
- [ ] **gematik-TI-Konnektor-Stub** für eAU + eRezept

### Priorität C · weitere Inhalte
- [x] ~~**Notfall-Modul** (`/notfall`)~~ — Stub mit Eskalations-Kette (4 Stufen) + SOS-Demo-Knopf + Phase-2-Roadmap (VAPID, Twilio, BLE-Pendant)
- [x] ~~**Marketing-Page `/warum`**~~ — Differenzierung Honorar-Verleih vs. Genossenschaft, 4-%-Visual, Cross-Profession-Story, CTA Beitritt
- [x] ~~**Hauswirtschaft + Heilerziehung Sub-Routes**~~ — 6 Sub-Routes (Einkauf/Kochen/Reinigung + Teilhabe/Bildung/Tagesstruktur) als SubRouteStub-Komponente
- [ ] **i18n vervollständigen** — neue Berufe + Befunde-Akte EN

### Priorität D · Eye-Candy
- [ ] **Akte-Atmo-Loops** wirklich einbauen (`atmo-puls/atem/ganzheit.mp4` aus Block 11)
- [ ] **Tibetisch-Inline-Illustrationen** auf Befunde-Page

---

## Reset-Anleitung

```powershell
Set-Location 'C:\Users\dkorn\Downloads\shalem-care-v0.1.0\shalem-care'
git pull
Set-Location 'apps/web'
npm install --include=dev
npm run build      # → apps/web/.next/standalone/apps/web/server.js
npm start          # localhost:3000
```

Hostinger zieht bei `git push origin main` automatisch den neuen Stand.

---

## Demo-Persona-Cheat-Sheet

| Rolle | Login | Name | Persona-ID |
|---|---|---|---|
| Pflegekraft | `/pflege` | Dennis Reuter | `person-dr` |
| Arzt | `/arzt` | Dr. Susanne Hartmann | `person-arzt-001` |
| Therapie | `/therapie` | Sebastian Rauer | `person-therapeut-001` |
| Sozialarbeit | `/sozial` | Mira Wagner | `person-sozial-001` |
| Erziehung | `/erziehung` | Yvonne Berger | `erzieher-001` |
| Ehrenamt | `/ehrenamt` | Rita Schöndorf | `person-ehrenamt-001` |
| Heilerziehung | `/heilerziehung` | Anika Stein | `person-as-005` |
| Hauswirtschaft | `/hauswirtschaft` | Helmut Brandt | `hwf-001` |
| Stationsleitung | `/admin` | Detektiv Eins | `person-de1` |
| Krankenkasse | `/kasse` | Sandra Lehmann (AOK Nordost, IK 100000031) | — |
| Klient:in | `/klient` | Helga Reinhardt (PG 3) | `klient-hr` |

Wechsel zwischen Rollen: **Persona-Switcher-Dropdown** im Header (sichtbar wenn `NEXT_PUBLIC_DEMO_MODE=1`).

---

## Diese Session-Schichten (chronologisch)

1. RolePortal-Welcome-Page mit dynamischer Rollenwahl
2. AU-Kaskade + BEM + Wiedereingliederung + Fortbildung-Modul
3. Bildgebung-Akte mit Tibetisch-Deutung
4. 4 Berufs-Cockpits (Therapie/Sozial/Erziehung/Ehrenamt) + 10 Sub-Routes
5. Konferenz-Modul + Hauswirtschaft + Heilerziehung Cockpits
6. MD-Begutachtungs-Workflow (NBA) + Klient-Notiztafel + Beitritts-Wizard
7. 5 weitere Klient:innen mit voller Bildgebung + anatomische SVG
8. 23 echte Imaging-PNGs aus Asset-Pipeline
9. **20 Klient:innen-Roster + Care-Team-Mapping + MeineKlienten**
10. **`/netz` Echtzeit-Komplettübersicht als neuronales Netzwerk**
11. **Cross-Profession-Inbox in 5 Cockpits** (Übernehmen/Erledigt/Delegieren · KPI · Status-Filter)
12. **Konferenz Live-Mode** (Notizen auto-save · Agenda-Status · Beschluss-Composer · Live-Protokoll)
13. **Supabase-DB live** — Schema + 12 Klient:innen + DB-Driver mit Seed-Fallback + `/admin/db-status`
14. **25 Demo-Assets** ausgeliefert (Block 13–17) + `/warum` Marketing-Page + `/notfall` Stub mit Eskalations-Kette
15. **Auth-Story komplett angelegt** — Schema + UI für 8 Provider + 12 Rollen + Echtheits-Verifikation (AUTH_SETUP.md)
16. **Klartext-Begleiter** in Anamnese eingebaut (4 Berufs-Header), Inbox-KPI-Tiles bekommen die 4 Watercolor-Icons, Notfall-Puls-Loop läuft hinter dem SOS-Knopf
17. **Google-Login live** — `@supabase/ssr` integriert, OAuth-Flow funktional via `/registrieren/start` + `/auth/callback`, Email-Signup als Fallback
18. **Demo-Modi parallel zur echten Auth** — DB-Schema (`demo_mode`-Enum: real/viewer/superuser/tester), `/registrieren/demo` Anonym-Signin, DemoBanner mit Modus-Indikator + Session-Countdown, Middleware mit Tester-Session-Loss
19. **Strategie + Roadmap-Docs** — STRATEGIE_LIVE.md (Reife-Stufen, 4 Phasen zum Pilot, Top-3-Engpass) · ASSETS_LIVEDEMO_2.md (38 Assets Block 19-24) · AUDIT_DEADLINKS.md · TECH_ROADMAP.md
20. **Sub-Routes komplettiert** — `/hauswirtschaft/{einkauf,kochen,reinigung}` + `/heilerziehung/{teilhabe,bildung,tagesstruktur}` + `/anmelden` + `/kasse/{eau,krankengeld,hkp}` (alle Dead-Links aus dem Audit gefixt)
21. **36 weitere Assets eingebaut** (Block 19-24): Auth-Hero + 3 Vertrauens-Tiles, 3 Demo-Modi-Stills + 3 Loops, 6 Sub-Route-Header, 5 Treuhand-Visuals, 7 Compliance-Stills, 5 Onboarding-Tour-Loops vertikal
22. **`/treuhand`** — Stripe-Connect-Modul-Stub mit Drei-Schritt-Geld-Fluss (Eingang/Sperrfrist/Auszahlung), 4-%-Verteilungs-Diagramm, Phase-2-Implementierungs-Reihenfolge
23. **`/compliance`** — DSGVO + BSI + Audit-Log-Story mit 11 Punkten nach Status sortiert (umgesetzt/in_arbeit/geplant/blocker), Audit-Log-3-Zustände-Erklärung
24. **`OnboardingTour`-Komponente auf Startseite** — 5 vertikale 12-s-Loops zeigen typische Plattform-Momente (Klient-Self-Booker · Pflege-Schichtplan · Konferenz · Beitritt · Notfall)
25. **Treuhand-Fluss-Loop** läuft als sanfter Hintergrund auf `/treuhand` mit Caption-Overlay — macht den Geld-Fluss visuell lebendig
26. **Auth-aware Cockpits angefangen** — `lib/auth/active-user.ts` mit `getActivePersona()` (Auth · Persona-Cookie · Default), `requireWriteAccess()`-Guard. **Pflege + Admin** lesen jetzt Auth wenn vorhanden, zeigen den eingeloggten Display-Namen + "eingeloggt"-Subtitle. `/profil` hat eine Auth-Status-Card mit Modus-Indikator + Logout-Button.
27. **Modulare Komponenten-Library** (von Designer-Sub-Agent geplant) — `HeroBanner` (split/tall/wide mit Loop-Overlay), `AssetCard` (Bild als Background statt klein-Icon), `AccentCard` (3px-Stripe-Pattern), `SectionHeader` (Eyebrow+Titel+Lead), `MediaSplit` (alternierendes Bild-Text-Layout), `SmoothReveal` (CSS-only IntersectionObserver-Cascade). `lib/design/role-theme.ts` zentralisiert Rollen-Farben.
28. **Treuhand refactored** — Hero auf full-bleed `tall`-Variante mit Treuhand-Loop als hover-Overlay, Drei-Schritt auf `AssetCard` mit echten Bild-Größen statt gequetschten 4:3-Tiles, Ausschüttungs-Diagramm via `MediaSplit` mit Akzent-Glow. SmoothReveal-Cascade beim Scrollen.
29. **OnboardingTour Smooth-Reveal** — vertikale Loops blenden mit 80ms-Versatz beim Scrollen ein statt alle gleichzeitig. Hover-Glow als 2px-Akzent unter jeder Karte.
30. **KlartextBegleiter höher** — von 80px-Strip auf 16:5-aspect-Ratio (Audit-Befund: 1600×600-Komposition wurde gequetscht).
31. **Audio-Layer Phase B aktiv** — Voice-IDs für Dennis (`wcqN36SUOZ0EhToc2OIu`) + Lana (`ZgahlWh5FVSG7MFjZwPE`) in `lib/audio/voices.ts` mit Kontext-Mapping. **12 Audio-Files** generiert (3 System-Sounds + 4 Klartext-Begleiter + 5 Onboarding-Voice-Overs). `SosButton` mit 3-Stage-Animation, `KlartextBegleiter` mit "Lana lesen lassen"-Knopf, `OnboardingTour` mit Voice-Knopf pro Karte, `AudioMuteToggle` in /profil.
32. **Auth-aware Cockpits Phase 2 komplett** — alle 12 Cockpits nutzen `getActivePersona()` + `userPropsAus()`-Helper. Ohne Login: Demo-Personas wie bisher. Mit Login: Display-Name + "eingeloggt"-Subtitle aus Auth, Demo-Daten-Bridge über `demoPersonId`.
33. **OAuth-Origin-Bugfix** — `lib/auth/actions.ts` erkennt jetzt 0.0.0.0/127.0.0.1/IPv6 als lokale Hosts und nutzt http statt https. Behebt den "Unable to exchange external code"-Fehler beim lokalen Testen auf 0.0.0.0:3000.
34. **Verifizierungs-Pipeline funktional** — Storage-Bucket `verifizierungen` in Supabase mit RLS (User uploadet in eigenen Folder, service_role pruft). `lib/auth/verification-upload.ts` mit `reicheVerifikationEin()` (validiert Pflicht-Felder, validiert Datei-Größe + MIME, uploaded an Storage, inserted in `verifications`-Tabelle). `/registrieren/verifizieren` ist jetzt echter File-Upload-Form, nicht mehr Stub. Pflicht-Login wird gecheckt. **`/admin/verifikationen` Pruefer-Seite** mit KPI-Tiles (eingereicht/in_pruefung/verifiziert/abgelehnt), Cards pro Verifikation mit Datei-Liste + Text-Felder, Aktions-Knöpfe (in Prüfung / verifizieren / ablehnen mit Begründung). Phase 1: User sieht via RLS nur eigene; Phase 2: Pruefer-Role/Edge-Function für Cross-User-Lese-Zugriff.

Build clean, ready to push. **76 Routen.**
