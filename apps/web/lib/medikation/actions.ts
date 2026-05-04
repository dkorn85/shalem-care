"use server";

import { revalidatePath } from "next/cache";
import { findMedikament } from "./katalog";
import {
  createVerordnung as storeCreateVerordnung,
  pauseVerordnung as storePauseVerordnung,
  resumeVerordnung as storeResumeVerordnung,
  endVerordnung as storeEndVerordnung,
  recordVergabe as storeRecordVergabe,
  getVerordnung,
  seedMedikationOnce,
} from "./store";
import { recordAction } from "../undo/undo";
import type { Dosierschema, VergabeStatus, Vergabezeit } from "./types";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function createVerordnung(input: {
  klientId: string;
  medikamentId: string;
  verordnetVon: string;
  indikation: string;
  dosierung: Dosierschema;
  ab: string;
  bis?: string;
  notizen?: string;
}): Promise<Result<{ id: string }>> {
  seedMedikationOnce();
  if (!findMedikament(input.medikamentId)) return { ok: false, error: "Medikament nicht im Katalog." };
  if (!input.verordnetVon.trim()) return { ok: false, error: "Verordnender Arzt erforderlich." };
  if (!input.indikation.trim()) return { ok: false, error: "Indikation erforderlich (für MDK-Plausibilität)." };

  const hasDosis =
    input.dosierung.morgens || input.dosierung.mittags ||
    input.dosierung.abends  || input.dosierung.nachts  ||
    input.dosierung.beiBedarf;
  if (!hasDosis) return { ok: false, error: "Mindestens eine Dosis (morgens/mittags/abends/nachts/Bedarf) eintragen." };

  const v = storeCreateVerordnung({
    klientId: input.klientId,
    medikamentId: input.medikamentId,
    verordnetVon: input.verordnetVon,
    verordnetAm: new Date().toISOString().slice(0, 10),
    indikation: input.indikation,
    dosierung: input.dosierung,
    ab: input.ab,
    bis: input.bis,
    notizen: input.notizen,
  });

  recordAction({
    actor: "lead",
    description: `Neue Verordnung erfasst (${findMedikament(input.medikamentId)?.handelsname})`,
    category: "other",
    inverse: { type: "noop", reason: "Verordnungen können nur ärztlich beendet werden — siehe Pause/Beenden" },
  });

  revalidatePath(`/admin/dokumentation/${input.klientId}`);
  return { ok: true, data: { id: v.id } };
}

export async function pauseVerordnung(verordnungId: string): Promise<Result> {
  seedMedikationOnce();
  const v = storePauseVerordnung(verordnungId);
  if (!v) return { ok: false, error: "Verordnung nicht gefunden." };
  revalidatePath(`/admin/dokumentation/${v.klientId}`);
  return { ok: true };
}

export async function resumeVerordnung(verordnungId: string): Promise<Result> {
  seedMedikationOnce();
  const v = storeResumeVerordnung(verordnungId);
  if (!v) return { ok: false, error: "Verordnung nicht gefunden." };
  revalidatePath(`/admin/dokumentation/${v.klientId}`);
  return { ok: true };
}

export async function endVerordnung(verordnungId: string): Promise<Result> {
  seedMedikationOnce();
  const v = storeEndVerordnung(verordnungId);
  if (!v) return { ok: false, error: "Verordnung nicht gefunden." };
  revalidatePath(`/admin/dokumentation/${v.klientId}`);
  return { ok: true };
}

export async function recordVergabe(input: {
  verordnungId: string;
  zeit: Vergabezeit;
  geplanteDosis: string;
  tatsaechlicheDosis?: string;
  status: VergabeStatus;
  begruendung?: string;
  gegebenVon: string;
  btmRestbestand?: number;
}): Promise<Result<{ id: string }>> {
  seedMedikationOnce();
  const vo = getVerordnung(input.verordnungId);
  if (!vo) return { ok: false, error: "Verordnung nicht gefunden." };
  if (vo.status !== "aktiv") return { ok: false, error: "Verordnung ist nicht aktiv." };

  if (input.status !== "gegeben" && !input.begruendung?.trim()) {
    return { ok: false, error: "Bei Abweichung vom Plan ist eine Begründung Pflicht (MDK-Plausibilität)." };
  }

  const med = findMedikament(vo.medikamentId);
  if (med?.btm && input.btmRestbestand === undefined) {
    return { ok: false, error: "BtM-Pflicht: Restbestand nach Gabe erfassen (BtMVV § 8)." };
  }

  const vg = storeRecordVergabe({
    verordnungId: vo.id,
    klientId: vo.klientId,
    zeit: input.zeit,
    geplanteDosis: input.geplanteDosis,
    tatsaechlicheDosis: input.tatsaechlicheDosis,
    status: input.status,
    begruendung: input.begruendung,
    gegebenVon: input.gegebenVon,
    btmRestbestand: input.btmRestbestand,
  });

  recordAction({
    actor: input.gegebenVon,
    description: `Vergabe ${med?.wirkstoff ?? "?"} (${input.status})`,
    category: "other",
    inverse: { type: "noop", reason: "Medikamentengabe ist 10 J. archivpflichtig — Korrektur via Nachtrag" },
  });

  revalidatePath(`/admin/dokumentation/${vo.klientId}`);
  return { ok: true, data: { id: vg.id } };
}
