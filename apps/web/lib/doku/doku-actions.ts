"use server";

import { revalidatePath } from "next/cache";
import { createDoku, signDoku, seedDokuOnce } from "./doku-store";
import { recordAction } from "../undo/undo";
import { structureObservation } from "../ai/doku-ai";
import { getKlient } from "../hierarchy/store";
import { postMessage as postChatMessage, seedChatOnce } from "../chat/store";
import type { BerufsTyp, SISThemenfeld, RisikoTyp } from "./types";

type CreateResult = { ok: true; entryId: string } | { ok: false; error: string };
type AIResult = { ok: true; data: Awaited<ReturnType<typeof structureObservation>> } | { ok: false; error: string };

// ─── KI-Aufruf: rohe Eingabe → strukturierter Vorschlag ──

export async function aiStructureObservation(input: {
  raw: string;
  klientId: string;
  beruf?: BerufsTyp;
}): Promise<AIResult> {
  if (!input.raw.trim()) return { ok: false, error: "Eingabe leer." };
  if (input.raw.length > 2000) return { ok: false, error: "Eingabe zu lang (max. 2000 Zeichen)." };

  const klient = getKlient(input.klientId);
  if (!klient) return { ok: false, error: "Klient nicht gefunden." };

  try {
    const result = await structureObservation(input.raw, input.beruf ?? "pflege", {
      name: klient.name,
      pflegegrad: klient.pflegegrad,
    });
    return { ok: true, data: result };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "KI-Aufruf fehlgeschlagen.",
    };
  }
}

// ─── Doku-Eintrag persistieren ─────────────────────────────

export async function saveDokuEntry(input: {
  klientId: string;
  authorId: string;
  beruf: BerufsTyp;
  themenfeld?: SISThemenfeld;
  inhaltKurz: string;
  inhaltLang: string;
  risiken: RisikoTyp[];
  vorgeschlageneMassnahmen: string[];
  abweichungVomNormalverlauf: boolean;
  aiAssisted: boolean;
  aiSuggestionRaw?: string;
  aiProvider?: string;
  signNow?: boolean;
}): Promise<CreateResult> {
  seedDokuOnce();
  if (!input.inhaltLang.trim()) return { ok: false, error: "Doku-Inhalt darf nicht leer sein." };
  if (!input.inhaltKurz.trim()) return { ok: false, error: "Kurzbezeichnung darf nicht leer sein." };

  const entry = createDoku({
    klientId: input.klientId,
    authorId: input.authorId,
    beruf: input.beruf,
    themenfeld: input.themenfeld,
    risiken: input.risiken,
    inhaltKurz: input.inhaltKurz,
    inhaltLang: input.inhaltLang,
    vorgeschlageneMassnahmen: input.vorgeschlageneMassnahmen,
    abweichungVomNormalverlauf: input.abweichungVomNormalverlauf,
    aiAssisted: input.aiAssisted,
    aiSuggestionRaw: input.aiSuggestionRaw,
    aiProvider: input.aiProvider,
  });

  if (input.signNow) {
    signDoku(entry.id, input.authorId);
  }

  // Schicht-Chat: Doku-Event posten — Stationskanal aus Klient ableiten
  try {
    seedChatOnce();
    const klient = getKlient(input.klientId);
    if (klient?.stationId) {
      postChatMessage({
        channelId: klient.stationId,
        type: "doku_event",
        text: `Neuer Doku-Eintrag · ${klient.name} · ${input.inhaltKurz}${input.abweichungVomNormalverlauf ? " ⚠ Abweichung" : ""}`,
        klientId: klient.id,
        dokuId: entry.id,
      });
    }
  } catch {
    // Chat ist nicht-kritisch — Doku-Speicherung niemals blockieren.
  }

  recordAction({
    actor: input.authorId,
    description: `Doku-Eintrag${input.aiAssisted ? " (KI-unterstützt)" : ""} erstellt`,
    category: "other",
    inverse: { type: "noop", reason: "Pflegedoku ist 10 Jahre aufzubewahren (§ 630f BGB) — Korrektur via Nachtrag" },
  });

  revalidatePath(`/admin/dokumentation/${input.klientId}`);
  revalidatePath("/admin/dokumentation");
  revalidatePath("/klient");

  return { ok: true, entryId: entry.id };
}

// ─── Doku signieren ─────────────────────────────────────────

export async function signDokuEntry(entryId: string, signedBy: string) {
  signDoku(entryId, signedBy);
  revalidatePath("/admin/dokumentation", "layout");
  return { ok: true };
}
