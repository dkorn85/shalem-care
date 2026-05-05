import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { hourlyRateFor, monthlyHourTargetFor } from "@/lib/tariff";
import { caseloadFor } from "@/lib/zuordnung/store";

const ROW_COLORS = ["var(--mon)", "var(--tue)", "var(--thu)", "var(--fri)", "var(--sat)", "var(--sun)"];

export default async function TeamPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const people = (await store.listPeople()).filter((p) => p.role === "nurse");

  const team = await Promise.all(
    people.map(async (p) => {
      const slots = await store.listSlotsForPerson(p.id);
      const totalHours = slots.reduce((sum, s) => {
        const start = new Date(s.start!);
        const end = new Date(s.end!);
        return sum + (end.getTime() - start.getTime()) / 3600_000;
      }, 0);
      const wochenstunden = Math.round(totalHours);
      const stundensatz = hourlyRateFor(p.tariffGrade);
      const monatsstundenSoll = monthlyHourTargetFor(p.tariffGrade);
      // Demo-Hochrechnung: Wochenstunden × 4.3 = Monatsstunden, aber gedeckelt am Soll
      const monatsstunden = Math.min(monatsstundenSoll, Math.round(wochenstunden * 4.3));
      const monatsbrutto = Math.round(monatsstunden * stundensatz);
      const caseload = caseloadFor(p.id);
      const arbzgOk = totalHours <= 48;
      return { person: p, slots: slots.length, hours: wochenstunden, monatsstunden, monatsbrutto, stundensatz, caseload, arbzgOk };
    })
  );

  const summe = {
    hours: team.reduce((s, r) => s + r.hours, 0),
    monatsstunden: team.reduce((s, r) => s + r.monatsstunden, 0),
    monatsbrutto: team.reduce((s, r) => s + r.monatsbrutto, 0),
    klienten: team.reduce((s, r) => s + (r.caseload?.klientIds.length ?? 0), 0),
  };

  return (
    <AppShell
      role="lead"
      user={{ id: lead.id, name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Team-Übersicht</h1>
        <p className="text-[13px] text-mute mt-1">
          {team.length} Pflegekräfte · {summe.hours} h diese Woche · {summe.monatsstunden} h/Monat-Hochrechnung · {summe.klienten} Klient:innen-Caseload-Slots · {summe.monatsbrutto.toLocaleString("de-DE")} € Monatsbrutto-Summe (TVöD-P).
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Mini label="Pflegekräfte"      value={team.length.toString()}                                            color="var(--vibe-team)" />
        <Mini label="Wochenstunden"     value={`${summe.hours} h`}                                                color="var(--mon)" />
        <Mini label="Caseload-Summe"    value={summe.klienten.toString()} hint={`Ø ${(summe.klienten / team.length).toFixed(1)}/Person`} color="var(--wed)" />
        <Mini label="Monatsbrutto"       value={`${summe.monatsbrutto.toLocaleString("de-DE")} €`}                color="var(--vibe-stats)" />
      </section>

      <section className="surface rounded-2xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-14 gap-3 px-5 py-3 border-b border-app-soft text-[11px] uppercase text-soft tracking-wide font-medium" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          <div className="col-span-4">Name</div>
          <div className="col-span-1">Tarif</div>
          <div className="col-span-1 text-right">€/h</div>
          <div className="col-span-2 text-right">Std/Wo</div>
          <div className="col-span-2 text-right">Std/Mo</div>
          <div className="col-span-2 text-right">Brutto/Mo</div>
          <div className="col-span-1 text-right">Caseload</div>
          <div className="col-span-1 text-right">ArbZG</div>
        </div>
        <ul className="divide-y divide-[rgb(var(--border-soft))]">
          {team.map((row, idx) => {
            const color = ROW_COLORS[idx % ROW_COLORS.length];
            const caseloadCount = row.caseload?.klientIds.length ?? 0;
            return (
              <li
                key={row.person.id}
                className="relative grid grid-cols-2 sm:grid-cols-14 gap-3 px-5 py-3.5 anim-float items-center"
                style={{ animationDelay: `${idx * 0.04}s`, gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
              >
                <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${color})` }} />
                <div className="col-span-2 sm:col-span-4 flex items-center gap-3">
                  <Link
                    href={`/admin/team/${row.person.id}`}
                    className="w-8 h-8 rounded-full grid place-items-center text-[11px] font-semibold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, rgb(${color}), rgb(var(--accent)))` }}
                  >
                    {row.person.initials}
                  </Link>
                  <div>
                    <Link href={`/admin/team/${row.person.id}`} className="text-[14px] font-medium hover:underline">
                      {row.person.name}
                    </Link>
                    <div className="text-[11px] text-soft">{row.person.qualifications.join(" · ")}</div>
                    {row.caseload && <div className="text-[10px] text-mute mt-0.5 italic">{row.caseload.rolle}</div>}
                  </div>
                </div>
                <div className="text-[12px] text-mute font-mono sm:col-span-1">{row.person.tariffGrade.replace("TVOED-P_", "")}</div>
                <div className="text-[12px] sm:col-span-1 sm:text-right font-mono">{row.stundensatz.toFixed(2)}</div>
                <div className="text-[13px] sm:col-span-2 sm:text-right font-mono">{row.hours}</div>
                <div className="text-[12px] sm:col-span-2 sm:text-right font-mono text-mute">{row.monatsstunden}</div>
                <div className="text-[13px] sm:col-span-2 sm:text-right font-mono font-semibold">{row.monatsbrutto.toLocaleString("de-DE")} €</div>
                <div className="text-[12px] sm:col-span-1 sm:text-right font-mono">
                  {caseloadCount > 0 ? (
                    <span className="chip text-[10px]" style={{ background: "rgb(var(--wed) / 0.15)", color: "rgb(var(--wed))" }}>{caseloadCount}</span>
                  ) : (
                    <span className="text-soft">—</span>
                  )}
                </div>
                <div className="sm:col-span-1 sm:text-right">
                  {row.arbzgOk ? (
                    <span className="chip" style={{ background: "rgb(var(--thu) / 0.15)", color: "rgb(var(--thu))" }}>OK</span>
                  ) : (
                    <span className="chip" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>!</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-[11px] text-soft mt-4 max-w-prose leading-relaxed">
        Stundensätze nach TVöD-P 2026 (P7 22,50 € · P8 24,10 € · P9 26,30 € · P10 28,70 €). Monatsbrutto =
        Wochenstunden × 4.3 × €/h, gedeckelt am Soll von 165 h/Monat. Schichtzulagen (Nacht 25 % · Sonntag 25 % ·
        Feiertag 35 %) hier nicht eingerechnet — siehe /admin/zahlungen. Caseload aus dem CareTeam-Mapping
        (lib/zuordnung).
      </p>
    </AppShell>
  );
}

function Mini({ label, value, hint, color }: { label: string; value: string; hint?: string; color: string }) {
  return (
    <div className="surface rounded-xl p-3 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${color})` }} />
      <div className="ml-2.5">
        <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
        <div className="font-display font-bold text-[18px] mt-0.5 leading-none" style={{ color: `rgb(${color})` }}>{value}</div>
        {hint && <div className="text-[10px] text-soft mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}
