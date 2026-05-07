import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  aggregiereQuartal,
  formatCent,
  formatQuartal,
  letzteVierQuartale,
  quartalKey,
  quartalRange,
} from "@/lib/pvs/abrechnung/quartal";

export const metadata = {
  title: "Quartalsabrechnung · DTA-§302",
};

export default function AbrechnungUebersicht() {
  const quartale = letzteVierQuartale();
  const sammlungen = quartale.map((q) => aggregiereQuartal(q));

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Sammelabrechnung · Pflegekasse · § 302 SGB V · DTA-Datenträgeraustausch
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Quartalsabrechnung · Pflege
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          Aus erbrachten HKP-Verordnungen werden pro Kostenträger
          Sammelrechnungen aggregiert. Die DTA-§302-Vorschau zeigt das
          EDIFACT-Format, das später an die Datenannahmestelle der GKV geht.
        </p>
      </header>

      <section className="surface rounded-2xl p-4 mb-6" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.06), transparent)" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
          Phase-A-Stub · was hier echt ist und was nicht
        </p>
        <ul className="text-[12px] text-mute space-y-1 leading-relaxed">
          <li>· <strong className="text-[rgb(var(--fg))]">Echt:</strong> Aggregation aus HKP-Pipeline · Positions-Berechnung · DTA-§302-Strukturierung</li>
          <li>· <strong className="text-[rgb(var(--fg))]">Stub:</strong> Preise sind Bundes-Durchschnittswerte (kein regionaler Vertrag) · IK-Verzeichnis nicht angebunden</li>
          <li>· <strong className="text-[rgb(var(--fg))]">Phase 2:</strong> ITSG-Prüfsoftware · S/MIME-Signatur via SMC-B · echte Datenannahmestelle</li>
        </ul>
      </section>

      <ul className="space-y-3">
        {sammlungen.map((s) => {
          const range = quartalRange(s.quartal);
          return (
            <li key={quartalKey(s.quartal)} className="surface rounded-2xl p-5">
              <div className="flex items-baseline gap-3 flex-wrap mb-3">
                <h2 className="font-display text-[18px] font-bold tracking-tight2">
                  {formatQuartal(s.quartal)}
                </h2>
                <span className="text-[11px] text-soft font-mono">
                  {range.von} – {range.bis}
                </span>
                <span className="text-[12px] font-mono ml-auto" style={{ color: "rgb(var(--vibe-approval))" }}>
                  {formatCent(s.summeCent)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                <Mini label="Rechnungen" value={String(s.rechnungen.length)} />
                <Mini label="Positionen" value={String(s.positionen)} />
                <Mini label="Klient:innen" value={String(s.klienten.size)} />
                <Mini label="∅ Position" value={s.positionen > 0 ? formatCent(Math.round(s.summeCent / s.positionen)) : "—"} />
              </div>
              {s.rechnungen.length === 0 ? (
                <p className="text-[12px] text-soft italic">Keine erbrachten HKP-Leistungen in diesem Quartal.</p>
              ) : (
                <ul className="space-y-1.5">
                  {s.rechnungen.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/admin/abrechnung/${quartalKey(s.quartal)}/${r.id}`}
                        className="surface-hover rounded-lg p-3 flex items-baseline justify-between gap-2 flex-wrap"
                      >
                        <span className="font-medium text-[13px]">
                          {r.empfaengerName}
                          <span className="text-soft font-mono ml-2 text-[11px]">IK {r.empfaengerIk}</span>
                        </span>
                        <span className="text-[12px] text-soft font-mono">
                          {r.positionen.length} Positionen · <span style={{ color: "rgb(var(--vibe-approval))" }}>{formatCent(r.summeCent)}</span> →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-mute rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div className="font-display font-semibold text-[16px] mt-1 leading-none">{value}</div>
    </div>
  );
}
