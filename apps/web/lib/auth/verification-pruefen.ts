"use server";

// Verifikations-Pruefung (Pruefer-Server-Actions).
//
// Aktuell: jeder eingeloggte User kann seine eigene Verifikation lesen
// (RLS). Pruefer-Aktionen (Status auf "verifiziert" oder "abgelehnt"
// setzen) brauchen eigentlich service_role. Phase 1 vereinfacht: jeder
// authentifizierte User darf den Status setzen, damit der Demo-Flow
// funktioniert. Phase 2 ersetzen mit:
// - eigenem `pruefer`-Role-Check
// - oder Edge-Function mit service_role-Key

import { revalidatePath } from "next/cache";
import { serverClient } from "./client";

export async function setVerifikationStatus(input: {
  verificationId: string;
  status: "in_pruefung" | "verifiziert" | "abgelehnt";
  ablehnungsGrund?: string;
}) {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Nicht eingeloggt." };
  }

  const update: Record<string, unknown> = {
    status: input.status,
    geprueft_am: new Date().toISOString(),
    geprueft_von: user.id,
  };
  if (input.status === "abgelehnt" && input.ablehnungsGrund) {
    update.ablehnungs_grund = input.ablehnungsGrund;
  }

  const { error } = await supabase
    .from("verifications")
    .update(update)
    .eq("id", input.verificationId);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/admin/verifikationen");
  return { ok: true as const };
}

/**
 * Generiert eine signierte URL für eine hochgeladene Verifikations-Datei,
 * gültig 5 Minuten. Pruefer benutzt diese URL um die Datei einzusehen.
 */
export async function signedUrlFor(storagePath: string): Promise<string | null> {
  const supabase = await serverClient();
  const { data, error } = await supabase
    .storage
    .from("verifizierungen")
    .createSignedUrl(storagePath, 60 * 5);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
