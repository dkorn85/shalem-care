// RolePastelHeader · Cockpit-Header mit pastelligem Akzent-Verlauf.
//
// Großzügige Pastell-Optik pro Berufsgruppe — ersetzt nüchterne weiße Headers
// durch eine warme, würdevolle Visitenkarte. Pastel + Akzent-Stripe + optionale
// Atmo-Loop oder Pattern.
//
// Anwendung pro Cockpit:
//   <RolePastelHeader rolle="pflege" eyebrow="Pflege-Cockpit" titel="Heute">
//     <p>Untertitel</p>
//   </RolePastelHeader>

import { existsSync } from "node:fs";
import { join } from "node:path";
import { themeFor } from "@/lib/design/role-theme";

function publicFileExists(p: string): boolean {
  try { return existsSync(join(process.cwd(), "public", p.replace(/^\//, ""))); } catch { return false; }
}

type Props = {
  rolle: string;
  eyebrow?: string;
  titel: string;
  highlight?: string;            // wird als rainbow-text gerendert (oder akzentfarben)
  loopSrc?: string;              // optionaler Atmo-Loop-Hintergrund
  patternSrc?: string;           // optionales Pattern als Tile-Hintergrund
  children?: React.ReactNode;    // typically the description paragraph
  rightSlot?: React.ReactNode;   // z.B. Avatar, Counter, Cards
  className?: string;
};

export function RolePastelHeader({
  rolle, eyebrow, titel, highlight,
  loopSrc, patternSrc, children, rightSlot, className = "",
}: Props) {
  const t = themeFor(rolle);
  const hatLoop = loopSrc && publicFileExists(loopSrc);
  const hatPattern = patternSrc && publicFileExists(patternSrc);

  const bg = `linear-gradient(135deg, ${t.pastelGlanz} 0%, ${t.pastel} 65%, transparent 100%)`;

  return (
    <header
      className={`relative overflow-hidden rounded-2xl mb-6 ${className}`}
      style={{ background: bg }}
    >
      {hatLoop && (
        <video
          src={loopSrc}
          autoPlay muted loop playsInline
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none mix-blend-multiply"
        />
      )}
      {hatPattern && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url('${patternSrc}')`,
            backgroundRepeat: "repeat",
            backgroundSize: "320px",
            opacity: 0.10,
          }}
        />
      )}

      {/* Akzent-Stripe links */}
      <span
        aria-hidden
        className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
        style={{ background: t.akzent }}
      />

      <div className="relative px-5 sm:px-7 py-5 sm:py-7 grid sm:grid-cols-12 gap-4 items-end">
        <div className="sm:col-span-8">
          {eyebrow && (
            <p className="text-[11px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: t.akzent }}>
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-[26px] sm:text-[34px] font-bold tracking-tight2 leading-[1.05]">
            {titel}
            {highlight && (
              <>
                {" "}
                <span style={{ color: t.akzent }}>{highlight}</span>
              </>
            )}
          </h1>
          {children && (
            <div className="mt-2 sm:mt-3 max-w-prose text-[13px] sm:text-[14px] leading-relaxed" style={{ color: "rgb(var(--fg-soft))" }}>
              {children}
            </div>
          )}
        </div>
        {rightSlot && (
          <div className="sm:col-span-4 flex justify-end items-center">
            {rightSlot}
          </div>
        )}
      </div>
    </header>
  );
}
