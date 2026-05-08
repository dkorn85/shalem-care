// QuizHeroCard · einheitliche Mini-Game-Karte für alle Beruf-Cockpits.
// Server-Komponente (Plain Link), wird von den Heute-Seiten direkt
// importiert. Sichtbarkeit über GameModeOnly-Wrapper außen.

import Link from "next/link";

export function QuizHeroCard({
  href,
  eyebrow,
  titel,
  beschreibung,
  badges,
  akzent,
}: {
  href: string;
  eyebrow: string;
  titel: string;
  beschreibung: string;
  badges?: string[];
  akzent: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: `linear-gradient(135deg, rgb(${akzent} / 0.15), rgb(${akzent} / 0.05))`,
        border: `2px solid rgb(${akzent} / 0.4)`,
      }}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: `rgb(${akzent})` }}>
            ⚡ {eyebrow}
          </p>
          <h3 className="font-display text-[16px] font-bold tracking-tight2">{titel} →</h3>
          <p className="text-[12px] text-mute mt-0.5 leading-snug">{beschreibung}</p>
        </div>
        {badges && badges.length > 0 && (
          <div className="flex gap-1.5 text-[11px] font-mono">
            {badges.map((b, i) => (
              <span key={i} className="px-2 py-1 rounded bg-[rgb(var(--bg))]">{b}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
