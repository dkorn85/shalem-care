// In-memory Therapie-Verlauf je Patient: VAS · ROM · Kraft pro Sitzung.
// Phase-1-Pattern. Wird später durch Supabase-Driver ersetzt.

export type TherapieMessung = {
  datumISO: string;       // 2026-04-..
  vas: number;            // 0–10 Schmerz
  romGrad: number;        // 0–180 °
  kraftMrc: number;       // 0–5 MRC-Skala
  notiz?: string;
};

export type TherapiePatient = {
  id: string;
  name: string;
  geburt: string;
  diagnoseIcd: string;
  diagnoseKlartext: string;
  hmvCode: string;
  vo: string;
  fortschritt: string;          // "5/10" o.ä.
  stand: "Erstgespräch" | "Verbesserung" | "Plateau" | "stabil";
  icfCodes: { code: string; label: string }[];
  smartZiele: string[];
  termine: TherapieMessung[];
  region: string;
  farbe: string;
};

const PATIENTEN: TherapiePatient[] = [
  {
    id: "p-1",
    name: "Erika Gärtner",
    geburt: "1948-03-12",
    diagnoseIcd: "M54.5",
    diagnoseKlartext: "Lumbago · chronischer Kreuzschmerz",
    hmvCode: "WS1a",
    vo: "KG-Mobilisation 12×",
    fortschritt: "3/12",
    stand: "stabil",
    region: "LWS",
    farbe: "var(--fri)",
    icfCodes: [
      { code: "b28013", label: "Schmerz im Rücken" },
      { code: "b7100",  label: "Beweglichkeit eines einzelnen Gelenkes" },
      { code: "d4154",  label: "Stehen aufrechterhalten" },
    ],
    smartZiele: [
      "VAS ≤ 3 in vier Wochen",
      "Bückbar bis Knie-Unterkante schmerzfrei",
      "Heimprogramm 5×/Woche · Selbstprotokoll",
    ],
    termine: [
      { datumISO: "2026-04-24", vas: 7, romGrad: 35, kraftMrc: 3, notiz: "Mobilisation Becken behutsam" },
      { datumISO: "2026-04-29", vas: 7, romGrad: 38, kraftMrc: 3, notiz: "Atemführung dazu" },
      { datumISO: "2026-05-06", vas: 6, romGrad: 45, kraftMrc: 4 },
    ],
  },
  {
    id: "p-2",
    name: "Walter Brand",
    geburt: "1952-08-22",
    diagnoseIcd: "M75.10",
    diagnoseKlartext: "Schulter-Impingement re.",
    hmvCode: "EX2a",
    vo: "Manuelle Therapie 12×",
    fortschritt: "8/12",
    stand: "Verbesserung",
    region: "Schulter rechts",
    farbe: "var(--vibe-team)",
    icfCodes: [
      { code: "b7101", label: "Beweglichkeit mehrerer Gelenke" },
      { code: "b7300", label: "Kraft isolierter Muskeln" },
      { code: "d4452", label: "Mit der Hand greifen" },
    ],
    smartZiele: [
      "Abduktion 150° (akt: 110°) bis Sitzungs-Ende",
      "Schmerzarm nachts schlafen können",
      "Gartenarbeit über Kopf wieder möglich",
    ],
    termine: [
      { datumISO: "2026-03-13", vas: 6, romGrad: 70,  kraftMrc: 3 },
      { datumISO: "2026-03-20", vas: 5, romGrad: 85,  kraftMrc: 3 },
      { datumISO: "2026-03-27", vas: 5, romGrad: 95,  kraftMrc: 3 },
      { datumISO: "2026-04-03", vas: 4, romGrad: 100, kraftMrc: 4 },
      { datumISO: "2026-04-10", vas: 3, romGrad: 110, kraftMrc: 4 },
      { datumISO: "2026-04-17", vas: 3, romGrad: 115, kraftMrc: 4, notiz: "Cuff-Stabi reagiert gut" },
      { datumISO: "2026-04-24", vas: 2, romGrad: 120, kraftMrc: 4 },
      { datumISO: "2026-05-02", vas: 2, romGrad: 125, kraftMrc: 4 },
    ],
  },
  {
    id: "p-3",
    name: "Helga Reinhardt",
    geburt: "1944-11-04",
    diagnoseIcd: "I89.0",
    diagnoseKlartext: "Sekundäres Lymphödem · Bein li.",
    hmvCode: "Lymph45",
    vo: "MLD + Kompression 10× 45 min",
    fortschritt: "5/10",
    stand: "Verbesserung",
    region: "Bein links",
    farbe: "var(--sat)",
    icfCodes: [
      { code: "b4352", label: "Funktionen der Lymphgefäße" },
      { code: "s7501", label: "Strukturen des Unterschenkels" },
      { code: "d4500", label: "Kurze Strecken gehen" },
    ],
    smartZiele: [
      "Umfang Wade −2 cm bis Sitzung 8",
      "Selbstbandage in 4 Wochen sicher",
      "Strumpf-Toleranz ganztags wiedergewinnen",
    ],
    termine: [
      { datumISO: "2026-04-07", vas: 4, romGrad: 90,  kraftMrc: 4 },
      { datumISO: "2026-04-14", vas: 3, romGrad: 95,  kraftMrc: 4 },
      { datumISO: "2026-04-21", vas: 3, romGrad: 100, kraftMrc: 4 },
      { datumISO: "2026-04-28", vas: 2, romGrad: 105, kraftMrc: 4 },
      { datumISO: "2026-05-05", vas: 2, romGrad: 110, kraftMrc: 5, notiz: "Umfang Wade −1.6 cm zur Erstmessung" },
    ],
  },
  {
    id: "p-4",
    name: "Rüdiger Kempf",
    geburt: "1941-02-18",
    diagnoseIcd: "I63.9",
    diagnoseKlartext: "Z.n. Schlaganfall · Hemiparese li.",
    hmvCode: "ZN1a",
    vo: "Bobath 30× 30 min",
    fortschritt: "12/30",
    stand: "Verbesserung",
    region: "Hemi links",
    farbe: "var(--mon)",
    icfCodes: [
      { code: "b730", label: "Funktionen der Muskelkraft" },
      { code: "b760", label: "Kontrolle von Willkürbewegungen" },
      { code: "d4500", label: "Kurze Strecken gehen" },
      { code: "d540", label: "Sich kleiden" },
    ],
    smartZiele: [
      "10 m mit Stock selbständig in 6 Wochen",
      "Hemd allein anziehen schmerzfrei",
      "Treppe 12 Stufen mit Geländer",
    ],
    termine: [
      { datumISO: "2026-03-01", vas: 5, romGrad: 60, kraftMrc: 2 },
      { datumISO: "2026-03-08", vas: 5, romGrad: 65, kraftMrc: 2 },
      { datumISO: "2026-03-15", vas: 4, romGrad: 70, kraftMrc: 3 },
      { datumISO: "2026-03-22", vas: 4, romGrad: 75, kraftMrc: 3 },
      { datumISO: "2026-03-29", vas: 4, romGrad: 80, kraftMrc: 3 },
      { datumISO: "2026-04-05", vas: 3, romGrad: 85, kraftMrc: 3 },
      { datumISO: "2026-04-12", vas: 3, romGrad: 90, kraftMrc: 3 },
      { datumISO: "2026-04-19", vas: 3, romGrad: 95, kraftMrc: 4, notiz: "Erstmals Stand 30 Sek frei" },
      { datumISO: "2026-04-26", vas: 3, romGrad: 100, kraftMrc: 4 },
      { datumISO: "2026-05-03", vas: 2, romGrad: 110, kraftMrc: 4 },
    ],
  },
  {
    id: "p-5",
    name: "Michael Cordes",
    geburt: "1979-06-30",
    diagnoseIcd: "Z73.6",
    diagnoseKlartext: "Burnout · Aktivitäts-Coaching",
    hmvCode: "PS1",
    vo: "ADL-Training 6×",
    fortschritt: "4/6",
    stand: "Plateau",
    region: "Alltag",
    farbe: "var(--tue)",
    icfCodes: [
      { code: "b1300", label: "Energieniveau" },
      { code: "d230",  label: "Tägliche Routine durchführen" },
      { code: "d570",  label: "Auf seine Gesundheit achten" },
    ],
    smartZiele: [
      "5 Wochen-Kernroutinen ohne Energieabfall halten",
      "Schlafhygiene 21:30/06:30 stabilisieren",
      "Drei Bewegungs-Anker pro Tag",
    ],
    termine: [
      { datumISO: "2026-04-10", vas: 3, romGrad: 0, kraftMrc: 4, notiz: "Wert ROM nicht relevant · Aktivierungs-Score" },
      { datumISO: "2026-04-17", vas: 3, romGrad: 0, kraftMrc: 4 },
      { datumISO: "2026-04-24", vas: 4, romGrad: 0, kraftMrc: 4 },
      { datumISO: "2026-05-01", vas: 3, romGrad: 0, kraftMrc: 4 },
    ],
  },
  {
    id: "p-6",
    name: "Inge Müller",
    geburt: "1966-12-08",
    diagnoseIcd: "M51.16",
    diagnoseKlartext: "Bandscheibenvorfall L5/S1",
    hmvCode: "KGG24",
    vo: "KGG-Gerätegestützt 24×",
    fortschritt: "9/24",
    stand: "Verbesserung",
    region: "LWS",
    farbe: "var(--thu)",
    icfCodes: [
      { code: "b28013", label: "Schmerz im Rücken" },
      { code: "b7300",  label: "Kraft isolierter Muskeln" },
      { code: "d4154",  label: "Stehen aufrechterhalten" },
    ],
    smartZiele: [
      "VAS bei Sitzung 16 unter 3",
      "Rumpfkraft +20 % zur Eingangsmessung",
      "Fahrradergometer 30 min schmerzfrei",
    ],
    termine: [
      { datumISO: "2026-03-04", vas: 8, romGrad: 30, kraftMrc: 2 },
      { datumISO: "2026-03-11", vas: 7, romGrad: 35, kraftMrc: 3 },
      { datumISO: "2026-03-18", vas: 6, romGrad: 40, kraftMrc: 3 },
      { datumISO: "2026-03-25", vas: 6, romGrad: 45, kraftMrc: 3 },
      { datumISO: "2026-04-01", vas: 5, romGrad: 50, kraftMrc: 3 },
      { datumISO: "2026-04-08", vas: 5, romGrad: 55, kraftMrc: 4 },
      { datumISO: "2026-04-15", vas: 4, romGrad: 55, kraftMrc: 4 },
      { datumISO: "2026-04-22", vas: 4, romGrad: 60, kraftMrc: 4, notiz: "Krafttraining gut toleriert" },
      { datumISO: "2026-04-29", vas: 3, romGrad: 65, kraftMrc: 4 },
    ],
  },
  {
    id: "p-7",
    name: "Friedrich Lange",
    geburt: "1955-01-19",
    diagnoseIcd: "M54.4",
    diagnoseKlartext: "Lumbo-Ischialgie",
    hmvCode: "WS1a",
    vo: "KG-Heimprogramm",
    fortschritt: "0/—",
    stand: "Erstgespräch",
    region: "LWS / Bein",
    farbe: "var(--vibe-stats)",
    icfCodes: [
      { code: "b28013", label: "Schmerz im Rücken" },
      { code: "d450",  label: "Gehen" },
    ],
    smartZiele: [
      "Heimprogramm aufbauen · 4 Übungen × 10 min",
      "Schmerz-Tagebuch 14 Tage",
    ],
    termine: [],
  },
  {
    id: "p-8",
    name: "Karina Otto",
    geburt: "1972-09-15",
    diagnoseIcd: "I83.0",
    diagnoseKlartext: "Varikose mit Lymphödem",
    hmvCode: "Lymph45",
    vo: "Lymphdrainage 6× 45 min",
    fortschritt: "0/6",
    stand: "Erstgespräch",
    region: "Bein bds.",
    farbe: "var(--vibe-profile)",
    icfCodes: [
      { code: "b4352", label: "Funktionen der Lymphgefäße" },
      { code: "d4500", label: "Kurze Strecken gehen" },
    ],
    smartZiele: [
      "Umfangs-Reduktion 1.5 cm bei Sitzung 6",
      "Strumpf-Compliance ≥ 80 %",
    ],
    termine: [],
  },
];

export function listTherapiePatienten(): TherapiePatient[] {
  return PATIENTEN;
}

export function getTherapiePatient(id: string): TherapiePatient | null {
  return PATIENTEN.find((p) => p.id === id) ?? null;
}

export function tendenzVas(termine: TherapieMessung[]): "fallend" | "steigend" | "stabil" | "—" {
  if (termine.length < 2) return "—";
  const ersten = termine[0].vas;
  const letzten = termine[termine.length - 1].vas;
  if (letzten < ersten - 0.5) return "fallend";
  if (letzten > ersten + 0.5) return "steigend";
  return "stabil";
}
