import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitKpi } from "@/components/BerufCockpitCard";

const POSITIONEN = [
  { code: "X0501", name: "Krankengymnastik (KG)",                     menge: 38, einheit: "20 min", einzelpreis: 22.45 },
  { code: "X0701", name: "Manuelle Therapie",                          menge: 24, einheit: "20 min", einzelpreis: 28.92 },
  { code: "X0210", name: "Manuelle Lymphdrainage 45 min",              menge: 12, einheit: "45 min", einzelpreis: 49.30 },
  { code: "X0309", name: "KG-ZNS (Bobath/Vojta) 30 min",                menge: 9,  einheit: "30 min", einzelpreis: 36.85 },
  { code: "X1502", name: "KGG geräteges. (Wirbelsäule)",                menge: 14, einheit: "60 min", einzelpreis: 41.20 },
];

const KASSEN = [
  { name: "AOK Nordost", ik: "100000031", offen:  428.40, eingereicht: 1289.65 },
  { name: "Techniker Krankenkasse", ik: "101575519", offen: 312.85, eingereicht:  876.30 },
  { name: "Barmer", ik: "104940005", offen: 124.55, eingereicht:  592.10 },
  { name: "DAK-Gesundheit", ik: "101810036", offen: 0,     eingereicht: 1054.20 },
];

export const metadata = { title: "Therapie · Abrechnung" };

export default async function TherapieAbrechnungPage() {
  const total = POSITIONEN.reduce((s, p) => s + p.menge * p.einzelpreis, 0);
  const offen = KASSEN.reduce((s, k) => s + k.offen, 0);
  const eingereicht = KASSEN.reduce((s, k) => s + k.eingereicht, 0);
  return (
    <AppShell role="therapie" user={{ id: "person-therapeut-001", name: "Sebastian Rauer", subtitle: "Physio · Manuelle Therapie", initials: "SR" }} station="Praxis Steglitz">
      <header className="mb-6">
        <Link href="/therapie" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Praxis-Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Abrechnung · KW 19</h1>
        <p className="text-[13px] text-mute mt-2">SGB V § 302 · Heilmittel-Position-Vergütungsverzeichnis 2026</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
        <CockpitKpi label="Gesamt KW 19" value={total.toFixed(2)} unit="€" farbe="var(--vibe-stats)" />
        <CockpitKpi label="Offen" value={offen.toFixed(2)} unit="€" hint="DTA noch nicht versendet" farbe="var(--vibe-approval)" />
        <CockpitKpi label="Eingereicht" value={eingereicht.toFixed(2)} unit="€" hint="warten auf Zahlung" farbe="var(--thu)" />
      </div>

      <section className="surface rounded-2xl p-5 mb-4">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Erbrachte Heilmittel-Positionen</h2>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[12px] min-w-[520px]">
            <thead>
              <tr className="text-soft text-[10px] uppercase tracking-wider">
                <th className="text-left font-medium px-2 py-2">Code</th>
                <th className="text-left font-medium px-2 py-2">Position</th>
                <th className="text-left font-medium px-2 py-2">Einheit</th>
                <th className="text-right font-medium px-2 py-2">Menge</th>
                <th className="text-right font-medium px-2 py-2">€/Einheit</th>
                <th className="text-right font-medium px-2 py-2">Summe</th>
              </tr>
            </thead>
            <tbody>
              {POSITIONEN.map((p) => (
                <tr key={p.code} className="border-t border-app-soft">
                  <td className="px-2 py-2 font-mono text-soft">{p.code}</td>
                  <td className="px-2 py-2 font-medium">{p.name}</td>
                  <td className="px-2 py-2 text-soft">{p.einheit}</td>
                  <td className="px-2 py-2 text-right font-mono">{p.menge}</td>
                  <td className="px-2 py-2 text-right font-mono">{p.einzelpreis.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-mono">{(p.menge * p.einzelpreis).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface rounded-2xl p-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Pro Krankenkasse</h2>
        <ul className="space-y-2 text-[12px]">
          {KASSEN.map((k) => (
            <li key={k.ik} className="surface-mute rounded-lg p-3 flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium">{k.name}</div>
                <div className="font-mono text-soft text-[10px]">IK {k.ik}</div>
              </div>
              <div className="text-right">
                <div className="font-mono"><span className="text-soft">offen:</span> {k.offen.toFixed(2)} €</div>
                <div className="font-mono text-soft"><span>eingereicht:</span> {k.eingereicht.toFixed(2)} €</div>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-soft mt-3 italic">
          Phase 2: DTA-Versand SGB V § 302 (CSV-Export bereits aus /kasse-Modul vorhanden) ·
          Direkter KV-Connect-Versand statt Postversand.
        </p>
      </section>
    </AppShell>
  );
}
