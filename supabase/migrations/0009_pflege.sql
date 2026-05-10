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
