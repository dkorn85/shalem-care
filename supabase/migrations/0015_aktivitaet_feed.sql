-- Migration 0015 · aktivitaet_feed · Event-Stream zwischen Berufsgruppen
--
-- Bisher in lib/aktivitaet/feed.ts als globalThis-Array. Mit
-- Persistenz wird der Feed auch über Server-Restart hinweg
-- nachvollziehbar — wichtig für die Live-Sicht der Stationsleitung
-- und das Cross-Beruf-Activity-Pattern.
--
-- Live-Updates über die supabase_realtime-Pub aus Migration 0007.

-- ─────────────────────────────────────────────────────────────────────
-- Tabelle
-- ─────────────────────────────────────────────────────────────────────

create table if not exists aktivitaet_feed (
  id            text         primary key,
  zeitstempel   timestamptz  not null default now(),
  typ           text         not null check (typ in (
                  'doku_eintrag', 'wundverband', 'vergabe', 'vital_messung',
                  'schmerz_nrs', 'verordnung_anfrage', 'verordnung_ausstellung',
                  'therapie_termin', 'befund_eingang', 'konferenz_pre_read',
                  'konferenz_beschluss', 'hilfeplan_update', 'begleitung_protokoll',
                  'schicht_start', 'buchung', 'balance_check'
                )),
  von_beruf     text         not null,                                  -- Berufsfeld-String (kein FK, freie Demo-Werte)
  von_name      text         not null,
  klient_id     text         not null,
  klient_name   text         not null,
  ziel_beruf    text,
  ziel_name     text,
  inhalt        text         not null check (length(inhalt) between 1 and 500),
  meta          jsonb,
  created_at    timestamptz  not null default now()
);

comment on table aktivitaet_feed is 'Cross-Beruf Event-Stream · was passiert in der Plattform · für Live-Sicht der Stationsleitung + Netzwerk-Diagramm.';

create index if not exists aktivitaet_feed_zeit         on aktivitaet_feed (zeitstempel desc);
create index if not exists aktivitaet_feed_klient       on aktivitaet_feed (klient_id, zeitstempel desc);
create index if not exists aktivitaet_feed_von_beruf    on aktivitaet_feed (von_beruf, zeitstempel desc);
create index if not exists aktivitaet_feed_typ          on aktivitaet_feed (typ, zeitstempel desc);

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table aktivitaet_feed enable row level security;

-- Klient:in selbst sieht eigene Events
drop policy if exists "aktivitaet_feed_klient_self_select" on aktivitaet_feed;
create policy "aktivitaet_feed_klient_self_select"
  on aktivitaet_feed for select
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()));

-- Care-Team-Mitglied sieht Events ihrer Klient:innen
drop policy if exists "aktivitaet_feed_care_team_select" on aktivitaet_feed;
create policy "aktivitaet_feed_care_team_select"
  on aktivitaet_feed for select
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- Bevollmächtigte mit gesundheit
drop policy if exists "aktivitaet_feed_bevollmaechtigter_select" on aktivitaet_feed;
create policy "aktivitaet_feed_bevollmaechtigter_select"
  on aktivitaet_feed for select
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

-- Schreiben: Care-Team-Mitglied darf eigene Events anlegen
drop policy if exists "aktivitaet_feed_care_team_insert" on aktivitaet_feed;
create policy "aktivitaet_feed_care_team_insert"
  on aktivitaet_feed for insert
  with check (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- Klient:in selbst darf eigene Self-Events schreiben (Schmerz-NRS, Balance-Check, Buchung)
drop policy if exists "aktivitaet_feed_klient_self_insert" on aktivitaet_feed;
create policy "aktivitaet_feed_klient_self_insert"
  on aktivitaet_feed for insert
  with check (
    klient_id in (select klient_id from profiles where user_id = auth.uid())
    and typ in ('schmerz_nrs', 'balance_check', 'buchung')
  );

-- ─────────────────────────────────────────────────────────────────────
-- Realtime · für Live-Sicht der Stationsleitung
-- ─────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table aktivitaet_feed;
alter table aktivitaet_feed replica identity full;

-- ─────────────────────────────────────────────────────────────────────
-- Auto-Cleanup nach 90 Tagen (Pflicht-Aufbewahrung pflegerischer
-- Doku ist 30 Jahre § 630f BGB — der Feed ist aber die schnelle
-- Sicht, nicht die Doku selbst. Die echte Doku liegt in pflegeplan,
-- pflegediagnose etc.)
--
-- Statt automatischem cron lassen wir die Bereinigung als optionale
-- Function hier liegen — Stationsleitung kann sie manuell triggern
-- oder per Supabase pg_cron-Extension scheduln.
-- ─────────────────────────────────────────────────────────────────────

create or replace function aktivitaet_feed_aufraumen(tage_zurueck int default 90) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  geloescht int;
begin
  delete from aktivitaet_feed
  where zeitstempel < now() - (tage_zurueck || ' days')::interval
  returning 1 into geloescht;
  return coalesce(geloescht, 0);
end $$;

comment on function aktivitaet_feed_aufraumen is 'Löscht Feed-Einträge älter als N Tage · Default 90 · per Hand oder pg_cron triggern.';
