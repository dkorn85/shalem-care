"use client";

import { useState, useTransition } from "react";
import { neuerTokenAction, widerrufeAction } from "@/lib/identity/actions";

export function IdentityVerwaltungActions({ id, status }: { id: string; status: "unbeansprucht" | "geclaimt" | "widerrufen" }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function neuerCode() {
    setFeedback(null);
    startTransition(async () => {
      const r = await neuerTokenAction(id);
      setFeedback(r.ok ? `✓ Neuer Code: ${r.data?.token}` : `⚠ ${r.error}`);
    });
  }

  function widerrufen() {
    if (!confirm("Claim widerrufen? Die Person verliert den Zugang, ein neuer Code wird erzeugt.")) return;
    setFeedback(null);
    startTransition(async () => {
      const r = await widerrufeAction(id);
      setFeedback(r.ok ? "✓ " + r.message : "⚠ " + r.error);
    });
  }

  return (
    <section className="surface rounded-2xl p-4" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL · Verwaltungs-Aktionen</p>
      <div className="flex gap-2 flex-wrap">
        {status !== "geclaimt" && (
          <button
            type="button" onClick={neuerCode} disabled={pending}
            className="text-[12px] px-3 py-1.5 rounded-md font-medium"
            style={{ background: "rgb(var(--vibe-approval) / 0.15)", color: "rgb(var(--vibe-approval))" }}
          >
            🔄 Neuen Code erzeugen
          </button>
        )}
        {status === "geclaimt" && (
          <button
            type="button" onClick={widerrufen} disabled={pending}
            className="text-[12px] px-3 py-1.5 rounded-md font-medium"
            style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}
          >
            ⊘ Claim widerrufen
          </button>
        )}
      </div>
      <p className="text-[11px] text-soft mt-2 italic">
        Neuer Code: alter Code wird sofort ungültig. Widerruf: Person verliert Profil-Zugang,
        z.B. bei Sterbefall oder Wechsel der Einrichtung.
      </p>
      {feedback && (
        <p className="text-[12px] mt-2 font-mono" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
          {feedback}
        </p>
      )}
    </section>
  );
}
