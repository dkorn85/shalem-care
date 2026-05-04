// Stufenweise Wiedereingliederung — "Hamburger Modell" · § 74 SGB V

import type { WePlan } from "@/lib/wiedereingliederung/store";

export function WiedereingliederungCard({ plan }: { plan: WePlan | null }) {
  if (!plan) return null;
  const heute = new Date().toISOString().slice(0, 10);
  const tageBis = plan.beginn <= heute && plan.ende >= heute
    ? Math.floor((new Date(plan.ende).getTime() - new Date(heute).getTime()) / 86400000)
    : null;

  const statusFarbe =
    plan.status === "laufend"           ? "var(--fri)" :
    plan.status === "abgeschlossen"     ? "var(--thu)" :
    plan.status === "vorzeitig_beendet" ? "var(--mon)" :
                                          "var(--tue)";

  return (
    <section className="mt-6 surface rounded-2xl p-5 anim-slideUp" style={{ animationDelay: "0.1s" }}>
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">
            Stufenweise Wiedereingliederung · § 74 SGB V · „Hamburger Modell"
          </p>
          <h2 className="font-display text-[18px] font-bold tracking-tight2">
            Schrittweise zurück in den Dienst
          </h2>
        </div>
        <span className="chip text-[11px]" style={{ background: `rgb(${statusFarbe} / 0.15)`, color: `rgb(${statusFarbe})` }}>
          {plan.status.replace(/_/g, " ")}
        </span>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-[12px]">
        <Cell label="Beginn"   value={plan.beginn} mono />
        <Cell label="Ende"     value={plan.ende} mono />
        <Cell label="Arzt"     value={plan.arztName} />
        <Cell label="Zustimmungen" value={`AG ${plan.arbeitgeberZugestimmt ? "✓" : "—"} · KK ${plan.krankenkasseGenehmigt ? "✓" : "—"}`} />
      </div>

      {tageBis !== null && (
        <p className="text-[12px] text-mute mb-3">
          Noch {tageBis} Tage bis zur vollen Wiederaufnahme.
        </p>
      )}

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-[12px] min-w-[480px]">
          <thead>
            <tr className="text-soft text-[10px] uppercase tracking-wider">
              <th className="text-left font-medium px-1 py-1.5">Woche</th>
              <th className="text-left font-medium px-1 py-1.5">Std/Tag</th>
              <th className="text-left font-medium px-1 py-1.5">Std/Woche</th>
              <th className="text-left font-medium px-1 py-1.5">Beschränkungen</th>
            </tr>
          </thead>
          <tbody>
            {plan.stufen.map((s) => (
              <tr key={s.woche} className="border-t border-app-soft">
                <td className="px-1 py-2 font-medium">KW {s.woche}</td>
                <td className="px-1 py-2 font-mono">{s.stundenProTag}</td>
                <td className="px-1 py-2 font-mono">{s.stundenProWoche}</td>
                <td className="px-1 py-2 text-mute">
                  {s.taetigkeitsbeschraenkungen.length > 0
                    ? s.taetigkeitsbeschraenkungen.join(" · ")
                    : "voller Tätigkeitsumfang"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-soft mt-3 leading-relaxed">
        Während der Wiedereingliederung läuft Krankengeld weiter. Du kannst jederzeit
        abbrechen — der Plan ist eine Brücke, kein Vertrag. Der Arzt überprüft die
        Stufen wöchentlich.
      </p>
    </section>
  );
}

function Cell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-soft text-[10px] uppercase tracking-wider">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : "font-medium"}`}>{value}</div>
    </div>
  );
}
