import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { HKP_BASIS } from "@/lib/pvs/abrechnung/types";
import { VerordnungNeuForm } from "@/components/VerordnungNeuForm";

export const metadata = {
  title: "Neue HKP-Verordnung",
};

export default function VerordnungNeuPage() {
  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/admin/verordnungen" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Pipeline</Link>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Neue HKP-Verordnung
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          § 37 SGB V · Häusliche Krankenpflege. Demo-Form, Phase 2 mit
          ICD-10-Auswahl-Komponente und KBV-Plausibilisierung.
        </p>
      </header>

      <VerordnungNeuForm hkpBasis={HKP_BASIS} />
    </AppShell>
  );
}
