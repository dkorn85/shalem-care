"use client";

// StatTile · einzelne KPI-Kachel mit Count-up-Animation beim ersten Reveal.
//
// Spezialisierung der bestehenden `StatsRow`-Pattern: arbeitet stand-alone
// (auch in Mixed-Layouts wie /warum), unterstützt Akzentfarbe pro Tile,
// Trend-Indikator und Alarm-Pulse. Die Count-up-Animation läuft per
// IntersectionObserver erst, wenn die Tile in den Viewport gelangt — und
// respektiert `prefers-reduced-motion` (sofortiger Wert ohne Animation).
//
// Verwendung:
//   <StatTile label="Plattform-Cut" value="4" unit="%" akzent="var(--vibe-stats)" />
//   <StatTile label="Vermittler-Marge" value="0" unit="€" akzent="var(--mon)" />
//   <StatTile label="Pflegekraft-Anteil" value="82–86" unit="%" akzent="var(--vibe-team)" />
//
// Wenn `value` rein numerisch ist, läuft Count-up. Strings wie "82–86" oder
// "0 €" bleiben statisch (nichts hochzuzählen).

import { useEffect, useRef, useState } from "react";

export type StatTileProps = {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  akzent?: string;                      // CSS-Var, default --accent
  trend?: "up" | "down" | "flat";
  alarm?: boolean;
  size?: "sm" | "md" | "lg";
  delay?: number;                       // anim-delay in ms
  className?: string;
};

// Wandelt unsere Farb-Inputs in eine CSS-color-Form (rgb(...)).
// Akzeptiert: "var(--mon)", "rgb(...)", "120 130 200"
const farbe = (a: string): string => (a.startsWith("rgb") ? a : `rgb(${a})`);

const VALUE_SIZE: Record<NonNullable<StatTileProps["size"]>, string> = {
  sm: "text-[20px]",
  md: "text-[28px]",
  lg: "text-[40px]",
};

export function StatTile({
  label,
  value,
  unit,
  hint,
  akzent = "var(--accent)",
  trend,
  alarm,
  size = "md",
  delay = 0,
  className = "",
}: StatTileProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const target = typeof value === "number" ? value : Number(value);
  const isNumeric = typeof value === "number" || (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value.trim()));
  const [shown, setShown] = useState<number | null>(isNumeric ? 0 : null);

  useEffect(() => {
    if (!isNumeric || !ref.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(target);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const start = performance.now() + delay;
          const dur = 700;
          const tick = (now: number) => {
            const elapsed = Math.max(0, now - start);
            const t = Math.min(1, elapsed / dur);
            // ease-out-quart
            const eased = 1 - Math.pow(1 - t, 4);
            setShown(target * eased);
            if (t < 1) requestAnimationFrame(tick);
            else setShown(target);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [isNumeric, target, delay]);

  const display = shown === null
    ? String(value)
    : Number.isInteger(target)
      ? String(Math.round(shown))
      : shown.toFixed(1);

  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : trend === "flat" ? "→" : null;

  return (
    <div
      ref={ref}
      className={`stat-tile ${className}`}
      style={{
        ["--tile-color" as string]: akzent,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-soft font-medium tracking-wide uppercase">{label}</span>
        {alarm && <span aria-hidden className="pulse-dot" style={{ background: farbe(akzent) }} />}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
        <span
          className={`font-display font-semibold tracking-tight2 leading-none ${VALUE_SIZE[size]}`}
          style={{ color: farbe(akzent) }}
        >
          {display}
        </span>
        {unit && <span className="text-[12px] text-soft">{unit}</span>}
        {trendArrow && (
          <span className="text-[11px] font-mono ml-auto" style={{ color: farbe(akzent) }}>{trendArrow}</span>
        )}
      </div>
      {hint && <div className="text-[11px] text-soft mt-1.5 leading-snug">{hint}</div>}
    </div>
  );
}
