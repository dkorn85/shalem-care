// MediaSplit · Bild-Text-Layout mit alternierender Seite.
//
// Pattern aus /warum, /treuhand, /compliance, /notfall: lg:grid-cols-12 mit
// Bild auf einer Seite, Text auf der anderen. `imageSide` toggelt links/rechts
// (für Story-Flow). Optionaler Loop-MP4 + Glow-Halo für Schlussstein-Sektionen.

import Image from "next/image";

export type MediaSplitProps = {
  bild: string;
  loop?: string;
  imageSide?: "left" | "right";
  imageAspect?: "square" | "wide" | "portrait" | "video";
  imageSpan?: 5 | 6 | 7;          // 5/12 oder 6/12 oder 7/12 für Bild
  glow?: string;                   // CSS-Var für Halo-Schein (Akzent-Farbe)
  children: React.ReactNode;       // Text-Spalte
  className?: string;
};

const ASPECT: Record<NonNullable<MediaSplitProps["imageAspect"]>, string> = {
  square:   "aspect-square",
  wide:     "aspect-[16/9]",
  portrait: "aspect-[3/4]",
  video:    "aspect-[16/9]",
};

const farbeStyle = (accent: string): string =>
  accent.startsWith("rgb") || accent.startsWith("var") ? accent : `rgb(${accent})`;

export function MediaSplit({
  bild,
  loop,
  imageSide = "right",
  imageAspect = "wide",
  imageSpan = 7,
  glow,
  children,
  className = "",
}: MediaSplitProps) {
  const imageOrder = imageSide === "right" ? "lg:order-2" : "lg:order-1";
  const textOrder  = imageSide === "right" ? "lg:order-1" : "lg:order-2";
  // Static class names damit Tailwind-JIT sie erkennt
  const textCls =
    imageSpan === 5 ? "lg:col-span-7" :
    imageSpan === 6 ? "lg:col-span-6" :
                       "lg:col-span-5";
  const imageCls =
    imageSpan === 5 ? "lg:col-span-5" :
    imageSpan === 6 ? "lg:col-span-6" :
                       "lg:col-span-7";

  return (
    <section className={`grid lg:grid-cols-12 gap-6 sm:gap-8 items-center ${className}`}>
      <div className={`${textCls} ${textOrder}`}>{children}</div>
      <div className={`${imageCls} ${imageOrder} relative`}>
        {glow && (
          <div aria-hidden className="absolute -inset-6 rounded-[2rem] opacity-30 blur-3xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${farbeStyle(glow)} / 0.4 0%, transparent 70%)` }} />
        )}
        <div className={`relative ${ASPECT[imageAspect]} rounded-2xl overflow-hidden surface group`}>
          <Image src={bild} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          {loop && (
            <video src={loop} autoPlay muted loop playsInline aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          )}
        </div>
      </div>
    </section>
  );
}
