// CSV/JSON-Parser für Träger-Roster-Imports.
//
// Tolerant gegenüber:
//   - DE/EN-Spaltennamen (datum / date, schicht_typ / shift_type ...)
//   - Reihenfolge der Spalten
//   - leeren Zeilen, Kommentaren mit "#"
//   - sowohl Komma als auch Semikolon als Trenner

import type { RawRosterRow, RosterParseResult } from "./types";

const HEADER_ALIASES: Record<keyof RawRosterRow, string[]> = {
  datum:          ["datum", "date"],
  schichtTyp:     ["schicht_typ", "schichttyp", "shift_type", "shifttype", "schicht"],
  stationKuerzel: ["station_kuerzel", "station", "ward", "ward_short", "stationkurzel"],
  qualifikation: ["qualifikation", "qualification", "qual", "skill"],
  anzahlKraft:    ["anzahl_kraft", "anzahl", "headcount", "count"],
  stdSatzEur:     ["std_satz_eur", "stundensatz", "hourly_rate", "rate_eur", "rate"],
  hinweis:        ["hinweis", "note", "comment", "anmerkung"],
};

const SHIFT_ALIASES: Record<string, RawRosterRow["schichtTyp"]> = {
  e: "early", early: "early", f: "early", frueh: "early", "früh": "early", fr: "early",
  l: "late", late: "late", s: "late", spaet: "late", "spät": "late", sp: "late",
  n: "night", night: "night", nacht: "night",
  i: "intermediate", inter: "intermediate", intermediate: "intermediate", zwischen: "intermediate",
};

export function parseCsvOrJson(input: string): RosterParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, rows: [], errors: [{ line: 0, reason: "Eingabe leer.", raw: "" }] };

  // JSON-Array zuerst versuchen
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return parseJson(trimmed);
  }
  return parseCsv(trimmed);
}

function parseJson(input: string): RosterParseResult {
  const errors: RosterParseResult["errors"] = [];
  const rows: RawRosterRow[] = [];
  try {
    const data = JSON.parse(input);
    const arr = Array.isArray(data) ? data : Array.isArray((data as any).rows) ? (data as any).rows : null;
    if (!arr) {
      return { ok: false, rows: [], errors: [{ line: 1, reason: "JSON: erwarte Array oder { rows: [] }.", raw: input.slice(0, 120) }] };
    }
    (arr as unknown[]).forEach((raw, i) => {
      const r = normalizeRow(raw, i + 1, errors);
      if (r) rows.push(r);
    });
  } catch (e) {
    errors.push({ line: 1, reason: `JSON-Parse-Fehler: ${(e as Error).message}`, raw: input.slice(0, 120) });
  }
  return { ok: errors.length === 0 || rows.length > 0, rows, errors };
}

function parseCsv(input: string): RosterParseResult {
  const errors: RosterParseResult["errors"] = [];
  const rows: RawRosterRow[] = [];
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  if (lines.length < 2) {
    return { ok: false, rows: [], errors: [{ line: 0, reason: "Mindestens Header-Zeile + 1 Datenzeile erwartet.", raw: input }] };
  }
  const sep = lines[0].includes(";") ? ";" : ",";
  const header = lines[0].split(sep).map((h) => h.trim().toLowerCase());
  const idx = mapHeaderIndices(header);
  if (idx.datum < 0 || idx.schichtTyp < 0 || idx.stationKuerzel < 0) {
    return {
      ok: false,
      rows: [],
      errors: [{
        line: 1,
        reason: "Spalten datum, schicht_typ und station_kuerzel sind Pflicht.",
        raw: lines[0],
      }],
    };
  }
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = line.split(sep).map((c) => c.trim());
    const obj: Record<string, string> = {};
    for (const [k, v] of Object.entries(idx)) {
      if (v >= 0 && v < cells.length) obj[k] = cells[v];
    }
    const r = normalizeRow(obj, i + 1, errors);
    if (r) rows.push(r);
  }
  return { ok: errors.length < lines.length, rows, errors };
}

function mapHeaderIndices(header: string[]): Record<keyof RawRosterRow, number> {
  const out = {} as Record<keyof RawRosterRow, number>;
  (Object.keys(HEADER_ALIASES) as (keyof RawRosterRow)[]).forEach((field) => {
    out[field] = header.findIndex((h) => HEADER_ALIASES[field].includes(h));
  });
  return out;
}

function normalizeRow(raw: any, lineNo: number, errors: RosterParseResult["errors"]): RawRosterRow | null {
  const datum = String(raw.datum ?? raw.date ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    errors.push({ line: lineNo, reason: "Datum muss YYYY-MM-DD sein.", raw: JSON.stringify(raw) });
    return null;
  }
  const sRaw = String(raw.schichtTyp ?? raw.schicht_typ ?? raw.shift_type ?? raw.shift ?? "").toLowerCase();
  const schichtTyp = SHIFT_ALIASES[sRaw] ?? null;
  if (!schichtTyp) {
    errors.push({ line: lineNo, reason: `Schicht-Typ unbekannt: "${sRaw}". Erlaubt: early/late/night/intermediate.`, raw: JSON.stringify(raw) });
    return null;
  }
  const stationKuerzel = String(raw.stationKuerzel ?? raw.station_kuerzel ?? raw.station ?? "").trim();
  if (!stationKuerzel) {
    errors.push({ line: lineNo, reason: "station_kuerzel fehlt.", raw: JSON.stringify(raw) });
    return null;
  }
  const qualifikation = String(raw.qualifikation ?? raw.qualification ?? raw.qual ?? "RN").trim();
  const anzahlKraft = parseInt(String(raw.anzahlKraft ?? raw.anzahl_kraft ?? raw.anzahl ?? raw.headcount ?? "1"), 10);
  if (!Number.isFinite(anzahlKraft) || anzahlKraft < 1 || anzahlKraft > 99) {
    errors.push({ line: lineNo, reason: "anzahl_kraft 1–99.", raw: JSON.stringify(raw) });
    return null;
  }
  const stdSatzRaw = raw.stdSatzEur ?? raw.std_satz_eur ?? raw.stundensatz ?? raw.hourly_rate ?? raw.rate;
  const stdSatzEur = stdSatzRaw !== undefined && stdSatzRaw !== "" ? parseFloat(String(stdSatzRaw).replace(",", ".")) : undefined;
  return {
    datum,
    schichtTyp,
    stationKuerzel,
    qualifikation,
    anzahlKraft,
    stdSatzEur,
    hinweis: raw.hinweis || raw.note || raw.comment || undefined,
  };
}

// Beispiel-CSV als Hilfe für die Träger
export const SAMPLE_CSV = `# Shalem Care · Roster-Import-Vorlage
# Eine Zeile = Bedarf für eine Schicht. Mehr-Köpfe via anzahl_kraft.
datum,schicht_typ,station_kuerzel,qualifikation,anzahl_kraft,std_satz_eur,hinweis
2026-05-12,early,St. Lukas,RN,2,28.50,Wohnbereich Annahof
2026-05-12,late,St. Lukas,RN,1,30.00,
2026-05-12,night,St. Lukas,RN,1,32.50,Nachtzuschlag
2026-05-13,early,Pulmo-3B,RN,3,28.50,
2026-05-13,early,Pulmo-3B,ITS,1,34.00,intensiv-erfahren bevorzugt
`;
