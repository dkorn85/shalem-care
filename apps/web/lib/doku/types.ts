// Pflegekassen-konforme Dokumentation (Strukturmodell SIS) plus Modelle für andere
// soziale Berufe. Referenzen:
//   - SGB XI § 113b (Strukturmodell der Pflegedokumentation)
//   - SGB IX (Teilhabeplan, ICF)
//   - SGB VIII § 36 (Hilfeplan Jugendhilfe)
//   - § 630f BGB (Patientenakten-Aufbewahrung 10 Jahre)
//   - MDK-Prüf-Anleitung (Nachvollziehbarkeit, Plausibilität)

export type BerufsTyp =
  | "pflege"           // SIS — Strukturierte Informationssammlung
  | "sozialarbeit"     // Hilfeplan / Casemanagement
  | "erziehung"        // Bildungs- und Lerngeschichten
  | "beratung"         // Beratungsverlauf SGB IX
  | "therapie"         // Heilmittel-Verlauf
  | "heilerziehung"    // ICF-basierter Teilhabeplan (BTHG)
  | "hauswirtschaft"   // Leistungsdoku § 45a SGB XI
  | "ehrenamt";        // Begleitdoku (formfrei)

export const BERUFS_LABEL: Record<BerufsTyp, string> = {
  pflege: "Pflege",
  sozialarbeit: "Sozialarbeit",
  erziehung: "Erziehung",
  beratung: "Beratung",
  therapie: "Therapie",
  heilerziehung: "Heilerziehung",
  hauswirtschaft: "Hauswirtschaft",
  ehrenamt: "Ehrenamt",
};

// ─── SIS — Strukturmodell Pflege (sechs Themenfelder) ─────

export type SISThemenfeld =
  | "kognition_kommunikation"
  | "mobilitaet_bewegung"
  | "krankheitsbezogen"
  | "selbstversorgung"
  | "soziale_beziehungen"
  | "wohnen_haeuslichkeit";

export const SIS_THEMENFELDER: Array<{ id: SISThemenfeld; label: string; hint: string }> = [
  { id: "kognition_kommunikation", label: "Kognition und Kommunikation",   hint: "Orientierung, Sprache, Verständigung, Erinnerungsvermögen" },
  { id: "mobilitaet_bewegung",     label: "Mobilität und Bewegung",        hint: "Lagewechsel, Gehen, Treppensteigen, Sturzgefahr" },
  { id: "krankheitsbezogen",       label: "Krankheitsbezogene Anforderungen", hint: "Medikamente, Wundversorgung, Vitalwerte, Schmerz" },
  { id: "selbstversorgung",        label: "Selbstversorgung",              hint: "Körperpflege, Essen, Trinken, Ausscheidung, An-/Auskleiden" },
  { id: "soziale_beziehungen",     label: "Leben in sozialen Beziehungen", hint: "Tagesstruktur, Beschäftigung, Angehörige, Stimmung" },
  { id: "wohnen_haeuslichkeit",    label: "Wohnen und Häuslichkeit",       hint: "Räumliche Sicherheit, Hilfsmittel, Hauswirtschaft" },
];

// ─── Risiko-Marker (für MDK relevant) ─────────────────────

export type RisikoTyp =
  | "sturz"
  | "dekubitus"
  | "mangelernaehrung"
  | "aspiration"
  | "kontraktur"
  | "schmerz"
  | "verwirrtheit"
  | "depression"
  | "exsikkose"
  | "inkontinenz"
  | "weglauf";

export const RISIKO_LABEL: Record<RisikoTyp, string> = {
  sturz: "Sturzrisiko",
  dekubitus: "Dekubitusrisiko",
  mangelernaehrung: "Mangelernährung",
  aspiration: "Aspirationsrisiko",
  kontraktur: "Kontrakturrisiko",
  schmerz: "Schmerzproblematik",
  verwirrtheit: "Verwirrtheitszustand",
  depression: "Depressivität",
  exsikkose: "Exsikkose-Risiko",
  inkontinenz: "Inkontinenz",
  weglauf: "Weglaufgefährdung",
};

// ─── Doku-Eintrag ──────────────────────────────────────────

export type DokuStatus = "draft" | "signed" | "amended";

export type DokuEntry = {
  id: string;
  klientId: string;
  authorId: string;
  beruf: BerufsTyp;

  // Pflege-spezifisch (optional für andere Berufe)
  themenfeld?: SISThemenfeld;
  risiken: RisikoTyp[];

  // Heilerziehung / Reha-Beratung
  icfCode?: string;          // z.B. "d450" Gehen, "b1641" Organisation und Planung

  inhaltKurz: string;        // 1-2 Sätze, Kern
  inhaltLang: string;        // ausführlich, MDK-prüfbar
  abweichungVomNormalverlauf: boolean;  // → Berichteblatt-Pflicht
  vorgeschlageneMassnahmen: string[];

  // KI-Audit
  aiAssisted: boolean;
  aiSuggestionRaw?: string;  // was die KI ursprünglich vorgeschlagen hat
  aiProvider?: string;       // "deepseek-chat" | "claude-haiku-4-5" | ...

  status: DokuStatus;
  createdAt: string;
  signedAt?: string;
  signedBy?: string;
};

// Was bei Risiken zu tun ist (Standard-Prophylaxen nach Expertenstandard DNQP)
export const RISIKO_PROPHYLAXE: Partial<Record<RisikoTyp, string>> = {
  sturz: "Sturzrisikoeinschätzung gemäß Expertenstandard, Hilfsmittel prüfen, Umgebung sichern",
  dekubitus: "Bewegungsplan mit Lagewechsel alle 2h, Hautinspektion, Druckentlastung",
  mangelernaehrung: "Ernährungsanamnese, Wiegen wöchentlich, Vorlieben dokumentieren",
  aspiration: "Logopädische Abklärung, sichere Schluckpositionierung, Andickungsmittel prüfen",
  kontraktur: "Bewegungsübungen täglich, Lagerung, Physiotherapie hinzuziehen",
  schmerz: "NRS/VAS täglich, Bedarfsmedikation prüfen, nicht-medikamentöse Maßnahmen",
  exsikkose: "Trinkprotokoll, mind. 1,5 l/Tag, Bilanzierung",
};
