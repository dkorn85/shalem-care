// Stationsmanagement · Bett + Belegung + Aufnahme/Verlegung/Entlassung.
//
// Phase 1: In-Memory mit globalThis-Persistenz (überlebt HMR im dev),
// Demo-Seed für 2 Stationen (Pulmo-3B Essen + Demenz-Wohnbereich Annahof
// Bochum). Phase 2: Supabase-Tabellen `betten`, `belegungen`, `klienten`.
//
// Datenmodell ist bewusst klein gehalten — was hier nicht abgebildet ist
// (Pflegegrad-Pflegestufen-Historie, Diagnose-Liste, Verfügung) lebt in
// anderen Stores (lib/medikation, lib/pflege/diagnose-store, …).

import type { Pflegegrad } from "@/lib/hierarchy/types";

export type Bett = {
  id: string;             // "bett-pulmo-3b-101a"
  stationId: string;
  zimmerNr: string;       // "101"
  bettNr: string;         // "A" oder "1"
  istBlockiert: boolean;  // z.B. wegen Reinigung, Defekt, Quarantäne
  blockierungGrund?: string;
  blockiertSeit?: string; // ISO
};

export type Belegung = {
  id: string;             // "bel-..."
  bettId: string;
  klientId: string;
  klientName: string;
  pflegegrad: Pflegegrad;
  diagnosen: string[];    // freie Kurz-Tags ("Demenz", "COPD GOLD III", …)
  vonDatum: string;       // ISO yyyy-mm-dd
  bisDatum?: string;      // wenn null = aktuell belegt
  aufnahmeArt: "regulär" | "kurzzeit" | "verhinderung" | "tag";
  notiz?: string;
};

type GlobalShape = {
  __shalemBetten?: Bett[];
  __shalemBelegungen?: Belegung[];
};
const g = globalThis as unknown as GlobalShape;
const betten: Bett[] = g.__shalemBetten ?? [];
const belegungen: Belegung[] = g.__shalemBelegungen ?? [];
if (!g.__shalemBetten) g.__shalemBetten = betten;
if (!g.__shalemBelegungen) g.__shalemBelegungen = belegungen;

// ─── Read ─────────────────────────────────────────────────────────────────

export function listBetten(stationId?: string): Bett[] {
  return stationId
    ? betten.filter((b) => b.stationId === stationId)
    : [...betten];
}

export function getBett(id: string): Bett | null {
  return betten.find((b) => b.id === id) ?? null;
}

export function aktuelleBelegung(bettId: string): Belegung | null {
  return belegungen.find((b) => b.bettId === bettId && !b.bisDatum) ?? null;
}

export function belegungenFuerKlient(klientId: string): Belegung[] {
  return belegungen
    .filter((b) => b.klientId === klientId)
    .sort((a, b) => b.vonDatum.localeCompare(a.vonDatum));
}

export function stationBelegungsstand(stationId: string): {
  bettenGesamt: number;
  belegt: number;
  blockiert: number;
  freie: number;
  belegungsQuote: number;
} {
  const stationBetten = listBetten(stationId);
  const blockiert = stationBetten.filter((b) => b.istBlockiert).length;
  const belegt = stationBetten.filter((b) => !b.istBlockiert && aktuelleBelegung(b.id)).length;
  const bettenGesamt = stationBetten.length;
  const verfuegbar = bettenGesamt - blockiert;
  const freie = bettenGesamt - belegt - blockiert;
  return {
    bettenGesamt,
    belegt,
    blockiert,
    freie,
    belegungsQuote: verfuegbar > 0 ? Math.round((belegt / verfuegbar) * 100) : 0,
  };
}

// ─── Write — Server-Actions wickeln das ──────────────────────────────────

export function bettBelegen(input: {
  bettId: string;
  klientId: string;
  klientName: string;
  pflegegrad: Pflegegrad;
  diagnosen?: string[];
  aufnahmeArt: Belegung["aufnahmeArt"];
  notiz?: string;
}): { ok: true; belegung: Belegung } | { ok: false; error: string } {
  const bett = getBett(input.bettId);
  if (!bett) return { ok: false, error: "Bett existiert nicht." };
  if (bett.istBlockiert) return { ok: false, error: `Bett ist blockiert: ${bett.blockierungGrund ?? "—"}` };
  const aktuelle = aktuelleBelegung(input.bettId);
  if (aktuelle) return { ok: false, error: `Bett bereits belegt durch ${aktuelle.klientName}.` };

  const heute = new Date().toISOString().slice(0, 10);
  const belegung: Belegung = {
    id: `bel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    bettId: input.bettId,
    klientId: input.klientId,
    klientName: input.klientName,
    pflegegrad: input.pflegegrad,
    diagnosen: input.diagnosen ?? [],
    vonDatum: heute,
    aufnahmeArt: input.aufnahmeArt,
    notiz: input.notiz,
  };
  belegungen.push(belegung);
  return { ok: true, belegung };
}

export function bettEntlassen(bettId: string, notiz?: string):
  | { ok: true; belegung: Belegung }
  | { ok: false; error: string } {
  const aktuelle = aktuelleBelegung(bettId);
  if (!aktuelle) return { ok: false, error: "Bett ist nicht belegt." };
  aktuelle.bisDatum = new Date().toISOString().slice(0, 10);
  if (notiz) aktuelle.notiz = (aktuelle.notiz ? `${aktuelle.notiz}\n` : "") + `Entlassung: ${notiz}`;
  return { ok: true, belegung: aktuelle };
}

export function klientVerlegen(input: {
  vonBettId: string;
  zuBettId: string;
  notiz?: string;
}): { ok: true; alteBelegung: Belegung; neueBelegung: Belegung } | { ok: false; error: string } {
  const alt = aktuelleBelegung(input.vonBettId);
  if (!alt) return { ok: false, error: "Quelle ist nicht belegt." };
  const ziel = getBett(input.zuBettId);
  if (!ziel) return { ok: false, error: "Ziel-Bett existiert nicht." };
  if (ziel.istBlockiert) return { ok: false, error: "Ziel-Bett ist blockiert." };
  if (aktuelleBelegung(input.zuBettId)) return { ok: false, error: "Ziel-Bett ist bereits belegt." };

  // Alte Belegung schließen
  alt.bisDatum = new Date().toISOString().slice(0, 10);
  if (input.notiz) alt.notiz = (alt.notiz ? `${alt.notiz}\n` : "") + `Verlegung → ${ziel.zimmerNr}/${ziel.bettNr}: ${input.notiz}`;

  // Neue Belegung anlegen
  const neu = bettBelegen({
    bettId: input.zuBettId,
    klientId: alt.klientId,
    klientName: alt.klientName,
    pflegegrad: alt.pflegegrad,
    diagnosen: alt.diagnosen,
    aufnahmeArt: alt.aufnahmeArt,
    notiz: `Verlegt aus ${input.vonBettId}.${input.notiz ? " " + input.notiz : ""}`,
  });
  if (!neu.ok) return { ok: false, error: neu.error };
  return { ok: true, alteBelegung: alt, neueBelegung: neu.belegung };
}

export function bettBlockieren(bettId: string, grund: string): { ok: boolean } {
  const bett = getBett(bettId);
  if (!bett) return { ok: false };
  bett.istBlockiert = true;
  bett.blockierungGrund = grund;
  bett.blockiertSeit = new Date().toISOString().slice(0, 10);
  return { ok: true };
}

export function bettFreigeben(bettId: string): { ok: boolean } {
  const bett = getBett(bettId);
  if (!bett) return { ok: false };
  bett.istBlockiert = false;
  bett.blockierungGrund = undefined;
  bett.blockiertSeit = undefined;
  return { ok: true };
}

// ─── Seed ────────────────────────────────────────────────────────────────

let _seeded = false;
export function seedBettenOnce() {
  if (_seeded) return;
  _seeded = true;
  if (betten.length > 0) return;

  // Pulmo-3B Essen — 18 Betten, 2-Bett-Zimmer
  const pulmo = "st-keme-pulmo-3b";
  for (let z = 101; z <= 109; z++) {
    for (const bn of ["A", "B"]) {
      betten.push({
        id: `bett-pulmo-${z}${bn.toLowerCase()}`,
        stationId: pulmo,
        zimmerNr: String(z),
        bettNr: bn,
        istBlockiert: false,
      });
    }
  }
  // Demenz-Wohnbereich Annahof — 12 Betten, 1-Bett-Zimmer
  const annahof = "st-luk-wohn-a";
  for (let z = 1; z <= 12; z++) {
    betten.push({
      id: `bett-annahof-${z}`,
      stationId: annahof,
      zimmerNr: `A${String(z).padStart(2, "0")}`,
      bettNr: "1",
      istBlockiert: false,
    });
  }

  const heute = new Date().toISOString().slice(0, 10);

  // Belegungen mit echten Klienten
  const seed = (bettId: string, klientId: string, klientName: string, pg: Pflegegrad, diagnosen: string[], dauerTage: number) => {
    const von = new Date();
    von.setDate(von.getDate() - dauerTage);
    belegungen.push({
      id: `bel-seed-${belegungen.length}`,
      bettId,
      klientId,
      klientName,
      pflegegrad: pg,
      diagnosen,
      vonDatum: von.toISOString().slice(0, 10),
      aufnahmeArt: "regulär",
    });
  };

  // Pulmo
  seed("bett-pulmo-101a", "klient-hr", "Helga Reinhardt",  4, ["COPD GOLD III", "Diabetes Typ 2"], 12);
  seed("bett-pulmo-101b", "klient-wb", "Wilhelm Brand",    3, ["Diabetisches Ulcus", "Adipositas"], 28);
  seed("bett-pulmo-102a", "klient-eg", "Erika Gärtner",    4, ["Vaskuläre Demenz", "Hypertonie"], 60);
  seed("bett-pulmo-102b", "klient-ot", "Otto Tannenberger", 5, ["M. Parkinson Stadium IV", "Schluckstörung"], 90);
  seed("bett-pulmo-103a", "klient-gh", "Gertrud Hopfauf",  3, ["Z.n. Apoplex"], 14);

  // Block für Reinigung
  bettBlockieren("bett-pulmo-105b", "Sanierung Sanitärbereich · bis 12.05.");

  // Annahof
  seed("bett-annahof-1", "klient-bs", "Bertha Schäffer",   3, ["Alzheimer-Demenz mittel"], 180);
  seed("bett-annahof-2", "klient-pn", "Peter Niedermeier", 4, ["Vaskuläre Demenz", "Hypertonie"], 140);
  seed("bett-annahof-3", "klient-as-77", "Alma Schober",   2, ["MCI", "Adipositas"], 30);
}
