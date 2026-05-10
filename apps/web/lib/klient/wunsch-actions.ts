"use server";

import { revalidatePath } from "next/cache";
import { setzeWunsch, loescheWunsch, type WunschEintrag, type WunschQuelle } from "./wunsch-store";

export type WunschActionResult =
  | { ok: true; message: string; eintrag?: WunschEintrag }
  | { ok: false; error: string };

export async function setzeWunschAction(input: {
  klientId:     string;
  terminId:     string;
  wunsch:       string;
  geaendertVon: WunschQuelle;
}): Promise<WunschActionResult> {
  const r = setzeWunsch(input);
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath("/klient/woche");
  return { ok: true, message: "Wunsch gespeichert · Verlauf festgehalten.", eintrag: r.eintrag };
}

export async function loescheWunschAction(input: {
  klientId:     string;
  terminId:     string;
  geaendertVon?: WunschQuelle;
}): Promise<WunschActionResult> {
  const ok = loescheWunsch(input.klientId, input.terminId, input.geaendertVon ?? "selbst");
  if (!ok) return { ok: false, error: "Kein eigener Wunsch zu diesem Termin gefunden." };
  revalidatePath("/klient/woche");
  return { ok: true, message: "Wunsch entfernt · im Verlauf dokumentiert." };
}
