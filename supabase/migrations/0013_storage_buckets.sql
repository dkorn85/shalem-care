-- Migration 0013 · Storage-Buckets + Policies
--
-- Drei neue private Buckets für hochsensible Klient-Dokumente:
--   · vollmacht-scans       → notariell beglaubigte Vorsorgevollmachten,
--                              Patientenverfügungen, Betreuungs-Beschlüsse
--   · identity-dokumente    → Personalausweis, Krankenversicherten-Karte,
--                              Pflegegrad-Bescheid (sensible Stamm-Doku)
--   · klient-akte           → freie Anhänge zur Klient-Akte (Foto-Doku
--                              Wunde, Pflegeplan-PDF, Lebensbuch-Audio)
--
-- Bucket `verifizierungen` (existiert bereits aus init_auth) bleibt
-- unangetastet — dort liegen User-Echtheits-Nachweise (Hauptamt-Vertrag,
-- Berufsausweise, etc.) für Mitarbeitende.
--
-- Pfad-Konvention: `<klient_id>/<dateityp>/<datei>` — z.B.
--   vollmacht-scans/klient-hr/vorsorge-2024/notar-schreiber.pdf
--   identity-dokumente/klient-hr/perso-vorderseite.jpg
--
-- RLS-Logik (über storage.objects-Policies):
--   · Klient:in selbst (über profiles.klient_id im Pfad-Prefix)
--   · Care-Team-Mitglied der Klient:in (lesen)
--   · Bevollmächtigte:r mit gesundheit-Aufgabenkreis (lesen + schreiben
--     auf vollmacht-scans, lesen auf andere)
--   · service_role bleibt allmächtig

-- ─────────────────────────────────────────────────────────────────────
-- Buckets anlegen (idempotent)
-- ─────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vollmacht-scans',     'vollmacht-scans',     false, 20971520, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('identity-dokumente',  'identity-dokumente',  false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('klient-akte',         'klient-akte',         false, 52428800, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', 'audio/wav'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ─────────────────────────────────────────────────────────────────────
-- Helper · Klient-ID aus Pfad extrahieren
-- ─────────────────────────────────────────────────────────────────────

create or replace function storage_klient_id_from_path(object_name text) returns text
language sql immutable
as $$
  select split_part(object_name, '/', 1);
$$;

comment on function storage_klient_id_from_path is 'Extrahiert klient_id aus Storage-Pfad-Prefix (z.B. "klient-hr/perso.jpg" → "klient-hr").';

-- ─────────────────────────────────────────────────────────────────────
-- Policies · vollmacht-scans
--
-- Klient:in selbst + Bevollmächtigte mit gesundheit dürfen lesen +
-- schreiben (= Vollmacht hochladen). Care-Team mit beruf 'sozial' oder
-- 'pflege' darf zumindest lesen (für Notfall-Aktion).
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "vollmacht_scans_klient_self" on storage.objects;
create policy "vollmacht_scans_klient_self"
  on storage.objects for all
  using (
    bucket_id = 'vollmacht-scans'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'vollmacht-scans'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "vollmacht_scans_bevollmaechtigter" on storage.objects;
create policy "vollmacht_scans_bevollmaechtigter"
  on storage.objects for all
  using (
    bucket_id = 'vollmacht-scans'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  )
  with check (
    bucket_id = 'vollmacht-scans'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  );

drop policy if exists "vollmacht_scans_care_team_select" on storage.objects;
create policy "vollmacht_scans_care_team_select"
  on storage.objects for select
  using (
    bucket_id = 'vollmacht-scans'
    and storage_klient_id_from_path(name) in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true and beruf in ('pflege', 'sozial')
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- Policies · identity-dokumente
--
-- Sehr restriktiv: nur Klient:in selbst + Bevollmächtigte. Care-Team
-- bekommt KEINEN Zugriff (Personalausweis-Scan ist nicht für Pflege
-- relevant — wenn doch, läuft das übers freie Klient-Akte-Bucket).
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "identity_dokumente_klient_self" on storage.objects;
create policy "identity_dokumente_klient_self"
  on storage.objects for all
  using (
    bucket_id = 'identity-dokumente'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'identity-dokumente'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "identity_dokumente_bevollmaechtigter" on storage.objects;
create policy "identity_dokumente_bevollmaechtigter"
  on storage.objects for all
  using (
    bucket_id = 'identity-dokumente'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  )
  with check (
    bucket_id = 'identity-dokumente'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  );

-- ─────────────────────────────────────────────────────────────────────
-- Policies · klient-akte (freie Anhänge)
--
-- Klient:in + Bevollmächtigte: alles. Care-Team: lesen + schreiben
-- (Pflegekraft kann Wunddoku-Foto hochladen, Therapeut Lebensbuch-Audio).
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "klient_akte_klient_self" on storage.objects;
create policy "klient_akte_klient_self"
  on storage.objects for all
  using (
    bucket_id = 'klient-akte'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'klient-akte'
    and storage_klient_id_from_path(name) in (
      select klient_id from profiles where user_id = auth.uid()
    )
  );

drop policy if exists "klient_akte_bevollmaechtigter" on storage.objects;
create policy "klient_akte_bevollmaechtigter"
  on storage.objects for all
  using (
    bucket_id = 'klient-akte'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  )
  with check (
    bucket_id = 'klient-akte'
    and darf_im_namen_handeln(storage_klient_id_from_path(name), 'gesundheit')
  );

drop policy if exists "klient_akte_care_team" on storage.objects;
create policy "klient_akte_care_team"
  on storage.objects for all
  using (
    bucket_id = 'klient-akte'
    and storage_klient_id_from_path(name) in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  )
  with check (
    bucket_id = 'klient-akte'
    and storage_klient_id_from_path(name) in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- audit_log Erweiterung · Storage-Zugriffe als 'storage'-Ressource
-- (Optional · Storage-Operationen können über audit_log getrackt
--  werden, wenn der Hybrid-Layer die ressource='storage' setzt.)
-- ─────────────────────────────────────────────────────────────────────

alter table audit_log
  drop constraint if exists audit_log_ressource_check;

alter table audit_log
  add constraint audit_log_ressource_check
  check (ressource in (
    'wunsch', 'wunsch-verlauf', 'pflegediagnose', 'pflegeplan',
    'belegung', 'kassen-vorgang', 'vollmacht', 'identity',
    'btm-buch', 'heimversorgung', 'sterbe-wache', 'team',
    'care-team', 'tausch-offer',
    'storage-vollmacht', 'storage-identity', 'storage-akte'
  ));
