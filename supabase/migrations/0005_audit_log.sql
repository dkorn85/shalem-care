-- Migration 0005 · audit_log für Lese-Zugriffe
--
-- Befund #3 aus dem Expertenteam-Audit (docs/EXPERTENTEAM_EVALUIERUNG.md):
--   "Schreibe-Vorgänge sind im Verlauf getrackt, aber wer wann welchen
--    Wunsch / welche Diagnose / welchen BtM-Eintrag gesehen hat — fehlt.
--    DSGVO Art. 30 (Verzeichnis) braucht das."
--
-- Diese Migration legt eine zentrale audit_log-Tabelle an. Schreibt wird
-- nur via service_role (Server-Action). Klient:in kann ihre eigenen
-- Logs sehen (Transparenz-Recht). Mitarbeitende sehen nur ihre eigenen
-- Zugriffe (Selbst-Audit, Schutz vor Mobbing-Vorwürfen).

-- ─────────────────────────────────────────────────────────────────────
-- Tabelle
-- ─────────────────────────────────────────────────────────────────────

create table if not exists audit_log (
  id            bigserial    primary key,
  at            timestamptz  not null default now(),
  user_id       uuid         references auth.users(id) on delete set null,
  user_role     text,                                            -- 'pflege' | 'arzt' | 'therapie' | …
  user_name     text,                                            -- denormalisiert für Anzeige (auch wenn user gelöscht)
  klient_id     text         not null,
  ressource     text         not null check (ressource in (
                  'wunsch', 'wunsch-verlauf', 'pflegediagnose', 'pflegeplan',
                  'belegung', 'kassen-vorgang', 'vollmacht', 'identity',
                  'btm-buch', 'heimversorgung', 'sterbe-wache', 'team',
                  'care-team', 'tausch-offer'
                )),
  ressource_id  text,                                            -- konkrete ID der Ressource
  aktion        text         not null check (aktion in (
                  'read', 'list', 'write', 'update', 'delete', 'export', 'print'
                )),
  kontext       jsonb,                                           -- freie Metadaten (z.B. {"reason": "schichtbriefing"})
  ip_hash       text                                             -- pseudonymisierte IP (djb2 + salt)
);

comment on table audit_log is 'Lese- + Schreibe-Spur aller sensiblen Klient-Daten · DSGVO Art. 30 + Klient-Transparenz · nur service_role schreibt.';

create index if not exists audit_log_klient_at  on audit_log (klient_id, at desc);
create index if not exists audit_log_user_at    on audit_log (user_id, at desc) where user_id is not null;
create index if not exists audit_log_ressource  on audit_log (ressource, at desc);

-- ─────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────

alter table audit_log enable row level security;

-- 1. Klient:in selbst sieht alle Logs zu eigenen Daten (Transparenz!)
drop policy if exists "audit_log_klient_self_select" on audit_log;
create policy "audit_log_klient_self_select"
  on audit_log
  for select
  using (
    klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

-- 2. Bevollmächtigte:r mit Aufgabenkreis 'gesundheit' sieht ebenfalls
--    (verlangt darf_im_namen_handeln aus Migration 0004)
drop policy if exists "audit_log_bevollmaechtigter_select" on audit_log;
create policy "audit_log_bevollmaechtigter_select"
  on audit_log
  for select
  using (darf_im_namen_handeln(klient_id, 'gesundheit'));

-- 3. Mitarbeitende sehen ihre eigenen Zugriffe (Selbst-Audit)
drop policy if exists "audit_log_self_user_select" on audit_log;
create policy "audit_log_self_user_select"
  on audit_log
  for select
  using (user_id = auth.uid());

-- 4. INSERT/UPDATE/DELETE: nur service_role
--    (Supabase setzt für service_role implizit alle Policies aus,
--     für authenticated/anon ist ohne Policy default deny.)

-- ─────────────────────────────────────────────────────────────────────
-- Idempotenter Demo-Seed · ein paar Beispiel-Zugriffe für Helga
-- ─────────────────────────────────────────────────────────────────────

insert into audit_log (at, user_name, user_role, klient_id, ressource, ressource_id, aktion, kontext)
select * from (values
  (now() - interval '5 minutes',  'Dennis Reuter',         'pflege',     'klient-hr', 'wunsch',          null,        'list',  '{"reason":"schichtbeginn"}'::jsonb),
  (now() - interval '2 hours',    'Sebastian Rauer',        'therapie',   'klient-hr', 'wunsch',          'kw-002',    'read',  '{"reason":"vor MLD-Termin"}'::jsonb),
  (now() - interval '4 hours',    'Marlene Voss',           'begleitung', 'klient-hr', 'wunsch',          'kw-003',    'read',  '{"reason":"vor Berkana-Sitzung"}'::jsonb),
  (now() - interval '1 day',      'Lukas Faber',            'apotheke',   'klient-hr', 'wunsch',          'kw-201',    'read',  '{"reason":"verblisterung-check"}'::jsonb),
  (now() - interval '1 day 2 hours','Dr. Susanne Hartmann', 'arzt',       'klient-hr', 'pflegediagnose',  null,        'list',  '{"reason":"visite-vorbereitung"}'::jsonb),
  (now() - interval '2 days',     'Mira Wagner',            'sozial',     'klient-hr', 'kassen-vorgang',  'kv-2026-04','read',  '{"reason":"hilfeplan-update"}'::jsonb),
  (now() - interval '3 days',     'Helga Reinhardt selbst', 'klient',     'klient-hr', 'identity',        null,        'export','{"reason":"dsgvo-art-20"}'::jsonb)
) as v (at, user_name, user_role, klient_id, ressource, ressource_id, aktion, kontext)
where not exists (select 1 from audit_log where klient_id = 'klient-hr');
