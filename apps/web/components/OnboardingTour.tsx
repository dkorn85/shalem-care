// OnboardingTour — vier vertikale 12-s-Loops + ein Bonus,
// die einen ersten User durch die Plattform führen.
//
// Loops liegen in /loops/onboarding-*.mp4 (Block 24 aus
// ASSETS_LIVEDEMO_2.md). Jeder Loop hat eine kleine
// Begleit-Caption + Link ins passende Cockpit.

import Link from "next/link";

const TOUR = [
  {
    titel: "Klient bucht selbst",
    pfad: "/klient/buchen",
    loop: "/loops/onboarding-klient-self-booker.mp4",
    cta: "Self-Booker testen",
    farbe: "var(--wed)",
    untertitel: "Pflegegrad ≥ 2 · transparente Marktpreise · Wunsch-Pflegekraft.",
  },
  {
    titel: "Pflege wechselt Schicht",
    pfad: "/pflege",
    loop: "/loops/onboarding-pflege-schichtplan.mp4",
    cta: "Schichtplan ansehen",
    farbe: "var(--mon)",
    untertitel: "ArbZG-Check, Tausch-Marktplatz, ein Klick zur Genehmigung.",
  },
  {
    titel: "Konferenz mitlaufen",
    pfad: "/konferenz/konf-helga-q2",
    loop: "/loops/onboarding-konferenz-beobachten.mp4",
    cta: "Konferenz öffnen",
    farbe: "var(--accent)",
    untertitel: "Pre-Reads aller Berufe · Live-Notizen · Beschluss-Composer.",
  },
  {
    titel: "Beitritt zur Genossenschaft",
    pfad: "/genossenschaft/beitreten",
    loop: "/loops/onboarding-genossenschaft-beitritt.mp4",
    cta: "Beitreten",
    farbe: "var(--vibe-stats)",
    untertitel: "Anteilszeichnung ab 100 € · Stimmrecht · Quartals-Ausschüttung.",
  },
  {
    titel: "Notruf — beruhigt",
    pfad: "/notfall",
    loop: "/loops/onboarding-notfall-beruhigt.mp4",
    cta: "Eskalations-Kette",
    farbe: "var(--fri)",
    untertitel: "Ein warmes Licht · keine Panik · jemand ist da binnen 60 Sekunden.",
  },
];

export function OnboardingTour() {
  return (
    <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-app-soft">
      <header className="mb-6 max-w-prose">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Eine Minute · fünf Geschichten</p>
        <h2 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2 leading-tight">
          So fühlt sich die Plattform <span className="rainbow-text">in Bewegung</span> an.
        </h2>
        <p className="text-[14px] text-mute mt-3 leading-relaxed">
          Jeder Loop zeigt einen typischen Moment auf der Plattform — von Klient:in selbst buchend
          bis zum Notruf. Klicke einen, um das passende Cockpit zu öffnen.
        </p>
      </header>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TOUR.map((t) => (
          <li key={t.pfad}>
            <Link
              href={t.pfad}
              className="surface-hover rounded-2xl block overflow-hidden relative h-full"
            >
              <div className="relative aspect-[9/16] bg-[rgb(var(--bg-mute))]">
                <video
                  src={t.loop}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  aria-hidden
                />
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "linear-gradient(to top, rgb(var(--bg) / 0.85), transparent)" }} />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-display text-[13px] sm:text-[14px] font-bold tracking-tight2 leading-tight">{t.titel}</p>
                  <p className="text-[10px] text-mute mt-1 leading-snug line-clamp-2">{t.untertitel}</p>
                </div>
              </div>
              <div className="px-3 py-2 relative">
                <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: `rgb(${t.farbe})` }} />
                <span className="ml-2.5 text-[11px] font-medium" style={{ color: `rgb(${t.farbe})` }}>{t.cta} →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
