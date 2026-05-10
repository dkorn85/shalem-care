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
