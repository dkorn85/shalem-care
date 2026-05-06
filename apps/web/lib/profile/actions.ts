"use server";

import { revalidatePath } from "next/cache";
import { setLocale } from "@/lib/i18n/actions";
import {
  getProfil,
  updateProfil,
  setProfilbild,
  DEFAULT_PROFIL_PREFS,
  type ProfilMenschlich,
  type ProfilPreferenzen,
  type ProfilSprache,
} from "./store";

type R<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

export async function speichereProfilMenschlich(
  personId: string,
  patch: Partial<Pick<ProfilMenschlich, "bio" | "lebensmotto" | "hobbys" | "sprachen" | "lebensziele" | "typischerTag" | "erreichbarkeit">>,
): Promise<R<{ profil: ProfilMenschlich }>> {
  if (!personId) return { ok: false, error: "personId fehlt" };
  const profil = updateProfil(personId, patch);
  revalidatePath("/profil");
  return { ok: true, profil };
}

export async function speicherePreferenzen(
  personId: string,
  patch: Partial<ProfilPreferenzen>,
): Promise<R<{ profil: ProfilMenschlich }>> {
  if (!personId) return { ok: false, error: "personId fehlt" };
  const aktuell = getProfil(personId);
  const profil = updateProfil(personId, {
    preferenzen: { ...(aktuell.preferenzen ?? DEFAULT_PROFIL_PREFS), ...patch },
  });
  // Sprach-Cookie spiegeln, damit der i18n-Layer mit-zieht
  if (patch.sprache) await setLocale(patch.sprache);
  revalidatePath("/profil");
  return { ok: true, profil };
}

export async function ladeProfilbild(personId: string, dataUrl: string): Promise<R<{ profil: ProfilMenschlich }>> {
  if (!personId) return { ok: false, error: "personId fehlt" };
  if (!dataUrl.startsWith("data:image/")) return { ok: false, error: "kein Bild" };
  // Phase 1: in-memory data-URL. Phase 2 → S3-/Hetzner-Upload.
  const profil = setProfilbild(personId, dataUrl);
  revalidatePath("/profil");
  return { ok: true, profil };
}

export async function entferneProfilbild(personId: string): Promise<R<{ profil: ProfilMenschlich }>> {
  const profil = updateProfil(personId, { profilbildUrl: undefined });
  revalidatePath("/profil");
  return { ok: true, profil };
}

export async function fuegeSpracheHinzu(personId: string, sprache: ProfilSprache): Promise<R<{ profil: ProfilMenschlich }>> {
  const aktuell = getProfil(personId);
  const liste = aktuell.sprachen ?? [];
  if (liste.find((x) => x.code === sprache.code)) return { ok: false, error: "Sprache bereits vorhanden" };
  const profil = updateProfil(personId, { sprachen: [...liste, sprache] });
  revalidatePath("/profil");
  return { ok: true, profil };
}

export async function entferneSprache(personId: string, code: string): Promise<R<{ profil: ProfilMenschlich }>> {
  const aktuell = getProfil(personId);
  const profil = updateProfil(personId, { sprachen: (aktuell.sprachen ?? []).filter((x) => x.code !== code) });
  revalidatePath("/profil");
  return { ok: true, profil };
}
