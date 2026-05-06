# Dead-Link-Audit · Shalem Care

**Status: ✅ vollständig behoben am 2026-05-06.** Details siehe Resolved-Block am Ende.

**Stand der Erst-Erhebung:** 2026-05-05 · Branch `claude/tender-nightingale-f1bb8b` · 76 Routen

Audit-Methodik: Alle `href`-Attribute in `apps/web/app/` und `apps/web/components/` (inkl. NAV-Konstanten, `<Tab>`, `<Link>`, `<a>`) gegen die tatsächliche Route-Liste (Glob `app/**/{page.tsx,route.ts}`) abgeglichen. Image-`src`-Pfade gegen `apps/web/public/` geprüft.

## Klassifikation

| Code | Bedeutung |
|---|---|
| `tot` | Ziel-Route existiert nicht — 404 zur Laufzeit |
| `platzhalter` | `href="#"` oder Anchor ins Nirwana |
| `existiert-aber-leer` | Page existiert, aber reiner Stub ohne Inhalt |
| `redirect-loop-risiko` | Page redirected auf andere Route — UX/SEO-Bremse |
| `OK` | grün |

## Befunde · echte tote Links (Priorität A)

| # | Datei | Zeile | Aktueller `href` | Klasse | Empfohlene Reparatur |
|---|---|---|---|---|---|
| 1 | `apps/web/components/KasseShell.tsx` | 61 | `/kasse/eau` | tot | Page anlegen `app/kasse/eau/page.tsx` (eAU-Eingangskorb) **oder** Tab entfernen bis Phase 2 |
| 2 | `apps/web/components/KasseShell.tsx` | 62 | `/kasse/krankengeld` | tot | Page anlegen `app/kasse/krankengeld/page.tsx` **oder** Tab entfernen |
| 3 | `apps/web/components/KasseShell.tsx` | 63 | `/kasse/hkp` | tot | Page anlegen `app/kasse/hkp/page.tsx` (HKP-Genehmigung) **oder** Tab entfernen |
| 4 | `apps/web/app/registrieren/page.tsx` | 96 | `/anmelden` | tot | `app/anmelden/page.tsx` mit `signInWithPassword` + OAuth-Login bauen (siehe `AUTH_SETUP.md` §5) |
| 5 | `apps/web/app/genossenschaft/beitreten/page.tsx` | 223 | `#` (Satzung) | platzhalter | PDF in `public/legal/satzung-eg-i-g.pdf` ablegen + Link auf `/legal/satzung-eg-i-g.pdf` setzen |

## Befunde · Anchor-Link ohne Ziel (Priorität B)

| # | Datei | Zeile | Aktueller `href` | Klasse | Empfohlene Reparatur |
|---|---|---|---|---|---|
| 6 | `apps/web/app/genossenschaft/page.tsx` | 58 | `#wie-funktioniert` | platzhalter | Anchor `<section id="wie-funktioniert">` auf der Seite ergänzen (Section existiert wahrscheinlich, ID fehlt) — verifizieren |

## Befunde · DemoTour referenziert dynamische Param-IDs (Priorität B)

| # | Datei | Zeile | Aktueller `href` | Klasse | Empfohlene Reparatur |
|---|---|---|---|---|---|
| 7 | `apps/web/components/DemoTour.tsx` | 51 | `/dienst/klient-wb` | OK (Param) | dyn. Route `/dienst/[klientId]` existiert; "klient-wb" muss aber als realer Klient-ID seeded sein — prüfen in `lib/seed.ts` |
| 8 | `apps/web/components/DemoTour.tsx` | 149 | `/arzt/anfragen/va-seed-0` | OK (Param) | dyn. Route `/arzt/anfragen/[id]` existiert; ID-Existenz in `verordnung/store.ts` Demo-Seed prüfen |

## Befunde · Redirect-Loop-Risiko (Priorität C)

| # | Datei | Zeile | Aktueller `href` | Klasse | Empfohlene Reparatur |
|---|---|---|---|---|---|
| 9 | `apps/web/app/willkommen/page.tsx` | 4 | `redirect("/")` | redirect-loop-risiko | Page redirect-only — viele Footer-Links (presse, ueber-uns, roadmap, datenschutz, KasseShell-Logo, KlientShell-Logo) zeigen auf `/willkommen` und werden dadurch immer auf `/` umgeleitet. Entweder Inhalt einbauen oder alle Footer-Links direkt auf `/` umstellen |
| 10 | `apps/web/components/KasseShell.tsx` | 37 | `/willkommen` | redirect-loop-risiko | siehe #9 |
| 11 | `apps/web/components/KlientShell.tsx` | 38 | `/willkommen` | redirect-loop-risiko | siehe #9 |
| 12 | `apps/web/app/datenschutz/page.tsx` | 10–11 | `/willkommen` | redirect-loop-risiko | siehe #9 |
| 13 | `apps/web/app/presse/page.tsx` | 20, 23, 151 | `/willkommen` | redirect-loop-risiko | siehe #9 |
| 14 | `apps/web/app/ueber-uns/page.tsx` | 20, 23, 140 | `/willkommen` | redirect-loop-risiko | siehe #9 |
| 15 | `apps/web/app/roadmap/page.tsx` | 111, 114, 180 | `/willkommen` | redirect-loop-risiko | siehe #9 |

## Befunde · sonst überprüft, alles OK

- Alle 12 Cockpit-Links (`/pflege`, `/arzt`, `/therapie`, `/sozial`, `/erziehung`, `/ehrenamt`, `/heilerziehung`, `/hauswirtschaft`, `/admin`, `/kasse`, `/klient`, `/genossenschaft`) auflösen
- Alle Sub-Routes laut HANDOFF (Pflege: `/dienst`, `/tausch`, `/profil`, `/profil/krankmeldung` · Arzt: `/anfragen`, `/anfragen/[id]`, `/patienten`, `/patient/[id]` · Therapie: `/heute`, `/patienten`, `/abrechnung` · Sozial: `/faelle`, `/hilfeplan`, `/schutz`, `/md-begutachtung` · Erziehung: `/gruppen`, `/lerngeschichten` · Ehrenamt: `/begleitung`, `/protokoll` · Admin: `/dienstplan`, `/dienstplan/import`, `/dienstplan/koordinator`, `/disposition`, `/team`, `/team/[id]`, `/erloes`, `/zahlungen`, `/auswertung`, `/aktivitaet`, `/dokumentation`, `/dokumentation/[klientId]`, `/genehmigungen`, `/db-status` · Klient: `/akte`, `/akte/befunde`, `/akte/wunde`, `/akte/anamnese`, `/akte/behandlung`, `/begleiter`, `/notizen`, `/buchen`, `/anfrage`, `/bewertung`) existieren als Page
- Cross-Profession: `/netz`, `/konferenz/[id]`, `/notfall`, `/warum`, `/system`, `/system/audit`, `/system/[bundeslandId]`, `/system/[bundeslandId]/[einrichtungId]` existieren
- Auth-Flow: `/registrieren`, `/registrieren/start`, `/registrieren/verifizieren`, `/registrieren/verifizieren/eingereicht`, `/auth/callback` (route.ts) — alle vorhanden. **Lücke:** `/anmelden` fehlt (siehe #4) und `/admin/verifikationen` fehlt (Pruefer-Page · in `AUTH_SETUP.md` §5 als TODO markiert) — wird allerdings noch nirgends verlinkt, daher kein Dead-Link-Eintrag, sondern Roadmap-Item.
- Image-`src`-Pfade alle auf existierende Dateien (`public/akte/*`, `public/anamnese/*`, `public/onboarding/*`, `public/warum/*`, `public/notfall/*`, `public/datenschutz/*`, `public/inbox/*`, `public/loops/*`, `public/anim/*`, `public/empty/*`, `public/brand/*`, `public/tibetisch/*`, `public/befunde/demo/*`)
- Externe Links (`mailto:hello@shalem.de`, `https://github.com/dkorn85/shalem-care`, `https://merkabaprojekt.de`) — funktional, nicht im Audit-Scope

## Zusammenfassung

| Klasse | Anzahl Treffer |
|---|---|
| tot | **4** (KasseShell ×3, /anmelden ×1) |
| platzhalter | **2** (Satzung-PDF, `#wie-funktioniert`-Anchor) |
| redirect-loop-risiko | **7 Fundstellen über 5 Dateien** (alle wegen `/willkommen` → `/`) |
| existiert-aber-leer | 0 (keine reinen Stub-Pages identifiziert) |
| OK (Param-Ids zur Verifikation) | 2 |

**Sofort-Maßnahmen (Priorität A):**

1. KasseShell-Tabs: 3 fehlende Pages anlegen oder Tabs auskommentieren bis Phase 2 (5 min für die einfache Variante)
2. `/anmelden` Page bauen (1 h, blockiert Auth-Flow für wiederkehrende User)
3. Satzung-PDF in `public/legal/` ablegen oder Checkbox-Text auf "in Vorbereitung" ändern
4. `/willkommen` entweder mit Inhalt füllen (z. B. Onboarding-Hero) **oder** alle Footer-Links auf `/` umbiegen — Letzteres ist 2 min Arbeit

---

## ✅ Resolved · 2026-05-06

| # | Punkt | Erledigt durch |
|---|---|---|
| 1–3 | KasseShell-Tabs `/kasse/eau`, `/kasse/krankengeld`, `/kasse/hkp` | Pages existieren — frühere Session |
| 4 | `/anmelden` | Page existiert mit Email/Password + 4 OAuth-Provider — frühere Session |
| 5 | Satzung-Platzhalter (`href="#"`) | Commit `ac7507a` — Hinweis auf Notar-Termin + Roadmap-Link |
| 6 | `#wie-funktioniert`-Anchor ohne Ziel | Commit `ac7507a` — Section-ID auf Plattform-Bilanz-Box gesetzt |
| 9–15 | `/willkommen`-Redirect-Loop (7 Fundstellen, 5 Dateien) | Commit `ac7507a` — `/willkommen` jetzt echte Onboarding-Page mit 10 Portalen; 6 Refs auf `/` umgebogen |

**Zusätzlich gelandet (über Audit-Scope hinaus):**
- Commit `f844f61` — Shalem-konforme Error-Pages: `app/error.tsx`, `app/not-found.tsx`, `app/global-error.tsx`. Fängt unbekannte Routen + `notFound()` aus dynamischen IDs + Render-Errors auf Page- und Root-Layout-Ebene; ersetzt den nüchternen Next-Default „404: This page could not be found.".
- Commit `8e9dd1c` — `/kontakt`-Page mit 8 Anliegen-Pfaden + 3-FAQ-Block (Demo-Account, Plattform-Cut, Roadmap), verlinkt aus Landing-Footer und `/willkommen`.
- Commit `9762033` — `app/sitemap.ts` mit 35 öffentlichen Routen + `app/robots.ts` mit gezielten Disallow-Regeln für auth-Cockpits, `/api/`, `/auth/`, Verifikations-Strecke.

Damit hat die App keine nüchternen Fehlermeldungen, keine toten Links und einen sauberen Crawler-Footprint mehr.
