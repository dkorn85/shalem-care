# Shalem Care API · für externe Unternehmen

**Stand:** 2026-05-06 · v0.1-Spec (geplant, nicht gebaut)
**Zweck:** B2B-Schnittstelle für Krankenkassen, Träger, Apotheken, Labore, Arbeitsamt-Schnittstellen, Forschungspartner. Keine direkte Klient-Datenfreigabe — alles läuft über Mitglieder-Einwilligung + DSGVO Art. 6 (1)(a/b/c/f) je Use-Case.

---

## 1 · Strategische Leitplanken

1. **FHIR-aligned**, nicht FHIR-strikt. Wo HL7-FHIR-R4-Resources passen (Patient, Encounter, Observation, Practitioner, MedicationRequest, Coverage, Claim, Schedule), nutzen wir die Schemas. Wo nicht (Genossenschafts-Anteile, Solidar-Topf, Pool-Stellen), eigene Resources mit `Shalem`-Prefix.
2. **Auth: OAuth2 + PKCE** für interaktive Apps · **mTLS + Client-Credentials** für Server-zu-Server. Keine API-Keys ohne Rotation.
3. **DSGVO by Design** — kein Endpoint liefert Klient-Klartext-Daten ohne expliziten Mitglieder-Consent (Art. 6 (1)(a)). Audit-Log-Eintrag pro Request mit `accessed_resource`, `purpose`, `requester_id`.
4. **Versionierung im URL-Pfad** — `/api/v1/...`, breaking changes via neue Major-Version. Phase-2 evtl. `/api/v2/...` parallel laufen lassen.
5. **Rate-Limits** — pro Client-Credentials-Setup: default 60 req/min, Burst 120, Sustained 30. Pro Endpoint-Klasse höhere Limits konfigurierbar.
6. **Webhooks** statt Polling, wo möglich. Outbound mit Signatur-Header (`X-Shalem-Signature: hmac-sha256=...`).
7. **EU-Region only** — alle Endpoints + Webhooks auf shalem.de (Hostinger Frankfurt, Phase-2 → Hetzner Falkenstein). Kein US-Routing.

---

## 2 · Auth-Pfade

### 2.1 OAuth2 + PKCE — interaktive Drittanbieter-Apps
Use-Cases: Apothekensoftware sucht nach offenen eRezept-Verordnungen für ihren Kundenstamm; Träger-Software liest eigene Stellen-Bedarfe; Forschungs-Frontend für anonymisierte Aggregat-Statistiken.

```
GET  /api/v1/oauth/authorize?response_type=code&client_id=...&redirect_uri=...&scope=...&code_challenge=...&code_challenge_method=S256
POST /api/v1/oauth/token        (code → access_token + refresh_token)
POST /api/v1/oauth/revoke
```

**Scopes** (granular, kombinierbar):
- `read:eigene-stellen` — Träger lesen ihre eigenen Pool-Stellen
- `write:eigene-stellen` — neu publizieren / aktualisieren
- `read:erezepte` — Apotheke liest offene eRezepte ihrer Kund:innen
- `write:erezept-status` — Apotheke meldet eRezept eingelöst
- `read:befund-aggregate` — Forschung liest anonymisierte Aggregate
- `read:klient-eigen` — Klient:in liest eigene Akte (Self-Booker-Mode, App-Drittanbieter)
- `read:mitglied-eigen` — Pflegekraft liest eigene Doku, Solidar-Claims, Bewerbungen
- `webhook:subscribe` — Subscribe to Outbound-Webhooks

### 2.2 mTLS + Client-Credentials — Server-zu-Server
Use-Cases: Krankenkasse pollt Krankmeldungs-Stati eigener Versicherter; Bundesagentur für Arbeit (Phase-2) tauscht Pool-Vermittlungs-Quoten; Genossenschaftsbank empfängt Topf-Bilanz-Auszüge.

```
POST /api/v1/oauth/token  (grant_type=client_credentials, client_id, client_secret, scope)
```

Zusätzlich **mTLS-Cert** vom Shalem-Care-eG ausgestellt, gültig 12 Monate, automatische Rotation 30 Tage vor Ablauf.

### 2.3 SMART-on-FHIR (Phase 2)
Für Health-IT-Integratoren: Token aus existierender Krankenhaus-Authority (z.B. KIS-Auth-Server der Charité) wird als Bearer-Token akzeptiert wenn der Issuer in der Trust-Liste ist. Erfordert `iss`-Claim in den JWT-Headern + Mitglieder-Mapping über NPI/IK-Nummer.

---

## 3 · Resource-Endpoints

### 3.1 FHIR-aligned

| Endpoint | Methoden | FHIR-R4-Resource | Scope |
|----------|----------|------------------|-------|
| `/api/v1/Patient/:id` | GET | Patient | `read:klient-eigen` (nur self) ODER spezifischer Care-Team-Token |
| `/api/v1/Patient/:id/$everything` | GET | Bundle | `read:klient-eigen` (nur self) — DSGVO Art. 20 Datenexport |
| `/api/v1/Practitioner/me` | GET, PUT | Practitioner | `read:mitglied-eigen` |
| `/api/v1/Encounter` | GET, POST | Encounter | `read:eigene-stellen` ODER spezifisch |
| `/api/v1/Observation` | GET, POST | Observation (Vital, Schmerz, Wunde-cm²) | `write:vitalwerte` (Care-Team-Token) |
| `/api/v1/MedicationRequest` | GET, POST | MedicationRequest | `read:erezepte` (Apotheke) |
| `/api/v1/Coverage` | GET | Coverage (Krankenkasse, Pflegekasse) | `read:mitglied-eigen` |
| `/api/v1/Claim` | GET, POST | Claim (Solidar-Topf) | `read:mitglied-eigen` ODER `admin:topf` |
| `/api/v1/Schedule` | GET | Schedule (Pool-Stellen, Schicht) | `read:eigene-stellen` |

### 3.2 Shalem-spezifisch

| Endpoint | Methoden | Resource | Scope |
|----------|----------|----------|-------|
| `/api/v1/ShalemAnteil` | GET | Anteils-Status (Anzahl, Wert, Stimmrecht-Eintrag) | `read:mitglied-eigen` |
| `/api/v1/ShalemSolidarClaim` | GET, POST | Solidar-Topf-Claim | `read:mitglied-eigen` (eigen) · `admin:topf` (alle) |
| `/api/v1/ShalemPoolStelle` | GET, POST, PUT | Pool-Stelle | `read:eigene-stellen` · `write:eigene-stellen` |
| `/api/v1/ShalemBewerbung` | GET, POST, PATCH | Bewerbung mit Lifecycle-Status | `read:mitglied-eigen` · `admin:pool` |
| `/api/v1/ShalemKonferenz` | GET | Konferenz-Beschluss (öffentliche Felder) | spezifisch pro Konferenz |
| `/api/v1/ShalemKlartext` | POST | KI-Klartext-Übersetzung | `klartext:invoke` (rate-limited) |
| `/api/v1/ShalemBerufsBruecke` | POST | Beruf-zu-Beruf-Übersetzung | `klartext:invoke` |
| `/api/v1/ShalemAuditLog` | GET | Audit-Log-Auszug der eigenen Mitgliedschaft | `read:mitglied-eigen` |

### 3.3 Aggregate & Statistik (anonymisiert)

| Endpoint | Methoden | Output | Scope |
|----------|----------|--------|-------|
| `/api/v1/aggregate/pool-vermittlung` | GET | quartalsweise Vermittlungs-Quote, ∅ Wartetage | `read:befund-aggregate` |
| `/api/v1/aggregate/burnout-trend` | GET | Δ Burnout-Score letzte 12 Monate | `read:befund-aggregate` |
| `/api/v1/aggregate/krankheitstage` | GET | ∅ Krankheitstage / Mitglied / Quartal | `read:befund-aggregate` |
| `/api/v1/aggregate/genossenschaft-bilanz` | GET | Quartals-Bilanz · auszahlungs-Quote · Solidar-Topf-Saldo | öffentlich (nur Plattform-Cut + Topf-Saldo, nicht pro Mitglied) |

DSGVO-Schutz: alle Aggregate haben **k-anonymity ≥ 5** (kleinster Bin = 5 Mitglieder; bei kleinerer Stichprobe → Endpoint liefert `null` mit `reason: "k_anonymity_unmet"`).

---

## 4 · Webhooks (Outbound)

Konfigurierbar pro Subscription. Empfänger registriert HTTPS-URL + Hashed-Secret. Shalem signiert jeden Request mit `X-Shalem-Signature: hmac-sha256=<hex>`.

| Event | Trigger | Payload | Use-Case |
|-------|---------|---------|----------|
| `krankmeldung.created` | `meldeKrank()` server-action | `{ krankmeldungId, personId, vonDatum, voraussichtlichBis, eauReferenz? }` | Krankenkasse erhält eAU-Vorschau, kann Krankengeld-Antrag voranbereiten |
| `krankmeldung.eau-versendet` | eAU an Krankenkasse versendet | `{ krankmeldungId, ikNummer, transId }` | Krankenkasse bestätigt Empfang |
| `pool.stelle.published` | neue Stelle im Pool | `{ stelleId, einrichtung, region, qualifikation }` | Externe Job-Aggregatoren (z.B. kma-online) verbreiten Stelle |
| `pool.bewerbung.received` | Bewerbung eingegangen | `{ bewerbungId, stelleId, mitgliedId-pseudonym }` | Träger erhält Push, eigene Workflow startet |
| `pool.bewerbung.zugesagt` | Stationsleitung sagt zu | `{ bewerbungId, stelleId, mitgliedId, vertragStart }` | Träger startet Vertrags-Pipeline |
| `solidartopf.claim.created` | Auto-Claim bei Krankmeldung | `{ claimId, mitgliedId-pseudonym, betrag, status }` | Buchhaltung importiert für Quartals-Bilanz |
| `solidartopf.claim.ausgezahlt` | Auszahlung genehmigt | `{ claimId, betrag, ausgezahltAm }` | Bank-API erhält Buchungs-Trigger |
| `konferenz.beschluss` | Konferenz schließt mit Beschlüssen | `{ konferenzId, beschluesse[] }` | Externe Hilfeplan-Träger (DGCC) ziehen Beschluss in eigenes System |
| `klient.akte.erweitert` | neue Datei in Klient-Akte (mit Consent) | `{ klientId, dateiId, typ, hochgeladenVon }` | Hausärztin-Software erhält neuen Befund automatisch |
| `wundverlauf.erfasst` | neues Wundfoto + Fläche-cm² | `{ klientId, wundeId, flaecheCm2, datum }` | Wundzentrum erhält Verlauf für Quartals-Auswertung |

**Retry-Policy**: 3 Versuche mit Exponential-Backoff (10s, 60s, 600s). Nach 3 Fehlversuchen Subscription auto-pausiert + Email an Owner.

**Webhook-Replay**: jeder Event hat `id` + `delivered_at`. Empfänger kann `/api/v1/webhooks/replay/:event_id` abrufen für 90 Tage.

---

## 5 · Konkrete Integrations-Szenarien

### 5.1 Krankenkasse (z.B. AOK Bayern, IK 108310400)

Auth: mTLS + `client_credentials`-Flow, Scope `read:mitglied-eigen webhook:subscribe`.

Flow:
1. Pflegekraft meldet sich krank → `meldeKrank()` läuft
2. Webhook `krankmeldung.created` an `https://aok-bayern.de/shalem-webhook/v1`
3. AOK-System legt Vorgang an, prüft Versicherten-Status
4. Wenn AU > 6 Wochen: Webhook `krankmeldung.krankengeld-antrag-erforderlich`
5. AOK sendet via `POST /api/v1/Coverage` Krankengeld-Bescheid zurück
6. Mitglied sieht Status in `/profil/krankmeldung`

### 5.2 Apotheke (z.B. Apotheke am Markt, IK 308000001)

Auth: OAuth2-Pkce (eigene Apotheker-App authoriziert sich).

Flow:
1. Apotheke pollt `/api/v1/MedicationRequest?einrichtung=ik:308000001&status=active` alle 60 Sek
2. Neue eRezepte (für Klient:innen die der Apotheke ihre Bezugsapotheke gegeben haben) erscheinen
3. Apotheke bestätigt `PUT /api/v1/MedicationRequest/:id/$dispense`
4. Webhook `apotheke.dispensed` an Klient + Pflegekraft

Phase-2: Direkt über TI-Konnektor + gematik-Spec, dann redirected dieser API-Pfad.

### 5.3 Träger (z.B. Diakonie-Werk Augsburg)

Auth: OAuth2-PKCE (eigene Träger-App).

Flow:
1. Träger publisht offene Stelle: `POST /api/v1/ShalemPoolStelle`
2. Genossen-Mitglieder bewerben sich → Webhook `pool.bewerbung.received`
3. Träger-Software priorisiert nach KI-Match-Score (im Body enthalten)
4. Stationsleitung sagt zu: `PATCH /api/v1/ShalemBewerbung/:id` mit `{ status: "zugesagt" }`
5. Webhook `pool.bewerbung.zugesagt` startet bei Träger den Vertragspipeline

### 5.4 Forschungspartner (z.B. Charité Institut für Med. Informatik)

Auth: mTLS + `client_credentials`, Scope `read:befund-aggregate`.

Flow:
1. Quartalsweise Pull `/api/v1/aggregate/burnout-trend?quartal=2026Q2`
2. Aggregierte Statistik (k-anonymity ≥ 5), keine Klartextdaten
3. Forscher publiziert Paper, zitiert Shalem als Quelle
4. **Win-Win**: Genossenschaft bekommt Paper-Erwähnung als Referenz

### 5.5 Genossenschaftsbank (Phase-2)

Auth: mTLS, hauseigener Zertifikats-Issuer.

Flow:
1. Webhook `solidartopf.claim.ausgezahlt` triggert SEPA-Sammelüberweisung
2. Bank meldet `/api/v1/Claim/:id/$confirm-payout` zurück
3. Solidar-Topf-Status `ausgezahlt` → `gebucht`
4. Audit-Log mit Bank-Reference

### 5.6 Bundesagentur für Arbeit (Phase-2 · Optional)

Heute: Pool ist **Ersatz**, nicht Anbindung. Phase-2 könnte aber: Pool-Stellen werden auch über X-API der Bundesagentur sichtbar gemacht für Arbeitssuchende, die noch nicht Mitglied sind. Onboarding-Pfad: über X-API → Mitgliedschaft anbieten → bei Beitritt Anteil zeichnen → Pool-Bewerbung läuft.

---

## 6 · DSGVO-Architektur

### 6.1 Lawful Basis pro Endpoint

| Scope | Art. 6 (1) Lit. | Art. 9 (2) Lit. | Begründung |
|-------|------------------|-----------------|------------|
| `read:eigene-stellen` | (b) Vertrag | — | Träger-Vertrag mit Genossenschaft |
| `read:erezepte` | (b) Vertrag | (h) Versorgung | Apotheker-Beziehung |
| `read:befund-aggregate` | (f) berechtigt. Interesse | (j) Forschung | Aggregierte Daten, kein Personenbezug |
| `read:klient-eigen` | (a) Einwilligung | (a) Einwilligung | Mitglieder-Selbstbedienung |
| `webhook:subscribe` | (b) | — | technische Notwendigkeit |
| Alles mit fremdem Patient-Bezug | (a) Einwilligung pro Klient | (a) explizit | per Onboarding eingeholt |

### 6.2 Data-Minimization

- Webhooks senden **pseudonyme IDs** wo möglich (`mitgliedId-pseudonym`), nicht Klarnamen
- Aggregat-Endpoints liefern keine Werte unter k=5
- `$everything`-Bundle nur für eigenen Patient (nicht Care-Team-Token)
- Wundfotos werden via signed-URL serviert (TTL 5 Min) statt eingebettet

### 6.3 Audit-Log

Jeder API-Request wird in `cockpit_audit_log` geschrieben mit:
- `client_id`, `mitglied_id` (wenn vorhanden), `endpoint`, `method`, `purpose` (aus `X-Shalem-Purpose`-Header), `accessed_resources[]`, `lawful_basis_lit`, `timestamp`, `response_status`.

Mitglied kann via `/api/v1/ShalemAuditLog` eigene Zugriffe einsehen (DSGVO Art. 15).

---

## 7 · Implementations-Phasen

| Phase | Was | Wann | Aufwand |
|-------|-----|------|---------|
| **0.1** | OAuth2-PKCE + 3 Endpoints (`Practitioner/me`, `ShalemPoolStelle`, `ShalemBewerbung`) + 2 Webhooks (`pool.*`) | Q3 2026 | 5 Tage |
| **0.2** | mTLS + `Coverage` + `MedicationRequest` + Webhooks (`krankmeldung.*`) | Q4 2026 | 7 Tage |
| **0.3** | `Patient/$everything` + DSGVO-Audit-Log + Solidar-Topf-Webhooks | Q4 2026 | 5 Tage |
| **0.4** | Aggregate-Endpoints mit k-Anonymity + Forschungs-Pilot | Q1 2027 | 4 Tage |
| **0.5** | SMART-on-FHIR + Charité-Pilot | Q2 2027 | 10 Tage |
| **1.0** | Public Launch + ProductHunt | Q2 2027 | parallel zu 0.5 |

**Total bis 1.0:** ~31 Eng-Tage über 9 Monate. Bei 1.0 Pilot-fähig für 3-5 Krankenkassen + 2-3 Träger + 1 Forschungspartner.

---

## 8 · Pricing-Modell für externe Nutzer

(Vorschlag, vom Vorstand zu beschließen — Mitgliederversammlung-Entscheid Q4)

| Tier | Was | Preis |
|------|-----|-------|
| **Mitglied-Self** | Eigene Daten | kostenlos |
| **Träger** | bis 100 req/min · webhook-subscriptions | 99 € / Monat |
| **Krankenkasse / IK-Holder** | unlimitiert · mTLS | 499 € / Monat (skaliert mit Versicherten-Anzahl) |
| **Apotheke** | bis 60 req/min · eRezept-Pipeline | 49 € / Monat |
| **Forschung (non-profit)** | Aggregate-Endpoints | kostenlos mit Erwähnung in Paper |
| **Forschung (commercial)** | Aggregate-Endpoints | 199 € / Monat |
| **Bank-Anbindung** | Solidar-Topf-Webhooks | inklusive für Genossenschaftsbank-Partner |

Erlöse fließen in den Plattform-Cut → Solidar-Topf-Zufluss steigt → Genossenschaft trägt mehr Krankheitsfälle. **Direkter Nutzen für Mitglieder.**

---

## 9 · Was die API NICHT macht

- **Keine Diagnose-API** — kein Endpoint, der medizinische Urteile zurückgibt. Wir machen Pflege-Workflow, nicht ICD-Klassifikation. Erspart MDR-Klasse-IIa.
- **Keine Patient-Lookup-API ohne Consent** — kein „Suche Patient nach Name + Geburtsdatum". Mitglieder finden ihre eigenen Klient:innen über deren Akte, fremde Apotheker etc. nur über die Patient-Bezugs-Apotheke.
- **Keine globale Klient-Akten-API** — `Patient/:id` außerhalb der eigenen Care-Team-Mitgliedschaft → 403. `$everything` nur für `:id == authenticated_self`.
- **Keine LLM-Pass-through-API** — `ShalemKlartext` ist der einzige KI-Endpoint, der Output kontrolliert (3-5 Sätze, JSON, kein Diagnostic-Talk).
- **Kein Voice-Cloning-Endpoint** — Lana/Dennis-Stimmen bleiben intern. Kein API-Pfad zum Stimmen-Generieren mit fremder Person.

---

## 10 · Sicherheits-Anforderungen für API-Konsumenten

Jeder API-Konsument unterzeichnet vor Token-Issue:
1. **AVV (Auftragsverarbeitung)** nach Art. 28 DSGVO — Standard-Vertrag mit DSB-Genehmigung
2. **Pen-Test-Selbstauskunft** zur eigenen Infrastruktur
3. **TOMs** (technisch-organisatorische Maßnahmen) dokumentiert
4. **Datenpannen-Meldepflicht** binnen 24h an Shalem-Care-eG (parallel zur eigenen Aufsichtsbehörde)
5. **Kein Drittland-Routing** — Daten bleiben in EU. Cross-Border erfordert Standardvertragsklauseln (SCCs) + Risikoanalyse

Bei Verletzung: Token-Sperre + AVV-Kündigung + ggf. Schadenersatz.

---

## Anhang · Beispiel-Request

```http
GET /api/v1/ShalemPoolStelle?region=DACH-Bayern-Schwaben&offen=true HTTP/2
Host: api.shalem.de
Authorization: Bearer <access_token>
Accept: application/fhir+json
X-Shalem-Purpose: traeger-job-aggregation
X-Shalem-Client-Trace: 8fa7c2e4-...
```

```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 6,
  "entry": [
    {
      "resource": {
        "resourceType": "ShalemPoolStelle",
        "id": "stelle-001",
        "meta": { "profile": ["https://shalem.de/fhir/StructureDefinition/PoolStelle"] },
        "typ": "festanstellung",
        "titel": "Pflegefachkraft (m/w/d) · Onkologie",
        "einrichtung": { "display": "Diakonie-Werk Augsburg", "ikNummer": "509400142" },
        "ort": "Augsburg-Süd",
        "region": "DACH-Bayern-Schwaben",
        "qualifikation": ["Pflegefachkraft", "Onkologie-Erfahrung"],
        "verguetung": { "tarif": "TVöD-P_9", "bonus_pct": 18 },
        "matchScore": null,
        "status": "offen",
        "publiziertAm": "2026-05-04T08:00:00Z"
      }
    }
  ]
}
```

---

**Nächster Schritt:** Phase-0.1 (OAuth2 + 3 Endpoints + 2 Webhooks, 5 Tage) starten sobald DSGVO-FA + AVV-Templates vom externen DSB freigegeben sind.
