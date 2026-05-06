import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { TarifRechner } from "@/components/TarifRechner";

export const metadata = {
  title: "Tarifrechner · Verleiher vs. Genossenschaft",
  description:
    "Wie viel mehr Honorar bleibt bei der Pflegekraft, wenn der Plattform-Cut 4 % statt 30–50 % beträgt? Stundensatz und Stunden eingeben — der Unterschied wird sichtbar.",
};

export default function TarifPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <Link href="/genossenschaft" className="btn btn-ghost text-[13px] px-3 py-1.5">
          Genossenschaft
        </Link>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-10 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Tarifrechner · 4 % vs. 30–50 %
        </p>
        <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Wo bleibt das <span className="rainbow-text">Geld</span>?
        </h1>
        <p className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Bei klassischen Honorar-Verleihern wandern 30–50 % als Marge zur
          Plattform. Bei einer Genossenschaft bleibt fast alles bei der
          Pflegekraft. Hier siehst du den Unterschied in Euro.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="max-w-3xl mx-auto">
          <TarifRechner />
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Was Shalem mit den 4 % macht</p>
          <h2 className="font-display text-[26px] sm:text-[32px] font-bold tracking-tight3 leading-[1.1] mb-5">
            Vier Prozent. Geöffnet.
          </h2>
          <ul className="space-y-3 text-[14px]">
            <li className="surface-hover rounded-xl p-4 flex items-baseline gap-3">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--vibe-team))" }} />
              <div>
                <strong className="font-medium">2 % Betrieb</strong>
                <p className="text-[12px] text-mute mt-0.5 leading-relaxed">
                  Server, Entwicklung, Support, Compliance, Datenschutz —
                  open source unter AGPLv3, Code auf GitHub einsehbar.
                </p>
              </div>
            </li>
            <li className="surface-hover rounded-xl p-4 flex items-baseline gap-3">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--vibe-stats))" }} />
              <div>
                <strong className="font-medium">1 % Rücklage</strong>
                <p className="text-[12px] text-mute mt-0.5 leading-relaxed">
                  Genossenschafts-Reserve nach § 7 GenG. Insolvenz-Schutz,
                  Liquiditäts-Puffer, langfristige Stabilität.
                </p>
              </div>
            </li>
            <li className="surface-hover rounded-xl p-4 flex items-baseline gap-3">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--thu))" }} />
              <div>
                <strong className="font-medium">1 % Ausschüttungspool</strong>
                <p className="text-[12px] text-mute mt-0.5 leading-relaxed">
                  Geht zurück an die Mitglieder. Quartalsweise, transparent —
                  jede:r mit Geschäftsanteil bekommt einen Anteil.
                </p>
              </div>
            </li>
          </ul>

          <div className="surface rounded-2xl p-5 sm:p-6 mt-7">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Vorbild</p>
            <p className="text-[14px] text-mute leading-relaxed">
              Mondragon Corporación Cooperativa (Baskenland, 80.000 Mitglieder)
              und Smart eG (Berlin, 10.000 Mitglieder). Beide zeigen seit
              Jahrzehnten: Plattform-Cut + Mitbestimmung schließen sich nicht aus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-8">
            <Link href="/genossenschaft/beitreten" className="btn btn-primary text-[14px] px-4 py-2">
              Mitglied werden
            </Link>
            <Link href="/genossenschaft" className="btn btn-ghost text-[14px] px-4 py-2">
              Wie das funktioniert
            </Link>
            <Link href="/kontakt" className="btn btn-ghost text-[14px] px-4 py-2">
              Träger-Kontakt
            </Link>
          </div>
        </div>
      </section>

      <footer className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-8">
        <div className="rainbow-bar h-0.5 w-full rounded-full opacity-60" />
        <p className="text-[12px] text-soft mt-4 font-mono text-center">
          Shalem Care · 2026 · AGPLv3
        </p>
      </footer>
    </main>
  );
}
