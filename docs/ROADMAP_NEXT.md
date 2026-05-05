# Roadmap · weitere Inhalte für Demo + Phase 2

**Stand:** 2026-05-05 nach Cross-Profession-Verlinkung
**Zustand:** Demo läuft komplett. Alle 8 Berufsgruppen + Klient + Lead + Kasse haben
eigene Cockpits + Sub-Routes. Cross-Profession-Verlinkung über `team-um-klient`-
Store + AndereBegleiter-Komponente. PersonaSwitcher als Dropdown mit allen 10 Rollen.

## Was als nächstes gut tut

### A · Cross-Profession-Workflows (Demo-Storytelling)

**A1 · Konferenz-Modul** (`/konferenz` + Sub-Routes je Beruf)
- Alle Begleiter:innen einer Klientin tagen 1×/Quartal gemeinsam
- Pre-Read: jede Berufsgruppe sendet Update vorher
- Live-Notes während der Konferenz
- Konsolidierter Behandlungsplan-Update
- → FHIR `Encounter` mit `class: case-conference` + `participant[]`

**A2 · Cross-Profession-Inbox** (Erweiterung der Verordnungs-Anfragen)
- Pflege fragt Therapie nach KGG-Empfehlung
- Sozialarbeit fragt Pflege nach PG-Antrag-Daten
- Ehrenamt informiert Pflege über Verschlechterung
- → eine zentrale Inbox je Berufsgruppe mit Antwort-Workflow

**A3 · Klient-Notiztafel** (`/klient/notizen`)
- Klient kann Wünsche, Sorgen, Fragen für die Konferenz vor-eintragen
- Wird im Konferenz-Pre-Read angezeigt
- Klartext-Wrapper für Fachbegriffe

### B · MD-Begutachtung-Workflow

Helga Reinhardts PG-Erhöhung (3 → 4) ist im Sozial-Cockpit angedeutet —
entwickeln zu einem vollständigen Workflow:

- `/sozial/md-begutachtung/[klientId]` — Antrags-Übersicht
- Mira (Sozial) lädt Vorbefunde aus der Akte (Wundverlauf, Befunde, Mobilitäts-Score)
- MDK-Vorlage automatisch ausgefüllt (NBA-Modul Bewertung)
- Termin mit MDK terminieren · Klient + Tochter eingeladen
- Bescheid-Tracking: erwartete Antwort, Widerspruch-Frist
- → in Phase 2: gematik TI · BIK-MEK-Schnittstelle

### C · Verhinderungspflege § 39 SGB XI

Bereits im Self-Booker angedeutet:

- Klient bucht Verhinderungspflege selbst
- Pflegekassen-Budget-Auslastung sichtbar (1.685 €/Jahr ab PG 2)
- Antrag automatisch generiert, Begleitperson trägt Stundenzettel ein
- Auszahlung an Begleitperson über Stripe Connect Treuhand
- → in Phase 2: Pflegekassen-Direktantrag, kein Vorschuss-Risiko

### D · Pflegegrad-Antrag für Neueintritte

Wenn jemand in den Self-Booker einsteigt ohne PG:
- Antrags-Wizard mit NBA-Modulen
- Gewichtung nach 6 Modulen (Mobilität / Kognition / Verhalten / Selbstvers. / Therapie / Soziales)
- Score → erwartete PG-Zuordnung
- Antrag direkt aus dem Cockpit an Pflegekasse

### E · Demo-Tour vervollständigen

HANDOFF erwähnt: Lead-Loop fehlt. Plus:
- `loop-persona-lead.mp4` neu generieren (Asset-Brief Block 1.3 ist da)
- DemoTour-Komponente erweitern: pro Persona ein Loop + 3-Slide-Story
- "Try it yourself"-Button am Ende → springt in die Persona-Sicht

### F · i18n vervollständigen

Aktuell DE/EN auf Kernflächen, viele Detail-Strings nur DE.
- Locale-Dateien für die neuen Berufe (Therapie/Sozial/Erziehung/Ehrenamt)
- Locale-Dateien für Befunde-Akte + Anamnese-Schemas
- Locale-Dateien für Genossenschaft + Self-Booker

### G · Klartext-Spread

In `/klient/akte` (Hauptseite) bereits aktiv. Erweitern auf:
- Befund-Texte in `/klient/akte/befunde`
- Anamnese-Antworten (read-back)
- Wundverlauf-Befundtexte
- Tibetisch-Deutung-Begriffe (rLung/Tripa/Beken erklären)

### H · Marketing- + Onboarding-Flow

**Genossenschaft beitreten** (`/genossenschaft/beitreten`):
- 4-Schritt-Wizard: Person → Typ (Pflege/Klient/Träger/...) → Anteile (1+ × 100 €) → Bestätigung
- SEPA-Mandat-Vorbereitung für Phase 2
- Satzungs-Annahme als Checkbox + downloadable PDF
- Eintrag im Mitglieder-Register sofort sichtbar (Demo)

**Marketing-Page** (`/warum`):
- Differenzierung zu Honorar-Verleihern (4 % statt 30–50 % Cut)
- Mondragon-Modell mit Zahlen
- Testimonials der Demo-Personae („Was es für mich verändert")
- Press-Quotes-Slot

### I · Stripe Connect Treuhand-Modul (Phase 2 vorbereitet)

- `lib/treuhand/store.ts` mit States: reserved → captured/released/refunded
- Admin-Sicht: Treuhand-Bilanz · welche Beträge sind wo
- Klient-Sicht: meine offenen / freigegebenen Beträge
- Pflegekraft-Sicht: meine ausstehenden Auszahlungen

### J · Push-Notifications

Web-Push (VAPID) für:
- Aktive Schicht (Reminder 30 min vorher)
- Vertretungs-Anfrage offen (für betroffene Pflegekräfte)
- Konferenz-Termin (Tag vorher + 1 h vorher)
- Wundverband fällig (Pflegekraft-Sicht)
- Verordnung freigegeben (Klient-Sicht)

### K · Hauswirtschaft + Heilerziehung Cockpits

Phase D hat 4 von 6 Berufen abgedeckt — fehlt:
- `/hauswirtschaft` · Speiseplan, Diäten, Wäsche-/Reinigungs-Routen
- `/heilerziehung` · BTHG-Teilhabe, persönliches Budget, ICF-Befund

### L · Kinder- und Jugendhilfe-Erweiterung

Erziehung hat heute Kita-Sicht. Erweitern um:
- Hort / Schule (8a-Workflow tiefer)
- Jugendarbeit (offene Räume)
- Heimerziehung

### M · Ärztliche Spezialisierungen

Heute: nur Allgemein-/Hausarzt.
- Kinderarzt-Sicht (U-Untersuchungen)
- Facharzt-Sicht (Überweisung-Inbox)
- Psychiater/Psychotherapie

### N · Notfall-Modul

- Klient-Notruf-Knopf (TalkVisitDevice-Integration)
- Pflegekraft-Notruf an Stationsleitung
- Eskalations-Kette: Notdienst → Hausarzt → Klinik
- Live-Karte: wer ist nächste verfügbare Hilfe

---

## Priorisierungs-Empfehlung

**Wenn als nächstes Demo-Story:** A1 Konferenz + A2 Cross-Inbox + B MD-Begutachtung
→ macht das Genossenschafts-Versprechen "alle koordiniert" greifbar

**Wenn als nächstes Vermarktbarkeit:** H Marketing + Onboarding + E Demo-Tour
→ Selbstbedienung für Interessent:innen

**Wenn als nächstes Phase 2:** I Treuhand + J Push + Phase-2-Driver-Switch
→ Bereitschaft für echte Auszahlungen + Echtzeit-Layer

**Wenn als nächstes Tiefe:** K Hauswirtschaft + Heilerziehung-Cockpits + L Erweiterung
→ alle Berufsgruppen vollständig vertreten
