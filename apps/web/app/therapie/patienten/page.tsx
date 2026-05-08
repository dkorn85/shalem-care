import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitListItem } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { listTherapiePatienten, tendenzVas } from "@/lib/therapie/verlauf";

export const metadata = { title: "Therapie · Patient:innen" };

const TENDENZ_BADGE: Record<string, string> = {
  fallend:  "↓ Schmerz",
  steigend: "↑ Schmerz",
  stabil:   "≈ stabil",
  "—":      "neu",
};

export default async function TherapiePatientenPage() {
  const patienten = listTherapiePatienten();
  return (
    <AppShell role="therapie" user={{ id: "person-therapeut-001", name: "Sebastian Rauer", subtitle: "Physio · Manuelle Therapie", initials: "SR" }} station="Praxis Steglitz">
      <header className="mb-6">
        <Link href="/therapie" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Praxis-Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Patient:innen</h1>
        <p className="text-[13px] text-mute mt-2">{patienten.length} aktive Verordnungen · Klick öffnet Verlauf mit VAS / ROM / Kraft</p>
      </header>

      <LerneTipp rolle="therapie" titel="So liest du die Liste">
        Jede Zeile = eine aktive <strong>VO</strong> (Heilmittel-Verordnung).
        <strong> ICD-10</strong>-Code zeigt die Diagnose, der <strong>Tendenz-Chip</strong>
        die VAS-Schmerz-Richtung (↑ verschlechtert, ↓ verbessert).
        <strong> VAS</strong> = Visual Analog Scale (0–10 Schmerz),
        <strong> ROM</strong> = Range of Motion (Gelenk-Bewegungsumfang),
        <strong> MRC</strong> = Medical Research Council Kraftgrade 0–5.
      </LerneTipp>

      <NurAbProfi rolle="therapie">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Profi-Modus · Caseload-Outcomes</p>
          {(() => {
            const tendenzen = patienten.map((p) => tendenzVas(p.termine));
            const fallend = tendenzen.filter((t) => t === "fallend").length;
            const stabil = tendenzen.filter((t) => t === "stabil").length;
            const steigend = tendenzen.filter((t) => t === "steigend").length;
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">VO aktiv</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{patienten.length}</p>
                  <p className="text-[10px] text-soft">HMR-Standard 1:30 / Woche</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Outcome ↓</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: "rgb(var(--thu))" }}>{fallend}</p>
                  <p className="text-[10px] text-soft">VAS sinkt</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Stabil</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{stabil}</p>
                  <p className="text-[10px] text-soft">≈ konstant</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Outcome ↑</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: "rgb(var(--mon))" }}>{steigend}</p>
                  <p className="text-[10px] text-soft">VAS steigt · Re-Assess</p>
                </div>
              </div>
            );
          })()}
        </section>
      </NurAbProfi>

      <CockpitSection eyebrow="Aktive Verordnungen" title="Karteikarten" count={patienten.length}>
        <ul className="space-y-2">
          {patienten.map((p) => {
            const tendenz = tendenzVas(p.termine);
            return (
              <CockpitListItem
                key={p.id}
                href={`/therapie/patient/${p.id}`}
                badge={p.diagnoseIcd}
                badgeFarbe={p.farbe}
                title={p.name}
                subtitle={`${p.vo} · ${p.stand} · ${TENDENZ_BADGE[tendenz]}`}
                meta={p.fortschritt}
              />
            );
          })}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">In Detail-Ansicht enthalten</p>
        <ul className="space-y-1 text-[12px] text-mute">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>VAS / ROM / MRC-Kraft als Sparkline · Tendenz-Chip · Erst-/Letztwert-Delta</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>ICF-Codes (b/d-Klassen) und SMART-Ziele zur Sitzung</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Termin-Historie mit Notiz · Diktat-Sprung pro Sitzung</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
