// Trauerbegleitung im Bestatter-Cockpit.
//
// Quellen: Verena Kast „Trauern" (4 Phasen), Yorick Spiegel „Der
// Prozeß des Trauerns", Bundesverband Trauerbegleitung e.V. (BVT)
// 2023 Standards, Trauerphasen-Modell Kübler-Ross (5 Phasen,
// in DE umstritten — Phasen-Theorie heute eher als „Tasks"-Modell
// nach Worden).

export type TrauerPhase =
  | "schock"
  | "kontroll-aufbruch"
  | "suchen-trennen"
  | "neuer-bezug";

export const PHASE_KAST: Record<TrauerPhase, { label: string; beschreibung: string; was_pflege_kann: string }> = {
  "schock": {
    label: "1 · Nicht-Wahrhaben-Wollen (Schock)",
    beschreibung: "Stunden bis Tage nach der Todes-Nachricht. Funktion ist eingeschränkt, Realität wird abgewehrt. Körperliche Leere, Taubheit.",
    was_pflege_kann: "Da sein, Tee anbieten, sachte Strukturierung des nächsten Schritts. Keine Trost-Sätze. Telefonbereitschaft signalisieren.",
  },
  "kontroll-aufbruch": {
    label: "2 · Aufbrechende Emotionen",
    beschreibung: "Schmerz, Wut, Schuldgefühle, Idealisierung der/des Verstorbenen. Auch körperliche Reaktionen (Schlafstörung, Appetit-Verlust).",
    was_pflege_kann: "Aushalten lassen ohne Bewertung. Anregung zu Bewegung + Schlaf. Auf Suizidgedanken/Substanz-Konsum hören.",
  },
  "suchen-trennen": {
    label: "3 · Suchen + Sich-Trennen",
    beschreibung: "Hin- und Hergerissen zwischen Festhalten und Loslassen. Erinnerungs-Welt wird durchlebt, Bilder werden geordnet.",
    was_pflege_kann: "Bei Lebensbuch/Erinnerungs-Box mitwirken. Hospiz-Trauergruppe vorschlagen. Geduld bei Wiederholungen.",
  },
  "neuer-bezug": {
    label: "4 · Neuer Selbst- und Weltbezug",
    beschreibung: "Eigene Identität jenseits der Beziehung wird neu gefunden. Verstorbene Person bleibt innerlich verbunden, blockiert aber das Leben nicht mehr.",
    was_pflege_kann: "Wieder-Einbeziehung in Aktivitäten, Erinnerungs-Rituale (Geburtstag, Todestag) gemeinsam planen. Loslassen feiern.",
  },
};

export const PHASE_FARBE: Record<TrauerPhase, string> = {
  "schock":            "var(--mon)",
  "kontroll-aufbruch": "var(--vibe-approval)",
  "suchen-trennen":    "var(--vibe-team)",
  "neuer-bezug":       "var(--thu)",
};

export type Begleitung = {
  id:                  string;
  trauernde:           string;
  beziehungZuVerstorbener: string;        // z.B. "Tochter", "Ehemann"
  verstorben:          string;
  phase:               TrauerPhase;
  kontaktArt:          "einzel" | "gruppe" | "telefon" | "hausbesuch";
  zeitstrahl:          string;            // freier Text mit Daten + Anlässen
  besondereLage?:      string;            // Komplizierte Trauer · Suizid · Kindstod · Verlust mehrerer
  naechstesGespraech?: string;            // ISO Datum
  empfehlungWeiterer?: string[];          // Telefon-Seelsorge, AETAS, Hospiz-Gruppe
};

export const BEGLEITUNGEN: Begleitung[] = [
  {
    id: "tb-001",
    trauernde: "Liane Volkmann",
    beziehungZuVerstorbener: "Tochter",
    verstorben: "Margot Volkmann (87, Mutter)",
    phase: "kontroll-aufbruch",
    kontaktArt: "einzel",
    zeitstrahl: "Tod 06.05. · Aufbahrung 07.05. mit ganzer Familie · Trauergespräch 09.05. (vor Trauerfeier) · Trauerfeier Sa 14:00",
    naechstesGespraech: "2026-05-09T11:00:00",
    empfehlungWeiterer: ["Hospiz Trauer-Café Berlin (Mo 17 Uhr)", "Buch: Roland Kachler · 'Meine Trauer wird dich finden'"],
  },
  {
    id: "tb-002",
    trauernde: "Familie Bachmann",
    beziehungZuVerstorbener: "Eltern + 4-jährige Schwester",
    verstorben: "Levi Bachmann (8, Sohn)",
    phase: "schock",
    kontaktArt: "hausbesuch",
    zeitstrahl: "Tod 06.05. 09:55 · Eltern bei Versorgung dabei · Mutter bewahrt Stofftier 'Henri' · Vater funktioniert noch, telefoniert mit Verwandtschaft",
    besondereLage: "Tod eines Kindes nach langer Onko-Krankheit · Geschwister-Trauer der 4jährigen Anna",
    naechstesGespraech: "2026-05-08T16:00:00",
    empfehlungWeiterer: [
      "Kinderhospiz Sonnenhof · Trauer-Programm für verwaiste Geschwister",
      "Verwaiste Eltern Berlin-Brandenburg e.V.",
      "AETAS Kinderstiftung · Notfall-Pädagogik",
      "Bundesverband Trauerbegleitung BVT · Liste zertifizierter Kinder-Trauer-Begleiter:innen",
    ],
  },
  {
    id: "tb-003",
    trauernde: "Gabriele Liedtke",
    beziehungZuVerstorbener: "Ehefrau (62 Jahre verheiratet)",
    verstorben: "Hubertus Liedtke (91, Ehemann)",
    phase: "schock",
    kontaktArt: "telefon",
    zeitstrahl: "Tod 06.05. 11:42 in Klinik (Begleitperson des sterbenden Enkels) · seit 7 h erreicht, Sohn bei ihr",
    naechstesGespraech: "2026-05-07T10:00:00",
    empfehlungWeiterer: ["Telefonseelsorge 0800 111 0 111 (24h, kostenfrei)"],
  },
  {
    id: "tb-004",
    trauernde: "Erna Schreiber",
    beziehungZuVerstorbener: "Witwe",
    verstorben: "Heinz Schreiber († 09/2025)",
    phase: "suchen-trennen",
    kontaktArt: "gruppe",
    zeitstrahl: "8 Monate nach Tod · regelmäßig in Trauergruppe (4. Mal) · Lebensbuch begonnen · plant Reise nach Sylt, der Lieblingsort",
    naechstesGespraech: "2026-05-12T18:00:00",
  },
  {
    id: "tb-005",
    trauernde: "Tobias Stein",
    beziehungZuVerstorbener: "Vater",
    verstorben: "Andreas Stein († 11/2025, Suizid)",
    phase: "kontroll-aufbruch",
    kontaktArt: "einzel",
    zeitstrahl: "6 Monate nach Tod · Schuld + Wut wechseln sich ab · keine Erklärung gefunden",
    besondereLage: "Suizid des Vaters · komplizierte Trauer mit traumatischem Anteil · Therapie parallel",
    naechstesGespraech: "2026-05-10T14:00:00",
    empfehlungWeiterer: [
      "AGUS e.V. (Angehörige um Suizid)",
      "Trauma-Therapie Empfehlung der KV-Liste · keine Bestatter-Aufgabe, nur Brücke",
    ],
  },
];

export type Notfallkontakt = {
  was:   string;
  wann:  string;
  ruf:   string;
};

export const NOTFALL_KONTAKTE: Notfallkontakt[] = [
  { was: "Telefonseelsorge",                    wann: "24 h, kostenfrei",     ruf: "0800 111 0 111" },
  { was: "Krisendienst Bayern",                  wann: "24 h",                 ruf: "0800 655 3000" },
  { was: "Berliner Krisendienst",                wann: "16-24 Uhr",             ruf: "030 / 390 63 00" },
  { was: "AGUS · nach Suizid",                   wann: "Mo-Fr 9-13",           ruf: "0921 / 150 03 80" },
  { was: "Hospizverband NRW (Trauer)",            wann: "Mo-Fr 10-15",          ruf: "02307 / 87 89 0" },
  { was: "AETAS · Kinder-Trauma + -Trauer",       wann: "24 h Notfall",         ruf: "089 / 76 75 65 27" },
  { was: "Verwaiste Eltern Bundesverband",        wann: "Mo-Fr 10-12",          ruf: "030 / 80 10 95 02" },
];

export function begleitungenNachPhase(p: TrauerPhase): Begleitung[] {
  return BEGLEITUNGEN.filter((b) => b.phase === p);
}

export function offeneGespraeche(innerhalbTage = 14): Begleitung[] {
  const grenze = Date.now() + innerhalbTage * 86400000;
  return BEGLEITUNGEN.filter((b) => b.naechstesGespraech && +new Date(b.naechstesGespraech) <= grenze);
}
