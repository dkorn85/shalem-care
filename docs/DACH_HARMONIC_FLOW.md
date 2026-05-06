# DACH · Ein Dach für alle Berufsgruppen

**Stand:** 2026-05-06
**Auftrag:** Dynamic Harmonic Flow als Marken-Sprache · 14 Berufsgruppen unter einem Cockpit-Dach · Navigation neu

---

## 1 · Was DACH löst — die drei Defekte heute

1. **Inkohärente Navigation** — jeder Beruf hat eine eigene Insel-URL (`/pflege`, `/arzt`, `/therapie` …). Quereinstiege zwischen Berufen sind teuer (Cross-Profession-Inbox war erster Schritt, aber nur Notifikations-Layer).
2. **Veraltete strukturelle Begriffe** — "Cockpit", "Modul", "Dashboard". Klingt nach Software-2010, nicht nach Würde-Pflege-2026.
3. **Klient:innen sind Konsument:innen, keine Mitspielende** — die Plattform priorisiert Pflege-Workflow. Klient-Sicht ist drangehängt, nicht eingewoben.

DACH soll: **eine** geteilte Sprache, **eine** geteilte Geste, **eine** geteilte Geometrie über alle 14 Berufsgruppen + Klient + Angehörige.

---

## 2 · Expertenteam — wer sitzt am Tisch

> 7 Stühle, drei Säulen. Sequentiell anschreibbar, gestaffelt über 60 Tage.

### Säule A · Care-Praxis (3 Sitze)

- **Stationsleitung Pflegeheim** — jemand der seit 8+ Jahren MDK-Audits + interdisziplinäre Konferenzen führt. Kandidat-Profil: ICW-Zertifizierung + DGCC-Casemanagement. Aufgabe: testet jede Vereinheitlichung mit "Funktioniert das in der Schichtübergabe?" — hartes Veto-Recht bei Pflege-Workflows.
- **Therapeut:in mit Heim-Erfahrung** — Physio/Ergo, idealerweise mit Häuslicher-Krankenpflege-Hintergrund. Aufgabe: schaut auf die Verordnungs-Pipeline + Heilmittel-Rezept-Flow. Verhindert dass Therapie als "auch noch da" Sub-Modul behandelt wird.
- **Sozialarbeiter:in DGCC** — Casemanagement-zertifiziert. Aufgabe: BTHG/SGB-IX/-XII-Würde-Standards in der UI. Spürbar machen dass Hilfeplan ≠ Pflegeplanung.

### Säule B · Design + Gen-Z-Bewegung (2 Sitze)

- **Designer mit Healthcare-Erfahrung** — kein Material-3-Klassiker, sondern jemand mit Erfahrung in *empathisch-bewegten* Interfaces. Vorbilder: Linear-Bewegungs-Sprache, Arc-Browser-Übergänge, Apple-Dynamic-Island. Aufgabe: Dynamic Harmonic Flow als Komponenten-Sprache definieren.
- **Motion-/Voice-Researcher:in** — aus dem Hume-AI-/Sesame-Umfeld oder Indie-Demo-Szene. Aufgabe: Bewegungs-Choreografie + Stimme als Gewebe (nicht als Feature).

### Säule C · Recht + Standards (2 Sitze)

- **Genossenschafts-Anwalt mit Pflege-Erfahrung** — UG→eG-Wandlung, Mehr-Mandanten-Logik, AÜG-Frage bei Träger-Tausch. Pflichtsitz.
- **Datenschutzbeauftragte** — extern, mit Erfahrung in TI-/gematik-Umfeld. Pflichtsitz für Klient-Daten + Cross-Beruf-Sichtbarkeit.

### Beobachter (kein Sitz, aber regelmäßig konsultiert)

- 1 Pflegekraft mit P7-Schiene (Tag-für-Tag-Realität)
- 1 Klient:in (PG ≥ 3, kognitiv klar) — "spürt das so an wie Pflege?"
- 1 pflegende Angehörige

### Empfehlung Erstkontakt

1. **Diana Heinrichs** (Lindera) — Stuhl Säule A. Ihr Pflege+Tech-Track ist gold.
2. **Daniel Nathrath** (Ada Health) — Berater (kein Sitz), Patient-AI-DSGVO-Wissen unbezahlbar.
3. **Bertalan Meskó** (Medical Futurist) — ein bezahlter Keynote-Slot pro Quartal als Anker.

(Vollständige Talent-Liste in [STRATEGIE_TEAM_WOW.md](STRATEGIE_TEAM_WOW.md))

---

## 3 · Dynamic Harmonic Flow · Marken-Sprache in 5 Maximen

Diese fünf Maximen ersetzen die 200 ad-hoc-CSS-Entscheidungen, die jetzt verstreut sind:

### Maxime 1 · **Bewegung ist immer Antwort, nie Beweis**

UI-Animation reagiert auf Klient-Aktion. Sie demonstriert nichts. Das heißt:
- Hover-States haben max 80 ms reaction-time, max 200 ms transition
- Niemals "Hereinfliegen-Effekte" weil cool — nur wenn die Bewegung etwas erzählt
- Lottie ist verboten, View Transitions API + CSS sind Pflicht

### Maxime 2 · **Geste vor Klick, Stimme vor Text**

Bestehende Mechaniken behalten:
- Klartext-Wrapper mit Lana-Voice
- @lana-Bot im Schicht-Chat
- Lebensbuch-Voice-Cloning

Neu denken:
- Long-Press (touch) für Sekundär-Aktionen statt Right-Click
- Voice-Note als ERSTE Eingabe-Form, Tippen als Fallback
- Hand-Gesten für Lese-Bestätigung (haptisch)

### Maxime 3 · **Pastell ist Identität, nicht Dekoration**

11 Berufs-Pastells (siehe `lib/design/role-theme.ts`) sind kanonisch. Jede neue Berufsgruppe bekommt einen eigenen, nie eine Mischung. Das Pastell ist:
- Background-Verlauf im Header
- Akzent-Stripe (3 px) links an jeder Surface
- Avatar-Ring + Initialen-Tönung
- LiveMap-Knoten + Pulse

Niemals: harte Brand-Farben (BlauGrün-Konzern-Look), niemals Schwarz-Weiß-Modus für "neutralen" Look.

### Maxime 4 · **Aktenschrank-Würde**

Page-Transitions sind Akkordeon-/Aktenordner-Schübe (✅ implementiert). Cards staffeln per `.akkordeon-staffel`. Das Gefühl: jemand öffnet ehrfürchtig eine Akte. Nicht: jemand swipt durch Tinder.

### Maxime 5 · **Klient steht in der Mitte, nicht am Rand**

Architektonisch:
- `/klient/...` wird zur Wurzel der App, nicht ein Modul
- Pflegekräfte-Routen sind *Werkzeuge zur Begleitung* eines Klienten — nicht eigene Welten
- Live-Map-Knoten "Klient" steht zentriert, andere Berufe sind die Synapsen drumherum (✅ schon so umgesetzt)

---

## 4 · Navigations-Reorganisation

### Heute

```
/                  Marketing
/pflege            Pflege-Cockpit
/arzt              Arzt-Cockpit
/therapie          Therapie-Cockpit
... (12 Inseln)
/klient            Klient-Cockpit (eine Insel von 14)
/admin             Lead-Cockpit
```

### Vorschlag · DACH-Architektur

```
/                                    Atrium · alle 14 Rollen sichtbar als Eingang
/begleitung-von/[klientId]           Klient-zentrierte Wurzel (statt /klient)
/begleitung-von/[klientId]/akte
/begleitung-von/[klientId]/dienstplan
/begleitung-von/[klientId]/holistik
/rolle/[beruf]                       Berufs-Werkzeuge (statt /pflege, /arzt, …)
/rolle/[beruf]/dienstplan
/rolle/[beruf]/inbox
/dach/livemap                        Cross-Beruf-Sichten
/dach/konferenz/[id]
/dach/genossenschaft
```

**Lesart:** "Ich begleite Helga heute, in meiner Rolle als Pflegekraft, auf dem Dach Shalem."

### Veraltete Strukturen die rausfliegen

- **`Cockpit`** als Wort — ersetzt durch **Werkstatt** (für Pflege-Werkzeuge) oder **Atrium** (für Cross-Beruf-Sicht)
- **`Module`** in der Navigation — ersetzt durch konkretes Verb ("Verbände wechseln", "Konferenz vorbereiten")
- **`Admin`** als Rolle — ersetzt durch **Stationsleitung** oder **Hüter:in**
- **Hardcoded ShiftType** (`"early"|"late"|"night"`) — vereinheitlicht zu Sowa-Rigpa-/Tageszeit-Sprache (`frueh|mittag|spaet|nacht|aus_dem_rhythmus`)

### Migrations-Strategie

Drei Phasen, je 6-8 Wochen:

**Phase 1 — Aliase**
Neue URLs werden als Aliase auf existierende eingerichtet (Next.js redirects). Nichts bricht.

**Phase 2 — Doppel-Navigation**
Navigation zeigt sowohl alte als auch neue Pfade, mit Hinweis "Heißt jetzt …". 4 Wochen-Window damit Leute sich daran gewöhnen.

**Phase 3 — Alte Pfade als 301**
Alte URLs leiten dauerhaft auf neue um. Bookmarks bleiben funktionstüchtig.

---

## 5 · Berufsgruppen tiefer ausbauen — die 14 jetzt im Detail

### Pflege (✅ tiefer Stand)
*hat:* Cockpit, Schichtplan, Tausch-Markt, Inbox, Konferenz-Card, Schicht-Briefing-Voice, Schicht-Gruppenchat, Krankmeldungs-Workflow, BEM-Trigger
*braucht:* Schicht-File-Historie (jede Schicht hat eine eigene Akte mit allen Doku-Einträgen + Versions-Log)

### Arzt (mittlerer Stand)
*hat:* Cockpit, eAU/eRezept-Stub, Verordnungs-Anfragen-Inbox
*braucht:* Befund-Annotation-Tool, gematik-TI-eAU-Integration, Hausbesuch-Routing

### Therapie (mittlerer Stand)
*hat:* Cockpit, Patient:innen-Liste, Anamnese-Schemas (KGG/MLD/MT), Abrechnungs-Stub
*braucht:* Übungsbibliothek mit Video-Demos, Heilmittel-VO-Pipeline mit Kostenträger-Status

### Sozialarbeit (mittlerer Stand)
*hat:* DGCC-Casemanagement-Cockpit, Hilfeplan, Schutz-Modul, MD-Begutachtung, Anamnese
*braucht:* Antrags-Pipeline (SGB IX/XII/XIV) mit Status-Tracking, Verhinderungspflege-Rechner

### Stationsleitung (✅ tiefer Stand)
*hat:* Dienstplan-Editor, KI-Koordinator, Träger-Import, Genehmigungen, Team-Übersicht, Erlös-Auswertung, Audit-Log, Verifikationen
*braucht:* QM-/MDK-Vorbereitung-Modul, Mitarbeitenden-Entwicklungs-Gespräche

### Klient:in (mittlerer Stand)
*hat:* Akte, Befunde, Wundverlauf, Anamnese, Behandlung, Begleiter, Notiztafel, Self-Booker, Holistik, Tagesfeed, Anomalie, **NEU:** Dienstplan
*braucht:* Stimm-Tagebuch (Sprint-4-Feature), Lebensbuch (Sprint-5+), Vorsorge-Vollmacht-Wizard

### Erziehung (Stub-Stand)
*hat:* Gruppen-Cockpit, Lerngeschichten
*braucht:* Tagesablauf-Editor, Eltern-Kommunikation, BildBilly-Konzept-Doku, ICF-CY-Bezug

### Ehrenamt (mittlerer Stand)
*hat:* Begleitung-Liste, Protokoll-Form, Aufwandsentschädigungs-Log
*braucht:* Hospizdienst-Spezial-Workflow, Trauer-Begleitungs-Modul mit Übergang zur Bestattung

### Heilerziehung (Stub-Stand)
*hat:* Teilhabe, Bildung, Tagesstruktur
*braucht:* BTHG-Gesamtplan-Editor, ICF-Domänen-Zuordnung, BEI-NRW-Konformität

### Hauswirtschaft (Stub-Stand)
*hat:* Einkauf, Kochen, Reinigung
*braucht:* HACCP-Doku-Workflow, Speiseplan-Editor mit Diät-Anforderungen, Wäsche-Track

### Apotheke (✅ neu, mittlerer Stand)
*hat:* eRezept-Eingang, Bestellungen, Lager-Mindest, Wareneingang
*braucht:* DTA-Anlage-19-Abrechnungs-Pipeline, Rezeptur-Modul

### Medizintechnik (✅ neu, mittlerer Stand)
*hat:* Geräte-Versorgung, Service-Tickets, Verordnungs-Pipeline
*braucht:* MPDG-Konformitäts-Checks, Wartungs-Kalender-Push, BfArM-Vorfall-Meldung

### Rettungsdienst (✅ neu, mittlerer Stand)
*hat:* Einsatz-Live, Fahrzeug-Disposition, Verlegung-Anforderungen
*braucht:* Leitstellen-Anbindung (ELS-Pro), FMS-Status-Code-Push

### Bestatter (✅ neu, mittlerer Stand)
*hat:* Aktuelle Fälle, Vorsorge, Trauerfeier-Termine
*braucht:* Sozialhilfe-Bestattung-Workflow § 74 SGB XII, Lebensbuch-Übergabe-Pipeline

### Würde-Begleitung (✅ neu, mittlerer Stand)
*hat:* Aktive Begleitungen, Anfragen, Qualifikations-Pool, Disclaimer-Standard
*braucht:* Schulungs-Bibliothek, Supervision-Termin-Editor, Selbstfürsorge-Modul

---

## 6 · Drei harte 30-Tage-Schritte

1. **Schicht-File-Historie pro Schicht** (eigene Akte pro Schicht, append-only Doku, Audit-Log) — schließt das Versprechen, dass jede Schicht digital nachvollziehbar bleibt
2. **DACH-Aliase live** — `/begleitung-von/[id]` und `/rolle/[beruf]` als Next.js-Redirects → keine Demo-URL bricht, aber das DACH-Konzept ist erfahrbar
3. **Klient-Stimm-Tagebuch** (Sprint-4 aus Strategie-Memo) — verbindet Maxime 2 (Stimme vor Text) und Maxime 5 (Klient in der Mitte) in einem Feature

---

## 7 · Was DACH NICHT ist

- ❌ Eine Refaktorierung der Datenbank
- ❌ Ein Multi-Tenant-Mandanten-Switch (das ist Phase-2-DB-Arbeit)
- ❌ Ein neuer Brand-Anstrich oben drauf
- ❌ Eine Marketing-Botschaft ohne Code-Konsequenz

DACH ist die **konzeptuelle Vereinheitlichung** der UI-Sprache + Navigation, die wir schrittweise umsetzen, ohne Demo-Continuity zu brechen.
