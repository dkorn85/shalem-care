import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { WochenplanGrid } from "@/components/WochenplanGrid";
import { SpeiseplanKiBox } from "@/components/SpeiseplanKiBox";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = {
  title: "Hauswirtschaft · Wochenplan",
  description: "Mahlzeiten, Kostformen, Allergen-Filter — DGE-konformer 7-Tage-Plan.",
};

export default async function HauswirtschaftWochenplanPage() {
  const aktiv = await getActivePersona("hwf-001", "hauswirtschaft");
  return (
    <AppShell
      role="hauswirtschaft"
      user={userPropsAus(aktiv, { id: "hwf-001", name: "Helmut Brandt", subtitle: "Hauswirtschaftsleitung", initials: "HB" })}
      station="Pulmologie 3B"
    >
      <header className="mb-4">
        <Link href="/hauswirtschaft" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Hauswirtschaft
        </Link>
      </header>

      <RolePastelHeader
        rolle="hauswirtschaft"
        eyebrow="Wochenplan · DGE + LMIV-konform"
        titel="7 Tage · 6 Kostformen · Allergen-Filter"
      >
        Klick eine Mahlzeit für Details · oben Kostform wählen, das Grid blendet
        nicht-passende Mahlzeiten transparent aus. Tages-kcal werden gefiltert berechnet.
      </RolePastelHeader>

      <WochenplanGrid />

      <div className="mt-4">
        <SpeiseplanKiBox />
      </div>

      <section className="surface rounded-2xl p-5 sm:p-6 mt-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes</p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Pro-Klient:in-Wunschmenü via iPad-Bestellung 1 Tag vorher</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Bestell-Sync zu Bio-Lieferanten (Mengen + Charge automatisch)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>HACCP-Charge-Verfolgung pro Mahlzeit · Rückverfolgbarkeit Anhang IV</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Nährwert-Tabelle pro Klient:in (MNA-Risiko-Cluster aus Pflege)</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
