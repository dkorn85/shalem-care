"use client";

// Horizontale, dynamische Sub-Navigation für Cockpit-Familien.
// Erkennt per pathname automatisch, welche Gruppe (Therapie · Pflege · Arzt …)
// aktiv ist und blendet die passenden Reiter ein. Der aktive Reiter
// hebt sich farblich ab; auf Mobile horizontal scrollbar mit
// snap-points; mit Tastatur navigierbar (Pfeiltasten).
//
// Render am besten direkt unter dem AppShell-Header der jeweiligen Page.
// Ohne Treffer in der Registry rendert die Komponente nichts (null) —
// also harmlos auf Pages außerhalb der Cockpit-Familien.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  COCKPIT_SUB_NAV,
  gruppeFuerPath,
  istAktiv,
  type SubNavGruppe,
  type SubNavItem,
} from "@/lib/cockpit-sub-nav/registry";

export function CockpitSubNav({
  /** optional: Gruppe per Basis-Route hart vorgeben statt aus pathname zu raten */
  forceBasis,
  /** kompakter Modus ohne Eyebrow + Hint-Subzeile */
  kompakt = false,
}: {
  forceBasis?: string;
  kompakt?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const gruppe: SubNavGruppe | null = forceBasis
    ? COCKPIT_SUB_NAV.find((g) => g.basis === forceBasis) ?? null
    : gruppeFuerPath(pathname);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const aktivRef = useRef<HTMLAnchorElement | null>(null);

  // Aktiven Reiter beim Mount in den sichtbaren Bereich scrollen
  useEffect(() => {
    if (aktivRef.current && scrollerRef.current) {
      const a = aktivRef.current.getBoundingClientRect();
      const s = scrollerRef.current.getBoundingClientRect();
      if (a.left < s.left || a.right > s.right) {
        aktivRef.current.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      }
    }
  }, [pathname]);

  if (!gruppe) return null;

  return (
    <nav
      aria-label={gruppe.eyebrow + " · Unterbereiche"}
      className="surface rounded-xl mb-4 sticky top-2 z-20 backdrop-blur"
      style={{
        background: "rgb(var(--bg-elev) / 0.92)",
        borderTop: "1px solid rgb(var(--bg-mute))",
      }}
    >
      {!kompakt && (
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono px-3 pt-2 pb-1">
          {gruppe.eyebrow}
        </p>
      )}
      <div
        ref={scrollerRef}
        className="flex items-stretch gap-1 px-2 py-1.5 overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {gruppe.items.map((item) => (
          <SubNavReiter
            key={item.href}
            item={item}
            aktiv={istAktiv(item, pathname)}
            kompakt={kompakt}
            anchorRef={istAktiv(item, pathname) ? aktivRef : null}
          />
        ))}
      </div>
    </nav>
  );
}

function SubNavReiter({
  item,
  aktiv,
  kompakt,
  anchorRef,
}: {
  item: SubNavItem;
  aktiv: boolean;
  kompakt: boolean;
  anchorRef: React.RefObject<HTMLAnchorElement | null> | null;
}) {
  return (
    <Link
      ref={anchorRef ?? undefined}
      href={item.href}
      aria-current={aktiv ? "page" : undefined}
      className="snap-start group shrink-0 rounded-lg px-2.5 py-1.5 transition-all flex items-center gap-1.5"
      style={{
        background: aktiv ? `${item.vibe.replace("var(", "rgb(").replace(")", " / 0.20)")}` : "transparent",
        color:      aktiv ? `${item.vibe.replace("var(", "rgb(").replace(")", ")")}`        : "rgb(var(--fg-mute))",
        boxShadow:  aktiv ? `inset 0 -2px 0 0 ${item.vibe.replace("var(", "rgb(").replace(")", ")")}` : "none",
        fontWeight: aktiv ? 600 : 500,
      }}
    >
      {item.glyph && (
        <span aria-hidden className="text-[12px] leading-none" style={{ color: aktiv ? "currentColor" : `${item.vibe.replace("var(", "rgb(").replace(")", " / 0.7)")}` }}>
          {item.glyph}
        </span>
      )}
      <div className="flex flex-col items-start">
        <span className="text-[12px] leading-tight whitespace-nowrap">{item.label}</span>
        {!kompakt && item.hint && (
          <span className="text-[9px] text-soft leading-tight whitespace-nowrap font-normal">
            {item.hint}
          </span>
        )}
      </div>
    </Link>
  );
}
