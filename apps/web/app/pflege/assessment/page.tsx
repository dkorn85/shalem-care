// /pflege/assessment · Erfassungs-Werkzeuge für DNQP-Skalen.
// Braden (Dekubitus) · NRS (Schmerz) · MNA-SF (Ernährung) · Tinetti (Sturz).
//
// Direkt im Pflege-Cockpit aufrufbar. Phase 1: Berechnung + Empfehlung
// im Browser, kein Persistenz-Layer. Phase 2: Speicherung in der
// Klient-Akte mit Audit-Trigger + Re-Beurteilungs-Termine im Dienstplan.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import {
  BradenTool,
  NrsTool,
  MnaTool,
  TinettiTool,
} from "@/components/AssessmentTools";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { CURRENT_USER_ID } from "@/lib/seed";

export const metadata = {
  title: "Pflege · Assessment · DNQP-Skalen",
  description:
    "Braden, NRS, MNA, Tinetti — DNQP-relevante Skalen direkt im Pflege-Cockpit. Mit Berechnung, Risikoklasse und sofortigen Empfehlungen.",
};

const STANDARDS = [
  {
    href: "/expertenstandards#dekubitus",
    skala: "Braden-Skala",
    standard: "Dekubitusprophylaxe",
    haeufig: "bei Aufnahme + alle 7 Tage",
    farbe: "var(--mon)",
  },
  {
    href: "/expertenstandards#schmerz-akut",
    skala: "NRS · 0-10",
    standard: "Schmerzmanagement (akut + chronisch)",
    haeufig: "1× pro Schicht bei NRS ≥ 3",
    farbe: "var(--vibe-stats)",
  },
  {
    href: "/expertenstandards#ernaehrung",
    skala: "MNA-SF",
    standard: "Ernährungsmanagement",
    haeufig: "bei Aufnahme + alle 90 Tage",
    farbe: "var(--sun)",
  },
  {
    href: "/expertenstandards#sturz",
    skala: "Tinetti POMA",
    standard: "Sturzprophylaxe",
    haeufig: "alle 6 Monate + nach Sturz",
    farbe: "var(--sat)",
  },
];

export default async function PflegeAssessmentPage() {
  const persona = await getActivePersona(CURRENT_USER_ID, "pflege");
  const personId = persona.demoPersonId ?? CURRENT_USER_ID;
  const user = userPropsAus(persona, {
    id: personId,
    name: "Dennis Reuter",
    subtitle: "Pflegefachkraft P7",
    initials: "DR",
  });

  return (
    <AppShell role="nurse" user={user} station="Pulmologie 3B Essen">
      <RolePastelHeader
        rolle="pflege"
        eyebrow="Pflege · Assessment-Werkzeuge"
        titel="DNQP-Skalen, gerechnet."
        loopSrc="/loops/atmo-pflege.mp4"
        patternSrc="/patterns/sage-glass.png"
      >
        Vier Standard-Skalen interaktiv. Punkte berechnen sich live, Risiko-Klasse + Empfehlungen kommen sofort. Re-Beurteilungs-Termine landen Phase 2 im Dienstplan.
      </RolePastelHeader>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STANDARDS.map((s) => (
          <Link
            key={s.skala}
            href={s.href}
            className="surface-hover rounded-2xl p-4 block"
            style={{ borderTop: `3px solid rgb(${s.farbe})` }}
          >
            <p
              className="font-mono text-[10px] uppercase tracking-wider mb-1"
              style={{ color: `rgb(${s.farbe})` }}
            >
              DNQP · {s.standard}
            </p>
            <h3 className="font-display text-[15px] font-bold tracking-tight2">
              {s.skala}
            </h3>
            <p className="text-[11px] text-soft mt-1.5 font-mono">{s.haeufig}</p>
          </Link>
        ))}
      </section>

      <div className="space-y-5">
        <BradenTool />
        <NrsTool />
        <MnaTool />
        <TinettiTool />
      </div>

      <section className="mt-6 surface rounded-2xl p-5" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
        <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-1">
          Phase 2 · was als Nächstes kommt
        </p>
        <ul className="space-y-1.5 mt-2">
          <li className="text-[13px] text-mute leading-relaxed flex items-start gap-2">
            <span aria-hidden className="accent-text">→</span>
            <span>Persistenz pro Klient:in in der Akte (mit Audit-Trigger)</span>
          </li>
          <li className="text-[13px] text-mute leading-relaxed flex items-start gap-2">
            <span aria-hidden className="accent-text">→</span>
            <span>Re-Beurteilungs-Termine landen automatisch im Dienstplan</span>
          </li>
          <li className="text-[13px] text-mute leading-relaxed flex items-start gap-2">
            <span aria-hidden className="accent-text">→</span>
            <span>{"Lieferanten-Auslöser: Tinetti < 7 → Hausmeister-Auftrag · MNA < 11 → Lebensmittel-Konsil"}</span>
          </li>
          <li className="text-[13px] text-mute leading-relaxed flex items-start gap-2">
            <span aria-hidden className="accent-text">→</span>
            <span>MD-Audit-Export: alle Skalen-Verläufe pro Klient als PDF</span>
          </li>
        </ul>
      </section>
    </AppShell>
  );
}
