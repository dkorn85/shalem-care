// Marketing-Footer mit spaltiger Navigation.
// Unterscheidet sich vom AppShell-Footer (der ist im Cockpit-Kontext);
// dieser Footer kommt auf öffentlichen Seiten (Landing, /willkommen,
// /kontakt, /leistungen, /tarif, /faq, /glossar usw.).

import Link from "next/link";
import { Logo } from "./Logo";

type Spalte = {
  titel: string;
  links: { href: string; label: string; extern?: boolean }[];
};

const SPALTEN: Spalte[] = [
  {
    titel: "Lernen",
    links: [
      { href: "/leistungen",            label: "Leistungen SGB XI" },
      { href: "/pflegegrad-check",      label: "Pflegegrad-Check" },
      { href: "/tarif",                 label: "Tarifrechner" },
      { href: "/pflegekompetenzgesetz", label: "Pflegekompetenzgesetz" },
      { href: "/expertenstandards",     label: "Expertenstandards · DNQP" },
      { href: "/gemeinwohl",            label: "Gemeinwohl-Indikator" },
      { href: "/netz/berufe",           label: "Netz · 13 Rollen" },
      { href: "/glossar",               label: "Glossar" },
      { href: "/faq",                   label: "FAQ" },
    ],
  },
  {
    titel: "Mitmachen",
    links: [
      { href: "/pflegekraft-werden",      label: "Pflegekraft werden" },
      { href: "/traeger-werden",          label: "Träger werden" },
      { href: "/genossenschaft/beitreten",label: "Mitglied werden" },
      { href: "/registrieren/demo",       label: "Demo-Account" },
      { href: "/demo/leben",              label: "Live-Demo · KI-Schicht" },
      { href: "/kontakt",                 label: "Kontakt" },
    ],
  },
  {
    titel: "Plattform",
    links: [
      { href: "/genossenschaft",            label: "Genossenschaft" },
      { href: "/genossenschaft/solidartopf",label: "Solidar-Topf" },
      { href: "/genossenschaft/pool",       label: "Pool" },
      { href: "/netz",                      label: "Netz · Übersicht" },
      { href: "/livemap",                   label: "Live-Map · 24 h" },
      { href: "/system",                    label: "Bundes-Terminal" },
      { href: "/roadmap",                   label: "Roadmap" },
      { href: "/roadmap/pvs",               label: "PVS-Reife · 13 Berufe" },
    ],
  },
  {
    titel: "Berufe + Werkzeuge",
    links: [
      { href: "/apotheke",          label: "Apotheke" },
      { href: "/medizintechnik",    label: "Medizintechnik" },
      { href: "/rettungsdienst",    label: "Rettungsdienst" },
      { href: "/bestatter",         label: "Bestatter" },
      { href: "/begleitung",        label: "Würde-Begleitung" },
      { href: "/ki",                label: "KI · Klartext" },
      { href: "/entwickler",        label: "Entwickler-API" },
    ],
  },
  {
    titel: "Lieferanten + Service",
    links: [
      { href: "/lieferanten",   label: "Lieferanten-Pool" },
      { href: "/lebensmittel",  label: "Lebensmittel + Verpflegung" },
      { href: "/reinigung",     label: "Reinigung + Hygiene" },
      { href: "/recycling",     label: "Recycling + Entsorgung" },
      { href: "/hausmeister",   label: "Hausmeister + Facility" },
    ],
  },
  {
    titel: "Recht + Über",
    links: [
      { href: "/datenschutz", label: "Datenschutz" },
      { href: "/compliance",  label: "Compliance" },
      { href: "/presse",      label: "Presse" },
      { href: "/ueber-uns",   label: "Über uns" },
      { href: "/willkommen",  label: "Willkommen" },
      { href: "https://github.com/dkorn85/shalem-care", label: "Quellcode (AGPLv3)", extern: true },
      { href: "https://merkabaprojekt.de",              label: "Merkaba Project",   extern: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
      <div className="rainbow-bar h-0.5 w-full rounded-full mb-10 opacity-60" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-8 lg:gap-5 mb-10">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-3">
            <Logo size={22} className="accent-text" />
            <span className="font-display font-bold text-[15px] tracking-tight2">Shalem Care</span>
          </div>
          <p className="text-[12px] text-mute leading-relaxed max-w-xs">
            Eine offene Plattform für Pflege, Betreuung und alle, die sich um andere kümmern.
            Genossenschaftlich, FHIR-nativ, AGPLv3.
          </p>
        </div>

        {SPALTEN.map((s) => (
          <nav key={s.titel} aria-labelledby={`footer-${s.titel}`}>
            <p
              id={`footer-${s.titel}`}
              className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium"
            >
              {s.titel}
            </p>
            <ul className="space-y-2">
              {s.links.map((l) => (
                <li key={l.href}>
                  {l.extern ? (
                    <a
                      href={l.href}
                      className="text-[13px] text-mute hover:text-[rgb(var(--fg))] transition"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-[13px] text-mute hover:text-[rgb(var(--fg))] transition"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-app-soft">
        <p className="text-[12px] text-soft font-mono">Shalem Care · 2026 · AGPLv3</p>
        <div className="flex items-center gap-4 text-[12px] text-soft">
          <Link href="/datenschutz" className="hover:text-[rgb(var(--fg))]">Datenschutz</Link>
          <Link href="/compliance" className="hover:text-[rgb(var(--fg))]">Compliance</Link>
          <Link href="/kontakt" className="hover:text-[rgb(var(--fg))]">Kontakt</Link>
        </div>
      </div>
    </footer>
  );
}
