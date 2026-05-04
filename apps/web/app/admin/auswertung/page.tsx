import { AppShell } from "@/components/AppShell";
import { StatsRow } from "@/components/StatsRow";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";

export default async function AuswertungPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const offers = await store.listOffers();
  const slots = await store.listSlots();
  const people = (await store.listPeople()).filter((p) => p.role === "nurse");

  const completedCount = offers.filter((o) => o.state === "completed").length;
  const totalHours = slots.reduce((sum, s) => {
    const start = new Date(s.start!);
    const end = new Date(s.end!);
    return sum + (end.getTime() - start.getTime()) / 3600_000;
  }, 0);

  return (
    <AppShell
      role="lead"
      user={{ name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Auswertung</h1>
        <p className="text-[13px] text-mute mt-1">KW 19 · Pulmologie 3B</p>
      </header>

      <div className="mb-6">
        <StatsRow
          stats={[
            { label: "Schichten geplant", value: `${slots.length}` },
            { label: "Stunden insgesamt", value: `${Math.round(totalHours)}`, unit: "h" },
            { label: "Durchgeführte Tausche", value: `${completedCount}`, hint: "diese Woche" },
            { label: "Personen aktiv", value: `${people.length}` },
          ]}
        />
      </div>

      <section className="surface rounded-2xl p-6">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-4">Verteilung Schichtarten</h2>
        <DistributionBar slots={slots} />
      </section>

      <p className="text-[12px] text-soft mt-6">Vollständige Charts mit Recharts kommen in v0.4.</p>
    </AppShell>
  );
}

function DistributionBar({ slots }: { slots: { start?: string; end?: string }[] }) {
  let early = 0, late = 0, night = 0;
  for (const s of slots) {
    const h = new Date(s.start!).getHours();
    if (h >= 22 || h < 6) night++;
    else if (h >= 12) late++;
    else early++;
  }
  const total = early + late + night;
  if (total === 0) return <p className="text-[13px] text-soft">Noch keine Daten.</p>;

  const pct = (n: number) => `${(n / total) * 100}%`;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden border border-app-soft">
        <div className="bg-amber-500" style={{ width: pct(early) }} title={`Früh: ${early}`} />
        <div className="bg-purple-500" style={{ width: pct(late) }} title={`Spät: ${late}`} />
        <div className="bg-night-500" style={{ width: pct(night) }} title={`Nacht: ${night}`} />
      </div>
      <div className="grid grid-cols-3 mt-3 text-[12px]">
        <Stat label="Früh" count={early} total={total} dot="bg-amber-500" />
        <Stat label="Spät" count={late} total={total} dot="bg-purple-500" />
        <Stat label="Nacht" count={night} total={total} dot="bg-night-500" />
      </div>
    </div>
  );
}

function Stat({ label, count, total, dot }: { label: string; count: number; total: number; dot: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-soft">{label}</span>
      </div>
      <div className="font-display font-semibold text-[16px] mt-0.5">
        {count} <span className="text-[11px] text-soft font-normal">({Math.round((count / total) * 100)}%)</span>
      </div>
    </div>
  );
}
