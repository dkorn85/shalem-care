import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CockpitSection } from "@/components/BerufCockpitCard";
import { IcfVorschlagBox } from "@/components/IcfVorschlagBox";
import {
  getHilfeplan, listHilfeplaene,
  ICF_DOMAIN_LABEL, ICF_DOMAIN_FARBE, ICF_BEWERTUNG_LABEL,
} from "@/lib/sozial/hilfeplan-store";

export function generateStaticParams() {
  return listHilfeplaene().map((p) => ({ id: p.id }));
}

const STATUS_FARBE: Record<string, string> = {
  in_bearbeitung: "var(--vibe-team)",
  erreicht:        "var(--thu)",
  vorbereitet:     "var(--vibe-approval)",
  abgebrochen:     "var(--mon)",
  läuft:           "var(--thu)",
  geplant:         "var(--vibe-approval)",
  Antrag:          "var(--vibe-stats)",
  abgeschlossen:   "var(--thu)",
  abgelehnt:       "var(--mon)",
};

export const metadata = { title: "Sozial · Hilfeplan-Detail" };

export default async function HilfeplanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = getHilfeplan(id);
  if (!plan) notFound();

  const tageBisReview = Math.round((+new Date(plan.naechsteReview) - Date.now()) / 86400000);

  // ICF nach Domains gruppiert
  const icfNachDomain = plan.icf.reduce((acc, e) => {
    (acc[e.domain] ??= []).push(e);
    return acc;
  }, {} as Record<string, typeof plan.icf>);

  return (
    <AppShell role="sozial" user={{ id: "person-sozial-001", name: "Mira Wagner", subtitle: "Sozialarbeiterin BA · DGCC-CM", initials: "MW" }} station="ASD Pankow">
      <header className="mb-5">
        <Link href="/sozial/hilfeplan" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Hilfepläne
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">SGB {plan.sgb} · {plan.phase}</p>
            <h1 className="font-display text-[28px] font-bold tracking-tight2 mt-0.5">{plan.klient}</h1>
            <p className="text-[13px] text-mute mt-1">{plan.ueberschrift} · {plan.geburt}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-soft">Nächste Review</p>
            <p className="font-mono text-[13px] font-medium" style={{ color: tageBisReview <= 14 ? "rgb(var(--mon))" : "rgb(var(--fg))" }}>
              {plan.naechsteReview}
            </p>
            <p className="text-[11px] text-soft">{tageBisReview > 0 ? `in ${tageBisReview} Tagen` : "fällig"}</p>
          </div>
        </div>
      </header>

      {/* Selbstvertretung · Banner */}
      <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: `3px solid rgb(${plan.farbe})` }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Selbstvertretung · Partizipation</p>
        <p className="text-[13px] mt-1 leading-relaxed">{plan.partizipativ}</p>
        <p className="text-[11px] text-soft mt-1.5">Zuständig: {plan.zustaendig}</p>
      </section>

      {/* ICF-Bedarfsbogen */}
      <CockpitSection eyebrow="ICF · Internationale Klassifikation" title="Bedarfsbogen" count={plan.icf.length}>
        <div className="space-y-3">
          {(["b", "s", "d", "e"] as const).map((domain) => {
            const liste = icfNachDomain[domain];
            if (!liste || liste.length === 0) return null;
            return (
              <div key={domain}>
                <p className="font-mono text-[10px] uppercase tracking-wider mb-1.5" style={{ color: `rgb(${ICF_DOMAIN_FARBE[domain]})` }}>
                  {domain.toUpperCase()} · {ICF_DOMAIN_LABEL[domain]}
                </p>
                <ul className="space-y-1.5">
                  {liste.map((e) => (
                    <li key={e.code} className="surface-mute rounded-lg p-2.5 flex items-baseline gap-3 flex-wrap">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ background: `rgb(${ICF_DOMAIN_FARBE[domain]} / 0.15)`, color: `rgb(${ICF_DOMAIN_FARBE[domain]})` }}>
                        {e.code}
                      </span>
                      <span className="text-[12px] flex-1 min-w-[200px]">{e.label}</span>
                      <span className="flex items-center gap-1.5">
                        {[0, 1, 2, 3, 4].map((b) => (
                          <span key={b} className="w-2 h-3 rounded-sm" style={{
                            background: b <= e.bewertung ? `rgb(${ICF_DOMAIN_FARBE[domain]})` : "rgb(var(--bg-mute))",
                            opacity: b <= e.bewertung ? 0.4 + (b / 4) * 0.6 : 1,
                          }} />
                        ))}
                        <span className="font-mono text-[10px] text-soft ml-1">{e.bewertung} · {ICF_BEWERTUNG_LABEL[e.bewertung]}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </CockpitSection>

      {/* SMART-Ziele */}
      <CockpitSection eyebrow="SMART-Ziele · partizipativ vereinbart" title="Ziele" count={plan.ziele.length}>
        <ul className="space-y-2">
          {plan.ziele.map((z) => (
            <li key={z.id} className="surface-mute rounded-xl p-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <p className="font-medium text-[13px] flex-1 min-w-[200px]">{z.text}</p>
                <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[z.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[z.status]})` }}>
                  {z.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-[11px] text-mute mt-1">
                <span className="text-soft">Zeitperspektive:</span> {z.zeitperspektive} · <span className="text-soft">Träger:</span> {z.traeger}
              </p>
            </li>
          ))}
        </ul>
      </CockpitSection>

      {/* Maßnahmen */}
      <CockpitSection eyebrow="Maßnahmen + Träger-Koordination" title="Aktivitäten" count={plan.massnahmen.length}>
        <ul className="space-y-2">
          {plan.massnahmen.map((m) => (
            <li key={m.id} className="surface-hover rounded-xl p-3 flex items-baseline justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[13px]">{m.was}</p>
                <p className="text-[11px] text-mute mt-0.5">{m.traeger} · {m.finanzierung} · {m.start}</p>
              </div>
              <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[m.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[m.status]})` }}>
                {m.status}
              </span>
            </li>
          ))}
        </ul>
      </CockpitSection>

      {/* Review-Verlauf */}
      <CockpitSection eyebrow="Hilfeplan-Konferenz · chronologisch" title="Verlauf" count={plan.verlauf.length}>
        <ol className="relative space-y-3 pl-4" style={{ borderLeft: "1px solid rgb(var(--bg-mute))" }}>
          {[...plan.verlauf].reverse().map((v) => (
            <li key={v.datum} className="relative">
              <span aria-hidden className="absolute -left-[18px] top-2 w-2 h-2 rounded-full" style={{ background: `rgb(${plan.farbe})` }} />
              <div className="surface-mute rounded-lg p-3">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-soft">{v.datum}</span>
                  <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{v.veranstaltung}</span>
                </div>
                <p className="text-[12px] mt-1.5">{v.ergebnis}</p>
                <p className="text-[10px] text-soft mt-1.5 font-mono">Beteiligt: {v.beteiligt.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ol>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Review-Zyklus</p>
        <ul className="space-y-1 text-[13px]">
          <li className="flex justify-between gap-3"><span className="text-mute">Intervall</span><span>{plan.reviewIntervall}</span></li>
          <li className="flex justify-between gap-3"><span className="text-mute">Letzte Review</span><span className="font-mono">{plan.letzteReview}</span></li>
          <li className="flex justify-between gap-3"><span className="text-mute">Nächste Review</span><span className="font-mono">{plan.naechsteReview}</span></li>
        </ul>
      </section>

      <IcfVorschlagBox />
    </AppShell>
  );
}
