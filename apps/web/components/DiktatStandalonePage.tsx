// Schlanke standalone Diktat-Page für Berufe, die noch nicht im
// AppShell-Cockpit registriert sind (Hausmeister, Reinigung, Recycling,
// Lebensmittel). Nutzt das generische BerufDiktat-Tool und den
// öffentlichen Marketing-Look.

import Link from "next/link";
import { Wordmark } from "./Logo";
import { SiteFooter } from "./SiteFooter";
import { BerufDiktat } from "./BerufDiktat";
import {
  BRANCHE_EMOJI,
  BRANCHE_FARBE,
  BRANCHE_LABEL,
  type LieferantBranche,
} from "@/lib/lieferanten/store";
import { PROFILES } from "@/lib/beruf-diktat/profile";

const BRANCHE_HUB: Record<LieferantBranche, string> = {
  hausmeister: "/hausmeister",
  reinigung: "/reinigung",
  recycling: "/recycling",
  lebensmittel: "/lebensmittel",
};

export function DiktatStandalonePage({
  branche,
  einleitung,
}: {
  branche: LieferantBranche;
  einleitung: string;
}) {
  const profil = PROFILES[branche];
  if (!profil) {
    return null;
  }
  const farbe = BRANCHE_FARBE[branche];
  const emoji = BRANCHE_EMOJI[branche];
  const label = BRANCHE_LABEL[branche];
  const hub = BRANCHE_HUB[branche];

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <div className="flex items-center gap-2">
          <Link href={hub} className="btn btn-ghost text-[13px] px-3 py-1.5">
            ← {label}
          </Link>
          <Link href="/expertenstandards" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Expertenstandards
          </Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-8 text-center">
        <div
          className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp"
          style={{ background: `rgb(${farbe})` }}
        />
        <p
          className="text-[11px] uppercase tracking-[0.2em] mb-3 font-mono anim-slideUp"
          style={{ color: `rgb(${farbe})` }}
        >
          <span aria-hidden className="mr-2">{emoji}</span>
          {profil.eyebrow}
        </p>
        <h1
          className="font-display text-[36px] sm:text-[48px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp"
          style={{ animationDelay: "0.05s" }}
        >
          {profil.titel}
        </h1>
        <p
          className="text-[14px] sm:text-[15px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp"
          style={{ animationDelay: "0.1s" }}
        >
          {einleitung}
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="max-w-3xl mx-auto">
          <BerufDiktat profil={profil} />
        </div>
      </section>

      {profil.vs.length > 0 && (
        <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
          <header className="text-center mb-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
              Branchen-Vergleich
            </p>
            <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight2">
              Was Marktanbieter machen · was Shalem stattdessen tut
            </h2>
          </header>
          <ul className="space-y-3 max-w-3xl mx-auto">
            {profil.vs.map((v, i) => (
              <li key={i} className="surface rounded-2xl p-5">
                <p className="font-display text-[15px] font-bold tracking-tight2 mb-3">
                  {v.name}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-1">
                      Vorher · klassisch
                    </p>
                    <p className="text-[13px] text-mute leading-relaxed">{v.vorher}</p>
                  </div>
                  <div>
                    <p
                      className="font-mono text-[10px] uppercase tracking-wider mb-1"
                      style={{ color: `rgb(${farbe})` }}
                    >
                      Nachher · Shalem
                    </p>
                    <p className="text-[13px] text-mute leading-relaxed">{v.nachher}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
