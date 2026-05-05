# Strategie · Vom Demo-Stand zum Live-Betrieb

**Stand:** 2026-05-05 · Branch `claude/tender-nightingale-f1bb8b`
**Zweck:** Ehrliche Bestandsaufnahme + Roadmap zum echten Pilot-Betrieb mit
realen Pflegediensten. Kein Marketing — nur was wirklich da ist und was
wirklich noch fehlt.

---

## 1 · Wo wir stehen · Reife pro Domain

Stufen: **Demo-Mock** (Fake-Daten, keine Persistenz) · **Funktionaler
Prototyp** (echte Daten, aber unvollständige Workflows) · **Pilot-fähig**
(belastbar mit echten Nutzer:innen, Datenschutz tragbar) · **Produktiv**
(rechtssicher, audit-fähig, skalierbar).

| Domain | Reife | Was ist da | Was fehlt für Pilot-fähig |
|---|---|---|---|
| **Auth** | Funktionaler Prototyp | Google-OAuth live · `@supabase/ssr` · `profiles`/`user_roles`/`verifications` mit RLS · UI für 8 Provider | Datei-Upload Verifikation · Prüfer-Workflow `/admin/verifikationen` · Session-Aware-Cockpits (heute hardcoded) · Middleware geschützte Routen · Apple/Microsoft/Email mit eigenem SMTP |
| **DB** | Funktionaler Prototyp | Supabase Frankfurt · 12 Klient:innen + 3 Einrichtungen + 3 Stationen geseedet · RLS-Policies aktiv · DB-Driver mit Seed-Fallback (`klient/db-driver.ts`) | 21 weitere Stores wandern noch nicht in DB (Personen, Slots, Verordnungen, Wunddoku, Konferenzen, Inbox, Aktivitätsfeed) · Audit-Log-Tabelle fehlt · Backup-Strategie undokumentiert |
| **Cockpits (12 Rollen)** | Demo-Mock | Alle 12 Cockpits + 76 Routen visuell komplett · Persona-Switcher · realistische Fachlogik (NBA, DNQP, AU-Kaskade) | Cockpits lesen `CURRENT_USER_ID`-Konstante statt `auth.uid()` · keine Datenisolierung pro Mandant · keine echten Schreibvorgänge in DB |
| **Cross-Profession-Inbox** | Demo-Mock | Inbox in 5 Cockpits (Arzt/Pflege/Therapie/Sozial/Lead) · Übernehmen/Erledigt/Delegieren · KPI-Tiles | Events nur in `lib/aktivitaet/feed.ts` Memory · keine Persistenz · keine Push-Notifications · keine Audit-Spur |
| **Konferenz Live** | Demo-Mock | Live-Mode mit Auto-Save-Notizen, Beschluss-Composer, Status-Tracker | Notizen nur im Memory · keine Teilnehmer-Authentifizierung · kein Hybrid-Video (Jitsi/Whereby) · Beschlüsse erzeugen keine echten Aufgaben |
| **Klient-Akte** | Demo-Mock | Befunde, Wundverlauf, Anamnese, Medikation, Notizen UI komplett · DNQP-konforme Wunddoku · NBA-Modul vollständig | Imaging nur als statische PNGs, kein DICOMweb · keine Foto-Uploads · keine Versionierung · keine Freigabe-Workflows · kein Sozialgeheimnis-Audit |
| **Marketing** | Pilot-fähig | `/warum` mit Differenzierung · `/genossenschaft/beitreten`-Wizard · `/notfall` Stub · OG-Cards für die meisten Routen | Beitritts-Wizard hat kein SEPA-Mandat-Generator · keine Datenschutz-Erklärung für reale Nutzer · keine AGB · kein Impressum mit Vereins-/Genossenschafts-Eintrag |
| **Compliance** | Demo-Mock | Architektur-Doku mit DSGVO/SGB I/BSI-Bezug · RLS auf allen Tabellen · TLS via Supabase | **Kein DSGVO-Artikel-30-Verzeichnis** · keine AVV mit Supabase unterzeichnet · kein Datenschutz-FA bestellt · kein BSI-Grundschutz-Mapping · kein Pen-Test · kein Incident-Response-Plan |
| **Genossenschafts-Layer** | Demo-Mock | Mitglieder-Register, Anteils-Buchung, simulierte Q1-Ausschüttung, 4%-Plattform-Cut | **Genossenschaft (eG) ist nicht gegründet** · keine Satzung notariell · kein Eintrag im GenReg · Stripe Connect Treuhand fehlt · keine BaFin-Klärung Anteils-Verkauf |

**Gesamt-Einschätzung:** Wir sind im strikten Sinn ein **funktional
ausgereiftes Demo-System mit echtem Auth-Layer und einer ersten echten
DB-Tabelle**. Alles andere ist Inszenierung — gut genug für
Investoren-Pitches und Pilotkunden-Akquise, aber **nicht ein einziger
echter Patientendatensatz darf heute durchs System fließen**.

---

## 2 · Vier Phasen zum Live-Betrieb

### Phase α · Pilot-Härtung (jetzt → +6 Wochen)

**Ziel:** ein Pflegedienst (5–8 Pflegekräfte, 15–25 Klient:innen) kann
intern Schichten + Klient-Akte führen — ohne dass die Plattform Geld
bewegt. Kein Tausch mit Externen, keine Kostenträger-Kommunikation. Nur
**internes Werkzeug für eine Einrichtung**.

| Block | Was muss gebaut sein | Was muss organisatorisch passieren |
|---|---|---|
| Tech | Session-Aware-Cockpits · Middleware · Verifikations-Upload + Prüfer-Workflow · weitere Stores in DB (Personen, Slots, Wunddoku) · Audit-Log-Tabelle | DSGVO-AVV mit Supabase unterzeichnen · Datenschutz-FA bestellen (extern, ca. 200 €/Monat) · Verzeichnis nach Art 30 DSGVO erstellen · Pilot-Vertrag mit dem Träger als Auftragsverarbeitung |
| Recht | Datenschutz-Erklärung · AGB · Impressum mit echtem Anbieter (Privatperson oder UG) | UG (haftungsbeschränkt) gründen — Genossenschaft braucht 9 Monate, UG geht in 2–3 Wochen mit 1 € Stammkapital |
| Versicherung | — | Berufshaftpflicht für Pflege-Plattform · IT-Cyber-Risk · Vermögensschaden — zusammen ca. 200–400 €/Monat |

**Realistische Dauer:** 4–8 Wochen Tech, 2–6 Wochen Recht (parallel).
**Killer-Risiken:** Datenschutz-FA findet kritische Lücken im
Verarbeitungs-Verzeichnis · Träger-Personalrat blockiert ohne
Mitbestimmungs-Vereinbarung · Supabase-Standort-Garantie nicht ausreichend
für SGB-V-Daten (es gibt EuGH-Urteile zu US-Cloud-Töchtern).

---

### Phase β · Cross-Träger-Tausch ohne Geld (+6 → +14 Wochen)

**Ziel:** 2–3 Pflegedienste tauschen Schichten miteinander, ohne dass
Geld fließt — Pflegekraft A einer Einrichtung kann Schicht von
Pflegekraft B einer anderen Einrichtung übernehmen, Lohn läuft beim
jeweiligen Arbeitgeber.

| Block | Was muss gebaut sein | Was muss organisatorisch passieren |
|---|---|---|
| Tech | Multi-Mandant-Trennung mit RLS pro `organization_id` · Tausch-Genehmigungs-Workflow durch beide Stationsleitungen · ArbZG-Validierung pro Pflegekraft (11 h Ruhe, 10 h Max) · Push-Notifications (VAPID) | Daten-Verarbeitungs-Vertrag zwischen den 3 Trägern (gemeinsame Verantwortlichkeit Art 26 DSGVO) · klare Haftungsabgrenzung wer ist Arbeitgeber bei Unfall in fremder Einrichtung |
| Recht | Cross-Träger-Rahmenvertrag · Personalüberlassungs-Erlaubnis prüfen (AÜG! das ist der Drachen) | Wenn Tausch = Arbeitnehmerüberlassung → AÜG-Erlaubnis nötig · Genossenschaftliches Modell kann das umgehen, wenn die Pflegekraft Mit-Eigentümerin der Genossenschaft ist und die "Verleihung" als interner Personaleinsatz gilt — **muss anwaltlich geprüft werden, NICHT vom Gründer-Bauchgefühl** |
| Versicherung | — | Wegeunfallversicherung pro Pflegekraft · D&O für die Stationsleitungen die Tausche genehmigen |

**Realistische Dauer:** 6–10 Wochen Tech, 8–14 Wochen Recht.
**Killer-Risiken:** **AÜG-Frage falsch beantwortet → Schwarzarbeits-
Verfahren** · Personalrat eines Trägers blockiert · Krankenkassen lehnen
Pflegeleistung ab weil "fremde" Pflegekraft Klient nicht kennt
(Bezugspflege-Standard).

---

### Phase γ · Self-Booker mit Treuhand (+14 → +28 Wochen)

**Ziel:** Klient:innen (oder deren Angehörige) buchen Verhinderungspflege
oder zusätzliche Stunden direkt — Geld läuft über Stripe-Treuhand, 84 %
an Pflegekraft, 4 % Plattform, 12 % Pflegekassen-DTA.

| Block | Was muss gebaut sein | Was muss organisatorisch passieren |
|---|---|---|
| Tech | Stripe Connect Onboarding pro Pflegekraft (KYC) · `lib/treuhand/store.ts` mit States · DTA SGB XI Anlage 5 echter Versand pro Pflegekasse · eAU/eRezept-Stub für VO-Bezug | Genossenschaft (eG) gegründet (oder Verein als Übergangslösung) · GenReg-Eintrag · Satzung mit Solidar-Klausel notariell · Stripe-Geschäftskonto für die eG |
| Recht | Steuerliche Behandlung Plattform-Cut (Umsatzsteuer-Befreiung § 4 Nr. 16 UStG?) · GoBD-konforme Buchhaltung | BaFin-Klärung: ist der 4-%-Cut ein **Zahlungsdienst** (PSD2) oder **Vermittlungsleistung**? · IK-Nummer beantragen für DTA-Versand |
| Compliance | TI-Konnektor (gematik) Hardware **oder** Cloud-TI (gematik bietet seit 2025 Cloud-Konnektoren) | TI-Anschluss kostet KMU **800–1.400 €/Jahr** (Konnektor-Miete + SMC-B-Karte je Standort + Zugangsdienst-Vertrag) — Cloud-TI ist günstiger (ca. 600 €/Jahr) aber noch nicht für alle Use-Cases zugelassen |

**Realistische Dauer:** 12–20 Wochen Tech, 16–24 Wochen Recht.
**Killer-Risiken:** Stripe sperrt Account wegen "regulated industry" ·
BaFin stuft Plattform als zahlungspflichtigen Dienst ein → eigene
BaFin-Erlaubnis nötig (6-stellige Kosten) · IK-Nummer wird verweigert
weil Plattform kein Leistungserbringer ist.

---

### Phase δ · Pilot mit 3 Pflegediensten + echte Klient:innen (+28 → +52 Wochen)

**Ziel:** 3 Pflegedienste, ca. 30–50 Pflegekräfte, ca. 100–150
Klient:innen. Echte Klient-Akte mit Sozialgeheimnis-Schutz, echte
Konferenzen, echte Abrechnung.

| Block | Was muss gebaut sein | Was muss organisatorisch passieren |
|---|---|---|
| Tech | DICOMweb-Integration (Orthanc-Bridge) · KIM-Postfach pro Arzt · Backup-/Restore-Drill quartalsweise · 24/7 On-Call-Setup · Status-Page · Penetrations-Test bestanden | BSI-Grundschutz-Audit (Basis-Modul) · Notfall-Plan dokumentiert · Sozialdatenschutz-Schulung für alle Nutzer · Schweigepflicht-Erklärungen unterschrieben |
| Recht | Sozialdatenschutz-Konzept § 35 SGB I + § 78 SGB X · Auftragsverarbeitungs-Verträge mit allen Pflegekassen | **Versorgungsvertrag § 132a SGB V** je Pflegedienst (Plattform berührt das nicht direkt, aber Daten-Audit der Kasse muss möglich sein) |
| Geld | — | Mindest-Liquidität für 6 Monate Server-Run + Versicherung + DSB · realistisch **80.000–150.000 € Runway** für ernsthaften Pilotbetrieb |

**Realistische Dauer:** 26–40 Wochen.
**Killer-Risiken:** ein Datenschutz-Vorfall in den ersten 6 Monaten
(Meldepflicht 72h, Bußgeld bis 4 % Jahresumsatz) · Pflegekasse stoppt
Auszahlung wegen formaler Mängel im DTA · Träger zieht aus weil eigene
Software (Vivendi/MediFox) bereits bezahlt ist.

---

## 3 · Kritischer Pfad · Die 9 Bausteine ohne die kein echter Pilot startet

In Reihenfolge der Blocker-Wirkung:

| # | Baustein | Heute | Nötig | Wer macht's |
|---|---|---|---|---|
| 1 | **Rechtsform** (UG sofort, eG mittelfristig) | nichts | UG-Gründung beim Notar (1.500 €) | Gründer + Notar |
| 2 | **Datenschutz-FA + AVV-Mappe** | nichts | externer DSB ab Tag 1, AVV Supabase + alle Sub-Auftragnehmer | externer DSB-Dienstleister |
| 3 | **Audit-Log-Tabelle** + jeder Schreibvorgang loggt | fehlt komplett | `audit_events`-Tabelle in Supabase, RLS nur Service-Role | Tech-Lead |
| 4 | **Datei-Upload für Verifikation** + Prüfer-Workflow | UI angedeutet | Storage-Bucket, RLS, `/admin/verifikationen`, manueller Prüfungs-Schritt | Tech-Lead |
| 5 | **Session-Aware-Cockpits** + Middleware | hardcoded `CURRENT_USER_ID` | jedes Cockpit liest `auth.uid()` aus Cookie/Header, Middleware redirect bei fehlender Verifikation | Tech-Lead, ca. 1–2 Wochen |
| 6 | **Multi-Mandant-RLS** auf alle DB-Tabellen | nur Klienten-Tabelle hat RLS | jede Tabelle mit `organization_id` + Policy `using (organization_id = current_org())` | Tech-Lead |
| 7 | **Backup + DR-Drill** | undokumentiert | tägliches Supabase-Backup + monatlicher Restore-Test in Staging | DevOps |
| 8 | **Berufshaftpflicht + Cyber** | nichts | Versicherungs-Makler, ca. 200–400 €/Monat | Gründer |
| 9 | **AÜG/BaFin-Klärung schriftlich** | offen | Anwaltsschreiben + Verbindliche Auskunft | Wirtschaftsanwalt mit Health-Tech-Erfahrung |

Ohne diese 9 ist jeder "Pilot" eine Datenschutz-Bombe mit Zündschnur.

Was **noch** wichtig wird, aber **nicht** Phase α blockiert: TI-Konnektor
(erst Phase γ), DICOMweb (erst Phase δ), Stripe Connect (erst Phase γ),
gematik eAU-Versand (erst Phase γ).

---

## 4 · Konkurrenz-Positionierung · Wo wir strukturell anders sind

| Anbieter | Modell | Marktstellung | Wo wir wirklich anders sind |
|---|---|---|---|
| **Vivendi (Connext)** | Verwaltungssoftware, Lizenz pro Klient | Marktführer stationäre Pflege DE | Wir sind **berufsgruppen-übergreifend von Anfang an** — Vivendi ist Pflege-zentriert, alle anderen Berufe sind Schnittstellen-Beilage |
| **MediFox Dan** | All-in-One-Software, ähnlich Vivendi | Stark in ambulanter Pflege | Wir behandeln **Klient:innen als Hauptakteure** (eigenes Cockpit, Self-Booker) — bei MediFox ist Klient:in nur Datensatz |
| **Caremondo / Senacare / careship** | Vermittlungs-Marktplatz Honorarbasis, 30–50 % Cut | Wachsend, aber prekär | Wir sind **Genossenschaft mit 4 % Cut** — strukturell, nicht nur "günstiger". Pflegekräfte sind Mit-Eigentümer:innen, nicht Lieferant:innen |
| **doctolib / jameda** | Termin-Vermittlung Arzt | Etabliert | Wir vermitteln nicht Termine, wir koordinieren Versorgungsteams — anderer Use Case |
| **Helios/Asklepios eigene Apps** | Konzern-interne Tools | Geschlossen | Wir sind **AGPLv3 + selbst-hostbar** — kein Lock-in |

**Wo wir strukturell unterscheidbar sind (nicht "Marketing-feature"):**

1. **Eigentümer-Modell.** Pflegekräfte sind via Genossenschaftsanteil
   Mit-Eigentümer:innen. Bei Caremondo sind sie Honorar-Lieferant:innen
   ohne Mitbestimmung. Das ist ein **Rechtsform-Unterschied**, nicht
   ein Slogan.

2. **AGPLv3 + Multi-Mandant-Selbsthosting.** Vivendi ist proprietär,
   Migration zwischen Trägern unmöglich. Wir können von Tag 1 ein
   Träger-internes Selbst-Hosting anbieten.

3. **FHIR-nativ.** Vivendi hat eigenes Datenmodell, Brücken zu KVen
   sind Custom-Integrationen. Wir sind FHIR R4 ab Schema-Tag-0.
   Bedeutet: ein Träger kann uns durch jede andere FHIR-konforme
   Lösung ersetzen — **Anti-Lock-in als Verkaufsargument**.

4. **Cross-Profession-Inbox + Konferenz als Kern-Feature.** Bei Vivendi
   sind interdisziplinäre Konferenzen ein Termin im Kalender. Bei uns
   sind sie ein eigener Workflow mit Pre-Reads, Live-Notizen,
   Beschluss-Tracking. **Strukturelle Aufwertung der koordinierenden
   Arbeit**, die in der Realität kostenlos passiert.

5. **Klient:innen als Akteure.** Das `/klient`-Cockpit mit Notiztafel,
   Self-Booker, Begleiter-Übersicht ist bei keinem Konkurrenten so
   ausgebaut. Caremondo hat einen Buchungs-Funnel, sonst nichts.

**Was wir NICHT sind (Ehrlichkeit):** Wir sind keine bessere
Verwaltungssoftware. Vivendi-Konkurrenz auf Verwaltungs-Tiefe wäre
Selbstmord — die haben 25 Jahre Vorsprung in Abrechnungs-Edge-Cases.
Wir gewinnen nur, wenn das Genossenschafts-Modell trägt.

---

## 5 · Realistische Zahlen

### 5.1 · Wieviele aktive Pflegekräfte braucht ein wirtschaftlicher Pilot?

**Annahme:** Plattform-Cut 4 % auf vermittelte Pflegekraft-Stunden.
Mittlerer Stundensatz P7 22,50 €/h, mittlerer Tausch- bzw.
Self-Booker-Anteil = 8 h/Woche pro aktive Pflegekraft (sehr
optimistisch; realistisch eher 2–4 h/Woche im ersten Jahr).

| Pflegekräfte aktiv | Plattform-Stunden/Q | Brutto/Q (22,50 €/h) | 4 %-Cut/Q |
|---|---|---|---|
| 10 | 1.040 h | 23.400 € | **936 €** |
| 30 | 3.120 h | 70.200 € | **2.808 €** |
| 50 | 5.200 h | 117.000 € | **4.680 €** |
| 100 | 10.400 h | 234.000 € | **9.360 €** |
| 200 | 20.800 h | 468.000 € | **18.720 €** |

### 5.2 · Server- und Betriebs-Kosten realistisch

| Posten | Monat | Quartal |
|---|---|---|
| Supabase Pro (multi-tenant, Backup) | 25 € + Add-Ons ca. 75 € | 300 € |
| Hostinger Node.js (Demo) | 15 € | 45 € |
| Domain + Mail | 10 € | 30 € |
| Datenschutz-FA extern | 200 € | 600 € |
| Versicherung (BHP + Cyber) | 250 € | 750 € |
| Buchhaltung/Steuerberater | 200 € | 600 € |
| Externer Anwalt (Retainer) | 200 € | 600 € |
| Stripe-Gebühren (durchlaufender Posten ~3 %, betrifft nicht den 4 %-Cut) | — | — |
| **Summe Fix** | **~900 €** | **~2.925 €** |
| **+ 1 Vollzeit Tech (kalkulatorisch, freelance min.)** | 6.000 € | 18.000 € |
| **Summe inkl. 1 Person** | **~6.900 €** | **~20.925 €** |

### 5.3 · Wann deckt der 4 %-Cut die Kosten?

- **Server-only Break-Even** (~3.000 €/Q): ab **30–35 aktiven Pflegekräften**
- **Server + 1 Tech-Person** (~21.000 €/Q): ab **220–250 aktiven Pflegekräften**

**Ehrliche Implikation:** Ein "1-Tech-Person + 1 Gründer + 1 DSB"-Setup
braucht **300+ aktive Pflegekräfte**, um sich aus dem 4 %-Cut zu tragen.
Das entspricht **6–10 mittelgroßen Pflegediensten** — realistisch im
Jahr **2 oder 3** des Pilots, nicht im Pilot selbst.

**Zwischenfinanzierung nötig:** ca. **80.000–150.000 €** für die ersten
12 Monate. Quellen: BMWK EXIST-Stipendium · BMG Innovationsfonds
(speziell Pflegeförderung) · Genossenschafts-Anteile vorab platziert
(SoFiPo Genossenschaftsbank · NRW.BANK) · Impact-Investoren.

### 5.4 · TI-Konnektor-Kosten KMU

| Variante | Hardware/Software | Laufend/Jahr | Bemerkung |
|---|---|---|---|
| RISE-/secunet-Konnektor (klassisch) | 2.500–3.500 € einmalig | 600–900 €/Jahr | + SMC-B-Karte 50 €/Jahr je Standort, + KIM-Postfach 75 €/Jahr |
| Cloud-TI (gematik 2025) | 0 € | 600–800 €/Jahr | noch nicht für alle Anwendungen freigegeben (eAU/eRezept ja, eAkte teilweise) |
| Bridge-Anbieter (RISE Konnektor-as-a-Service) | 0 € | 800–1.200 €/Jahr | inkl. SMC-B + KIM, vereinfachter Setup |

**Realistisch für einen Pflegedienst:** **1.000–1.400 €/Jahr** für
TI-Anschluss + KIM-Postfach + SMC-B. Pflegedienste mit < 500.000 €
Jahresumsatz finden das schon teuer — **wir können hier durch
Pool-Beschaffung der Genossenschaft Rabatte verhandeln**.

---

## 6 · Was sofort entscheidend ist · Top 3 Engpässe

Wenn morgen ein Pflegedienst sagt "wir wollen euch ausprobieren", was
blockiert konkret?

### Engpass 1 · Rechtsträger + DSB

**Ohne UG-Gründung und ohne externen DSB darf kein einziger echter
Datensatz ins System.** Die Plattform würde sonst als Privatperson
betrieben, mit voller Privathaftung des Gründers für jeden
DSGVO-Verstoß (Bußgelder bis 4 % Jahresumsatz oder 20 Mio. €). Lösung:
**Notar-Termin in 1–2 Wochen + DSB-Vertrag in 2–3 Wochen**, parallel
laufen lassen.

### Engpass 2 · Session-Aware-Cockpits + Multi-Mandant-RLS

**Heute liest jedes Cockpit `CURRENT_USER_ID` als Konstante. Sobald
zwei echte Pflegedienste auf dem System sind, sieht Pflegedienst A
die Daten von Pflegedienst B.** Das ist nicht nur ein Bug — das ist
ein **K.O.-Kriterium für jeden Datenschutz-Vorprüfung**. Lösung: ca.
**2–3 Wochen Refactoring**: Middleware + `auth.uid()` in alle Cockpits
+ `organization_id` als zweite RLS-Achse auf alle Tabellen +
Audit-Tabelle.

### Engpass 3 · AÜG-Klärung anwaltlich

**Wenn der Tausch zwischen zwei Pflegediensten als gewerbliche
Arbeitnehmerüberlassung gewertet wird, brauchen wir eine
AÜG-Erlaubnis (BA-Antrag, 1.500 € Gebühr, 6+ Monate Bearbeitungszeit,
Eigenkapital-Nachweis 10.000 €).** Ohne anwaltliche Bestätigung dass
der Genossenschafts-interne Personaleinsatz das umgeht, ist Phase β
ein Schwarzarbeits-Risiko. Lösung: **Verbindliche Auskunft bei der BA
+ Anwaltsschreiben in 4–8 Wochen**, ca. 2.000–4.000 € Kosten.

Diese drei Engpässe sind **nicht parallelisierbar mit Wunsch-Tempo** —
sie haben harte externe Wartezeiten (Notar 1–2 Wochen, DSB 2–3 Wochen,
BA-Auskunft 4–8 Wochen). **Heute starten = frühestens Mitte Juni 2026
echter Pilot-Start**.

---

## Anhang · Was die Cockpits noch nicht können (Tech-Schuld-Liste)

- 21 von 22 Stores leben in-memory · `lib/aktivitaet/feed.ts` regeneriert
  Demo-Events bei jedem Reload
- `CURRENT_USER_ID`-Pattern in den meisten Cockpits
- Konferenz-Live-Notizen verlieren Daten beim Reload
- Inbox-Events haben keine Audit-Spur, kein "wer hat erledigt-geklickt"
- DICOMweb fehlt komplett — Bildgebung sind 23 statische PNGs
- KIM-Postfach, eAU, eRezept sind alle Stubs ohne TI-Anschluss
- Kein Penetrations-Test, kein OWASP-Audit
- Kein Backup-Restore-Drill je gemacht
- Hostinger Node.js ist als Produktiv-Hosting für SGB-V-Daten
  **nicht freigegeben** — wir brauchen für Phase α/β eine andere
  Hosting-Lösung (Hetzner-Cloud DE, IONOS Cloud, Plusserver) mit
  unterzeichnetem AVV und idealerweise C5-Testat
