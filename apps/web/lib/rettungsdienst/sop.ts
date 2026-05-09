// SOPs (Standard Operating Procedures) für den Rettungsdienst.
//
// Quellen: ERC-Leitlinien 2021 (Reanimation), DGN-S2k-Leitlinie Schlaganfall,
// ESC-Leitlinien ACS 2023, S3-Leitlinie Polytrauma, BÄK-Empfehlung
// Anaphylaxie. Notfallsanitäter:innen dürfen invasive Maßnahmen
// im Rahmen ihrer Ausbildung selbständig durchführen (NotSanG § 4 Abs. 2).
//
// Aufbau jeder SOP: Erkennung · Sofortmaßnahmen · Algorithmus-Schritte ·
// Medikamente mit Dosierung · Klinik-Voranmeldung.

export type SopRangAusbildung = "RS" | "NotSan" | "NA";

export type SopSchritt = {
  reihenfolge: number;
  was:        string;
  rang:       SopRangAusbildung;       // ab welchem Ausbildungsstand erlaubt
  zeitfenster?: string;                // z.B. "binnen 10 min"
};

export type SopMedikament = {
  wirkstoff:   string;
  indikation:  string;
  dosis:       string;
  weg:         "iv" | "io" | "im" | "sl" | "po" | "inhal" | "nasal";
  rangNotSan:  boolean;                // darf NotSan eigenverantwortlich geben?
  rote_hand?:  string;                 // Cave-Hinweis
};

export type Sop = {
  id:           string;
  titel:        string;
  leitlinie:    string;
  erkennung:    string;                // 1-2 Sätze · Verdacht erkennen
  sofortmassnahmen: string[];
  algorithmus:  SopSchritt[];
  medikamente:  SopMedikament[];
  zielklinik:   string;
  voranmeldung: string;
};

export const SOPS: Sop[] = [
  {
    id: "sop-cpr-erw",
    titel: "Reanimation Erwachsene · ERC 2021",
    leitlinie: "ERC Guidelines 2021 · Adult Basic & Advanced Life Support",
    erkennung: "Bewusstlos · keine normale Atmung in 10 Sekunden Sicht/Hörprüfung · Pulskontrolle Karotis ≤10 Sek (NotSan).",
    sofortmassnahmen: [
      "Notruf bestätigen + Defi anfordern",
      "Thoraxkompression 100-120/min · Tiefe 5-6 cm · vollständige Entlastung",
      "Beatmung 30:2 (BVM mit Reservoir + O2 15 L/min)",
      "Defi-Pads anlegen + Rhythmus-Analyse alle 2 min",
    ],
    algorithmus: [
      { reihenfolge: 1, was: "Defibrillation 200 J biphasisch bei VF/pVT", rang: "RS" },
      { reihenfolge: 2, was: "Adrenalin 1 mg i.v./i.o. nach 2. Schock, dann alle 3-5 min", rang: "NotSan" },
      { reihenfolge: 3, was: "Amiodaron 300 mg nach 3. Schock bei refraktärer VF", rang: "NotSan" },
      { reihenfolge: 4, was: "Reversible Ursachen 4 H + 4 T abarbeiten", rang: "NotSan" },
      { reihenfolge: 5, was: "Atemwegssicherung: SGA (Larynx-Tubus) > endotracheale Intubation (NA)", rang: "NA", zeitfenster: "nach 2-3 Zyklen" },
    ],
    medikamente: [
      { wirkstoff: "Adrenalin 1:10.000",  indikation: "alle Reanimationen nicht-defibrillierbar von Anfang an, defibrillierbar nach 2. Schock", dosis: "1 mg", weg: "iv", rangNotSan: true },
      { wirkstoff: "Amiodaron",           indikation: "refraktäre VF/pVT nach 3. Schock", dosis: "300 mg", weg: "iv", rangNotSan: true },
      { wirkstoff: "NaCl 0,9 % Infusion", indikation: "Volumenersatz", dosis: "500 ml zügig", weg: "iv", rangNotSan: true },
    ],
    zielklinik: "nächstgelegene Klinik mit ECMO-/Cathlab-Bereitschaft (ROSC-Bündel)",
    voranmeldung: "ROSC: NA + Klinik · Voranmeldung mit Stichwort 'Post-CPR' + Cathlab-Aktivierung wenn STEMI",
  },
  {
    id: "sop-stemi",
    titel: "STEMI · Akutes Koronarsyndrom mit ST-Hebung",
    leitlinie: "ESC Guidelines on AMI in patients presenting with ST-segment elevation 2023",
    erkennung: "Akuter retrosternaler Druck/Brennen · Ausstrahlung Arm/Kiefer · Schweissigkeit · 12-Kanal-EKG mit ST-Hebungen ≥1 mm in 2 zusammenhängenden Ableitungen.",
    sofortmassnahmen: [
      "12-Kanal-EKG mit V7-V9 + V3R/V4R bei Hinterwandinfarkt",
      "i.v. Zugang 18G + Volumenersatz vorsichtig",
      "Sauerstoff nur bei SaO2 <90 %",
      "Cathlab-Voranmeldung über IVENA",
    ],
    algorithmus: [
      { reihenfolge: 1, was: "ASS 250 mg p.o. (kauen) oder 250 mg i.v.", rang: "NotSan" },
      { reihenfolge: 2, was: "Heparin 5000 IE i.v. nach NA-Rücksprache", rang: "NotSan" },
      { reihenfolge: 3, was: "Morphin 3-5 mg titrieren bei starkem Schmerz", rang: "NotSan" },
      { reihenfolge: 4, was: "Nitro 0,4 mg s.l. bei RR-syst >100 mmHg + ohne PDE-5-Hemmer", rang: "NotSan" },
      { reihenfolge: 5, was: "Direkt-Transport ins PCI-Zentrum (door-to-balloon <90 min)", rang: "RS", zeitfenster: "binnen 90 min" },
    ],
    medikamente: [
      { wirkstoff: "ASS",       indikation: "Thrombozytenaggregations-Hemmung", dosis: "250 mg",      weg: "po",   rangNotSan: true },
      { wirkstoff: "Heparin",   indikation: "Antikoagulation",                 dosis: "5000 IE",     weg: "iv",   rangNotSan: true, rote_hand: "Nicht bei aktiver Blutung" },
      { wirkstoff: "Morphin",   indikation: "Analgesie",                       dosis: "3-5 mg titr.", weg: "iv",   rangNotSan: true, rote_hand: "Cave Atemdepression" },
      { wirkstoff: "Nitro",     indikation: "Vorlast-Senkung + Schmerz",       dosis: "0,4 mg",      weg: "sl",   rangNotSan: true, rote_hand: "Nicht bei RR-syst <100 oder PDE-5-Inhibitor in 24h" },
    ],
    zielklinik: "PCI-Zentrum · door-to-balloon <90 min ist Klassen-IA-Empfehlung",
    voranmeldung: "Cathlab über IVENA · STEMI-Stichwort + EKG-Bild via Telemedizin (TIM-MV o.ä.)",
  },
  {
    id: "sop-stroke",
    titel: "Schlaganfall · FAST + Stroke-Unit",
    leitlinie: "DGN S2k-Leitlinie Akuttherapie des ischämischen Schlaganfalls 2021",
    erkennung: "FAST: Face (Asymmetrie), Arm (Schwäche), Speech (Dysarthrie/Aphasie), Time (Last-seen-well dokumentieren). Plus BE-FAST mit Balance + Eyes für Hirnstamm-/Zerebellum-Insulte.",
    sofortmassnahmen: [
      "BZ messen (DD: Hypoglykämie)",
      "12-Kanal-EKG (DD: VHF kardioembolisch)",
      "i.v. Zugang 18G — möglichst nicht in betroffener Seite",
      "Last-seen-well exakt dokumentieren · Lyse-Fenster 4,5 h für i.v. rtPA · Thrombektomie bis 24 h möglich",
    ],
    algorithmus: [
      { reihenfolge: 1, was: "Stroke-Unit-Voranmeldung über IVENA", rang: "RS", zeitfenster: "sofort" },
      { reihenfolge: 2, was: "BZ-Korrektur wenn <70 mg/dl", rang: "NotSan" },
      { reihenfolge: 3, was: "RR moderat halten · keine aggressive Senkung wenn syst <220", rang: "NotSan" },
      { reihenfolge: 4, was: "30°-Oberkörperhochlage", rang: "RS" },
      { reihenfolge: 5, was: "Direkt-Transport in nächstgelegene Stroke-Unit (max. 30 min Fahrzeit)", rang: "RS", zeitfenster: "binnen 60 min" },
    ],
    medikamente: [
      { wirkstoff: "Glukose 40 %", indikation: "Hypoglykämie", dosis: "20 ml i.v.", weg: "iv", rangNotSan: true },
      { wirkstoff: "Urapidil",     indikation: "RR-Senkung wenn syst >220",  dosis: "10-25 mg titr.", weg: "iv", rangNotSan: true, rote_hand: "Nur in Rücksprache mit NA bei Lyse-Vorbereitung" },
    ],
    zielklinik: "zertifizierte Stroke-Unit (DSG) · Telestroke-Anbindung wenn ländlich",
    voranmeldung: "IVENA · Stichwort 'Stroke' · CT-Bereitschaft + Lyse-Team + Neurologie",
  },
  {
    id: "sop-anaphylaxie",
    titel: "Anaphylaxie · Stadium II-IV",
    leitlinie: "S2k-Leitlinie Akuttherapie und Management der Anaphylaxie 2021 (DGAKI)",
    erkennung: "Plötzlich Hautmanifestation (Urtikaria, Flush, Pruritus) + Atemwegs-/Kreislauf-/GI-Beteiligung. Stadium II = Atemwege beteiligt, III = Kreislauf, IV = Atem-/Kreislaufstillstand.",
    sofortmassnahmen: [
      "Allergen-Zufuhr stoppen (Infusion stoppen!)",
      "Patient flach mit erhöhten Beinen · bei Atemnot sitzend",
      "Adrenalin i.m. lateraler Oberschenkel — der wichtigste Schritt!",
      "i.v. Zugang 18G + Volumengabe NaCl 0,9 % zügig",
    ],
    algorithmus: [
      { reihenfolge: 1, was: "Adrenalin 0,5 mg i.m. lateral M. vastus lateralis", rang: "NotSan", zeitfenster: "sofort, ggf. nach 5-10 min wiederholen" },
      { reihenfolge: 2, was: "Volumengabe 1000-2000 ml NaCl 0,9 % zügig", rang: "NotSan" },
      { reihenfolge: 3, was: "Sauerstoff 10-15 L/min via Maske mit Reservoir", rang: "RS" },
      { reihenfolge: 4, was: "Inhalatives Salbutamol bei Bronchospasmus", rang: "NotSan" },
      { reihenfolge: 5, was: "Antihistaminikum + Kortikoid (zweitlinig, kein Notfall-Adrenalin-Ersatz!)", rang: "NotSan" },
    ],
    medikamente: [
      { wirkstoff: "Adrenalin (Suprarenin)", indikation: "First-Line bei Anaphylaxie ab Stadium II", dosis: "0,5 mg",  weg: "im",   rangNotSan: true },
      { wirkstoff: "Dimetinden (Fenistil)",  indikation: "H1-Blockade",                              dosis: "4 mg",   weg: "iv",   rangNotSan: true },
      { wirkstoff: "Prednisolon",            indikation: "Spätreaktion verhindern",                  dosis: "250 mg", weg: "iv",   rangNotSan: true },
      { wirkstoff: "Salbutamol",             indikation: "Bronchospasmus",                            dosis: "2,5 mg", weg: "inhal",rangNotSan: true },
    ],
    zielklinik: "Notaufnahme mit Intensivkapazität · Beobachtung 6-24h wegen biphasischer Reaktion",
    voranmeldung: "ZNA · Anaphylaxie-Stadium + Auslöser + bisherige Maßnahmen",
  },
  {
    id: "sop-trauma",
    titel: "Polytrauma · cABCDE",
    leitlinie: "S3-Leitlinie Polytrauma/Schwerverletzten-Behandlung 2022 (DGU)",
    erkennung: "Unfallmechanismus mit Verletzungen mehrerer Körperregionen, mind. eine lebensbedrohlich. Indizielle Schock-Index (HF/RR-syst) >1, GCS <13, A/B-Probleme.",
    sofortmassnahmen: [
      "c · catastrophic bleeding zuerst stoppen (Tourniquet, Druckverband, Wound-Packing)",
      "A · Atemwege freihalten + HWS-Schutz mit Stiffneck",
      "B · Beatmung bewerten (Asymmetrie, Saturierung, Halsvenen-Stauung → V.a. Spannungspneu)",
      "C · Kreislauf bewerten + Volumen restriktiv (permissive Hypotonie syst 80-90)",
    ],
    algorithmus: [
      { reihenfolge: 1, was: "Tourniquet bei lebensbedrohlicher Extremitäten-Blutung", rang: "RS", zeitfenster: "binnen 60 sek" },
      { reihenfolge: 2, was: "i.o.-Zugang bei nicht punktierbaren Venen", rang: "NotSan" },
      { reihenfolge: 3, was: "Tranexamsäure 1g i.v. binnen 3h nach Trauma", rang: "NotSan", zeitfenster: "binnen 3 h" },
      { reihenfolge: 4, was: "Spannungspneu: Mini-Thorakostomie 4./5. ICR mittlere Axillarlinie", rang: "NA" },
      { reihenfolge: 5, was: "Wärmeerhalt mit Rettungsdecke aktiv (Trauma-Triade)", rang: "RS" },
      { reihenfolge: 6, was: "Trauma-Zentrum-Voranmeldung mit AIS-Liste", rang: "RS" },
    ],
    medikamente: [
      { wirkstoff: "Tranexamsäure (Cyklokapron)", indikation: "Hyperfibrinolyse-Hemmung", dosis: "1 g i.v. über 10 min", weg: "iv", rangNotSan: true, rote_hand: "Wirkfenster <3 h post-Trauma" },
      { wirkstoff: "Ketamin",                     indikation: "Analgesie + dissoz. Anästhesie", dosis: "0,25-0,5 mg/kg",   weg: "iv", rangNotSan: false, rote_hand: "Nur durch NA · Cave Hypertension/Glaukom" },
      { wirkstoff: "Fentanyl",                    indikation: "Analgesie",                      dosis: "0,1-0,2 mg",       weg: "iv", rangNotSan: true, rote_hand: "Cave Atemdepression" },
      { wirkstoff: "Vollelektrolyt",              indikation: "Volumenersatz restriktiv",        dosis: "250 ml-Boli",      weg: "iv", rangNotSan: true },
    ],
    zielklinik: "Überregionales Trauma-Zentrum (TraumaNetzwerk DGU)",
    voranmeldung: "TraumaNetzwerk · Schockraum-Aktivierung · AIS + GCS + Vitalwerte",
  },
];

export function sopFuerStichwort(stichwort: string): Sop[] {
  const s = stichwort.toLowerCase();
  return SOPS.filter((sop) =>
    sop.titel.toLowerCase().includes(s) || sop.erkennung.toLowerCase().includes(s),
  );
}
