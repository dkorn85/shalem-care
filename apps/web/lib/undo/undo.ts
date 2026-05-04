// Undo-System — Event-Sourcing-Light
//
// Jede mutierende Action protokolliert sich als ActionRecord mit:
//  - Beschreibung (für UI)
//  - Vorzustand (Snapshot, JSON-serialisierbar)
//  - Replay-Funktion zum Rückgängig-Machen
//
// Pro User-Session ein Stack. Toast nach Mutation: "Rückgängig?" → letzter Pop.
// Keep last 20 Actions, ältere fallen raus.

import { store } from "../swap-store";
import type { SwapOffer } from "../swap-store";

export type ActionRecord = {
  id: string;
  at: string;                // ISO timestamp
  actor: string;             // User-ID die Action ausgelöst hat
  description: string;       // human-readable für UI
  category: "swap" | "approval" | "payment" | "shift" | "other";
  // Snapshot: kompletter Vorzustand für Restore
  inverse: InverseAction;
};

export type InverseAction =
  | { type: "restoreOffer"; offerId: string; previousState: SwapOffer }
  | { type: "noop"; reason: string };

const globalForUndo = globalThis as unknown as { __shalemUndoLog?: ActionRecord[] };
const log: ActionRecord[] = globalForUndo.__shalemUndoLog ?? [];
if (!globalForUndo.__shalemUndoLog) globalForUndo.__shalemUndoLog = log;

const MAX_HISTORY = 20;

export function recordAction(record: Omit<ActionRecord, "id" | "at">): ActionRecord {
  const full: ActionRecord = {
    ...record,
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    at: new Date().toISOString(),
  };
  log.push(full);
  if (log.length > MAX_HISTORY) log.shift();
  return full;
}

export function listRecentActions(limit = 10): ActionRecord[] {
  return log.slice(-limit).reverse();
}

export function peekLastAction(): ActionRecord | null {
  return log.length > 0 ? log[log.length - 1] : null;
}

export async function undoLastAction(): Promise<{ ok: boolean; description?: string; error?: string }> {
  const last = log.pop();
  if (!last) return { ok: false, error: "Nichts zu rückgängig" };

  try {
    await applyInverse(last.inverse);
    return { ok: true, description: last.description };
  } catch (err) {
    log.push(last);
    return { ok: false, error: err instanceof Error ? err.message : "Unbekannter Fehler" };
  }
}

export async function undoActionById(actionId: string): Promise<{ ok: boolean; description?: string; error?: string }> {
  const idx = log.findIndex((a) => a.id === actionId);
  if (idx < 0) return { ok: false, error: "Action nicht gefunden" };

  const action = log[idx];
  try {
    await applyInverse(action.inverse);
    log.splice(idx, 1);
    return { ok: true, description: action.description };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unbekannter Fehler" };
  }
}

async function applyInverse(inverse: InverseAction): Promise<void> {
  switch (inverse.type) {
    case "restoreOffer": {
      const current = await store.getOffer(inverse.offerId);
      if (!current) throw new Error(`Offer ${inverse.offerId} existiert nicht mehr`);
      // Bringe Offer zurück auf vorherigen State
      await store.updateOffer(
        inverse.offerId,
        {
          state: inverse.previousState.state,
          acceptedBy: inverse.previousState.acceptedBy,
          acceptedAt: inverse.previousState.acceptedAt,
          approvedBy: inverse.previousState.approvedBy,
          approvedAt: inverse.previousState.approvedAt,
          rejectedReason: inverse.previousState.rejectedReason,
        },
        {
          event: "undo",
          at: new Date().toISOString(),
          meta: `→ zurück zu ${inverse.previousState.state}`,
        }
      );
      break;
    }
    case "noop":
      break;
  }
}

export function clearUndoLog() {
  log.length = 0;
}
