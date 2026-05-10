-- Migration 0001 · klient_wunsch + klient_wunsch_verlauf
--
-- Ablöse der globalThis-Map aus lib/klient/wunsch-store.ts gegen
-- persistente Tabellen mit Row-Level-Security.
--
-- Konzept:
--  · klient_wunsch          = aktueller Stand pro (klient_id, termin_id)
--  · klient_wunsch_verlauf  = vollständige Historie aller Eintragungen
--                              für DSGVO Art. 16 Berichtigungs-Spur
--
-- RLS-Policies:
--  · Klient:in selbst (über profiles.klient_id) liest + schreibt eigene Wünsche
--  · Vorsorge-Bevollmächtigte (über vollmachten-Tabelle, Phase 2.1) lesen + schreiben
--  · Pflege/Therapie/Apotheke des Klient-Kreises (über care_team-Tabelle, Phase 2.2) lesen
--  · service_role hat vollen Zugriff (für Server-Actions ohne User-Session)
--
-- Hinweis: Die helper-Tabellen `vollmachten`, `care_team` werden in
-- separaten Folge-Migrationen 0002 + 0003 angelegt. Bis dahin greift
-- nur die Self-Service-Policy.

-- ─────────────────────────────────────────────────────────────────────
-- Tabellen
-- ─────────────────────────────────────────────────────────────────────

create table if not exists klient_wunsch (
  klient_id      text        not null,
  termin_id      text        not null,
  wunsch         text        not null check (length(wunsch) between 1 and 240),
  geaendert_am   timestamptz not null default now(),
  geaendert_von  text        not null check (geaendert_von in ('selbst', 'betreuer', 'angehoerige', 'pflege')),
  primary key (klient_id, termin_id)
);

comment on table klient_wunsch is 'Aktueller Wunsch der Klient:in pro Termin · DSGVO Art. 4 Identitätshoheit · Phase 2 Migration aus globalThis-Map.';

create table if not exists klient_wunsch_verlauf (
  id             bigserial   primary key,
  klient_id      text        not null,
  termin_id      text        not null,
  wunsch         text        not null,           -- bei art='geloescht' leer
  art            text        not null check (art in ('gesetzt', 'geloescht')),
  geaendert_am   timestamptz not null default now(),
  geaendert_von  text        not null check (geaendert_von in ('selbst', 'betreuer', 'angehoerige', 'pflege'))
);

comment on table klient_wunsch_verlauf is 'Vollständige Historie aller Wunsch-Änderungen · DSGVO Art. 16 Berichtigungs-Spur · DSGVO Art. 15 Auskunfts-Quelle.';

create index if not exists klient_wunsch_verlauf_klient_termin
  on klient_wunsch_verlauf (klient_id, termin_id, geaendert_am desc);

create index if not exists klient_wunsch_verlauf_klient
  on klient_wunsch_verlauf (klient_id, geaendert_am desc);

-- ─────────────────────────────────────────────────────────────────────
-- RLS aktivieren
-- ─────────────────────────────────────────────────────────────────────

alter table klient_wunsch          enable row level security;
alter table klient_wunsch_verlauf  enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- Policy 1 · Klient:in selbst über profiles.klient_id
-- (profiles muss bestehen, profiles.user_id = auth.uid(), profiles.klient_id = klient_wunsch.klient_id)
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "klient_wunsch_self_select" on klient_wunsch;
create policy "klient_wunsch_self_select"
  on klient_wunsch
  for select
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "klient_wunsch_self_insert" on klient_wunsch;
create policy "klient_wunsch_self_insert"
  on klient_wunsch
  for insert
  with check (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "klient_wunsch_self_update" on klient_wunsch;
create policy "klient_wunsch_self_update"
  on klient_wunsch
  for update
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "klient_wunsch_self_delete" on klient_wunsch;
create policy "klient_wunsch_self_delete"
  on klient_wunsch
  for delete
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

-- Verlauf: nur Lesen für Klient:in selbst (Editor schreibt via service_role)
drop policy if exists "klient_wunsch_verlauf_self_select" on klient_wunsch_verlauf;
create policy "klient_wunsch_verlauf_self_select"
  on klient_wunsch_verlauf
  for select
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- Policy 2 · Care-Team Read-Access
-- (care_team muss bestehen, aktuell als Stub — wenn die Tabelle nicht
--  existiert, greift die Policy nicht. Migration 0003 ergänzt sie.)
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "klient_wunsch_care_team_select" on klient_wunsch;
create policy "klient_wunsch_care_team_select"
  on klient_wunsch
  for select
  using (
    exists (
      select 1
      from information_schema.tables
      where table_schema = 'public' and table_name = 'care_team'
    ) and klient_id in (
      select klient_id
      from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- service_role · voller Zugriff für Server-Actions
-- (Supabase setzt für service_role automatisch alle Policies aus —
--  wir brauchen also keine eigene Policy.)
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- Trigger · Verlauf-Eintrag automatisch bei jedem INSERT/UPDATE/DELETE
-- ─────────────────────────────────────────────────────────────────────

create or replace function klient_wunsch_log_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT' or tg_op = 'UPDATE') then
    insert into klient_wunsch_verlauf (klient_id, termin_id, wunsch, art, geaendert_am, geaendert_von)
    values (new.klient_id, new.termin_id, new.wunsch, 'gesetzt', new.geaendert_am, new.geaendert_von);
    return new;
  elsif (tg_op = 'DELETE') then
    insert into klient_wunsch_verlauf (klient_id, termin_id, wunsch, art, geaendert_am, geaendert_von)
    values (old.klient_id, old.termin_id, '', 'geloescht', now(), old.geaendert_von);
    return old;
  end if;
  return null;
end $$;

drop trigger if exists klient_wunsch_log_trigger on klient_wunsch;
create trigger klient_wunsch_log_trigger
  after insert or update or delete on klient_wunsch
  for each row execute function klient_wunsch_log_change();
