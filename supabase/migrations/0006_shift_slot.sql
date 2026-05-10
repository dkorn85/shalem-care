-- Migration 0006 · shift_slot für FHIR-Slot-Persistierung
--
-- Bisher leben Schichten ausschließlich im Memory (lib/swap-store-memory.ts
-- + lib/seed-rolling.ts). Bei Server-Restart wird neu gesäht — was für
-- Demo okay, aber für Echtbetrieb mit echtem Tarif-Layer und ArbZG-
-- Validierung blockierend ist.
--
-- Diese Migration legt eine flache Persistenz an, die FHIR-Slot-Felder
-- denormalisiert speichert (start, end, shift_type, status) und das
-- volle FHIR-JSON als Blob mitführt — für Round-Trip mit
-- Medplum-Server-Modus.
--
-- Bezüge:
--   · owner_user_id → auth.users.id (Phase 2.5: echter Login-User)
--   · owner_person_id → Demo-Personal-Universum (z.B. "person-pf-001")
--   · swap_offer.slot_id → text-Ref auf shift_slot.id (kein FK, weil
--     swap_offer in Migration 0002 bereits FK-frei)

-- ─────────────────────────────────────────────────────────────────────
-- Tabellen
-- ─────────────────────────────────────────────────────────────────────

create table if not exists shift_slot (
  id              text         primary key,
  start_at        timestamptz  not null,
  end_at          timestamptz  not null check (end_at > start_at),
  shift_type      text         check (shift_type in ('early', 'late', 'night', 'intermediate')),
  status          text         not null default 'busy' check (status in (
                    'free', 'busy', 'busy-unavailable', 'busy-tentative', 'entered-in-error'
                  )),
  owner_user_id   uuid         references auth.users(id) on delete set null,
  owner_person_id text,                                                -- Demo-Bridge wenn user_id null
  station_id      text,
  einrichtung_id  text,
  service_type    text,                                                -- denormalisiert für Filter
  fhir_blob       jsonb,                                               -- volles FHIR-Slot-Resource für Round-Trip
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

comment on table shift_slot is 'Persistente Schichten · FHIR-Slot-kompatibel · ablöst die Memory-Map aus swap-store-memory.ts (Migration 0006).';

create index if not exists shift_slot_owner_user_id  on shift_slot (owner_user_id) where owner_user_id is not null;
create index if not exists shift_slot_owner_person   on shift_slot (owner_person_id) where owner_person_id is not null;
create index if not exists shift_slot_station_start  on shift_slot (station_id, start_at) where station_id is not null;
create index if not exists shift_slot_start          on shift_slot (start_at);
create index if not exists shift_slot_status         on shift_slot (status, start_at);

-- updated_at-Trigger (wiederverwendet aus 0002)
drop trigger if exists shift_slot_touch_updated_trigger on shift_slot;
create trigger shift_slot_touch_updated_trigger
  before update on shift_slot
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table shift_slot enable row level security;

-- 1. Authentifizierte sehen alle Schichten (Station-Plan ist intern offen)
drop policy if exists "shift_slot_authenticated_select" on shift_slot;
create policy "shift_slot_authenticated_select"
  on shift_slot
  for select
  using (auth.uid() is not null);

-- 2. Owner darf eigene Schichten anlegen + ändern + löschen
--    (Disposition + Tausch-Workflow nutzen service_role)
drop policy if exists "shift_slot_owner_insert" on shift_slot;
create policy "shift_slot_owner_insert"
  on shift_slot
  for insert
  with check (
    owner_user_id = auth.uid()
    or owner_person_id in (
      select person_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "shift_slot_owner_update" on shift_slot;
create policy "shift_slot_owner_update"
  on shift_slot
  for update
  using (
    owner_user_id = auth.uid()
    or owner_person_id in (
      select person_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "shift_slot_owner_delete" on shift_slot;
create policy "shift_slot_owner_delete"
  on shift_slot
  for delete
  using (
    owner_user_id = auth.uid()
    or owner_person_id in (
      select person_id from profiles where user_id = auth.uid()
    )
  );

-- 3. Stationsleitung-Pfad (Phase 2.5)
--    Wenn die station_admin-Rolle in user_roles existiert, darf die
--    Stationsleitung alle Slots ihrer Station ändern. Aktuell als
--    Stub-Policy hinterlegt, die per information_schema-Check inaktiv
--    bleibt bis user_roles um station_id erweitert wird.

-- ─────────────────────────────────────────────────────────────────────
-- Helper · überlappende Schichten erkennen (ArbZG-Vorbereitung)
-- ─────────────────────────────────────────────────────────────────────

create or replace function shifts_ueberlappend(
  ziel_owner uuid,
  ziel_start timestamptz,
  ziel_end   timestamptz
) returns boolean
language sql
stable
as $$
  select exists (
    select 1 from shift_slot
    where owner_user_id = ziel_owner
      and tstzrange(start_at, end_at, '[)') && tstzrange(ziel_start, ziel_end, '[)')
  );
$$;

comment on function shifts_ueberlappend is 'Prüft Überlappung zweier Schicht-Zeiträume für ArbZG-Validierung.';
