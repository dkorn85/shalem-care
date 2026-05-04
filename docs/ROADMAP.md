# Roadmap

## Nordstern

Eine Plattform, auf der alle aus dem sozialen Bereich arbeiten können — gemeinwohlorientiert getragen von einer Genossenschaft, getrennt von Profit-Logik. Die Pflege ist unser Eintritt, weil dort der Schmerz am größten ist und die Werkzeuge am schlechtesten. Aber das gleiche System trägt langfristig:

- **Pflege** — ambulant, stationär, Tagespflege, Intensivpflege, Hospiz
- **Sozialarbeit** — Schule, Streetwork, Bewährungshilfe, Migrationshilfe
- **Erziehung** — Kita, Hort, OGS, Heim, Internat
- **Beratung** — Sucht, Schuldner, Familie, Schwangerschaft, Erziehung
- **Therapie** — Ergo, Logo, Physio, Psychotherapie
- **Heilerziehungspflege** — Eingliederungshilfe, Werkstätten, Wohngruppen
- **Hauswirtschaft & Betreuung** — alltagsunterstützende Dienste
- **Ehrenamt & Nachbarschaftshilfe** — die heute zwischen den Hilfsystemen rausfallen

Das technische Fundament (FHIR-R4, modulare Architektur) trägt das alles. Die Unterschiede liegen in Profilen, Vokabularen und Abrechnungspartnern — nicht in der Architektur.

## Phasen

### Phase 0 — Fundament (Monat 1–2) — abgeschlossen

- Repo, AGPLv3, Docker-Stack, Next.js + Medplum laufen lokal
- Erste FHIR-Profile als JSON
- UI-Skelett für Dienstplan
- Architektur und Designsprache festgelegt

### Phase 1 — Wedge: Dienstplan + Schichttausch (Monat 3–8) — in Arbeit

**Ziel:** Erste Pflegekraft kann ihren Dienstplan einsehen und eine Schicht zum Tausch anbieten. Erste Stationsleitung nutzt die Genehmigungs-Inbox produktiv.

- [x] State Machine für Tausch-Workflow (open → matched → approved/rejected → completed)
- [x] ArbZG-Validierung (Ruhezeit, Tagesmaximum, Wochenmaximum)
- [x] Tarif-Berechnung Stub TVöD-P mit Zuschlägen Nacht/Sa/So
- [x] Pflegekraft-Sicht: Wochenplan + Marktplatz + Anbieten-Form
- [x] Träger-Admin: Dashboard, Genehmigungen, Team, Plan-Lese-Ansicht, Auswertung
- [ ] Echte Persistierung (Medplum statt In-Memory-Store)
- [ ] Authentifizierung über Keycloak (statt Demo-Toggle)
- [ ] Tarif-Engine vollständig: AVR Caritas, AVR Diakonie, individuelle Verträge
- [ ] Push-Benachrichtigungen via Web Push
- [ ] PWA: Manifest, Service Worker, Offline-Caching der eigenen Schichten
- [ ] Audit-Log für alle plan-ändernden Operationen
- [ ] Pilotpartner-Onboarding mit Schulung

### Phase 2 — Algorithmische Plan-Erstellung + zweiter Wedge (Monat 6–12)

**Parallel zur Pilotierung von Phase 1.**

- [ ] Plan-Erstellung mit Drag &amp; Drop in Admin-Oberfläche
- [ ] Timefold-Integration als separater Service: Vorschläge, die die Stationsleitung anpasst
- [ ] Constraint-Modellierung: harte (ArbZG, Qualifikationsdeckung), weiche (Wünsche, Fairness)
- [ ] Wunsch-Schicht-Eingabe für Pflegekräfte
- [ ] **Zweiter Wedge:** Bedarf-Angebot-Matching für niedrigschwellige Betreuung (§ 45a SGB XI) — geringere regulatorische Hürde, eröffnet ehrenamtliches Engagement

### Phase 3 — Klientenakte + Pflegedokumentation (Monat 12–18)

**Ziel:** Pflegedoku im FHIR-Standard, ersetzt Vivendi PD bei Pilotpartnern.

- [ ] Klientenstamm (Patient + Coverage)
- [ ] Pflegeplan (CarePlan + Goal)
- [ ] Pflegedoku (Encounter, Procedure, Observation)
- [ ] openEHR-Archetypen für Pflege-Konzepte (Wundbeobachtung, Sturzrisiko, Dekubitus)
- [ ] ePA-Anbindung sobald Gematik-Schnittstelle für Pflege spezifiziert

### Phase 4 — DTA-Abrechnung (Monat 18–24)

**Ziel:** Direkte elektronische Abrechnung mit Kranken- und Pflegekassen.

- [ ] Institutionskennzeichen (IK) bei ARGE IK beantragen — pro Träger
- [ ] ITSG-Trust-Center-Zertifikat
- [ ] DTA-Export § 302 SGB V (häusliche Krankenpflege)
- [ ] DTA-Export § 105 SGB XI (Pflegekassen)
- [ ] Vertrag mit Rechenzentrum-Partner (DMRZ, AZH)
- [ ] Korrekturverfahren

### Phase 5 — Ausweitung auf andere soziale Berufe (ab Monat 24)

**Ziel:** Die Plattform öffnet sich für andere Sektoren — gleiche Codebase, neue Profile und Workflows.

- [ ] **Eingliederungshilfe** (SGB IX) — Werkstätten, Wohngruppen, Tagesförderstätten
- [ ] **Jugendhilfe** (SGB VIII) inkl. Jugendamt-Abrechnung
- [ ] **Beratungsstellen** — Sucht, Schuldner, Migration, Schwangerschaft
- [ ] **Erziehung** — Kita, Hort, OGS mit eigenen Schichtmodellen
- [ ] **Therapie** — Ergo/Logo/Physio mit Verordnungs- und Abrechnungs-Workflow nach § 125 SGB V
- [ ] Heimverwaltung (Belegung, Verwahrgelder)
- [ ] Konsolidiertes Reporting für Komplexträger

### Phase 6 — Genossenschaftliche Selbstverwaltung (ab Monat 18, parallel zu Phase 4)

**Ziel:** Die Genossenschaft als rechtlicher und ökonomischer Träger der Plattform funktioniert.

- [ ] Mitgliedschaftsverwaltung (eG-konform, GenG)
- [ ] Anteilszeichnung und Geschäftsguthaben
- [ ] Stimmrechte und General-/Vertreter-Versammlung digital
- [ ] Pool-Buchhaltung: Wer hat was geleistet, wer bekommt welche Dividende
- [ ] Transparenz-Dashboard: Verwaltungskosten als Anteil am Umsatz, in Echtzeit sichtbar
