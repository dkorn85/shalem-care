"use client";

// Aktions-Block der Tausch-Detail-Seite.
//
// Zeigt je nach State + Rolle die erlaubten Aktionen:
//  · open + nicht-Eigentümer  → Akzeptieren
//  · open + Eigentümer        → Zurückziehen
//  · matched + jeder           → Genehmigen / Ablehnen (PDL-Aktion, Demo-frei)
//  · matched + Eigentümer      → zusätzlich Zurückziehen
//
// Nutzt die bestehenden Server-Actions aus lib/swap-actions.ts.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptSwap, approveSwap, rejectSwap, withdrawSwap } from "@/lib/swap-actions";
import type { SwapState } from "@/lib/swap-machine";

export function TauschAktionen({
  offerId,
  state,
  istEigentuemer,
  istUebernehmer,
}: {
  offerId:        string;
  state:          SwapState;
  istEigentuemer: boolean;
  istUebernehmer: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [zeigtRejectInput, setZeigtRejectInput] = useState(false);

  function tu(fn: () => Promise<{ ok: true } | { ok: false; error: string }>, ok: string) {
    setFeedback(null);
    startTransition(async () => {
      const r = await fn();
      if (r.ok) {
        setFeedback("✓ " + ok);
        setZeigtRejectInput(false);
        router.refresh();
      } else {
        setFeedback("⚠ " + r.error);
      }
    });
  }

  // Welche Aktionen sind sichtbar?
  const kannAkzeptieren = state === "open" && !istEigentuemer;
  const kannGenehmigen  = state === "matched";
  const kannAblehnen    = state === "matched";
  const kannZurueckziehen = (state === "open" || state === "matched") && istEigentuemer;

  if (!kannAkzeptieren && !kannGenehmigen && !kannAblehnen && !kannZurueckziehen) {
    return (
      <section className="surface rounded-2xl p-4 mb-4 text-[12px] text-soft">
        <p className="text-[10px] uppercase tracking-wider font-mono mb-1">Aktionen</p>
        Dieser Vorgang ist abgeschlossen — keine weiteren Aktionen möglich.
      </section>
    );
  }

  return (
    <section className="surface rounded-2xl p-4 mb-4" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
      <p className="text-[10px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--accent))" }}>
        Was du tun kannst
      </p>

      <div className="flex flex-wrap gap-2">
        {kannAkzeptieren && (
          <button
            type="button"
            disabled={pending}
            onClick={() => tu(() => acceptSwap({ offerId }), "Tausch akzeptiert · wartet auf PDL.")}
            className="text-[12px] px-3 py-1.5 rounded-md font-medium"
            style={{ background: "rgb(var(--vibe-team))", color: "white" }}
          >
            ✓ Übernehmen
          </button>
        )}

        {kannGenehmigen && (
          <button
            type="button"
            disabled={pending}
            onClick={() => tu(() => approveSwap({ offerId }), "Tausch genehmigt.")}
            className="text-[12px] px-3 py-1.5 rounded-md font-medium"
            style={{ background: "rgb(var(--thu))", color: "white" }}
          >
            ✓ Als PDL genehmigen
          </button>
        )}

        {kannAblehnen && !zeigtRejectInput && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setZeigtRejectInput(true)}
            className="text-[12px] px-3 py-1.5 rounded-md font-medium"
            style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}
          >
            ✕ Ablehnen
          </button>
        )}

        {kannZurueckziehen && (
          <button
            type="button"
            disabled={pending}
            onClick={() => tu(() => withdrawSwap({ offerId }), "Tausch zurückgezogen.")}
            className="text-[12px] px-3 py-1.5 rounded-md font-medium ml-auto"
            style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
          >
            ⊘ Zurückziehen
          </button>
        )}
      </div>

      {zeigtRejectInput && (
        <div className="mt-3 surface-mute rounded-lg p-2.5">
          <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--mon))" }}>
            Begründung der Ablehnung
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="z.B. ArbZG-Konflikt · Quali fehlt · keine Vertretung"
            className="w-full bg-transparent text-[12px] p-1.5 rounded border outline-none resize-y"
            style={{ borderColor: "rgb(var(--bg-mute))" }}
          />
          <div className="flex items-baseline gap-2 mt-2">
            <button
              type="button"
              disabled={pending || !reason.trim()}
              onClick={() => tu(() => rejectSwap({ offerId, reason: reason.trim() }), "Tausch abgelehnt.")}
              className="text-[11px] px-2.5 py-1 rounded-md font-medium"
              style={{ background: "rgb(var(--mon))", color: "white" }}
            >
              {pending ? "speichert …" : "Ablehnung speichern"}
            </button>
            <button
              type="button"
              onClick={() => { setZeigtRejectInput(false); setReason(""); }}
              className="text-[11px] px-2.5 py-1 rounded-md text-mute"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p className="text-[11px] mt-2" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
          {feedback}
        </p>
      )}
    </section>
  );
}
