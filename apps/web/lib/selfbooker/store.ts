// Self-Booker — Klient:innen mit PG ≥ 2 können direkt aus dem Pflege-Pool
// buchen. Marktpreise sind transparent, Pflegekraft erhält 80–85 % des
// Honorars (statt 50–60 % bei Honorar-Verleihern).
//
// Phase 1: in-memory Marktplatz mit Anfragen.
// Phase 2: gematik TI für Verordnungsbezug · Stripe Connect für Treuhand
// (Honorar wird erst freigegeben wenn Klient quittiert) · Pflegekassen-API
// für Verhinderungspflege (§ 39 SGB XI).

import type { Pflegegrad } from "@/lib/hierarchy/types";

export type LeistungArt =
  | "grundpflege"           // morgens / abends
  | "behandlungspflege"     // Insulin, Wundverband, Medikation — VO erforderlich
  | "begleitung"            // Arzt, Spaziergang, Behörde
  | "haushaltshilfe"
  | "verhinderungspflege"   // § 39 SGB XI — Vertretung pflegender Angehöriger
  | "betreuung_demenz";

export const LEISTUNG_LABEL: Record<LeistungArt, string> = {
  grundpflege:           "Grundpflege",
  behandlungspflege:     "Behandlungspflege",
  begleitung:            "Begleitung",
  haushaltshilfe:        "Haushaltshilfe",
  verhinderungspflege:   "Verhinderungspflege",
  betreuung_demenz:      "Betreuung Demenz",
};

export const LEISTUNG_VO_PFLICHT: Record<LeistungArt, boolean> = {
  grundpflege:           false,
  behandlungspflege:     true,    // ärztliche Verordnung erforderlich
  begleitung:            false,
  haushaltshilfe:        false,
  verhinderungspflege:   false,
  betreuung_demenz:      false,
};

// Marktpreis-Spanne (€/h) Stand 2026 für Hauspflege.
// Quelle: durchschnittliche ambulante Pflege-Stundensätze + 12 % Aufschlag
// für direkte Beziehung Klient↔Pflegekraft (kein Verleiher-Cut).
export const MARKTPREIS_EURO_H: Record<LeistungArt, { min: number; max: number; pflegerAnteil: number }> = {
  grundpflege:           { min: 38, max: 48,  pflegerAnteil: 0.84 },
  behandlungspflege:     { min: 48, max: 62,  pflegerAnteil: 0.82 },
  begleitung:            { min: 28, max: 38,  pflegerAnteil: 0.86 },
  haushaltshilfe:        { min: 24, max: 32,  pflegerAnteil: 0.85 },
  verhinderungspflege:   { min: 36, max: 48,  pflegerAnteil: 0.84 },
  betreuung_demenz:      { min: 32, max: 44,  pflegerAnteil: 0.84 },
};

export type SelfBookerStatus =
  | "vorgemerkt"
  | "veroeffentlicht"        // im Pool sichtbar für Pflegekräfte
  | "gebucht"                // Pflegekraft hat zugesagt
  | "durchgefuehrt"
  | "quittiert"              // Klient hat Leistung bestätigt → Auszahlung
  | "storniert";

export const STATUS_LABEL: Record<SelfBookerStatus, string> = {
  vorgemerkt:        "Vorgemerkt",
  veroeffentlicht:   "Im Pool sichtbar",
  gebucht:           "Gebucht",
  durchgefuehrt:     "Durchgeführt",
  quittiert:         "Quittiert · ausgezahlt",
  storniert:         "Storniert",
};

export type Buchung = {
  id: string;
  klientId: string;
  pflegegrad: Pflegegrad;
  leistung: LeistungArt;
  voErforderlich: boolean;
  voBeigefuegt: boolean;
  startISO: string;          // gewünschter Start
  dauerStunden: number;
  notizKlient?: string;       // "bitte ohne Schuhe in Wohnung"
  preisProStundeEuro: number; // Marktpreis transparent
  zugesagtVon?: string;       // Pflegekraft-ID
  status: SelfBookerStatus;
  erstelltAm: string;
  // Kostentraeger
  kostenuebernahme: "selbst" | "pflegekasse" | "private_pv" | "sozialamt";
  abgerechnetUeber?: string;  // IK / Auftragsnummer
};

type State = { buchungen: Buchung[] };
type GlobalShape = { __shalemSelfbook?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemSelfbook) g.__shalemSelfbook = { buchungen: [] };
const s = g.__shalemSelfbook!;

export function listBuchungenFor(klientId: string): Buchung[] {
  return s.buchungen.filter((b) => b.klientId === klientId).sort((a, b) => b.startISO.localeCompare(a.startISO));
}

export function listOffenenPool(): Buchung[] {
  return s.buchungen
    .filter((b) => b.status === "veroeffentlicht")
    .sort((a, b) => a.startISO.localeCompare(b.startISO));
}

export function buche(input: Omit<Buchung, "id" | "status" | "erstelltAm" | "voErforderlich" | "preisProStundeEuro">): Buchung {
  const preis = (MARKTPREIS_EURO_H[input.leistung].min + MARKTPREIS_EURO_H[input.leistung].max) / 2;
  const b: Buchung = {
    ...input,
    id: `sb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    voErforderlich: LEISTUNG_VO_PFLICHT[input.leistung],
    preisProStundeEuro: preis,
    status: "vorgemerkt",
    erstelltAm: new Date().toISOString(),
  };
  s.buchungen.push(b);
  return b;
}

let _seeded = false;
export function seedSelfbookerOnce() {
  if (_seeded) return;
  _seeded = true;

  const heute = new Date();
  const tageVor = (n: number) => {
    const d = new Date(heute); d.setDate(d.getDate() + n); d.setHours(8, 0, 0, 0);
    return d.toISOString();
  };

  s.buchungen.push(
    {
      id: "sb-seed-001",
      klientId: "klient-hr",
      pflegegrad: 3,
      leistung: "grundpflege",
      voErforderlich: false,
      voBeigefuegt: false,
      startISO: tageVor(2),
      dauerStunden: 1.5,
      preisProStundeEuro: 43,
      notizKlient: "Morgens vor dem Frühstück. Bitte mit Hausschuhen, kein Eau de Toilette.",
      status: "veroeffentlicht",
      kostenuebernahme: "pflegekasse",
      abgerechnetUeber: "IK 100000031",
      erstelltAm: new Date().toISOString(),
    },
    {
      id: "sb-seed-002",
      klientId: "klient-hr",
      pflegegrad: 3,
      leistung: "behandlungspflege",
      voErforderlich: true,
      voBeigefuegt: true,
      startISO: tageVor(3),
      dauerStunden: 0.5,
      preisProStundeEuro: 55,
      notizKlient: "Insulin abends. Pen liegt im Kühlschrank Tür.",
      status: "gebucht",
      zugesagtVon: "person-dr",
      kostenuebernahme: "pflegekasse",
      abgerechnetUeber: "IK 100000031",
      erstelltAm: new Date().toISOString(),
    },
    {
      id: "sb-seed-003",
      klientId: "klient-hr",
      pflegegrad: 3,
      leistung: "begleitung",
      voErforderlich: false,
      voBeigefuegt: false,
      startISO: tageVor(7),
      dauerStunden: 2,
      preisProStundeEuro: 33,
      notizKlient: "Hausarzt-Termin Dr. Hartmann · 10:30 · Charlottenburg",
      status: "veroeffentlicht",
      kostenuebernahme: "selbst",
      erstelltAm: new Date().toISOString(),
    },
  );
}
