// /apotheke/wechselwirkung · ABDA-CAVE-Stub + Crossings Schul-/Komplementärmedizin.
//
// Pflichtcheck nach § 20 ApBetrO bei jeder Abgabe — hier als
// kuratiertes Schaufenster mit den häufigsten Stolperfallen für
// Heimversorgung, Phyto-Beratung und Psychedelika-Pipeline.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { WW_KATALOG, WW_FARBE, WW_LABEL, type WwSchwere } from "@/lib/apotheke/wechselwirkung";

export const metadata = {
  title: "Wechselwirkungs-Check · Apotheke",
  description: "ABDA-CAVE + Naturheil-Schulmedizin-Crossings · § 20 ApBetrO",
};

const SCHWERE_REIHE: WwSchwere[] = ["kontraindiziert", "schwer", "moderat", "leicht"];

export default function WwPage() {
  const nachSchwere = Object.fromEntries(
    SCHWERE_REIHE.map((s) => [s, WW_KATALOG.filter((w) => w.schwere === s)] as const),
  ) as Record<WwSchwere, typeof WW_KATALOG>;

  return (
    <AppShell role="apotheke" user={{ id: "apo-001", name: "Lukas Faber", subtitle: "Apothekenleitung", initials: "LF" }} station="Wechselwirkung">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/apotheke" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Apotheke
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">§ 20 ApBetrO · ABDA CAVE · ESCOP-Monographien</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Wechselwirkungs-Check</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Häufige Konstellationen aus der Heimversorgung sowie typische
          Crossings zwischen Schulmedizin, Phytotherapie, Cannabis-Medizin
          und Esketamin-Therapie. Demo-Mini-Katalog — Phase 2 dockt an die
          ABDA-Wartung an.
        </p>
      </header>

      <LerneTipp rolle="apotheke" titel="Vier Schwere-Grade">
        <strong>Kontraindiziert</strong> = niemals kombinieren (z.B. MAO-Hemmer + Spravato).
        <strong> Schwer</strong> = nur mit klarer Indikation + engmaschigem Monitoring
        (z.B. Johanniskraut + Marcumar). <strong>Moderat</strong> = Anpassung der Dosis oder
        des Zeitabstands hilft. <strong>Leicht</strong> = klinisch meist ohne Folgen, aber
        Patient:in informieren.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {SCHWERE_REIHE.map((s) => (
          <CockpitKpi key={s} label={WW_LABEL[s]} value={nachSchwere[s].length} farbe={WW_FARBE[s]} />
        ))}
      </div>

      <NurAbProfi rolle="apotheke">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Beratungs-Workflow im Sichtwahl-Bereich</p>
          <p className="text-[12px] text-mute leading-relaxed text-pretty">
            Bei <strong>OTC-Abgabe</strong> aktiv nach Dauer-Medikation fragen — viele
            ältere Klient:innen kombinieren Aspirin oder Ibuprofen mit Marcumar/Apixaban,
            ohne es zu wissen. Bei <strong>Phyto-Selbstmedikation</strong> immer nach
            Antidepressiva fragen (Johanniskraut-Trap). Bei <strong>Cannabis-Verordnung</strong>
            immer nach Marcumar fragen + INR-Plan vorschlagen.
          </p>
        </section>
      </NurAbProfi>

      {SCHWERE_REIHE.map((s) => {
        const liste = nachSchwere[s];
        if (liste.length === 0) return null;
        return (
          <section key={s} className="mb-5">
            <header className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
              <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${WW_FARBE[s]})` }}>
                {WW_LABEL[s]}
              </p>
              <span className="text-[11px] text-soft">{liste.length} Eintr.</span>
            </header>
            <ul className="space-y-2">
              {liste.map((w) => (
                <li key={w.id} className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${WW_FARBE[s]})` }}>
                  <header className="flex items-baseline gap-2 flex-wrap mb-1.5">
                    <span className="text-[13px] font-semibold">{w.links}</span>
                    <span className="text-[12px] text-soft">↔</span>
                    <span className="text-[13px] font-semibold">{w.rechts}</span>
                    <span className="chip text-[10px] ml-auto" style={{ background: `rgb(${WW_FARBE[s]} / 0.18)`, color: `rgb(${WW_FARBE[s]})` }}>
                      {WW_LABEL[s]}
                    </span>
                  </header>
                  <p className="text-[12px] text-mute mb-1.5"><strong>Wirkung:</strong> {w.wirkung}</p>
                  <p className="text-[12px]"><strong>Empfehlung:</strong> {w.empfehlung}</p>
                  {w.quelle && <p className="text-[10px] mt-1.5 font-mono text-soft">Quelle: {w.quelle}</p>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </AppShell>
  );
}
