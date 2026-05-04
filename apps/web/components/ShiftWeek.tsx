import type { Slot } from "@medplum/fhirtypes";
import { getShiftType } from "@/lib/fhir";
import { format, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";

const SHIFT_LABEL: Record<string, string> = {
  early: "Früh", late: "Spät", night: "Nacht", intermediate: "Zwischen",
};

const SHIFT_TONE: Record<string, { bg: string; fg: string; ring: string }> = {
  early:        { bg: "bg-amber-100",  fg: "text-amber-700",  ring: "ring-amber-200" },
  late:         { bg: "bg-purple-100", fg: "text-purple-700", ring: "ring-purple-200" },
  night:        { bg: "bg-night-100",  fg: "text-night-700",  ring: "ring-night-200" },
  intermediate: { bg: "bg-coral-100",  fg: "text-coral-700",  ring: "ring-coral-200" },
};

const DAY_CLASS = ["day-mon", "day-tue", "day-wed", "day-thu", "day-fri", "day-sat", "day-sun"];

export function ShiftWeek({
  slots,
  weekOf,
  totalHours,
  shiftCount,
}: {
  slots: Slot[];
  weekOf: Date;
  totalHours: number;
  shiftCount: number;
}) {
  const weekStart = startOfWeek(weekOf, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekOf, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <section className="surface rounded-2xl p-5 sm:p-6">
      <header className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-tight2">Meine Woche</h2>
          <p className="text-[13px] text-soft mt-0.5">
            {shiftCount} Schichten geplant · KW {format(weekOf, "II", { locale: de })}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-soft">
          <Legend dot="bg-amber-500" label="Früh" />
          <Legend dot="bg-purple-500" label="Spät" />
          <Legend dot="bg-night-500" label="Nacht" />
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {days.map((day, idx) => {
          const dayClass = DAY_CLASS[idx];
          const slot = slots.find((s) => isSameDay(new Date(s.start!), day));
          const isToday = isSameDay(day, new Date());
          return (
            <DayCell
              key={day.toISOString()}
              day={day}
              slot={slot}
              dayClass={dayClass}
              isToday={isToday}
              animDelay={idx}
            />
          );
        })}
      </div>
    </section>
  );
}

function DayCell({
  day,
  slot,
  dayClass,
  isToday,
  animDelay,
}: {
  day: Date;
  slot?: Slot;
  dayClass: string;
  isToday: boolean;
  animDelay: number;
}) {
  const t = slot ? getShiftType(slot) : null;
  const tone = t ? SHIFT_TONE[t] : null;
  const dayLabel = format(day, "EEEEEE", { locale: de }).toUpperCase();
  const dateLabel = format(day, "d.M.", { locale: de });

  return (
    <div
      className={`${dayClass} relative anim-float`}
      style={{ animationDelay: `${animDelay * 0.04}s` }}
    >
      <span
        aria-hidden
        className="absolute top-0 left-3 right-3 h-[3px] rounded-full"
        style={{ background: "rgb(var(--day))" }}
      />
      <div
        className={`pt-3 pb-3 px-3 rounded-xl border ${
          isToday ? "border-[rgb(var(--day))] bg-[rgb(var(--day)/0.06)]" : "border-app-soft bg-[rgb(var(--bg-mute))]"
        } min-h-[110px] flex flex-col`}
      >
        <div className="flex items-baseline justify-between mb-2">
          <span
            className="text-[11px] font-bold tracking-wider"
            style={{ color: "rgb(var(--day))" }}
          >
            {dayLabel}
          </span>
          <span className="text-[11px] text-soft font-mono">{dateLabel}</span>
        </div>

        {slot && tone ? (
          <div className={`${tone.bg} ${tone.fg} rounded-lg px-2.5 py-2 mt-auto`}>
            <div className="text-[13px] font-semibold leading-tight">
              {t ? SHIFT_LABEL[t] : "Schicht"}
            </div>
            <div className="text-[11px] opacity-80 font-mono mt-0.5">
              {format(new Date(slot.start!), "HH")}–{format(new Date(slot.end!), "HH")}
            </div>
          </div>
        ) : (
          <div className="mt-auto text-[12px] text-soft italic">Frei</div>
        )}
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
