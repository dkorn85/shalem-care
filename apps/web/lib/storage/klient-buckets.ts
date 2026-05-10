// Storage-Helper für die drei Klient-Buckets aus Migration 0013.
//
// Pfad-Konvention: <klient_id>/<dateityp>/<datei>
//
// Nutzung:
//   await ladeUpKlientDokument({
//     bucket: "vollmacht-scans",
//     klientId: "klient-hr",
//     pfad: "vorsorge-2024/notar-schreiber.pdf",
//     file: someFile,
//   });
//
// Fail-soft: ohne Supabase wird ein no-op zurückgegeben + Toast.

import { browserClient } from "@/lib/auth/client";

export type KlientBucket = "vollmacht-scans" | "identity-dokumente" | "klient-akte";

export const BUCKET_LABEL: Record<KlientBucket, string> = {
  "vollmacht-scans":    "Vollmacht-Scans",
  "identity-dokumente": "Identitäts-Dokumente",
  "klient-akte":        "Klient-Akte",
};

export const BUCKET_BESCHREIBUNG: Record<KlientBucket, string> = {
  "vollmacht-scans":    "Notarielle Vorsorgevollmacht, Patientenverfügung, Betreuungs-Beschluss",
  "identity-dokumente": "Personalausweis, Krankenversicherten-Karte, Pflegegrad-Bescheid",
  "klient-akte":        "Wunddoku-Foto, Pflegeplan-PDF, Lebensbuch-Audio · freie Anhänge",
};

export const BUCKET_GROESSE_MB: Record<KlientBucket, number> = {
  "vollmacht-scans":    20,
  "identity-dokumente": 10,
  "klient-akte":        50,
};

export type KlientDatei = {
  pfad:          string;        // ohne klient-Prefix · z.B. "vorsorge-2024/notar.pdf"
  groesseBytes?: number;
  geaendertAm?:  string;
  contentType?:  string;
};

function bauePfad(klientId: string, pfad: string): string {
  // Erste Path-Komponente muss klient_id sein (RLS prüft das via storage_klient_id_from_path)
  return `${klientId}/${pfad.replace(/^\/+/, "")}`;
}

/** Lädt eine Datei in einen Klient-Bucket hoch. */
export async function uploadKlientDokument(input: {
  bucket:    KlientBucket;
  klientId:  string;
  pfad:      string;
  file:      File | Blob;
  upsert?:   boolean;
}): Promise<{ ok: true; pfad: string } | { ok: false; error: string }> {
  try {
    const client = browserClient();
    const fullPath = bauePfad(input.klientId, input.pfad);
    const { error } = await client.storage
      .from(input.bucket)
      .upload(fullPath, input.file, {
        upsert: input.upsert ?? false,
        cacheControl: "3600",
      });
    if (error) return { ok: false, error: error.message };
    return { ok: true, pfad: fullPath };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unbekannter Fehler" };
  }
}

/** Listet Dateien im Klient-Pfad eines Buckets. */
export async function listKlientDokumente(input: {
  bucket:   KlientBucket;
  klientId: string;
  unter?:   string;     // optional: Sub-Ordner z.B. "vorsorge-2024"
}): Promise<KlientDatei[]> {
  try {
    const client = browserClient();
    const ordner = input.unter
      ? `${input.klientId}/${input.unter}`
      : input.klientId;
    const { data, error } = await client.storage
      .from(input.bucket)
      .list(ordner, { limit: 100 });
    if (error || !data) return [];
    return data.map((d) => ({
      pfad:          d.name,
      groesseBytes:  d.metadata?.size,
      geaendertAm:   d.updated_at ?? d.created_at ?? undefined,
      contentType:   d.metadata?.mimetype,
    }));
  } catch {
    return [];
  }
}

/** Erzeugt einen Signed URL · Standard: 60 min gültig. */
export async function signedKlientUrl(input: {
  bucket:   KlientBucket;
  fullPath: string;       // bereits inkl. klient_id-Prefix
  gueltigSekunden?: number;
}): Promise<string | null> {
  try {
    const client = browserClient();
    const { data, error } = await client.storage
      .from(input.bucket)
      .createSignedUrl(input.fullPath, input.gueltigSekunden ?? 3600);
    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

/** Löscht eine Datei (RLS-checks greifen serverseitig). */
export async function loescheKlientDokument(input: {
  bucket:   KlientBucket;
  fullPath: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = browserClient();
    const { error } = await client.storage
      .from(input.bucket)
      .remove([input.fullPath]);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unbekannter Fehler" };
  }
}
