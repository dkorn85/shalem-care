import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const SCHUTZFALL = {
  familie: "Familie Brand",
  kindAlter: "4 J.",
  meldend: "Kita-Leitung Frau Köster",
  hinweise: [
    "Kind wirkt seit ~3 Wochen ungewöhnlich verschlossen",
    "Mehrfach unausgeschlafen, teils mit gleichen Kleidern",
    "Schreckreaktionen bei lauten Stimmen",
    "Erzählt nicht mehr von zu Hause",
  ],
  iefBesprechung: "heute 14:30 · Frau Berger (Diakonie)",
  hausbesuch: "heute 15:30",
  einschaetzung: "latente Gefährdung",
  beteiligungEltern: "ja, einseitig zunächst Mutter",
  beteiligungKind: "altersgerecht im Hausbesuch",
};

const SCHRITTE = [
  { nr: 1, was: "Risikoeinschätzung gemeinsam mit IeF-Fachkraft (§ 8a Abs. 4 SGB VIII)",   status: "läuft 14:30",  norm: "§ 8a IV SGB VIII" },
  { nr: 2, was: "Hausbesuch zur direkten Eindrucksbildung",                                  status: "geplant 15:30", norm: "§ 8a I SGB VIII" },
  { nr: 3, was: "Schutzkonzept mit Eltern entwickeln (Hilfen anbieten, Vereinbarung)",        status: "noch offen",     norm: "§ 8a II SGB VIII" },
  { nr: 4, was: "Ggf. Familiengericht informieren (bei akuter Gefährdung)",                   status: "Eskalations-Pfad", norm: "§ 8a III SGB VIII" },
  { nr: 5, was: "Verlaufsdokumentation + Re-Evaluation in 4 Wochen",                          status: "Termin gesetzt",  norm: "DGCC-Standard" },
];

export const metadata = { title: "Sozial · Schutzauftrag" };

export default async function SchutzPage() {
  return (
    <AppShell role="sozial" user={{ id: "person-sozial-001", name: "Mira Wagner", subtitle: "Sozialarbeiterin BA · DGCC-CM", initials: "MW" }} station="ASD Pankow">
      <header className="mb-6">
        <Link href="/sozial" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Sozial-Cockpit</Link>
        <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgb(var(--mon))" }}>
          Schutzauftrag · § 8a SGB VIII
        </p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">{SCHUTZFALL.familie}</h1>
        <p className="text-[14px] text-mute mt-2">Kind {SCHUTZFALL.kindAlter} · Meldung von {SCHUTZFALL.meldend}</p>
      </header>

      <section className="surface rounded-2xl p-5 mb-6" style={{ background: "rgb(var(--mon) / 0.04)" }}>
        <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgb(var(--mon))" }}>Hinweise</p>
        <ul className="space-y-1.5 text-[13px]">
          {SCHUTZFALL.hinweise.map((h, i) => (
            <li key={i} className="flex gap-2 items-baseline">
              <span aria-hidden className="text-soft shrink-0">›</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-3 border-t border-app-soft text-[12px] grid sm:grid-cols-3 gap-2">
          <div><span className="text-soft uppercase tracking-wider text-[9px]">Einschätzung:</span><br /><span className="font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>{SCHUTZFALL.einschaetzung}</span></div>
          <div><span className="text-soft uppercase tracking-wider text-[9px]">Eltern-Beteiligung:</span><br /><span className="font-medium">{SCHUTZFALL.beteiligungEltern}</span></div>
          <div><span className="text-soft uppercase tracking-wider text-[9px]">Kind-Beteiligung:</span><br /><span className="font-medium">{SCHUTZFALL.beteiligungKind}</span></div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Verfahrens-Schritte</h2>
        <ol className="space-y-2">
          {SCHRITTE.map((s) => (
            <li key={s.nr} className="surface rounded-xl p-4 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: "rgb(var(--mon))", opacity: 0.5 }} />
              <div className="ml-2.5 flex items-baseline gap-3 flex-wrap">
                <span className="font-mono font-bold text-[20px] text-soft">{s.nr}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[13px]">{s.was}</p>
                  <p className="text-[11px] text-soft font-mono mt-0.5">{s.norm}</p>
                </div>
                <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{s.status}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Wichtig</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Diese Akte ist <strong>besonders schutzbedürftig</strong>. Zugriff nur durch zugewiesene
          Sozialarbeiterin + IeF-Fachkraft + Vorgesetzten. Keine Sichtbarkeit für andere
          Berufsgruppen — § 65 SGB VIII Sozialgeheimnis.
        </p>
      </section>
    </AppShell>
  );
}
