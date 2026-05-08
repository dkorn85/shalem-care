// Speiseplan-Puzzle · Klient-Situation → richtige Kostform

import type { SpielKonfig } from "@/components/KategorieMatch";

export const HAUSWIRTSCHAFT_QUIZ: SpielKonfig = {
  spielname: "Kostform-Puzzle",
  zurueckHref: "/hauswirtschaft",
  zurueckLabel: "← Übersicht",
  frageText: "Welche Kostform ist hier richtig?",
  akzent: "var(--sun)",
  runden: 8,
  timerSek: 0,
  kategorien: [
    { id: "diabet", label: "Diabetes-Kost", emoji: "🍯", farbe: "var(--sun)" },
    { id: "schluck", label: "Pürierte/dysphagie", emoji: "🥣", farbe: "var(--vibe-stats)" },
    { id: "natriumarm", label: "Natriumarm", emoji: "🧂", farbe: "var(--mon)" },
    { id: "vollkost", label: "Standard-Vollkost", emoji: "🍽", farbe: "var(--vibe-team)" },
    { id: "hochkalor", label: "Hochkalorisch", emoji: "🥑", farbe: "var(--vibe-approval)" },
    { id: "vegetarisch", label: "Vegetarisch/Religion", emoji: "🌱", farbe: "var(--thu)" },
  ],
  alleSchnipsel: [
    {
      id: "hw1",
      text: "Herr B. hat HbA1c 7.8 %, Insulin-pflichtig, Frühstück muss BE-genau gerichtet werden.",
      kategorieId: "diabet",
      begruendung: "BE-Berechnung + Kohlenhydrat-Steuerung · stark zucker-reduziert.",
    },
    {
      id: "hw2",
      text: "Frau M. hat sich beim Mittag verschluckt, hustet, Logopädin empfiehlt Pürierte mit Andickung.",
      kategorieId: "schluck",
      begruendung: "Dysphagie-Kost · IDDSI-Stufe 4-6 (püriert bis weich).",
    },
    {
      id: "hw3",
      text: "Frau S. mit Herzinsuffizienz NYHA III · Blutdruck 165/95 · Diuretika-Therapie.",
      kategorieId: "natriumarm",
      begruendung: "Salz < 5 g/Tag · Brühpulver weglassen · Käse + Wurst reduzieren.",
    },
    {
      id: "hw4",
      text: "Herr K., 72, Pflegegrad 2, gesund bis auf leichte Hypertonie · normale Bedürfnisse.",
      kategorieId: "vollkost",
      begruendung: "Vollkost nach DGE-Empfehlungen · ausgewogen, kein spezielles Schema.",
    },
    {
      id: "hw5",
      text: "Frau L., 84, MNA-Score 9, BMI 18, Gewichtsabnahme 3 kg in 4 Wochen, Kaffee statt Frühstück.",
      kategorieId: "hochkalor",
      begruendung: "Mangelernährungsrisiko · 1,5-2 kcal/ml Trinknahrung + energiedichte Aufstriche.",
    },
    {
      id: "hw6",
      text: "Frau Y. ist Hindu, isst kein Rind, kein Schwein, vegetarisch nach religiöser Gewohnheit.",
      kategorieId: "vegetarisch",
      begruendung: "Religiöse Kostform respektieren · Nährstoff-Gleichgewicht (B12, Eisen).",
    },
    {
      id: "hw7",
      text: "Diabetiker mit beginnender Niereninsuffizienz · GFR 45 · Phosphat 1.4 mmol/l.",
      kategorieId: "natriumarm",
      begruendung: "Niereninsuff. + Hypertonie → Salz reduzieren + Eiweiß moderat.",
    },
    {
      id: "hw8",
      text: "Patient nach Schlaganfall · halbseitige Mund-Lähmung · isst nur breiig.",
      kategorieId: "schluck",
      begruendung: "Dysphagie-Kost mit Andickungsmittel · Aspirations-Schutz.",
    },
    {
      id: "hw9",
      text: "Frau R. mit Demenz · isst kaum noch · Gewicht fällt seit 6 Wochen · Trinkmenge gering.",
      kategorieId: "hochkalor",
      begruendung: "Bei Mangelernährungsrisiko + reduzierter Aufnahme → energiedicht + Finger-Food.",
    },
    {
      id: "hw10",
      text: "Junger Mann mit Insulinpumpe · sportlich · isst gerne Pasta · Mahlzeiten flexibel.",
      kategorieId: "diabet",
      begruendung: "Diabetes-Kost · Bolus an Mahlzeit anpassen · BE-Tabelle hilft.",
    },
    {
      id: "hw11",
      text: "Klientin lebt seit 30 Jahren vegetarisch aus ethischer Überzeugung · keine medizinische Indikation.",
      kategorieId: "vegetarisch",
      begruendung: "Wert-Wunsch respektieren · ovo-lacto-vegetarisch · B12 + Eisen ergänzen wenn nötig.",
    },
    {
      id: "hw12",
      text: "Herr T. nach Hüft-OP · Reha-Phase · Appetit gut · keine Vorerkrankungen.",
      kategorieId: "vollkost",
      begruendung: "Vollkost mit eiweißreichem Mittagessen · Eiweiß für Wundheilung 1,2 g/kg KG.",
    },
  ],
  erfolg: {
    perfekt: "Speiseplan-Profi · DGE-Standards perfekt im Kopf!",
    gut: "Stark.",
    solide: "Solide. Bei Schluck-Kost noch nachschauen.",
    schwach: "Diätbuch nochmal lesen?",
  },
};
