import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { PgCheckWizard } from "@/components/PgCheckWizard";
import { SiteFooter } from "@/components/SiteFooter";

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

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/pflegegrad-check/sprint"
            className="block rounded-2xl p-5 transition-all hover:scale-[1.01] active:scale-[0.99] mb-6"
            style={{
              background: "linear-gradient(135deg, rgb(var(--vibe-stats) / 0.15), rgb(var(--accent) / 0.10))",
              border: "2px solid rgb(var(--vibe-stats) / 0.4)",
            }}
          >
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-stats))" }}>
                  ⚡ Vollbild-Quiz mit Live-PG-Prognose
                </p>
                <h2 className="font-display text-[20px] font-bold tracking-tight2">
                  NBA-Sprint starten →
                </h2>
                <p className="text-[13px] text-mute mt-1">
                  Eine Frage pro Bildschirm · Tastatur 1–4 · Fanfare bei
                  PG-Schwellen-Sprung · Konfetti am Ende.
                </p>
              </div>
              <div className="flex gap-1.5 text-[11px] font-mono">
                <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">22 Fragen</span>
                <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">Live-Score</span>
                <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">5 Min</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono text-center mb-3">
            Oder klassisch · Wizard-Form
          </p>
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

      <SiteFooter />
    </main>
  );
}
