// Stunden-Soll-Übersicht für den Monat
// Visualisiert: bisher geleistet (solid), schon geplant (lighter), offen (muted)

import { format } from "date-fns";
import { de } from "date-fns/locale";

export type HourTargetProps = {
  worked: number;       // bereits geleistet
  scheduled: number;    // schon im Plan, aber noch zukünftig
  target: number;       // Soll-Stunden im Monat
  asOf: Date;
};

export function HourTarget({ worked, scheduled, target, asOf }: HourTargetProps) {
  const future = Math.max(0, scheduled - worked);
  const open = Math.max(0, target - scheduled);

  const workedPct = Math.min(100, (worked / target) * 100);
  const scheduledPct = Math.min(100, (scheduled / target) * 100);
  const overTarget = scheduled > target;

  const monthLabel = format(asOf, "MMMM yyyy", { locale: de });

  return (
    <article className="surface rounded-2xl p-5 mb-6">
      <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Monats-Soll</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-0.5">{monthLabel}</h3>
        </div>
        <div className="text-right">
          <div className="font-mono text-[20px] font-bold">
            {worked.toFixed(1)}<span className="text-soft font-normal text-[14px]"> / {target} h</span>
          </div>
          <div className="text-[11px] text-soft">
            {open > 0 ? `noch ${open.toFixed(1)} h zu leisten` : overTarget ? `${(scheduled - target).toFixed(1)} h über Soll` : "Soll erreicht"}
          </div>
        </div>
      </div>

      <div className="relative h-3 rounded-full bg-[rgb(var(--bg-mute))] overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${scheduledPct}%`, background: "rgb(var(--mon) / 0.3)" }}
          aria-label="schon geplant"
        />
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${workedPct}%`, background: "rgb(var(--mon))" }}
          aria-label="bereits geleistet"
        />
      </div>

      <dl className="grid grid-cols-3 gap-3 mt-3 text-[12px]">
        <div>
          <dt className="text-soft text-[10px] uppercase tracking-wide">Geleistet</dt>
          <dd className="font-mono font-medium mt-0.5">{worked.toFixed(1)} h</dd>
        </div>
        <div>
          <dt className="text-soft text-[10px] uppercase tracking-wide">Geplant</dt>
          <dd className="font-mono font-medium mt-0.5">{future.toFixed(1)} h</dd>
        </div>
        <div>
          <dt className="text-soft text-[10px] uppercase tracking-wide">Offen</dt>
          <dd className="font-mono font-medium mt-0.5" style={{ color: open > 0 ? "rgb(var(--mon))" : "rgb(var(--thu))" }}>
            {open.toFixed(1)} h
          </dd>
        </div>
      </dl>
    </article>
  );
}
