// In-Memory-Store für Träger-Roster-Imports + Zuordnungs-Audit-Log.
// Phase 2: FHIR ServiceRequest + Encounter im Medplum.

import type { ImportedRoster } from "./types";
import type { Slot } from "@medplum/fhirtypes";

type GlobalShape = {
  __shalemImports?: ImportedRoster[];
  __shalemImportSlots?: Map<string, string[]>;       // importId → slot-ids
  __shalemSlotSource?: Map<string, string>;          // slotId → importId
  __shalemAuditLog?: AuditEntry[];
};
const g = globalThis as unknown as GlobalShape;
const imports: ImportedRoster[] = g.__shalemImports ?? [];
const importSlots: Map<string, string[]> = g.__shalemImportSlots ?? new Map();
const slotSource: Map<string, string> = g.__shalemSlotSource ?? new Map();
const auditLog: AuditEntry[] = g.__shalemAuditLog ?? [];
if (!g.__shalemImports) g.__shalemImports = imports;
if (!g.__shalemImportSlots) g.__shalemImportSlots = importSlots;
if (!g.__shalemSlotSource) g.__shalemSlotSource = slotSource;
if (!g.__shalemAuditLog) g.__shalemAuditLog = auditLog;

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  event: "import" | "create_slot" | "delete_slot" | "assign" | "unassign" | "ai_suggest_apply";
  meta?: Record<string, unknown>;
};

// ─── Imports ──────────────────────────────────────

export function listImports(einrichtungId?: string): ImportedRoster[] {
  return imports
    .filter((i) => !einrichtungId || i.einrichtungId === einrichtungId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export function getImport(id: string): ImportedRoster | null {
  return imports.find((i) => i.id === id) ?? null;
}

export function recordImport(input: {
  einrichtungId: string;
  filename: string;
  uploadedBy: string;
  rowCount: number;
  importedSlotCount: number;
  slotIds: string[];
  notes?: string;
}): ImportedRoster {
  const imp: ImportedRoster = {
    id: `imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    einrichtungId: input.einrichtungId,
    filename: input.filename,
    uploadedAt: new Date().toISOString(),
    uploadedBy: input.uploadedBy,
    rowCount: input.rowCount,
    importedSlotCount: input.importedSlotCount,
    status: "applied",
    notes: input.notes,
  };
  imports.push(imp);
  importSlots.set(imp.id, input.slotIds);
  for (const sid of input.slotIds) slotSource.set(sid, imp.id);
  return imp;
}

export function listSlotsForImport(importId: string, allSlots: Slot[]): Slot[] {
  const ids = new Set(importSlots.get(importId) ?? []);
  return allSlots.filter((s) => s.id && ids.has(s.id));
}

export function getSlotImportSource(slotId: string): ImportedRoster | null {
  const importId = slotSource.get(slotId);
  if (!importId) return null;
  return imports.find((i) => i.id === importId) ?? null;
}

// ─── Audit ────────────────────────────────────────

export function recordAudit(entry: Omit<AuditEntry, "id" | "at">): AuditEntry {
  const e: AuditEntry = {
    ...entry,
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    at: new Date().toISOString(),
  };
  auditLog.push(e);
  return e;
}

export function listAudit(limit = 50): AuditEntry[] {
  return auditLog.slice(-limit).reverse();
}
