"use client";

// Apple-Style Toast-Stack — oben mittig, glasige Pille mit Icon, Title,
// Body. Slide-in von oben mit Spring-Easing, Hover pausiert Auto-Dismiss
// (Phase 2). Klick öffnet href falls da, sonst dismisst.

import Link from "next/link";
import { useNotifyQueue, type NotifyArt, type NotifyEvent } from "@/lib/notify/notify";

const ART_FARBE: Record<NotifyArt, string> = {
  info:    "var(--vibe-team)",
  erfolg:  "var(--thu)",
  warnung: "var(--vibe-approval)",
  fehler:  "var(--mon)",
  lana:    "var(--accent)",
};

const ART_GLYPH: Record<NotifyArt, string> = {
  info:    "ⓘ",
  erfolg:  "✓",
  warnung: "⚠",
  fehler:  "✕",
  lana:    "✦",
};

export function NotifyToastStack() {
  const queue = useNotifyQueue();
  if (queue.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 px-3 w-full max-w-sm pointer-events-none"
    >
      {queue.map((n) => (
        <ToastPill key={n.id} n={n} />
      ))}
    </div>
  );
}

function ToastPill({ n }: { n: NotifyEvent }) {
  const farbe = ART_FARBE[n.art];
  const glyph = ART_GLYPH[n.art];

  const inner = (
    <div
      className="rounded-2xl pointer-events-auto flex items-start gap-3 p-3 anim-toast-in"
      style={{
        background: "rgb(var(--bg-elev) / 0.82)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        boxShadow:
          "0 1px 0 rgb(255 255 255 / 0.06) inset, " +
          "0 12px 32px rgb(0 0 0 / 0.18), " +
          "0 0 0 1px rgb(var(--border-soft))",
      }}
    >
      <span
        aria-hidden
        className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-[14px] font-bold mt-px"
        style={{ background: `rgb(${farbe} / 0.18)`, color: `rgb(${farbe})` }}
      >
        {glyph}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold leading-tight tracking-tight">{n.titel}</p>
        {n.beschreibung && (
          <p className="text-[12px] text-mute mt-0.5 leading-snug line-clamp-2">{n.beschreibung}</p>
        )}
      </div>
    </div>
  );

  if (n.href) {
    return <Link href={n.href}>{inner}</Link>;
  }
  return inner;
}
