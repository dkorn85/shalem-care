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
-- Nachgeholte Policies aus 0001/0002 (jetzt funktional, weil
-- care_team + profiles.person_id existieren)
-- ─────────────────────────────────────────────────────────────────────

-- klient_wunsch · Care-Team SELECT
drop policy if exists "klient_wunsch_care_team_select" on klient_wunsch;
create policy "klient_wunsch_care_team_select"
  on klient_wunsch
  for select
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- swap_offer · Owner-Update/Delete jetzt mit person_id-Bridge
drop policy if exists "swap_offer_owner_update" on swap_offer;
create policy "swap_offer_owner_update"
  on swap_offer
  for update
  using (
    offered_by = auth.uid()::text
    or offered_by in (select person_id from profiles where user_id = auth.uid() and person_id is not null)
  );

drop policy if exists "swap_offer_owner_delete" on swap_offer;
create policy "swap_offer_owner_delete"
  on swap_offer
  for delete
  using (
    offered_by = auth.uid()::text
    or offered_by in (select person_id from profiles where user_id = auth.uid() and person_id is not null)
  );
