// Anamnese-Schemas pro Berufsgruppe.
//
// Jede Profession hat einen eigenen, fachlich verankerten Anamnese-
// Bogen. Das Format ist deklarativ: Sektionen → Felder, deren UI sich
// aus dem Schema ergibt. So bleibt der Code für alle Berufe gleich;
// erweitern bedeutet nur, das Schema zu ergänzen.
//
// Phase 2: Migration auf FHIR Questionnaire + QuestionnaireResponse.

export type FeldTyp =
  | "kurztext"
  | "langtext"
  | "zahl"
  | "datum"
  | "boolean"
  | "skala_1_10"
  | "auswahl"
  | "multi_auswahl"
  | "schmerz_visual";

export type Feld = {
  id: string;
  label: string;
  hilfetext?: string;
  typ: FeldTyp;
  pflicht?: boolean;
  optionen?: { wert: string; label: string }[];
  einheit?: string;
  norm?: string;            // z.B. "DNQP-Sturzrisiko"
};

export type Sektion = {
  id: string;
  titel: string;
  intro?: string;
  felder: Feld[];
};

export type Schema = {
  id: string;
  beruf: "pflege" | "arzt" | "therapie" | "sozialarbeit" | "erziehung" | "heilerziehung" | "hauswirtschaft" | "ehrenamt";
  titel: string;
  beschreibung: string;
  norm?: string[];
  sektionen: Sektion[];
};

// ─── Pflege ───────────────────────────────────────────────────────────

export const SCHEMA_PFLEGE: Schema = {
  id: "pflege-sis-erweitert",
  beruf: "pflege",
  titel: "Pflegeanamnese — SIS-Strukturmodell + Risiko-Assessments",
  beschreibung: "Strukturierte Informationssammlung nach SIS, ergänzt um DNQP-Risiko-Assessments.",
  norm: ["SIS-Strukturmodell BMG", "DNQP-Expertenstandards"],
  sektionen: [
    {
      id: "selbstbild",
      titel: "Sicht der pflegebedürftigen Person",
      intro: "In eigenen Worten: Was ist Ihnen wichtig, was bereitet Sorgen, welche Hilfe wünschen Sie sich?",
      felder: [
        { id: "selbst_anliegen",   label: "Wichtigstes Anliegen heute", typ: "langtext", pflicht: true },
        { id: "selbst_sorge",      label: "Was bereitet Sorgen?",        typ: "langtext" },
        { id: "selbst_ziel",       label: "Selbstformuliertes Ziel",     typ: "langtext" },
        { id: "selbst_unterstuetzung", label: "Welche Unterstützung wünscht der Mensch?", typ: "langtext" },
      ],
    },
    {
      id: "themenfeld_1",
      titel: "Themenfeld 1 — Kognitive und kommunikative Fähigkeiten",
      felder: [
        { id: "tf1_orientierung",   label: "Orientierung (Person/Ort/Zeit/Situation)", typ: "auswahl",
          optionen: [{wert:"voll",label:"voll"},{wert:"teilweise",label:"teilweise"},{wert:"nicht",label:"nicht orientiert"}] },
        { id: "tf1_kommunikation",   label: "Verbale Kommunikation",                    typ: "auswahl",
          optionen: [{wert:"unauffaellig",label:"unauffällig"},{wert:"einfache_saetze",label:"einfache Sätze"},{wert:"einzelne_worte",label:"einzelne Worte"},{wert:"nonverbal",label:"nonverbal"}] },
        { id: "tf1_demenz_screen",   label: "Auffälligkeiten kognitiver Art (MMST-Wert falls bekannt)", typ: "zahl", einheit: "Pkt." },
      ],
    },
    {
      id: "themenfeld_2",
      titel: "Themenfeld 2 — Mobilität & Beweglichkeit",
      felder: [
        { id: "tf2_mobilitaet",      label: "Mobilitätsstufe", typ: "auswahl",
          optionen: [{wert:"selbststaendig",label:"selbstständig"},{wert:"mit_hilfsmittel",label:"mit Hilfsmittel"},{wert:"hilfe_eine_person",label:"Hilfe einer Person"},{wert:"hilfe_zwei_personen",label:"Hilfe zweier Personen"},{wert:"bettlaegerig",label:"bettlägerig"}] },
        { id: "tf2_sturzrisiko",     label: "Sturzrisiko-Score (Tinetti / Hendrich II)", typ: "zahl", einheit: "Pkt.", norm: "DNQP-Sturzprophylaxe" },
        { id: "tf2_dekubitus_risiko",label: "Dekubitusrisiko (Braden-Skala)", typ: "zahl", einheit: "Pkt.", norm: "DNQP-Dekubitusprophylaxe" },
      ],
    },
    {
      id: "themenfeld_3",
      titel: "Themenfeld 3 — Krankheits-/Therapie-bezogene Anforderungen",
      felder: [
        { id: "tf3_diagnosen",      label: "Aktuelle Diagnosen (ICD-10)",   typ: "langtext", pflicht: true },
        { id: "tf3_medikation",     label: "Aktuelle Medikation",            typ: "langtext", pflicht: true },
        { id: "tf3_priscus",        label: "PRISCUS-/FORTA-relevante Items", typ: "langtext" },
      ],
    },
    {
      id: "themenfeld_4",
      titel: "Themenfeld 4 — Selbstversorgung",
      felder: [
        { id: "tf4_essen",     label: "Essen / Trinken (Selbstständigkeit)", typ: "auswahl",
          optionen: [{wert:"selbst",label:"selbstständig"},{wert:"hilfe",label:"mit Hilfe"},{wert:"komplett",label:"komplette Übernahme"}] },
        { id: "tf4_ausscheid", label: "Ausscheidung",                          typ: "auswahl",
          optionen: [{wert:"kontinent",label:"kontinent"},{wert:"teilkont",label:"teilkontinent"},{wert:"inkont",label:"inkontinent"}] },
        { id: "tf4_koerperpflege", label: "Körperpflege",                      typ: "auswahl",
          optionen: [{wert:"selbst",label:"selbstständig"},{wert:"teilhilfe",label:"Teilhilfe"},{wert:"komplett",label:"komplett"}] },
      ],
    },
    {
      id: "themenfeld_5",
      titel: "Themenfeld 5 — Soziales Umfeld & Alltagsleben",
      felder: [
        { id: "tf5_kontakte",   label: "Wichtige Bezugspersonen",   typ: "langtext" },
        { id: "tf5_einsamkeit", label: "Einsamkeitsempfinden 0–10", typ: "skala_1_10" },
        { id: "tf5_tagesstruktur", label: "Bevorzugte Tagesstruktur", typ: "langtext" },
      ],
    },
    {
      id: "themenfeld_6",
      titel: "Themenfeld 6 — Wohn- und Lebensbereich",
      felder: [
        { id: "tf6_wohnsituation",  label: "Wohnsituation", typ: "kurztext" },
        { id: "tf6_barrieren",      label: "Barrieren / Hilfsmittelbedarf", typ: "langtext" },
      ],
    },
    {
      id: "ergaenzend",
      titel: "Ergänzende Risiko-Assessments",
      felder: [
        { id: "schmerz_nrs",      label: "Schmerz-NRS (0–10)", typ: "skala_1_10",  norm: "DNQP-Schmerzmanagement" },
        { id: "ernaehrung_must",  label: "Ernährungsstatus MUST-Score", typ: "zahl" },
        { id: "depression_phq2",  label: "Depressivität PHQ-2 (0–6)", typ: "zahl" },
      ],
    },
  ],
};

// ─── Arzt ─────────────────────────────────────────────────────────────

export const SCHEMA_ARZT: Schema = {
  id: "arzt-amb-anamnese",
  beruf: "arzt",
  titel: "Ärztliche Anamnese — ambulant",
  beschreibung: "Strukturierte Anamnese für hausärztliche/fachärztliche Visite mit Befund- und Therapieplanung.",
  norm: ["AWMF S3 Hausärztliche Beratung", "ICD-10-GM"],
  sektionen: [
    {
      id: "konsultationsanlass",
      titel: "Konsultationsanlass",
      felder: [
        { id: "anlass_haupt",     label: "Hauptanlass",          typ: "langtext", pflicht: true },
        { id: "anlass_dauer",     label: "Beschwerdedauer",       typ: "kurztext" },
        { id: "anlass_verlauf",   label: "Verlauf",                typ: "langtext" },
        { id: "anlass_schmerz",   label: "Schmerzcharakter (NRS, Lokalisation, Ausstrahlung)", typ: "schmerz_visual" },
      ],
    },
    {
      id: "vorgeschichte",
      titel: "Vorgeschichte",
      felder: [
        { id: "vor_chronisch",    label: "Chronische Erkrankungen", typ: "langtext" },
        { id: "vor_op",           label: "Operationen",              typ: "langtext" },
        { id: "vor_medikation",   label: "Dauermedikation",          typ: "langtext", pflicht: true },
        { id: "vor_allergien",    label: "Allergien / UAW",          typ: "langtext" },
        { id: "vor_familie",      label: "Familienanamnese",         typ: "langtext" },
        { id: "vor_sozial",       label: "Sozialanamnese (Beruf, Belastung)", typ: "langtext" },
      ],
    },
    {
      id: "vegetativ",
      titel: "Vegetative Anamnese",
      felder: [
        { id: "veg_appetit",   label: "Appetit",     typ: "auswahl", optionen: [{wert:"normal",label:"normal"},{wert:"reduziert",label:"reduziert"},{wert:"gesteigert",label:"gesteigert"}] },
        { id: "veg_gewicht",   label: "Gewichtsveränderung 6 Mo (kg)", typ: "zahl", einheit: "kg" },
        { id: "veg_schlaf",    label: "Schlaf",       typ: "auswahl", optionen: [{wert:"erholsam",label:"erholsam"},{wert:"gestoert",label:"gestört"},{wert:"nicht_erholsam",label:"nicht erholsam"}] },
        { id: "veg_stuhl",     label: "Stuhl",        typ: "kurztext" },
        { id: "veg_miktion",   label: "Miktion",      typ: "kurztext" },
        { id: "veg_libido",    label: "Libido / Sexualität", typ: "kurztext" },
        { id: "veg_alkohol",   label: "Alkohol (g/Tag)", typ: "zahl", einheit: "g/d" },
        { id: "veg_nikotin",   label: "Nikotin (Pack-years)", typ: "zahl", einheit: "py" },
      ],
    },
    {
      id: "befund",
      titel: "Klinischer Befund",
      felder: [
        { id: "bef_av",        label: "Allgemeinzustand",   typ: "auswahl", optionen: [{wert:"gut",label:"gut"},{wert:"reduziert",label:"reduziert"},{wert:"deutlich_reduziert",label:"deutlich reduziert"}] },
        { id: "bef_ez",        label: "Ernährungszustand",  typ: "auswahl", optionen: [{wert:"adipoes",label:"adipös"},{wert:"normal",label:"normal"},{wert:"unter",label:"untergewichtig"},{wert:"kachek",label:"kachektisch"}] },
        { id: "bef_rr",        label: "RR (mmHg)",          typ: "kurztext" },
        { id: "bef_puls",      label: "Puls (bpm)",          typ: "zahl", einheit: "bpm" },
        { id: "bef_freitext",  label: "Klinischer Befund (frei)", typ: "langtext" },
      ],
    },
    {
      id: "diagnose_plan",
      titel: "Diagnose & Plan",
      felder: [
        { id: "dia_arbeitsdiagnose", label: "Arbeitsdiagnose (ICD-10)", typ: "langtext" },
        { id: "dia_differential",    label: "Differentialdiagnosen",     typ: "langtext" },
        { id: "dia_diagnostik",      label: "Geplante Diagnostik",        typ: "langtext" },
        { id: "dia_therapie",        label: "Therapieplan",                typ: "langtext" },
      ],
    },
  ],
};

// ─── Therapie (Heilmittelerbringer) ───────────────────────────────────

export const SCHEMA_THERAPIE: Schema = {
  id: "therapie-physio-orth",
  beruf: "therapie",
  titel: "Physio-/Ergotherapeutische Befunderhebung",
  beschreibung: "Befund + Funktionsdiagnostik nach Heilmittelrichtlinie (Anlage 1).",
  norm: ["G-BA Heilmittelrichtlinie", "ICF"],
  sektionen: [
    {
      id: "auftrag",
      titel: "Verordnung & Auftrag",
      felder: [
        { id: "ver_diagnose",  label: "Verordnungsdiagnose (ICD-10 + Heilmittelposition)", typ: "kurztext", pflicht: true },
        { id: "ver_anzahl",    label: "Anzahl Behandlungseinheiten",                       typ: "zahl" },
        { id: "ver_ziel_arzt", label: "Therapieziel laut Arzt",                              typ: "langtext" },
      ],
    },
    {
      id: "icf_befund",
      titel: "ICF-Befund",
      felder: [
        { id: "icf_koerperfunktion", label: "Körperfunktionsstörungen (b-Codes)", typ: "langtext" },
        { id: "icf_aktivitaet",       label: "Aktivität / Teilhabe (d-Codes)",      typ: "langtext" },
        { id: "icf_umweltfaktor",     label: "Umweltfaktoren (e-Codes)",            typ: "langtext" },
      ],
    },
    {
      id: "funktion",
      titel: "Funktionsdiagnostik",
      felder: [
        { id: "fkt_haltung",     label: "Haltungsanalyse (Frontal/Sagittal)",  typ: "langtext" },
        { id: "fkt_rom",          label: "Range of Motion (Schlüsselgelenke)",  typ: "langtext" },
        { id: "fkt_kraftpruef",   label: "Kraftprüfung MRC 0–5",                typ: "langtext" },
        { id: "fkt_schmerz",      label: "Schmerzlokalisation + NRS",          typ: "schmerz_visual" },
        { id: "fkt_gangbild",     label: "Gangbild (frei)",                      typ: "langtext" },
        { id: "fkt_balance",      label: "Gleichgewicht (Berg-Balance / Tinetti)", typ: "kurztext" },
      ],
    },
    {
      id: "ziel_plan",
      titel: "Ziel- & Behandlungsplan (SMART)",
      felder: [
        { id: "ziel_kurz",   label: "Kurzfristziel (1–3 Sitzungen)",  typ: "langtext" },
        { id: "ziel_mittel", label: "Mittelfristig (Verordnungsende)", typ: "langtext" },
        { id: "ziel_lang",   label: "Langfrist (Alltag)",                typ: "langtext" },
        { id: "plan_methoden", label: "Methoden", typ: "multi_auswahl",
          optionen: [
            {wert:"manuelle_therapie",label:"Manuelle Therapie"},
            {wert:"krankengymnastik",label:"Krankengymnastik"},
            {wert:"mt_zns",label:"MT/Bobath ZNS"},
            {wert:"mld",label:"Manuelle Lymphdrainage"},
            {wert:"elektro",label:"Elektrotherapie"},
            {wert:"thermo",label:"Wärme/Kälte"},
            {wert:"gangschule",label:"Gangschule"},
            {wert:"adl",label:"ADL-Training"},
          ] },
      ],
    },
  ],
};

// ─── Soziale Arbeit ───────────────────────────────────────────────────

export const SCHEMA_SOZIAL: Schema = {
  id: "sozial-hilfeplan",
  beruf: "sozialarbeit",
  titel: "Hilfeplanung — Soziale Arbeit",
  beschreibung: "Bedarfserfassung mit Lebenslagen-Analyse für SGB IX/XII/VIII.",
  norm: ["BTHG / SGB IX", "DGCC Case-Management"],
  sektionen: [
    {
      id: "lebenslage",
      titel: "Lebenslage",
      felder: [
        { id: "leb_haushalt",     label: "Haushaltsform",        typ: "kurztext" },
        { id: "leb_finanzen",     label: "Finanzielle Situation", typ: "auswahl", optionen: [
          {wert:"gesichert",label:"gesichert"},{wert:"angespannt",label:"angespannt"},{wert:"kritisch",label:"existenziell kritisch"}
        ] },
        { id: "leb_wohnen",        label: "Wohnsituation",         typ: "langtext" },
        { id: "leb_beziehung",     label: "Beziehungsnetz",        typ: "langtext" },
        { id: "leb_migration",     label: "Migrations-/Fluchterfahrung", typ: "boolean" },
      ],
    },
    {
      id: "bedarf",
      titel: "Bedarfsbereiche (BTHG-orientiert)",
      felder: [
        { id: "bed_lernen",       label: "Lernen + Wissensanwendung",  typ: "langtext" },
        { id: "bed_kommunikation", label: "Kommunikation",              typ: "langtext" },
        { id: "bed_selbstvers",    label: "Selbstversorgung",            typ: "langtext" },
        { id: "bed_haushalt",      label: "Häusliches Leben",            typ: "langtext" },
        { id: "bed_beziehungen",   label: "Interpersonelle Beziehungen", typ: "langtext" },
        { id: "bed_arbeit",         label: "Bedeutende Lebensbereiche (Arbeit/Schule)", typ: "langtext" },
        { id: "bed_gemeinschaft",   label: "Gemeinschafts-/Soziales Leben", typ: "langtext" },
      ],
    },
    {
      id: "ressourcen",
      titel: "Ressourcen + Schutzfaktoren",
      felder: [
        { id: "res_persoenl",  label: "Persönliche Stärken", typ: "langtext" },
        { id: "res_netzwerk",  label: "Tragendes Netzwerk",   typ: "langtext" },
        { id: "res_traeger",   label: "Bereits beteiligte Träger", typ: "langtext" },
      ],
    },
    {
      id: "hilfeplan",
      titel: "Hilfeplan",
      felder: [
        { id: "hilf_ziele",       label: "Ziele (mit Zeitperspektive)", typ: "langtext", pflicht: true },
        { id: "hilf_massnahmen",  label: "Maßnahmen + Träger",          typ: "langtext", pflicht: true },
        { id: "hilf_review",      label: "Review-Termin",                typ: "datum" },
      ],
    },
  ],
};

// ─── Erziehung ────────────────────────────────────────────────────────

export const SCHEMA_ERZIEHUNG: Schema = {
  id: "erzieh-bildungsdoku",
  beruf: "erziehung",
  titel: "Bildungs- und Lerndokumentation (Bildungs- und Lerngeschichten)",
  beschreibung: "Beobachtende, ressourcenorientierte Dokumentation in Anlehnung an die Bildungsbereiche.",
  norm: ["KJHG / SGB VIII", "Bildungsprogramme der Länder"],
  sektionen: [
    {
      id: "kontext",
      titel: "Kontext",
      felder: [
        { id: "ktx_gruppe",   label: "Gruppe / Setting",      typ: "kurztext" },
        { id: "ktx_alter",    label: "Alter (Monate/Jahre)",  typ: "kurztext" },
        { id: "ktx_bezug",     label: "Hauptbezugspersonen",   typ: "langtext" },
      ],
    },
    {
      id: "bildungsbereiche",
      titel: "Bildungsbereiche",
      felder: [
        { id: "bil_sprache",   label: "Sprache & Kommunikation", typ: "langtext" },
        { id: "bil_bewegung",  label: "Bewegung & Gesundheit",   typ: "langtext" },
        { id: "bil_sozial",    label: "Soziales & Gefühle",       typ: "langtext" },
        { id: "bil_natur",     label: "Natur, Umwelt, Technik",   typ: "langtext" },
        { id: "bil_kunst",     label: "Kunst, Musik, Tanz",        typ: "langtext" },
        { id: "bil_mathe",     label: "Mathematik & Logik",        typ: "langtext" },
      ],
    },
    {
      id: "schutz",
      titel: "Schutzauftrag (§ 8a SGB VIII)",
      felder: [
        { id: "schz_indikatoren", label: "Auffälligkeiten / Indikatoren", typ: "langtext" },
        { id: "schz_einschaetzung", label: "Risikoeinschätzung", typ: "auswahl",
          optionen: [{wert:"keine",label:"keine"},{wert:"latente",label:"latente Gefährdung"},{wert:"akute",label:"akute Gefährdung"}] },
        { id: "schz_besprochen", label: "Mit insoweit erfahrener Fachkraft besprochen?", typ: "boolean" },
      ],
    },
  ],
};

// ─── Heilerziehung ───────────────────────────────────────────────────

export const SCHEMA_HEILERZ: Schema = {
  id: "heilerz-teilhabe",
  beruf: "heilerziehung",
  titel: "Heilerziehungs-Anamnese — Teilhabe (BTHG/ICF)",
  beschreibung: "Personenzentrierte Bedarfsermittlung in der Eingliederungshilfe.",
  norm: ["BTHG / SGB IX Teil 2", "ICF"],
  sektionen: [
    {
      id: "person",
      titel: "Person & Perspektive",
      felder: [
        { id: "per_lebensgeschichte", label: "Lebensgeschichte (Biographie)", typ: "langtext" },
        { id: "per_wuensche",         label: "Eigene Wünsche / Ziele",         typ: "langtext", pflicht: true },
        { id: "per_kommunikation",    label: "Kommunikationsformen (UK?)",     typ: "langtext" },
      ],
    },
    {
      id: "icf",
      titel: "ICF-Teilhabebereiche",
      felder: [
        { id: "icf_lernen",     label: "Lernen & Wissensanwendung",  typ: "langtext" },
        { id: "icf_mobilitaet", label: "Mobilität",                    typ: "langtext" },
        { id: "icf_selbst",     label: "Selbstversorgung",             typ: "langtext" },
        { id: "icf_haus",       label: "Häusliches Leben",              typ: "langtext" },
        { id: "icf_inter",      label: "Interpersonelle Beziehungen",   typ: "langtext" },
        { id: "icf_arbeit",     label: "Bedeutende Lebensbereiche",     typ: "langtext" },
      ],
    },
    {
      id: "assistenz",
      titel: "Assistenzbedarf",
      felder: [
        { id: "ass_typ",    label: "Assistenztyp",  typ: "multi_auswahl",
          optionen: [
            {wert:"basis",label:"Basis-Assistenz"},
            {wert:"qualifiziert",label:"qualifizierte Assistenz"},
            {wert:"persoenliches_budget",label:"Persönliches Budget"},
          ] },
        { id: "ass_umfang", label: "Wöchentlicher Umfang (h/Wo)", typ: "zahl", einheit: "h/Wo" },
      ],
    },
  ],
};

// ─── Hauswirtschaft ──────────────────────────────────────────────────

export const SCHEMA_HAUSWIRT: Schema = {
  id: "hauswirt-bedarf",
  beruf: "hauswirtschaft",
  titel: "Hauswirtschaftliche Bedarfserhebung",
  beschreibung: "Versorgungsstandards Wohnen, Ernährung, Wäsche.",
  norm: ["Berufsbild HwO", "DGE-Qualitätsstandards"],
  sektionen: [
    {
      id: "ernaehrung",
      titel: "Ernährung",
      felder: [
        { id: "ern_form",    label: "Kostform",                   typ: "multi_auswahl",
          optionen: [
            {wert:"vollkost",label:"Vollkost"},
            {wert:"diabetiker",label:"diabetesgerecht"},
            {wert:"dysphagie",label:"Dysphagie-Kost (IDDSI)"},
            {wert:"vegan",label:"vegan"},
            {wert:"halal",label:"halal"},
            {wert:"koscher",label:"koscher"},
          ] },
        { id: "ern_allergien", label: "Allergien / Unverträglichkeiten", typ: "langtext" },
        { id: "ern_praeferenz", label: "Vorlieben / Abneigungen",         typ: "langtext" },
      ],
    },
    {
      id: "wohnen",
      titel: "Wohnumfeld",
      felder: [
        { id: "wo_reinigung",  label: "Bedarf Reinigung",   typ: "kurztext" },
        { id: "wo_waesche",    label: "Wäsche",              typ: "kurztext" },
        { id: "wo_einkauf",    label: "Einkauf",              typ: "kurztext" },
      ],
    },
  ],
};

// ─── Ehrenamt ────────────────────────────────────────────────────────

export const SCHEMA_EHRENAMT: Schema = {
  id: "ehren-begleit",
  beruf: "ehrenamt",
  titel: "Ehrenamtliche Begleitung — Erstgespräch",
  beschreibung: "Niedrigschwelliges Erstgespräch zur Wunsch-/Bedarfs-Klärung.",
  sektionen: [
    {
      id: "wunsch",
      titel: "Wunsch",
      felder: [
        { id: "wun_freude",  label: "Was bringt Freude?",    typ: "langtext" },
        { id: "wun_aktivitaet", label: "Was möchten Sie gern tun?", typ: "langtext" },
        { id: "wun_zeit",    label: "Bevorzugte Zeit",        typ: "kurztext" },
      ],
    },
    {
      id: "rahmen",
      titel: "Rahmenbedingungen",
      felder: [
        { id: "rah_haeufigkeit", label: "Häufigkeit",   typ: "kurztext" },
        { id: "rah_dauer",        label: "Dauer / Treffen", typ: "kurztext" },
        { id: "rah_grenzen",      label: "Grenzen / Tabus", typ: "langtext" },
      ],
    },
  ],
};

// ─── Registry ────────────────────────────────────────────────────────

export const ALLE_SCHEMAS: Record<Schema["beruf"], Schema> = {
  pflege:         SCHEMA_PFLEGE,
  arzt:           SCHEMA_ARZT,
  therapie:       SCHEMA_THERAPIE,
  sozialarbeit:   SCHEMA_SOZIAL,
  erziehung:      SCHEMA_ERZIEHUNG,
  heilerziehung:  SCHEMA_HEILERZ,
  hauswirtschaft: SCHEMA_HAUSWIRT,
  ehrenamt:       SCHEMA_EHRENAMT,
};

export function schemaFuerBeruf(b: Schema["beruf"]): Schema {
  return ALLE_SCHEMAS[b];
}
