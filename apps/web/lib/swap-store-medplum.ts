import type { Slot, Task, Practitioner, Bundle, Reference } from "@medplum/fhirtypes";
import { getMedplum } from "./medplum";
import type { SwapStore, SwapOffer, Person, SeedData } from "./swap-store";
import type { SwapState } from "./swap-machine";

const NS = "https://shalem.care/fhir";
const EXT = {
  swapState:     `${NS}/swap-state`,
  swapHistory:   `${NS}/swap-history`,
  seekingSlot:   `${NS}/seeking-slot`,
  seekingText:   `${NS}/seeking-text`,
  rejectReason:  `${NS}/reject-reason`,
  slotOwner:     `${NS}/slot-owner`,
  initials:      `${NS}/initials`,
  tariffGrade:   `${NS}/tariff-grade`,
} as const;

const TASK_STATUS_FROM_SWAP: Record<SwapState, Task["status"]> = {
  draft:     "draft",
  open:      "ready",
  matched:   "in-progress",
  approved:  "in-progress",
  rejected:  "rejected",
  completed: "completed",
  withdrawn: "cancelled",
};

const SWAP_STATE_FROM_TASK: Record<string, SwapState> = {
  "draft":       "draft",
  "ready":       "open",
  "in-progress": "matched",
  "rejected":    "rejected",
  "completed":   "completed",
  "cancelled":   "withdrawn",
};

function refOf(resourceType: string, id: string): any {
  return { reference: `${resourceType}/${id}` };
}

function idFromRef(ref?: Reference): string | undefined {
  return ref?.reference?.split("/")[1];
}

function offerToTask(offer: SwapOffer): Task {
  const ext: Task["extension"] = [
    { url: EXT.swapState, valueCode: offer.state },
    { url: EXT.swapHistory, valueString: JSON.stringify(offer.history) },
  ];
  if (offer.seekingSlotId)   ext.push({ url: EXT.seekingSlot, valueReference: refOf("Slot", offer.seekingSlotId) });
  if (offer.seekingFreeText) ext.push({ url: EXT.seekingText, valueString: offer.seekingFreeText });
  if (offer.rejectedReason)  ext.push({ url: EXT.rejectReason, valueString: offer.rejectedReason });

  return {
    resourceType: "Task",
    id: offer.id,
    status: TASK_STATUS_FROM_SWAP[offer.state],
    intent: "order",
    code: { coding: [{ system: `${NS}/CodeSystem/task`, code: "shift-swap-offer" }] },
    focus: refOf("Slot", offer.slotId),
    requester: refOf("Practitioner", offer.offeredBy),
    owner: offer.acceptedBy ? refOf("Practitioner", offer.acceptedBy) : undefined,
    authoredOn: offer.offeredAt,
    lastModified: offer.acceptedAt ?? offer.approvedAt ?? offer.offeredAt,
    extension: ext,
    note: offer.approvedBy ? [{ authorReference: refOf("Practitioner", offer.approvedBy), text: "approved" }] : undefined,
  };
}

function taskToOffer(task: Task): SwapOffer {
  const ext = task.extension ?? [];
  const findExt = (url: string) => ext.find((e) => e.url === url);

  const stateExt = findExt(EXT.swapState)?.valueCode as SwapState | undefined;
  const state = stateExt ?? SWAP_STATE_FROM_TASK[task.status ?? ""] ?? "draft";

  const historyJson = findExt(EXT.swapHistory)?.valueString;
  const history = historyJson ? JSON.parse(historyJson) : [];

  const approveNote = task.note?.find((n) => n.text === "approved");

  return {
    id: task.id!,
    state,
    slotId: idFromRef(task.focus)!,
    offeredBy: idFromRef(task.requester)!,
    offeredAt: task.authoredOn!,
    seekingSlotId: idFromRef(findExt(EXT.seekingSlot)?.valueReference),
    seekingFreeText: findExt(EXT.seekingText)?.valueString,
    acceptedBy: idFromRef(task.owner),
    acceptedAt: state === "matched" || state === "approved" || state === "completed" ? task.lastModified : undefined,
    approvedBy: idFromRef(approveNote?.authorReference),
    approvedAt: state === "approved" || state === "completed" ? task.lastModified : undefined,
    rejectedReason: findExt(EXT.rejectReason)?.valueString,
    history,
  };
}

function personToPractitioner(p: Person): Practitioner {
  return {
    resourceType: "Practitioner",
    id: p.id,
    name: [{ text: p.name, given: [p.name.split(" ")[0]], family: p.name.split(" ").slice(1).join(" ") }],
    qualification: p.qualifications.map((q) => ({
      code: { coding: [{ system: `${NS}/CodeSystem/qualification`, code: q, display: q }] },
    })),
    extension: [
      { url: EXT.initials, valueString: p.initials },
      { url: EXT.tariffGrade, valueString: p.tariffGrade },
      { url: `${NS}/role`, valueCode: p.role },
    ],
  };
}

function practitionerToPerson(pr: Practitioner): Person {
  const ext = pr.extension ?? [];
  const find = (url: string) => ext.find((e) => e.url === url);
  return {
    id: pr.id!,
    name: pr.name?.[0]?.text ?? "Unbekannt",
    initials: find(EXT.initials)?.valueString ?? "??",
    role: (find(`${NS}/role`)?.valueCode as Person["role"]) ?? "nurse",
    qualifications: pr.qualification?.map((q) => q.code?.coding?.[0]?.code ?? "") ?? [],
    tariffGrade: find(EXT.tariffGrade)?.valueString ?? "TVOED-P_P7",
  };
}

function setOwnerExt(slot: Slot, ownerId: string): Slot {
  const others = (slot.extension ?? []).filter((e) => e.url !== EXT.slotOwner);
  return {
    ...slot,
    extension: [...others, { url: EXT.slotOwner, valueReference: refOf("Practitioner", ownerId) }],
  };
}

export class MedplumSwapStore implements SwapStore {
  private get medplum() { return getMedplum() as any; }
  private _seedChecked = false;
  private _seedCache = false;

  async listOffers(): Promise<SwapOffer[]> {
    const bundle = await this.medplum.search("Task", { code: "shift-swap-offer" });
    return (bundle.entry ?? []).map((e: any) => taskToOffer(e.resource));
  }

  async getOffer(id: string): Promise<SwapOffer | null> {
    try {
      const task = await this.medplum.readResource("Task", id);
      return taskToOffer(task);
    } catch { return null; }
  }

  async createOffer(input: Omit<SwapOffer, "id" | "history">): Promise<SwapOffer> {
    const draft: SwapOffer = {
      ...input,
      id: "",
      history: [{ event: "offer", at: input.offeredAt, actor: input.offeredBy }],
    };
    const task = offerToTask(draft);
    delete task.id;
    const created = await this.medplum.createResource(task);
    return taskToOffer(created);
  }

  async updateOffer(id: string, patch: Partial<SwapOffer>, historyEntry: SwapOffer["history"][0]): Promise<SwapOffer> {
    const existing = await this.getOffer(id);
    if (!existing) throw new Error(`Offer ${id} not found`);
    const updated: SwapOffer = {
      ...existing,
      ...patch,
      history: [...existing.history, historyEntry],
    };
    const task = offerToTask(updated);
    const saved = await this.medplum.updateResource(task);
    return taskToOffer(saved);
  }

  async listSlots(): Promise<Slot[]> {
    const bundle = await this.medplum.search("Slot", {});
    return (bundle.entry ?? []).map((e: any) => e.resource);
  }

  async getSlot(id: string): Promise<Slot | null> {
    try { return await this.medplum.readResource("Slot", id); } catch { return null; }
  }

  async createSlot(slot: Slot, ownerId: string): Promise<Slot> {
    const slotWithOwner = setOwnerExt(slot, ownerId);
    return await this.medplum.createResource(slotWithOwner);
  }

  async listSlotsForPerson(personId: string): Promise<Slot[]> {
    const all = await this.listSlots();
    return all.filter((s) => s.extension?.some((e) => e.url === EXT.slotOwner && e.valueReference?.reference === `Practitioner/${personId}`));
  }

  async swapSlotOwners(slotIdA: string, slotIdB: string | undefined, newOwner: string, originalOwner: string): Promise<void> {
    const a = await this.getSlot(slotIdA);
    if (!a) throw new Error(`Slot ${slotIdA} not found`);
    await this.medplum.updateResource(setOwnerExt(a, newOwner));

    if (slotIdB) {
      const b = await this.getSlot(slotIdB);
      if (b) await this.medplum.updateResource(setOwnerExt(b, originalOwner));
    }
  }

  async listPeople(): Promise<Person[]> {
    const bundle = await this.medplum.search("Practitioner", {});
    return (bundle.entry ?? []).map((e: any) => practitionerToPerson(e.resource));
  }

  async getPerson(id: string): Promise<Person | null> {
    try {
      const pr = await this.medplum.readResource("Practitioner", id);
      return practitionerToPerson(pr);
    } catch { return null; }
  }

  async seed(data: SeedData): Promise<void> {
    const entries: any[] = [];

    for (const p of data.people) {
      entries.push({ resource: personToPractitioner(p), request: { method: "PUT", url: `Practitioner/${p.id}` } });
    }

    for (const s of data.slots) {
      const ownerId = data.slotOwners[s.id!];
      const slotWithOwner = ownerId ? setOwnerExt(s, ownerId) : s;
      entries.push({ resource: slotWithOwner, request: { method: "PUT", url: `Slot/${s.id}` } });
    }

    for (const o of data.offers) {
      entries.push({ resource: offerToTask(o), request: { method: "PUT", url: `Task/${o.id}` } });
    }

    const bundle: Bundle = { resourceType: "Bundle", type: "transaction", entry: entries };
    await this.medplum.executeBatch(bundle);
  }

  isSeeded(): boolean {
    if (this._seedChecked) return this._seedCache;
    // Synchroner Stub: Phase 1 sehen wir vor Initialisierung als nicht-seeded
    // In Phase 2 wird das durch echten Async-Init ersetzt
    return false;
  }
}
