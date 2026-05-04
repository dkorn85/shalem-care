// Vollständiger Katalog der abrechenbaren Leistungsmodule.
//
// Strukturiert nach Beruf × Kostenträger. Vergütungssätze: Stand 2024,
// Mittelwerte (NRW für SGB XI, Bundesempfehlung sonst). Keine
// Verbindlichkeit — pro Einrichtung muss vor Liveschaltung der
// regionale Tarif hinterlegt werden.

import type { BerufsTyp } from "../doku/types";
import type { LeistungsModul, Kostentraeger } from "./types";

export const MODULE: LeistungsModul[] = [
  // ════════════════════════════════════════════════════════
  // PFLEGE — SGB XI Leistungskomplexe (ambulant, NRW 2024)
  // ════════════════════════════════════════════════════════
  {
    code: "LK01", name: "Kleine Morgen- oder Abendtoilette",
    beschreibung: "Teilwaschung am Waschbecken, Mund-/Zahnpflege, An- und Auskleiden teilweise",
    beruf: ["pflege"], kostentraeger: "sgb_xi_pflege", einheit: "leistung",
    vergutungCents: 750, rechtsgrundlage: "§ 36 SGB XI · LK-Tabelle NRW",
    doku: { themenfeldHinweis: "selbstversorgung" },
    maxProTag: 2,
  },
  {
    code: "LK02", name: "Große Morgen- oder Abendtoilette",
    beschreibung: "Ganzkörperwaschung, Mund-/Zahnpflege, Haare, vollständiges An-/Auskleiden, Lagerung",
    beruf: ["pflege"], kostentraeger: "sgb_xi_pflege", einheit: "leistung",
    vergutungCents: 1590, rechtsgrundlage: "§ 36 SGB XI · LK-Tabelle NRW",
    doku: { themenfeldHinweis: "selbstversorgung" },
    maxProTag: 2,
  },
  {
    code: "LK03", name: "Hilfe bei der Nahrungsaufnahme",
    beschreibung: "Mundgerechte Zubereitung, Anreichung, Beobachtung Schluckakt",
    beruf: ["pflege"], kostentraeger: "sgb_xi_pflege", einheit: "leistung",
    vergutungCents: 880, rechtsgrundlage: "§ 36 SGB XI",
    doku: { themenfeldHinweis: "selbstversorgung", risikoHinweis: ["aspiration", "mangelernaehrung"] },
    maxProTag: 4,
  },
  {
    code: "LK04", name: "Lagern / Betten",
    beschreibung: "Druckentlastende Lagerung, Bettgestaltung, Mikro-Lagerung",
    beruf: ["pflege"], kostentraeger: "sgb_xi_pflege", einheit: "leistung",
    vergutungCents: 520, rechtsgrundlage: "§ 36 SGB XI",
    doku: { risikoHinweis: ["dekubitus", "kontraktur"] },
    maxProTag: 12,
  },
  {
    code: "LK05", name: "Hilfe bei Ausscheidung",
    beschreibung: "Toilettengang, Inkontinenzversorgung, Intimpflege",
    beruf: ["pflege"], kostentraeger: "sgb_xi_pflege", einheit: "leistung",
    vergutungCents: 590, rechtsgrundlage: "§ 36 SGB XI",
    doku: { risikoHinweis: ["inkontinenz"] },
    maxProTag: 8,
  },
  {
    code: "LK06", name: "Mobilisation / Bewegungsübungen",
    beschreibung: "Aktive/passive Mobilisation, Transfer, Gehtraining gem. Pflegeplan",
    beruf: ["pflege"], kostentraeger: "sgb_xi_pflege", einheit: "leistung",
    vergutungCents: 980, rechtsgrundlage: "§ 36 SGB XI",
    doku: { themenfeldHinweis: "mobilitaet_bewegung", risikoHinweis: ["sturz", "kontraktur"] },
    maxProTag: 3,
  },
  {
    code: "LK07", name: "Begleitung außerhalb der Wohnung",
    beschreibung: "Begleitung zu Arzt / Behörde / Einkauf — über LK 11 hinaus",
    beruf: ["pflege"], kostentraeger: "sgb_xi_pflege", einheit: "stunde",
    vergutungCents: 2980, rechtsgrundlage: "§ 36 SGB XI",
  },
  {
    code: "LK14", name: "Hauswirtschaftliche Versorgung",
    beschreibung: "Reinigung, Wäsche, Einkauf, Mahlzeitenzubereitung",
    beruf: ["pflege", "hauswirtschaft"], kostentraeger: "sgb_xi_pflege", einheit: "stunde",
    vergutungCents: 3150, rechtsgrundlage: "§ 36 SGB XI · LK 14 NRW",
  },
  {
    code: "LK15", name: "Erstbesuch · Pflegeplanung",
    beschreibung: "Anamnese, SIS-Erstellung, Maßnahmenplan",
    beruf: ["pflege"], kostentraeger: "sgb_xi_pflege", einheit: "leistung",
    vergutungCents: 6480, rechtsgrundlage: "§ 36 SGB XI",
  },
  {
    code: "LK19", name: "Beratungseinsatz § 37 Abs. 3 SGB XI",
    beschreibung: "Halbjährlicher Beratungseinsatz bei Pflegegeld-Empfängern",
    beruf: ["pflege", "beratung"], kostentraeger: "sgb_xi_pflege", einheit: "leistung",
    vergutungCents: 2300, rechtsgrundlage: "§ 37 Abs. 3 SGB XI",
  },
  {
    code: "EB-45a", name: "Entlastungsbetrag-Modul",
    beschreibung: "Anerkannte Betreuungs- und Entlastungsleistung (z.B. Begleitung Spaziergang)",
    beruf: ["pflege", "hauswirtschaft", "ehrenamt"], kostentraeger: "sgb_xi_pflege", einheit: "stunde",
    vergutungCents: 2500, rechtsgrundlage: "§ 45a SGB XI",
  },

  // ════════════════════════════════════════════════════════
  // PFLEGE — SGB V Häusliche Krankenpflege (Bundesempfehlung)
  // ════════════════════════════════════════════════════════
  {
    code: "HKP-24", name: "Injektion s.c. / i.m.",
    beschreibung: "Subkutane oder intramuskuläre Injektion (z.B. Insulin, Heparin)",
    beruf: ["pflege"], kostentraeger: "sgb_v_hkp", einheit: "leistung",
    vergutungCents: 430, rechtsgrundlage: "VV-HKP Nr. 24",
    doku: { themenfeldHinweis: "krankheitsbezogen" },
  },
  {
    code: "HKP-26", name: "Blutdruckmessung",
    beschreibung: "RR-Messung mit Dokumentation, ärztl. verordnet",
    beruf: ["pflege"], kostentraeger: "sgb_v_hkp", einheit: "leistung",
    vergutungCents: 290, rechtsgrundlage: "VV-HKP Nr. 26",
    doku: { themenfeldHinweis: "krankheitsbezogen" },
  },
  {
    code: "HKP-27", name: "Blutzuckermessung",
    beschreibung: "BZ-Bestimmung kapillär mit Doku, ärztl. verordnet",
    beruf: ["pflege"], kostentraeger: "sgb_v_hkp", einheit: "leistung",
    vergutungCents: 320, rechtsgrundlage: "VV-HKP Nr. 27",
    doku: { themenfeldHinweis: "krankheitsbezogen" },
  },
  {
    code: "HKP-31", name: "Medikamentengabe",
    beschreibung: "Richten und Verabreichen ärztl. verordneter Medikamente, Dokumentation",
    beruf: ["pflege"], kostentraeger: "sgb_v_hkp", einheit: "leistung",
    vergutungCents: 410, rechtsgrundlage: "VV-HKP Nr. 31",
    doku: { themenfeldHinweis: "krankheitsbezogen" },
    maxProTag: 4,
  },
  {
    code: "HKP-32", name: "Wundversorgung klein",
    beschreibung: "Verbandwechsel kleinflächig (< 4 cm²)",
    beruf: ["pflege"], kostentraeger: "sgb_v_hkp", einheit: "leistung",
    vergutungCents: 780, rechtsgrundlage: "VV-HKP Nr. 32",
    doku: { themenfeldHinweis: "krankheitsbezogen", risikoHinweis: ["dekubitus"] },
  },
  {
    code: "HKP-33", name: "Wundversorgung groß / chronisch",
    beschreibung: "Verbandwechsel großflächig oder chronische Wunde mit Foto-Doku",
    beruf: ["pflege"], kostentraeger: "sgb_v_hkp", einheit: "leistung",
    vergutungCents: 1430, rechtsgrundlage: "VV-HKP Nr. 33",
    doku: { themenfeldHinweis: "krankheitsbezogen", risikoHinweis: ["dekubitus"] },
  },
  {
    code: "HKP-35", name: "Kompressionsverband",
    beschreibung: "Anlegen Kompressionsverband Bein (CVI, postthrombotisch)",
    beruf: ["pflege"], kostentraeger: "sgb_v_hkp", einheit: "leistung",
    vergutungCents: 940, rechtsgrundlage: "VV-HKP Nr. 35",
  },
  {
    code: "HKP-12", name: "Anziehen Kompressionsstrümpfe",
    beschreibung: "An- und Ausziehen ärztl. verordneter Kompressionsstrümpfe",
    beruf: ["pflege"], kostentraeger: "sgb_v_hkp", einheit: "leistung",
    vergutungCents: 320, rechtsgrundlage: "VV-HKP Nr. 12",
    maxProTag: 2,
  },
  {
    code: "HKP-08", name: "Dekubitusbehandlung",
    beschreibung: "Behandlung Dekubitus Grad I-IV nach ärztl. Anordnung",
    beruf: ["pflege"], kostentraeger: "sgb_v_hkp", einheit: "leistung",
    vergutungCents: 1080, rechtsgrundlage: "VV-HKP Nr. 8",
    doku: { risikoHinweis: ["dekubitus"] },
  },

  // ════════════════════════════════════════════════════════
  // PFLEGEGRAD-PAUSCHALEN (SGB XI § 43, stationär bzw. § 36 ambulant)
  // ════════════════════════════════════════════════════════
  {
    code: "PG-PAUSCH", name: "Pflegegrad-Sachleistung (Pauschale)",
    beschreibung: "Monatliche Pauschale stationär § 43 / ambulant § 36 SGB XI",
    beruf: ["pflege"], kostentraeger: "sgb_xi_pflege", einheit: "monat",
    vergutungCents: 0, // dynamisch je Pflegegrad
    rechtsgrundlage: "§§ 36, 43 SGB XI",
  },

  // ════════════════════════════════════════════════════════
  // THERAPIE — SGB V Heilmittel (HMR 2024)
  // ════════════════════════════════════════════════════════
  {
    code: "KG", name: "Krankengymnastik (allgemein)",
    beschreibung: "Einzelbehandlung 15-25 min, Befund-orientiert",
    beruf: ["therapie"], kostentraeger: "sgb_v_heilmittel", einheit: "leistung",
    vergutungCents: 2184, rechtsgrundlage: "Heilmittelkatalog ZN1, EX1, AT1",
  },
  {
    code: "KG-ZNS", name: "KG ZNS / Bobath / Vojta",
    beschreibung: "Krankengymn. bei zentralneurol. Erkrankungen, 25-35 min",
    beruf: ["therapie"], kostentraeger: "sgb_v_heilmittel", einheit: "leistung",
    vergutungCents: 3276, rechtsgrundlage: "Heilmittelkatalog ZN1/2",
  },
  {
    code: "KG-MT", name: "Manuelle Therapie",
    beschreibung: "MT 15-25 min, Zertifikatsleistung",
    beruf: ["therapie"], kostentraeger: "sgb_v_heilmittel", einheit: "leistung",
    vergutungCents: 2486, rechtsgrundlage: "Heilmittelkatalog EX1-3",
  },
  {
    code: "KMT", name: "Klassische Massage",
    beschreibung: "Massage einer Körperregion 15-20 min",
    beruf: ["therapie"], kostentraeger: "sgb_v_heilmittel", einheit: "leistung",
    vergutungCents: 1355, rechtsgrundlage: "Heilmittelkatalog",
  },
  {
    code: "ERG-MOT", name: "Ergotherapie motorisch-funktionell",
    beschreibung: "Einzelbehandlung 30-45 min",
    beruf: ["therapie"], kostentraeger: "sgb_v_heilmittel", einheit: "leistung",
    vergutungCents: 3638, rechtsgrundlage: "Heilmittelkatalog ER1",
  },
  {
    code: "ERG-SENS", name: "Ergotherapie sensomotorisch-perzeptiv",
    beschreibung: "Einzelbehandlung 45 min",
    beruf: ["therapie"], kostentraeger: "sgb_v_heilmittel", einheit: "leistung",
    vergutungCents: 4853, rechtsgrundlage: "Heilmittelkatalog ER2",
  },
  {
    code: "LOG-EBT", name: "Logopädie · Einzelbehandlung",
    beschreibung: "Stimm-, Sprech-, Sprach- oder Schlucktherapie 45 min",
    beruf: ["therapie"], kostentraeger: "sgb_v_heilmittel", einheit: "leistung",
    vergutungCents: 4196, rechtsgrundlage: "Heilmittelkatalog SP/SC",
    doku: { risikoHinweis: ["aspiration"] },
  },

  // ════════════════════════════════════════════════════════
  // HEILERZIEHUNG — SGB IX BTHG (Bundesempfehlung)
  // ════════════════════════════════════════════════════════
  {
    code: "BTHG-FA", name: "Fachleistung Eingliederungshilfe",
    beschreibung: "Personenzentrierte Leistung gem. ICF-basiertem Teilhabeplan",
    beruf: ["heilerziehung", "sozialarbeit", "beratung"], kostentraeger: "sgb_ix_eh", einheit: "stunde",
    vergutungCents: 6800, rechtsgrundlage: "§ 113 SGB IX",
    genehmigungspflichtig: true,
  },
  {
    code: "BTHG-T-FA", name: "Tagesstruktur Werkstatt / Förderstätte",
    beschreibung: "Tagespauschale teilstationäre Tagesstruktur",
    beruf: ["heilerziehung"], kostentraeger: "sgb_ix_eh", einheit: "tag",
    vergutungCents: 7800, rechtsgrundlage: "§ 113 i.V.m. § 81 SGB IX",
  },
  {
    code: "BTHG-TT", name: "Teilhabe am Leben in der Gemeinschaft",
    beschreibung: "Begleitung Freizeit/Soziales/Bildung gem. Teilhabeplan",
    beruf: ["heilerziehung"], kostentraeger: "sgb_ix_eh", einheit: "tag",
    vergutungCents: 8900, rechtsgrundlage: "§ 113 SGB IX",
  },
  {
    code: "ICF-ASS", name: "ICF-Assessment / Teilhabeplanung",
    beschreibung: "Erstellung/Fortschreibung ICF-basierter Teilhabeplan",
    beruf: ["heilerziehung", "beratung"], kostentraeger: "sgb_ix_eh", einheit: "fall",
    vergutungCents: 14500, rechtsgrundlage: "§ 117 SGB IX",
  },

  // ════════════════════════════════════════════════════════
  // BERATUNG — EUTB & Pflegeberatung
  // ════════════════════════════════════════════════════════
  {
    code: "EUTB-STD", name: "EUTB-Beratungsstunde",
    beschreibung: "Ergänzende unabhängige Teilhabeberatung, peer-orientiert",
    beruf: ["beratung", "sozialarbeit"], kostentraeger: "sgb_ix_eutb", einheit: "stunde",
    vergutungCents: 4500, rechtsgrundlage: "§ 32 SGB IX",
  },
  {
    code: "PB-7a", name: "Pflegeberatung § 7a SGB XI",
    beschreibung: "Individuelles Beratungsgespräch mit Versorgungsplan",
    beruf: ["beratung", "pflege"], kostentraeger: "sgb_xi_pflege", einheit: "fall",
    vergutungCents: 9200, rechtsgrundlage: "§ 7a SGB XI",
  },

  // ════════════════════════════════════════════════════════
  // SOZIALARBEIT — SGB VIII Hilfen zur Erziehung & SGB XII
  // ════════════════════════════════════════════════════════
  {
    code: "FLS-J31", name: "Fachleistungsstunde · Sozialpäd. Familienhilfe",
    beschreibung: "Aufsuchende Familienhilfe gem. § 31 SGB VIII",
    beruf: ["sozialarbeit"], kostentraeger: "sgb_viii_jh", einheit: "stunde",
    vergutungCents: 6540, rechtsgrundlage: "§ 31 SGB VIII",
    genehmigungspflichtig: true,
  },
  {
    code: "FLS-J35a", name: "Fachleistungsstunde · Eingliederungshilfe Kinder/Jugend",
    beschreibung: "Eingliederungshilfe seelisch behinderter junger Menschen",
    beruf: ["sozialarbeit", "heilerziehung"], kostentraeger: "sgb_viii_jh", einheit: "stunde",
    vergutungCents: 6890, rechtsgrundlage: "§ 35a SGB VIII",
    genehmigungspflichtig: true,
  },
  {
    code: "HzP-XII", name: "Hilfe zur Pflege · SGB XII",
    beschreibung: "Sozialhilfe-finanzierte Pflege bei nicht-PV-Versicherten",
    beruf: ["pflege", "sozialarbeit"], kostentraeger: "sgb_xii_sh", einheit: "stunde",
    vergutungCents: 4200, rechtsgrundlage: "§§ 61 ff. SGB XII",
  },

  // ════════════════════════════════════════════════════════
  // ERZIEHUNG — KiBiZ / Kita
  // ════════════════════════════════════════════════════════
  {
    code: "KIBIZ-U3-GT", name: "Kita-Pauschale U3 ganztags",
    beschreibung: "Bildungs- und Lerngeschichten dokumentiert, 45 Std/Woche",
    beruf: ["erziehung"], kostentraeger: "kibiz", einheit: "tag",
    vergutungCents: 3800, rechtsgrundlage: "KiBiZ NRW",
  },
  {
    code: "KIBIZ-U3-HT", name: "Kita-Pauschale U3 halbtags",
    beschreibung: "Halbtagsbetreuung, 25 Std/Woche",
    beruf: ["erziehung"], kostentraeger: "kibiz", einheit: "tag",
    vergutungCents: 2400, rechtsgrundlage: "KiBiZ NRW",
  },
  {
    code: "KIBIZ-Ue3-GT", name: "Kita-Pauschale Ü3 ganztags",
    beschreibung: "Bildungsdoku, 45 Std/Woche",
    beruf: ["erziehung"], kostentraeger: "kibiz", einheit: "tag",
    vergutungCents: 2900, rechtsgrundlage: "KiBiZ NRW",
  },

  // ════════════════════════════════════════════════════════
  // HAUSWIRTSCHAFT — als eigenständig (separat zu LK14)
  // ════════════════════════════════════════════════════════
  {
    code: "HW-PR", name: "Hauswirtschaft · Privatleistung",
    beschreibung: "Reinigung/Wäsche als Selbstzahlerleistung",
    beruf: ["hauswirtschaft"], kostentraeger: "selbstzahler", einheit: "stunde",
    vergutungCents: 3500, rechtsgrundlage: "Privatvertrag",
  },

  // ════════════════════════════════════════════════════════
  // EHRENAMT
  // ════════════════════════════════════════════════════════
  {
    code: "EHR-BG", name: "Ehrenamtliche Begleitung",
    beschreibung: "Spaziergang, Vorlesen, Besuch — Aufwandsentschädigung",
    beruf: ["ehrenamt"], kostentraeger: "spende", einheit: "stunde",
    vergutungCents: 800, rechtsgrundlage: "§ 3 Nr. 26a EStG (Ehrenamtspauschale)",
  },
];

// ─── Lookups ─────────────────────────────────────────────

export function getModul(code: string): LeistungsModul | null {
  return MODULE.find((m) => m.code === code) ?? null;
}

export function listModuleForBeruf(beruf: BerufsTyp): LeistungsModul[] {
  return MODULE.filter((m) => m.beruf.includes(beruf));
}

export function listModuleForKostentraeger(kt: Kostentraeger): LeistungsModul[] {
  return MODULE.filter((m) => m.kostentraeger === kt);
}

export function groupModuleByKostentraeger(beruf?: BerufsTyp): Record<Kostentraeger, LeistungsModul[]> {
  const list = beruf ? listModuleForBeruf(beruf) : MODULE;
  const out = {} as Record<Kostentraeger, LeistungsModul[]>;
  for (const m of list) {
    (out[m.kostentraeger] ??= []).push(m);
  }
  return out;
}

export function groupModuleByBeruf(): Record<BerufsTyp, LeistungsModul[]> {
  const out = {} as Record<BerufsTyp, LeistungsModul[]>;
  const berufe: BerufsTyp[] = [
    "pflege", "sozialarbeit", "erziehung", "beratung",
    "therapie", "heilerziehung", "hauswirtschaft", "ehrenamt",
  ];
  for (const b of berufe) {
    out[b] = listModuleForBeruf(b);
  }
  return out;
}
