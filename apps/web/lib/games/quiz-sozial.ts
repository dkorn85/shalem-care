// Hilfeplan-Match · Lebenslage → richtiger Sozial-Paragraph

import type { SpielKonfig } from "@/components/KategorieMatch";

export const SOZIAL_QUIZ: SpielKonfig = {
  spielname: "Paragraphen-Hunt",
  zurueckHref: "/sozial",
  zurueckLabel: "← Übersicht",
  frageText: "Welcher Paragraph greift hier?",
  akzent: "var(--tue)",
  runden: 9,
  timerSek: 0,
  kategorien: [
    { id: "sgb-ix-eingl", label: "§ 99 SGB IX · Eingliederungshilfe", emoji: "🤝", farbe: "var(--tue)" },
    { id: "sgb-xii-grund", label: "§ 41 SGB XII · Grundsicherung im Alter", emoji: "💶", farbe: "var(--vibe-approval)" },
    { id: "sgb-viii-8a", label: "§ 8a SGB VIII · Kindeswohl-Schutz", emoji: "🛡", farbe: "var(--mon)" },
    { id: "wbvg", label: "WBVG · Wohn- & Betreuungsvertrag", emoji: "🏠", farbe: "var(--fri)" },
    { id: "btg-1814", label: "§ 1814 BGB · Rechtliche Betreuung", emoji: "⚖", farbe: "var(--vibe-profile)" },
    { id: "sgb-xi-bera", label: "§ 7a SGB XI · Pflegeberatung", emoji: "💬", farbe: "var(--accent)" },
  ],
  alleSchnipsel: [
    {
      id: "s1",
      text: "32-jährige Klientin mit kognitiver Beeinträchtigung möchte erstmals in eigene Wohnung ziehen. Bedarf: Assistenz bei Haushalt und Freizeit.",
      kategorieId: "sgb-ix-eingl",
      begruendung: "Eingliederungshilfe für Menschen mit Behinderung — § 99 SGB IX seit BTHG-Reform.",
    },
    {
      id: "s2",
      text: "78-jähriger ohne Vermögen, nur Mini-Rente 380 €, Pflegegrad 2, kann Lebenshaltung nicht decken.",
      kategorieId: "sgb-xii-grund",
      begruendung: "Grundsicherung im Alter und bei Erwerbsminderung — § 41 SGB XII.",
    },
    {
      id: "s3",
      text: "Lehrerin meldet vernachlässigtes 7-jähriges Kind, blaue Flecken, Hunger, fehlende Hygiene.",
      kategorieId: "sgb-viii-8a",
      begruendung: "Schutzauftrag bei Kindeswohlgefährdung — § 8a SGB VIII verpflichtend.",
    },
    {
      id: "s4",
      text: "Familie kündigt Heimplatz wegen Mängeln · Frist 6 Wochen · Bewohner will umziehen.",
      kategorieId: "wbvg",
      begruendung: "Wohn- und Betreuungsvertragsgesetz regelt Pflichten + Kündigung von Heimverträgen.",
    },
    {
      id: "s5",
      text: "Klient nach Schlaganfall kann Verträge nicht mehr verstehen, keine Verfügung vorhanden.",
      kategorieId: "btg-1814",
      begruendung: "Rechtliche Betreuung beim Betreuungsgericht beantragen — § 1814 BGB (vormals § 1896).",
    },
    {
      id: "s6",
      text: "Tochter pflegt zu Hause Mutter mit PG 4, fühlt sich überfordert, unklar welche Leistungen abrufbar.",
      kategorieId: "sgb-xi-bera",
      begruendung: "Anspruch auf Pflegeberatung — § 7a SGB XI · Pflegestützpunkte.",
    },
    {
      id: "s7",
      text: "Wohngruppe für junge Erwachsene mit Lernbehinderung · Beschäftigung in WfbM · Bedarf für Tagesstruktur.",
      kategorieId: "sgb-ix-eingl",
      begruendung: "WfbM + Wohngruppe = Eingliederungshilfe-Komplex-Leistung § 99 ff SGB IX.",
    },
    {
      id: "s8",
      text: "Geschwister-Pflegekinder, 9 und 11, Mutter alkoholabhängig, Polizei einbezogen.",
      kategorieId: "sgb-viii-8a",
      begruendung: "Inobhutnahme nach § 42 SGB VIII, Kindeswohl-Verfahren § 8a.",
    },
    {
      id: "s9",
      text: "Heim erhöht Eigenanteil von 1.800 auf 2.300 € · Bewohnerin will Erhöhung anfechten.",
      kategorieId: "wbvg",
      begruendung: "Erhöhung muss WBVG-konform begründet + 4-wöchige Frist eingehalten werden.",
    },
    {
      id: "s10",
      text: "Patient mit fortgeschrittener Demenz · Tochter hat keine Vollmacht · soll OP-Einwilligung geben.",
      kategorieId: "btg-1814",
      begruendung: "Ohne Vollmacht/Verfügung: rechtliche Betreuung nötig · Aufgabenkreis Gesundheitssorge.",
    },
    {
      id: "s11",
      text: "Klient will von Vollstationär auf Kombi-Modell wechseln · Familie pflegt mit · weiß nicht wie.",
      kategorieId: "sgb-xi-bera",
      begruendung: "Pflegeberatung erstellt Versorgungsplan — § 7a SGB XI.",
    },
    {
      id: "s12",
      text: "Hartz-IV-Bezieher, 67 Jahre, geht in Rente, Rente liegt unter Grundsicherungs-Bedarf.",
      kategorieId: "sgb-xii-grund",
      begruendung: "Übergang Bürgergeld → Grundsicherung im Alter — § 41 SGB XII.",
    },
  ],
  erfolg: {
    perfekt: "Sozialrecht-Profi · jeder Paragraph sitzt.",
    gut: "Stark — Hilfeplan kommt schnell von der Hand.",
    solide: "Solide.",
    schwach: "SGB-Übersicht nochmal lesen.",
  },
};
