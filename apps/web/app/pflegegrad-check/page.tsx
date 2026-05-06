import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { PgCheckWizard } from "@/components/PgCheckWizard";

export const metadata = {
  title: "Pflegegrad-Check · Schätzung in 5 Minuten",
  description:
    "Niedrigschwelliger Selbst-Check auf Basis der NBA-Module. 6 Module, 22 Fragen — am Ende eine Schätzung deines Pflegegrads und der monatlichen Leistungen.",
};

export default function PflegegradCheckPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <Link href="/leistungen" className="btn btn-ghost text-[13px] px-3 py-1.5">
          Leistungen
        </Link>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-10 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Pflegegrad-Schätzer · NBA-Module
        </p>
        <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp" style={{ animationDelay: "0.05s" }}>
          In <span className="rainbow-text">5 Minuten</span> einen Trend.
        </h1>
        <p className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Sechs Module · 22 Fragen · keine Anmeldung · alles bleibt im Browser.
          Am Ende: ein Pflegegrad-Trend mit Leistungs-Übersicht — als Vorbereitung
          für den echten MD-Termin.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="max-w-3xl mx-auto">
          <PgCheckWizard />
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="grid sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
          <article className="surface rounded-2xl p-5">
            <p className="font-mono text-[10px] text-soft mb-1.5">SCHRITT 1</p>
            <h3 className="font-display text-[16px] font-semibold tracking-tight2 mb-1.5">Schätzung machen</h3>
            <p className="text-[12px] text-mute leading-relaxed">
              Du bekommst einen Trend (PG 1–5 oder „kein Pflegegrad") und siehst,
              welche Leistungen monatlich daran hängen.
            </p>
          </article>
          <article className="surface rounded-2xl p-5">
            <p className="font-mono text-[10px] text-soft mb-1.5">SCHRITT 2</p>
            <h3 className="font-display text-[16px] font-semibold tracking-tight2 mb-1.5">Antrag stellen</h3>
            <p className="text-[12px] text-mute leading-relaxed">
              Antrag formlos bei der Pflegekasse einreichen. Reicht ein Anruf, ein
              Brief oder ein Online-Formular — die Kasse beauftragt den MD.
            </p>
          </article>
          <article className="surface rounded-2xl p-5">
            <p className="font-mono text-[10px] text-soft mb-1.5">SCHRITT 3</p>
            <h3 className="font-display text-[16px] font-semibold tracking-tight2 mb-1.5">MD-Termin</h3>
            <p className="text-[12px] text-mute leading-relaxed">
              Begutachtung ca. 60–90 Minuten. Diese Schätzung kannst du als
              Vorbereitung mitnehmen — dein Eindruck zählt im Gespräch.
            </p>
          </article>
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
