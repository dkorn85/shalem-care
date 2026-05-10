-- Migration 0011 · klient_termin · die Wochen-Termine persistent
--
-- Bisher leben die Termine in `lib/klient/woche.ts` als statische
-- Demo-Konstante (KLIENT_WOCHE). Jeder Server-Restart begrub sie nicht
-- direkt — der Stand war ja code-seitig immer gleich. Aber sobald
-- echte Termine entstehen (Pflege legt morgens an, Arzt verschiebt
-- nachmittags), brauchen wir Persistenz + Verlauf.
--
-- Wir bilden den vollen WocheTermin-Type ab inkl. Status-Workflow
-- (geplant/laeuft/erledigt/verschoben/abgesagt) und der Brücke zum
-- bestehenden Wunsch-System (klient_wunsch.termin_id ist der gleiche
-- Schlüssel wie klient_termin.id).

-- ─────────────────────────────────────────────────────────────────────
-- Tabelle
-- ─────────────────────────────────────────────────────────────────────

create table if not exists klient_termin (
  id            text         primary key,
  klient_id     text         not null,
  datum         date         not null,
  uhrzeit       text         not null check (uhrzeit ~ '^[0-2][0-9]:[0-5][0-9]$'),
  dauer_min     smallint     not null check (dauer_min between 5 and 480),
  beruf         text         not null check (beruf in (
                  'pflege', 'arzt', 'therapie', 'apotheke',
                  'medizintechnik', 'begleitung', 'bestatter',
                  'sozial', 'ehrenamt', 'kueche', 'hauswirtschaft'
                )),
  titel         text         not null check (length(titel) between 1 and 200),
  person        text         not null,
  ort           text         not null,
  was_passiert  text         not null,
  status        text         not null default 'geplant' check (status in (
                  'geplant', 'laeuft', 'erledigt', 'verschoben', 'abgesagt'
                )),
  link_cockpit  text,
  durchgefuehrt_von text,                        -- für Audit nach status='erledigt'
  durchgefuehrt_am  timestamptz,
  abgesagt_grund    text,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

comment on table klient_termin is 'Wochen-Termine je Klient:in · Brücke zu klient_wunsch über termin_id · DSGVO Art. 4 + DNQP-Pflegeprozess.';

create index if not exists klient_termin_klient_datum  on klient_termin (klient_id, datum, uhrzeit);
create index if not exists klient_termin_status        on klient_termin (status, datum);
create index if not exists klient_termin_beruf         on klient_termin (beruf);

drop trigger if exists klient_termin_touch_updated_trigger on klient_termin;
create trigger klient_termin_touch_updated_trigger
  before update on klient_termin
  for each row execute function swap_offer_touch_updated();

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table klient_termin enable row level security;

-- Klient:in selbst sieht ihre Termine
drop policy if exists "klient_termin_klient_self_select" on klient_termin;
create policy "klient_termin_klient_self_select"
  on klient_termin for select
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()));

-- Care-Team-Mitglied sieht Termine ihrer Klient:innen
drop policy if exists "klient_termin_care_team_select" on klient_termin;
create policy "klient_termin_care_team_select"
  on klient_termin for select
  using (
    klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- Care-Team-Mitglied des relevanten Berufs darf den Termin anlegen + ändern
-- (z.B. Therapeut:in legt Therapie-Termin an, Pflegekraft Pflege-Termin)
drop policy if exists "klient_termin_beruf_write" on klient_termin;
create policy "klient_termin_beruf_write"
  on klient_termin for insert
  with check (
    exists (
      select 1 from care_team
      where user_id = auth.uid() and aktiv = true
        and klient_id = klient_termin.klient_id
        and beruf = klient_termin.beruf
    )
  );

drop policy if exists "klient_termin_beruf_update" on klient_termin;
create policy "klient_termin_beruf_update"
  on klient_termin for update
  using (
    exists (
      select 1 from care_team
      where user_id = auth.uid() and aktiv = true
        and klient_id = klient_termin.klient_id
        and beruf = klient_termin.beruf
    )
  );

-- Bevollmächtigte mit gesundheit-Aufgabenkreis dürfen lesen
drop policy if exists "klient_termin_bevollmaechtigter_select" on klient_termin;
create policy "klient_termin_bevollmaechtigter_select"
  on klient_termin for select
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

-- Klient:in selbst darf eigene Termine absagen/verschieben
-- (status-Wechsel nach 'abgesagt' oder 'verschoben')
drop policy if exists "klient_termin_klient_status_update" on klient_termin;
create policy "klient_termin_klient_status_update"
  on klient_termin for update
  using (klient_id in (select klient_id from profiles where user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────
-- Realtime — die Live-Wochen-Sicht profitiert massiv davon
-- ─────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table klient_termin;
alter table klient_termin replica identity full;

-- ─────────────────────────────────────────────────────────────────────
-- Idempotenter Demo-Seed · 16 Termine für Helga (entspricht KLIENT_WOCHE)
-- ─────────────────────────────────────────────────────────────────────

insert into klient_termin (id, klient_id, datum, uhrzeit, dauer_min, beruf, titel, person, ort, was_passiert, status, link_cockpit)
select * from (values
  ('kw-001', 'klient-hr', current_date, '07:30', 25, 'pflege',         'Morgen-Pflege · Körperwäsche + Anziehen',          'Maria Klein (PFK)',           'in Zimmer 102',           'Beruhigt waschen, Lavendel-Lotion auf Schultern, Kompressionsstrumpf links anlegen', 'erledigt', '/pflege/heute'),
  ('kw-002', 'klient-hr', current_date, '09:30', 45, 'therapie',       'MLD + Kompression · linkes Bein',                 'Sebastian Rauer (Physio)',     'in Zimmer 102',           'Manuelle Lymphdrainage 30 min, danach Kompressionsbinde frisch wickeln',           'geplant',  '/therapie/patienten'),
  ('kw-003', 'klient-hr', current_date, '11:00', 30, 'begleitung',     'Berkana-Berührung · Schulter + Hand',              'Marlene Voss (Würde-Begleitung)','in Zimmer 102',         '30 min Hand- und Schulterhalten, leise Brahms-Schlaflied im Hintergrund',           'geplant',  '/begleitung/repertoire'),
  ('kw-004', 'klient-hr', current_date, '12:30', 30, 'kueche',         'Mittagessen · Wunschkost',                         'Küche Pulmologie',             'im Zimmer / Tablett',     'Kartoffelsuppe + Apfelmus · weich, da Kau-Erschöpfung',                              'geplant',  '/lebensmittel'),
  ('kw-005', 'klient-hr', current_date, '16:00', 45, 'ehrenamt',       'Hospiz-Stunde · Vorlesen Lieblings-Roman',         'Rita Schöndorf (Hospiz-Verein)','in Zimmer 102',          'Vorlesen Buddenbrooks Kapitel 4-5 · Tee + ruhige Musik',                            'geplant',  '/ehrenamt'),
  ('kw-101', 'klient-hr', current_date + 1, '08:30', 30, 'arzt',        'Visite · Hausarzt',                                'Dr. Susanne Hartmann',          'in Zimmer 102',           'INR-Wert besprechen, Marcumar anpassen, Atmung auskultieren',                      'geplant',  '/arzt/heute'),
  ('kw-102', 'klient-hr', current_date + 1, '14:00', 60, 'therapie',    'KG-Mobilisation · LWS',                            'Sebastian Rauer (Physio)',      'in Therapieraum 1',       'Bewegungserweiterung LWS, Stabilität M. multifidus, ROM-Reeval',                   'geplant',  '/therapie/patienten'),
  ('kw-201', 'klient-hr', current_date + 2, '10:00', 30, 'apotheke',    'Wochenverblisterung Lieferung + Stellplan-Check',  'Lukas Faber (Apothekenleitung)','Übergabe an Pflege',     'Neue Wochen-Blister mit Tilidin/Spiriva/Citalopram · AMTS-Check geprüft',          'geplant',  '/apotheke/heimversorgung'),
  ('kw-202', 'klient-hr', current_date + 2, '11:30', 20, 'begleitung',  'Berkana-Berührung · Hand',                         'Marlene Voss',                  'in Zimmer 102',           '20 min Hand-Halten, schweigen oder leichtes Erzählen',                              'geplant',  '/begleitung/repertoire'),
  ('kw-301', 'klient-hr', current_date + 3, '09:00', 60, 'medizintechnik','Wartung Pflegebett Burmeier · Funktionsprüfung', 'MEDsupply Nord-Werkstatt',      'in Zimmer 102',           'Halbjährliche STK-Funktionsprüfung · Liftmotor + Handterminal',                    'geplant',  '/medizintechnik/wartung'),
  ('kw-302', 'klient-hr', current_date + 3, '13:00', 30, 'sozial',      'Hilfeplan-Gespräch · Pflegegrad-Überprüfung',      'Aysha Kamal (Sozialarbeit)',    'in Zimmer 102',           'PG 4 Aktualisierung · Hilfsmittelbedarf neu erfassen, Tochter dabei',              'geplant',  '/sozial/hilfeplan'),
  ('kw-401', 'klient-hr', current_date + 4, '15:00', 90, 'bestatter',   'Vorsorge-Gespräch · Erdbestattung Familiengrab',   'Hannah Mainberg (Bestatterin)', 'im Wohnzimmer (Hausbesuch)','Wünsche durchgehen: Familiengrab St. Lukas, einfacher Holzsarg, Brahms am Grab',  'geplant',  '/bestatter/bestattungsarten'),
  ('kw-501', 'klient-hr', current_date + 5, '11:00', 45, 'ehrenamt',    'Hospiz-Stunde · Vorlesen + Spaziergang',           'Rita Schöndorf',                'im Garten + Zimmer',      'Falls Wetter mild: Rollstuhl in den Garten · sonst weiter Buddenbrooks',           'geplant',  '/ehrenamt'),
  ('kw-502', 'klient-hr', current_date + 5, '16:30', 25, 'pflege',      'Wundkontrolle · Sakrum',                            'Maria Klein (PFK)',             'in Zimmer 102',           'Wundverband wechseln · Polihexanid-Spülung · Foto-Doku',                            'geplant',  '/pflege/wunde'),
  ('kw-601', 'klient-hr', current_date + 6, '10:00', 30, 'begleitung',  'Berkana-Berührung · Hand + Schulter',              'Marlene Voss',                  'in Zimmer 102',           '30 min Halten, evtl. mit Aroma-Lavendel-Tropfen',                                   'geplant',  '/begleitung/repertoire')
) as v (id, klient_id, datum, uhrzeit, dauer_min, beruf, titel, person, ort, was_passiert, status, link_cockpit)
where not exists (select 1 from klient_termin where klient_id = 'klient-hr');
