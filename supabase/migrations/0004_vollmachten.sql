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
