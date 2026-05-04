"use server";

import { revalidatePath } from "next/cache";
import { createZiel, updateZiel, appendZielNotiz, seedZieleOnce, setWunschPK } from "./store";
import type { Lebensziel, ZielKategorie, ZielStatus, WunschPflegekraft } from "./types";

type R<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

export async function setzeZiel(input: {
  klientId: string;
  kategorie: ZielKategorie;
  wunsch: string;
  schritt?: string;
  prioritaet: 1 | 2 | 3;
  bezugsperson?: string;
}): Promise<R<{ id: string }>> {
  seedZieleOnce();
  if (!input.wunsch.trim()) return { ok: false, error: "Bitte einen Wunsch in eigenen Worten formulieren." };
  const z = createZiel(input);
  revalidatePath("/klient");
  revalidatePath(`/dienst/${input.klientId}`);
  return { ok: true, id: z.id };
}

export async function aktualisiereZiel(zielId: string, patch: Partial<Pick<Lebensziel, "wunsch" | "schritt" | "status" | "prioritaet" | "fortschrittPct" | "bezugsperson">>): Promise<R> {
  const z = updateZiel(zielId, patch);
  if (!z) return { ok: false, error: "Ziel nicht gefunden." };
  revalidatePath("/klient");
  revalidatePath(`/dienst/${z.klientId}`);
  return { ok: true };
}

export async function notiereZum(zielId: string, by: string, text: string): Promise<R> {
  if (!text.trim()) return { ok: false, error: "Notiz ist leer." };
  const z = appendZielNotiz(zielId, { by, text });
  if (!z) return { ok: false, error: "Ziel nicht gefunden." };
  revalidatePath("/klient");
  revalidatePath(`/dienst/${z.klientId}`);
  return { ok: true };
}

export async function setzeStatus(zielId: string, status: ZielStatus): Promise<R> {
  return aktualisiereZiel(zielId, { status });
}

export async function speicherWunschPK(input: WunschPflegekraft): Promise<R> {
  setWunschPK(input);
  revalidatePath("/klient");
  return { ok: true };
}
