import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { BurnoutWarning } from "@/components/BurnoutWarning";
import { PersonAvatar } from "@/components/Avatar";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { hourlyRateFor } from "@/lib/tariff";
import { assessBurnoutRisk } from "@/lib/burnout/risk";
import { getShiftType } from "@/lib/fhir";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export const metadata = { title: "Mitarbeiter:in · Drilldown" };

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  seedOnce();
  const { id } = await params;

  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const person = await store.getPerson(id);
  if (!person) notFound();

  const allSlots = await store.listSlots();
  const slots = allSlots.filter((s) => (s as { participants?: string[] }).participants?.includes?.(id) || false);
  const personSlots = await store.listSlotsForPerson(id);
  const assessment = assessBurnoutRisk(id, personSlots, new Date(), hourlyRateFor(person.tariffGrade));

  // Schicht-Historie 28 Tage rückwirkend + 14 Tage voraus
  const ref = new Date();
  const fensterVon = new Date(ref); fensterVon.setDate(fensterVon.getDate() - 28);
  const fensterBis = new Date(ref); fensterBis.setDate(fensterBis.getDate() + 14);
  const schichten = personSlots
    .filter((s) => {
      const t = new Date(s.start!).getTime();
      return t >= fensterVon.getTime() && t <= fensterBis.getTime();
    })
    .sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));

  // Tag-Map für Visualisierung
  const tagMap = new Map<string, { typ: "early" | "late" | "night" | "off"; stunden: number }>();
  for (let i = 0; i < 42; i++) {
    const d = new Date(fensterVon); d.setDate(d.getDate() + i);
    tagMap.set(d.toISOString().slice(0, 10), { typ: "off", stunden: 0 });
  }
  for (const s of schichten) {
    const day = (s.start ?? "").slice(0, 10);
    const std = Math.max(0, (new Date(s.end!).getTime() - new Date(s.start!).getTime()) / 3_600_000);
    const t = getShiftType(s);
    tagMap.set(day, { typ: t === "night" ? "night" : t === "early" ? "early" : "late", stunden: std });
  }

  void slots;

  return (
    <AppShell
      role="lead"
      user={{ id: lead.id, name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Übersicht
        </Link>
        <div className="flex items-start gap-4">
          <PersonAvatar id={person.id} initials={person.initials} size={84} role="nurse" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Mitarbeiter:in</p>
            <h1 className="font-display text-[28px] font-bold tracking-tight2">{person.name}</h1>
            <p className="text-[12px] text-mute mt-1">
              {person.tariffGrade.replace("TVOED-P_", "P-Stufe ")} · {assessment.metrics.schichten28d} Schichten in 28 d
            </p>
          </div>
        </div>
      </header>

      {/* Burnout-Card im Vollformat */}
      <section className="mb-6">
        <BurnoutWarning assessment={assessment} />
      </section>

      {/* Trigger-Liste detailliert */}
      {assessment.trigger.length > 0 && (
        <section className="mb-6 surface rounded-2xl p-5">
          <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Was wir messen</h2>
          <ul className="space-y-2">
            {assessment.trigger.map((t) => (
              <li key={t.code} className="rounded-lg p-3 surface-mute relative overflow-hidden">
                <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                      style={{ background: t.schwere === 3 ? "rgb(var(--mon))" : t.schwere === 2 ? "rgb(var(--fri))" : "rgb(var(--vibe-profile))" }} />
                <div className="ml-2.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium text-[13px]">{t.kurz}</span>
                    <span className="font-mono text-soft text-[10px]">{t.code}</span>
                  </div>
                  <p className="text-[12px] text-mute mt-1 leading-relaxed">{t.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Schicht-Heatmap 6 Wochen */}
      <section className="mb-6 surface rounded-2xl p-5">
        <header className="mb-3">
          <h2 className="font-display text-[16px] font-semibold tracking-tight2">Schicht-Historie</h2>
          <p className="text-[11px] text-soft mt-0.5">{format(fensterVon, "d. MMM", { locale: de })} – {format(fensterBis, "d. MMM", { locale: de })} · 28 d zurück + 14 d voraus</p>
        </header>
        <div className="grid grid-cols-7 gap-1 text-[9px]">
          {Array.from(tagMap.entries()).map(([day, info]) => {
            const date = parseISO(day);
            const isFuture = date.getTime() > ref.getTime();
            const farbe =
              info.typ === "early"  ? "rgb(var(--mon) / 0.7)"
            : info.typ === "late"   ? "rgb(var(--tue) / 0.7)"
            : info.typ === "night"  ? "rgb(var(--sat) / 0.7)"
            : "rgb(var(--bg-mute))";
            return (
              <div
                key={day}
                className="aspect-square rounded-md grid place-items-center font-mono"
                style={{
                  background: farbe,
                  opacity: isFuture ? 0.5 : 1,
                  color: info.typ === "off" ? "rgb(var(--fg-soft))" : "white",
                }}
                title={`${day} · ${info.typ === "off" ? "frei" : `${info.typ} · ${info.stunden.toFixed(1)} h`}`}
              >
                <span className="text-[8px] leading-none">{format(date, "d")}</span>
                {info.typ !== "off" && <span className="text-[7px] leading-none mt-0.5">{info.typ.charAt(0).toUpperCase()}</span>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-soft flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ background: "rgb(var(--mon) / 0.7)" }} /> Früh</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ background: "rgb(var(--tue) / 0.7)" }} /> Spät</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ background: "rgb(var(--sat) / 0.7)" }} /> Nacht</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ background: "rgb(var(--bg-mute))" }} /> frei</span>
          <span className="ml-auto">Future-Schichten halbtransparent</span>
        </div>
      </section>

      {/* Empfehlungen */}
      {assessment.empfehlungen.length > 0 && (
        <section className="mb-6 surface rounded-2xl p-5">
          <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Empfehlungen für die Stationsleitung</h2>
          <ul className="space-y-1.5 text-[13px]">
            {assessment.empfehlungen.map((e, i) => (
              <li key={i} className="flex gap-2 items-baseline">
                <span aria-hidden className="text-soft shrink-0">›</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
          {assessment.autoBonusBpsBeiNichtErsetzbarkeit > 0 && (
            <p className="text-[12px] mt-3 p-2.5 rounded-lg" style={{ background: "rgb(var(--vibe-stats) / 0.1)", color: "rgb(var(--vibe-stats))" }}>
              <strong>Auto-Bonus aktiv:</strong> Wenn keine Vertretung gefunden wird, schlägt das System
              automatisch +{(assessment.autoBonusBpsBeiNichtErsetzbarkeit / 100).toFixed(0)} % ({assessment.empfehlungBonusEur.toFixed(2)} €/h) auf, bis ein
              Tausch zustande kommt.
            </p>
          )}
        </section>
      )}

      {/* Schichten-Liste */}
      <section className="surface rounded-2xl p-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Letzte + nächste Schichten</h2>
        <ul className="space-y-1.5 text-[12px]">
          {schichten.slice(-12).reverse().map((s) => {
            const t = getShiftType(s);
            const farbe = t === "night" ? "var(--sat)" : t === "early" ? "var(--mon)" : "var(--tue)";
            const std = Math.max(0, (new Date(s.end!).getTime() - new Date(s.start!).getTime()) / 3_600_000);
            const isFuture = new Date(s.start!).getTime() > ref.getTime();
            return (
              <li key={s.id} className="flex items-baseline justify-between gap-2 flex-wrap py-1.5 border-b border-app-soft last:border-b-0">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="w-2 h-2 rounded-full" style={{ background: `rgb(${farbe})` }} />
                  <span className="font-mono">{format(new Date(s.start!), "EEE d. MMM · HH:mm", { locale: de })}</span>
                  {isFuture && <span className="chip text-[9px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-soft))" }}>geplant</span>}
                </span>
                <span className="text-soft">{t} · {std.toFixed(1)} h</span>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
