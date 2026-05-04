// Bundesagentur für Arbeit · ALG-1-Schnittstelle (Phase-1-Stub).
//
// Die wichtigsten Vorgänge, die wir abbilden:
//
//   1. Nahtlosigkeit nach KG-Aussteuerung (§ 145 SGB III):
//      Wenn Krankengeld nach 78 Wochen ausläuft und der DRV-Bescheid zur
//      Erwerbsminderungsrente noch aussteht, zahlt die BA ALG 1, ohne den
//      sonst geltenden Test der Vermittlungsfähigkeit (≥ 15 Std/Woche).
//
//   2. Reguläres ALG 1 nach Beschäftigungsende (§§ 137 ff SGB III):
//      Anwartschaftszeit 12 Monate in 30 Monaten, persönliche Arbeitslosigkeit,
//      Arbeitslosmeldung. Bezugsdauer staffelweise 6–24 Monate.
//
//   3. Eingliederungsvereinbarung / -plan (§ 37 SGB III):
//      Pflichtprogramm Förderkurse, Bewerbungsaktivitäten, Reha.
//
// Echtanbindung Phase 2:
//   - eXTra-Standard (XÖV) für Datenaustausch BA ↔ Träger
//   - JOBBÖRSE-API für Stellen-Matching
//   - bAV-Bescheid-Empfang via Postfach
//
// Diese Datei: deterministisch berechnete Stubs für Demo + UI-Tests.

export type AlgVoraussetzungen = {
  anwartschaftErfuellt: boolean;       // ≥ 12 Monate sv-pfl. Beschäftigung in 30 Monaten
  arbeitslosGemeldet: boolean;
  vermittelbarkeitMin15hWoche: boolean;
  nahtlosigkeitGreift: boolean;        // § 145 SGB III
};

export type AlgBescheid = {
  antragId: string;
  antragsdatum: string;
  bezugsbeginn: string;
  bezugsdauerMonate: number;
  monatlicherBetrag: number;           // 60 % netto bzw 67 % mit Kind
  rechtsgrundlage: string;             // z.B. "§ 145 SGB III · Nahtlosigkeit"
  hinweise: string[];
};

// Bezugsdauer-Tabelle nach Anwartschaftszeit + Alter (§ 147 II SGB III).
// Vereinfacht für Phase 1 — die echte Tabelle hat 11 Stufen.
export function bezugsdauerMonate(input: { anwartschaftMonate: number; alter: number }): number {
  const { anwartschaftMonate: a, alter } = input;
  if (a < 12) return 0;
  if (a >= 12 && a < 16) return 6;
  if (a >= 16 && a < 20) return 8;
  if (a >= 20 && a < 24) return 10;
  if (a >= 24) {
    if (alter < 50) return 12;
    if (alter < 55) return 15;
    if (alter < 58) return 18;
    return 24;
  }
  return 12;
}

// ALG-1-Berechnung (§ 149 SGB III, vereinfacht für Demo).
// Bemessungsentgelt: durchschnittl. brutto-Tagesentgelt aus letzten 12 Mo.
// Leistungssatz: 60 % (oder 67 % mit Kind iSv. § 32 EStG) des
// pauschalierten Nettoentgelts.
export function computeAlgBetrag(input: {
  bruttoMonatDurchschnitt12Mo: number;
  nettoFaktor: number;     // typ. 0.6–0.65, abhängig von SteuerKlasse + KV
  hatKind: boolean;
}): { netto: number; tagesatz: number; monatlich: number; quote: number } {
  const tagBrutto = input.bruttoMonatDurchschnitt12Mo / 30;
  const tagNetto = tagBrutto * input.nettoFaktor;
  const quote = input.hatKind ? 0.67 : 0.6;
  const tagesatz = tagNetto * quote;
  return {
    netto: Math.round(tagNetto * 30 * 100) / 100,
    tagesatz: Math.round(tagesatz * 100) / 100,
    monatlich: Math.round(tagesatz * 30 * 100) / 100,
    quote,
  };
}

export async function meldeArbeitslos(input: {
  personId: string;
  beendigungsdatum: string;
  nahtlosigkeit: boolean;
  diagnoseKurz?: string;
}): Promise<{ ok: true; bestaetigungsId: string; ersttermin: string } | { ok: false; reason: string }> {
  await new Promise((r) => setTimeout(r, 250));
  const t = new Date(input.beendigungsdatum);
  t.setUTCDate(t.getUTCDate() + 14);
  return {
    ok: true,
    bestaetigungsId: `BA-AM-${Date.now().toString(36).toUpperCase()}`,
    ersttermin: t.toISOString().slice(0, 10),
  };
}

export async function beantrageAlg(input: {
  personId: string;
  bezugsbeginn: string;
  voraussetzungen: AlgVoraussetzungen;
  bemessungsbruttoMonat: number;
  alter: number;
  anwartschaftMonate: number;
  hatKind: boolean;
  nettoFaktor?: number;
}): Promise<{ ok: true; bescheid: AlgBescheid } | { ok: false; reason: string }> {
  await new Promise((r) => setTimeout(r, 350));

  if (!input.voraussetzungen.arbeitslosGemeldet) {
    return { ok: false, reason: "Persönliche Arbeitslosmeldung steht aus (§ 141 SGB III)." };
  }
  if (!input.voraussetzungen.anwartschaftErfuellt) {
    return { ok: false, reason: "Anwartschaftszeit nicht erfüllt (12 Monate in 30 Monaten, § 142 SGB III)." };
  }
  if (
    !input.voraussetzungen.vermittelbarkeitMin15hWoche &&
    !input.voraussetzungen.nahtlosigkeitGreift
  ) {
    return {
      ok: false,
      reason: "Vermittlungsfähigkeit < 15 h/Woche und keine Nahtlosigkeit — DRV/Reha prüfen.",
    };
  }

  const dauer = bezugsdauerMonate({ anwartschaftMonate: input.anwartschaftMonate, alter: input.alter });
  const betrag = computeAlgBetrag({
    bruttoMonatDurchschnitt12Mo: input.bemessungsbruttoMonat,
    nettoFaktor: input.nettoFaktor ?? 0.62,
    hatKind: input.hatKind,
  });

  const bescheid: AlgBescheid = {
    antragId: `BA-ALG-${Date.now().toString(36).toUpperCase()}`,
    antragsdatum: new Date().toISOString().slice(0, 10),
    bezugsbeginn: input.bezugsbeginn,
    bezugsdauerMonate: dauer,
    monatlicherBetrag: betrag.monatlich,
    rechtsgrundlage: input.voraussetzungen.nahtlosigkeitGreift
      ? "§ 145 SGB III · Nahtlosigkeit (parallel zu DRV-Reha-Antrag)"
      : "§§ 137, 142 ff SGB III · Reguläres ALG 1",
    hinweise: [
      "Mitwirkungspflichten nach §§ 60ff SGB I beachten.",
      "Eingliederungsvereinbarung folgt zum Ersttermin.",
      input.voraussetzungen.nahtlosigkeitGreift
        ? "Reha-Antrag bei DRV ist parallel zu stellen (§ 145 II SGB III)."
        : "Bewerbungsaktivitäten dokumentieren.",
    ],
  };

  return { ok: true, bescheid };
}

// Reha-Antrag bei DRV (Deutsche Rentenversicherung).
// Phase 1: simulierter Eingang.
export async function beantrageDrvReha(input: {
  personId: string;
  rehaArt: "med" | "berufl" | "lta";  // medizinisch / berufl. / Leistungen zur Teilhabe am Arbeitsleben
  diagnoseKurz: string;
}): Promise<{ ok: true; antragId: string; entscheidungBis: string }> {
  await new Promise((r) => setTimeout(r, 250));
  const ent = new Date();
  ent.setUTCDate(ent.getUTCDate() + 6 * 7);
  return {
    ok: true,
    antragId: `DRV-${input.rehaArt.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    entscheidungBis: ent.toISOString().slice(0, 10),
  };
}

// Erwerbsminderungsrenten-Antrag (§§ 43, 240 SGB VI).
export async function beantrageEmRente(input: {
  personId: string;
  diagnoseKurz: string;
  beginnAU: string;
}): Promise<{ ok: true; antragId: string; voraussichtlichEntscheidung: string }> {
  await new Promise((r) => setTimeout(r, 350));
  const ent = new Date();
  ent.setUTCDate(ent.getUTCDate() + 16 * 7); // 4 Monate Bearbeitung typisch
  return {
    ok: true,
    antragId: `DRV-EM-${Date.now().toString(36).toUpperCase()}`,
    voraussichtlichEntscheidung: ent.toISOString().slice(0, 10),
  };
}
