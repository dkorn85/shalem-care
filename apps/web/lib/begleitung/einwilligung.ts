// Einwilligungs-Workflow für Würde-Begleitung.
//
// Rechtliche Grundlagen:
//  · BGB §§ 630a-h (Behandlungsvertrag, gilt sinngemäß auch für nicht-medizin. Pflege-Begleitung)
//  · BGB §§ 1814-1880 (Betreuungsrecht, Reform 2023 · „erforderliche Erforderlichkeit")
//  · DSGVO Art. 7 (Einwilligungs-Anforderungen)
//  · § 203 StGB (Schweigepflicht aller Beteiligten)
//  · § 1901a BGB (Patientenverfügung)
//
// Workflow: Aufklärung → Einwilligung dokumentiert → Verlauf-Doku jeder Sitzung
// → Widerruf jederzeit möglich → Eskalation bei Unklarheit.

export type EinwilligungsQuelle =
  | "selbst-schriftlich"
  | "selbst-muendlich-zeuge"
  | "vorsorge-bevollmaechtigt"
  | "betreuung-mit-aufgabenkreis"
  | "patientenverfuegung"
  | "in-eingewilligten-pflegeplan"
  | "noch-offen";

export type EinwilligungsStatus = "gueltig" | "lueckenhaft" | "widerrufen" | "abzuholen" | "neu-zu-pruefen";

export type Einwilligung = {
  id:               string;
  klient:           string;
  einrichtung?:     string;
  methode:          string;                 // ID aus methoden.ts
  quelle:           EinwilligungsQuelle;
  unterzeichnetAm?: string;                 // YYYY-MM-DD
  gueltigBis?:      string;                 // YYYY-MM-DD oder leer = unbefristet
  status:           EinwilligungsStatus;
  zeugin?:          string;                 // bei mündlicher Einwilligung
  bevollmaechtigte?: string;                // Name + Telefon
  betreuung?:       { person: string; aufgabenkreis: string; geschaeftsZeichen: string };
  hinweis?:         string;                 // z.B. „nur Schulter, keine Hand"
  aufgenommenVon:   string;                 // Begleiter:in, der dokumentiert hat
};

export const QUELLE_LABEL: Record<EinwilligungsQuelle, string> = {
  "selbst-schriftlich":         "selbst, schriftlich",
  "selbst-muendlich-zeuge":     "selbst, mündlich (Zeug:in)",
  "vorsorge-bevollmaechtigt":   "Vorsorge-Bevollmächtigte:r",
  "betreuung-mit-aufgabenkreis":"Betreuung · Aufgabenkreis Gesundheit",
  "patientenverfuegung":        "Patientenverfügung § 1901a BGB",
  "in-eingewilligten-pflegeplan":"im Pflegeplan-Konsens dokumentiert",
  "noch-offen":                  "noch nicht eingeholt",
};

export const STATUS_LABEL: Record<EinwilligungsStatus, string> = {
  gueltig:        "gültig",
  lueckenhaft:    "lückenhaft",
  widerrufen:     "widerrufen",
  abzuholen:      "abzuholen",
  "neu-zu-pruefen": "neu zu prüfen",
};

export const STATUS_FARBE: Record<EinwilligungsStatus, string> = {
  gueltig:           "var(--thu)",
  lueckenhaft:       "var(--vibe-approval)",
  widerrufen:        "var(--mon)",
  abzuholen:         "var(--vibe-team)",
  "neu-zu-pruefen":  "var(--accent)",
};

export const EINWILLIGUNGEN: Einwilligung[] = [
  {
    id: "ew-001",
    klient: "Helga Reinhardt",
    einrichtung: "St. Lukas WB-A · Pulmologie 3B",
    methode: "berkana-beruehrung",
    quelle: "selbst-schriftlich",
    unterzeichnetAm: "2026-03-12",
    gueltigBis: "2027-03-12",
    status: "gueltig",
    hinweis: "Nur Hand- und Schulterberührung, keine Füße (Hyperästhesie nach Lymphödem-OP)",
    aufgenommenVon: "Marlene Voss",
  },
  {
    id: "ew-002",
    klient: "Otto Tannhäuser",
    einrichtung: "St. Lukas WB-A",
    methode: "schweige-praesenz",
    quelle: "patientenverfuegung",
    unterzeichnetAm: "2024-09-04",
    status: "gueltig",
    hinweis: "Patientenverfügung wünscht Sterbe-Begleitung, gerne Nacht-Wache. Kein Vorlesen.",
    aufgenommenVon: "Marlene Voss",
  },
  {
    id: "ew-003",
    klient: "Friedrich Liebenau",
    einrichtung: "Augsburg Süd",
    methode: "biografisches-erzaehlen",
    quelle: "vorsorge-bevollmaechtigt",
    unterzeichnetAm: "2025-11-22",
    gueltigBis: "2026-11-22",
    status: "gueltig",
    bevollmaechtigte: "Tochter Heike Liebenau · 0162 / 555 8892",
    hinweis: "Aufnahme der Erinnerungen als Audio · soll nach Tod der Familie übergeben werden",
    aufgenommenVon: "Marlene Voss",
  },
  {
    id: "ew-004",
    klient: "Konrad Heuser",
    einrichtung: "Geriatrie München",
    methode: "berkana-beruehrung",
    quelle: "noch-offen",
    status: "abzuholen",
    hinweis: "Familie hat angefragt · Klient selbst kann mit Demenz Phase III nicht eindeutig zustimmen — Validation-Phase prüfen + Vorsorge-Vollmacht abrufen",
    aufgenommenVon: "Anna Berkstein",
  },
  {
    id: "ew-005",
    klient: "Edith Niemeyer",
    einrichtung: "München-Nord",
    methode: "schweige-praesenz",
    quelle: "betreuung-mit-aufgabenkreis",
    unterzeichnetAm: "2026-04-30",
    status: "gueltig",
    betreuung: {
      person: "Dr. Anna Bachmann (Berufsbetreuerin)",
      aufgabenkreis: "Gesundheitssorge + Aufenthaltsbestimmung",
      geschaeftsZeichen: "BtG 4 XVII 882/2022",
    },
    hinweis: "Diagnose Demenz fortgeschritten · Nacht-Wache zur Beruhigung · Keine Wirkstoff-Anwendung",
    aufgenommenVon: "Marlene Voss",
  },
  {
    id: "ew-006",
    klient: "Sabine Kahler",
    einrichtung: "Sonnenhof Charité",
    methode: "musik-singen",
    quelle: "selbst-muendlich-zeuge",
    unterzeichnetAm: "2026-05-04",
    status: "lueckenhaft",
    zeugin: "Pflegerin Lena Bauer (St. Lukas)",
    hinweis: "Mündliche Zustimmung zu Wiegenliedern, schriftlich noch ausstehend · innerhalb 7 Tagen nachholen",
    aufgenommenVon: "Anna Berkstein",
  },
];

export const ESKALATIONS_REGEL: { wann: string; was: string }[] = [
  { wann: "Patient widerruft (verbal oder Körpersprache)", was: "Sofortiger Abbruch · keine Nachfrage warum · 24-h-Pause · Doku in Verlauf" },
  { wann: "Bevollmächtigte:r meldet Ablehnung", was: "Begleitung pausiert · Re-Aufklärung mit Bevollmächtigter:em" },
  { wann: "Pflege beobachtet Veränderung in Mimik / Vitalwerten", was: "Begleitung beendet · Pflege-Übergabe + Doku · keine erneute Sitzung ohne neue Einwilligung" },
  { wann: "Familie äußert Sorge", was: "Anhören · Stationsleitung informieren · ggf. Trio-Gespräch (Familie + Begleitung + PDL)" },
  { wann: "Eigenes Bauchgefühl der/des Begleiter:in", was: "Wahrnehmen ist Pflicht · Sitzung beenden · Supervision in nächster Sitzung" },
];

export function einwilligungenNachStatus(s: EinwilligungsStatus): Einwilligung[] {
  return EINWILLIGUNGEN.filter((e) => e.status === s);
}

export function ablaufendIn(tage = 60): Einwilligung[] {
  const grenze = Date.now() + tage * 86400000;
  return EINWILLIGUNGEN.filter((e) => e.gueltigBis && +new Date(e.gueltigBis) <= grenze && e.status === "gueltig");
}
