// Therapie-Diktat-Store · Sprachdiktat → strukturierter Therapie-Eintrag.
//
// Theorg/Buchner/Vivendi haben heute pro Therapie-Termin ein 8-Felder-
// Formular: Befund · Anamnese · Maßnahme · Lagerung · Heilmittel-Code ·
// Reaktion · Therapieziel · Empfehlung. Tippen ~5-8 min/Termin.
//
// Shalem-Pfad: 30-60 Sek. sprechen → KI strukturiert in HMV-konforme
// Felder, generiert HMV-Code (KG/MT/MLD/MAS/KGG/PNF), setzt Therapieziele
// nach ICF-Standard, erstellt Klartext für Klient.

export type TherapieFeld =
  | "befund"
  | "anamnese"
  | "massnahme"
  | "lagerung"
  | "reaktion"
  | "ziel"
  | "empfehlung";

export const FELD_LABEL: Record<TherapieFeld, string> = {
  befund: "Befund (heute)",
  anamnese: "Verlauf seit letzter Sitzung",
  massnahme: "Maßnahmen + Methodik",
  lagerung: "Lagerung + Hilfsmittel",
  reaktion: "Reaktion · Schmerz-VAS",
  ziel: "Therapieziel · ICF",
  empfehlung: "Empfehlung · Heim-Übung",
};

export const FELD_FARBE: Record<TherapieFeld, string> = {
  befund: "var(--vibe-team)",
  anamnese: "var(--vibe-profile)",
  massnahme: "var(--fri)",
  lagerung: "var(--sun)",
  reaktion: "var(--mon)",
  ziel: "var(--vibe-approval)",
  empfehlung: "var(--accent)",
};

export const FELD_BESCHREIBUNG: Record<TherapieFeld, string> = {
  befund: "Inspektion · Palpation · ROM · Schmerz-Lokalisation · neurolog. Auffälligkeiten",
  anamnese: "Was hat sich seit letzter Sitzung verändert? Verlauf · Fortschritt · Beschwerden",
  massnahme: "Konkrete Maßnahmen · Techniken · Dauer · Frequenz",
  lagerung: "Position · Hilfsmittel · adaptive Anpassungen",
  reaktion: "Patient-Reaktion · Schmerz-VAS 0-10 · Belastbarkeit",
  ziel: "ICF-konform · Aktivitäten + Partizipation · zeitlich messbar",
  empfehlung: "Eigenübung · Frequenz · weitere Termine · interdisziplinäre Empfehlungen",
};

// HMV-Heilmittel-Verordnungs-Codes (Heilmittelkatalog 2026)
export type HmvCode = {
  code: string;
  bezeichnung: string;
  punkte: number; // BWS-/HWS-Vergütungs-Punkte
  dauer_min: number;
  trigger_keywords: string[];
};

const HMV_CODES: HmvCode[] = [
  { code: "X0501", bezeichnung: "KG · Krankengymnastik", punkte: 380, dauer_min: 20, trigger_keywords: ["kg", "krankengymnastik", "ausdauer", "kraft", "bewegung"] },
  { code: "X0506", bezeichnung: "KG-ZNS · Bobath", punkte: 580, dauer_min: 30, trigger_keywords: ["bobath", "schlaganfall", "neuro", "spast", "hemipares"] },
  { code: "X0508", bezeichnung: "KG-ZNS · PNF", punkte: 580, dauer_min: 30, trigger_keywords: ["pnf", "facilitation", "diagonal", "muster"] },
  { code: "X0510", bezeichnung: "KGG · Gerätegestützt", punkte: 480, dauer_min: 60, trigger_keywords: ["kgg", "gerät", "gerätegest", "tower", "leg-press"] },
  { code: "X0511", bezeichnung: "KG-Atemtherapie", punkte: 380, dauer_min: 20, trigger_keywords: ["atem", "copd", "asthma", "atmung", "lippenbremse"] },
  { code: "X0701", bezeichnung: "MT · Manuelle Therapie", punkte: 320, dauer_min: 20, trigger_keywords: ["manuelle therapie", "mt ", "mobilisation", "hwz", "bws", "lws"] },
  { code: "X0901", bezeichnung: "MLD · Lymphdrainage 30 min", punkte: 280, dauer_min: 30, trigger_keywords: ["mld", "lymphdrainage", "ödem", "stauung"] },
  { code: "X0903", bezeichnung: "MLD · 45 min", punkte: 380, dauer_min: 45, trigger_keywords: ["mld 45", "lymph 45"] },
  { code: "X1101", bezeichnung: "Massage · KMT", punkte: 180, dauer_min: 15, trigger_keywords: ["massage", "kmt", "verspannung", "trigger"] },
  { code: "X1201", bezeichnung: "Wärmetherapie · Heißluft", punkte: 90, dauer_min: 10, trigger_keywords: ["wärme", "heißluft", "fango", "naturmoor"] },
  { code: "X1301", bezeichnung: "Kältetherapie", punkte: 90, dauer_min: 10, trigger_keywords: ["kälte", "kryo", "eis"] },
];

// ICF-Therapieziel-Vorschläge nach Schlüsselwort
const ICF_ZIELE: { trigger: string; ziel: string; icf_code?: string }[] = [
  { trigger: "treppe", ziel: "Treppensteigen 1 Etage selbständig in 4 Wochen", icf_code: "d4551" },
  { trigger: "geh", ziel: "200m Gehstrecke ohne Hilfsmittel in 6 Wochen", icf_code: "d4500" },
  { trigger: "anziehen", ziel: "Selbständiges Anziehen Oberkörper in 3 Wochen", icf_code: "d540" },
  { trigger: "sitz", ziel: "30 min freies Sitzen in 2 Wochen", icf_code: "d4153" },
  { trigger: "transfer", ziel: "Bett-Stuhl-Transfer eigenständig in 4 Wochen", icf_code: "d4200" },
  { trigger: "schmerz", ziel: "VAS-Reduktion auf ≤ 3/10 in 4 Wochen", icf_code: "b280" },
  { trigger: "atem", ziel: "Sauerstoffsättigung > 92% bei Belastung", icf_code: "b440" },
  { trigger: "schlucken", ziel: "Pürierte Kost selbständig in 4 Wochen", icf_code: "b510" },
];

// VAS-Schmerz-Erkennung
const VAS_RE = /(?:vas|schmerz|nrs)[\s:\-]*(\d{1,2})(?:[\/\s]?(?:10|von 10))?/i;

export type StrukturierterTherapieEintrag = {
  klient_name?: string;
  diagnose_text?: string;
  felder: Partial<Record<TherapieFeld, string>>;
  hmv_codes: HmvCode[];
  icf_ziele: { ziel: string; icf_code?: string }[];
  vas_schmerz?: number;
  klartext: string;
  warnungen: string[];
  zeitErsparnisSec: number;
};

const FELD_KEYWORDS: Record<TherapieFeld, string[]> = {
  befund: ["palpation", "rom", "bewegungsausmaß", "tonus", "kraft", "reflex", "haltung", "asymmetrie"],
  anamnese: ["seit", "verlauf", "berichtet", "fortschritt", "rückfall", "verändert", "alltag"],
  massnahme: ["dehnung", "mobilisation", "kräftigung", "koordination", "ausdauer", "atmung", "gleichgewicht", "applikation"],
  lagerung: ["rücken", "bauch", "seit", "lagerung", "kissen", "rolle", "bandage"],
  reaktion: ["toleriert", "schmerz", "vas", "nrs", "ermüd", "müde", "abbruch"],
  ziel: ["ziel", "möchte", "möchten", "will", "selbst"],
  empfehlung: ["zuhause", "heim-übung", "eigenübung", "mehrmals", "weiter", "kontroll"],
};

export function strukturiereTherapieDiktat(transkript: string): StrukturierterTherapieEintrag {
  const text = transkript.toLowerCase();
  const saetze = transkript
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Klient-Name
  const nameMatch = transkript.match(/^([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)+)/);
  const klient_name = nameMatch ? nameMatch[1] : undefined;

  // Felder pro Satz
  const felder: Partial<Record<TherapieFeld, string>> = {};
  for (const satz of saetze) {
    const lower = satz.toLowerCase();
    let bestFeld: TherapieFeld | null = null;
    let bestScore = 0;
    for (const [feld, kws] of Object.entries(FELD_KEYWORDS) as [TherapieFeld, string[]][]) {
      const score = kws.filter((k) => lower.includes(k)).length;
      if (score > bestScore) {
        bestScore = score;
        bestFeld = feld;
      }
    }
    if (bestFeld) {
      felder[bestFeld] = (felder[bestFeld] ? felder[bestFeld] + " · " : "") + satz;
    }
  }

  // HMV-Codes
  const hmv_codes = HMV_CODES.filter((c) => c.trigger_keywords.some((k) => text.includes(k)));

  // ICF-Ziele
  const icf_ziele = ICF_ZIELE.filter((z) => text.includes(z.trigger))
    .map(({ trigger: _t, ...rest }) => rest);

  // VAS
  let vas_schmerz: number | undefined;
  const m = transkript.match(VAS_RE);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 0 && n <= 10) vas_schmerz = n;
  }

  // Diagnose-Hint
  let diagnose_text: string | undefined;
  if (text.includes("schlaganfall") || text.includes("apoplex")) diagnose_text = "Z.n. Apoplex";
  else if (text.includes("bandscheib")) diagnose_text = "Bandscheiben-Vorfall";
  else if (text.includes("hüft-tep") || text.includes("hüfte tep")) diagnose_text = "Z.n. Hüft-TEP";
  else if (text.includes("knie-tep") || text.includes("gonarthrose")) diagnose_text = "Knie-Arthrose / TEP";
  else if (text.includes("copd")) diagnose_text = "COPD";
  else if (text.includes("parkinson")) diagnose_text = "Parkinson";
  else if (text.includes("ms ") || text.includes("multiple sklerose")) diagnose_text = "Multiple Sklerose";

  // Warnungen
  const warnungen: string[] = [];
  if (vas_schmerz !== undefined && vas_schmerz >= 7) {
    warnungen.push(`VAS ${vas_schmerz}/10 — bei VAS ≥ 7 Therapie-Pause + Rücksprache mit Arzt erwägen.`);
  }
  if (text.includes("schwindel") && text.includes("aufstehen")) {
    warnungen.push("Schwindel beim Aufstehen — Sturzprophylaxe + RR-Messung empfohlen.");
  }
  if (hmv_codes.length === 0) {
    warnungen.push("Kein HMV-Code erkannt — bitte manuell zuordnen für Abrechnung.");
  }

  // Klartext
  const klartext = generiereKlartext(felder, hmv_codes, icf_ziele, klient_name);

  // Zeit-Ersparnis: ~6 min Theorg-Tippen vs ~30 Sek Diktat
  const zeitErsparnisSec = Object.values(felder).filter(Boolean).length * (60 - 5);

  return {
    klient_name,
    diagnose_text,
    felder,
    hmv_codes,
    icf_ziele,
    vas_schmerz,
    klartext,
    warnungen,
    zeitErsparnisSec,
  };
}

function generiereKlartext(
  felder: Partial<Record<TherapieFeld, string>>,
  hmv: HmvCode[],
  ziele: { ziel: string }[],
  klientName?: string,
): string {
  const teile: string[] = [`Liebe${klientName ? "/r " + klientName : ""},`];
  teile.push("nach unserer Therapie heute:");
  if (hmv.length > 0) teile.push(`• Wir haben ${hmv.map((c) => c.bezeichnung).join(" + ")} gemacht.`);
  if (felder.massnahme) teile.push(`• Schwerpunkt: ${kuerzen(felder.massnahme, 100)}`);
  if (felder.empfehlung) teile.push(`• Bis zur nächsten Sitzung: ${kuerzen(felder.empfehlung, 100)}`);
  if (ziele.length > 0) teile.push(`• Wir arbeiten weiter darauf hin: ${ziele[0].ziel}`);
  teile.push("\nBei Fragen oder Verschlechterung: rufen Sie an. Bis zum nächsten Termin.");
  return teile.join("\n");
}

function kuerzen(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}
