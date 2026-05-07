// Diktat-Booster · Trainings-Schnipsel mit Soll-Zuordnung.
//
// Jedes Schnippsel ist eine echte Pflege-Beobachtung (paraphrasiert), die
// klar in eines der 6 SIS-Felder gehört. Der Spieler muss in unter 5 sec
// das richtige Feld erkennen.

import type { SisFeld } from "@/lib/pflege/sis-store";

export type Schnipsel = {
  id: string;
  text: string;
  /** Korrektes SIS-Feld */
  feld: SisFeld;
  /** Warum das Feld passt — Lern-Hinweis */
  begruendung: string;
};

export const SCHNIPSEL: Schnipsel[] = [
  {
    id: "s-001",
    text: "Frau R. hat heute beim Aufstehen kurz das Gleichgewicht verloren, konnte sich aber am Bettgitter festhalten.",
    feld: "mobilität",
    begruendung: "Aufstehen + Gleichgewicht + Sturzprophylaxe → Modul Mobilität.",
  },
  {
    id: "s-002",
    text: "Heute Morgen hat Herr B. die Augentropfen problemlos selbst eingegeben.",
    feld: "krankheitsbewältigung",
    begruendung: "Eigenständige Medikamenten-Anwendung → Krankheitsbewältigung.",
  },
  {
    id: "s-003",
    text: "Die Tochter hat angerufen, möchte am Wochenende vorbeikommen — Frau R. freut sich sehr.",
    feld: "kontakte",
    begruendung: "Familien-Kontakt + emotionale Reaktion → Soziale Kontakte.",
  },
  {
    id: "s-004",
    text: "Beim Frühstück hat Frau R. kaum gegessen, sie sagte: heute ist mir nicht nach Essen.",
    feld: "selbstversorgung",
    begruendung: "Nahrungsaufnahme · Selbstversorgung-Modul.",
  },
  {
    id: "s-005",
    text: "Wir haben über die alte Wohnung in Essen-Steele gesprochen, da war sie ganz wach im Erzählen.",
    feld: "beziehungsgestaltung",
    begruendung: "Biografie-Arbeit + Gespräch → Beziehung & Kommunikation.",
  },
  {
    id: "s-006",
    text: "Im Zimmer ist es heute kühl, die Heizung scheint nicht richtig zu funktionieren.",
    feld: "wohnen",
    begruendung: "Wohnumfeld + Temperatur → Wohnen & Umgebung.",
  },
  {
    id: "s-007",
    text: "Beim Verbandwechsel war die Wunde trocken, kein Geruch, etwas Granulationsgewebe sichtbar.",
    feld: "krankheitsbewältigung",
    begruendung: "Wundversorgung · gehört zu Krankheitsbewältigung & Therapie.",
  },
  {
    id: "s-008",
    text: "Frau R. ist heute mit dem Rollator selbst zur Toilette gegangen, sehr stolz darauf.",
    feld: "mobilität",
    begruendung: "Eigenmobilität mit Hilfsmittel → Modul Mobilität.",
  },
  {
    id: "s-009",
    text: "Sie wollte heute nicht reden, hat sich abgewandt und in Richtung Fenster geschaut.",
    feld: "beziehungsgestaltung",
    begruendung: "Kontakt-Verweigerung · emotionale Lage → Beziehung & Kommunikation.",
  },
  {
    id: "s-010",
    text: "Den Kaffee hat sie eigenständig zubereitet — Wasserkocher, Filter, Pulver.",
    feld: "selbstversorgung",
    begruendung: "Hauswirtschaftliche Selbstversorgung-Tätigkeit.",
  },
  {
    id: "s-011",
    text: "Mitbewohnerin Frau S. war heute laut, das hat Frau R. genervt — sie zog sich auf ihr Zimmer zurück.",
    feld: "kontakte",
    begruendung: "Beziehung zu Mitbewohner:in · Rückzugsverhalten → Soziale Kontakte.",
  },
  {
    id: "s-012",
    text: "Im Bad ist eine Stolperfalle — der Vorleger rutscht. Ich habe ihn provisorisch fixiert.",
    feld: "wohnen",
    begruendung: "Wohnumfeld-Sicherheit → Wohnen & Umgebung.",
  },
  {
    id: "s-013",
    text: "Die Marcumar-Dosis konnte sie heute nicht erinnern, Familie hat das Stellen übernommen.",
    feld: "krankheitsbewältigung",
    begruendung: "Medikamenten-Compliance · Therapie-Modul.",
  },
  {
    id: "s-014",
    text: "Wir haben eine kleine Runde im Garten gedreht — etwa 100 Meter, sie war danach erschöpft.",
    feld: "mobilität",
    begruendung: "Strecke + Anstrengung → Mobilitäts-Belastbarkeit.",
  },
  {
    id: "s-015",
    text: "Sohn hat eine Postkarte geschickt, sie hat sie sich mehrfach durchgelesen.",
    feld: "kontakte",
    begruendung: "Familiärer Kontakt → Soziale Kontakte.",
  },
];
