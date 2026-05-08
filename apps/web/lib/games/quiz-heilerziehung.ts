// ICF-Teilhabe-Match · Aktivität → Lebensbereich

import type { SpielKonfig } from "@/components/KategorieMatch";

export const HEILERZIEHUNG_QUIZ: SpielKonfig = {
  spielname: "ICF-Lebenswelten",
  zurueckHref: "/heilerziehung",
  zurueckLabel: "← Übersicht",
  frageText: "Welcher ICF-Lebensbereich wird hier gefördert?",
  akzent: "var(--sat)",
  runden: 8,
  timerSek: 0,
  kategorien: [
    { id: "lernen", label: "d1 · Lernen + Wissen", emoji: "🧠", farbe: "var(--vibe-profile)" },
    { id: "kommunikation", label: "d3 · Kommunikation", emoji: "💬", farbe: "var(--vibe-team)" },
    { id: "mobilitaet", label: "d4 · Mobilität", emoji: "🚶", farbe: "var(--fri)" },
    { id: "selbstvers", label: "d5 · Selbstversorgung", emoji: "🧼", farbe: "var(--mon)" },
    { id: "haushalt", label: "d6 · Häusliches Leben", emoji: "🏠", farbe: "var(--sun)" },
    { id: "interaktion", label: "d7 · Interaktion", emoji: "🤝", farbe: "var(--thu)" },
    { id: "gemeinschaft", label: "d9 · Gemeinschaftsleben", emoji: "🎭", farbe: "var(--sat)" },
  ],
  alleSchnipsel: [
    {
      id: "h1",
      text: "Heute hat M. den Bus zur WfbM mit Begleitperson selbstständig benutzt — vorher fuhr immer Mutter.",
      kategorieId: "mobilitaet",
      begruendung: "Verkehrsmittel benutzen → ICF d470 (Transportmittel benutzen).",
    },
    {
      id: "h2",
      text: "K. übte heute Brot schmieren mit beiden Händen, Honig und Quark zum Selbstauswählen.",
      kategorieId: "selbstvers",
      begruendung: "Essen + Trinken zubereiten → ICF d550 (Essen).",
    },
    {
      id: "h3",
      text: "Im Morgenkreis fragte L. erstmals selbst nach Spielplatz-Ausflug — sonst wartet er bis er gefragt wird.",
      kategorieId: "kommunikation",
      begruendung: "Ein Gespräch beginnen → ICF d350 (Gespräch).",
    },
    {
      id: "h4",
      text: "S. hat 30 Minuten konzentriert mit Mengen-Karten gearbeitet · vorher 10 Minuten max.",
      kategorieId: "lernen",
      begruendung: "Konzentration + neue Lerninhalte → ICF d160-d175.",
    },
    {
      id: "h5",
      text: "T. hat den Tisch für 4 Personen eingedeckt · Abdeckung + Besteck-Reihenfolge richtig.",
      kategorieId: "haushalt",
      begruendung: "Mahlzeiten zubereiten / Hausarbeiten → ICF d630-d640.",
    },
    {
      id: "h6",
      text: "Im Treff der WfbM sprach H. erstmals einen Kollegen an, lachte mit ihm 10 Minuten über ein Video.",
      kategorieId: "interaktion",
      begruendung: "Kontakt aufnehmen + halten → ICF d710-d720.",
    },
    {
      id: "h7",
      text: "Gruppe besuchte Stadtfest, Y. tanzte zum ersten Mal seit Jahren mit anderen, war hinterher stolz.",
      kategorieId: "gemeinschaft",
      begruendung: "Erholung + Freizeit + Beteiligung am Gemeinschaftsleben → ICF d910-d920.",
    },
    {
      id: "h8",
      text: "G. hat heute beide Schnürsenkel ohne Anleitung gebunden · letzte Woche brauchte er Unterstützung.",
      kategorieId: "selbstvers",
      begruendung: "Sich kleiden + Hilfsmittel verwenden → ICF d540.",
    },
    {
      id: "h9",
      text: "F. hat seine Wäsche in die richtigen Sortier-Boxen gelegt + den Knopf für 30°C-Wäsche gefunden.",
      kategorieId: "haushalt",
      begruendung: "Kleidung waschen + Hausarbeiten verrichten → ICF d640.",
    },
    {
      id: "h10",
      text: "B. konnte heute mit Bildkarten dem Therapeuten zeigen wo es weh tut — vorher war Schmerz unklar.",
      kategorieId: "kommunikation",
      begruendung: "Nicht-sprachliche Mitteilungen produzieren → ICF d335.",
    },
    {
      id: "h11",
      text: "P. hat ein einfaches Memory selbständig gewonnen, danach Spielregeln einer Mitbewohnerin erklärt.",
      kategorieId: "lernen",
      begruendung: "Neues anwenden + Wissen weitergeben → ICF d175 + d350.",
    },
    {
      id: "h12",
      text: "R. nahm an der Wahl im Werkstattrat teil, drückte sein Anliegen in einer Sitzung aus.",
      kategorieId: "gemeinschaft",
      begruendung: "Politische Teilhabe + Bürgerleben → ICF d950.",
    },
  ],
  erfolg: {
    perfekt: "Teilhabe-Konzept-Profi · ICF im Schlaf!",
    gut: "Stark — du erkennst Lebenswelten klar.",
    solide: "Mehr Praxis hilft.",
    schwach: "ICF-Komponenten-Tafel an die Wand?",
  },
};
