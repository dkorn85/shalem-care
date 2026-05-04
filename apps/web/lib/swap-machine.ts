export type SwapState =
  | "draft"
  | "open"
  | "matched"
  | "approved"
  | "rejected"
  | "completed"
  | "withdrawn";

export type SwapEvent =
  | "offer"
  | "accept"
  | "approve"
  | "reject"
  | "complete"
  | "withdraw";

const TRANSITIONS: Record<SwapState, Partial<Record<SwapEvent, SwapState>>> = {
  draft:     { offer: "open" },
  open:      { accept: "matched", withdraw: "withdrawn" },
  matched:   { approve: "approved", reject: "rejected", withdraw: "withdrawn" },
  approved:  { complete: "completed" },
  rejected:  {},
  completed: {},
  withdrawn: {},
};

const TERMINAL: ReadonlySet<SwapState> = new Set(["completed", "rejected", "withdrawn"]);

export function transition(
  state: SwapState,
  event: SwapEvent
): { ok: true; next: SwapState } | { ok: false; reason: string } {
  const next = TRANSITIONS[state]?.[event];
  if (!next) {
    return {
      ok: false,
      reason: `Übergang ${state} → ${event} ist nicht erlaubt.`,
    };
  }
  return { ok: true, next };
}

export function isTerminal(state: SwapState): boolean {
  return TERMINAL.has(state);
}

export function allowedEvents(state: SwapState): SwapEvent[] {
  return Object.keys(TRANSITIONS[state] ?? {}) as SwapEvent[];
}

export function germanLabel(state: SwapState): string {
  const labels: Record<SwapState, string> = {
    draft: "Entwurf",
    open: "Offen",
    matched: "Gematcht",
    approved: "Genehmigt",
    rejected: "Abgelehnt",
    completed: "Abgeschlossen",
    withdrawn: "Zurückgezogen",
  };
  return labels[state];
}
