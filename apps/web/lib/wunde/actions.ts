"use server";

import { revalidatePath } from "next/cache";
import { addEintrag, seedWundeOnce } from "./store";
import type { WundbeobachtungEintrag } from "./types";

function asNum(v: FormDataEntryValue | null): number | undefined {
  if (v === null) return undefined;
  const t = String(v).trim().replace(",", ".");
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function asStr(v: FormDataEntryValue | null): string | undefined {
  if (v === null) return undefined;
  const t = String(v).trim();
  return t === "" ? undefined : t;
}

export async function dokumentiereWunde(formData: FormData) {
  seedWundeOnce();

  const wundeId = String(formData.get("wundeId") ?? "");
  if (!wundeId) return { ok: false as const, error: "wundeId fehlt" };

  const heute = new Date();
  const datum = (asStr(formData.get("datum")) ?? heute.toISOString().slice(0, 10));
  const zeit = (asStr(formData.get("zeit")) ?? `${String(heute.getHours()).padStart(2, "0")}:${String(heute.getMinutes()).padStart(2, "0")}`);
  const dokumentiertVon = asStr(formData.get("dokumentiertVon")) ?? "person-as-005";

  const wundgrund = formData.getAll("wundgrund").map((v) => String(v)) as WundbeobachtungEintrag["wundgrund"];

  const eintrag: Omit<WundbeobachtungEintrag, "id"> = {
    wundeId,
    datum,
    zeit,
    dokumentiertVon,
    laengeCm: asNum(formData.get("laengeCm")),
    breiteCm: asNum(formData.get("breiteCm")),
    tiefeCm: asNum(formData.get("tiefeCm")),
    wundgrund: wundgrund.length > 0 ? wundgrund : ["granulierend"],
    granulationsAnteilProzent: asNum(formData.get("granulationsAnteilProzent")),
    fibrinAnteilProzent: asNum(formData.get("fibrinAnteilProzent")),
    nekroseAnteilProzent: asNum(formData.get("nekroseAnteilProzent")),
    epithelisationProzent: asNum(formData.get("epithelisationProzent")),
    exsudatMenge: (asStr(formData.get("exsudatMenge")) as WundbeobachtungEintrag["exsudatMenge"]) ?? undefined,
    exsudatArt: (asStr(formData.get("exsudatArt")) as WundbeobachtungEintrag["exsudatArt"]) ?? undefined,
    geruch: (asStr(formData.get("geruch")) as WundbeobachtungEintrag["geruch"]) ?? undefined,
    schmerzNRS: asNum(formData.get("schmerzNRS")),
    spueloesung: (asStr(formData.get("spueloesung")) as WundbeobachtungEintrag["spueloesung"]) ?? undefined,
    primaerverband: (asStr(formData.get("primaerverband")) as WundbeobachtungEintrag["primaerverband"]) ?? undefined,
    sekundaerverband: (asStr(formData.get("sekundaerverband")) as WundbeobachtungEintrag["sekundaerverband"]) ?? undefined,
    fixierung: (asStr(formData.get("fixierung")) as WundbeobachtungEintrag["fixierung"]) ?? undefined,
    wechselIntervallTage: asNum(formData.get("wechselIntervallTage")),
    fotoUrl: asStr(formData.get("fotoUrl")),
    fotoBemerkung: asStr(formData.get("fotoBemerkung")),
    freitext: asStr(formData.get("freitext")),
    tendenz: (asStr(formData.get("tendenz")) as WundbeobachtungEintrag["tendenz"]) ?? undefined,
  };

  const e = addEintrag(eintrag);

  revalidatePath("/pflege/wunde");
  revalidatePath(`/pflege/wunde/${wundeId}`);
  revalidatePath("/klient/akte/wunde");

  return { ok: true as const, id: e.id };
}
