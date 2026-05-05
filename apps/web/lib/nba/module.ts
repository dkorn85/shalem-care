// NBA — Neues Begutachtungsassessment (SGB XI § 14).
//
// Sechs gewichtete Module, in der Summe ergibt sich der Pflegegrad
// (PG 1–5 oder kein Anspruch). Verwendet vom Medizinischen Dienst
// (MD) zur Begutachtung.
//
// Quelle: BMG Anlage 1 zum SGB XI · MDK Pflege Begutachtungs-
// Richtlinien (BRi) Stand 2024.
//
// Phase 1: lokale Berechnung + Demo-Werte.
// Phase 2: BIK-MEK-Schnittstelle für offizielle MD-Anträge.

export type ModulId = "M1" | "M2" | "M3" | "M4" | "M5" | "M6";

export const MODUL_LABEL: Record<ModulId, string> = {
  M1: "Mobilität",
  M2: "Kognitive + kommunikative Fähigkeiten",
  M3: "Verhaltensweisen + psychische Problemlagen",
  M4: "Selbstversorgung",
  M5: "Bewältigung + selbstständiger Umgang mit krankheits-/therapiebedingten Anforderungen",
  M6: "Gestaltung des Alltagslebens + soziale Kontakte",
};

// Prozentanteile am Gesamtscore nach BMG-Anlage 1
export const MODUL_GEWICHTUNG: Record<ModulId, number> = {
  M1: 0.10,
  M2: 0.15,   // M2 oder M3, der höhere zählt
  M3: 0.15,
  M4: 0.40,
  M5: 0.20,
  M6: 0.15,
};

export type ItemBewertung = 0 | 1 | 2 | 3;

export type Item = {
  id: string;
  modul: ModulId;
  text: string;
  // 0 = selbstständig · 1 = überwiegend selbstst. · 2 = überwiegend unselbst. · 3 = unselbstständig
  bewertungOptionen: { wert: ItemBewertung; label: string }[];
};

const STD_OPTIONEN: Item["bewertungOptionen"] = [
  { wert: 0, label: "selbstständig" },
  { wert: 1, label: "überwiegend selbstständig" },
  { wert: 2, label: "überwiegend unselbstständig" },
  { wert: 3, label: "unselbstständig" },
];

export const ITEMS: Item[] = [
  // Modul 1 — Mobilität
  { id: "1.1", modul: "M1", text: "Positionswechsel im Bett", bewertungOptionen: STD_OPTIONEN },
  { id: "1.2", modul: "M1", text: "Halten einer stabilen Sitzposition", bewertungOptionen: STD_OPTIONEN },
  { id: "1.3", modul: "M1", text: "Umsetzen", bewertungOptionen: STD_OPTIONEN },
  { id: "1.4", modul: "M1", text: "Fortbewegen innerhalb des Wohnbereichs", bewertungOptionen: STD_OPTIONEN },
  { id: "1.5", modul: "M1", text: "Treppensteigen", bewertungOptionen: STD_OPTIONEN },

  // Modul 2 — Kognition
  { id: "2.1", modul: "M2", text: "Erkennen von Personen aus dem näheren Umfeld",
    bewertungOptionen: [{wert:0,label:"vorhanden"},{wert:1,label:"größtenteils"},{wert:2,label:"teilw."},{wert:3,label:"nicht vorhanden"}] },
  { id: "2.2", modul: "M2", text: "Örtliche Orientierung", bewertungOptionen: [{wert:0,label:"vorhanden"},{wert:1,label:"größtenteils"},{wert:2,label:"teilw."},{wert:3,label:"nicht vorhanden"}] },
  { id: "2.3", modul: "M2", text: "Zeitliche Orientierung", bewertungOptionen: [{wert:0,label:"vorhanden"},{wert:1,label:"größtenteils"},{wert:2,label:"teilw."},{wert:3,label:"nicht vorhanden"}] },
  { id: "2.4", modul: "M2", text: "Erinnern an wesentliche Ereignisse/Beobachtungen", bewertungOptionen: [{wert:0,label:"vorhanden"},{wert:1,label:"größtenteils"},{wert:2,label:"teilw."},{wert:3,label:"nicht vorhanden"}] },
  { id: "2.5", modul: "M2", text: "Steuern von mehrschrittigen Alltagshandlungen", bewertungOptionen: [{wert:0,label:"vorhanden"},{wert:1,label:"größtenteils"},{wert:2,label:"teilw."},{wert:3,label:"nicht vorhanden"}] },

  // Modul 3 — Verhalten (Häufigkeitsskala)
  { id: "3.1", modul: "M3", text: "Motorisch geprägte Verhaltensauffälligkeiten",
    bewertungOptionen: [{wert:0,label:"nie"},{wert:1,label:"selten"},{wert:2,label:"häufig"},{wert:3,label:"täglich"}] },
  { id: "3.2", modul: "M3", text: "Nächtliche Unruhe", bewertungOptionen: [{wert:0,label:"nie"},{wert:1,label:"selten"},{wert:2,label:"häufig"},{wert:3,label:"täglich"}] },
  { id: "3.3", modul: "M3", text: "Ängste", bewertungOptionen: [{wert:0,label:"nie"},{wert:1,label:"selten"},{wert:2,label:"häufig"},{wert:3,label:"täglich"}] },
  { id: "3.4", modul: "M3", text: "Antriebslosigkeit / depressive Stimmung", bewertungOptionen: [{wert:0,label:"nie"},{wert:1,label:"selten"},{wert:2,label:"häufig"},{wert:3,label:"täglich"}] },

  // Modul 4 — Selbstversorgung
  { id: "4.1", modul: "M4", text: "Vorderen Oberkörper waschen", bewertungOptionen: STD_OPTIONEN },
  { id: "4.2", modul: "M4", text: "Duschen / Baden inkl. Waschen Haare", bewertungOptionen: STD_OPTIONEN },
  { id: "4.3", modul: "M4", text: "An- und Auskleiden Oberkörper", bewertungOptionen: STD_OPTIONEN },
  { id: "4.4", modul: "M4", text: "An- und Auskleiden Unterkörper", bewertungOptionen: STD_OPTIONEN },
  { id: "4.5", modul: "M4", text: "Mundgerechtes Zubereiten der Nahrung", bewertungOptionen: STD_OPTIONEN },
  { id: "4.6", modul: "M4", text: "Essen", bewertungOptionen: STD_OPTIONEN },
  { id: "4.7", modul: "M4", text: "Trinken", bewertungOptionen: STD_OPTIONEN },
  { id: "4.8", modul: "M4", text: "Toilette / Toilettenstuhl benutzen", bewertungOptionen: STD_OPTIONEN },

  // Modul 5 — Krankheits-/Therapiebezogen
  { id: "5.1", modul: "M5", text: "Medikation",
    bewertungOptionen: [{wert:0,label:"nie/selbst"},{wert:1,label:"täglich"},{wert:2,label:"mehrmals tägl."},{wert:3,label:"mehrmals stündlich"}] },
  { id: "5.2", modul: "M5", text: "Verbandwechsel + Wundversorgung", bewertungOptionen: [{wert:0,label:"nie"},{wert:1,label:"wöchentl."},{wert:2,label:"tägl."},{wert:3,label:"mehrmals tägl."}] },
  { id: "5.3", modul: "M5", text: "Arztbesuche / Therapietermine", bewertungOptionen: [{wert:0,label:"selten"},{wert:1,label:"wöchentl."},{wert:2,label:"mehrmals/Wo"},{wert:3,label:"tägl."}] },

  // Modul 6 — Alltag + Soziales
  { id: "6.1", modul: "M6", text: "Tagesablauf gestalten", bewertungOptionen: STD_OPTIONEN },
  { id: "6.2", modul: "M6", text: "Ruhen und Schlafen", bewertungOptionen: STD_OPTIONEN },
  { id: "6.3", modul: "M6", text: "Sich beschäftigen", bewertungOptionen: STD_OPTIONEN },
  { id: "6.4", modul: "M6", text: "In die Zukunft planen", bewertungOptionen: STD_OPTIONEN },
  { id: "6.5", modul: "M6", text: "Direkten Kontakt mit Personen außerhalb gestalten", bewertungOptionen: STD_OPTIONEN },
];

// PG-Schwellen (Gesamtpunkte 0–100)
export const PG_SCHWELLEN: { pg: 0 | 1 | 2 | 3 | 4 | 5; ab: number; bis: number; label: string }[] = [
  { pg: 0, ab: 0,    bis: 12.4, label: "kein Anspruch" },
  { pg: 1, ab: 12.5, bis: 26.9, label: "PG 1 — geringe Beeinträchtigung" },
  { pg: 2, ab: 27,   bis: 47.4, label: "PG 2 — erhebliche Beeinträchtigung" },
  { pg: 3, ab: 47.5, bis: 69.9, label: "PG 3 — schwere Beeinträchtigung" },
  { pg: 4, ab: 70,   bis: 89.9, label: "PG 4 — schwerste Beeinträchtigung" },
  { pg: 5, ab: 90,   bis: 100,  label: "PG 5 — schwerste mit besonderer Bedarfslage" },
];

export type Modulauswertung = {
  modul: ModulId;
  rohwert: number;
  gewichtetePunkte: number;
};

// Berechnet Modul-Punkte. Vereinfachte Heuristik für Demo:
// rohwert = Summe Item-Bewertungen / max-möglich × 100
export function berechneModul(modul: ModulId, antworten: Record<string, ItemBewertung>): Modulauswertung {
  const items = ITEMS.filter((i) => i.modul === modul);
  const max = items.length * 3;
  const summe = items.reduce((s, i) => s + (antworten[i.id] ?? 0), 0);
  const rohwert = max === 0 ? 0 : (summe / max) * 100;
  const gewichtetePunkte = rohwert * MODUL_GEWICHTUNG[modul];
  return { modul, rohwert: Math.round(rohwert * 10) / 10, gewichtetePunkte: Math.round(gewichtetePunkte * 10) / 10 };
}

export function berechneGesamtscore(antworten: Record<string, ItemBewertung>): {
  module: Modulauswertung[];
  // M2 und M3: nur das höhere zählt (BMG-Regel)
  m2_oder_m3: ModulId;
  gesamtpunkte: number;
  pg: 0 | 1 | 2 | 3 | 4 | 5;
  pgLabel: string;
} {
  const ids: ModulId[] = ["M1","M2","M3","M4","M5","M6"];
  const module = ids.map((m) => berechneModul(m, antworten));
  const m2 = module.find((m) => m.modul === "M2")!;
  const m3 = module.find((m) => m.modul === "M3")!;
  const m2_oder_m3 = m2.gewichtetePunkte >= m3.gewichtetePunkte ? "M2" : "M3";
  const gesamtpunkte =
    module.find((m) => m.modul === "M1")!.gewichtetePunkte +
    module.find((m) => m.modul === m2_oder_m3)!.gewichtetePunkte +
    module.find((m) => m.modul === "M4")!.gewichtetePunkte +
    module.find((m) => m.modul === "M5")!.gewichtetePunkte +
    module.find((m) => m.modul === "M6")!.gewichtetePunkte;
  const stufe = PG_SCHWELLEN.find((p) => gesamtpunkte >= p.ab && gesamtpunkte <= p.bis) ?? PG_SCHWELLEN[0];
  return {
    module,
    m2_oder_m3,
    gesamtpunkte: Math.round(gesamtpunkte * 10) / 10,
    pg: stufe.pg,
    pgLabel: stufe.label,
  };
}

// ─── Demo: Helga vorausgefüllt für PG-Erhöhung 3→4 ─────────────────

export const HELGA_NBA: Record<string, ItemBewertung> = {
  // M1 Mobilität — eingeschränkt durch LWS + Sturzrisiko
  "1.1": 1, "1.2": 0, "1.3": 2, "1.4": 2, "1.5": 3,
  // M2 Kognition — orientiert
  "2.1": 0, "2.2": 0, "2.3": 1, "2.4": 1, "2.5": 1,
  // M3 Verhalten — leichte nächtliche Unruhe (Schmerzen)
  "3.1": 0, "3.2": 1, "3.3": 1, "3.4": 1,
  // M4 Selbstversorgung — viel Hilfe
  "4.1": 1, "4.2": 3, "4.3": 2, "4.4": 3, "4.5": 1, "4.6": 0, "4.7": 0, "4.8": 2,
  // M5 Krankheit/Therapie
  "5.1": 2, "5.2": 1, "5.3": 1,
  // M6 Alltag
  "6.1": 1, "6.2": 1, "6.3": 1, "6.4": 0, "6.5": 1,
};
