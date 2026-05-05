import Link from "next/link";
import { KasseShell } from "@/components/KasseShell";

export const metadata = { title: "HKP-Genehmigung · Krankenkasse" };

export default function HkpPage() {
  return (
    <KasseShell user={{ name: "Sandra Lehmann", ik: "100000031", role: "sachbearbeiterin" }} kassenName="AOK Nordost">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Krankenkasse · HKP</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2 leading-tight">
          Häusliche Krankenpflege · § 37 SGB V
        </h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose leading-relaxed">
          Verordnung kommt vom Hausarzt, Pflegedienst reicht ein. Krankenkasse genehmigt — meist
          4 Wochen, Folge-Verordnungen je 3-12 Monate. Differenzierung Behandlungspflege vs.
          Grundpflege ist abrechnungsrelevant.
        </p>
      </header>

      <section className="surface rounded-2xl p-5 mb-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · Workflow</p>
        <ul className="space-y-2 text-[13px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Empfang Muster-12-Verordnung als FHIR-Bundle (gematik-Pilot)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Auto-Genehmigung bei Standard-Maßnahmen (Insulin · Wundverband · Medi-Stellung)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>MD-Antrag bei Sonderbedarf (24h-Pflege · Beatmung · Spezial-Wundversorgung)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Punktwert-Abrechnung mit Pflegedienst nach Bundesland-Vergütungs-Vertrag</span></li>
        </ul>
      </section>

      <Link href="/kasse" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">← Eingangskorb</Link>
    </KasseShell>
  );
}
