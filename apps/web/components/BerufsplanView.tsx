// Berufsplan-View · gemeinsame UI für alle profession-spezifischen
// Dienstpläne. Zeigt 14 Tage als Tageskarten mit Termin-Liste pro Tag,
// plus eine kompakte Wochen-Heat-Strip oben für schnellen Überblick.

import Link from "next/link";
import {
  type BerufsplanItem,
  groupByDay,
  STATUS_FARBE,
  BERUF_LABEL,
} from "@/lib/berufsplan/generator";

const WEEKDAYS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function formatDate(iso: string): { wd: string; tag: string; istHeute: boolean; istMorgen: boolean } {
  const d = new Date(iso);
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const morgen = new Date(heute);
  morgen.setDate(morgen.getDate() + 1);
  const istHeute = d.getTime() === heute.getTime();
  const istMorgen = d.getTime() === morgen.getTime();
  const wd = WEEKDAYS_SHORT[d.getDay()];
  const tag = `${d.getDate()}.${d.getMonth() + 1}.`;
  return { wd, tag, istHeute, istMorgen };
}

export function BerufsplanView({
  items,
  leitfarbe,
  perspektive = "beruf",
}: {
  items: BerufsplanItem[];
  leitfarbe: string;
  /** "beruf" zeigt klient-Spalte, "klient" zeigt beruf-Spalte */
  perspektive?: "beruf" | "klient";
}) {
  const grouped = groupByDay(items);
  const heuteISO = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const heuteCount = items.filter((i) => i.datumISO === heuteISO).length;
  const wocheCount = items.filter((i) => {
    const d = new Date(i.datumISO);
    const h = new Date(heuteISO);
    const diff = (d.getTime() - h.getTime()) / 86400000;
    return diff >= 0 && diff < 7;
  }).length;

  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: `rgb(${leitfarbe} / 0.05)`, boxShadow: `inset 0 0 0 1px rgb(${leitfarbe} / 0.2)` }}
      >
        <p className="text-[13px]" style={{ color: `rgb(${leitfarbe})` }}>
          Kein Caseload aktiv — sobald Klient:innen zugeordnet sind, erscheinen hier die Termine.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPI-Bar */}
      <div className="grid grid-cols-3 gap-2.5">
        <div
          className="rounded-xl p-3"
          style={{ background: `rgb(${leitfarbe} / 0.08)`, boxShadow: `inset 0 0 0 1px rgb(${leitfarbe} / 0.25)` }}
        >
          <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `rgb(${leitfarbe})` }}>Heute</p>
          <p className="text-[22px] font-display font-semibold mt-0.5" style={{ color: `rgb(${leitfarbe})` }}>{heuteCount}</p>
          <p className="text-[10px] text-soft">{heuteCount === 1 ? "Termin" : "Termine"}</p>
        </div>
        <div className="surface-mute rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Diese Woche</p>
          <p className="text-[22px] font-display font-semibold mt-0.5">{wocheCount}</p>
          <p className="text-[10px] text-soft">7 Tage</p>
        </div>
        <div className="surface-mute rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Gesamt · 14 Tage</p>
          <p className="text-[22px] font-display font-semibold mt-0.5">{items.length}</p>
          <p className="text-[10px] text-soft">Termine geplant</p>
        </div>
      </div>

      {/* Heat-Strip */}
      <div className="surface rounded-xl p-3 overflow-x-auto">
        <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-2">Auslastung · 14 Tage</p>
        <div className="flex items-end gap-1 min-h-[44px]">
          {grouped.map(({ datumISO, items: dayItems }) => {
            const { wd, tag, istHeute } = formatDate(datumISO);
            const max = Math.max(...grouped.map((g) => g.items.length));
            const h = max > 0 ? Math.max(8, (dayItems.length / max) * 36) : 8;
            return (
              <div key={datumISO} className="flex flex-col items-center gap-1 flex-1 min-w-[28px]">
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: h,
                    background: istHeute ? `rgb(${leitfarbe})` : `rgb(${leitfarbe} / 0.35)`,
                  }}
                  title={`${wd} ${tag} · ${dayItems.length} Termine`}
                />
                <span className="text-[9px] font-mono text-soft">{wd}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tages-Karten */}
      <div className="space-y-3">
        {grouped.map(({ datumISO, items: dayItems }) => {
          const { wd, tag, istHeute, istMorgen } = formatDate(datumISO);
          const heuteAccent = istHeute;
          return (
            <section
              key={datumISO}
              className="surface rounded-xl overflow-hidden"
              style={heuteAccent ? { boxShadow: `inset 0 0 0 1px rgb(${leitfarbe} / 0.4)` } : undefined}
            >
              <header
                className="px-4 py-2 flex items-baseline justify-between gap-2 flex-wrap"
                style={{
                  background: heuteAccent ? `rgb(${leitfarbe} / 0.08)` : "rgb(var(--bg-mute) / 0.4)",
                  borderBottom: "1px solid rgb(var(--border-soft))",
                }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-[14px] font-medium" style={heuteAccent ? { color: `rgb(${leitfarbe})` } : undefined}>
                    {istHeute ? "Heute" : istMorgen ? "Morgen" : wd} · {tag}
                  </span>
                  {istHeute && (
                    <span
                      className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
                      style={{ background: `rgb(${leitfarbe})`, color: "white" }}
                    >
                      live
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-soft">{dayItems.length} Termin{dayItems.length === 1 ? "" : "e"}</span>
              </header>
              <ul className="divide-y divide-[rgb(var(--border-soft))]">
                {dayItems.map((item) => {
                  const itemFarbe = item.farbe.startsWith("rgb") ? item.farbe : `rgb(${item.farbe})`;
                  const statusF = STATUS_FARBE[item.status];
                  return (
                    <li key={item.id} className="px-4 py-2.5 flex items-baseline gap-3 hover:bg-[rgb(var(--bg-mute))] transition-colors">
                      <span
                        className="text-[12px] font-mono tabular-nums w-[88px] shrink-0"
                        style={{ color: itemFarbe }}
                      >
                        {item.startZeit}–{item.endZeit}
                      </span>
                      <span aria-hidden className="w-1 h-7 rounded-full shrink-0" style={{ background: itemFarbe }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[13px] font-medium truncate">
                            {perspektive === "klient" ? BERUF_LABEL[item.beruf] : item.klientName ?? "—"}
                          </span>
                          <span className="text-[11px] text-soft">{item.aktivitaet}</span>
                        </div>
                        {(item.ort || item.notiz) && (
                          <p className="text-[10px] text-soft mt-0.5">
                            {item.ort}
                            {item.notiz && ` · ${item.notiz}`}
                          </p>
                        )}
                      </div>
                      <span
                        className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono shrink-0"
                        style={{
                          background: `rgb(${statusF} / 0.15)`,
                          color: `rgb(${statusF})`,
                        }}
                      >
                        {item.status}
                      </span>
                      {item.klientId && perspektive !== "klient" && (
                        <Link
                          href={`/klient`}
                          className="text-[10px] text-soft hover:text-[rgb(var(--fg))] shrink-0 hidden sm:inline"
                        >
                          Akte ›
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
