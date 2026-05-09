// /pflege/doku/[klientId]/plan · Pflegeplan-Übersicht.
//
// Zeigt alle Plan-Einträge gruppiert nach NANDA-Diagnose. Pro Eintrag:
// Status (geplant / läuft / erreicht / abgesetzt), Quelle (Katalog vs.
// manuell), Evaluations-Hinweis. Status-Wechsel via PlanStatusChip.

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { PlanStatusChip } from "@/components/pflege/PlanStatusChip";
import { getKlient } from "@/lib/hierarchy/store";
import { listPlanFuerKlient, type PflegeplanEintrag } from "@/lib/pflege/pflegeplan-store";
import { listDiagnosen, seedPflegediagnosenOnce, type PflegeDiagnoseEintrag } from "@/lib/pflege/pflegediagnose-store";
import { getDiagnose, DOMAIN_LABEL, DOMAIN_FARBE } from "@/lib/pflege/diagnose-katalog";

export const metadata = { title: "Pflege-Plan · NIC + NOC" };

const ART_LABEL: Record<PflegeplanEintrag["art"], string> = {
  intervention: "Intervention",
  ziel:         "Ziel",
};

const ART_FARBE: Record<PflegeplanEintrag["art"], string> = {
  intervention: "var(--vibe-team)",
  ziel:         "var(--thu)",
};

export default async function PflegeplanPage({ params }: { params: Promise<{ klientId: string }> }) {
  seedPflegediagnosenOnce();
  const { klientId } = await params;
  const klient = getKlient(klientId);
  if (!klient) notFound();

  const alle = listPlanFuerKlient(klientId);
  const diagnosen = listDiagnosen(klientId);
  // Pro Diagnose-Eintrag-ID gruppieren
  const proDiagnose = new Map<string, { diagnose: PflegeDiagnoseEintrag; eintraege: PflegeplanEintrag[] }>();
  for (const d of diagnosen) {
    proDiagnose.set(d.id, { diagnose: d, eintraege: alle.filter((e) => e.diagnoseEintragId === d.id) });
  }

  const aktiv  = alle.filter((e) => e.status === "geplant" || e.status === "läuft");
  const erreicht = alle.filter((e) => e.status === "erreicht");
  const interventionen = aktiv.filter((e) => e.art === "intervention");
  const ziele = aktiv.filter((e) => e.art === "ziel");

  return (
    <AppShell role="nurse" user={{ id: "person-dr", name: "Dennis Reuter", subtitle: "Pflegefachkraft P7", initials: "DR" }} station="Pulmologie 3B">
      <header className="mb-5">
        <Link href={`/pflege/doku/${klientId}/diagnosen`} className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← {klient.name} · Diagnosen
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">NIC-Interventionen + NOC-Ziele · § 113 SGB XI</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Pflegeplan</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Aus jeder NANDA-Diagnose werden Default-Vorschläge aus dem Katalog (Nursing
          Interventions Classification + Outcomes) als Plan-Einträge generiert. Pflegekraft
          editiert, ergänzt manuell, verschiebt Status (geplant → läuft → erreicht).
        </p>
      </header>

      <LerneTipp rolle="pflege" titel="Was bedeutet NIC + NOC?">
        <strong>NIC</strong> = Nursing Interventions Classification (~565 Maßnahmen) ·
        <strong> NOC</strong> = Nursing Outcomes Classification (~540 messbare Ziele).
        Beide Klassifikationen ergänzen NANDA-I zur sogenannten <em>NNN-Triade</em> —
        Diagnose + Intervention + Outcome in einer Sprache. Hier in der Demo nur die
        wichtigsten Default-Vorschläge pro Diagnose, in Phase 2 vollständig.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Aktive Einträge"   value={aktiv.length}                  farbe="var(--accent)" />
        <CockpitKpi label="Interventionen"    value={interventionen.length}         farbe="var(--vibe-team)" />
        <CockpitKpi label="Ziele"             value={ziele.length}                  farbe="var(--thu)" />
        <CockpitKpi label="Erreichte Ziele"   value={erreicht.filter((e) => e.art === "ziel").length} farbe="var(--vibe-approval)" />
      </div>

      <NurAbProfi rolle="pflege">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Pflegeprofi · NNN-Reife-Indikatoren</p>
          {(() => {
            const katalog = alle.filter((e) => e.quelle === "katalog").length;
            const manuell = alle.filter((e) => e.quelle === "manuell").length;
            const evalQuote = alle.length ? Math.round((alle.filter((e) => e.evaluiertAm).length / alle.length) * 100) : 0;
            const erreichteZielQuote = ziele.length + erreicht.filter((e) => e.art === "ziel").length > 0
              ? Math.round((erreicht.filter((e) => e.art === "ziel").length / (ziele.length + erreicht.filter((e) => e.art === "ziel").length)) * 100)
              : 0;
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Katalog vs. manuell</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{katalog}/{manuell}</p>
                  <p className="text-[10px] text-soft">{katalog + manuell} insgesamt</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Ziele erreicht</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: "rgb(var(--thu))" }}>
                    {erreichteZielQuote}%
                  </p>
                  <p className="text-[10px] text-soft">Outcome-Erfolg</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Eval-Quote</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{evalQuote}%</p>
                  <p className="text-[10px] text-soft">DNQP-Re-Eval-Pflicht</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">aktive Diagnosen</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{diagnosen.filter((d) => !d.beendetAm).length}</p>
                  <p className="text-[10px] text-soft">{diagnosen.length} insgesamt</p>
                </div>
              </div>
            );
          })()}
        </section>
      </NurAbProfi>

      {alle.length === 0 ? (
        <section className="surface rounded-2xl p-6 text-center">
          <p className="text-[13px] text-mute">
            Noch keine Plan-Einträge. Auf
            <Link href={`/pflege/doku/${klientId}/diagnosen`} className="underline mx-1">/diagnosen</Link>
            eine Diagnose öffnen und „✦ Plan aus Katalog generieren" klicken.
          </p>
        </section>
      ) : (
        <CockpitSection eyebrow="Plan-Einträge gruppiert nach Diagnose" title="Pflegeplan" count={alle.length}>
          <div className="space-y-4">
            {Array.from(proDiagnose.entries()).filter(([, v]) => v.eintraege.length > 0).map(([diagnoseId, v]) => {
              const k = getDiagnose(v.diagnose.nandaCode);
              return (
                <article key={diagnoseId} className="surface rounded-xl p-4" style={{ borderLeft: `3px solid rgb(${k ? DOMAIN_FARBE[k.domain] : "var(--accent)"})` }}>
                  <header className="flex items-baseline gap-2 mb-2 flex-wrap">
                    <span className="font-mono text-[10px] text-soft">{v.diagnose.nandaCode}</span>
                    <h3 className="font-display text-[14px] font-bold tracking-tight2">{k?.label ?? v.diagnose.nandaCode}</h3>
                    {k && <span className="chip text-[10px]" style={{ background: `rgb(${DOMAIN_FARBE[k.domain]} / 0.15)`, color: `rgb(${DOMAIN_FARBE[k.domain]})` }}>{DOMAIN_LABEL[k.domain]}</span>}
                  </header>
                  <ul className="space-y-1.5">
                    {v.eintraege.map((e) => (
                      <li key={e.id} className="surface-mute rounded-lg p-2.5 flex items-baseline gap-2 flex-wrap">
                        <span className="chip text-[10px]" style={{ background: `rgb(${ART_FARBE[e.art]} / 0.15)`, color: `rgb(${ART_FARBE[e.art]})` }}>
                          {ART_LABEL[e.art]}
                        </span>
                        <span className="text-[12px] flex-1 min-w-[180px]">{e.text}</span>
                        {e.quelle === "manuell" && <span className="text-[9px] text-soft font-mono">manuell</span>}
                        <PlanStatusChip eintrag={e} />
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </CockpitSection>
      )}
    </AppShell>
  );
}
