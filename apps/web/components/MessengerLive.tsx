"use client";

// MessengerLive · Client-Wrapper über MessengerShell mit echtem Realtime.
//
// Was passiert hier:
//   1. Initial-Messages aus Server (props) werden in lokalen State gehoben
//   2. subscribeMessages → INSERT/UPDATE/DELETE-Events werden live gemerged
//   3. fetchReactionCounts beim Mount + subscribeReactions für Live-Sync
//   4. subscribePresence → echte online-User werden statt Mock gerendert
//   5. subscribeTyping + broadcastTyping → Tipp-Indikator
//
// Das Server-Layout (MessengerShell) braucht keine Änderung — wir reichen
// nur die live-aktualisierten Daten als props rein.

import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { MessengerShell } from "./MessengerShell";
import { MessageItemLive } from "./MessageItemLive";
import type { Channel, ChannelKategorie, Presence } from "@/lib/messenger/channels";
import type { Message } from "@/lib/messenger/store";
import type { DmPartner } from "@/lib/messenger/dm";
import {
  type ReactionCount,
  type PresenceUser,
  type TypingEvent,
  subscribeMessages,
  subscribeReactions,
  fetchReactionCounts,
  subscribePresence,
  subscribeTyping,
  broadcastTyping,
} from "@/lib/messenger/realtime";

const TYPING_TTL_MS = 3500;

export type MessengerLiveProps = {
  channelsProKategorie: Record<ChannelKategorie, Channel[]>;
  aktiverChannel: Channel | null;
  initialMessages: Message[];
  /** Liste vom Server zur Mock-Ergänzung */
  initialPresenceMock: Presence[];
  serverMembers: number;
  composer: React.ReactNode;
  /** Echte registrierte User für 1:1-DM */
  dmPartners: DmPartner[];
  aktiverDmPartner: DmPartner | null;
  /** User-Identität */
  user: { id: string; displayName: string; rolle: string };
};

export function MessengerLive({
  channelsProKategorie,
  aktiverChannel,
  initialMessages,
  initialPresenceMock,
  serverMembers,
  composer,
  dmPartners,
  aktiverDmPartner,
  user,
}: MessengerLiveProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [livePresence, setLivePresence] = useState<PresenceUser[]>([]);
  const [typingNow, setTypingNow] = useState<TypingEvent[]>([]);
  const [, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Messages-Subscription ──────────────────────────────────
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!aktiverChannel && !aktiverDmPartner) return;
    const filter = aktiverDmPartner
      ? { dmPair: [user.id, aktiverDmPartner.user_id] as [string, string] }
      : aktiverChannel
        ? filterFor(aktiverChannel)
        : null;
    const dispose = subscribeMessages(filter, (event) => {
      startTransition(() => {
        setMessages((prev) => {
          if (event.type === "INSERT") {
            if (prev.some((m) => m.id === event.row.id)) return prev;
            return [...prev, event.row];
          }
          if (event.type === "UPDATE") {
            return prev.map((m) => (m.id === event.row.id ? event.row : m));
          }
          if (event.type === "DELETE") {
            return prev.filter((m) => m.id !== event.row.id);
          }
          return prev;
        });
      });
    });
    return dispose;
  }, [aktiverChannel?.id, aktiverDmPartner?.user_id, user.id]);

  // ─── Reactions: initial + subscribe ─────────────────────────
  useEffect(() => {
    if (messages.length === 0) {
      setReactions([]);
      return;
    }
    const ids = messages.map((m) => m.id);
    void fetchReactionCounts(ids).then(setReactions);
    const dispose = subscribeReactions(ids, (event) => {
      // Re-Fetch ist robuster als manuell zu mergen (auf has_self achten)
      void fetchReactionCounts(ids).then(setReactions);
    });
    return dispose;
  }, [messages.length, messages[messages.length - 1]?.id]);

  // ─── Presence-Subscription ──────────────────────────────────
  useEffect(() => {
    const me: PresenceUser = {
      user_id: user.id,
      display_name: user.displayName,
      rolle: user.rolle,
      status: "online",
      last_seen: new Date().toISOString(),
    };
    const dispose = subscribePresence(me, (users) => {
      setLivePresence(users);
    });
    return dispose;
  }, [user.id, user.displayName, user.rolle]);

  // ─── Typing-Subscription ────────────────────────────────────
  useEffect(() => {
    if (!aktiverChannel) return;
    const dispose = subscribeTyping(aktiverChannel.slug, (e) => {
      setTypingNow((prev) => {
        const filtered = prev.filter((p) => p.user_id !== e.user_id);
        return [...filtered, e];
      });
    });
    return dispose;
  }, [aktiverChannel?.slug]);

  // Typing TTL — Events nach 3.5s wieder entfernen
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTypingNow((prev) => prev.filter((p) => now - p.ts < TYPING_TTL_MS));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ─── Auto-Scroll bei neuer Message ──────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ─── Compose-Helper: typing broadcast ───────────────────────
  const onTyping = useCallback(() => {
    if (!aktiverChannel) return;
    broadcastTyping(aktiverChannel.slug, { user_id: user.id, display_name: user.displayName });
  }, [aktiverChannel?.slug, user.id, user.displayName]);

  // ─── Presence kombinieren: Live + Mock-Beispiele ────────────
  const presence: Presence[] = [
    ...livePresence.map((p) => ({
      personId: p.user_id,
      name: p.display_name,
      beruf: p.rolle,
      status: p.status as Presence["status"],
    })),
    ...initialPresenceMock.filter((mock) => !livePresence.some((live) => live.user_id === mock.personId)),
  ];

  // ─── DMs: echte registrierte User als Channels in DM-Kategorie ──
  const echteDmChannels: Channel[] = dmPartners.map((p) => ({
    id: `dm-real-${p.user_id}`,
    slug: `real:${p.user_id}`,
    name: p.display_name,
    kategorie: "dm" as const,
    beschreibung: p.haupt_rolle ? `Direkt-Chat · ${p.haupt_rolle}` : "Direkt-Chat · registrierter User",
    farbe: "var(--vibe-stats)",
    members: 2,
    privat: true,
    e2e_ready: true,
    ungelesen: p.unread_count,
  }));

  const erweiterteChannels = {
    ...channelsProKategorie,
    dm: [...echteDmChannels, ...channelsProKategorie.dm],
  };

  // Pseudo-Channel für aktiven DM-Partner damit Header korrekt rendert
  const dmAlsChannel: Channel | null = aktiverDmPartner
    ? {
        id: `dm-real-${aktiverDmPartner.user_id}`,
        slug: `real:${aktiverDmPartner.user_id}`,
        name: aktiverDmPartner.display_name,
        kategorie: "dm" as const,
        beschreibung: aktiverDmPartner.haupt_rolle ? `Direkt-Chat · ${aktiverDmPartner.haupt_rolle}` : "Direkt-Chat",
        farbe: "var(--vibe-stats)",
        members: 2,
        privat: true,
        e2e_ready: true,
      }
    : null;

  return (
    <>
      <MessengerShell
        channelsProKategorie={erweiterteChannels}
        aktiverChannel={aktiverChannel ?? dmAlsChannel}
        presence={presence}
        serverMembers={serverMembers + livePresence.length}
        composer={composerWithTyping(composer, onTyping)}
        dmHrefBuilder={(slug) => slug.startsWith("real:") ? `/messenger?dm=${slug.slice(5)}` : `/messenger?channel=${slug}`}
      >
        {messages.length === 0 && aktiverChannel ? (
          <ChannelWelcome channelName={aktiverChannel.name} kategorie={aktiverChannel.kategorie} beschreibung={aktiverChannel.beschreibung} />
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => (
              <MessageItemLive
                key={m.id}
                m={m}
                aktiverUserId={user.id}
                reactions={reactions.filter((r) => r.message_id === m.id)}
              />
            ))}
            <div ref={messagesEndRef} />
            {typingNow.length > 0 && (
              <li className="px-3 py-2 text-[11px] text-soft italic">
                {typingFormatieren(typingNow)} …
              </li>
            )}
          </ul>
        )}
      </MessengerShell>

      {/* Live-Status-Badge */}
      <div className="fixed bottom-4 right-4 z-30 surface rounded-full px-3 py-1.5 flex items-center gap-2" style={{ boxShadow: "0 8px 24px rgb(0 0 0 / 0.15)", inset: "0 0 0 1px rgb(var(--vibe-approval) / 0.3)" }}>
        <span aria-hidden className="w-2 h-2 rounded-full animate-pulse" style={{ background: "rgb(var(--vibe-approval))" }} />
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "rgb(var(--vibe-approval))" }}>
          live · {livePresence.length} online
        </span>
      </div>
    </>
  );
}

function ChannelWelcome({ channelName, kategorie, beschreibung }: { channelName: string; kategorie: string; beschreibung?: string }) {
  return (
    <section className="text-center py-12 px-4">
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">{kategorie}</p>
      <h2 className="font-display text-[28px] font-bold tracking-tight2 mb-2">
        Willkommen in <span className="rainbow-text">#{channelName}</span>
      </h2>
      {beschreibung && <p className="text-[13px] text-mute max-w-md mx-auto">{beschreibung}</p>}
      <p className="text-[11px] text-soft italic mt-4">
        Realtime-Layer aktiv · sobald jemand schreibt, erscheint die Nachricht hier ohne Reload.
      </p>
    </section>
  );
}

function filterFor(channel: Channel): { klientId?: string; hashtag?: string; mention?: string } | null {
  if (channel.kategorie === "klient") return { klientId: channel.slug };
  if (channel.kategorie === "prozess") return { hashtag: channel.slug };
  if (channel.kategorie === "dm") return { mention: channel.slug };
  if (channel.kategorie === "beruf") return { hashtag: `beruf-${channel.slug}` };
  return null;
}

function typingFormatieren(events: TypingEvent[]): string {
  if (events.length === 1) return `${events[0].display_name} tippt`;
  if (events.length === 2) return `${events[0].display_name} und ${events[1].display_name} tippen`;
  return `${events[0].display_name} und ${events.length - 1} weitere tippen`;
}

function composerWithTyping(composer: React.ReactNode, onTyping: () => void): React.ReactNode {
  // Wir umschließen den Composer mit einem div, das bei keystrokes typing broadcastet.
  // Das ist robust gegenüber dem inneren Server-Component, weil onKeyDown am Wrapper hängt.
  return (
    <div onKeyDown={onTyping}>
      {composer}
    </div>
  );
}
