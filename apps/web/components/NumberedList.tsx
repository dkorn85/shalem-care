// NumberedList · nummerierte Schritt-/Säulen-Liste mit farbigem Marker.
//
// Pattern aus /treuhand (Schritt 1/2/3), /notfall (Eskalation 1–4),
// /warum (4-%-Aufschlüsselung), /page (Kneipp-Säulen). Statt jede Page
// das gleiche Markup zu wiederholen, einheitliches Component mit
// Stagger-Reveal (jedes Item +80 ms versetzt).
//
// Variants:
// - "horizontal": grid lg:grid-cols-N — Karten nebeneinander (Schritt-Flow)
// - "vertical":   space-y — vertikale Liste (Eskalations-Kette, Säulen-Tabelle)
// - "row":        kompakte Reihe mit kleinem Marker links (Quick-Facts)

import Image from "next/image";
import { SmoothReveal } from "./SmoothReveal";

export type NumberedItem = {
  nummer: string | number;
  titel: string;
  text?: React.ReactNode;
  akzent?: string;             // CSS-Var oder rgb-String
  chip?: string;
  bild?: string;
  href?: string;
};

export type NumberedListProps = {
  items: NumberedItem[];
  variante?: "horizontal" | "vertical" | "row";
  staggerMs?: number;
  className?: string;
};

// Wandelt unsere Farb-Inputs in `rgb(...)`-Form für `color` / `background`.
// Akzeptiert: "var(--mon)", "rgb(...)", "120 130 200".
const farbe = (a?: string): string => {
  if (!a) return "rgb(var(--accent))";
  return a.startsWith("rgb") ? a : `rgb(${a})`;
};

// Wie `farbe`, aber mit Alpha (für 15-%-Chip-Backgrounds etc.).
// `var(--mon)` → `rgb(var(--mon) / 0.15)`.
const farbeAlpha = (a: string | undefined, alpha: number): string => {
  if (!a) return `rgb(var(--accent) / ${alpha})`;
  if (a.startsWith("rgb")) {
    return a.replace(/^rgb\(([^)]+)\)$/, (_m, inner) => `rgb(${inner} / ${alpha})`);
  }
  return `rgb(${a} / ${alpha})`;
};

export function NumberedList({
  items,
  variante = "horizontal",
  staggerMs = 80,
  className = "",
}: NumberedListProps) {
  if (variante === "horizontal") {
    const cols = items.length === 2 ? "lg:grid-cols-2" : items.length === 3 ? "lg:grid-cols-3" : items.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
    return (
      <ol className={`grid sm:grid-cols-2 ${cols} gap-3 sm:gap-4 ${className}`}>
        {items.map((it, i) => (
          <SmoothReveal key={`${it.nummer}-${i}`} as="li" delay={i * staggerMs} direction="up">
            <article className="surface rounded-xl p-4 h-full relative overflow-hidden group transition-shadow duration-500 hover:shadow-md">
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-500 group-hover:w-[5px]" style={{ background: farbe(it.akzent) }} />
              {it.bild && (
                <div className="relative aspect-[4/3] -mx-4 -mt-4 mb-3 overflow-hidden">
                  <Image src={it.bild} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              )}
              <div className="ml-2.5">
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className="font-display font-bold text-[20px] leading-none"
                    style={{ color: farbe(it.akzent) }}
                  >{it.nummer}</span>
                  {it.chip && (
                    <span className="chip text-[10px]" style={{ background: farbeAlpha(it.akzent, 0.15), color: farbe(it.akzent) }}>{it.chip}</span>
                  )}
                </div>
                <h3 className="font-medium text-[14px] mb-1">{it.titel}</h3>
                {it.text && <div className="text-[12px] text-mute leading-snug">{it.text}</div>}
              </div>
            </article>
          </SmoothReveal>
        ))}
      </ol>
    );
  }

  if (variante === "row") {
    return (
      <ol className={`space-y-2 ${className}`}>
        {items.map((it, i) => (
          <SmoothReveal key={`${it.nummer}-${i}`} as="li" delay={i * staggerMs} direction="up">
            <div className="flex gap-3 items-baseline">
              <span
                aria-hidden
                className="font-mono shrink-0 w-12 text-[13px]"
                style={{ color: farbe(it.akzent) }}
              >{it.nummer}</span>
              <div className="flex-1 min-w-0">
                <strong className="text-[rgb(var(--fg))] text-[14px]">{it.titel}</strong>
                {it.text && <span className="text-[14px] text-mute leading-relaxed"> {it.text}</span>}
              </div>
            </div>
          </SmoothReveal>
        ))}
      </ol>
    );
  }

  // vertical
  return (
    <ol className={`space-y-3 ${className}`}>
      {items.map((it, i) => (
        <SmoothReveal key={`${it.nummer}-${i}`} as="li" delay={i * staggerMs} direction="up">
          <article className="surface rounded-xl p-4 relative overflow-hidden group transition-shadow duration-500 hover:shadow-md flex gap-4">
            <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-500 group-hover:w-[5px]" style={{ background: farbe(it.akzent) }} />
            <span
              className="font-display font-bold text-[24px] leading-none shrink-0 w-10 text-center pt-0.5 ml-2"
              style={{ color: farbe(it.akzent) }}
            >{it.nummer}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="font-medium text-[14px]">{it.titel}</h3>
                {it.chip && (
                  <span className="chip text-[10px]" style={{ background: farbeAlpha(it.akzent, 0.15), color: farbe(it.akzent) }}>{it.chip}</span>
                )}
              </div>
              {it.text && <div className="text-[13px] text-mute leading-relaxed">{it.text}</div>}
            </div>
          </article>
        </SmoothReveal>
      ))}
    </ol>
  );
}
