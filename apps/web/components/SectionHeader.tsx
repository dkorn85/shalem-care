// SectionHeader · einheitliche Section-Headline mit Eyebrow + Titel + Lead.
//
// Ersetzt die ~30 Inline-Wiederholungen in Pages. Akzent-Farbe optional.

export type SectionHeaderProps = {
  eyebrow?: string;
  titel: React.ReactNode;
  lead?: React.ReactNode;
  size?: "small" | "medium" | "large" | "hero";
  accent?: string;
  align?: "left" | "center";
  className?: string;
};

const SIZE_TITEL: Record<NonNullable<SectionHeaderProps["size"]>, string> = {
  small:  "text-[16px] sm:text-[18px]",
  medium: "text-[20px] sm:text-[24px]",
  large:  "text-[24px] sm:text-[32px]",
  hero:   "text-[36px] sm:text-[52px]",
};

const farbeStyle = (accent: string): string =>
  accent.startsWith("rgb") || accent.startsWith("var") ? accent : `rgb(${accent})`;

export function SectionHeader({
  eyebrow,
  titel,
  lead,
  size = "medium",
  accent,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  return (
    <header className={`mb-3 ${align === "center" ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <p
          className="text-[11px] uppercase tracking-wider mb-2 font-medium"
          style={accent ? { color: farbeStyle(accent) } : { color: "rgb(var(--fg-soft))" }}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display ${SIZE_TITEL[size]} font-bold tracking-tight2 leading-tight`}>
        {titel}
      </h2>
      {lead && (
        <div className={`text-[13px] sm:text-[14px] text-mute mt-2 leading-relaxed ${align === "center" ? "max-w-prose mx-auto" : "max-w-prose"}`}>
          {lead}
        </div>
      )}
    </header>
  );
}
