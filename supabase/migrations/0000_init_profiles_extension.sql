-- Migration 0000 · profiles-Bridge-Felder vor allen RLS-Policies
--
-- Sehr früh ausgeführt, weil viele Policies in 0001-0014 auf
-- profiles.klient_id und profiles.person_id verweisen. Die eigentliche
-- care_team-Tabelle kommt erst in 0003, aber die Spalten in profiles
-- müssen vorher da sein, sonst scheitert das CREATE POLICY mit
-- "column does not exist".
--
-- Idempotent: alter table … add column if not exists.

alter table if exists profiles
  add column if not exists person_id  text,
  add column if not exists klient_id  text;

create index if not exists profiles_person_id  on profiles (person_id) where person_id is not null;
create index if not exists profiles_klient_id  on profiles (klient_id) where klient_id is not null;

comment on column profiles.person_id is 'Bridge zu Demo-Personal-Universum (z.B. "person-pf-001"). Phase 2.5: durch echte staff_id ersetzt.';
comment on column profiles.klient_id is 'Wenn Klient:in selbst eingeloggt: ID im Klient-Universum (z.B. "klient-hr").';
