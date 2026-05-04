// Krankenkassen-API · Phase-1-Stub.
//
// Phase 2: Anbindung an die GKV-Spitzenverband-Schnittstellen für
//   - eAU-Empfang (vom Arzt → KK → Arbeitgeber via gematik / TI)
//   - Krankengeld-Antrag (§ 44 SGB V) ab Tag 43 (nach 6 Wochen Lohnfortzahlung)
//   - Überzahlungs-Saldo / KG-Bezugsdauer (Teil der "Sa+Sn"-Leistungen)
//
// Erst-Anbindung läuft typischerweise über ein zertifiziertes
// Abrechnungs-Bridge (z.B. PVS Schwarz, eGK-Bürgermodul).

const KRANKENKASSEN_DEMO = [
  { name: "AOK Nordost",                   ik: "100000031" },
  { name: "AOK Bayern",                    ik: "108310400" },
  { name: "Barmer",                        ik: "104940005" },
  { name: "Techniker Krankenkasse",        ik: "101575519" },
  { name: "DAK-Gesundheit",                ik: "101810036" },
  { name: "BKK VBU",                       ik: "100404006" },
  { name: "IKK Classic",                   ik: "101539400" },
  { name: "KKH Kaufmännische",             ik: "102171012" },
  { name: "Knappschaft",                   ik: "109905003" },
  { name: "Mhplus",                        ik: "168140346" },
];

export function listKrankenkassen() {
  return KRANKENKASSEN_DEMO;
}

export type KrankengeldVoraussetzung = {
  ankerDatum: string;             // ISO YYYY-MM-DD
  lohnfortzahlungBis: string;     // 6 Wochen ab AU-Beginn
  krankengeldAb: string;
  voraussichtlicheBezugsdauerTage: number; // gesetzl. max. 78 Wo (546 d) je Krankheit
};

// Phase 1: rein heuristische Berechnung der Fristen
export function computeKrankengeldFristen(auBeginn: string): KrankengeldVoraussetzung {
  const start = new Date(auBeginn);
  const lfb = new Date(start); lfb.setDate(lfb.getDate() + 42);            // 6 Wo Lohnfortz.
  const kgAb = new Date(lfb);  kgAb.setDate(kgAb.getDate() + 1);
  return {
    ankerDatum: auBeginn,
    lohnfortzahlungBis: lfb.toISOString().slice(0, 10),
    krankengeldAb: kgAb.toISOString().slice(0, 10),
    voraussichtlicheBezugsdauerTage: 546,
  };
}

export async function sendEAUtoKrankenkasse(input: {
  ikNummer: string;
  versichertenNr?: string;
  eauReferenz: string;
  arztName: string;
  vonDatum: string;
  bisDatum: string;
}): Promise<{ ok: true; transId: string; received: string } | { ok: false; reason: string }> {
  await new Promise((r) => setTimeout(r, 250));
  const found = KRANKENKASSEN_DEMO.find((k) => k.ik === input.ikNummer);
  if (!found) return { ok: false, reason: "Kasse mit dieser IK-Nummer ist nicht im Verzeichnis hinterlegt." };
  return {
    ok: true,
    transId: `TI-${Date.now().toString(36).toUpperCase()}`,
    received: new Date().toISOString(),
  };
}

export async function requestKrankengeld(input: {
  ikNummer: string;
  versichertenNr?: string;
  vonDatum: string;
}): Promise<{ ok: true; antragId: string } | { ok: false; reason: string }> {
  await new Promise((r) => setTimeout(r, 350));
  const found = KRANKENKASSEN_DEMO.find((k) => k.ik === input.ikNummer);
  if (!found) return { ok: false, reason: "Kasse nicht im Verzeichnis." };
  return {
    ok: true,
    antragId: `KG-${Date.now().toString(36).toUpperCase()}`,
  };
}
