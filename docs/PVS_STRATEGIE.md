# Shalem Care · PVS-Strategie

**Stand:** 2026-05-07 · **Adressaten:** Strategie + Kreativ + Tech-Lead
**Anspruch:** Eine App, die alle Pflege- und Sozial-Berufe vollständig betreibt — Praxisverwaltung, Doku, Abrechnung, Terminkoordination, Audit-konform — und sie über ein gemeinsames FHIR-Backend miteinander verzahnt.

---

## 1 · Was wir nicht sind, was wir werden

**Heute:** Cross-Beruf-Klammer. Vermittlung Pflegekraft ↔ Klient ↔ Träger, Doku-Standardisierung, Genossenschaft. Bestehende PVS (Vivendi, CGM, Theorg) bleiben Trägerseitig im Einsatz, wir docken via FHIR an.

**Morgen:** Vollwertiges PVS pro Beruf. Träger braucht **kein** Vivendi mehr, Arztpraxis kein CGM, Therapie kein Theorg. Eine App auf einer Codebase.

**Differenziator zur Konkurrenz:**

| Aspekt | Vivendi/CGM/Theorg | Shalem |
|---|---|---|
| Datenformate | proprietär, Lock-in | FHIR-nativ, AGPLv3 |
| Interop Berufe | manuell, Excel-Brücken | nativ — Arzt sieht Pflege-Doku, Pflege sieht Therapie-Ziele |
| KI | meist Add-on | Lana/Dennis als Klartext-Übersetzer zwischen allen Berufen |
| Geschäftsmodell | Lizenz + Wartung 20-50 €/User/Monat | 4 % Genossenschafts-Cut auf umgesetztes Honorar |
| Träger-Bindung | langfristig vertraglich | Kündigung → Datenexport FHIR-vollständig |
| TI-Anbindung | jeder Anbieter eigene Konnektor-Lizenz | gematik-Anschluss zentral via Genossenschaft |
| Updates | Wasserfall, Kunde wartet | Continuous, Open-Source |

---

## 2 · PVS-Module · Vollständigkeits-Matrix

Jedes Berufs-Cockpit muss folgende Domänen abdecken, damit es als PVS gilt:

### Kern-Module (alle Berufe)

| Modul | Beschreibung | Status heute |
|---|---|---|
| **Klient/Patient-Stamm** | FHIR-Patient mit Versicherten-Nr, Adresse, Pflegegrad, Hausarzt, CareTeam | ✅ vorhanden |
| **Termine + Kalender** | Schicht/Behandlung/Hausbesuch, ArbZG-Validierung, Tausch | ✅ Pflege/Therapie/Arzt; ❌ Lieferanten |
| **Doku** | Profession-spezifisch: SIS, ICF, ICD-10, GoÄ, HMV | ✅ alle 12 Berufe Diktat-fähig |
| **Abrechnung** | Quartal/Monat, GKV/PKV/SGB-V/SGB-XI/SGB-IX | ⚠️ Stub für alle, Voll-Implementierung fehlt |
| **eVerordnung** | eRezept (gematik), HKP-Verordnung, HMV, Medizintechnik | ❌ überall |
| **Kommunikation** | KIM-Mail TI, eArztbrief, eAU, Messenger intern | ⚠️ Messenger ja; KIM/eAU/eArztbrief offen |
| **Audit + Compliance** | DSGVO, MD-Audit, KonTraG, GenG §38, IfSG §36 | ⚠️ Audit-Log da, Tamper-Evidence-Spalten leer |
| **Mobil + Offline** | Tablet-Fähigkeit, PWA, Offline-Queue | ⚠️ PWA-Manifest da, Offline-Queue fehlt |

### Beruf-spezifische Module

#### 🩺 Pflege-PVS (vs Vivendi · MediFox · Snap)
- ✅ SIS-Doku (Diktat + KI)
- ✅ Tour-Planung
- ✅ DNQP-Assessment-Skalen (Braden/NRS/MNA/Tinetti)
- ❌ **HKP-Verordnungs-Workflow** (Arzt → Kasse → Genehmigung → Pflege → Abrechnung)
- ❌ **Pflegegrad-Antrags-Pipeline** (NBA-Bogen, MD-Termin, Bescheid, Widerspruch)
- ❌ **Wundmanagement-Verlauf** mit Foto-Doku, ICW-konform
- ❌ **Quartalsabrechnung SGB XI § 89** mit Pflegekassen
- ❌ **Hausbesuch-Tour mit GPS** + Tour-Optimierung
- ❌ **Tariflohn-Abrechnung + Steuer-/SV-Meldung**

#### 👩‍⚕️ Arzt-PVS (vs CGM Albis · Medistar · MEDISTAR)
- ✅ Diktat (Verordnungen)
- ✅ Anfragen-Inbox
- ❌ **KBV-Zulassung** (6-18 Mo Zertifizierung, 6-stellige Kosten)
- ❌ **eRezept-Endpunkt** (gematik-Konnektor + KIM-Mail)
- ❌ **EBM/GoÄ-Ziffern** + Quartalsabrechnung KV
- ❌ **DMP-Module** (Diabetes Typ 2, KHK, Asthma, COPD, Brustkrebs)
- ❌ **Impf-Doku** mit eImpfpass-Anbindung
- ❌ **HKS** (Heilkundliche Schulungen, Diabetes-Schulung)
- ❌ **Praxis-Bedarf** (Sprechstunde, Wartezimmer, Online-Termin)

#### 🤲 Therapie-PVS (vs Theorg · Buchner · Vivendi)
- ✅ Diktat (HMV + ICF)
- ❌ **HMV-Codes 2025** vollständig (Heilmittel-Katalog mit ICD-Indikation)
- ❌ **Patient-Vereinbarung + Aufklärung** (Hausbesuch-Pauschale)
- ❌ **Ausfall-Pauschalen** + Erinnerungs-System
- ❌ **GKV-Abrechnung Therapie** (Teilnehmer-Daten, Verordnung-Plausibilisierung)
- ❌ **Praxis-Verwaltung** (Räume, Geräte, Mehr-Therapeut:innen-Plan)

#### 📋 Sozial-PVS (vs connect-ASD · OPEN/Prosoz)
- ✅ Diktat (BTHG · ICF · SMART)
- ❌ **Hilfeplan-Verfahren** vollständig (Aufnahme → ICF → Maßnahmen → Evaluation → Fortschreibung)
- ❌ **BTHG-Abrechnung** (Sozialhilfe SGB XII, Eingliederung SGB IX)
- ❌ **MD-Begutachtung-Pipeline** (Anforderung → Termin → Gutachten → Bescheid)
- ❌ **Gefährdungs-Meldung Kinderschutz § 8a SGB VIII**

#### 🌱 Heilerziehung-PVS (vs VINCI · ProSoz/Klees)
- ✅ Diktat (BTHG-Teilhabe · 6 Felder)
- ❌ **ITP** (Individueller Teilhabeplan) mit ICF-Codes
- ❌ **Tagesstruktur-Doku** (Modul Holzwerkstatt, Garten, Schwimmen) mit Anwesenheit
- ❌ **Förder-Maßnahmen-Verlauf** mit Evaluations-Intervallen
- ❌ **Ein­glie­der­ungs­hilfe-Abrechnung** SGB IX

#### 🍲 Hauswirtschaft-PVS (kein etablierter Konkurrent)
- ✅ Diktat (Speisen + Hygiene + Vorrat)
- ❌ **Speiseplan-Software** mit Bewohner:innen-Vorlieben + Diät + IDDSI-Konsistenz
- ❌ **HACCP-Doku** mit Temperatur-Logbuch
- ❌ **Vorrats-Management** mit Mindest-Bestand + Bestell-Workflow
- ❌ **Reinigungsplan IfSG § 36** als interaktive Checkliste

#### 🌻 Erziehung-PVS (vs Stepfolio · Pixi)
- ✅ Diktat (Lerngeschichten Margret-Carr)
- ❌ **Anwesenheits-Doku** mit Eltern-Push
- ❌ **Kita-Beitrag-Abrechnung** (Geschwister-Rabatt, Geschwister-Bonus)
- ❌ **Eltern-Portal** mit Foto-Galerie + Schließtage + Beobachtungen
- ❌ **Bildungs-Dokumentation** Bayern-/NRW-Bildungsplan

#### 🤝 Ehrenamt-PVS (kein Konkurrent)
- ✅ Diktat (Hospiz-Begleit-Protokoll)
- ❌ **Stunden-Erfassung** für Spendenbescheinigung
- ❌ **Schulungs-Module** mit Zertifikat-Verlauf
- ❌ **Versicherungs-Anbindung** (Berufshaftpflicht-Genossenschaft)

#### 🗂 Stationsleitung-PVS (vs Connext Vivendi · MediFox DAN)
- ✅ Dienstplan-HUD KI-editierbar
- ✅ 3-Zonen-Archiv
- ❌ **Personal-Akte** mit Quali-Verfall + Pflicht-Schulung-Reminder
- ❌ **MD-Qualitätsprüfung-Vorbereitung** (Audit-Pack)
- ❌ **PSI-Indikatoren** (Pflege-Sensitive Indikatoren) für Quartals-Bericht
- ❌ **Tarif-Lohn-Verwaltung** TVöD/AVR/Caritas

#### 💶 Krankenkasse-Modul (kein Konkurrent)
- ✅ Bescheid-Diktat in einfacher Sprache
- ❌ **Bescheid-Workflow** (Antrag → Prüfung → MD-Anforderung → Entscheidung → Versand)
- ❌ **MDK-Schnittstelle** für Pflegegrad-Anträge
- ❌ **Widerspruchs-Verfahren** mit Frist-Tracking
- ❌ **HKP-Genehmigung-Pipeline** (§ 37 SGB V)

#### 🌿 Klient:in-Self-Service
- ✅ Akte-verstehen (KI-Klartext mit Claude)
- ✅ Pflegegrad-Check
- ✅ Tarif-Rechner
- ❌ **Self-Booker** (Klient bucht direkt Pflegekraft aus Pool)
- ❌ **Sachleistung-Wallet** (PG 2+: Sachleistung in Stunden, eigene Pflegekraft-Wahl)
- ❌ **Angehörigen-Portal** mit Live-Update Pflege

#### 🏛 Genossenschaft
- ✅ Pool, Solidartopf, Beitritts-Workflow
- ❌ **Generalversammlung-Modul** mit Online-Abstimmung
- ❌ **Geschäftsanteils-Verwaltung** (Eintragung Genossenschafts-Register)
- ❌ **Quartal-Ausschüttung** mit Steuer-Bescheinigung KAP-INV

#### 🛠 🧽 ♻️ 🥬 Lieferanten-Branchen
- ✅ Onboarding-Hub + GWÖ-Score-Sortierung
- ✅ Diktat (Reparatur/Reinigung/Recycling/Lebensmittel)
- ❌ **Vertrags-Management** (SLA, Reaktionszeit, Pönalen)
- ❌ **Audit-Tagebuch** mit Foto + Pflege-Team-Quittung
- ❌ **CO₂-Reporting** für CSRD-Pflicht ab 2026

---

## 3 · Phasen-Plan

### Phase A · 0-3 Monate · Datenmodell + FHIR-Schicht
**Ziel:** Solides Backbone, das alle Module füttern kann.

- `lib/pvs/abrechnung/` — Stub-Lib mit Quartals-Abrechnung-Datenmodell SGB V/XI/IX
- `lib/pvs/eVerordnung/` — eRezept/HKP/HMV-Verordnungs-Pipelines
- `lib/pvs/termine/` — Cross-Beruf-Termin mit FHIR-Appointment
- Supabase-Migrations für `verordnung`, `termin`, `abrechnung_position`, `tarif_position`
- FHIR-Server-Erweiterung: Practitioner, PractitionerRole, Schedule, Slot, Appointment, Observation, MedicationRequest, ServiceRequest

### Phase B · 3-6 Monate · TI-Anschluss + KIM
**Ziel:** Echte Anbindung an die deutsche Telematik-Infrastruktur.

- gematik-Konnektor (oder Cloud-Konnektor wie ChariteIO, CGM eHealth-Cloud, RISE)
- KIM-Mail (Kommunikation im Medizinwesen) — Pflicht ab 2026 für eAU/eRezept
- ePA-Anbindung (elektronische Patientenakte) — opt-in mit Klient
- HBA + SMC-B Karten-Anbindung
- TI-Messenger gematik (Famedly-Partnerschaft)
- ISiK-Profile (FHIR-Profile für Pflege)

### Phase C · 6-12 Monate · KBV/KZBV-Zulassung Arzt-Modul
**Ziel:** Arzt-PVS darf in zugelassenen Praxen abrechnen.

- KBV-Zulassung Pruefverfahren (PVS muss EBM/GoÄ-konform sein, Quartalsabrechnung erzeugen)
- Disease-Management-Programme (DMP) implementieren
- HKS / eImpfpass / DALE-UV (Berufsgenossenschaft)
- Pilot mit 5-10 Hausarzt-Praxen
- KBV-Audit + Zulassungs-Antrag

### Phase D · 12-24 Monate · Mehr-Beruf-PVS-Reife
**Ziel:** Therapie + Sozial + Heilerziehung als vollwertige PVS.

- HMV 2025-Katalog vollständig
- BTHG-Abrechnung mit Sozialhilfeträgern
- ITP-Workflow Heilerziehung
- Speiseplan-Software (Lebensmittel) mit IDDSI-Anbindung
- HACCP-Logbuch
- Pilot pro Beruf

### Phase E · 24+ Monate · Ausschüttung + Zertifizierung
- KZBV-Zulassung (Zahn, optional)
- DiGA-Zulassung (Digital Health App, Verordnungspflicht via § 33a SGB V)
- ISO 27001 + ISO 13485 (Medical Device wenn relevant)
- Quartals-Ausschüttung an eG-Mitglieder
- Cross-Träger-Daten-Pool (anonymisiert) für Forschung

---

## 4 · Strategie-Team-Sicht (Was-Wer-Wann-Konkret)

### Sofort (Mai-Juni 2026)
- [ ] PVS-Bereitschafts-Matrix als Live-Dashboard im Repo
- [ ] `lib/pvs/`-Skelett mit Type-Definitionen für Abrechnung/Verordnung/Termin
- [ ] Roadmap-Page `/roadmap/pvs` öffentlich
- [ ] Strategie-Gespräch mit gematik-Konnektor-Anbieter (RISE / x.iso)
- [ ] AÜG-Anwalt-Termin (Cross-Träger-Tausch) — bereits pending

### Q3 2026
- [ ] Phase-A-Datenmodell production-ready
- [ ] Erste 3 Pilot-Träger committed (KEM-Wassertor, St. Lukas, APL-Bonn aus dem Demo-Set)
- [ ] gematik-Konnektor-Integration produktiv im Test-Modus

### Q4 2026
- [ ] KIM-Mail live für Pflege-Träger
- [ ] eRezept-Endpunkt für Arzt-Pilot-Praxen
- [ ] Erste Quartalsabrechnung SGB XI § 89 produktiv

### 2027
- [ ] KBV-Zulassung Antrag eingereicht
- [ ] BTHG-Abrechnung Sozial+Heilerziehung pilotiert
- [ ] 30+ Pilot-Träger gewonnen

---

## 5 · Kreativ-Team-Sicht (Wie-Differenzieren-Wir-Uns)

### "Eine App" als Marketing-Anker
- **Heute Markt:** Praxisinhaber muss CGM (Arzt) + Theorg (Therapie) + Vivendi (Pflege) + Excel (HW) parallel betreiben. 5 Logins, 5 Schulungen, 5 Wartungs-Verträge.
- **Shalem:** ein Login, ein Dashboard, eine Wartung, ein Update-Zyklus. **Spar-Argument 30-60 % der Software-Kosten.**

### "Klartext-KI" als Beziehungs-Anker
- Lana spricht zwischen Berufen. Sozialarbeiter:in liest Arzt-Brief in 15-Worte-Sätzen. Klient:in versteht den MD-Bescheid. Pflegekraft schreibt Schicht-Übergabe in 30 s Diktat.
- **Marketing:** "Endlich versteht jeder jeden." Zielgruppe: stressige Schicht-Übergaben, frustrierte Angehörige.

### "Genossenschaft + Open Source" als Vertrauens-Anker
- Code unter AGPLv3, FHIR-export jederzeit, kein Lock-in.
- **Marketing:** "Wenn wir nicht liefern, geht ihr ohne Datenverlust raus." Direkte Antwort auf Vivendi-Migrations-Albträume aus dem Markt.

### "Auslieferungs-Niveau" als Qualitäts-Anker
- DNQP-Standards eingebaut, Braden/NRS/MNA/Tinetti aus dem Cockpit, PSI-Indikatoren für MD-Audit.
- **Marketing:** "MD-Audit kommt? Drück auf 'Audit-Pack' und du hast alles." Zielgruppe: Stationsleitung, Träger-Geschäftsführung.

### Verhindern: PVS-Sterilität
- **Risiko:** PVS-Software ist berüchtigt hässlich, langsam, klick-fest. Kreativ-Team muss sicherstellen, dass die "Ein-App-für-alles" trotzdem die Aquarell-Ästhetik behält.
- **Anker:** Mind. 50 % aller PVS-Cockpit-Pages haben einen Akte-Header (16:9-Aquarell), Persona-Avatar, ruhige Pastell-Palette. Keine Excel-Tabellen-Look-Alikes.

---

## 6 · Kosten + Risiken

### Hard Costs
- gematik-Konnektor-Lizenz: 5-15 k€/Jahr
- KBV-Zulassung Arzt-PVS: 80-150 k€ einmalig + 30 k€/Jahr Wartungs-Pflicht
- KZBV-Zulassung Zahn (optional): 60-100 k€ einmalig
- HBA-Karten + Reader pro Praxis: 200-500 € einmalig
- TI-Konnektor-Hardware (wenn nicht Cloud): 2-4 k€ pro Standort

### Risiken
- **gematik-Spezifikations-Updates** brechen die Anbindung 1-2× pro Jahr — fixe Eng-Ressource für TI-Pflege nötig
- **KBV-Pflicht-Updates** (EBM-Änderungen quartalsweise) — automatisierter Update-Prozess Pflicht
- **DSGVO + Pflege-Daten** — alle Auftragsverarbeitungs-Verträge plus AVV mit jedem Träger
- **Marktwiderstand** — etablierte PVS-Anbieter werden ihre Träger-Verträge nicht freiwillig kündigen lassen (Wettbewerbsklauseln)

### Mitigation
- Cloud-Konnektor (RISE / CGM eHealth-Cloud) statt eigener Hardware — deutlich günstiger
- KBV-Zulassung erst nach Pilot mit 10+ Praxen — sonst zu teuer
- Migrations-Tool aus Vivendi/CGM/Theorg-Exports → FHIR — erleichtert Wechsel

---

## 7 · Was wir jetzt bauen (technisch)

1. `lib/pvs/matrix.ts` — Bereitschafts-Matrix als Daten-Modell
2. `lib/pvs/abrechnung/` — Abrechnungs-Lib (SGB V, SGB XI, SGB IX, GoÄ, EBM, HMV)
3. `lib/pvs/eVerordnung/` — eRezept, HKP, HMV-Verordnung
4. `lib/pvs/termine/` — Cross-Beruf-Termin mit FHIR-Appointment-Format
5. `/roadmap/pvs` — Visualisierung der Module-Matrix + Phasen
6. Anschluss an /roadmap-Hauptseite + SiteFooter "Plattform"-Spalte

Alles als Skelett, real-iteriert über Phase A.

---

**Nächster Mensch-Aktions-Punkt:** dieser Strategie ein 30-Min-Slot mit Träger-Beirat (KEM, St. Lukas, APL) — Feedback zur Modul-Priorität.
