import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { GlossarFilter } from "@/components/GlossarFilter";
import { GLOSSAR } from "@/lib/glossar/eintraege";

export const metadata = {
  title: "Glossar · Pflege-Begriffe in Klartext",
  description:
    "30+ Pflege-Begriffe — von AÜG bis VKE — in einer Sprache, die dich nicht ausschließt. Such-Filter und Kategorien helfen, schnell das Richtige zu finden.",
};

export default function GlossarPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <Link href="/kontakt" className="btn btn-ghost text-[13px] px-3 py-1.5">
          Kontakt
        </Link>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-8 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Glossar · {GLOSSAR.length} Begriffe in Klartext
        </p>
        <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Pflege-Sprache, die <span className="rainbow-text">nicht ausschließt</span>.
        </h1>
        <p className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          PG, NBA, ePA, AÜG — wir erklären, was hinter den Kürzeln steckt.
          Such oder filtere nach Kategorie. Wenn ein Begriff hier fehlt, schreib uns.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="max-w-3xl mx-auto">
          <GlossarFilter />
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="surface rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Begriff fehlt?
          </p>
          <h3 className="font-display text-[22px] font-bold tracking-tight2 mb-2">
            Schreib uns, wir nehmen ihn auf.
          </h3>
          <p className="text-[13px] text-mute leading-relaxed mb-4">
            Das Glossar wächst mit den Fragen, die uns gestellt werden. Wenn du
            einen Begriff in der Pflege gehört hast und nicht sicher bist, was er
            bedeutet — sag Bescheid. Wir nehmen ihn in der nächsten Woche auf.
          </p>
          <a
            href="mailto:hello@shalem.de?subject=Glossar%20·%20Begriff%20fehlt"
            className="btn btn-primary text-[14px] px-4 py-2 inline-block"
          >
            Begriff vorschlagen
          </a>
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
