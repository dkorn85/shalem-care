// Begleit-Bingo · Klient-Anliegen → richtige Reaktion fürs Ehrenamt

import type { SpielKonfig } from "@/components/KategorieMatch";

export const EHRENAMT_QUIZ: SpielKonfig = {
  spielname: "Begleit-Bingo",
  zurueckHref: "/ehrenamt",
  zurueckLabel: "← Heute",
  frageText: "Was ist hier die ehrenamts-passende Reaktion?",
  akzent: "var(--thu)",
  runden: 8,
  timerSek: 0,
  kategorien: [
    { id: "zuhoeren", label: "Zuhören + Da-Sein", emoji: "👂", farbe: "var(--vibe-team)" },
    { id: "biographie", label: "Biographie-Arbeit", emoji: "📖", farbe: "var(--vibe-profile)" },
    { id: "praktisch", label: "Praktische Hilfe", emoji: "🤲", farbe: "var(--accent)" },
    { id: "an-pflege", label: "Sofort an Pflege melden", emoji: "🚨", farbe: "var(--mon)" },
    { id: "spirit", label: "Spirituell + Trost", emoji: "🕊", farbe: "var(--thu)" },
    { id: "freude", label: "Freude + Aktivierung", emoji: "🌻", farbe: "var(--sun)" },
  ],
  alleSchnipsel: [
    {
      id: "eh1",
      text: "Frau M. erzählt zum dritten Mal von ihrer Hochzeit 1956 · ihre Augen leuchten · sie wirkt lebendig.",
      kategorieId: "biographie",
      begruendung: "Erinnerungs-Pflege wirkt — wiederholtes Erzählen aktiviert Identität.",
    },
    {
      id: "eh2",
      text: "Herr K. weint plötzlich · keine Aussage warum · greift nach deiner Hand.",
      kategorieId: "zuhoeren",
      begruendung: "Anwesend sein, halten, nicht ausfragen. Tränen brauchen oft nur Begleitung.",
    },
    {
      id: "eh3",
      text: "Frau R. kann ihren Brief an die Tochter nicht lesen · die Brille fehlt im Zimmer.",
      kategorieId: "praktisch",
      begruendung: "Konkrete kleine Hilfe — Brille suchen oder Brief vorlesen.",
    },
    {
      id: "eh4",
      text: "Herr B. greift sich an die Brust · wird blass · hat Atemnot · sagt: Es zieht im Arm.",
      kategorieId: "an-pflege",
      begruendung: "Akute Symptome → Pflege oder Notruf · NICHT alleine bewerten.",
    },
    {
      id: "eh5",
      text: "Frau L., 92, sagt leise: Ich glaube ich werde bald zu meinem Mann gehen können.",
      kategorieId: "spirit",
      begruendung: "Sterbe-Vorbereitung respektieren · zuhören · Schweigen aushalten · Pflege informieren.",
    },
    {
      id: "eh6",
      text: "Frau S. sitzt allein, schaut aus dem Fenster, der Frühling blüht draußen.",
      kategorieId: "freude",
      begruendung: "Spaziergang anbieten · Blumenstrauß pflücken · Sinnes-Aktivierung.",
    },
    {
      id: "eh7",
      text: "Herr W. zeigt dir Fotos von seinem Schiff · er war Maschinist auf einem Frachter · 30 Minuten erzählen.",
      kategorieId: "biographie",
      begruendung: "Lebensgeschichte als Schatz behandeln · zuhören · Fragen stellen.",
    },
    {
      id: "eh8",
      text: "Frau O. hat Bauchschmerzen seit der Nacht · Pflege weiß noch nichts · sagt es dir gerade.",
      kategorieId: "an-pflege",
      begruendung: "Beobachtungen mit medizinischer Relevanz weitergeben · Übergabe-Pflicht.",
    },
    {
      id: "eh9",
      text: "Herr P. möchte heute zum Friedhof zu seiner Frau · niemand hat Zeit · Auto wäre da.",
      kategorieId: "praktisch",
      begruendung: "Begleitung organisieren · Kollege fragen · Trauer-Bedürfnis ernst nehmen.",
    },
    {
      id: "eh10",
      text: "Frau J. fragt: Glaubst du es gibt etwas danach? Sie hat seit Tagen nicht gesprochen.",
      kategorieId: "spirit",
      begruendung: "Echte Frage erkennen · ehrlich antworten · keine Plattitüden · ggf. Seelsorge.",
    },
    {
      id: "eh11",
      text: "Herr T. sagt: Ich kann nicht mehr · meine Frau, sie wollte ich besuchen · sie ist tot.",
      kategorieId: "zuhoeren",
      begruendung: "Trauer braucht Raum, keine Lösungen. Da sein, nichts erklären.",
    },
    {
      id: "eh12",
      text: "Singkreis am Mittwoch · Frau D. erkennt das Lied vom Bodensee · summt mit · weint dann fröhlich.",
      kategorieId: "freude",
      begruendung: "Musik wirkt selbst bei Demenz · positive Aktivierung · weiter machen!",
    },
  ],
  erfolg: {
    perfekt: "Ehrenamts-Pro · jede Begegnung getroffen.",
    gut: "Stark.",
    solide: "Solide — Bauchgefühl funktioniert.",
    schwach: "Im Zweifel: Pflege fragen.",
  },
};
