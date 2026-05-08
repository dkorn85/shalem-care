// Mini-SVG-Sparkline ohne Deps. Server-renderbar.
// Usage: <Sparkline values={[7,6,5,4]} farbe="var(--mon)" min={0} max={10} />

type Props = {
  values: number[];
  farbe?: string;
  min?: number;
  max?: number;
  width?: number;
  height?: number;
  invert?: boolean; // wenn true: niedrigere Werte = besser (z.B. Schmerz)
  label?: string;
};

export function Sparkline({
  values,
  farbe = "var(--accent)",
  min,
  max,
  width = 140,
  height = 36,
  invert = false,
  label,
}: Props) {
  if (values.length === 0) {
    return (
      <span className="font-mono text-[10px] text-soft" style={{ display: "inline-block", width, height: height - 4 }}>
        — keine Daten —
      </span>
    );
  }

  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const span = hi - lo || 1;
  const pad = 3;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = values.map((v, i) => {
    const x = pad + (values.length === 1 ? w / 2 : (i / (values.length - 1)) * w);
    const ratio = (v - lo) / span;
    const yRatio = invert ? ratio : 1 - ratio;
    const y = pad + yRatio * h;
    return [x, y] as const;
  });

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${path} L${points[points.length - 1][0].toFixed(1)},${pad + h} L${points[0][0].toFixed(1)},${pad + h} Z`;

  const last = points[points.length - 1];

  return (
    <span className="inline-flex items-center gap-1.5">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label ?? "Verlauf"}
        style={{ overflow: "visible" }}
      >
        <path d={areaPath} fill={`rgb(${cssVar(farbe)} / 0.12)`} />
        <path d={path} fill="none" stroke={`rgb(${cssVar(farbe)})`} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r={2.5} fill={`rgb(${cssVar(farbe)})`} />
      </svg>
    </span>
  );
}

// `var(--xxx)` → `var(--xxx)` so it works inside `rgb(... / 0.12)`.
function cssVar(token: string) {
  return token.startsWith("var(") || token.startsWith("--") ? token : token;
}
