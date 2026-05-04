// Inhaltlicher Auszug aus dem Pflege-Handbuch 1.0 „Vom Kammerdiener zur Pflegekraft“
// (Source Open). Strukturiert für die Kennenlernseite — ein roter Faden vom
// Selbstverständnis der Pflege, über Salutogenese und Mind-Body-Medizin
// bis hin zum SHALEM/MERKABA-Leitbild.

export type Kapitel = {
  id: string;
  nummer: number;
  titel: string;
  untertitel?: string;
  kernaussage: string;          // ein Satz, der das Kapitel trägt
  zitate: string[];             // 1–2 Originalzitate
  prinzipien: string[];         // konkrete Pflegeprinzipien aus dem Kapitel
  farbe: string;                // CSS Variable (mon, tue, wed …)
};

export const HANDBUCH_KAPITEL: Kapitel[] = [
  {
    id: "kap-1-spiegel",
    nummer: 1,
    titel: "Pflege als Spiegel der Gesellschaft",
    untertitel: "Soziales Nervensystem und kultureller Wendepunkt",
    kernaussage:
      "Pflege ist kein schwacher Sektor, sondern ein Frühwarnorgan: sie zeigt, ob eine Gesellschaft mitfühlt oder verwaltet.",
    zitate: [
      "Pflege ist der Ort, an dem sich das Menschliche am deutlichsten zeigt — und am tiefsten vergessen wurde.",
      "Wenn Solidarität, Empathie und Ruhe vorhanden sind, regeneriert sich Pflege selbst.",
    ],
    prinzipien: [
      "Pflege wird als Resonanzfeld verstanden, nicht als Befehlskette",
      "Leitung auf Augenhöhe, Fachlichkeit verbunden mit Bewusstsein",
      "Strukturen, die Menschen stärken statt brechen",
    ],
    farbe: "mon",
  },
  {
    id: "kap-2-salutogenese",
    nummer: 2,
    titel: "Salutogenese",
    untertitel: "Gesundheit als aktiver Prozess",
    kernaussage:
      "Nicht „Was macht krank?“, sondern „Was erhält Gesundheit trotz Belastung?“ — Pflege begleitet durch Krisen, ohne darin unterzugehen.",
    zitate: [
      "Verstehbarkeit · Handhabbarkeit · Sinnhaftigkeit — die drei Säulen des Kohärenzgefühls (Antonovsky).",
    ],
    prinzipien: [
      "Wöchentliche 15-min-Reflexion ohne Bewertung — nur Beobachtung",
      "Bewusste Mikropausen vor Patientenkontakt (Atmungskultur)",
      "Erinnerung an den Auftrag: Linderung, Verbindung, Menschlichkeit",
      "Salutogene Führung fragt: verständlich, handhabbar, sinnhaft?",
    ],
    farbe: "tue",
  },
  {
    id: "kap-3-dissonanz",
    nummer: 3,
    titel: "Kognitive Dissonanz",
    untertitel: "Wenn Wissen und Handeln kollidieren",
    kernaussage:
      "Dissonanz ist kein Fehler — sie ist der Beginn von Bewusstsein. Erst der präfrontale Cortex kann sie integrieren.",
    zitate: [
      "„Ich will zuhören — aber ich habe keine Zeit.“ Diese Diskrepanz erzeugt Cortisol, Muskelspannung, Herzfrequenzanstieg.",
      "Zynismus ist keine Charakterschwäche, sondern Schutzreaktion gegen Überforderung.",
    ],
    prinzipien: [
      "Widersprüche ohne Schuldzuweisung benennen",
      "Gemeinsame Reflexion in Leitung und Team",
      "Mikroveränderungen: kürzere Übergaben, klare Zuständigkeiten, echte Pausen",
    ],
    farbe: "wed",
  },
  {
    id: "kap-4-kommunikation",
    nummer: 4,
    titel: "Kommunikationsbiologie",
    untertitel: "Sprache als biochemischer Stimulus",
    kernaussage:
      "Tonfall ist kein Stil, sondern Medikament. Worte wirken auf Vagusnerv, Cortisol, Oxytocin — messbar.",
    zitate: [
      "Beruhigende Worte aktivieren den Vagusnerv, fördern Verdauung und Zellregeneration.",
      "„Ich sehe, du bist gerade unter Druck — ich bin es auch.“ verbindet, wo „Du schaffst das doch immer.“ trivialisiert.",
    ],
    prinzipien: [
      "Empathie heißt: Spannung benennen, sodass sie lösbar bleibt",
      "Offene Feedbackkultur → parasympathische Aktivierung → Lernfähigkeit",
      "Sprache als Teil der Pflegepathologie — oder der Heilung",
    ],
    farbe: "thu",
  },
  {
    id: "kap-5-stress",
    nummer: 5,
    titel: "Stress, Burnout, Bored-out & Helfersyndrom",
    kernaussage:
      "Burnout ist keine Schwäche, sondern Notbremse der Psyche. Heilung bedeutet: Verantwortung teilen, nicht tragen.",
    zitate: [
      "Wer wieder gestalten darf, regeneriert. Bored-out hat dieselbe Stresssignatur wie Überlastung.",
      "Menschlichkeit wächst in Teamstrukturen, nicht in Selbstaufopferung.",
    ],
    prinzipien: [
      "Atem-Reset 3× täglich — Bauchatmung, HRV steigt",
      "Bewegte Pausen 3 min — Lymphfluss aktivieren",
      "Teamhygiene: kurze Feedback-Gespräche entlasten das limbische System",
      "Ritual zum Dienstschluss: „Ich lasse diesen Tag los.“",
    ],
    farbe: "fri",
  },
  {
    id: "kap-6-mindbody",
    nummer: 6,
    titel: "Mind-Body-Medizin",
    untertitel: "Neurobiologie der Selbstheilung",
    kernaussage:
      "Das autonome Nervensystem reagiert nicht auf Realität, sondern auf Interpretation. Achtsamkeitstraining reduziert messbar das Amygdala-Volumen.",
    zitate: [
      "„Ich kann erst atmen, dann handeln.“ → Parasympathikusdominanz, Blutdruck stabilisiert sich in Sekunden.",
      "Vagusaktivierung durch Summen, Singen, Berührung — Entzündungshemmung, Herzfrequenzregulation.",
    ],
    prinzipien: [
      "Atemachtsamkeit vor Kontakt — 10 Sekunden bewusster Atem",
      "Berührung als Intervention: kurze Handauflage senkt Angst, stabilisiert Blutdruck (Field, 2010)",
      "Musik und Humor: Endorphine ↑, Schmerzempfinden ↓",
      "„Ich bin Teil der Regulation, nicht ihr Opfer.“",
    ],
    farbe: "sat",
  },
  {
    id: "kap-7-epigenetik",
    nummer: 7,
    titel: "Epigenetik",
    untertitel: "Wie Erfahrung Gene schaltet",
    kernaussage:
      "Arbeitsklima ist kein Stimmungsfaktor, sondern Genregulator. Sinnorientiertes Handeln aktiviert Zellreparaturgene (SIRT1, FOXO3).",
    zitate: [
      "Achtsamkeit, soziale Zugehörigkeit und Freude verlängern Telomere (Epel & Blackburn, 2009).",
      "Echter Teamzusammenhalt → mehr Oxytocinrezeptoren → höhere Belastungstoleranz.",
    ],
    prinzipien: [
      "Leitung und Team tragen biologische Verantwortung füreinander",
      "Reversible Prägung: alte Muster überschreibbar durch Achtsamkeit, Bewegung, Bindung, Schlaf",
      "Atmosphäre, Rhythmus und Mitgefühl als epigenetische Resilienz",
    ],
    farbe: "sun",
  },
  {
    id: "kap-8-glaubenssaetze",
    nummer: 8,
    titel: "Glaubenssätze und Krankheitsmuster",
    untertitel: "Der Körper als Spiegel des Denkens",
    kernaussage:
      "Glaubenssätze sind keine Wahrheiten, sondern neuronale Gewohnheiten — sie verändern sich durch bewusstes Reframing.",
    zitate: [
      "„Ich darf keine Pause machen.“ → „Pausen erhalten meine Fähigkeit zu helfen.“",
      "„Ich muss funktionieren.“ → „Ich darf fühlen, um zu funktionieren.“",
    ],
    prinzipien: [
      "Glaubenssätze identifizieren, nicht verurteilen",
      "Reframing aktiviert präfrontalen Cortex, hemmt Stresszentren",
      "Auch Strukturen können „therapiert“ werden — Führungskraft als Feldregulator",
    ],
    farbe: "mon",
  },
  {
    id: "kap-9-demenz",
    nummer: 9,
    titel: "Demenz",
    untertitel: "Beziehung und die Wiederherstellung der Würde",
    kernaussage:
      "Wenn Erinnerung geht, bleibt Resonanz. Eine stabile Bezugsperson senkt messbar Herzfrequenz, Blutdruck und Stresshormone bei Demenz (Hanson et al., 2015).",
    zitate: [
      "Nicht Medikamente, sondern menschliche Frequenz reguliert Angst, Unruhe und Desorientierung.",
      "Tagesstruktur als wiederkehrende Melodie, nicht als Taktung.",
    ],
    prinzipien: [
      "Weniger Korrektur — mehr Mitschwingen",
      "Weniger Fragen — mehr Spiegelung („Du bist traurig“ statt „Was fehlt dir?“)",
      "Weniger Widerstand — mehr Rhythmus",
      "Co-Regulation als Therapieform",
    ],
    farbe: "tue",
  },
  {
    id: "kap-10-fuehrung",
    nummer: 10,
    titel: "Macht, Leitung und Kulturwandel",
    untertitel: "Führung als Bewusstseinskompetenz",
    kernaussage:
      "Führung, die heilt, bedeutet: Energie steuern, nicht Menschen. Macht ist neutral — erst die Absicht entscheidet.",
    zitate: [
      "Klarheit vor Kontrolle. Reflexion vor Bewertung. Vertrauen vor Angst.",
      "Bewusstseinsbasierte Macht erweitert Wahrnehmung, erzeugt Klarheit und Zugehörigkeit.",
    ],
    prinzipien: [
      "Team als lebender Organismus verstehen",
      "Vernetzte Intelligenz statt Befehlskette: Information fließt horizontal",
      "Führungskraft als Raumhalter — Bedingungen für Selbstorganisation schaffen",
    ],
    farbe: "wed",
  },
  {
    id: "kap-11-cocreation",
    nummer: 11,
    titel: "Compliance & Co-Creation",
    untertitel: "Heilung als gemeinsame Verantwortung",
    kernaussage:
      "Heilung wird nicht gemacht, sie wird ermöglicht. Wer versteht, mitgestaltet und Verantwortung teilt, heilt schneller.",
    zitate: [
      "„Was möchten Sie heute erreichen?“ statt „Ich helfe Ihnen jetzt.“",
      "Pflegekräfte, die erklären statt anordnen, aktivieren Selbstwirksamkeit — das stärkste Heilungshormon der Psyche.",
    ],
    prinzipien: [
      "Partizipation: Bewohner und Angehörige in Entscheidungen einbeziehen",
      "Transparente Kommunikation statt Fachsprache",
      "Beide Seiten sind Lehrende und Lernende",
    ],
    farbe: "thu",
  },
  {
    id: "kap-12-kultur",
    nummer: 12,
    titel: "Die neue Pflegekultur",
    untertitel: "Menschlichkeit als Infrastruktur",
    kernaussage:
      "Würde vor Effizienz. Verbindung vor Kontrolle. Sinn vor Routine. — Werte, die biologisch effizient sind.",
    zitate: [
      "Pflege als Schule der Menschlichkeit — und Menschlichkeit als neue Technologie.",
    ],
    prinzipien: [
      "Pflegebildung: Körperbewusstsein, Achtsamkeit, Kommunikationspsychologie",
      "Reflexionsräume in Einrichtungen, in denen Mitarbeitende über Gefühle sprechen dürfen",
      "Politische Anerkennung als gesellschaftlicher Schlüsselberuf — nicht als Kostenstelle",
    ],
    farbe: "fri",
  },
  {
    id: "kap-13-shalem",
    nummer: 13,
    titel: "Vom „Arschabwischer“ zum Bewusstseinscoach",
    untertitel: "Die SHALEM- und MERKABA-Lehre",
    kernaussage:
      "Pflege ist nicht unten. Pflege ist unten im Fundament — und wird zur Schnittstelle zwischen Biologie, Psychologie und Spiritualität.",
    zitate: [
      "SHALEM (hebräisch: „ganz, vollständig“) — Balance der vier Elemente Feuer, Wasser, Luft, Erde als Heilprinzip.",
      "MERKABA in der Pflege ist keine Esoterik, sondern angewandte Neurobiologie — verkörpert durch Bewusstheit.",
    ],
    prinzipien: [
      "Kneipp-Konzept: Wasser, Bewegung, Ernährung, Kräuter, Lebensordnung als 5 Säulen der Salutogenese",
      "NADA-Akupunktur: 5 Ohrpunkte für Selbstregulation (Shen Men, Sympathikus, Niere, Leber, Lunge)",
      "Biographiearbeit als Spiegelprozess — emotionale Ausdrucksarbeit reduziert Amygdala-Aktivität",
      "Elementenbalance: Feuer (Tatkraft), Wasser (Gefühl), Luft (Denken), Erde (Struktur)",
      "Pflegekraft als Gesundheitsnavigator und Kulturträger",
    ],
    farbe: "sat",
  },
];

// Wandel-Tabelle aus dem Schluss des Handbuchs
export const WANDEL_TABELLE: Array<{ alt: string; neu: string }> = [
  { alt: "Funktionieren", neu: "Fühlen und Wirken" },
  { alt: "Kontrolle",     neu: "Präsenz" },
  { alt: "Routine",       neu: "Bewusstes Ritual" },
  { alt: "Hierarchie",    neu: "Resonanznetzwerk" },
  { alt: "Erschöpfung",   neu: "Energiekonzept" },
  { alt: "Scham",         neu: "Würde" },
  { alt: "Anpassung",     neu: "Authentizität" },
  { alt: "Helferrolle",   neu: "Bewusstseinsführung" },
];

// Kneipps fünf Säulen — als eigenständig anzeigbarer Mini-Block
export const KNEIPP_SAEULEN: Array<{ id: string; nummer: number; name: string; kurz: string }> = [
  { id: "k1", nummer: 1, name: "Wasser",        kurz: "Hydrotherapie — Vagusaktivierung, Kreislauf, Selbstwahrnehmung" },
  { id: "k2", nummer: 2, name: "Bewegung",      kurz: "Bewegung im Alltag — vegetative Balance, Lymphfluss" },
  { id: "k3", nummer: 3, name: "Ernährung",     kurz: "Vollwertig, regional, im Rhythmus der Jahreszeiten" },
  { id: "k4", nummer: 4, name: "Kräuter",       kurz: "Phytotherapie — sanfte Begleitung mit klassischen Heilpflanzen" },
  { id: "k5", nummer: 5, name: "Lebensordnung", kurz: "Innere Haltung — Disziplin, Dankbarkeit, Maß" },
];
