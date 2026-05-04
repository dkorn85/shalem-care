# Persistierung — Migration Guide

## Status

Die App unterstützt zwei Storage-Driver, gewählt über die Env-Variable `SHALEM_STORE`:

| Driver | Wann | Notwendig |
|--------|------|-----------|
| `memory` (default) | Lokales Dev, Demo, Pitch | nichts |
| `medplum` | Pilot, Production | laufender Medplum-Server |

Beide implementieren das `SwapStore`-Interface aus `lib/swap-store.ts`. Die Wahl passiert beim Start im Factory-Pattern.

## In-Memory (default)

Was du bisher kennst — Daten leben im Server-Memory, beim Restart weg, beim ersten Aufruf wird `seedOnce()` aus `lib/seed.ts` triggered und befüllt mit den 5 Demo-Personen plus 9 Slots plus 3 Offer-Demos.

Keine Konfiguration nötig:

```bash
npm run dev
```

## Medplum FHIR-Server

Was Pilot und Production brauchen — Daten liegen in einem echten FHIR-R4-Server, persistent, multi-instance, audit-fest.

### Setup

```bash
# 1. Medplum + Postgres starten (docker-compose.yml ist im Repo)
docker compose up -d

# 2. Initialer Admin-Login bei http://localhost:8103
#    Default: admin@example.com / medplum_admin

# 3. Client-Credentials erzeugen (im Medplum-Admin-UI):
#    Project Settings → Client Applications → New Client
#    Notiere clientId + clientSecret

# 4. .env anpassen:
SHALEM_STORE=medplum
NEXT_PUBLIC_MEDPLUM_BASE_URL=http://localhost:8103/
MEDPLUM_CLIENT_ID=<deine-id>
MEDPLUM_CLIENT_SECRET=<dein-secret>

# 5. App starten
npm run dev
```

Beim ersten Start mit `SHALEM_STORE=medplum` und leerem Server wird `seedOnce()` einen FHIR-Bundle mit 5 Practitioners + 9 Slots + 3 Tasks per `POST /fhir/R4/` einspielen. Beim zweiten Start sieht `isSeeded()` dass schon Practitioners da sind und überspringt.

### Datenmodell-Mapping

| Domain-Type | FHIR-Resource | Anmerkungen |
|-------------|---------------|-------------|
| `Person` | `Practitioner` | Initialen, Tarifgruppe, Rolle als Extensions |
| Schichten | `Slot` | mit `ShalemShift`-Profile (siehe `lib/fhir.ts`) |
| Slot-Ownership | Extension `https://shalem.care/fhir/slot-owner` mit Practitioner-Reference | nicht ideal — eigentlich gehört das in eine Schedule-spezifische Resource, aber für Phase 1 simpel |
| `SwapOffer` | `Task` mit `code = shift-swap-offer` | State Machine wird auf Task-Status gemappt, History in Extension |

### Status-Mapping zwischen SwapState und Task.status

| SwapState | Task.status | Bemerkung |
|-----------|-------------|-----------|
| `draft` | `draft` | nicht im Marktplatz sichtbar |
| `open` | `ready` | offen, wartet auf Annahme |
| `matched` | `in-progress` | jemand hat angenommen, wartet auf Lead-Approval |
| `approved` | `in-progress` | Lead hat bestätigt — Task läuft bis zur Schichtdurchführung |
| `completed` | `completed` | Schicht durchgeführt |
| `rejected` | `rejected` | Lead hat abgelehnt |
| `withdrawn` | `cancelled` | Anbieter hat zurückgezogen |

Die genaue State Machine bleibt im `SwapState`-Enum erhalten und wird über die `swap-state`-Extension auf der Task-Resource gespeichert — Task.status alleine reicht nicht aus für die Unterscheidung `matched` vs `approved`.

### Bekannte Einschränkungen Phase 1

- **History wird als JSON-Blob in einer Extension serialisiert.** Bei Production muss das in eigene `AuditEvent`-Resources umgezogen werden, sonst skaliert das nicht.
- **Keine Auth-Integration in Phase 1.** Medplum läuft mit Client-Credentials-Flow für die App selbst — User-spezifische Berechtigungen kommen mit Keycloak in Phase 2.
- **Kein Audit-Log** der Match-Entscheidungen — kommt mit Match-Engine-Implementation.
- **Slot-Owner über Extension** ist pragmatisch, nicht best-practice. Alternative wäre eine `Schedule`-Resource pro Person — wird in Phase 2 nachgezogen wenn Mehr-Heim-Setup kommt.

### Migration zurück zu In-Memory (für lokale Tests)

Einfach `SHALEM_STORE=memory` setzen oder Variable löschen. Der Medplum-Server läuft weiter, hat aber keinen Effekt auf die App.

### Reset des Medplum-Servers

```bash
docker compose down -v   # -v löscht das Postgres-Volume
docker compose up -d     # frisch
```

Beim nächsten App-Start läuft `seedOnce()` wieder durch.

## Pflicht-Tests vor Pilot-Setup

1. App mit `SHALEM_STORE=memory` starten — alles funktioniert wie bisher? ✓
2. Docker hochfahren, App mit `SHALEM_STORE=medplum` starten — Seed läuft durch? Practitioners/Slots/Tasks im Medplum-Admin sichtbar? ✓
3. Schicht anbieten in der App — neuer Task in Medplum erscheint? ✓
4. Tausch akzeptieren — Task-Status wechselt auf `in-progress` mit Owner? ✓
5. App neu starten — gleicher State im Marktplatz, kein Reseed? ✓

Wenn alles vier Punkte ✓: Pilotpartner kann installieren.
