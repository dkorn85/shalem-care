"use server";

import { revalidatePath } from "next/cache";
import { listMessages, postMessage, reactToMessage as storeReact, markRead, seedChatOnce } from "./store";
import { suggestForChannel } from "../ai/chat-coach";
import { listDokuFor } from "../doku/doku-store";
import { listKlientenAtStation } from "../hierarchy/store";
import { listVergabenFor } from "../medikation/store";
import { findMedikament } from "../medikation/katalog";
import type { ChatMessage } from "./types";

type Result<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

export async function sendChatMessage(input: {
  channelId: string;
  authorId: string;
  authorName: string;
  text: string;
  klientId?: string;
}): Promise<Result<{ message: ChatMessage }>> {
  seedChatOnce();
  if (!input.text.trim()) return { ok: false, error: "Leerer Text." };
  const m = postMessage({
    channelId: input.channelId,
    authorId: input.authorId,
    authorName: input.authorName,
    type: "user",
    text: input.text,
    klientId: input.klientId,
  });
  revalidatePath("/dienst");
  revalidatePath(`/dienst/${input.klientId}`);
  return { ok: true, message: m };
}

export async function reactToMessage(messageId: string, personId: string, emoji: string): Promise<Result> {
  const m = storeReact(messageId, personId, emoji);
  if (!m) return { ok: false, error: "Nachricht nicht gefunden." };
  revalidatePath("/dienst");
  return { ok: true };
}

export async function markChannelRead(channelId: string, personId: string): Promise<Result> {
  markRead(channelId, personId);
  return { ok: true };
}

export async function fetchMessages(channelId: string, sinceISO?: string): Promise<ChatMessage[]> {
  seedChatOnce();
  return listMessages(channelId, sinceISO);
}

// ─── KI-Coach Vorschlag in Chat ───────────────────────────

export async function generateCoachSuggestion(stationId: string, stationName: string): Promise<Result<{ message: ChatMessage }>> {
  seedChatOnce();
  const klienten = listKlientenAtStation(stationId);
  const dokuKurz = klienten
    .flatMap((k) => listDokuFor(k.id).slice(0, 2))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  const sinceISO = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const ereignisse: string[] = [];
  for (const k of klienten) {
    const vergaben = listVergabenFor(k.id, sinceISO);
    const verweigert = vergaben.filter((v) => v.status === "verweigert");
    if (verweigert.length > 0) {
      const med = findMedikament(verweigert[0].verordnungId.replace(/^vo-/, "med-"));
      ereignisse.push(`${k.name}: ${verweigert.length}× Vergabe verweigert${med ? ` (${med.wirkstoff})` : ""}`);
    }
    const gegeben = vergaben.filter((v) => v.status === "gegeben").length;
    const total = vergaben.length;
    if (total >= 3 && gegeben / total < 0.7) {
      ereignisse.push(`${k.name}: Adhärenz ${Math.round((gegeben / total) * 100)} %`);
    }
  }

  const sugg = await suggestForChannel({ stationName, dokuKurz, ereignisse });

  const m = postMessage({
    channelId: stationId,
    type: "ai_suggestion",
    text: sugg.text,
    klientId: sugg.klientId,
    aiProvider: sugg.meta.provider,
    aiSeverity: sugg.severity,
  });

  revalidatePath("/dienst");
  return { ok: true, message: m };
}

// ─── Doku-Event automatisch in Chat posten ────────────────
// (wird von doku-actions aufgerufen, sobald jemand was speichert)

export async function postDokuEvent(input: {
  channelId: string;
  klientId: string;
  klientName: string;
  inhaltKurz: string;
  abweichung: boolean;
  dokuId: string;
}): Promise<Result> {
  postMessage({
    channelId: input.channelId,
    type: "doku_event",
    text: `Neuer Doku-Eintrag · ${input.klientName} · ${input.inhaltKurz}${input.abweichung ? " ⚠ Abweichung" : ""}`,
    klientId: input.klientId,
    dokuId: input.dokuId,
  });
  return { ok: true };
}
