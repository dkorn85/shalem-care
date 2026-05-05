import Link from "next/link";
import { KasseShell } from "@/components/KasseShell";

export const metadata = { title: "eAU-Eingang · Krankenkasse" };

export default function EauPage() {
  return (
    <KasseShell user={{ name: "Sandra Lehmann", ik: "100000031", role: "sachbearbeiterin" }} kassenName="AOK Nordost">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Krankenkasse · Eingang</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2 leading-tight">
          eAU-Eingang über TI
        </h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose leading-relaxed">
          Elektronische Arbeitsunfähigkeits-Bescheinigungen kommen über die Telematik-Infrastruktur
          direkt vom Hausarzt → Krankenkasse → Arbeitgeber. Diese Sicht zeigt den Eingangskorb
          und Bearbeitungs-Status.
        </p>
      </header>

      <section className="surface rounded-2xl p-5 mb-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · Bausteine</p>
        <ul className="space-y-2 text-[13px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>FHIR-Bundle-Empfang über gematik-Konnektor (Vorgang_eAU)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Auto-Plausibilität: Versicherten-Nr. · LANR · Diagnose-ICD-Code · Zeitraum</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Krankengeld-Trigger nach 6 Wo · Reha-Vorschlag DRV-Auto-Pre-Check</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>BEM-Hinweis an Arbeitgeber wenn ≥ 6 Wo in 12 Mo</span></li>
        </ul>
      </section>

      <Link href="/kasse" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">← Eingangskorb</Link>
    </KasseShell>
  );
}
