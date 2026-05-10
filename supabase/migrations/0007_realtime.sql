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
