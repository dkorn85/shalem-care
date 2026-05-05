"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { serverClient } from "@/lib/auth/client";
import { isNextRedirectError } from "@/lib/auth/redirect-error";
import { parseMentions, parseHashtags } from "./store";

const BUCKET = "messenger";
const MAX_SIZE = 25 * 1024 * 1024;

type SendResult = { ok: true; messageId: string } | { ok: false; error: string };

export async function sendeMessage(formData: FormData): Promise<SendResult> {
  try {
    const supabase = await serverClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Nicht eingeloggt." };

    const body = String(formData.get("body") ?? "").trim();
    if (!body) return { ok: false, error: "Nachricht darf nicht leer sein." };
    if (body.length > 4000) return { ok: false, error: "Max. 4000 Zeichen." };

    const klientId = formData.get("klient_id");
    const klient = typeof klientId === "string" && klientId.trim().length > 0 ? klientId.trim() : null;

    // Auto-Parse Mentions + Hashtags aus dem Body
    const mentions = parseMentions(body);
    const hashtags = parseHashtags(body);

    // Optional: Datei-Anhang
    let attachmentUrl: string | null = null;
    let attachmentName: string | null = null;
    const file = formData.get("attachment");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_SIZE) {
        return { ok: false, error: "Anhang max. 25 MB." };
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${user.id}/${Date.now()}-${cryptoRandom(8)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type });
      if (uploadErr) return { ok: false, error: `Upload fehlgeschlagen: ${uploadErr.message}` };
      attachmentUrl = path;
      attachmentName = file.name;
    }

    // Optional: Voicemail
    let voicemailUrl: string | null = null;
    let voicemailDauer: number | null = null;
    const voicemail = formData.get("voicemail");
    const voicemailDauerStr = formData.get("voicemail_dauer_sec");
    if (voicemail instanceof File && voicemail.size > 0) {
      if (voicemail.size > MAX_SIZE) return { ok: false, error: "Voicemail max. 25 MB." };
      const ext = voicemail.name.split(".").pop()?.toLowerCase() ?? "webm";
      const path = `${user.id}/voice-${Date.now()}-${cryptoRandom(6)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, voicemail, { contentType: voicemail.type || "audio/webm" });
      if (uploadErr) return { ok: false, error: `Voicemail-Upload fehlgeschlagen: ${uploadErr.message}` };
      voicemailUrl = path;
      const dauer = Number(voicemailDauerStr);
      if (Number.isFinite(dauer) && dauer > 0) voicemailDauer = Math.round(dauer);
    }

    const { data: msg, error: insertErr } = await supabase
      .from("messages")
      .insert({
        von_user_id: user.id,
        klient_id: klient,
        body,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        voicemail_url: voicemailUrl,
        voicemail_dauer_sec: voicemailDauer,
        mentions,
        hashtags,
      })
      .select("id")
      .single();

    if (insertErr) return { ok: false, error: insertErr.message };

    revalidatePath("/messenger");
    if (klient) revalidatePath(`/klient`);
    return { ok: true, messageId: msg.id };
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    return { ok: false, error: err instanceof Error ? err.message : "Unbekannter Fehler." };
  }
}

export async function sendeMessageFormAction(formData: FormData) {
  const r = await sendeMessage(formData);
  if (r.ok) {
    redirect(`/messenger?neu=${r.messageId}`);
  }
  redirect(`/messenger?error=${encodeURIComponent(r.error)}`);
}

export async function loescheMessage(messageId: string) {
  const supabase = await serverClient();
  await supabase.from("messages").delete().eq("id", messageId);
  revalidatePath("/messenger");
}

function cryptoRandom(len: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, len);
}
