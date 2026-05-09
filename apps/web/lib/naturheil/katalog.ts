// Naturheilkunde-Katalog · komplementäre + ergänzende Verfahren.
//
// Rechtsgrundlage:
// - HeilprG (Heilpraktikergesetz von 1939, novelliert)
// - 1. DVO zum HeilprG (Durchführungs-Verordnung)
// - §§ 30–31 HWG (Heilmittel-Werbegesetz)
// - ESCOP-Monographien (European Scientific Cooperative on Phytotherapy)
// - EMA HMPC (Herbal Medicinal Products Committee)
// - WHO Traditional Medicine Strategy 2014–2023 (verlängert)
// - Council of Europe Resolution CM/Res(2014)7 (Traditional Medicine)
// - PEI (Paul-Ehrlich-Institut) für homöopathische Arzneimittel
//
// Phase 1: Stamm-Katalog mit ~16 Verfahren + Wirkprinzip + Indikationen +
// rechtlicher Status. Phase 2: Anwendungs-Doku pro Klient mit
// Wirkungs-Tracking.

export type NaturheilArt =
  | "phytotherapie"        // Pflanzenheilkunde
  | "homoeopathie"         // klassisch nach Hahnemann
  | "anthroposophisch"     // anthroposophische Medizin (R. Steiner)
  | "tcm"                  // Traditionelle Chinesische Medizin
  | "ayurveda"             // Indische Heilkunde
  | "naturheilverfahren"   // Kneipp · Hydrotherapie · Kalt-Warm
  | "osteopathie"
  | "akupunktur"
  | "aromatherapie"
  | "manuelle-therapie";   // Reflexzonen, Lymphdrainage

export const NATURHEIL_ART_LABEL: Record<NaturheilArt, string> = {
  "phytotherapie":      "Phytotherapie · Pflanzenheilkunde",
  "homoeopathie":       "Homöopathie · klassisch",
  "anthroposophisch":   "Anthroposophische Medizin",
  "tcm":                "Traditionelle Chinesische Medizin",
  "ayurveda":           "Ayurveda",
  "naturheilverfahren": "Naturheilverfahren · Kneipp",
  "osteopathie":        "Osteopathie",
  "akupunktur":         "Akupunktur",
  "aromatherapie":      "Aromatherapie",
  "manuelle-therapie":  "Manuelle Reflextherapie",
};

export const NATURHEIL_ART_FARBE: Record<NaturheilArt, string> = {
  "phytotherapie":      "var(--thu)",
  "homoeopathie":       "var(--vibe-team)",
  "anthroposophisch":   "var(--vibe-approval)",
  "tcm":                "var(--mon)",
  "ayurveda":           "var(--sun)",
  "naturheilverfahren": "var(--fri)",
  "osteopathie":        "var(--vibe-stats)",
  "akupunktur":         "var(--vibe-profile)",
  "aromatherapie":      "var(--accent)",
  "manuelle-therapie":  "var(--sat)",
};

export type RechtlicherStatus =
  | "apothekenpflichtig"     // PEI/BfArM zugelassen, nur Apotheke
  | "rezept-frei"            // OTC, frei verkäuflich
  | "heilpraktiker-only"     // nur durch Heilpraktiker:in oder Arzt:Ärztin
  | "arzt-only"              // nur durch Approbierte
  | "ergaenzend-pflege"      // pflegerisch begleitend möglich (Aromaöl, Kneipp-Wickel)
  | "spirituell";            // außerhalb des HeilprG, persönliche Praxis

export type NaturheilVerfahren = {
  code: string;                    // z.B. "PHYTO-MELISSE"
  label: string;
  art: NaturheilArt;
  wirkprinzip: string;
  indikationen: string[];
  kontraindikationen: string[];
  rechtlicherStatus: RechtlicherStatus;
  evidenzGrad: "stark" | "mittel" | "schwach" | "tradition";
  europaQuelle?: string;
  pflegerischeBegleitung?: string; // wie kann Pflege das integrieren
};

export const NATURHEIL_KATALOG: NaturheilVerfahren[] = [
  // ─── Phytotherapie · ESCOP-Monographien ────────────────────────────────
  {
    code: "PHYTO-MELISSE",
    label: "Melisse-Tee bei Unruhe + Schlafstörung",
    art: "phytotherapie",
    wirkprinzip: "ätherische Öle, Triterpenoide, beruhigend auf vegetatives Nervensystem",
    indikationen: ["nervöse Unruhe", "leichte Einschlafstörungen", "funktionelle Magen-Beschwerden"],
    kontraindikationen: ["Schilddrüsen-Unterfunktion (Vorsicht)"],
    rechtlicherStatus: "ergaenzend-pflege",
    evidenzGrad: "stark",
    europaQuelle: "ESCOP Monograph: Melissae folium · EMA HMPC Community Herbal Monograph 2013",
    pflegerischeBegleitung: "abendliches Ritual · Pflegekraft kocht warmen Tee · Tasse gemeinsam trinken",
  },
  {
    code: "PHYTO-WEISSDORN",
    label: "Weißdorn bei nachlassender Herzleistung",
    art: "phytotherapie",
    wirkprinzip: "Oligomere Procyanidine, Flavonoide → positiv inotrop, Koronarperfusion",
    indikationen: ["NYHA II Herzinsuffizienz unterstützend", "altersbedingte Herzleistungs-Einschränkung"],
    kontraindikationen: ["nicht bei akuter Dekompensation, ergänzt nur"],
    rechtlicherStatus: "apothekenpflichtig",
    evidenzGrad: "stark",
    europaQuelle: "ESCOP Monograph: Crataegi folium cum flore · SPICE-Studie 2008",
  },
  {
    code: "PHYTO-BALDRIAN",
    label: "Baldrian bei Schlafstörung",
    art: "phytotherapie",
    wirkprinzip: "Valepotriate + Sesquiterpene, GABAerge Wirkung",
    indikationen: ["Einschlafstörung", "leichte Angstzustände"],
    kontraindikationen: ["Wirkung nach 2-4 Wochen, nicht akut"],
    rechtlicherStatus: "rezept-frei",
    evidenzGrad: "mittel",
    europaQuelle: "EMA HMPC Community Herbal Monograph: Valerianae radix",
    pflegerischeBegleitung: "Abend-Tee 1h vor Schlaf · in Ritual eingebunden",
  },
  {
    code: "PHYTO-INGWER",
    label: "Ingwer bei Übelkeit + Erbrechen",
    art: "phytotherapie",
    wirkprinzip: "Gingerole + Shogaole · prokinetisch, antiemetisch",
    indikationen: ["Übelkeit nach OP", "Reise-Übelkeit", "Schwangerschafts-Übelkeit (vorsichtig)"],
    kontraindikationen: ["Gallensteine", "Antikoagulation (Wechselwirkung)"],
    rechtlicherStatus: "rezept-frei",
    evidenzGrad: "stark",
    europaQuelle: "EMA HMPC Monograph: Zingiberis rhizoma",
  },

  // ─── Anthroposophische Medizin · Iscador / Misteltherapie ──────────────
  {
    code: "ANTHRO-MISTEL",
    label: "Mistel-Therapie (Iscador) komplementär bei Tumor",
    art: "anthroposophisch",
    wirkprinzip: "Lectine + Viscotoxine, Immun-Modulation, Lebensqualität",
    indikationen: ["adjuvant bei Mamma-Ca", "kolorektales Ca", "Lebensqualität in palliativer Phase"],
    kontraindikationen: ["primäre Hirntumoren (Vorsicht)", "akute Allergie"],
    rechtlicherStatus: "arzt-only",
    evidenzGrad: "mittel",
    europaQuelle: "Helixor-Studien · KOKON-Programm Cochrane 2016",
  },
  {
    code: "ANTHRO-EURYTHMIE",
    label: "Heileurythmie · therapeutische Bewegung",
    art: "anthroposophisch",
    wirkprinzip: "Lautierte Bewegungs-Sequenzen, Selbstwahrnehmung",
    indikationen: ["chronische Erschöpfung", "psychosomatische Beschwerden", "Begleitung Onkologie"],
    kontraindikationen: ["—"],
    rechtlicherStatus: "heilpraktiker-only",
    evidenzGrad: "tradition",
    europaQuelle: "Internationale Vereinigung anthroposophischer Heileurythmist:innen IFAH",
  },

  // ─── Klassische Homöopathie ────────────────────────────────────────────
  {
    code: "HOMOEO-ARNICA-D6",
    label: "Arnica D6 bei Hämatomen + Prellungen",
    art: "homoeopathie",
    wirkprinzip: "Hochpotenz nach Hahnemann · Konstitutions- + Akut-Mittel",
    indikationen: ["Hämatom", "Prellung", "Z.n. Sturz/OP für 5-7 Tage"],
    kontraindikationen: ["—"],
    rechtlicherStatus: "rezept-frei",
    evidenzGrad: "schwach",
    europaQuelle: "PEI Zulassung · BAH Bundesverband d. Arzneimittel-Hersteller",
    pflegerischeBegleitung: "alle 2 h 5 Globuli unter die Zunge · zwischen Mahlzeiten",
  },
  {
    code: "HOMOEO-NUX-VOMICA",
    label: "Nux vomica bei Beschwerden nach Reizüberlastung",
    art: "homoeopathie",
    wirkprinzip: "Konstitutions-Mittel · vorzugsweise reizbare, überarbeitete Person",
    indikationen: ["Hangover", "Verdauungs-Beschwerden", "Schlafstörung nach Stress"],
    kontraindikationen: ["—"],
    rechtlicherStatus: "rezept-frei",
    evidenzGrad: "tradition",
  },

  // ─── TCM · Akupunktur · Tuina ──────────────────────────────────────────
  {
    code: "TCM-AKUPUNKTUR-LWS",
    label: "Akupunktur bei chronischem LWS-Schmerz",
    art: "akupunktur",
    wirkprinzip: "Stimulation Akupunkturpunkte → endogene Opioide, Modulation Schmerz-Signal",
    indikationen: ["chronischer LWS-Schmerz (G-BA Indikation)", "chronischer Knie-Arthrose-Schmerz"],
    kontraindikationen: ["Antikoagulation (Vorsicht)", "lokale Infektion"],
    rechtlicherStatus: "arzt-only",
    evidenzGrad: "stark",
    europaQuelle: "G-BA Beschluss 2006 Akupunktur als GKV-Leistung · WHO Akupunktur-Indikationsliste",
    pflegerischeBegleitung: "Begleitung zur Akupunktur-Sitzung · Nachruhe-Phase 30 min im Behandlungsraum",
  },
  {
    code: "TCM-TUINA",
    label: "Tuina · chinesische Massage-Therapie",
    art: "tcm",
    wirkprinzip: "Druck + Streich-Techniken entlang Meridiane · Qi-Fluss",
    indikationen: ["myofasziale Verspannungen", "chronische Schmerz-Syndrome", "vegetative Dysregulation"],
    kontraindikationen: ["akute Entzündung", "Osteoporose-Stadium 3"],
    rechtlicherStatus: "heilpraktiker-only",
    evidenzGrad: "mittel",
    europaQuelle: "Forschungsverbund TCM Berlin · WHO Beijing Declaration on Traditional Medicine 2008",
  },

  // ─── Naturheilverfahren · Kneipp 5 Säulen ──────────────────────────────
  {
    code: "KNEIPP-WICKEL-WADE",
    label: "Wadenwickel bei erhöhter Temperatur",
    art: "naturheilverfahren",
    wirkprinzip: "Kalt-feuchter Wickel · Hauttemperatur senkt Körperkern-Temperatur",
    indikationen: ["Fieber > 38.5 °C bei warmer Haut", "Hitze-Sensation"],
    kontraindikationen: ["Schüttelfrost", "kalte Extremitäten", "Herz-Kreislauf-Instabilität"],
    rechtlicherStatus: "ergaenzend-pflege",
    evidenzGrad: "stark",
    europaQuelle: "Kneipp-Bund e.V. · DGNHK Standards",
    pflegerischeBegleitung: "20 °C Wassertemp · 10 min · 3× wechseln · Vital-Werte vor + nach",
  },
  {
    code: "KNEIPP-KAFFEEPACKUNG",
    label: "Quark-Wickel bei lokalen Entzündungen",
    art: "naturheilverfahren",
    wirkprinzip: "kühlend, abschwellend, anti-entzündlich",
    indikationen: ["Sonnenbrand-bedingte Hautrötung", "lokale Schwellung Sprunggelenk", "Mastitis"],
    kontraindikationen: ["offene Wunde", "Allergie Milcheiweiß"],
    rechtlicherStatus: "ergaenzend-pflege",
    evidenzGrad: "tradition",
    pflegerischeBegleitung: "fingerdick zwischen Tüchern · 30 min · 2-3× täglich",
  },

  // ─── Aromatherapie · pflegerisch sehr alltagstauglich ──────────────────
  {
    code: "AROMA-LAVENDEL",
    label: "Lavendelöl Luftbeduftung bei Unruhe + Schlafstörung",
    art: "aromatherapie",
    wirkprinzip: "Linalool + Linalylacetat → Limbisches System, anxiolytisch",
    indikationen: ["nächtliche Unruhe bei Demenz", "Einschlafstörung", "post-OP-Übelkeit"],
    kontraindikationen: ["Asthma bronchiale (Vorsicht inhalativ)"],
    rechtlicherStatus: "ergaenzend-pflege",
    evidenzGrad: "mittel",
    europaQuelle: "Lavandula angustifolia EMA HMPC Monograph",
    pflegerischeBegleitung: "Diffusor 30 min vor Bettzeit · 4 Tropfen Bio-Öl · Raum gut lüften vorher",
  },
  {
    code: "AROMA-PFEFFERMINZE",
    label: "Pfefferminzöl bei Spannungs-Kopfschmerz",
    art: "aromatherapie",
    wirkprinzip: "Menthol → Kühl-Wirkung, gefäß-modulierend",
    indikationen: ["Spannungs-Kopfschmerz", "Fokus-Probleme", "leichte Übelkeit"],
    kontraindikationen: ["Kinder < 4 J. (Kehlkopf-Krampf)", "Asthma"],
    rechtlicherStatus: "ergaenzend-pflege",
    evidenzGrad: "stark",
    europaQuelle: "Cochrane 2012 · International Headache Society Recommendation",
  },

  // ─── Osteopathie ───────────────────────────────────────────────────────
  {
    code: "OSTEO-VISCERAL",
    label: "Viszerale Osteopathie bei chron. Verdauungs-Beschwerden",
    art: "osteopathie",
    wirkprinzip: "manuelle Mobilisation der Bauchorgane · vegetative Regulation",
    indikationen: ["Reizdarm-Syndrom", "post-OP-Verklebungen", "chron. Obstipation"],
    kontraindikationen: ["akut entzündliche Erkrankung", "Tumoren im Bauchraum"],
    rechtlicherStatus: "heilpraktiker-only",
    evidenzGrad: "schwach",
    europaQuelle: "BAO Bundesarbeitsgemeinschaft Osteopathie · ECOP European Consortium of Osteopathic Practitioners",
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────

export function naturheilFuerBeschwerde(beschwerde: string): NaturheilVerfahren[] {
  const norm = beschwerde.toLowerCase();
  return NATURHEIL_KATALOG.filter((v) =>
    v.indikationen.some((i) => i.toLowerCase().includes(norm)),
  );
}

export function naturheilNachArt(art: NaturheilArt): NaturheilVerfahren[] {
  return NATURHEIL_KATALOG.filter((v) => v.art === art);
}

export function getNaturheil(code: string): NaturheilVerfahren | undefined {
  return NATURHEIL_KATALOG.find((v) => v.code === code);
}

export function pflegerischIntegrierbar(): NaturheilVerfahren[] {
  return NATURHEIL_KATALOG.filter((v) => v.rechtlicherStatus === "ergaenzend-pflege");
}
