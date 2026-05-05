// Befund-Store · in-memory · Phase 2 → FHIR Observation/ImagingStudy/Condition

import type {
  ImagingBefund, LaborBefund, GangbildBefund, WirbelsaeulenBefund,
  AnamneseEintrag, Behandlungsplan,
} from "./types";

type BefundShape = {
  imaging: ImagingBefund[];
  labor: LaborBefund[];
  gang: GangbildBefund[];
  wirbel: WirbelsaeulenBefund[];
  anamnese: AnamneseEintrag[];
  plaene: Behandlungsplan[];
};
type GlobalShape = { __shalemBefund?: BefundShape };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemBefund) {
  g.__shalemBefund = { imaging: [], labor: [], gang: [], wirbel: [], anamnese: [], plaene: [] };
}
const s = g.__shalemBefund!;

// ─── Read API ──────────────────────────────────────────────────────────

export function getBefundeFor(klientId: string) {
  return {
    imaging: s.imaging.filter((b) => b.klientId === klientId).sort((a, b) => b.datum.localeCompare(a.datum)),
    labor:   s.labor.filter((b) => b.klientId === klientId).sort((a, b) => b.datum.localeCompare(a.datum)),
    gang:    s.gang.filter((b) => b.klientId === klientId).sort((a, b) => b.datum.localeCompare(a.datum)),
    wirbel:  s.wirbel.filter((b) => b.klientId === klientId).sort((a, b) => b.datum.localeCompare(a.datum)),
    anamnese: s.anamnese.filter((b) => b.klientId === klientId).sort((a, b) => b.datum.localeCompare(a.datum)),
    plaene:  s.plaene.filter((b) => b.klientId === klientId).sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm)),
  };
}

export function getImagingById(id: string) { return s.imaging.find((b) => b.id === id) ?? null; }
export function getLaborById(id: string)   { return s.labor.find((b) => b.id === id) ?? null; }
export function getGangById(id: string)    { return s.gang.find((b) => b.id === id) ?? null; }
export function getWirbelById(id: string)  { return s.wirbel.find((b) => b.id === id) ?? null; }

// ─── Write API ─────────────────────────────────────────────────────────

export function addImaging(b: Omit<ImagingBefund, "id">): ImagingBefund {
  const x = { ...b, id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
  s.imaging.push(x);
  return x;
}
export function addLabor(b: Omit<LaborBefund, "id">): LaborBefund {
  const x = { ...b, id: `lab-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
  s.labor.push(x);
  return x;
}
export function addGang(b: Omit<GangbildBefund, "id">): GangbildBefund {
  const x = { ...b, id: `gng-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
  s.gang.push(x);
  return x;
}
export function addWirbel(b: Omit<WirbelsaeulenBefund, "id">): WirbelsaeulenBefund {
  const x = { ...b, id: `wir-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
  s.wirbel.push(x);
  return x;
}
export function addAnamnese(b: Omit<AnamneseEintrag, "id">): AnamneseEintrag {
  const x = { ...b, id: `anm-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
  s.anamnese.push(x);
  return x;
}
export function addBehandlungsplan(b: Omit<Behandlungsplan, "id" | "erstelltAm">): Behandlungsplan {
  const x = { ...b, id: `bp-${Date.now()}-${Math.floor(Math.random() * 1000)}`, erstelltAm: new Date().toISOString() };
  s.plaene.push(x);
  return x;
}

// ─── Demo-Seed ────────────────────────────────────────────────────────

let _seeded = false;
export function seedBefundOnce() {
  if (_seeded) return;
  _seeded = true;

  const heute = new Date();
  const tageVor = (n: number) => {
    const d = new Date(heute); d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  // Helga Reinhardt — primäre Demo-Klientin
  const HR = "klient-hr";

  // Imaging: LWS-Röntgen 2 Ansichten + MRT
  s.imaging.push({
    id: "img-seed-001",
    klientId: HR,
    modalitaet: "roentgen",
    region: "LWS",
    datum: tageVor(28),
    ansichten: [
      { projektion: "ap",      bildUrl: "/befunde/demo/lws-ap.png",      thumbnailUrl: "/befunde/demo/lws-ap-thumb.png" },
      { projektion: "lateral", bildUrl: "/befunde/demo/lws-lateral.png", thumbnailUrl: "/befunde/demo/lws-lateral-thumb.png" },
    ],
    befundtext: "Verstärkte Spondylose L3–L5. Diskrete Spondylarthrose. Keine frische Fraktur.",
    diagnose: "M47.26",
    radiologe: "Dr. Bernhardt, Radiologie Schöneberg",
  });

  s.imaging.push({
    id: "img-seed-002",
    klientId: HR,
    modalitaet: "mrt",
    region: "LWS",
    datum: tageVor(14),
    ansichten: [
      { projektion: "sagittal",    bildUrl: "/befunde/demo/lws-mrt-sag.png" },
      { projektion: "transversal", bildUrl: "/befunde/demo/lws-mrt-ax.png" },
    ],
    befundtext: "Mediolateraler Bandscheibenvorfall L4/L5 mit Wurzelkompression L5 links. Keine Myelopathie.",
    diagnose: "M51.16",
    radiologe: "Dr. Bernhardt",
  });

  // Labor: kleines Blutbild + Urinstatus + Substanzanalyse
  s.labor.push({
    id: "lab-seed-001",
    klientId: HR,
    material: "blut",
    panel: "Kleines Blutbild + Stoffwechsel",
    datum: tageVor(21),
    werte: [
      { parameter: "Hämoglobin",     loinc: "718-7",   wert: 11.8, einheit: "g/dl",  referenzVon: 12, referenzBis: 16, flag: "niedrig" },
      { parameter: "Hämatokrit",     loinc: "4544-3",  wert: 35,   einheit: "%",     referenzVon: 36, referenzBis: 46, flag: "niedrig" },
      { parameter: "Leukozyten",     loinc: "6690-2",  wert: 7.4,  einheit: "10⁹/l", referenzVon: 4,  referenzBis: 10, flag: "normal" },
      { parameter: "Thrombozyten",   loinc: "777-3",   wert: 252,  einheit: "10⁹/l", referenzVon: 150, referenzBis: 400, flag: "normal" },
      { parameter: "CRP",            loinc: "1988-5",  wert: 8.2,  einheit: "mg/l",  referenzVon: 0,  referenzBis: 5,  flag: "hoch" },
      { parameter: "Kreatinin",      loinc: "2160-0",  wert: 1.1,  einheit: "mg/dl", referenzVon: 0.5, referenzBis: 1.0, flag: "hoch" },
      { parameter: "eGFR",           loinc: "62238-1", wert: 58,   einheit: "ml/min/1.73m²", referenzVon: 60, referenzBis: 120, flag: "niedrig" },
      { parameter: "HbA1c",          loinc: "4548-4",  wert: 6.7,  einheit: "%",     referenzVon: 4,  referenzBis: 5.7, flag: "hoch" },
      { parameter: "Vitamin D 25-OH",loinc: "1989-3",  wert: 18,   einheit: "ng/ml", referenzVon: 30, referenzBis: 100, flag: "kritisch_niedrig" },
      { parameter: "Ferritin",       loinc: "2276-4",  wert: 24,   einheit: "ng/ml", referenzVon: 30, referenzBis: 200, flag: "niedrig" },
    ],
    freitext: "Leichte Anämie · Niereninsuffizienz Stadium G3a · Diabetes mellitus T2 grenzwertig kontrolliert · Vitamin-D-Mangel ausgeprägt.",
    labor: "Labor Berlin Mitte",
  });

  s.labor.push({
    id: "lab-seed-002",
    klientId: HR,
    material: "urin",
    panel: "Urinstatus mit Sediment",
    datum: tageVor(21),
    werte: [
      { parameter: "Spezifisches Gewicht", wert: 1.018, einheit: "",    referenzVon: 1.005, referenzBis: 1.030, flag: "normal" },
      { parameter: "pH",                    wert: 6.2,   einheit: "",    referenzVon: 5,     referenzBis: 7,     flag: "normal" },
      { parameter: "Eiweiß",                wert: "+",   einheit: "",                                              flag: "hoch" },
      { parameter: "Glukose",               wert: "neg", einheit: "",                                              flag: "normal" },
      { parameter: "Leukozyten",            wert: 12,    einheit: "/µl", referenzVon: 0,     referenzBis: 10,    flag: "hoch" },
      { parameter: "Erythrozyten",          wert: 3,     einheit: "/µl", referenzVon: 0,     referenzBis: 5,     flag: "normal" },
      { parameter: "Nitrit",                wert: "neg", einheit: "",                                              flag: "normal" },
      { parameter: "Bakterien",             wert: "+",   einheit: "",                                              flag: "hoch" },
    ],
    freitext: "Diskrete Mikroalbuminurie (passend zur Niereninsuffizienz) · grenzwertige Bakteriurie ohne Symptomatik.",
    labor: "Labor Berlin Mitte",
  });

  s.labor.push({
    id: "lab-seed-003",
    klientId: HR,
    material: "haar",
    panel: "Haarmineralanalyse (Substanzanalyse)",
    datum: tageVor(60),
    werte: [
      { parameter: "Magnesium", wert: 22,  einheit: "mg/kg", referenzVon: 25,  referenzBis: 75,  flag: "niedrig" },
      { parameter: "Zink",      wert: 130, einheit: "mg/kg", referenzVon: 130, referenzBis: 220, flag: "niedrig" },
      { parameter: "Kupfer",    wert: 18,  einheit: "mg/kg", referenzVon: 8,   referenzBis: 25,  flag: "normal" },
      { parameter: "Selen",     wert: 0.4, einheit: "mg/kg", referenzVon: 0.5, referenzBis: 1.5, flag: "niedrig" },
      { parameter: "Quecksilber", wert: 0.6, einheit: "mg/kg", referenzVon: 0, referenzBis: 1,   flag: "normal" },
      { parameter: "Blei",      wert: 0.3, einheit: "mg/kg", referenzVon: 0,   referenzBis: 1,   flag: "normal" },
    ],
    freitext: "Mineralstoff-Defizit-Muster: Magnesium, Zink, Selen erniedrigt — passend zu Erschöpfung + leichter Muskelschwäche.",
    labor: "Mineralanalytik Bremen",
  });

  // Gangbild
  s.gang.push({
    id: "gng-seed-001",
    klientId: HR,
    datum: tageVor(7),
    gehgeschwindigkeit: 0.62,
    schrittlaengeRe: 38,
    schrittlaengeLi: 32,
    kadenz: 84,
    doppelstandzeit: 28,
    abweichungen: [
      { typ: "antalgisch", seite: "links", auspraegung: 2 },
      { typ: "kleinschritt", seite: "beidseits", auspraegung: 2 },
    ],
    hilfsmittel: ["rollator"],
    befundtext: "Antalgischer Gang links bei L4/L5-Symptomatik. Verkürzte Standphase links. Sturzrisiko erhöht (Tinetti < 19).",
  });

  // Wirbelsäule
  s.wirbel.push({
    id: "wir-seed-001",
    klientId: HR,
    datum: tageVor(14),
    schaeden: [
      {
        segmente: ["L4", "L5"],
        typ: "bandscheibenvorfall",
        schwere: 3,
        seitenbetonung: "links",
        symptomatik: ["Lumboischialgie L5 links", "Hypästhesie laterale Wade", "Großzehenheberschwäche M4/5"],
        ersterBefund: tageVor(14),
      },
      {
        segmente: ["L3", "L4", "L5"],
        typ: "spondylose",
        schwere: 2,
        ersterBefund: tageVor(28),
      },
      {
        segmente: ["T7", "T8", "T9"],
        typ: "kyphose",
        schwere: 2,
        symptomatik: ["BWS-Hyperkyphose ~52° (Bechterew-Verdacht ausgeschlossen)"],
        ersterBefund: tageVor(180),
      },
    ],
    haltungsanalyse: {
      kyphosewinkelGrad: 52,
      lordosewinkelGrad: 38,
      beckenstand: "links_hoch",
      schulterstand: "rechts_hoch",
    },
    funktionstests: [
      { name: "Lasègue links",         befund: "positiv ab 40°" },
      { name: "Schober",                befund: "10/13 cm (eingeschränkt)" },
      { name: "Finger-Boden-Abstand",   befund: "32 cm" },
    ],
    befundtext: "Mediolateraler Diskusprolaps L4/L5 links mit Wurzelkompression. Sekundäre BWS-Hyperkyphose. Beckenschiefstand mit Schulter-Gegenrotation — Hinweis auf chronisches asymmetrisches Belastungsmuster.",
  });
}
