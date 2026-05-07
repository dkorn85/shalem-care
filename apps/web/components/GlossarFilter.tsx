"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  GLOSSAR,
  KATEGORIE_LABEL,
  KATEGORIE_FARBE,
} from "@/lib/glossar/eintraege";
import type { GlossarKategorie } from "@/lib/glossar/eintraege";

const ALLE_KATEGORIEN = Object.keys(KATEGORIE_LABEL) as GlossarKategorie[];

export function GlossarFilter() {
  const [suche, setSuche] = useState("");
  const [aktiv, setAktiv] = useState<GlossarKategorie | "alle">("alle");

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    return GLOSSAR.filter((e) => {
      if (aktiv !== "alle" && e.kategorie !== aktiv) return false;
      if (!q) return true;
      return (
        e.kuerzel.toLowerCase().includes(q) ||
        e.langform.toLowerCase().includes(q) ||
        e.klartext.toLowerCase().includes(q)
      );
    }).sort((a, b) => a.kuerzel.localeCompare(b.kuerzel, "de"));
  }, [suche, aktiv]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { alle: GLOSSAR.length };
    for (const k of ALLE_KATEGORIEN) c[k] = GLOSSAR.filter((e) => e.kategorie === k).length;
    return c;
  }, []);

  return (
    <div>
      <div className="surface rounded-2xl p-4 sm:p-5 mb-5">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2 block">
            Suche
          </span>
          <input
            type="search"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="z.B. PG, ePA, BTHG, Vollmacht…"
            className="w-full rounded-xl px-4 py-3 text-[14px] bg-app-mute border-0 outline-none focus:ring-2 focus:ring-accent"
            style={{ background: "rgb(var(--bg-mute))" }}
          />
        </label>

        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mt-5 mb-2.5">
          Kategorie
        </p>
        <div className="flex flex-wrap gap-1.5">
          <FilterTag
            label={`Alle · ${counts.alle}`}
            farbe="var(--fg-mute)"
            aktiv={aktiv === "alle"}
            onClick={() => setAktiv("alle")}
          />
          {ALLE_KATEGORIEN.map((k) => (
            <FilterTag
              key={k}
              label={`${KATEGORIE_LABEL[k]} · ${counts[k]}`}
              farbe={KATEGORIE_FARBE[k]}
              aktiv={aktiv === k}
              onClick={() => setAktiv(k)}
            />
          ))}
        </div>
      </div>

      {gefiltert.length === 0 ? (
        <div className="surface rounded-2xl p-10 text-center">
          <p className="text-[15px] text-mute">
            Nichts gefunden. Probier einen anderen Begriff oder eine andere Kategorie.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2.5">
          {gefiltert.map((e) => (
            <li
              key={e.kuerzel}
              className="surface-hover rounded-2xl p-5 relative overflow-hidden"
            >
              <span
                aria-hidden
                className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                style={{ background: `rgb(${KATEGORIE_FARBE[e.kategorie]})` }}
              />
              <div className="ml-2.5">
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1.5">
                  <h3 className="font-display text-[18px] font-bold tracking-tight2">
                    {e.kuerzel}
                  </h3>
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: `rgb(${KATEGORIE_FARBE[e.kategorie]})` }}
                  >
                    {KATEGORIE_LABEL[e.kategorie]}
                  </span>
                </div>
                <p className="text-[12px] text-soft mb-2 italic">{e.langform}</p>
                <p className="text-[14px] text-mute leading-relaxed">{e.klartext}</p>
                {e.link && (
                  <Link
                    href={e.link.href}
                    className="inline-block text-[12px] font-medium mt-3 hover:underline"
                    style={{ color: `rgb(${KATEGORIE_FARBE[e.kategorie]})` }}
                  >
                    {e.link.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterTag({
  label,
  farbe,
  aktiv,
  onClick,
}: {
  label: string;
  farbe: string;
  aktiv: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition"
      style={{
        background: aktiv ? `rgb(${farbe} / 0.15)` : "rgb(var(--bg-mute))",
        color: aktiv ? `rgb(${farbe})` : "rgb(var(--fg-mute))",
        border: aktiv ? `1.5px solid rgb(${farbe})` : "1.5px solid transparent",
      }}
      aria-pressed={aktiv}
    >
      {label}
    </button>
  );
}
