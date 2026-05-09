"use client";

// Such-Filter für die globale Cockpits-Karte.
// Filtert Familien + Sub-Reiter live nach Eingabe (case-insensitive,
// matcht in Eyebrow, Sub-Label, Hint). Versteckt Familien ohne Treffer.

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AngereicherteGruppe } from "@/lib/cockpits/karte";
import type { SubNavItem } from "@/lib/cockpit-sub-nav/registry";

export function CockpitsSearch({ gruppen }: { gruppen: AngereicherteGruppe[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const gefiltert = useMemo(() => {
    if (!q) return gruppen.map((g) => ({ gruppe: g, items: g.items }));
    return gruppen
      .map((g) => {
        const headerMatch =
          g.eyebrow.toLowerCase().includes(q) || g.basis.toLowerCase().includes(q);
        const items = g.items.filter(
          (i) =>
            headerMatch ||
            i.label.toLowerCase().includes(q) ||
            (i.hint?.toLowerCase().includes(q) ?? false) ||
            i.href.toLowerCase().includes(q),
        );
        return { gruppe: g, items };
      })
      .filter((x) => x.items.length > 0);
  }, [q, gruppen]);

  const trefferGruppen = gefiltert.length;
  const trefferReiter = gefiltert.reduce((s, x) => s + x.items.length, 0);

  return (
    <>
      <div className="surface rounded-2xl p-4 mb-5 sticky top-2 z-20 backdrop-blur" style={{ background: "rgb(var(--bg-elev) / 0.92)" }}>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-mono">Suchen</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="z.B. BtM, Wechselwirkung, Sterbe-Wache, Naturheil, Hilfeplan …"
            className="block w-full mt-1 px-3 py-2 rounded-lg text-[14px] bg-transparent"
            style={{ boxShadow: "inset 0 0 0 1px rgb(var(--bg-mute))" }}
          />
        </label>
        <p className="text-[11px] text-soft mt-2 font-mono">
          {q
            ? `${trefferGruppen} Familie${trefferGruppen === 1 ? "" : "n"} · ${trefferReiter} Reiter`
            : `${gruppen.length} Cockpit-Familien · ${gruppen.reduce((s, g) => s + g.items.length, 0)} Reiter insgesamt`}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {gefiltert.map(({ gruppe, items }) => (
          <FamilieKarte key={gruppe.basis} gruppe={gruppe} sichtbareItems={items} highlight={q} />
        ))}
      </div>

      {gefiltert.length === 0 && (
        <div className="surface rounded-2xl p-6 text-center text-mute text-[13px]">
          Keine Cockpits zu „{query}" gefunden. Versuche es mit kürzeren Begriffen.
        </div>
      )}
    </>
  );
}

function FamilieKarte({
  gruppe,
  sichtbareItems,
  highlight,
}: {
  gruppe: AngereicherteGruppe;
  sichtbareItems: SubNavItem[];
  highlight: string;
}) {
  return (
    <article
      className="surface rounded-2xl p-4 flex flex-col"
      style={{ borderLeft: `3px solid rgb(${gruppe.akzent.replace("var(", "").replace(")", "")})`, minHeight: "fit-content" }}
    >
      <header className="mb-3">
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${gruppe.akzent.replace("var(", "").replace(")", "")})` }}>
          {gruppe.eyebrow}
        </p>
        <Link
          href={gruppe.basis}
          className="font-display text-[16px] font-bold tracking-tight2 mt-0.5 inline-block hover:underline"
        >
          {hervor(gruppe.basis, highlight)}
        </Link>
        {gruppe.expertiseStufen && (
          <p className="text-[10px] text-soft mt-0.5 font-mono">
            ◯ {gruppe.expertiseStufen.lerne} · ◐ {gruppe.expertiseStufen.praxis} · ● {gruppe.expertiseStufen.profi}
          </p>
        )}
      </header>

      <ul className="space-y-1 flex-1">
        {sichtbareItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="surface-mute rounded-lg p-2 flex items-baseline gap-2 hover:translate-x-0.5 transition-transform"
            >
              {item.glyph && (
                <span aria-hidden className="text-[12px] leading-none shrink-0" style={{ color: `rgb(${gruppe.akzent.replace("var(", "").replace(")", "")} / 0.7)` }}>
                  {item.glyph}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium leading-tight">{hervor(item.label, highlight)}</p>
                {item.hint && (
                  <p className="text-[10px] text-soft leading-tight font-mono mt-0.5">{hervor(item.hint, highlight)}</p>
                )}
              </div>
              <span aria-hidden className="text-soft text-[12px] shrink-0">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

function hervor(text: string, q: string) {
  if (!q) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "rgb(var(--accent) / 0.25)", color: "rgb(var(--fg))", padding: "0 1px", borderRadius: "2px" }}>
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}
