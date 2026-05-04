# Shalem Care · Session-Handoff

Stand: 2026-05-05 · für die nächste Session.

## Was läuft live

- Demo-Domain: **shalem.de** (Hostinger Node.js, Auto-Deploy via GitHub-Push)
- Repo: <https://github.com/dkorn85/shalem-care>
- Build: `tsc --noEmit` exit 0 · `next build` exit 0 · ~45 Routen
- Demo-Mode: `NEXT_PUBLIC_DEMO_MODE=1` aktiviert Banner + Persona-Switcher

---

## Vier Rollen, vier Zuhause-Räume

Jede Rolle hat eine eigene Shell, eigenen Persona-Avatar, eigene Navigation,
eigene Cockpits. Die Branchen-Konkurrenz (Vivendi, MediFox, medatixx, CGM,
ePA) ist als Quintessenz integriert — jeweils umgeframed durch das
Salutogenese-/Balance-Prinzip.

### 🩺 Pflegekraft — „Meine Zeit, mein Balance-Akt"
**Routen:** `/`, `/dienst`, `/dienst/[klientId]`, `/profil`, `/profil/krankmeldung`, `/tausch`, `/tausch/anbieten`

**Quintessenz aus Vivendi/MediFox/Senso integriert:**
- SIS-Strukturmodell mit 6 Themenfeldern, Risikomarkern, Berichteblatt
- Komplette Medikamentenliste mit BtM/PRISCUS, Vergabe pro Tageszeit
- Bilanzierung (Trink/Ess/Vitalwerte) mit Tages-Soll-Anzeige
- Wundverlauf mit Verbandwechsel-Doku

**Was wir hinzugefügt haben (umgeframed):**
- Burnout-Radar mit Auto-Vergütungserhöhung wenn keine Vertretung gefunden wird
- Schicht-Chat mit KI-Coach + Doku-Stream
- Krankmeldung mit Tele-AU-Stub + Auto-Vertretungs-Bonus 15-30 %
- KI-Schichtbriefing über alle Klienten der Station
- Therapie-Vorschläge mit Cochrane/AWMF/DNQP-Quellen + Komplementärmedizin (Kneipp, Aromatherapie, TCM, TIM)

### 🌿 Klient:in — „Volle Transparenz, einfache Sprache"
**Routen:** `/klient`, `/klient/akte` (★ neu), `/klient/anfrage`, `/klient/bewertung`

**Quintessenz aus ePA, Vivy, Doctolib:**
- Komplette Akteneinsicht: alle Doku-Einträge, Diagnosen, Verordnungen
- Medikamentenplan mit Wirkungs-Erklärungen
- Termine, Anfragen, Wundverlauf
- Bewertungen anonym

**Was wir hinzugefügt haben:**
- **Klartext-Komponente** (`<Klartext>`): Fachbegriffe sind unterstrichen,
  Klick zeigt Erklärung im Tooltip — `lib/klartext/glossar.ts` mit ~45 Einträgen
  (Diagnosen, Wirkstoffe, Untersuchungen, Skalen, Doku-Begriffe).
- **Salutogenese-Balance-Check**: Antonovsky-Kohärenzgefühl + SHALEM-Elemente,
  mit Verlaufs-Sparkline und Gibt-Kraft / Zehrt-Kraft-Eingabe.
- **Lebensziele**: Klient formuliert in eigenen Worten („Ich möchte bis zum
  Garten laufen können"), Pflege passt Maßnahmen an die Ziele an, nicht umgekehrt.
- **Verordnungs-Anfragen direkt vom Klient an den Arzt**: 8 Kategorien
  (Medikament, Heilmittel, HKP, Hilfsmittel, Psychotherapie, Überweisung, AU).
- **Risiko-Erklärungen in Klartext**: jeder Risikomarker wird in Alltagssprache
  übersetzt („Sturzgefahr → wir achten auf Schuhwerk und üben Bewegung gemeinsam").

### 📋 Stationsleitung — „Ich steuere mein Team mit Fürsorge"
**Routen:** `/admin`, `/admin/dienstplan`, `/admin/dienstplan/import`, `/admin/dienstplan/koordinator`, `/admin/dokumentation`, `/admin/erloes`, `/admin/disposition`, `/admin/genehmigungen`, `/admin/team`, `/admin/zahlungen`, `/admin/auswertung`, `/admin/aktivitaet`

**Quintessenz aus Vivendi PEP, Hera Cloud, aidminutes:**
- Editierbarer Dienstplan mit Klick-zum-Anlegen/Tausch/Löschen
- KI-Disposition mit erklärbaren Match-Scores
- Stations-Wirtschaftlichkeit (Erlös/Personalkosten/Deckungsbeitrag)
- ArbZG-Validierung im Hintergrund
- Genehmigungs-Workflow

**Was wir hinzugefügt haben:**
- **Träger-Roster-Import**: Krankenhäuser laden CSV/JSON ihrer freien Schichten,
  werden über genossenschaftlichen Pool besetzt.
- **Cross-Einrichtungs-KI-Koordinator**: alle freien Slots mit Top-3-Vorschlägen
  + harten Constraints (ArbZG, Qualifikation), Greedy-Konfliktlösung.
- **Compliance-Cockpit**: Burnout-kritische Mitarbeiter werden auf Admin-Home
  prominent angezeigt — Fürsorge wird sichtbar.
- **Erlös pro Kostenträger**: SGB XI/V/IX/VIII/XII + KiBiZ getrennt aufgeschlüsselt.

### 👩‍⚕️ Arzt:Ärztin — „Meine ganze Praxis im Blick"
**Routen:** `/arzt`, `/arzt/anfragen`, `/arzt/anfragen/[id]`, `/arzt/patienten`, `/arzt/patient/[id]`

**Quintessenz aus medatixx, CGM, T2med, x.isynet:**
- Praxis-Cockpit mit Quartals-Schein-Stand + Abrechnungs-KPI
- Tagesplan mit Patient-Slots, Video-Terminen
- ICD-10-GM-Schnellsuche (~40 häufigste Codes)
- Karteikarte je Patient mit Verordnungs-Historie
- eRezept-Code-Generierung

**Was wir hinzugefügt haben:**
- **Verordnungs-Anfragen-Inbox**: Pflege + Klient stellen direkt Anfrage,
  Arzt entscheidet mit klinischem Kontext (Risiken, Verordnungen, Doku) —
  Verordnung fließt automatisch in die Klientenakte.
- **Klinischer Kontext sichtbar bei jeder Anfrage**: aktive Risiken, letzte
  Doku-Einträge, aktive Verordnungen, BtM/PRISCUS-Marker.

### 💶 Krankenkasse — „Eingangskorb statt Aktenstapel"
**Routen:** `/kasse`, `/kasse/vorgang/[id]`, `/kasse/abrechnung`

**Quintessenz aus GKV-Verwaltungs-Software (TKK Online, AOK Plus, ProKlin):**
- Eingangskorb mit Status-Filter (eingegangen / in Prüfung / Rückfrage / genehmigt / abgelehnt)
- Vorgangs-Detail mit 4-Klick-Entscheidung
- Datenträgeraustausch (DTA) als CSV nach SGB XI Anlage 5 / SGB V § 302
- IK-Nummern + Versicherungsnummern (Demo)

---

## Architektur-Map

### Server-State (alles in-memory, Phase 2 → FHIR/Medplum)
```
lib/swap-store-memory.ts    Slots, Personen, Tausch-Offers
lib/doku/doku-store.ts       SIS-Doku-Einträge
lib/medikation/store.ts      Verordnungen + Vergaben
lib/abrechnung/store.ts      Erbrachte Leistungsmodule
lib/krankmeldung/store.ts    Krankmeldungen + Arzttermine
lib/verordnung/store.ts      Anfragen Pflege/Klient → Arzt
lib/dispo/store.ts           Roster-Imports + Audit-Log
lib/kostentraeger/store.ts   Kassen-Vorgänge
lib/salutogenese/store.ts    Balance-Checks
lib/selbstbestimmung/store.ts Lebensziele + Wunschpflegekraft
lib/bilanz/store.ts          Tagesbilanz Trink/Ess/Vitalwerte
lib/chat/store.ts            Schicht-Chat-Nachrichten
```

### KI-Layer
```
lib/ai/provider.ts           Provider-Abstraktion (DeepSeek + Mock)
lib/ai/doku-ai.ts            SIS-strukturierte Doku-Vorschläge
lib/ai/schichtbriefing.ts    Stations-Briefing für Schicht-Start
lib/ai/therapie-vorschlaege.ts Individualisierung von Standards
lib/ai/chat-coach.ts         Schicht-Chat-Suggestions
```

### Wissensbasis
```
lib/therapie/studien.ts      9 evidenzbasierte Briefs mit Cochrane/AWMF/DNQP-Quellen
lib/therapie/alternativ.ts   16 komplementäre Methoden (Kneipp, TCM, TIM, Aromatherapie)
lib/heilkunst/hausmittel.ts  25 Hausmittel-Anwendungen aus Hausmittelrunde 3.0
lib/heilkunst/philosophie.ts 13 Kapitel des Pflege-Handbuchs (Salutogenese, Mind-Body)
lib/medikation/katalog.ts    ~35 deutsche Wirkstoffe mit ATC, PZN, BtM, PRISCUS
lib/abrechnung/module.ts     ~35 Leistungsmodule über 10 Kostenträger
lib/klartext/glossar.ts      ~45 medizinische Begriffe in Alltagssprache
lib/arzt/icd10.ts            ~40 häufigste ICD-10-Codes (Hausarzt + Geriatrie)
```

### Domain-Logic-Engines
```
lib/match/                   Kandidat-Slot-Matching mit erklärbaren Scores
lib/dispo/coordinator.ts     Multi-Slot-Disposition mit Greedy-Konfliktlösung
lib/burnout/risk.ts          Risiko-Score 0-100 mit Trigger-Liste + Auto-Bonus
lib/krankmeldung/auto-replacement.ts Vertretungs-Bonus 15-45 % je Schicht
lib/erloes/erloes.ts         Pflegegrad-Pauschale + Modul-Erlöse pro Kostenträger
lib/kostentraeger/dta.ts     DTA-CSV-Export (SGB-konform)
lib/dispo/parser.ts          CSV/JSON-Parser für Träger-Roster (DE/EN-tolerant)
```

### UI-Shells
```
components/AppShell.tsx      Pflege/Lead/Arzt (sidebar + bottom-nav, mit Persona-Switcher)
components/KlientShell.tsx   Klient (eigener Header mit Avatar + Klient-Bezug)
components/KasseShell.tsx    Kostenträger (Tabs für Eingangskorb / Abrechnung)
```

### Avatare & Branding
```
public/klienten/  klient-{hr,wb,eg,rk,im,fl,mc,ko}.png  Greenscreen-keyed
public/people/    person-{dr,ls,as-005,arzt-001,arzt-002,tg-lead}.png
public/og/        arzt.png · dienst.png · erloes.png · krankmeldung.png
public/loops/     loop-persona-{pflegekraft,klient,arzt}.mp4
public/icon-maskable.png  PWA-Icon
```

---

## Was als nächstes ansteht

### Priorität A · Demo-Schliff
- [ ] **Dispo-Disposition-Page** (`/admin/disposition`) mit dem Coordinator wiederbeleben — der nutzt noch die alte runMatchEngine-Pfade
- [ ] **Wundverlauf mit Foto-Doku** — bisher nur in der SIS-Doku als Text
- [ ] **Lead-Burnout-Detail-Drilldown**: Klick auf kritischen Mitarbeiter → seine Schicht-Historie
- [ ] **Klartext überall**: `<Klartext>`-Wrapper in mehr Doku-Texten verwenden (aktuell nur Klient-Akte)

### Priorität B · Genossenschafts-Logik
- [ ] **Genossenschaftsanteile-Page** (`/genossenschaft`): pro Person sichtbar wie viel Anteil sie hat, Auszahlungs-Historie
- [ ] **Plattform-Ausschüttung**: 4 % Plattform-Cut → wie wird er auf die Mitglieder verteilt?
- [ ] **Self-Booker-Workflow**: PG ≥ 2 Klient bucht direkt aus dem Pool, Marktpreise transparent

### Priorität C · echte Schnittstellen (Phase 2)
- [ ] **gematik TI-Konnektor**: eAU + eRezept echt versenden
- [ ] **Medplum-Driver**: SHALEM_STORE=medplum mit echtem FHIR-Backend
- [ ] **Stripe Connect**: Auszahlungen an Genossenschaftsmitglieder
- [ ] **Keycloak-Auth**: HBA/eGK-fähig, Mandanten-Trennung
- [ ] **Push-Notifications**: Web-Push für aktive Schicht / Vertretungs-Anfrage

### Priorität D · weitere Berufe
- [ ] **Therapeut-Eigenshell** (Heilmittelerbringer): Verordnungs-Annahme, Behandlungsplan, Heilmittelposition-Abrechnung
- [ ] **Sozialarbeit-Eigenshell** mit Hilfeplan SGB VIII / SGB IX
- [ ] **Erziehung/Kita-Sicht** mit Bildungs- und Lerngeschichten
- [ ] **Ehrenamt-Sicht**: Aufwandsentschädigung, Begleitprotokoll

---

## Bekannte Limitierungen

1. **In-Memory-State**: Bei Server-Neustart sind alle Demo-Daten weg. Seeds laufen automatisch wieder, aber User-Eingaben (neue Doku, neue Verordnungen, neue Balance-Checks) gehen verloren.

2. **Mock-KI-Provider**: Ohne `DEEPSEEK_API_KEY` läuft alles im Mock-Modus mit deterministischen Antworten. Funktional, aber nicht beeindruckend.

3. **Avatar-Set unvollständig**: Nur 8 Klient + 6 Person-Avatare. Alle anderen Personen fallen auf Initialen-Bubbles. Asset-Brief in `docs/ASSETS_NEEDED.md`.

4. **Demo-Tour**: 3 Persona-Loop-Videos sichtbar, Lead fehlt noch.

5. **i18n teil-übersetzt**: Kernflächen DE/EN, viele Detail-Strings nur DE.

---

## Demo-Persona-Cheat-Sheet

| Rolle | Login | Name | Persona-ID |
|---|---|---|---|
| Pflegekraft | `/` | Dennis Reuter | `person-dr` |
| Klient:in | `/klient` | Helga Reinhardt (PG 3, Demenz mittel) | `klient-hr` |
| Stationsleitung | `/admin` | Detektiv Eins | `person-de1` |
| Arzt | `/arzt` | Dr. Susanne Hartmann | `person-arzt-001` |
| Krankenkasse | `/kasse` | Sandra Lehmann (AOK Nordost, IK 100000031) | — |

Wechsel zwischen Rollen während Live-Demo: **Persona-Switcher** im Header (sichtbar wenn `NEXT_PUBLIC_DEMO_MODE=1`).

---

## Reset-Anleitung

```bash
cd C:\Users\dkorn\Downloads\shalem-care-v0.1.0\shalem-care
git pull
npm run build      # ergibt apps/web/.next/standalone/apps/web/server.js
npm start          # localhost:3000
```

Hostinger zieht bei `git push` automatisch den neuen Stand.

---

## Diese Session in 5 Punkten

1. Avatare bekamen Greenscreen-Keying (~440k Pixel transparent pro Bild) — sehen jetzt clean ohne weiße/grüne Hintergründe aus.
2. Kostenträger-Portal `/kasse` mit Eingangskorb, Vorgangs-Entscheidung, DTA-Export — komplett eigene Träger-Sicht.
3. Klient-Akte `/klient/akte` mit voller Transparenz und `<Klartext>`-Komponente: Fachbegriffe sind unterstrichen und per Klick erklärt — `lib/klartext/glossar.ts` mit ~45 Einträgen.
4. Berufs-Cockpits in der Quintessenz der jeweiligen Branchen-Software: Pflege bekommt Bilanzierung (Vivendi/MediFox), Arzt bekommt Praxis-Cockpit mit Quartal-KPI + ICD-10-Suche (medatixx/CGM), Lead bekommt Wirtschaftlichkeits- und Compliance-Cockpit (Vivendi PEP).
5. Salutogenese-Balance-Check und Patient-Selbstbestimmungs-Lebensziele wurden in Pflege- und Klient-Sicht beidseitig integriert — der Klient setzt eigene Worte, die Pflegekraft hört zu und passt Maßnahmen an.

Build clean, ready to push.
