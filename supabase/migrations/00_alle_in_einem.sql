-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  Shalem Care · alle Supabase-Migrationen in einer Datei                   ║
-- ║                                                                            ║
-- ║  GENERIERT von scripts/build-all-in-one.sh — nicht direkt editieren.     ║
-- ║                                                                            ║
-- ║  Verwendung:                                                                ║
-- ║    1. Inhalt komplett kopieren                                              ║
-- ║    2. Supabase Dashboard → SQL Editor → New query                          ║
-- ║    3. Einfügen → Run                                                        ║
-- ║                                                                            ║
-- ║  Idempotent: kann mehrfach ausgeführt werden, alle CREATEs sind            ║
-- ║  if-not-exists, alle Policies drop-if-exists.                              ║
-- ║                                                                            ║
-- ║  Bei Fehlern bricht das Run beim Punkt ab und zeigt die Zeilennummer —    ║
-- ║  scroll dorthin, lies die Meldung, fix manuell oder schick mir die         ║
-- ║  Zeile zum Debug.                                                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝


-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0000_init_profiles_extension.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0000 · profiles-Tabelle + Bridge-Felder
--
-- Sehr früh ausgeführt, weil viele Policies in 0001-0014 auf
-- profiles.user_id, profiles.klient_id und profiles.person_id verweisen.
--
-- Falls profiles aus dem Auth-Init-Schema bereits existiert, werden
-- nur die Bridge-Spalten hinzugefügt. Falls nicht, wird die Tabelle
-- minimal angelegt (mit user_id + Self-RLS), damit alle Folge-
-- Migrationen referenzieren können.

-- ─────────────────────────────────────────────────────────────────────
-- profiles · minimale Anlage falls noch nicht da
-- ─────────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id          uuid         primary key default gen_random_uuid(),
  user_id     uuid         not null unique references auth.users(id) on delete cascade,
  email       text,
  display_name text,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

comment on table profiles is 'App-spezifische User-Felder · Brücke auth.users → Anwendung. Erweitert in 0000 um klient_id + person_id.';

create index if not exists profiles_user_id on profiles (user_id);

-- ─────────────────────────────────────────────────────────────────────
-- Bridge-Spalten ergänzen (idempotent)
-- ─────────────────────────────────────────────────────────────────────

alter table profiles
  add column if not exists person_id  text,
  add column if not exists klient_id  text;

create index if not exists profiles_person_id  on profiles (person_id) where person_id is not null;
create index if not exists profiles_klient_id  on profiles (klient_id) where klient_id is not null;

comment on column profiles.person_id is 'Bridge zu Demo-Personal-Universum (z.B. "person-pf-001"). Phase 2.5: durch echte staff_id ersetzt.';
comment on column profiles.klient_id is 'Wenn Klient:in selbst eingeloggt: ID im Klient-Universum (z.B. "klient-hr").';

-- ─────────────────────────────────────────────────────────────────────
-- RLS-Basics für profiles (falls noch nicht aktiv)
-- ─────────────────────────────────────────────────────────────────────

alter table profiles enable row level security;

drop policy if exists "profiles_self_select" on profiles;
create policy "profiles_self_select"
  on profiles for select
  using (user_id = auth.uid());

drop policy if exists "profiles_self_update" on profiles;
create policy "profiles_self_update"
  on profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- INSERT läuft via Trigger / service_role bei User-Sign-Up.

-- ─────────────────────────────────────────────────────────────────────
-- Auto-Profile-Trigger · legt profiles-Zeile bei jedem auth.users-Insert an
-- (idempotent: trigger wird gedropped + neu angelegt)
-- ─────────────────────────────────────────────────────────────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (user_id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0001_klient_wunsch.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0001 · klient_wunsch + klient_wunsch_verlauf
--
-- Ablöse der globalThis-Map aus lib/klient/wunsch-store.ts gegen
-- persistente Tabellen mit Row-Level-Security.
--
-- Konzept:
--  · klient_wunsch          = aktueller Stand pro (klient_id, termin_id)
--  · klient_wunsch_verlauf  = vollständige Historie aller Eintragungen
--                              für DSGVO Art. 16 Berichtigungs-Spur
--
-- RLS-Policies:
--  · Klient:in selbst (über profiles.klient_id) liest + schreibt eigene Wünsche
--  · Vorsorge-Bevollmächtigte (über vollmachten-Tabelle, Phase 2.1) lesen + schreiben
--  · Pflege/Therapie/Apotheke des Klient-Kreises (über care_team-Tabelle, Phase 2.2) lesen
--  · service_role hat vollen Zugriff (für Server-Actions ohne User-Session)
--
-- Hinweis: Die helper-Tabellen `vollmachten`, `care_team` werden in
-- separaten Folge-Migrationen 0002 + 0003 angelegt. Bis dahin greift
-- nur die Self-Service-Policy.

-- ─────────────────────────────────────────────────────────────────────
-- Tabellen
-- ─────────────────────────────────────────────────────────────────────

create table if not exists klient_wunsch (
  klient_id      text        not null,
  termin_id      text        not null,
  wunsch         text        not null check (length(wunsch) between 1 and 240),
  geaendert_am   timestamptz not null default now(),
  geaendert_von  text        not null check (geaendert_von in ('selbst', 'betreuer', 'angehoerige', 'pflege')),
  primary key (klient_id, termin_id)
);

comment on table klient_wunsch is 'Aktueller Wunsch der Klient:in pro Termin · DSGVO Art. 4 Identitätshoheit · Phase 2 Migration aus globalThis-Map.';

create table if not exists klient_wunsch_verlauf (
  id             bigserial   primary key,
  klient_id      text        not null,
  termin_id      text        not null,
  wunsch         text        not null,           -- bei art='geloescht' leer
  art            text        not null check (art in ('gesetzt', 'geloescht')),
  geaendert_am   timestamptz not null default now(),
  geaendert_von  text        not null check (geaendert_von in ('selbst', 'betreuer', 'angehoerige', 'pflege'))
);

comment on table klient_wunsch_verlauf is 'Vollständige Historie aller Wunsch-Änderungen · DSGVO Art. 16 Berichtigungs-Spur · DSGVO Art. 15 Auskunfts-Quelle.';

create index if not exists klient_wunsch_verlauf_klient_termin
  on klient_wunsch_verlauf (klient_id, termin_id, geaendert_am desc);

create index if not exists klient_wunsch_verlauf_klient
  on klient_wunsch_verlauf (klient_id, geaendert_am desc);

-- ─────────────────────────────────────────────────────────────────────
-- RLS aktivieren
-- ─────────────────────────────────────────────────────────────────────

alter table klient_wunsch          enable row level security;
alter table klient_wunsch_verlauf  enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- Policy 1 · Klient:in selbst über profiles.klient_id
-- (profiles muss bestehen, profiles.user_id = auth.uid(), profiles.klient_id = klient_wunsch.klient_id)
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "klient_wunsch_self_select" on klient_wunsch;
create policy "klient_wunsch_self_select"
  on klient_wunsch
  for select
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "klient_wunsch_self_insert" on klient_wunsch;
create policy "klient_wunsch_self_insert"
  on klient_wunsch
  for insert
  with check (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "klient_wunsch_self_update" on klient_wunsch;
create policy "klient_wunsch_self_update"
  on klient_wunsch
  for update
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "klient_wunsch_self_delete" on klient_wunsch;
create policy "klient_wunsch_self_delete"
  on klient_wunsch
  for delete
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

-- Verlauf: nur Lesen für Klient:in selbst (Editor schreibt via service_role)
drop policy if exists "klient_wunsch_verlauf_self_select" on klient_wunsch_verlauf;
create policy "klient_wunsch_verlauf_self_select"
  on klient_wunsch_verlauf
  for select
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- Policy 2 · Care-Team Read-Access
-- → Wird in Migration 0003 nachgeholt, sobald die care_team-Tabelle
-- existiert. Hier kein Stub mehr, weil Postgres beim CREATE POLICY
-- die Referenz strikt prüft (information_schema-Wrapper schützt nur
-- zur Laufzeit, nicht beim Anlegen).
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- service_role · voller Zugriff für Server-Actions
-- (Supabase setzt für service_role automatisch alle Policies aus —
--  wir brauchen also keine eigene Policy.)
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- Trigger · Verlauf-Eintrag automatisch bei jedem INSERT/UPDATE/DELETE
-- ─────────────────────────────────────────────────────────────────────

create or replace function klient_wunsch_log_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT' or tg_op = 'UPDATE') then
    insert into klient_wunsch_verlauf (klient_id, termin_id, wunsch, art, geaendert_am, geaendert_von)
    values (new.klient_id, new.termin_id, new.wunsch, 'gesetzt', new.geaendert_am, new.geaendert_von);
    return new;
  elsif (tg_op = 'DELETE') then
    insert into klient_wunsch_verlauf (klient_id, termin_id, wunsch, art, geaendert_am, geaendert_von)
    values (old.klient_id, old.termin_id, '', 'geloescht', now(), old.geaendert_von);
    return old;
  end if;
  return null;
end $$;

drop trigger if exists klient_wunsch_log_trigger on klient_wunsch;
create trigger klient_wunsch_log_trigger
  after insert or update or delete on klient_wunsch
  for each row execute function klient_wunsch_log_change();

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0002_swap_offer.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0002 · swap_offer + swap_offer_history
--
-- Ablöse der Memory-Maps aus lib/swap-store-memory.ts gegen
-- persistente Tabellen mit Row-Level-Security.
--
-- Tausch-Markt-Modell (siehe lib/swap-machine.ts):
--   draft → open → matched → approved/rejected → completed/withdrawn
--
-- Tabellen:
--  · swap_offer          = Aktueller Stand jedes Tausch-Vorgangs
--  · swap_offer_history  = State-Übergänge (event, timestamp, actor, meta)
--                           Pflicht für ArbZG-Audit + Genehmigungs-Spur
--
-- Bezüge:
--  · slot_id, seeking_slot_id  → Slot-IDs (Phase 2.5: eigene shift_slot-Tabelle)
--  · offered_by, accepted_by, approved_by → person_id (Phase 2.5: profiles.user_id)
--    Aktuell als text gespeichert ohne FK, damit Memory-Modus + Demo-Daten weiterlaufen.
--
-- RLS-Policies:
--  · Jede authentifizierte Person liest alle Vorgänge (Marktplatz ist offen)
--  · Anbieter:in (offered_by = auth-mapped person_id) darf eigene Vorgänge
--    erstellen, zurückziehen, ändern
--  · Annahme + Genehmigung → Phase 2.5 mit care_team-Tabelle, vorerst frei

-- ─────────────────────────────────────────────────────────────────────
-- Tabellen
-- ─────────────────────────────────────────────────────────────────────

create table if not exists swap_offer (
  id                 text         primary key,
  state              text         not null check (state in (
                       'draft', 'open', 'matched', 'approved', 'rejected', 'completed', 'withdrawn'
                     )),
  slot_id            text         not null,
  offered_by         text         not null,
  offered_at         timestamptz  not null default now(),
  seeking_slot_id    text,
  seeking_free_text  text,
  accepted_by        text,
  accepted_at        timestamptz,
  approved_by        text,
  approved_at        timestamptz,
  rejected_reason    text,
  created_at         timestamptz  not null default now(),
  updated_at         timestamptz  not null default now()
);

comment on table swap_offer is 'Tausch-Markt-Vorgänge · 7-state-Maschine · Persistierung Phase 2 nach Expertenteam-Audit Top-1.';

create index if not exists swap_offer_state          on swap_offer (state, offered_at desc);
create index if not exists swap_offer_offered_by    on swap_offer (offered_by, state);
create index if not exists swap_offer_accepted_by   on swap_offer (accepted_by) where accepted_by is not null;

create table if not exists swap_offer_history (
  id          bigserial    primary key,
  offer_id    text         not null,
  event       text         not null check (event in (
                'offer', 'accept', 'approve', 'reject', 'complete', 'withdraw'
              )),
  at          timestamptz  not null default now(),
  actor       text,
  meta        text
);

comment on table swap_offer_history is 'Lückenlose Verlauf-Spur jedes State-Übergangs · DSGVO Art. 5 (Verarbeitungs-Doku) + ArbZG-Beleg.';

create index if not exists swap_offer_history_offer  on swap_offer_history (offer_id, at desc);
create index if not exists swap_offer_history_actor  on swap_offer_history (actor, at desc) where actor is not null;

-- ─────────────────────────────────────────────────────────────────────
-- updated_at-Trigger
-- ─────────────────────────────────────────────────────────────────────

create or replace function swap_offer_touch_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists swap_offer_touch_updated_trigger on swap_offer;
create trigger swap_offer_touch_updated_trigger
  before update on swap_offer
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- Verlauf-Trigger · jeder State-Wechsel landet in swap_offer_history
-- ─────────────────────────────────────────────────────────────────────

create or replace function swap_offer_log_state_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ev text;
  actor_id text;
  meta_text text;
begin
  if (tg_op = 'INSERT') then
    insert into swap_offer_history (offer_id, event, at, actor)
    values (new.id, 'offer', new.offered_at, new.offered_by);
    return new;
  end if;

  if (tg_op = 'UPDATE' and old.state is distinct from new.state) then
    -- Mappe state-Übergang auf event
    if    (old.state = 'open'    and new.state = 'matched')   then ev := 'accept';   actor_id := new.accepted_by;
    elsif (old.state = 'matched' and new.state = 'approved')  then ev := 'approve';  actor_id := new.approved_by;
    elsif (old.state = 'matched' and new.state = 'rejected')  then ev := 'reject';   actor_id := new.approved_by; meta_text := new.rejected_reason;
    elsif (old.state = 'approved' and new.state = 'completed') then ev := 'complete'; actor_id := new.approved_by;
    elsif (new.state = 'withdrawn')                            then ev := 'withdraw'; actor_id := new.offered_by;
    else
      -- Unbekannter Übergang — anyway loggen mit raw-Info
      ev := 'offer';
      actor_id := new.offered_by;
      meta_text := 'unmapped: ' || old.state || ' → ' || new.state;
    end if;

    insert into swap_offer_history (offer_id, event, at, actor, meta)
    values (new.id, ev, now(), actor_id, meta_text);
  end if;
  return new;
end $$;

drop trigger if exists swap_offer_state_log_trigger on swap_offer;
create trigger swap_offer_state_log_trigger
  after insert or update on swap_offer
  for each row execute function swap_offer_log_state_change();

-- ─────────────────────────────────────────────────────────────────────
-- RLS aktivieren
-- ─────────────────────────────────────────────────────────────────────

alter table swap_offer          enable row level security;
alter table swap_offer_history  enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- Policies · swap_offer
--
-- Tausch-Markt ist absichtlich relativ offen: jede authentifizierte
-- Person sieht alle Vorgänge (sonst kein Markt). Eigentümer:in darf
-- ändern, Annahme + Genehmigung sind in Phase 2.5 an care_team gekoppelt.
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "swap_offer_authenticated_select" on swap_offer;
create policy "swap_offer_authenticated_select"
  on swap_offer
  for select
  using (auth.uid() is not null);

drop policy if exists "swap_offer_owner_insert" on swap_offer;
create policy "swap_offer_owner_insert"
  on swap_offer
  for insert
  with check (
    -- Phase 2.5: profiles.person_id mapping. Bis dahin frei für authenticated.
    auth.uid() is not null
  );

drop policy if exists "swap_offer_owner_update" on swap_offer;
create policy "swap_offer_owner_update"
  on swap_offer
  for update
  using (
    -- Eigentümer ist immer berechtigt; andere Aktionen (accept/approve)
    -- laufen via Server-Action mit service_role (umgeht RLS).
    -- Bridge-Policy auf profiles.person_id wird in Migration 0003
    -- als ALTER POLICY nachgereicht (sobald person_id existiert).
    offered_by = auth.uid()::text
  );

drop policy if exists "swap_offer_owner_delete" on swap_offer;
create policy "swap_offer_owner_delete"
  on swap_offer
  for delete
  using (
    offered_by = auth.uid()::text
  );

-- ─────────────────────────────────────────────────────────────────────
-- Policies · swap_offer_history
-- Lese frei für Authenticated (Audit-Transparenz),
-- Schreiben nur via Trigger (security definer).
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "swap_offer_history_authenticated_select" on swap_offer_history;
create policy "swap_offer_history_authenticated_select"
  on swap_offer_history
  for select
  using (auth.uid() is not null);

-- ─────────────────────────────────────────────────────────────────────
-- Hinweis · profiles.person_id
--
-- Die obige Policy nutzt `coalesce(profiles.person_id, profiles.user_id::text)`.
-- Falls profiles.person_id noch nicht existiert, fällt sie auf user_id zurück.
-- In Migration 0003 (care_team) wird profiles um person_id erweitert.
-- ─────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0003_care_team.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0003 · care_team + profiles-Bridge
--
-- Zweck:
--   1. Care-Team-Tabelle: wer kümmert sich um welche Klient:in (persistent)
--   2. Bridge-Felder in profiles: person_id + klient_id verbinden
--      auth.users mit Demo-Personal-Universum
--   3. Aktiviert die in 0001 + 0002 hinterlegten care_team-Stub-Policies
--
-- Care-Team-Modell:
--   · Jede:r Klient:in hat 1..n Care-Team-Mitglieder über verschiedene Berufe
--   · Pro Mitglied: user_id (auth) + beruf + rolle (z.B. Bezugspflegekraft)
--   · Zeit-bezogen: von/bis, aktiv-Flag
--   · Cross-Beruf-Brücke: Was-Beschreibung + Link ins zuständige Cockpit

-- ─────────────────────────────────────────────────────────────────────
-- profiles-Bridge-Felder werden in 0000_init_profiles_extension.sql
-- angelegt — hier nicht nochmal.
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- care_team · Wer kümmert sich
-- ─────────────────────────────────────────────────────────────────────

create table if not exists care_team (
  id            bigserial    primary key,
  user_id       uuid         references auth.users(id) on delete cascade,
  person_id     text,                                              -- Demo-Bridge wenn user_id null
  klient_id     text         not null,
  beruf         text         not null check (beruf in (
                  'pflege', 'arzt', 'therapie', 'sozial', 'apotheke',
                  'medizintechnik', 'rettungsdienst', 'bestatter', 'begleitung',
                  'ehrenamt', 'heilerziehung', 'hauswirtschaft', 'erziehung'
                )),
  person_name   text         not null,
  rolle         text         not null,                              -- z.B. "Bezugspflegekraft P7", "Hausärztin"
  was           text,                                                -- Kurz-Beschreibung der Aufgabe
  link_cockpit  text,                                                -- z.B. "/pflege/heute"
  primaer       boolean      not null default false,                 -- Primär-Bezugsperson dieses Berufs
  aktiv         boolean      not null default true,
  von_datum     date         not null default now()::date,
  bis_datum     date,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),

  -- Eindeutigkeit · pro Klient nur eine aktive Person je (beruf, person_name)
  constraint care_team_kein_doppelter_eintrag unique (klient_id, beruf, person_name, aktiv)
);

comment on table care_team is 'Care-Team je Klient:in · multidisziplinäre Sicht persistent · Brücke User↔Klient für RLS in 0001+0002.';

create index if not exists care_team_user_id      on care_team (user_id) where user_id is not null;
create index if not exists care_team_klient_aktiv on care_team (klient_id, aktiv);
create index if not exists care_team_beruf        on care_team (beruf);

-- updated_at-Trigger
create or replace function care_team_touch_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists care_team_touch_updated_trigger on care_team;
create trigger care_team_touch_updated_trigger
  before update on care_team
  for each row execute function care_team_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- RLS · care_team
-- ─────────────────────────────────────────────────────────────────────

alter table care_team enable row level security;

-- 1. Klient:in selbst sieht ihr ganzes Team
drop policy if exists "care_team_klient_self_select" on care_team;
create policy "care_team_klient_self_select"
  on care_team
  for select
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

-- 2. Care-Team-Mitglied sieht das Team aller Klient:innen, bei denen es selbst Mitglied ist
drop policy if exists "care_team_member_select" on care_team;
create policy "care_team_member_select"
  on care_team
  for select
  using (
    klient_id in (
      select klient_id
      from care_team ct
      where ct.user_id = auth.uid() and ct.aktiv = true
    )
  );

-- 3. Care-Team-Mitglied darf eigene Daten ändern (z.B. was-Beschreibung)
drop policy if exists "care_team_self_update" on care_team;
create policy "care_team_self_update"
  on care_team
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 4. Insert/Delete: Phase 2.5 mit Stations-Admin-Rolle. Vorerst service_role only.
--    (kein Policy = kein Zugriff für anonymous/authenticated. service_role umgeht RLS automatisch.)

-- ─────────────────────────────────────────────────────────────────────
-- Beispiel-Seed für Demo (idempotent · nur einfügen wenn nichts da)
-- Helga Reinhardt = klient-hr · 7 Care-Team-Mitglieder
-- ─────────────────────────────────────────────────────────────────────

insert into care_team (klient_id, beruf, person_name, rolle, was, link_cockpit, primaer)
select * from (values
  ('klient-hr', 'pflege',         'Dennis Reuter',         'Bezugspflegekraft P7', 'Tour täglich · SIS-Doku · Wundverlauf',          '/pflege/heute',           true),
  ('klient-hr', 'arzt',           'Dr. Susanne Hartmann',  'Hausärztin',           'Visite 1×/Woche · Verordnungen · Konsile',        '/arzt/heute',             true),
  ('klient-hr', 'therapie',       'Sebastian Rauer',        'Physiotherapeut',       'KG Mob 2×/Wo · 12 Sitzungen · WS1a',              '/therapie/patienten',     true),
  ('klient-hr', 'sozial',         'Mira Wagner',            'Sozialarbeiterin',     'Hilfeplan-Review · Pflegegrad-Antrag',            '/sozial/hilfeplan',       true),
  ('klient-hr', 'heilerziehung',  'Anika Stein',            'Heilerziehungspflege', 'Teilhabe-Plan + HPK · BTHG',                       '/heilerziehung/teilhabe', true),
  ('klient-hr', 'hauswirtschaft', 'Helmut Brandt',          'HW-Leitung',           'Diabetes-Kostform · Allergen-Filter',             '/hauswirtschaft/wochenplan', true),
  ('klient-hr', 'ehrenamt',       'Rita Schöndorf',         'Hospiz-Begleitung',     'Wöchentlich Do 15-16:30 · Tee + Erinnerung',     '/ehrenamt/begleitung',    true),
  ('klient-hr', 'begleitung',     'Marlene Voss',           'Würde-Begleiterin',     'Berkana-Berührung 30 min · Hand+Schulter',       '/begleitung/repertoire',  true),
  ('klient-hr', 'apotheke',       'Lukas Faber',            'Apothekenleitung',      'Wochen-Verblisterung + AMTS-Check',              '/apotheke/heimversorgung', true)
) as v (klient_id, beruf, person_name, rolle, was, link_cockpit, primaer)
where not exists (select 1 from care_team where klient_id = 'klient-hr');

-- ─────────────────────────────────────────────────────────────────────
-- Nachgeholte Policies aus 0001/0002 — defensiv in do-Blöcken,
-- damit die Migration nicht abbricht wenn die Tabellen aus
-- irgendeinem Grund nicht existieren (z.B. partielle Re-Runs).
-- ─────────────────────────────────────────────────────────────────────

do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'klient_wunsch') then
    execute 'drop policy if exists "klient_wunsch_care_team_select" on klient_wunsch';
    execute $POL$
      create policy "klient_wunsch_care_team_select"
        on klient_wunsch
        for select
        using (
          klient_id in (
            select klient_id from care_team
            where user_id = auth.uid() and aktiv = true
          )
        )
    $POL$;
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'swap_offer') then
    execute 'drop policy if exists "swap_offer_owner_update" on swap_offer';
    execute $POL$
      create policy "swap_offer_owner_update"
        on swap_offer
        for update
        using (
          offered_by = auth.uid()::text
          or offered_by in (select person_id from profiles where user_id = auth.uid() and person_id is not null)
        )
    $POL$;

    execute 'drop policy if exists "swap_offer_owner_delete" on swap_offer';
    execute $POL$
      create policy "swap_offer_owner_delete"
        on swap_offer
        for delete
        using (
          offered_by = auth.uid()::text
          or offered_by in (select person_id from profiles where user_id = auth.uid() and person_id is not null)
        )
    $POL$;
  end if;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0004_vollmachten.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0004 · vollmachten
--
-- Vorsorge-Vollmacht, gerichtliche Betreuung, Patientenverfügung,
-- familiäre Bevollmächtigung. Ablöse von text-Strings ('betreuer',
-- 'angehoerige') in WunschQuelle gegen echte Vollmachts-Datensätze.
--
-- Rechtsrahmen:
--   · Vorsorgevollmacht          → BGB § 1814 (Reform 2023)
--   · Gesetzliche Betreuung      → BGB §§ 1814-1881 (Reform 2023)
--   · Patientenverfügung         → BGB § 1827 (vorher § 1901a)
--   · Ehegatten-Notvertretung   → BGB § 1358 (max. 6 Monate)
--   · Aufgabenkreise üblich:
--     gesundheit, aufenthalt, vermoegen, behoerden, wohnung, post

-- ─────────────────────────────────────────────────────────────────────
-- Tabellen
-- ─────────────────────────────────────────────────────────────────────

create table if not exists vollmacht (
  id                       bigserial    primary key,
  klient_id                text         not null,            -- für wen gilt die Vollmacht
  art                      text         not null check (art in (
                              'vorsorge', 'betreuung', 'patientenverfuegung',
                              'angehoerige', 'ehegatten-notvertretung'
                            )),
  bevollmaechtigter_user_id  uuid       references auth.users(id) on delete set null,
  bevollmaechtigter_name     text       not null,            -- auch ohne user_id
  bevollmaechtigter_anschrift text,
  bevollmaechtigter_telefon  text,
  beziehung                  text,                            -- z.B. "Tochter", "Berufsbetreuerin"
  aufgabenkreise             text[]     not null default '{}', -- z.B. {'gesundheit', 'aufenthalt'}
  beglaubigt_durch           text,                            -- "Notar Dr. Schreiber" / "BtG Essen 4 XVII 882/2022"
  beglaubigt_am              date,
  gueltig_von                date       not null default now()::date,
  gueltig_bis                date,                            -- null = unbefristet
  dokument_url               text,                            -- z.B. Storage-Pfad zu PDF-Scan
  notizen                    text,
  aktiv                      boolean    not null default true,
  widerrufen_am              timestamptz,
  widerrufen_grund           text,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

comment on table vollmacht is 'Vorsorge-/Betreuungs-Vollmachten + Patientenverfügung + familiäre Vereinbarungen · BGB §§ 1814/1827/1358 · Reform 2023.';

create index if not exists vollmacht_klient_aktiv      on vollmacht (klient_id, aktiv);
create index if not exists vollmacht_bevollmaechtigter on vollmacht (bevollmaechtigter_user_id) where bevollmaechtigter_user_id is not null;
create index if not exists vollmacht_aufgabenkreise    on vollmacht using gin (aufgabenkreise);

-- updated_at-Trigger (wiederverwendet aus 0002)
drop trigger if exists vollmacht_touch_updated_trigger on vollmacht;
create trigger vollmacht_touch_updated_trigger
  before update on vollmacht
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- Helper-Function · darf eine User-ID im Aufgabenkreis X für Klient:in handeln?
-- Nutzt jeden Vollmachts-Typ — Vorsorge, Betreuung, Patientenverfügung
-- werden gleich behandelt. Ehegatten-Notvertretung gilt nur 6 Monate.
-- ─────────────────────────────────────────────────────────────────────

create or replace function darf_im_namen_handeln(
  ziel_klient_id text,
  aufgabe        text
) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from vollmacht v
    where v.klient_id = ziel_klient_id
      and v.bevollmaechtigter_user_id = auth.uid()
      and v.aktiv = true
      and v.widerrufen_am is null
      and aufgabe = any(v.aufgabenkreise)
      and (v.gueltig_von is null or v.gueltig_von <= now()::date)
      and (v.gueltig_bis is null or v.gueltig_bis >= now()::date)
      and (v.art != 'ehegatten-notvertretung'
           or v.gueltig_von >= (now() - interval '6 months')::date)
  );
$$;

comment on function darf_im_namen_handeln is 'Bevollmächtigungs-Check für RLS-Policies in klient_wunsch und Folge-Migrations · respektiert 6-Monate-Frist bei Ehegatten-Notvertretung BGB § 1358.';

-- ─────────────────────────────────────────────────────────────────────
-- RLS · vollmacht
-- ─────────────────────────────────────────────────────────────────────

alter table vollmacht enable row level security;

-- 1. Klient:in selbst sieht + ändert eigene Vollmachten
drop policy if exists "vollmacht_klient_self_select" on vollmacht;
create policy "vollmacht_klient_self_select"
  on vollmacht
  for select
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "vollmacht_klient_self_insert" on vollmacht;
create policy "vollmacht_klient_self_insert"
  on vollmacht
  for insert
  with check (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "vollmacht_klient_self_update" on vollmacht;
create policy "vollmacht_klient_self_update"
  on vollmacht
  for update
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

-- 2. Bevollmächtigte:r sieht die eigenen Vollmachten (Lese-Recht)
drop policy if exists "vollmacht_bevollmaechtigter_select" on vollmacht;
create policy "vollmacht_bevollmaechtigter_select"
  on vollmacht
  for select
  using (bevollmaechtigter_user_id = auth.uid());

-- 3. Care-Team mit Aufgabenkreis 'gesundheit' sieht relevante Vollmachten
--    (für Pflegekraft, die wissen muss, wer im Krisenfall ansprechbar ist)
drop policy if exists "vollmacht_care_team_select" on vollmacht;
create policy "vollmacht_care_team_select"
  on vollmacht
  for select
  using (
    'gesundheit' = any(aufgabenkreise)
    and aktiv = true
    and klient_id in (
      select klient_id
      from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- Erweiterung klient_wunsch-RLS um Bevollmächtigung
-- (bisher nur Self-Policies aus 0001, jetzt zusätzlich Vollmachts-Pfad)
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "klient_wunsch_bevollmaechtigter_select" on klient_wunsch;
create policy "klient_wunsch_bevollmaechtigter_select"
  on klient_wunsch
  for select
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

drop policy if exists "klient_wunsch_bevollmaechtigter_insert" on klient_wunsch;
create policy "klient_wunsch_bevollmaechtigter_insert"
  on klient_wunsch
  for insert
  with check (darf_im_namen_handeln(klient_id, 'gesundheit'));

drop policy if exists "klient_wunsch_bevollmaechtigter_update" on klient_wunsch;
create policy "klient_wunsch_bevollmaechtigter_update"
  on klient_wunsch
  for update
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

drop policy if exists "klient_wunsch_bevollmaechtigter_delete" on klient_wunsch;
create policy "klient_wunsch_bevollmaechtigter_delete"
  on klient_wunsch
  for delete
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

-- Für klient_wunsch_verlauf zusätzlich Lese-Recht für Bevollmächtigte
drop policy if exists "klient_wunsch_verlauf_bevollmaechtigter_select" on klient_wunsch_verlauf;
create policy "klient_wunsch_verlauf_bevollmaechtigter_select"
  on klient_wunsch_verlauf
  for select
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

-- ─────────────────────────────────────────────────────────────────────
-- Idempotenter Demo-Seed · 3 Vollmachten für Helga Reinhardt
-- ─────────────────────────────────────────────────────────────────────

insert into vollmacht (klient_id, art, bevollmaechtigter_name, beziehung, aufgabenkreise, beglaubigt_durch, beglaubigt_am, gueltig_von, notizen)
select * from (values
  ('klient-hr', 'vorsorge',         'Liane Volkmann', 'Tochter',
   array['gesundheit','aufenthalt','behoerden','post']::text[],
   'Notar Dr. Schreiber, Essen', '2024-03-12'::date, '2024-03-12'::date,
   'Vorsorgevollmacht für medizinische + behördliche Angelegenheiten · Anschrift gemeinsamer Lebensmittelpunkt'),
  ('klient-hr', 'patientenverfuegung', 'Helga Reinhardt selbst', '—',
   array['gesundheit']::text[],
   'eigenhändig + 2 Zeugen', '2023-09-04'::date, '2023-09-04'::date,
   'Schriftliche PV nach BGB § 1827 · Wunsch nach Sterbe-Begleitung, keine Reanimation, palliative Versorgung priorisiert'),
  ('klient-hr', 'angehoerige',     'Heike Liebenau', 'Schwester',
   array['gesundheit']::text[],
   '—', null, '2026-01-15'::date,
   'Familiär vereinbarte Erreichbarkeit als 2. Ansprechpartnerin · informelle Vereinbarung, keine notarielle Beglaubigung')
) as v (klient_id, art, bevollmaechtigter_name, beziehung, aufgabenkreise, beglaubigt_durch, beglaubigt_am, gueltig_von, notizen)
where not exists (select 1 from vollmacht where klient_id = 'klient-hr');

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0005_audit_log.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0005 · audit_log für Lese-Zugriffe
--
-- Befund #3 aus dem Expertenteam-Audit (docs/EXPERTENTEAM_EVALUIERUNG.md):
--   "Schreibe-Vorgänge sind im Verlauf getrackt, aber wer wann welchen
--    Wunsch / welche Diagnose / welchen BtM-Eintrag gesehen hat — fehlt.
--    DSGVO Art. 30 (Verzeichnis) braucht das."
--
-- Diese Migration legt eine zentrale audit_log-Tabelle an. Schreibt wird
-- nur via service_role (Server-Action). Klient:in kann ihre eigenen
-- Logs sehen (Transparenz-Recht). Mitarbeitende sehen nur ihre eigenen
-- Zugriffe (Selbst-Audit, Schutz vor Mobbing-Vorwürfen).

-- ─────────────────────────────────────────────────────────────────────
-- Tabelle
-- ─────────────────────────────────────────────────────────────────────

create table if not exists audit_log (
  id            bigserial    primary key,
  at            timestamptz  not null default now(),
  user_id       uuid         references auth.users(id) on delete set null,
  user_role     text,                                            -- 'pflege' | 'arzt' | 'therapie' | …
  user_name     text,                                            -- denormalisiert für Anzeige (auch wenn user gelöscht)
  klient_id     text         not null,
  ressource     text         not null check (ressource in (
                  'wunsch', 'wunsch-verlauf', 'pflegediagnose', 'pflegeplan',
                  'belegung', 'kassen-vorgang', 'vollmacht', 'identity',
                  'btm-buch', 'heimversorgung', 'sterbe-wache', 'team',
                  'care-team', 'tausch-offer'
                )),
  ressource_id  text,                                            -- konkrete ID der Ressource
  aktion        text         not null check (aktion in (
                  'read', 'list', 'write', 'update', 'delete', 'export', 'print'
                )),
  kontext       jsonb,                                           -- freie Metadaten (z.B. {"reason": "schichtbriefing"})
  ip_hash       text                                             -- pseudonymisierte IP (djb2 + salt)
);

comment on table audit_log is 'Lese- + Schreibe-Spur aller sensiblen Klient-Daten · DSGVO Art. 30 + Klient-Transparenz · nur service_role schreibt.';

create index if not exists audit_log_klient_at  on audit_log (klient_id, at desc);
create index if not exists audit_log_user_at    on audit_log (user_id, at desc) where user_id is not null;
create index if not exists audit_log_ressource  on audit_log (ressource, at desc);

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table audit_log enable row level security;

-- 1. Klient:in selbst sieht alle Logs zu eigenen Daten (Transparenz!)
drop policy if exists "audit_log_klient_self_select" on audit_log;
create policy "audit_log_klient_self_select"
  on audit_log
  for select
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

-- 2. Bevollmächtigte:r mit Aufgabenkreis 'gesundheit' sieht ebenfalls
--    (verlangt darf_im_namen_handeln aus Migration 0004)
drop policy if exists "audit_log_bevollmaechtigter_select" on audit_log;
create policy "audit_log_bevollmaechtigter_select"
  on audit_log
  for select
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

-- 3. Mitarbeitende sehen ihre eigenen Zugriffe (Selbst-Audit)
drop policy if exists "audit_log_self_user_select" on audit_log;
create policy "audit_log_self_user_select"
  on audit_log
  for select
  using (user_id = auth.uid());

-- 4. INSERT/UPDATE/DELETE: nur service_role
--    (Supabase setzt für service_role implizit alle Policies aus,
--     für authenticated/anon ist ohne Policy default deny.)

-- ─────────────────────────────────────────────────────────────────────
-- Idempotenter Demo-Seed · ein paar Beispiel-Zugriffe für Helga
-- ─────────────────────────────────────────────────────────────────────

insert into audit_log (at, user_name, user_role, klient_id, ressource, ressource_id, aktion, kontext)
select * from (values
  (now() - interval '5 minutes',  'Dennis Reuter',         'pflege',     'klient-hr', 'wunsch',          null,        'list',  '{"reason":"schichtbeginn"}'::jsonb),
  (now() - interval '2 hours',    'Sebastian Rauer',        'therapie',   'klient-hr', 'wunsch',          'kw-002',    'read',  '{"reason":"vor MLD-Termin"}'::jsonb),
  (now() - interval '4 hours',    'Marlene Voss',           'begleitung', 'klient-hr', 'wunsch',          'kw-003',    'read',  '{"reason":"vor Berkana-Sitzung"}'::jsonb),
  (now() - interval '1 day',      'Lukas Faber',            'apotheke',   'klient-hr', 'wunsch',          'kw-201',    'read',  '{"reason":"verblisterung-check"}'::jsonb),
  (now() - interval '1 day 2 hours','Dr. Susanne Hartmann', 'arzt',       'klient-hr', 'pflegediagnose',  null,        'list',  '{"reason":"visite-vorbereitung"}'::jsonb),
  (now() - interval '2 days',     'Mira Wagner',            'sozial',     'klient-hr', 'kassen-vorgang',  'kv-2026-04','read',  '{"reason":"hilfeplan-update"}'::jsonb),
  (now() - interval '3 days',     'Helga Reinhardt selbst', 'klient',     'klient-hr', 'identity',        null,        'export','{"reason":"dsgvo-art-20"}'::jsonb)
) as v (at, user_name, user_role, klient_id, ressource, ressource_id, aktion, kontext)
where not exists (select 1 from audit_log where klient_id = 'klient-hr');

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0006_shift_slot.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0006 · shift_slot für FHIR-Slot-Persistierung
--
-- Bisher leben Schichten ausschließlich im Memory (lib/swap-store-memory.ts
-- + lib/seed-rolling.ts). Bei Server-Restart wird neu gesäht — was für
-- Demo okay, aber für Echtbetrieb mit echtem Tarif-Layer und ArbZG-
-- Validierung blockierend ist.
--
-- Diese Migration legt eine flache Persistenz an, die FHIR-Slot-Felder
-- denormalisiert speichert (start, end, shift_type, status) und das
-- volle FHIR-JSON als Blob mitführt — für Round-Trip mit
-- Medplum-Server-Modus.
--
-- Bezüge:
--   · owner_user_id → auth.users.id (Phase 2.5: echter Login-User)
--   · owner_person_id → Demo-Personal-Universum (z.B. "person-pf-001")
--   · swap_offer.slot_id → text-Ref auf shift_slot.id (kein FK, weil
--     swap_offer in Migration 0002 bereits FK-frei)

-- ─────────────────────────────────────────────────────────────────────
-- Tabellen
-- ─────────────────────────────────────────────────────────────────────

create table if not exists shift_slot (
  id              text         primary key,
  start_at        timestamptz  not null,
  end_at          timestamptz  not null check (end_at > start_at),
  shift_type      text         check (shift_type in ('early', 'late', 'night', 'intermediate')),
  status          text         not null default 'busy' check (status in (
                    'free', 'busy', 'busy-unavailable', 'busy-tentative', 'entered-in-error'
                  )),
  owner_user_id   uuid         references auth.users(id) on delete set null,
  owner_person_id text,                                                -- Demo-Bridge wenn user_id null
  station_id      text,
  einrichtung_id  text,
  service_type    text,                                                -- denormalisiert für Filter
  fhir_blob       jsonb,                                               -- volles FHIR-Slot-Resource für Round-Trip
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

comment on table shift_slot is 'Persistente Schichten · FHIR-Slot-kompatibel · ablöst die Memory-Map aus swap-store-memory.ts (Migration 0006).';

create index if not exists shift_slot_owner_user_id  on shift_slot (owner_user_id) where owner_user_id is not null;
create index if not exists shift_slot_owner_person   on shift_slot (owner_person_id) where owner_person_id is not null;
create index if not exists shift_slot_station_start  on shift_slot (station_id, start_at) where station_id is not null;
create index if not exists shift_slot_start          on shift_slot (start_at);
create index if not exists shift_slot_status         on shift_slot (status, start_at);

-- updated_at-Trigger (wiederverwendet aus 0002)
drop trigger if exists shift_slot_touch_updated_trigger on shift_slot;
create trigger shift_slot_touch_updated_trigger
  before update on shift_slot
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table shift_slot enable row level security;

-- 1. Authentifizierte sehen alle Schichten (Station-Plan ist intern offen)
drop policy if exists "shift_slot_authenticated_select" on shift_slot;
create policy "shift_slot_authenticated_select"
  on shift_slot
  for select
  using (auth.uid() is not null);

-- 2. Owner darf eigene Schichten anlegen + ändern + löschen
--    (Disposition + Tausch-Workflow nutzen service_role)
drop policy if exists "shift_slot_owner_insert" on shift_slot;
create policy "shift_slot_owner_insert"
  on shift_slot
  for insert
  with check (
    owner_user_id = auth.uid()
    or owner_person_id in (
      select person_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "shift_slot_owner_update" on shift_slot;
create policy "shift_slot_owner_update"
  on shift_slot
  for update
  using (
    owner_user_id = auth.uid()
    or owner_person_id in (
      select person_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "shift_slot_owner_delete" on shift_slot;
create policy "shift_slot_owner_delete"
  on shift_slot
  for delete
  using (
    owner_user_id = auth.uid()
    or owner_person_id in (
      select person_id from profiles where user_id = auth.uid()
    )
  );

-- 3. Stationsleitung-Pfad (Phase 2.5)
--    Wenn die station_admin-Rolle in user_roles existiert, darf die
--    Stationsleitung alle Slots ihrer Station ändern. Aktuell als
--    Stub-Policy hinterlegt, die per information_schema-Check inaktiv
--    bleibt bis user_roles um station_id erweitert wird.

-- ─────────────────────────────────────────────────────────────────────
-- Helper · überlappende Schichten erkennen (ArbZG-Vorbereitung)
-- ─────────────────────────────────────────────────────────────────────

create or replace function shifts_ueberlappend(
  ziel_owner uuid,
  ziel_start timestamptz,
  ziel_end   timestamptz
) returns boolean
language sql
stable
as $$
  select exists (
    select 1 from shift_slot
    where owner_user_id = ziel_owner
      and tstzrange(start_at, end_at, '[)') && tstzrange(ziel_start, ziel_end, '[)')
  );
$$;

comment on function shifts_ueberlappend is 'Prüft Überlappung zweier Schicht-Zeiträume für ArbZG-Validierung.';

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0007_realtime.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0007 · Realtime-Channels für Live-Updates
--
-- Pflege/Therapie/Apotheke sehen eine Wunsch-Änderung sofort, ohne
-- Page-Reload. Auch Tausch-Markt-Vorgänge propagieren live (PDL sieht
-- neue „matched"-Vorgänge ohne F5).
--
-- Supabase Realtime hört auf Replication-Stream und sendet Events über
-- WebSocket-Channels. Wir aktivieren die relevanten Tabellen für die
-- supabase_realtime-Publication und setzen die nötigen GRANTs.
--
-- Sicherheit: RLS aus 0001/0002/0004 gilt auch für Realtime-Events —
-- jede:r Subscriber:in bekommt nur die Events, die sie via SELECT-RLS
-- auch lesen dürfte.

-- ─────────────────────────────────────────────────────────────────────
-- Publication erweitern
-- ─────────────────────────────────────────────────────────────────────

-- Sicherstellen, dass die Standard-Publication existiert (wird von
-- Supabase beim Projekt-Setup angelegt, hier als idempotenter Fallback).
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- Wunsch-Tabellen für Live-Stream freischalten
alter publication supabase_realtime add table klient_wunsch;
alter publication supabase_realtime add table klient_wunsch_verlauf;

-- Tausch-Markt für Live-Stream freischalten
alter publication supabase_realtime add table swap_offer;
alter publication supabase_realtime add table swap_offer_history;

-- Audit-Log nicht ins Live-Stream — wäre zu viel Traffic + sensibel.
-- (Klient kann Audit aktiv pollen über /klient/daten.)

-- ─────────────────────────────────────────────────────────────────────
-- REPLICA IDENTITY · für UPDATE/DELETE-Events mit OLD-Werten
-- (Standard ist DEFAULT = nur PK, wir wollen FULL für reichere Payloads)
-- ─────────────────────────────────────────────────────────────────────

alter table klient_wunsch         replica identity full;
alter table klient_wunsch_verlauf replica identity full;
alter table swap_offer            replica identity full;
alter table swap_offer_history    replica identity full;

-- ─────────────────────────────────────────────────────────────────────
-- Custom NOTIFY-Channel für Cross-Cockpit-Hinweise
-- (Optional · Realtime über pg_notify, kein WAL-Replay nötig)
-- ─────────────────────────────────────────────────────────────────────

create or replace function notify_wunsch_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_notify(
    'wunsch_' || coalesce(new.klient_id, old.klient_id),
    json_build_object(
      'op',         tg_op,
      'klient_id',  coalesce(new.klient_id, old.klient_id),
      'termin_id',  coalesce(new.termin_id, old.termin_id),
      'wunsch',     coalesce(new.wunsch, ''),
      'quelle',     coalesce(new.geaendert_von, old.geaendert_von, '—'),
      'at',         to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )::text
  );
  return coalesce(new, old);
end $$;

drop trigger if exists klient_wunsch_notify_trigger on klient_wunsch;
create trigger klient_wunsch_notify_trigger
  after insert or update or delete on klient_wunsch
  for each row execute function notify_wunsch_change();

-- ─────────────────────────────────────────────────────────────────────
-- Hinweis · Realtime-Schema-Änderung im Supabase-Dashboard
--
-- Nach dem Ausführen dieser Migration im Dashboard:
--   Database → Replication → supabase_realtime
-- die 4 Tabellen sollten dort als „aktiv" markiert sein. Falls nicht,
-- per UI nachschalten oder die ALTER PUBLICATION-Befehle erneut
-- ausführen.
--
-- Realtime-Limits (Free-Plan): 200 concurrent connections, 100k
-- messages/day. Für Produktion Pro/Team-Plan empfohlen.
-- ─────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0008_vollmacht_nachfolge.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0008 · vollmacht_nachfolge
--
-- Rollen-Übergang in der Vollmachts-Kette. Wenn die/der primär
-- Bevollmächtigte stirbt, schwer erkrankt, dauerhaft nicht erreichbar
-- ist oder die Vollmacht aktiv niederlegt, springt die nächste Person
-- in der Reihenfolge ein.
--
-- Zwei Tabellen:
--   · vollmacht_nachfolge       = Ranking-Liste je Vollmacht
--   · vollmacht_aktivierung_log = Verlauf der Aktivierungen
--
-- Plus eine SQL-Function `nachfolge_aktivieren(vollmacht_id, grund)`,
-- die in einer Transaktion:
--   1. die aktuelle Vollmacht inaktiv setzt
--   2. die nächste Nachfolge mit kleinster freier Reihenfolge aktiviert
--      (= neue Vollmacht-Zeile mit kopierten Aufgabenkreisen)
--   3. den Übergang im aktivierung_log dokumentiert
--
-- Rechtsrahmen:
--   · BGB § 1815 (Vorsorgevollmacht-Reform 2023): Nachfolge in Vollmacht
--     ist explizit erlaubt, muss aber in der Vollmachts-Urkunde benannt sein
--   · BGB § 1820 (Betreuung-Übergang): bei gerichtlicher Betreuung muss
--     das Betreuungsgericht beteiligt werden — diese Tabelle ist für
--     vorsorgliche Vollmachten gedacht, Betreuungs-Wechsel via service_role.

-- ─────────────────────────────────────────────────────────────────────
-- vollmacht_nachfolge · Ranking-Liste
-- ─────────────────────────────────────────────────────────────────────

create table if not exists vollmacht_nachfolge (
  id                         bigserial    primary key,
  vollmacht_id               bigint       not null references vollmacht(id) on delete cascade,
  reihenfolge                smallint     not null check (reihenfolge between 1 and 9),
  bevollmaechtigter_user_id  uuid         references auth.users(id) on delete set null,
  bevollmaechtigter_name     text         not null,
  bevollmaechtigter_anschrift text,
  bevollmaechtigter_telefon  text,
  beziehung                  text,
  aufloeser                  text         not null check (aufloeser in (
                                'tod-vorgaenger', 'geschaeftsunfaehig',
                                'nicht-erreichbar-7-tage', 'eigene-niederlegung',
                                'manuell-klient'
                              )),
  notizen                    text,
  aktiviert_am               timestamptz,                -- null = noch nicht aktiv
  aktiviert_grund            text,
  created_at                 timestamptz  not null default now(),

  -- Pro Vollmacht jede Reihenfolge nur einmal
  constraint vollmacht_nachfolge_eindeutig unique (vollmacht_id, reihenfolge)
);

comment on table vollmacht_nachfolge is 'Nachfolge-Ranking je Vollmacht · BGB § 1815-Reform 2023 · Übergang bei Tod/Krankheit/Niederlegung der/des primär Bevollmächtigten.';

create index if not exists vollmacht_nachfolge_vollmacht  on vollmacht_nachfolge (vollmacht_id, reihenfolge);
create index if not exists vollmacht_nachfolge_user_id    on vollmacht_nachfolge (bevollmaechtigter_user_id) where bevollmaechtigter_user_id is not null;

-- ─────────────────────────────────────────────────────────────────────
-- vollmacht_aktivierung_log · Verlauf der Übergänge
-- ─────────────────────────────────────────────────────────────────────

create table if not exists vollmacht_aktivierung_log (
  id                  bigserial    primary key,
  klient_id           text         not null,
  vollmacht_id_alt    bigint       references vollmacht(id) on delete set null,
  vollmacht_id_neu    bigint       references vollmacht(id) on delete set null,
  nachfolge_id        bigint       references vollmacht_nachfolge(id) on delete set null,
  aufloeser           text         not null,
  bevollmaechtigt_alt text,
  bevollmaechtigt_neu text,
  ausgeloest_durch    uuid         references auth.users(id) on delete set null,
  ausgeloest_durch_name text,
  at                  timestamptz  not null default now(),
  notizen             text
);

comment on table vollmacht_aktivierung_log is 'Verlauf jedes Vollmachts-Übergangs · DSGVO Art. 30 + Beweis für Familie/Gericht · nicht löschbar (außer service_role).';

create index if not exists vollmacht_aktivierung_log_klient on vollmacht_aktivierung_log (klient_id, at desc);

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table vollmacht_nachfolge        enable row level security;
alter table vollmacht_aktivierung_log  enable row level security;

-- vollmacht_nachfolge · sichtbar wenn man die zugehörige vollmacht sehen darf
drop policy if exists "vollmacht_nachfolge_select" on vollmacht_nachfolge;
create policy "vollmacht_nachfolge_select"
  on vollmacht_nachfolge
  for select
  using (
    exists (
      select 1 from vollmacht v
      where v.id = vollmacht_nachfolge.vollmacht_id
        and v.klient_id in (
          select klient_id from profiles where user_id = auth.uid()
        )
    )
    or bevollmaechtigter_user_id = auth.uid()
  );

-- Klient:in selbst kann eigene Nachfolgen anlegen + ändern
drop policy if exists "vollmacht_nachfolge_klient_insert" on vollmacht_nachfolge;
create policy "vollmacht_nachfolge_klient_insert"
  on vollmacht_nachfolge
  for insert
  with check (
    exists (
      select 1 from vollmacht v
      where v.id = vollmacht_id
        and v.klient_id in (
          select klient_id from profiles where user_id = auth.uid()
        )
    )
  );

drop policy if exists "vollmacht_nachfolge_klient_update" on vollmacht_nachfolge;
create policy "vollmacht_nachfolge_klient_update"
  on vollmacht_nachfolge
  for update
  using (
    exists (
      select 1 from vollmacht v
      where v.id = vollmacht_id
        and v.klient_id in (
          select klient_id from profiles where user_id = auth.uid()
        )
    )
  );

drop policy if exists "vollmacht_nachfolge_klient_delete" on vollmacht_nachfolge;
create policy "vollmacht_nachfolge_klient_delete"
  on vollmacht_nachfolge
  for delete
  using (
    exists (
      select 1 from vollmacht v
      where v.id = vollmacht_id
        and v.klient_id in (
          select klient_id from profiles where user_id = auth.uid()
        )
    )
  );

-- vollmacht_aktivierung_log · Klient:in + Bevollmächtigte sehen, niemand schreibt direkt
drop policy if exists "vollmacht_aktivierung_log_select" on vollmacht_aktivierung_log;
create policy "vollmacht_aktivierung_log_select"
  on vollmacht_aktivierung_log
  for select
  using (
    klient_id in (select klient_id from profiles where user_id = auth.uid())
    or darf_im_namen_handeln(klient_id, 'gesundheit')
  );

-- INSERT auf log nur via service_role (über die nachfolge_aktivieren-Function)

-- ─────────────────────────────────────────────────────────────────────
-- nachfolge_aktivieren · die Übergangs-Function
-- ─────────────────────────────────────────────────────────────────────

create or replace function nachfolge_aktivieren(
  alte_vollmacht_id bigint,
  grund_text        text
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  alte_v    vollmacht%rowtype;
  naechste  vollmacht_nachfolge%rowtype;
  neue_id   bigint;
begin
  -- 1. Alte Vollmacht laden + sperren
  select * into alte_v from vollmacht where id = alte_vollmacht_id for update;
  if not found then
    raise exception 'Vollmacht % nicht gefunden', alte_vollmacht_id;
  end if;

  -- 2. Nächste verfügbare Nachfolge ermitteln (kleinste reihenfolge ohne aktiviert_am)
  select * into naechste
  from vollmacht_nachfolge
  where vollmacht_id = alte_vollmacht_id
    and aktiviert_am is null
  order by reihenfolge asc
  limit 1;

  if not found then
    raise exception 'Keine offene Nachfolge für Vollmacht % vorhanden', alte_vollmacht_id;
  end if;

  -- 3. Alte Vollmacht inaktiv setzen
  update vollmacht
  set aktiv = false,
      widerrufen_am = now(),
      widerrufen_grund = 'Übergang an Nachfolge: ' || grund_text
  where id = alte_vollmacht_id;

  -- 4. Neue Vollmacht aus Nachfolge anlegen (Aufgabenkreise vererben)
  insert into vollmacht (
    klient_id, art, bevollmaechtigter_user_id, bevollmaechtigter_name,
    bevollmaechtigter_anschrift, bevollmaechtigter_telefon, beziehung,
    aufgabenkreise, beglaubigt_durch, gueltig_von, notizen
  ) values (
    alte_v.klient_id,
    alte_v.art,
    naechste.bevollmaechtigter_user_id,
    naechste.bevollmaechtigter_name,
    naechste.bevollmaechtigter_anschrift,
    naechste.bevollmaechtigter_telefon,
    naechste.beziehung,
    alte_v.aufgabenkreise,
    'Nachfolge nach BGB § 1815 · ausgelöst durch ' || grund_text,
    now()::date,
    coalesce(naechste.notizen, '') || E'\n\nÜbergang von: ' || alte_v.bevollmaechtigter_name
  )
  returning id into neue_id;

  -- 5. Nachfolge-Eintrag als aktiviert markieren
  update vollmacht_nachfolge
  set aktiviert_am = now(),
      aktiviert_grund = grund_text
  where id = naechste.id;

  -- 6. Log-Eintrag schreiben
  insert into vollmacht_aktivierung_log (
    klient_id, vollmacht_id_alt, vollmacht_id_neu, nachfolge_id,
    aufloeser, bevollmaechtigt_alt, bevollmaechtigt_neu,
    ausgeloest_durch, notizen
  ) values (
    alte_v.klient_id, alte_vollmacht_id, neue_id, naechste.id,
    naechste.aufloeser, alte_v.bevollmaechtigter_name, naechste.bevollmaechtigter_name,
    auth.uid(), grund_text
  );

  return neue_id;
end $$;

comment on function nachfolge_aktivieren is 'Aktiviert die nächste Nachfolge in einer Vollmachts-Kette · transaktional · gibt neue vollmacht.id zurück.';

-- ─────────────────────────────────────────────────────────────────────
-- Idempotenter Demo-Seed · Nachfolge zur Helga-Tochter-Vollmacht
-- ─────────────────────────────────────────────────────────────────────

insert into vollmacht_nachfolge (vollmacht_id, reihenfolge, bevollmaechtigter_name, beziehung, aufloeser, notizen)
select v.id, n.reihenfolge, n.name, n.beziehung, n.aufloeser, n.notizen
from vollmacht v
cross join (values
  (1::smallint, 'Heike Liebenau',     'Schwester', 'tod-vorgaenger',           'Erste Nachfolge wenn Tochter Liane verstirbt'),
  (2::smallint, 'Bernd Reinhardt',    'Cousin',    'geschaeftsunfaehig',       'Zweite Nachfolge bei dauerhafter Geschäftsunfähigkeit beider Vorgängerinnen'),
  (3::smallint, 'Dr. Anna Bachmann',  'Berufsbetreuerin', 'manuell-klient',    'Letzte Reserve · gerichtlich bestellt wenn alle privaten Optionen ausfallen')
) as n(reihenfolge, name, beziehung, aufloeser, notizen)
where v.klient_id = 'klient-hr'
  and v.art = 'vorsorge'
  and v.bevollmaechtigter_name = 'Liane Volkmann'
  and not exists (select 1 from vollmacht_nachfolge where vollmacht_id = v.id);

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0009_pflege.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0009 · pflegediagnose + pflegeplan persistent
--
-- Pflegerische Hauptdaten endlich aus globalThis raus. Ablöst:
--   · lib/pflege/pflegediagnose-store.ts → pflegediagnose
--   · lib/pflege/pflegeplan-store.ts     → pflegeplan
--
-- Modell:
--   · pflegediagnose: NANDA-I 2024-2026 mit AEDS-Format (Problem +
--     Einflussfaktoren + Symptome) + ICNP-Mapping (von Migration 1
--     in der Codebase, hier referenziert über nanda_code).
--   · pflegeplan: NIC-Interventionen + NOC-Ziele pro Diagnose mit
--     Status-Workflow (geplant → läuft → erreicht → abgesetzt).
--
-- Beide Tabellen brauchen Verlauf, weil Pflegeplanung evidenzbasierter
-- Workflow ist (Re-Evaluation → Anpassung → Doku) — nicht über eine
-- separate History-Tabelle, sondern über tracked Felder
-- (evaluiert_am/von, beendet_am).

-- ─────────────────────────────────────────────────────────────────────
-- pflegediagnose
-- ─────────────────────────────────────────────────────────────────────

create table if not exists pflegediagnose (
  id                text         primary key,
  klient_id         text         not null,
  nanda_code        text         not null,           -- Verweis NANDA_KATALOG (lib/pflege/diagnose-katalog.ts)
  einflussfaktoren  text[]       not null default '{}',
  symptome          text[]       not null default '{}',
  status            text         not null check (status in ('akut', 'chronisch', 'risiko', 'geloest')),
  begonnen_am       date         not null,
  beendet_am        date,
  notiz             text,
  evaluiert_am      timestamptz,
  evaluiert_von     text,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

comment on table pflegediagnose is 'Klient-individuelle NANDA-I-Diagnosen im AEDS-Format · DNQP-konform · ICNP-Mapping über NANDA-Code.';

create index if not exists pflegediagnose_klient_aktiv  on pflegediagnose (klient_id, beendet_am) where beendet_am is null;
create index if not exists pflegediagnose_klient_alle   on pflegediagnose (klient_id, begonnen_am desc);
create index if not exists pflegediagnose_nanda         on pflegediagnose (nanda_code);

-- updated_at-Trigger (wiederverwendet aus 0002)
drop trigger if exists pflegediagnose_touch_updated_trigger on pflegediagnose;
create trigger pflegediagnose_touch_updated_trigger
  before update on pflegediagnose
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- pflegeplan
-- ─────────────────────────────────────────────────────────────────────

create table if not exists pflegeplan (
  id                  text         primary key,
  klient_id           text         not null,
  diagnose_eintrag_id text         not null references pflegediagnose(id) on delete cascade,
  nanda_code          text         not null,
  art                 text         not null check (art in ('intervention', 'ziel')),
  text                text         not null check (length(text) between 1 and 500),
  status              text         not null check (status in ('geplant', 'läuft', 'erreicht', 'abgesetzt')),
  begonnen_am         date         not null,
  geplantes_ende      date,
  beendet_am          date,
  evaluierung         text,
  evaluiert_am        timestamptz,
  evaluiert_von       text,
  quelle              text         not null check (quelle in ('katalog', 'manuell')),
  created_at          timestamptz  not null default now(),
  updated_at          timestamptz  not null default now()
);

comment on table pflegeplan is 'NIC-Interventionen + NOC-Ziele pro Diagnose · Status-Workflow geplant→läuft→erreicht→abgesetzt · DNQP S1-Pflegeprozess.';

create index if not exists pflegeplan_klient_aktiv     on pflegeplan (klient_id, beendet_am) where beendet_am is null;
create index if not exists pflegeplan_diagnose         on pflegeplan (diagnose_eintrag_id);
create index if not exists pflegeplan_status           on pflegeplan (status, begonnen_am desc);

drop trigger if exists pflegeplan_touch_updated_trigger on pflegeplan;
create trigger pflegeplan_touch_updated_trigger
  before update on pflegeplan
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table pflegediagnose  enable row level security;
alter table pflegeplan       enable row level security;

-- Klient:in selbst sieht ihre eigenen Diagnosen + Pläne
drop policy if exists "pflegediagnose_klient_self_select" on pflegediagnose;
create policy "pflegediagnose_klient_self_select"
  on pflegediagnose
  for select
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()));

drop policy if exists "pflegeplan_klient_self_select" on pflegeplan;
create policy "pflegeplan_klient_self_select"
  on pflegeplan
  for select
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()));

-- Care-Team-Mitglied (Pflege/Arzt/Therapie) sieht Diagnosen + Pläne
-- ihrer Klient:innen
drop policy if exists "pflegediagnose_care_team_select" on pflegediagnose;
create policy "pflegediagnose_care_team_select"
  on pflegediagnose
  for select
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

drop policy if exists "pflegeplan_care_team_select" on pflegeplan;
create policy "pflegeplan_care_team_select"
  on pflegeplan
  for select
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- Care-Team-Mitglied mit Beruf 'pflege' darf schreiben
drop policy if exists "pflegediagnose_pflege_write" on pflegediagnose;
create policy "pflegediagnose_pflege_write"
  on pflegediagnose
  for insert
  with check (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true and beruf = 'pflege'
    )
  );

drop policy if exists "pflegediagnose_pflege_update" on pflegediagnose;
create policy "pflegediagnose_pflege_update"
  on pflegediagnose
  for update
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true and beruf = 'pflege'
    )
  );

drop policy if exists "pflegeplan_pflege_write" on pflegeplan;
create policy "pflegeplan_pflege_write"
  on pflegeplan
  for insert
  with check (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true and beruf = 'pflege'
    )
  );

drop policy if exists "pflegeplan_pflege_update" on pflegeplan;
create policy "pflegeplan_pflege_update"
  on pflegeplan
  for update
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true and beruf = 'pflege'
    )
  );

-- Bevollmächtigte:r mit gesundheit-Aufgabenkreis darf zumindest lesen
drop policy if exists "pflegediagnose_bevollmaechtigter_select" on pflegediagnose;
create policy "pflegediagnose_bevollmaechtigter_select"
  on pflegediagnose
  for select
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

drop policy if exists "pflegeplan_bevollmaechtigter_select" on pflegeplan;
create policy "pflegeplan_bevollmaechtigter_select"
  on pflegeplan
  for select
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

-- ─────────────────────────────────────────────────────────────────────
-- Realtime-Pub erweitern (aus 0007)
-- ─────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table pflegediagnose;
alter publication supabase_realtime add table pflegeplan;

alter table pflegediagnose replica identity full;
alter table pflegeplan      replica identity full;

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0010_belegung.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0010 · bett + belegung + reservierung persistent
--
-- Stationsmanagement aus globalThis-Map raus. Ablöst:
--   · betten         → bett
--   · belegungen     → belegung
--   · reservierungen → reservierung
--
-- (Quelle: lib/station/betten-store.ts)
--
-- Modell:
--   · bett           = physische Bett-Plätze pro Station
--   · belegung       = wer-wann-welches-Bett (mit von/bis)
--   · reservierung   = zukünftige Aufnahme, blockiert das Bett
--
-- Pflegegrad-Wert spiegelt Pflegegrad-Type aus lib/hierarchy/types.ts.
-- Aufnahme-Art und Reservierungs-Status wie im Memory-Store.

-- ─────────────────────────────────────────────────────────────────────
-- bett
-- ─────────────────────────────────────────────────────────────────────

create table if not exists bett (
  id                  text         primary key,
  station_id          text         not null,
  zimmer_nr           text         not null,
  bett_nr             text         not null,
  ist_blockiert       boolean      not null default false,
  blockierung_grund   text,
  blockiert_seit      timestamptz,
  created_at          timestamptz  not null default now(),
  updated_at          timestamptz  not null default now()
);

comment on table bett is 'Physische Bett-Plätze pro Station · Stationsmanagement Phase 2 (war globalThis-Map).';

create index if not exists bett_station on bett (station_id, zimmer_nr, bett_nr);

drop trigger if exists bett_touch_updated_trigger on bett;
create trigger bett_touch_updated_trigger
  before update on bett
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- belegung
-- ─────────────────────────────────────────────────────────────────────

create table if not exists belegung (
  id            text         primary key,
  bett_id       text         not null references bett(id) on delete restrict,
  klient_id     text         not null,
  klient_name   text         not null,
  pflegegrad    smallint     check (pflegegrad between 0 and 5),
  diagnosen     text[]       not null default '{}',
  von_datum     date         not null,
  bis_datum     date,                                    -- null = aktuell belegt
  aufnahme_art  text         not null check (aufnahme_art in ('regulär', 'kurzzeit', 'verhinderung', 'tag')),
  notiz         text,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

comment on table belegung is 'Wer wann welches Bett belegt (mit von/bis) · Stationsmanagement.';

create index if not exists belegung_bett_aktiv     on belegung (bett_id) where bis_datum is null;
create index if not exists belegung_bett_alle      on belegung (bett_id, von_datum desc);
create index if not exists belegung_klient         on belegung (klient_id, von_datum desc);
create index if not exists belegung_aktiv          on belegung (bis_datum) where bis_datum is null;

drop trigger if exists belegung_touch_updated_trigger on belegung;
create trigger belegung_touch_updated_trigger
  before update on belegung
  for each row execute function swap_offer_touch_updated();

-- Constraint: pro Bett darf nur eine Belegung aktiv sein (bis_datum = null)
create unique index if not exists belegung_eine_aktive_pro_bett
  on belegung (bett_id) where bis_datum is null;

-- ─────────────────────────────────────────────────────────────────────
-- reservierung
-- ─────────────────────────────────────────────────────────────────────

create table if not exists reservierung (
  id                    text         primary key,
  bett_id               text         not null references bett(id) on delete restrict,
  klient_id             text,                                                      -- optional, vor-Identity ohne ID
  klient_name           text         not null,
  vorauss_aufnahme      date         not null,
  pflegegrad_erwartet   smallint     check (pflegegrad_erwartet between 0 and 5),
  aufnahme_art          text         not null check (aufnahme_art in ('regulär', 'kurzzeit', 'verhinderung', 'tag')),
  notiz                 text,
  reserviert_am         date         not null default now()::date,
  reserviert_von        text         not null,
  status                text         not null check (status in ('geplant', 'eingelöst', 'storniert')),
  beendet_am            date,
  created_at            timestamptz  not null default now(),
  updated_at            timestamptz  not null default now()
);

comment on table reservierung is 'Zukünftige Aufnahme · blockiert das Bett bis Einlösung oder Storno.';

create index if not exists reservierung_bett_aktiv  on reservierung (bett_id) where status = 'geplant';
create index if not exists reservierung_klient      on reservierung (klient_id) where klient_id is not null;
create index if not exists reservierung_status      on reservierung (status, vorauss_aufnahme);

drop trigger if exists reservierung_touch_updated_trigger on reservierung;
create trigger reservierung_touch_updated_trigger
  before update on reservierung
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table bett          enable row level security;
alter table belegung      enable row level security;
alter table reservierung  enable row level security;

-- bett: jede authentifizierte Person sieht alle Betten (Stationsplan ist intern offen)
drop policy if exists "bett_authenticated_select" on bett;
create policy "bett_authenticated_select"
  on bett for select using (auth.uid() is not null);

-- belegung: SELECT für Care-Team der Klient:in + Klient:in selbst
drop policy if exists "belegung_klient_self_select" on belegung;
create policy "belegung_klient_self_select"
  on belegung for select
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()));

drop policy if exists "belegung_care_team_select" on belegung;
create policy "belegung_care_team_select"
  on belegung for select
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- belegung: Schreiben durch Care-Team mit beruf in (pflege, lead) — Stationsmanagement
drop policy if exists "belegung_pflege_lead_write" on belegung;
create policy "belegung_pflege_lead_write"
  on belegung for insert
  with check (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true and beruf in ('pflege')
    )
  );

drop policy if exists "belegung_pflege_lead_update" on belegung;
create policy "belegung_pflege_lead_update"
  on belegung for update
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true and beruf in ('pflege')
    )
  );

-- Bevollmächtigte mit gesundheit-Aufgabenkreis dürfen lesen
drop policy if exists "belegung_bevollmaechtigter_select" on belegung;
create policy "belegung_bevollmaechtigter_select"
  on belegung for select
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

-- reservierung: SELECT für jede authentifizierte Person der Station
-- (Stationsplan-Sichtbarkeit) — INSERT/UPDATE über service_role
drop policy if exists "reservierung_authenticated_select" on reservierung;
create policy "reservierung_authenticated_select"
  on reservierung for select using (auth.uid() is not null);

-- ─────────────────────────────────────────────────────────────────────
-- Realtime
-- ─────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table belegung;
alter publication supabase_realtime add table reservierung;

alter table bett         replica identity full;
alter table belegung     replica identity full;
alter table reservierung replica identity full;

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0011_klient_termin.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0011 · klient_termin · die Wochen-Termine persistent
--
-- Bisher leben die Termine in `lib/klient/woche.ts` als statische
-- Demo-Konstante (KLIENT_WOCHE). Jeder Server-Restart begrub sie nicht
-- direkt — der Stand war ja code-seitig immer gleich. Aber sobald
-- echte Termine entstehen (Pflege legt morgens an, Arzt verschiebt
-- nachmittags), brauchen wir Persistenz + Verlauf.
--
-- Wir bilden den vollen WocheTermin-Type ab inkl. Status-Workflow
-- (geplant/laeuft/erledigt/verschoben/abgesagt) und der Brücke zum
-- bestehenden Wunsch-System (klient_wunsch.termin_id ist der gleiche
-- Schlüssel wie klient_termin.id).

-- ─────────────────────────────────────────────────────────────────────
-- Tabelle
-- ─────────────────────────────────────────────────────────────────────

create table if not exists klient_termin (
  id            text         primary key,
  klient_id     text         not null,
  datum         date         not null,
  uhrzeit       text         not null check (uhrzeit ~ '^[0-2][0-9]:[0-5][0-9]$'),
  dauer_min     smallint     not null check (dauer_min between 5 and 480),
  beruf         text         not null check (beruf in (
                  'pflege', 'arzt', 'therapie', 'apotheke',
                  'medizintechnik', 'begleitung', 'bestatter',
                  'sozial', 'ehrenamt', 'kueche', 'hauswirtschaft'
                )),
  titel         text         not null check (length(titel) between 1 and 200),
  person        text         not null,
  ort           text         not null,
  was_passiert  text         not null,
  status        text         not null default 'geplant' check (status in (
                  'geplant', 'laeuft', 'erledigt', 'verschoben', 'abgesagt'
                )),
  link_cockpit  text,
  durchgefuehrt_von text,                        -- für Audit nach status='erledigt'
  durchgefuehrt_am  timestamptz,
  abgesagt_grund    text,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

comment on table klient_termin is 'Wochen-Termine je Klient:in · Brücke zu klient_wunsch über termin_id · DSGVO Art. 4 + DNQP-Pflegeprozess.';

create index if not exists klient_termin_klient_datum  on klient_termin (klient_id, datum, uhrzeit);
create index if not exists klient_termin_status        on klient_termin (status, datum);
create index if not exists klient_termin_beruf         on klient_termin (beruf);

drop trigger if exists klient_termin_touch_updated_trigger on klient_termin;
create trigger klient_termin_touch_updated_trigger
  before update on klient_termin
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table klient_termin enable row level security;

-- Klient:in selbst sieht ihre Termine
drop policy if exists "klient_termin_klient_self_select" on klient_termin;
create policy "klient_termin_klient_self_select"
  on klient_termin for select
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()));

-- Care-Team-Mitglied sieht Termine ihrer Klient:innen
drop policy if exists "klient_termin_care_team_select" on klient_termin;
create policy "klient_termin_care_team_select"
  on klient_termin for select
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- Care-Team-Mitglied des relevanten Berufs darf den Termin anlegen + ändern
-- (z.B. Therapeut:in legt Therapie-Termin an, Pflegekraft Pflege-Termin)
drop policy if exists "klient_termin_beruf_write" on klient_termin;
create policy "klient_termin_beruf_write"
  on klient_termin for insert
  with check (
    exists (
      select 1 from care_team
      where user_id = auth.uid() and aktiv = true
        and klient_id = klient_termin.klient_id
        and beruf = klient_termin.beruf
    )
  );

drop policy if exists "klient_termin_beruf_update" on klient_termin;
create policy "klient_termin_beruf_update"
  on klient_termin for update
  using (
    exists (
      select 1 from care_team
      where user_id = auth.uid() and aktiv = true
        and klient_id = klient_termin.klient_id
        and beruf = klient_termin.beruf
    )
  );

-- Bevollmächtigte mit gesundheit-Aufgabenkreis dürfen lesen
drop policy if exists "klient_termin_bevollmaechtigter_select" on klient_termin;
create policy "klient_termin_bevollmaechtigter_select"
  on klient_termin for select
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

-- Klient:in selbst darf eigene Termine absagen/verschieben
-- (status-Wechsel nach 'abgesagt' oder 'verschoben')
drop policy if exists "klient_termin_klient_status_update" on klient_termin;
create policy "klient_termin_klient_status_update"
  on klient_termin for update
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────
-- Realtime — die Live-Wochen-Sicht profitiert massiv davon
-- ─────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table klient_termin;
alter table klient_termin replica identity full;

-- ─────────────────────────────────────────────────────────────────────
-- Idempotenter Demo-Seed · 16 Termine für Helga (entspricht KLIENT_WOCHE)
-- ─────────────────────────────────────────────────────────────────────

insert into klient_termin (id, klient_id, datum, uhrzeit, dauer_min, beruf, titel, person, ort, was_passiert, status, link_cockpit)
select * from (values
  ('kw-001', 'klient-hr', current_date, '07:30', 25, 'pflege',         'Morgen-Pflege · Körperwäsche + Anziehen',          'Maria Klein (PFK)',           'in Zimmer 102',           'Beruhigt waschen, Lavendel-Lotion auf Schultern, Kompressionsstrumpf links anlegen', 'erledigt', '/pflege/heute'),
  ('kw-002', 'klient-hr', current_date, '09:30', 45, 'therapie',       'MLD + Kompression · linkes Bein',                 'Sebastian Rauer (Physio)',     'in Zimmer 102',           'Manuelle Lymphdrainage 30 min, danach Kompressionsbinde frisch wickeln',           'geplant',  '/therapie/patienten'),
  ('kw-003', 'klient-hr', current_date, '11:00', 30, 'begleitung',     'Berkana-Berührung · Schulter + Hand',              'Marlene Voss (Würde-Begleitung)','in Zimmer 102',         '30 min Hand- und Schulterhalten, leise Brahms-Schlaflied im Hintergrund',           'geplant',  '/begleitung/repertoire'),
  ('kw-004', 'klient-hr', current_date, '12:30', 30, 'kueche',         'Mittagessen · Wunschkost',                         'Küche Pulmologie',             'im Zimmer / Tablett',     'Kartoffelsuppe + Apfelmus · weich, da Kau-Erschöpfung',                              'geplant',  '/lebensmittel'),
  ('kw-005', 'klient-hr', current_date, '16:00', 45, 'ehrenamt',       'Hospiz-Stunde · Vorlesen Lieblings-Roman',         'Rita Schöndorf (Hospiz-Verein)','in Zimmer 102',          'Vorlesen Buddenbrooks Kapitel 4-5 · Tee + ruhige Musik',                            'geplant',  '/ehrenamt'),
  ('kw-101', 'klient-hr', current_date + 1, '08:30', 30, 'arzt',        'Visite · Hausarzt',                                'Dr. Susanne Hartmann',          'in Zimmer 102',           'INR-Wert besprechen, Marcumar anpassen, Atmung auskultieren',                      'geplant',  '/arzt/heute'),
  ('kw-102', 'klient-hr', current_date + 1, '14:00', 60, 'therapie',    'KG-Mobilisation · LWS',                            'Sebastian Rauer (Physio)',      'in Therapieraum 1',       'Bewegungserweiterung LWS, Stabilität M. multifidus, ROM-Reeval',                   'geplant',  '/therapie/patienten'),
  ('kw-201', 'klient-hr', current_date + 2, '10:00', 30, 'apotheke',    'Wochenverblisterung Lieferung + Stellplan-Check',  'Lukas Faber (Apothekenleitung)','Übergabe an Pflege',     'Neue Wochen-Blister mit Tilidin/Spiriva/Citalopram · AMTS-Check geprüft',          'geplant',  '/apotheke/heimversorgung'),
  ('kw-202', 'klient-hr', current_date + 2, '11:30', 20, 'begleitung',  'Berkana-Berührung · Hand',                         'Marlene Voss',                  'in Zimmer 102',           '20 min Hand-Halten, schweigen oder leichtes Erzählen',                              'geplant',  '/begleitung/repertoire'),
  ('kw-301', 'klient-hr', current_date + 3, '09:00', 60, 'medizintechnik','Wartung Pflegebett Burmeier · Funktionsprüfung', 'MEDsupply Nord-Werkstatt',      'in Zimmer 102',           'Halbjährliche STK-Funktionsprüfung · Liftmotor + Handterminal',                    'geplant',  '/medizintechnik/wartung'),
  ('kw-302', 'klient-hr', current_date + 3, '13:00', 30, 'sozial',      'Hilfeplan-Gespräch · Pflegegrad-Überprüfung',      'Aysha Kamal (Sozialarbeit)',    'in Zimmer 102',           'PG 4 Aktualisierung · Hilfsmittelbedarf neu erfassen, Tochter dabei',              'geplant',  '/sozial/hilfeplan'),
  ('kw-401', 'klient-hr', current_date + 4, '15:00', 90, 'bestatter',   'Vorsorge-Gespräch · Erdbestattung Familiengrab',   'Hannah Mainberg (Bestatterin)', 'im Wohnzimmer (Hausbesuch)','Wünsche durchgehen: Familiengrab St. Lukas, einfacher Holzsarg, Brahms am Grab',  'geplant',  '/bestatter/bestattungsarten'),
  ('kw-501', 'klient-hr', current_date + 5, '11:00', 45, 'ehrenamt',    'Hospiz-Stunde · Vorlesen + Spaziergang',           'Rita Schöndorf',                'im Garten + Zimmer',      'Falls Wetter mild: Rollstuhl in den Garten · sonst weiter Buddenbrooks',           'geplant',  '/ehrenamt'),
  ('kw-502', 'klient-hr', current_date + 5, '16:30', 25, 'pflege',      'Wundkontrolle · Sakrum',                            'Maria Klein (PFK)',             'in Zimmer 102',           'Wundverband wechseln · Polihexanid-Spülung · Foto-Doku',                            'geplant',  '/pflege/wunde'),
  ('kw-601', 'klient-hr', current_date + 6, '10:00', 30, 'begleitung',  'Berkana-Berührung · Hand + Schulter',              'Marlene Voss',                  'in Zimmer 102',           '30 min Halten, evtl. mit Aroma-Lavendel-Tropfen',                                   'geplant',  '/begleitung/repertoire')
) as v (id, klient_id, datum, uhrzeit, dauer_min, beruf, titel, person, ort, was_passiert, status, link_cockpit)
where not exists (select 1 from klient_termin where klient_id = 'klient-hr');

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0012_kassen_vorgang.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0012 · kassen_vorgang · Kostenträger-Anträge persistent
--
-- Bisher in lib/kostentraeger/store.ts als globalThis-Map. Sehr
-- relevant für Echtbetrieb, weil Kassen-Anträge gesetzliche Fristen
-- haben (§ 13 Abs. 3a SGB V: 3 Wochen / 5 Wochen mit MD; § 84 SGG:
-- 1 Monat Widerspruch).
--
-- Mit Persistenz greift auch der Widerspruchs-Verlauf aus
-- lib/kasse/widerspruch-store.ts wirklich (vorher gingen die
-- Widerspruchs-Daten beim Restart verloren).

-- ─────────────────────────────────────────────────────────────────────
-- Tabelle
-- ─────────────────────────────────────────────────────────────────────

create table if not exists kassen_vorgang (
  id                text         primary key,
  ik_nummer         text         not null,           -- Institutionskennzeichen der Kasse
  kassen_name       text         not null,
  typ               text         not null check (typ in (
                      'eau', 'krankengeld', 'hkp_genehmigung', 'hilfsmittel',
                      'abrechnung', 'praevention', 'verordnung_review'
                    )),
  versicherten_nr   text,
  versicherter_name text         not null,
  klient_id         text,
  betreff_ref       text,                              -- eAU-Ref, Antrag-ID, Verordnung-ID
  einrichtung_id    text,
  einrichtung_name  text,
  beschreibung      text         not null,
  betrag_cents      bigint,
  status            text         not null default 'eingegangen' check (status in (
                      'eingegangen', 'in_pruefung', 'genehmigt', 'abgelehnt', 'rueckfrage'
                    )),
  eingegangen_am    timestamptz  not null default now(),
  bearbeitet_am     timestamptz,
  bearbeitet_von    text,
  notiz             text,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

comment on table kassen_vorgang is 'Kostenträger-Anträge · § 13 Abs 3a SGB V Frist 3/5 Wochen · § 84 SGG 1 Monat Widerspruch · Persistenz Phase 2.';

create index if not exists kassen_vorgang_ik_status      on kassen_vorgang (ik_nummer, status, eingegangen_am desc);
create index if not exists kassen_vorgang_klient         on kassen_vorgang (klient_id, eingegangen_am desc) where klient_id is not null;
create index if not exists kassen_vorgang_einrichtung    on kassen_vorgang (einrichtung_id, eingegangen_am desc) where einrichtung_id is not null;
create index if not exists kassen_vorgang_status         on kassen_vorgang (status, eingegangen_am desc);

drop trigger if exists kassen_vorgang_touch_updated_trigger on kassen_vorgang;
create trigger kassen_vorgang_touch_updated_trigger
  before update on kassen_vorgang
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table kassen_vorgang enable row level security;

-- 1. Klient:in selbst sieht eigene Vorgänge (über profiles.klient_id ODER
--    versicherter_name = Profilname als Fallback wenn klient_id fehlt)
drop policy if exists "kassen_vorgang_klient_self_select" on kassen_vorgang;
create policy "kassen_vorgang_klient_self_select"
  on kassen_vorgang for select
  using (
    klient_id in (select klient_id from profiles where user_id = auth.uid())
  );

-- 2. Care-Team-Mitglied sieht Vorgänge ihrer Klient:innen
drop policy if exists "kassen_vorgang_care_team_select" on kassen_vorgang;
create policy "kassen_vorgang_care_team_select"
  on kassen_vorgang for select
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- 3. Sozialarbeit darf zusätzlich UPDATE (z.B. Status auf 'rueckfrage'
--    setzen wenn die Familie Hilfe braucht)
drop policy if exists "kassen_vorgang_sozial_update" on kassen_vorgang;
create policy "kassen_vorgang_sozial_update"
  on kassen_vorgang for update
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true and beruf = 'sozial'
    )
  );

-- 4. Kasse selbst (Phase 2.5: kasse_user mit ik-Bindung) — vorerst nur
--    via service_role. Eine eigene `kasse_member`-Tabelle macht 0013/0014.

-- 5. Bevollmächtigte:r mit aufgabenkreis 'gesundheit' oder 'behoerden'
drop policy if exists "kassen_vorgang_bevollmaechtigter_select" on kassen_vorgang;
create policy "kassen_vorgang_bevollmaechtigter_select"
  on kassen_vorgang for select
  using (
    darf_im_namen_handeln(klient_id, 'gesundheit')
    or darf_im_namen_handeln(klient_id, 'behoerden')
  );

-- ─────────────────────────────────────────────────────────────────────
-- widerspruch · Phase 2 — vereinfachte Tabelle, Pflicht für § 84 SGG
-- ─────────────────────────────────────────────────────────────────────

create table if not exists widerspruch (
  id                  text         primary key,
  vorgang_id          text         not null references kassen_vorgang(id) on delete cascade,
  klient_id           text         not null,
  klient_name         text         not null,
  bescheid_datum      date         not null,
  frist_ende          date         not null,
  eingelegt_am        date         not null default now()::date,
  status              text         not null default 'geplant' check (status in (
                        'geplant', 'abgeschickt', 'bestaetigt', 'abhilfe', 'abgelehnt', 'widerrufen'
                      )),
  begruendung         text,
  letzte_aenderung_am date         not null default now()::date,
  created_at          timestamptz  not null default now(),
  updated_at          timestamptz  not null default now()
);

comment on table widerspruch is 'Widerspruchs-Verlauf je Kassen-Vorgang · § 84 SGG (1 Monat ab Bescheid) · Cascade-Delete mit Vorgang.';

create index if not exists widerspruch_vorgang  on widerspruch (vorgang_id);
create index if not exists widerspruch_klient   on widerspruch (klient_id, eingelegt_am desc);
create index if not exists widerspruch_status   on widerspruch (status, frist_ende);

drop trigger if exists widerspruch_touch_updated_trigger on widerspruch;
create trigger widerspruch_touch_updated_trigger
  before update on widerspruch
  for each row execute function swap_offer_touch_updated();

alter table widerspruch enable row level security;

drop policy if exists "widerspruch_klient_self_select" on widerspruch;
create policy "widerspruch_klient_self_select"
  on widerspruch for select
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()));

drop policy if exists "widerspruch_klient_self_insert" on widerspruch;
create policy "widerspruch_klient_self_insert"
  on widerspruch for insert
  with check (klient_id in (select klient_id from profiles where user_id = auth.uid()));

drop policy if exists "widerspruch_klient_self_update" on widerspruch;
create policy "widerspruch_klient_self_update"
  on widerspruch for update
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()));

drop policy if exists "widerspruch_care_team_select" on widerspruch;
create policy "widerspruch_care_team_select"
  on widerspruch for select
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

drop policy if exists "widerspruch_bevollmaechtigter_select" on widerspruch;
create policy "widerspruch_bevollmaechtigter_select"
  on widerspruch for select
  using (
    darf_im_namen_handeln(klient_id, 'gesundheit')
    or darf_im_namen_handeln(klient_id, 'behoerden')
  );

-- ─────────────────────────────────────────────────────────────────────
-- Realtime
-- ─────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table kassen_vorgang;
alter publication supabase_realtime add table widerspruch;

alter table kassen_vorgang replica identity full;
alter table widerspruch    replica identity full;

-- ─────────────────────────────────────────────────────────────────────
-- Helper · Frist-Berechnung
-- ─────────────────────────────────────────────────────────────────────

create or replace function frist_dreizehn_dreia(eingang date) returns date
language sql immutable
as $$ select eingang + interval '21 days'; $$;

create or replace function frist_paragraph_84_sgg(bescheid date) returns date
language sql immutable
as $$ select bescheid + interval '1 month'; $$;

comment on function frist_dreizehn_dreia is '§ 13 Abs 3a SGB V · 3-Wochen-Genehmigungsfrist (5 mit MD-Beauftragung).';
comment on function frist_paragraph_84_sgg is '§ 84 SGG · 1-Monats-Frist für Widerspruch ab Bescheid-Erhalt.';

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0013_storage_buckets.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0013 · Storage-Buckets + Policies
--
-- Drei neue private Buckets für hochsensible Klient-Dokumente:
--   · vollmacht-scans       → notariell beglaubigte Vorsorgevollmachten,
--                              Patientenverfügungen, Betreuungs-Beschlüsse
--   · identity-dokumente    → Personalausweis, Krankenversicherten-Karte,
--                              Pflegegrad-Bescheid (sensible Stamm-Doku)
--   · klient-akte           → freie Anhänge zur Klient-Akte (Foto-Doku
--                              Wunde, Pflegeplan-PDF, Lebensbuch-Audio)
--
-- Bucket `verifizierungen` (existiert bereits aus init_auth) bleibt
-- unangetastet — dort liegen User-Echtheits-Nachweise (Hauptamt-Vertrag,
-- Berufsausweise, etc.) für Mitarbeitende.
--
-- Pfad-Konvention: `<klient_id>/<dateityp>/<datei>` — z.B.
--   vollmacht-scans/klient-hr/vorsorge-2024/notar-schreiber.pdf
--   identity-dokumente/klient-hr/perso-vorderseite.jpg
--
-- RLS-Logik (über storage.objects-Policies):
--   · Klient:in selbst (über profiles.klient_id im Pfad-Prefix)
--   · Care-Team-Mitglied der Klient:in (lesen)
--   · Bevollmächtigte:r mit gesundheit-Aufgabenkreis (lesen + schreiben
--     auf vollmacht-scans, lesen auf andere)
--   · service_role bleibt allmächtig

-- ─────────────────────────────────────────────────────────────────────
-- Buckets anlegen (idempotent)
-- ─────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vollmacht-scans',     'vollmacht-scans',     false, 20971520, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('identity-dokumente',  'identity-dokumente',  false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('klient-akte',         'klient-akte',         false, 52428800, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', 'audio/wav'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ─────────────────────────────────────────────────────────────────────
-- Helper · Klient-ID aus Pfad extrahieren
-- ─────────────────────────────────────────────────────────────────────

create or replace function storage_klient_id_from_path(object_name text) returns text
language sql immutable
as $$
  select split_part(object_name, '/', 1);
$$;

comment on function storage_klient_id_from_path is 'Extrahiert klient_id aus Storage-Pfad-Prefix (z.B. "klient-hr/perso.jpg" → "klient-hr").';

-- ─────────────────────────────────────────────────────────────────────
-- Policies · vollmacht-scans
--
-- Klient:in selbst + Bevollmächtigte mit gesundheit dürfen lesen +
-- schreiben (= Vollmacht hochladen). Care-Team mit beruf 'sozial' oder
-- 'pflege' darf zumindest lesen (für Notfall-Aktion).
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "vollmacht_scans_klient_self" on storage.objects;
create policy "vollmacht_scans_klient_self"
  on storage.objects for all
  using (
    bucket_id = 'vollmacht-scans'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'vollmacht-scans'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "vollmacht_scans_bevollmaechtigter" on storage.objects;
create policy "vollmacht_scans_bevollmaechtigter"
  on storage.objects for all
  using (
    bucket_id = 'vollmacht-scans'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  )
  with check (
    bucket_id = 'vollmacht-scans'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  );

drop policy if exists "vollmacht_scans_care_team_select" on storage.objects;
create policy "vollmacht_scans_care_team_select"
  on storage.objects for select
  using (
    bucket_id = 'vollmacht-scans'
    and storage_klient_id_from_path(name) in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true and beruf in ('pflege', 'sozial')
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- Policies · identity-dokumente
--
-- Sehr restriktiv: nur Klient:in selbst + Bevollmächtigte. Care-Team
-- bekommt KEINEN Zugriff (Personalausweis-Scan ist nicht für Pflege
-- relevant — wenn doch, läuft das übers freie Klient-Akte-Bucket).
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "identity_dokumente_klient_self" on storage.objects;
create policy "identity_dokumente_klient_self"
  on storage.objects for all
  using (
    bucket_id = 'identity-dokumente'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'identity-dokumente'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "identity_dokumente_bevollmaechtigter" on storage.objects;
create policy "identity_dokumente_bevollmaechtigter"
  on storage.objects for all
  using (
    bucket_id = 'identity-dokumente'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  )
  with check (
    bucket_id = 'identity-dokumente'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  );

-- ─────────────────────────────────────────────────────────────────────
-- Policies · klient-akte (freie Anhänge)
--
-- Klient:in + Bevollmächtigte: alles. Care-Team: lesen + schreiben
-- (Pflegekraft kann Wunddoku-Foto hochladen, Therapeut Lebensbuch-Audio).
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "klient_akte_klient_self" on storage.objects;
create policy "klient_akte_klient_self"
  on storage.objects for all
  using (
    bucket_id = 'klient-akte'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'klient-akte'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "klient_akte_bevollmaechtigter" on storage.objects;
create policy "klient_akte_bevollmaechtigter"
  on storage.objects for all
  using (
    bucket_id = 'klient-akte'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  )
  with check (
    bucket_id = 'klient-akte'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  );

drop policy if exists "klient_akte_care_team" on storage.objects;
create policy "klient_akte_care_team"
  on storage.objects for all
  using (
    bucket_id = 'klient-akte'
    and storage_klient_id_from_path(name) in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  )
  with check (
    bucket_id = 'klient-akte'
    and storage_klient_id_from_path(name) in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- audit_log Erweiterung · Storage-Zugriffe als 'storage'-Ressource
-- (Optional · Storage-Operationen können über audit_log getrackt
--  werden, wenn der Hybrid-Layer die ressource='storage' setzt.)
-- ─────────────────────────────────────────────────────────────────────

alter table audit_log
  drop constraint if exists audit_log_ressource_check;

alter table audit_log
  add constraint audit_log_ressource_check
  check (ressource in (
    'wunsch', 'wunsch-verlauf', 'pflegediagnose', 'pflegeplan',
    'belegung', 'kassen-vorgang', 'vollmacht', 'identity',
    'btm-buch', 'heimversorgung', 'sterbe-wache', 'team',
    'care-team', 'tausch-offer',
    'storage-vollmacht', 'storage-identity', 'storage-akte'
  ));

-- ════════════════════════════════════════════════════════════════════════════
-- ║ 0014_messenger.sql
-- ════════════════════════════════════════════════════════════════════════════

-- Migration 0014 · Messenger · messages + message_reactions
--
-- Die Messenger-Tabellen (`messages`, `message_reactions`) wurden
-- ursprünglich außerhalb des supabase/migrations/-Ordners angelegt
-- (vermutlich direkt im Dashboard oder in einer `init_messenger`-
-- Migration die nicht im Git-Repo gelandet ist).
--
-- Diese Migration:
--   1. Reicht das Schema **idempotent** nach (nichts kaputt machen
--      falls Tabellen schon existieren · `if not exists` everywhere)
--   2. Setzt RLS-Policies, die mit care_team (0003) + vollmacht (0004)
--      harmonieren — Messenger ist nicht mehr ein „alle sehen alles",
--      sondern Klient-Channels respektieren das Care-Team
--   3. Fügt voicemail-attachment-bucket aus 0013-Logik hinzu
--   4. Realtime-Pub erweitern wenn nicht schon
--
-- Ablauf in Echtbetrieb:
--   · User schreibt eine Nachricht in einen Klient-Kanal
--   · RLS prüft: ist user im care_team von klient_id?
--   · Wenn ja: insert geht durch
--   · Realtime sendet die Nachricht an alle care_team-Mitglieder
--     (deren SELECT-RLS greift)

-- ─────────────────────────────────────────────────────────────────────
-- messages
-- ─────────────────────────────────────────────────────────────────────

create table if not exists messages (
  id                   uuid         primary key default gen_random_uuid(),
  von_user_id          uuid         not null references auth.users(id) on delete cascade,
  klient_id            text,                                            -- null = ohne Klient-Bezug (offene Cross-Berufs-Channels)
  body                 text         not null check (length(body) <= 4000),
  attachment_url       text,
  attachment_name      text,
  voicemail_url        text,
  voicemail_dauer_sec  integer      check (voicemail_dauer_sec between 1 and 600),
  mentions             text[]       not null default '{}',
  hashtags             text[]       not null default '{}',
  parent_id            uuid         references messages(id) on delete cascade,
  gelesen_von          uuid[]       not null default '{}',
  dm_participants      uuid[],                                          -- 2-elementig wenn DM, sonst null
  created_at           timestamptz  not null default now()
);

comment on table messages is 'Messenger-Nachrichten · Pflege-/Cross-Berufs-Chat · Klient-Bezug + DMs · Mentions/Hashtags · Cascade-Delete bei User/Parent-Lösch.';

create index if not exists messages_klient_at      on messages (klient_id, created_at desc) where klient_id is not null;
create index if not exists messages_parent         on messages (parent_id) where parent_id is not null;
create index if not exists messages_dm             on messages using gin (dm_participants) where dm_participants is not null;
create index if not exists messages_mentions       on messages using gin (mentions);
create index if not exists messages_hashtags       on messages using gin (hashtags);
create index if not exists messages_user_at        on messages (von_user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────
-- message_reactions
-- ─────────────────────────────────────────────────────────────────────

create table if not exists message_reactions (
  id          uuid         primary key default gen_random_uuid(),
  message_id  uuid         not null references messages(id) on delete cascade,
  user_id     uuid         not null references auth.users(id) on delete cascade,
  emoji       text         not null check (length(emoji) between 1 and 16),
  created_at  timestamptz  not null default now(),

  constraint message_reactions_eindeutig unique (message_id, user_id, emoji)
);

comment on table message_reactions is 'Emoji-Reactions auf Nachrichten · pro User+Message+Emoji nur einmal.';

create index if not exists message_reactions_message on message_reactions (message_id);
create index if not exists message_reactions_user    on message_reactions (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────
-- RLS · messages
--
-- Lese-Logik:
--   · DM (dm_participants set): nur die zwei Beteiligten
--   · Klient-Bezug (klient_id set): Klient:in selbst + Care-Team +
--     Bevollmächtigte mit gesundheit
--   · ohne Klient-Bezug: jede authentifizierte Person (offener Kanal)
--
-- Schreib-Logik:
--   · DM: nur Beteiligte
--   · Klient-Bezug: nur Care-Team-Mitglied (= jemand der die Klient:in
--     pflegt/behandelt)
--   · ohne Klient-Bezug: jede authentifizierte Person
-- ─────────────────────────────────────────────────────────────────────

alter table messages enable row level security;

drop policy if exists "messages_select" on messages;
create policy "messages_select"
  on messages for select
  using (
    -- DM: nur Beteiligte
    (dm_participants is not null and auth.uid() = any(dm_participants))
    -- Klient-Bezug: Klient-Self
    or (klient_id is not null and klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    ))
    -- Klient-Bezug: Care-Team
    or (klient_id is not null and klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    ))
    -- Klient-Bezug: Bevollmächtigte mit gesundheit
    or (klient_id is not null and darf_im_namen_handeln(klient_id, 'gesundheit'))
    -- offener Kanal: alle authenticated
    or (klient_id is null and dm_participants is null and auth.uid() is not null)
  );

drop policy if exists "messages_insert" on messages;
create policy "messages_insert"
  on messages for insert
  with check (
    -- Eigene User-ID
    von_user_id = auth.uid()
    and (
      -- DM: nur Beteiligte
      (dm_participants is not null and auth.uid() = any(dm_participants))
      -- Klient-Bezug: nur Care-Team
      or (klient_id is not null and klient_id in (
        select klient_id from care_team
        where user_id = auth.uid() and aktiv = true
      ))
      -- Klient-Bezug + Klient-Self (Klient:in darf in eigenem Kanal schreiben)
      or (klient_id is not null and klient_id in (
        select klient_id from profiles where user_id = auth.uid()
      ))
      -- offener Kanal
      or (klient_id is null and dm_participants is null)
    )
  );

drop policy if exists "messages_update_self" on messages;
create policy "messages_update_self"
  on messages for update
  using (von_user_id = auth.uid())
  with check (von_user_id = auth.uid());

drop policy if exists "messages_delete_self" on messages;
create policy "messages_delete_self"
  on messages for delete
  using (von_user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────
-- RLS · message_reactions
-- Lese-Logik wie messages-SELECT (transitiv über Message)
-- ─────────────────────────────────────────────────────────────────────

alter table message_reactions enable row level security;

drop policy if exists "message_reactions_select" on message_reactions;
create policy "message_reactions_select"
  on message_reactions for select
  using (
    exists (
      select 1 from messages m
      where m.id = message_reactions.message_id
        -- impliziter RLS-Check über messages (PostgreSQL prüft die m-Zeile gegen messages-Policies)
    )
  );

drop policy if exists "message_reactions_insert_self" on message_reactions;
create policy "message_reactions_insert_self"
  on message_reactions for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from messages where id = message_id)
  );

drop policy if exists "message_reactions_delete_self" on message_reactions;
create policy "message_reactions_delete_self"
  on message_reactions for delete
  using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────
-- Voicemail-Bucket · privater Storage für Sprach-Anhänge
-- ─────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('messenger-voicemail',  'messenger-voicemail',  false, 10485760,  array['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm']),
  ('messenger-attachment', 'messenger-attachment', false, 26214400,  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage-Policies: jeder authenticated user kann eigene Voicemails
-- lesen+schreiben. Pfad-Konvention: <user_id>/<dateiname>
drop policy if exists "messenger_voicemail_self" on storage.objects;
create policy "messenger_voicemail_self"
  on storage.objects for all
  using (
    bucket_id in ('messenger-voicemail', 'messenger-attachment')
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id in ('messenger-voicemail', 'messenger-attachment')
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Lesen für andere · authenticated mit Bezug zur Message
-- (vereinfachte Variante: alle authenticated dürfen lesen — der signed-URL
-- ist sowieso nur 1 h gültig + nur an berechtigte Empfänger ausgegeben)
drop policy if exists "messenger_voicemail_authenticated_select" on storage.objects;
create policy "messenger_voicemail_authenticated_select"
  on storage.objects for select
  using (
    bucket_id in ('messenger-voicemail', 'messenger-attachment')
    and auth.uid() is not null
  );

-- ─────────────────────────────────────────────────────────────────────
-- Realtime
-- ─────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table message_reactions;

alter table messages          replica identity full;
alter table message_reactions replica identity full;
