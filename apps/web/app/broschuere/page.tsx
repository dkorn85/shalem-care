// /broschuere · Index-Page mit den 3 Varianten + direktem Drucken-Hint.

import Link from "next/link";
import Image from "next/image";
import { Wordmark } from "@/components/Logo";

export const metadata = {
  title: "Broschüren · Shalem Care",
  description: "Drei Falt-Flyer in einfacher Sprache — pro Nutzungsebene eine.",
};

const VARIANTEN = [
  {
    href: "/broschuere/klient",
    eyebrow: "Für Bewohner:innen + Angehörige",
    titel: "Pflege, die zu dir gehört.",
    untertitel: "Was Shalem für dich tut, wenn du gepflegt wirst.",
    farbe: "var(--accent)",
    bild: "/broschuere/hero.png",
  },
  {
    href: "/broschuere/pflege",
    eyebrow: "Für Pflegekräfte + Therapeut:innen",
    titel: "Du pflegst. Wir nehmen dir das Tippen ab.",
    untertitel: "Diktat statt SIS-Klick-Wege. Tour KI-optimiert. NANDA-Plan-Generator.",
    farbe: "var(--mon)",
    bild: "/broschuere/pflege-diktat.png",
  },
  {
    href: "/broschuere/traeger",
    eyebrow: "Für Träger + PDL + Aufsichtsrat",
    titel: "Vom Verwalter zum Vermehrer.",
    untertitel: "Eine Plattform statt sieben Modul-Käufe. Genossenschaft statt Konzern.",
    farbe: "var(--vibe-team)",
    bild: "/broschuere/traeger-hero.png",
  },
];

export default function BroschurenIndex() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "rgb(var(--bg-mute))" }}>
      <header className="px-6 sm:px-12 py-8 max-w-screen-xl w-full mx-auto">
        <Link href="/" className="block mb-3"><Wordmark rainbow /></Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Drei Falt-Flyer · DIN A4 quer · Mittelfalz · druckbereit
        </p>
        <h1 className="font-display text-[34px] sm:text-[44px] font-bold tracking-tight2 leading-[1.05]" style={{ color: "rgb(var(--accent))" }}>
          Broschüren
        </h1>
        <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
          Pro Zielgruppe eine eigene Broschüre. Klick öffnet die Druck-Vorschau —
          oben links der Drucken-Button, A4 quer, beidseitig, Wenden entlang langer
          Kante, 100 % Skalierung. In der Mitte falten = fertiger 4-Felder-Wickelfalz.
        </p>
      </header>

      <main className="flex-1 px-6 sm:px-12 pb-12 max-w-screen-xl w-full mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VARIANTEN.map((v) => (
            <Link
              key={v.href} href={v.href}
              className="block surface rounded-2xl overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg"
              style={{
                boxShadow: `0 4px 14px rgb(${v.farbe} / 0.12), 0 0 0 1px rgb(var(--border-soft))`,
              }}
            >
              <div className="relative aspect-[3/2]">
                <Image src={v.bild} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `rgb(${v.farbe})` }}>
                  {v.eyebrow}
                </p>
                <h2 className="font-display text-[20px] font-bold tracking-tight2 mt-1.5 leading-tight" style={{ color: `rgb(${v.farbe})` }}>
                  {v.titel}
                </h2>
                <p className="text-[12.5px] text-mute mt-2 leading-relaxed">
                  {v.untertitel}
                </p>
                <p className="text-[11px] mt-3 font-medium" style={{ color: `rgb(${v.farbe})` }}>
                  Öffnen + drucken →
                </p>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-10 surface rounded-2xl p-5 max-w-2xl">
          <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-2">
            Druck-Hinweis
          </p>
          <ul className="space-y-1.5 text-[12px] text-mute">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Format <strong>A4 quer</strong> · Skalierung <strong>100 %</strong> · Ränder <strong>Standard</strong> oder <strong>Keine</strong></span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Beidseitig</strong> · Wende-Methode: <strong>entlang langer Kante</strong> (sonst stehen Außen + Innen verkehrt)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Nach dem Druck <strong>in der Mitte falten</strong> (gestrichelte Falz-Linie als Hilfe)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Empfehlung: 130–170 g/m² Papier (matt, unbeschichtet) · für Werbeständer</span></li>
          </ul>
        </section>
      </main>
    </div>
  );
}
