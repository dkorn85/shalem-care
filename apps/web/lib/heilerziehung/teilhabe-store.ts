// Heilerziehung-Teilhabe-Store · Phase-1-Pattern.
// 4 Bewohner:innen einer ambulanten Wohngruppe mit ICF-Bedarfsbogen,
// Teilhabe-Zielen nach BTHG, Selbstvertretungs-Hinweis.

export type IcfTeilhabe = {
  code: string;
  label: string;
  bewertung: 0 | 1 | 2 | 3 | 4;
};

export type TeilhabeZiel = {
  id: string;
  text: string;
  bereich: "Wohnen" | "Arbeit" | "Bildung" | "Sozial" | "Gesundheit" | "Freizeit";
  status: "läuft" | "vorbereitet" | "erreicht";
  bisWann: string;
};

export type TeilhabeKlient = {
  id: string;
  name: string;
  geburt: string;
  diagnose: string;
  setting: string;             // Wohngruppe ambulant / stationär
  selbstvertretung: string;    // wer spricht
  ueberschrift: string;
  farbe: string;
  bedarf: IcfTeilhabe[];
  ziele: TeilhabeZiel[];
  letzteHilfeplankonferenz: string;
  naechsteHilfeplankonferenz: string;
  pBudget: { aktiv: boolean; betragMtl?: number; verwendung?: string };
};

const KLIENTEN: TeilhabeKlient[] = [
  {
    id: "tk-julian",
    name: "Julian Reuter",
    geburt: "1992-06-14",
    diagnose: "Trisomie 21 · leichte geistige Behinderung",
    setting: "Wohngruppe ambulant · 4 Personen",
    selbstvertretung: "spricht selbst · Mutter als Vertrauensperson auf Wunsch",
    ueberschrift: "Eigenständiges Wohnen + Arbeit in WfbM",
    farbe: "var(--sat)",
    bedarf: [
      { code: "d177", label: "Entscheidungen treffen",        bewertung: 2 },
      { code: "d230", label: "Tägliche Routine durchführen", bewertung: 2 },
      { code: "d640", label: "Hausarbeiten erledigen",         bewertung: 2 },
      { code: "d850", label: "Bezahlte Tätigkeit",             bewertung: 3 },
      { code: "d920", label: "Erholung + Freizeit",            bewertung: 1 },
    ],
    ziele: [
      { id: "z-1", text: "Eigene Mahlzeiten 4×/Wo. selbst zubereiten",       bereich: "Wohnen",    status: "läuft",       bisWann: "Q3 2026" },
      { id: "z-2", text: "WfbM-Wechsel von Verpackung zu Holz-Werkstatt",     bereich: "Arbeit",    status: "vorbereitet", bisWann: "Q4 2026" },
      { id: "z-3", text: "Sportverein-Mitgliedschaft (Special Olympics Schwimmen)", bereich: "Freizeit", status: "läuft",       bisWann: "06/2026" },
    ],
    letzteHilfeplankonferenz: "2026-02-20",
    naechsteHilfeplankonferenz: "2026-08-20",
    pBudget: { aktiv: true, betragMtl: 1250, verwendung: "Wohn-Assistenz 12 h/Wo · Freizeit-Begleitung" },
  },
  {
    id: "tk-marek",
    name: "Marek Polanski",
    geburt: "1988-11-30",
    diagnose: "Z.n. SHT · kognitive Einschränkung mittel",
    setting: "Wohngruppe ambulant · alleine wohnend mit Assistenz",
    selbstvertretung: "spricht selbst · Betreuer (gesetzlich) für Vermögen",
    ueberschrift: "Wiedereinstieg in selbstbestimmte Tagesstruktur",
    farbe: "var(--vibe-team)",
    bedarf: [
      { code: "b144", label: "Funktionen des Gedächtnisses",   bewertung: 2 },
      { code: "b164", label: "Höhere kognitive Funktionen",    bewertung: 2 },
      { code: "d175", label: "Probleme lösen",                  bewertung: 2 },
      { code: "d230", label: "Tägliche Routine durchführen",   bewertung: 3 },
      { code: "d570", label: "Auf seine Gesundheit achten",     bewertung: 2 },
    ],
    ziele: [
      { id: "z-1", text: "Wochenplaner mit visuellen Ankern eigenständig nutzen",  bereich: "Wohnen", status: "läuft",       bisWann: "Q3 2026" },
      { id: "z-2", text: "Medikamenten-Compliance ohne tägliches Erinnern",          bereich: "Gesundheit", status: "läuft",       bisWann: "Q3 2026" },
      { id: "z-3", text: "Praktikum 1×/Wo bei der Stadtgärtnerei",                    bereich: "Arbeit", status: "vorbereitet", bisWann: "10/2026" },
    ],
    letzteHilfeplankonferenz: "2026-03-10",
    naechsteHilfeplankonferenz: "2026-09-10",
    pBudget: { aktiv: false },
  },
  {
    id: "tk-aisha",
    name: "Aisha Diallo",
    geburt: "2003-04-08",
    diagnose: "Frühkindlicher Autismus · Asperger-Spektrum",
    setting: "Wohngruppe ambulant · WG mit zwei Mitbewohner:innen",
    selbstvertretung: "spricht selbst · braucht visuelle Unterstützung in neuen Settings",
    ueberschrift: "Übergang Schule → Ausbildung",
    farbe: "var(--thu)",
    bedarf: [
      { code: "b126", label: "Temperament + Persönlichkeit",     bewertung: 2 },
      { code: "b1521", label: "Affektkontrolle",                  bewertung: 2 },
      { code: "d350", label: "Konversation",                       bewertung: 2 },
      { code: "d710", label: "Elementare interpersonelle Aktivitäten", bewertung: 2 },
      { code: "d825", label: "Berufsausbildung",                    bewertung: 2 },
    ],
    ziele: [
      { id: "z-1", text: "BvB-Maßnahme Mediengestaltung erfolgreich beginnen", bereich: "Bildung", status: "vorbereitet", bisWann: "09/2026" },
      { id: "z-2", text: "Kontakt-Routine mit zwei Bekannten halten",            bereich: "Sozial",  status: "läuft",       bisWann: "Q3 2026" },
      { id: "z-3", text: "Reizpause-Strategien in Stress-Situationen anwenden",  bereich: "Gesundheit", status: "läuft",     bisWann: "Q3 2026" },
    ],
    letzteHilfeplankonferenz: "2026-04-05",
    naechsteHilfeplankonferenz: "2026-07-05",
    pBudget: { aktiv: true, betragMtl: 980, verwendung: "1:1-Assistenz für BvB-Anbahnung · 8 h/Wo" },
  },
  {
    id: "tk-erika",
    name: "Erika Hartwig",
    geburt: "1957-02-22",
    diagnose: "Erworbene Behinderung nach Schlaganfall · Hemiparese li.",
    setting: "Wohngruppe stationär · Pflegestufe + EinglH-Mix",
    selbstvertretung: "Sohn als Vertrauensperson · Klientin spricht selbst, langsamer",
    ueberschrift: "Erhalt der Selbstständigkeit + soziale Teilhabe",
    farbe: "var(--mon)",
    bedarf: [
      { code: "b730", label: "Funktionen der Muskelkraft",     bewertung: 3 },
      { code: "d410", label: "Körperposition wechseln",         bewertung: 3 },
      { code: "d450", label: "Gehen",                           bewertung: 3 },
      { code: "d540", label: "Sich kleiden",                    bewertung: 2 },
      { code: "d910", label: "Gemeinschaftsleben",              bewertung: 2 },
    ],
    ziele: [
      { id: "z-1", text: "Selbst frühstücken + Anziehen oben (links angepasst)",  bereich: "Wohnen", status: "läuft",       bisWann: "06/2026" },
      { id: "z-2", text: "Wöchentlich 1× Café-Besuch im Stadtteil",                  bereich: "Sozial", status: "vorbereitet", bisWann: "06/2026" },
      { id: "z-3", text: "Logopädie-Verbesserung Sprachtempo + Klarheit",            bereich: "Gesundheit", status: "läuft",     bisWann: "Q3 2026" },
    ],
    letzteHilfeplankonferenz: "2026-04-12",
    naechsteHilfeplankonferenz: "2026-10-12",
    pBudget: { aktiv: false },
  },
];

export function listTeilhabeKlienten(): TeilhabeKlient[] {
  return KLIENTEN;
}

export function getTeilhabeKlient(id: string): TeilhabeKlient | null {
  return KLIENTEN.find((k) => k.id === id) ?? null;
}

export const TEILHABE_BEREICH_FARBE: Record<TeilhabeZiel["bereich"], string> = {
  Wohnen:     "var(--sat)",
  Arbeit:     "var(--vibe-team)",
  Bildung:    "var(--vibe-approval)",
  Sozial:     "var(--thu)",
  Gesundheit: "var(--mon)",
  Freizeit:   "var(--fri)",
};

export const TEILHABE_STATUS_FARBE: Record<TeilhabeZiel["status"], string> = {
  läuft:       "var(--vibe-team)",
  vorbereitet: "var(--vibe-approval)",
  erreicht:    "var(--thu)",
};
