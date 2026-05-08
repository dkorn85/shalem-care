import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DienstplanEditor } from "@/components/DienstplanEditor";
import type { PersonRow, FreeSlot, SuggestionForSlot } from "@/components/DienstplanEditor";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { getShiftType, type ShiftType } from "@/lib/fhir";
import { computeCoordinatorSuggestions } from "@/lib/dispo/actions";
import { getSlotImportSource } from "@/lib/dispo/store";
import { aktuelle as aktuellerKiPlan } from "@/lib/dienstplan/plan-history";
import { eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { GameModeOnly } from "@/components/GameModeWrapper";

export default async function DienstplanPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  seedOnce();
  const { week: weekParam } = await searchParams;

  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const allPeople = await store.listPeople();
  const nurses = allPeople.filter((p) => p.role === "nurse" || p.role === "lead");

  // Anker-Datum
  const anchor = weekParam ? new Date(weekParam) : new Date("2026-05-06");
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const dayKeys = days.map((d) => d.toISOString().slice(0, 10));

  // Slots pro Person
  const slotsByPerson = await Promise.all(
    nurses.map(async (p) => ({ person: p, slots: await store.listSlotsForPerson(p.id) })),
  );
  // Aktiver KI-Plan einlesen — wird in die Wochen-Cells gemerged.
  const kiPlan = aktuellerKiPlan();
  const kiSchichtTyp: Record<string, ShiftType> = {
    frueh: "early",
    spaet: "late",
    nacht: "night",
    tag: "intermediate",
    geteilter_dienst: "intermediate",
  };
  // pro Person+Tag eine Zuweisung aus dem Plan
  const kiByPersonDay = new Map<string, { schicht: ShiftType; src: "ki" }>();
  if (kiPlan?.uebernommen) {
    for (const z of kiPlan.ergebnis.zuweisungen) {
      const key = `${z.personId}::${z.datumISO}`;
      const t = kiSchichtTyp[z.schicht] ?? "early";
      kiByPersonDay.set(key, { schicht: t, src: "ki" });
    }
  }

  const rows: PersonRow[] = slotsByPerson.map(({ person, slots }) => {
    const shiftsByDay: Record<string, { slotId: string; shiftType: ShiftType }> = {};
    for (const s of slots) {
      if (!s.start || !s.id) continue;
      const dKey = days.find((d) => isSameDay(new Date(s.start!), d))?.toISOString().slice(0, 10);
      if (!dKey) continue;
      const t = getShiftType(s) ?? "early";
      shiftsByDay[dKey] = { slotId: s.id, shiftType: t };
    }
    // KI-Plan-Schichten in leere Cells einfuegen (echte Slots haben Vorrang)
    for (const dKey of dayKeys) {
      if (shiftsByDay[dKey]) continue;
      const ki = kiByPersonDay.get(`${person.id}::${dKey}`);
      if (ki) {
        shiftsByDay[dKey] = { slotId: `ki-${person.id}-${dKey}`, shiftType: ki.schicht };
      }
    }
    return {
      id: person.id,
      name: person.name,
      initials: person.initials,
      role: person.role,
      shiftsByDay,
    };
  });

  // Freie Slots in der Woche (Slots ohne Owner, mit Start in der Woche)
  const ownedIds = new Set<string>();
  for (const r of slotsByPerson) for (const s of r.slots) if (s.id) ownedIds.add(s.id);
  const allSlots = await store.listSlots();
  const freeSlots = allSlots.filter((s) => {
    if (!s.id || !s.start) return false;
    if (ownedIds.has(s.id)) return false;
    const start = new Date(s.start);
    return start >= weekStart && start <= weekEnd;
  });

  const freeSlotsByDay: Record<string, FreeSlot[]> = {};
  for (const dKey of dayKeys) freeSlotsByDay[dKey] = [];
  for (const s of freeSlots) {
    if (!s.id || !s.start) continue;
    const dKey = days.find((d) => isSameDay(new Date(s.start!), d))?.toISOString().slice(0, 10);
    if (!dKey) continue;
    const importSrc = getSlotImportSource(s.id);
    const ref = s.schedule?.reference ?? "";
    const stationLabel = ref.includes("st-luk") ? "St. Lukas" : ref.includes("pulmologie") ? "Pulmologie 3B" : ref.replace("Schedule/", "");
    freeSlotsByDay[dKey].push({
      slotId: s.id,
      shiftType: getShiftType(s) ?? "early",
      date: dKey,
      shortLabel: importSrc ? `Träger-Import · ${stationLabel}` : stationLabel,
      source: importSrc ? "carrier_import" : "lead_manual",
    });
  }

  // KI-Vorschläge berechnen für die freien Slots
  const sugg = await computeCoordinatorSuggestions();
  const suggestions: Record<string, SuggestionForSlot["topMatches"]> = {};
  if (sugg.ok) {
    for (const s of sugg.suggestions) {
      suggestions[s.slotId] = s.topMatches;
    }
  }

  const totalFree = freeSlots.length;
  const totalSuggested = Object.values(suggestions).filter((m) => m.length > 0).length;

  return (
    <AppShell
      role="lead"
      user={{ id: lead.id, name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Dienstplan</h1>
        <p className="text-[13px] text-mute mt-1.5 max-w-prose">
          Klick auf eine Zelle zum Bearbeiten · neue Schicht anlegen · Schicht in den Tausch-Markt
          freigeben · KI-Vorschlag für freie Slots übernehmen.
        </p>
        <GameModeOnly>
        <Link
          href="/admin/dienstplan/arena"
          className="block mt-4 rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "linear-gradient(135deg, rgb(var(--vibe-stats) / 0.15), rgb(var(--accent) / 0.10))",
            border: "2px solid rgb(var(--vibe-stats) / 0.4)",
          }}
        >
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-stats))" }}>
                ⚡ Neu · Vollbild-Modus mit KI-Mini-Game
              </p>
              <h2 className="font-display text-[18px] font-bold tracking-tight2">
                Dienstplan-Arena starten →
              </h2>
              <p className="text-[12px] text-mute mt-1 max-w-prose">
                Auto-Pilot-Swipe · Manuelle Tour mit Live-Score · Sparring mit
                Time-Pressure · Combo-Streak und Konfetti bei Vollbesetzung.
              </p>
            </div>
            <div className="flex gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">🤖 Auto-Pilot</span>
              <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">🎯 Manuell</span>
              <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">⚡ Sparring</span>
            </div>
          </div>
        </Link>
        </GameModeOnly>
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <Link
            href="/admin/dienstplan/import"
            className="btn text-[13px]"
          >
            ⬆ Träger-Import
          </Link>
          <Link
            href="/admin/dienstplan/koordinator"
            className="btn btn-primary text-[13px]"
          >
            🧠 KI-Koordinator ({totalFree} frei · {totalSuggested} mit Vorschlag)
          </Link>
          <Link
            href="/admin/dienstplan/ki"
            className="btn text-[13px]"
            style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.4)", color: "rgb(var(--accent))" }}
          >
            ✦ KI-Monatsplan
          </Link>
          <Link
            href="/admin/dienstplan/hud"
            className="btn text-[13px]"
            style={{ background: "rgb(var(--accent))", color: "white" }}
          >
            🛰 KI-HUD · Multi-Station
          </Link>
          <span className="text-[11px] text-soft">
            KW {iso8601Week(weekStart)} · {weekStart.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} – {weekEnd.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
      </header>

      {(() => {
        const kiPlan = aktuellerKiPlan();
        if (!kiPlan) return null;

        // Schichten in der aktuellen Woche aus dem KI-Plan filtern
        const ws = weekStart.getTime();
        const we = weekEnd.getTime();
        const wocheZuw = kiPlan.ergebnis.zuweisungen.filter((z) => {
          const t = new Date(z.datumISO).getTime();
          return t >= ws && t <= we;
        });
        // Personen-Counter für Banner
        const personenInKw = new Set(wocheZuw.map((z) => z.personId)).size;

        return (
          <section
            className="mb-5 rounded-2xl p-4 sm:p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgb(var(--thu) / 0.10), rgb(var(--accent) / 0.06))",
              boxShadow: "inset 0 0 0 1px rgb(var(--thu) / 0.3)",
            }}
          >
            <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: "rgb(var(--thu))" }} />
            <div className="ml-2.5 grid sm:grid-cols-12 gap-3 items-baseline">
              <div className="sm:col-span-8">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "rgb(var(--thu))" }}>
                    ✓ KI-Plan aktiv
                  </span>
                  <span className="text-[11px] text-soft">·</span>
                  <span className="text-[11px] font-mono">
                    {kiPlan.zeitraum.jahr}-{String(kiPlan.zeitraum.monat).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] text-soft">·</span>
                  <span className="text-[11px]">
                    {wocheZuw.length} Schichten / {personenInKw} Personen in dieser KW
                  </span>
                </div>
                <p className="text-[13px] leading-snug text-soft italic">"{kiPlan.ergebnis.kommentar.slice(0, 200)}{kiPlan.ergebnis.kommentar.length > 200 ? "…" : ""}"</p>
                <p className="text-[10px] text-mute mt-1">
                  Bestätigt {kiPlan.uebernommenAm ? new Date(kiPlan.uebernommenAm).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                  {" · "}
                  {kiPlan.ergebnis.zuweisungen.length} Schichten gesamt im Plan
                </p>
              </div>
              <div className="sm:col-span-4 flex justify-end">
                <Link
                  href="/admin/dienstplan/ki"
                  className="text-[12px] px-3 py-1.5 rounded-md font-medium transition-all"
                  style={{
                    background: "rgb(var(--thu) / 0.15)",
                    color: "rgb(var(--thu))",
                    boxShadow: "inset 0 0 0 1px rgb(var(--thu) / 0.4)",
                  }}
                >
                  → Plan öffnen / bearbeiten
                </Link>
              </div>
            </div>

            {wocheZuw.length > 0 && (
              <div className="ml-2.5 mt-3 pt-3 border-t border-soft">
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">KI-Schichten in KW {iso8601Week(weekStart)}</p>
                <div className="flex flex-wrap gap-1">
                  {wocheZuw.slice(0, 40).map((z, i) => (
                    <span
                      key={i}
                      title={`${z.personId} · ${z.startHHMM}–${z.endHHMM}`}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono"
                      style={{
                        background: "rgb(var(--thu) / 0.15)",
                        color: "rgb(var(--thu))",
                        boxShadow: "inset 0 0 0 1px rgb(var(--thu) / 0.3)",
                      }}
                    >
                      {z.datumISO.slice(8)}.{String(new Date(z.datumISO).getMonth() + 1).padStart(2, "0")}
                      <span className="font-bold">{z.schicht[0].toUpperCase()}</span>
                    </span>
                  ))}
                  {wocheZuw.length > 40 && (
                    <span className="text-[10px] text-soft italic">+{wocheZuw.length - 40} mehr</span>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      })()}

      <DienstplanEditor
        days={dayKeys}
        rows={rows}
        freeSlotsByDay={freeSlotsByDay}
        suggestions={suggestions}
      />

      <p className="text-[12px] text-soft mt-4 flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500" /> Frühschicht</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-purple-500" /> Spätschicht</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-night-500" /> Nachtschicht</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "rgb(var(--thu))" }} /> KI-Vorschlag verfügbar</span>
      </p>
    </AppShell>
  );
}

function iso8601Week(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}
