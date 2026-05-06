# Plan-Evaluation · Stand 2026-05-06

Ehrliche Bilanz nach 8 Cycle-Iterationen mit Multi-Agent-Audit.
Format: **Was war geplant · Was steht · Was offen ist · Was ich heute anders machen würde.**

---

## 1 · PLAN_MODULAR (Tier-1-Primitives + Marketing-Refactor)

### Was war geplant
Top-5-Hebel: AccentCard, HeroBanner, SectionHeader, MediaSplit, RevealOnScroll. ~1200 LoC ersparbar mit ~4 Tagen Refactoring.

### Was steht ✓
- Alle Tier-1-Primitives existieren als Top-Level-Components
- Tier-2 ergänzt: StatTile (Count-up), NumberedList (3 Varianten), Rainbow (Wrapper), BulletList (4 Marker)
- **6/7 Marketing-Pages refactored:** treuhand · warum · notfall · compliance · registrieren · landing (PILLARS + Schlussstein-Section + Footer)
- HeroBanner mit `loop`-Layer, `tall|wide|split`-Varianten, Akzent-Linie pro Rolle
- SmoothReveal-Cascade als Standard-Reveal-Pattern

### Was offen ist
- `/admin` (244 LoC) — ist Cockpit nicht Marketing, anderer Refactor-Kontext nötig
- HoverGlow, PageTransition, RoleTheme-Wrapper — Tier-3-Items aus dem Plan, nicht gebaut (geringer Hebel)
- Hausmittel-Liste auf Landing — komplex, eigener Design-Pass nötig

### Was anders
Die Reihenfolge war richtig. Was ich unterschätzt habe: das german-quote-Problem (`„...""`) mit ASCII-Doppel-Anführungszeichen am Ende → führte zu Hostinger-Build-Crash. Heute: defensiv ASCII-only in JS-Strings, nur in JSX-Text Typografie-Quotes.

---

## 2 · STRATEGIE_TEAM_WOW · Sieben Wow-Features

### Was war geplant
1. Lana-im-Anruf · 2. Mein-Tag-Feed · 3. Anomalie-Sanftansage · 4. Konferenz-Klartext · 5. Stimm-Tagebuch · 6. Übergabe-Voice · 7. Lebensbuch.

### Was steht ✓
- **#4 Konferenz-Klartext** — `KonferenzKlientBriefing` + `KiBerufsBruecke` unter Live-Protokoll auf Konferenz-Detail-Page
- **#2 Mein-Tag-Feed** — `TagesfeedClient` + `/klient/tagesfeed`-Route existieren bereits, von Akte verlinkt
- **#3 Anomalie-Sanftansage** — `AnomalieEinSatz`-Component existiert
- **#6 Übergabe-Voice** — `SchichtBriefingClient` mit Audio-Output existiert

### Was offen ist
- **#1 Lana-im-Anruf** — größter PR-Hebel laut Strategie. Braucht Twilio-Integration, ~3 Wochen.
- **#5 Stimm-Tagebuch** — Voice-In + KI-Strukturierung in Anamnese-Felder. ~3-4 Wochen.
- **#7 Lebensbuch** — laut Strategie höchste DSGVO-Sensitivität, nicht vor Beirat-Säule-D-Freigabe.

### Was anders
Ich hätte #1 (Lana-im-Anruf) als Demo-Stub mit fest-aufgenommener Lana-Stimme + simuliertem Anruf-Flow bauen können — auch ohne Twilio überzeugt der Wow-Effekt für Pitches. Pragmatischer als komplette Twilio-Pipeline.

---

## 3 · KI als Schnittstelle zwischen Berufen (User-Wunsch)

### Was steht ✓
- **`KiBerufsBruecke`** mit 11 Ziel-Berufen (klient, pflege, arzt, therapie, sozialarbeit, heilerziehung, ehrenamt, hauswirtschaft, erziehung, apotheke, lead)
- API erweitert: `KlartextBeruf` 5 → 17 Quell-Berufe, neuer `KlartextZiel`-Parameter
- Eingebaut auf `/ki`-Showcase-Page (vierte Demo-Sektion mit MRT-Befund), Konferenz-Detail-Page (unter Live-Protokoll), Station-Cockpit (unter letzter Chat-Nachricht)
- Pflegekraft schreibt → ein Klick übersetzt für Klient/Therapie/Sozialarbeit

### Was offen ist
- Auto-Klartext-Auto: bei `klartextAuto: true` automatisch nach jeder Doku-Speicherung Klartext-Output anhängen (Stub-Hook in der Profile-Preferenz, nicht verdrahtet)
- Kosten-Sichtbarkeit per Mitglied — heute unsichtbar in Backend-Kosten

---

## 4 · Solidar-Topf (Krankheit + Verdienstausfall)

### Was steht ✓
- `lib/solidartopf/store.ts` mit Caps (3500/Claim, 8000/Jahr, 30 Tage), Reserve-Quote-Schutz 30 %
- `lib/solidartopf/calc.ts` — pure Berechnung Tag 1-6 zu 100 %, 7-42 zu 70 %
- **Auto-Claim aus `meldeKrank`** — Krankmeldung erstellt direkt Claim ohne manuelles Antragstellen
- `/genossenschaft/solidartopf` mit 5 KPIs, Approval-UI für Stationsleitung, Profil-Card mit Jahres-Rest, Admin-Tile
- Hero, Loop (`topf-fluss.mp4`) und Icons (`topf-schutz`, `krankenschutz`) generiert + verdrahtet

### Sustainability-Befund
Bei aktuellen 5.000 €/Jahr Zufluss → nur ~6,7 Schadensfälle gedeckt. **Empfehlung im Code**: Plattform-Cut von 4 % → 5 % (über Mitgliederversammlung), neue Aufteilung 2 % / 0,5 % / 1 % / 1,5 % Solidar-Topf → ~7.500 € pro Jahr Zufluss. Plus Opt-In aus Quartals-Ausschüttung.

### Was offen ist
- Stripe-Connect-Auszahlung (heute nur Status-Toggle, keine echte Buchung)
- Berufsunfähigkeits-Add-On + Eltern-Topf (Phase-2)
- Topf-Reserve in Genossenschaftsbank parken — Zinsen finanzieren Mehrung

---

## 5 · Genossenschafts-Pool (Arbeitsamt-Ersatz)

### Was steht ✓
- `/genossenschaft/pool` mit 6 Demo-Stellen, 4 Bedarfen, KI-Match-Score
- Bewerbungs-Lifecycle: eingegangen → in_pruefung → zugesagt | abgesagt mit Status-Icons
- Vergleich Bundesagentur vs Pool als zwei nebeneinander BulletLists (6 Tage statt 42)
- Hero (`header-pool`) + Match-Icon (`match-pool`) verdrahtet

### Was offen ist
- Echte Schnittstelle zur Bundesagentur (X-API) — Phase-2
- DACH-Erweiterung Österreich (AMS) + Schweiz (RAV) — Phase-2
- Match-Engine die Burnout-Frühwarnung berücksichtigt — `lib/burnout/` existiert, aber nicht mit Pool gekoppelt

---

## 6 · Profil-System (User-Wunsch)

### Was steht ✓
- `lib/profile/store.ts` mit Bio, Lebensmotto, Hobbys, **Sprachen mit Niveau** (14 Sprachen + Gebärdensprache, mit Niveau-Icons mutter/verhandlung/alltag/grund), Lebensziele, typischer Tag, Erreichbarkeit
- `PreferencesPanel` mit Sprache (DE/EN), Audio Lana/Dennis, Klartext-Auto, Push, E-Mail, Schicht-Erinnerung, **Larger-Print-Toggle 18 px**
- `ProfilbildUpload` mit Drag&Drop + Client-Resize 512 px + Datei-Picker
- Mitglied-zu-Mitglied-Matching-Logik existiert konzeptionell (Sprachen für Pflegekraft-Klient-Match)

### Was offen ist
- Profilbild-Fallback-Avatare (Block 40 im Asset-Brief) — 6 generische Stand-Ins noch nicht generiert
- Onboarding-Flow der ein neues Mitglied durch alle Profil-Felder führt (heute alles inline-editierbar)

---

## 7 · Accessibility (User-Wunsch · ungelöst bis heute)

### Was steht ✓
- `GlobalLiveRegion` mit polite + assertive aria-live-Channeln, exportierte `announce()`-Funktion
- Skip-Link „Zum Inhalt springen" im Layout
- SosButton ruft `announce()` pro Eskalations-Stage
- Kontrast-Tokens **heute deutlich gezogen**: fg-mute 70/68/58 (~7:1 AAA), fg-soft 105/100/88 (~4.6:1 AA)
- `prefers-contrast: more`-Support — bei Browser-Hochkontrast-Modus noch dunklere Texttokens
- Larger-Print-Mode (18 px Body via `data-large-print`-Attribut) im Profil
- Body-Default jetzt 16 px / 1.55 Line-Height (vorher Browser-Default ohne explizite Zeilenhöhe)
- HeroBanner-Bottom-Gradient stärker (jetzt 78 % Bg-Opacity bei 65 % Höhe statt 5 % bei 35 %)

### Was offen ist
- 50+ `text-[10px]` / `text-[11px]`-Stellen — viele sind chips/eyebrows (OK), einige sind Content (kritisch). Audit-Liste vom Subagent hat Top 20 mit Schweregrad — abarbeiten.
- Form-Labels: viele Inputs nutzen nur Placeholder. 5 in VerordnungsAnfrageForm gefixt, viele weitere offen.
- Tab-Order auf komplexen Pages (DienstplanEditor, MedikationsListe) — nur teilweise.
- Dark-Mode existiert nicht — sehbehinderte User mit Lichtempfindlichkeit nicht bedient.
- Voll-Voice-Modus (kompletter Page-Vorlese-Layer für Blinde) — `announce()` ist die Basis, aber kein „komplette-Page-vorlesen"-Knopf.

### Was anders
Hätte ich von Anfang an statt der `text-[10px]`-Tailwind-Inline-Klassen ein `Text`-Component mit semantischen Größen gemacht (`text-eyebrow` / `text-body` / `text-helper`), wäre der A11y-Fix heute ein einziger Token-Bump statt 50 Einzel-Edits.

---

## 8 · Was strukturell strategisch fehlt

1. **Echte Persistenz** — alles in-memory ist Phase 1. Phase 2 mit Supabase fehlt fast komplett. Mit jedem Server-Restart sind Demo-Daten weg, aber neue Daten auch.
2. **Auth ist halbfertig** — Google live, alle anderen Provider nur Stub. Für Pilot-Kunden zu wenig.
3. **Tests** — `lib/match/__tests__/engine.test.ts` ist die einzige Test-Datei. Keine Integration-Tests, kein E2E.
4. **TI-Konnektor** — gematik-Pflicht ab Dezember 2026. Heute: Stub. Entscheidung Q3: andocken bei Famedly oder selbst zertifizieren.
5. **DSGVO-Folgenabschätzung** — Art. 35 mit externem DSB. Geplant, nicht gestartet. Vor Pilot-Vertrag Pflicht.
6. **Externe API** — heute keine. Nächster Cycle (siehe `docs/API_EXTERNAL.md`).

---

## Empfehlung für die nächsten 30 Tage

| Rang | Aufgabe | Wirkung | Aufwand |
|------|---------|--------|---------|
| 1 | DSGVO-FA + AVVs (Art. 28/35) starten | hoch · Pilot-Block | 5 Tage extern |
| 2 | Externe API v0.1 (siehe API-Doc) | sehr hoch · Pilot-Verkauf | 5 Tage |
| 3 | Lana-im-Anruf als Demo-Stub | hoch · PR-Hebel | 3 Tage |
| 4 | A11y top-20 abarbeiten | mittel · Marken | 2 Tage |
| 5 | TI-Andock-Entscheidung treffen + Famedly-Kontakt | strategisch | 1 Tag Sondierung |
| 6 | Beirat aufbauen (3 erste Anschriften) | strategisch | laufend |

Die **strukturellen Lücken** (Persistenz, Tests, TI) sind größer als die noch fehlenden Features. Eine Demo überzeugt — ein Pilot-Kunde fragt nach Persistenz, Audit-Log-Hash-Kette, TI, AVV. Heute könnte kein Pilot-Vertrag unterschrieben werden.

---

## Was die Genossenschaft braucht, was im Code nicht steht

- Mitgliederversammlungs-Tool (Abstimmungen, eine-Person-eine-Stimme)
- Quartals-Bilanz mit echter Bank-Anbindung
- Pflicht-Anteils-Buchung bei Beitritt + automatische Stornofrist 14 Tage
- Genossenschaftsregister-Eintrag (rechtlicher Status — eG i. Gr.)
- Aufsichtsrat + Vorstand-Trennung in Auth-Rollen

Das fehlt bewusst in der App, weil das Genossenschafts-**Werk** außerhalb des Codes lebt (Notar, Genossenschaftsverband, Bank). Die App ist Werkzeug, nicht Treuhand selbst.

---

**Fazit:** Solide Demo-Plattform mit klarer Marken-These, aber Pilot-Reife braucht noch Persistenz, Auth-Vollständigkeit, AVV und TI-Anbindung. Das Modell ist wirtschaftlich tragfähig sobald Plattform-Cut auf 5 % geht und Solidar-Topf-Sustainability erreicht ist.
