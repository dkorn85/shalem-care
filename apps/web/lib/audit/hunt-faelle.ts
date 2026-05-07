// Audit-Hunt · simulierte Akten-Stichproben für die Lücken-Suche.
//
// Jede Karte enthält einen Doku-Auszug (echt formuliert, anonymisiert)
// und versteckt 0-3 Mängel nach DNQP/MDK-Prüfungs-Standards. Spieler
// markiert die Lücken durch Auswahl einer Mängel-Liste.

export type AuditMangel = {
  id: string;
  kurz: string;
  /** Detail-Erklärung warum das ein Mangel ist */
  detail: string;
  /** Schwere */
  schwere: "klein" | "mittel" | "kritisch";
};

export type AuditFall = {
  id: string;
  /** Klient-Akte (anonymisiert) */
  titel: string;
  /** Was für ein Doku-Typ (SIS, Wundverlauf, Verordnung, ...) */
  art: string;
  /** Der Doku-Text als Auszug */
  text: string;
  /** Mögliche Mängel-Optionen, die User auswählen kann */
  optionen: AuditMangel[];
  /** IDs der tatsächlich vorhandenen Mängel */
  wahrheit: string[];
  /** Quelle/Begründung */
  quelle: string;
};

const ALLE_MANGEL_OPTIONEN: AuditMangel[] = [
  { id: "kein-handzeichen", kurz: "Handzeichen fehlt", detail: "Pflichtfeld nach MDK-Prüfung · jede Eintrag braucht Pflegekraft-Kürzel.", schwere: "kritisch" },
  { id: "kein-datum", kurz: "Datum/Zeit fehlt", detail: "Datum + Uhrzeit pro Eintrag nach DNQP-Pflichtfeld.", schwere: "kritisch" },
  { id: "vital-luecke", kurz: "Vital-Werte unvollständig", detail: "Bei Hypertonie-Indikation muss RR pro Schicht dokumentiert sein.", schwere: "mittel" },
  { id: "schmerz-luecke", kurz: "NRS-Erhebung fehlt", detail: "Nach Schmerz-Standard DNQP min. 1× pro Schicht NRS-Wert (0-10).", schwere: "mittel" },
  { id: "wund-foto-luecke", kurz: "Foto-Doku fehlt", detail: "Wundverlauf nach DNQP/ICW: Foto bei jedem Verbandwechsel.", schwere: "mittel" },
  { id: "wund-mass-luecke", kurz: "Wundgröße nicht gemessen", detail: "L×B×T-Maß zwingend bei Wundverlauf — sonst kein Verlaufs-Vergleich.", schwere: "kritisch" },
  { id: "massnahme-ohne-evaluation", kurz: "Maßnahme ohne Evaluation", detail: "Pflegerische Maßnahmen müssen evaluiert werden — wirkt sie?", schwere: "mittel" },
  { id: "bezugsperson-luecke", kurz: "Bezugsperson nicht informiert", detail: "Bei Sturz/Vorfall Familie/Betreuer informieren · in Akte vermerken.", schwere: "kritisch" },
  { id: "diagnose-fehlt", kurz: "ICD-10 fehlt", detail: "Bei Verordnung/Pipeline ohne ICD ist Plausibilität nicht prüfbar.", schwere: "kritisch" },
  { id: "haeufigkeit-fehlt", kurz: "Häufigkeit nicht spezifiziert", detail: "HKP-Verordnung muss klare Häufigkeit haben (z.B. 3× wöchentlich).", schwere: "kritisch" },
  { id: "aerztl-anordnung-luecke", kurz: "Ärztl. Anordnung fehlt", detail: "Behandlungspflege nur nach ärztlicher Verordnung.", schwere: "kritisch" },
  { id: "konsens-luecke", kurz: "Klient:in-Einwilligung fehlt", detail: "Pflegerische Maßnahmen bei Geschäftsfähigen nur mit Einwilligung.", schwere: "klein" },
  { id: "freiheitsentziehung", kurz: "Freiheitsbeschränkung ohne Genehmigung", detail: "Bettgitter/Fixierung braucht richterliche Genehmigung nach § 1906 BGB.", schwere: "kritisch" },
];

export const AUDIT_FAELLE: AuditFall[] = [
  {
    id: "f1",
    titel: "Klientin H.R. · Mobilisations-Eintrag",
    art: "SIS · Tageseintrag",
    text:
      "08:30 Frau R. wurde zur Toilette mobilisiert. Danach Frühstück angereicht. " +
      "Sie aß mäßig. Tagesform schwankend.",
    optionen: pickOptions(["kein-handzeichen", "vital-luecke", "schmerz-luecke", "massnahme-ohne-evaluation", "bezugsperson-luecke"]),
    wahrheit: ["kein-handzeichen", "schmerz-luecke", "massnahme-ohne-evaluation"],
    quelle: "DNQP-Schmerz-Standard + Pflegedoku-MDK-Prüfung",
  },
  {
    id: "f2",
    titel: "Klient W.B. · Wundverlauf Sakrum",
    art: "Wundverlauf · Eintrag 03.05.",
    text:
      "Sakraldekubitus Kategorie 3. Verband heute gewechselt. Wunde sieht okay aus, " +
      "Klient klagt über leichten Schmerz. Verband mit Hydrokolloid + Schaumstoff. " +
      "Pflegekraft: AS",
    optionen: pickOptions(["kein-datum", "wund-foto-luecke", "wund-mass-luecke", "schmerz-luecke", "kein-handzeichen"]),
    wahrheit: ["kein-datum", "wund-foto-luecke", "wund-mass-luecke", "schmerz-luecke"],
    quelle: "DNQP Wundmanagement + ICW-Wunddoku-Konsensus",
  },
  {
    id: "f3",
    titel: "Klient P.N. · HKP-Verordnung",
    art: "Verordnung · Häusliche Krankenpflege",
    text:
      "Behandlungspflege Wundversorgung. Beginn ab 14.04. Dauer: nach Bedarf. " +
      "Begründung: Klient nicht selbständig fähig. " +
      "Aussteller: Dr. Lehmann, LANR 999999900, BSNR 999999901.",
    optionen: pickOptions(["haeufigkeit-fehlt", "diagnose-fehlt", "kein-datum", "aerztl-anordnung-luecke", "konsens-luecke"]),
    wahrheit: ["haeufigkeit-fehlt", "diagnose-fehlt"],
    quelle: "KBV-Plausibilisierungs-Richtlinien § 37 SGB V",
  },
  {
    id: "f4",
    titel: "Klientin G.H. · Sturzereignis Nachtwache",
    art: "Nacht-Eintrag · Vorfall",
    text:
      "02:15 Frau H. neben dem Bett gefunden, am Boden sitzend. " +
      "Keine sichtbaren Verletzungen. Wieder ins Bett geholfen. " +
      "Bettgitter hochgezogen. F.K. Nachtdienst.",
    optionen: pickOptions(["bezugsperson-luecke", "freiheitsentziehung", "vital-luecke", "schmerz-luecke", "massnahme-ohne-evaluation"]),
    wahrheit: ["bezugsperson-luecke", "freiheitsentziehung", "vital-luecke"],
    quelle: "DNQP Sturzprophylaxe + § 1906 BGB Freiheitsentziehende Maßnahmen",
  },
  {
    id: "f5",
    titel: "Klient O.T. · Medikamentengabe",
    art: "SIS · Medikation",
    text:
      "07:00 Insulin-Spritze 8 IE s.c. linker Oberarm gegeben. " +
      "BZ vor Gabe gemessen: 138 mg/dl. " +
      "Datum: 03.05.2026, Pflegekraft: DR (Dennis Reuter).",
    optionen: pickOptions(["kein-handzeichen", "kein-datum", "aerztl-anordnung-luecke", "vital-luecke", "massnahme-ohne-evaluation"]),
    wahrheit: [],
    quelle: "Saubere Doku · keine Mängel — Stichprobe für 100 % Punkte",
  },
  {
    id: "f6",
    titel: "Klientin H.R. · MNA-Erhebung",
    art: "Assessment · Mangelernährung",
    text:
      "Mini Nutritional Assessment durchgeführt. " +
      "BMI: 19. Letzte Gewichtsabnahme: ca. 2 kg in 3 Monaten. " +
      "Klientin isst kleine Portionen. " +
      "Score gesamt: 9 Punkte.",
    optionen: pickOptions(["kein-handzeichen", "kein-datum", "massnahme-ohne-evaluation", "bezugsperson-luecke", "konsens-luecke"]),
    wahrheit: ["kein-handzeichen", "kein-datum", "massnahme-ohne-evaluation"],
    quelle: "DNQP Ernährungsmanagement · MNA-Score 8-11 = Risiko, Maßnahme nötig",
  },
];

function pickOptions(ids: string[]): AuditMangel[] {
  return ids.map((id) => ALLE_MANGEL_OPTIONEN.find((m) => m.id === id)!).filter(Boolean);
}

export function generiereHunt(n = 5): AuditFall[] {
  const shuffled = [...AUDIT_FAELLE].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
