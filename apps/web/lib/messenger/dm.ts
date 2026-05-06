// DM-Layer · echte 1:1-Konversation zwischen registrierten Usern.
//
// Anders als Mock-DM-Channels (Demo-Care-Team) nutzt dieser Layer die
// dm_participants-Spalte: ein sortiertes uuid-Tupel der zwei
// Gesprächspartner. RLS prüft, dass nur die zwei das lesen.

import type { Message } from "./store";

export type DmPartner = {
  user_id: string;
  display_name: string;
  initials: string | null;
  haupt_rolle: string | null;
  last_dm_at: string | null;
  last_dm_body: string | null;
  unread_count: number;
};

/** Sortiert zwei UUIDs alphabetisch — deterministisches dm_participants-Tupel. */
export function sortDmPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function isDm(m: Message): boolean {
  return Array.isArray(m.dm_participants) && m.dm_participants.length === 2;
}

export function dmOtherUser(m: Message, selfId: string): string | null {
  if (!isDm(m)) return null;
  const ps = m.dm_participants ?? [];
  return ps.find((id) => id !== selfId) ?? null;
}
