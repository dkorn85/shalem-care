// HMV-Code-Match · Indikation → Heilmittel-Verordnungs-Code

import type { SpielKonfig } from "@/components/KategorieMatch";

export const THERAPIE_QUIZ: SpielKonfig = {
  spielname: "HMV-Code-Match",
  zurueckHref: "/therapie",
  zurueckLabel: "← Praxis",
  frageText: "Welcher Heilmittel-Code passt zur Indikation?",
  akzent: "var(--fri)",
  runden: 8,
  timerSek: 0,
  kategorien: [
    { id: "ws1", label: "WS1 · Wirbelsäule Standard", emoji: "🦴", farbe: "var(--fri)" },
    { id: "ex1", label: "EX1 · Extremitäten", emoji: "🦵", farbe: "var(--vibe-team)" },
    { id: "zn1", label: "ZN1 · ZNS-Erkrankungen", emoji: "🧠", farbe: "var(--vibe-profile)" },
    { id: "sp1", label: "SP1 · Logopädie Standard", emoji: "🗣", farbe: "var(--accent)" },
    { id: "ps1", label: "PS1 · Ergo psych-funkt.", emoji: "🧘", farbe: "var(--thu)" },
    { id: "lymph", label: "Lymphologisch", emoji: "💧", farbe: "var(--sun)" },
  ],
  alleSchnipsel: [
    {
      id: "t1",
      text: "Patient nach Bandscheiben-Vorfall L5/S1 · Schmerzausstrahlung ins Bein · Beweglichkeit deutlich eingeschränkt.",
      kategorieId: "ws1",
      begruendung: "Lumbo-Ischialgie + Mobilisations-Bedarf → WS1, ICD M54.4.",
    },
    {
      id: "t2",
      text: "Klientin nach Hüft-TEP rechts · Ziel: Wiederherstellen der Gangsicherheit + Kraft.",
      kategorieId: "ex1",
      begruendung: "Postoperative Reha Hüfte → EX1 mit Schwerpunkt Gangschule.",
    },
    {
      id: "t3",
      text: "Patient nach ischämischem Schlaganfall · Hemiparese rechts · benötigt Bobath-Therapie.",
      kategorieId: "zn1",
      begruendung: "Apoplex mit motorischem Defizit → ZN1, ICD I63.x · Bobath/PNF.",
    },
    {
      id: "t4",
      text: "5-jähriger Junge spricht stockend, Lautbildung S/SCH unsauber, frustriert beim Sprechen.",
      kategorieId: "sp1",
      begruendung: "Phonologische Störung + Sigmatismus → SP1, ICD F80.0.",
    },
    {
      id: "t5",
      text: "Patientin mit mittelgradiger Depression · Tagesstruktur fehlt · Hand-Arbeit als Ressource.",
      kategorieId: "ps1",
      begruendung: "Psychisch-funktionelle Behandlung → PS1, ICD F32.1.",
    },
    {
      id: "t6",
      text: "Sekundäres Lymphödem im rechten Arm nach Mamma-Ablatio mit Lymphknoten-Entfernung.",
      kategorieId: "lymph",
      begruendung: "Manuelle Lymphdrainage 30/45/60 min, Bandagierung, Kompression.",
    },
    {
      id: "t7",
      text: "Ältere Klientin mit M. Parkinson · Tremor + Bradykinese + Gang-Initiation gestört.",
      kategorieId: "zn1",
      begruendung: "Parkinson-Syndrom → ZN1 mit LSVT BIG-Konzept · ICD G20.",
    },
    {
      id: "t8",
      text: "Spastik-Reduktion + Sitz-Stabilität-Verbesserung bei Kind mit infantiler Cerebralparese.",
      kategorieId: "zn1",
      begruendung: "ICP → ZN1 (G80.x), Bobath-Konzept.",
    },
    {
      id: "t9",
      text: "Schulter-Impingement rechts · Beruf: Maler · Arbeitsplatz-bezogene Belastung.",
      kategorieId: "ex1",
      begruendung: "Schulter-Pathologie → EX1, ICD M75.4.",
    },
    {
      id: "t10",
      text: "Globale Aphasie nach Schlaganfall · Patient versteht und produziert kaum Sprache.",
      kategorieId: "sp1",
      begruendung: "Logopädie nach Apoplex → SP1, ICD R47.0 · Schub-Lautschub-Methode.",
    },
    {
      id: "t11",
      text: "Senioren-Wohngruppe · Demenz mittelschwer · Ziel: Tagesstrukturierung + Aktivierung.",
      kategorieId: "ps1",
      begruendung: "Ergotherapie Tagesstrukturierung → PS1, ICD F03 (Demenz n.n.b.).",
    },
    {
      id: "t12",
      text: "Spannungs-Kopfschmerz, HWS-Syndrom, Beschwerden seit 6 Monaten chronisch.",
      kategorieId: "ws1",
      begruendung: "Cervikalsyndrom → WS1, ICD M54.2 · Mobilisation + Triggerpunkt.",
    },
  ],
  erfolg: {
    perfekt: "HMV im Schlaf · Therapie-Routine sitzt!",
    gut: "Stark.",
    solide: "Wiederholung schadet nicht.",
    schwach: "Heilmittel-Richtlinie nochmal lesen.",
  },
};
