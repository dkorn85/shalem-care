import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitListItem, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { listHilfeplaene } from "@/lib/sozial/hilfeplan-store";

export const metadata = {
  title: "Sozial · Hilfepläne",
  description: "Alle aktiven Hilfepläne nach BTHG · SGB IX/XII/VIII/XI. ICF-Bedarf, SMART-Ziele, Maßnahmen, Reviews.",
};

const SGB_FARBE: Record<string, string> = {
  IX:   "var(--mon)",
  XII:  "var(--tue)",
  VIII: "var(--vibe-team)",
  XI:   "var(--thu)",
};

const SGB_LABEL: Record<string, string> = {
  IX:   "BTHG · Teilhabe",
  XII:  "Sozialhilfe",
  VIII: "Kinder + Jugend",
  XI:   "Pflege",
};

export default async function HilfeplanListePage() {
  const plaene = listHilfeplaene();
  const reviewSoon = plaene
    .filter((p) => {
      const days = (+new Date(p.naechsteReview) - Date.now()) / 86400000;
      return days >= 0 && days <= 30;
    }).length;
  const akutePrio = plaene.filter((p) => p.prio >= 3).length;

  return (
    <AppShell role="sozial" user={{ id: "person-sozial-001", name: "Mira Wagner", subtitle: "Sozialarbeiterin BA · DGCC-CM", initials: "MW" }} station="ASD Pankow">
      <header className="mb-5">
        <Link href="/sozial" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Sozial-Cockpit
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Hilfepläne · § 36 SGB VIII · § 117 SGB IX</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Aktive Fall-Hilfepläne</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Klick auf einen Fall öffnet ICF-Bedarfsbogen, SMART-Ziele, Maßnahmen-Status, Review-Verlauf
          und Persönliches-Budget-Stand.
        </p>
      </header>

      <LerneTipp rolle="sozial" titel="Wo bin ich hier?">
        Ein <strong>Hilfeplan</strong> ist der zentrale Steuerungs-Knoten in Sozial-Arbeit:
        <strong> SGB IX</strong> (Teilhabe nach BTHG), <strong>XII</strong> (Sozialhilfe),
        <strong> VIII</strong> (Kinder + Jugend, § 36 KJHG), <strong>XI</strong> (Pflege).
        Jeder Fall hat einen <strong>ICF-Bedarfsbogen</strong>, <strong>SMART-Ziele</strong>
        (spezifisch · messbar · attraktiv · realistisch · terminiert) und einen
        <strong> Review-Termin</strong> spätestens nach 6 Monaten.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Hilfepläne aktiv" value={plaene.length}                          farbe="var(--tue)" />
        <CockpitKpi label="Hohe Priorität"  value={akutePrio}                              farbe="var(--mon)" />
        <CockpitKpi label="Reviews ≤ 30 d"   value={reviewSoon}                              farbe="var(--vibe-approval)" />
        <CockpitKpi label="Maßnahmen aktiv"  value={plaene.reduce((s, p) => s + p.massnahmen.filter((m) => m.status === "läuft").length, 0)} farbe="var(--thu)" />
      </div>

      <NurAbProfi rolle="sozial">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Profi-Modus · SGB-Verteilung + DGCC-Caseload</p>
          {(() => {
            const sgbCounts: Record<string, number> = {};
            plaene.forEach((p) => { sgbCounts[p.sgb] = (sgbCounts[p.sgb] ?? 0) + 1; });
            const eintraege = Object.entries(sgbCounts).sort((a, b) => b[1] - a[1]);
            const max = Math.max(1, ...Object.values(sgbCounts));
            const massnGesamt = plaene.reduce((s, p) => s + p.massnahmen.length, 0);
            const massnLaeuft = plaene.reduce((s, p) => s + p.massnahmen.filter((m) => m.status === "läuft").length, 0);
            return (
              <>
                <ul className="space-y-1.5 mb-3">
                  {eintraege.map(([sgb, n]) => (
                    <li key={sgb} className="flex items-baseline gap-2 text-[12px]">
                      <span className="w-[150px] shrink-0 text-mute">SGB {sgb} · {SGB_LABEL[sgb]}</span>
                      <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                        <span className="block h-full rounded-full" style={{ width: `${(n / max) * 100}%`, background: `rgb(${SGB_FARBE[sgb]})` }} />
                      </span>
                      <span className="font-mono tabular-nums text-[11px] w-[24px] text-right">{n}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[12px]">
                  <div className="surface-mute rounded-lg p-2.5">
                    <p className="font-mono text-[10px] text-soft">Caseload</p>
                    <p className="font-display text-[18px] font-bold tracking-tight2">{plaene.length}</p>
                    <p className="text-[10px] text-soft">DGCC-Empfehlung 25–35</p>
                  </div>
                  <div className="surface-mute rounded-lg p-2.5">
                    <p className="font-mono text-[10px] text-soft">Maßn. läuft/gesamt</p>
                    <p className="font-display text-[18px] font-bold tracking-tight2">{massnLaeuft}/{massnGesamt}</p>
                    <p className="text-[10px] text-soft">{massnGesamt ? Math.round((massnLaeuft / massnGesamt) * 100) : 0} % aktiv</p>
                  </div>
                  <div className="surface-mute rounded-lg p-2.5">
                    <p className="font-mono text-[10px] text-soft">Reviews ≤ 30 d</p>
                    <p className="font-display text-[18px] font-bold tracking-tight2">{reviewSoon}</p>
                    <p className="text-[10px] text-soft">Vorbereitung dringlich</p>
                  </div>
                </div>
              </>
            );
          })()}
        </section>
      </NurAbProfi>

      <CockpitSection eyebrow="Fälle" title="Hilfepläne" count={plaene.length}>
        <ul className="space-y-2">
          {plaene.map((p) => (
            <CockpitListItem
              key={p.id}
              href={`/sozial/hilfeplan/${p.id}`}
              badge={`SGB ${p.sgb}`}
              badgeFarbe={SGB_FARBE[p.sgb]}
              title={`${p.klient} · ${p.thema}`}
              subtitle={`${p.phase} · ${p.ziele.length} Ziele · ${p.massnahmen.filter((m) => m.status === "läuft").length} Maßnahmen aktiv`}
              meta={`Review ${p.naechsteReview}`}
            />
          ))}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 sm:p-6 mt-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Hinter jedem Fall</p>
        <ul className="space-y-1.5 text-[12px] text-mute">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>ICF-Bedarfsbogen mit b/d/e-Codes und Bewertung 0–4</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>SMART-Ziele · Maßnahmen mit Träger + Finanzierung</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Review-Historie chronologisch · Beteiligte je Termin</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Selbstvertretungs-Hinweis · wer spricht für sich, wer als Vertrauensperson</span></li>
        </ul>
      </section>

      <section className="surface rounded-2xl p-5 sm:p-6 mt-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">{SGB_LABEL.VIII} · {SGB_LABEL.IX} · {SGB_LABEL.XII} · {SGB_LABEL.XI}</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Alle vier SGB-Felder unter einem Dach — eine ASD-Fachkraft pflegt nur ein
          Cockpit, statt vier Fachverfahren parallel offen zu halten.
        </p>
      </section>
    </AppShell>
  );
}
