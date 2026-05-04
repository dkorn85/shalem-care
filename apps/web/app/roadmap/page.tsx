import Link from "next/link";
import type { Metadata } from "next";
import { Wordmark, Logo } from "@/components/Logo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Shalem Care · Was schon läuft, was als nächstes kommt.",
};

type FeatureStatus = "live" | "in_arbeit" | "geplant";

const STATUS_LABEL: Record<FeatureStatus, string> = {
  live: "Live",
  in_arbeit: "In Arbeit",
  geplant: "Geplant",
};
const STATUS_COLOR: Record<FeatureStatus, string> = {
  live: "var(--thu)",
  in_arbeit: "var(--vibe-profile)",
  geplant: "var(--fg-mute)",
};

type Phase = {
  id: string;
  num: string;
  title: string;
  caption: string;
  features: { name: string; status: FeatureStatus; detail?: string }[];
};

const PHASES: Phase[] = [
  {
    id: "p0",
    num: "Phase 0",
    title: "Demo & Foundations",
    caption: "Erste klickbare Demo, vier Rollen, alle Kernflächen.",
    features: [
      { name: "Pflegekraft-Sicht: Dienstplan, Stationsansicht, Klient-Detail",          status: "live" },
      { name: "Tausch-Marktplatz mit ArbZG-Validierung",                                 status: "live" },
      { name: "Lead-Sicht: Übersicht, Disposition, Genehmigungen, Erlös, Doku",          status: "live" },
      { name: "Klient-Sicht: Heute, Anfragen, Bewertung, Verordnungs-Übersicht",        status: "live" },
      { name: "Arzt-Sicht: Praxis, Anfragen, Patient:innen, Verordnungs-Workflow",      status: "live" },
      { name: "Pflege-Doku nach Strukturmodell SIS (13 Themenfelder, Risiko-Marker)",   status: "live" },
      { name: "Komplette Medikamentenliste (BtM, PRISCUS, ATC, PZN)",                   status: "live" },
      { name: "Krankmeldung mit Tele-AU-Stub + Auto-Vertretung mit Bonus",              status: "live" },
      { name: "Burnout-Radar mit automatischem Vergütungs-Aufschlag",                   status: "live" },
      { name: "Schicht-Chat mit KI-Coach + Doku-Stream",                                 status: "live" },
      { name: "Heilkunst-Bibliothek (Kneipp, Hausmittel, Aromatherapie, Schmerzöle)",   status: "live" },
      { name: "Therapie-Vorschläge mit Cochrane/AWMF/DNQP-Quellen",                     status: "live" },
      { name: "Erlös-Berechnung über alle Kostenträger (SGB XI/V/IX/VIII/XII, KiBiZ)",   status: "live" },
      { name: "i18n DE / EN, mobile-tauglich",                                            status: "live" },
    ],
  },
  {
    id: "p1",
    num: "Phase 1",
    title: "Pilot-Tauglichkeit",
    caption: "Was eine erste Einrichtung produktiv brauchen würde.",
    features: [
      { name: "Auth & Identitäten via Keycloak (eGK / HBA-fähig)",                      status: "in_arbeit" },
      { name: "FHIR-Persistenz auf Medplum (alle Resources statt In-Memory)",            status: "in_arbeit" },
      { name: "Audit-Log unmanipulierbar (FHIR Provenance)",                              status: "in_arbeit" },
      { name: "Mandanten-Trennung pro Träger / Genossenschafts-Knoten",                  status: "in_arbeit" },
      { name: "Push-Notifications (Web Push) für aktive Schicht / Krankheits-Vertretung", status: "in_arbeit" },
      { name: "PDF-Export für MDK-Prüfungen",                                              status: "in_arbeit" },
      { name: "Stripe-Connect für genossenschaftliche Auszahlung",                        status: "geplant" },
    ],
  },
  {
    id: "p2",
    num: "Phase 2",
    title: "Echte Schnittstellen",
    caption: "Anbindung an die deutschen Gesundheits-Pipelines.",
    features: [
      { name: "eAU via gematik / TI-Konnektor (KIM-Postfach)",                           status: "geplant" },
      { name: "eRezept-Pipeline (Verordnung → TI → Apotheke)",                            status: "geplant" },
      { name: "ePA-Anbindung (FHIR-Bundle in die elektron. Patientenakte)",              status: "geplant" },
      { name: "GKV-Abrechnungs-Bridge (Modul-Erbringungen → Abrechnungs-Datensatz)",      status: "geplant" },
      { name: "Tele-Doctor-API echte Anbindung (kry, jameda, teleclinic)",              status: "geplant" },
      { name: "Krankenkassen-API echte Anbindung (eAU + Krankengeld § 44 SGB V)",        status: "geplant" },
      { name: "DocCheck/Praxisverzeichnis-Integration",                                    status: "geplant" },
    ],
  },
  {
    id: "p3",
    num: "Phase 3",
    title: "Klientenakte & Skalierung",
    caption: "Voll-FHIR-konforme Akte, mehrere Mandanten, Föderation.",
    features: [
      { name: "Klientenakte mit FHIR Observation, CarePlan, Composition",                 status: "geplant" },
      { name: "Wundverlauf mit Foto-Doku (DICOM-WSI optional)",                            status: "geplant" },
      { name: "Bilanzierungen (Trink/Ess) mit Zeitreihen-DB",                                status: "geplant" },
      { name: "Föderation: Mandanten-Knoten teilen Match-Pool freiwillig",                   status: "geplant" },
      { name: "Open-Source-Roll-out an erste Pilot-Träger",                                  status: "geplant" },
      { name: "Mehrsprachigkeit: TR, AR, RU, UK (für Pflegekräfte mit Migrationshintergrund)", status: "geplant" },
    ],
  },
];

export default async function RoadmapPage() {
  const locale = await getLocale();
  const isEN = locale === "en";
  const liveCount = PHASES.flatMap((p) => p.features).filter((f) => f.status === "live").length;
  const total = PHASES.flatMap((p) => p.features).length;

  return (
    <div className="min-h-screen">
      <nav className="max-w-screen-app mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/willkommen"><Wordmark rainbow /></Link>
        <div className="flex items-center gap-2.5">
          <LocaleSwitcher current={locale} />
          <Link href="/willkommen" className="btn">{isEN ? "Home" : "Startseite"}</Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-10">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-6" />
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Roadmap</p>
        <h1 className="font-display text-[42px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance mb-6">
          {isEN ? <>What's <span className="rainbow-text">live</span>, what's next.</> : <>Was schon läuft, was <span className="rainbow-text">als nächstes</span> kommt.</>}
        </h1>
        <p className="text-[16px] text-mute max-w-2xl leading-relaxed">
          {isEN
            ? `Public roadmap. ${liveCount}/${total} features are already live in the demo. Pilot-readiness in Phase 1, real GKV/TI integrations in Phase 2.`
            : `Öffentliche Roadmap. ${liveCount} von ${total} Funktionen sind bereits in der Demo live. Pilot-Tauglichkeit in Phase 1, echte GKV/TI-Anbindung in Phase 2.`}
        </p>
        <div className="mt-6 surface rounded-xl p-4 inline-flex items-center gap-3 flex-wrap">
          <div className="text-[12px] text-mute">{isEN ? "Live status:" : "Live-Status:"}</div>
          <div className="w-48 h-1.5 rounded-full surface-mute overflow-hidden">
            <div className="h-full" style={{ width: `${(liveCount / total) * 100}%`, background: "rgb(var(--thu))" }} />
          </div>
          <div className="font-mono text-[13px] font-semibold" style={{ color: "rgb(var(--thu))" }}>
            {liveCount}/{total} ({Math.round((liveCount / total) * 100)} %)
          </div>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-12 border-t border-app-soft space-y-12">
        {PHASES.map((phase, pi) => {
          const live = phase.features.filter((f) => f.status === "live").length;
          return (
            <div key={phase.id} className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <p className="text-[11px] uppercase tracking-wider text-soft font-mono">{phase.num}</p>
                <h2 className="font-display text-[28px] font-bold tracking-tight3 mt-1">{phase.title}</h2>
                <p className="text-[14px] text-mute mt-2 leading-relaxed">{phase.caption}</p>
                <p className="text-[11px] text-soft mt-3 font-mono">
                  {live}/{phase.features.length} live
                </p>
              </div>
              <ul className="lg:col-span-8 space-y-1.5">
                {phase.features.map((f, i) => (
                  <li key={i} className="surface rounded-xl p-3 flex items-baseline gap-3 anim-float" style={{ animationDelay: `${(pi * 0.04) + (i * 0.02)}s` }}>
                    <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: `rgb(${STATUS_COLOR[f.status]})` }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium leading-snug">{f.name}</div>
                      {f.detail && <div className="text-[11px] text-soft mt-0.5">{f.detail}</div>}
                    </div>
                    <span className="chip text-[10px] shrink-0" style={{ background: `rgb(${STATUS_COLOR[f.status]} / 0.15)`, color: `rgb(${STATUS_COLOR[f.status]})` }}>
                      {STATUS_LABEL[f.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <footer className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 border-t border-app-soft">
        <div className="rainbow-bar h-0.5 w-full rounded-full mb-6 opacity-60" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={20} className="accent-text" />
            <span className="text-[13px] text-mute">Shalem Care · 2026 · AGPLv3</span>
          </div>
          <div className="flex items-center gap-5 text-[13px] text-mute">
            <Link href="/willkommen" className="hover:text-[rgb(var(--fg))]">{isEN ? "Home" : "Startseite"}</Link>
            <Link href="/ueber-uns" className="hover:text-[rgb(var(--fg))]">{isEN ? "About" : "Über uns"}</Link>
            <Link href="/presse" className="hover:text-[rgb(var(--fg))]">{isEN ? "Press" : "Presse"}</Link>
            <Link href="/datenschutz" className="hover:text-[rgb(var(--fg))]">{isEN ? "Privacy" : "Datenschutz"}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
