# Expertenteam · Evaluierung Shalem Care
**Stand:** 2026-05-10 · Build-Status: 237 Pages, `tsc --noEmit` exit 0, `next build` exit 0

Multidisziplinäre Begutachtung des Systems aus sieben Fachperspektiven.
Pro Perspektive: Stärken · Risiken · konkrete nächste Schritte. Am
Schluss eine Synthese der wichtigsten Querschnitts-Befunde.

---

## 1 · Pflegewissenschaft (NANDA-I / NIC/NOC / DNQP)

**Stärken**
- NANDA-I 2024-2026 Katalog mit 30 Diagnosen über 9 Domänen, NNN-Triade vollständig
- ICNP-Mapping (WHO) ist als Brücke vorhanden — wichtig für EU-Pflegediagnostik
- DNQP-Expertenstandards als eigene Domäne (`/expertenstandards`)
- Sterbe-Wache nach DGP S3-Palliativ + BAG Hospiz mit 8-Punkte-„Was tun wenn?"-Tafel

**Risiken / offen**
- Nur 30 von ~250 NANDA-Diagnosen — Vollkatalog würde Praxisreife erhöhen
- Pflegeplan-Generator gibt Vorschläge aus dem Katalog, hat aber keine
  individuelle Anpassungs-Doku (Bewertung → Anpassung → Re-Evaluation)
- Skalen-Tools (Braden, Norton, FIM, Barthel) sind im Assessment, aber nicht
  zwingend mit den Diagnosen verknüpft

**Nächste Schritte**
- NANDA-Katalog auf Vollumfang erweitern (priorisiert nach Häufigkeit Domäne 4 + 12)
- NIC-Interventionen mit Skalen-Triggern verbinden (z.B. Braden ≤ 12 → automat. Vorschlag NIC 3540)
- Re-Evaluations-Workflow: Diagnose-Status `akut/chronisch/risiko/geloest` stärker tracken

---

## 2 · Datenschutz · DSGVO + EHDS

**Stärken**
- DSGVO Art. 4/15/16/17/20 in echter UI umgesetzt (Editor + Spiegel + Verlauf + Selbst-Auskunft)
- Identitätshoheit konkret: Klient-Wunsch-Editor mit Server-Action + Verlauf
- Aufbewahrungs-Pflichten dokumentiert (§ 630f BGB, § 305 SGB V, § 147 AO, WBVG, ArbZG § 16)
- Pseudonymisierung (`pseudonymisiere()` mit djb2-light) bei Löschung implementiert
- /klient/daten als Selbst-Auskunfts-Page mit klaren Action-Pfaden

**Risiken / offen**
- Phase 1 ist `globalThis`-Map · Server-Restart killt alle Wünsche + Verlauf
- Keine RLS-Policies in Supabase definiert für `klient_wunsch` und Verlauf
- Audit-Log der Profi-Lese-Zugriffe fehlt (wer hat wann welchen Wunsch gesehen?)
- EHDS (European Health Data Space, ab 2025) noch nicht adressiert — sekundäre
  Datennutzung mit Opt-out / Opt-in fehlt

**Nächste Schritte**
- Supabase-Tabelle `klient_wunsch` + `klient_wunsch_verlauf` mit RLS
- Lese-Audit-Log: jedes `getWunsch()`-Aufruf protokollieren mit person_id + zeitpunkt
- EHDS-Opt-In-Toggle in /klient/daten (Forschung / Sekundärnutzung)
- DSGVO-Verzeichnis von Verarbeitungstätigkeiten (Art. 30) als generierte Doku

---

## 3 · IT-Security

**Stärken**
- Server-Actions konsequent mit `"use server"` markiert
- VAPID-Push mit Identity/Rolle/Station-Filter (kein leakender Push)
- Auth über Supabase + Google OAuth + Magic-Link (in Vorbereitung)
- Identity-Claim-Token für Geräte-Bindung

**Risiken / offen**
- Zentrale Demo-User-Annahme (`CURRENT_USER_ID`) statt echter Session-Auth in vielen
  Server-Actions — bei Phase-2-Echtbetrieb muss überall die echte Session geprüft werden
- Keine Rate-Limits auf Server-Actions (z.B. setzeWunschAction kann beliebig oft aufgerufen werden)
- CSP-Header nicht definiert (Tailwind + inline styles brauchen 'unsafe-inline' workaround)
- KI-Endpoint `/api/ai/klartext` ohne Cost-Cap pro User
- Keine Anti-CSRF-Tokens auf den Server-Actions (Next.js 15 hat eingebauten
  CSRF-Schutz, aber Action-Origin-Whitelist fehlt explizit)

**Nächste Schritte**
- `getServerUser()`-Helper, der echten Session-User liefert · Demo-Bridge nur in DEMO_MODE
- Rate-Limit-Middleware für Server-Actions (z.B. max. 10 Wunsch-Edits/min/User)
- CSP-Header in `next.config.mjs` mit nonce-basiertem Style-Inline
- KI-Cost-Cap im `/api/ai/klartext` (max. X EUR/Tag/User)

---

## 4 · UX · Accessibility · Mobile

**Stärken**
- Werkzeuge-Menü räumt 5 FABs in einem geordneten Dropdown auf
- Cmd-K als Universal-Suche (Cockpits + Inhalte)
- /cockpits-Karte als globale Such-Übersicht
- Cross-Beruf-Brücken machen multidisziplinäre Sicht klickbar
- DruckenButton mit A4-Print-Stylesheet für Familien
- Brillenmodus für KI-Klartext bei jedem Begriff
- Mobile-Hamburger-Drawer + BottomNav

**Risiken / offen**
- CockpitSubNav bei Familien mit 7+ Reitern (Therapie, Pflege, Admin) auf
  Mobile horizontal-scroll · kein „Mehr"-Dropdown
- Focus-Trap im Cmd-K-Modal nicht implementiert · Tab kann aus dem Modal raus
- WunschEditor-Textarea hat nur englisches `aria-label` (placeholder reicht nicht)
- Farbkontrast einiger `text-soft`-Klassen unter WCAG AA in dark mode prüfen
- Keine Tastatur-Navigation in der CockpitSubNav (nur Tab, keine Pfeiltasten)
- Sound-Slider braucht alternatives Eingabe (Keyboard +/-)

**Nächste Schritte**
- CockpitSubNav: bei >5 Reitern auf Mobile Dropdown statt scroll
- Focus-Trap mit `aria-modal="true"` + tabindex-Loop in Cmd-K + Werkzeuge-Menü
- A11y-Audit mit axe-core in CI · WCAG 2.2 AA als Ziel
- Reduce-Motion-Respekt überall prüfen (`prefers-reduced-motion`)

---

## 5 · Gesundheitsökonomie · Geschäftsführung

**Stärken**
- Tarif-Layer mit TVÖD-P inklusive Zuschlägen (Sa/So/Nacht) sauber modelliert
- Gemeinwohl-Indikator (`/gemeinwohl`) als ESG-Brücke
- Genossenschafts-Architektur mit Solidar-Topf + Pool + Quartal-Ausschüttung
- Aufsichtsrats-Bericht mit eIDAS-Container für PDF-Druck
- Hilfsmittel-Pool mit Wirtschaftlichkeits-Berechnung + LCA-CO₂

**Risiken / offen**
- Keine konkreten KPIs für Träger-Geschäftsführung (Belegungsquote, Personal-Auslastung,
  Forderungs-Bestand, Liquidität) als zentraler Dashboard
- Fluktuations-Risiko-Indikator fehlt (Stunden-Differenz zwischen Soll und Ist
  pro Mitarbeiter:in als Burnout-Frühwarnsystem)
- Kein Forecast-Modell für Pflegegrad-Mix-Veränderungen über die nächsten 12 Monate

**Nächste Schritte**
- Träger-CFO-Dashboard mit 8-12 Kern-KPIs (Liquidität, Forderungen, Belegung,
  Krankenstand, Fluktuation, Stundensaldo, Wundheilungs-Rate, NANDA-Risiko-Quote)
- Burnout-Frühwarnsystem aus Tausch-Markt-Daten + Krankmeldungs-Daten + Stundensaldo
- Pflegegrad-Forecast aus Belegungs-Verlauf + Diagnosen-Mix

---

## 6 · Recht · Heilberufe + Sozialrecht

**Stärken**
- BtMG/BtMVV für Apotheke umgesetzt mit Doppel-Sig + 3-Anlagen-Differenzierung
- HeilprG für Naturheilkunde · ESCOP/EMA HMPC-Quellen je Verfahren
- MDR (EU 2017/745) für Medizintechnik mit UDI/EUDAMED/CE
- Bestattungsrecht der Länder + § 74 SGB XII Sozialhilfe-Bestattung
- Betreuungsrechts-Reform 2023 in Wunsch-Einwilligung dokumentiert
- § 168 StGB (Totenruhe) im Bestatter-Cockpit verankert

**Risiken / offen**
- HeilM-RL (Heilmittel-Richtlinie) nicht voll abgebildet — Verordnungs-Mengen pro
  Indikation, „außerhalb des Regelfalls" mit Begründung
- BTHG-Konformität für Eingliederungshilfe nur teilweise (Heilerziehung-Cockpit
  hat noch keine ICF-Bedarfsfeststellung)
- Kein expliziter Datenschutz-Folgenabschätzung-Generator (DSFA nach Art. 35 DSGVO)
- Pflege-VOs ohne ICF-Codes und ohne § 132a SGB V Abschluss-Behandlungs-Pfade

**Nächste Schritte**
- HeilM-RL-Modul: Indikations-Schlüssel + Verordnungs-Höchstmenge + RuP-Doku
- ICF-Bedarfsfeststellung im Heilerziehung-Cockpit
- DSFA-Vorlage je neuer Datenverarbeitungs-Tätigkeit

---

## 7 · Genossenschaftsrecht + Sozialwirtschaft

**Stärken**
- GenG §§ 15/19/43 als Architektur-Anker (Mitgliedschaft, Generalversammlung, Vorstand)
- Solidar-Topf + Pool + Quartal-Ausschüttung implementiert
- Aufsichtsrats-Bericht mit Druck-Ansicht
- Gemeinwohl-Indikator als Bewertungs-Dimension neben Tarif

**Risiken / offen**
- Keine Doku der Beschlussfassung-Workflows (Generalversammlung-Antrag → Einladung → Protokoll → Eintragung)
- Mitglieder-Verzeichnis-Pflichten nach § 30 GenG nicht digital abgebildet
- Genossenschaftliche Förderzweck-Nachweis (für Steuer-Begünstigung) fehlt
- Keine Verzinsung-Logik für Geschäftsguthaben

**Nächste Schritte**
- Beschluss-Workflow GV/AR mit Antragsverfolgung
- § 30-konformes Mitglieder-Register als eigenes Cockpit
- Förderzweck-Bilanz quartalsweise generieren

---

## Synthese · die fünf wichtigsten Querschnitts-Befunde

1. **Phase-1-Persistenz blockiert Echtbetrieb.** `globalThis`-Maps sind für
   Demo gut, aber Wünsche, Verlauf, Tausch-Vorgänge gehen beim Server-Restart
   verloren. Migration nach Supabase mit RLS ist der wichtigste Phase-2-Schritt.

2. **Auth-Brücke fehlt zwischen Demo und Real.** Hardcoded `CURRENT_USER_ID` in
   vielen Server-Actions ist ein Demo-Smell. Ein zentraler `getServerUser()`-Helper
   mit Demo-Fallback ist Voraussetzung für jeden Realbetrieb.

3. **Audit-Log fehlt für Lese-Zugriffe.** Schreibe-Vorgänge sind im Verlauf
   getrackt, aber wer wann welchen Wunsch / welche Diagnose / welchen BtM-Eintrag
   gesehen hat — fehlt. DSGVO Art. 30 (Verzeichnis) braucht das.

4. **A11y ist nicht systematisch geprüft.** Keine axe-core in CI. Focus-Trap
   in Modals fehlt. CockpitSubNav-Tastatur-Navigation rudimentär. Bei einer
   Pflegekraft mit motorischer Einschränkung wird das spürbar.

5. **Schweregrad-Sicherheit ist asymmetrisch.** BtMG ist sehr genau, MDR auch.
   Aber: Wechselwirkungs-Datenbank ist Mini-Stub, AMTS-Score statisch in
   Demo-Daten. Phase 2 braucht ABDA-CAVE-Anbindung — sonst bleibt das
   Apotheke-Modul „aussehen wie real, aber nicht real".

---

## Empfohlene Prioritäten

| Prio | Bereich | Maßnahme |
|---:|---|---|
| 1 | Persistenz | Supabase-Migration `klient_wunsch`, `swap_offer`, `swap_history` mit RLS |
| 1 | Security | `getServerUser()` einführen + Rate-Limits |
| 2 | DSGVO | Lese-Audit-Log + Art. 30 Verzeichnis-Generator |
| 2 | A11y | axe-core in CI + Focus-Trap in Modals |
| 3 | Recht | HeilM-RL-Modul + ICF im Heilerziehung-Cockpit |
| 3 | Wirtschaft | Träger-CFO-Dashboard mit 8 KPIs + Burnout-Frühwarnsystem |
| 4 | Pflege | NANDA-Vollkatalog + Skalen→Diagnose-Trigger |
| 4 | EG | Beschluss-Workflow + § 30 Mitgliederregister |

---

*Erstellt: 2026-05-10 · Methode: 7-Perspektiven-Audit ohne externes Panel ·
nicht ersetzt einen formalen Audit nach DIN ISO/IEC 27001 oder einer
DSFA durch eine:n DSB.*
