"use client";

// Message-Item · rendert eine einzelne Message mit token-basiertem Body
// (klickbare @-Mentions + #-Hashtags) und Anhängen.

import Link from "next/link";
import { tokenizeBody, type Message } from "@/lib/messenger/store";
import { loescheMessage } from "@/lib/messenger/actions";
import { VoicemailPlayer } from "@/components/VoicemailPlayer";
import { ReactionsBar } from "@/components/MessengerShell";
import type { Reaction } from "@/lib/messenger/channels";
import { useState, useTransition } from "react";

function pseudoReactions(id: string): Reaction[] {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const emojis = ["👍", "✓", "🙏", "❤"];
  const out: Reaction[] = [];
  for (let i = 0; i < 2; i++) {
    if ((h >> (i * 4)) & 1) {
      out.push({
        emoji: emojis[(h >> (i * 8)) % emojis.length],
        count: 1 + ((h >> (i * 12)) % 4),
        hatIchReagiert: (h >> (i * 16)) & 1 ? true : false,
      });
    }
  }
  return out;
}

export function MessageItem({ m, aktiverUserId }: { m: Message; aktiverUserId: string }) {
  const [pending, start] = useTransition();
  const [reactions, setReactions] = useState<Reaction[]>(() => pseudoReactions(m.id));
  const [showThread, setShowThread] = useState(false);
  const tokens = tokenizeBody(m.body);
  const eigene = m.von_user_id === aktiverUserId;
  const datum = new Date(m.created_at);

  const toggleReaction = (emoji: string) => {
    setReactions((rs) => {
      const existing = rs.find((r) => r.emoji === emoji);
      if (existing) {
        if (existing.hatIchReagiert) {
          const next = existing.count - 1;
          return next > 0
            ? rs.map((r) => (r.emoji === emoji ? { ...r, count: next, hatIchReagiert: false } : r))
            : rs.filter((r) => r.emoji !== emoji);
        }
        return rs.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, hatIchReagiert: true } : r));
      }
      return [...rs, { emoji, count: 1, hatIchReagiert: true }];
    });
  };

  return (
    <li className="surface rounded-xl p-3 relative overflow-hidden" style={eigene ? { background: "rgb(var(--accent) / 0.04)" } : undefined}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1.5">
        <span className="text-[11px] font-medium font-mono text-soft">
          {m.von_user_id.slice(0, 8)}{eigene && " · du"}
        </span>
        {m.klient_id && (
          <Link href={`/messenger?klient=${m.klient_id}`} className="chip text-[10px]" style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}>
            Klient: {m.klient_id}
          </Link>
        )}
        <span className="text-[10px] text-soft font-mono ml-auto">
          {datum.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        </span>
      </header>

      <div className="text-[13px] leading-relaxed">
        {tokens.map((t, i) => {
          if (t.typ === "text") return <span key={i}>{t.text}</span>;
          if (t.typ === "mention") {
            return (
              <Link key={i} href={`/messenger?mention=${t.id}`}
                className="font-mono text-[12px] px-1 rounded hover:underline"
                style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}
              >
                @{t.id}
              </Link>
            );
          }
          if (t.typ === "hashtag") {
            return (
              <Link key={i} href={`/messenger?tag=${t.tag}`}
                className="font-mono text-[12px] px-1 rounded hover:underline"
                style={{ background: "rgb(var(--vibe-stats) / 0.15)", color: "rgb(var(--vibe-stats))" }}
              >
                #{t.tag}
              </Link>
            );
          }
          return null;
        })}
      </div>

      {m.attachment_url && (
        <div className="mt-2 surface-mute rounded p-2 text-[12px] flex items-baseline justify-between gap-2 flex-wrap">
          <span>📎 {m.attachment_name ?? m.attachment_url}</span>
          <span className="text-[10px] text-soft font-mono">{m.attachment_url}</span>
        </div>
      )}

      {m.voicemail_url && (
        <VoicemailPlayer src={m.voicemail_url} dauerSec={m.voicemail_dauer_sec} />
      )}

      {/* Reactions */}
      <ReactionsBar reactions={reactions} onToggle={toggleReaction} />

      <footer className="mt-1.5 flex items-baseline gap-2 flex-wrap text-[10px] text-soft">
        {m.mentions.length > 0 && <span>{m.mentions.length} @-Mention{m.mentions.length > 1 ? "s" : ""}</span>}
        {m.hashtags.length > 0 && <span>· {m.hashtags.length} #Tag{m.hashtags.length > 1 ? "s" : ""}</span>}
        <button
          type="button"
          onClick={() => setShowThread(!showThread)}
          className="hover:text-[rgb(var(--accent))] transition-colors"
        >
          {showThread ? "▾ Thread" : "↳ Antworten"}
        </button>
        {eigene && (
          <button
            type="button"
            disabled={pending}
            onClick={() => start(() => loescheMessage(m.id))}
            className="ml-auto text-[10px] hover:text-[rgb(var(--mon))] transition-colors disabled:opacity-50"
          >
            löschen
          </button>
        )}
      </footer>

      {/* Thread-Stub */}
      {showThread && (
        <div className="mt-2 ml-3 pl-3 border-l-2" style={{ borderColor: "rgb(var(--accent) / 0.25)" }}>
          <p className="text-[10px] text-soft italic">
            Phase 2: Thread-Antworten via parent_id-Spalte (Schema vorhanden) · Realtime-Stream über Supabase-Channel.
          </p>
          <input
            type="text"
            placeholder="Antwort schreiben…"
            className="mt-1.5 w-full px-2 py-1 rounded text-[12px] surface-mute border-0 focus:outline-none"
            style={{ outline: "none" }}
            disabled
          />
        </div>
      )}
    </li>
  );
}
