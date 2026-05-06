// RainbowText / RainbowBar · dünne Wrapper über die bestehenden globals.css
// Klassen `.rainbow-text` und `.rainbow-bar`. Zweck: Type-Safety + ein
// einziger Anlaufpunkt (statt jede Page schreibt `<span class="rainbow-text">`).
//
// Beide Komponenten respektieren `prefers-reduced-motion` automatisch — die
// shimmer-Animation ist in globals.css für reduced-motion bereits abgeschaltet.

export function RainbowText({
  children,
  as: Tag = "span",
  className = "",
}: {
  children: React.ReactNode;
  as?: "span" | "strong" | "em";
  className?: string;
}) {
  return <Tag className={`rainbow-text ${className}`}>{children}</Tag>;
}

export function RainbowBar({
  width = "md",
  className = "",
}: {
  width?: "sm" | "md" | "lg";
  className?: string;
}) {
  const w = width === "sm" ? "w-16" : width === "lg" ? "w-32" : "w-24";
  return <div aria-hidden className={`rainbow-bar h-1.5 rounded-full ${w} ${className}`} />;
}
