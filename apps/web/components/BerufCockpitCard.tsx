// Wiederverwendbare Cockpit-Karte für die Berufsgruppen-Cockpits.
// Konsistente Optik über Therapie/Sozial/Erziehung/Ehrenamt hinweg.

import Link from "next/link";

export function CockpitKpi({
  label,
  value,
  unit,
  hint,
  farbe,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  farbe?: string;
}) {
  return (
    <div className="surface rounded-xl p-3 relative overflow-hidden">
      {farbe && (
        <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      )}
      <div className={farbe ? "ml-2.5" : ""}>
        <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
        <div
          className="font-display font-bold text-[22px] mt-0.5 leading-none"
          style={{ color: farbe ? `rgb(${farbe})` : undefined }}
        >
          {value}
          {unit && <span className="text-[12px] text-mute font-normal ml-0.5">{unit}</span>}
        </div>
        {hint && <div className="text-[10px] text-soft mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

export function CockpitListItem({
  href,
  badge,
  title,
  subtitle,
  badgeFarbe,
  meta,
}: {
  href?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  badgeFarbe?: string;
  meta?: string;
}) {
  const inner = (
    <div className="surface-hover rounded-xl p-3 relative overflow-hidden flex items-baseline justify-between gap-3 flex-wrap">
      {badgeFarbe && (
        <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${badgeFarbe})` }} />
      )}
      <div className={`flex-1 min-w-0 ${badgeFarbe ? "ml-2.5" : ""}`}>
        <div className="flex items-baseline gap-2 flex-wrap">
          {badge && (
            <span className="chip text-[10px]" style={{ background: `rgb(${badgeFarbe ?? "var(--bg-mute)"} / 0.15)`, color: `rgb(${badgeFarbe ?? "var(--fg-mute)"})` }}>
              {badge}
            </span>
          )}
          <span className="font-medium text-[13px]">{title}</span>
        </div>
        {subtitle && <p className="text-[12px] text-mute mt-0.5">{subtitle}</p>}
      </div>
      {meta && <span className="text-[11px] font-mono text-soft">{meta}</span>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function CockpitSection({
  eyebrow,
  title,
  count,
  children,
}: {
  eyebrow: string;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <header className="mb-3 flex items-baseline gap-2 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-0.5 font-medium">{eyebrow}</p>
          <h2 className="font-display text-[18px] font-bold tracking-tight2">{title}</h2>
        </div>
        {count !== undefined && (
          <span className="chip text-[11px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
            {count}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}
