"use client";

// Status-Chip mit Klick-Wechsel: geplant → läuft → erreicht / abgesetzt.

import { useState, useTransition } from "react";
import { setzeStatusAction } from "@/lib/pflege/pflegeplan-actions";
import { spiele } from "@/lib/sound/sound-player";
import type { PflegeplanEintrag, PlanEintragStatus } from "@/lib/pflege/pflegeplan-store";

const FARBE: Record<PlanEintragStatus, string> = {
  geplant:   "var(--vibe-team)",
  "läuft":   "var(--vibe-stats)",
  erreicht:  "var(--thu)",
  abgesetzt: "var(--fg-mute)",
};

const REIHE: PlanEintragStatus[] = ["geplant", "läuft", "erreicht", "abgesetzt"];

export function PlanStatusChip({ eintrag }: { eintrag: PflegeplanEintrag }) {
  const [aktuell, setAktuell] = useState<PlanEintragStatus>(eintrag.status);
  const [pending, startTransition] = useTransition();

  function naechster() {
    const idx = REIHE.indexOf(aktuell);
    const nextIdx = (idx + 1) % REIHE.length;
    const next = REIHE[nextIdx];
    startTransition(async () => {
      const r = await setzeStatusAction({ id: eintrag.id, klientId: eintrag.klientId, status: next });
      if (r.ok) {
        spiele(next === "erreicht" ? "erfolg" : "klick");
        setAktuell(next);
      } else {
        spiele("fehler");
      }
    });
  }

  return (
    <button
      type="button" onClick={naechster} disabled={pending}
      className="chip text-[10px] font-mono cursor-pointer transition-opacity disabled:opacity-50"
      style={{ background: `rgb(${FARBE[aktuell]} / 0.18)`, color: `rgb(${FARBE[aktuell]})` }}
      title="Status weiter"
    >
      {aktuell}
    </button>
  );
}
