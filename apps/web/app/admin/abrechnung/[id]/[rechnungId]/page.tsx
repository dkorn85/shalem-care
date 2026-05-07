import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  dateigroesseGeschaetzt,
  erzeugeDtaVorschau,
  formatCent,
  holeRechnung,
} from "@/lib/pvs/abrechnung/quartal";

export const metadata = {
  title: "Sammelrechnung · DTA-Vorschau",
};

export default async function RechnungDetailPage({
  params,
}: {
  params: Promise<{ id: string; rechnungId: string }>;
}) {
  const { id, rechnungId } = await params;
  const r = holeRechnung(id, rechnungId);
  if (!r) notFound();

  const dta = erzeugeDtaVorschau(r);
  const groesse = dateigroesseGeschaetzt(r);

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/admin/abrechnung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Quartalsübersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Sammelrechnung · {id}
        </p>
        <h1 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2 leading-[1.1]">
          {r.empfaengerName}
        </h1>
        <p className="text-[13px] text-soft font-mono mt-2">
          IK {r.empfaengerIk} · {r.zeitraum.von} – {r.zeitraum.bis} · {r.positionen.length} Positionen ·{" "}
          <span style={{ color: "rgb(var(--vibe-approval))" }}>{formatCent(r.summeCent)}</span>
        </p>
      </header>

      <section className="surface rounded-2xl p-5 mb-5">
        <h2 className="font-display text-[16px] font-bold tracking-tight2 mb-3">Positionen</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-soft font-mono border-b border-[rgb(var(--bg-mute))]">
                <th className="text-left py-2 pr-3">HKP</th>
                <th className="text-left py-2 pr-3">Bezeichnung</th>
                <th className="text-left py-2 pr-3">Klient</th>
                <th className="text-right py-2 pr-3">Anzahl</th>
                <th className="text-right py-2 pr-3">Einzel</th>
                <th className="text-right py-2 pr-3">Betrag</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {r.positionen.map((p) => (
                <tr key={p.id} className="border-b border-[rgb(var(--bg-mute))]/40">
                  <td className="py-2 pr-3 font-mono">{p.positionsNr}</td>
                  <td className="py-2 pr-3">{p.bezeichnung}</td>
                  <td className="py-2 pr-3 font-mono text-soft">{p.klientId}</td>
                  <td className="py-2 pr-3 text-right">{p.anzahl}</td>
                  <td className="py-2 pr-3 text-right font-mono">{formatCent(p.einzelpreisCent)}</td>
                  <td className="py-2 pr-3 text-right font-mono" style={{ color: "rgb(var(--vibe-approval))" }}>
                    {formatCent(p.betragCent)}
                  </td>
                  <td className="py-2 text-[11px] text-soft">{p.status}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="py-3 pr-3 text-right text-[10px] uppercase tracking-wider text-soft font-mono">
                  Gesamtsumme
                </td>
                <td className="py-3 pr-3 text-right font-display font-bold" style={{ color: "rgb(var(--vibe-approval))" }}>
                  {formatCent(r.summeCent)}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface rounded-2xl p-5 mb-5">
        <header className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">DTA-§302-Vorschau · EDIFACT-PLGA</p>
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Datenträgeraustausch-Format</h2>
          </div>
          <span className="text-[11px] text-soft font-mono">{groesse}</span>
        </header>
        <pre
          className="text-[11px] font-mono leading-relaxed overflow-x-auto p-3 rounded-lg"
          style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
        >
          {dta}
        </pre>
        <p className="text-[11px] text-soft italic mt-3 leading-relaxed">
          Strukturell gemäß GKV-DTA-§302-Richtlinie (PLGA-Anwendungsfall).
          Phase 2: Validierung mit ITSG-Prüfsoftware · S/MIME-Signatur via SMC-B ·
          Versand an die Datenannahmestelle der jeweiligen Pflegekasse.
        </p>
      </section>

      <section className="surface rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgb(var(--vibe-stats) / 0.04), transparent)" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Status</p>
        <p className="text-[14px]">
          <span className="font-medium">{r.status === "versendet" ? "Versendet" : "Entwurf"}</span>
          <span className="text-soft ml-2 text-[12px]">
            {r.status === "versendet"
              ? "DTA wurde über die Datenannahmestelle eingereicht."
              : "Nach Plausibilitätsprüfung kann die Sammelrechnung versendet werden."}
          </span>
        </p>
      </section>
    </AppShell>
  );
}
