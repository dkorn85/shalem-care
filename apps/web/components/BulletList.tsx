// BulletList · Liste mit konsistenten Bullet-Markern.
//
// Pattern aus /page (Schlussstein), /compliance (Phase-2), /notfall
// (Phase-2), /treuhand (Phase-2): identische `<li>`-Struktur mit
// chevron oder farbigem Dot. Statt jede Page das Markup zu kopieren,
// hier zentral.
//
// marker:
// - "chevron":  > Pfeil in Soft-Farbe (default — Phase-2-Listen)
// - "dot":      • neutraler Punkt
// - "color":    • farbiger Punkt pro Item (akzent-Prop)

export type BulletItem = {
  text: React.ReactNode;
  akzent?: string;        // CSS-Var, für marker="color"
};

export type BulletListProps = {
  items: BulletItem[];
  marker?: "chevron" | "dot" | "color";
  size?: "sm" | "md";
  className?: string;
};

const farbe = (a?: string): string => {
  if (!a) return "rgb(var(--accent))";
  return a.startsWith("rgb") ? a : `rgb(${a})`;
};

export function BulletList({
  items,
  marker = "chevron",
  size = "sm",
  className = "",
}: BulletListProps) {
  const text = size === "sm" ? "text-[12px]" : "text-[14px]";
  return (
    <ul className={`${size === "sm" ? "space-y-1.5" : "space-y-2"} ${text} ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 items-baseline">
          {marker === "chevron" && <span aria-hidden className="text-soft shrink-0">›</span>}
          {marker === "dot" && <span aria-hidden className="text-soft shrink-0">•</span>}
          {marker === "color" && (
            <span
              aria-hidden
              className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
              style={{ background: farbe(it.akzent) }}
            />
          )}
          <span className="leading-relaxed">{it.text}</span>
        </li>
      ))}
    </ul>
  );
}
