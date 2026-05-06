# Release · Preview Alpha 0.9 · v0.12.0

**Date:** 2026-05-06
**Codename:** "Eine Notiz, viele Sprachen"
**Branch:** main · `e629782` (vor diesem Push) → final-`HEAD` nach Merge

---

## Was diese Alpha bringt — gegenüber v0.11.0

### Genossenschafts-Modell als Code

- **Solidar-Topf** ([/genossenschaft/solidartopf](apps/web/app/genossenschaft/solidartopf/page.tsx))
  Krankheits- und Verdienstausfall-Schutz aus dem Plattform-Cut, kollektiv nach Mondragon-Vorbild. Tag 1–6 zu 100 %, Tag 7–42 zu 70 % parallel zum gesetzlichen Krankengeld. Caps: 3.500 € pro Claim, 8.000 € pro Mitglied/Jahr, 30 Krankentage/Jahr. Reserve-Quote-Schutz: Topf darf nicht unter 30 % der Lifetime-Zuflüsse fallen.
  **Auto-Claim**: Krankmeldung erstellt automatisch einen eingereichten Claim — kein zweiter Antrag.
  Sustainability-Math im Doc: bei 5k €/Jahr Zufluss nur ~6,7 Schadensfälle gedeckt → Empfehlung Plattform-Cut auf 5 %.

- **Genossenschafts-Pool** ([/genossenschaft/pool](apps/web/app/genossenschaft/pool/page.tsx))
  Arbeitsamt-Ersatz mit KI-Match-Score, Bewerbungs-Lifecycle (eingegangen → in_pruefung → zugesagt | abgesagt mit Status-Icons). Vergleich „Bundesagentur 42 Tage Wartezeit vs Pool 6 Tage" prominent auf der Page.

### KI als Schnittstelle zwischen Berufen

- **`KiBerufsBruecke`** mit **17 Quell-Berufen** + **11 Ziel-Berufen** (klient/pflege/arzt/therapie/sozialarbeit/heilerziehung/ehrenamt/hauswirtschaft/erziehung/apotheke/lead). Eingebaut auf `/ki`-Showcase, Konferenz-Detail-Page, Station-Cockpit unter letzter Chat-Nachricht.

- **`/ki`-Showcase** mit 4 Demo-Sektionen: MRT-Befund, Wunde, Konferenz-Notiz + neuer KI-Brücke (alle 11 Ziel-Berufe). Plus **Lana-im-Anruf-Demo** (Sprint-3 Wow-Effekt aus STRATEGIE_TEAM_WOW.md): klingelnde Avatar-Bubble, 7 Transcript-Stages, Lana-Audio, Auto-Auflegen.

### Station-Cockpit · gemeinsame Live-Sicht

- **`/station/[klientId]`** ([app/station/[klientId]/page.tsx](apps/web/app/station/%5BklientId%5D/page.tsx))
  Live-Chat-Surface mit Polling 5 s (Phase-2 Realtime), Vitalwerte erfassen, Foto-Upload mit Auto-Chat-Eintrag, gemeinsame Akte. Discoverability über `MeineKlienten`-Component → wirkt automatisch in allen Beruf-Cockpits, die `MeineKlienten` nutzen (pflege/therapie/heilerziehung/hauswirtschaft/ehrenamt).

### Profil-System · der Mensch hinter dem Beruf

- Bio · Lebensmotto · Hobbys · **14 Sprachen mit Niveau** (inkl. Gebärdensprache, Niveau-Icons mutter/verhandlung/alltag/grund) · Lebensziele · typischer Tag · Erreichbarkeit
- **`ProfilbildUpload`** mit Drag&Drop + Client-Resize 512 px + Datei-Picker
- **`PreferencesPanel`** mit Sprache (DE/EN), Audio Lana/Dennis (mit voice-on/off-Icon + aria-pressed), Klartext-Auto, Push, E-Mail, Schicht-Erinnerung, **Larger-Print-Mode** (18 px Body via `data-large-print`-Attribut)

### Externe API v0.1 Phase-0.1

- **`POST /api/v1/oauth/token`** — client_credentials-Grant
- **`GET /api/v1/Practitioner/me`** — FHIR-R4-Practitioner mit Shalem-Extensions
- **`GET /api/v1/ShalemPoolStelle`** — FHIR-Bundle (searchset) der offenen Pool-Stellen
- **`/entwickler`** öffentliche Developer-Doc mit curl-Beispielen
- **`/admin/api-clients`** Stationsleitung-Sicht der 4 registrierten Demo-Clients
- 4 Demo-Clients seeded: AOK Bayern · Diakonie Augsburg · Apotheke am Markt · Charité Inst. für Med. Informatik
- Volle v1.0-Spec: [docs/API_EXTERNAL.md](docs/API_EXTERNAL.md) — 9 FHIR + 8 Shalem-Resources, 10 Webhooks, 6 Integrations-Szenarien, Pricing-Modell

### Accessibility (für Sehbehinderte + Blinde)

- **`GlobalLiveRegion`** ([components/GlobalLiveRegion.tsx](apps/web/components/GlobalLiveRegion.tsx)) mit `polite` + `assertive` aria-live-Regionen, exportierte `announce()`-Funktion via Custom-Event-Bus
- Skip-Link „Zum Inhalt springen"
- Kontrast-Tokens dunkler: `--fg-mute` 7:1 AAA, `--fg-soft` 4.6:1 AA
- `prefers-contrast: more`-Support (Browser-Hochkontrast-Modus → noch dunklere Tokens + 17 px Body)
- `SosButton` ruft `announce("assertive")` pro Eskalations-Stage
- 5 Form-Inputs in `VerordnungsAnfrageForm` mit aria-label
- `MedikationsListe` div→role=button + Enter/Space-Keyboard
- Body-Default 16 px / 1.55 line-height, Larger-Print-Mode 18 px / 1.6

### HauptMenu-Konsolidierung

- 4 Cluster → **6 thematische Cluster** (Empfänger / Pflege-Versorgung / Gesundheits-Partner / Genossenschaft / Plattform-Sichten / Werkzeuge)
- **Accordion** mit smooth `max-height` + `opacity`-Animation (300 ms ease-out)
- Default-offen: nur die Sektion mit dem aktuellen Pfad
- Aktiv-Indikator (Punkt + accent-Farbe) im Sektion-Header
- Item-Counter pro Sektion · `tabIndex=-1` für collapsed-Items (Keyboard-Tab-Hygiene)

### Modular-Refactor nach PLAN_MODULAR

- **6/7 Marketing-Pages** refactored: treuhand · warum · notfall · compliance · registrieren · landing
- Tier-1-Primitives: AccentCard · HeroBanner · SectionHeader · MediaSplit · SmoothReveal
- Tier-2-Primitives: StatTile (Count-up) · NumberedList (3 Varianten) · BulletList (4 Marker) · Rainbow (Wrapper)
- HeroBanner-Bottom-Gradient verstärkt für Text-Lesbarkeit auf farbigen Watercolor-Heros

### Asset-Block 37–43 (20 neue Assets)

- 3 Heros: header-solidartopf · header-pool · header-ki-bruecke (jeweils 16:9, 2752×1536)
- 4 Loops: topf-fluss · ki-bruecke-pulse · atmo-begleitung · atmo-bestatter
- 13 Icons: 5 Greenscreen-keyed via sharp-Pipeline (topf-schutz, krankenschutz, match-pool, sprache-alltag, sprache-grund) + 8 direkt nutzbar (bewerbung-eingegangen/pruefen/zusage, voice-on/off, bruecke-uebersetzung, sprache-mutter/verhandlung)

---

## Wovon diese Alpha NICHT überzeugt (ehrliche Lücken)

Aus [docs/PLAN_EVALUATION.md](docs/PLAN_EVALUATION.md) — strukturelle Pilot-Blocker:

1. **Persistenz** — alles in-memory mit Seed. Phase-2 Supabase-Migration steht aus. Mit jedem Server-Restart sind neue Daten weg.
2. **Auth-Provider** — Google live, alle anderen Stub. Für Pilot-Kunden zu wenig.
3. **Tests** — 1 Test-Datei (`lib/match/__tests__/engine.test.ts`). Keine Integration-/E2E-Tests.
4. **TI-Konnektor** — gematik-Pflicht ab Dezember 2026. Heute Stub. Entscheidung Q3: Famedly-Andock oder selbst zertifizieren.
5. **DSGVO-FA + AVVs** (Art. 28/35) — extern, nicht gestartet. Vor Pilot-Vertrag Pflicht.
6. **Externe API** — Phase-0.1 da (3 Endpoints), aber kein Auth-Secret-Hashing, keine echten Webhooks-Outbound, keine Rate-Limits enforced.

→ **Heute ist kein Pilot-Vertrag unterzeichenbar.** Demo überzeugt; Pilot-Reife braucht 5–10 Eng-Tage extern (DSGVO) + ~3 Wochen Persistenz/Tests.

---

## Empfehlung für die nächsten 30 Tage

| Rang | Aufgabe | Wirkung | Aufwand |
|------|---------|--------|---------|
| 1 | DSGVO-FA + AVV-Templates · extern starten | hoch · Pilot-Block | 5 Tage extern |
| 2 | API Phase-0.2 (mTLS + Coverage + krankmeldung-Webhooks) | sehr hoch · Pilot-Verkauf | 7 Tage |
| 3 | A11y top-15 abarbeiten | mittel · Marke | 2 Tage |
| 4 | Asset-Block 44 (Profilbild-Fallbacks) generieren | mittel · Onboarding | 1 Tag |
| 5 | Persistenz-Pfad zu Supabase planen + erste Domain migrieren | hoch · Pilot-Block | 5 Tage |
| 6 | TI-Andock-Entscheidung treffen + Famedly-Kontakt | strategisch | 1 Tag Sondierung |

---

## Repo-Stand bei Release

- 11 Top-Level-Routes ergänzt seit v0.11
- 27 neue Components
- 7 neue lib/-Domains (api, station-cockpit, solidartopf, profile, pool, plus Erweiterungen)
- 7 neue Doks: PLAN_EVALUATION · API_EXTERNAL · ASSETS_NEW_FEATURES · ASSETS_ALPHA_09 · RELEASE · plus Erweiterungen
- 20 neue Assets, 0 broken Asset-References
- 0 broken Internal-Links (Audit 2026-05-06)

**Hostinger-Deploy** zieht aus `main` — sobald dieser Commit gemergt ist, läuft die Alpha auf shalem.de.
