// MultiBerufTimeline · zeigt zeitgleich alle Berufe für einen Klienten
// auf einer horizontalen Stunden-Achse (heute) — wer ist wann da, wer
// kommt als nächstes, wer ist gerade aktiv. Live-Marker für "jetzt".

import {
  generateKlientPlan,
  BERUF_LABEL,
  type BerufsplanItem,
} from "@/lib/berufsplan/generator";

const STUNDE_VON = 6;
const STUNDE_BIS = 22;
const STUNDEN = STUNDE_BIS - STUNDE_VON;

type Beruf = BerufsplanItem["beruf"];

const BERUF_FARBE: Record<Beruf, string> = {
  pflege: "var(--mon)",
  arzt: "var(--vibe-profile)",
  therapie: "var(--fri)",
  sozialarbeit: "var(--tue)",
  heilerziehung: "var(--sat)",
  ehrenamt: "var(--thu)",
  hauswirtschaft: "var(--sun)",
  lead: "var(--vibe-team)",
};

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function MultiBerufTimeline({ klientId }: { klientId: string }) {
  const items = generateKlientPlan(klientId, 1);
  const heute = todayISO();
  const heutigeItems = items.filter((i) => i.datumISO === heute);

  // Gruppiere nach Beruf
  const proBeruf = new Map<Beruf, BerufsplanItem[]>();
  for (const item of heutigeItems) {
    const arr = proBeruf.get(item.beruf) ?? [];
    arr.push(item);
    proBeruf.set(item.beruf, arr);
  }

  const berufe = Array.from(proBeruf.keys()).sort();
  const jetzt = new Date();
  const jetztMin = jetzt.getHours() * 60 + jetzt.getMinutes();
  const jetztProgress = (jetztMin - STUNDE_VON * 60) / (STUNDEN * 60);
  const istHeute = jetztMin >= STUNDE_VON * 60 && jetztMin <= STUNDE_BIS * 60;

  // Nächster Termin-Liste für KPI-Bar
  const naechster = heutigeItems
    .filter((i) => timeToMin(i.startZeit) > jetztMin)
    .sort((a, b) => timeToMin(a.startZeit) - timeToMin(b.startZeit))[0];
  const aktive = heutigeItems.filter((i) => i.status === "läuft");

  if (heutigeItems.length === 0) {
    return (
      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Heute · Multi-Berufe-Sicht</p>
        <p className="text-[13px] text-mute">Keine Termine heute. Schauen Sie morgen wieder rein.</p>
      </section>
    );
  }

  const stundenMarken: number[] = [];
  for (let h = STUNDE_VON; h <= STUNDE_BIS; h += 2) stundenMarken.push(h);

  return (
    <section className="surface rounded-2xl p-4 sm:p-5 overflow-hidden">
      <header className="flex items-baseline justify-between gap-2 flex-wrap mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Heute · Live-Sicht aller Berufe</p>
          <h2 className="font-display text-[18px] font-semibold mt-0.5">
            {heutigeItems.length} Termine über {berufe.length} Berufsgruppen
          </h2>
        </div>
        <div className="flex items-baseline gap-3 text-[11px]">
          {aktive.length > 0 && (
            <span className="px-2 py-0.5 rounded font-mono" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>
              {aktive.length} aktiv
            </span>
          )}
          {naechster && (
            <span className="text-soft">
              nächster · {naechster.startZeit} {BERUF_LABEL[naechster.beruf]}
            </span>
          )}
        </div>
      </header>

      {/* Stunden-Skala oben */}
      <div className="relative ml-[110px] mb-2 h-4 text-[10px] font-mono text-soft">
        {stundenMarken.map((h) => {
          const left = ((h - STUNDE_VON) / STUNDEN) * 100;
          return (
            <span key={h} className="absolute -translate-x-1/2" style={{ left: `${left}%` }}>
              {h}h
            </span>
          );
        })}
      </div>

      {/* Lanes pro Beruf */}
      <div className="space-y-1.5">
        {berufe.map((beruf) => {
          const farbe = BERUF_FARBE[beruf];
          const lanItems = proBeruf.get(beruf)!;
          return (
            <div key={beruf} className="flex items-center gap-3">
              <div className="w-[100px] shrink-0 flex items-baseline gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `rgb(${farbe})` }} />
                <span className="text-[11px] font-medium truncate" style={{ color: `rgb(${farbe})` }}>
                  {BERUF_LABEL[beruf]}
                </span>
              </div>
              <div className="relative flex-1 h-8 rounded surface-mute overflow-hidden">
                {/* Stunden-Gitter */}
                {stundenMarken.map((h) => {
                  const left = ((h - STUNDE_VON) / STUNDEN) * 100;
                  return (
                    <span
                      key={h}
                      aria-hidden
                      className="absolute top-0 bottom-0 w-px opacity-30"
                      style={{ left: `${left}%`, background: "rgb(var(--border-soft))" }}
                    />
                  );
                })}
                {/* Termin-Blocks */}
                {lanItems.map((item) => {
                  const startMin = timeToMin(item.startZeit) - STUNDE_VON * 60;
                  const endMin = timeToMin(item.endZeit) - STUNDE_VON * 60;
                  const left = (startMin / (STUNDEN * 60)) * 100;
                  const width = ((endMin - startMin) / (STUNDEN * 60)) * 100;
                  if (left < 0 || left > 100) return null;
                  const erledigt = item.status === "erledigt";
                  const laeuft = item.status === "läuft";
                  return (
                    <div
                      key={item.id}
                      className="absolute top-1 bottom-1 rounded px-1.5 flex items-center"
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 2)}%`,
                        minWidth: 18,
                        background: erledigt
                          ? `rgb(${farbe} / 0.25)`
                          : laeuft
                            ? `rgb(${farbe})`
                            : `rgb(${farbe} / 0.6)`,
                        color: laeuft ? "white" : `rgb(${farbe})`,
                        boxShadow: laeuft ? `0 0 0 2px rgb(${farbe} / 0.3)` : undefined,
                      }}
                      title={`${item.startZeit}–${item.endZeit} · ${item.aktivitaet}`}
                    >
                      <span className="text-[9px] font-mono truncate">
                        {item.aktivitaet}
                      </span>
                    </div>
                  );
                })}
                {/* Jetzt-Marker */}
                {istHeute && (
                  <span
                    aria-hidden
                    className="absolute top-0 bottom-0 w-[2px] z-10"
                    style={{
                      left: `${jetztProgress * 100}%`,
                      background: "rgb(var(--mon))",
                      boxShadow: "0 0 4px rgb(var(--mon) / 0.5)",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Jetzt-Linie Label */}
      {istHeute && (
        <p className="text-[10px] font-mono text-mute mt-3 ml-[110px]">
          ↑ rote Linie = jetzt · {jetzt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </section>
  );
}
