# Expertise-Modus · Konzept pro Beruf

**Stand:** 2026-05-08 · gilt für alle Cockpits, neue wie bestehende.

Jeder Beruf hat **drei Stufen** mit eigenständigen Labels (im
[`lib/ui/expertise.ts`](../apps/web/lib/ui/expertise.ts)). Der Modus
wird pro Beruf separat in `localStorage["shalem.expertise.<rolle>"]`
gespeichert (Default `praxis`). Der Toggle steckt im AppShell-Header
bzw. KasseShell-Header — er ist berufsbezogen, nicht user-bezogen.

---

## Was in welche Stufe gehört · Grundregel

| Element | LERNE (◯) | PRAXIS (◐) | PROFI (●) |
|---|---|---|---|
| `<LerneTipp rolle>` Glossar-Banner | **sichtbar** | aus | aus |
| Standard-Workflow (Hauptaufgabe) | sichtbar | **sichtbar** | sichtbar |
| Hero-Karten / Aktions-CTAs | sichtbar | sichtbar | sichtbar |
| Roh-Daten / Detail-Tabellen | sichtbar | sichtbar | sichtbar |
| `<NurAbProfi rolle>` Performance-KPIs | aus | aus | **sichtbar** |
| Bundesschnitte zum Vergleich | aus | aus | **sichtbar** |
| Frist-Indikatoren / Quoten | aus | aus | **sichtbar** |
| Rechtliche Tiefe (§§) | als Glossar | inline | als Querverweis |
| KI-Tonart | „Lana erklärt …" | „Vorschlag" | „Empfehlung mit Confidence" |

**Faustregeln beim Cockpit-Bauen:**

1. Was **mehrfach täglich** gemacht wird → Praxis-Default, immer sichtbar.
2. Was **erstmalig erklärt werden muss** → in `<LerneTipp>` (max. 4 Sätze, mit Glossar inline).
3. Was **steuert** statt ausführt (Bundesschnitt, Quote, Frist) → in `<NurAbProfi>`.
4. Was **fachlich vertieft** (Studien, Rahmenverträge, Spezial-Codes) → ebenfalls Profi.
5. Niemals `<LerneTipp>` und `<NurAbProfi>` für **dieselbe Information** —
   das ist ein Zeichen, dass der Praxis-Default unklar ist.

---

## Beruf-für-Beruf · Was die drei Stufen sehen

### 🩺 Pflege

| Label | Wer | Sichtbares |
|---|---|---|
| **Azubi** ◯ | Pflege-Azubi 1.–3. Lehrjahr, Berufsstart, Quereinsteiger | SIS-Glossar, Pflegegrad-Erklärung, Tour-Lese-Hilfe, „Hoch-Priorität = was?" |
| **Pflegekraft** ◐ | Examinierte:r in Standard-Schicht | Tour, SIS-Diktat, Wundverband, Vital-Liste, Übergabe, HKP-VOs für Caseload |
| **Pflegeprofi** ● | Pflegefachkraft mit Kammer-Tätigkeit, Wundexpertise, Praxisanleitung | Performance-Tracking (gesparte Std/Wo), DBfK-Caseload-Vergleich, Cross-Termine, HKP-Pipeline-Quote |

**Konkrete Stellen:** `/pflege/heute` zeigt im Profi-Modus den
„Performance-Tracking"-Block mit Diktate-Anzahl + Caseload-Größe vs.
DBfK-Empfehlung 6–8.

---

### 👩‍⚕️ Arzt

| Label | Wer | Sichtbares |
|---|---|---|
| **Assistenz** ◯ | Famulatur, PJ, Assistenzarzt 1. Jahr, Quereinsteiger | AU/HKP/ICD-10/DMP-Glossar, „Was ist eine Anfragen-Inbox" |
| **Facharzt:ärztin** ◐ | Hausärztliche / fachärztliche Tätigkeit | Anfragen-Inbox, Diktat, Hausbesuche, Verordnungen erstellen |
| **Oberarzt:ärztin** ● | Praxis-/Abteilungsleitung | Akut-Quote, CGM-Click-Workflow-Vergleich (3,2 min/Verordnung), Diktat-Ersparnis pro Tag, Phase-B DALE-UV-Anbindung |

**Konkrete Stellen:** `/arzt/heute` mit Praxis-Performance im Profi-Block.

---

### 🤲 Therapie

| Label | Wer | Sichtbares |
|---|---|---|
| **Berufsstart** ◯ | Berufsstart, Praktikum, Quereinsteiger | VAS/ROM/MRC-Glossar, Sparkline-Lesen, ICF-Codes erklärt |
| **Praktiker:in** ◐ | Standard-Physio / Logo / Ergo | Patient-Verlauf, Diktat, ICF + SMART-Ziele, Verlaufsbrief-KI |
| **Manualtherapie** ● | OMT / FBL / fachliche Ausbildung darüber | Outcome-Verteilung der Caseload (fallend/stabil/steigend), Heilmittel-Auswertung, HMR-Standard-Vergleich (1:30 / Wo) |

---

### 📋 Sozial

| Label | Wer | Sichtbares |
|---|---|---|
| **Berufsstart** ◯ | BA-Praktikum, Berufseinsteiger | SGB IX/XII/VIII/XI-Glossar, SMART-Ziele-Erklärung, Hilfeplan-Pfad |
| **Sozialarbeit** ◐ | Sozialarbeiter:in BA, ASD-Fachkraft | Hilfeplan-Pflege, ICF-Bedarf, Reviews, Maßnahmen-Status |
| **Case-Manager:in** ● | DGCC-zertifiziert, Fallleitung | SGB-Verteilung der Caseload, DGCC-Caseload-Empfehlung 25–35, Frist-Indikatoren, Maßnahmen-Aktiv-Quote |

---

### 🌱 Heilerziehung

| Label | Wer | Sichtbares |
|---|---|---|
| **Auszubildende** ◯ | HEP-Azubi, Praktikum, Quereinsteiger | BTHG/ICF/P-Budget-Glossar, „Was ist eine HPK?" |
| **HEP** ◐ | Heilerziehungspfleger:in | Teilhabeplan-Pflege, ICF-Bewertung, HPK-Vorbereitung, Selbstvertretungs-Notiz |
| **Heilpädagogik** ● | Studium Heilpädagogik / Sonderpädagogik / BTHG-Spezialist:in | P-Budget-Quote vs. Bundesschnitt 4 %, Hochbedarfs-Items (Bewertung 3–4), ICF-Profil-Verdichtung, Bedarfs-Schnitt |

---

### 🍲 Hauswirtschaft

| Label | Wer | Sichtbares |
|---|---|---|
| **Hilfskraft** ◯ | Service, Küchenhilfe, Zivildienst | DGE/LMIV/IDDSI-Glossar, „Was ist Stufe 4 = püriert?" |
| **HW-Fachkraft** ◐ | Hauswirtschafter:in HBL / Diätassistenz | Wochenplan, Allergen-Filter pro Mahlzeit, Klient-Kostform |
| **HW-Leitung** ● | HW-Leitung / Großküchen-Verantwortliche | Wareneinsatz Ø vs. DGE-Quality-Standard 4,40–5,90 €/Tag, Bio-Anteil-Quote, HACCP-Check-Stand, Reste-Quote |

---

### 🌻 Erziehung

| Label | Wer | Sichtbares |
|---|---|---|
| **Praktikant:in** ◯ | Anerkennungs-Jahr, FSJ, Quereinsteiger | Carr-Methodik + BBP-Glossar, „Was ist eine Lerngeschichte?" |
| **Erzieher:in** ◐ | Examinierte Erzieher:in | Lerngeschichten schreiben + KI-Hilfe, Bildungsbereich-Tagging |
| **Fachberatung** ● | Kita-Leitung / Fachberatung / Fachschule-Dozent:in | Bildungsbereich-Verteilung als Bar-Chart, Carr-Disposition-Tiefe, Foto-Anhänge, Tag-Vielseitigkeit |

---

### 🤝 Ehrenamt

| Label | Wer | Sichtbares |
|---|---|---|
| **Casual** ◯ | Erstmaliges Ehrenamt, Schüler:in, Spontan-Begleitung | Rollenklarheit (da sein, nicht pflegen), § 3 Nr. 26a EStG-Glossar, Schuchardt-Biografie-Idee |
| **Begleiter:in** ◐ | Geschulte:r ehrenamtliche Hospiz-Begleiter:in | Termin-Verlauf, Stimmungs-Skala 1–5, Biografie-Pflege, Lebenslagen-Tags |
| **Hospizfachkraft** ● | Hospiz-Koordinator:in mit DHPV-Curriculum | Lebenslagen-Verteilung der Caseload, DHPV-Curriculum-Stand 2/4, Steuer-Spielraum bis Freibetrag, Supervisions-Termine |

---

### 🗂 Stationsleitung

| Label | Wer | Sichtbares |
|---|---|---|
| **Stations-WL** ◯ | Wohnbereichsleitung im Aufbau, Stellvertretung | ArbZG-Limits-Glossar, Co-Pilot-Aktionen-Erklärung |
| **Stationsleitung** ◐ | Wohnbereichs- / Stationsleitung | HUD-Standard, Schicht-Zuteilung, Genehmigungs-Pipeline |
| **PDL** ● | Pflegedienstleitung Multi-Einrichtung | Steuerungs-KPIs (mehrere Einrichtungen, PflegeArbbV 26-Wo-Horizont, PpUGV-Verstoß-Risiko, Skill-Mix), Wirtschaftlichkeits-Sandbox, Cross-Auswertung |

---

### 💶 Krankenkasse

| Label | Wer | Sichtbares |
|---|---|---|
| **Casual** ◯ | Quereinsteiger, neue Sachbearbeitung | Antrags-Status-Spur-Glossar, SGB-V-Pakete erklärt, „Was bedeutet eAU?" |
| **Sachbearbeitung** ◐ | Sachbearbeiter:in eingearbeitet | Eingangskorb, Status setzen, Schein-Optik (Muster 1/12 + Bescheid-Brief) lesen, Klartext-Spalte |
| **Spezialist:in** ● | Fachreferent:in / Recht / MD-Beauftragte | Genehmigungs-/Rückfrage-/Ablehnungs-Quoten, § 13 Abs. 3a SGB V Fiktion, MD-Stellungnahmen, Bescheid-Vorschau-Generator |

---

### 🌿 Klient:in

**Sonderfall: kein 3-Stufen-Toggle.** Klient:innen haben einen festen
Modus „teilhabe" — alles ist immer in Klartext (Brillenmodus universal,
KI-Klartext für jeden markierten Begriff, lebensweltliche Sprache, kein
Code/§ ohne Übersetzung). Die Stufung entfällt, weil die Lebenslage
vorgibt, dass Verständlichkeit immer Voraussetzung ist.

---

### 🏛 Genossenschaft

| Label | Wer | Sichtbares |
|---|---|---|
| **Mitglied** ◯ | Eingetretenes eG-Mitglied ohne Funktion | Pool / Solidartopf / Quartal-Ausschüttung verstehen, GenG-Glossar |
| **Vorstand** ◐ | Vorstandsmitglied (operativ) | Ausschüttungs-Workflow steuern, Genehmigungs-Schritte, GwG-Pflichten |
| **Aufsichtsrat** ● | Aufsichtsrat / Wirtschaftsprüfer | PDF-Druck-Ansicht, eIDAS-Container, k-Anonym-Audit, Q-Bericht-Versand |

*(Stand: noch nicht in Cockpits eingezogen — siehe ToDo unten.)*

---

## Cockpit-Stand · Wo Expertise heute live ist

| Cockpit | Lerne | Profi | Status |
|---|---|---|---|
| `/pflege/heute` | DBfK-Glossar | Performance-Tracking | ✓ live |
| `/arzt/heute` | AU/HKP/ICD/DMP | CGM-Click-Vergleich | ✓ live |
| `/therapie/patienten` | VAS/ROM/MRC | Outcome-Verteilung | ✓ live |
| `/therapie/patient/[id]` | (initial) | (initial) | ✓ live |
| `/sozial/hilfeplan` | SGB-Glossar | SGB-Verteilung + DGCC | ✓ live |
| `/sozial/hilfeplan/[id]` | (initial) | (initial) | ✓ live |
| `/heilerziehung/teilhabe` | BTHG/P-Budget | P-Budget-Quote + HPK | ✓ live |
| `/heilerziehung/teilhabe/[id]` | Carr-ICF-Lesart | Bedarf-Schnitt | ✓ live |
| `/hauswirtschaft/wochenplan` | DGE/LMIV/IDDSI | DGE-Quality-Standard | ✓ live |
| `/erziehung/lerngeschichten` | Carr-Methodik | Bildungsbereich-Verteilung | ✓ live |
| `/erziehung/lerngeschichten/[id]` | Carr-Disposition | Carr-Profil | ✓ live |
| `/ehrenamt` | EStG + Rollenklarheit | DHPV-Curriculum | ✓ live |
| `/ehrenamt/begleitung` | Schuchardt-Biografie | Lebenslagen-Verteilung | ✓ live |
| `/ehrenamt/begleitung/[id]` | Akte-Lesart | Verlaufs-Indikatoren | ✓ live |
| `/admin/dienstplan/hud` | ArbZG + Co-Pilot | Steuerungs-KPIs | ✓ live |
| `/kasse` | Antrags-Status-Spur | Genehmigungs-Quoten | ✓ live |
| `/kasse/vorgang/[id]` | Schein-Lesart | Bescheid-Vorschau | ✓ live |

**Lücken:**

- 🩺 Pflege: weitere Sub-Cockpits (`/pflege/wunde`, `/pflege/assessment`, `/pflege/tour`) bekommen noch keine Expertise-Wires
- 🏛 Genossenschaft: 3 Routen (`/genossenschaft/pool|solidartopf|ausschuettung`) ohne Wires
- 🌿 Klient: kein 3-Stufen-Toggle (gewollt) — aber LerneTipp kann auch dort als „erste Hilfe" wirken
- Marketing-/Public-Pages: per Definition keine Expertise (Hero-Pages für Anonyme)

---

## Designer-Notizen

- **Farb-Codes** im `<ExpertiseChip>`:
  - LERNE: `var(--vibe-approval)` (Gold) — wie ein „Du bekommst Hilfe"-Marker
  - PRAXIS: `var(--vibe-team)` (Petrol) — Standard-Tonart
  - PROFI: `var(--vibe-stats)` (Magenta) — Performance-Datacolor
- **Glyphen** (Sehbar als Mini-Anker links vom Label):
  - LERNE: `◯` (offener Kreis = noch nicht ausgefüllt)
  - PRAXIS: `◐` (halb gefüllt = im Tun)
  - PROFI: `●` (voll gefüllt = Mastery)
- **Tonarten** in Texten:
  - LERNE: „Was bedeutet das?" · 2-Sätze-Erklärung mit Glossar
  - PRAXIS: keine Tonart, nur Fakten + Aktionen
  - PROFI: „Bundesschnitt: X %" · Bezug zu Vergleichszahl/Empfehlung

---

## Konsequenzen für neue Cockpits

Wer ein neues Beruf-Cockpit baut, fragt sich **vor jedem Block**:

1. *Würde ein Azubi das verstehen ohne Erklärung?* — Wenn nein und es ist trotzdem Default-Workflow → ein `<LerneTipp>` davor.
2. *Würde eine Standard-Fachkraft täglich darauf zugreifen?* — Wenn ja → Praxis-Default, immer sichtbar.
3. *Steuert / vergleicht das nur eine Leitung?* — Wenn ja → in `<NurAbProfi>` packen.

Wenn ein Block **alle drei** erfüllt, ist er falsch zugeschnitten und
gehört aufgeteilt. Faustregel: ein `<LerneTipp>` pro Cockpit-Page,
maximal ein `<NurAbProfi>`-Block (mit ggf. mehreren KPIs darin).
