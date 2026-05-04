"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday } from "date-fns";
import { de } from "date-fns/locale";
import type { DokuEntry } from "@/lib/doku/types";

type Modus = "tag" | "woche" | "monat";

export function DokuKalender({
  klienten,
  alleEintraege,
}: {
  klienten: { id: string; name: string; initials: string; pflegegrad: number; stationId?: string }[];
  alleEintraege: { entry: DokuEntry; klientId: string }[];
}) {
  const [modus, setModus] = useState<Modus>("woche");
  const [anker, setAnker] = useState<Date>(new Date());

  // Index: pro Tag pro Klient — Anzahl Einträge + Abweichungs-Flag
  type Cell = { count: number; abweichung: boolean; risiken: number; lastEntry?: DokuEntry };
  const grid = useMemo(() => {
    const map = new Map<string, Map<string, Cell>>(); // klientId → dayKey → Cell
    for (const { entry, klientId } of alleEintraege) {
      const dayKey = entry.createdAt.slice(0, 10);
      const inner = map.get(klientId) ?? new Map();
      const existing = inner.get(dayKey) ?? { count: 0, abweichung: false, risiken: 0 };
      existing.count += 1;
      existing.abweichung = existing.abweichung || entry.abweichungVomNormalverlauf;
      existing.risiken = Math.max(existing.risiken, entry.risiken.length);
      if (!existing.lastEntry || entry.createdAt > existing.lastEntry.createdAt) {
        existing.lastEntry = entry;
      }
      inner.set(dayKey, existing);
      map.set(klientId, inner);
    }
    return map;
  }, [alleEintraege]);

  const days = useMemo(() => {
    if (modus === "tag") return [anker];
    if (modus === "woche") {
      const start = startOfWeek(anker, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    // monat: 4 Wochen ab Wochenstart, einfach gehalten
    const start = startOfWeek(anker, { weekStartsOn: 1 });
    return Array.from({ length: 28 }, (_, i) => addDays(start, i));
  }, [modus, anker]);

  const move = (dir: -1 | 1) => {
    if (modus === "tag") setAnker((a) => addDays(a, dir));
    else if (modus === "woche") setAnker((a) => (dir === 1 ? addWeeks(a, 1) : subWeeks(a, 1)));
    else setAnker((a) => (dir === 1 ? addWeeks(a, 4) : subWeeks(a, 4)));
  };

  const headLabel =
    modus === "tag"
      ? format(anker, "EEEE, d. MMMM yyyy", { locale: de })
      : modus === "woche"
        ? `KW ${format(days[0], "I", { locale: de })} · ${format(days[0], "d.", { locale: de })}–${format(days[6], "d. MMM yyyy", { locale: de })}`
        : `${format(days[0], "d. MMM", { locale: de })} – ${format(days[days.length - 1], "d. MMM yyyy", { locale: de })}`;

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 anim-slideUp" style={{ animationDelay: "0.1s" }}>
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Dokumentations-Kalender</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-1">{headLabel}</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg surface-mute p-0.5 text-[11px]">
            {(["tag", "woche", "monat"] as Modus[]).map((m) => (
              <button
                key={m}
                onClick={() => setModus(m)}
                className={`px-2.5 py-1 rounded-md font-medium ${
                  modus === m ? "bg-[rgb(var(--bg-elev))] text-[rgb(var(--fg))]" : "text-mute hover:text-[rgb(var(--fg))]"
                }`}
              >
                {m === "tag" ? "Tag" : m === "woche" ? "Woche" : "4 Wochen"}
              </button>
            ))}
          </div>
          <button onClick={() => move(-1)} className="btn btn-ghost text-[12px]">‹</button>
          <button onClick={() => setAnker(new Date())} className="btn btn-ghost text-[12px]">heute</button>
          <button onClick={() => move(1)} className="btn btn-ghost text-[12px]">›</button>
        </div>
      </header>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full border-separate border-spacing-0 text-[12px]">
          <thead>
            <tr>
              <th className="text-left pb-2 px-2 sticky left-0 bg-[rgb(var(--bg-elev))] z-10 text-[11px] uppercase tracking-wide text-soft font-medium">
                Klient
              </th>
              {days.map((d) => (
                <th
                  key={d.toISOString()}
                  className="pb-2 px-1 text-center font-medium text-[11px]"
                  style={{
                    color: isToday(d) ? "rgb(var(--vibe-team))" : "rgb(var(--fg-mute))",
                  }}
                >
                  <div>{format(d, "EE", { locale: de })}</div>
                  <div className={isToday(d) ? "font-bold" : ""}>{format(d, "d.M", { locale: de })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {klienten.map((k) => {
              const inner = grid.get(k.id) ?? new Map<string, Cell>();
              const totalDays = days.filter((d) => inner.has(d.toISOString().slice(0, 10))).length;
              return (
                <tr key={k.id}>
                  <th
                    className="text-left py-1.5 px-2 sticky left-0 bg-[rgb(var(--bg-elev))] z-10 font-medium text-[12px] align-top"
                    scope="row"
                  >
                    <Link href={`/dienst/${k.id}`} className="hover:underline">{k.name}</Link>
                    <div className="text-soft text-[10px] font-mono">PG {k.pflegegrad} · {totalDays}/{days.length} Tage doku.</div>
                  </th>
                  {days.map((d) => {
                    const key = d.toISOString().slice(0, 10);
                    const cell = inner.get(key);
                    const intensity = cell ? Math.min(1, cell.count / 3) : 0;
                    return (
                      <td key={key} className="py-1 px-1 align-top">
                        <Link
                          href={`/dienst/${k.id}?date=${key}`}
                          className="block aspect-square rounded-md grid place-items-center text-[10px] font-medium border transition-colors"
                          style={{
                            background: cell
                              ? cell.abweichung
                                ? `rgb(var(--mon) / ${0.18 + 0.4 * intensity})`
                                : `rgb(var(--thu) / ${0.12 + 0.35 * intensity})`
                              : "transparent",
                            color: cell
                              ? cell.abweichung ? "rgb(var(--mon))" : "rgb(var(--thu))"
                              : "rgb(var(--fg-mute))",
                            borderColor: isToday(d) ? "rgb(var(--vibe-team) / 0.6)" : "rgb(var(--border-soft))",
                          }}
                          title={
                            cell
                              ? `${cell.count} Eintrag${cell.count === 1 ? "" : "ä"}${cell.abweichung ? " · ⚠ Abweichung" : ""}`
                              : "Keine Doku"
                          }
                        >
                          {cell?.count ?? ""}
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="mt-4 flex items-center gap-3 flex-wrap text-[11px] text-soft">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "rgb(var(--thu) / 0.4)" }} /> Doku-Eintrag
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "rgb(var(--mon) / 0.4)" }} /> Abweichung Normalverlauf
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border" style={{ borderColor: "rgb(var(--vibe-team))" }} /> Heute
        </span>
      </footer>
    </section>
  );
}
