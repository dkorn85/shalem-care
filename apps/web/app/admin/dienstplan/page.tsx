import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { getShiftType } from "@/lib/fhir";
import { format, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";

const SHIFT_LABEL: Record<string, string> = { early: "F", late: "S", night: "N" };
const SHIFT_TONE: Record<string, string> = {
  early: "bg-amber-100 text-amber-700",
  late:  "bg-purple-100 text-purple-700",
  night: "bg-night-100 text-night-700",
};

const DAY_CLASS = ["day-mon", "day-tue", "day-wed", "day-thu", "day-fri", "day-sat", "day-sun"];

export default async function DienstplanPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const people = (await store.listPeople()).filter((p) => p.role === "nurse");

  const weekStart = startOfWeek(new Date("2026-05-06"), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date("2026-05-06"), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const personSlots = await Promise.all(
    people.map(async (p) => ({ person: p, slots: await store.listSlotsForPerson(p.id) }))
  );

  return (
    <AppShell
      role="lead"
      user={{ name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Dienstplan</h1>
        <p className="text-[13px] text-mute mt-1">KW 19 · 4.–10. Mai 2026 · Lesen erst, in v0.4 dann editierbar.</p>
      </header>

      <section className="surface rounded-2xl p-2 sm:p-4 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr>
              <th className="text-left px-3 py-2.5 text-[11px] uppercase tracking-wide text-soft font-medium">Person</th>
              {days.map((d, i) => (
                <th key={d.toISOString()} className={`${DAY_CLASS[i]} text-center px-2 py-2.5 relative`}>
                  <span
                    aria-hidden
                    className="absolute top-1.5 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full"
                    style={{ background: "rgb(var(--day))" }}
                  />
                  <div className="text-[11px] font-bold tracking-wider mt-1.5" style={{ color: "rgb(var(--day))" }}>
                    {format(d, "EEEEEE", { locale: de }).toUpperCase()}
                  </div>
                  <div className="text-[10px] text-soft font-mono mt-0.5">{format(d, "d.M.")}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border-soft))]">
            {personSlots.map(({ person, slots }, rowIdx) => (
              <tr key={person.id} className="anim-float" style={{ animationDelay: `${rowIdx * 0.04}s` }}>
                <td className="px-3 py-2 text-[13px] font-medium whitespace-nowrap">{person.name}</td>
                {days.map((d) => {
                  const slot = slots.find((s) => isSameDay(new Date(s.start!), d));
                  const t = slot ? getShiftType(slot) : null;
                  return (
                    <td key={d.toISOString()} className="px-1.5 py-2 text-center">
                      {slot && t ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-[12px] font-bold ${SHIFT_TONE[t]}`}>
                          {SHIFT_LABEL[t]}
                        </span>
                      ) : (
                        <span className="text-soft text-[12px]">·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-[12px] text-soft mt-4 flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500" /> Frühschicht</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-purple-500" /> Spätschicht</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-night-500" /> Nachtschicht</span>
      </p>
    </AppShell>
  );
}
