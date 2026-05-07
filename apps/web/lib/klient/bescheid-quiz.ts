// Bescheid-Verstehen-Quiz · Amtsdeutsch in Klartext.
//
// 12 echte Formulierungen aus GKV/Pflegekassen-Bescheiden mit 4 Klartext-
// Optionen. Klient/Familie soll erkennen, was tatsächlich gemeint ist.

export type BescheidFrage = {
  id: string;
  /** Original-Amtsdeutsch */
  amt: string;
  /** Quelle (Briefkopf-Anker) */
  quelle: string;
  optionen: { label: string; richtig: boolean }[];
  erklaerung: string;
};

export const BESCHEID_FRAGEN: BescheidFrage[] = [
  {
    id: "b-1",
    amt: "Aufgrund der vorgenannten Begutachtung wird Ihrem Antrag auf Pflegegrad nach § 14 SGB XI nicht entsprochen.",
    quelle: "Pflegekasse · Bescheid",
    optionen: [
      { label: "Ihr Antrag ist genehmigt.", richtig: false },
      { label: "Ihr Antrag wird abgelehnt — kein Pflegegrad anerkannt.", richtig: true },
      { label: "Sie müssen einen neuen Antrag stellen.", richtig: false },
      { label: "Der Pflegegrad ist auf 1 reduziert.", richtig: false },
    ],
    erklaerung: "Nicht entsprochen heißt: abgelehnt. Sie haben 1 Monat Frist für Widerspruch.",
  },
  {
    id: "b-2",
    amt: "Die Inanspruchnahme der Sachleistung ist mit der Inanspruchnahme des Pflegegeldes nach § 37 SGB XI in Bezug auf den Hilfebedarf nicht kombinierbar.",
    quelle: "Pflegekasse · Bescheid",
    optionen: [
      { label: "Sie können beides gleichzeitig in voller Höhe bekommen.", richtig: false },
      { label: "Sachleistung und Pflegegeld werden anteilig kombiniert (Kombinationsleistung).", richtig: true },
      { label: "Pflegegeld ist gestrichen.", richtig: false },
      { label: "Sie müssen sich für eines entscheiden.", richtig: false },
    ],
    erklaerung: "Es geht um die Kombinationsleistung — anteilige Mischung. Die Formulierung klingt nach Verbot, ist aber technisch.",
  },
  {
    id: "b-3",
    amt: "Wir behalten uns vor, die Notwendigkeit der bewilligten Leistung in regelmäßigen Abständen zu überprüfen.",
    quelle: "Pflegekasse · Bescheid",
    optionen: [
      { label: "Die Leistung wird in 3 Monaten gestrichen.", richtig: false },
      { label: "Die Kasse kann jederzeit eine erneute Begutachtung verlangen.", richtig: true },
      { label: "Sie müssen alle 6 Monate einen neuen Antrag stellen.", richtig: false },
      { label: "Es ist nichts weiter zu tun.", richtig: false },
    ],
    erklaerung: "Die Kasse kann den MD erneut zum Hausbesuch schicken. Das ist normal und kein Grund zur Sorge — solange der Bedarf gleich bleibt.",
  },
  {
    id: "b-4",
    amt: "Verhinderungspflege gemäß § 39 SGB XI kann für längstens sechs Wochen je Kalenderjahr in Anspruch genommen werden.",
    quelle: "Pflegekasse · Leistungs-Info",
    optionen: [
      { label: "Sie dürfen nur 6 Wochen am Stück Pflege bekommen.", richtig: false },
      { label: "Wenn die pflegende Angehörige im Urlaub ist, übernimmt die Kasse bis 6 Wochen pro Jahr eine Ersatz-Pflegekraft.", richtig: true },
      { label: "Pflegegeld wird 6 Wochen ausgesetzt.", richtig: false },
      { label: "Sie müssen 6 Wochen warten bevor Sie Pflege bekommen.", richtig: false },
    ],
    erklaerung: "Wenn die Hauptpflegeperson krank, im Urlaub oder verhindert ist, springt die Verhinderungspflege ein — bis 1.685 € pro Jahr.",
  },
  {
    id: "b-5",
    amt: "Gegen diesen Bescheid kann innerhalb eines Monats nach seiner Bekanntgabe Widerspruch eingelegt werden.",
    quelle: "Rechtsbehelfsbelehrung",
    optionen: [
      { label: "Der Bescheid ist endgültig — kein Widerspruch möglich.", richtig: false },
      { label: "Sie haben 1 Monat Zeit für einen Widerspruch — schriftlich an die Kasse.", richtig: true },
      { label: "Widerspruch geht nur über einen Anwalt.", richtig: false },
      { label: "Widerspruch verlängert die Wartezeit um 12 Monate.", richtig: false },
    ],
    erklaerung: "Widerspruch ist kostenfrei und formlos möglich. Bei Pflegegrad-Bescheiden lohnt es sich oft. Sozialverbände wie VdK helfen.",
  },
  {
    id: "b-6",
    amt: "Das Ende der Krankenhausbehandlung gilt als Eintritt in die Anschlussversorgung gem. § 39 SGB V.",
    quelle: "Krankenkasse · Reha-Bescheid",
    optionen: [
      { label: "Direkt nach dem Krankenhaus beginnt die Reha.", richtig: true },
      { label: "Sie müssen 4 Wochen zu Hause warten bevor Reha beginnt.", richtig: false },
      { label: "Reha gibt es nur einmal im Leben.", richtig: false },
      { label: "Krankenhaus-Behandlung wird nicht bezahlt.", richtig: false },
    ],
    erklaerung: "Anschluss-Heilbehandlung (AHB) folgt nahtlos auf den Krankenhaus-Aufenthalt — typischerweise nach Schlaganfall, OP, Krebs.",
  },
  {
    id: "b-7",
    amt: "Die Zuzahlung beträgt 10 v.H. der Aufwendungen, jedoch mindestens 5,00 EUR und höchstens 10,00 EUR pro Tag.",
    quelle: "Krankenkasse · Hilfsmittel",
    optionen: [
      { label: "Sie zahlen 10 % selbst, aber nicht weniger als 5 € und nicht mehr als 10 € am Tag.", richtig: true },
      { label: "Sie zahlen 10 € pro Tag, immer.", richtig: false },
      { label: "Sie zahlen nichts dazu.", richtig: false },
      { label: "Sie zahlen 100 € im Voraus.", richtig: false },
    ],
    erklaerung: "v.H. = vom Hundert = Prozent. Belastungsgrenze: 2 % vom Bruttoeinkommen pro Jahr für Alle (1 % bei chronisch Kranken).",
  },
  {
    id: "b-8",
    amt: "Die Hilfsmittelversorgung erfolgt durch zugelassene Leistungserbringer im Rahmen geschlossener Versorgungsverträge.",
    quelle: "Krankenkasse · Hilfsmittel",
    optionen: [
      { label: "Sie können Hilfsmittel im freien Handel kaufen und einreichen.", richtig: false },
      { label: "Sie bekommen Hilfsmittel nur über Vertrags-Sanitätshäuser der Kasse.", richtig: true },
      { label: "Hilfsmittel werden nicht erstattet.", richtig: false },
      { label: "Hilfsmittel sind kostenfrei nur im Krankenhaus.", richtig: false },
    ],
    erklaerung: "Frag deine Kasse welche Sanitätshäuser Vertragspartner sind — oder die Online-Liste der Kasse unter Hilfsmittel-Anbieter anschauen.",
  },
  {
    id: "b-9",
    amt: "Die Auszahlung des Pflegegeldes erfolgt monatlich im Nachhinein.",
    quelle: "Pflegekasse · Bescheid",
    optionen: [
      { label: "Geld kommt am 1. eines Monats für den laufenden Monat.", richtig: false },
      { label: "Geld kommt erst am Monatsende für diesen Monat.", richtig: true },
      { label: "Geld kommt einmal im Quartal.", richtig: false },
      { label: "Geld kommt nur einmal jährlich.", richtig: false },
    ],
    erklaerung: "Im Nachhinein heißt rückwirkend. Pflegegeld für April kommt Ende April / Anfang Mai. Bei Antragsbewilligung gibt es eine Nachzahlung.",
  },
  {
    id: "b-10",
    amt: "Die Beratung nach § 37 Abs. 3 SGB XI ist halbjährlich verpflichtend.",
    quelle: "Pflegekasse · Hinweis",
    optionen: [
      { label: "Sie müssen alle 6 Monate eine Pflegeberatung machen — sonst wird das Pflegegeld gekürzt.", richtig: true },
      { label: "Beratung ist freiwillig.", richtig: false },
      { label: "Beratung passiert automatisch.", richtig: false },
      { label: "Beratung kostet 50 € extra.", richtig: false },
    ],
    erklaerung: "Pflegegeld + häusliche Pflege = Beratungspflicht alle 6 Monate (PG 2/3) bzw. 3 Monate (PG 4/5). Pflegedienst oder Pflegestützpunkt macht's, kostenlos.",
  },
  {
    id: "b-11",
    amt: "Eine Wohnumfeld-verbessernde Maßnahme nach § 40 Abs. 4 SGB XI ist vor Beginn der Maßnahme bei der Pflegekasse zu beantragen.",
    quelle: "Pflegekasse · Wohnumfeld",
    optionen: [
      { label: "Sie können Umbauen wann Sie wollen, Rechnung später einreichen.", richtig: false },
      { label: "Erst Antrag stellen + Genehmigung, dann umbauen.", richtig: true },
      { label: "Umbau gibt es nicht von der Pflegekasse.", richtig: false },
      { label: "Umbau gibt es nur bei PG 5.", richtig: false },
    ],
    erklaerung: "Bis 4.180 € pro Maßnahme (z.B. Bad-Umbau, Treppenlift, Türverbreiterung) — ab PG 1, aber Antrag muss VORHER gestellt sein.",
  },
  {
    id: "b-12",
    amt: "Bei Vorliegen einer demenzbedingten Beeinträchtigung der Alltagskompetenz wird ein zusätzlicher Entlastungsbetrag von monatlich 131 EUR gewährt.",
    quelle: "Pflegekasse · Bescheid",
    optionen: [
      { label: "Nur Demenz-Diagnose bringt das Geld.", richtig: false },
      { label: "Alle Pflegegrad-Empfänger ab PG 1 bekommen 131 €/Monat zusätzlich für Entlastung (Haushaltshilfe, Betreuung).", richtig: true },
      { label: "Das Geld muss man jeden Monat neu beantragen.", richtig: false },
      { label: "Es geht um eine einmalige Zahlung.", richtig: false },
    ],
    erklaerung: "Entlastungsbetrag § 45b SGB XI: 131 €/Monat für jeden mit PG ≥ 1. Nicht-verbrauchte Beträge sammeln sich an, bleiben 6 Monate verfügbar.",
  },
];

// Shuffle helper
export function generiereQuiz(n = 6): BescheidFrage[] {
  const shuffled = [...BESCHEID_FRAGEN].sort(() => Math.random() - 0.5);
  // Antworten pro Frage shufflen
  return shuffled.slice(0, n).map((f) => ({
    ...f,
    optionen: [...f.optionen].sort(() => Math.random() - 0.5),
  }));
}
