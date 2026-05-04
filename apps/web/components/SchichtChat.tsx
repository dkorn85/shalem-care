"use client";

import Link from "next/link";
import { useState, useTransition, useEffect, useRef } from "react";
import { sendChatMessage, reactToMessage, fetchMessages, generateCoachSuggestion } from "@/lib/chat/actions";
import { CHATTYP_FARBE, CHATTYP_LABEL } from "@/lib/chat/types";
import type { ChatMessage } from "@/lib/chat/types";

const SEV_FARBE: Record<string, string> = {
  info:      "var(--vibe-team)",
  wichtig:   "var(--fri)",
  kritisch:  "var(--mon)",
};

export function SchichtChat({
  channelId,
  channelName,
  personId,
  personName,
  initial,
}: {
  channelId: string;
  channelName: string;
  personId: string;
  personName: string;
  initial: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [coachPending, startCoach] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-Refresh alle 8 s — Live-Update light
  useEffect(() => {
    const t = setInterval(async () => {
      const m = await fetchMessages(channelId);
      setMessages(m);
    }, 8000);
    return () => clearInterval(t);
  }, [channelId]);

  // Auto-Scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    if (!text.trim()) return;
    start(async () => {
      const r = await sendChatMessage({
        channelId,
        authorId: personId,
        authorName: personName,
        text,
      });
      if (r.ok) {
        setMessages((m) => [...m, r.message]);
        setText("");
      }
    });
  };

  const askCoach = () => {
    startCoach(async () => {
      const r = await generateCoachSuggestion(channelId, channelName);
      if (r.ok) setMessages((m) => [...m, r.message]);
    });
  };

  const react = (id: string, emoji: string) => {
    start(async () => {
      await reactToMessage(id, personId, emoji);
      const m = await fetchMessages(channelId);
      setMessages(m);
    });
  };

  return (
    <section className="surface rounded-2xl flex flex-col anim-slideUp" style={{ height: "min(640px, 78vh)" }}>
      <header className="flex items-baseline justify-between gap-3 p-4 sm:p-5 border-b border-app-soft flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Schicht-Chat</p>
          <h3 className="font-display text-[16px] font-semibold tracking-tight2 mt-0.5">{channelName}</h3>
        </div>
        <button
          onClick={askCoach}
          disabled={coachPending}
          className="btn btn-ghost text-[12px]"
        >
          {coachPending ? "..." : "✨ KI-Vorschlag"}
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.length === 0 ? (
          <p className="text-[12px] text-soft">Noch keine Nachrichten — Schreib der Schicht hallo.</p>
        ) : (
          messages.map((m) => <ChatRow key={m.id} m={m} self={m.authorId === personId} onReact={react} />)
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-end gap-2 p-3 border-t border-app-soft"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          placeholder="An die Schicht schreiben…"
          className="textarea text-[13px] flex-1 resize-none min-h-[40px] max-h-[120px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="submit" disabled={pending || !text.trim()} className="btn btn-primary text-[12px]">
          {pending ? "..." : "Senden"}
        </button>
      </form>
    </section>
  );
}

function ChatRow({
  m,
  self,
  onReact,
}: {
  m: ChatMessage;
  self: boolean;
  onReact: (id: string, emoji: string) => void;
}) {
  const farbe = m.type === "ai_suggestion" && m.aiSeverity
    ? SEV_FARBE[m.aiSeverity]
    : CHATTYP_FARBE[m.type];

  if (m.type === "user") {
    return (
      <div className={`flex gap-2 ${self ? "flex-row-reverse" : ""}`}>
        <div
          className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-semibold text-white shrink-0"
          style={{ background: "linear-gradient(135deg, rgb(var(--mon)), rgb(var(--thu)))" }}
        >
          {(m.authorName ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className={`max-w-[80%] ${self ? "items-end" : "items-start"} flex flex-col`}>
          <div
            className="rounded-2xl px-3 py-2 text-[13px] leading-snug"
            style={{
              background: self ? "rgb(var(--vibe-team) / 0.15)" : "rgb(var(--bg-mute))",
              color: "rgb(var(--fg))",
            }}
          >
            {!self && <div className="text-[11px] font-medium text-mute mb-0.5">{m.authorName}</div>}
            {m.text}
          </div>
          <div className="text-[10px] text-soft font-mono mt-0.5 px-1">
            {new Date(m.postedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    );
  }

  // System / Doku / Vergabe / AI
  return (
    <div className="surface-mute rounded-xl p-3 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5">
        <div className="flex items-baseline gap-2 flex-wrap mb-1">
          <span className="chip text-[10px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
            {m.type === "ai_suggestion" && m.aiSeverity ? `KI · ${m.aiSeverity}` : CHATTYP_LABEL[m.type]}
          </span>
          <span className="text-[10px] text-soft font-mono">
            {new Date(m.postedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="text-[13px] leading-snug">{m.text}</p>
        {(m.klientId || m.dokuId) && (
          <div className="mt-1.5 flex gap-2 flex-wrap text-[11px]">
            {m.klientId && (
              <Link
                href={`/dienst/${m.klientId}${m.dokuId ? `?date=${(m as any).postedAt?.slice(0, 10)}` : ""}`}
                className="text-mute hover:text-[rgb(var(--fg))]"
              >
                → Klient öffnen
              </Link>
            )}
          </div>
        )}
        {/* Reaktionen */}
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          {Object.entries(m.reactions ?? {}).map(([emoji, ppl]) => (
            <button
              key={emoji}
              onClick={() => onReact(m.id, emoji)}
              className="chip text-[11px] surface-hover"
            >
              {emoji} {ppl.length}
            </button>
          ))}
          <button
            onClick={() => onReact(m.id, "👍")}
            className="text-[11px] text-soft hover:text-[rgb(var(--fg))] px-1"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
