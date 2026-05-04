"use server";

import { revalidatePath } from "next/cache";
import { createAnfrage, updateAnfrageStatus, getAnfrage, seedAnfragenOnce } from "./store";
import { createVerordnung as createMedVerordnung } from "../medikation/store";
import { findMedikament, MEDIKAMENTEN_KATALOG } from "../medikation/katalog";
import { recordAction } from "../undo/undo";
import { postMessage as postChat } from "../chat/store";
import { getKlient } from "../hierarchy/store";
import type {
  AnfrageStatus,
  Dringlichkeit,
  Verordnungswunsch,
  VerordnungsKategorie,
} from "./types";

type Result<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

// ─── Anfrage stellen (Pflege/Klient → Arzt) ────────────────

export async function stelleAnfrage(input: {
  klientId: string;
  anfragendeRolle: "pflege" | "klient" | "lead" | "angehoerig";
  anfragendeId: string;
  anfragendeName: string;
  arztId?: string;
  arztName?: string;
  fachrichtung?: string;
  kategorie: VerordnungsKategorie;
  wunsch: Verordnungswunsch;
  begruendung: string;
  dringlichkeit: Dringlichkeit;
}): Promise<Result<{ anfrageId: string }>> {
  seedAnfragenOnce();
  if (!input.begruendung.trim()) return { ok: false, error: "Begründung erforderlich (für ärztliche Plausibilität)." };

  const a = createAnfrage(input);

  recordAction({
    actor: input.anfragendeId,
    description: `Verordnung angefragt (${input.kategorie})`,
    category: "other",
    inverse: { type: "noop", reason: "Anfragen werden vom Arzt entschieden, nicht zurückgenommen" },
  });

  // In den Schicht-Chat posten
  const klient = getKlient(input.klientId);
  if (klient?.stationId) {
    postChat({
      channelId: klient.stationId,
      type: "system",
      text: `📋 Verordnungsanfrage gestellt · ${klient.name} · ${input.kategorie} · Dringlichkeit ${input.dringlichkeit}`,
      klientId: input.klientId,
    });
  }

  revalidatePath("/dienst");
  revalidatePath("/arzt");
  revalidatePath("/arzt/anfragen");
  revalidatePath(`/dienst/${input.klientId}`);
  return { ok: true, anfrageId: a.id };
}

// ─── Arzt: in Prüfung nehmen ───────────────────────────────

export async function uebernehmeAnfrage(anfrageId: string, arztId: string): Promise<Result> {
  const a = updateAnfrageStatus(anfrageId, "in_pruefung", arztId);
  if (!a) return { ok: false, error: "Anfrage nicht gefunden." };
  revalidatePath("/arzt");
  revalidatePath("/arzt/anfragen");
  return { ok: true };
}

// ─── Arzt: Rückfrage stellen ───────────────────────────────

export async function rueckfrageStellen(input: {
  anfrageId: string;
  arztId: string;
  text: string;
}): Promise<Result> {
  const a = updateAnfrageStatus(input.anfrageId, "rueckfrage", input.arztId, { notizenArzt: input.text });
  if (!a) return { ok: false, error: "Anfrage nicht gefunden." };
  // In den Chat posten zur Information der Pflege
  const klient = getKlient(a.klientId);
  if (klient?.stationId) {
    postChat({
      channelId: klient.stationId,
      type: "system",
      text: `❓ Rückfrage von ${a.arztName ?? "Arzt"} zu ${klient.name}: ${input.text}`,
      klientId: a.klientId,
    });
  }
  revalidatePath("/arzt");
  revalidatePath("/arzt/anfragen");
  revalidatePath("/dienst");
  return { ok: true };
}

// ─── Arzt: ablehnen ────────────────────────────────────────

export async function lehneAnfrageAb(input: {
  anfrageId: string;
  arztId: string;
  begruendung: string;
}): Promise<Result> {
  const a = updateAnfrageStatus(input.anfrageId, "abgelehnt", input.arztId, { notizenArzt: input.begruendung });
  if (!a) return { ok: false, error: "Anfrage nicht gefunden." };
  const klient = getKlient(a.klientId);
  if (klient?.stationId) {
    postChat({
      channelId: klient.stationId,
      type: "system",
      text: `✕ Verordnung abgelehnt · ${klient.name}: ${input.begruendung}`,
      klientId: a.klientId,
    });
  }
  revalidatePath("/arzt");
  revalidatePath("/arzt/anfragen");
  revalidatePath("/dienst");
  return { ok: true };
}

// ─── Arzt: Verordnung ausstellen ───────────────────────────
//
// Bei Medikamenten wird eine Verordnung im medikation/store angelegt
// und ein Demo-eRezept-Code generiert.

export async function stelleVerordnungAus(input: {
  anfrageId: string;
  arztId: string;
  arztName: string;
  // Bei Medikament: konkrete Verordnungs-Parameter
  medikamentId?: string;
  indikation?: string;
  dosierung?: { morgens?: string; mittags?: string; abends?: string; nachts?: string; beiBedarf?: string };
  abDatum?: string;
  bisDatum?: string;
  notiz?: string;
}): Promise<Result<{ verordnungId?: string; eRezeptCode?: string }>> {
  const a = getAnfrage(input.anfrageId);
  if (!a) return { ok: false, error: "Anfrage nicht gefunden." };

  let verordnungId: string | undefined;
  let eRezeptCode: string | undefined;

  // Medikament → Eintrag in medikation/store
  if (a.kategorie === "medikament") {
    const wunsch = a.wunsch as Extract<typeof a.wunsch, { kategorie: "medikament" }>;
    let medId = input.medikamentId ?? wunsch.medikamentId;
    if (!medId && wunsch.wirkstoff) {
      const guess = MEDIKAMENTEN_KATALOG.find((m) =>
        m.wirkstoff.toLowerCase() === wunsch.wirkstoff!.toLowerCase()
        && (!wunsch.staerke || m.staerke === wunsch.staerke),
      );
      medId = guess?.id;
    }
    if (!medId || !findMedikament(medId)) {
      return { ok: false, error: "Medikament konnte nicht aus Katalog zugeordnet werden — bitte aus Liste wählen." };
    }
    const dosFromInput = input.dosierung;
    const dosFromWunsch = wunsch.dosierung
      ? parseDoseString(wunsch.dosierung)
      : undefined;
    const dosierung = dosFromInput ?? dosFromWunsch ?? { morgens: "1" };
    const v = createMedVerordnung({
      klientId: a.klientId,
      medikamentId: medId,
      verordnetVon: input.arztName,
      verordnetAm: new Date().toISOString().slice(0, 10),
      indikation: input.indikation ?? a.begruendung.slice(0, 80),
      dosierung,
      ab: input.abDatum ?? new Date().toISOString().slice(0, 10),
      bis: input.bisDatum,
      notizen: input.notiz,
    });
    verordnungId = v.id;
    // 12-stelliger eRezept-Code (vereinfacht — Phase 2 via gematik TI)
    eRezeptCode = generateERezeptCode();
  } else {
    // Andere Kategorien bekommen nur eine eRezept-Referenz
    eRezeptCode = generateERezeptCode();
  }

  updateAnfrageStatus(input.anfrageId, "ausgestellt", input.arztId, {
    notizenArzt: input.notiz,
    ausgestellteVerordnungId: verordnungId,
    eRezeptCode,
  });

  // Chat-Notification
  const klient = getKlient(a.klientId);
  if (klient?.stationId) {
    postChat({
      channelId: klient.stationId,
      type: "system",
      text: `✓ Verordnung ausgestellt · ${klient.name} · ${a.kategorie}${eRezeptCode ? ` · eRezept ${eRezeptCode}` : ""}`,
      klientId: a.klientId,
    });
  }

  revalidatePath("/arzt");
  revalidatePath("/arzt/anfragen");
  revalidatePath("/dienst");
  revalidatePath(`/dienst/${a.klientId}`);
  revalidatePath(`/admin/dokumentation/${a.klientId}`);
  return { ok: true, verordnungId, eRezeptCode };
}

// ─── Helper ────────────────────────────────────────────────

function parseDoseString(s: string): { morgens?: string; mittags?: string; abends?: string; nachts?: string } | undefined {
  // Erwartet "1-0-1-0" oder "1/2-0-1/2-0"
  const parts = s.split("-").map((p) => p.trim());
  if (parts.length < 3) return undefined;
  return {
    morgens: parts[0] !== "0" ? parts[0] : undefined,
    mittags: parts[1] !== "0" ? parts[1] : undefined,
    abends:  parts[2] !== "0" ? parts[2] : undefined,
    nachts:  parts[3] && parts[3] !== "0" ? parts[3] : undefined,
  };
}

function generateERezeptCode(): string {
  // 16-Stellen-Format gematik (verkürzt, Demo): 4 Blöcke à 4
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () => Array.from({ length: 4 }, () => c[Math.floor(Math.random() * c.length)]).join("");
  return [block(), block(), block(), block()].join("-");
}
