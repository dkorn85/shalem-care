"use server";

import { revalidatePath } from "next/cache";
import {
  pushNachricht, pushFile, pushVital, reagiereAuf,
  type CockpitNachricht, type CockpitFile, type VitalSnapshot,
} from "./store";
import type { Berufsfeld } from "../team-um-klient/store";

type R<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

export async function postNachricht(input: {
  klientId: string;
  vonPersonId: string;
  vonName: string;
  vonBeruf: Berufsfeld;
  text: string;
  anhang?: CockpitNachricht["anhang"];
}): Promise<R<{ nachricht: CockpitNachricht }>> {
  if (!input.text.trim() && !input.anhang) return { ok: false, error: "Leere Nachricht." };
  if (input.text.length > 2000) return { ok: false, error: "Nachricht zu lang (max 2000)." };
  const nachricht: CockpitNachricht = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    klientId: input.klientId,
    vonPersonId: input.vonPersonId,
    vonName: input.vonName,
    vonBeruf: input.vonBeruf,
    text: input.text.trim(),
    zeitstempel: new Date().toISOString(),
    anhang: input.anhang,
  };
  pushNachricht(nachricht);
  revalidatePath(`/station/${input.klientId}`);
  return { ok: true, nachricht };
}

export async function ladeFotoHoch(input: {
  klientId: string;
  vonPersonId: string;
  titel: string;
  typ: CockpitFile["typ"];
  dataUrl: string;
  groesseKb?: number;
  tags?: string[];
}): Promise<R<{ file: CockpitFile }>> {
  if (!input.dataUrl.startsWith("data:image/") && !input.dataUrl.startsWith("/")) {
    return { ok: false, error: "Kein Bild." };
  }
  const file: CockpitFile = {
    id: `f-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    klientId: input.klientId,
    titel: input.titel.trim() || "Unbenannt",
    typ: input.typ,
    dataUrl: input.dataUrl,
    hochgeladenVon: input.vonPersonId,
    hochgeladenAm: new Date().toISOString(),
    groesseKb: input.groesseKb,
    tags: input.tags,
  };
  pushFile(file);
  revalidatePath(`/station/${input.klientId}`);
  return { ok: true, file };
}

export async function recordVital(input: {
  klientId: string;
  vonPersonId: string;
  vonBeruf: Berufsfeld;
  rrSys?: number; rrDia?: number; puls?: number;
  spo2?: number; temperatur?: number; schmerzNrs?: number; blutzucker?: number;
  notiz?: string;
}): Promise<R<{ vital: VitalSnapshot }>> {
  const vital: VitalSnapshot = {
    klientId: input.klientId,
    zeitstempel: new Date().toISOString(),
    vonPersonId: input.vonPersonId,
    vonBeruf: input.vonBeruf,
    rrSys: input.rrSys, rrDia: input.rrDia, puls: input.puls,
    spo2: input.spo2, temperatur: input.temperatur,
    schmerzNrs: input.schmerzNrs, blutzucker: input.blutzucker,
    notiz: input.notiz?.trim(),
  };
  pushVital(vital);
  revalidatePath(`/station/${input.klientId}`);
  return { ok: true, vital };
}

export async function reagiere(klientId: string, nachrichtId: string, emoji: string, vonPersonId: string): Promise<R<{ ok: true }>> {
  const r = reagiereAuf(klientId, nachrichtId, emoji, vonPersonId);
  if (!r) return { ok: false, error: "Nachricht nicht gefunden." };
  revalidatePath(`/station/${klientId}`);
  return { ok: true };
}
