// Schicht-File-Historie · jede Pflege-Schicht hat ihre eigene Akte.
//
// DACH-Vision (siehe docs/DACH_HARMONIC_FLOW.md): "jede Schicht digital
// nachvollziehbar" — pro Schicht ein append-only File mit
// - Übergabe-Briefing (von letzter Schicht)
// - Doku-Eintraegen waehrend der Schicht
// - Schicht-Chat-Auszuegen (mit @lana-Bot)
// - Verbandwechsel, Vital-Messungen, Vergaben
// - End-Briefing (an naechste Schicht)
// - Audit-Trail (wer hat was wann eingetragen)
//
// Phase-1: in-memory globalThis. Phase-2: Supabase + RLS pro Mandant +
// Hash-Kette gegen Manipulation (siehe Audit-Log-Pattern).

export type SchichtTyp = "frueh" | "spaet" | "nacht" | "tag";

export type EintragsTyp =
  | "uebergabe_in"           // Briefing von letzter Schicht (Auto-generiert oder manuell)
  | "doku"                    // freie Pflege-Doku
  | "vital"                   // RR/Puls/Temp/SpO2
  | "wundverband"             // Verbandwechsel
  | "vergabe"                 // Medikation
  | "schmerz"                 // NRS-Eintrag
  | "ereignis"                // Sturz, Anruf, Familienbesuch
  | "chat_auszug"             // wichtige Schicht-Chat-Nachricht
  | "ki_assistenz"            // @lana-Antwort die markiert wurde
  | "uebergabe_out";          // Briefing an naechste Schicht

export type SchichtEintrag = {
  id: string;
  zeitstempel: string;          // ISO datetime
  typ: EintragsTyp;
  vonPersonId: string;
  vonName: string;
  klientId?: string;            // wenn klient-bezogen
  klientName?: string;
  inhalt: string;               // Klartext
  meta?: Record<string, string>; // optionale Felder (NRS, RR, etc.)
};

export type SchichtFile = {
  id: string;                   // schicht-{datum}-{personId}-{typ}
  datumISO: string;             // YYYY-MM-DD
  schichtTyp: SchichtTyp;
  personId: string;
  personName: string;
  einrichtung: string;
  station: string;
  startISO: string;             // ISO datetime
  endISO?: string;              // gesetzt bei Schicht-Ende
  status: "geplant" | "laeuft" | "beendet";
  eintraege: SchichtEintrag[];
  audit: { event: string; bei: string; durch: string }[];
};

type State = { schichten: SchichtFile[] };
type GlobalShape = { __shalemSchichtHistorie?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemSchichtHistorie) g.__shalemSchichtHistorie = { schichten: [] };
const s = g.__shalemSchichtHistorie!;

export function listeAlle(): SchichtFile[] {
  return [...s.schichten].sort((a, b) => b.startISO.localeCompare(a.startISO));
}

export function getSchicht(id: string): SchichtFile | null {
  return s.schichten.find((sc) => sc.id === id) ?? null;
}

export function listeFuerPerson(personId: string, limit = 30): SchichtFile[] {
  return s.schichten
    .filter((sc) => sc.personId === personId)
    .sort((a, b) => b.startISO.localeCompare(a.startISO))
    .slice(0, limit);
}

export function listeFuerKlient(klientId: string, limit = 30): SchichtFile[] {
  return s.schichten
    .filter((sc) => sc.eintraege.some((e) => e.klientId === klientId))
    .sort((a, b) => b.startISO.localeCompare(a.startISO))
    .slice(0, limit);
}

export function neueSchicht(input: {
  datumISO: string;
  schichtTyp: SchichtTyp;
  personId: string;
  personName: string;
  einrichtung: string;
  station: string;
  startISO?: string;
}): SchichtFile {
  const id = `schicht-${input.datumISO}-${input.personId}-${input.schichtTyp}`;
  const existing = getSchicht(id);
  if (existing) return existing;

  const startISO = input.startISO ?? `${input.datumISO}T${defaultStart(input.schichtTyp)}:00`;
  const sch: SchichtFile = {
    id,
    datumISO: input.datumISO,
    schichtTyp: input.schichtTyp,
    personId: input.personId,
    personName: input.personName,
    einrichtung: input.einrichtung,
    station: input.station,
    startISO,
    status: "geplant",
    eintraege: [],
    audit: [{ event: "neueSchicht", bei: new Date().toISOString(), durch: input.personId }],
  };
  s.schichten.push(sch);
  return sch;
}

export function starteSchicht(id: string): SchichtFile | null {
  const sc = getSchicht(id);
  if (!sc) return null;
  sc.status = "laeuft";
  sc.audit.push({ event: "starteSchicht", bei: new Date().toISOString(), durch: sc.personId });
  return sc;
}

export function beendeSchicht(id: string, uebergabeOut?: string): SchichtFile | null {
  const sc = getSchicht(id);
  if (!sc) return null;
  sc.status = "beendet";
  sc.endISO = new Date().toISOString();
  if (uebergabeOut) {
    sc.eintraege.push(eintragBauen(sc.personId, sc.personName, "uebergabe_out", uebergabeOut));
  }
  sc.audit.push({ event: "beendeSchicht", bei: new Date().toISOString(), durch: sc.personId });
  return sc;
}

export function ergaenzeEintrag(input: {
  schichtId: string;
  typ: EintragsTyp;
  vonPersonId: string;
  vonName: string;
  inhalt: string;
  klientId?: string;
  klientName?: string;
  meta?: Record<string, string>;
}): SchichtEintrag | null {
  const sc = getSchicht(input.schichtId);
  if (!sc) return null;
  if (sc.status === "beendet") return null;     // append-only nur waehrend "geplant" oder "laeuft"
  const e = eintragBauen(input.vonPersonId, input.vonName, input.typ, input.inhalt, input.klientId, input.klientName, input.meta);
  sc.eintraege.push(e);
  sc.audit.push({ event: `eintrag:${input.typ}`, bei: e.zeitstempel, durch: input.vonPersonId });
  return e;
}

function eintragBauen(
  personId: string,
  personName: string,
  typ: EintragsTyp,
  inhalt: string,
  klientId?: string,
  klientName?: string,
  meta?: Record<string, string>,
): SchichtEintrag {
  return {
    id: `eintrag-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    zeitstempel: new Date().toISOString(),
    typ,
    vonPersonId: personId,
    vonName: personName,
    klientId,
    klientName,
    inhalt,
    meta,
  };
}

function defaultStart(typ: SchichtTyp): string {
  if (typ === "frueh") return "06:00";
  if (typ === "spaet") return "13:00";
  if (typ === "nacht") return "21:00";
  return "08:00";
}

// ─── Demo-Seed ────────────────────────────────────────────────────────

let _seeded = false;
export function seedSchichtHistorieOnce() {
  if (_seeded) return;
  _seeded = true;

  // Letzte 3 Tage Frühschichten von Aylin Stein in St. Lukas WB-A
  const heute = new Date();
  for (let tageZurueck = 3; tageZurueck >= 1; tageZurueck--) {
    const d = new Date(heute);
    d.setDate(heute.getDate() - tageZurueck);
    const datumISO = d.toISOString().slice(0, 10);
    const sch = neueSchicht({
      datumISO,
      schichtTyp: "frueh",
      personId: "person-as-005",
      personName: "Aylin Stein",
      einrichtung: "St. Lukas Bochum",
      station: "Wohnbereich A",
    });
    starteSchicht(sch.id);
    ergaenzeEintrag({
      schichtId: sch.id,
      typ: "uebergabe_in",
      vonPersonId: "person-fk-004",
      vonName: "Felix Kaminski",
      inhalt: "Helga ruhige Nacht, NRS 3 zur Weckung. Wilhelm Inkontinenz 2x. Otto unauffällig.",
    });
    ergaenzeEintrag({
      schichtId: sch.id,
      typ: "vital",
      vonPersonId: "person-as-005",
      vonName: "Aylin Stein",
      klientId: "klient-hr",
      klientName: "Helga Reinhardt",
      inhalt: "RR 132/82 · Puls 78 · Temp 36.6 · SpO₂ 96 %",
      meta: { rr: "132/82", puls: "78", temp: "36.6", spo2: "96" },
    });
    ergaenzeEintrag({
      schichtId: sch.id,
      typ: "wundverband",
      vonPersonId: "person-as-005",
      vonName: "Aylin Stein",
      klientId: "klient-hr",
      klientName: "Helga Reinhardt",
      inhalt: `Sakraldekubitus: Fläche ${tageZurueck === 3 ? "3.1" : tageZurueck === 2 ? "2.9" : "2.6"} cm², 70 % Granulation, Hydrokolloid neu.`,
    });
    ergaenzeEintrag({
      schichtId: sch.id,
      typ: "vergabe",
      vonPersonId: "person-as-005",
      vonName: "Aylin Stein",
      klientId: "klient-hr",
      klientName: "Helga Reinhardt",
      inhalt: "Tilidin 100/8 retard 1-0-1 (verordnet Dr. Hartmann)",
    });
    ergaenzeEintrag({
      schichtId: sch.id,
      typ: "schmerz",
      vonPersonId: "klient-hr",
      vonName: "Helga Reinhardt",
      klientId: "klient-hr",
      klientName: "Helga Reinhardt",
      inhalt: "NRS 2 nach Mobilisation",
      meta: { nrs: "2" },
    });
    if (tageZurueck === 1) {
      ergaenzeEintrag({
        schichtId: sch.id,
        typ: "ki_assistenz",
        vonPersonId: "lana-bot",
        vonName: "Lana (Bot)",
        inhalt: "@aylin: Wundbett zeigt stetige Verbesserung — Hydrokolloid-Wechsel kannst du auf 3 Tage ausdehnen, falls Exsudat gering bleibt.",
      });
    }
    beendeSchicht(sch.id, `Helga: Wunde stabil, Nacht-Ausfälle minimal. Wilhelm: Atmung leicht angestrengt. Otto: ruhig.`);
  }

  // Heutige Schicht (laufend)
  const heuteISO = heute.toISOString().slice(0, 10);
  const heuteSch = neueSchicht({
    datumISO: heuteISO,
    schichtTyp: "frueh",
    personId: "person-as-005",
    personName: "Aylin Stein",
    einrichtung: "St. Lukas Bochum",
    station: "Wohnbereich A",
  });
  starteSchicht(heuteSch.id);
  ergaenzeEintrag({
    schichtId: heuteSch.id,
    typ: "uebergabe_in",
    vonPersonId: "person-fk-004",
    vonName: "Felix Kaminski",
    inhalt: "Helga gut geschlafen, NRS 2. Wilhelm leichte Atemnot 04:30, hat sich beruhigt. Otto ruhig.",
  });
  ergaenzeEintrag({
    schichtId: heuteSch.id,
    typ: "vital",
    vonPersonId: "person-as-005",
    vonName: "Aylin Stein",
    klientId: "klient-wb",
    klientName: "Wilhelm Brand",
    inhalt: "RR 138/86 · Puls 92 · Temp 36.9 · SpO₂ 89 %",
    meta: { rr: "138/86", puls: "92", temp: "36.9", spo2: "89" },
  });
}

// ─── Aggregierte Statistiken ─────────────────────────────────────────

export function statistikFuerPerson(personId: string): {
  geplant: number;
  laufend: number;
  beendet: number;
  eintragsAnzahl: number;
} {
  const eigene = s.schichten.filter((sc) => sc.personId === personId);
  return {
    geplant: eigene.filter((sc) => sc.status === "geplant").length,
    laufend: eigene.filter((sc) => sc.status === "laeuft").length,
    beendet: eigene.filter((sc) => sc.status === "beendet").length,
    eintragsAnzahl: eigene.reduce((sum, sc) => sum + sc.eintraege.length, 0),
  };
}
