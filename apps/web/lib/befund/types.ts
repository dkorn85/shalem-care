// Befund-Datentypen — gemeinsame Akte für alle Berufsgruppen.
//
// Eine Klientenakte aggregiert Befunde aus mehreren Quellen:
//   - Bildgebung (Röntgen, CT, MRT, Sonographie)
//   - Labor (Blut, Urin, Substanzanalysen)
//   - Funktionsuntersuchungen (Gangbild, Spirometrie, EKG, Wirbelsäule)
//   - Klinische Anamnese + Befundtexte
//
// Phase 1: in-memory + statisches Demo-Set.
// Phase 2: FHIR-Mapping
//   Imaging      -> ImagingStudy + DocumentReference
//   Lab          -> Observation (category=laboratory)
//   Gait         -> Observation (LOINC 89252-7 "Gait analysis")
//   Wirbelsäule  -> Condition + Observation (LOINC body site)

export type Befundtyp =
  | "imaging"
  | "labor"
  | "gangbild"
  | "wirbelsaeule"
  | "ekg"
  | "spirometrie"
  | "vitalparameter"
  | "sonstiges";

export const BEFUNDTYP_LABEL: Record<Befundtyp, string> = {
  imaging:        "Bildgebung",
  labor:          "Labor",
  gangbild:       "Gangbild",
  wirbelsaeule:   "Wirbelsäule",
  ekg:            "EKG",
  spirometrie:    "Spirometrie",
  vitalparameter: "Vitalparameter",
  sonstiges:      "Sonstiges",
};

// ─── Bildgebung ───────────────────────────────────────────────────────

export type ImagingModalitaet = "roentgen" | "ct" | "mrt" | "sono" | "endoskopie" | "fundus";

export const MOD_LABEL: Record<ImagingModalitaet, string> = {
  roentgen:   "Röntgen",
  ct:         "CT",
  mrt:        "MRT",
  sono:       "Sonographie",
  endoskopie: "Endoskopie",
  fundus:     "Fundus",
};

export type ImagingProjektion = "ap" | "lateral" | "schraeg_45" | "axial" | "coronar" | "sagittal" | "transversal" | "panorama";

export const PROJEKTION_LABEL: Record<ImagingProjektion, string> = {
  ap:           "a.p.",
  lateral:      "lateral",
  schraeg_45:   "45°-schräg",
  axial:        "axial",
  coronar:      "coronar",
  sagittal:     "sagittal",
  transversal:  "transversal",
  panorama:     "Panorama",
};

export type ImagingBefund = {
  id: string;
  klientId: string;
  modalitaet: ImagingModalitaet;
  region: string;             // "LWS", "Thorax", "Schädel", "Knie li."
  datum: string;              // ISO YYYY-MM-DD
  // Mehrere Projektionen pro Untersuchung
  ansichten: {
    projektion: ImagingProjektion;
    bildUrl: string;          // URL oder data: für Demo
    thumbnailUrl?: string;
  }[];
  befundtext: string;
  diagnose?: string;          // ICD-10
  radiologe?: string;
  dicomStudyUid?: string;     // Phase 2: DICOMweb
};

// ─── Labor ────────────────────────────────────────────────────────────

export type LaborMaterial = "blut" | "urin" | "stuhl" | "liquor" | "abstrich" | "haar" | "speichel";

export const MATERIAL_LABEL: Record<LaborMaterial, string> = {
  blut:     "Blut",
  urin:     "Urin",
  stuhl:    "Stuhl",
  liquor:   "Liquor",
  abstrich: "Abstrich",
  haar:     "Haar",
  speichel: "Speichel",
};

export type LaborWert = {
  parameter: string;          // "Hämoglobin", "Kreatinin"
  loinc?: string;
  wert: number | string;
  einheit: string;
  referenzVon?: number;
  referenzBis?: number;
  flag?: "normal" | "niedrig" | "hoch" | "kritisch_niedrig" | "kritisch_hoch";
  bemerkung?: string;
};

export type LaborBefund = {
  id: string;
  klientId: string;
  material: LaborMaterial;
  panel: string;              // "Kleines Blutbild", "Leberwerte", "Drogenscreening"
  datum: string;
  abnahmeDatum?: string;
  werte: LaborWert[];
  freitext?: string;
  labor?: string;             // Laborname
};

// ─── Gangbild ─────────────────────────────────────────────────────────

export type Gangphase =
  | "initial_contact"
  | "loading_response"
  | "midstance"
  | "terminal_stance"
  | "preswing"
  | "initial_swing"
  | "midswing"
  | "terminal_swing";

export const GANGPHASE_LABEL: Record<Gangphase, string> = {
  initial_contact:    "Fersenkontakt",
  loading_response:   "Stoßdämpfung",
  midstance:          "Mittlere Standphase",
  terminal_stance:    "Endstand",
  preswing:           "Vorschwung",
  initial_swing:      "Initiale Schwungphase",
  midswing:           "Mittlere Schwungphase",
  terminal_swing:     "Endschwung",
};

export type Gangabweichung =
  | "hinken_hueft"
  | "hinken_knie"
  | "trendelenburg"
  | "duchenne"
  | "stepper"
  | "scherengang"
  | "kleinschritt"
  | "ataktisch"
  | "spastisch"
  | "antalgisch";

export const ABWEICHUNG_LABEL: Record<Gangabweichung, string> = {
  hinken_hueft:   "Hüfthinken",
  hinken_knie:    "Kniehinken",
  trendelenburg:  "Trendelenburg-Zeichen",
  duchenne:       "Duchenne-Hinken",
  stepper:        "Steppergang (Fußheberparese)",
  scherengang:    "Scherengang (Spastik)",
  kleinschritt:   "Kleinschrittiger Gang",
  ataktisch:      "Ataktisch",
  spastisch:      "Spastisch",
  antalgisch:     "Antalgisch (schmerzbedingt)",
};

export type GangbildBefund = {
  id: string;
  klientId: string;
  datum: string;
  gehgeschwindigkeit?: number;     // m/s
  schrittlaengeRe?: number;        // cm
  schrittlaengeLi?: number;
  kadenz?: number;                  // Schritte/min
  doppelstandzeit?: number;         // % des Gangzyklus
  abweichungen: { typ: Gangabweichung; seite: "links" | "rechts" | "beidseits"; auspraegung: 1 | 2 | 3 }[];
  hilfsmittel?: ("rollator" | "stock" | "unterarmgehstuetzen" | "orthese" | "ohne")[];
  videoUrl?: string;
  posenpfad?: string;              // OpenPose JSON o.ä.
  befundtext: string;
};

// ─── Wirbelsäule ──────────────────────────────────────────────────────

export type Wirbelsegment =
  | "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7"
  | "T1" | "T2" | "T3" | "T4" | "T5" | "T6"
  | "T7" | "T8" | "T9" | "T10" | "T11" | "T12"
  | "L1" | "L2" | "L3" | "L4" | "L5"
  | "S1" | "S2" | "S3" | "S4" | "S5"
  | "Coccyx";

export const ALLE_WIRBEL: Wirbelsegment[] = [
  "C1","C2","C3","C4","C5","C6","C7",
  "T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12",
  "L1","L2","L3","L4","L5",
  "S1","S2","S3","S4","S5","Coccyx",
];

export type Wirbelregion = "HWS" | "BWS" | "LWS" | "Sakrum" | "Coccyx";

export function regionOf(seg: Wirbelsegment): Wirbelregion {
  if (seg.startsWith("C")) return "HWS";
  if (seg.startsWith("T")) return "BWS";
  if (seg.startsWith("L")) return "LWS";
  if (seg === "Coccyx") return "Coccyx";
  return "Sakrum";
}

export type Schadenstyp =
  | "bandscheibenvorfall"
  | "bandscheibenprotrusion"
  | "spondylose"
  | "spondylolisthese"
  | "skoliose"
  | "kyphose"
  | "lordose"
  | "morbus_bechterew"
  | "fraktur"
  | "osteoporose"
  | "spinalkanalstenose"
  | "facettengelenksarthrose"
  | "blockierung"
  | "muskelhartspann"
  | "myelopathie"
  | "wurzelreizung";

export const SCHADEN_LABEL: Record<Schadenstyp, string> = {
  bandscheibenvorfall:     "Bandscheibenvorfall (Prolaps)",
  bandscheibenprotrusion:  "Bandscheibenvorwölbung (Protrusion)",
  spondylose:              "Spondylose (degenerative WS)",
  spondylolisthese:        "Spondylolisthese (Wirbelgleiten)",
  skoliose:                "Skoliose",
  kyphose:                 "Kyphose (Hyperkyphose)",
  lordose:                 "Hyperlordose",
  morbus_bechterew:        "Morbus Bechterew (Spondylitis ankylosans)",
  fraktur:                 "Fraktur",
  osteoporose:             "Osteoporose",
  spinalkanalstenose:      "Spinalkanalstenose",
  facettengelenksarthrose: "Facettengelenksarthrose",
  blockierung:             "Funktionelle Blockierung",
  muskelhartspann:         "Muskulärer Hartspann",
  myelopathie:             "Myelopathie",
  wurzelreizung:           "Nervenwurzelreizung (Radikulopathie)",
};

export type Schadensschwere = 1 | 2 | 3 | 4;
export const SCHWERE_LABEL: Record<Schadensschwere, string> = {
  1: "leicht",
  2: "moderat",
  3: "schwer",
  4: "kritisch",
};

export type Wirbelschaden = {
  segmente: Wirbelsegment[];          // betroffene Segmente
  typ: Schadenstyp;
  schwere: Schadensschwere;
  seitenbetonung?: "links" | "rechts" | "beidseits" | "median";
  symptomatik?: string[];             // "Lumboischialgie L5", "Hypästhesie Außenseite"
  ersterBefund: string;               // ISO Datum
  letzteAktualisierung?: string;
};

export type WirbelsaeulenBefund = {
  id: string;
  klientId: string;
  datum: string;
  schaeden: Wirbelschaden[];
  haltungsanalyse?: {
    skoliosewinkelCobbGrad?: number;
    kyphosewinkelGrad?: number;
    lordosewinkelGrad?: number;
    beckenstand?: "ausgeglichen" | "links_hoch" | "rechts_hoch";
    schulterstand?: "ausgeglichen" | "links_hoch" | "rechts_hoch";
  };
  funktionstests?: {
    name: string;          // "Lasègue", "Schober", "Finger-Boden-Abstand"
    befund: string;
  }[];
  befundtext: string;
};

// ─── Anamnese-Score-Container (für Berufs-Schemas) ────────────────────

export type AnamneseEintrag = {
  id: string;
  klientId: string;
  beruf: "pflege" | "arzt" | "therapie" | "sozialarbeit" | "erziehung" | "heilerziehung" | "hauswirtschaft" | "ehrenamt";
  datum: string;
  durchfuehrendePerson: string;
  schemaId: string;             // Verweis auf Schema-Definition
  antworten: Record<string, unknown>;
  freitextZusammenfassung?: string;
};

// ─── Behandlungsplan ──────────────────────────────────────────────────

export type Behandlungsziel = {
  id: string;
  formulierung: string;               // SMART-Ziel
  zielwert?: string;                  // messbar
  zielerreichungBis?: string;
  status: "offen" | "in_bearbeitung" | "erreicht" | "verworfen";
  bewertung?: 1 | 2 | 3 | 4 | 5;
};

export type Behandlungsmassnahme = {
  id: string;
  beruf: AnamneseEintrag["beruf"];
  beschreibung: string;
  frequenz: string;                   // "3x/Woche", "täglich"
  dauer: string;
  evidenzklasse?: "Ia" | "Ib" | "IIa" | "IIb" | "III" | "IV" | "expertenmeinung";
  quelle?: string;                    // "DNQP-Standard", "Cochrane", "AWMF S3"
  status: "geplant" | "laufend" | "pausiert" | "abgeschlossen";
};

export type Behandlungsplan = {
  id: string;
  klientId: string;
  primaerverantwortung: AnamneseEintrag["beruf"];
  beteiligteBerufe: AnamneseEintrag["beruf"][];
  ziele: Behandlungsziel[];
  massnahmen: Behandlungsmassnahme[];
  reviewIntervallTage: number;
  letzteReview?: string;
  naechsteReview?: string;
  erstelltAm: string;
};
