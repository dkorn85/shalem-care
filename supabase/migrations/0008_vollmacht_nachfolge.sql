-- Migration 0008 · vollmacht_nachfolge
--
-- Rollen-Übergang in der Vollmachts-Kette. Wenn die/der primär
-- Bevollmächtigte stirbt, schwer erkrankt, dauerhaft nicht erreichbar
-- ist oder die Vollmacht aktiv niederlegt, springt die nächste Person
-- in der Reihenfolge ein.
--
-- Zwei Tabellen:
--   · vollmacht_nachfolge       = Ranking-Liste je Vollmacht
--   · vollmacht_aktivierung_log = Verlauf der Aktivierungen
--
-- Plus eine SQL-Function `nachfolge_aktivieren(vollmacht_id, grund)`,
-- die in einer Transaktion:
--   1. die aktuelle Vollmacht inaktiv setzt
--   2. die nächste Nachfolge mit kleinster freier Reihenfolge aktiviert
--      (= neue Vollmacht-Zeile mit kopierten Aufgabenkreisen)
--   3. den Übergang im aktivierung_log dokumentiert
--
-- Rechtsrahmen:
--   · BGB § 1815 (Vorsorgevollmacht-Reform 2023): Nachfolge in Vollmacht
--     ist explizit erlaubt, muss aber in der Vollmachts-Urkunde benannt sein
--   · BGB § 1820 (Betreuung-Übergang): bei gerichtlicher Betreuung muss
--     das Betreuungsgericht beteiligt werden — diese Tabelle ist für
--     vorsorgliche Vollmachten gedacht, Betreuungs-Wechsel via service_role.

-- ─────────────────────────────────────────────────────────────────────
-- vollmacht_nachfolge · Ranking-Liste
-- ─────────────────────────────────────────────────────────────────────

create table if not exists vollmacht_nachfolge (
  id                         bigserial    primary key,
  vollmacht_id               bigint       not null references vollmacht(id) on delete cascade,
  reihenfolge                smallint     not null check (reihenfolge between 1 and 9),
  bevollmaechtigter_user_id  uuid         references auth.users(id) on delete set null,
  bevollmaechtigter_name     text         not null,
  bevollmaechtigter_anschrift text,
  bevollmaechtigter_telefon  text,
  beziehung                  text,
  aufloeser                  text         not null check (aufloeser in (
                                'tod-vorgaenger', 'geschaeftsunfaehig',
                                'nicht-erreichbar-7-tage', 'eigene-niederlegung',
                                'manuell-klient'
                              )),
  notizen                    text,
  aktiviert_am               timestamptz,                -- null = noch nicht aktiv
  aktiviert_grund            text,
  created_at                 timestamptz  not null default now(),

  -- Pro Vollmacht jede Reihenfolge nur einmal
  constraint vollmacht_nachfolge_eindeutig unique (vollmacht_id, reihenfolge)
);

comment on table vollmacht_nachfolge is 'Nachfolge-Ranking je Vollmacht · BGB § 1815-Reform 2023 · Übergang bei Tod/Krankheit/Niederlegung der/des primär Bevollmächtigten.';

create index if not exists vollmacht_nachfolge_vollmacht  on vollmacht_nachfolge (vollmacht_id, reihenfolge);
create index if not exists vollmacht_nachfolge_user_id    on vollmacht_nachfolge (bevollmaechtigter_user_id) where bevollmaechtigter_user_id is not null;

-- ─────────────────────────────────────────────────────────────────────
-- vollmacht_aktivierung_log · Verlauf der Übergänge
-- ─────────────────────────────────────────────────────────────────────

create table if not exists vollmacht_aktivierung_log (
  id                  bigserial    primary key,
  klient_id           text         not null,
  vollmacht_id_alt    bigint       references vollmacht(id) on delete set null,
  vollmacht_id_neu    bigint       references vollmacht(id) on delete set null,
  nachfolge_id        bigint       references vollmacht_nachfolge(id) on delete set null,
  aufloeser           text         not null,
  bevollmaechtigt_alt text,
  bevollmaechtigt_neu text,
  ausgeloest_durch    uuid         references auth.users(id) on delete set null,
  ausgeloest_durch_name text,
  at                  timestamptz  not null default now(),
  notizen             text
);

comment on table vollmacht_aktivierung_log is 'Verlauf jedes Vollmachts-Übergangs · DSGVO Art. 30 + Beweis für Familie/Gericht · nicht löschbar (außer service_role).';

create index if not exists vollmacht_aktivierung_log_klient on vollmacht_aktivierung_log (klient_id, at desc);

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table vollmacht_nachfolge        enable row level security;
alter table vollmacht_aktivierung_log  enable row level security;

-- vollmacht_nachfolge · sichtbar wenn man die zugehörige vollmacht sehen darf
drop policy if exists "vollmacht_nachfolge_select" on vollmacht_nachfolge;
create policy "vollmacht_nachfolge_select"
  on vollmacht_nachfolge
  for select
  using (
    exists (
      select 1 from vollmacht v
      where v.id = vollmacht_nachfolge.vollmacht_id
        and v.klient_id in (
          select klient_id from profiles where user_id = auth.uid()
        )
    )
    or bevollmaechtigter_user_id = auth.uid()
  );

-- Klient:in selbst kann eigene Nachfolgen anlegen + ändern
drop policy if exists "vollmacht_nachfolge_klient_insert" on vollmacht_nachfolge;
create policy "vollmacht_nachfolge_klient_insert"
  on vollmacht_nachfolge
  for insert
  with check (
    exists (
      select 1 from vollmacht v
      where v.id = vollmacht_id
        and v.klient_id in (
          select klient_id from profiles where user_id = auth.uid()
        )
    )
  );

drop policy if exists "vollmacht_nachfolge_klient_update" on vollmacht_nachfolge;
create policy "vollmacht_nachfolge_klient_update"
  on vollmacht_nachfolge
  for update
  using (
    exists (
      select 1 from vollmacht v
      where v.id = vollmacht_id
        and v.klient_id in (
          select klient_id from profiles where user_id = auth.uid()
        )
    )
  );

drop policy if exists "vollmacht_nachfolge_klient_delete" on vollmacht_nachfolge;
create policy "vollmacht_nachfolge_klient_delete"
  on vollmacht_nachfolge
  for delete
  using (
    exists (
      select 1 from vollmacht v
      where v.id = vollmacht_id
        and v.klient_id in (
          select klient_id from profiles where user_id = auth.uid()
        )
    )
  );

-- vollmacht_aktivierung_log · Klient:in + Bevollmächtigte sehen, niemand schreibt direkt
drop policy if exists "vollmacht_aktivierung_log_select" on vollmacht_aktivierung_log;
create policy "vollmacht_aktivierung_log_select"
  on vollmacht_aktivierung_log
  for select
  using (
    klient_id in (select klient_id from profiles where user_id = auth.uid())
    or darf_im_namen_handeln(klient_id, 'gesundheit')
  );

-- INSERT auf log nur via service_role (über die nachfolge_aktivieren-Function)

-- ─────────────────────────────────────────────────────────────────────
-- nachfolge_aktivieren · die Übergangs-Function
-- ─────────────────────────────────────────────────────────────────────

create or replace function nachfolge_aktivieren(
  alte_vollmacht_id bigint,
  grund_text        text
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  alte_v    vollmacht%rowtype;
  naechste  vollmacht_nachfolge%rowtype;
  neue_id   bigint;
begin
  -- 1. Alte Vollmacht laden + sperren
  select * into alte_v from vollmacht where id = alte_vollmacht_id for update;
  if not found then
    raise exception 'Vollmacht % nicht gefunden', alte_vollmacht_id;
  end if;

  -- 2. Nächste verfügbare Nachfolge ermitteln (kleinste reihenfolge ohne aktiviert_am)
  select * into naechste
  from vollmacht_nachfolge
  where vollmacht_id = alte_vollmacht_id
    and aktiviert_am is null
  order by reihenfolge asc
  limit 1;

  if not found then
    raise exception 'Keine offene Nachfolge für Vollmacht % vorhanden', alte_vollmacht_id;
  end if;

  -- 3. Alte Vollmacht inaktiv setzen
  update vollmacht
  set aktiv = false,
      widerrufen_am = now(),
      widerrufen_grund = 'Übergang an Nachfolge: ' || grund_text
  where id = alte_vollmacht_id;

  -- 4. Neue Vollmacht aus Nachfolge anlegen (Aufgabenkreise vererben)
  insert into vollmacht (
    klient_id, art, bevollmaechtigter_user_id, bevollmaechtigter_name,
    bevollmaechtigter_anschrift, bevollmaechtigter_telefon, beziehung,
    aufgabenkreise, beglaubigt_durch, gueltig_von, notizen
  ) values (
    alte_v.klient_id,
    alte_v.art,
    naechste.bevollmaechtigter_user_id,
    naechste.bevollmaechtigter_name,
    naechste.bevollmaechtigter_anschrift,
    naechste.bevollmaechtigter_telefon,
    naechste.beziehung,
    alte_v.aufgabenkreise,
    'Nachfolge nach BGB § 1815 · ausgelöst durch ' || grund_text,
    now()::date,
    coalesce(naechste.notizen, '') || E'\n\nÜbergang von: ' || alte_v.bevollmaechtigter_name
  )
  returning id into neue_id;

  -- 5. Nachfolge-Eintrag als aktiviert markieren
  update vollmacht_nachfolge
  set aktiviert_am = now(),
      aktiviert_grund = grund_text
  where id = naechste.id;

  -- 6. Log-Eintrag schreiben
  insert into vollmacht_aktivierung_log (
    klient_id, vollmacht_id_alt, vollmacht_id_neu, nachfolge_id,
    aufloeser, bevollmaechtigt_alt, bevollmaechtigt_neu,
    ausgeloest_durch, notizen
  ) values (
    alte_v.klient_id, alte_vollmacht_id, neue_id, naechste.id,
    naechste.aufloeser, alte_v.bevollmaechtigter_name, naechste.bevollmaechtigter_name,
    auth.uid(), grund_text
  );

  return neue_id;
end $$;

comment on function nachfolge_aktivieren is 'Aktiviert die nächste Nachfolge in einer Vollmachts-Kette · transaktional · gibt neue vollmacht.id zurück.';

-- ─────────────────────────────────────────────────────────────────────
-- Idempotenter Demo-Seed · Nachfolge zur Helga-Tochter-Vollmacht
-- ─────────────────────────────────────────────────────────────────────

insert into vollmacht_nachfolge (vollmacht_id, reihenfolge, bevollmaechtigter_name, beziehung, aufloeser, notizen)
select v.id, n.reihenfolge, n.name, n.beziehung, n.aufloeser, n.notizen
from vollmacht v
cross join (values
  (1::smallint, 'Heike Liebenau',     'Schwester', 'tod-vorgaenger',           'Erste Nachfolge wenn Tochter Liane verstirbt'),
  (2::smallint, 'Bernd Reinhardt',    'Cousin',    'geschaeftsunfaehig',       'Zweite Nachfolge bei dauerhafter Geschäftsunfähigkeit beider Vorgängerinnen'),
  (3::smallint, 'Dr. Anna Bachmann',  'Berufsbetreuerin', 'manuell-klient',    'Letzte Reserve · gerichtlich bestellt wenn alle privaten Optionen ausfallen')
) as n(reihenfolge, name, beziehung, aufloeser, notizen)
where v.klient_id = 'klient-hr'
  and v.art = 'vorsorge'
  and v.bevollmaechtigter_name = 'Liane Volkmann'
  and not exists (select 1 from vollmacht_nachfolge where vollmacht_id = v.id);
