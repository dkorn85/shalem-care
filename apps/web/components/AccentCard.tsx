// AccentCard · der 3px-Stripe-Pattern als wiederverwendbare Komponente.
//
// Ersetzt die ~30 Inline-Versionen in Pages (Saeule, Schritt, VertrauensTile,
// AuditIcon, Mini, QuickLink). Drei Varianten:
// - "tile":  Inhalt vertikal, kompakt für Tile-Grids
// - "row":   Inhalt horizontal, für Listen-Items
// - "stat":  Zahl groß, label klein, für KPI-Tiles
//
// Akzent-Farbe als Pflicht-Prop, Bild + CTA optional.

import Image from "next/image";
import Link from "next/link";

export type AccentCardProps = {
  accent: string;                  // CSS-Var-Name oder rgb(...)-String
  variante?: "tile" | "row" | "stat";
  eyebrow?: string;
  titel?: React.ReactNode;
  beschreibung?: React.ReactNode;
  bild?: string;                   // optional kleines Top-Bild
  bildAspect?: "square" | "wide" | "portrait";
  meta?: React.ReactNode;          // rechts (z.B. Datum, Chip)
  chip?: { label: string; farbe?: string };
  href?: string;
  alarm?: boolean;                 // Alarm-Glow um die Card
  children?: React.ReactNode;
  className?: string;
};

const farbeStyle = (accent: string): string =>
  accent.startsWith("rgb") || accent.startsWith("var") ? accent : `rgb(${accent})`;

export function AccentCard({
  accent,
  variante = "tile",
  eyebrow,
  titel,
  beschreibung,
  bild,
  bildAspect = "wide",
  meta,
  chip,
  href,
  alarm,
  children,
  className = "",
}: AccentCardProps) {
  const base = `surface rounded-xl relative overflow-hidden ${href ? "surface-hover" : ""} ${className}`;
  const padding = variante === "stat" ? "p-2.5" : "p-3";

  // Akzent-Linie
  const stripe = (
    <span aria-hidden className={`absolute left-0 ${variante === "stat" ? "top-2 bottom-2" : "top-3 bottom-3"} w-[3px] rounded-full transition-all duration-500 group-hover:w-[5px]`} style={{ background: farbeStyle(accent) }} />
  );

  const aspectClass =
    bildAspect === "square"   ? "aspect-square"   :
    bildAspect === "portrait" ? "aspect-[3/4]"   :
                                 "aspect-[4/3]";

  const inner = (
    <article className={`${base} ${padding} group transition-shadow duration-500`} style={alarm ? { boxShadow: `inset 0 0 0 1px ${farbeStyle(accent)}` } : undefined}>
      {bild && (
        <div className={`relative ${aspectClass} -mx-3 -mt-3 mb-3 overflow-hidden`}>
          <Image src={bild} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] opacity-60" style={{ background: farbeStyle(accent) }} />
        </div>
      )}
      {stripe}
      <div className="ml-2.5 flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          {eyebrow && <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: farbeStyle(accent) }}>{eyebrow}</p>}
          {titel && (
            <div className="flex items-baseline gap-2 flex-wrap">
              {variante === "stat" ? (
                <span className="font-display font-bold text-[20px] leading-none mt-0.5" style={{ color: farbeStyle(accent) }}>{titel}</span>
              ) : (
                <span className="font-medium text-[13px] sm:text-[14px]">{titel}</span>
              )}
              {chip && (
                <span className="chip text-[10px]" style={{ background: `${farbeStyle(chip.farbe ?? accent)} / 0.15`, color: farbeStyle(chip.farbe ?? accent) }}>
                  {chip.label}
                </span>
              )}
            </div>
          )}
          {beschreibung && <div className="text-[12px] text-mute mt-1 leading-snug">{beschreibung}</div>}
          {children}
        </div>
        {meta && <span className="text-[11px] font-mono text-soft shrink-0">{meta}</span>}
      </div>
    </article>
  );

  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}
