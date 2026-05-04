type Stat = {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
};

const TILE_COLORS = [
  "var(--mon)",
  "var(--tue)",
  "var(--thu)",
  "var(--fri)",
  "var(--sun)",
];

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="stat-tile anim-float"
          style={{
            ["--tile-color" as string]: TILE_COLORS[i % TILE_COLORS.length],
            animationDelay: `${i * 0.05}s`,
          }}
        >
          <div className="text-[11px] text-soft font-medium tracking-wide uppercase">{s.label}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className="font-display font-semibold tracking-tight2 text-[28px] leading-none"
              style={{ color: `rgb(${TILE_COLORS[i % TILE_COLORS.length]})` }}
            >
              {s.value}
            </span>
            {s.unit && <span className="text-[12px] text-soft">{s.unit}</span>}
          </div>
          {s.hint && <div className="text-[11px] text-soft mt-1.5">{s.hint}</div>}
        </div>
      ))}
    </section>
  );
}
