"use client";

// RolePortal — dynamische Rollenwahl statt Button-Reihe.
// Eine fluide Reihe großer Persona-Tiles. Hover/Focus expandiert das aktive
// Tile, Tagline und CTA fliegen ein. Klick navigiert. Auf Touch tippt man
// einmal um zu öffnen, zweimal um zu navigieren — die typische "Reveal-then-
// commit"-Geste eines Portals.

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

type Role = {
  id: string;
  href: string;
  label: string;
  who: string;
  tagline: string;
  portrait: string;
  loop?: string;
  color: string;
};

const ROLES: Role[] = [
  {
    id: "pflege",
    href: "/pflege",
    label: "Pflegekraft",
    who: "Dennis Reuter",
    tagline: "Meine Zeit, mein Balance-Akt.",
    portrait: "/portraits/portal-pflege.png",
    loop: "/loops/portal-pflege.webm",
    color: "var(--mon)",
  },
  {
    id: "klient",
    href: "/klient",
    label: "Klient:in",
    who: "Helga Reinhardt",
    tagline: "Volle Transparenz, einfache Sprache.",
    portrait: "/portraits/portal-klient.png",
    loop: "/loops/portal-klient.webm",
    color: "var(--wed)",
  },
  {
    id: "lead",
    href: "/admin",
    label: "Leitung",
    who: "Detektiv Eins",
    tagline: "Ich steuere mein Team mit Fürsorge.",
    portrait: "/portraits/portal-lead.png",
    loop: "/loops/portal-lead.webm",
    color: "var(--vibe-team)",
  },
  {
    id: "arzt",
    href: "/arzt",
    label: "Arzt:Ärztin",
    who: "Dr. Susanne Hartmann",
    tagline: "Meine ganze Praxis im Blick.",
    portrait: "/portraits/portal-arzt.png",
    loop: "/loops/portal-arzt.webm",
    color: "var(--vibe-profile)",
  },
];

export function RolePortal() {
  const [active, setActive] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const fn = () => setReduced(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);

  return (
    <div
      className="relative"
      onMouseLeave={() => setActive(null)}
    >
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
        role="radiogroup"
        aria-label="Rolle wählen"
      >
        {ROLES.map((r, i) => {
          const isActive = active === r.id;
          const isDimmed = active !== null && active !== r.id;
          return (
            <Link
              key={r.id}
              href={r.href}
              role="radio"
              aria-checked={isActive}
              aria-label={`${r.label} — ${r.tagline}`}
              onMouseEnter={() => setActive(r.id)}
              onFocus={() => setActive(r.id)}
              className="group relative block rounded-2xl overflow-hidden surface anim-slideUp"
              style={{
                animationDelay: `${i * 0.07}s`,
                aspectRatio: "3 / 4",
                transform: isActive ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: isActive
                  ? `0 24px 48px rgb(${r.color} / 0.18), 0 8px 20px rgb(${r.color} / 0.12)`
                  : undefined,
                opacity: isDimmed ? 0.55 : 1,
                transition:
                  "transform .45s var(--ease-out-quart), opacity .35s var(--ease-out-quad), box-shadow .45s var(--ease-out-quart)",
              }}
            >
              {/* Portrait */}
              <div className="absolute inset-0">
                <Image
                  src={r.portrait}
                  alt={r.label}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                  style={{
                    transform: isActive ? "scale(1.08)" : "scale(1.02)",
                    filter: isActive ? "saturate(1.1)" : "saturate(0.92)",
                    transition:
                      "transform .8s var(--ease-out-quart), filter .5s var(--ease-out-quad)",
                  }}
                  priority={i < 2}
                />
              </div>

              {/* Loop video on hover */}
              {r.loop && !reduced && isActive && (
                <video
                  src={r.loop}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover anim-fadeIn"
                />
              )}

              {/* Color veil */}
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: isActive
                    ? `linear-gradient(180deg, transparent 35%, rgb(${r.color} / 0.05) 60%, rgb(0 0 0 / 0.55) 100%)`
                    : "linear-gradient(180deg, transparent 50%, rgb(0 0 0 / 0.42) 100%)",
                  transition: "background .5s var(--ease-out-quart)",
                }}
              />

              {/* Color accent bar */}
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{
                  background: `rgb(${r.color})`,
                  opacity: isActive ? 1 : 0,
                  transition: "opacity .35s var(--ease-out-quad)",
                }}
              />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                <div
                  className="text-[10px] uppercase tracking-[0.16em] font-mono opacity-80"
                  style={{ color: `rgb(${r.color})` }}
                >
                  {r.who.split(" ")[0]}
                </div>
                <div className="font-display text-[18px] sm:text-[22px] font-bold tracking-tight2 leading-tight mt-1">
                  {r.label}
                </div>

                {/* Tagline + CTA reveal */}
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isActive ? "120px" : "0px",
                    opacity: isActive ? 1 : 0,
                    transition:
                      "max-height .45s var(--ease-out-quart), opacity .35s var(--ease-out-quad)",
                  }}
                >
                  <p className="text-[12px] sm:text-[13px] mt-2 leading-snug opacity-95 text-pretty">
                    {r.tagline}
                  </p>
                  <div
                    className="text-[11px] mt-2 inline-flex items-center gap-1.5 font-medium"
                    style={{ color: `rgb(${r.color})` }}
                  >
                    Eintreten <span aria-hidden>→</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Status line */}
      <div className="mt-5 h-5 text-center">
        <p
          className="text-[12px] text-soft transition-opacity duration-300"
          style={{ opacity: active ? 1 : 0.55 }}
        >
          {active
            ? ROLES.find((r) => r.id === active)?.who
            : "Hover oder Tab um eine Rolle zu sehen — Klick öffnet das Cockpit."}
        </p>
      </div>
    </div>
  );
}
