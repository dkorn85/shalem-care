import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import {
  STANDARDS,
  BERUF_LABEL,
  BERUF_EMOJI,
  type Beruf,
} from "@/lib/expertenstandards/dnqp";

export const metadata = {
  title: "Expertenstandards · DNQP nach SGB XI § 113a",
  description:
    "Alle 11 DNQP-Expertenstandards mit den beteiligten Berufen und Lieferanten. Auslieferungsniveau für Pflege ab Tag 1.",
};

const ROLLE_FARBE: Record<"lead" | "co" | "support", string> = {
  lead: "var(--vibe-approval)",
  co: "var(--accent)",
  support: "var(--vibe-team)",
};

const ROLLE_LABEL: Record<"lead" | "co" | "support", string> = {
  lead: "Lead",
  co: "Co",
  support: "Support",
};

const BERUF_HREF: Partial<Record<Beruf, string>> = {
  pflege: "/pflege/heute",
  arzt: "/arzt/heute",
  therapie: "/therapie/heute",
  sozial: "/sozial",
  heilerziehung: "/heilerziehung",
  hauswirtschaft: "/hauswirtschaft",
  ehrenamt: "/ehrenamt",
  hausmeister: "/hausmeister",
  reinigung: "/reinigung",
  recycling: "/recycling",
  lebensmittel: "/lebensmittel",
  kasse: "/kasse",
  stationsleitung: "/admin",
};

export default function ExpertenstandardsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/gemeinwohl" className="btn btn-ghost text-[13px] px-3 py-1.5">
            GWÖ-Indikator
          </Link>
          <Link href="/lieferanten" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Lieferanten
          </Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-10 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          DNQP-Expertenstandards · SGB XI § 113a
        </p>
        <h1
          className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp"
          style={{ animationDelay: "0.05s" }}
        >
          Auslieferungsniveau ab <span className="rainbow-text">Tag 1</span>.
        </h1>
        <p
          className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp"
          style={{ animationDelay: "0.1s" }}
        >
          {STANDARDS.length} Expertenstandards des Deutschen Netzwerks für
          Qualitätsentwicklung in der Pflege (Hochschule Osnabrück). Rechtsgrund­
          lage SGB XI § 113a — die MD-Qualitätsprüfung fragt sie 1:1 ab. Wir
          mappen jeden Standard auf die beteiligten Berufe + Lieferanten.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <nav className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {STANDARDS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition surface-hover"
            >
              {s.titel.split(" · ")[0].replace("Pflege von Menschen mit", "Pflege bei").replace("Erhalt und Förderung der", "").replace("Erhaltung und Förderung der", "").trim()}
            </a>
          ))}
        </nav>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="space-y-8 max-w-4xl mx-auto">
          {STANDARDS.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="surface rounded-2xl p-6 sm:p-7 scroll-mt-24"
            >
              <header className="mb-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-1">
                  {s.rechtsgrundlage} · {s.jahr}
                </p>
                <h2 className="font-display text-[22px] sm:text-[26px] font-bold tracking-tight2">
                  {s.titel}
                </h2>
                <p className="text-[14px] text-mute mt-3 leading-relaxed">
                  {s.inhaltKurz}
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <section>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-2">
                    5-Schritt-Verfahren · DNQP
                  </p>
                  <ol className="space-y-1.5">
                    {s.schritte.map((schritt, i) => (
                      <li
                        key={i}
                        className="text-[13px] text-mute leading-relaxed flex items-start gap-2"
                      >
                        <span className="font-mono text-[11px] text-soft shrink-0 mt-0.5">
                          {i + 1}.
                        </span>
                        <span>{schritt}</span>
                      </li>
                    ))}
                  </ol>
                </section>
                <section>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-2">
                    Trigger im Alltag
                  </p>
                  <ul className="space-y-1.5">
                    {s.trigger.map((t, i) => (
                      <li
                        key={i}
                        className="text-[13px] text-mute leading-relaxed flex items-start gap-2"
                      >
                        <span aria-hidden className="text-soft shrink-0 mt-0.5">·</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="mt-6">
                <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-2">
                  Beteiligte Berufe + Lieferanten
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.berufe.map((b) => {
                    const farbe = ROLLE_FARBE[b.rolle];
                    const href = BERUF_HREF[b.beruf];
                    const inner = (
                      <span
                        className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full font-medium transition"
                        style={{
                          background: `rgb(${farbe} / 0.12)`,
                          color: `rgb(${farbe})`,
                        }}
                      >
                        <span aria-hidden>{BERUF_EMOJI[b.beruf]}</span>
                        <span>{BERUF_LABEL[b.beruf]}</span>
                        <span className="font-mono text-[10px] uppercase tracking-wider opacity-70">
                          {ROLLE_LABEL[b.rolle]}
                        </span>
                      </span>
                    );
                    return href ? (
                      <Link key={b.beruf + b.rolle} href={href}>
                        {inner}
                      </Link>
                    ) : (
                      <span key={b.beruf + b.rolle}>{inner}</span>
                    );
                  })}
                </div>
              </section>

              <section className="mt-6">
                <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-2">
                  Audit-Indikatoren · MD-Prüfung
                </p>
                <ul className="space-y-1.5">
                  {s.audit.map((a, i) => (
                    <li
                      key={i}
                      className="text-[13px] text-mute leading-relaxed flex items-start gap-2"
                    >
                      <span aria-hidden className="text-soft shrink-0 mt-0.5">✓</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <p className="text-[11px] text-soft font-mono mt-5 pt-4 border-t border-app-soft">
                Quellen: {s.quellen.join(" · ")}
              </p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
