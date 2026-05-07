"use server";

import { revalidatePath } from "next/cache";
import {
  aufsichtsratGenehmigt,
  aufsichtsratLehntAb,
  bestaetigeAuszahlung,
  erstelleVorschlag,
  seedAusschuettungOnce,
  starteAuszahlung,
  vorstandSchlaegtVor,
} from "./ausschuettung";

function ping() {
  revalidatePath("/genossenschaft/ausschuettung");
}

export async function neuerVorschlag(quartal: string, honorarVolumenEur: number) {
  seedAusschuettungOnce();
  const a = erstelleVorschlag({
    quartal,
    honorarVolumenCent: Math.round(honorarVolumenEur * 100),
  });
  ping();
  return { ok: true as const, id: a.id };
}

export async function vorstandSchlaegtVorAct(id: string, vorstandId = "person-de1") {
  const a = vorstandSchlaegtVor(id, vorstandId);
  if (!a) return { ok: false as const, error: "Status-Übergang nicht möglich" };
  ping();
  return { ok: true as const };
}

export async function aufsichtsratGenehmigtAct(id: string, protokoll?: string) {
  const a = aufsichtsratGenehmigt(id, "person-de1", protokoll ?? `AR-${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}/01`);
  if (!a) return { ok: false as const, error: "Status-Übergang nicht möglich" };
  ping();
  return { ok: true as const };
}

export async function aufsichtsratLehntAbAct(id: string, grund = "Vorstands-Bedarf für Reserven") {
  const a = aufsichtsratLehntAb(id, grund);
  if (!a) return { ok: false as const, error: "Status-Übergang nicht möglich" };
  ping();
  return { ok: true as const };
}

export async function starteAuszahlungAct(id: string) {
  const a = starteAuszahlung(id);
  if (!a) return { ok: false as const, error: "Status-Übergang nicht möglich" };
  ping();
  return { ok: true as const };
}

export async function bestaetigeAuszahlungAct(id: string) {
  const a = bestaetigeAuszahlung(
    id,
    `SEPA-${new Date().toISOString().slice(0, 10)}-PAIN.001`,
  );
  if (!a) return { ok: false as const, error: "Status-Übergang nicht möglich" };
  ping();
  return { ok: true as const };
}
