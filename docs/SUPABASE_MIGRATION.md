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
| `supabase/migrations/0005_audit_log.sql` | Lese-+Schreibe-Spur aller sensiblen Klient-Daten · DSGVO Art. 30 + Klient-Transparenz | bereit zum Ausführen |
| `supabase/migrations/0006_shift_slot.sql` | FHIR-Slot-Persistierung · ablöst Memory-Map · komplettiert Tausch-Markt | bereit zum Ausführen |
| `supabase/migrations/0007_realtime.sql` | Realtime-Publication für Wunsch + Tausch · live-Updates ohne Reload | bereit zum Ausführen |
| `supabase/migrations/0008_vollmacht_nachfolge.sql` | Nachfolge-Kette + Übergangs-Function bei Tod/Krankheit/Niederlegung | bereit zum Ausführen |

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

## Migration 0005 · audit_log

Schließt Befund #3 aus dem Expertenteam-Audit: zentrale Lese-/Schreibe-
Spur aller sensiblen Klient-Daten (DSGVO Art. 30 Verzeichnis +
Transparenz-Recht der Klient:in nach Art. 15).

### Was passiert
1. `audit_log`-Tabelle mit (at, user_id+role+name, klient_id, ressource,
   ressource_id, aktion, kontext jsonb, ip_hash)
2. Check-Constraints: 14 Ressource-Typen, 7 Aktion-Typen
3. RLS-Policies:
   - Klient:in selbst: vollständige Sicht über profiles.klient_id
   - Bevollmächtigte:r mit Aufgabenkreis 'gesundheit': über
     darf_im_namen_handeln() aus 0004
   - Mitarbeitende: nur eigene Zugriffe (Selbst-Audit, Schutz)
   - INSERT nur via service_role (Server-Action)
4. Demo-Seed: 7 Beispiel-Zugriffe für Helga über die letzten 3 Tage

### Hybrid-Layer

`lib/audit/store.ts`:
- `auditLog({...})` als universeller Schreibe-Hook für Profi-Cockpits
- Sync-API: `auditFuerKlient(klientId, limit)`, `auditFuerUser(userId, limit)`
- Async-API: `ladeAuditFuerKlient` mit Memory-Refresh
- MAX_MEMORY = 500 Einträge im RAM
- Schreibe parallel Memory + Supabase fail-soft

### Eingebauter Hook in 4 Profi-Cockpits

`KlientWuensche`-Spiegel-Komponente nimmt jetzt `zugriffVon` +
`zugriffRolle` + `zugriffKontext` Props und logged jeden Aufruf.
Eingebaut in:
- `/pflege` (Pflegekraft, schichtbriefing)
- `/therapie` (Sebastian Rauer, behandlungs-vorbereitung)
- `/apotheke/heimversorgung` (Lukas Faber, verblisterung-check)
- `/begleitung` (Marlene Voss, vor sitzung)

### UI-Sicht für Klient:in

`/klient/daten` zeigt eine neue Sektion "Wer hat auf meine Daten
geschaut" mit den 12 jüngsten Audit-Einträgen pro Klient:in. Pro
Eintrag: Aktion-Chip, User + Rolle, Ressource + ID, vor-X-Zeit,
Kontext-Reason als Subzeile.

DSGVO-Export-Paket erweitert um `audit` (bis 500 Einträge).

---

## Migration 0006 · shift_slot

Komplettiert die Tausch-Markt-Persistenz nach 0002. Bisher leben
Schichten ausschließlich in der Memory-Map aus `swap-store-memory.ts`
+ `seed-rolling.ts`. Nach Server-Restart wurde neu gesäht.

### Was passiert
1. `shift_slot`-Tabelle mit FHIR-kompatiblen Feldern denormalisiert:
   - id, start_at, end_at, shift_type (early/late/night/intermediate)
   - status (5 FHIR-Slot-Werte als check)
   - owner_user_id (FK auth.users) + owner_person_id (Demo-Bridge)
   - station_id, einrichtung_id, service_type
   - **fhir_blob jsonb** für volle Round-Trip-Kompatibilität mit Medplum
2. 5 Indexe (owner-user, owner-person partial, station+start, start, status+start)
3. updated_at-Trigger (wiederverwendet aus 0002)
4. RLS-Policies:
   - SELECT: alle authenticated (Station-Plan ist intern offen)
   - INSERT/UPDATE/DELETE: Owner über profiles.person_id ODER service_role
   - Stationsleitung-Pfad: Stub für Phase 2.5
5. SQL-Helper `shifts_ueberlappend(owner, start, end)` mit `tstzrange`
   für ArbZG-Validierung in Server-Actions

### Hybrid-Layer

`lib/swap-store-supabase-sync.ts` erweitert um:
- `syncSlotZuSupabase(slot, ownerId)` · Upsert mit on_conflict=id +
  fhir_blob als jsonb-Spiegel
- `syncSlotOwnerZuSupabase(slotId, newOwnerId)` · PATCH-only für
  Tausch-Übergaben
- `ladeSlotsAusSupabase()` · liest alle + mapped auf {slot, ownerId}

`InMemorySwapStore` (memory-Backend):
- `createSlot` syncht beim Anlegen
- `swapSlotOwners` syncht beide Owner-Patches (für Direkt-Tausch)
- `reassignSlot` syncht bei Wieder-Zuordnung
- `ladeAusSupabase` lädt jetzt parallel Offers + Slots, hydriert
  beides ins Memory (Memory wins bei Konflikt)

Damit ist die Tausch-Markt-Kette vollständig persistierbar:
**shift_slot ← swap_offer (slot_id text-Ref) ← swap_offer_history**

---

## Migration 0007 · Realtime-Channels

Pflege/Therapie/Apotheke sehen Wunsch-Änderungen jetzt **live**, ohne
Page-Reload. Auch Tausch-Markt-Vorgänge propagieren live (PDL sieht
neue „matched"-Vorgänge sofort).

### Was passiert
1. `supabase_realtime`-Publication wird um 4 Tabellen erweitert:
   - klient_wunsch + klient_wunsch_verlauf
   - swap_offer + swap_offer_history
2. `REPLICA IDENTITY FULL` für reichere UPDATE/DELETE-Payloads
3. Custom NOTIFY-Function `notify_wunsch_change` mit Trigger auf
   klient_wunsch — sendet pg_notify an Channel `wunsch_<klient_id>`
   mit JSON-Payload (op, klient_id, termin_id, wunsch, quelle, at)
   für direkten LISTEN-Use ohne Realtime-WAL

### Sicherheit

RLS aus 0001/0002/0004 gilt auch für Realtime-Events — jede:r
Subscriber:in bekommt nur die Events, die sie via SELECT-RLS auch
lesen dürfte. Pflege/Therapie/Apotheke sieht Wünsche nur via
care_team-Policy aus 0003 oder Vollmacht-Policy aus 0004.

### Client-Layer

`lib/realtime/wunsch-channel.ts`:
- `subscribeWunschChannel(klientId, callback)` mit serverseitigem
  Filter `klient_id=eq.<id>` für minimalen Traffic
- Fail-soft: wenn Supabase nicht konfiguriert, gibt no-op-unsub zurück

`components/klient/WunschLiveBadge.tsx`:
- Zeigt minimalen Live-Indikator (Punkt + „live"-Label)
- Bei Event blinkt 2.4s + triggert `router.refresh()` für SSR-Update
  des Spiegels
- Eingebaut in `KlientWuensche` — alle 4 Profi-Cockpits bekommen
  damit automatisch die Live-Verbindung

### Limits (Free-Plan)

200 concurrent connections, 100k messages/day. Für Produktion auf
Pro/Team-Plan upgraden.

---

## Migration 0008 · vollmacht_nachfolge

Rollen-Übergang in der Vollmachts-Kette nach BGB § 1815-Reform 2023.
Wenn die/der primär Bevollmächtigte stirbt, schwer erkrankt, dauerhaft
nicht erreichbar ist oder die Vollmacht aktiv niederlegt, springt
die nächste Person in der Reihenfolge ein.

### Was passiert
1. `vollmacht_nachfolge` mit Ranking 1..9 + 5 Auslöser-Typen
   (tod-vorgaenger, geschaeftsunfaehig, nicht-erreichbar-7-tage,
    eigene-niederlegung, manuell-klient)
2. `vollmacht_aktivierung_log` für Übergangs-Verlauf
3. SQL-Function `nachfolge_aktivieren(vollmacht_id, grund)`:
   - sperrt alte Vollmacht (FOR UPDATE)
   - sucht kleinste freie Reihenfolge
   - inaktiviert alte Vollmacht (widerrufen_am + Grund)
   - legt neue Vollmacht aus Nachfolge-Daten an (Aufgabenkreise vererbt)
   - markiert Nachfolge-Eintrag als aktiviert
   - schreibt Log
   - alles in einer Transaktion
4. RLS:
   - Klient:in selbst sieht + ändert eigene Nachfolgen
   - Bevollmächtigte:r sieht ihre eigenen Nachfolge-Einträge
   - Aktivierungs-Log ist read für Klient + Bevollmächtigte mit
     gesundheit-Aufgabenkreis (via 0004-Helper)
   - INSERT in Log nur über die Function (security definer)
5. Idempotenter Demo-Seed: 3 Nachfolgen für die Helga-Tochter-Vollmacht
   (Heike Liebenau bei Tod, Bernd Reinhardt bei Geschäftsunfähigkeit,
    Dr. Anna Bachmann als gerichtliche Reserve)

### Hybrid-Layer + UI

`lib/vollmacht/store.ts` erweitert:
- Aufloeser-Union + AUFLOESER_LABEL
- VollmachtNachfolge-Type
- Sync-API: nachfolgeFuerVollmacht, alleNachfolgenFuerKlient
- Demo-Seed in globalThis.__SHALEM_VOLLMACHT_NACHFOLGE__

`/klient/daten` zeigt neue Sektion „Vollmachts-Nachfolge" mit:
- Vollmacht + primär Bevollmächtigtem
- Nachfolge-Kette als nummerierte Liste
- Auslöser-Chip pro Nachfolge
- aktiv-seit-Chip wenn schon übergegangen
- Notiz-Subzeile

---

## Was als nächstes kommt

1. **Migration 0009** `pflegediagnose` + `pflegeplan` als
   eigenständige Tabellen (heute noch in `pflege/diagnose-store.ts`
   in-memory)
2. **Migration 0010** `belegung` für Stationsmanagement-Persistierung
3. **Migration 0011** `klient_termin` für die Wochen-Termine
   (heute statisch in `klient/woche.ts`)
