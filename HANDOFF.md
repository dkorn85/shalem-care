# Shalem Care · Session-Handoff

**Stand:** 2026-05-09 · für die nächste Session
**Branch:** `main` direkt · **225 Routen** · `tsc --noEmit` exit 0
**Phase:** PVS-Reife-Aufbau · 13 Berufe · 15 Mini-Games · Expertise auf 20 Cockpits ·
**Stationsmanagement** mit Bettenraster + Aufnahme + **Reservierung** ·
**NANDA-Pflegediagnosen** + **NIC/NOC-Pflegeplan-Generator** (NNN-Triade) ·
**Identity-Registry** mit 5 Anlage-Wegen + Claim-Token + zweistufigem Identitätscheck + **QR-Code-Karte** + **DSGVO Art. 15/17/20 Workflow** ·
**Schein-Optik** Kasse + Therapie + Versicherten-Sicht + Widerspruchs-Editor ·
**🔊 Sound-System** 20 ElevenLabs-Sounds · **🔔 Notify-System** Apple-Toast + OS-Push + VAPID mit **Empfänger-Gruppen-Filter** · **📱 PWA** Service-Worker + Manifest ·
**🌿 3 Falt-Broschüren** (Klient · Pflege · Träger) mit 18 Aquarell-Bildern (Higgsfield) + Drucken-Button ·
**🌱 Naturheilkunde-Stack** 16 Verfahren über 10 Arten (Phyto · TCM · Anthropos · Homöo · Ayur · Aroma · Osteo · Akup · Kneipp) ·
**✦ Psychedelika-Therapie** zukunftsfest · 7 Substanzen + 16-Schritt-Sitter-Protokoll (MAPS/COMPASS) + Pflege-Kompetenz-Felder ·
**▤ Cockpit-Sub-Nav** dynamisch · 12 Cockpit-Familien · sticky horizontaler Reiter-Stack mit pathname-Erkennung ·
**℞ Apotheke-Vollausbau** BtM-Buch + Heimversorgung (§12a ApoG/AMTS-Score) + Wechselwirkung (ABDA + ESCOP-Crossings) ·
**▤ Medizintechnik-Vollausbau** MDR-Bestand (UDI/EUDAMED/CE) + STK/MTK-Wartung mit BfArM-Vigilanz + § 33-SGBV-Pool mit Wirtschaftlichkeit ·
**🚑 Rettungsdienst-Vollausbau** NACA-Mind2-Protokoll + 5 SOPs (ERC/ESC/DGN/DGAKI/DGU) + RKI-Hygiene-Profile mit RTW-Aufbereitung ·
**🕊 Bestatter-Vollausbau** 6-Phasen-Versorgung mit Würde-Notizen + 10 Bestattungsarten (BestG-Länder/§74 SGB XII) + Kast-4-Phasen-Trauerbegleitung mit Notfall-Kontakten ·
**🤲 Begleitung-Vollausbau** 10-Methoden-Repertoire (Berkana/Validation/Snoezelen) + 7-Quellen-Einwilligung (BGB-Reform 2023) + Sterbe-Wachen mit Cheyne-Stokes-Doku + „Was-tun-wenn?"-Tafel ·
**🗺 /cockpits-Karte** suchbare globale Übersicht aller 12 Familien · ~50 Reiter · auto-aktualisiert sich aus der Registry ·
**🌉 Cross-Beruf-Brücken** klickbar in 17 Sub-Cockpits · raus/rein-Logik · verbindet Apotheke ↔ Pflege/Arzt/Klient, Bestatter ↔ Pflege/Begleitung/Rettungsdienst-Hygiene, Therapie/Psy ↔ Apotheke/BtM ·
**◐ /klient/woche** Klient-Wochenübersicht alle 11 Berufsgruppen mit dokumentierten Wünschen + Sprung ins Profi-Cockpit je Termin ·
**⌘K Cmd-K-Launcher** überall aufrufbar in 3 Shells · Tastatur-Navigation durch alle ~50 Cockpit-Reiter · Trigger-Chip bottom-left ·
**✎ Wunsch-Editor in /klient/woche** Klient pflegt eigene Wünsche per Server-Action · 240-Zeichen-Limit · Override > Default mit Lösch-Fallback · DSGVO Art. 4 konkret ·
**🧹 Layout/User-Anzeige bereinigt** — UserMenu top-right ist einzige Quelle ·
[Expertise-Konzept-Doc](docs/EXPERTISE_KONZEPT.md) als Maßstab für künftige Cockpits

---

## TL;DR · was läuft live

- Demo-Domain: **shalem.de** (Hostinger Node.js, Auto-Deploy via Push auf `main`)
- Repo: <https://github.com/dkorn85/shalem-care>
- Supabase: `gpchwlqeqejxvynewjns.supabase.co` · 8 Tabellen · RLS aktiv
- Auth: Email + Google OAuth · Profile-Auto-Create · DSGVO-Self-Service
- **Messenger live · Pfad B Supabase-Realtime** mit Channels, DMs, Reactions, Presence, Typing
- 201 Routen, alle 13 Berufe haben Heute-Hub + Diktat + Dienstplan
- KI-Dienstplan-HUD für PDL · 3-Zonen-Archiv · pk-ruhr-Multiplier-Brücke
- Politik-Schnittstelle mit KI-Gesundheitsminister-Simulator + live PVS-Aggregat
- Aufsichtsrats-Bericht mit Druck-Ansicht + eIDAS-Signatur-Container
- **Brillenmodus** universal · KI-Klartext für jeden markierten Begriff
- **Mobile-Hamburger-Drawer** · volle Sidebar-Nav auf Smartphone
- **Voll-WebRTC** mit Supabase-Signaling · RTCPeerConnection-Mesh ≤4 Peers
- 11 Berufe mit eindeutiger **Akzent-Farbe** in Sidebar/Header/BottomNav
- **🎮 Game-Mode** als optionaler Spielmodus · 15 Mini-Games über alle Berufe
- **◯◐● Expertise-Modus** Lerne / Praxis / Profi pro Beruf · 20 Cockpits durchgängig (auch Kasse-Portal über KasseShell, auch Genossenschaft via `expertiseRolleOverride`)
- **📜 Schein-Optik** im Kasse-Portal · Original-Look Muster 1 (gelb) / Muster 12 (rosé) / formaler Bescheid-Brief mit Briefkopf · 5 KI-generierte Stempel-/Papier-Assets via mix-blend-mode komponiert
- **🌿 Versicherten-Sicht** `/klient/bescheide` nutzt dieselben Schein-Komponenten · klartext-orientierte Status-Sprache · **Aufmerksamkeits-Block** für Rückfragen/Ablehnungen mit Hub-Counter
- **✍️ Widerspruchs-Editor** mit KI · bei Ablehnung baut Lana den § 84 SGG-Brief (Begründung + Argumente-Liste), Klientin poliert + druckt
- **🖨 Print-Stylesheet** für alle Schein-Komponenten · A4-Briefblatt, Sidebar/FABs/Klartext-Spalte ausgeblendet, Stempel via mix-blend-mode sichtbar
- **🤝 Ehrenamt-Begleit-Cockpit** mit Stimmungs-Sparkline 1–5 (DHPV-Curriculum), Lebenslagen-Tags, Trübe-Warnung bei 2× ≤2 in Folge, Biografie nach Schuchardt
- **🏨 Stationsmanagement** mit Bett+Belegung als eigene Entitäten · Aufnahme-/Verlegungs-/Entlassungs-Forms · echte Daten-Eingabe ohne Code-Edit
- **📋 NANDA-I Pflegediagnosen** mit AEDS-Format · Default-Vorschläge aus Katalog · pro Klient eigene Akte
- **🆔 Identity-Registry** · jede:r Klient + Mitarbeiter:in bekommt globale ID + 7-Zeichen Claim-Token + Identitätscheck (Geburtsdatum / Personal-Nr) · Person übernimmt Datenhoheit nach DSGVO Art. 4 Nr. 1 · 5 Anlage-Wege (Bett-Aufnahme · Personal · Klient-Direkt · **Selbst-Anlage** · **CSV-Bulk-Import**)
- **5 echte Beruf-Cockpits** neu: Therapie-Patient-Verlauf · HW-Wochenplan · Sozial-Hilfepläne · HE-Teilhabe · Erz-Lerngeschichten
- **4 zusätzliche KI-Funktionen:** Therapie-Verlaufsbrief · ICF-Vorschlag (Sozial) · DGE-Speiseplan-Vorschlag · Carr-Lerngeschichte-Entwurf

---

## Was diese Woche gebaut wurde (Sessions seit 2026-05-06)

### 1 · Marketing-Schicht-Polish (Sessions 1-3)
- 8 Marketing-Pages mit `<SiteFooter />` ausgerollt
- Frontpage neu gegliedert · Final-CTA-Block "Drei Wege rein"

### 2 · Lieferanten-Schicht (Session 4)
- `lib/gemeinwohl/matrix.ts` · `lib/lieferanten/store.ts` · `lib/expertenstandards/dnqp.ts`
- 4 BrancheHub-Pages, `/lieferanten`, `/gemeinwohl`, `/expertenstandards`, `/netz/berufe`

### 3 · Pflege-Assessment-Tools (Session 5)
- `lib/assessment/skalen.ts` · 4 interaktive Client-Tools · `/pflege/assessment`

### 4 · Claude-Integration (Session 6)
- Diktat-KI · Klient-Akte verstehen · Frag-Lana

### 5 · Live-Sim mit 11 KI-Personas (Session 7)
- 3-Spalten-Cockpit `/demo/leben`

### 6 · 45 KI-generierte Aquarell-Icons (Session 8)
- 5 GPT-Image-2.0-Grids · `scripts/crop-grids.py`

### 7 · PVS-Strategie + Roadmap (Session 9)
- `docs/PVS_STRATEGIE.md` · 53 Module · `/roadmap/pvs`

### 8 · Live-Fallbesprechung (Session 10)
- `components/FallbesprechungLive.tsx` · Lana KI-Moderator

### 9 · HKP-Verordnungs-Pipeline (Session 11)
- 5-Stufen-Pipeline · 4 Demo-Verordnungen · `/admin/verordnungen`

### 10 · PVS Phase A komplettiert (Session 12 · 2026-05-07)

| Commit | Modul | Route |
|---|---|---|
| `1c3795c` | Pflege-Quartalsabrechnung mit DTA-§302-Vorschau | `/admin/abrechnung` |
| `621bc14` | Pflegegrad-Antrags-Pipeline · 5 Stufen NBA → Bescheid | `/admin/pflegegrad` |
| `cb96b2d` | Wundmanagement Pflege-Cockpit · ICW-Doku-Form | `/pflege/wunde` |
| `276bdf0` | Cross-Beruf-Termin-Migration · TourPunkt → FHIR-Appointment | `/termine` |

### 11 · TI-Anschluss (Session 13)

| Commit | Modul | Route |
|---|---|---|
| `2502412` | gematik-Konnektor-Anbieter-Vergleich · 6 Anbieter | `/admin/ti/konnektoren` |
| `616bd43` | KIM-Mail FHIR-Bundle + S/MIME-Vorschau | (Verordnungs-Detail) |
| `b123bdc` | eRezept-Pilot · 3 Demo-Rezepte mit Token + AccessCode | `/arzt/erezepte` |
| `26793af` | HBA + SMC-B Karten-Cockpit · 5 Demo-Karten · PIN-Status | `/admin/ti/karten` |

### 12 · Inhalt + Politik (Session 14)

| Commit | Modul | Route |
|---|---|---|
| `8086e3b` | Aufsichtsrats-PDF-Druck-Ansicht + eIDAS-Container | `/aufsicht/druck/[q]` |
| `cc02e81` | Politik-Aggregat live aus PVS-Daten · k-Anonym-Audit | `/politik` |
| `f781397` | Quartal-Ausschüttung-Workflow eG · 5 Stufen | `/genossenschaft/ausschuettung` |

### 13 · UI-Polish · Mobile + Brillenmodus + Beruf-Farben (Session 15)

`e5ab8c3` Mobile-Hamburger-Drawer · Brillenmodus universell als FAB ·
11 Berufe bekommen eindeutige CSS-var Akzent-Farbe in AppShell/BottomNav.

### 14 · WebRTC Phase 2 (Session 16)

| Commit | Modul | Route |
|---|---|---|
| `b6a4a02` | RTCPeerConnection-Mesh über Supabase-Broadcast · ≤4 Peers | `/konferenz/[id]/live` |
| `b52907c` | LiveKit-SFU-Setup-Cockpit · Token-Stub · 6-Schritte-Checklist | `/admin/ti/sfu` |
| `e09cb5c` | Cloud-Recording + FHIR-Encounter · Retention-Policy | `/admin/recordings` |

### 37 · Klient pflegt Wünsche selbst · DSGVO Art. 4 konkret (Session 39 · 2026-05-10)

`/klient/woche` zeigt nun pro Termin einen WunschEditor — jede:r Klient:in (oder Vertretung mit Vollmacht) kann eigene Wünsche direkt ergänzen, ändern oder entfernen. Override gewinnt über Default; bei Lösch fällt der Default zurück.

| Datei | Was |
|---|---|
| `lib/klient/wunsch-store.ts` | globalThis-Map (Phase 1) · 240-Zeichen-Limit · WunschQuelle-Union 'selbst' \| 'betreuer' \| 'angehoerige' · key = klientId::terminId |
| `lib/klient/wunsch-actions.ts` | `setzeWunschAction` + `loescheWunschAction` mit revalidatePath /klient/woche |
| `components/klient/WunschEditor.tsx` | Client-Component zwei Zustände (Lesen/Schreiben) · Textarea + Speichern + Entfernen + Abbrechen · optimistic Update + Char-Counter |
| `/klient/woche` | jede TerminKarte rendert WunschEditor statt statischem Wunsch-Block · Aufklär-Block aktualisiert |

Phase 2: Supabase-Tabelle `klient_wunsch` mit RLS so, dass Identitäts-Inhaber:in schreiben darf, Pflege/Therapie ihres Klient-Kreises nur lesen.

### 36 · Cmd-K-Launcher · globale Tastatur-Suche (Session 38 · 2026-05-10)

Bei ~50 Sub-Reitern in 12 Familien war Klick-Navigation der Engpass. Cmd-K-Launcher als Standard-UX-Pattern (Linear/GitHub/Notion) macht alles in einem Tastendruck erreichbar.

| Datei | Was |
|---|---|
| `components/CmdK.tsx` | Modal-Overlay-Launcher · ⌘K / Ctrl-K / "/" zum Öffnen · ↑↓ Navigation · Enter öffnet · Esc schließt · Hover synchron mit Tastatur · auto-scroll-into-view · Score-Sort nach Match-Position |
| Trigger-Chip | bottom-left als Button (⌘K · suchen) wenn Modal zu |
| Datenquelle | COCKPIT_SUB_NAV-Registry · 12 Beruf-Hubs + ~50 Sub-Reiter |
| AppShell + KlientShell + KasseShell | CmdK in alle drei Hauptshells eingebunden |

Beispiel-Suchen: "btm"→Apotheke/BtM, "naturheil"→Therapie, "sterbe"→Begleitung/Sterbe-Wache, "hilfeplan"→Sozial, "wartung"→Medizintechnik.

### 35 · Klient-Wochenübersicht · alle Berufe in einer Sicht (Session 37 · 2026-05-09)

Dritter Kreis nach Berufe-Vollausbau + Cross-Brücken: die Klient:in sieht alles, was diese Woche bei ihr passiert, quer durch alle 11 möglichen Berufsgruppen — inkl. dokumentierter Wünsche.

| Datei | Was |
|---|---|
| `lib/klient/woche.ts` | `WocheTermin`-Typ · 16 Demo-Termine über 7 Tage für Helga Reinhardt · Quellen Pflege/Therapie/Apotheke/Medizintechnik/Begleitung/Arzt/Sozial/Bestatter/Ehrenamt/Küche · `wocheFuerKlient` + `termineProTag` + `berufeImEinsatz` |
| `app/klient/woche/page.tsx` | Cockpit · Tag-Blöcke mit sticky-Header · Beruf-Akzentfarbe · Wunsch-Hervorhebung · Sprung ins Profi-Cockpit je Termin · Aufklär-Block über DSGVO Art. 4 |
| `lib/cockpit-sub-nav/registry.ts` | Klient-Familie um „Meine Woche"-Reiter (◐ wed-Akzent) erweitert |
| `lib/cross/bruecken.ts` | Brücken /klient/woche → Mein Team · Holistik (Wünsche-Quelle) · Identity (DSGVO-Export) |

Beispiel-Termine mit Wünschen:
- Berkana-Berührung mit „keine Füße bitte (Lymph-OP)"
- Apotheke-Verblisterung mit „weiße Tabletten bitte mit Wasserschluck-Karte"
- Bestatter-Vorsorge mit „lila Strickjacke + Perlohrringe (wie Mama auch)"

### 34 · Cross-Beruf-Brücken klickbar (Session 36 · 2026-05-09)

Die neuen Sub-Cockpits referenzierten sich gegenseitig im Workflow-Text — ohne Sprünge. Diese Optimierung macht die Bezüge klickbar mit konkretem „was geht da rein/raus".

| Datei | Was |
|---|---|
| `lib/cross/bruecken.ts` | Mapping pathname → { zielHref, zielLabel, was, richtung: raus/rein } · 17 Cockpits versorgt mit ~50 Brücken |
| `components/CrossBruecken.tsx` | Server-Component · zwei Spalten (raus = ich gebe weiter / rein = ich bekomme) mit hover-translate + 3px-Akzentlinie |
| 17 Sub-Cockpits | `<CrossBruecken pathname="…" />` als letztes Element vor `</AppShell>` |

Beispiel-Brücken:
- `/apotheke/heimversorgung` → Pflege/Heute (AMTS) · Arzt/Anfragen (Konsil) · Klient/Team
- `/rettungsdienst/protokoll` → Arzt/Heute · Pflege/Heute · Klient/Team
- `/bestatter/versorgung` ← Pflege/Heute · Begleitung/Sterbe-Wache · Rettungsdienst/Hygiene
- `/begleitung/sterbewache` ← Pflege/Heute (Bedarfsmedi) · Ehrenamt/Hospiz · → Bestatter/Versorgung
- `/therapie/psychedelika` → Apotheke/BtM · Begleitung/Sterbe-Wache

### 33 · Cockpits-Karte · globale Übersicht aller 12 Familien (Session 35 · 2026-05-09)

UX-Optimierung nach 5 Berufs-Aufbauten in Folge: bei nun ~50 Sub-Reitern brauchte es eine durchsuchbare Single-Source-of-Truth-Übersicht.

| Datei | Was |
|---|---|
| `app/cockpits/page.tsx` | Server-Component · Karten-Grid sm:2 / lg:3 · liest direkt aus CockpitSubNav-Registry |
| `lib/cockpits/karte.ts` | Anreicherung Registry um Akzentfarbe + ExpertiseStufen-Labels · server-safe |
| `components/cockpits/CockpitsSearch.tsx` | Client-Component · Live-Such-Filter mit Match-Hervorhebung in Eyebrow/Label/Hint/Href · Treffer-Counter |
| `components/SiteFooter.tsx` | Link "Cockpits-Karte · alle 12 Familien" unter Plattform-Spalte |

Effekt: Bei neuem Sub-Reiter in der Registry erscheint dieser **automatisch** auf /cockpits, ohne Extra-Pflege. Suche findet quer durch alle Berufe — z.B. „BtM"→Apotheke, „Wechselwirkung"→Apotheke, „Naturheil"→Therapie, „Sterbe-Wache"→Begleitung, „Hilfeplan"→Sozial, „Pool"→Medizintechnik.

### 32 · Begleitung-Vollausbau · Repertoire + Einwilligung + Sterbe-Wache (Session 34 · 2026-05-09)

Fünfter Beruf in Folge · damit alle dünnen Berufe (Apotheke, Medizintechnik, Rettungsdienst, Bestatter, Begleitung) auf gleichem Schnitt-Niveau.

| Datei | Was |
|---|---|
| `lib/begleitung/methoden.ts` | 10 Methoden (Berkana, Basale Stimulation, Validation Feil, Snoezelen, Bio-Erzählen, Vorlesen, Schweige-Präsenz, Musik, Aroma, Tier) über 3 Ausbildungs-Stufen mit Indi/KontraIndi/Doku-Pflicht |
| `lib/begleitung/einwilligung.ts` | 7 Einwilligungs-Quellen (selbst, mündl-Zeuge, VV, Betreuung, PV § 1901a, Pflegeplan, Notfall) · 6 Demo-Vereinbarungen · 5 Eskalations-Regeln · Betreuungsrechts-Reform 2023 |
| `lib/begleitung/sterbewache.ts` | 2 aktive Vigilien mit Schicht-Plan + Atmungsmuster + 10 terminale Zeichen + Bedarfsmedi · 8-Punkte „Was tun wenn?"-Tafel mit Zuständigkeit |
| `/begleitung/repertoire` | Methoden-Karten je Stufe casual/zertifiziert/fachkraft |
| `/begleitung/einwilligung` | Status-Dashboard + Eskalations-Regeln · Reform 2023 dokumentiert |
| `/begleitung/sterbewache` | Vigilie-Karten + Was-Tun-Wenn-Tafel mit Zuständigkeits-Routing |
| `lib/ui/expertise.ts` | `begleitung` neu in ExpertiseRolle-Union: Casual / Begleiter:in / Hospiz-Koordin. |
| `lib/cockpit-sub-nav/registry.ts` | Begleitung-Familie mit 4 Reitern (🤲 Repertoire, ✓ Einwilligung, 🕊 Sterbe-Wache) |

Bilanz dünne-Berufe-Aufbau: Apotheke + Medizintechnik + Rettungsdienst + Bestatter + Begleitung — jeweils 1 Hub → 4 Cockpits + Lib + ExpertiseRolle. ExpertiseRolle-Union umfasst jetzt 16 Rollen, CockpitSubNav-Registry 12 Familien.

### 31 · Bestatter-Vollausbau · Versorgung + Bestattungsarten + Trauer (Session 33 · 2026-05-09)

Vierter Beruf in Folge · 1 Hub → 4 Cockpits + Lib + ExpertiseRolle.

| Datei | Was |
|---|---|
| `lib/bestatter/versorgung.ts` | 6-Phasen-Workflow Eingang→Überführung · 5 Demo-Fälle mit Würde-Notizen + 6 Sonderlage-Typen (Infekt-RKI, StA, Religion, Kindstod, No-Touch) |
| `lib/bestatter/bestattungsarten.ts` | 10 Bestattungsformen mit Kostenspanne + Recht + Bundesland-Hinweis + Öko-Note · § 74 SGB XII Sozialhilfe-Bestattung |
| `lib/bestatter/trauerbegleitung.ts` | Kast-4-Phasen-Modell · 5 laufende Begleitungen mit besonderen Lagen (Kindstod, Suizid) · 7 Notfall-Kontakte (Telefonseelsorge, AGUS, AETAS, Verwaiste Eltern) |
| `/bestatter/versorgung` | Phasen-Karte + Sonderlage-Counter · § 168 StGB · § 31 PStG · DBV-Standes |
| `/bestatter/bestattungsarten` | Karten je Variante · Friedhofszwang-Lockerungen Bremen/NRW/HH/SH |
| `/bestatter/trauerbegleitung` | 4-Phasen-Erklärblock · Kontakte mit Telefon-Nummern · Brücken zu Fachstellen |
| `lib/ui/expertise.ts` | `bestatter` neu in ExpertiseRolle-Union: Auszubildende / Bestattungsfachkraft / Bestattermeister:in |
| `lib/cockpit-sub-nav/registry.ts` | Bestatter-Familie mit 4 Reitern (🕊 Versorgung, ❀ Arten, ♡ Trauer) |

### 30 · Rettungsdienst-Vollausbau · Protokoll + SOPs + Hygiene (Session 32 · 2026-05-09)

Dritter Beruf in Folge nach Apotheke + Medizintechnik · gleicher Schnitt: 1 Hub → 4 Cockpits + Lib + ExpertiseRolle.

| Datei | Was |
|---|---|
| `lib/rettungsdienst/naca.ts` | NACA-Score 0-7 mit Farbcodierung · 3 Demo-Einsatzprotokolle (Sturz NACA-3, COPD NACA-4, Apoplex NACA-4) inkl. Vitalwerte/Medikation/Klinik-Übergabe |
| `lib/rettungsdienst/sop.ts` | 5 SOPs nach ERC/ESC/DGN/DGAKI/DGU · pro Algo Erkennung + Sofortmaßnahmen + Schritt-Reihenfolge mit Rang (RS/NotSan/NA) + Medikation mit Cave + Voranmeldung |
| `lib/rettungsdienst/hygiene.ts` | 7 Erreger (MRSA, MRGN, C-diff, Noro, COVID, Influenza, Tbc) · 4 Schutzstufen · PSA-Liste · RTW-Aufbereitung mit Mittel + Einwirkzeit · IfSG-Meldepflicht · Pflege-Bezug |
| `/rettungsdienst/protokoll` | Mind2-Doku · NACA-Schnitt + ≥5-Counter |
| `/rettungsdienst/sop` | Algorithmus-Karten mit NotSan-vs-NA-Freigabe |
| `/rettungsdienst/hygiene` | nach Schutzstufe geordnet · Sporozid-Hinweis bei Noro/C-diff |
| `lib/ui/expertise.ts` | `rettungsdienst` neu in ExpertiseRolle-Union: RS-Azubi / RS-NotSan / Wachenleitung-NA |
| `lib/cockpit-sub-nav/registry.ts` | Rettungsdienst-Familie mit 4 Reitern (◴ Protokoll, ✚ SOPs, ❀ Hygiene) |

### 29 · Medizintechnik-Vollausbau · MDR + Wartung + Pool (Session 31 · 2026-05-09)

Spiegel zum Apotheke-Aufbau · 1 Hub-Page → 4 Cockpits + eigene Lib + ExpertiseRolle.

| Datei | Was |
|---|---|
| `lib/medizintechnik/mdr.ts` | EU 2017/745 · 7 Demo-Produkte über alle Risikoklassen I/Is/Im/IIa/IIb/III · UDI-DI · CE/Benannte Stelle · EUDAMED-SRN · PMS-Termin |
| `lib/medizintechnik/wartung.ts` | MPBetreibV § 11 STK / § 14 MTK · 6 Prüfungen mit Status faellig/ueberfaellig/geplant/erledigt · 2 Vorkommnisse mit BfArM-Aktenzeichen + MPSV-Meldefristen |
| `lib/medizintechnik/pool.ts` | § 33 Abs. 6 SGB V Wiedereinsatz · 6 Hilfsmittel mit KRINKO-Aufbereitungs-Kategorien · Ersparnis + LCA-CO₂-Schätzung |
| `/medizintechnik/mdr` | Bestandsverzeichnis nach Risikoklasse · Zert-/PMS-Auslauf-Counter |
| `/medizintechnik/wartung` | Prüfungen + Vigilanz · BfArM-Frist-Countdown |
| `/medizintechnik/pool` | Wiedereinsatz-Pool · Wirtschaftlichkeit + Hygiene-Kategorie |
| `lib/ui/expertise.ts` | `medizintechnik` neu in ExpertiseRolle-Union: Auszubildende / Servicetechnik / Versorgungsleitung |
| `lib/cockpit-sub-nav/registry.ts` | Medizintechnik-Familie mit 4 Reitern (♻ Pool, ⏰ Wartung, ▤ MDR) |

### 28 · Apotheke-Vollausbau · BtM + Heimversorgung + Wechselwirkung (Session 30 · 2026-05-09)

Apotheke war mit 1 Page der dünnste Beruf · jetzt 4 Cockpits + eigene Lib + ExpertiseRolle.

| Datei | Was |
|---|---|
| `lib/apotheke/btm-buch.ts` | BtMG-Anlagen I/II/III · 5 Demo-Buchungen (Tilidin, Cannabis Bedrocan, Spravato, Morphin, Fentanyl-Vernichtung) · Doppel-Sig-Pflicht |
| `lib/apotheke/heimversorgung.ts` | 3 Heim-Bewohner mit Stellplan + Diagnosen + AMTS-Score (PRISCUS/FORTA/STOPP-START) + patientenspez. Hinweisen |
| `lib/apotheke/wechselwirkung.ts` | 8 Crossings Schul-/Naturheil-/BtM-Medizin · 4 Schweregrade · Beispiel Johanniskraut↔Marcumar, Spravato↔MAO, Cannabis↔Phenprocoumon |
| `/apotheke/btm` | BtM-Buch-Cockpit · KPIs Zugänge/Abgaben/Vernichtungen · Doku-Lücken-Counter |
| `/apotheke/heimversorgung` | Verblisterungs-Cockpit · § 12a ApoG · pro Bewohner:in vollständiger Tagesrhythmus + AMTS-Hinweise |
| `/apotheke/wechselwirkung` | Check-Cockpit · ABDA-CAVE-Stub mit ESCOP-Crossings |
| `lib/ui/expertise.ts` | `apotheke` neu in ExpertiseRolle-Union: PKA / PTA / Apothekenleitung |
| `lib/cockpit-sub-nav/registry.ts` | Apotheke-Familie mit 4 Reitern |

### 27 · Naturheil + Psychedelika + Cockpit-Sub-Nav + Kompetenz-Tracker (Session 29 · 2026-05-09)

Multidisziplinäre Aufstellung „auf Augenhöhe" gemäß WHO/EU-Recht plus Gesundheits-Erweiterung um Komplementär- und Psychedelika-Medizin.

**A · Kompetenz-Tracker (`88f3fb1`)** · 24 Kompetenzen aus EU-Direktive 2005/36/EG + WHO European Strategic Directions for Nursing 2021-2025 + DBfK + DNQP. `lib/kompetenz/{katalog,store}.ts` mit Status-Berechnung pro Mitarbeiter. Admin-Cockpit `/admin/kompetenz` + Detail-Seite `/admin/kompetenz/[mitarbeiterId]` + `NachweisEintragenForm`.

**B · Team-um-Klient + ICNP-Mapping (`008d018`)** · 30 NANDA-Diagnosen mit ICNP-Codes (WHO-Klassifikation). Neue Cockpit-Page `/klient/team` zeigt alle beteiligten Berufsgruppen pro Klient.

**C · Naturheilkunde-Stack (`bc034d5`-A)**

| Datei | Was |
|---|---|
| `lib/naturheil/katalog.ts` | 16 Verfahren · 10 NaturheilArt · Status (Apo/OTC/HP/Arzt/Pflege) · Evidenz · ESCOP/EMA-HMPC/SPICE/G-BA-Quellen |
| `/therapie/naturheil` | gruppiert nach Art · Pflege-integrierbar-Marker · HeilprG-Klartext · Evidenz-Bar-Chart (Profi) |

Beispiele: PHYTO-MELISSE (ESCOP), PHYTO-WEISSDORN (SPICE), ANTHRO-MISTEL (Iscador), HOMOEO-ARNICA-D6, TCM-AKUPUNKTUR-LWS (G-BA), KNEIPP-WICKEL-WADE, AROMA-LAVENDEL.

**D · Psychedelika-Therapie + Trip-Sitting (`bc034d5`-B)**

| Datei | Was |
|---|---|
| `lib/psychedelika/katalog.ts` | 7 Substanzen · Esketamin (EMA), Cannabis BtM-III, off-label Ketamin, Pipeline-Phase-3: Psilocybin/MDMA/LSD/Ibogain |
| `lib/psychedelika/sitter-protokoll.ts` | 16-Schritt-Protokoll über Vorbereitung/Sitzung/Integration · `PFLEGE_KOMPETENZ_FELD` mit ja/nein/Krisenfall-Listen |
| `/therapie/psychedelika` | Verfügbar-heute + Pipeline · Set/Setting/Sitter-Modell · Pflege-vs-Therapeut-Trennlinie |

Standards: MAPS-PTBS-Trial, COMPASS Pathways COMP360, EMA Scientific Advice 2024 (dual-experienced therapist model).

**E · Cockpit-Sub-Nav (`bc034d5`-C)** · neue Komponente `components/CockpitSubNav.tsx` rendert horizontale Reiter direkt unter dem AppShell-Header der jeweiligen Page. Erkennt aktive Gruppe automatisch per pathname (längster Treffer gewinnt). 7 Cockpit-Familien in `lib/cockpit-sub-nav/registry.ts`: Therapie · Pflege · Arzt · Sozial · Admin · Klient · Genossenschaft. Sticky + scroll-snap + auto-center auf aktiven Reiter.

### 26 · Pflegeplan + DSGVO + QR + Bett-Reservierung + Broschüren (Session 28 · 2026-05-09)

Sieben Mini-Module + 3 Broschüren mit 18 KI-Aquarell-Bildern.

**A · NANDA → Pflegeplan-Generator (`8960723`)** · NNN-Triade geschlossen.

| Datei | Was |
|---|---|
| `lib/pflege/pflegeplan-store.ts` | PflegeplanEintrag (art: intervention\|ziel · status: 4 Stufen · quelle: katalog\|manuell) · idempotente Generierung pro Diagnose |
| `lib/pflege/pflegeplan-actions.ts` | Server-Actions: generieren · manuell ergänzen · Status setzen |
| `components/pflege/PlanGenerierenButton.tsx` | ✦-Button auf jeder aktiven Diagnose-Karte |
| `components/pflege/PlanStatusChip.tsx` | Klick-Wechsel: geplant → läuft → erreicht → abgesetzt |
| `/pflege/doku/[klientId]/plan` | Plan gruppiert nach Diagnose, Profi-Block mit NNN-Reife-Indikatoren |

**B · QR-Code-Karte (`bbdda22`)** · `qrcode`-Lib · Server-Component generiert SVG-QR mit URL `?token=…` · ClaimForm liest URL-Token automatisch · Apple-Wallet-Look mit Wordmark, Mono-Code, Verifikations-Hinweis · druckbar via Print-Stylesheet.

**C · DSGVO-Workflow Art. 15/17/20 (`1862483`)** · `lib/identity/dsgvo.ts` · Export sammelt Identity + Pflegediagnosen + Plan + Belegungen + Kassen-Vorgänge als JSON-Download · Lösch mit Bestätigungs-Text „ICH BESTAETIGE LOESCHUNG" · listet Aufbewahrungs-Pflichten (BGB § 630f / SGB V § 305 / AO § 147 / WBVG / ArbZG § 16) · `components/identity/DsgvoActions.tsx` im Profi-Modus auf `/identity/[id]`.

**D · User-Anzeige bereinigt (`85e8f46`)** · Sidebar-Footer-Box (Avatar+Name+LocaleSwitcher) raus aus AppShell · KasseShell-Header-User-Block raus · KlientShell-Header-User-Block raus · LocaleSwitcher wandert in den Sidebar-Header neben den ExpertiseChip · UserMenu (top-right) ist einzige Quelle.

**E · Bett-Reservierung (`b02db9a`)** · 4. Bett-Status (Sun-Farbe) neben frei/belegt/blockiert · Reservierungs-Form mit voraussAufnahme + erwarteter PG + Aufnahme-Art + Notiz · automatisches Einlösen wenn Aufnahme-Name == Reservierungs-Name · Quote zählt Reservierungen als gebundene Kapazität.

**F · Push pro Identity + Empfänger-Gruppen-Filter (`b27570a`)** · `PushAbo` mit rolle/stationId/einrichtungId · `sendePush()` filtert mehrdimensional · NotifyToggle gibt Identity-Daten an `subscribePush()` weiter. Test gezielt:
```
curl -X POST https://shalem.de/api/push/test -d '{"rolle":"pflege","stationId":"st-keme-pulmo-3b","titel":"Sturz Z 102"}'
```

**G · 3 Falt-Broschüren (`71e94eb`, `dfe2ea1`)** · DIN A4 quer · Mittelfalz · 4 Felder.

| Variante | Akzent | Hero-Claim |
|---|---|---|
| `/broschuere/klient` | sage-green | „Pflege, die zu dir gehört" |
| `/broschuere/pflege` | mon-rot | „Du pflegst. Wir nehmen dir das Tippen ab" |
| `/broschuere/traeger` | petrol | „Vom Verwalter zum Vermehrer" |
| `/broschuere` (Index) | accent | 3 Karten + Druck-Hinweis-Box |

`components/broschuere/BroschuereLayout.tsx` als gemeinsames Layout (Slot-Props) mit FeatureItem/Schritt/MagicBox/RueckseiteBlock-Bausteinen. Sticky Drucken-Toolbar (im Print ausgeblendet). Pro Variante 5 Features + 4-Schritte-Onboarding + 1 Hinweis-Box + 1 Genossenschafts-MagicBox.

**18 Aquarell-Bilder via Higgsfield `nano_banana_2`** · einheitlicher Stil-Prompt (sage-green/dusty-terracotta/cream Palette · window light from upper left · no faces · hand-painted feel). Klient: hero/akte/bescheid/pflegeplan/buchen/genossenschaft. Pflege: diktat/tour/wunde/uebergabe/genossenschaft. Träger: hero/betten/personal/bescheid/eg/finanzen/registry.

### 25 · Notify-System · OS-Push + Web-Push (VAPID) + Layout-Fix (Session 27 · 2026-05-09)

Drei-Stufen-Stack für Benachrichtigungen + globaler pb-Bugfix.

**A · OS-Push + Apple-Style Toast (`60de02c`):**

| Datei | Was |
|---|---|
| `lib/notify/notify.ts` | `notify({art, titel, beschreibung, href})` · 3 Modi (aus / in-app / os) in localStorage + Custom-Event-Sync · sendet OS-Notification UND In-App-Toast parallel |
| `components/notify/NotifyToastStack.tsx` | Glas-Toast oben mittig, `backdrop-filter: blur(20px) saturate(160%)`, 5 Art-Glyphs (ⓘ/✓/⚠/✕/✦), max 5 stack, auto-dismiss 4.5s, Klick öffnet href |
| `components/notify/NotifyToggle.tsx` | 5. FAB (🔕→📱/🔔→🔕), erste Aktivierung fragt OS-Permission, Demo-Toast nach Aktivierung |
| `components/notify/ServiceWorkerRegistrar.tsx` | registriert `/sw.js` passiv |
| `public/sw.js` | install/activate/push/click-Handler · empfängt Server-Pushes wenn Tab zu |
| `public/manifest.webmanifest` | PWA mit 4 Shortcuts · standalone display |
| `globals.css` | `@keyframes toastIn` Spring 480ms |
| `app/layout.tsx` | NotifyToastStack + ServiceWorkerRegistrar + manifest + apple-Touch-Icon |

**B · Layout-Fix global (`cfa85e5`):** Body-pb statt Per-Shell-pb — greift überall (auch Marketing + Identity-Pages ohne Shell). 18rem mobile / 14rem desktop mit `env(safe-area-inset-bottom)` für iOS-Notch.

**C · Server-Push mit VAPID (`bfb6c26`):** Notifications kommen auch wenn Tab geschlossen.

| Datei | Was |
|---|---|
| `npm install web-push @types/web-push` | Server-Push-Lib |
| `lib/notify/push-store.ts` | Subscription-Registry (Phase 2: Supabase) · `speichereAbo`/`loescheAbo`/`listAbos` |
| `lib/notify/push-server.ts` | `sendePush({identityId?, titel, …})` · web-push mit VAPID-Keys aus ENV · 404/410-Status löscht totes Abo automatisch |
| `lib/notify/push-client.ts` | `subscribePush()` abonniert PushManager + schickt an Server |
| `/api/push/subscribe` POST/DELETE | Abo speichern/löschen |
| `/api/push/test` POST | Demo-Push an alle (oder eine Identity) |
| `scripts/generate-vapid-keys.sh` | einmalige Key-Generierung mit `npx web-push` |
| NotifyToggle | ruft nach OS-Grant `subscribePush()` auf — Server-Abo automatisch |

**Setup-Schritte für Hostinger (3 ENV-Vars):**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (client-OK)
- `VAPID_PRIVATE_KEY` (nur server)
- `VAPID_SUBJECT=mailto:hallo@shalem.de`

Test: `curl -X POST https://shalem.de/api/push/test -d '{"titel":"Hi"}'`

### 24 · Sound-System · 20 ElevenLabs-Sounds (Session 26 · 2026-05-09)

Subtile UI-Sounds opt-in über Toggle, generiert via ElevenLabs Sound Effects API.

**A · Infrastruktur (`aa0684c`):**
- `lib/sound/sound-player.ts` · 20 SoundKey-Enum, HTMLAudio-Cache, localStorage-Persistenz, Custom-Event-Sync, Lautstärke pro Sound (0.16 tick bis 0.40 konfetti)
- `components/SoundToggle.tsx` · 4. FAB neben Brillenmodus/GameMode/Expertise · klick aktiviert + spielt sofort `erfolg`-Sound zur Demo
- 5 Hot-Stellen verkabelt: Bett-Aufnahme · Claim · Bescheid-Stempel · Lana-Vorschlag · Selbst-Anlage

**B · Generierungs-Script + 8 Kern-Sounds (`3200e43`, `3385cc2`):**

| Sound | Charakter |
|---|---|
| `klick` | 0.5s soft tap, glass-fingertip |
| `erfolg` | 0.5s warmer Glockenton, perfect-fourth ascending |
| `fehler` | 0.5s gedämpfter Holz-Buzz, minor-third descending |
| `navigation` | 0.5s Whoosh wie Buchseite |
| `warnung` | 0.5s Mokugyō-Tap, drei sanfte Holz-Klopfer |
| `lana` | 0.5s Vibraphone-Sparkle, magical-organic |
| `stempel` | 0.5s Rubber-Stamp-Thump auf Papier |
| `konfetti` | 1.5s Glockenspiel-Cascade |

**C · Erweiterungs-Pack 12 weitere Sounds (`2457d14`):**

| Sound | Trigger |
|---|---|
| `aufnahme-start`/`aufnahme-stop` | Diktat beginnt/endet |
| `diagnose-set` | NANDA-Diagnose dokumentiert (Pen-Scratch) |
| `konferenz-join`/`konferenz-leave` | Konferenz-Eintritt/-Austritt |
| `bett-belegt`/`bett-frei` | Wood-Knock vs. Window-Open |
| `export-fertig` | doppelter Pop wie Stempel-Stempel |
| `swipe` | Silk-Whoosh für Game-Gesten |
| `tick` | leiser Wood-Tick für Sek-Timer |
| `applaus` | 2s warmer Mini-Applaus (Jazz-Club) |
| `gong` | 2s tiefer Bronze-Gong für Schicht-Ende |

`scripts/generate-sounds.sh` mit Filter-Argument: `bash scripts/generate-sounds.sh aufnahme-start,gong` generiert nur die genannten. Voraussetzung: `ELEVENLABS_API_KEY` als Env. Free-Tier reicht (10k Credits/Monat, 20 Sounds = ~200).

Wires: Bett-Aufnahme spielt jetzt `bett-belegt` + `erfolg` in Sequenz, Pflegediagnose-Form `diagnose-set`, KategorieMatch-Quiz `konfetti` am Ende + `applaus` bei perfektem Score.

### 23 · Identity · CSV-Import + Selbst-Anlage-Wizard (Session 25 · 2026-05-09)

Damit ist Identity-Anlage komplett über alle Pfade verfügbar.

**A · CSV-Bulk-Import (`8468000`):** Bestands-Träger zieht 10–100 Datensätze aus altem PVS in einem Rutsch.

| Datei | Was |
|---|---|
| `lib/identity/csv-import.ts` | `importCsvAction` parsed CSV (Komma/Semikolon, Header optional), pro Zeile Validierung mit Pflicht-Identitätscheck-Anker, Trockenlauf-Modus |
| `components/identity/CsvImportForm.tsx` (client) | Vorlage einfügen / File-Upload / direktes Einfügen, Trockenlauf-Button + Echtimport-Button, Ergebnis-Tabelle pro Zeile mit Status/ID/Code/Hinweis |
| `/admin/import` | Migrations-Strategie-Hinweise: CSV-Export aus Vivendi/MediFox/connect-ASD, Stamm-Datenpflege, inkrementelle Updates, DSGVO-Datenanker |

**B · Selbst-Anlage-Wizard (`f2c219c`):** Person ohne Berufsgruppe legt sich selbst an, ist sofort Datenhalterin.

| Datei | Was |
|---|---|
| `selbstAnlegenAction` (in `lib/identity/actions.ts`) | registriert + claimt in einem Schritt (`claimedVia=in-person`), kein Träger als Treuhänder |
| `components/identity/SelbstAnlegenWizard.tsx` (client) | 3-Phasen-Flow (Art wählen → Daten → Code anzeigen + Weiterleiten). Klient: Geburtsdatum-Anker, Mitarbeiter: Personal-Nr + Berufsrolle |
| `/identity/anmelden` | öffentliche Page mit „du bist von Anfang an Datenhalterin"-Pitch + Hinweise zu Code-Aufbewahrung + Pflege-Freigabe |

**Querverlinkung** zwischen `/identity/claim` (Code einlösen) und `/identity/anmelden` (Selbst-Anlage) — Person erkennt klar welcher Pfad für sie gilt.

### 22 · Identity-Registry · Claim-Token in alle Bereiche (Session 24 · 2026-05-09)

**DSGVO-Souveränität** — jede Person bekommt eine global-eindeutige ID + 7-Zeichen Claim-Token (Format `XXX-XXXX`, Alphabet ohne 0/O/1/I/L = 32 Symbole = 34 Mrd Kombinationen). Solange unbeansprucht: Träger als Treuhänder. Nach Claim: Person ist Datenhalterin nach DSGVO Art. 4 Nr. 1.

**Identitätscheck zweistufig (`13d45ae`):** Token allein reicht nicht — Person muss zusätzlich etwas wissen (Geburtsdatum bei Klient, Personal-Nr bei Mitarbeiter, Versichertennummer, IBAN-Endung). Verhindert Profil-Übernahme bei abgefangenem Code.

| Datei | Was |
|---|---|
| `lib/identity/store.ts` | Registry mit `registriere`/`pruefeToken`/`claim`/`widerrufeClaim`/`neuerToken`. Demo-Seed mit 17 Identitäten (8 Klient:innen + 9 Mitarbeiter:innen, 3 davon vorgeclaimt). VerifikationsArt-Enum. |
| `lib/identity/actions.ts` | Server-Actions zweistufig (`pruefeTokenAction` → `claimAction`). Auch `registriereAction` mit Verifikations-Anker. |
| `/identity/claim` | Öffentliche Claim-Page · Phase 1 Token → Phase 2 Identitätscheck → Phase 3 Erfolg + Auto-Weiterleitung. |
| `/identity` | PDL-Übersicht aller Identitäten mit Claim-Quote-KPI + DSGVO-Indikatoren-Block. |
| `/identity/[id]` | Detail mit Stammdaten, Audit-Trail, Token-Anzeige (groß, kopierbar) bei unbeansprucht, „geclaimt"-Block bei übernommen, PDL-Aktionen (neuen Code, Widerruf). |
| `components/identity/IdentityBadge.tsx` | Status-Pill ○/●/⊘ — wird überall angezeigt wo IDs auftauchen (Bett-Belegung, Klient-Akte). |
| `components/identity/MitarbeiterAnlegenForm.tsx` | Personal-Onboarding mit Personal-Nr-Anker. |
| `components/identity/KlientAnlegenForm.tsx` | Direkt-Anlage für ambulant ohne Bett-Bezug. |

**Drei Anlage-Wege (`21a3bc0`, `0a5e899`, `4d9220e`):**

| Wo | Wann |
|---|---|
| `/admin/stationen/[id]` (Bett-Aufnahme) | stationäre Aufnahme — Bett + Identität gleichzeitig, Geburtsdatum-Anker |
| `/admin/personal` | Personal-Onboarding — Berufsrolle (11 Optionen) + Personal-Nr-Anker, Onboarding-Code „auf Vertrag drucken" |
| `/admin/klienten` | Klient-Direkt-Anlage — ambulant zu Hause oder vor Aufnahme, Geburtsdatum-Anker |

Alle Pfade nutzen die gleiche Mechanik: globale ID + Claim-Token + Identitätscheck-Anker + zweistufiger Claim-Workflow auf `/identity/claim`.

### 21 · Stationsmanagement · Bettenraster + Pflegediagnosen (Session 23 · 2026-05-09)

Erste echte **Daten-Eingabe-Strecke** ohne Demo-Daten-Edit — PDL kann Klient:innen via Form aufnehmen, verlegen, entlassen, Pflegediagnosen setzen.

**A · Datenmodell + Übersicht (`c65835a`):**

- `lib/station/betten-store.ts` · Bett + Belegung als eigene Entitäten (statt nur `bedCount`-Zahl). Demo-Seed mit 30 Betten in 2 Stationen (Pulmo-3B Essen + Annahof Bochum), 8 Belegungen, 1 blockiertes Bett. `bettBelegen`/`bettEntlassen`/`klientVerlegen`/`bettBlockieren`/`bettFreigeben` mit Validierung.
- `lib/station/actions.ts` · Server-Actions mit `revalidatePath`.
- `/admin/stationen` · Stations-Übersicht mit Quote-Tile pro Station (Farb-Skala: >95 % rot, >85 % gold, >70 % grün), PDL-Profi-Block mit PpUGV-Klassifikation + Aufnahme-Reserve.

**B · Bettenraster + Forms (`a83aabe`):**

- `/admin/stationen/[id]` · Karte pro Zimmer mit Betten als kollabierbares `<details>`. Status-Farbe: grün=frei, magenta=belegt, gold=blockiert. Pro belegtes Bett: PG-Chip + Aufnahme-Art-Chip (Kurzzeit/Verhinderung/Tag) + Diagnosen + Notiz.
- `components/station/BettAktionAccordion.tsx` (client) · wählt je Bett-Status passende Aktions-Buttons.
- `components/station/BettAktionForm.tsx` (client) · 5 Forms (Belegen / Entlassen / Verlegen / Blockieren / Freigeben). Aufnahme-Form fragt Klient-Name + ID + Pflegegrad + Aufnahmeart + Diagnosen + Geburtsdatum (Identitätscheck) + Notiz ab.

**C · NANDA-I Pflegediagnosen (`266fbf4`):**

- `lib/pflege/diagnose-katalog.ts` · ~16 alltagsrelevante NANDA-I Diagnosen über 7 Domänen, jede mit Default-Vorschlägen für Einflussfaktoren+Symptome + empfohlene NIC/NOC-Interventionen+Ziele.
- `lib/pflege/pflegediagnose-store.ts` · AEDS-Format pro Klient (Status: akut/chronisch/risiko/geloest), `setzeDiagnose`/`loese`/`evaluiere`-Helper.
- `components/pflege/PflegediagnoseSetzenForm.tsx` (client) · NANDA-Auswahl mit Domain-Anzeige + Default-Vorschläge-Übernahme-Button.
- `/pflege/doku/[klientId]/diagnosen` · Aktive + historische Liste, KPIs, Profi-Block (betroffene Domänen, Akut-Anteil, Evaluations-Stand). Vom Bett-Detail aus direkter Link „🩺 Pflegediagnosen öffnen".

### 20 · Schein-Optik auf Therapie · Muster 13 HMV (Session 22 · 2026-05-08)

`components/scheine/MusterDreizehnHMV.tsx` (`13186e9`) · pastell-blau-graue Heilmittel-Verordnung nach HeilM-RL § 32 SGB V. Therapieart-Checkboxen (Physio aktiv), Diagnosegruppe-Code (WS1a/EX1c/ZN1b), Leitsymptomatik, Therapieziele, Behandlungs-Pos.-Tabelle mit Doppelbehandlung, Frequenz-Box, Praxis-Stempel via mix-blend-mode.

`/therapie/patient/[id]` zeigt Aktuelle HMV in Original-Optik mit „🖨 HMV drucken"-Button. Helper `baueMusterDreizehn()` mappt `TherapiePatient` → `MusterDreizehnDaten` (HMV-Code → Diagnosegruppe, ICF-Codes → Leitsymptomatik, smartZiele → Therapieziele).

### 19 · Print-Stylesheet · Aufmerksamkeits-Filter · Widerspruchs-Editor (Session 21 · 2026-05-08)

**Print-Stylesheet (`f347fb6`):** Bescheide werden als richtiges A4-Briefblatt druckbar.

| Datei | Was |
|---|---|
| `app/globals.css` | `@media print`-Block · Sidebar/BottomNav/FAB-Stack/Klartext-Spalte ausgeblendet, mix-blend-mode bleibt damit Stempel sichtbar bleiben, A4 mit 12mm Rand |
| `components/scheine/DruckenButton.tsx` | Client-Button triggert `window.print()` · sitzt oben rechts auf `/klient/bescheide/[id]` und `/kasse/vorgang/[id]` |
| `.no-print` / `.print-only` | Helper-Klassen für selektives Verstecken |

**Aufmerksamkeits-Block + Hub-Counter (`b68eba3`):** Vorgänge mit Status `rueckfrage`/`abgelehnt` springen ins Auge.

| Stelle | Was |
|---|---|
| `/klient/bescheide` | rot-gerahmter Block ganz oben mit Counter „X Widerspruch möglich · Y Rückfrage" — herausgezogen aus „Entschieden" damit Ablehnungen nicht versehentlich als bewilligt durchgehen |
| `/klient` (Hub) | Bescheid-Werkzeug-Karte wechselt automatisch auf Mon-Akzent + ⚠-Badge, sobald aufmerksamkeits-bedürftige Vorgänge da sind |

**Widerspruchs-Editor mit KI (`89f71b0`):** Bei Ablehnung kann die Klientin in einem Klick einen formellen § 84 SGG-Widerspruch erstellen.

| Datei | Was |
|---|---|
| `lib/kasse/widerspruch-ki.ts` | Server-Action mit Anthropic-Provider · 4 Heuristik-Fallbacks (HKP-Wunde, HKP-allgemein, Krankengeld § 44, Hilfsmittel § 33) — alle mit § 12 SGB V Wirtschaftlichkeits-Argument und MD-Stellungnahmen-Bezug |
| `components/scheine/WiderspruchBrief.tsx` | Spiegelbild zum BescheidBrief — Absender = Klient:in, Empfänger = Kasse, Bezug auf Aktenzeichen + Bescheid-Datum, ausdrückliche Widerspruchs-Erklärung, Begründungs-Block, Unterschrift-Linie, optional „fristwahrender Widerspruch"-Vermerk |
| `components/scheine/WiderspruchEntwurfBox.tsx` | Lana-Editor (client) · optional „Was siehst du anders?"-Statement · zeigt Argumente-Liste zum Polieren · Drucken-Button auf Brief-Vorschau |
| `/klient/bescheide/[id]` | Bei abgelehntem Vorgang werden Hinweis-Block + Editor + Brief-Vorschau angezeigt, Brief-Vorschau druckt sich allein dank Print-Stylesheet |

**Damit hat die Versicherten-Sicht den vollen Workflow:** Bescheid lesen → verstehen (Klartext-Spalte) → handeln (Widerspruch in einem Klick) → drucken.

### 18 · Pflege-Sub-Cockpits · Versicherten-Sicht für Bescheide (Session 20 · 2026-05-08)

**Pflege-Sub-Cockpits Expertise (`64e720b`):** Letzte Lücke aus dem Konzept-Doc geschlossen.

| Cockpit | Lerne-Tipp | Profi-Block |
|---|---|---|
| `/pflege/wunde` | DNQP-Expertenstandard + ICW-Codes + Stagnation-Regel | Wundlast (Akut/Stagn./Heilend) + Heilungs-Quote als DNQP-Audit-Indikator |
| `/pflege/assessment` | Braden ≤18, NRS ≥3, MNA ≤11, Tinetti ≤19 + DNQP-Audit-Pflicht | Re-Assessment-Frequenzen (Braden 7d, NRS Schicht, MNA 90d, Tinetti 6Mo) mit Audit-Hunt-Verweis |
| `/pflege/tour` | Reihenfolge-Logik PG+Akut+Wunsch + LK-Schlüssel | Tour-Steuerung Akut-Quote + Pflegezeit Ø vs. SGB XI Anlage 1 + PpUGV-Risiko bei > 480 min |

**Versicherten-Sicht für Bescheide (`09080a8`):** Schein-Komponenten doppelt monetarisiert — gleiche Optik in Kasse-Sachbearbeitung *und* Klient-Akte.

| Datei | Was |
|---|---|
| `/klient/bescheide` | Liste eigener Vorgänge der Klientin · klartext-Status („läuft / wird geprüft / bewilligt ✓ / abgelehnt") statt Sachbearbeiter-Sprache · Lana-Lese-Hinweis zur Widerspruchs-Frist |
| `/klient/bescheide/[id]` | Original-Schein (Muster 1/12 oder Bescheid-Brief) + Klartext-Spalte aus Kasse-Modul · zusätzlich Bescheid-Brief separat sichtbar wenn entschieden · Widerspruchs-Hilfe-Block (§ 84 SGG · 1 Monat · Sozialberatung) bei Ablehnung |

Schutz: `notFound()` wenn Vorgang einer anderen Klient:in. Klient-Hub bekommt 4. Werkzeug-Karte „Meine Bescheide". KlientShell-Layout-Bug analog zu AppShell/KasseShell mitgenommen (`pb-48 lg:pb-32`).

### 17 · Schein-Optik Kasse · Ehrenamt-Workflow · GenG-Expertise · Layout-Fix (Session 19 · 2026-05-08)

**Schein-Optik im Kasse-Portal (`5965d47`, `ba3bbd9`):**

| Komponente | Datei | Look |
|---|---|---|
| `<MusterZwoelfHKP>` | `components/scheine/MusterZwoelfHKP.tsx` | rosé HKP-Verordnung mit Vordruck-Linien, IK/LANR/BSNR-Grid, Maßnahmen-Tabelle |
| `<MusterEinsAU>` | `components/scheine/MusterEinsAU.tsx` | kanariengelbe AU-Bescheinigung mit roten Druck-Linien, Diagnose+ICD-Chips |
| `<KassenBescheidBrief>` | `components/scheine/KassenBescheidBrief.tsx` | formaler Brief mit Wellen-Logo, Anschriften-Fenster, Rechtsbehelfsbelehrung |
| `<KlartextSpalte>` | `components/scheine/KlartextSpalte.tsx` | Side-by-side Original ↔ Lana-Klartext + Glossar + nächste Schritte |

**5 KI-generierte Bild-Assets** (`public/scheine/`):
- `stempel-praxis.png` · runder Praxis-Stempel mit BSNR/LANR · `nano_banana_2`
- `stempel-bewilligt.png` · grüner „BEWILLIGT"-Tintenstempel
- `stempel-abgelehnt.png` · roter „ABGELEHNT"-Tintenstempel
- `papier-textur.png` · kachelbare Briefpapier-Faserung
- `wm-eau.png` · diagonales eAU-KIM-Wasserzeichen

Alles via `mix-blend-mode: multiply` komponiert — weißer Hintergrund verschwindet, nur die Tinte bleibt. Geheuristik in `lib/kasse/bescheid-daten.ts` baut aus jedem `KassenVorgang` automatisch den passenden Schein + ein vorgangs-spezifisches Klartext-Paket.

**Ehrenamt-Begleit-Cockpit (`17a89f4`):**

| Datei | Was |
|---|---|
| `lib/ehrenamt/begleit-store.ts` | 3 Klient:innen mit 5–8 Termin-Verläufen · Stimmung 1–5 (DHPV) · Lebenslagen-Tags · Tendenz-Helper |
| `/ehrenamt/begleitung` | Liste mit Tendenz-Chips · Lerne: Schuchardt-Biografie · Profi: Lebenslagen-Verteilung |
| `/ehrenamt/begleitung/[id]` | Sparkline-Verlauf · Trübe-Warnung bei 2× Stimmung ≤2 in Folge · Biografie · Lebenslagen-Chips · vereinbarte Grenzen · Termin-Liste |

**Genossenschaft-Expertise (`fea69bd`, `d301111`):**

| Cockpit | Lerne (Mitglied) | Profi (Aufsichtsrat) |
|---|---|---|
| `/genossenschaft/pool` | GenG § 1 + BAP-Marge | Pool-Auslastung · Bedarfe/Stellen-Match · Marge-Ersparnis |
| `/genossenschaft/solidartopf` | GenG § 17 + Cap-Logik | Reserve-Status · Claim-Quote · Cap-Tage · § 17-Bezug |
| `/genossenschaft/ausschuettung` | GenG § 19 + Workflow Vorstand→AR→SEPA | Genehmigungs-Stau · Auszahlungs-Quote · Σ YTD · § 19-Rechtsbasis |

`AppShell` bekam `expertiseRolleOverride`-Prop, damit GenG-Pages mit `role="nurse"`/`role="lead"` trotzdem den Genossenschafts-Toggle zeigen.

**Layout-Fix (`367ba48`):**
GameMode-FAB (`bottom-36` mobile = 144px) verdeckte Inhalt — `pb-24` reichte nicht. AppShell jetzt `pb-48 lg:pb-32`, KasseShell nachgezogen + Footer mit `pb-24 lg:pb-10`.

**Konzept-Doc (`735ad08`):**
[`docs/EXPERTISE_KONZEPT.md`](docs/EXPERTISE_KONZEPT.md) hält pro Beruf systematisch fest, wer in welcher Stufe was sieht (Pflege: Azubi/Pflegekraft/Pflegeprofi · Arzt: Assistenz/Facharzt/Oberarzt · …) und gibt Faustregeln für künftige Cockpits.

### 16 · 5 echte Beruf-Cockpits · Expertise-Modus · 4 KI-Funktionen (Session 18 · 2026-05-08)

**5 neue Beruf-Cockpits — von Diktat-only zu echten Workflows:**

| Commit | Cockpit | Route(n) | Was es bringt |
|---|---|---|---|
| `fcc2b8d` | **Therapie-Patient-Verlauf** | `/therapie/patienten`, `/therapie/patient/[id]` | VAS / ROM / MRC als Sparkline · Tendenz-Chip · ICF + SMART-Ziele · Termin-Historie |
| `fcc2b8d` | **HW-Wochenplan** | `/hauswirtschaft/wochenplan` | DGE-konformer 7-Tage-Plan · 6 Kostformen · LMIV-Allergen-Filter |
| `953a125` | **Sozial-Hilfepläne** | `/sozial/hilfeplan`, `/sozial/hilfeplan/[id]` | ICF-Bedarfsbogen · SMART-Ziele · Maßnahmen-Status · Reviews · SGB IX/XII/VIII/XI |
| `953a125` | **Heilerziehung-Teilhabe** | `/heilerziehung/teilhabe`, `/.../[id]` | BTHG-Teilhabeplan · Selbstvertretung · Persönliches Budget · HPK-Zyklus |
| `76d4be3` | **Erz-Lerngeschichten** | `/erziehung/lerngeschichten`, `/.../[id]`, `/.../neu` | Carr-Lerngeschichten · BBP-Bildungsbereiche · Lerndispositionen |

**4 KI-Funktionen pro Cockpit (Anthropic Haiku 4.5 · Mock-Fallback):**

| Commit | KI-Box | Cockpit |
|---|---|---|
| `57db143` | **Therapie-Verlaufsbrief** · 4 Sitzungen → Brief an Hausarzt | Therapie-Patient-Detail |
| `57db143` | **ICF-Vorschlag** · Bedarfs-Text → b/d/e-Code-Vorschläge | Sozial-Hilfeplan |
| `76d4be3` | **DGE-Speiseplan** · Klient + Kostform → Wochenplan-Vorschlag | HW-Wochenplan |
| `76d4be3` | **Carr-Lerngeschichte** · Beobachtung → Entwurf + BBP-Tags | Erz-Lerngeschichten/neu |

**Expertise-Modus · Lerne / Praxis / Profi (`2c1c52b`):**

- Globaler `<ExpertiseChip />` im AppShell-Header — Default `praxis`, persistiert pro Beruf in `localStorage["shalem.expertise.<rolle>"]`
- 11 Berufe haben rollen-spezifische Labels (Pflege: Azubi/Pflegekraft/Pflegeprofi · Arzt: Assistenz/Facharzt/Oberarzt · …)
- `<LerneTipp rolle>` blendet Glossar-Banner für Casual/Azubi ein
- `<NurAbProfi rolle>` zeigt erweiterte KPI-Blöcke nur im Profi-Modus
- `<NurAb / NurBis / NurBeiLevel>` als Komfort-Wrapper

**In 13 Cockpits eingezogen** (Commits `685e50e`, `fce8fe4`, `1e6ce2c`, `3ead59c`, `a5555cb`, `9a0d007`, `c9dde2a`, `ab7fcf7` plus initiale Wires):

| Cockpit | Lerne-Tipp | Profi-Block |
|---|---|---|
| Pflege/Heute | DBfK-Glossar | Performance-Tracking · Caseload · Cross-Termine · HKP-VOs |
| Arzt/Heute | AU/HKP/ICD/DMP-Glossar | Akut-Quote · CGM-Click-Vergleich · Diktat-Ersparnis |
| Therapie/Patienten-Liste | VAS/ROM/MRC | Outcome-Verteilung fallend/stabil/steigend |
| Therapie/Patient-Detail | (initial) | (initial) |
| Sozial/Hilfeplan-Liste | SGB IX/XII/VIII/XI · SMART | SGB-Verteilung · DGCC-Caseload |
| Sozial/Hilfeplan-Detail | (initial) | (initial) |
| HE/Teilhabe-Liste | BTHG/ICF/P-Budget | P-Budget-Quote · Ziele · HPK |
| HE/Teilhabe-Detail | Carr-ICF-Lesart | Bedarf-Schnitt · Hochbedarf · HPK-Tage |
| HW/Wochenplan | DGE/LMIV/IDDSI | Wareneinsatz · Bio-Anteil · HACCP · Reste |
| Erz/Lerngeschichten-Liste | Carr-Methodik | Bildungsbereich-Verteilung |
| Erz/Lerngeschichte-Detail | Carr-Disposition | Carr-Profil · Tag-Vielseitigkeit |
| Ehrenamt/Cockpit | § 3 Nr. 26a EStG · Rollenklarheit | Stunden-YTD · Steuer-Spielraum · DHPV-Curriculum |
| Kasse/Portal | eAU/HKP/Krankengeld · Status-Spur | Genehm/Rückfr/Ablehn-Quote · § 13 Abs. 3a Fiktion |
| Admin/Dienstplan-HUD | ArbZG · Co-Pilot-Aktionen | Einrichtungen · Quals · 26-Wo-Horizont · PpUGV-Risiko |

### 15 · Game-Mode · Mini-Games über alle Berufe (Session 17 · 2026-05-08)

**Konzept:** Aus langweiligen Aufgaben werden Spiele · alles optional über
🎮-Toggle rechts unten · Default aus, gemerkt in localStorage.

**8 Power-Mini-Games (PDL · Pflege · Klient):**

| Commit | Spiel | Route |
|---|---|---|
| `e9154cc` | **Dienstplan-Arena** · Auto-Pilot/Manuell/Sparring · Combo-Score · Konfetti | `/admin/dienstplan/arena` |
| `3816512` | **Genehmigungs-Sprint** · Tinder-Stack für ALLE Approvals · KI-Empfehlung pro Karte | `/admin/genehmigungen/sprint` |
| `c645b2c` | **NBA-Sprint** · Pflegegrad-Antrag als One-Question-Quiz · Live-PG-Prognose | `/pflegegrad-check/sprint` |
| `16ecb4f` | **Wund-Tendenz-Quiz** · Vorher/Nachher · DNQP-Hinweise pro Antwort | `/pflege/wunde/quiz` |
| `5f977d3` | **Diktat-Booster** · Rapid-Fire SIS-Feld-Klassifizierung · 8-Sek-Timer | `/pflege/diktat/booster` |
| `b4409bd` | **Bescheid-Quiz** · Amtsdeutsch → Klartext · Lana-Erklärung | `/klient/bescheid-quiz` |
| `54b549e` | **MD-Audit-Hunt** · Multi-Select Akten-Lücken finden · DNQP/MDK-Standards | `/admin/audit/hunt` |
| `dfec313` | **Wirtschaftlichkeits-Sandbox** · Slider-Spielwiese · Münzen-Regen | `/admin/wirtschaft/sandbox` |

**Game-Mode-Infrastruktur:**

| Commit | Was |
|---|---|
| `046b3a3` | Globaler Toggle 🎮 · `useGameMode()` Hook mit localStorage · Custom-Event-Sync · Alle Hero-Karten gewrappt in `<GameModeOnly>` |

**7 Beruf-Quizze (Default-bisher-trockene Cockpits):**

| Commit | Spiel | Route | Kategorien |
|---|---|---|---|
| `3faa6ea` | **ICD-10-Sprint** · Symptom → Code · 12-Sek-Timer | `/arzt/quiz` | Kreislauf · Endokrin · Psyche · Muskel · Atemweg · Haut |
| `3faa6ea` | **HMV-Code-Match** · Indikation → Heilmittel-Code | `/therapie/quiz` | WS1 · EX1 · ZN1 · SP1 · PS1 · Lymph |
| `3faa6ea` | **Paragraphen-Hunt** · Lebenslage → § | `/sozial/quiz` | SGB IX/XII/VIII · WBVG · BGB · § 7a SGB XI |
| `3faa6ea` | **ICF-Lebenswelten** · Beobachtung → ICF-d | `/heilerziehung/quiz` | d1/d3/d4/d5/d6/d7/d9 |
| `3faa6ea` | **Kostform-Puzzle** · Klient → Diät | `/hauswirtschaft/quiz` | Diabetes · Schluck · Natriumarm · Vollkost · Hochkalor · Religiös |
| `3faa6ea` | **Bildungs-Bingo** · Beobachtung → BBP-Feld | `/erziehung/quiz` | Sprache · Natur · Mathe · Musik · Werte · Körper |
| `3faa6ea` | **Begleit-Bingo** · Begegnung → Reaktion | `/ehrenamt/quiz` | Zuhören · Biographie · Praktisch · Pflege · Spirit · Aktivieren |

**Geteilte Mini-Game-Mechanik:**
- Vollbild ohne Sidebar (`fixed inset-0 z-50`)
- Tastatur 1-N für Antwort, ←/→/Space/B/Backspace für Navigation
- Combo-Streak mit Phrasen-Eskalation („Doppel" → „Combo" → „On Fire")
- Live-Score · Punkte je Combo-Stufe · Konfetti am Ende
- Lern-Hinweis-Box nach jeder Antwort mit fachlicher Begründung
- Erfolgs-Phrase pro Trefferquote (perfekt/gut/solide/schwach)

---

## Termux-Setup auf Tablet · neu starten

```bash
# Falls Repo noch nicht da:
pkg install git nodejs-lts
git clone https://github.com/dkorn85/shalem-care.git
cd shalem-care/apps/web
npm install --include=dev

# ENV-Vars in .env.local:
echo 'NEXT_PUBLIC_SUPABASE_URL=https://gpchwlqeqejxvynewjns.supabase.co' > .env.local
echo 'NEXT_PUBLIC_SUPABASE_ANON_KEY=<aus Supabase-Dashboard>' >> .env.local
echo 'ANTHROPIC_API_KEY=<aus Anthropic-Console>' >> .env.local

# Type-check:
npm run type-check

# Build (Hostinger-Heap):
NODE_OPTIONS=--max-old-space-size=2048 npm run build

# Dev-Server:
npm run dev   # localhost:3000
```

**Push-Auth einrichten** (falls noch nicht):
```bash
git config --global credential.helper store
echo 'https://dkorn85:<DEIN_PAT>@github.com' > ~/.git-credentials
chmod 600 ~/.git-credentials
```

---

## PVS-Reife · Stand pro Beruf

53 Module katalogisiert in `lib/pvs/matrix.ts`. Sichtbar unter `/roadmap/pvs`.

| Beruf | Live | KI-Funktion | Game-Mode | Expertise |
|---|---|---|---|---|
| 🩺 Pflege | SIS · Tour · Assessment · Wundmanagement · Quartalsabrechnung · Pflegegrad-Pipeline · **NANDA-Pflegediagnosen** | Diktat · Akte-verstehen · Frag-Lana | Diktat-Booster · Wund-Tendenz-Quiz | ✓ Heute + Wunde + Assessment + Tour |
| 👩‍⚕️ Arzt | Diktat · eRezept-Pilot · KIM-FHIR-Bundle | Diktat-Strukturierung | ICD-10-Sprint | ✓ Heute |
| 🤲 Therapie | Diktat · Patient-Verlauf mit VAS/ROM/MRC-Sparkline · **Muster 13 HMV in Original-Optik** | Diktat · Verlaufsbrief-KI | HMV-Code-Match | ✓ Liste+Detail |
| 📋 Sozial | Diktat · **Hilfepläne mit ICF + SMART-Zielen** | Diktat · **ICF-Vorschlag-KI** | Paragraphen-Hunt | ✓ Liste+Detail |
| 🌱 Heilerziehung | Diktat · **Teilhabepläne BTHG + P-Budget** | Diktat | ICF-Lebenswelten | ✓ Liste+Detail |
| 🍲 Hauswirtschaft | Diktat · **DGE-Wochenplan + Allergen-Filter** | Diktat · **Speiseplan-KI** | Kostform-Puzzle | ✓ Wochenplan |
| 🌻 Erziehung | Diktat · **Carr-Lerngeschichten** | Diktat · **Lerngeschichte-Entwurf-KI** | Bildungs-Bingo | ✓ Liste+Detail |
| 🤝 Ehrenamt | Begleit-Diktat · Aufwands-Rechner · **Begleit-Cockpit mit Stimmungs-Sparkline** | — | Begleit-Bingo | ✓ Cockpit + Liste + Detail |
| 🗂 Stationsleitung | HUD · Konferenz · Cross-Beruf-Termine · TI-Cockpits · SFU-Setup · Cloud-Recordings · Stationsmanagement (Bett+Belegung) · Personal-Onboarding · Klienten-Direkt-Anlage · Identity-Registry · **CSV-Bulk-Import** · **Selbst-Anlage-Wizard** | KI-Dienstplan-HUD | Dienstplan-Arena · Genehmigungs-Sprint · Audit-Hunt · Wirtschaft-Sandbox | ✓ HUD |
| 💶 Krankenkasse | Bescheid-Diktat · Eingangskorb · **Schein-Optik Muster 1/12 + Bescheid-Brief mit KI-Stempel-Assets** | — | — | ✓ Portal + Vorgang |
| 🏛 Genossenschaft | Pool · Solidartopf · Quartal-Ausschüttung · Aufsichtsrats-PDF + eIDAS | — | — | **✓ Pool + Solidartopf + Ausschüttung** |
| 🌿 Klient:in | Akte-verstehen · Live-Demo · Wundverlauf · Brillenmodus · **Bescheide in Original-Optik + Klartext + Widerspruchs-Editor** | KI-Klartext · KI-Widerspruchs-Brief (§ 84 SGG) | NBA-Sprint · Bescheid-Quiz | (Sonderfall · feste „teilhabe") |
| 📦 Lieferanten | GWÖ-Onboarding · Pool · 4 Diktate | — | — | — |

**Aktueller Reifegrad gesamt:** ~96 % live · 15 Mini-Games · 8 Berufe mit Workflow-Cockpits · 20 Cockpits Expertise · **NNN-Pflegeplan-Generator** · **DSGVO Art. 15/17/20** komplett · **QR-Code-Karte** für Identity · **Bett-Reservierung** · **Push pro Identity mit Empfänger-Filter** · **3 druckbare Aquarell-Broschüren** pro Nutzungsebene · 20 ElevenLabs-Sounds · OS-Push + VAPID · PWA · Layout-Bug global gefixt.

---

## Was als nächstes ansteht

### ✓ Erledigt seit letztem HANDOFF (14 von 20 Original-ToDos + viel mehr)

- [x] Pflege-Quartalsabrechnung Stub mit DTA-Format-Vorschau
- [x] Pflegegrad-Antrags-Pipeline
- [x] Wundmanagement mit Foto-Verlauf (ICW-Standards)
- [x] Cross-Beruf-Termin-Migration
- [x] gematik-Konnektor-Anbieter-Vergleich
- [x] KIM-Mail produktiv (FHIR-Bundle-Vorschau)
- [x] eRezept-Endpunkt an einem Pilot-Arzt-Cockpit
- [x] HBA + SMC-B Karten-Anbindung (Lifecycle-Cockpit)
- [x] Voll-WebRTC mit RTCPeerConnection + ICE via Supabase Broadcast
- [x] LiveKit/mediasoup SFU für >4 Teilnehmer (Setup-Stub)
- [x] Cloud-Recording mit FHIR-Encounter-Audit-Trail
- [x] Aufsichtsrats-Bericht-PDF-Export mit eIDAS-Signatur
- [x] Politik-Aggregat-Pipeline echt aus aggregierten Daten
- [x] Quartal-Ausschüttung-Workflow für eG-Mitglieder

**Plus zusätzlich:**
- [x] Mobile-Hamburger-Drawer
- [x] Brillenmodus universal (KI-Klartext)
- [x] 11 Berufe mit eindeutiger Akzent-Farbe
- [x] 15 Mini-Games hinter optionalem 🎮-Toggle
- [x] 5 echte Beruf-Cockpits (Therapie · Sozial · HE · HW · Erz) über das Diktat hinaus
- [x] 4 zusätzliche KI-Funktionen pro Cockpit
- [x] Expertise-Modus Lerne / Praxis / Profi · global im AppShell + KasseShell + 20 Cockpits gewired (inkl. Genossenschaft via override + Pflege-Sub-Cockpits)
- [x] Schein-Optik im Kasse-Portal (Muster 1/12 + Bescheid-Brief) mit 5 KI-Bild-Assets
- [x] Versicherten-Sicht für Bescheide (`/klient/bescheide`) · gleiche Schein-Komponenten in Klient-Akte
- [x] Aufmerksamkeits-Filter („braucht-meine-Aufmerksamkeit"-Block + Hub-Counter)
- [x] Widerspruchs-Editor mit KI-Vor-Formulierung (§ 84 SGG · 4 Heuristik-Fallbacks)
- [x] Print-Stylesheet für Schein-Optik (A4-Briefblatt mit Stempel)
- [x] Ehrenamt-Begleit-Cockpit als echtes Workflow-Cockpit (Stimmungs-Sparkline + Lebenslagen)
- [x] Schein-Optik auf Therapie ausgeweitet (Muster 13 HMV)
- [x] Stationsmanagement mit Bett+Belegung als eigene Entitäten + 5 Aktions-Forms (Aufnahme/Verlegung/Entlassung/Blockierung/Freigabe)
- [x] NANDA-I Pflegediagnosen-Modul mit AEDS-Eingabe-Form + Default-Vorschlägen aus Katalog
- [x] Identity-Registry mit Claim-Token + zweistufigem Identitätscheck (Geburtsdatum / Personal-Nr)
- [x] Personal-Onboarding-Form für Mitarbeiter-Anlage
- [x] Klienten-Direkt-Anlage-Form für ambulante Versorgung
- [x] CSV-Bulk-Import-Maske für Bestands-Träger (10–100 Datensätze pro Lauf, Trockenlauf-Modus)
- [x] Selbst-Anlage-Wizard (Person ohne Berufsgruppe, sofort geclaimt)
- [x] Sound-System mit 20 ElevenLabs-Sounds (8 Kern + 12 Erweiterung) opt-in via FAB-Toggle
- [x] OS-Push-Notifications mit Apple-Style Glas-Toast (in-app) + native Tray (granted Permission)
- [x] PWA-Setup: manifest.webmanifest + Service-Worker + 4 Home-Screen-Shortcuts
- [x] Phase-B Server-Push mit VAPID + web-push + Subscribe-Endpoint + Test-Trigger
- [x] Layout-Bug global gefixt — body-pb statt per-Shell, greift auch ohne Shell
- [x] Layout-Bug: Bottom-Padding für FAB-Stack korrigiert (AppShell + KasseShell + KlientShell)
- [x] Expertise-Konzept-Doc als Maßstab für künftige Cockpits
- [x] NANDA → NIC/NOC Pflegeplan-Generator (NNN-Triade, Status-Chip, Profi-NNN-Reife-Indikatoren)
- [x] QR-Code-Karte für Identity (Apple-Wallet-Look, druckbar, ?token=…-Auto-Fill)
- [x] DSGVO-Workflow Art. 15+20 Export (JSON-Download) + Art. 17 Lösch (Aufbewahrungs-Pflicht-Prüfung)
- [x] User-Anzeige in Shells entfernt — UserMenu top-right ist einzige Quelle
- [x] Bett-Reservierung mit voraussAufnahme + Auto-Einlösen
- [x] Push-Subscription pro Identity + Empfänger-Gruppen-Filter (rolle/stationId/einrichtungId)
- [x] 3 Falt-Broschüren pro Nutzungsebene (Klient/Pflege/Träger) mit 18 Aquarell-Bildern + Drucken-Button

### Priorität A · Pending User-Aktionen (organisatorisch)

- [ ] **UG-Notar-Termin** (1-2 Wochen)
- [ ] **DSB extern beauftragen** (~200-300 €/Mo)
- [ ] **AÜG-Anwalt** für Cross-Träger-Tausch (4-8 Wochen)
- [ ] **Genossenschafts-Anwalt-Erstgespräch**
- [ ] **pk-ruhr.de tatsächlich kontaktieren** für reale Multiplier-Brücke
- [ ] **Pilot-Träger-Akquise** (KEM, St. Lukas, APL aus Demo-Set)

### Priorität B · TI-Hardware (sobald Standort produktiv)

- [ ] HBA-Karten bestellen (medisign / D-Trust Sign-Me-Konto)
- [ ] SMC-B-Karte für Shalem Care eG i.G. beantragen
- [ ] RISE-Test-Account 30 Tage anlegen
- [ ] KIM-Postfach `Shalem.Care@arz.kim.telematik` aktivieren
- [ ] Pilot-Standort definieren (Essen-Mitte als Demo-Heimat?)
- [ ] Erstes echtes eRezept versenden

### Priorität C · Phase B · echte Krypto + Versand

- [ ] FHIR-Bundle KBV-Profil-Validierung (HAPI FHIR Validator)
- [ ] S/MIME-Signatur via SMC-B-Karte (echter PKCS#7-Container)
- [ ] DTA-§302 mit ITSG-Prüfsoftware validieren
- [ ] eIDAS-QES via D-Trust Sign-Me Remote-Signing-API
- [ ] LiveKit-Server-SDK + AccessToken-Signing
- [ ] Recording-Egress über LiveKit + Supabase-Storage-Upload

### Priorität D · UX-Inkremente

- [ ] HANDOFF.md-Verlinkung im Cockpit für PDL-Onboarding
- [ ] Erst-Konferenz-Wizard (Recording-Anlass + Retention vorab)
- [ ] Brillenmodus mit Voice-Output (TTS wieder hochfahren)
- [ ] Mobile-Drawer · Search-Filter wenn Sidebar > 10 Items
- [ ] Game-Mode · Highscore-Liste pro Beruf (anonym, ohne Login)
- [ ] Game-Mode · Lana-Phrasen je Beruf-Persönlichkeit personalisieren
- [ ] Schein-Optik auf weitere Berufe (Sozial-Hilfeplan-Antrag, Arzt-eRezept Token-Karte, Pflegegrad-Bescheid)
- [ ] Bescheid-Versand-Workflow: aus Sachbearbeitung als KIM-Mail an Versicherten-Postfach (Phase B mit echter Krypto)
- [ ] Widerspruchs-Status-Tracking: nach „Drucken" eine Aktion „Widerspruch eingelegt" mit Frist-Countdown
- [ ] Bescheid-Aufmerksamkeit-Push-Notification (App-PWA · oder E-Mail-Stub)
- [ ] Lieferanten-Identity (z.B. Sanitätshaus, Apotheke) mit eigener Claim-Mechanik
- [ ] eG-Mitglieder-Anlage mit IBAN-Endung als Identitätscheck-Anker
- [ ] **VAPID-ENV-Vars in Hostinger eintragen** (3 Werte aus `bash scripts/generate-vapid-keys.sh`) damit Server-Push live geht
- [ ] Push-Subscription pro Identity speichern (statt anonym) wenn der User schon geclaimt ist
- [ ] Lana-Lautstärke-Slider im Sound-Toggle (Klick auf 🔊 hold = Slider)
- [ ] Magic-Link-Versand als E-Mail-Stub (Phase 2 mit echtem SMTP)
- [ ] DSGVO-Pseudonymisierung der verbundenen Datensätze beim Identity-Lösch (Phase B des Lösch-Workflows)
- [ ] Cron-Trigger für automatische Aufbewahrungs-Pflicht-Lösch-Auslösung (BGB § 630f Frist-Ablauf)
- [ ] Sound-Lautstärke-Slider im SoundToggle-FAB (statt fixer Lautstärke pro Sound)
- [ ] Pflegeplan-Eintrag · manuelle Ergänzung (Form für „eigene Intervention/Ziel hinzufügen")
- [ ] Bett-Reservierungs-Übersicht pro Station mit Frist-Countdown
- [ ] Pflegediagnose-Vollkatalog (statt ~16 alle ~250 NANDA-I Diagnosen aus DB)
- [ ] Push-Notifications an konkrete Empfänger-Gruppen (z.B. „alle Pflegekräfte einer Station") statt nur Self-Test

---

## Demo-Personas + Test-Routen

### Cockpit-Personas

| Rolle | Login-Persona | Test-Route |
|---|---|---|
| Pflegekraft | Dennis Reuter (`person-dr`) | `/pflege/heute` → Tour-KI → Wundmanagement → Assessment-Skalen |
| Arzt | Dr. Susanne Hartmann (`person-arzt-001`) | `/arzt/heute` → eRezept-Pilot → Verordnung-Diktat |
| Therapie | Sebastian Rauer (`person-therapeut-001`) | `/therapie/heute` → Diktat |
| Sozial | Mira Wagner (`person-sozial-001`) | `/sozial/diktat` |
| Lead/PDL | Detektiv Eins (`person-de1`) | `/admin/dienstplan/hud` → `/admin/abrechnung` → `/admin/pflegegrad` → `/admin/ti/karten` → `/termine` |
| Klient | Helga Reinhardt (`klient-hr`) | `/klient/heute` → Akte verstehen → Live-Demo |

### Game-Mode-Test-Pfad

1. Beliebiges Cockpit öffnen (z.B. `/admin`, `/arzt`, `/therapie`, `/sozial`)
2. Rechts unten 🎮-Toggle klicken → Toast „Mini-Games sichtbar"
3. Hero-Card erscheint im Cockpit · Klick → Vollbild-Spiel
4. Tastatur durchspielen (1-N für Antworten, ←/→ für Navigation)
5. Toggle wieder aus → klassischer Look kehrt zurück

### Test-Konferenz · WebRTC

- `/konferenz/konf-helga-q2` · "Starten" → `live`
- `/konferenz/konf-helga-q2/live` · Toolbar-Button 📡 **Mesh** aktivieren
- In zweitem Browser-Fenster gleiche URL → echte Peer-zu-Peer-Verbindung über Supabase-Broadcast

### Test-Verordnung + eRezept

- `/admin/verordnungen` · 4 Demo-HKP-Verordnungen mit FHIR-Bundle + S/MIME-Container
- `/arzt/erezepte` · 3 Demo-eRezepte (Metformin · Ramipril · NovoRapid)

### Test-Karten + Konnektor + SFU

- `/admin/ti/karten` · 5 Demo-Karten (HBA + SMC-B · 1 mit blockierter PIN.QES)
- `/admin/ti/konnektoren` · 6 Anbieter im Vergleich
- `/admin/ti/sfu` · LiveKit-Setup-Status

### Test-Recording

- `/admin/recordings` · 3 Demo-Aufzeichnungen (Helga-Q2 · MD-Audit · GV-2025-permanent)
- Pro Recording ausklappbares FHIR-Encounter + DocumentReference

### Test-Aufsichtsrat-PDF

- `/aufsicht?q=Q1` → "📄 Druck-Ansicht" → `/aufsicht/druck/Q1`
- Browser-Druck (⌘P/Strg+P) → Speichern als PDF
- Footer enthält eIDAS-Container-Vorschau

### Test-Quartal-Ausschüttung

- `/genossenschaft/ausschuettung` · 3 Quartale · Stufen-Buttons schalten Status weiter

---

## Wichtige Dateien · zentrale Orte

```
docs/
  PVS_STRATEGIE.md             Strategie + Phasen + Modul-Matrix
  HANDOFF.md                    Diese Datei
  EXPERTISE_KONZEPT.md          3 Stufen pro Beruf systematisch (Azubi/Praxis/Profi)
  STRATEGIE_TEAM_WOW.md         Branchen-Studien-Anker

apps/web/
  app/
    pflege/{heute,doku,tour,selbst,assessment,wunde,diktat/booster}/    Pflege-Cockpit
    arzt/{heute,diktat,erezepte,quiz,...}/                              Arzt
    therapie/{heute,diktat,quiz,patienten,patient/[id]}/                Therapie + Verlauf
    sozial/{diktat,quiz,hilfeplan,hilfeplan/[id]}/                      Sozial + Hilfeplan
    heilerziehung/{diktat,quiz,teilhabe,teilhabe/[id]}/                 HE + Teilhabe
    hauswirtschaft/{diktat,quiz,wochenplan}/                            HW + DGE-Plan
    erziehung/{diktat,quiz,lerngeschichten,lerngeschichten/{[id],neu}}/ Erz + Carr
    ehrenamt/{begleitung,protokoll,quiz}/                               EA
    klient/{heute,akte/verstehen,akte/wunde,bescheid-quiz,bescheide,bescheide/[id]}/ Klient
    kasse/diktat/                                                        Kasse
    admin/{dienstplan/{hud,archiv,arena}}/                               PDL
      genehmigungen/{,sprint}/ · verordnungen/ · abrechnung/[id]/[rId]/
      pflegegrad/[id]/ · ti/{konnektoren,karten,sfu}/
      recordings/ · audit/hunt/ · wirtschaft/sandbox/
      stationen/{,[id]}/                Bettenraster + Aufnahme/Verlegung
      personal/                         Mitarbeiter-Onboarding mit Claim
      klienten/                         Klient-Direkt-Anlage (ambulant)
      import/                           CSV-Bulk-Import für Bestands-Träger
    identity/{claim,anmelden,[id]}/                                       Claim-Page + Selbst-Anlage + Identity-Detail
    api/push/{subscribe,test}/                                            Web-Push Subscribe + Test-Trigger
    konferenz/[id]/{live}/                                              Fallbesprechung
    pflegegrad-check/{,sprint}/                                          Pflegegrad-Quiz
    aufsicht/druck/[quartal]/                                            Bericht-Druck
    politik/ · termine/ · genossenschaft/{pool,solidartopf,ausschuettung}/

  components/
    AppShell.tsx                Sidebar · Mobile-Drawer · Beruf-Akzent · ExpertiseChip-Slot · expertiseRolleOverride
    KasseShell.tsx              Kostenträger-Portal-Shell · ExpertiseChip-Slot · pb-Korrektur
    KlientShell.tsx             Klient-Sicht-Shell · ohne Expertise (Sonderfall „teilhabe") · pb-Korrektur
    ExpertiseChip.tsx           Lerne/Praxis/Profi-FAB-Toggle pro Beruf
    ExpertiseGate.tsx           <NurAbProfi>, <NurBeiLerne>, <NurAb / NurBis>
    LerneTipp.tsx               Glossar-Banner für Casual/Azubi · nur im lerne-Modus
    Sparkline.tsx               Mini-Chart für VAS/ROM/MRC + Stimmung 1–5
    scheine/MusterEinsAU.tsx    AU gelb · Muster 1 KBV-Look
    scheine/MusterZwoelfHKP.tsx HKP rosé · Muster 12 KBV-Look
    scheine/MusterDreizehnHMV.tsx HMV blau-grau · Muster 13 KBV-Look
    scheine/KassenBescheidBrief.tsx Bescheid-Brief mit Briefkopf + Stempel
    scheine/WiderspruchBrief.tsx Spiegel-Brief vom Versicherten zur Kasse
    scheine/WiderspruchEntwurfBox.tsx Lana-Editor (client) mit Brief-Vorschau
    scheine/KlartextSpalte.tsx  Side-by-side Original ↔ Klartext + Glossar
    scheine/DruckenButton.tsx   window.print() Trigger
    station/BettAktionForm.tsx  5 Forms: Belegen/Entlassen/Verlegen/Blockieren/Freigeben
    station/BettAktionAccordion.tsx wählt je Bett-Status passende Aktions-Buttons
    pflege/PflegediagnoseSetzenForm.tsx NANDA-Auswahl + AEDS-Format
    identity/IdentityBadge.tsx   Status-Pill ○/●/⊘ + Token-Anzeige
    identity/ClaimForm.tsx       zweistufiger Claim-Workflow (Token → Identitätscheck)
    identity/MitarbeiterAnlegenForm.tsx Personal-Onboarding mit Code
    identity/KlientAnlegenForm.tsx Direkt-Anlage für ambulant
    identity/IdentityVerwaltungActions.tsx PDL · neuen Code, Widerruf
    identity/CsvImportForm.tsx   CSV-Bulk-Import (Trockenlauf + Echtimport)
    identity/SelbstAnlegenWizard.tsx 3-Phasen-Selbst-Anlage
    SoundToggle.tsx              4. FAB · UI-Sounds opt-in
    notify/NotifyToastStack.tsx  Apple-Glas-Toast oben mittig (backdrop-filter)
    notify/NotifyToggle.tsx      5. FAB · 3-Status (aus/in-app/os)
    notify/ServiceWorkerRegistrar.tsx registriert /sw.js passiv
    IcfVorschlagBox.tsx         Sozial-Bedarfs-Text → ICF-Codes (Lana)
    TherapieBriefBox.tsx        Therapie-Sitzungen → Hausarzt-Brief (Lana)
    SpeiseplanKiBox.tsx         HW-Klient + Kostform → Wochenplan-Vorschlag (Lana)
    LerngeschichteEntwurfBox.tsx Beobachtung → Carr-Lerngeschichte (Lana)
    WochenplanGrid.tsx          7×5-Mahlzeiten-Grid mit Allergen-Filter
    Brillenmodus.tsx · GameModeToggle.tsx · GameModeWrapper.tsx
    KategorieMatch.tsx · QuizHeroCard.tsx
    [+ alle früheren · siehe git history]

  lib/
    ui/expertise.ts             useExpertise · ExpertiseLevel · LEVEL_RANK · localStorage
    ui/game-mode.ts             useGameMode-Hook
    therapie/verlauf.ts         Patient-Karteikarten · termine · tendenzVas
    therapie/verlaufsbrief-ki.ts Anthropic-Wrap mit Mock-Fallback
    sozial/hilfeplan-store.ts    Hilfeplan-Daten · ICF-Bewertungen
    sozial/icf-vorschlag-ki.ts   Bedarfs-Text → ICF-Codes
    heilerziehung/teilhabe-store.ts BTHG-Klient · Bedarf · Ziele · P-Budget
    hauswirtschaft/wochenplan.ts Mahlzeiten · Allergen-Codes · DGE
    hauswirtschaft/speiseplan-ki.ts Kostform-Plan-Vorschlag
    erziehung/lerngeschichten-store.ts BBP-Bereiche · Carr-Dispositionen
    erziehung/lerngeschichte-ki.ts Beobachtung → Entwurf
    ehrenamt/begleit-store.ts   3 Klient:innen · Stimmung 1–5 · Lebenslagen · Tendenz-Helper
    kasse/bescheid-daten.ts     Heuristik VorgangsTyp → Schein + Klartext-Paket
    kasse/widerspruch-ki.ts     KI-Generator für § 84 SGG-Widerspruch · 4 Heuristik-Fallbacks
    station/betten-store.ts     Bett+Belegung Entitäten · Belegen/Verlegen/Entlassen
    station/actions.ts          Server-Actions für Bett-Forms
    pflege/diagnose-katalog.ts  NANDA-I 2024–2026 · ~16 Diagnosen · 7 Domänen
    pflege/pflegediagnose-store.ts AEDS-Eintrag pro Klient · Status akut/chron/risiko/geloest
    pflege/pflegediagnose-actions.ts Server-Actions
    pflege/pflegeplan-store.ts  PflegeplanEintrag · Status (geplant/läuft/erreicht/abgesetzt) · Quelle (katalog/manuell)
    pflege/pflegeplan-actions.ts Server-Actions: generieren/manuell/Status setzen
    identity/store.ts           Registry · Token-Generator · Claim mit Identitätscheck
    identity/actions.ts         pruefeToken (Schritt 1) + claim (Schritt 2) + selbstAnlegen
    identity/csv-import.ts      Bulk-Import-Action mit Trockenlauf + Validierung pro Zeile
    identity/dsgvo.ts           DSGVO Art. 15+20 Export (JSON) + Art. 17 Lösch (Aufbewahrungs-Pflicht-Liste)
    sound/sound-player.ts       20 SoundKey · Audio-Cache · Lautstärke-Map · localStorage
    notify/notify.ts            3-Modus-Notify (aus/in-app/os) · Toast-Queue-Hook
    notify/push-store.ts        Web-Push-Subscription-Registry
    notify/push-server.ts       sendePush({...}) mit web-push + VAPID
    notify/push-client.ts       subscribePush() für PushManager-Browser-Abo

  public/
    sounds/                     20 ElevenLabs-MP3s (klick.mp3 bis gong.mp3)
    sw.js                       Service-Worker (push/click-Handler)
    manifest.webmanifest        PWA mit 4 Shortcuts
    icon-192.png · icon-512.png · icon-badge.png  PWA-Icons
    broschuere/                 18 Aquarell-Bilder (Higgsfield) für 3 Falt-Flyer

  app/
    broschuere/{page,klient,pflege,traeger}/                              Index + 3 Falt-Broschüren druckbar A4 quer
  components/
    broschuere/BroschuereLayout.tsx  Wiederverwendbares Mittelfalz-Layout + FeatureItem/Schritt/MagicBox
    pflege/PlanGenerierenButton.tsx  ✦-Button auf Diagnose-Karte
    pflege/PlanStatusChip.tsx        Klick-Status-Wechsel
    identity/QrCodeKarte.tsx         Apple-Wallet-QR-Karte mit Code + Verifikations-Hinweis
    identity/DsgvoActions.tsx        Profi · JSON-Export + Lösch mit Bestätigungs-Text

  public/scheine/
    stempel-praxis.png · stempel-bewilligt.png · stempel-abgelehnt.png
    papier-textur.png · wm-eau.png  (KI-generiert via nano_banana_2)
    games/quiz-{arzt,therapie,sozial,heilerziehung,hauswirtschaft,erziehung,ehrenamt}.ts
    dienstplan/arena-score.ts · approval/sprint-{store,actions}.ts
    audit/hunt-faelle.ts · wirtschaft/sandbox-modell.ts
    klient/bescheid-quiz.ts · beruf-diktat/booster-snippets.ts · wunde/quiz.ts
    [+ alle früheren · siehe git history]

scripts/
  post-build.mjs · crop-grids.py
```

---

## Stack-Übersicht

```
Frontend:   Next.js 15 App Router · React 19 · TypeScript · Tailwind 3
Backend:    Supabase (Frankfurt eu-central-1) · PostgREST · RLS · Storage · Auth
Realtime:   Supabase Realtime (postgres_changes + presence + broadcast)
WebRTC:     RTCPeerConnection + Supabase-Broadcast-Signaling (Mesh ≤4 Peers)
Audio/Video MediaRecorder (Diktat) · getUserMedia + getDisplayMedia (Konferenz-Live)
KI:         Anthropic Claude (Haiku 4.5 Default) · DeepSeek-Fallback · Mock
Hosting:    Hostinger Node.js (Auto-Deploy via GitHub-Push auf main)
Repo:       github.com/dkorn85/shalem-care
DB:         gpchwlqeqejxvynewjns.supabase.co
ENV:        NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY
            ANTHROPIC_API_KEY · ELEVENLABS_API_KEY (Sound-Generierung)
            SHALEM_SITE_URL (für metadataBase, optional)
            NEXT_PUBLIC_TURN_URL · NEXT_PUBLIC_TURN_USER · NEXT_PUBLIC_TURN_CREDENTIAL (TURN, optional)
            LIVEKIT_URL · LIVEKIT_API_KEY · LIVEKIT_API_SECRET (Phase 2 SFU, optional)
            NEXT_PUBLIC_VAPID_PUBLIC_KEY · VAPID_PRIVATE_KEY · VAPID_SUBJECT (Web-Push)
```

---

## Design-System · Beruf-Farben

Jeder Beruf hat eine eindeutige Akzent-Farbe in **AppShell · BottomNav · MobileDrawer · Brillenmodus**. Mapping in `components/AppShell.tsx#ROLE_PRIMAER`:

| Beruf | CSS-var |
|---|---|
| Pflege | `--mon` (rot-warm) |
| Arzt | `--vibe-profile` (violett) |
| Therapie | `--fri` (türkis) |
| Sozial | `--tue` (blau) |
| Erziehung | `--wed` (gelb) |
| Ehrenamt | `--thu` (grün) |
| Hauswirtschaft | `--sun` (sand) |
| Heilerziehung | `--sat` (rosé) |
| Stationsleitung | `--vibe-team` (petrol) |
| Klient | `--wed` (pink) |
| Kasse | `--vibe-approval` (gold) |

Sichtbar an: 2px-Sidebar-Border · Wordmark-Bereich-Gradient · Top-Bar zwischen Header und Content · Mobile-Header-Border · BottomNav-Top-Border · Drawer-Trigger-Tint · Brillenmodus-Floater.

---

## Game-Mode · Quick-Reference

**Toggle:** 🎮-FAB rechts unten · Default AUS · localStorage `shalem.game-mode`.

**15 Mini-Games:**

| Cockpit | Game-Route | Mechanik |
|---|---|---|
| Admin/PDL | `/admin/dienstplan/arena` | Auto-Pilot/Manuell/Sparring |
| Admin/PDL | `/admin/genehmigungen/sprint` | Tinder-Stack mit KI-Empfehlung |
| Admin/PDL | `/admin/audit/hunt` | Multi-Select-Lückensuche |
| Admin/PDL | `/admin/wirtschaft/sandbox` | Slider-Spielwiese mit Münzen-Regen |
| Pflege | `/pflege/diktat/booster` | 8-Sek-Rapid-Fire SIS-Felder |
| Pflege | `/pflege/wunde/quiz` | Vorher/Nachher-Tendenz |
| Klient | `/pflegegrad-check/sprint` | One-Question-Quiz mit Live-PG |
| Klient | `/klient/bescheid-quiz` | Amtsdeutsch-Multiple-Choice |
| Arzt | `/arzt/quiz` | ICD-10 Code-Bereiche |
| Therapie | `/therapie/quiz` | HMV-Codes |
| Sozial | `/sozial/quiz` | Paragraphen-Hunt |
| Heilerziehung | `/heilerziehung/quiz` | ICF-Lebenswelten |
| Hauswirtschaft | `/hauswirtschaft/quiz` | Kostform-Puzzle |
| Erziehung | `/erziehung/quiz` | BBP-Bildungsbereiche |
| Ehrenamt | `/ehrenamt/quiz` | Begleit-Reaktionen |

**Geteilte Mechanik:**
- Tastatur 1-N für Antwort · ←/→/Space/B für Navigation
- Combo-Streak mit Phrasen-Eskalation
- Lern-Hinweis-Box mit Begründung nach jeder Antwort
- Konfetti am Ende
- Erfolgs-Phrasen pro Trefferquote (perfekt/gut/solide/schwach)

---

## Branchen-Studien-Anker

| Beruf | Konkurrenten | Argumentation |
|---|---|---|
| Pflege | Vivendi · MediFox · Snap | SIS händisch ~30-90 min/Schicht |
| Arzt | CGM · doxter · MEDISTAR | Click-Workflow ~3 min/Verordnung |
| Therapie | Theorg · Buchner · Vivendi | 8-Felder-Form ~6 min |
| Sozial | connect-ASD · OPEN/Prosoz | 60 min/Hilfeplan |
| Heilerziehung | VINCI · ProSoz/Klees | 60-Felder-Excel |
| Erziehung | Stepfolio · Pixi | 5 min/Lerngeschichte |
| Klient-Klartext | washabich.de · BefundKlar | 1-3 Tage Wartezeit |
| Kasse-Bescheid | AOK/Barmer/TK | Amtsdeutsch · 60 min Bescheid |
| PDL-HUD | Connext Vivendi · MediFox DAN | Modul-fragmentiert, kein KI-HUD |
| Trading | — | 4 % Multiplier-Cut vs 35-45 % Verleih-Marge |
| Game-Modus | — | branchen-erste Gamification für Pflege-Software |

Quellen: BARMER Pflege-Report 2024, DBfK Personal-Studie 2025, Pflegebericht 2024, Statistisches Bundesamt 2025, DNQP-Hochschule-Osnabrück, ecogood.org GWÖ-Matrix 5.0, gematik-Zulassungsliste 2026-Q1.

---

## Push-Pattern

```bash
# Diese Session: direkt auf main mit credential.helper store
git add <files>
git commit -m "feat: ..."
git push   # Hostinger zieht aus main automatisch
```

**Hostinger-Hänger:** Bei > 10 Min "Building" Settings-and-redeploy klicken.

---

## Push-Auth-Notiz

Der PAT liegt in `~/.git-credentials` auf dem Termux-Tablet (chmod 600). Pushes laufen ohne weitere Eingabe.
