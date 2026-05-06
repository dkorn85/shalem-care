import Link from "next/link";
import { Wordmark } from "@/components/Logo";

const PORTALS = [
  { href: "/pflege",        label: "Pflege",        vibe: "var(--mon)" },
  { href: "/sozial",        label: "Sozial",        vibe: "var(--tue)" },
  { href: "/erziehung",     label: "Erziehung",     vibe: "var(--wed)" },
  { href: "/therapie",      label: "Therapie",      vibe: "var(--fri)" },
  { href: "/heilerziehung", label: "Heilerziehung", vibe: "var(--sat)" },
  { href: "/hauswirtschaft",label: "Hauswirtschaft",vibe: "var(--sun)" },
  { href: "/ehrenamt",      label: "Ehrenamt",      vibe: "var(--thu)" },
  { href: "/admin",         label: "Leitung",       vibe: "var(--vibe-plan)" },
];

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 flex-1 flex flex-col items-center justify-center py-12 sm:py-20 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          404 · Diese Seite ist noch nicht da
        </p>
        <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-2xl anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Hier <span className="rainbow-text">bauen wir noch</span>.
        </h1>
        <p className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-lg leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Diese Stelle ist gerade in Arbeit oder der Link ist abgelaufen.
          Kein Grund zur Sorge — du findest dich gleich wieder zurecht.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 anim-slideUp" style={{ animationDelay: "0.18s" }}>
          <Link href="/" className="btn btn-primary text-[14px] px-4 py-2">
            Zur Startseite
          </Link>
          <Link href="/roadmap" className="btn btn-ghost text-[14px] px-4 py-2">
            Roadmap ansehen
          </Link>
        </div>

        <div className="w-full max-w-2xl mt-14 anim-slideUp" style={{ animationDelay: "0.25s" }}>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
            Oder direkt in ein Portal
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PORTALS.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="surface-hover rounded-xl px-3 py-2.5 flex items-center gap-2.5 text-[13px] font-medium"
                >
                  <span
                    aria-hidden
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: `rgb(${p.vibe})` }}
                  />
                  <span>{p.label}</span>
                </Link>
              </li>
            ))}
          </ul>
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
