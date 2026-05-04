"use server";

import { revalidatePath } from "next/cache";
import type { Slot } from "@medplum/fhirtypes";
import { store } from "../swap-store";
import { buildShiftSlot } from "../fhir";
import { listStations } from "../hierarchy/store";
import { recordAction } from "../undo/undo";
import { parseCsvOrJson } from "./parser";
import { recordImport, recordAudit } from "./store";
import { coordinate } from "./coordinator";
import type { CoordinatorSuggestion } from "./types";
import type { ShiftType } from "../fhir";

type R<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

const SHIFT_TIMES: Record<ShiftType, [number, number]> = {
  early:        [6, 14],
  late:         [14, 22],
  night:        [22, 30],     // bis 06 Uhr nächster Tag
  intermediate: [10, 18],
};

function toIsoFromLocal(dateStr: string, hour: number): string {
  // Day kommt als YYYY-MM-DD; konstruiere als CET (+02:00 Sommerzeit-Demo).
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hour >= 24) {
    const d = new Date(dateStr + "T00:00:00+02:00");
    d.setDate(d.getDate() + 1);
    return `${d.toISOString().slice(0, 10)}T${pad(hour - 24)}:00:00+02:00`;
  }
  return `${dateStr}T${pad(hour)}:00:00+02:00`;
}

// ─── Slot-Verwaltung (Lead) ─────────────────────────────────

export async function createSlotForPerson(input: {
  personId: string | null;        // null = freier Slot
  date: string;                   // YYYY-MM-DD
  shiftType: ShiftType;
  scheduleRef?: string;
  qualificationCode?: string;
}): Promise<R<{ slotId: string }>> {
  const [h0, h1] = SHIFT_TIMES[input.shiftType];
  const start = toIsoFromLocal(input.date, h0);
  const end = toIsoFromLocal(input.date, h1);
  const newId = `slot-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
  const slot = buildShiftSlot({
    scheduleRef: input.scheduleRef ?? "Schedule/pulmologie-3b-mai-2026",
    start, end,
    shiftType: input.shiftType,
    tariff: "TVOED-P",
    qualificationCode: input.qualificationCode ?? "RN",
    qualificationDisplay: "Pflegefachkraft",
  });
  slot.id = newId;
  await store.createSlot(slot, input.personId ?? "__free__");
  if (!input.personId) {
    // "__free__" ist nur Sentinel — entfernen wir gleich, damit der Slot wirklich frei ist
    if (store.reassignSlot) await store.reassignSlot(newId, null);
  }
  recordAudit({
    actor: "lead",
    event: "create_slot",
    meta: { slotId: newId, personId: input.personId, date: input.date, shiftType: input.shiftType },
  });
  revalidateAll();
  return { ok: true, slotId: newId };
}

export async function reassignSlot(slotId: string, personId: string | null): Promise<R> {
  if (!store.reassignSlot) return { ok: false, error: "Store unterstützt reassign nicht (medplum-driver: Phase 2)." };
  const s = await store.reassignSlot(slotId, personId);
  if (!s) return { ok: false, error: "Slot nicht gefunden." };
  recordAudit({
    actor: "lead",
    event: personId ? "assign" : "unassign",
    meta: { slotId, personId },
  });
  recordAction({
    actor: "lead",
    description: personId ? `Schicht zugewiesen: ${slotId} → ${personId}` : `Schicht freigegeben: ${slotId}`,
    category: "shift",
    inverse: { type: "noop", reason: "Disposition wird durch neue Zuweisung überschrieben" },
  });
  revalidateAll();
  return { ok: true };
}

export async function deleteSlot(slotId: string): Promise<R> {
  if (!store.deleteSlot) return { ok: false, error: "Store unterstützt delete nicht." };
  const ok = await store.deleteSlot(slotId);
  if (!ok) return { ok: false, error: "Slot nicht gefunden." };
  recordAudit({ actor: "lead", event: "delete_slot", meta: { slotId } });
  revalidateAll();
  return { ok: true };
}

// ─── Träger-Import ──────────────────────────────────────────

export async function importRoster(input: {
  einrichtungId: string;
  filename: string;
  uploadedBy: string;
  body: string;          // CSV oder JSON
  notes?: string;
}): Promise<R<{ importId: string; created: number; errors: number }>> {
  const parsed = parseCsvOrJson(input.body);
  if (!parsed.ok && parsed.rows.length === 0) {
    return { ok: false, error: parsed.errors.map((e) => `Zeile ${e.line}: ${e.reason}`).join(" · ") };
  }

  // Resolve Stations per shortName
  const allStations = listStations();
  const stationByShort = new Map<string, ReturnType<typeof listStations>[number]>();
  for (const s of allStations) stationByShort.set(s.shortName.toLowerCase(), s);

  const createdSlotIds: string[] = [];
  for (const row of parsed.rows) {
    const station = stationByShort.get(row.stationKuerzel.toLowerCase());
    if (!station) continue;
    if (station.einrichtungId !== input.einrichtungId) continue;
    const [h0, h1] = SHIFT_TIMES[row.schichtTyp];
    const start = toIsoFromLocal(row.datum, h0);
    const end = toIsoFromLocal(row.datum, h1);
    for (let i = 0; i < row.anzahlKraft; i++) {
      const slotId = `slot-imp-${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}-${i}`;
      const slot = buildShiftSlot({
        scheduleRef: `Schedule/${station.id}-import`,
        start, end,
        shiftType: row.schichtTyp,
        tariff: "TVOED-P",
        qualificationCode: row.qualifikation,
        qualificationDisplay: row.qualifikation === "RN" ? "Pflegefachkraft" : row.qualifikation,
      });
      slot.id = slotId;
      // Kein Owner — als "frei" anlegen
      await store.createSlot(slot, "__pending__");
      if (store.reassignSlot) await store.reassignSlot(slotId, null);
      createdSlotIds.push(slotId);
    }
  }

  const imp = recordImport({
    einrichtungId: input.einrichtungId,
    filename: input.filename,
    uploadedBy: input.uploadedBy,
    rowCount: parsed.rows.length,
    importedSlotCount: createdSlotIds.length,
    slotIds: createdSlotIds,
    notes: input.notes,
  });
  recordAudit({
    actor: input.uploadedBy,
    event: "import",
    meta: { importId: imp.id, einrichtungId: input.einrichtungId, slotCount: createdSlotIds.length },
  });
  revalidateAll();
  return { ok: true, importId: imp.id, created: createdSlotIds.length, errors: parsed.errors.length };
}

// ─── KI-Koordinator-Vorschläge berechnen ───────────────────

export async function computeCoordinatorSuggestions(input?: {
  einrichtungId?: string;
}): Promise<R<{ suggestions: CoordinatorSuggestion[] }>> {
  const allSlots = await store.listSlots();
  const allPeople = await store.listPeople();
  const pool = allPeople.filter((p) => p.role === "nurse" || p.role === "lead");

  // slotsOwners-Map aus dem Store rekonstruieren
  const slotsOwners = new Map<string, string>();
  for (const p of pool) {
    const owned = await store.listSlotsForPerson(p.id);
    for (const s of owned) if (s.id) slotsOwners.set(s.id, p.id);
  }

  const freeSlots = allSlots.filter(
    (s) => s.id && !slotsOwners.has(s.id) && s.start && new Date(s.start).getTime() > Date.now() - 7 * 24 * 3_600_000,
  );

  let scoped = freeSlots;
  const einrId = input?.einrichtungId;
  if (einrId) {
    // Nur Slots zur betreffenden Einrichtung — basierend auf Schedule-Ref
    scoped = freeSlots.filter((s) => {
      const ref = (s.schedule?.reference ?? "");
      return ref.includes(einrId);
    });
  }

  const suggestions = coordinate({
    freeSlots: scoped,
    pool,
    allSlots,
    slotsOwners,
    topK: 3,
  });

  return { ok: true, suggestions };
}

export async function applySuggestion(slotId: string, personId: string): Promise<R> {
  const r = await reassignSlot(slotId, personId);
  if (!r.ok) return r;
  recordAudit({ actor: "lead", event: "ai_suggest_apply", meta: { slotId, personId } });
  return { ok: true };
}

// ─── Helper ────────────────────────────────────────────────

function revalidateAll() {
  revalidatePath("/admin/dienstplan");
  revalidatePath("/admin/dienstplan/import");
  revalidatePath("/admin/dienstplan/koordinator");
  revalidatePath("/admin/disposition");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/dienst");
}
