// Wochenplan Hauswirtschaft. Phase-1-Pattern: in-memory Demo-Daten.
// Mahlzeit + Variante je Kostform · Allergen-Codes nach LMIV Anhang II.

export type Kostform = "normal" | "diabetes" | "dysphagie" | "natriumarm" | "hochkalor" | "vegetarisch";

export const KOSTFORM_LABEL: Record<Kostform, string> = {
  normal:       "Vollkost",
  diabetes:     "Diabetes",
  dysphagie:    "Dysphagie (IDDSI)",
  natriumarm:   "Natriumarm",
  hochkalor:    "Hochkalorisch",
  vegetarisch:  "Vegetarisch",
};

export const KOSTFORM_FARBE: Record<Kostform, string> = {
  normal:       "var(--sun)",
  diabetes:     "var(--vibe-stats)",
  dysphagie:    "var(--vibe-profile)",
  natriumarm:   "var(--vibe-team)",
  hochkalor:    "var(--mon)",
  vegetarisch:  "var(--thu)",
};

// LMIV Anhang II: 1 Glutenhaltiges Getreide, 3 Eier, 4 Fisch, 6 Soja, 7 Milch, 8 Schalenfrüchte, 10 Senf, 11 Sesam.
export type Allergen = 1 | 3 | 4 | 6 | 7 | 8 | 10 | 11;

export const ALLERGEN_LABEL: Record<Allergen, string> = {
  1:  "Gluten",
  3:  "Ei",
  4:  "Fisch",
  6:  "Soja",
  7:  "Milch",
  8:  "Schalenfrüchte",
  10: "Senf",
  11: "Sesam",
};

export type Mahlzeit = "fruehstueck" | "zwischen-vm" | "mittag" | "kaffee" | "abendbrot";

export const MAHLZEIT_LABEL: Record<Mahlzeit, string> = {
  fruehstueck:    "Frühstück",
  "zwischen-vm":  "Zwischenmahl",
  mittag:         "Mittagessen",
  kaffee:         "Kaffeezeit",
  abendbrot:      "Abendbrot",
};

export const MAHLZEIT_ZEIT: Record<Mahlzeit, string> = {
  fruehstueck:    "07:30",
  "zwischen-vm":  "10:00",
  mittag:         "12:00",
  kaffee:         "15:00",
  abendbrot:      "17:30",
};

export type Wochentag = "mo" | "di" | "mi" | "do" | "fr" | "sa" | "so";
export const WOCHENTAGE: Wochentag[] = ["mo", "di", "mi", "do", "fr", "sa", "so"];
export const WOCHENTAG_LABEL: Record<Wochentag, string> = {
  mo: "Montag", di: "Dienstag", mi: "Mittwoch", do: "Donnerstag", fr: "Freitag", sa: "Samstag", so: "Sonntag",
};

export type WochenplanEintrag = {
  tag: Wochentag;
  mahlzeit: Mahlzeit;
  was: string;
  passendFuer: Kostform[];
  allergene: Allergen[];
  kalorien: number;
  notiz?: string;
};

export const WOCHENPLAN: WochenplanEintrag[] = [
  // ---- MONTAG
  { tag: "mo", mahlzeit: "fruehstueck",   was: "Vollkorn-Brötchen, Quark, Honig, Tee",                       passendFuer: ["normal", "vegetarisch", "diabetes"], allergene: [1, 7],          kalorien: 380 },
  { tag: "mo", mahlzeit: "zwischen-vm",   was: "Apfelmus + Hafercracker",                                     passendFuer: ["normal", "diabetes", "dysphagie", "vegetarisch"], allergene: [1], kalorien: 140 },
  { tag: "mo", mahlzeit: "mittag",        was: "Kartoffelpüree, gedünsteter Lachs, Erbsen",                   passendFuer: ["normal", "dysphagie", "natriumarm"], allergene: [4, 7],          kalorien: 540, notiz: "Lachs Charge L-2415, Bio-Hof Pommer" },
  { tag: "mo", mahlzeit: "kaffee",        was: "Streuselkuchen, Buttermilch, Apfelschorle",                   passendFuer: ["normal", "vegetarisch"],             allergene: [1, 3, 7],       kalorien: 300 },
  { tag: "mo", mahlzeit: "abendbrot",     was: "Vollkornbrot, Frischkäse, Tomaten, Tee",                      passendFuer: ["normal", "vegetarisch", "diabetes", "natriumarm"], allergene: [1, 7], kalorien: 320 },

  // ---- DIENSTAG
  { tag: "di", mahlzeit: "fruehstueck",   was: "Haferflocken, warme Milch, Beeren, Honig",                    passendFuer: ["normal", "vegetarisch", "hochkalor"], allergene: [1, 7],          kalorien: 410 },
  { tag: "di", mahlzeit: "zwischen-vm",   was: "Banane + Naturjoghurt",                                        passendFuer: ["normal", "vegetarisch", "diabetes", "hochkalor"], allergene: [7], kalorien: 160 },
  { tag: "di", mahlzeit: "mittag",        was: "Möhrencremesuppe + Kasseler Aufschnitt-Brötchen",              passendFuer: ["normal"],                            allergene: [1, 7],          kalorien: 520 },
  { tag: "di", mahlzeit: "kaffee",        was: "Apfeltaschen, Kakao, Schorle",                                 passendFuer: ["normal", "vegetarisch"],             allergene: [1, 3, 7],       kalorien: 290 },
  { tag: "di", mahlzeit: "abendbrot",     was: "Linsensuppe, Vollkornbrot, Camembert",                         passendFuer: ["normal", "vegetarisch", "hochkalor"], allergene: [1, 7],          kalorien: 460, notiz: "Auch dysphagie-tauglich, fein püriert auf Anfrage" },

  // ---- MITTWOCH
  { tag: "mi", mahlzeit: "fruehstueck",   was: "Zwieback, Marmelade, Tee",                                     passendFuer: ["normal", "vegetarisch", "dysphagie", "natriumarm"], allergene: [1], kalorien: 320 },
  { tag: "mi", mahlzeit: "zwischen-vm",   was: "Birne + Studentenfutter",                                      passendFuer: ["normal", "vegetarisch", "diabetes", "hochkalor"], allergene: [8], kalorien: 200 },
  { tag: "mi", mahlzeit: "mittag",        was: "Hähnchen-Geschnetzeltes, Reis, Brokkoli",                      passendFuer: ["normal", "natriumarm", "diabetes"],   allergene: [],              kalorien: 580 },
  { tag: "mi", mahlzeit: "kaffee",        was: "Käsekuchen, Kaffee, Apfelsaft",                                passendFuer: ["normal", "vegetarisch"],             allergene: [1, 3, 7],       kalorien: 310 },
  { tag: "mi", mahlzeit: "abendbrot",     was: "Bauernbrot, Schinken, Gurke",                                  passendFuer: ["normal", "diabetes"],                allergene: [1],             kalorien: 310 },

  // ---- DONNERSTAG
  { tag: "do", mahlzeit: "fruehstueck",   was: "Brötchen, Frischkäse-Kräuter, Tomaten, Tee",                    passendFuer: ["normal", "vegetarisch"],             allergene: [1, 7],          kalorien: 360 },
  { tag: "do", mahlzeit: "zwischen-vm",   was: "Kompott (Pflaume) + Vollkornkeks",                              passendFuer: ["normal", "vegetarisch", "dysphagie"], allergene: [1],            kalorien: 150 },
  { tag: "do", mahlzeit: "mittag",        was: "Königsberger Klopse, Salzkartoffeln, rote Bete",                passendFuer: ["normal"],                            allergene: [3, 10],         kalorien: 600, notiz: "Dysphagie-Variante: feine Klopse-Mousse" },
  { tag: "do", mahlzeit: "kaffee",        was: "Marmorkuchen, Buttermilch",                                     passendFuer: ["normal", "vegetarisch"],             allergene: [1, 3, 7],       kalorien: 280 },
  { tag: "do", mahlzeit: "abendbrot",     was: "Käseplatte, Vollkornbrot, Trauben",                              passendFuer: ["normal", "vegetarisch", "hochkalor"], allergene: [1, 7],          kalorien: 420 },

  // ---- FREITAG · Fisch-Tag
  { tag: "fr", mahlzeit: "fruehstueck",   was: "Müsli (zuckerfrei), Joghurt, Apfel",                            passendFuer: ["normal", "vegetarisch", "diabetes"], allergene: [1, 7],          kalorien: 390 },
  { tag: "fr", mahlzeit: "zwischen-vm",   was: "Smoothie (Banane, Spinat, Joghurt)",                            passendFuer: ["normal", "vegetarisch", "dysphagie", "hochkalor"], allergene: [7], kalorien: 220, notiz: "IDDSI-Stufe 4 für Schluckkost" },
  { tag: "fr", mahlzeit: "mittag",        was: "Seelachs-Filet, Petersilien-Kartoffeln, Rahm-Spinat",            passendFuer: ["normal", "natriumarm"],              allergene: [4, 7],          kalorien: 520 },
  { tag: "fr", mahlzeit: "kaffee",        was: "Erdbeerquark, Vollkornkeks",                                     passendFuer: ["normal", "vegetarisch", "diabetes"], allergene: [1, 7],          kalorien: 240 },
  { tag: "fr", mahlzeit: "abendbrot",     was: "Krautsalat, Roggenbrot, Frikadelle",                             passendFuer: ["normal"],                            allergene: [1, 3, 10],      kalorien: 460 },

  // ---- SAMSTAG
  { tag: "sa", mahlzeit: "fruehstueck",   was: "Spiegelei, Vollkorntoast, Tee",                                  passendFuer: ["normal", "vegetarisch", "hochkalor"], allergene: [1, 3],          kalorien: 410 },
  { tag: "sa", mahlzeit: "zwischen-vm",   was: "Apfel + Vollkornkeks",                                            passendFuer: ["normal", "vegetarisch", "diabetes"], allergene: [1],             kalorien: 130 },
  { tag: "sa", mahlzeit: "mittag",        was: "Rindergulasch, Spätzle, Salat",                                  passendFuer: ["normal", "hochkalor"],               allergene: [1, 3],          kalorien: 680, notiz: "Wunschgericht Familie Hartmann" },
  { tag: "sa", mahlzeit: "kaffee",        was: "Apfelstrudel mit Vanillesoße",                                    passendFuer: ["normal", "vegetarisch", "hochkalor"], allergene: [1, 3, 7],       kalorien: 380 },
  { tag: "sa", mahlzeit: "abendbrot",     was: "Brotzeit-Platte (Aufschnitt, Käse, Gurke)",                       passendFuer: ["normal"],                            allergene: [1, 7],          kalorien: 440 },

  // ---- SONNTAG · Festtag
  { tag: "so", mahlzeit: "fruehstueck",   was: "Sonntags-Brötchen, weiches Ei, Schinken, Saft",                   passendFuer: ["normal", "hochkalor"],               allergene: [1, 3],          kalorien: 480 },
  { tag: "so", mahlzeit: "zwischen-vm",   was: "Mandarinen + Hafercracker",                                       passendFuer: ["normal", "vegetarisch", "diabetes", "dysphagie"], allergene: [1], kalorien: 130 },
  { tag: "so", mahlzeit: "mittag",        was: "Schweinebraten, Knödel, Rotkohl, Soße",                            passendFuer: ["normal", "hochkalor"],               allergene: [1, 3],          kalorien: 720 },
  { tag: "so", mahlzeit: "kaffee",        was: "Schwarzwälder Kirsch, Sahne, Kaffee",                              passendFuer: ["normal", "vegetarisch", "hochkalor"], allergene: [1, 3, 7],       kalorien: 410 },
  { tag: "so", mahlzeit: "abendbrot",     was: "Pumpernickel, Schmalzfleisch, eingelegte Gurke",                   passendFuer: ["normal"],                            allergene: [1],             kalorien: 360 },
];

export function eintragFuer(tag: Wochentag, mahlzeit: Mahlzeit): WochenplanEintrag | null {
  return WOCHENPLAN.find((w) => w.tag === tag && w.mahlzeit === mahlzeit) ?? null;
}

export function tagesKalorien(tag: Wochentag, kostform?: Kostform): number {
  return WOCHENPLAN
    .filter((w) => w.tag === tag && (!kostform || w.passendFuer.includes(kostform)))
    .reduce((sum, w) => sum + w.kalorien, 0);
}

export function passendCount(eintrag: WochenplanEintrag, kostform?: Kostform): boolean {
  return !kostform || eintrag.passendFuer.includes(kostform);
}
