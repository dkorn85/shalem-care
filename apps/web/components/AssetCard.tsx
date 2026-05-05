// AssetCard — Card mit Watercolor-Asset als Hintergrund + Text-Overlay.
//
// Pattern: ein hochaufgelöstes Bild (1200×1200 oder 1600×900) füllt die
// Karte komplett, ein vertikaler Gradient sichert Lesbarkeit. Statt das
// Bild auf 64×64 zu schrumpfen, lassen wir es atmen.
//
// Drei Verwendungen:
// - "tile":   1:1-Tile, kompakt — für Vertrauensstufen, Demo-Modi etc.
// - "card":   4:3 — für Drei-Schritt-Diagramme
// - "wide":   16:9 — für volle Sektion-Cards (Säulen, Marketing-Tiles)
//
// Optionaler Loop-MP4 startet on-hover (oder always-on bei `loop="auto"`).

import Image from "next/image";
import Link from "next/link";

export type AssetCardProps = {
  bild: string;
  loop?: string;
  loopMode?: "hover" | "auto";
  variante?: "tile" | "card" | "wide";
  rolleFarbe?: string;            // CSS-Var (für Akzent-Streifen + Eyebrow-Color)
  eyebrow?: string;
  titel: React.ReactNode;
  untertitel?: React.ReactNode;
  href?: string;                  // wenn gesetzt: ganze Card ist klickbar
  children?: React.ReactNode;     // optional unterhalb der Asset-Fläche
  inhalt?: "overlay" | "below";  // Text auf Bild ODER unter Bild — Default: below
  ctaLabel?: string;
};

export function AssetCard({
  bild,
  loop,
  loopMode = "hover",
  variante = "tile",
  rolleFarbe,
  eyebrow,
  titel,
  untertitel,
  href,
  children,
  inhalt = "below",
  ctaLabel,
}: AssetCardProps) {
  const aspect =
    variante === "tile" ? "aspect-square" :
    variante === "card" ? "aspect-[4/3]"  :
                          "aspect-[16/9]";

  const cardClasses = "surface rounded-2xl block overflow-hidden relative h-full transition-shadow duration-500";
  const hoverClasses = href ? "surface-hover" : "";

  const content = (
    <article className={`${cardClasses} ${hoverClasses} group`} style={rolleFarbe ? { ["--card-accent" as string]: `rgb(${rolleFarbe})` } : undefined}>
      <div className={`relative ${aspect} overflow-hidden`}>
        <Image
          src={bild}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {loop && (
          <video
            src={loop}
            autoPlay={loopMode === "auto"}
            muted
            loop
            playsInline
            aria-hidden
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loopMode === "hover" ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
          />
        )}
        {inhalt === "overlay" && (
          <>
            <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgb(var(--bg-elev) / 0.92) 0%, rgb(var(--bg-elev) / 0.4) 40%, transparent 75%)" }} />
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              {eyebrow && <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={rolleFarbe ? { color: `rgb(${rolleFarbe})` } : { color: "rgb(var(--fg-mute))" }}>{eyebrow}</p>}
              <p className="font-display text-[14px] sm:text-[16px] font-bold tracking-tight2 leading-tight">{titel}</p>
              {untertitel && <div className="text-[11px] text-mute mt-1 leading-snug line-clamp-2">{untertitel}</div>}
            </div>
          </>
        )}
        {rolleFarbe && (
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] opacity-60" style={{ background: `rgb(${rolleFarbe})` }} />
        )}
      </div>

      {inhalt === "below" && (
        <div className="p-3 relative">
          <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={rolleFarbe ? { background: `rgb(${rolleFarbe})` } : { background: "rgb(var(--bg-mute))" }} />
          <div className="ml-2.5">
            {eyebrow && <p className="text-[10px] uppercase tracking-wider font-medium mb-0.5" style={rolleFarbe ? { color: `rgb(${rolleFarbe})` } : undefined}>{eyebrow}</p>}
            <p className="font-display text-[14px] font-bold tracking-tight2">{titel}</p>
            {untertitel && <div className="text-[12px] text-mute mt-1 leading-snug">{untertitel}</div>}
            {ctaLabel && (
              <p className="text-[11px] mt-2 font-medium" style={rolleFarbe ? { color: `rgb(${rolleFarbe})` } : { color: "rgb(var(--accent))" }}>
                {ctaLabel} →
              </p>
            )}
            {children}
          </div>
        </div>
      )}
    </article>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }
  return content;
}
