// Hilfsmittel-Wiedereinsatz-Pool nach § 33 Abs. 6 SGB V.
//
// Krankenkassen sind verpflichtet, Hilfsmittel wiederzuverwenden statt
// neu zu beschaffen, wenn das wirtschaftlich + hygienisch sinnvoll ist.
// Das spart Kosten + ist gelebte Nachhaltigkeit.
//
// Aufbereitungs-Standards: KRINKO-/BfArM-Empfehlung 2012 (Anforderungen
// an die Hygiene bei der Aufbereitung von Medizinprodukten) — kategorisiert
// in unkritisch / semikritisch A+B / kritisch A+B+C.

export type PoolStatus =
  | "verfuegbar"
  | "ausgeliehen"
  | "in-aufbereitung"
  | "defekt"
  | "ausgemustert";

export type AufbereitungsKategorie =
  | "unkritisch"           // berührt intakte Haut · z.B. Pflegebett, Rollator
  | "semikritisch-A"       // Schleimhautkontakt · z.B. Beatmungsmasken
  | "semikritisch-B"       // schwer reinigbar · z.B. Beatmungsschläuche
  | "kritisch-A"           // chirurgische Instrumente einfach
  | "kritisch-B"           // schwer · z.B. Endoskope
  | "kritisch-C";          // mit besonderen Anforderungen · Implantate-Werkzeuge

export type PoolHilfsmittel = {
  id:               string;
  bezeichnung:      string;
  hmvNummer:        string;            // GKV-Hilfsmittelverzeichnis-Nr.
  kategorie:        AufbereitungsKategorie;
  status:           PoolStatus;
  einsaetze:        number;            // Wiedereinsatz-Zähler
  letzterEinsatz?:  string;
  letzteAufbereitung?: string;
  aufbereitungsStelle?: string;
  klient?:          string;
  einrichtung?:     string;
  neuwertEUR:       number;
  wiederbeschaffungAlsoEUR: number;    // Differenz Neukauf - Aufbereitung = Ersparnis
};

export const KATEGORIE_LABEL: Record<AufbereitungsKategorie, string> = {
  "unkritisch":      "unkritisch · intakte Haut",
  "semikritisch-A":  "semikrit. A · Schleimhaut",
  "semikritisch-B":  "semikrit. B · schwer reinigbar",
  "kritisch-A":      "kritisch A · OP-Instrumente",
  "kritisch-B":      "kritisch B · Endoskope",
  "kritisch-C":      "kritisch C · höchste Anforderung",
};

export const STATUS_LABEL: Record<PoolStatus, string> = {
  "verfuegbar":      "verfügbar im Pool",
  "ausgeliehen":     "im Einsatz",
  "in-aufbereitung": "wird aufbereitet",
  "defekt":          "defekt · Reparatur",
  "ausgemustert":    "ausgemustert",
};

export const STATUS_FARBE: Record<PoolStatus, string> = {
  "verfuegbar":      "var(--thu)",
  "ausgeliehen":     "var(--vibe-team)",
  "in-aufbereitung": "var(--vibe-stats)",
  "defekt":          "var(--vibe-approval)",
  "ausgemustert":    "var(--fg-mute)",
};

export const POOL: PoolHilfsmittel[] = [
  {
    id: "p-001", bezeichnung: "Pflegebett Burmeier Dali Standard",
    hmvNummer: "19.40.01.0001", kategorie: "unkritisch", status: "ausgeliehen",
    einsaetze: 4, letzterEinsatz: "2025-09-12", letzteAufbereitung: "2025-09-08",
    aufbereitungsStelle: "MEDsupply Nord-Hygiene", klient: "Helga Reinhardt",
    einrichtung: "Pulmologie 3B", neuwertEUR: 1850, wiederbeschaffungAlsoEUR: 1380,
  },
  {
    id: "p-002", bezeichnung: "Wechseldruck-Matratze ProActive3 Q2",
    hmvNummer: "11.29.01.4022", kategorie: "unkritisch", status: "in-aufbereitung",
    einsaetze: 2, letzterEinsatz: "2026-04-30", letzteAufbereitung: "—",
    aufbereitungsStelle: "MEDsupply Nord-Hygiene", neuwertEUR: 2200, wiederbeschaffungAlsoEUR: 1750,
  },
  {
    id: "p-003", bezeichnung: "Patientenheber Joey Aktiv-Lifter Hercules",
    hmvNummer: "22.40.01.0001", kategorie: "unkritisch", status: "defekt",
    einsaetze: 7, letzterEinsatz: "2026-04-15", letzteAufbereitung: "2026-04-15",
    aufbereitungsStelle: "MEDsupply Nord-Werkstatt", neuwertEUR: 3400, wiederbeschaffungAlsoEUR: 2900,
  },
  {
    id: "p-004", bezeichnung: "Rollator Topro Troja 2G Premium",
    hmvNummer: "10.50.04.1015", kategorie: "unkritisch", status: "verfuegbar",
    einsaetze: 3, letzterEinsatz: "2026-03-22", letzteAufbereitung: "2026-03-25",
    aufbereitungsStelle: "MEDsupply Nord-Hygiene", neuwertEUR: 580, wiederbeschaffungAlsoEUR: 380,
  },
  {
    id: "p-005", bezeichnung: "CPAP-Maske ResMed AirFit F30 (Ganzgesicht)",
    hmvNummer: "14.24.07.2010", kategorie: "semikritisch-A", status: "ausgemustert",
    einsaetze: 1, letzterEinsatz: "2025-12-01", letzteAufbereitung: "—",
    aufbereitungsStelle: "—", neuwertEUR: 220, wiederbeschaffungAlsoEUR: 0,
    // Patientenkontakt-Bestandteil → Einmalprodukt nach Hygiene-Empfehlung
  },
  {
    id: "p-006", bezeichnung: "Inhalationsgerät Pari Boy Classic",
    hmvNummer: "14.24.04.0001", kategorie: "semikritisch-B", status: "ausgeliehen",
    einsaetze: 2, letzterEinsatz: "2026-04-02", letzteAufbereitung: "2026-04-01",
    aufbereitungsStelle: "MEDsupply Hygiene-Wäscherei", klient: "Inge Mayrhofer",
    einrichtung: "Münchner Geriatrie", neuwertEUR: 165, wiederbeschaffungAlsoEUR: 110,
  },
];

export function poolNachStatus(s: PoolStatus): PoolHilfsmittel[] {
  return POOL.filter((p) => p.status === s);
}

export function ersparnisGesamt(): number {
  return POOL.reduce((sum, p) => sum + p.einsaetze * p.wiederbeschaffungAlsoEUR, 0);
}

export function durchlauf(): number {
  return POOL.filter((p) => p.status !== "ausgemustert").reduce((s, p) => s + p.einsaetze, 0);
}
