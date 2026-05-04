// Medikamenten-Stammdaten — kuratierter Katalog der in deutschen
// Pflegeheimen und ambulanten Diensten häufigsten Wirkstoffe.
//
// Quellen-Logik (für Demo, nicht für Verordnung):
//   - GKV-Arzneimittelindex (häufigste Wirkstoffe in Pflege)
//   - PRISCUS 2.0 für Geriatrie-Warnungen
//   - PZN-Format: 8-stellig (Demo-PZN, nicht real verordnungsfähig)

import type { Medikament } from "./types";

export const MEDIKAMENTEN_KATALOG: Medikament[] = [
  // ─── C — Herz-Kreislauf ─────────────────────────────────
  { id: "med-metoprolol", pzn: "06713889", handelsname: "Metoprolol succinat AL 47,5 mg", wirkstoff: "Metoprolol", staerke: "47,5 mg",
    darreichung: "tablette", atc: "C07AB02", atcGruppe: "C", btm: false, priscus: false,
    hinweise: "Pulskontrolle vor Gabe — bei HF < 50/min Rücksprache Arzt", apothekenpreisCents: 1490 },
  { id: "med-bisoprolol", pzn: "07053859", handelsname: "Bisoprolol AbZ 5 mg", wirkstoff: "Bisoprolol", staerke: "5 mg",
    darreichung: "tablette", atc: "C07AB07", atcGruppe: "C", btm: false, priscus: false,
    hinweise: "Bradykardie beobachten", apothekenpreisCents: 1320 },
  { id: "med-ramipril", pzn: "00592467", handelsname: "Ramipril-1A Pharma 5 mg", wirkstoff: "Ramipril", staerke: "5 mg",
    darreichung: "tablette", atc: "C09AA05", atcGruppe: "C", btm: false, priscus: false,
    hinweise: "Hustenreiz möglich, Niereninsuff. dosisanpassen", apothekenpreisCents: 1180 },
  { id: "med-amlodipin", pzn: "01254521", handelsname: "Amlodipin Heumann 5 mg", wirkstoff: "Amlodipin", staerke: "5 mg",
    darreichung: "tablette", atc: "C08CA01", atcGruppe: "C", btm: false, priscus: false,
    hinweise: "Knöchelödeme häufig", apothekenpreisCents: 1240 },
  { id: "med-furosemid", pzn: "04877552", handelsname: "Furosemid AL 40 mg", wirkstoff: "Furosemid", staerke: "40 mg",
    darreichung: "tablette", atc: "C03CA01", atcGruppe: "C", btm: false, priscus: false,
    hinweise: "Morgens geben — sonst nächtl. Toilettengänge, Sturzrisiko", apothekenpreisCents: 990 },
  { id: "med-torasemid", pzn: "07515844", handelsname: "Torasemid AL 10 mg", wirkstoff: "Torasemid", staerke: "10 mg",
    darreichung: "tablette", atc: "C03CA04", atcGruppe: "C", btm: false, priscus: false,
    hinweise: "Kalium kontrollieren", apothekenpreisCents: 1150 },
  { id: "med-simvastatin", pzn: "00592225", handelsname: "Simvastatin AL 40 mg", wirkstoff: "Simvastatin", staerke: "40 mg",
    darreichung: "tablette", atc: "C10AA01", atcGruppe: "C", btm: false, priscus: false,
    hinweise: "Abends geben — Cholesterinsynthese überwiegend nachts", apothekenpreisCents: 1380 },

  // ─── B — Antikoagulation ────────────────────────────────
  { id: "med-apixaban", pzn: "10198874", handelsname: "Eliquis 5 mg", wirkstoff: "Apixaban", staerke: "5 mg",
    darreichung: "tablette", atc: "B01AF02", atcGruppe: "B", btm: false, priscus: false,
    hinweise: "Erhöhtes Blutungsrisiko — Hämatome und Stuhl beobachten", apothekenpreisCents: 19890 },
  { id: "med-rivaroxaban", pzn: "07752519", handelsname: "Xarelto 20 mg", wirkstoff: "Rivaroxaban", staerke: "20 mg",
    darreichung: "tablette", atc: "B01AF01", atcGruppe: "B", btm: false, priscus: false,
    hinweise: "Mit Mahlzeit einnehmen", apothekenpreisCents: 18450 },
  { id: "med-ass100", pzn: "06706149", handelsname: "ASS 100 ratiopharm", wirkstoff: "Acetylsalicylsäure", staerke: "100 mg",
    darreichung: "tablette", atc: "B01AC06", atcGruppe: "B", btm: false, priscus: false,
    hinweise: "Magenbeschwerden möglich — mit reichlich Wasser", apothekenpreisCents: 290 },
  { id: "med-marcumar", pzn: "07368379", handelsname: "Marcumar 3 mg", wirkstoff: "Phenprocoumon", staerke: "3 mg",
    darreichung: "tablette", atc: "B01AA04", atcGruppe: "B", btm: false, priscus: false,
    hinweise: "INR-Kontrollen wöchentlich, Vit-K-arme Ernährung beachten", apothekenpreisCents: 2280 },

  // ─── A — Stoffwechsel/GIT ───────────────────────────────
  { id: "med-pantoprazol", pzn: "08533845", handelsname: "Pantoprazol-1A Pharma 40 mg", wirkstoff: "Pantoprazol", staerke: "40 mg",
    darreichung: "tablette", atc: "A02BC02", atcGruppe: "A", btm: false, priscus: false,
    hinweise: "Nüchtern morgens, 30 min vor Frühstück", apothekenpreisCents: 1090 },
  { id: "med-metformin", pzn: "07241036", handelsname: "Metformin AL 1000 mg", wirkstoff: "Metformin", staerke: "1000 mg",
    darreichung: "tablette", atc: "A10BA02", atcGruppe: "A", btm: false, priscus: false,
    hinweise: "Zu den Mahlzeiten — Magenbeschwerden minimieren. Bei eGFR < 30 absetzen.", apothekenpreisCents: 1240 },
  { id: "med-insulin-lantus", pzn: "00592227", handelsname: "Lantus 100 E/ml SoloStar", wirkstoff: "Insulin glargin", staerke: "100 IE/ml",
    darreichung: "injektion", atc: "A10AE04", atcGruppe: "A", btm: false, priscus: false,
    hinweise: "Subkutan, BZ-Tagesprofil führen, Hypoglykämie-Notfallplan", apothekenpreisCents: 8920 },
  { id: "med-movicol", pzn: "01964476", handelsname: "Movicol Aroma", wirkstoff: "Macrogol 3350", staerke: "13,8 g",
    darreichung: "saft", atc: "A06AD15", atcGruppe: "A", btm: false, priscus: false,
    hinweise: "Mit 125 ml Wasser anrühren, ausreichend trinken", apothekenpreisCents: 1840 },
  { id: "med-lactulose", pzn: "06436541", handelsname: "Lactulose-1A Pharma Sirup", wirkstoff: "Lactulose", staerke: "67 %",
    darreichung: "saft", atc: "A06AD11", atcGruppe: "A", btm: false, priscus: false,
    hinweise: "Blähungen anfänglich häufig", apothekenpreisCents: 740 },

  // ─── H — Hormone ────────────────────────────────────────
  { id: "med-l-thyroxin", pzn: "06892008", handelsname: "L-Thyroxin Henning 100", wirkstoff: "Levothyroxin", staerke: "100 µg",
    darreichung: "tablette", atc: "H03AA01", atcGruppe: "H", btm: false, priscus: false,
    hinweise: "Nüchtern, 30 min vor Frühstück, kein Calcium gleichzeitig", apothekenpreisCents: 1130 },

  // ─── N — Nervensystem ───────────────────────────────────
  { id: "med-citalopram", pzn: "00104327", handelsname: "Citalopram-1A Pharma 20 mg", wirkstoff: "Citalopram", staerke: "20 mg",
    darreichung: "tablette", atc: "N06AB04", atcGruppe: "N", btm: false, priscus: false,
    hinweise: "QT-Verlängerung — bei Älteren max. 20 mg/Tag", apothekenpreisCents: 1180 },
  { id: "med-mirtazapin", pzn: "07690053", handelsname: "Mirtazapin Hexal 30 mg", wirkstoff: "Mirtazapin", staerke: "30 mg",
    darreichung: "tablette", atc: "N06AX11", atcGruppe: "N", btm: false, priscus: false,
    hinweise: "Abends — sedierend, appetitsteigernd (oft erwünscht bei Geriatrie)", apothekenpreisCents: 1340 },
  { id: "med-quetiapin", pzn: "07574680", handelsname: "Quetiapin Heumann 25 mg", wirkstoff: "Quetiapin", staerke: "25 mg",
    darreichung: "tablette", atc: "N05AH04", atcGruppe: "N", btm: false, priscus: true,
    hinweise: "PRISCUS: erhöhtes Sturz-/Schlaganfallrisiko — Indikation prüfen", apothekenpreisCents: 1480 },
  { id: "med-risperidon", pzn: "07690047", handelsname: "Risperidon Heumann 0,5 mg", wirkstoff: "Risperidon", staerke: "0,5 mg",
    darreichung: "tablette", atc: "N05AX08", atcGruppe: "N", btm: false, priscus: true,
    hinweise: "PRISCUS — bei Demenz nur kurzzeitig, max. 6 Wochen, EPS beobachten", apothekenpreisCents: 1290 },
  { id: "med-donepezil", pzn: "10269459", handelsname: "Donepezil HCL Heumann 10 mg", wirkstoff: "Donepezil", staerke: "10 mg",
    darreichung: "tablette", atc: "N06DA02", atcGruppe: "N", btm: false, priscus: false,
    hinweise: "Abends — bei Alzheimer leicht/mittel; Bradykardie möglich", apothekenpreisCents: 2840 },
  { id: "med-memantin", pzn: "10009856", handelsname: "Memantin Heumann 20 mg", wirkstoff: "Memantin", staerke: "20 mg",
    darreichung: "tablette", atc: "N06DX01", atcGruppe: "N", btm: false, priscus: false,
    hinweise: "Bei mittelschwerer/schwerer Alzheimer-Demenz", apothekenpreisCents: 3290 },
  { id: "med-levodopa", pzn: "01405128", handelsname: "Madopar 125 T", wirkstoff: "Levodopa/Benserazid", staerke: "100 mg / 25 mg",
    darreichung: "tablette", atc: "N04BA02", atcGruppe: "N", btm: false, priscus: false,
    hinweise: "30 min vor oder 60 min nach Mahlzeit (Eiweiß!) — On-Off beachten", apothekenpreisCents: 4180 },
  { id: "med-tilidin", pzn: "07512481", handelsname: "Tilidin AL comp 100/8 retard", wirkstoff: "Tilidin/Naloxon", staerke: "100 / 8 mg",
    darreichung: "tablette", atc: "N02AX01", atcGruppe: "N", btm: true, priscus: false,
    hinweise: "BtM — Bestand führen, Verfalldatum, schwer einschließen", apothekenpreisCents: 3940 },
  { id: "med-tramadol", pzn: "07758844", handelsname: "Tramadol-1A Pharma 50 mg", wirkstoff: "Tramadol", staerke: "50 mg",
    darreichung: "kapsel", atc: "N02AX02", atcGruppe: "N", btm: false, priscus: true,
    hinweise: "PRISCUS: Verwirrtheit/Sturz möglich — niedrige Startdosis", apothekenpreisCents: 1490 },
  { id: "med-novalgin", pzn: "13981295", handelsname: "Novaminsulfon-ratiopharm 500 mg", wirkstoff: "Metamizol", staerke: "500 mg",
    darreichung: "tablette", atc: "N02BB02", atcGruppe: "N", btm: false, priscus: false,
    hinweise: "Sehr selten Agranulozytose — bei Fieber/Halsschmerzen sofort BB", apothekenpreisCents: 990 },
  { id: "med-paracetamol", pzn: "04786339", handelsname: "Paracetamol AL 500 mg", wirkstoff: "Paracetamol", staerke: "500 mg",
    darreichung: "tablette", atc: "N02BE01", atcGruppe: "N", btm: false, priscus: false,
    hinweise: "Max. 4 g/Tag — bei Leberinsuff. reduzieren", apothekenpreisCents: 290 },
  { id: "med-lorazepam", pzn: "07370334", handelsname: "Tavor 1,0 mg", wirkstoff: "Lorazepam", staerke: "1 mg",
    darreichung: "tablette", atc: "N05BA06", atcGruppe: "N", btm: false, priscus: true,
    hinweise: "PRISCUS — Sturz-/Verwirrtheitsrisiko, nur kurzzeitig (max. 4 Wo)", apothekenpreisCents: 1840 },

  // ─── M — Schmerz/Rheuma ─────────────────────────────────
  { id: "med-ibuprofen", pzn: "00756067", handelsname: "Ibuprofen AL 400", wirkstoff: "Ibuprofen", staerke: "400 mg",
    darreichung: "tablette", atc: "M01AE01", atcGruppe: "M", btm: false, priscus: true,
    hinweise: "PRISCUS: GI-Blutung/Niere — bei > 65 max. kurzzeitig, mit PPI", apothekenpreisCents: 490 },

  // ─── R — Atemwege ───────────────────────────────────────
  { id: "med-salbutamol", pzn: "00565061", handelsname: "Salbutamol-ratiopharm N DA", wirkstoff: "Salbutamol", staerke: "100 µg/Hub",
    darreichung: "spray", atc: "R03AC02", atcGruppe: "R", btm: false, priscus: false,
    hinweise: "Inhalationstechnik kontrollieren, max. 8 Hübe/Tag", apothekenpreisCents: 1190 },
  { id: "med-budesonid", pzn: "07235641", handelsname: "Budesonid-ratiopharm 200 µg", wirkstoff: "Budesonid", staerke: "200 µg/Hub",
    darreichung: "inhalation", atc: "R03BA02", atcGruppe: "R", btm: false, priscus: false,
    hinweise: "Mund nach Inhalation spülen — Soor-Prophylaxe", apothekenpreisCents: 2240 },

  // ─── BtM weitere ─────────────────────────────────────────
  { id: "med-fentanyl-tts", pzn: "01429842", handelsname: "Fentanyl-1A Pharma 25 µg/h Pflaster", wirkstoff: "Fentanyl", staerke: "25 µg/h",
    darreichung: "pflaster", atc: "N02AB03", atcGruppe: "N", btm: true, priscus: false,
    hinweise: "BtM, Pflasterwechsel alle 72 h, vorheriges entfernen, Lokalisation rotieren", apothekenpreisCents: 8740 },
  { id: "med-morphin-trop", pzn: "08436195", handelsname: "Morphin Merck 0,5 % Tropfen", wirkstoff: "Morphin", staerke: "5 mg/ml",
    darreichung: "tropfen", atc: "N02AA01", atcGruppe: "N", btm: true, priscus: false,
    hinweise: "BtM — Bedarfsmedikation Tumorschmerz, Atemfrequenz beobachten", apothekenpreisCents: 5290 },

  // ─── J — Antibiotika (Bedarf) ───────────────────────────
  { id: "med-amoxicillin", pzn: "00076139", handelsname: "Amoxicillin AL 1000 mg", wirkstoff: "Amoxicillin", staerke: "1000 mg",
    darreichung: "tablette", atc: "J01CA04", atcGruppe: "J", btm: false, priscus: false,
    hinweise: "Allergie-Anamnese — Penicillin", apothekenpreisCents: 1380 },

  // ─── D — Dermatika ──────────────────────────────────────
  { id: "med-bepanthen", pzn: "01578675", handelsname: "Bepanthen Wund- und Heilsalbe", wirkstoff: "Dexpanthenol", staerke: "5 %",
    darreichung: "salbe", atc: "D03AX03", atcGruppe: "D", btm: false, priscus: false,
    hinweise: "Wundrand pflegen, nicht in offene Wunde", apothekenpreisCents: 690 },

  // ─── S — Auge ───────────────────────────────────────────
  { id: "med-timolol", pzn: "00190884", handelsname: "Timolol-POS 0,5 %", wirkstoff: "Timolol", staerke: "5 mg/ml",
    darreichung: "tropfen", atc: "S01ED01", atcGruppe: "S", btm: false, priscus: false,
    hinweise: "Glaukom — 5 min Tränenpünktchen drücken", apothekenpreisCents: 1090 },
];

export function findMedikament(id: string) {
  return MEDIKAMENTEN_KATALOG.find((m) => m.id === id) ?? null;
}

export function findMedikamentByPzn(pzn: string) {
  return MEDIKAMENTEN_KATALOG.find((m) => m.pzn === pzn) ?? null;
}

export function searchMedikamente(query: string): typeof MEDIKAMENTEN_KATALOG {
  if (!query.trim()) return MEDIKAMENTEN_KATALOG;
  const q = query.toLowerCase();
  return MEDIKAMENTEN_KATALOG.filter(
    (m) =>
      m.handelsname.toLowerCase().includes(q) ||
      m.wirkstoff.toLowerCase().includes(q) ||
      m.atc.toLowerCase().includes(q) ||
      m.pzn.includes(q),
  );
}
