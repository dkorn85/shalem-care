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
    offered_by in (
      select coalesce(person_id, user_id::text) from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "swap_offer_owner_delete" on swap_offer;
create policy "swap_offer_owner_delete"
  on swap_offer
  for delete
  using (
    offered_by in (
      select coalesce(person_id, user_id::text) from profiles where user_id = auth.uid()
    )
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
