// /pflege/assessment · Erfassungs-Werkzeuge für DNQP-Skalen.
// Braden (Dekubitus) · NRS (Schmerz) · MNA-SF (Ernährung) · Tinetti (Sturz).
//
// Direkt im Pflege-Cockpit aufrufbar. Phase 1: Berechnung + Empfehlung
// im Browser, kein Persistenz-Layer. Phase 2: Speicherung in der
// Klient-Akte mit Audit-Trigger + Re-Beurteilungs-Termine im Dienstplan.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
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

      <LerneTipp rolle="pflege" titel="Wozu Assessment-Skalen?">
        Skalen <em>messen</em>, was sonst Bauchgefühl wäre — und machen es auditierbar.
        <strong> Braden</strong>: Dekubitus-Risiko (6–23 Punkte; ≤ 18 = Risiko).
        <strong> NRS</strong>: Schmerz 0–10 (≥ 4 = handlungspflichtig nach DNQP).
        <strong> MNA-SF</strong>: Mangelernährung Kurz-Screen (≤ 11 = Risiko).
        <strong> Tinetti POMA</strong>: Sturzrisiko (≤ 19 von 28 = hohes Risiko).
        Alle vier sind <strong>DNQP-pflichtig</strong> bei MD-Audit. Bei kritischen Werten
        triggern sie automatisch Pflegeplan-Anpassung + ggf. Hausmeister-/Konsil-Auftrag.
      </LerneTipp>

      <NurAbProfi rolle="pflege">
        <section className="surface rounded-2xl p-4 mb-6" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Pflegeprofi · Re-Assessment-Frequenzen</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Braden</p>
              <p className="font-display text-[14px] font-bold tracking-tight2">7 Tage</p>
              <p className="text-[10px] text-soft">+ nach jedem Statuswechsel</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">NRS</p>
              <p className="font-display text-[14px] font-bold tracking-tight2">je Schicht</p>
              <p className="text-[10px] text-soft">bei NRS ≥ 3 zwingend</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">MNA-SF</p>
              <p className="font-display text-[14px] font-bold tracking-tight2">90 Tage</p>
              <p className="text-[10px] text-soft">+ bei Aufnahme</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Tinetti</p>
              <p className="font-display text-[14px] font-bold tracking-tight2">6 Monate</p>
              <p className="text-[10px] text-soft">+ nach jedem Sturz-Event</p>
            </div>
          </div>
          <p className="text-[10px] text-soft mt-2 italic">
            Frist-Trigger landen automatisch im Dienstplan-HUD, MD-Audit-Hunt prüft die
            Lückenlosigkeit (vgl. /admin/audit/hunt).
          </p>
        </section>
      </NurAbProfi>

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
