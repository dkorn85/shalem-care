import Link from "next/link";
import { KasseShell } from "@/components/KasseShell";

export const metadata = { title: "Krankengeld · Krankenkasse" };

export default function KrankengeldPage() {
  return (
    <KasseShell user={{ name: "Sandra Lehmann", ik: "100000031", role: "sachbearbeiterin" }} kassenName="AOK Nordost">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Krankenkasse · Leistung</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2 leading-tight">
          Krankengeld nach § 44 SGB V
        </h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose leading-relaxed">
          Auszahlung an Versicherte nach Ende der 6-Wochen-Lohnfortzahlung durch Arbeitgeber.
          70 % Brutto / 90 % Netto, max. 78 Wochen je 3-Jahres-Block.
        </p>
      </header>

      <section className="surface rounded-2xl p-5 mb-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · Workflow</p>
        <ul className="space-y-2 text-[13px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Auto-Trigger nach 42 Tagen kumulierter AU bei gleicher Diagnose</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Berechnung: Letzte 12 Mo Brutto · Beitragsbemessungsgrenze beachten</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>MD-Begutachtung anstoßen bei unklarer Prognose (§ 275 SGB V)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Übergang zu Erwerbsminderungsrente (DRV) wenn Prognose &gt; 6 Mo</span></li>
        </ul>
      </section>

      <Link href="/kasse" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">← Eingangskorb</Link>
    </KasseShell>
  );
}
