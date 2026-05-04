import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";

const ROW_COLORS = ["var(--mon)", "var(--tue)", "var(--thu)", "var(--fri)", "var(--sat)", "var(--sun)"];

export default async function TeamPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const people = (await store.listPeople()).filter((p) => p.role === "nurse");
  const allSlots = await store.listSlots();

  const team = await Promise.all(
    people.map(async (p) => {
      const slots = await store.listSlotsForPerson(p.id);
      const totalHours = slots.reduce((sum, s) => {
        const start = new Date(s.start!);
        const end = new Date(s.end!);
        return sum + (end.getTime() - start.getTime()) / 3600_000;
      }, 0);
      const arbzgOk = totalHours <= 48;
      return { person: p, slots: slots.length, hours: Math.round(totalHours), arbzgOk };
    })
  );

  return (
    <AppShell
      role="lead"
      user={{ name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Team-Übersicht</h1>
        <p className="text-[13px] text-mute mt-1">
          Wochenstunden, Schichten, ArbZG-Status. {team.length} {team.length === 1 ? "Person" : "Personen"}.
        </p>
      </header>

      <section className="surface rounded-2xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 border-b border-app-soft text-[11px] uppercase text-soft tracking-wide font-medium">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Tarif</div>
          <div className="col-span-2 text-right">Stunden</div>
          <div className="col-span-2 text-right">Schichten</div>
          <div className="col-span-1 text-right">ArbZG</div>
        </div>
        <ul className="divide-y divide-[rgb(var(--border-soft))]">
          {team.map((row, idx) => {
            const color = ROW_COLORS[idx % ROW_COLORS.length];
            return (
              <li
                key={row.person.id}
                className="relative grid grid-cols-2 sm:grid-cols-12 gap-3 px-5 py-3.5 anim-float items-center"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                  style={{ background: `rgb(${color})` }}
                />
                <div className="col-span-2 sm:col-span-5 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full grid place-items-center text-[11px] font-semibold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, rgb(${color}), rgb(var(--accent)))` }}
                  >
                    {row.person.initials}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium">{row.person.name}</div>
                    <div className="text-[11px] text-soft">{row.person.qualifications.join(" · ")}</div>
                  </div>
                </div>
                <div className="text-[13px] text-mute font-mono sm:col-span-2">{row.person.tariffGrade.replace("TVOED-P_", "")}</div>
                <div className="text-[13px] sm:col-span-2 sm:text-right font-mono">{row.hours} h</div>
                <div className="text-[13px] sm:col-span-2 sm:text-right font-mono">{row.slots}</div>
                <div className="sm:col-span-1 sm:text-right">
                  {row.arbzgOk ? (
                    <span className="chip" style={{ background: "rgb(var(--thu) / 0.15)", color: "rgb(var(--thu) / 1)" }}>OK</span>
                  ) : (
                    <span className="chip" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon) / 1)" }}>!</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
