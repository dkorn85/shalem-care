// Sozialarbeit-Diktat · BTHG/SGB-IX-Hilfeplan + MD-Begutachtungs-Vorbereitung.
//
// Branchen-Stand: connect-ASD/care4 haben Hilfeplan-Module mit ICF-Codes
// per Hand. Schwerfällig, kein Diktat. MD-Begutachtung wird mit
// Excel-Vorlagen vorbereitet.
//
// Shalem-Pfad: 1-3 min Diktat → KI strukturiert in BTHG-konforme Felder
// (ICF · Bedarfe · Ziele · Leistungen · Sozialraum), generiert Hilfeplan-
// Entwurf nach SGB-IX-Standard, bereitet MD-Begutachtungs-Bogen vor.

export type SozialFeld =
  | "lebenslage"
  | "icf_aktivitaet"
  | "icf_partizipation"
  | "icf_kontextfaktoren"
  | "bedarfe"
  | "ziele"
  | "leistungen"
  | "sozialraum"
  | "selbstbestimmung";

export const SOZ_LABEL: Record<SozialFeld, string> = {
  lebenslage: "Lebenslage · aktuelle Situation",
  icf_aktivitaet: "ICF · Aktivitäten",
  icf_partizipation: "ICF · Partizipation / Teilhabe",
  icf_kontextfaktoren: "ICF · Umweltfaktoren + Persönliche Faktoren",
  bedarfe: "Bedarfe (BTHG · § 99 SGB IX)",
  ziele: "Ziele · ICF-konform · SMART",
  leistungen: "Leistungen + Anbieter",
  sozialraum: "Sozialraum + Vernetzung",
  selbstbestimmung: "Selbstbestimmung + Wunschrecht",
};

export const SOZ_FARBE: Record<SozialFeld, string> = {
  lebenslage: "var(--vibe-team)",
  icf_aktivitaet: "var(--fri)",
  icf_partizipation: "var(--vibe-stats)",
  icf_kontextfaktoren: "var(--sun)",
  bedarfe: "var(--mon)",
  ziele: "var(--vibe-approval)",
  leistungen: "var(--accent)",
  sozialraum: "var(--thu)",
  selbstbestimmung: "var(--wed)",
};

export const SOZ_BESCHREIBUNG: Record<SozialFeld, string> = {
  lebenslage: "Wohnsituation, Haushalt, Beziehungen, Arbeit/Beschäftigung, Gesundheit",
  icf_aktivitaet: "Was kann die Person tun? · Selbstversorgung, Mobilität, Kommunikation",
  icf_partizipation: "Teilhabe an Lebensbereichen · Beruf, Bildung, Freizeit, Gemeinschaft",
  icf_kontextfaktoren: "Umweltfaktoren (Hilfsmittel, soziale Unterstützung) + Persönliche Faktoren",
  bedarfe: "Welche Hilfen werden objektiv benötigt? § 99 SGB IX-konform formuliert",
  ziele: "Ziele · spezifisch, messbar, akzeptiert, realistisch, terminiert",
  leistungen: "Konkrete Leistungen + Anbieter + Stunden + Frequenz",
  sozialraum: "Sozialraum-Vernetzung · Vereine, Kontakte, Strukturen",
  selbstbestimmung: "Wunsch + Wahlrecht · § 8 Abs. 1 SGB IX",
};

// ICF-Bereiche (vereinfacht)
const ICF_AKTIVITAET_KW: Record<string, string> = {
  "selbstversorgung": "d5 · Selbstversorgung",
  "mobil": "d4 · Mobilität",
  "kommunik": "d3 · Kommunikation",
  "lernen": "d1 · Lernen + Wissensanwendung",
  "haushalt": "d6 · Häusliches Leben",
};

const ICF_PARTIZIPATION_KW: Record<string, string> = {
  "arbeit": "d8 · Bedeutende Lebensbereiche · Arbeit",
  "bildung": "d8 · Bildung",
  "freizeit": "d9 · Gemeinschafts-/soziales/staatsbürg. Leben · Freizeit",
  "verein": "d910 · Gemeinschaftsleben",
  "religion": "d930 · Religion",
};

const FELD_KEYWORDS: Record<SozialFeld, string[]> = {
  lebenslage: ["wohnt", "lebt", "haushalt", "alleinst", "verheirat", "kinder", "rente", "alg", "grundsicherung", "wbg"],
  icf_aktivitaet: ["selbstversorgung", "anziehen", "essen", "körperpflege", "mobil", "rollator", "rollstuhl", "lesen", "schreiben", "kommunik"],
  icf_partizipation: ["arbeit", "beruf", "wfbm", "ausbildung", "bildung", "freizeit", "verein", "kontakte", "gemeinschaft", "isoliert"],
  icf_kontextfaktoren: ["wohnung", "barrierefrei", "treppe", "fahrstuhl", "familie", "nachbarn", "unterstützung", "deutsch", "sprache"],
  bedarfe: ["braucht", "benötigt", "hilfe bei", "unterstützung bei", "anleitung", "begleitung"],
  ziele: ["ziel", "möchte", "will", "wünscht", "soll", "in 6 monaten", "in einem jahr", "selbständig"],
  leistungen: ["assistenz", "fahrdienst", "tagesstruktur", "wfbm", "schul-assistenz", "pflegegrad", "stunden pro woche", "x pro monat", "anbieter"],
  sozialraum: ["nachbarschaft", "gemeinde", "verein", "kirche", "hospiz", "ehrenamt", "selbsthilfe"],
  selbstbestimmung: ["wunsch", "möchte selbst", "lehnt ab", "entschieden", "selbstbestimmt", "wahlrecht"],
};

// SMART-Ziel-Formatierung
const SMART_RE = /(\d+)\s*(woche|monat|jahr)/i;

// SGB-IX-Leistungsgruppen
const LEISTUNGS_GRUPPEN = [
  { key: "tagesstruktur", label: "Tagesstrukturierung (Eingliederungshilfe)", paragraph: "§ 113 SGB IX" },
  { key: "wfbm", label: "Werkstatt für behinderte Menschen", paragraph: "§ 219 SGB IX" },
  { key: "assistenz", label: "Assistenzleistungen", paragraph: "§ 78 SGB IX" },
  { key: "wohnen", label: "Soziale Teilhabe · Wohnen", paragraph: "§ 76 ff. SGB IX" },
  { key: "bildung", label: "Teilhabe an Bildung", paragraph: "§ 75 SGB IX" },
  { key: "mobilität", label: "Mobilitätshilfen", paragraph: "§ 83 SGB IX" },
];

export type StrukturierterHilfeplan = {
  klient_name?: string;
  alter?: number;
  felder: Partial<Record<SozialFeld, string>>;
  icf_codes: { kategorie: string; code: string; beschreibung: string }[];
  leistungs_vorschlaege: { gruppe: string; paragraph: string; begruendung: string }[];
  smart_ziele: { ziel: string; zeitraum: string; smart_score: number }[];
  klartext: string;
  warnungen: string[];
  zeitErsparnisSec: number;
};

export function strukturiereHilfeplan(transkript: string): StrukturierterHilfeplan {
  const text = transkript.toLowerCase();
  const saetze = transkript.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);

  const nameMatch = transkript.match(/^([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)+)/);
  const klient_name = nameMatch ? nameMatch[1] : undefined;

  const alterMatch = transkript.match(/(\d{1,3})\s*(?:jahre?|j\.)/i);
  const alter = alterMatch ? parseInt(alterMatch[1], 10) : undefined;

  // Felder
  const felder: Partial<Record<SozialFeld, string>> = {};
  for (const satz of saetze) {
    const lower = satz.toLowerCase();
    let bestFeld: SozialFeld | null = null;
    let bestScore = 0;
    for (const [feld, kws] of Object.entries(FELD_KEYWORDS) as [SozialFeld, string[]][]) {
      const score = kws.filter((k) => lower.includes(k)).length;
      if (score > bestScore) {
        bestScore = score;
        bestFeld = feld;
      }
    }
    if (bestFeld) felder[bestFeld] = (felder[bestFeld] ? felder[bestFeld] + " · " : "") + satz;
  }

  // ICF-Codes ableiten
  const icf_codes: StrukturierterHilfeplan["icf_codes"] = [];
  for (const [kw, code] of Object.entries(ICF_AKTIVITAET_KW)) {
    if (text.includes(kw)) icf_codes.push({ kategorie: "Aktivitäten", code: code.split(" · ")[0], beschreibung: code.split(" · ")[1] ?? code });
  }
  for (const [kw, code] of Object.entries(ICF_PARTIZIPATION_KW)) {
    if (text.includes(kw)) icf_codes.push({ kategorie: "Partizipation", code: code.split(" · ")[0], beschreibung: code.split(" · ")[1] ?? code });
  }

  // Leistungs-Vorschläge
  const leistungs_vorschlaege: StrukturierterHilfeplan["leistungs_vorschlaege"] = [];
  for (const lg of LEISTUNGS_GRUPPEN) {
    if (text.includes(lg.key)) {
      leistungs_vorschlaege.push({
        gruppe: lg.label,
        paragraph: lg.paragraph,
        begruendung: `Schlüsselwort "${lg.key}" im Diktat erkannt`,
      });
    }
  }

  // SMART-Ziele extrahieren
  const smart_ziele: StrukturierterHilfeplan["smart_ziele"] = [];
  if (felder.ziele) {
    const teile = felder.ziele.split(/·| und /);
    for (const t of teile) {
      const tt = t.trim();
      if (tt.length === 0) continue;
      const m = tt.match(SMART_RE);
      const zeitraum = m ? `${m[1]} ${m[2]}` : "—";
      const smart_score =
        (m ? 1 : 0) +
        (tt.match(/\d+/) ? 1 : 0) +
        (tt.length > 30 ? 1 : 0) +
        (tt.includes("selbst") || tt.includes("eigen") ? 1 : 0);
      smart_ziele.push({ ziel: tt, zeitraum, smart_score });
    }
  }

  // Warnungen
  const warnungen: string[] = [];
  if (alter && alter < 18 && text.includes("schutz")) {
    warnungen.push("Minderjährige:r mit Schutzhinweis — Schutzauftrag § 8a SGB VIII zwingend prüfen.");
  }
  if (text.includes("selbstgefährd") || text.includes("suizid") || text.includes("eigengef")) {
    warnungen.push("Selbst-/Eigengefährdung erwähnt — Krisen-Plan + Notfall-Kontakt aufnehmen.");
  }
  if (icf_codes.length === 0) {
    warnungen.push("Keine ICF-Codes erkannt — manuell ergänzen für Bedarfsfeststellung.");
  }
  if (smart_ziele.filter((z) => z.smart_score >= 3).length === 0 && smart_ziele.length > 0) {
    warnungen.push("Ziele sind noch nicht SMART — Zeitraum + Messbarkeit ergänzen.");
  }

  const klartext = generiereKlartext(felder, smart_ziele, klient_name);
  const zeitErsparnisSec = Object.values(felder).filter(Boolean).length * (180 - 30); // ~3 min/Feld vs 30 Sek

  return {
    klient_name,
    alter,
    felder,
    icf_codes,
    leistungs_vorschlaege,
    smart_ziele,
    klartext,
    warnungen,
    zeitErsparnisSec,
  };
}

function generiereKlartext(
  felder: Partial<Record<SozialFeld, string>>,
  ziele: { ziel: string; zeitraum: string }[],
  klient_name?: string,
): string {
  const teile: string[] = [`Hilfeplan-Zusammenfassung${klient_name ? " für " + klient_name : ""}`];
  if (felder.lebenslage) teile.push(`\nLebenslage: ${kuerzen(felder.lebenslage, 120)}`);
  if (felder.bedarfe) teile.push(`\nBedarfe: ${kuerzen(felder.bedarfe, 120)}`);
  if (ziele.length > 0) {
    teile.push("\nZiele:");
    for (const z of ziele.slice(0, 3)) teile.push(`• ${z.ziel}${z.zeitraum !== "—" ? ` (${z.zeitraum})` : ""}`);
  }
  if (felder.leistungen) teile.push(`\nLeistungen: ${kuerzen(felder.leistungen, 120)}`);
  teile.push("\nDieser Hilfeplan ist Grundlage für die Bedarfsfeststellung. Bitte gegenzeichnen oder Änderungswünsche melden.");
  return teile.join("\n");
}

function kuerzen(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1) + "…";
}
