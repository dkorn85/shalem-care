import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

const PORTALS = [
  { href: "/pflege",         label: "Pflege",         vibe: "var(--mon)",          hint: "Dienstplan, Tour, SIS-Diktat" },
  { href: "/sozial",         label: "Sozial",         vibe: "var(--tue)",          hint: "Hilfeplan, MD-Begutachtung" },
  { href: "/erziehung",      label: "Erziehung",      vibe: "var(--wed)",          hint: "Gruppen & Lerngeschichten" },
  { href: "/therapie",       label: "Therapie",       vibe: "var(--fri)",          hint: "Heute, Patient:innen, Abrechnung" },
  { href: "/heilerziehung",  label: "Heilerziehung",  vibe: "var(--sat)",          hint: "BTHG-Teilhabe, Tagesstruktur" },
  { href: "/hauswirtschaft", label: "Hauswirtschaft", vibe: "var(--sun)",          hint: "Speiseplan, Reinigung, Einkauf" },
  { href: "/ehrenamt",       label: "Ehrenamt",       vibe: "var(--thu)",          hint: "Begleitung & Protokoll" },
  { href: "/arzt",           label: "Arzt:in",        vibe: "var(--vibe-team)",    hint: "Praxis, Anfragen, Patient:innen" },
  { href: "/klient",         label: "Klient:in",      vibe: "var(--vibe-profile)", hint: "Akte, Tagesfeed, Buchen" },
  { href: "/admin",          label: "Leitung",        vibe: "var(--vibe-plan)",    hint: "PDL · KI-HUD · Genehmigungen" },
];

const STEPS = [
  { n: "1", title: "Wähle dein Portal",         body: "Jeder Beruf hat ein eigenes Cockpit — auf das Wesentliche reduziert." },
  { n: "2", title: "Probiere ohne Anmeldung",   body: "Im Demo-Modus sind alle Daten erfunden. Klick dich frei durch." },
  { n: "3", title: "Werde Mitglied",            body: "Pflegekraft, Klient:in oder Träger — Genossenschaft trägt alle." },
];

export default function Willkommen() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <Link href="/anmelden" className="btn btn-ghost text-[13px] px-3 py-1.5">
          Anmelden
        </Link>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-12 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Willkommen bei Shalem Care
        </p>
        <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Schön, dass du <span className="rainbow-text">da bist</span>.
        </h1>
        <p className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Eine offene Plattform für Pflege, Betreuung und alle, die sich um andere kümmern.
          Wähle dein Portal — du kannst jederzeit wechseln.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PORTALS.map((p, i) => (
            <li key={p.href} className="anim-slideUp" style={{ animationDelay: `${0.15 + i * 0.03}s` }}>
              <Link
                href={p.href}
                className="surface-hover rounded-2xl p-4 block relative overflow-hidden h-full"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                  style={{ background: `rgb(${p.vibe})` }}
                />
                <div className="ml-2.5">
                  <div className="text-[14px] font-medium leading-tight">{p.label}</div>
                  <p className="text-[11px] text-mute mt-1.5 leading-snug">{p.hint}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div className="grid sm:grid-cols-3 gap-3">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="surface rounded-2xl p-5 anim-float"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="font-mono text-[11px] text-soft mb-2">SCHRITT {s.n}</div>
              <h3 className="font-display text-[17px] font-semibold tracking-tight2 mb-2">{s.title}</h3>
              <p className="text-[13px] text-mute leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-10">
          <Link href="/registrieren" className="btn btn-primary text-[14px] px-4 py-2">
            Mitglied werden
          </Link>
          <Link href="/genossenschaft" className="btn btn-ghost text-[14px] px-4 py-2">
            Wie die Genossenschaft funktioniert
          </Link>
          <Link href="/leistungen" className="btn btn-ghost text-[14px] px-4 py-2">
            Was steht mir zu?
          </Link>
          <Link href="/pflegegrad-check" className="btn btn-ghost text-[14px] px-4 py-2">
            Pflegegrad-Check
          </Link>
          <Link href="/tarif" className="btn btn-ghost text-[14px] px-4 py-2">
            Tarifrechner
          </Link>
          <Link href="/glossar" className="btn btn-ghost text-[14px] px-4 py-2">
            Glossar
          </Link>
          <Link href="/faq" className="btn btn-ghost text-[14px] px-4 py-2">
            FAQ
          </Link>
          <Link href="/roadmap" className="btn btn-ghost text-[14px] px-4 py-2">
            Roadmap
          </Link>
          <Link href="/kontakt" className="btn btn-ghost text-[14px] px-4 py-2">
            Kontakt
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
