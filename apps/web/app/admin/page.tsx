import { AppShell } from "@/components/AppShell";
import { StatsRow } from "@/components/StatsRow";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { germanLabel } from "@/lib/swap-machine";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";

export default async function AdminDashboard() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const offers = await store.listOffers();
  const people = (await store.listPeople()).filter((p) => p.role === "nurse");
  const slots = await store.listSlots();

  const matchedCount = offers.filter((o) => o.state === "matched").length;
  const openCount = offers.filter((o) => o.state === "open").length;
  const completedCount = offers.filter((o) => o.state === "completed").length;

  const recent = [...offers]
    .sort((a, b) => new Date(b.offeredAt).getTime() - new Date(a.offeredAt).getTime())
    .slice(0, 5);

  return (
    <AppShell
      role="lead"
      user={{ id: lead.id, name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-8">
        <h1 className="font-display text-[36px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
          Hallo, <span className="rainbow-text">{lead.name.split(" ")[0]}</span>.
        </h1>
        <p className="text-[14px] text-mute mt-2">Pulmologie 3B · KW 19 · {people.length} Pflegekräfte im Plan</p>
      </header>

      <div className="mb-8">
        <StatsRow
          stats={[
            { label: "Wartet auf dich", value: `${matchedCount}`, hint: matchedCount === 1 ? "Tausch matched" : "Tausche matched" },
            { label: "Offen im Markt", value: `${openCount}` },
            { label: "Abgeschlossen", value: `${completedCount}`, unit: "diese Woche" },
            { label: "Team", value: `${people.length}`, unit: "aktiv" },
          ]}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mb-6">
        <QuickLink
          href="/admin/disposition"
          title="KI-Disposition"
          desc={`${openCount} ${openCount === 1 ? "offene Schicht" : "offene Schichten"} mit Empfehlungen`}
          color="var(--vibe-market)"
        />
        <QuickLink
          href="/admin/genehmigungen"
          title="Genehmigungen"
          desc={`${matchedCount} ${matchedCount === 1 ? "Tausch wartet" : "Tausche warten"} auf Freigabe`}
          color="var(--vibe-approval)"
        />
        <QuickLink
          href="/admin/team"
          title="Team-Übersicht"
          desc="Wochenstunden, ArbZG-Status"
          color="var(--vibe-team)"
        />
      </div>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <header className="flex items-end justify-between mb-4">
          <h2 className="font-display text-[16px] font-semibold tracking-tight2">Letzte Aktivität</h2>
          <Link href="/admin/genehmigungen" className="text-[12px] text-soft hover:text-mute">Alle →</Link>
        </header>
        <ul className="space-y-1.5">
          {recent.map((o, idx) => {
            const slot = slots.find((s) => s.id === o.slotId);
            return (
              <li key={o.id} className="flex items-center justify-between text-[13px] py-1.5">
                <span className="flex items-center gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: `rgb(var(--${["mon", "tue", "thu", "fri", "sun"][idx % 5]}))` }}
                  />
                  <span className="text-mute">{format(new Date(o.offeredAt), "d.M. HH:mm", { locale: de })}</span>
                  <span>·</span>
                  <span>{germanLabel(o.state)}</span>
                </span>
                <span className="text-soft text-[12px]">{slot ? format(new Date(slot.start!), "EEEEEE d.M.", { locale: de }) : ""}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}

function QuickLink({ href, title, desc, color }: { href: string; title: string; desc: string; color: string }) {
  return (
    <Link
      href={href}
      className="surface-hover rounded-xl p-4 group anim-float relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ background: `rgb(${color})` }}
      />
      <div className="ml-2.5">
        <div className="font-display text-[15px] font-semibold tracking-tightish">{title}</div>
        <div className="text-[12px] text-mute mt-1">{desc}</div>
        <div className="text-[12px] mt-2 transition-colors" style={{ color: `rgb(${color})` }}>
          Öffnen <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </div>
      </div>
    </Link>
  );
}
