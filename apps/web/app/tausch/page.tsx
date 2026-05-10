import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { CrossBruecken } from "@/components/CrossBruecken";
import { SwapMarketplace } from "@/components/SwapMarketplace";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";

export default async function TauschPage() {
  seedOnce();
  // Supabase-Hydration · fail-soft, Memory wins bei Konflikt
  if ("ladeAusSupabase" in store && typeof (store as { ladeAusSupabase?: () => Promise<void> }).ladeAusSupabase === "function") {
    await (store as { ladeAusSupabase: () => Promise<void> }).ladeAusSupabase();
  }
  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
  const offers = await store.listOffers();
  const allSlots = new Map((await store.listSlots()).map((s) => [s.id!, s]));
  const allPeople = new Map((await store.listPeople()).map((p) => [p.id, p]));

  const open       = offers.filter((o) => o.state === "open").length;
  const matched    = offers.filter((o) => o.state === "matched").length;
  const meine      = offers.filter((o) => o.offeredBy === CURRENT_USER_ID && (o.state === "open" || o.state === "matched")).length;
  const completed  = offers.filter((o) => o.state === "completed" || o.state === "approved").length;

  return (
    <AppShell
      role="nurse"
      user={{ id: nurse.id, name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station="Pulmologie 3B"
    >
      <CockpitSubNav />
      <header className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Schichten geben + nehmen · ArbZG-geprüft</p>
          <h1 className="font-display text-[28px] font-bold tracking-tight2">Tausch-Markt</h1>
          <p className="text-[13px] text-mute mt-1 max-w-prose">
            Alle offenen + matched Anfragen aus deinem Team. Akzeptieren prüft
            automatisch ArbZG-Konformität (Ruhezeit, Wochenarbeitszeit). Stationsleitung
            genehmigt im letzten Schritt.
          </p>
        </div>
        <Link href="/tausch/anbieten" className="btn btn-primary">+ Schicht anbieten</Link>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Offene Anfragen"  value={open}      hint="warten auf Übernahme" farbe="var(--vibe-team)" />
        <CockpitKpi label="Bei PDL"           value={matched}   hint="warten auf Genehmig." farbe="var(--accent)" />
        <CockpitKpi label="Meine aktiv"       value={meine}     farbe="var(--mon)" />
        <CockpitKpi label="Abgeschlossen"     value={completed} hint="ges." farbe="var(--thu)" />
      </div>

      <SwapMarketplace offers={offers} slotsById={allSlots} peopleById={allPeople} showHeader={false} />

      <CrossBruecken pathname="/tausch" />
    </AppShell>
  );
}
