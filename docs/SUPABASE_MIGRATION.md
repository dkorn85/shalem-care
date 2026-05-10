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
| `supabase/migrations/0002_swap_offer.sql` | Tausch-Markt-Tabellen | offen |
| `supabase/migrations/0003_care_team.sql` | Care-Team für RLS-Policies | offen |
| `supabase/migrations/0004_vollmachten.sql` | Vorsorge-Vollmachten + Betreuungen | offen |

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

## Was als nächstes kommt

1. **Migration 0002** für `swap_offer` + `swap_offer_history` mit RLS
   nach Mitgliedschaft in der Station
2. **Migration 0003** `care_team` als Brücke User↔Klient für die
   Read-Policies in 0001
3. **Migration 0004** `vollmachten` für Vorsorge-Bevollmächtigte, die
   im Namen der Klient:in Wünsche editieren dürfen
4. **Audit-Log** Lese-Zugriffe (Befund #3 aus Expertenteam-Audit)
