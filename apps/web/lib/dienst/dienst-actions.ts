"use server";

import { listKlientenAtStation, getKlient } from "../hierarchy/store";
import { listDokuFor, seedDokuOnce } from "../doku/doku-store";
import { listAktiveVerordnungenFor, listVergabenFor, seedMedikationOnce } from "../medikation/store";
import { findMedikament } from "../medikation/katalog";
import { generateSchichtBriefing, type SchichtBriefing } from "../ai/schichtbriefing";
import { generateTherapieEmpfehlung, type TherapieEmpfehlung } from "../ai/therapie-vorschlaege";
import { getShiftType } from "../fhir";
import type { RisikoTyp } from "../doku/types";
import { store } from "../swap-store";
import { findActiveShift } from "./active-shift";

const SCHICHT_LABEL: Record<string, string> = {
  early: "Frühschicht",
  late:  "Spätschicht",
  night: "Nachtschicht",
  intermediate: "Zwischendienst",
};

export async function generateBriefingForStation(stationId: string, personId: string): Promise<SchichtBriefing> {
  seedDokuOnce();
  seedMedikationOnce();

  const klienten = listKlientenAtStation(stationId);
  const sinceISO = new Date(Date.now() - 24 * 3_600_000).toISOString();

  const klientenContext = klienten.map((k) => {
    const doku = listDokuFor(k.id);
    const aktiveRisiken: RisikoTyp[] = [];
    for (const e of doku.slice(0, 5)) {
      for (const r of e.risiken) if (!aktiveRisiken.includes(r)) aktiveRisiken.push(r);
    }
    return {
      klient: k,
      letzteDoku: doku.slice(0, 3),
      aktiveRisiken,
      aktiveVerordnungen: listAktiveVerordnungenFor(k.id),
      letzteVergaben: listVergabenFor(k.id, sinceISO),
    };
  });

  const active = await findActiveShift(personId);
  const schichtTyp = active ? (SCHICHT_LABEL[getShiftType(active.slot) ?? "early"] ?? "Schicht") : "Schicht";

  const station = klienten[0] ? `Station ${stationId}` : "Station";
  return generateSchichtBriefing({
    schichtTyp,
    station,
    klienten: klientenContext,
  });
}

export async function generateTherapieFor(klientId: string): Promise<TherapieEmpfehlung | null> {
  seedDokuOnce();
  seedMedikationOnce();
  const klient = getKlient(klientId);
  if (!klient) return null;

  const doku = listDokuFor(klientId);
  const risiken: RisikoTyp[] = [];
  for (const e of doku.slice(0, 5)) {
    for (const r of e.risiken) if (!risiken.includes(r)) risiken.push(r);
  }
  const meds = listAktiveVerordnungenFor(klientId).map((v) => {
    const m = findMedikament(v.medikamentId);
    return m ? `${m.wirkstoff} (${v.indikation})` : null;
  }).filter((x): x is string => !!x);

  return generateTherapieEmpfehlung({
    klient,
    aktiveRisiken: risiken,
    klientNotizen: klient.notes,
    medikationsHinweise: meds,
  });
}

export async function getActiveShiftSnapshot(personId: string) {
  const active = await findActiveShift(personId);
  if (!active) return null;
  // Slot ist FHIR — minimal in serializable Form
  return {
    slotId: active.slot.id,
    start: active.slot.start,
    end: active.slot.end,
    shiftType: getShiftType(active.slot),
    progressPct: active.progressPct,
    remainingMinutes: active.remainingMinutes,
    startsInMinutes: active.startsInMinutes,
    hasStarted: active.hasStarted,
  };
}

// (Re-Exports von Server-Actions sind in "use server"-Dateien nicht
// zulässig — Bridges sollten direkt aus den jeweiligen Modulen
// importiert werden: lib/doku/doku-actions, lib/medikation/actions.)

// Wrapper, damit der Klient (Browser) keine Person-Liste laden muss
export async function listPeopleAtStationAction(stationId: string) {
  const all = await store.listPeople();
  // Wir können kein hierarchy/store hier nehmen weil dort kein async; einfach alle Personen
  // zurückgeben — die Stationsansicht filtert clientseitig nicht großartig.
  return all.map((p) => ({ id: p.id, name: p.name, initials: p.initials }));
}
