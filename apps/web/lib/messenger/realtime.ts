// Supabase-Realtime-Layer für den Messenger (Pfad B).
//
// Drei Channel-Typen:
//   - postgres_changes auf public.messages → live insert/update/delete
//   - postgres_changes auf public.message_reactions → reaction-counter sync
//   - presence-channel "messenger:online" → online/typing-State der User
//
// Latenz < 1 s · DSGVO-region eu-central-1 · keine 3rd-party.
//
// Phase 3: Care-Team-RLS pro Klient-Channel + Hash-Kette für Audit.

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { browserSupabase, isBrowserAuthConfigured } from "@/lib/auth/browser-client";
import type { Message } from "./store";

/**
 * Sicherer Browser-Client: liefert null wenn ENV-Vars nicht zur Build-Zeit
 * gesetzt waren. Verhindert Client-Side-Crash auf Hostinger, wo
 * NEXT_PUBLIC_SUPABASE_URL/ANON_KEY ggf. nicht propagiert wurden.
 *
 * Alle subscribe-/toggle-Funktionen prüfen das und werden zu No-Ops,
 * wenn kein Client verfügbar — Page rendert mit Server-Initial-State.
 */
function safeBrowserClient(): SupabaseClient | null {
  if (!isBrowserAuthConfigured()) return null;
  try {
    return browserSupabase();
  } catch {
    return null;
  }
}

export type ReactionRow = {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

export type ReactionCount = {
  message_id: string;
  emoji: string;
  count: number;
  has_self: boolean;
};

export type PresenceUser = {
  user_id: string;
  display_name: string;
  rolle: string;
  status: "online" | "im-dienst" | "abwesend";
  last_seen: string;
};

// ─── Messages-Subscribe ──────────────────────────────────────────

export type MessageChangeHandler = (event: { type: "INSERT" | "UPDATE" | "DELETE"; row: Message; oldRow?: Message }) => void;

/**
 * Abonniert messages-Tabelle mit optionalem Channel-Filter (klient_id oder
 * hashtag-Containment). Liefert dispose-Funktion zum Aufräumen.
 *
 * Filter-Logik wird client-seitig angewandt, weil postgres_changes-Filter
 * kein "contains array"-Operator hat.
 */
export function subscribeMessages(
  filter: {
    klientId?: string;
    hashtag?: string;
    mention?: string;
    dmPair?: [string, string];
  } | null,
  onChange: MessageChangeHandler,
): () => void {
  const supabase = safeBrowserClient();
  if (!supabase) return () => {};
  const channelName = `msgs:${filter?.dmPair?.join("-") ?? filter?.klientId ?? filter?.hashtag ?? filter?.mention ?? "all"}`;

  const channel: RealtimeChannel = supabase.channel(channelName);

  channel
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const row = payload.new as Message;
        if (passt(row, filter)) onChange({ type: "INSERT", row });
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "messages" },
      (payload) => {
        const row = payload.new as Message;
        const oldRow = payload.old as Message;
        if (passt(row, filter)) onChange({ type: "UPDATE", row, oldRow });
      },
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "messages" },
      (payload) => {
        const row = payload.old as Message;
        if (passt(row, filter)) onChange({ type: "DELETE", row });
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

function passt(row: Message, filter: { klientId?: string; hashtag?: string; mention?: string; dmPair?: [string, string] } | null): boolean {
  if (!filter) return true;
  if (filter.dmPair) {
    const ps = row.dm_participants ?? [];
    return ps.length === 2 && ps.includes(filter.dmPair[0]) && ps.includes(filter.dmPair[1]);
  }
  // Nicht-DM-Filter: DMs ausschließen
  if (row.dm_participants && row.dm_participants.length > 0) return false;
  if (filter.klientId && row.klient_id !== filter.klientId) return false;
  if (filter.hashtag && !row.hashtags?.includes(filter.hashtag)) return false;
  if (filter.mention && !row.mentions?.includes(filter.mention)) return false;
  return true;
}

// ─── Reactions-Subscribe ─────────────────────────────────────────

export type ReactionChangeHandler = (event: { type: "INSERT" | "DELETE"; row: ReactionRow }) => void;

export function subscribeReactions(messageIds: string[], onChange: ReactionChangeHandler): () => void {
  if (messageIds.length === 0) return () => {};
  const supabase = safeBrowserClient();
  if (!supabase) return () => {};
  const channel = supabase.channel(`reactions:${messageIds[0].slice(0, 8)}`);

  const ids = new Set(messageIds);

  channel
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "message_reactions" },
      (payload) => {
        const row = payload.new as ReactionRow;
        if (ids.has(row.message_id)) onChange({ type: "INSERT", row });
      },
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "message_reactions" },
      (payload) => {
        const row = payload.old as ReactionRow;
        if (ids.has(row.message_id)) onChange({ type: "DELETE", row });
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

// ─── Reaction Toggle ─────────────────────────────────────────────

export async function toggleReaction(messageId: string, emoji: string): Promise<{ ok: boolean; added: boolean; error?: string }> {
  const supabase = safeBrowserClient();
  if (!supabase) return { ok: false, added: false, error: "Realtime nicht konfiguriert (NEXT_PUBLIC_SUPABASE_URL fehlt im Build)." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, added: false, error: "Nicht eingeloggt" };

  // Erst prüfen, ob die Reaction schon existiert
  const { data: existing } = await supabase
    .from("message_reactions")
    .select("id")
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("message_reactions").delete().eq("id", existing.id);
    return { ok: !error, added: false, error: error?.message };
  } else {
    const { error } = await supabase.from("message_reactions").insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    });
    return { ok: !error, added: true, error: error?.message };
  }
}

export async function fetchReactionCounts(messageIds: string[]): Promise<ReactionCount[]> {
  if (messageIds.length === 0) return [];
  const supabase = safeBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("reactions_for_messages", { message_ids: messageIds });
  if (error || !data) return [];
  return data as ReactionCount[];
}

// ─── Presence-Channel ────────────────────────────────────────────

export type PresenceChangeHandler = (users: PresenceUser[]) => void;

export function subscribePresence(
  user: PresenceUser,
  onChange: PresenceChangeHandler,
): () => void {
  const supabase = safeBrowserClient();
  if (!supabase) return () => {};
  const channel = supabase.channel("messenger:online", {
    config: { presence: { key: user.user_id } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceUser>();
      const users: PresenceUser[] = [];
      for (const id of Object.keys(state)) {
        const list = state[id];
        if (list && list.length > 0) users.push(list[0]);
      }
      onChange(users);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track(user);
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}

// ─── Typing-Broadcast ────────────────────────────────────────────

export type TypingEvent = {
  channel_slug: string;
  user_id: string;
  display_name: string;
  ts: number;
};

export function broadcastTyping(channelSlug: string, user: { user_id: string; display_name: string }): () => void {
  const supabase = safeBrowserClient();
  if (!supabase) return () => {};
  const channel = supabase.channel(`typing:${channelSlug}`, {
    config: { broadcast: { self: false } },
  });

  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.send({
        type: "broadcast",
        event: "typing",
        payload: { ...user, channel_slug: channelSlug, ts: Date.now() } satisfies TypingEvent,
      });
    }
  });

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeTyping(channelSlug: string, onTyping: (e: TypingEvent) => void): () => void {
  const supabase = safeBrowserClient();
  if (!supabase) return () => {};
  const channel = supabase.channel(`typing:${channelSlug}`, {
    config: { broadcast: { self: false } },
  });
  channel
    .on("broadcast", { event: "typing" }, (msg) => {
      onTyping(msg.payload as TypingEvent);
    })
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
