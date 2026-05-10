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
