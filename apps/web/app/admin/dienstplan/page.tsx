import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DienstplanEditor } from "@/components/DienstplanEditor";
import type { PersonRow, FreeSlot, SuggestionForSlot } from "@/components/DienstplanEditor";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { getShiftType, type ShiftType } from "@/lib/fhir";
import { computeCoordinatorSuggestions } from "@/lib/dispo/actions";
import { getSlotImportSource } from "@/lib/dispo/store";
import { eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns";

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
  const rows: PersonRow[] = slotsByPerson.map(({ person, slots }) => {
    const shiftsByDay: Record<string, { slotId: string; shiftType: ShiftType }> = {};
    for (const s of slots) {
      if (!s.start || !s.id) continue;
      const dKey = days.find((d) => isSameDay(new Date(s.start!), d))?.toISOString().slice(0, 10);
      if (!dKey) continue;
      const t = getShiftType(s) ?? "early";
      shiftsByDay[dKey] = { slotId: s.id, shiftType: t };
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
          <span className="text-[11px] text-soft">
            KW {iso8601Week(weekStart)} · {weekStart.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} – {weekEnd.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
      </header>

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
