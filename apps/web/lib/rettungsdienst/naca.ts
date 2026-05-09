// NACA-Score + DIVI-Mind2-Notarztdatensatz + Einsatzprotokoll-Doku.
//
// NACA = National Advisory Committee for Aeronautics, ursprünglich US-Luftwaffe
// 1957, in DE als Standard-Schweregrad-Score im Rettungsdienst etabliert.
// 0 = keine Verletzung/Erkrankung, 7 = Tod am Einsatzort.
//
// Mind2 = bundeseinheitlicher Minimaler Notarztdatensatz, Pflicht-Doku
// nach DIVI/BÄK · seit 2018 in v2-Format · digital übergeben via IVENA.

export type NacaStufe = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const NACA_LABEL: Record<NacaStufe, string> = {
  0: "0 · Keine Verletzung/Erkrankung",
  1: "1 · Geringfügig · ambulant",
  2: "2 · Leicht · stationär nicht zwingend",
  3: "3 · Mäßig · stationär ohne Lebensgefahr",
  4: "4 · Schwer · ggf. Lebensgefahr nicht ausgeschlossen",
  5: "5 · Akute Lebensgefahr",
  6: "6 · Reanimation · Atem-/Kreislaufstillstand",
  7: "7 · Tod am Einsatzort",
};

export const NACA_FARBE: Record<NacaStufe, string> = {
  0: "var(--fg-mute)",
  1: "var(--thu)",
  2: "var(--vibe-stats)",
  3: "var(--vibe-team)",
  4: "var(--vibe-approval)",
  5: "var(--mon)",
  6: "var(--mon)",
  7: "var(--fg-mute)",
};

export type EinsatzProtokoll = {
  id:                   string;
  einsatzNr:            string;             // z.B. ein-2026-0506-15
  alarmZeit:            string;             // ISO
  ankunftEinsatzort:    string;
  abfahrtKlinik?:       string;
  ankunftKlinik?:       string;
  patientName:          string;
  patientAlter:         number;
  patientGeschlecht:    "m" | "w" | "d";
  einsatzStichwort:     string;             // z.B. "Verdacht auf STEMI"
  arbeitsdiagnose:      string;
  nacaScore:            NacaStufe;
  vitalwerte: {
    rrSyst?: number; rrDiast?: number;
    hf?: number;                            // bpm
    saO2?: number;                          // %
    af?: number;                            // /min
    bz?: number;                            // mg/dl
    temp?: number;                          // °C
    gcs?: number;                           // 3-15
    schmerzNRS?: number;                    // 0-10
  };
  medikamenteGegeben:   { wirkstoff: string; menge: string; weg: "iv" | "io" | "im" | "sl" | "po" | "inhal"; uhrzeit: string }[];
  massnahmen:           string[];           // i.v.-Zugang, EKG, Defibrillation, Intubation …
  zielklinik?:          string;
  uebergabeAerztin?:    string;
  bemerkung?:           string;
};

export const EINSATZ_PROTOKOLLE: EinsatzProtokoll[] = [
  {
    id: "ep-2026-0506-15",
    einsatzNr: "ein-2026-0506-15",
    alarmZeit: "2026-05-06T07:42:00",
    ankunftEinsatzort: "2026-05-06T07:51:00",
    abfahrtKlinik: "2026-05-06T08:11:00",
    ankunftKlinik: "2026-05-06T08:24:00",
    patientName: "Helga Reinhardt",
    patientAlter: 78, patientGeschlecht: "w",
    einsatzStichwort: "Sturz mit Kopfplatzwunde",
    arbeitsdiagnose: "Schädelplatzwunde frontal · V.a. Commotio · Antikoagulation Marcumar",
    nacaScore: 3,
    vitalwerte: { rrSyst: 142, rrDiast: 88, hf: 92, saO2: 96, af: 18, bz: 124, gcs: 15, schmerzNRS: 4 },
    medikamenteGegeben: [
      { wirkstoff: "NaCl 0,9 %",      menge: "500 ml", weg: "iv", uhrzeit: "07:58" },
      { wirkstoff: "Paracetamol",      menge: "1000 mg", weg: "iv", uhrzeit: "08:02" },
    ],
    massnahmen: ["i.v. Zugang 18G li. Cubital", "Wundversorgung steril", "HWS-Stiffneck", "12-Kanal-EKG (SR)"],
    zielklinik: "Universitätsklinikum Bergmannsheil · Notaufnahme",
    uebergabeAerztin: "Dr. Helena Brandt (Diensthabende UKB)",
    bemerkung: "Marcumar-Patientin · INR-Wert nicht aktuell verfügbar · CT zeitnah empfohlen",
  },
  {
    id: "ep-2026-0506-09",
    einsatzNr: "ein-2026-0506-09",
    alarmZeit: "2026-05-06T06:18:00",
    ankunftEinsatzort: "2026-05-06T06:26:00",
    abfahrtKlinik: "2026-05-06T06:48:00",
    ankunftKlinik: "2026-05-06T06:59:00",
    patientName: "Hannelore Kärcher",
    patientAlter: 71, patientGeschlecht: "w",
    einsatzStichwort: "Atemnot, V.a. Exazerbation",
    arbeitsdiagnose: "Akute COPD-Exazerbation Stufe IV · pulmonale Infektion möglich",
    nacaScore: 4,
    vitalwerte: { rrSyst: 158, rrDiast: 92, hf: 118, saO2: 86, af: 28, temp: 38.4, gcs: 15, schmerzNRS: 0 },
    medikamenteGegeben: [
      { wirkstoff: "Salbutamol + Ipratropium", menge: "2,5 mg + 0,5 mg", weg: "inhal", uhrzeit: "06:30" },
      { wirkstoff: "Prednisolon",              menge: "100 mg",          weg: "iv",    uhrzeit: "06:35" },
      { wirkstoff: "Sauerstoff 4 L/min",        menge: "—",                weg: "inhal", uhrzeit: "06:27" },
    ],
    massnahmen: ["O2-Maske 4 L/min titrieren bis SaO2 88-92 %", "i.v. Zugang 20G", "12-Kanal-EKG (Sinustachy)", "BGA-Probenahme im RTW"],
    zielklinik: "Klinikum Augsburg · ZNA",
    uebergabeAerztin: "Dr. Berger (Pulmologie-Konsil bestellt)",
    bemerkung: "Patientin ist Bewohnerin Tour 2 · Heimakte mit Vor-Medikation übergeben",
  },
  {
    id: "ep-2026-0505-44",
    einsatzNr: "ein-2026-0505-44",
    alarmZeit: "2026-05-05T22:11:00",
    ankunftEinsatzort: "2026-05-05T22:18:00",
    abfahrtKlinik: "2026-05-05T22:31:00",
    ankunftKlinik: "2026-05-05T22:46:00",
    patientName: "Konrad Heuser",
    patientAlter: 84, patientGeschlecht: "m",
    einsatzStichwort: "V.a. Apoplex · plötzliche Sprachstörung",
    arbeitsdiagnose: "Akuter ischämischer Insult · Lyse-Fenster offen",
    nacaScore: 4,
    vitalwerte: { rrSyst: 178, rrDiast: 102, hf: 88, saO2: 94, af: 16, bz: 138, gcs: 14, schmerzNRS: 0 },
    medikamenteGegeben: [
      { wirkstoff: "NaCl 0,9 %", menge: "250 ml", weg: "iv", uhrzeit: "22:22" },
    ],
    massnahmen: ["FAST positiv (Arm + Sprache)", "Stroke-Unit-Voranmeldung über IVENA", "i.v. Zugang 18G", "12-Kanal-EKG (VHF tachy)"],
    zielklinik: "Stroke Unit Klinikum Augsburg",
    uebergabeAerztin: "Dr. Krug (Stroke-Bereitschaft)",
    bemerkung: "Last-seen-well 21:30 · Lyse-Fenster bis ca. 04:30 · CT geplant unmittelbar",
  },
];

export function protokollFuerEinsatz(einsatzNr: string): EinsatzProtokoll | null {
  return EINSATZ_PROTOKOLLE.find((p) => p.einsatzNr === einsatzNr) ?? null;
}
