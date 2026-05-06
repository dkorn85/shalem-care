"use client";

import { useState, useTransition } from "react";
import { genehmigeClaim, lehneClaimAb, pruefeClaim } from "@/lib/solidartopf/actions";

export function SolidarClaimAktion({
  claimId,
  status,
  pruefer,
}: {
  claimId: string;
  status: "entwurf" | "eingereicht" | "geprueft" | "ausgezahlt" | "abgelehnt";
  pruefer: string;
}) {
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [grund, setGrund] = useState("");
  const [ablehnen, setAblehnen] = useState(false);

  const klick = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      setFeedback({ ok: r.ok, msg: r.ok ? "ok" : (r.error ?? "Fehler") });
    });

  if (status === "ausgezahlt" || status === "abgelehnt") {
    return <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{status}</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "eingereicht" && (
        <button
          onClick={() => klick(() => pruefeClaim(claimId, pruefer))}
          disabled={pending}
          className="text-[12px] px-3 py-1.5 rounded-md"
          style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}
        >
          Prüfen
        </button>
      )}
      <button
        onClick={() => klick(() => genehmigeClaim(claimId, pruefer))}
        disabled={pending}
        className="text-[12px] px-3 py-1.5 rounded-md"
        style={{ background: "rgb(var(--thu))", color: "white", opacity: pending ? 0.6 : 1 }}
      >
        Auszahlen
      </button>
      {!ablehnen ? (
        <button
          onClick={() => setAblehnen(true)}
          disabled={pending}
          className="text-[12px] px-3 py-1.5 rounded-md"
          style={{ background: "transparent", color: "rgb(var(--mon))", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.4)" }}
        >
          Ablehnen
        </button>
      ) : (
        <span className="flex items-center gap-1.5">
          <input
            value={grund} onChange={(e) => setGrund(e.target.value)}
            placeholder="Grund (min. 10 Zeichen)"
            className="input text-[12px] w-48 py-1"
            disabled={pending}
          />
          <button
            onClick={() => klick(() => lehneClaimAb(claimId, pruefer, grund))}
            disabled={pending || grund.trim().length < 10}
            className="text-[12px] px-2 py-1.5 rounded-md"
            style={{ background: "rgb(var(--mon))", color: "white" }}
          >
            ✕
          </button>
        </span>
      )}
      {feedback && (
        <span aria-live="polite" className="text-[11px]" style={{ color: feedback.ok ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
          {feedback.ok ? "Erledigt" : feedback.msg}
        </span>
      )}
    </div>
  );
}
