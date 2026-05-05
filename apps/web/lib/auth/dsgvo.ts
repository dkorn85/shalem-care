"use server";

// DSGVO-Endpoints · Art. 17 (Lösch-Recht) + Art. 20 (Daten-Portabilität).
//
// User kann:
// 1. Eigene Daten als JSON exportieren (alle persoenlichen Tabellen)
// 2. Eigene Daten + Account loeschen (cascade ueber FK)
//
// Architektur:
// - exportiereEigeneDaten() → returns Object mit allen Tabellen-Inhalten
//   die zu auth.uid() gehoeren. User kann das als JSON downloaden.
// - loescheEigenesKonto() → loescht Storage-Files + DB-Rows, dann signOut.
//   Die auth.users-Row wird via DELETE-RPC entfernt (braucht
//   service_role, daher fuer Phase 1 simplifiziert: nur Daten-Tabellen).
//
// Phase 2: echte Löschung von auth.users via Supabase Admin API
// (auth.admin.deleteUser) in einer Edge Function.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { serverClient } from "./client";
import { isNextRedirectError } from "./redirect-error";

const STORAGE_BUCKET = "verifizierungen";

export type EigeneDaten = {
  exportiert_am: string;
  user: {
    id: string;
    email: string | null;
    created_at: string | null;
  };
  profile: unknown;
  user_roles: unknown[];
  verifications: unknown[];
  storage_files: string[];
};

/**
 * Exportiert alle persoenlichen Daten des eingeloggten Users.
 * DSGVO Art. 20 (Recht auf Datenuebertragbarkeit).
 */
export async function exportiereEigeneDaten(): Promise<{ ok: true; daten: EigeneDaten } | { ok: false; error: string }> {
  try {
    const supabase = await serverClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Nicht eingeloggt." };

    const [profileRes, rolesRes, verifsRes, storageRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_roles").select("*").eq("user_id", user.id),
      supabase.from("verifications").select("*").eq("user_id", user.id),
      supabase.storage.from(STORAGE_BUCKET).list(user.id, { limit: 100 }),
    ]);

    const storage_files: string[] = [];
    if (storageRes.data) {
      for (const file of storageRes.data) {
        storage_files.push(`${user.id}/${file.name}`);
      }
    }
    // Auch Subfolder berücksichtigen (rolle/feld.ext)
    if (storageRes.data) {
      for (const item of storageRes.data) {
        if (item.id === null) {
          // ist ein Folder
          const sub = await supabase.storage.from(STORAGE_BUCKET).list(`${user.id}/${item.name}`, { limit: 100 });
          if (sub.data) {
            for (const f of sub.data) storage_files.push(`${user.id}/${item.name}/${f.name}`);
          }
        }
      }
    }

    return {
      ok: true,
      daten: {
        exportiert_am: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email ?? null,
          created_at: user.created_at ?? null,
        },
        profile: profileRes.data ?? null,
        user_roles: rolesRes.data ?? [],
        verifications: verifsRes.data ?? [],
        storage_files,
      },
    };
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    return { ok: false, error: err instanceof Error ? err.message : "Unbekannter Fehler." };
  }
}

/**
 * Löscht alle Daten des eingeloggten Users + signOut + Redirect.
 * DSGVO Art. 17 (Recht auf Vergessen).
 *
 * Phase 1: löscht profile/user_roles/verifications/storage_files.
 * Die auth.users-Row bleibt erhalten (braucht Admin-API). User kann
 * sich theoretisch wieder einloggen, dann ist sein Profil aber leer.
 *
 * Phase 2: Edge-Function mit service_role, die `auth.admin.deleteUser(uid)`
 * aufruft (vollständige Anonymisierung).
 */
export async function loescheEigenesKonto(): Promise<void> {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/?dsgvo_error=nicht_eingeloggt");
  }

  // 1. Storage-Files löschen
  try {
    const folder = user!.id;
    const top = await supabase.storage.from(STORAGE_BUCKET).list(folder, { limit: 100 });
    if (top.data) {
      // Subfolder rekursiv aufsammeln
      const allFiles: string[] = [];
      for (const item of top.data) {
        if (item.id === null) {
          const sub = await supabase.storage.from(STORAGE_BUCKET).list(`${folder}/${item.name}`, { limit: 100 });
          if (sub.data) {
            for (const f of sub.data) allFiles.push(`${folder}/${item.name}/${f.name}`);
          }
        } else {
          allFiles.push(`${folder}/${item.name}`);
        }
      }
      if (allFiles.length > 0) {
        await supabase.storage.from(STORAGE_BUCKET).remove(allFiles);
      }
    }
  } catch {
    // Storage-Loesch-Fehler ignorieren — DB-Loeschung soll trotzdem laufen
  }

  // 2. DB-Tabellen löschen (RLS sorgt automatisch dafür dass nur eigene gehen)
  await supabase.from("verifications").delete().eq("user_id", user!.id);
  await supabase.from("user_roles").delete().eq("user_id", user!.id);
  await supabase.from("profiles").delete().eq("user_id", user!.id);

  // 3. SignOut
  await supabase.auth.signOut();

  revalidatePath("/profil");
  redirect("/?dsgvo_geloescht=1");
}
