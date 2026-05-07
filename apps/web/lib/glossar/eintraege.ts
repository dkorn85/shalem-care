// Pflege-Glossar · Klartext-Nachschlagewerk.
// Begriffe sortiert nach Akronym/Kürzel; Kategorien filtern die Liste.

export type GlossarKategorie =
  | "leistung"
  | "begutachtung"
  | "recht"
  | "digital"
  | "rolle"
  | "geld"
  | "zeit";

export const KATEGORIE_LABEL: Record<GlossarKategorie, string> = {
  leistung:    "Leistungen",
  begutachtung:"Begutachtung",
  recht:       "Recht & Gesetz",
  digital:     "Digital & Daten",
  rolle:       "Personen & Rollen",
  geld:        "Geld & Abrechnung",
  zeit:        "Arbeitszeit",
};

export const KATEGORIE_FARBE: Record<GlossarKategorie, string> = {
  leistung:    "var(--thu)",
  begutachtung:"var(--vibe-team)",
  recht:       "var(--mon)",
  digital:     "var(--fri)",
  rolle:       "var(--vibe-profile)",
  geld:        "var(--vibe-stats)",
  zeit:        "var(--tue)",
};

export type GlossarEintrag = {
  kuerzel: string;
  langform: string;
  kategorie: GlossarKategorie;
  klartext: string;
  /** Optional: weiterführender Link in der App. */
  link?: { href: string; label: string };
};

export const GLOSSAR: GlossarEintrag[] = [
  {
    kuerzel: "AÜG",
    langform: "Arbeitnehmerüberlassungsgesetz",
    kategorie: "recht",
    klartext:
      "Regelt, unter welchen Bedingungen Mitarbeitende an andere Betriebe ausgeliehen werden dürfen. Pflege gilt seit 2017 als nicht-zulässige Berufsgruppe für klassischen Verleih — Genossenschafts-Modelle umgehen das, weil Pflegekräfte Mit-Eigentümer sind.",
  },
  {
    kuerzel: "ArbZG",
    langform: "Arbeitszeitgesetz",
    kategorie: "zeit",
    klartext:
      "Begrenzt die tägliche Arbeitszeit (max. 10 h), schreibt 11 h Ruhezeit zwischen Schichten und Pausen-Mindestlängen vor. Verstöße sind bußgeldbewehrt — Shalem prüft das im Hintergrund vor jeder Schicht-Zuweisung.",
    link: { href: "/admin/dienstplan", label: "Dienstplan-HUD" },
  },
  {
    kuerzel: "BTHG",
    langform: "Bundesteilhabegesetz",
    kategorie: "recht",
    klartext:
      "Zentrales Gesetz für Menschen mit Behinderung. Trennt Eingliederungs-Hilfe von Existenz-Sicherung, regelt Persönliches Budget und Teilhabeplanung. Wichtig für Heilerziehung und Sozialarbeit.",
    link: { href: "/heilerziehung/teilhabe", label: "Teilhabeplan" },
  },
  {
    kuerzel: "DRG",
    langform: "Diagnosis Related Groups",
    kategorie: "geld",
    klartext:
      "Fallpauschalen-System der Krankenhäuser. Jede Diagnose-/Prozedur-Kombi hat einen festen Erlös, unabhängig davon wie lange jemand bleibt. Treibt Verweildauer-Reduktion und damit den Pflege-Druck.",
  },
  {
    kuerzel: "DSGVO",
    langform: "Datenschutz-Grundverordnung",
    kategorie: "recht",
    klartext:
      "EU-Verordnung zum Schutz personenbezogener Daten. In der Pflege besonders relevant für Klient:innen-Akten und Mitarbeitenden-Daten. Auskunft, Berichtigung, Löschung sind Selbstbedienungs-Funktionen in deinem Profil.",
    link: { href: "/profil/dsgvo", label: "DSGVO-Self-Service" },
  },
  {
    kuerzel: "DTA",
    langform: "Datenträger-Austausch",
    kategorie: "geld",
    klartext:
      "Standardisiertes Format für die Abrechnung mit Krankenkassen (KV-Datenaustausch). Shalem exportiert es direkt aus dem Kasse-Vorgang, sodass keine PDFs händisch konvertiert werden müssen.",
    link: { href: "/kasse", label: "Kasse-Vorgänge" },
  },
  {
    kuerzel: "eAU",
    langform: "elektronische Arbeitsunfähigkeits-Bescheinigung",
    kategorie: "digital",
    klartext:
      "Seit 2023 Pflicht: der 'Gelbe Schein' wird digital von der Praxis an die Krankenkasse übertragen. Arbeitgeber rufen sie elektronisch ab.",
    link: { href: "/kasse/eau", label: "eAU-Eingangskorb" },
  },
  {
    kuerzel: "eG",
    langform: "eingetragene Genossenschaft",
    kategorie: "recht",
    klartext:
      "Rechtsform mit dem Prinzip 'eine Person, eine Stimme' unabhängig vom Kapital-Anteil. Geregelt in § 1 ff. GenG. Shalem Care eG i.G. (in Gründung) bekommt diesen Status mit dem Notar-Termin.",
    link: { href: "/genossenschaft", label: "Wie sie funktioniert" },
  },
  {
    kuerzel: "ePA",
    langform: "elektronische Patientenakte",
    kategorie: "digital",
    klartext:
      "Lebenslange Akte über die Telematikinfrastruktur. Seit 2025 als Opt-out für gesetzlich Versicherte. Shalem ist FHIR-nativ und damit ePA-anschluss-fähig.",
    link: { href: "/klient/akte", label: "Klient-Akte" },
  },
  {
    kuerzel: "FHIR",
    langform: "Fast Healthcare Interoperability Resources",
    kategorie: "digital",
    klartext:
      "Internationaler Standard für medizinische Daten-Austausch (HL7). Shalem speichert Akten als FHIR-Ressourcen — interoperabel mit ePA, KIS-Systemen, Forschungs-Datenbanken.",
  },
  {
    kuerzel: "GenG",
    langform: "Genossenschaftsgesetz",
    kategorie: "recht",
    klartext:
      "Regelt eGen: Mitgliedschaft, Stimmrecht, Vorstand, Aufsichtsrat. § 38 GenG schreibt einen Aufsichtsrat ab 20 Mitgliedern vor — Shalem hat ihn von Anfang an.",
    link: { href: "/aufsicht", label: "Aufsichtsrat-Bericht" },
  },
  {
    kuerzel: "HKP",
    langform: "Häusliche Krankenpflege",
    kategorie: "leistung",
    klartext:
      "Behandlungspflege zu Hause auf Verordnung der Ärzt:in (z.B. Verband, Injektion). Krankenkassen-Leistung nach § 37 SGB V — nicht zu verwechseln mit Pflegekassen-Leistung.",
    link: { href: "/kasse/hkp", label: "HKP-Genehmigung" },
  },
  {
    kuerzel: "ICD-10",
    langform: "International Classification of Diseases (10. Revision)",
    kategorie: "digital",
    klartext:
      "WHO-Code-System für Diagnosen. Jede Verordnung/Krankschreibung enthält einen ICD-10-Code (z.B. M54.5 = Kreuzschmerzen). Shalem prüft Plausibilität bei Diktat-Eingabe.",
  },
  {
    kuerzel: "ICF",
    langform: "International Classification of Functioning",
    kategorie: "begutachtung",
    klartext:
      "WHO-Klassifikation für Funktionsfähigkeit, Behinderung und Gesundheit. Wird in BTHG-Bedarfsfeststellung und ICF-Befunden verwendet — beschreibt nicht die Krankheit, sondern die konkreten Auswirkungen im Alltag.",
  },
  {
    kuerzel: "IK-Nummer",
    langform: "Institutionskennzeichen",
    kategorie: "geld",
    klartext:
      "Eindeutige 9-stellige Kennung für Leistungserbringer im Sozialversicherungs-System (Pflegedienste, Krankenhäuser, Apotheken). Voraussetzung für die Abrechnung mit Kranken-/Pflegekassen.",
  },
  {
    kuerzel: "KGG",
    langform: "Krankengymnastik am Gerät",
    kategorie: "leistung",
    klartext:
      "Spezielle Heilmittel-Verordnung für Therapie an medizinischen Geräten. Höhere Vergütung als klassische Krankengymnastik, brauchts ärztliche Begründung.",
  },
  {
    kuerzel: "MD / MDK",
    langform: "Medizinischer Dienst (früher MDK)",
    kategorie: "begutachtung",
    klartext:
      "Begutachtungs-Stelle der Krankenkassen. Stellt Pflegegrad fest, prüft HKP-Verordnungen, AU-Begutachtung. Unabhängig, aber kassen-finanziert. Termin meist 60–90 Min. zu Hause.",
    link: { href: "/sozial/md-begutachtung", label: "MD-Begutachtung-Workflow" },
  },
  {
    kuerzel: "MDR",
    langform: "Medical Device Regulation",
    kategorie: "recht",
    klartext:
      "EU-Verordnung 2017/745 für Medizinprodukte. Software, die Diagnose oder Therapie unterstützt, kann unter MDR fallen. Shalem ist Dokumentations-System (Klasse I oder kein Medizinprodukt) — die KI-Brücken sind beratend, nicht entscheidend.",
  },
  {
    kuerzel: "NBA",
    langform: "Neues Begutachtungs-Assessment",
    kategorie: "begutachtung",
    klartext:
      "Seit 2017 das Verfahren zur Pflegegrad-Feststellung. Bewertet Selbständigkeit in 6 Modulen (Mobilität / Kognition / Verhalten / Selbstvers. / Therapie / Alltag) statt nur Pflegezeit.",
    link: { href: "/pflegegrad-check", label: "NBA-Selbstcheck" },
  },
  {
    kuerzel: "PDL",
    langform: "Pflegedienstleitung",
    kategorie: "rolle",
    klartext:
      "Leitende Pflegekraft mit Personalverantwortung. Plant Schichten, prüft Doku, vertritt Pflege gegenüber Träger und Kassen. In Shalem: Lead-Rolle mit eigenem KI-Dienstplan-HUD.",
    link: { href: "/admin/dienstplan/hud", label: "PDL-HUD" },
  },
  {
    kuerzel: "PG",
    langform: "Pflegegrad",
    kategorie: "begutachtung",
    klartext:
      "Bewertung des Pflegebedarfs in 5 Stufen (1 = gering, 5 = schwerst). Festgelegt vom MD nach NBA. Bestimmt, welche Geld- und Sachleistungen aus der Pflegeversicherung zustehen.",
    link: { href: "/leistungen", label: "Was steht zu" },
  },
  {
    kuerzel: "RLS",
    langform: "Row-Level Security",
    kategorie: "digital",
    klartext:
      "Datenbank-Sicherheit auf Zeilen-Ebene: jede:r Nutzer:in sieht nur die Daten, für die sie Berechtigung hat. Shalem nutzt PostgreSQL-RLS auf Supabase — Pflegedienste-Mitarbeiter sehen z.B. nur ihre eigenen Klient:innen.",
  },
  {
    kuerzel: "SAP-V",
    langform: "spezialisierte ambulante Palliativversorgung",
    kategorie: "leistung",
    klartext:
      "Komplexe Versorgung am Lebensende zu Hause. Multidisziplinäres Team aus Ärzt:in, Pflegekraft, Sozialarbeit, Seelsorge. Krankenkassen-Leistung nach § 37b SGB V.",
  },
  {
    kuerzel: "SGB",
    langform: "Sozialgesetzbuch",
    kategorie: "recht",
    klartext:
      "Sammlung aller deutschen Sozialgesetze. Pflege-relevant: SGB V (Krankenversicherung), SGB XI (Pflegeversicherung), SGB IX (Rehabilitation/Teilhabe), SGB VIII (Kinder-/Jugendhilfe).",
  },
  {
    kuerzel: "SIS",
    langform: "Strukturierte Informationssammlung",
    kategorie: "digital",
    klartext:
      "Ablöseformat für die klassische Pflege-Anamnese. 6 Themenfelder (Kognition / Mobilität / krankheits-/therapiebedingt / Selbstvers. / Alltag / Wohnen). Hat klassische Pflege-Doku-Massen reduziert.",
    link: { href: "/pflege/doku", label: "SIS-Diktat" },
  },
  {
    kuerzel: "TI",
    langform: "Telematikinfrastruktur",
    kategorie: "digital",
    klartext:
      "Geschützte Datenautobahn des deutschen Gesundheitswesens. Trägt eRezept, eAU, ePA, KIM-Mail, TI-Messenger. Anbindung über gematik-zertifizierte Konnektoren — Shalem-Anbindung in Phase 2.",
  },
  {
    kuerzel: "TI-Messenger",
    langform: "Telematik-Messenger",
    kategorie: "digital",
    klartext:
      "TI-konformer, interoperabler Chat zwischen Leistungserbringern. Pflicht für eRezept-/eAU-Workflows ab Dezember 2026. Famedly ist führender Anbieter — Shalem prüft die Anbindung.",
    link: { href: "/messenger", label: "Messenger" },
  },
  {
    kuerzel: "VAS",
    langform: "Visuelle Analog-Skala",
    kategorie: "begutachtung",
    klartext:
      "0–10-Schmerz-Skala ('wie stark sind die Schmerzen jetzt'). Wird in Therapie- und Pflegedoku regelmäßig festgehalten, um Verlauf zu zeigen.",
  },
  {
    kuerzel: "VKE",
    langform: "Vorsorgevollmacht / Generalvollmacht",
    kategorie: "rolle",
    klartext:
      "Schriftliche Vollmacht, jemand anderem im Notfall die Entscheidungen zu überlassen (Gesundheits-, Vermögens-, Aufenthaltsbestimmungs-Recht). Empfehlung: in einem Klient-Profil hinterlegen, nicht erst im Notfall.",
  },
  {
    kuerzel: "VVG",
    langform: "Versicherungsvertragsgesetz",
    kategorie: "recht",
    klartext:
      "Regelt private und betriebliche Versicherungsverträge. Wichtig für Kranken-, Pflege- und Berufsunfähigkeits-Versicherung — die Beratungs-/Dokumentationspflichten bei Vertragsabschluss kommen daher.",
  },
];
