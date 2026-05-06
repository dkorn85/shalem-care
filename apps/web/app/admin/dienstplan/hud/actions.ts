"use server";

import { generateHud, type DienstplanHud, type HudFilter } from "@/lib/dienstplan/hud-store";
import { speichereSnapshot, seedHudArchiveOnce, type DienstplanSnapshot, type PlanMutation } from "@/lib/dienstplan/hud-archive";

export async function regenerateHudAction(filter: HudFilter): Promise<DienstplanHud> {
  return generateHud(filter);
}

export async function speichereSnapshotAction(
  titel: string,
  hud: DienstplanHud,
  mutations: { personId: string; personName: string; datumISO: string; vorher: string; nachher: string }[],
): Promise<{ ok: boolean; snapshotId?: string }> {
  seedHudArchiveOnce();
  const id = `manuell-${Date.now()}`;
  const planMutations: PlanMutation[] = mutations.map((m) => ({
    ts: new Date().toISOString(),
    personId: m.personId,
    personName: m.personName,
    datumISO: m.datumISO,
    vorher: m.vorher,
    nachher: m.nachher,
    von: "Detektiv Eins",
  }));
  const snap: DienstplanSnapshot = {
    id,
    zone: "aktuell",
    titel,
    einrichtungId: hud.einrichtung?.id,
    stationId: hud.station?.id,
    startDatum: hud.tage[0] ?? new Date().toISOString().slice(0, 10),
    wochen: Math.ceil(hud.tage.length / 7),
    gespeichertVon: "Detektiv Eins",
    gespeichertAm: new Date().toISOString(),
    status: "entwurf",
    hud,
    mutations: planMutations,
  };
  speichereSnapshot(snap);
  return { ok: true, snapshotId: id };
}
