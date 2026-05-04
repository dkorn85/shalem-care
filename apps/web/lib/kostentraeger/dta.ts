// Datenträgeraustausch (DTA) für Kostenträger.
//
// Spezifikationen, die Phase 2 erfüllen müsste:
//   - SGB XI Anlage 5: technische Anlage zum Datenaustausch nach § 105
//   - SGB V § 302: Abrechnung sonstiger Leistungserbringer (HKP, Heilmittel, Hilfsmittel)
//   - SGB IX BTHG: Datenaustausch der Eingliederungshilfe
//
// Phase 1 produziert eine vereinfachte CSV-/JSON-Variante mit denselben
// Feldnamen wie der GKV-Standard, sodass eine spätere Migration fließend ist.

import { computeErloesForEinrichtung } from "../erloes/erloes";
import { getModul } from "../abrechnung/module";
import { listErbringungenInPeriod } from "../abrechnung/store";
import { getKlient, getEinrichtung } from "../hierarchy/store";
import type { Kostentraeger } from "../abrechnung/types";

export type DtaRow = {
  rechnungsnummer: string;
  rechnungsdatum: string;        // ISO YYYY-MM-DD
  ikLeistungserbringer: string;  // 9-stellig, der Träger
  ikKostentraeger: string;       // 9-stellig, die Kasse
  versichertenNr?: string;
  versicherterName: string;
  kostentraegerType: Kostentraeger;
  modulCode: string;
  modulName: string;
  rechtsgrundlage: string;
  einheit: string;
  anzahl: number;
  einzelpreisCents: number;
  gesamtCents: number;
  zeitraumVon: string;
  zeitraumBis: string;
};

export type DtaBundle = {
  einrichtungId: string;
  einrichtungName: string;
  ikLeistungserbringer: string;
  zeitraumVon: string;
  zeitraumBis: string;
  rows: DtaRow[];
  summenProKostentraeger: Partial<Record<Kostentraeger, number>>;
  gesamtCents: number;
  generiertAm: string;
};

export async function buildDtaForEinrichtung(input: {
  einrichtungId: string;
  vonISO: string;
  bisISO: string;
}): Promise<DtaBundle> {
  const einrichtung = getEinrichtung(input.einrichtungId);
  if (!einrichtung) throw new Error("Einrichtung nicht gefunden");

  // Kassen-IK pro Klient — für Demo nutzen wir AOK Nordost als Default.
  // Phase 2: Versicherten-Stammdaten der Klienten enthalten echte IK.
  const FALLBACK_IK_KASSE = "100000031";

  const erbr = listErbringungenInPeriod(input.vonISO, input.bisISO);
  const rows: DtaRow[] = [];

  // Aggregiere: pro Klient pro Modul → eine Rechnungs-Zeile
  type Key = string;
  const map = new Map<Key, { count: number; cents: number; klientId: string; modulCode: string }>();
  for (const e of erbr) {
    const m = getModul(e.modulCode);
    if (!m) continue;
    const k = `${e.klientId}|${e.modulCode}`;
    const slot = map.get(k) ?? { count: 0, cents: 0, klientId: e.klientId, modulCode: e.modulCode };
    slot.count += e.anzahl;
    slot.cents += Math.round(e.anzahl * m.vergutungCents);
    map.set(k, slot);
  }

  let invoiceSeq = 1;
  for (const slot of map.values()) {
    const klient = getKlient(slot.klientId);
    const modul = getModul(slot.modulCode)!;
    if (!klient) continue;
    rows.push({
      rechnungsnummer: `${einrichtung.ik}-${input.bisISO.slice(0, 7).replace("-", "")}-${invoiceSeq.toString().padStart(4, "0")}`,
      rechnungsdatum: input.bisISO.slice(0, 10),
      ikLeistungserbringer: einrichtung.ik,
      ikKostentraeger: FALLBACK_IK_KASSE,
      versichertenNr: undefined,
      versicherterName: klient.name,
      kostentraegerType: modul.kostentraeger,
      modulCode: modul.code,
      modulName: modul.name,
      rechtsgrundlage: modul.rechtsgrundlage,
      einheit: modul.einheit,
      anzahl: slot.count,
      einzelpreisCents: modul.vergutungCents,
      gesamtCents: slot.cents,
      zeitraumVon: input.vonISO.slice(0, 10),
      zeitraumBis: input.bisISO.slice(0, 10),
    });
    invoiceSeq++;
  }

  // Pflegegrad-Pauschalen separat hinzufügen (eine Zeile pro Klient/Monat)
  const erloes = await computeErloesForEinrichtung(input.einrichtungId);
  for (const station of erloes.stations) {
    for (const k of station.klienten) {
      rows.push({
        rechnungsnummer: `${einrichtung.ik}-${input.bisISO.slice(0, 7).replace("-", "")}-PG-${invoiceSeq.toString().padStart(4, "0")}`,
        rechnungsdatum: input.bisISO.slice(0, 10),
        ikLeistungserbringer: einrichtung.ik,
        ikKostentraeger: FALLBACK_IK_KASSE,
        versicherterName: k.klient.name,
        kostentraegerType: "sgb_xi_pflege",
        modulCode: "PG-PAUSCH",
        modulName: `Pflegegrad ${k.pflegegrad} · Pauschale`,
        rechtsgrundlage: "§§ 36, 43 SGB XI",
        einheit: "monat",
        anzahl: 1,
        einzelpreisCents: k.monthlyRevenueCents,
        gesamtCents: k.monthlyRevenueCents,
        zeitraumVon: input.vonISO.slice(0, 10),
        zeitraumBis: input.bisISO.slice(0, 10),
      });
      invoiceSeq++;
    }
  }

  const summen: Partial<Record<Kostentraeger, number>> = {};
  let total = 0;
  for (const r of rows) {
    summen[r.kostentraegerType] = (summen[r.kostentraegerType] ?? 0) + r.gesamtCents;
    total += r.gesamtCents;
  }

  return {
    einrichtungId: einrichtung.id,
    einrichtungName: einrichtung.name,
    ikLeistungserbringer: einrichtung.ik,
    zeitraumVon: input.vonISO.slice(0, 10),
    zeitraumBis: input.bisISO.slice(0, 10),
    rows,
    summenProKostentraeger: summen,
    gesamtCents: total,
    generiertAm: new Date().toISOString(),
  };
}

export function dtaToCsv(bundle: DtaBundle): string {
  const head = [
    "rechnungsnummer", "rechnungsdatum", "ik_leistungserbringer", "ik_kostentraeger",
    "versicherten_nr", "versicherter_name", "kostentraeger_type", "modul_code", "modul_name",
    "rechtsgrundlage", "einheit", "anzahl", "einzelpreis_eur", "gesamt_eur",
    "zeitraum_von", "zeitraum_bis",
  ];
  const lines = [head.join(";")];
  for (const r of bundle.rows) {
    lines.push([
      r.rechnungsnummer, r.rechnungsdatum, r.ikLeistungserbringer, r.ikKostentraeger,
      r.versichertenNr ?? "", q(r.versicherterName), r.kostentraegerType, r.modulCode, q(r.modulName),
      q(r.rechtsgrundlage), r.einheit, r.anzahl.toString(),
      (r.einzelpreisCents / 100).toFixed(2),
      (r.gesamtCents / 100).toFixed(2),
      r.zeitraumVon, r.zeitraumBis,
    ].join(";"));
  }
  return lines.join("\n");
}

function q(s: string): string {
  if (s.includes(";") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
