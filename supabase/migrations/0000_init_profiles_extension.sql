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

-- ─────────────────────────────────────────────────────────────────────
-- Generischer updated_at-Trigger-Helper
-- (wird von vielen Folge-Migrationen genutzt unter dem Namen
-- swap_offer_touch_updated — historisch in 0002 entstanden, jetzt
-- hier vorgezogen damit jede spätere Migration sich darauf verlassen
-- kann.)
-- ─────────────────────────────────────────────────────────────────────

create or replace function swap_offer_touch_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

comment on function swap_offer_touch_updated is 'Generischer BEFORE UPDATE-Trigger · setzt new.updated_at = now() · wiederverwendet für swap_offer + 8 weitere Tabellen.';
