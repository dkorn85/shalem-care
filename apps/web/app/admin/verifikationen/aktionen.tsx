"use client";

// Pruefer-Aktionen für eine einzelne Verifikation.
// Drei Knöpfe: "in Prüfung", "verifiziert", "abgelehnt" (mit Begründungs-Feld).

import { useState, useTransition } from "react";
import { setVerifikationStatus } from "@/lib/auth/verification-pruefen";

export function VerifikationsAktion({
  verificationId,
  aktuellerStatus,
}: {
  verificationId: string;
  aktuellerStatus: "eingereicht" | "in_pruefung";
}) {
  const [pending, start] = useTransition();
  const [showAblehnen, setShowAblehnen] = useState(false);
  const [grund, setGrund] = useState("");
  const [error, setError] = useState<string | null>(null);

  const set = (status: "in_pruefung" | "verifiziert" | "abgelehnt", ablehnungsGrund?: string) => {
    setError(null);
    start(async () => {
      const r = await setVerifikationStatus({ verificationId, status, ablehnungsGrund });
      if (!r.ok) setError(r.error);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {aktuellerStatus !== "in_pruefung" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => set("in_pruefung")}
            className="text-[11px] px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
            style={{ background: "rgb(var(--vibe-stats) / 0.15)", color: "rgb(var(--vibe-stats))" }}
          >
            In Prüfung nehmen
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => set("verifiziert")}
          className="text-[11px] px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
          style={{ background: "rgb(var(--thu) / 0.15)", color: "rgb(var(--thu))" }}
        >
          ✓ Verifizieren
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setShowAblehnen((s) => !s)}
          className="text-[11px] px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
          style={{
            background: "transparent",
            color: "rgb(var(--mon))",
            boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.3)",
          }}
        >
          {showAblehnen ? "Schließen" : "Ablehnen …"}
        </button>
      </div>

      {showAblehnen && (
        <div className="surface-mute rounded p-2 space-y-2">
          <textarea
            value={grund}
            onChange={(e) => setGrund(e.target.value)}
            placeholder="Begründung (an User sichtbar)"
            rows={2}
            className="w-full bg-transparent rounded p-2 text-[12px] resize-y focus:outline-none"
            style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.2)" }}
          />
          <button
            type="button"
            disabled={pending || grund.trim().length === 0}
            onClick={() => {
              set("abgelehnt", grund.trim());
              setShowAblehnen(false);
              setGrund("");
            }}
            className="text-[11px] px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
            style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}
          >
            Ablehnung absenden
          </button>
        </div>
      )}

      {error && <p className="text-[11px]" style={{ color: "rgb(var(--mon))" }}>{error}</p>}
    </div>
  );
}
