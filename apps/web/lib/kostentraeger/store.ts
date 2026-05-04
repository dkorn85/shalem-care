// Kostenträger-Vorgänge · In-Memory mit Demo-Seed.

import type { KassenVorgang, KassenStatus } from "./types";
import { listKrankenkassen } from "../krankmeldung/krankenkasse-api";
import { listKrankmeldungenForEinrichtung, listAktiveKrankmeldungen } from "../krankmeldung/store";
import { listAnfragen } from "../verordnung/store";
import { getKlient } from "../hierarchy/store";

type GlobalShape = { __shalemKassenVorgaenge?: KassenVorgang[] };
const g = globalThis as unknown as GlobalShape;
const vorgaenge: KassenVorgang[] = g.__shalemKassenVorgaenge ?? [];
if (!g.__shalemKassenVorgaenge) g.__shalemKassenVorgaenge = vorgaenge;

export function listVorgaenge(filter?: { ikNummer?: string; status?: KassenStatus[] }): KassenVorgang[] {
  return vorgaenge
    .filter((v) => !filter?.ikNummer || v.ikNummer === filter.ikNummer)
    .filter((v) => !filter?.status || filter.status.includes(v.status))
    .sort((a, b) => b.eingegangenAm.localeCompare(a.eingegangenAm));
}

export function getVorgang(id: string): KassenVorgang | null {
  return vorgaenge.find((v) => v.id === id) ?? null;
}

export function setVorgangStatus(
  id: string,
  status: KassenStatus,
  bearbeitetVon: string,
  notiz?: string,
): KassenVorgang | null {
  const v = vorgaenge.find((x) => x.id === id);
  if (!v) return null;
  v.status = status;
  v.bearbeitetAm = new Date().toISOString();
  v.bearbeitetVon = bearbeitetVon;
  if (notiz !== undefined) v.notiz = notiz;
  return v;
}

// ─── Seed: aus existierenden Krankmeldungen + Verordnungs-Anfragen ableiten ──

let _seeded = false;
export function seedKostentraegerOnce() {
  if (_seeded) return;
  _seeded = true;
  if (vorgaenge.length > 0) return;

  const kassen = listKrankenkassen();
  const aok = kassen.find((k) => k.ik === "100000031") ?? kassen[0];
  const tk = kassen.find((k) => k.ik === "101575519") ?? kassen[1] ?? kassen[0];

  const now = new Date();
  const isoMinus = (h: number) => {
    const d = new Date(now); d.setHours(d.getHours() - h); return d.toISOString();
  };

  // Aus Krankmeldungs-Stub: existierende eAUs einsammeln
  const aktive = listAktiveKrankmeldungen();
  const allKM = [...aktive, ...listKrankmeldungenForEinrichtung("ph-bochum-süd")];
  const seenKM = new Set<string>();
  for (const km of allKM) {
    if (seenKM.has(km.id)) continue;
    seenKM.add(km.id);
    if (!km.krankenkasse?.eauReferenz) continue;
    vorgaenge.push({
      id: `kv-eau-${vorgaenge.length}`,
      ikNummer: km.krankenkasse.ikNummer,
      kassenName: km.krankenkasse.name,
      typ: "eau",
      versichertenNr: undefined,
      versicherterName: "Versicherte:r",
      betreffRef: km.krankenkasse.eauReferenz,
      beschreibung: `eAU-Bescheinigung · ${km.vonDatum} – ${km.bisDatum ?? km.voraussichtlichBis}`,
      status: "eingegangen",
      eingegangenAm: km.krankenkasse.eauVersendetAm ?? new Date().toISOString(),
    });
  }

  // Demo-Vorgänge mit echten Klienten verknüpfen
  const helga = getKlient("klient-hr");
  const wilhelm = getKlient("klient-wb");
  const elfriede = getKlient("klient-eg");

  if (helga) {
    vorgaenge.push({
      id: "kv-seed-1",
      ikNummer: aok.ik,
      kassenName: aok.name,
      typ: "hkp_genehmigung",
      versichertenNr: "A123456789",
      versicherterName: helga.name,
      klientId: helga.id,
      einrichtungId: helga.einrichtungId,
      einrichtungName: "Pflegeheim Sankt Lukas, Bochum",
      beschreibung: "HKP-Folgeverordnung · Tablettenstellung 1×/Tag · 90 Tage",
      status: "in_pruefung",
      eingegangenAm: isoMinus(20),
    });
  }
  if (wilhelm) {
    vorgaenge.push({
      id: "kv-seed-2",
      ikNummer: aok.ik,
      kassenName: aok.name,
      typ: "hkp_genehmigung",
      versichertenNr: "A234567890",
      versicherterName: wilhelm.name,
      klientId: wilhelm.id,
      einrichtungId: wilhelm.einrichtungId,
      einrichtungName: "Pflegeheim Sankt Lukas, Bochum",
      beschreibung: "HKP · Wundversorgung Ferse · VW alle 2 Tage · 60 Tage",
      status: "rueckfrage",
      eingegangenAm: isoMinus(48),
      notiz: "Bitte Foto-Doku der letzten 4 Wochen mitschicken.",
    });
    vorgaenge.push({
      id: "kv-seed-3",
      ikNummer: aok.ik,
      kassenName: aok.name,
      typ: "hilfsmittel",
      versichertenNr: "A234567890",
      versicherterName: wilhelm.name,
      klientId: wilhelm.id,
      beschreibung: "Hilfsmittel · Druckverteilende Schaumstoff-Auflage Ferse",
      betragCents: 18900,
      status: "genehmigt",
      eingegangenAm: isoMinus(72),
      bearbeitetAm: isoMinus(48),
      bearbeitetVon: "Sachbearbeiterin AOK",
    });
  }
  if (elfriede) {
    vorgaenge.push({
      id: "kv-seed-4",
      ikNummer: tk.ik,
      kassenName: tk.name,
      typ: "abrechnung",
      versichertenNr: "T345678901",
      versicherterName: elfriede.name,
      klientId: elfriede.id,
      einrichtungId: elfriede.einrichtungId,
      einrichtungName: "Pflegeheim Sankt Lukas, Bochum",
      beschreibung: "Monatsabrechnung April 2026 · Pflegegrad 5 · stationäre Pflege",
      betragCents: 229_900,
      status: "in_pruefung",
      eingegangenAm: isoMinus(96),
    });
  }

  // Aus Verordnungs-Anfragen: ausgestellte HKP-Verordnungen → zur Kasse
  const ausgestellt = listAnfragen({ status: ["ausgestellt"] });
  for (const a of ausgestellt) {
    if (a.kategorie !== "haeusl_pflege" && a.kategorie !== "hilfsmittel") continue;
    const klient = getKlient(a.klientId);
    if (!klient) continue;
    vorgaenge.push({
      id: `kv-vo-${a.id}`,
      ikNummer: aok.ik,
      kassenName: aok.name,
      typ: a.kategorie === "haeusl_pflege" ? "hkp_genehmigung" : "hilfsmittel",
      versichertenNr: undefined,
      versicherterName: klient.name,
      klientId: klient.id,
      betreffRef: a.eRezeptCode,
      beschreibung: a.begruendung.slice(0, 120),
      status: "eingegangen",
      eingegangenAm: a.aktualisiertAm,
    });
  }
}
