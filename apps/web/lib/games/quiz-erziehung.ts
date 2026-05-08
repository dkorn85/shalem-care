// Lerngeschichten-Mini · Beobachtung → Bildungsbereich nach BBP

import type { SpielKonfig } from "@/components/KategorieMatch";

export const ERZIEHUNG_QUIZ: SpielKonfig = {
  spielname: "Bildungs-Bingo",
  zurueckHref: "/erziehung",
  zurueckLabel: "← Übersicht",
  frageText: "Welcher Bildungsbereich wird hier sichtbar?",
  akzent: "var(--wed)",
  runden: 8,
  timerSek: 0,
  kategorien: [
    { id: "sprache", label: "Sprache + Kommunikation", emoji: "🗣", farbe: "var(--vibe-team)" },
    { id: "natur", label: "Natur + Naturwissenschaft", emoji: "🌱", farbe: "var(--thu)" },
    { id: "math", label: "Mathematik + Logik", emoji: "🔢", farbe: "var(--accent)" },
    { id: "musik", label: "Musik + Kunst + Bewegung", emoji: "🎶", farbe: "var(--vibe-stats)" },
    { id: "werte", label: "Werte + Soziale Bezüge", emoji: "🤝", farbe: "var(--vibe-approval)" },
    { id: "koerper", label: "Körper + Gesundheit", emoji: "💪", farbe: "var(--mon)" },
  ],
  alleSchnipsel: [
    {
      id: "e1",
      text: "Lina hat heute den Regenwurm im Sandkasten 20 Minuten beobachtet, ihn vorsichtig gehalten und der Gruppe erklärt was er macht.",
      kategorieId: "natur",
      begruendung: "Naturbeobachtung + erklären → Bildungsbereich Naturwissenschaft.",
    },
    {
      id: "e2",
      text: "Tarek erzählte heute zum ersten Mal vor allen vom Wochenende auf Türkisch UND Deutsch.",
      kategorieId: "sprache",
      begruendung: "Mehrsprachigkeit + Erzähl-Kompetenz → Sprache + Kommunikation.",
    },
    {
      id: "e3",
      text: "Mia hat alle Kastanien sortiert · 3 Haufen: groß, mittel, klein · zählte jeden Haufen.",
      kategorieId: "math",
      begruendung: "Klassifikation + Mengenerfassung → Mathematik.",
    },
    {
      id: "e4",
      text: "Henri hat heute einen Tanz zur Lieblings-Musik erfunden, seine Bewegungen mit den Beats synchronisiert.",
      kategorieId: "musik",
      begruendung: "Musikalisch-rhythmisches Empfinden → Musik + Bewegung.",
    },
    {
      id: "e5",
      text: "Theo trösete heute Ben, der gestürzt war · holte Pflaster · brachte sein Stofftier.",
      kategorieId: "werte",
      begruendung: "Empathie + soziales Handeln → Werte + Soziales Bezugssystem.",
    },
    {
      id: "e6",
      text: "Jara hat heute zum ersten Mal alleine das Klettergerüst hochgeklettert · stand oben · strahlte.",
      kategorieId: "koerper",
      begruendung: "Grobmotorik + Mut + Körpererfahrung → Körper + Bewegung + Gesundheit.",
    },
    {
      id: "e7",
      text: "Emil hat aus Klorollen + Tape ein Fernrohr gebaut, das durch das Loch sieht.",
      kategorieId: "natur",
      begruendung: "Konstruieren + technisches Forschen → Naturwissenschaft + Technik.",
    },
    {
      id: "e8",
      text: "Lara hat heute beim Geburtstagskreis ein Gedicht aus 4 Reimzeilen aufgesagt.",
      kategorieId: "sprache",
      begruendung: "Reim + Sprachspiel + Vortrag → Sprache + Kommunikation.",
    },
    {
      id: "e9",
      text: "Max hat heute das ganze Mittagessen mit Gabel + Messer gegessen · vorher nur Löffel.",
      kategorieId: "koerper",
      begruendung: "Feinmotorik + Selbstständigkeit beim Essen → Körper + Gesundheit.",
    },
    {
      id: "e10",
      text: "Sophie ordnete die Bauklötze nach Form · die Würfel zur Würfel-Burg · die Quader zur Mauer.",
      kategorieId: "math",
      begruendung: "Räumliche Beziehungen + Form-Erkennen → Mathematik + Geometrie.",
    },
    {
      id: "e11",
      text: "Anton hat mit Wasserfarben die Brücke gemalt, die er mit Papa gestern besucht hatte.",
      kategorieId: "musik",
      begruendung: "Bildnerisches Gestalten · Erinnerung in Form bringen → Kunst.",
    },
    {
      id: "e12",
      text: "Hannah half heute beim Tisch decken, fragte Klara welchen Becher sie möchte.",
      kategorieId: "werte",
      begruendung: "Mitbestimmung + Helfen + Anerkennen anderer → Werte + Soziales.",
    },
  ],
  erfolg: {
    perfekt: "Bildungs-Profi · jede Beobachtung perfekt zugeordnet.",
    gut: "Sehr gut.",
    solide: "Solide.",
    schwach: "BBP-Tafel als Schummelkarte?",
  },
};
