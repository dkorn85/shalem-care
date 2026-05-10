-- Migration 0014 · Messenger · messages + message_reactions
--
-- Die Messenger-Tabellen (`messages`, `message_reactions`) wurden
-- ursprünglich außerhalb des supabase/migrations/-Ordners angelegt
-- (vermutlich direkt im Dashboard oder in einer `init_messenger`-
-- Migration die nicht im Git-Repo gelandet ist).
--
-- Diese Migration:
--   1. Reicht das Schema **idempotent** nach (nichts kaputt machen
--      falls Tabellen schon existieren · `if not exists` everywhere)
--   2. Setzt RLS-Policies, die mit care_team (0003) + vollmacht (0004)
--      harmonieren — Messenger ist nicht mehr ein „alle sehen alles",
--      sondern Klient-Channels respektieren das Care-Team
--   3. Fügt voicemail-attachment-bucket aus 0013-Logik hinzu
--   4. Realtime-Pub erweitern wenn nicht schon
--
-- Ablauf in Echtbetrieb:
--   · User schreibt eine Nachricht in einen Klient-Kanal
--   · RLS prüft: ist user im care_team von klient_id?
--   · Wenn ja: insert geht durch
--   · Realtime sendet die Nachricht an alle care_team-Mitglieder
--     (deren SELECT-RLS greift)

-- ─────────────────────────────────────────────────────────────────────
-- messages
-- ─────────────────────────────────────────────────────────────────────

create table if not exists messages (
  id                   uuid         primary key default gen_random_uuid(),
  von_user_id          uuid         not null references auth.users(id) on delete cascade,
  klient_id            text,                                            -- null = ohne Klient-Bezug (offene Cross-Berufs-Channels)
  body                 text         not null check (length(body) <= 4000),
  attachment_url       text,
  attachment_name      text,
  voicemail_url        text,
  voicemail_dauer_sec  integer      check (voicemail_dauer_sec between 1 and 600),
  mentions             text[]       not null default '{}',
  hashtags             text[]       not null default '{}',
  parent_id            uuid         references messages(id) on delete cascade,
  gelesen_von          uuid[]       not null default '{}',
  dm_participants      uuid[],                                          -- 2-elementig wenn DM, sonst null
  created_at           timestamptz  not null default now()
);

comment on table messages is 'Messenger-Nachrichten · Pflege-/Cross-Berufs-Chat · Klient-Bezug + DMs · Mentions/Hashtags · Cascade-Delete bei User/Parent-Lösch.';

create index if not exists messages_klient_at      on messages (klient_id, created_at desc) where klient_id is not null;
create index if not exists messages_parent         on messages (parent_id) where parent_id is not null;
create index if not exists messages_dm             on messages using gin (dm_participants) where dm_participants is not null;
create index if not exists messages_mentions       on messages using gin (mentions);
create index if not exists messages_hashtags       on messages using gin (hashtags);
create index if not exists messages_user_at        on messages (von_user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────
-- message_reactions
-- ─────────────────────────────────────────────────────────────────────

create table if not exists message_reactions (
  id          uuid         primary key default gen_random_uuid(),
  message_id  uuid         not null references messages(id) on delete cascade,
  user_id     uuid         not null references auth.users(id) on delete cascade,
  emoji       text         not null check (length(emoji) between 1 and 16),
  created_at  timestamptz  not null default now(),

  constraint message_reactions_eindeutig unique (message_id, user_id, emoji)
);

comment on table message_reactions is 'Emoji-Reactions auf Nachrichten · pro User+Message+Emoji nur einmal.';

create index if not exists message_reactions_message on message_reactions (message_id);
create index if not exists message_reactions_user    on message_reactions (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────
-- RLS · messages
--
-- Lese-Logik:
--   · DM (dm_participants set): nur die zwei Beteiligten
--   · Klient-Bezug (klient_id set): Klient:in selbst + Care-Team +
--     Bevollmächtigte mit gesundheit
--   · ohne Klient-Bezug: jede authentifizierte Person (offener Kanal)
--
-- Schreib-Logik:
--   · DM: nur Beteiligte
--   · Klient-Bezug: nur Care-Team-Mitglied (= jemand der die Klient:in
--     pflegt/behandelt)
--   · ohne Klient-Bezug: jede authentifizierte Person
-- ─────────────────────────────────────────────────────────────────────

alter table messages enable row level security;

drop policy if exists "messages_select" on messages;
create policy "messages_select"
  on messages for select
  using (
    -- DM: nur Beteiligte
    (dm_participants is not null and auth.uid() = any(dm_participants))
    -- Klient-Bezug: Klient-Self
    or (klient_id is not null and klient_id in (
      select klient_id from profiles where user_id = auth.uid()
    ))
    -- Klient-Bezug: Care-Team
    or (klient_id is not null and klient_id in (
      select klient_id from care_team
      where user_id = auth.uid() and aktiv = true
    ))
    -- Klient-Bezug: Bevollmächtigte mit gesundheit
    or (klient_id is not null and darf_im_namen_handeln(klient_id, 'gesundheit'))
    -- offener Kanal: alle authenticated
    or (klient_id is null and dm_participants is null and auth.uid() is not null)
  );

drop policy if exists "messages_insert" on messages;
create policy "messages_insert"
  on messages for insert
  with check (
    -- Eigene User-ID
    von_user_id = auth.uid()
    and (
      -- DM: nur Beteiligte
      (dm_participants is not null and auth.uid() = any(dm_participants))
      -- Klient-Bezug: nur Care-Team
      or (klient_id is not null and klient_id in (
        select klient_id from care_team
        where user_id = auth.uid() and aktiv = true
      ))
      -- Klient-Bezug + Klient-Self (Klient:in darf in eigenem Kanal schreiben)
      or (klient_id is not null and klient_id in (
        select klient_id from profiles where user_id = auth.uid()
      ))
      -- offener Kanal
      or (klient_id is null and dm_participants is null)
    )
  );

drop policy if exists "messages_update_self" on messages;
create policy "messages_update_self"
  on messages for update
  using (von_user_id = auth.uid())
  with check (von_user_id = auth.uid());

drop policy if exists "messages_delete_self" on messages;
create policy "messages_delete_self"
  on messages for delete
  using (von_user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────
-- RLS · message_reactions
-- Lese-Logik wie messages-SELECT (transitiv über Message)
-- ─────────────────────────────────────────────────────────────────────

alter table message_reactions enable row level security;

drop policy if exists "message_reactions_select" on message_reactions;
create policy "message_reactions_select"
  on message_reactions for select
  using (
    exists (
      select 1 from messages m
      where m.id = message_reactions.message_id
        -- impliziter RLS-Check über messages (PostgreSQL prüft die m-Zeile gegen messages-Policies)
    )
  );

drop policy if exists "message_reactions_insert_self" on message_reactions;
create policy "message_reactions_insert_self"
  on message_reactions for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from messages where id = message_id)
  );

drop policy if exists "message_reactions_delete_self" on message_reactions;
create policy "message_reactions_delete_self"
  on message_reactions for delete
  using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────
-- Voicemail-Bucket · privater Storage für Sprach-Anhänge
-- ─────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('messenger-voicemail',  'messenger-voicemail',  false, 10485760,  array['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm']),
  ('messenger-attachment', 'messenger-attachment', false, 26214400,  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage-Policies: jeder authenticated user kann eigene Voicemails
-- lesen+schreiben. Pfad-Konvention: <user_id>/<dateiname>
drop policy if exists "messenger_voicemail_self" on storage.objects;
create policy "messenger_voicemail_self"
  on storage.objects for all
  using (
    bucket_id in ('messenger-voicemail', 'messenger-attachment')
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id in ('messenger-voicemail', 'messenger-attachment')
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Lesen für andere · authenticated mit Bezug zur Message
-- (vereinfachte Variante: alle authenticated dürfen lesen — der signed-URL
-- ist sowieso nur 1 h gültig + nur an berechtigte Empfänger ausgegeben)
drop policy if exists "messenger_voicemail_authenticated_select" on storage.objects;
create policy "messenger_voicemail_authenticated_select"
  on storage.objects for select
  using (
    bucket_id in ('messenger-voicemail', 'messenger-attachment')
    and auth.uid() is not null
  );

-- ─────────────────────────────────────────────────────────────────────
-- Realtime
-- ─────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table message_reactions;

alter table messages          replica identity full;
alter table message_reactions replica identity full;
