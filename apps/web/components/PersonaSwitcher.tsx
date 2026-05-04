"use client";

// Persona-Switcher — sichtbar nur im Demo-Mode. Erlaubt während einer
// Live-Vorführung das schnelle Springen zwischen den vier Rollen, ohne
// Login-Theater. Auf prod-Mandanten wird das durch echtes Auth ersetzt.

import Link from "next/link";
import { usePathname } from "next/navigation";

type Persona = {
  href: string;
  label: string;
  who: string;
  emoji: string;
  color: string;
  // Heuristisch: bei welchen Pfaden zeigen wir diese Persona als aktiv?
  matches: (path: string) => boolean;
};

const PERSONAS: Persona[] = [
  {
    href: "/",
    label: "Pflegekraft",
    who: "Dennis Reuter",
    emoji: "🩺",
    color: "var(--mon)",
    matches: (p) =>
      p === "/" ||
      p.startsWith("/dienst") ||
      p.startsWith("/tausch") ||
      p.startsWith("/profil"),
  },
  {
    href: "/klient",
    label: "Klient:in",
    who: "Helga Reinhardt",
    emoji: "🌿",
    color: "var(--wed)",
    matches: (p) => p.startsWith("/klient"),
  },
  {
    href: "/admin",
    label: "Stationsleitung",
    who: "Detektiv Eins",
    emoji: "📋",
    color: "var(--vibe-team)",
    matches: (p) => p.startsWith("/admin"),
  },
  {
    href: "/arzt",
    label: "Arzt:Ärztin",
    who: "Dr. Hartmann",
    emoji: "👩‍⚕️",
    color: "var(--vibe-profile)",
    matches: (p) => p.startsWith("/arzt"),
  },
];

export function PersonaSwitcher({ demoMode }: { demoMode: boolean }) {
  const pathname = usePathname();
  if (!demoMode) return null;

  return (
    <div className="surface rounded-xl px-2 py-1.5 flex items-center gap-1 flex-wrap">
      <span className="text-[10px] uppercase tracking-wider text-soft font-medium px-1.5 hidden sm:inline">
        Demo · Persona
      </span>
      {PERSONAS.map((p) => {
        const active = p.matches(pathname);
        return (
          <Link
            key={p.href}
            href={p.href}
            className="rounded-lg px-2 py-1 flex items-center gap-1.5 text-[12px] font-medium transition-colors"
            style={{
              background: active ? `rgb(${p.color} / 0.15)` : "transparent",
              color: active ? `rgb(${p.color})` : "rgb(var(--fg-mute))",
            }}
            title={p.who}
          >
            <span aria-hidden>{p.emoji}</span>
            <span className="hidden md:inline">{p.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
