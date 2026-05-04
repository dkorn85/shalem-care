// BEM-Card: zeigt den aktiven BEM-Fall des Mitarbeiters oder
// die offene Einladung. Server-Component-tauglich.

import type { BemFall } from "@/lib/bem/store";
import { BEM_STATUS_LABEL, MASSNAHMEN_LABEL } from "@/lib/bem/store";

export function BemCard({ fall }: { fall: BemFall | null }) {
  if (!fall) return null;
  return (
    <section className="mt-6 surface rounded-2xl p-5 anim-slideUp" style={{ animationDelay: "0.05s" }}>
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">
            BEM · § 167 Abs. 2 SGB IX
          </p>
          <h2 className="font-display text-[18px] font-bold tracking-tight2">
            Betriebliches Eingliederungsmanagement
          </h2>
        </div>
        <span className="chip text-[11px]" style={{ background: "rgb(var(--vibe-approval) / 0.15)", color: "rgb(var(--vibe-approval))" }}>
          {BEM_STATUS_LABEL[fall.status]}
        </span>
      </header>

      <p className="text-[13px] text-mute leading-relaxed mb-4">
        Auslöser: {fall.ausloeser.kumulierteAuTage12Mo} AU-Tage in den letzten 12 Monaten
        (Anker {fall.ausloeser.ankerDatum}). Teilnahme ist <strong>freiwillig</strong> und
        ohne Nachteil — Ablehnung schließt die Akte ohne Folgen.
      </p>

      {fall.beteiligte.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">Beteiligte (mit deiner Zustimmung)</p>
          <ul className="flex flex-wrap gap-1.5">
            {fall.beteiligte.map((b, i) => (
              <li
                key={i}
                className="chip text-[11px]"
                style={{
                  background: b.zustimmungMA ? "rgb(var(--thu) / 0.15)" : "rgb(var(--bg-mute))",
                  color: b.zustimmungMA ? "rgb(var(--thu))" : "rgb(var(--fg-mute))",
                }}
              >
                {b.rolle.replace(/_/g, " ")} {b.name ? `· ${b.name}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fall.massnahmen.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-2">Maßnahmen</p>
          <ul className="space-y-2">
            {fall.massnahmen.map((m) => (
              <li key={m.id} className="rounded-lg p-3 surface-mute relative overflow-hidden text-[12px]">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium">{MASSNAHMEN_LABEL[m.kategorie]}</span>
                  <span className="font-mono text-soft text-[10px]">
                    {m.ab}{m.bis ? ` → ${m.bis}` : ""}
                  </span>
                  <span
                    className="chip text-[10px]"
                    style={{
                      background:
                        m.status === "abgeschlossen" ? "rgb(var(--thu) / 0.15)" :
                        m.status === "laufend"      ? "rgb(var(--vibe-team) / 0.15)" :
                                                      "rgb(var(--bg-mute))",
                    }}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="text-mute mt-1">{m.beschreibung}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fall.massnahmen.length === 0 && fall.status === "berechtigt" && (
        <p className="text-[12px] italic text-soft mt-3">
          Einladung wird vom Arbeitgeber innerhalb der nächsten Wochen versendet. Du kannst
          jederzeit eine Vertrauensperson, den Betriebsrat oder die Schwerbehindertenvertretung
          benennen.
        </p>
      )}
    </section>
  );
}
