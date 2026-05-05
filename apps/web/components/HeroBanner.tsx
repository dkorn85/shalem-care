// HeroBanner — full-bleed Watercolor-Hintergrund mit Text-Overlay.
//
// Pattern für die Top-Sektion einer Page: das Asset fließt über die ganze
// Breite, ein vertikaler Gradient sichert Text-Lesbarkeit unten. Das Bild
// wird in voller Auflösung gerendert (nicht als kleine Card).
//
// Pro Variante:
// - "tall":   16:7 vertikal · klassisches Marketing-Hero
// - "wide":   16:9 · für Cockpit-Sub-Header (kompakter)
// - "split":  Bild rechts / Text links · für Page-Detail-Header
//
// Optional: Loop-MP4 als zusätzlicher Layer (hover oder always-on).

import Image from "next/image";

export type HeroBannerProps = {
  bild: string;
  loop?: string;             // optionaler MP4-Pfad
  eyebrow?: string;
  titel: React.ReactNode;
  untertitel?: React.ReactNode;
  variante?: "tall" | "wide" | "split";
  rolleFarbe?: string;       // CSS-Var wie 'var(--mon)' — färbt eyebrow + Akzent-Linie
  hoehe?: string;            // optional explizit (z.B. "70vh")
  position?: "center" | "top" | "bottom";  // object-position
  children?: React.ReactNode; // optionaler CTA-Slot
};

export function HeroBanner({
  bild,
  loop,
  eyebrow,
  titel,
  untertitel,
  variante = "wide",
  rolleFarbe,
  hoehe,
  position = "center",
  children,
}: HeroBannerProps) {
  const aspect =
    variante === "tall"  ? "aspect-[16/9] sm:aspect-[16/7]" :
    variante === "wide"  ? "aspect-[16/9]" :
                            "aspect-[16/9] lg:aspect-[16/8]";

  const objPos = position === "top" ? "object-top" : position === "bottom" ? "object-bottom" : "object-center";

  if (variante === "split") {
    return (
      <header className="mb-6">
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            {eyebrow && <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium" style={rolleFarbe ? { color: `rgb(${rolleFarbe})` } : undefined}>{eyebrow}</p>}
            <h1 className="font-display text-[28px] sm:text-[40px] font-bold tracking-tight3 leading-[1.05]">{titel}</h1>
            {untertitel && <div className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">{untertitel}</div>}
            {children && <div className="mt-4">{children}</div>}
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden surface anim-slideUp">
            <Image src={bild} alt="" fill priority sizes="(max-width: 1024px) 100vw, 40vw" className={`${objPos} object-cover transition-transform duration-700 hover:scale-105`} />
            {loop && (
              <video src={loop} autoPlay muted loop playsInline aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-500" />
            )}
            {rolleFarbe && (
              <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, rgb(${rolleFarbe} / 0.6), transparent)` }} />
            )}
          </div>
        </div>
      </header>
    );
  }

  // Full-bleed (tall + wide)
  return (
    <header className={`relative w-full ${aspect} overflow-hidden`} style={hoehe ? { aspectRatio: undefined, height: hoehe } : undefined}>
      <Image src={bild} alt="" fill priority className={`${objPos} object-cover`} sizes="100vw" />
      {loop && (
        <video src={loop} autoPlay muted loop playsInline aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-soft-light" />
      )}
      {/* Gradient unten für Text-Lesbarkeit */}
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgb(var(--bg) / 0.35) 0%, rgb(var(--bg) / 0.05) 35%, rgb(var(--bg) / 0.85) 95%, rgb(var(--bg)) 100%)" }} />
      {/* Akzent-Linie wenn Rolle gesetzt */}
      {rolleFarbe && (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, rgb(${rolleFarbe} / 0.6), transparent)` }} />
      )}
      <div className="absolute inset-x-0 bottom-0 px-6 sm:px-12 pb-6 sm:pb-10 max-w-5xl mx-auto">
        {eyebrow && <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium" style={rolleFarbe ? { color: `rgb(${rolleFarbe})` } : undefined}>{eyebrow}</p>}
        <h1 className="font-display text-[32px] sm:text-[48px] lg:text-[56px] font-bold tracking-tight3 leading-[1.05]">{titel}</h1>
        {untertitel && <div className="text-[14px] sm:text-[16px] text-mute mt-3 max-w-prose leading-relaxed">{untertitel}</div>}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </header>
  );
}
