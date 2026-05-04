import { AppShell } from "@/components/AppShell";
import { SwapMarketplace } from "@/components/SwapMarketplace";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import Link from "next/link";

export default async function TauschPage() {
  seedOnce();
  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
  const offers = await store.listOffers();
  const allSlots = new Map((await store.listSlots()).map((s) => [s.id!, s]));
  const allPeople = new Map((await store.listPeople()).map((p) => [p.id, p]));

  return (
    <AppShell
      role="nurse"
      user={{ name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-tight2">Tausch-Markt</h1>
          <p className="text-[13px] text-mute mt-1">Alle offenen und matched Anfragen aus deinem Team.</p>
        </div>
        <Link href="/tausch/anbieten" className="btn btn-primary">+ Schicht anbieten</Link>
      </header>

      <SwapMarketplace offers={offers} slotsById={allSlots} peopleById={allPeople} showHeader={false} />
    </AppShell>
  );
}
