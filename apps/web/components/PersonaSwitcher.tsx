"use client";

// Persona-Switcher als Dropdown.
//
// Sichtbar nur im Demo-Mode. Erlaubt während einer Live-Vorführung das
// schnelle Springen zwischen allen Rollen, gruppiert nach Versorgung /
// Verwaltung / Empfänger / Plattform. Auf prod-Mandanten wird das durch
// echtes Auth (Keycloak + HBA/eGK) ersetzt.

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Persona = {
  href: string;
  label: string;
  who: string;
  emoji: string;
  color: string;
  portrait?: string;          // small dropdown-thumbnail
  matches: (path: string) => boolean;
};

type PersonaGroup = {
  label: string;
  personas: Persona[];
};

const GROUPS: PersonaGroup[] = [
  {
    label: "Versorgung",
    personas: [
      {
        href: "/pflege", label: "Pflegekraft", who: "Dennis Reuter",
        emoji: "🩺", color: "var(--mon)",
        portrait: "/portraits/portal-pflege.png",
        matches: (p) => p === "/pflege" || p.startsWith("/pflege") || p.startsWith("/dienst") || p.startsWith("/tausch") || p.startsWith("/profil") || p.startsWith("/fortbildung"),
      },
      {
        href: "/arzt", label: "Arzt:Ärztin", who: "Dr. Susanne Hartmann",
        emoji: "👩‍⚕️", color: "var(--vibe-profile)",
        portrait: "/portraits/portal-arzt.png",
        matches: (p) => p.startsWith("/arzt"),
      },
      {
        href: "/therapie", label: "Therapie", who: "Sebastian Rauer",
        emoji: "🤲", color: "var(--fri)",
        portrait: "/anamnese/header-therapie.png",
        matches: (p) => p.startsWith("/therapie"),
      },
      {
        href: "/sozial", label: "Sozialarbeit", who: "Mira Wagner",
        emoji: "📋", color: "var(--tue)",
        portrait: "/people/person-sozial-001.png",
        matches: (p) => p.startsWith("/sozial"),
      },
      {
        href: "/ehrenamt", label: "Ehrenamt", who: "Rita Schöndorf",
        emoji: "🤝", color: "var(--thu)",
        portrait: "/people/person-ehrenamt-001.png",
        matches: (p) => p.startsWith("/ehrenamt"),
      },
    ],
  },
  {
    label: "Bildung",
    personas: [
      {
        href: "/erziehung", label: "Erziehung", who: "Yvonne Berger",
        emoji: "🌻", color: "var(--wed)",
        portrait: "/anamnese/header-erziehung.png",
        matches: (p) => p.startsWith("/erziehung"),
      },
    ],
  },
  {
    label: "Verwaltung",
    personas: [
      {
        href: "/admin", label: "Stationsleitung", who: "Detektiv Eins",
        emoji: "🗂", color: "var(--vibe-team)",
        portrait: "/portraits/portal-lead.png",
        matches: (p) => p.startsWith("/admin"),
      },
      {
        href: "/kasse", label: "Krankenkasse", who: "Sandra Lehmann (AOK Nordost)",
        emoji: "💶", color: "var(--vibe-stats)",
        matches: (p) => p.startsWith("/kasse"),
      },
    ],
  },
  {
    label: "Empfänger:in",
    personas: [
      {
        href: "/klient", label: "Klient:in", who: "Helga Reinhardt (PG 3)",
        emoji: "🌿", color: "var(--wed)",
        portrait: "/portraits/portal-klient.png",
        matches: (p) => p.startsWith("/klient"),
      },
    ],
  },
  {
    label: "Plattform",
    personas: [
      {
        href: "/genossenschaft", label: "Genossenschaft", who: "öffentliche Sicht",
        emoji: "🏛", color: "var(--sun)",
        matches: (p) => p.startsWith("/genossenschaft"),
      },
      {
        href: "/system", label: "System-Terminal", who: "Mandanten-Übersicht",
        emoji: "⚙", color: "var(--fg-soft)",
        matches: (p) => p.startsWith("/system"),
      },
    ],
  },
];

function findActive(path: string): Persona | null {
  for (const g of GROUPS) {
    for (const p of g.personas) {
      if (p.matches(path)) return p;
    }
  }
  return null;
}

export function PersonaSwitcher({ demoMode }: { demoMode: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!demoMode) return null;
  const active = findActive(pathname) ?? GROUPS[0].personas[0];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="surface rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-[12px] font-medium transition-colors hover:bg-[rgb(var(--bg-mute))]"
        aria-haspopup="listbox"
        aria-expanded={open}
        title={active.who}
      >
        <span className="text-[10px] uppercase tracking-wider text-soft hidden sm:inline">Demo</span>
        <span aria-hidden>{active.emoji}</span>
        <span style={{ color: `rgb(${active.color})` }} className="font-semibold truncate max-w-[120px]">
          {active.label}
        </span>
        <span aria-hidden className="text-soft text-[10px] transition-transform" style={{ transform: open ? "rotate(180deg)" : undefined }}>▾</span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-[280px] surface rounded-xl shadow-xl border border-app-soft z-50 overflow-hidden anim-slideUp"
          style={{ boxShadow: "var(--shadow-xl)" }}
          role="listbox"
        >
          <div className="px-3 py-2 border-b border-app-soft">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Persona wählen</p>
            <p className="text-[11px] text-mute mt-0.5">Live-Demo · keine echten Patientendaten</p>
          </div>
          <div className="max-h-[480px] overflow-y-auto">
            {GROUPS.map((g) => (
              <div key={g.label} className="border-b border-app-soft last:border-b-0">
                <p className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-wider text-soft font-mono">
                  {g.label}
                </p>
                <ul>
                  {g.personas.map((p) => {
                    const isActive = p.matches(pathname);
                    return (
                      <li key={p.href}>
                        <Link
                          href={p.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-[rgb(var(--bg-mute))] transition-colors"
                          style={{
                            background: isActive ? `rgb(${p.color} / 0.08)` : undefined,
                          }}
                          role="option"
                          aria-selected={isActive}
                        >
                          {p.portrait ? (
                            <span className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 surface-mute">
                              <Image src={p.portrait} alt="" fill sizes="32px" className="object-cover" />
                            </span>
                          ) : (
                            <span className="w-8 h-8 grid place-items-center rounded-full text-[14px] shrink-0" style={{ background: `rgb(${p.color} / 0.15)`, color: `rgb(${p.color})` }}>
                              {p.emoji}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[13px] font-medium truncate" style={{ color: isActive ? `rgb(${p.color})` : undefined }}>
                                {p.label}
                              </span>
                              {isActive && <span aria-hidden className="text-[10px]" style={{ color: `rgb(${p.color})` }}>●</span>}
                            </div>
                            <p className="text-[10px] text-soft truncate">{p.who}</p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-app-soft bg-[rgb(var(--bg-mute)/0.4)]">
            <p className="text-[10px] text-soft">
              Tipp: Strg/⌘ + K für Schnellsprung (Phase 2)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
