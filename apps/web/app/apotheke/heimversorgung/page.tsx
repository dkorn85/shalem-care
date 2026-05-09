// /apotheke/heimversorgung · § 12a ApoG · Versorgungsvertrag.
//
// Patientenindividuelle Verblisterung + Stellplan + AMTS-Risiko-Score
// (PRISCUS, FORTA, START/STOPP-Kriterien) für Pflegeeinrichtungen.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { HEIM_BEWOHNER, type HeimBewohner } from "@/lib/apotheke/heimversorgung";

export const metadata = {
  title: "Heimversorgung · Apotheke",
  description: "Patientenindividuelle Verblisterung · AMTS-Risikoscore · Stellplan · § 12a ApoG",
};

export default function HeimversorgungPage() {
  const total = HEIM_BEWOHNER.length;
  const hochRisiko = HEIM_BEWOHNER.filter((b) => (b.amtsScore ?? 0) >= 6).length;
  const totalMeds = HEIM_BEWOHNER.reduce((s, b) => s + summeMeds(b), 0);
  const offenLieferungen = HEIM_BEWOHNER.filter((b) => +new Date(b.naechsteLieferung) <= Date.now() + 7 * 86400000).length;

  return (
    <AppShell role="apotheke" user={{ id: "apo-001", name: "Lukas Faber", subtitle: "Apothekenleitung", initials: "LF" }} station="Heimversorgung">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/apotheke" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Apotheke
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">§ 12a ApoG · AMTS-Aktionsplan · PRISCUS / FORTA / STOPP-START</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Heimversorgung</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Wochen-Verblisterung pro Bewohner:in mit AMTS-Score (Polypharmazie-Risiko),
          patientenspezifischen Hinweisen für die Pflege und Lieferplan.
        </p>
      </header>

      <LerneTipp rolle="apotheke" titel="Was ist AMTS?">
        Arzneimittel-Therapie-Sicherheit. Der <strong>BMG-Aktionsplan AMTS</strong> ist seit 2010
        fortlaufend. Drei Werkzeuge: <strong>PRISCUS-Liste</strong> (potenziell ungeeignet bei
        ≥65 J.), <strong>FORTA</strong> (Fit-for-the-Aged Klassifikation A-D), <strong>STOPP-START</strong>
        (Stop-old/Start-missing-Indikatoren). Apotheke + Hausarzt + Pflege bilden die
        AMTS-Triade. Verblisterung mit Re-Identifikations-Print verhindert Verwechslung
        bei multimorbiden Bewohner:innen.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Bewohner:innen" value={total}              farbe="var(--vibe-team)" />
        <CockpitKpi label="Medikamenten-Pos." value={totalMeds}        hint="ohne PRN" farbe="var(--vibe-stats)" />
        <CockpitKpi label="AMTS hoch (≥6)"  value={hochRisiko}        farbe={hochRisiko > 0 ? "var(--mon)" : "var(--thu)"} />
        <CockpitKpi label="Lieferung 7T"    value={offenLieferungen}   hint="diese Woche fällig" farbe="var(--accent)" />
      </div>

      <NurAbProfi rolle="apotheke">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Beratungspflicht-Workflow</p>
          <p className="text-[12px] text-mute leading-relaxed text-pretty">
            Für jede:n Heim-Bewohner:in einmal jährlich <strong>Polypharmazie-Check</strong> mit
            Hausarzt (Medikationsplan-Update). Bei AMTS-Score ≥6 zusätzlich quartalsweise
            <strong> AMTS-Konsil</strong> (Apotheke + Pflege + Arzt). Pflege bekommt
            patientenspezifische Hinweise direkt im Stellplan + im Pflege-Cockpit unter
            der Klient:innen-Akte.
          </p>
        </section>
      </NurAbProfi>

      <section className="space-y-3">
        {HEIM_BEWOHNER.map((b) => <BewohnerKarte key={b.id} b={b} />)}
      </section>
    </AppShell>
  );
}

function summeMeds(b: HeimBewohner): number {
  return b.stellplan.morgens.length + b.stellplan.mittags.length + b.stellplan.abends.length + b.stellplan.zurNacht.length;
}

function BewohnerKarte({ b }: { b: HeimBewohner }) {
  const score = b.amtsScore ?? 0;
  const scoreFarbe = score >= 6 ? "var(--mon)" : score >= 4 ? "var(--vibe-approval)" : "var(--thu)";
  const fristTage = Math.ceil((+new Date(b.naechsteLieferung) - Date.now()) / 86400000);
  const fristFarbe = fristTage <= 2 ? "var(--mon)" : fristTage <= 7 ? "var(--vibe-approval)" : "var(--thu)";

  return (
    <article className="surface rounded-2xl p-4" style={{ borderLeft: `3px solid rgb(${scoreFarbe})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-2">
        <h3 className="font-display text-[16px] font-bold tracking-tight2">{b.name}</h3>
        <span className="text-[11px] text-mute">PG {b.pflegeGrad} · {b.einrichtung} · {b.station}</span>
        <span className="chip text-[10px] ml-auto" style={{ background: `rgb(${scoreFarbe} / 0.18)`, color: `rgb(${scoreFarbe})` }}>
          AMTS {score}/10
        </span>
        <span className="chip text-[10px]" style={{ background: `rgb(${fristFarbe} / 0.15)`, color: `rgb(${fristFarbe})` }}>
          Lieferung {fristTage <= 0 ? "überfällig" : `in ${fristTage} T`}
        </span>
      </header>

      <p className="text-[11px] text-mute mb-2">
        Verordnet: {b.arzt} · Ø Diagnosen: {b.diagnosen.join(" · ")}
      </p>

      <div className="grid sm:grid-cols-4 gap-2 text-[11px] mb-2">
        {(["morgens", "mittags", "abends", "zurNacht"] as const).map((zeit) => (
          <div key={zeit} className="surface-mute rounded-lg p-2">
            <p className="text-[9px] uppercase tracking-wider font-mono text-soft mb-1">{zeit === "zurNacht" ? "Nacht" : zeit}</p>
            {b.stellplan[zeit].length === 0
              ? <p className="text-soft italic">—</p>
              : <ul className="space-y-0.5">
                  {b.stellplan[zeit].map((m, i) => <li key={i} className="text-[10px] leading-snug">› {m}</li>)}
                </ul>
            }
          </div>
        ))}
      </div>

      {b.stellplan.bedarf && b.stellplan.bedarf.length > 0 && (
        <div className="text-[11px] mb-2">
          <span className="font-mono text-[10px] text-soft mr-2">b. B.:</span>
          {b.stellplan.bedarf.join(" · ")}
        </div>
      )}

      {b.amtsHinweise && b.amtsHinweise.length > 0 && (
        <div className="surface-mute rounded-lg p-2.5 mt-2" style={{ borderLeft: "2px solid rgb(var(--vibe-approval))" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-approval))" }}>
            ⚠ AMTS-Hinweise an Pflege + Arzt
          </p>
          <ul className="space-y-0.5">
            {b.amtsHinweise.map((h, i) => <li key={i} className="text-[11px] leading-relaxed text-pretty">› {h}</li>)}
          </ul>
        </div>
      )}
    </article>
  );
}
