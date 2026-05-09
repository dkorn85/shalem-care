"use client";

// Manuelle Plan-Eintrag-Ergänzung pro Diagnose. Pflegekraft öffnet
// ein freies Eingabefeld direkt unter der Diagnose-Karte und tippt
// eigene Intervention oder Ziel ein — wird mit quelle="manuell"
// gespeichert (sichtbar im Plan-Karten-Eintrag).

import { useState, useTransition } from "react";
import { fuegeManuellAction } from "@/lib/pflege/pflegeplan-actions";
import { spiele } from "@/lib/sound/sound-player";
import type { PlanEintragArt } from "@/lib/pflege/pflegeplan-store";

export function PlanManuellForm({
  klientId,
  diagnoseEintragId,
  nandaCode,
}: {
  klientId: string;
  diagnoseEintragId: string;
  nandaCode: string;
}) {
  const [offen, setOffen] = useState(false);
  const [art, setArt] = useState<PlanEintragArt>("intervention");
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) { setFeedback("⚠ Text fehlt."); return; }
    setFeedback(null);
    startTransition(async () => {
      const r = await fuegeManuellAction({ klientId, diagnoseEintragId, nandaCode, art, text });
      if (r.ok) {
        spiele("diagnose-set");
        setText("");
        setOffen(false);
      } else {
        spiele("fehler");
        setFeedback("⚠ " + r.error);
      }
    });
  }

  if (!offen) {
    return (
      <button
        type="button" onClick={() => setOffen(true)}
        className="text-[11px] mt-2 px-2 py-1 rounded font-medium"
        style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}
      >
        + Eigener Plan-Eintrag (manuell)
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 surface-mute rounded-lg p-2.5 space-y-2">
      <div className="flex gap-1.5">
        <button
          type="button" onClick={() => setArt("intervention")}
          className="text-[10px] px-2 py-0.5 rounded font-medium"
          style={{
            background: art === "intervention" ? "rgb(var(--vibe-team))" : "rgb(var(--vibe-team) / 0.12)",
            color: art === "intervention" ? "white" : "rgb(var(--vibe-team))",
          }}
        >
          Intervention
        </button>
        <button
          type="button" onClick={() => setArt("ziel")}
          className="text-[10px] px-2 py-0.5 rounded font-medium"
          style={{
            background: art === "ziel" ? "rgb(var(--thu))" : "rgb(var(--thu) / 0.12)",
            color: art === "ziel" ? "white" : "rgb(var(--thu))",
          }}
        >
          Ziel
        </button>
      </div>

      <textarea
        value={text} onChange={(e) => setText(e.target.value)}
        rows={2} placeholder={art === "intervention" ? "z.B. Hand-Massage zur Schmerzlinderung 1×/d" : "z.B. NRS ≤ 3 binnen 4 Wochen"}
        className="input text-[12px] resize-y w-full"
        autoFocus
      />

      <div className="flex gap-2 items-baseline">
        <button
          type="button" onClick={() => { setOffen(false); setText(""); setFeedback(null); }}
          className="text-[10px] px-2 py-0.5 rounded text-soft"
        >
          abbrechen
        </button>
        <button
          type="submit" disabled={pending || !text.trim()}
          className="text-[11px] px-2.5 py-1 rounded font-medium disabled:opacity-50"
          style={{ background: "rgb(var(--accent))", color: "white" }}
        >
          {pending ? "speichert …" : "Hinzufügen"}
        </button>
        {feedback && (
          <span className="text-[11px]" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
            {feedback}
          </span>
        )}
      </div>
    </form>
  );
}
