"use server";

// Verifikations-Upload-Pipeline
//
// Reichweite: ein authentifizierter User reicht via /registrieren/verifizieren
// seine Berufsnachweise ein. Pro Datei-Feld:
// 1. Upload nach Storage-Bucket "verifizierungen" mit Pfad
//    `<user_id>/<rolle>/<feldname>.<ext>`
// 2. URL-Pfad in der `verifications`-Tabelle speichern (status = "eingereicht")
//
// RLS sorgt dafür dass User nur in eigenen Folder uploaden können.
// Pruefer-Seite (Service-Role) liest später, setzt status auf
// verifiziert | abgelehnt.

import { redirect } from "next/navigation";
import { serverClient } from "./client";
import { ROLLEN, type RegistrierRolle } from "./rollen";
import { isNextRedirectError } from "./redirect-error";

const BUCKET = "verifizierungen";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

type UploadResult =
  | { ok: true; verificationId: string }
  | { ok: false; error: string };

/**
 * Verarbeitet das Verifikations-FormData:
 * 1. Authentifizierung prüfen
 * 2. Pflicht-Felder validieren
 * 3. Datei-Felder hochladen
 * 4. Verification-Row mit allen Daten einfügen
 *
 * Wird aufgerufen aus dem Form-Submit auf /registrieren/verifizieren.
 */
export async function reicheVerifikationEin(formData: FormData): Promise<UploadResult> {
  try {
    const supabase = await serverClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Nicht eingeloggt — bitte zuerst /registrieren oder /anmelden." };
    }

    const rolle = formData.get("rolle") as RegistrierRolle;
    if (!rolle || !ROLLEN[rolle]) {
      return { ok: false, error: "Ungültige Rolle." };
    }

    const rolleInfo = ROLLEN[rolle];

    // Pflicht-Felder prüfen
    for (const feld of rolleInfo.verifikation) {
      if (!feld.pflicht) continue;
      const wert = formData.get(feld.key);
      if (!wert || (typeof wert === "string" && wert.trim().length === 0)) {
        return { ok: false, error: `Pflicht-Feld fehlt: ${feld.label}` };
      }
      if (feld.typ === "datei" && !(wert instanceof File && wert.size > 0)) {
        return { ok: false, error: `Datei fehlt: ${feld.label}` };
      }
    }

    // Datei-Uploads sammeln
    const dateiUploads: Record<string, string> = {};
    for (const feld of rolleInfo.verifikation) {
      if (feld.typ !== "datei") continue;
      const file = formData.get(feld.key);
      if (!(file instanceof File) || file.size === 0) continue;

      // Validierung
      if (file.size > MAX_SIZE) {
        return { ok: false, error: `${feld.label}: Datei zu groß (max. 10 MB).` };
      }
      if (!ALLOWED_MIME.includes(file.type)) {
        return { ok: false, error: `${feld.label}: nur JPG, PNG, WebP oder PDF erlaubt.` };
      }

      // Storage-Pfad: <user_id>/<rolle>/<feldname>.<ext>
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const storagePath = `${user.id}/${rolle}/${feld.key}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { upsert: true, contentType: file.type });

      if (uploadErr) {
        return { ok: false, error: `Upload fehlgeschlagen (${feld.label}): ${uploadErr.message}` };
      }
      dateiUploads[feld.key] = storagePath;
    }

    // Text-Felder sammeln
    const textFelder: Record<string, string> = {};
    for (const feld of rolleInfo.verifikation) {
      if (feld.typ === "datei") continue;
      const wert = formData.get(feld.key);
      if (typeof wert === "string" && wert.trim().length > 0) {
        textFelder[feld.key] = wert.trim();
      }
    }

    // Insert in verifications
    // Bekannte Spalten direkt schreiben, der Rest landet in zusatz JSONB
    const knownSpalten = new Set([
      "berufsurkunde_url", "tarifgruppe", "ik_arbeitgeber",
      "lanr", "kv_bezirk", "approbations_url",
      "therapeuten_ausweis_url", "pflegekassen_nr",
    ]);

    const insertRow: Record<string, unknown> = {
      user_id: user.id,
      rolle,
      status: "eingereicht",
    };
    const zusatz: Record<string, string> = {};

    for (const [key, val] of Object.entries({ ...dateiUploads, ...textFelder })) {
      if (knownSpalten.has(key)) {
        insertRow[key] = val;
      } else {
        zusatz[key] = val;
      }
    }
    if (Object.keys(zusatz).length > 0) {
      insertRow.zusatz = zusatz;
    }

    const { data: ver, error: insertErr } = await supabase
      .from("verifications")
      .insert(insertRow)
      .select("id")
      .single();

    if (insertErr) {
      return { ok: false, error: `DB-Insert fehlgeschlagen: ${insertErr.message}` };
    }

    // Profil aktualisieren mit haupt_rolle, falls noch nicht gesetzt
    await supabase
      .from("profiles")
      .update({ haupt_rolle: rolle })
      .eq("user_id", user.id);

    // Rolle in user_roles eintragen (idempotent via upsert)
    await supabase
      .from("user_roles")
      .upsert({ user_id: user.id, rolle }, { onConflict: "user_id,rolle" });

    return { ok: true, verificationId: ver.id };
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    return { ok: false, error: err instanceof Error ? err.message : "Unbekannter Fehler." };
  }
}

/**
 * Form-Action-Wrapper für use mit <form action={...}>.
 * Bei Erfolg redirect zur Bestaetigungs-Page, bei Fehler mit ?error=
 * zurueck zur Wizard-Page.
 */
export async function verifikationFormAction(formData: FormData) {
  "use server";
  const rolle = String(formData.get("rolle") ?? "");
  const result = await reicheVerifikationEin(formData);
  if (result.ok) {
    redirect(`/registrieren/verifizieren/eingereicht?rolle=${encodeURIComponent(rolle)}`);
  }
  redirect(`/registrieren/verifizieren?rolle=${encodeURIComponent(rolle)}&error=${encodeURIComponent(result.error)}`);
}
