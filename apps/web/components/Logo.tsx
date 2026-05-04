import { cn } from "@/lib/cn";

export function Logo({
  size = 28,
  className,
  rainbow = false,
}: {
  size?: number;
  className?: string;
  rainbow?: boolean;
}) {
  if (rainbow) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        className={cn("anim-breath", className)}
        aria-label="Shalem"
        role="img"
      >
        <defs>
          <linearGradient id="rb-up" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FF6B6B" />
            <stop offset="0.5" stopColor="#FFD53E" />
            <stop offset="1" stopColor="#73DD66" />
          </linearGradient>
          <linearGradient id="rb-down" x1="32" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5DC9D4" />
            <stop offset="0.5" stopColor="#748FFC" />
            <stop offset="1" stopColor="#B197FC" />
          </linearGradient>
        </defs>
        <path d="M16 4 L28 25 L4 25 Z" fill="none" stroke="url(#rb-up)" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M16 28 L4 7 L28 7 Z" fill="none" stroke="url(#rb-down)" strokeWidth="1.7" strokeLinejoin="round" opacity="0.55" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-label="Shalem"
      role="img"
    >
      <path d="M16 4 L28 25 L4 25 Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M16 28 L4 7 L28 7 Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" opacity="0.45" />
    </svg>
  );
}

export function Wordmark({ rainbow = false }: { rainbow?: boolean } = {}) {
  return (
    <div className="flex items-center gap-2.5">
      <Logo size={26} className="accent-text" rainbow={rainbow} />
      <span className={cn("font-display text-[17px] font-semibold tracking-tight2", rainbow && "rainbow-text")}>
        Shalem Care
      </span>
    </div>
  );
}
