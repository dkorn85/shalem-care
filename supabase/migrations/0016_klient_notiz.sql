-- Migration 0016 · klient_notiz · freie Notizen
--
-- Bisher in components/KlientNotizenForm.tsx als reine useState-UI ·
-- bei Page-Reload waren die Notizen weg. Jetzt persistent + RLS-gesichert.
--
-- Konzept: Klient:in schreibt zwischen Konferenzen Wünsche/Fragen/
-- Sorgen/Freuden auf. Was als "fuer_konferenz" markiert ist, sieht
-- das Care-Team vorm nächsten gemeinsamen Termin. Der Rest bleibt
-- privat (oder geht an Bevollmächtigte mit Aufgabenkreis gesundheit).

-- ─────────────────────────────────────────────────────────────────────
-- Tabelle
-- ─────────────────────────────────────────────────────────────────────

create table if not exists klient_notiz (
  id              text         primary key,
  klient_id       text         not null,
  typ             text         not null check (typ in ('wunsch', 'frage', 'sorge', 'freude')),
  text            text         not null check (length(text) between 1 and 2000),
  fuer_konferenz  boolean      not null default false,
  erstellt_am     timestamptz  not null default now(),
  beendet_am      timestamptz,                                -- weich-Lösch · Notizen werden nicht hart gelöscht
  konferenz_id    text,                                        -- wenn schon einer Konferenz zugeordnet
  besprochen_am   timestamptz,                                 -- nach Konferenz-Verarbeitung
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

comment on table klient_notiz is 'Klient-Selbstreflexion zwischen Konferenzen · 4 Typen · konferenz-flag entscheidet ob Care-Team mitliest.';

create index if not exists klient_notiz_klient_aktiv      on klient_notiz (klient_id, erstellt_am desc) where beendet_am is null;
create index if not exists klient_notiz_konferenz_flag    on klient_notiz (klient_id, fuer_konferenz) where beendet_am is null and besprochen_am is null;
create index if not exists klient_notiz_typ               on klient_notiz (typ, erstellt_am desc);

drop trigger if exists klient_notiz_touch_updated_trigger on klient_notiz;
create trigger klient_notiz_touch_updated_trigger
  before update on klient_notiz
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table klient_notiz enable row level security;

-- Klient:in selbst sieht + ändert alle eigenen Notizen
drop policy if exists "klient_notiz_klient_self_all" on klient_notiz;
create policy "klient_notiz_klient_self_all"
  on klient_notiz for all
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()))
  with check (klient_id in (select klient_id from profiles where user_id = auth.uid()));

-- Care-Team-Mitglied sieht NUR konferenz-markierte Notizen
-- (was die Klient:in privat hält, bleibt privat)
drop policy if exists "klient_notiz_care_team_konferenz_select" on klient_notiz;
create policy "klient_notiz_care_team_konferenz_select"
  on klient_notiz for select
  using (
    fuer_konferenz = true
    and beendet_am is null
    and klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- Care-Team darf konferenz-markierte Notizen als 'besprochen' markieren
-- (Update auf besprochen_am, sonst kein Schreib-Recht)
drop policy if exists "klient_notiz_care_team_besprochen_update" on klient_notiz;
create policy "klient_notiz_care_team_besprochen_update"
  on klient_notiz for update
  using (
    fuer_konferenz = true
    and klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- Bevollmächtigte mit gesundheit · sehen ALLES (auch private Notizen,
-- weil Vollmacht typischerweise auch psychosoziale Begleitung umfasst)
drop policy if exists "klient_notiz_bevollmaechtigter_all" on klient_notiz;
create policy "klient_notiz_bevollmaechtigter_all"
  on klient_notiz for all
  using (darf_im_namen_handeln(klient_id, 'gesundheit'))
  with check (darf_im_namen_handeln(klient_id, 'gesundheit'));

-- ─────────────────────────────────────────────────────────────────────
-- Realtime
-- ─────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table klient_notiz;
alter table klient_notiz replica identity full;

-- ─────────────────────────────────────────────────────────────────────
-- Idempotenter Demo-Seed · 4 Notizen für Helga (entspricht VOR_BEFUELLT)
-- ─────────────────────────────────────────────────────────────────────

insert into klient_notiz (id, klient_id, typ, text, fuer_konferenz, erstellt_am)
select * from (values
  ('n-helga-1', 'klient-hr', 'frage',  'Wann darf ich wieder selbstständig zur Toilette? Anika sagt die Wunde verheilt — ich frage mich was das für die Mobilisation bedeutet.', true,  now() - interval '3 days'),
  ('n-helga-2', 'klient-hr', 'wunsch', 'Karin (meine Tochter) soll am Wochenende mit eingeplant werden — sie kommt aus Hamburg, das passt nicht in den normalen Rhythmus.',       true,  now() - interval '5 days'),
  ('n-helga-3', 'klient-hr', 'freude', 'Letzte Woche habe ich zum ersten Mal seit dem Sturz selbst Tee aufgebrüht. Rita war dabei. Es war schön.',                                  false, now() - interval '6 days'),
  ('n-helga-4', 'klient-hr', 'sorge',  'Die Tabletten-Liste ist sehr lang. Ich verliere manchmal den Überblick. Können wir gemeinsam schauen ob alles noch nötig ist?',            true,  now() - interval '8 days')
) as v (id, klient_id, typ, text, fuer_konferenz, erstellt_am)
where not exists (select 1 from klient_notiz where klient_id = 'klient-hr');
