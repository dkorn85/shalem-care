# Shalem Care

> שָׁלֵם — vollständig, heil, im Frieden.
> Eine offene Plattform für Pflege, Betreuung und alle sozialen Berufe — gemeinwohlorientiert, FHIR-nativ, genossenschaftlich getragen.

## Status v0.11.0 — KI-Pflegedoku + Asset-Integration

Zwei zusammenhängende Brocken:

**1. KI-unterstützte Pflegedokumentation nach SGB XI § 113b (Strukturmodell SIS).** Pflegekräfte schreiben rohe Beobachtungen, der KI-Assistent strukturiert sie MDK-prüffest in den Standard-Aufbau: SIS-Themenfeld klassifiziert, Risiko-Marker erkannt (11 Typen), Abweichungs-Erkennung für Berichteblatt-Pflicht, Maßnahmen-Vorschläge nach DNQP-Expertenstandards. Provider abstrahiert: DeepSeek-Default (~0,1 ct pro Eintrag), Mock-Fallback ohne API-Key, Mistral und Anthropic vorbereitet. Volle Datenschutz-Doku in `docs/AI_INTEGRATION.md` mit DSGVO-Empfehlungen, Anbieter-Vergleich, Kosten-Schätzung pro Einrichtung. Berufsspezifische System-Prompts für Pflege (SIS), Heilerziehung (ICF/BTHG), Sozialarbeit (Hilfeplan).

**2. Asset-Integration aus den ASSETS_v2.md-Prompts.** Drei Hero-Videos (Hände-Übergabe, Sonne durchs Fenster, Wegmarkierung) auf der Landing eingebaut, fünf Pflegegrad-Icons mit Tinting in Klient-Sicht und Erlös-Page, Confetti-Visual als Success-Indikator nach Anfrage und Bewertung, Empty-State-Visual im Marktplatz, neue Datenschutz-Page mit Keys-Visual, Welcome-Illustration in eigener Genossenschafts-Sektion auf der Landing, Skill-Profil-Visual auf der überarbeiteten Profil-Page.

## Funktionsumfang

- Landing (`/willkommen`) mit Hero-Loop und Genossenschafts-Erklärung
- **Datenschutz (`/datenschutz`) — neu in v0.11**
- Pflegekraft-Sicht (`/`) mit "Nächster Dienst" + Maps + Monats-Soll
- Klient-Sicht (`/klient`) mit Pflegegrad-Icon im Header
- Klient-Bewertung (`/klient/bewertung`)
- Klient-Anfrage (`/klient/anfrage`) — Self-Booking
- Profil (`/profil`) mit Reputation und Skill-Visual
- Tausch-Markt (`/tausch`)
- Träger-Admin (`/admin`)
- KI-Disposition (`/admin/disposition`)
- Genehmigungen (`/admin/genehmigungen`)
- Team-Übersicht (`/admin/team`)
- Dienstplan (`/admin/dienstplan`)
- Zahlungen (`/admin/zahlungen`) mit Stripe-Connect
- Erlös (`/admin/erloes`) bis Person und Klient
- **Dokumentation (`/admin/dokumentation`) — neu in v0.11**
- **Dokumentation Detail (`/admin/dokumentation/[klientId]`) — neu in v0.11**
- Auswertung (`/admin/auswertung`)
- Aktivität (`/admin/aktivitaet`) mit Undo
- System-Terminal Bundes-Ebene (`/system`)
- System-Terminal Bundesland (`/system/[bundeslandId]`)
- System-Terminal Einrichtung (`/system/[bundeslandId]/[einrichtungId]`)
- Bias-Audit-Reports (`/system/audit`)
- Mobile Bottom-Nav für alle drei Rollen

## Schnell ausprobieren

```bash
git clone https://github.com/<dein-handle>/shalem-care.git
cd shalem-care
cp .env.example .env
docker compose up -d
cd apps/web
npm install
npm run dev
```

Routes für die Schlüssel-Demos:

- http://localhost:3000/admin/dokumentation — Klienten-Liste mit Doku-Status
- http://localhost:3000/admin/dokumentation/klient-hr — Verlauf + KI-Assistent für Helga Reinhardt
- http://localhost:3000/admin/dokumentation/klient-wb — Wundverlauf-Demo (Wilhelm Brand, Diabetes)
- http://localhost:3000/datenschutz — DSGVO-Übersicht
- http://localhost:3000/willkommen — Landing mit allen Visuals

Ohne `DEEPSEEK_API_KEY` läuft der Mock-Provider — die App ist voll bedienbar, KI-Antworten sind deterministisch.

## KI-Setup

```bash
# .env
DEEPSEEK_API_KEY=sk-...
SHALEM_AI_PROVIDER=auto   # default; nutzt DeepSeek wenn Key gesetzt, sonst Mock
SHALEM_AI_MODEL=deepseek-chat
```

API-Key auf https://platform.deepseek.com/ holen. **Wichtig:** DeepSeek-Standard-Endpoint hostet außerhalb der EU. Für echte Patientendaten → Mistral EU oder Anthropic via AWS Bedrock Frankfurt. Komplette Empfehlung in `docs/AI_INTEGRATION.md`.

## Tests

```bash
cd apps/web
npm run test:match    # 20 Smoke-Tests Match-Engine
npm run type-check    # TypeScript clean
npm run build         # 28 Routes
```

## Doku

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — technische Architektur
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — Phasen-Plan
- [`docs/AI_INTEGRATION.md`](./docs/AI_INTEGRATION.md) — **KI-Provider-Setup, DSGVO, Kosten — neu in v0.11**
- [`docs/ASSETS.md`](./docs/ASSETS.md) — Asset-Prompts v1
- [`docs/ASSETS_v2.md`](./docs/ASSETS_v2.md) — Asset-Prompts v2
- [`docs/PERSISTENCE.md`](./docs/PERSISTENCE.md) — Storage-Migration
- [`docs/PAY_LAYER.md`](./docs/PAY_LAYER.md) — Stripe-Connect-Setup
- [`docs/MATCH_ENGINE_SPEC.md`](./docs/MATCH_ENGINE_SPEC.md) — Match-Engine Phase 1.0

## Lizenz

AGPLv3 — siehe [LICENSE](./LICENSE).

---

Teil des [Merkaba Project](https://merkabaprojekt.de) — Dennis Reuter, 2026.
