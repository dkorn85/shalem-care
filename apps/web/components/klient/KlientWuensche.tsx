// Profi-Spiegel der Klient-Wünsche aus /klient/woche.
//
// Server-Component. Holt für eine:n Klient:in alle Default-Wünsche
// (aus woche.ts) plus die selbst-eingetragenen Override-Wünsche
// (aus wunsch-store) und zeigt sie als kompakte Liste.
//
// Einsatz: in jeder Profi-Page wo eine Klient:in im Fokus steht
// (Pflege-Tour, Apotheke-Heimversorgung, Therapie-Patient:innen,
// Begleitung-Sitzung). Macht Wünsche „auf Augenhöhe" sichtbar.

import Link from "next/link";
import { wocheFuerKlient, WOCHE_BERUF_LABEL, WOCHE_BERUF_FARBE, WOCHE_BERUF_GLYPH } from "@/lib/klient/woche";
import { alleWuenscheFuerKlient } from "@/lib/klient/wunsch-store";

type AggregierterWunsch = {
  terminId:    string;
  text:        string;
  beruf:       string;
  glyph:       string;
  farbe:       string;
  quelle:      "default" | "selbst" | "betreuer" | "angehoerige";
  geaendertAm?: string;
  datum:       string;
  uhrzeit:     string;
};

export function KlientWuensche({
  klientId,
  klientName,
  kompakt = false,
}: {
  klientId:    string;
  klientName?: string;
  kompakt?:    boolean;
}) {
  const termine = wocheFuerKlient(klientId);
  const overrides = alleWuenscheFuerKlient(klientId);
  const overrideMap = new Map(overrides.map((o) => [o.terminId, o]));

  const wuensche: AggregierterWunsch[] = [];
  for (const t of termine) {
    const override = overrideMap.get(t.id);
    const text = override?.wunsch ?? t.meinWunsch;
    if (!text) continue;
    const eintrag: AggregierterWunsch = {
      terminId:    t.id,
      text,
      beruf:       WOCHE_BERUF_LABEL[t.beruf],
      glyph:       WOCHE_BERUF_GLYPH[t.beruf],
      farbe:       WOCHE_BERUF_FARBE[t.beruf],
      quelle:      override ? override.geaendertVon : "default",
      datum:       t.datum,
      uhrzeit:     t.uhrzeit,
    };
    if (override?.geaendertAm) eintrag.geaendertAm = override.geaendertAm;
    wuensche.push(eintrag);
  }

  if (wuensche.length === 0) return null;

  const eigene = wuensche.filter((w) => w.quelle !== "default").length;

  return (
    <section
      className="surface rounded-2xl p-4 mb-5"
      style={{ borderLeft: "3px solid rgb(var(--wed))" }}
    >
      <header className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono font-medium" style={{ color: "rgb(var(--wed))" }}>
          Wünsche{klientName ? ` von ${klientName}` : ""} · DSGVO Art. 4
        </p>
        <Link
          href="/klient/woche"
          className="text-[10px] text-mute hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline"
        >
          → eigene Sicht der Klient:in
        </Link>
      </header>

      <p className="text-[12px] text-mute mb-3">
        {wuensche.length} dokumentierte{wuensche.length === 1 ? "r" : ""} Wunsch
        {wuensche.length === 1 ? "" : "e"} für die nächsten Tage{eigene > 0 ? ` · davon ${eigene} selbst eingetragen` : ""}.
        Bitte respektieren — sie haben Vorrang vor Routine.
      </p>

      <ul className="space-y-1.5">
        {wuensche.map((w, i) => {
          const farbe = w.farbe.replace("var(", "").replace(")", "");
          return (
            <li
              key={w.terminId + i}
              className="surface-mute rounded-lg p-2 flex items-baseline gap-2 flex-wrap"
              style={{ borderLeft: `2px solid rgb(${farbe})` }}
            >
              <span aria-hidden style={{ color: `rgb(${farbe})` }}>{w.glyph}</span>
              {!kompakt && (
                <span className="font-mono text-[10px] text-soft shrink-0">
                  {w.datum.slice(5)} · {w.uhrzeit}
                </span>
              )}
              <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: `rgb(${farbe})` }}>
                {w.beruf}
              </span>
              <p className="text-[12px] italic flex-1 basis-full sm:basis-auto sm:ml-1">„{w.text}"</p>
              {w.quelle !== "default" && (
                <span
                  className="chip text-[9px] ml-auto"
                  style={{ background: "rgb(var(--wed) / 0.18)", color: "rgb(var(--wed))" }}
                >
                  von {w.quelle}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
