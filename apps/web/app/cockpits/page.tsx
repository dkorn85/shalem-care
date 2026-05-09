// /cockpits · globale Übersichtskarte aller Cockpit-Familien.
//
// Eine durchsuchbare Karte aller 12 Beruf-Familien mit ihren Sub-Cockpits.
// Liest die `COCKPIT_SUB_NAV`-Registry direkt + reichert sie mit Akzent +
// Expertise-Labels an. Kein eigener Datenstand — Single Source of Truth
// bleibt die Sub-Nav-Registry.

import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { CockpitsSearch } from "@/components/cockpits/CockpitsSearch";
import { alleAngereicherten } from "@/lib/cockpits/karte";

export const metadata = {
  title: "Cockpits-Karte · alle Berufe + Sub-Bereiche",
  description: "Übersicht aller Cockpit-Familien (Pflege, Arzt, Therapie, Sozial, Apotheke, Medizintechnik, Rettungsdienst, Bestatter, Begleitung, Träger-Admin, Klient, Genossenschaft) mit Sub-Reitern + Suche.",
};

export default function CockpitsPage() {
  const gruppen = alleAngereicherten();
  const totalReiter = gruppen.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, rgb(var(--accent) / 0.04), transparent 240px)" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        <header className="mb-6 flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <Link href="/" className="inline-block mb-3"><Wordmark /></Link>
            <p className="text-[11px] uppercase tracking-wider text-soft font-mono">Karte · alle Cockpits + Sub-Bereiche</p>
            <h1 className="font-display text-[32px] sm:text-[40px] font-bold tracking-tight2 mt-1">Cockpits-Übersicht</h1>
            <p className="text-[14px] text-mute mt-2 max-w-prose">
              Alle <strong>{gruppen.length}</strong> Cockpit-Familien mit insgesamt <strong>{totalReiter}</strong> Reitern.
              Suche nach Stichwort findet quer durch alle Berufe — z.B. „BtM", „Wechselwirkung",
              „Naturheil", „Sterbe-Wache", „Hilfeplan".
            </p>
          </div>
          <Link
            href="/"
            className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 self-start"
          >
            ← Startseite
          </Link>
        </header>

        <CockpitsSearch gruppen={gruppen} />

        <footer className="mt-8 pt-6 border-t border-[rgb(var(--bg-mute))] text-[11px] text-soft">
          <p>Diese Übersicht spiegelt automatisch die <code className="font-mono">CockpitSubNav</code>-Registry. Wer einen neuen Reiter ergänzt, taucht hier auf, ohne Extra-Pflege.</p>
        </footer>
      </div>
    </div>
  );
}
