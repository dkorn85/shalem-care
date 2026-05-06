"use client";

// MessageItemLive · Wie MessageItem, aber Reactions kommen aus Realtime-State,
// Toggle ruft Server-Round-Trip via toggleReaction().

import Link from "next/link";
import { tokenizeBody, type Message } from "@/lib/messenger/store";
import { loescheMessage } from "@/lib/messenger/actions";
import { VoicemailPlayer } from "@/components/VoicemailPlayer";
import { ReactionsBar } from "@/components/MessengerShell";
import {
  type ReactionCount,
  toggleReaction,
} from "@/lib/messenger/realtime";
import { useState, useTransition } from "react";

export function MessageItemLive({
  m,
  aktiverUserId,
  reactions,
}: {
  m: Message;
  aktiverUserId: string;
  reactions: ReactionCount[];
}) {
  const [pending, start] = useTransition();
  const [showThread, setShowThread] = useState(false);
  const tokens = tokenizeBody(m.body);
  const eigene = m.von_user_id === aktiverUserId;
  const datum = new Date(m.created_at);

  const onToggleReaction = (emoji: string) => {
    void toggleReaction(m.id, emoji);
  };

  return (
    <li className="surface rounded-xl p-3 relative overflow-hidden" style={eigene ? { background: "rgb(var(--accent) / 0.04)" } : undefined}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1.5">
        <span className="text-[11px] font-medium font-mono text-soft">
          {m.von_user_id.slice(0, 8)}{eigene && " · du"}
        </span>
        {m.klient_id && (
          <Link href={`/messenger?channel=${m.klient_id}`} className="chip text-[10px]" style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}>
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
              <Link key={i} href={`/messenger?channel=${t.id}`}
                className="font-mono text-[12px] px-1 rounded hover:underline"
                style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}
              >
                @{t.id}
              </Link>
            );
          }
          if (t.typ === "hashtag") {
            return (
              <Link key={i} href={`/messenger?channel=${t.tag}`}
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

      {/* Reactions · live aus DB */}
      <ReactionsBar
        reactions={reactions.map((r) => ({ emoji: r.emoji, count: r.count, hatIchReagiert: r.has_self }))}
        onToggle={onToggleReaction}
      />

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

      {showThread && (
        <div className="mt-2 ml-3 pl-3 border-l-2" style={{ borderColor: "rgb(var(--accent) / 0.25)" }}>
          <p className="text-[10px] text-soft italic">
            Phase 2: Thread-Antworten via parent_id-Spalte (Schema vorhanden) · Realtime-Stream aktiv.
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
