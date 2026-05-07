// HKP-Verordnungs-Store (Phase 1 in-memory).
// Pipeline: Arzt erstellt → KIM-Versand an Pflegekasse → Kasse genehmigt
//   → Pflege erbringt → Abrechnung.
// Phase 2: Supabase-Migration + echter gematik-Konnektor.

import { HKP_BASIS } from "@/lib/pvs/abrechnung/types";
import {
  pruefePlausibilitaet,
  type Verordnung,
  type VerordnungsStatus,
} from "./types";

type State = { verordnungen: Verordnung[]; seeded: boolean };
type GlobalShape = { __shalemHkp?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemHkp) g.__shalemHkp = { verordnungen: [], seeded: false };
const s = g.__shalemHkp!;

export function listVerordnungen(): Verordnung[] {
  return [...s.verordnungen].sort(
    (a, b) => b.datumAusstellung.localeCompare(a.datumAusstellung),
  );
}

export function getVerordnung(id: string): Verordnung | null {
  return s.verordnungen.find((v) => v.id === id) ?? null;
}

export function listVerordnungenFuerKlient(klientId: string): Verordnung[] {
  return s.verordnungen.filter((v) => v.klientId === klientId);
}

export function listVerordnungenFuerStatus(status: VerordnungsStatus[]): Verordnung[] {
  return s.verordnungen.filter((v) => status.includes(v.status));
}

export function erstelleVerordnung(v: Omit<Verordnung, "id" | "status">): {
  ok: boolean;
  verordnung?: Verordnung;
  fehler?: string[];
} {
  const verordnung: Verordnung = {
    ...v,
    id: `vo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "entwurf",
  };
  const check = pruefePlausibilitaet(verordnung);
  if (!check.ok) return { ok: false, fehler: check.fehler };
  s.verordnungen.push(verordnung);
  return { ok: true, verordnung };
}

export function setzeStatus(
  id: string,
  status: VerordnungsStatus,
  zusatz?: { erezeptToken?: string; kimMessageId?: string },
): Verordnung | null {
  const v = s.verordnungen.find((x) => x.id === id);
  if (!v) return null;
  v.status = status;
  if (zusatz?.erezeptToken) v.erezeptToken = zusatz.erezeptToken;
  if (zusatz?.kimMessageId) v.kimMessageId = zusatz.kimMessageId;
  return v;
}

export const STATUS_LABEL: Record<VerordnungsStatus, string> = {
  entwurf: "Entwurf",
  ausgestellt: "Ausgestellt · signiert",
  "kim-versendet": "KIM versendet",
  genehmigt: "Genehmigt · Kasse",
  abgelehnt: "Abgelehnt",
  "in-erbringung": "In Erbringung · Pflege",
  abgeschlossen: "Abgeschlossen",
  abgerechnet: "Abgerechnet",
};

export const STATUS_FARBE: Record<VerordnungsStatus, string> = {
  entwurf: "var(--fg-mute)",
  ausgestellt: "var(--vibe-team)",
  "kim-versendet": "var(--accent)",
  genehmigt: "var(--vibe-approval)",
  abgelehnt: "var(--mon)",
  "in-erbringung": "var(--sun)",
  abgeschlossen: "var(--sat)",
  abgerechnet: "var(--vibe-approval)",
};

/** Ordered Pipeline-Schritte für UI-Visualisierung. */
export const PIPELINE: { status: VerordnungsStatus; akteur: string; emoji: string }[] = [
  { status: "ausgestellt", akteur: "Arzt:in", emoji: "👩‍⚕️" },
  { status: "kim-versendet", akteur: "KIM-Mail", emoji: "📨" },
  { status: "genehmigt", akteur: "Krankenkasse", emoji: "💶" },
  { status: "in-erbringung", akteur: "Pflege", emoji: "🩺" },
  { status: "abgerechnet", akteur: "Abrechnung", emoji: "📊" },
];

export function pipelineFortschritt(status: VerordnungsStatus): number {
  const map: Record<VerordnungsStatus, number> = {
    entwurf: 0,
    ausgestellt: 1,
    "kim-versendet": 2,
    genehmigt: 3,
    abgelehnt: -1,
    "in-erbringung": 4,
    abgeschlossen: 4,
    abgerechnet: 5,
  };
  return map[status] ?? 0;
}

// ─── Demo-Seed ──────────────────────────────────────────────────

export function seedHkpOnce() {
  if (s.seeded) return;
  s.seeded = true;

  const heute = new Date();
  const vorTagen = (n: number) => {
    const d = new Date(heute);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const inTagen = (n: number) => {
    const d = new Date(heute);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  const wundversorgung = HKP_BASIS.find((h) => h.ziffer === "01a")!;
  const blutdruck = HKP_BASIS.find((h) => h.ziffer === "26")!;
  const medi = HKP_BASIS.find((h) => h.ziffer === "08")!;

  // V1: Helga · Wundversorgung · genehmigt · in Erbringung
  s.verordnungen.push({
    id: "vo-hr-wundversorgung",
    typ: "hkp",
    ausstellerId: "person-arzt-001",
    ausstellerLanr: "999999900",
    ausstellerBsnr: "999999901",
    klientId: "klient-hr",
    versichertenStatus: {
      krankenkasse: "AOK Rheinland/Hamburg",
      versichertenNr: "X123456789",
      iknr: "108310400",
    },
    leistung: {
      art: "haeusliche-krankenpflege",
      code: wundversorgung.ziffer,
      bezeichnung: wundversorgung.bezeichnung,
      haeufigkeit: wundversorgung.haeufigkeit,
      dauerWochen: 4,
    },
    diagnosen: ["L89.13", "E11.9"], // Dekubitus + Diabetes
    datumAusstellung: vorTagen(7),
    datumGueltigBis: inTagen(21),
    begruendung:
      "Wundversorgung Sakraldekubitus Kategorie 2. Klientin kann den Verbandwechsel nicht selbst durchführen. Hausarzt-Verordnung liegt vor.",
    status: "in-erbringung",
    kimMessageId: "kim-2026050700123",
  });

  // V2: Helga · Blutdruck-Messung · KIM versendet, wartet auf Genehmigung
  s.verordnungen.push({
    id: "vo-hr-blutdruck",
    typ: "hkp",
    ausstellerId: "person-arzt-001",
    ausstellerLanr: "999999900",
    ausstellerBsnr: "999999901",
    klientId: "klient-hr",
    versichertenStatus: {
      krankenkasse: "AOK Rheinland/Hamburg",
      versichertenNr: "X123456789",
      iknr: "108310400",
    },
    leistung: {
      art: "haeusliche-krankenpflege",
      code: blutdruck.ziffer,
      bezeichnung: blutdruck.bezeichnung,
      haeufigkeit: blutdruck.haeufigkeit,
      dauerWochen: 12,
    },
    diagnosen: ["I10.0"],
    datumAusstellung: vorTagen(2),
    datumGueltigBis: inTagen(82),
    begruendung:
      "Hypertonie-Verlauf nach Therapie-Anpassung. Tägliche RR-Dokumentation für 12 Wochen.",
    status: "kim-versendet",
    kimMessageId: "kim-2026050500087",
  });

  // V3: Wilhelm · Medikamentengabe · entwurf
  s.verordnungen.push({
    id: "vo-wb-medi",
    typ: "hkp",
    ausstellerId: "person-arzt-001",
    klientId: "klient-wb",
    leistung: {
      art: "haeusliche-krankenpflege",
      code: medi.ziffer,
      bezeichnung: medi.bezeichnung,
      haeufigkeit: medi.haeufigkeit,
      dauerWochen: 4,
    },
    diagnosen: ["I50.9", "E11.9"],
    datumAusstellung: heute.toISOString().slice(0, 10),
    begruendung: "Compliance-Sicherung Insulin + Marcumar.",
    status: "entwurf",
  });

  // V4: Helga · Wundversorgung · abgerechnet (historisch)
  s.verordnungen.push({
    id: "vo-hr-wund-q1",
    typ: "hkp",
    ausstellerId: "person-arzt-001",
    klientId: "klient-hr",
    versichertenStatus: {
      krankenkasse: "AOK Rheinland/Hamburg",
      versichertenNr: "X123456789",
      iknr: "108310400",
    },
    leistung: {
      art: "haeusliche-krankenpflege",
      code: wundversorgung.ziffer,
      bezeichnung: wundversorgung.bezeichnung,
      haeufigkeit: "3x wöchentlich",
      dauerWochen: 4,
    },
    diagnosen: ["L89.13"],
    datumAusstellung: vorTagen(35),
    datumGueltigBis: vorTagen(7),
    begruendung: "Initiale Wundversorgung Sakraldekubitus Kategorie 2.",
    status: "abgerechnet",
    kimMessageId: "kim-2026040200042",
  });
}
