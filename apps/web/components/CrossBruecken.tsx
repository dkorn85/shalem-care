// Server-Component: rendert die Cross-Beruf-Brücken pro Cockpit am Seitenende.
//
// Holt sich aus `lib/cross/bruecken.ts` die Brücken passend zur Route +
// stellt sie als zwei Spalten dar (raus = ich gebe weiter / rein = kommt
// zu mir). Pro Brücke ein klickbarer Sprung mit klarer Beschriftung.

import Link from "next/link";
import { brueckenFuer, type Bruecke } from "@/lib/cross/bruecken";

export function CrossBruecken({ pathname }: { pathname: string }) {
  const alle = brueckenFuer(pathname);
  if (alle.length === 0) return null;

  const raus = alle.filter((b) => b.richtung === "raus");
  const rein = alle.filter((b) => b.richtung === "rein");

  return (
    <section className="surface rounded-2xl p-4 mt-5" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
      <header className="mb-3">
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--accent))" }}>
          Cross-Brücken · multidisziplinär
        </p>
        <h2 className="font-display text-[16px] font-bold tracking-tight2 mt-0.5">Wer hängt mit dran?</h2>
        <p className="text-[12px] text-mute mt-1">
          Konkrete Sprünge zu den Cockpits, mit denen diese Information lebt.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {raus.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono mb-1.5" style={{ color: "rgb(var(--vibe-team))" }}>
              → ich gebe weiter an
            </p>
            <ul className="space-y-1.5">
              {raus.map((b) => <BrueckeKarte key={b.zielHref + b.was} b={b} />)}
            </ul>
          </div>
        )}
        {rein.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono mb-1.5" style={{ color: "rgb(var(--thu))" }}>
              ← ich bekomme von
            </p>
            <ul className="space-y-1.5">
              {rein.map((b) => <BrueckeKarte key={b.zielHref + b.was} b={b} />)}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function BrueckeKarte({ b }: { b: Bruecke }) {
  return (
    <li>
      <Link
        href={b.zielHref}
        className="surface-mute rounded-lg p-2.5 block hover:translate-x-0.5 transition-transform"
      >
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[12px] font-semibold">{b.zielLabel}</span>
          <span className="text-soft text-[12px]">→</span>
        </div>
        <p className="text-[11px] text-mute mt-0.5 leading-snug">{b.was}</p>
      </Link>
    </li>
  );
}
