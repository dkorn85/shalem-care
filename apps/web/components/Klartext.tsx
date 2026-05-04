"use client";

import { useState } from "react";
import { annotateText } from "@/lib/klartext/glossar";
import type { GlossarEintrag } from "@/lib/klartext/glossar";

const KAT_FARBE: Record<GlossarEintrag["kategorie"], string> = {
  diagnose:     "var(--mon)",
  wirkstoff:    "var(--vibe-team)",
  untersuchung: "var(--tue)",
  skala:        "var(--vibe-profile)",
  doku:         "var(--thu)",
  anatomie:     "var(--fri)",
  ablauf:       "var(--vibe-stats)",
  rechtlich:    "var(--fg-mute)",
};

const KAT_LABEL: Record<GlossarEintrag["kategorie"], string> = {
  diagnose:     "Diagnose",
  wirkstoff:    "Medikament",
  untersuchung: "Untersuchung",
  skala:        "Skala",
  doku:         "Doku-Begriff",
  anatomie:     "Körper",
  ablauf:       "Ablauf",
  rechtlich:    "Rechtlich",
};

// Inline-Klartext: zeigt einen Text mit unterstrichenen Fachbegriffen,
// die per Klick ihre Erklärung als Tooltip einblenden.
export function Klartext({ text, className }: { text: string; className?: string }) {
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const parts = annotateText(text);

  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.type === "text" || !p.entry) return <span key={i}>{p.value}</span>;
        const entry = p.entry;
        const farbe = KAT_FARBE[entry.kategorie];
        const isOpen = openTerm === `${i}-${entry.term}`;
        return (
          <span key={i} className="relative inline">
            <button
              type="button"
              onClick={() => setOpenTerm(isOpen ? null : `${i}-${entry.term}`)}
              className="cursor-help underline decoration-dotted decoration-2 underline-offset-2 transition-colors hover:bg-[rgb(var(--bg-mute))] rounded-sm px-0.5"
              style={{ textDecorationColor: `rgb(${farbe})`, color: "inherit" }}
            >
              {p.value}
            </button>
            {isOpen && (
              <span
                role="tooltip"
                className="absolute z-30 left-0 top-full mt-1 w-72 surface rounded-lg p-3 shadow-lg text-[12px] leading-snug font-normal"
                style={{ color: "rgb(var(--fg))" }}
              >
                <span className="flex items-baseline gap-2 mb-1.5">
                  <span className="font-medium">{entry.term}</span>
                  <span className="chip text-[9px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
                    {KAT_LABEL[entry.kategorie]}
                  </span>
                </span>
                <span className="block">{entry.klartext}</span>
                {entry.beispiel && (
                  <span className="block text-soft italic mt-1.5">{entry.beispiel}</span>
                )}
                <button
                  onClick={() => setOpenTerm(null)}
                  className="absolute top-1 right-1 text-soft hover:text-[rgb(var(--fg))] text-[12px]"
                  aria-label="Erklärung schließen"
                >
                  ×
                </button>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

// Kompakter Begriffs-Reader für eine Doku-Karte: zeigt unten alle
// im Text gefundenen Begriffe als Chip-Liste.
export function KlartextSummary({ text }: { text: string }) {
  const parts = annotateText(text);
  const found = new Map<string, GlossarEintrag>();
  for (const p of parts) {
    if (p.type === "term" && p.entry) found.set(p.entry.term, p.entry);
  }
  if (found.size === 0) return null;
  return (
    <details className="mt-3 surface-mute rounded-lg p-2.5">
      <summary className="text-[11px] uppercase tracking-wider text-soft font-medium cursor-pointer hover:text-[rgb(var(--fg))]">
        💡 {found.size} Fachbegriff{found.size === 1 ? "" : "e"} einfach erklärt
      </summary>
      <ul className="mt-2 space-y-2">
        {[...found.values()].map((e) => {
          const farbe = KAT_FARBE[e.kategorie];
          return (
            <li key={e.term} className="text-[12px]">
              <span className="font-medium" style={{ color: `rgb(${farbe})` }}>{e.term}</span>
              {" — "}
              <span className="text-mute">{e.klartext}</span>
              {e.beispiel && <span className="text-soft italic"> · {e.beispiel}</span>}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
