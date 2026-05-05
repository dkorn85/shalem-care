// Wundverlauf — Foto-Doku mit Längsbefund.
//
// Phase 1: in-memory Store, Foto als data-URL oder public-Pfad.
// Phase 2: FHIR Observation (LOINC 72175-3 Wound assessment) +
// DocumentReference fuer Foto + ImagingStudy fuer Wound-Photo-DICOM.
//
// Standard: DNQP-Expertenstandard "Pflege von Menschen mit chronischen
// Wunden", aktuelle Aktualisierung 2024.

export type Wundlokalisation =
  | "sakrum" | "trochanter_li" | "trochanter_re"
  | "ferse_li" | "ferse_re"
  | "knoechel_li" | "knoechel_re"
  | "unterschenkel_li" | "unterschenkel_re"
  | "knie_li" | "knie_re"
  | "ellbogen_li" | "ellbogen_re"
  | "ohr_li" | "ohr_re" | "okziput"
  | "abdomen" | "thorax" | "ruecken"
  | "sonstige";

export const WUNDLOK_LABEL: Record<Wundlokalisation, string> = {
  sakrum:           "Sakrum",
  trochanter_li:    "Trochanter links",
  trochanter_re:    "Trochanter rechts",
  ferse_li:         "Ferse links",
  ferse_re:         "Ferse rechts",
  knoechel_li:      "Knöchel links",
  knoechel_re:      "Knöchel rechts",
  unterschenkel_li: "Unterschenkel links",
  unterschenkel_re: "Unterschenkel rechts",
  knie_li:          "Knie links",
  knie_re:          "Knie rechts",
  ellbogen_li:      "Ellbogen links",
  ellbogen_re:      "Ellbogen rechts",
  ohr_li:           "Ohrmuschel links",
  ohr_re:           "Ohrmuschel rechts",
  okziput:          "Okziput",
  abdomen:          "Abdomen",
  thorax:           "Thorax",
  ruecken:          "Rücken",
  sonstige:         "Sonstige Lokalisation",
};

export type Wundart =
  | "dekubitus"
  | "ulcus_cruris_venosum"
  | "ulcus_cruris_arteriosum"
  | "ulcus_cruris_mixtum"
  | "diabet_fusssyndrom"
  | "tumorwunde"
  | "post_op"
  | "trauma"
  | "verbrennung"
  | "sonstige";

export const WUNDART_LABEL: Record<Wundart, string> = {
  dekubitus:               "Dekubitus",
  ulcus_cruris_venosum:    "Ulcus cruris venosum",
  ulcus_cruris_arteriosum: "Ulcus cruris arteriosum",
  ulcus_cruris_mixtum:     "Ulcus cruris mixtum",
  diabet_fusssyndrom:      "Diabetisches Fußsyndrom",
  tumorwunde:              "Tumorwunde",
  post_op:                 "Post-OP-Wunde",
  trauma:                  "Trauma",
  verbrennung:             "Verbrennung",
  sonstige:                "Sonstige",
};

// EPUAP/NPIAP-Klassifikation für Dekubitus
export type DekubitusKategorie =
  | "kat_1"        // nicht wegdrückbare Rötung
  | "kat_2"        // Teilverlust Haut (Blase, oberflächlicher Defekt)
  | "kat_3"        // Vollverlust Haut (Subkutangewebe sichtbar)
  | "kat_4"        // Vollverlust Gewebe (Knochen/Sehne sichtbar)
  | "nicht_klassifizierbar"
  | "tiefe_unbekannt";

export const KAT_LABEL: Record<DekubitusKategorie, string> = {
  kat_1:                  "Kategorie 1 — nicht wegdrückbare Rötung",
  kat_2:                  "Kategorie 2 — Teilverlust der Haut",
  kat_3:                  "Kategorie 3 — Vollverlust der Haut",
  kat_4:                  "Kategorie 4 — Vollverlust des Gewebes",
  nicht_klassifizierbar:  "Nicht klassifizierbar",
  tiefe_unbekannt:        "Tiefe unbekannt (Schorf-Bedeckung)",
};

export type Exsudatmenge = "kein" | "wenig" | "maessig" | "viel";
export type Exsudatart   = "serös" | "blutig" | "serös_blutig" | "trüb" | "purulent" | "fötide";
export type Wundrand     = "intakt" | "mazeriert" | "unterminiert" | "epithelialisierend" | "verschwielt";
export type Wundgrund    = "granulierend" | "epithelialisierend" | "fibrinös" | "nekrotisch" | "infiziert";

export const EXSUDAT_LABEL: Record<Exsudatmenge, string> = {
  kein: "kein", wenig: "wenig", maessig: "mäßig", viel: "viel",
};

export type Wunde = {
  id: string;
  klientId: string;
  lokalisation: Wundlokalisation;
  art: Wundart;
  dekubitusKategorie?: DekubitusKategorie;
  ersterBefund: string;            // ISO YYYY-MM-DD
  ursache?: string;
  abgeheiltAm?: string;
  status: "akut" | "chronisch" | "stagnierend" | "heilend" | "abgeheilt";
  zustaendig?: string;             // Person-ID / Wundexperte
  aktualisiertAm: string;
};

export type Verbandstoff =
  | "schaumstoff"
  | "alginat"
  | "hydrokolloid"
  | "hydrogel"
  | "silberverband"
  | "honig"
  | "vakuum_npwt"
  | "kompresse_steril"
  | "wundgaze"
  | "kombinationsverband"
  | "fettgaze"
  | "polyurethanfilm";

export const VERBAND_LABEL: Record<Verbandstoff, string> = {
  schaumstoff:           "Schaumstoff",
  alginat:               "Alginat",
  hydrokolloid:          "Hydrokolloid",
  hydrogel:              "Hydrogel",
  silberverband:         "Silberverband",
  honig:                 "Med. Honig",
  vakuum_npwt:           "Vakuum-NPWT",
  kompresse_steril:      "Kompresse steril",
  wundgaze:              "Wundgaze",
  kombinationsverband:   "Kombinationsverband",
  fettgaze:              "Fettgaze",
  polyurethanfilm:       "Polyurethan-Film",
};

export type WundbeobachtungEintrag = {
  id: string;
  wundeId: string;
  datum: string;            // ISO YYYY-MM-DD
  zeit: string;             // HH:MM
  dokumentiertVon: string;  // Person-ID

  // Größe
  laengeCm?: number;
  breiteCm?: number;
  tiefeCm?: number;
  flaecheCm2?: number;       // berechnet oder gemessen (Acetatfolie)
  unterminierungCm?: number;
  unterminierungUhr?: string; // "9 Uhr" — Position der Unterminierung

  // Wundbett
  wundgrund: Wundgrund[];
  granulationsAnteilProzent?: number;
  fibrinAnteilProzent?: number;
  nekroseAnteilProzent?: number;
  epithelisationProzent?: number;

  // Exsudat
  exsudatMenge?: Exsudatmenge;
  exsudatArt?: Exsudatart;
  geruch?: "kein" | "leicht" | "stark" | "putrid";

  // Wundrand + Umgebungshaut
  wundrand?: Wundrand[];
  umgebungshaut?: ("intakt" | "trocken" | "mazeriert" | "ekzem" | "ödem" | "rötung")[];

  // Schmerzen
  schmerzNRS?: number;        // 0–10
  schmerzCharakter?: string;

  // Versorgung dieses Tages
  spueloesung?: "ringer" | "octenisept" | "prontosan" | "kochsalz" | "polihexanid";
  primaerverband?: Verbandstoff;
  sekundaerverband?: Verbandstoff;
  fixierung?: "klebevlies" | "schlauchverband" | "kompression" | "klebepflaster";
  wechselIntervallTage?: number;

  // Befund-Foto
  fotoUrl?: string;
  fotoBemerkung?: string;

  freitext?: string;
  // Beurteilung Heilungsverlauf
  tendenz?: "verbesserung" | "unveraendert" | "verschlechterung";
};
