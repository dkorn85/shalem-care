# Phase 2 · Integration Map

**Stand:** 2026-05-05
**Ziel:** Demo läuft komplett auf in-memory-Stores. Diese Map dokumentiert
für jeden Store den Pfad zu echten Schnittstellen, damit der Wechsel
„demo → real" sauber gemacht werden kann ohne UI anzufassen.

Pattern: alle Stores haben dieselbe Read/Write-API-Form. Phase 2 ersetzt
die in-memory-Implementierung durch einen Driver — UI bleibt unverändert.

---

## Driver-Pattern (vorgeschlagen)

```typescript
// lib/{modul}/store.ts (heute)
export function listX(): X[] { /* in-memory */ }

// → Phase 2:
const driver = process.env.SHALEM_STORE === "medplum" ? medplumDriver : memoryDriver;
export function listX(): Promise<X[]> { return driver.listX(); }
```

Konkret schon umgesetzt für `swap-store` (siehe `swap-store-medplum.ts` /
`swap-store-memory.ts` + Switch in `swap-store.ts`).

---

## Store → Backend-Mapping

| Store | Phase-1 (heute) | Phase-2 Backend | Mapping |
|---|---|---|---|
| **swap-store** (Slots, Personen, Tausch) | `swap-store-memory.ts` | Medplum FHIR | bereits driver-fähig (`SHALEM_STORE=medplum`) |
| **doku/doku-store** (SIS-Doku) | in-memory | Medplum `Observation` (LOINC SIS-Themenfeld) + `Encounter` | Themenfeld → `Observation.code`, Eintrag → `Observation.note` |
| **medikation/store** (Verordnungen + Vergaben) | in-memory | gematik TI · `MedicationRequest` (eRezept) + `MedicationAdministration` | `MedicationRequest.identifier` = eRezept-ID; BtM-Flag → `MedicationRequest.category` |
| **abrechnung/store** (Leistungsmodule) | in-memory | KV-Connect / Pflegekassen-DTA SGB XI Anl. 5 | bereits CSV-Export verfügbar (`lib/kostentraeger/dta.ts`) |
| **krankmeldung/store** | in-memory | gematik eAU · KV-Postfach KIM | `Krankmeldung.eauReferenz` = TI-Trans-ID |
| **verordnung/store** (Anfragen Pflege/Klient → Arzt) | in-memory | KIM-Postfach gematik · `ServiceRequest` | Anfrage → `ServiceRequest`; Antwort → `Communication` |
| **dispo/store** (Roster-Imports) | in-memory | bleibt lokal (Träger-spezifisch) | CSV/JSON-Parser bleibt; Audit-Log → `AuditEvent` FHIR |
| **kostentraeger/store** (Kassen-Vorgänge) | in-memory | Pflegekassen-API (TKK Online, AOK Plus) | DTA bereits erzeugt; Direktversand via SOAP/REST je Kasse |
| **salutogenese/store** (Balance-Checks) | in-memory | `Observation` mit eigenem CodeSystem (Antonovsky-SOC) | bleibt Phase-1 zunächst |
| **selbstbestimmung/store** (Lebensziele) | in-memory | `Goal` FHIR | direkt mappbar |
| **bilanz/store** (Trink/Ess/Vital) | in-memory | `Observation` (LOINC fluid-balance, intake-output) | trivial |
| **chat/store** (Schicht-Chat) | in-memory | bleibt lokal (Realtime-Layer Phase 3) | WebSocket / SSE separat |
| **bem/store** | in-memory | `CarePlan` mit `category: BEM` + `Communication` zu Reha-Trägern | Beteiligte → `CarePlan.author`/`participant` |
| **wiedereingliederung/store** | in-memory | `CarePlan category: rehab` + `Appointment` je Stufe | Standardplan-Generator bleibt; Stufen → `CarePlan.activity` |
| **au-cascade** | reine Funktion | bleibt | input: AU-Beginn aus FHIR `Condition` mit AU-Diagnose |
| **agentur/arbeit-api** | Stub | eXTra/XÖV BA-Schnittstelle · DRV-Reha-Antrag | später, ggf. via Bridge-Anbieter |
| **fortbildung/store** | in-memory | RbP-Punkteübertrag · BÄK-EFN für CME · ZVK/IFK-Punkte | optional `Procedure category: education` für Audit |
| **befund/store** (Imaging/Lab/Gait/Spine) | in-memory | DICOMweb (OHIF-Viewer) · `Observation` (Lab) · `ImagingStudy` (Imaging) | siehe Detail unten |
| **wunde/store** | in-memory | `Observation` (Wound assessment LOINC 72175-3) + `DocumentReference` für Foto | Foto-Upload via Phase-2 Datei-Service |
| **anamnese** | in-memory | `Questionnaire` + `QuestionnaireResponse` | Schemas direkt mappbar |
| **genossenschaft/store** | in-memory | GnoSatz-Register · Stripe Connect Auszahlungen | Anteile-Register als eigenes System |
| **selfbooker/store** | in-memory | Stripe Connect Treuhand · gematik TI VO-Bezug · Pflegekassen Verhinderungspflege | siehe Detail |

---

## Imaging-Detail (Phase 2)

```
Phase 1:                              Phase 2:
ImagingBefund {                       FHIR ImagingStudy {
  modalitaet: "mrt"          →          modality: "MR"
  ansichten: [{ bildUrl }]   →          series[].instance[].endpoint = DICOMweb-WADO-URL
  befundtext                 →          + DiagnosticReport.conclusion
}                                     }
```

**Viewer:** OHIF (Open Health Imaging Foundation) als Embed.
**Backend:** Orthanc oder PACS-Bridge.

---

## Self-Booker-Detail (Phase 2)

Treuhand-Flow:

```
1. Klient bucht         → Stripe-Treuhand reserviert (PaymentIntent capture_method: manual)
2. Pflegekraft sagt zu  → Buchung "gebucht"
3. Leistung läuft       → Pflegekraft markiert "durchgefuehrt"
4. Klient quittiert     → capture; 84 % Pflegekraft, 4 % Plattform, 12 % Pflegekasse-Direktabrechnung
                          (DTA SGB XI Anl. 5)
```

VO-Bezug bei Behandlungspflege:
```
gematik TI → eRezept-Pull mit Versicherten-ID → MedicationRequest
→ wird automatisch zur Buchung verlinkt
```

---

## Auth-Layer (Phase 2)

| Rolle | Phase 2 Identität |
|---|---|
| Pflegekraft | Keycloak + 2FA (TOTP) |
| Arzt | HBA-Karte (gematik) → Keycloak SAML |
| Klient | eGK + PIN (gematik) → Keycloak |
| Stationsleitung | Keycloak + Mandanten-Trennung |
| Krankenkasse | IK-basiert + Client-Cert |

---

## Notification-Layer (Phase 2)

- Web-Push (VAPID) für aktive Schichten + Vertretungs-Anfragen
- KIM-Postfach für ärztliche Kommunikation (gematik)
- SEPA-Mail-Belege bei Genossenschafts-Auszahlung

---

## ENV-Switches für Phase 2

```bash
SHALEM_STORE=medplum          # statt "memory"
SHALEM_TI_KONNEKTOR_URL=...   # gematik TI
SHALEM_KIM_POSTFACH=...
SHALEM_STRIPE_CONNECT_KEY=...
SHALEM_KEYCLOAK_REALM=...
SHALEM_DICOMWEB_BASE=...
SHALEM_BA_EXTRA_ENDPOINT=...
```

Für Demo-Mode bleiben alle leer → in-memory + Mock.

---

## Was bleibt Phase-1?

Nicht alles muss in Phase 2 wandern. Bleiben darf in-memory:
- `dispo/store` (Roster-Imports — Träger-lokal)
- `chat/store` (Schicht-Chat — eigener Realtime-Stack)
- `salutogenese/store` (Balance-Checks — kein FHIR-Standard nötig)
- `selbstbestimmung/store` (mappbar auf Goal, aber niedrige Prio)
- `fortbildung/store` (mappbar, aber RbP/BÄK-Anbindung ist eigenes Projekt)

**Demo-Bereitschaft:** mit `NEXT_PUBLIC_DEMO_MODE=1` zeigt das System Banner +
Persona-Switcher; alle Stores mit Demo-Seeds; sofort vorführbar ohne externe
Abhängigkeiten.

**Switch zu Real:** ENV-Variablen oben setzen; `SHALEM_STORE=medplum` umschalten;
Stores die einen Driver haben switchen automatisch. Stores ohne Driver bleiben
zunächst in-memory (Hybrid-Modus möglich).
