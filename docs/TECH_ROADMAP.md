# Tech-Roadmap · Shalem Care · Live-Betrieb

**Stand:** 2026-05-05 · Branch `claude/tender-nightingale-f1bb8b`
**Quellen:** `HANDOFF.md`, `docs/AUTH_SETUP.md`, `docs/PHASE_2_INTEGRATION.md`, `docs/AUDIT_DEADLINKS.md`

Diese Roadmap beschreibt, was technisch noch fehlt, um die Demo-App in einen echten Live-Betrieb zu überführen — strukturiert in vier Bereiche. Aufwands-Schätzung S/M/L/XL bezieht sich auf Engineering-Tage (S ≤ 1 d · M ≤ 3 d · L ≤ 10 d · XL > 10 d).

---

## 1 · Auth-Vervollständigung

Demo-Mode arbeitet mit `CURRENT_USER_ID`-Konstante + Persona-Switcher. Google-OAuth ist bereits live (siehe HANDOFF Schicht 17), aber die Sessions werden in den Cockpits noch nicht gelesen.

| # | Item | Aufwand | Blockiert | Voraussetzung |
|---|---|---|---|---|
| 1.1 | **`/anmelden` Page** mit `signInWithPassword` + OAuth-Buttons (Google · Microsoft · Apple · GitHub als Schalter) | S | Wiederkehrende User-Logins | `lib/auth/actions.ts` (existiert) |
| 1.2 | **Cockpits Auth-aware** — `auth.uid()` aus Server-Action ziehen, `lib/auth/server.ts` `getUser()` einbauen, `CURRENT_USER_ID`-Konstante aus 12 Cockpits entfernen, Persona-Switcher als Demo-Fallback wenn `process.env.NEXT_PUBLIC_DEMO_MODE === "1"` | M | Multi-User-Test, Audit-Log, Mandanten-Trennung | DB-Migration Profile (existiert), Middleware (1.4) |
| 1.3 | **Datei-Upload Storage** — `/registrieren/verifizieren` lädt Berufsurkunde/Heilberufsausweis nach `verifizierungen/<uid>/<rolle>/<feldname>.pdf`, schreibt Insert in `public.verifications` Tabelle, Status `eingereicht` | M | Neue Pflegekräfte können sich registrieren ohne Service-Role-Eingriff | Storage-Bucket-Policy (in `AUTH_SETUP.md` §4 dokumentiert, **noch in DB ausführen**) |
| 1.4 | **Middleware** für geschützte Routen (`middleware.ts`) — wenn `auth.uid()` null und Pfad in `/pflege \| /arzt \| /therapie \| ...`, Redirect auf `/anmelden?next=<urlencode-original>`. Wenn eingeloggt aber Profil unverifiziert (`profiles.verifiziert = false`), Redirect auf `/registrieren/verifizieren` | S | echte Mandanten-Trennung, DSGVO-Login-Pflicht | 1.2 |
| 1.5 | **`/admin/verifikationen` Pruefer-Page** — listet alle `verifications` mit Status `eingereicht`, Service-Role-Client, "Verifizieren" / "Ablehnen mit Grund"-Buttons, schreibt `verifizierungen.status` + `pruefer_id` + `pruefer_kommentar`. Sichtbar nur für `user_roles.rolle = "lead"` | M | Onboarding-Pipeline, Echtheits-Story | 1.3, Service-Role-Key in ENV |
| 1.6 | **Phase-2-Provider** Verimi · yes® · gematik-Heilberufsausweis als Generic-OAuth in Supabase | XL | echte ärztliche Identität (Verschreibungs-Recht), eGK-Login Klient | B2B-Verträge mit jedem Provider, gematik-TI-Konnektor (3.x) |
| 1.7 | **2FA TOTP** für Lead/Admin-Rollen (Supabase MFA-API) | S | Mandanten-Admin-Sicherheit | 1.2 |

---

## 2 · DB-Migration · Stores nach Supabase

Aktuell: 1 von 22 Stores in DB (klienten/einrichtungen/stationen). 21 weitere Stores liegen in-memory. Reihenfolge nach Wichtigkeit für Live-Betrieb:

| Pos | Store | Aufwand | Blockiert | Voraussetzung | SQL-Schema-Skizze |
|---|---|---|---|---|---|
| 2.1 | **`zuordnung/store.ts`** (Caseload person→klient:innen) | S | Multi-User-Test mit echten Auth-Sessions, `MeineKlienten`-Komponente | profiles tabelle, klienten tabelle | `caseloads(id, person_id fk profiles, klient_id fk klienten, beruf text, gueltig_von date, gueltig_bis date)` + RLS self-read |
| 2.2 | **`verordnung/store.ts`** (Anfragen Pflege/Klient → Arzt + Antworten) | M | Cockpit-übergreifender Workflow, Inbox | profiles, klienten | `verordnungen(id, klient_id, anfrage_von_id fk profiles, an_arzt_id fk profiles, status enum, anfrage_text, antwort_text, erstellt_am)` |
| 2.3 | **`wunde/store.ts`** (DNQP Wunddoku + Foto-Refs) | M | echte Pflege-Doku, MD-Begutachtung | klienten, Storage-Bucket `wundfotos` | `wunden(id, klient_id, lokalisation, epuap_grad, flaeche_cm2, bilder text[], erfasst_am, erfasser_id)` |
| 2.4 | **`konferenz/store.ts`** + `konferenz/actions.ts` (inkl. Live-Mode) | M | Cross-Profession-Layer, Realtime (3.x) | klienten, profiles | `konferenzen(id, klient_id, typ, datum, status enum, live_notizen text)` + `konferenz_agenda(id, konferenz_id, position, status, ...)` + `konferenz_beschluesse(id, konferenz_id, was, wer_id, bis_am, status)` |
| 2.5 | **`inbox/store.ts`** (Cross-Profession-Inbox aus Aktivitäts-Feed) | S | echte Cross-Profession-Story | profiles | `inbox_items(id, ziel_beruf, zugewiesen_an, status enum, quelle_event_id, erstellt_am)` |
| 2.6 | **`aktivitaet/feed.ts`** (16 Event-Typen) | S | Audit, Realtime-Push | profiles, klienten | `aktivitaet_events(id, typ, akteur_id, klient_id, beruf, ziel_beruf, payload jsonb, erstellt_am)` indexiert auf `(erstellt_am desc)` |
| 2.7 | **`swap-store`** (Slots, Tausch — Driver-Pattern fertig) | S | Tausch-Markt für echte Schichten | profiles, einrichtungen | `slots(id, person_id, einrichtung_id, von, bis, status)`, `tausch_angebote(id, slot_id, anbieter_id, status)` |
| 2.8 | **`doku/doku-store`** (SIS-Themenfelder) | M | echte Pflegedoku | klienten, profiles | `doku_eintraege(id, klient_id, themenfeld, eintrag_text, erfasser_id, erstellt_am)` |
| 2.9 | **`medikation/store`** (Verordnungen + Vergaben) | L | eRezept-Anbindung (3.x), BtM-Pflicht | klienten, profiles | `medikation_anordnungen(id, klient_id, verordner_id, wirkstoff, dosis, frequenz, erezept_id, btm bool, gueltig_von, gueltig_bis)` + `medikation_vergaben(id, anordnung_id, gegeben_von_id, gegeben_am, dosis_ist)` |
| 2.10 | **`bem/store`** + **`wiedereingliederung/store`** + **`krankmeldung/store`** | M | echtes AU-Modul für Pflegekräfte | profiles | jeweils Tabellen mit `ausgangsereignis_id` als FK auf `krankmeldungen.id` |
| 2.11 | **`abrechnung/store`** + **`kostentraeger/store`** | L | Geld-Story, DTA-Versand | medikation_anordnungen, klienten | `leistungsmodule(id, klient_id, code, datum, dauer_min, mitarbeiter_id)` + `abrechnungs_runs(id, kostentraeger_ik, periode, status, dta_csv)` |
| 2.12 | **`selfbooker/store`** + **`genossenschaft/store`** | L | Treuhand-Modul (Stripe), Anteile-Register | profiles, klienten, Stripe-Connect | `buchungen(...)`, `genoss_anteile(person_id, anteile_count, einlage_eur, beigetreten_am)` |
| 2.13 | **`befund/store`** (Imaging/Lab/Gait/Spine) | L | echte Bildgebung, OHIF/PACS | klienten, externer DICOMweb | `befunde(id, klient_id, modalitaet, befund_text, erstellt_am)` + `bilder(befund_id, dicom_url, ...)` |
| 2.14 | **`anamnese/schemas.ts`** + Antworten | M | Self-Booker Onboarding, Pflegeanfrage | klienten | `anamnese_antworten(id, klient_id, beruf, fragen_set, antworten jsonb)` |
| 2.15 | **`team-um-klient/store`** | S | Care-Team-Map, Konferenz-Pre-Reads | profiles, klienten | identisch `caseloads` (2.1) — kann konsolidiert werden |
| 2.16 | **`fortbildung/store`** | M | RbP-Punkteübertrag | profiles | `fortbildungen_belegt(person_id, modul_code, abgeschlossen_am, punkte)` |
| 2.17 | **`au-cascade`, `salutogenese`, `selbstbestimmung`, `bilanz`, `chat`, `dispo`, `tibetisch`, `nba`** | je S–M | nicht kritisch · können mehrheitlich Phase-1 bleiben | — | siehe `PHASE_2_INTEGRATION.md` |

**Empfohlene Reihenfolge:** 2.1 → 2.5 → 2.6 (Caseload + Inbox + Feed = Cross-Profession-Layer) → 2.7 → 2.4 → 2.2/2.3 → 2.8/2.9.

---

## 3 · Realtime + Push

Heute: `/netz` lädt Aktivitäts-Feed via 30 s Polling. Notfall-Modul ist UI-Stub ohne echtem Push.

| # | Item | Aufwand | Blockiert | Voraussetzung |
|---|---|---|---|---|
| 3.1 | **Supabase Realtime auf `aktivitaet_events`** — `useEffect` mit `supabase.channel().on("postgres_changes", ...)`. Polling `/netz` durch Stream ersetzen | S | echte Live-Synapse, /netz-Pulse | DB-Migration 2.6 |
| 3.2 | **Realtime auf `inbox_items` + `konferenz_*`** — Cockpit-übergreifend Inbox-Tiles + Konferenz-Live-Mode aktualisieren ohne Reload | S | Konferenz-Multi-User-Live | 2.4, 2.5, 3.1 |
| 3.3 | **Web-Push (VAPID)** Service-Worker `apps/web/public/sw.js` + `lib/push/subscribe.ts` + Notifications-API. VAPID-Key-Pair generieren, `push_subscriptions(user_id, endpoint, keys)` Tabelle | M | Notfall-Modul echt-fähig, eAU-Eingang Kasse | Service-Worker-Registrierung in Layout, HTTPS-Pflicht |
| 3.4 | **Notfall-Eskalations-Trigger** — Edge-Function `notfall-broadcast` triggert auf SOS-Knopf, Push an alle 4 Eskalations-Stufen je nach Reaktion. Twilio-Voice-Fallback wenn nach 90 s keine Push-Quittierung | M | Notfall-Story produktiv | 3.3, Twilio-Account, `notfall_eskalationen(id, klient_id, ausgeloest_am, stufe, quittiert_von, quittiert_am)` |
| 3.5 | **BLE-Pendant-Stub** für stationäre Notruf-Hardware (Bluetooth Low Energy via Web Bluetooth API, nur in Chrome+Edge) | L | echtes Pendant am Bett | 3.4, Hardware-Beschaffung |
| 3.6 | **Edge-Function** für tägliche Audit-Log-Komprimierung + Heart-Beat-Mail an Owner | S | DSGVO-Compliance | 4.1 |

---

## 4 · Compliance · DSGVO + IT-Sicherheit

Demo läuft ohne Real-Patient-Daten. Vor Live-Schaltung mit echten Klient:innen ist Compliance-Layer Pflicht.

| # | Item | Aufwand | Blockiert | Voraussetzung |
|---|---|---|---|---|
| 4.1 | **Audit-Log-Tabelle** `public.audit_log(id, akteur_id, aktion, ressource_typ, ressource_id, alt_jsonb, neu_jsonb, ip, user_agent, erstellt_am)` mit `pg_audit`-Extension oder Trigger auf alle CRUD-Tabellen. RLS: Lese-Recht nur Service-Role + Mandanten-Lead | M | DSGVO Art. 30 Verzeichnis, Pflege-QM | Supabase Pro (für `pg_audit`), DB-Migrations 2.x |
| 4.2 | **DSGVO-Lösch-Endpoint** Server-Action `deleteUserData(userId)` — kaskadierend über alle 22 Stores + Storage-Bucket; legt `audit_log`-Eintrag mit Lösch-Grund an; Soft-Delete via `geloescht_am` für 30 Tage Recovery, danach Hard-Delete via Cron | M | Art. 17 DSGVO Recht auf Löschung | 4.1 |
| 4.3 | **DSGVO-Export-Endpoint** Server-Action `exportUserData(userId)` → ZIP mit JSON je Tabelle + Foto-Bundle. Download nur über signed URL mit 24 h Ablauf | S | Art. 15 + 20 DSGVO | 4.1 |
| 4.4 | **AVV mit Supabase nach Art. 28 DSGVO** — Standardvertrag aus Supabase Legal Center unterzeichnen, in `docs/legal/avv-supabase-2026.pdf` ablegen. Frankfurt-Region ist EU/EWR-Hosting (kein US-Transfer) | S | Live-Schaltung mit echten Patienten-Daten | Owner-Signatur |
| 4.5 | **AVV mit Hostinger** + ggf. AVV mit Stripe (für Treuhand 2.12) + AVV mit Twilio (3.4) + AVV mit gematik-TI-Service-Provider (Phase 2) | S | siehe 4.4 | je Provider |
| 4.6 | **BSI IT-Grundschutz-Profil "Gesundheitswesen"** — Maßnahmenplan SYS.1.1, NET.1.2, ORP.4 anhand BSI-Bausteine ausfüllen, in `docs/compliance/bsi-checkliste.md`. Mindeststandards: TLS 1.3, Passwort-Policy, Backup täglich, Pen-Test jährlich | L | Verträge mit Pflegekassen (Anlage 5 fordert IT-Sicherheits-Nachweis) | Owner-Zeit für Workshop, ggf. externe Beratung |
| 4.7 | **C5-Testat von Supabase prüfen** — falls vorliegend, in `docs/compliance/` ablegen. Sonst: Risiko-Bewertung dokumentieren | S | nice-to-have für Behörden-Träger | — |
| 4.8 | **Datenschutz-Folgenabschätzung (DSFA) Art. 35** — Pflege-Daten = Art.-9-Daten, DSFA Pflicht. Template-Dokument anfertigen, mit DSB durchgehen | M | echte Patient:innen-Daten | externer DSB beauftragt |
| 4.9 | **TI-Konnektor-Policies + KIM-Postfach-Konfiguration** für gematik-Anbindung (Phase 2) | XL | eAU + eRezept produktiv | gematik-Vertrag, SMC-B-Karte je Pflegeeinrichtung |
| 4.10 | **Patch-Management Hostinger-Node** — Renovate/Dependabot in GitHub-Workflow, kritische CVEs binnen 7 d patchen, dokumentiert in `docs/compliance/patch-log.md` | S | BSI-Grundschutz | GitHub Actions aktiv |

---

## Top-5-Tech-Lücken priorisiert (für nächste Session)

1. **`/anmelden`-Page + Middleware (1.1 + 1.4)** — sonst kann kein wiederkehrender User die App nutzen
2. **DB-Migration `zuordnung` + `inbox` + `aktivitaet` (2.1, 2.5, 2.6)** — Voraussetzung für Realtime, Multi-User, Audit
3. **Cockpits Auth-aware (1.2)** — Persona-Switcher als Fallback, echte Sessions als Default
4. **Audit-Log + DSGVO-Lösch/Export (4.1–4.3)** — Pflicht bevor erste echte Klient:innen-Daten reinkommen
5. **AVVs + DSFA (4.4, 4.5, 4.8)** — keine Tech-Frage, aber rechtlich blockierend für Live-Betrieb

Damit lässt sich ein Pilot-Heim mit ~3 Pflegekräften + 5 Klient:innen live betreiben — alle weiteren Items in Bereich 2 + 3 + 4 sind Skalierung.
