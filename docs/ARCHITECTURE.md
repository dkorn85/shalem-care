# Architektur

## Leitprinzipien

1. **FHIR-nativ.** Jedes Domänenobjekt ist eine FHIR-Resource. Wir erfinden keine Parallel-Schemata.
2. **Modulith zuerst, Microservices später.** Ein deploybares Backend, klar geschnittene Module. Wir splitten erst, wenn die Skalierung es zwingend verlangt.
3. **Selbst-hostbar.** Jeder Träger und jede Genossenschaft kann den Stack auf eigener Infrastruktur betreiben. Multi-Tenancy ist möglich, aber nicht zwingend.
4. **Mobile-first PWA.** Pflegekräfte nutzen Smartphones. Native Apps kommen via Capacitor, wenn die PWA-Grenzen erreicht sind (Push, Hintergrund-Sync).
5. **Offline-fähig.** Eine Schicht-App muss im funklosen Keller funktionieren. Service Worker + IndexedDB.
6. **AGPLv3.** Niemand soll diese Arbeit privatisieren können, ohne die Verbesserungen zurückzugeben.

## Komponenten

### Frontend — `apps/web`

Next.js 15 mit App Router, Server Components als Default, Client Components nur wo Interaktivität es verlangt. TailwindCSS für Styling. Die Komponenten unter `components/` sind die UI-Bausteine; eine pro Aufgabe.

### FHIR-Backend — Medplum

Medplum stellt einen vollständigen FHIR-R4-Server bereit (CRUD, Search, Subscriptions, GraphQL). Wir nutzen Medplum als Library und als Server. Authentifizierung läuft über Medplums OAuth-Flow oder vorgelagert über Keycloak.

Reasoning: Wir bauen keinen FHIR-Server selbst. Das ist ein Mehrjahresprojekt mit Compliance-Risiko.

### Identitäts-Provider — Keycloak

Keycloak verwaltet Nutzer, Rollen (Pflegekraft, Stationsleitung, Träger-Admin, Klient, Angehörige:r), Multi-Faktor-Authentifizierung, SSO. Verbindung zu Medplum via OAuth 2.1.

### Schichtplan-Optimierer — Timefold (Phase 2)

Sobald die Schichten manuell durch Stationsleitungen erstellt werden können, kommt der Optimierer dazu. Timefold (vorher OptaPlanner, Apache 2.0) löst das Nurse Rostering Problem mit Constraint-Programmierung.

### Workflow-Engine — n8n oder Temporal (Phase 2+)

Für asynchrone Prozesse: Tausch-Genehmigung durch Stationsleitung, Benachrichtigungen, periodische Plan-Validierung gegen ArbZG.

## Daten-Schicht

### Welche FHIR-Resources?

Phase 1 (dieser Repo):

- `Practitioner` — Person (Pflegekraft, Hilfskraft)
- `PractitionerRole` — Zuordnung Person → Organisation, mit Qualifikationen
- `Organization` — Träger und Stationen
- `Location` — physische Räume (optional)
- `Schedule` — Plan-Container für eine Station/Periode
- `Slot` — einzelne Schicht (mit `ShalemShift`-Profile)

Phase 3 (Klientenakte):

- `Patient` — Klient:in
- `Encounter` — Pflege-Einsatz
- `CarePlan` — Pflegeplan
- `CareTeam` — Pflegeteam
- `Observation` — Vitalwerte, Wundbeobachtungen
- `Procedure` — durchgeführte Maßnahmen
- `MedicationStatement` / `MedicationAdministration`

Phase 4 (Abrechnung):

- `Invoice` — generiert aus `Encounter` + `Procedure`
- `Coverage` — Versicherung
- `Account` — Abrechnungskonto
- DTA-Export (Crosswalk FHIR → § 302 SGB V Format)

### Custom Profile

`ShalemShift` (siehe `packages/fhir-profiles/shalem-shift.profile.json`) erweitert `Slot` um:

- `shift-type` — early / late / night / intermediate
- `tariff` — TVöD-P / AVR-CARITAS / AVR-DIAKONIE / INDIVIDUAL
- `qualification-required` — Coding aus dem Vokabular der Pflegequalifikationen
- `swap-status` — open / matched / approved / withdrawn
- `swap-target` — Reference auf das Slot, mit dem getauscht wird (bei Tausch)

## Sicherheit & Compliance

- **DSGVO** — Datenminimierung, Zweckbindung, Auftragsverarbeitung. Kein Tracking, kein Drittland-Transfer.
- **Sozialgeheimnis (§ 35 SGB I)** — relevant ab Phase 3 (Klientendaten). Strenge Zugriffskontrollen.
- **BSI IT-Grundschutz** — Ziel-Baseline für selbstgehostete Träger.
- **Audit-Log** — jede schreibende Operation auf FHIR-Resources wird in `AuditEvent`-Resources protokolliert.
- **Verschlüsselung** — at-rest (Postgres TDE oder LUKS) und in-transit (TLS 1.3 erzwungen).

## Was wir nicht selbst bauen

- FHIR-Server → Medplum
- Identitätsverwaltung → Keycloak
- Schichtplan-Optimierer → Timefold
- Workflow-Engine → n8n / Temporal
- Postgres, Redis, Object Storage → bekannte Standards

## Was wir selbst bauen

- Domain-spezifische FHIR-Profile (`packages/fhir-profiles`)
- Pflege-spezifische UI (`apps/web/components`)
- Tarif-Logik und Zuschlagsberechnung
- Tausch-Marktplatz-Algorithmus
- DTA-Export für deutsche Kassen-Abrechnung (Phase 4)
- Genossenschafts-Layer: Mitgliedschaft, Stimmrechte, Pool-Buchhaltung
