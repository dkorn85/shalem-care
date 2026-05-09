// Hygiene + Infektionsschutz im Rettungsdienst.
//
// Quellen: RKI-Empfehlung "Infektionsprävention im Rettungsdienst" (2014, Update 2024),
// IfSG § 23 (Krankenhaushygiene-Maßnahmen), TRBA 250 (Biostoffe in der
// Gesundheitsfürsorge).

export type ErregerKlasse =
  | "MRSA"
  | "MRGN"
  | "VRE"
  | "C-difficile"
  | "Norovirus"
  | "Influenza"
  | "SARS-CoV-2"
  | "RSV"
  | "Tuberkulose"
  | "MERS";

export type SchutzStufe = "basis" | "tropfchen" | "kontakt" | "aerosol";

export type ErregerProfil = {
  erreger:        ErregerKlasse;
  uebertragung:   "kontakt" | "tropfchen" | "aerosol" | "fakal-oral";
  schutzStufe:    SchutzStufe;
  ppe:            string[];                 // PSA-Liste
  rtwAufbereitung: string;                  // Was nach Transport tun
  desinfektion:   {
    flaeche:      string;                   // Flächendesinfektionsmittel
    einwirkzeit:  string;
  };
  meldepflicht?:  string;                   // IfSG § 6/7
  pflegeBezug?:   string;                   // Wo trifft uns das aus dem Pflege-/Heim-Setting
};

export const SCHUTZ_LABEL: Record<SchutzStufe, string> = {
  basis:     "Basis-PSA",
  tropfchen: "Tröpfchen-Schutz",
  kontakt:   "Kontakt-Schutz",
  aerosol:   "Aerosol-Schutz · FFP3",
};

export const SCHUTZ_FARBE: Record<SchutzStufe, string> = {
  basis:     "var(--thu)",
  tropfchen: "var(--vibe-stats)",
  kontakt:   "var(--vibe-team)",
  aerosol:   "var(--mon)",
};

export const ERREGER_PROFILE: ErregerProfil[] = [
  {
    erreger: "MRSA",
    uebertragung: "kontakt",
    schutzStufe: "kontakt",
    ppe: ["FFP2-Maske", "Schutzkittel langärmlig", "Doppelhandschuhe", "Brille bei Aerosol-Risiko"],
    rtwAufbereitung: "RTW komplett scheuern · alle Kontaktflächen, Trage, Tragetuch tauschen, Dekon-Spray für Sauerstoff-Reservoir",
    desinfektion: {
      flaeche:     "Quartäre Ammoniumverbindungen oder Alkohol 70 %",
      einwirkzeit: "5-15 min Einwirkzeit nach Herstellerangabe",
    },
    pflegeBezug: "Sehr häufig in Heimen + Krankenhäusern · Nase/Wunde/Tracheostoma als Quellen",
  },
  {
    erreger: "MRGN",
    uebertragung: "kontakt",
    schutzStufe: "kontakt",
    ppe: ["FFP2", "Schutzkittel", "Handschuhe", "Brille bei Aerosolerzeugung"],
    rtwAufbereitung: "Wie MRSA · zusätzlich Aufmerksamkeit auf Toilette + Inkontinenz-Material",
    desinfektion: {
      flaeche:     "VAH-gelistetes Mittel mit 4MRGN-Wirksamkeit (z.B. Aldehyd-frei)",
      einwirkzeit: "15 min",
    },
    pflegeBezug: "3MRGN/4MRGN-Patient:innen oft mit Dauerkatheter, Beatmung, Wunden · Heim-Übergaben dokumentieren",
  },
  {
    erreger: "C-difficile",
    uebertragung: "fakal-oral",
    schutzStufe: "kontakt",
    ppe: ["Schutzkittel", "Doppelhandschuhe", "Mund-Nasen-Schutz"],
    rtwAufbereitung: "Wirklich alles desinfizieren — C-diff-Sporen sind alkohol-resistent! · Hände nach Handschuhen unbedingt MIT WASSER + SEIFE waschen, nicht nur desinfizieren",
    desinfektion: {
      flaeche:     "Sporozid wirksames Mittel (Peressigsäure, Aldehyd) — VAH-Liste 'C. difficile'",
      einwirkzeit: "30 min · keine Abkürzungen",
    },
    meldepflicht: "Schwere Verläufe (z.B. CDI mit Megacolon) IfSG § 6 namentlich",
    pflegeBezug: "Stark in Heimen nach Antibiotika-Therapie · Diarrhoen + Geruch typisch",
  },
  {
    erreger: "Norovirus",
    uebertragung: "fakal-oral",
    schutzStufe: "kontakt",
    ppe: ["Schutzkittel", "Doppelhandschuhe", "Mund-Nasen-Schutz", "Brille bei Erbrechen"],
    rtwAufbereitung: "Erbrochenes komplett aufnehmen · sporozid wirksame Desinfektion · Tragetuch tauschen",
    desinfektion: {
      flaeche:     "Mittel mit Wirkbereich 'begrenzt viruzid PLUS' (z.B. Peressigsäure)",
      einwirkzeit: "5-15 min nach Herstellerangabe",
    },
    meldepflicht: "Cluster ≥2 Fälle nach IfSG § 6 Abs. 3 Krankenhaus-Hygiene",
    pflegeBezug: "Heim-Ausbrüche im Winter sehr häufig · Hände-Desinfektion alkoholbasiert ist UNZUREICHEND, Seife + Wasser",
  },
  {
    erreger: "SARS-CoV-2",
    uebertragung: "aerosol",
    schutzStufe: "aerosol",
    ppe: ["FFP3 (oder FFP2 bei nicht-aerosolproduzierenden Maßnahmen)", "Brille/Visier", "Schutzkittel + Handschuhe"],
    rtwAufbereitung: "Lüften 30+ min · alle Kontaktflächen wischen · HEPA-Filter prüfen wenn vorhanden",
    desinfektion: {
      flaeche:     "Mittel 'begrenzt viruzid' reicht (umhüllte Viren)",
      einwirkzeit: "5 min",
    },
    meldepflicht: "IfSG § 6 namentlich · Klinik-Voranmeldung mit Hygienestichwort",
    pflegeBezug: "Im Heim-Setting Booster-Status + letzter Antigentest miterfragen",
  },
  {
    erreger: "Influenza",
    uebertragung: "tropfchen",
    schutzStufe: "tropfchen",
    ppe: ["FFP2", "Brille bei Husten/Niesen-Risiko", "Schutzkittel + Handschuhe"],
    rtwAufbereitung: "Lüften · Kontaktflächen wischen · Tragetuch tauschen wenn sichtbar kontaminiert",
    desinfektion: {
      flaeche:     "Begrenzt viruzid · Alkohol 70 % oder VAH",
      einwirkzeit: "1-5 min",
    },
    pflegeBezug: "Saisonal in Heimen · STIKO empfiehlt Personal-Impfung",
  },
  {
    erreger: "Tuberkulose",
    uebertragung: "aerosol",
    schutzStufe: "aerosol",
    ppe: ["FFP3", "Patient mit MNS aufrüsten wenn möglich", "Schutzkittel + Handschuhe"],
    rtwAufbereitung: "Lüften ≥1 h vor nächster Nutzung · UV-Desinfektion wenn vorhanden",
    desinfektion: {
      flaeche:     "Tuberkulozid wirksames Mittel (z.B. Glucoprotamin)",
      einwirkzeit: "60 min",
    },
    meldepflicht: "IfSG § 6 namentlich",
    pflegeBezug: "Re-Aktivierung bei Älteren + Migrant:innen · Husten >3 Wochen + Gewichtsverlust → SOP-Trigger",
  },
];

export function profilFuerErreger(e: ErregerKlasse): ErregerProfil | null {
  return ERREGER_PROFILE.find((p) => p.erreger === e) ?? null;
}

export function profileNachStufe(s: SchutzStufe): ErregerProfil[] {
  return ERREGER_PROFILE.filter((p) => p.schutzStufe === s);
}
