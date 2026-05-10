# Supabase-Migration · Phase 2

**Stand:** 2026-05-10 · Phase-2-Start nach Expertenteam-Befund
„Phase-1-globalThis-Persistenz blockiert Echtbetrieb".

---

## Ansatz

**Hybrid-Stores statt harter Schnitt.** Jede Store-Lib bleibt
funktional in beiden Modi:

- **Memory-Modus** (Default): `globalThis`-Map, kein DB-Zugriff —
  perfekt für lokale Entwicklung und Demo ohne Internet
- **Supabase-Modus** (wenn `SUPABASE_URL` + `SUPABASE_ANON_KEY` gesetzt
  sind): Schreib-Operationen gehen parallel an Memory + Supabase
  (best-effort, fail-soft), Lese-Operationen primär aus Memory mit
  Async-Refresh aus Supabase

**Vorteil:** kein Zwangs-Schalter. Der Memory-Stand ist Wahrheit, Supabase
spiegelt — bei Server-Restart wird Memory aus Supabase neu gehydriert.

---

## Migrations

| Datei | Inhalt | Status |
|---|---|---|
| `supabase/migrations/0001_klient_wunsch.sql` | Wunsch-Tabellen + RLS + Verlauf-Trigger | bereit zum Ausführen |
| `supabase/migrations/0002_swap_offer.sql` | Tausch-Markt-Tabellen + RLS + state-change-Trigger | bereit zum Ausführen |
| `supabase/migrations/0003_care_team.sql` | profiles-Bridge + care_team-Tabelle + RLS · aktiviert die Stub-Policies aus 0001+0002 | bereit zum Ausführen |
| `supabase/migrations/0004_vollmachten.sql` | Vorsorge/Betreuung/PV/Angehörigen-Vollmachten + RLS-Erweiterung klient_wunsch | bereit zum Ausführen |

---

## Migration 0001 ausführen

### Im Supabase-Dashboard

1. Login auf <https://app.supabase.com> → Projekt wählen
2. **SQL Editor** → **New query**
3. Inhalt von `supabase/migrations/0001_klient_wunsch.sql` einfügen
4. **Run** klicken
5. Im **Table Editor** prüfen: `klient_wunsch` und
   `klient_wunsch_verlauf` müssen erscheinen, beide mit Padlock-Icon
   (RLS aktiv)

### Mit Supabase-CLI (Phase 2.x)

Supabase-CLI ist im Projekt noch nicht eingerichtet. Wenn das kommen
soll:

```bash
# Einmalig
npm install -g supabase
supabase login
supabase link --project-ref <project-id>

# Pro Migration
supabase db push
```

---

## ENV-Variablen

Damit der Hybrid-Store auf Supabase-Modus umschaltet, müssen folgende
Variablen in `.env.local` (lokal) oder als Hostinger-Env (prod) gesetzt
sein:

```
NEXT_PUBLIC_SUPABASE_URL=https://gpchwlqeqejxvynewjns.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Optional: für Server-Action-Schreib-Operationen, die
# RLS umgehen müssen (z.B. Verlauf-Trigger im Service-Kontext)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`NEXT_PUBLIC_*` werden auch in den Browser-Bundles ausgeliefert — das
ist okay für ANON_KEY (RLS regelt Sicherheit). SERVICE_ROLE_KEY ist
**niemals** als `NEXT_PUBLIC_*` zu setzen.

---

## RLS-Policy-Logik

### `klient_wunsch` · 4 Policies

| Operation | Wer darf? | Bedingung |
|---|---|---|
| SELECT | Klient:in selbst | `profiles.user_id = auth.uid()` AND `profiles.klient_id = klient_wunsch.klient_id` |
| INSERT | Klient:in selbst | dito (with check) |
| UPDATE | Klient:in selbst | dito |
| DELETE | Klient:in selbst | dito |
| SELECT | Care-Team | wenn Tabelle `care_team` existiert UND `care_team.user_id = auth.uid()` AND `care_team.aktiv = true` |
| ALL | service_role | implizit (Supabase setzt für service_role alle Policies aus) |

### `klient_wunsch_verlauf` · 1 Policy

| Operation | Wer darf? | Bedingung |
|---|---|---|
| SELECT | Klient:in selbst | dito |
| INSERT | nur Trigger | (Trigger läuft `security definer`, deshalb keine Policy nötig) |

---

## Verlauf-Trigger

Der Trigger `klient_wunsch_log_trigger` schreibt automatisch bei jedem
INSERT/UPDATE/DELETE einen Eintrag in `klient_wunsch_verlauf`. Damit
ist die Berichtigungs-Spur (DSGVO Art. 16) **datenbank-garantiert** —
auch wenn die Anwendung den Verlauf-Eintrag vergessen würde.

Beispiel-Verhalten:

```sql
-- Klient legt einen Wunsch an
insert into klient_wunsch (klient_id, termin_id, wunsch, geaendert_von)
values ('klient-hr', 'kw-001', 'bitte erst Tee', 'selbst');
-- → Trigger schreibt 'gesetzt'-Eintrag

update klient_wunsch
set wunsch = 'bitte erst Lavendel-Lotion', geaendert_am = now()
where klient_id = 'klient-hr' and termin_id = 'kw-001';
-- → Trigger schreibt 'gesetzt'-Eintrag (neue Version)

delete from klient_wunsch where klient_id = 'klient-hr' and termin_id = 'kw-001';
-- → Trigger schreibt 'geloescht'-Eintrag
```

---

## Test nach Migration

Nach dem Ausführen der Migration im Dashboard:

```bash
# Lokal mit gesetzten ENVs starten
NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… npm run dev
```

1. `/klient/woche` öffnen
2. Bei einem Termin „bearbeiten" klicken, Wunsch eintragen, speichern
3. Im Supabase-Dashboard → Table Editor → `klient_wunsch` →
   neue Zeile sollte erscheinen
4. `klient_wunsch_verlauf` → entsprechender 'gesetzt'-Eintrag durch
   den Trigger
5. Server neu starten → Memory ist leer → Page neu laden — der
   gespeicherte Wunsch sollte aus Supabase nachgeladen werden
   (über `ladeWuenscheFuerKlient`-Aufruf in der Page-Loader-Funktion)

---

## Rollback

Falls nötig:

```sql
drop trigger if exists klient_wunsch_log_trigger on klient_wunsch;
drop function if exists klient_wunsch_log_change();
drop table if exists klient_wunsch_verlauf;
drop table if exists klient_wunsch;
```

Memory-Modus läuft danach wieder ohne Änderungen am App-Code — der
Hybrid-Store fängt fehlende Tabellen catch-und-fail-soft.

---

## Migration 0002 · Tausch-Markt

Gleicher Workflow wie 0001:

1. SQL aus `supabase/migrations/0002_swap_offer.sql` im Dashboard → SQL Editor → Run
2. Im Table Editor prüfen: `swap_offer` + `swap_offer_history` (beide mit RLS-Padlock)
3. App startet automatisch im Hybrid-Modus, sobald Supabase-ENVs gesetzt sind

### Hybrid-Logik im swap-store

`InMemorySwapStore.createOffer` und `.updateOffer` rufen
`syncOfferZuSupabase()` (fail-soft) — Memory bleibt Wahrheit, Supabase
spiegelt. Beim Page-Render hydriert `store.ladeAusSupabase()` die
Memory-Map mit Offers aus Supabase, die nach einem Server-Restart
sonst verloren wären.

Pro Verlauf-Eintrag muss die App nichts tun — der DB-Trigger
`swap_offer_log_state_change` schreibt automatisch in
`swap_offer_history` bei jedem state-Wechsel.

### Eingebaut in Pages

- `/tausch` (Hub)
- `/tausch/mein` (persönliche Sicht)
- `/tausch/[id]` (Detail mit Verlauf)

Alle drei rufen `store.ladeAusSupabase()` als ersten Schritt im
Page-Loader.

---

## Migration 0003 · care_team + profiles-Bridge

Aktiviert die Stub-Policies aus 0001 (klient_wunsch.care_team-SELECT)
und 0002 (swap_offer.profiles-Mapping) durch die echte Tabelle.

### Was passiert
1. `profiles` bekommt zwei neue nullable text-Felder:
   - `person_id` – Bridge zu Demo-Personal-Universum (z.B. "person-pf-001")
   - `klient_id` – wenn Klient:in selbst eingeloggt (z.B. "klient-hr")
2. `care_team`-Tabelle mit (user_id, person_id, klient_id, beruf,
   person_name, rolle, was, link_cockpit, primaer, aktiv, von/bis)
3. RLS-Policies:
   - Klient:in selbst sieht ihr ganzes Team
   - Care-Team-Mitglied sieht das Team aller Klient:innen, bei denen
     es selbst Mitglied ist (transitive Sicht)
   - Self-Update für eigene Daten
   - Insert/Delete vorerst nur via service_role (Phase 2.5: Stations-Admin)
4. updated_at-Trigger
5. Idempotenter Demo-Seed für Helga Reinhardt (9 Care-Team-Mitglieder)

### Hybrid-Layer

`lib/care-team/store.ts` mit:
- **Sync-API** (`careTeamFuerKlient`, `klientenFuerUser`) für Server-Components
- **Async-API** (`ladeCareTeamFuerKlient`) für Hydration aus Supabase
- Demo-Seed direkt in `globalThis.__SHALEM_CARE_TEAM__` bei erstem Import

`/klient/team` ruft als ersten Loader-Schritt
`await ladeCareTeamFuerKlient(KLIENT_ID)` und liest dann sync aus
dem Memory-Cache.

---

## Migration 0004 · Vollmachten

Bringt Vorsorge/Betreuung/Patientenverfügung/Angehörigen-Vereinbarungen
in eine echte Tabelle und gibt Bevollmächtigten via SQL-Helper-Function
echten RLS-Schreib-Zugriff auf klient_wunsch (mit Aufgabenkreis-Check).

### Was passiert
1. `vollmacht`-Tabelle mit 5 Vollmachts-Arten + 6 Aufgabenkreisen
   (gesundheit, aufenthalt, vermoegen, behoerden, wohnung, post)
2. SQL-Function `darf_im_namen_handeln(klient_id, aufgabe)`:
   - prüft user_id, Aktivität, Widerruf, Gültigkeitsdatum
   - 6-Monate-Frist bei Ehegatten-Notvertretung BGB § 1358
3. RLS-Policies auf `vollmacht`:
   - Klient:in selbst: SELECT/INSERT/UPDATE
   - Bevollmächtigte:r: SELECT eigener Vollmachten
   - Care-Team mit Aufgabenkreis 'gesundheit': SELECT (für Pflege-Notfall)
4. **Erweiterung der klient_wunsch-Policies** um den Vollmachts-Pfad:
   - Bevollmächtigte:r mit 'gesundheit' darf SELECT/INSERT/UPDATE/DELETE
     auf Wünsche der Klient:in (genau wie sie selbst)
   - Verlauf: SELECT für Bevollmächtigte
5. Idempotenter Demo-Seed: 3 Vollmachten für Helga
   (Tochter Liane, eigene PV, Schwester Heike)

### Hybrid-Layer

`lib/vollmacht/store.ts`:
- VollmachtArt-Union (vorsorge/betreuung/patientenverfuegung/angehoerige/ehegatten-notvertretung)
- Aufgabenkreis-Union (6 Werte)
- ART_LABEL + ART_FARBE + AUFGABENKREIS_LABEL für UI
- Sync-API (`vollmachtenFuerKlient`, `vollmachtenFuerBevollmaechtigten`,
  `darfImNamenHandeln`)
- Async-API (`ladeVollmachtenFuerKlient`)
- Demo-Seed in `globalThis.__SHALEM_VOLLMACHT__`

### UI-Integration

- `/klient/daten` zeigt neue Sektion "Vollmachten + Patientenverfügung"
  mit Art-Chip, Bevollmächtigtem, Aufgabenkreisen, Beglaubigung
- `lib/identity/dsgvo.ts` exportiert Vollmachten im DSGVO-Art-15-JSON

---

## Was als nächstes kommt

1. **Migration 0005** `audit_log` für Lese-Zugriffe (Befund #3 aus
   Expertenteam-Audit · Wer hat wann welche Klient-Daten gesehen)
2. **Migration 0006** `shift_slot` für FHIR-Slot-Persistierung (heute
   noch in-memory)
3. **Migration 0007** Realtime-Channels für Wunsch-Spiegel (Pflege
   sieht Wunsch-Änderung sofort)
