// In-Memory Medikations-Store (Phase 2: FHIR MedicationRequest +
// MedicationAdministration auf Medplum).

import type { Verordnung, Vergabe, VergabeStatus, Vergabezeit } from "./types";
import { findMedikament } from "./katalog";

type GlobalShape = {
  __shalemVerordnungen?: Verordnung[];
  __shalemVergaben?: Vergabe[];
};
const g = globalThis as unknown as GlobalShape;
const verordnungen: Verordnung[] = g.__shalemVerordnungen ?? [];
const vergaben: Vergabe[] = g.__shalemVergaben ?? [];
if (!g.__shalemVerordnungen) g.__shalemVerordnungen = verordnungen;
if (!g.__shalemVergaben) g.__shalemVergaben = vergaben;

// ─── Read ──────────────────────────────────────────────────

export function listVerordnungenFor(klientId: string): Verordnung[] {
  return verordnungen
    .filter((v) => v.klientId === klientId)
    .sort((a, b) => a.verordnetAm.localeCompare(b.verordnetAm));
}

export function listAktiveVerordnungenFor(klientId: string): Verordnung[] {
  return listVerordnungenFor(klientId).filter((v) => v.status === "aktiv");
}

export function getVerordnung(id: string): Verordnung | null {
  return verordnungen.find((v) => v.id === id) ?? null;
}

export function listVergabenFor(klientId: string, sinceISO?: string): Vergabe[] {
  return vergaben
    .filter((v) => v.klientId === klientId)
    .filter((v) => !sinceISO || v.gegebenAm >= sinceISO)
    .sort((a, b) => b.gegebenAm.localeCompare(a.gegebenAm));
}

export function listVergabenForVerordnung(verordnungId: string): Vergabe[] {
  return vergaben
    .filter((v) => v.verordnungId === verordnungId)
    .sort((a, b) => b.gegebenAm.localeCompare(a.gegebenAm));
}

// ─── Write ─────────────────────────────────────────────────

export function createVerordnung(input: Omit<Verordnung, "id" | "status">): Verordnung {
  const v: Verordnung = {
    ...input,
    id: `vo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "aktiv",
  };
  verordnungen.push(v);
  return v;
}

export function pauseVerordnung(id: string): Verordnung | null {
  const v = verordnungen.find((x) => x.id === id);
  if (!v) return null;
  v.status = "pausiert";
  return v;
}

export function resumeVerordnung(id: string): Verordnung | null {
  const v = verordnungen.find((x) => x.id === id);
  if (!v) return null;
  v.status = "aktiv";
  return v;
}

export function endVerordnung(id: string): Verordnung | null {
  const v = verordnungen.find((x) => x.id === id);
  if (!v) return null;
  v.status = "beendet";
  v.bis = new Date().toISOString();
  return v;
}

export function recordVergabe(input: {
  verordnungId: string;
  klientId: string;
  zeit: Vergabezeit;
  geplanteDosis: string;
  tatsaechlicheDosis?: string;
  status: VergabeStatus;
  begruendung?: string;
  gegebenVon: string;
  btmRestbestand?: number;
}): Vergabe {
  const entry: Vergabe = {
    id: `vg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    gegebenAm: new Date().toISOString(),
    ...input,
  };
  vergaben.push(entry);
  return entry;
}

// ─── Quote / Compliance ────────────────────────────────────

export function vergabeQuote(klientId: string, sinceISO: string): {
  total: number;
  gegeben: number;
  verweigert: number;
  ausgefallen: number;
  quotePct: number;
} {
  const list = listVergabenFor(klientId, sinceISO);
  const total = list.length;
  const gegeben = list.filter((v) => v.status === "gegeben").length;
  const verweigert = list.filter((v) => v.status === "verweigert").length;
  const ausgefallen = list.filter((v) => v.status === "ausgefallen").length;
  return {
    total,
    gegeben,
    verweigert,
    ausgefallen,
    quotePct: total === 0 ? 0 : Math.round((gegeben / total) * 100),
  };
}

// ─── Seed (Demo-Verordnungen für die drei St.-Lukas-Klienten) ────

let _seeded = false;
export function seedMedikationOnce() {
  if (_seeded) return;
  _seeded = true;
  if (verordnungen.length > 0) return;

  const today = new Date();
  const isoDaysAgo = (d: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() - d);
    return x.toISOString().slice(0, 10);
  };

  // Helga Reinhardt — PG3, Demenz, Hypertonie
  pushVerordnung("klient-hr", "med-ramipril",     "Dr. Hartmann (Hausarzt)",  isoDaysAgo(180), "essentielle Hypertonie",        { morgens: "1" });
  pushVerordnung("klient-hr", "med-bisoprolol",   "Dr. Hartmann (Hausarzt)",  isoDaysAgo(180), "Hypertonie, Tachyarrhythmie",   { morgens: "1" });
  pushVerordnung("klient-hr", "med-pantoprazol",  "Dr. Hartmann (Hausarzt)",  isoDaysAgo(120), "Reflux, Magenschutz",           { morgens: "1" });
  pushVerordnung("klient-hr", "med-donepezil",    "Dr. Vasilev (Neurologe)",  isoDaysAgo(95),  "Alzheimer-Demenz mittelgradig", { abends: "1" });
  pushVerordnung("klient-hr", "med-mirtazapin",   "Dr. Vasilev (Neurologe)",  isoDaysAgo(60),  "Schlafstörung, Depression",     { abends: "1" });
  pushVerordnung("klient-hr", "med-paracetamol",  "Dr. Hartmann (Hausarzt)",  isoDaysAgo(30),  "Bedarfsanalgesie",              { beiBedarf: "max. 4× tgl. 1 Tbl bei Schmerz NRS > 3" });

  // Wilhelm Brand — PG4, Diabetes, Wundmgmt, Antikoagulation
  pushVerordnung("klient-wb", "med-metformin",    "Dr. Hartmann (Hausarzt)",  isoDaysAgo(365), "Diabetes mellitus Typ II",      { morgens: "1", abends: "1" });
  pushVerordnung("klient-wb", "med-insulin-lantus","Dr. Lehmann (Diabetologe)", isoDaysAgo(180), "Insulinpflicht. Diab. Typ II",  { abends: "18 IE s.c." });
  pushVerordnung("klient-wb", "med-apixaban",     "Dr. Hartmann (Hausarzt)",  isoDaysAgo(220), "Vorhofflimmern (CHA2DS2-VASc 4)",{ morgens: "1", abends: "1" });
  pushVerordnung("klient-wb", "med-furosemid",    "Dr. Hartmann (Hausarzt)",  isoDaysAgo(60),  "Beinödeme, Herzinsuff. NYHA II", { morgens: "1" });
  pushVerordnung("klient-wb", "med-ramipril",     "Dr. Hartmann (Hausarzt)",  isoDaysAgo(220), "Herzinsuff., Hypertonie",       { morgens: "1" });
  pushVerordnung("klient-wb", "med-simvastatin",  "Dr. Hartmann (Hausarzt)",  isoDaysAgo(220), "Hypercholesterinämie",          { abends: "1" });
  pushVerordnung("klient-wb", "med-novalgin",     "Dr. Hartmann (Hausarzt)",  isoDaysAgo(45),  "Wundschmerz, Bedarfsmedikation",{ beiBedarf: "max. 4× tgl. 1 Tbl bei NRS > 4" });

  // Elfriede Gramberg — PG5, Palliativ
  pushVerordnung("klient-eg", "med-fentanyl-tts", "Dr. Krüger (Palliativ)",   isoDaysAgo(40),  "Tumorschmerz",                  { beiBedarf: "Pflaster alle 72 h, Lokalisation rotieren" });
  pushVerordnung("klient-eg", "med-morphin-trop", "Dr. Krüger (Palliativ)",   isoDaysAgo(40),  "Durchbruchschmerz",             { beiBedarf: "5–10 mg p.o. bei NRS > 4, max. 6× tgl." });
  pushVerordnung("klient-eg", "med-citalopram",   "Dr. Hartmann (Hausarzt)",  isoDaysAgo(150), "schwere Depressivität",         { morgens: "1" });
  pushVerordnung("klient-eg", "med-quetiapin",    "Dr. Vasilev (Neurologe)",  isoDaysAgo(70),  "Unruhe nachts (Off-Label)",     { abends: "1" });
  pushVerordnung("klient-eg", "med-movicol",      "Dr. Hartmann (Hausarzt)",  isoDaysAgo(30),  "Obstipation unter Opioiden",    { morgens: "1" });
  pushVerordnung("klient-eg", "med-pantoprazol",  "Dr. Hartmann (Hausarzt)",  isoDaysAgo(70),  "Magenschutz unter Polypharmazie",{ morgens: "1" });

  // Ein paar Vergaben heute morgen für Doku-Verlauf
  const morningISO = (() => {
    const d = new Date(); d.setHours(7, 30, 0, 0); return d.toISOString();
  })();
  for (const v of verordnungen) {
    if (!v.dosierung.morgens) continue;
    vergaben.push({
      id: `vg-seed-${vergaben.length}`,
      verordnungId: v.id,
      klientId: v.klientId,
      zeit: "morgens",
      geplanteDosis: v.dosierung.morgens,
      status: "gegeben",
      gegebenAm: morningISO,
      gegebenVon: "person-fk-004",
    });
  }

  // Eine BtM-Vergabe Eva Gramberg gestern abend
  const lastEveningISO = (() => {
    const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(20, 15, 0, 0); return d.toISOString();
  })();
  const morphinVO = verordnungen.find((v) => v.medikamentId === "med-morphin-trop");
  if (morphinVO) {
    vergaben.push({
      id: "vg-seed-btm-1",
      verordnungId: morphinVO.id,
      klientId: morphinVO.klientId,
      zeit: "bedarf",
      geplanteDosis: "5 mg",
      status: "gegeben",
      begruendung: "NRS 6/10, unruhig, Wendung schmerzhaft",
      gegebenAm: lastEveningISO,
      gegebenVon: "person-as-005",
      btmRestbestand: 92,
    });
  }

  // Eine Verweigerung bei Frau Gramberg
  vergaben.push({
    id: "vg-seed-refuse-1",
    verordnungId: verordnungen.find((v) => v.klientId === "klient-eg" && v.medikamentId === "med-citalopram")!.id,
    klientId: "klient-eg",
    zeit: "morgens",
    geplanteDosis: "1",
    status: "verweigert",
    begruendung: "Frau Gramberg dreht sich weg, fester Mund — heute kein Schlucken angeboten",
    gegebenAm: morningISO,
    gegebenVon: "person-as-005",
  });
}

function pushVerordnung(
  klientId: string,
  medikamentId: string,
  arzt: string,
  ab: string,
  indikation: string,
  dosierung: Verordnung["dosierung"],
) {
  const med = findMedikament(medikamentId);
  if (!med) throw new Error(`Medikament ${medikamentId} nicht im Katalog`);
  verordnungen.push({
    id: `vo-seed-${verordnungen.length}`,
    klientId,
    medikamentId,
    verordnetVon: arzt,
    verordnetAm: ab,
    indikation,
    dosierung,
    ab,
    status: "aktiv",
  });
}
