// NANDA-I Pflegediagnose-Katalog (Auswahl ~30 häufigste Diagnosen).
//
// Vollständig sind es ~250 Diagnosen — wir decken in Phase 1 die
// alltagsrelevanten ab, gruppiert nach NANDA-Domänen 1–13. Format
// Klassifikation 2024–2026.
//
// AEDS-Format pro Diagnose:
//   PE-S = Problem · Einflussfaktoren · Symptome
// (Im Aufbau: Klient-Diagnose-Eintrag fügt Klient-spezifische Faktoren+
//  Symptome hinzu, der Katalog liefert Default-Vorschläge.)

export type NandaDomain =
  | 1  // Gesundheitsförderung
  | 2  // Ernährung
  | 3  // Ausscheidung + Austausch
  | 4  // Aktivität / Ruhe
  | 5  // Wahrnehmung / Kognition
  | 6  // Selbstwahrnehmung
  | 7  // Rolle / Beziehung
  | 8  // Sexualität
  | 9  // Coping / Stresstoleranz
  | 10 // Lebensprinzipien
  | 11 // Sicherheit / Schutz
  | 12 // Wohlbefinden
  | 13; // Wachstum / Entwicklung

export const DOMAIN_LABEL: Record<NandaDomain, string> = {
  1:  "Gesundheitsförderung",
  2:  "Ernährung",
  3:  "Ausscheidung + Austausch",
  4:  "Aktivität / Ruhe",
  5:  "Wahrnehmung / Kognition",
  6:  "Selbstwahrnehmung",
  7:  "Rolle / Beziehung",
  8:  "Sexualität",
  9:  "Coping / Stresstoleranz",
  10: "Lebensprinzipien",
  11: "Sicherheit / Schutz",
  12: "Wohlbefinden",
  13: "Wachstum / Entwicklung",
};

export const DOMAIN_FARBE: Record<NandaDomain, string> = {
  1:  "var(--thu)",
  2:  "var(--sun)",
  3:  "var(--vibe-team)",
  4:  "var(--fri)",
  5:  "var(--vibe-profile)",
  6:  "var(--wed)",
  7:  "var(--accent)",
  8:  "var(--sat)",
  9:  "var(--vibe-stats)",
  10: "var(--tue)",
  11: "var(--mon)",
  12: "var(--vibe-approval)",
  13: "var(--fri)",
};

export type NandaDiagnose = {
  code: string;            // z.B. "00132"
  label: string;           // "Akuter Schmerz"
  domain: NandaDomain;
  // Default-Vorschläge für AEDS-Befüllung
  defaultEinflussfaktoren: string[];
  defaultSymptome: string[];
  empfohleneInterventionen: string[];   // NIC-orientiert (kurze Stichworte)
  empfohleneZiele: string[];            // NOC-orientiert
};

export const NANDA_KATALOG: NandaDiagnose[] = [
  // Domain 2 · Ernährung
  {
    code: "00002",
    label: "Mangelernährung",
    domain: 2,
    defaultEinflussfaktoren: ["unzureichende Nahrungsaufnahme", "veränderter Geschmackssinn", "Schluckstörung"],
    defaultSymptome: ["Gewichtsverlust > 5 % in 1 Mo.", "Mna-SF ≤ 11", "verminderte Esslust"],
    empfohleneInterventionen: ["Trink-/Esstagebuch", "Konsil Diätberatung", "kleine Portionen 6×/Tag", "Wunschkost erfragen"],
    empfohleneZiele: ["Gewicht stabil über 30 Tage", "MNA-SF ≥ 12", "selbstständige Aufnahme von 80 % Tellermenge"],
  },
  {
    code: "00027",
    label: "Defizientes Flüssigkeitsvolumen",
    domain: 2,
    defaultEinflussfaktoren: ["aktive Verluste (Diarrhö, Erbrechen)", "verminderte Flüssigkeitsaufnahme", "Diuretika"],
    defaultSymptome: ["trockene Schleimhäute", "verminderter Hautturgor", "Tachykardie", "Oligurie"],
    empfohleneInterventionen: ["Trinkplan 1500 ml/d", "Bilanzierung Ein-/Ausfuhr", "Mund-pflege 4×/d", "Lieblingsgetränke bereitstellen"],
    empfohleneZiele: ["Trinkmenge ≥ 1500 ml/d über 7 Tage", "Hautturgor normal", "Urin-Ausscheidung 1500 ml/d"],
  },

  // Domain 3 · Ausscheidung
  {
    code: "00011",
    label: "Obstipation",
    domain: 3,
    defaultEinflussfaktoren: ["geringe Bewegung", "ballaststoffarme Kost", "Opioid-Therapie"],
    defaultSymptome: ["Stuhlfrequenz < 3×/Wo", "harte Stühle", "Pressen erforderlich"],
    empfohleneInterventionen: ["Bewegungsplan", "Trinkmenge erhöhen", "Quellmittel · Lactulose nach Verordnung"],
    empfohleneZiele: ["Stuhlgang ≥ 3×/Wo weich", "selbstbestimmte Ausscheidung"],
  },
  {
    code: "00016",
    label: "Beeinträchtigte Urinausscheidung",
    domain: 3,
    defaultEinflussfaktoren: ["Inkontinenz-Genese", "Mobilitätseinschränkung", "kognitive Einschränkung"],
    defaultSymptome: ["unfreiwilliger Urinabgang", "Toilettengang nicht rechtzeitig erreicht", "Restharn > 100 ml"],
    empfohleneInterventionen: ["Toilettentraining", "Hilfsmittel-Versorgung", "Hautschutz", "Konsil Urologie"],
    empfohleneZiele: ["Tages-Trockenheit > 80 %", "keine Hautreizung im Inkontinenz-Bereich"],
  },

  // Domain 4 · Aktivität / Ruhe
  {
    code: "00085",
    label: "Beeinträchtigte körperliche Mobilität",
    domain: 4,
    defaultEinflussfaktoren: ["Schmerz", "Muskelschwäche", "Gelenksteifigkeit", "Dekonditionierung"],
    defaultSymptome: ["eingeschränktes Gangbild", "Hilfe bei Transfer notwendig", "Tinetti ≤ 19"],
    empfohleneInterventionen: ["Bewegungsübungen 2×/d", "Konsil Physiotherapie", "Hilfsmittel anpassen", "Sturzprophylaxe"],
    empfohleneZiele: ["Tinetti ≥ 22 in 4 Wochen", "selbstständiger Toilettengang", "Transfer mit ≤ 1 Person"],
  },
  {
    code: "00198",
    label: "Gestörter Schlaf",
    domain: 4,
    defaultEinflussfaktoren: ["nächtliche Schmerzen", "Lärm in der Einrichtung", "Sorgen / Angst"],
    defaultSymptome: ["Klient berichtet Müdigkeit", "frühes Erwachen", "Tagesschlaf > 2 h"],
    empfohleneInterventionen: ["Schlafhygiene-Plan", "abendliche Ruhezeit ab 21 Uhr", "Lärm reduzieren", "ggf. Schmerz-Reserve abend"],
    empfohleneZiele: ["mindestens 6 h durchgehender Nachtschlaf", "Klient berichtet Erholung"],
  },

  // Domain 5 · Wahrnehmung / Kognition
  {
    code: "00128",
    label: "Akute Verwirrtheit",
    domain: 5,
    defaultEinflussfaktoren: ["Infektion (z.B. Harnwegsinfekt)", "Medikamenten-Wechsel", "Dehydrierung", "neue Umgebung"],
    defaultSymptome: ["plötzliche Desorientierung", "Halluzinationen", "Schlaf-Wach-Umkehr", "vermehrte Unruhe"],
    empfohleneInterventionen: ["Ursache abklären (Urin-Status, Medi-Check)", "ruhige Umgebung", "Validation", "Bezugspflege"],
    empfohleneZiele: ["Reorientierung in 7 Tagen", "Schlafrhythmus stabilisiert"],
  },
  {
    code: "00129",
    label: "Chronische Verwirrtheit",
    domain: 5,
    defaultEinflussfaktoren: ["Demenz (Alzheimer / vaskulär / FTD)", "Hirnatrophie", "wiederholte Apoplexien"],
    defaultSymptome: ["Orientierungsstörung", "Gedächtnislücken", "kein Erkennen vertrauter Personen"],
    empfohleneInterventionen: ["Validation nach Feil", "10-min-Aktivierung", "Biographie-Arbeit", "Tagesstruktur"],
    empfohleneZiele: ["emotionales Wohlbefinden tagsüber", "Erhalt der vorhandenen Ressourcen"],
  },

  // Domain 6 · Selbstwahrnehmung
  {
    code: "00120",
    label: "Geringes Selbstwertgefühl, situationsbedingt",
    domain: 6,
    defaultEinflussfaktoren: ["Funktionsverlust", "Verlust von Autonomie", "Pflegebedürftigkeit"],
    defaultSymptome: ["selbstabwertende Aussagen", "Rückzug", "Verzicht auf Entscheidungen"],
    empfohleneInterventionen: ["Ressourcen würdigen", "Wahlmöglichkeiten anbieten", "Lebensgeschichte einbeziehen", "Konsil Psychologie wenn anhaltend"],
    empfohleneZiele: ["Klient äußert mindestens 1 Tagesplanungs-Wunsch", "aktive Teilnahme an Pflege-Visite"],
  },

  // Domain 9 · Coping / Stresstoleranz
  {
    code: "00146",
    label: "Angst",
    domain: 9,
    defaultEinflussfaktoren: ["unklare Diagnose", "Krankenhaus-Aufnahme", "Verlust der Unabhängigkeit", "Sterbe-Angst"],
    defaultSymptome: ["Unruhe", "schnelle Atmung", "Schlafstörungen", "Klient verbalisiert Angst"],
    empfohleneInterventionen: ["aktives Zuhören", "Atemübungen", "Bezugspflege", "ggf. Konsil Hospiz / Seelsorge"],
    empfohleneZiele: ["Klient berichtet von Erleichterung", "Schlaf wieder mind. 6 h"],
  },

  // Domain 11 · Sicherheit / Schutz
  {
    code: "00155",
    label: "Sturzgefahr",
    domain: 11,
    defaultEinflussfaktoren: ["Tinetti ≤ 19", "Polypharmazie", "Sehstörung", "Inkontinenz mit Hektik"],
    defaultSymptome: ["Schwindel", "frühere Stürze in Anamnese", "unsicheres Gangbild"],
    empfohleneInterventionen: ["Sturzprotokoll", "Hüftprotektoren", "Anti-Rutsch-Socken", "Nachtbeleuchtung", "Klingel in Reichweite"],
    empfohleneZiele: ["sturzfrei 90 Tage", "Tinetti ≥ 22"],
  },
  {
    code: "00046",
    label: "Beeinträchtigte Hautintegrität",
    domain: 11,
    defaultEinflussfaktoren: ["Immobilität", "Inkontinenz", "Mangelernährung", "Reibung / Scherkräfte"],
    defaultSymptome: ["Rötung über Knochenvorsprüngen", "Hautmazeration", "Wundgrund", "Braden ≤ 18"],
    empfohleneInterventionen: ["2-h-Mobilisations-Plan", "Druck-entlastende Auflage", "Hautpflege täglich", "Wunddoku ICW-Standard"],
    empfohleneZiele: ["keine Druckläsion neu in 30 Tagen", "Braden ≥ 19"],
  },
  {
    code: "00004",
    label: "Infektionsgefahr",
    domain: 11,
    defaultEinflussfaktoren: ["Immunsuppression", "invasive Zugänge", "chronische Wunden", "MRSA-/MRE-Status"],
    defaultSymptome: ["—"],
    empfohleneInterventionen: ["Händedesinfektion vor + nach", "Isolations-Hygiene wenn indiziert", "PEG/PVK-Pflege nach Standard"],
    empfohleneZiele: ["keine Infektion in 30 Tagen", "Compliance Hygiene-Bundle ≥ 95 %"],
  },

  // Domain 12 · Wohlbefinden
  {
    code: "00132",
    label: "Akuter Schmerz",
    domain: 12,
    defaultEinflussfaktoren: ["postoperativ", "Trauma", "Infektion", "Lagerung"],
    defaultSymptome: ["NRS ≥ 4", "Schonhaltung", "Schwitzen", "Klient verbalisiert Schmerz"],
    empfohleneInterventionen: ["NRS 1×/Schicht erfassen", "Bedarfsmedikation prüfen", "Lagerungswechsel", "ablenkende Aktivierung"],
    empfohleneZiele: ["NRS ≤ 3 binnen 2 h nach Bedarfsgabe", "Schlaf nicht gestört"],
  },
  {
    code: "00133",
    label: "Chronischer Schmerz",
    domain: 12,
    defaultEinflussfaktoren: ["chronische Erkrankung", "Z.n. Operation > 3 Monate", "Tumorgenese"],
    defaultSymptome: ["NRS dauerhaft ≥ 3", "Schlafstörung", "Verzicht auf Aktivitäten"],
    empfohleneInterventionen: ["Schmerz-Tagebuch", "Bedarfs- + Basis-Medi prüfen", "Konsil Schmerzambulanz", "nicht-medikamentöse Optionen"],
    empfohleneZiele: ["NRS ≤ 4 dauerhaft", "Teilnahme an mind. 2 Aktivitäten/Wo"],
  },
];

export function getDiagnose(code: string): NandaDiagnose | undefined {
  return NANDA_KATALOG.find((d) => d.code === code);
}

export function listKatalogByDomain(): Map<NandaDomain, NandaDiagnose[]> {
  const m = new Map<NandaDomain, NandaDiagnose[]>();
  for (const d of NANDA_KATALOG) {
    const arr = m.get(d.domain) ?? [];
    arr.push(d);
    m.set(d.domain, arr);
  }
  return m;
}
