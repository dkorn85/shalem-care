import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { WochenplanGrid } from "@/components/WochenplanGrid";
import { SpeiseplanKiBox } from "@/components/SpeiseplanKiBox";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
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

      <LerneTipp rolle="hauswirtschaft" titel="Was steht hinter dem Plan?">
        <strong>DGE</strong> = Deutsche Gesellschaft für Ernährung, gibt Referenzwerte
        für Senior:innen-Verpflegung. <strong>LMIV Anhang II</strong> = die 14 Pflicht-Allergene
        (Gluten, Milch, Ei, Fisch, Sesam …) — müssen pro Mahlzeit ausgewiesen sein.
        <strong> IDDSI</strong> = die 8 Konsistenz-Stufen für Schluckstörung (Stufe 4 = püriert).
        Klick auf eine Mahlzeit zeigt Allergene, Kalorien und Kostform-Variante.
      </LerneTipp>

      <WochenplanGrid />

      <div className="mt-4">
        <SpeiseplanKiBox />
      </div>

      <NurAbProfi rolle="hauswirtschaft">
        <section className="surface rounded-2xl p-4 mt-4" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Profi-Modus · Wirtschaft + HACCP</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Wareneinsatz Ø</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">4,82 €</p>
              <p className="text-[10px] text-soft">pro Klient/Tag · DGE-Quality-Standard 4,40–5,90</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Bio-Anteil</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">37 %</p>
              <p className="text-[10px] text-soft">Ziel 50 % bis Q4</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">HACCP-Checks</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">14/14</p>
              <p className="text-[10px] text-soft">Kühlkette · Kerntemperatur · Reinigung</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Reste-Quote</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">8 %</p>
              <p className="text-[10px] text-soft">Zielkorridor 5–12 %</p>
            </div>
          </div>
        </section>
      </NurAbProfi>

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
