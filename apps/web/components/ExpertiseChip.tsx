"use client";

// Kompakter 3-Stufen-Schalter · zeigt aktuellen Level als Chip,
// Klick öffnet inline drei Buttons mit Beruf-spezifischen Labels.
// Für jeden Beruf eigenständig im Cockpit oder im AppShell-Header zu platzieren.

import { useState } from "react";
import { useExpertise, type ExpertiseRolle, type ExpertiseLevel } from "@/lib/ui/expertise";

const LEVELS: ExpertiseLevel[] = ["lerne", "praxis", "profi"];

const LEVEL_FARBE: Record<ExpertiseLevel, string> = {
  lerne:  "var(--vibe-approval)",
  praxis: "var(--vibe-team)",
  profi:  "var(--vibe-stats)",
};

const LEVEL_GLYPH: Record<ExpertiseLevel, string> = {
  lerne:  "◯",
  praxis: "◐",
  profi:  "●",
};

export function ExpertiseChip({ rolle, vibe }: { rolle: ExpertiseRolle; vibe?: string }) {
  const { level, setLevel, mounted, labels } = useExpertise(rolle);
  const [offen, setOffen] = useState(false);

  if (!mounted) return null;

  return (
    <div className="inline-flex items-center gap-1">
      {!offen ? (
        <button
          type="button"
          onClick={() => setOffen(true)}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
          style={{
            background: `rgb(${LEVEL_FARBE[level]} / 0.15)`,
            color: `rgb(${LEVEL_FARBE[level]})`,
            boxShadow: `inset 0 0 0 1px rgb(${LEVEL_FARBE[level]} / 0.3)`,
          }}
          title="Expertise-Modus wechseln"
        >
          <span aria-hidden>{LEVEL_GLYPH[level]}</span>
          <span>{labels[level]}</span>
        </button>
      ) : (
        <div className="inline-flex items-center gap-0.5 rounded-full p-0.5" style={{ background: "rgb(var(--bg-mute))" }}>
          {LEVELS.map((l) => {
            const aktiv = l === level;
            return (
              <button
                key={l}
                type="button"
                onClick={() => { setLevel(l); setOffen(false); }}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors"
                style={{
                  background: aktiv ? `rgb(${LEVEL_FARBE[l]})` : "transparent",
                  color: aktiv ? "white" : "rgb(var(--fg-mute))",
                }}
              >
                {labels[l]}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setOffen(false)}
            aria-label="schließen"
            className="px-1.5 text-[10px] text-soft hover:text-[rgb(var(--fg))]"
          >
            ×
          </button>
        </div>
      )}
      {vibe && !offen && (
        <span aria-hidden className="text-[10px] text-soft">·</span>
      )}
    </div>
  );
}
