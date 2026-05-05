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

  // ─── Walter Brand (84 J., COPD + Knie-Arthrose + Osteoporose) ──────
  const WB = "klient-wb";

  s.imaging.push({
    id: "img-wb-001",
    klientId: WB,
    modalitaet: "roentgen",
    region: "Thorax",
    datum: tageVor(45),
    ansichten: [
      { projektion: "ap",      bildUrl: "/befunde/demo/thorax-ap.png" },
      { projektion: "lateral", bildUrl: "/befunde/demo/thorax-lateral.png" },
    ],
    befundtext: "Emphysematös überblähter Thorax. Zwerchfelltiefstand. Verstärkte Lungengerüstzeichnung beidseits — vereinbar mit COPD GOLD-Stadium 3. Keine Infiltrate.",
    diagnose: "J44.1",
    radiologe: "Dr. Bernhardt, Radiologie Schöneberg",
  });

  s.imaging.push({
    id: "img-wb-002",
    klientId: WB,
    modalitaet: "mrt",
    region: "Knie rechts",
    datum: tageVor(120),
    ansichten: [
      { projektion: "sagittal", bildUrl: "/befunde/demo/knie-mrt-sag.png" },
      { projektion: "coronar",  bildUrl: "/befunde/demo/knie-mrt-cor.png" },
    ],
    befundtext: "Gonarthrose Stadium III nach Kellgren-Lawrence. Innenmeniskus-Komplexruptur Hinterhorn. Subchondrales Knochenmarködem medialer Femurkondylus. Patellofemoraler Knorpelverschleiß.",
    diagnose: "M17.0",
    radiologe: "Dr. Bernhardt",
  });

  s.imaging.push({
    id: "img-wb-003",
    klientId: WB,
    modalitaet: "ct",
    region: "BWS",
    datum: tageVor(60),
    ansichten: [
      { projektion: "sagittal", bildUrl: "/befunde/demo/bws-ct-sag.png" },
      { projektion: "axial",     bildUrl: "/befunde/demo/bws-ct-ax.png" },
    ],
    befundtext: "Osteoporotische Sinterungsfraktur T12 Wirbelkörper, Höhenminderung 30 %. Keine Hinterkanten-Beteiligung. Multiple Osteoporose-typische Veränderungen BWS/LWS.",
    diagnose: "M80.08",
    radiologe: "Dr. Wendt, Klinikum Steglitz",
  });

  s.labor.push({
    id: "lab-wb-001",
    klientId: WB,
    material: "blut",
    panel: "Großes Blutbild + COPD-Profil",
    datum: tageVor(40),
    werte: [
      { parameter: "Hämoglobin",     loinc: "718-7",   wert: 13.4, einheit: "g/dl",  referenzVon: 13, referenzBis: 17, flag: "normal" },
      { parameter: "Hämatokrit",     loinc: "4544-3",  wert: 42,   einheit: "%",     referenzVon: 40, referenzBis: 52, flag: "normal" },
      { parameter: "Leukozyten",     loinc: "6690-2",  wert: 11.2, einheit: "10⁹/l", referenzVon: 4,  referenzBis: 10, flag: "hoch" },
      { parameter: "CRP",            loinc: "1988-5",  wert: 15.4, einheit: "mg/l",  referenzVon: 0,  referenzBis: 5,  flag: "hoch" },
      { parameter: "AAT (α1-Antitrypsin)", loinc: "1825-1", wert: 0.8, einheit: "g/l", referenzVon: 0.9, referenzBis: 2.0, flag: "niedrig" },
      { parameter: "PaO₂",           loinc: "11556-8", wert: 62,   einheit: "mmHg",  referenzVon: 80, referenzBis: 100, flag: "kritisch_niedrig" },
      { parameter: "PaCO₂",          loinc: "11557-6", wert: 48,   einheit: "mmHg",  referenzVon: 35, referenzBis: 45,  flag: "hoch" },
      { parameter: "25-OH-Vitamin D", loinc: "1989-3", wert: 14,   einheit: "ng/ml", referenzVon: 30, referenzBis: 100, flag: "kritisch_niedrig" },
      { parameter: "Calcium",        loinc: "17861-6", wert: 2.18, einheit: "mmol/l", referenzVon: 2.2, referenzBis: 2.65, flag: "niedrig" },
    ],
    freitext: "COPD mit beginnender respiratorischer Insuffizienz. AAT-Mangel grenzwertig. Vitamin-D-/Calcium-Mangel passend zur Osteoporose. Infektzeichen leichtgradig erhöht.",
    labor: "Labor Berlin Mitte",
  });

  s.gang.push({
    id: "gng-wb-001",
    klientId: WB,
    datum: tageVor(14),
    gehgeschwindigkeit: 0.55,
    schrittlaengeRe: 30,
    schrittlaengeLi: 35,
    kadenz: 78,
    doppelstandzeit: 32,
    abweichungen: [
      { typ: "antalgisch", seite: "rechts", auspraegung: 3 },
      { typ: "kleinschritt", seite: "beidseits", auspraegung: 2 },
    ],
    hilfsmittel: ["unterarmgehstuetzen"],
    befundtext: "Antalgischer Gang rechts bei Gonarthrose. Atemnot-bedingte Pausen alle 30–50 m. Sturzrisiko hoch (Tinetti 14/28).",
  });

  s.wirbel.push({
    id: "wir-wb-001",
    klientId: WB,
    datum: tageVor(60),
    schaeden: [
      { segmente: ["T12"],                  typ: "fraktur",      schwere: 3, symptomatik: ["Lokaler Klopfschmerz", "Beweglichkeit BWS eingeschränkt"], ersterBefund: tageVor(60) },
      { segmente: ["T7","T8","T9","T10","T11","T12","L1","L2"], typ: "osteoporose", schwere: 3, symptomatik: ["Diffuse Knochenschmerzen", "Höhenverlust 4 cm in 5 Jahren"], ersterBefund: tageVor(720) },
      { segmente: ["L3","L4","L5"],         typ: "spondylose",   schwere: 2, ersterBefund: tageVor(540) },
    ],
    haltungsanalyse: {
      kyphosewinkelGrad: 64,
      lordosewinkelGrad: 28,
      beckenstand: "ausgeglichen",
      schulterstand: "rechts_hoch",
    },
    funktionstests: [
      { name: "Schober",            befund: "10/12 cm (deutlich eingeschränkt)" },
      { name: "Finger-Boden-Abstand", befund: "48 cm" },
    ],
    befundtext: "Generalisierte Osteoporose mit T12-Sinterungsfraktur. Hyperkyphose der BWS — typisches Witwen-Bukkel-Bild. Konservatives Management mit Bisphosphonat-Therapie + Vitamin-D-Substitution + Sturzprophylaxe.",
  });

  // ─── Erika Gärtner (81 J., Demenz + Z.n. Schlaganfall) ──────────────
  const EG = "klient-eg";

  s.imaging.push({
    id: "img-eg-001",
    klientId: EG,
    modalitaet: "ct",
    region: "Schädel",
    datum: tageVor(180),
    ansichten: [
      { projektion: "axial",    bildUrl: "/befunde/demo/schaedel-ct-ax.png" },
      { projektion: "coronar",  bildUrl: "/befunde/demo/schaedel-ct-cor.png" },
    ],
    befundtext: "Älterer ischämischer Insult Mediastromgebiet rechts mit territorialer Demarkierung. Ausgeprägte cortikale Atrophie, betont temporal beidseits — vereinbar mit Alzheimer-typischer Atrophie. Periventrikuläre Marklager-Hyperintensitäten (Fazekas 3).",
    diagnose: "I63.4",
    radiologe: "Dr. Wendt",
  });

  s.imaging.push({
    id: "img-eg-002",
    klientId: EG,
    modalitaet: "sono",
    region: "Carotiden",
    datum: tageVor(150),
    ansichten: [
      { projektion: "lateral", bildUrl: "/befunde/demo/carotis-sono-li.png" },
      { projektion: "lateral", bildUrl: "/befunde/demo/carotis-sono-re.png" },
    ],
    befundtext: "ACI rechts: 50 % Stenose mit weichen Plaques. ACI links: 30 %. ACE bds. unauffällig. Doppler-Profile mit altersentsprechender Pulsatilität.",
    diagnose: "I65.2",
    radiologe: "Dr. Hartmann (Praxis Ultraschall)",
  });

  s.labor.push({
    id: "lab-eg-001",
    klientId: EG,
    material: "blut",
    panel: "Demenz-Diagnostik + Schlaganfall-Sekundärprophylaxe",
    datum: tageVor(60),
    werte: [
      { parameter: "Hämoglobin",     loinc: "718-7",  wert: 11.2, einheit: "g/dl",  referenzVon: 12, referenzBis: 16, flag: "niedrig" },
      { parameter: "TSH",             loinc: "3016-3", wert: 4.8, einheit: "mU/l",  referenzVon: 0.4, referenzBis: 4.0, flag: "hoch" },
      { parameter: "Vitamin B12",     loinc: "2132-9", wert: 198, einheit: "pg/ml", referenzVon: 200, referenzBis: 950, flag: "niedrig" },
      { parameter: "Folsäure",        loinc: "2284-8", wert: 5.2, einheit: "ng/ml", referenzVon: 4.6, referenzBis: 18.7, flag: "normal" },
      { parameter: "Homocystein",     loinc: "13965-9", wert: 18.4, einheit: "µmol/l", referenzVon: 5, referenzBis: 12, flag: "hoch" },
      { parameter: "INR",             loinc: "6301-6", wert: 2.4, einheit: "",      referenzVon: 2,  referenzBis: 3,  flag: "normal" },
      { parameter: "LDL-Cholesterin", loinc: "13457-7", wert: 78,  einheit: "mg/dl", referenzVon: 0, referenzBis: 100, flag: "normal" },
    ],
    freitext: "Latente Hypothyreose, Vit-B12-Mangel kann Demenzsymptomatik verstärken. INR im Zielbereich (Marcumar). Sekundärprophylaxe Schlaganfall greift.",
    labor: "Labor Berlin Mitte",
  });

  s.gang.push({
    id: "gng-eg-001",
    klientId: EG,
    datum: tageVor(20),
    gehgeschwindigkeit: 0.42,
    schrittlaengeRe: 28,
    schrittlaengeLi: 22,
    kadenz: 72,
    doppelstandzeit: 38,
    abweichungen: [
      { typ: "hinken_hueft", seite: "links", auspraegung: 2 },
      { typ: "kleinschritt", seite: "beidseits", auspraegung: 3 },
      { typ: "ataktisch",     seite: "beidseits", auspraegung: 1 },
    ],
    hilfsmittel: ["rollator"],
    befundtext: "Frontalbetonter Gang mit Hemiparese-Resten links nach Schlaganfall. Sehr kleinschrittig — typisch für vaskuläre Demenz-Komponente. Sturzrisiko hoch (Tinetti 11/28).",
  });

  // ─── Rüdiger Kempf (Z.n. Schlaganfall, Bobath, HWS-Spondylolisthese) ──
  const RK = "klient-rk";

  s.imaging.push({
    id: "img-rk-001",
    klientId: RK,
    modalitaet: "mrt",
    region: "Schädel",
    datum: tageVor(75),
    ansichten: [
      { projektion: "axial",    bildUrl: "/befunde/demo/schaedel-mrt-ax.png" },
      { projektion: "sagittal", bildUrl: "/befunde/demo/schaedel-mrt-sag.png" },
    ],
    befundtext: "Z.n. lakunärem Insult Capsula-interna rechts (älter). Pyramidenbahn-Faser-Schädigung im Verlauf. Keine frische Diffusionsrestriktion. Keine Mikroblutungen.",
    diagnose: "I69.4",
    radiologe: "Dr. Wendt",
  });

  s.imaging.push({
    id: "img-rk-002",
    klientId: RK,
    modalitaet: "mrt",
    region: "HWS",
    datum: tageVor(45),
    ansichten: [
      { projektion: "sagittal",    bildUrl: "/befunde/demo/hws-mrt-sag.png" },
      { projektion: "transversal", bildUrl: "/befunde/demo/hws-mrt-ax.png" },
    ],
    befundtext: "Spondylolisthese C5/C6 Grad I (Meyerding). Mittelgradige Spinalkanalstenose mit Myelomalazie-Beginn. Keine Wurzelkompression aktuell.",
    diagnose: "M43.13",
    radiologe: "Dr. Bernhardt",
  });

  s.gang.push({
    id: "gng-rk-001",
    klientId: RK,
    datum: tageVor(10),
    gehgeschwindigkeit: 0.68,
    schrittlaengeRe: 42,
    schrittlaengeLi: 28,
    kadenz: 86,
    doppelstandzeit: 26,
    abweichungen: [
      { typ: "spastisch", seite: "links", auspraegung: 2 },
      { typ: "scherengang", seite: "beidseits", auspraegung: 1 },
    ],
    hilfsmittel: ["unterarmgehstuetzen", "orthese"],
    befundtext: "Spastisch-paretischer Gang links. Bobath-Therapie-Fortschritt sichtbar (Schrittlängen-Asymmetrie 14 cm, vor 6 Monaten 22 cm). Peroneus-Orthese links unverzichtbar.",
  });

  s.wirbel.push({
    id: "wir-rk-001",
    klientId: RK,
    datum: tageVor(45),
    schaeden: [
      { segmente: ["C5","C6"],         typ: "spondylolisthese", schwere: 2, seitenbetonung: "median", symptomatik: ["Diskrete Hand-Feinmotorik-Störung", "Gangunsicherheit"], ersterBefund: tageVor(45) },
      { segmente: ["C5","C6","C7"],    typ: "spinalkanalstenose", schwere: 2, ersterBefund: tageVor(45) },
      { segmente: ["C6"],               typ: "myelopathie", schwere: 1, symptomatik: ["Beginnende Myelomalazie"], ersterBefund: tageVor(45) },
    ],
    haltungsanalyse: {
      lordosewinkelGrad: 18,
      kyphosewinkelGrad: 36,
      beckenstand: "links_hoch",
      schulterstand: "links_hoch",
    },
    funktionstests: [
      { name: "Lhermitte-Zeichen",  befund: "positiv" },
      { name: "Hoffmann-Reflex li.", befund: "positiv" },
      { name: "Romberg",             befund: "leichtes Schwanken" },
    ],
    befundtext: "Zervikale Myelopathie bei Spondylolisthese C5/C6. Konservatives Management mit Halskrause + Physio. OP-Indikation bei Verschlechterung diskutiert.",
  });

  // ─── Inge Müller (Bandscheibenvorfall L5/S1, KGG-Therapie) ────────────
  const IM = "klient-im";

  s.imaging.push({
    id: "img-im-001",
    klientId: IM,
    modalitaet: "mrt",
    region: "LWS",
    datum: tageVor(28),
    ansichten: [
      { projektion: "sagittal",    bildUrl: "/befunde/demo/lws-mrt-sag-im.png" },
      { projektion: "transversal", bildUrl: "/befunde/demo/lws-mrt-ax-im.png" },
    ],
    befundtext: "Mediolateraler Bandscheibenvorfall L5/S1 rechts mit Tangierung der S1-Wurzel. Keine Sequestration. Diskrete Spondylose L4/L5.",
    diagnose: "M51.16",
    radiologe: "Dr. Bernhardt",
  });

  s.labor.push({
    id: "lab-im-001",
    klientId: IM,
    material: "blut",
    panel: "Routine + Entzündungsmarker",
    datum: tageVor(21),
    werte: [
      { parameter: "Hämoglobin",     wert: 13.8, einheit: "g/dl",  referenzVon: 12, referenzBis: 16, flag: "normal" },
      { parameter: "CRP",             wert: 2.1, einheit: "mg/l",  referenzVon: 0, referenzBis: 5,   flag: "normal" },
      { parameter: "Kreatinin",       wert: 0.9, einheit: "mg/dl", referenzVon: 0.5, referenzBis: 1.0, flag: "normal" },
      { parameter: "Vitamin D 25-OH", wert: 26,  einheit: "ng/ml", referenzVon: 30, referenzBis: 100, flag: "niedrig" },
      { parameter: "Magnesium",       wert: 0.74, einheit: "mmol/l", referenzVon: 0.75, referenzBis: 1.05, flag: "niedrig" },
    ],
    freitext: "Allgemein unauffällig · grenzwertige Vit-D- und Magnesium-Werte (passend zu Muskelverspannungen).",
    labor: "Labor Berlin Mitte",
  });

  s.gang.push({
    id: "gng-im-001",
    klientId: IM,
    datum: tageVor(14),
    gehgeschwindigkeit: 0.95,
    schrittlaengeRe: 52,
    schrittlaengeLi: 58,
    kadenz: 102,
    doppelstandzeit: 22,
    abweichungen: [
      { typ: "antalgisch", seite: "rechts", auspraegung: 2 },
    ],
    hilfsmittel: ["ohne"],
    befundtext: "Diskret antalgisches Gangbild rechts bei L5/S1-Symptomatik. Geschwindigkeit altersnorm. KGG zeigt klare Verbesserung.",
  });

  s.wirbel.push({
    id: "wir-im-001",
    klientId: IM,
    datum: tageVor(28),
    schaeden: [
      { segmente: ["L5","S1"],         typ: "bandscheibenvorfall", schwere: 2, seitenbetonung: "rechts", symptomatik: ["Lumboischialgie S1 rechts", "Hypästhesie laterale Fußkante", "Plantarflexor-Kraft 4/5"], ersterBefund: tageVor(28) },
      { segmente: ["L4","L5"],         typ: "spondylose",         schwere: 1, ersterBefund: tageVor(180) },
      { segmente: ["L4","L5","S1"],    typ: "muskelhartspann",    schwere: 2, seitenbetonung: "rechts", symptomatik: ["Druckschmerz paravertebral"], ersterBefund: tageVor(28) },
    ],
    haltungsanalyse: {
      lordosewinkelGrad: 42,
      kyphosewinkelGrad: 38,
      beckenstand: "rechts_hoch",
      schulterstand: "ausgeglichen",
    },
    funktionstests: [
      { name: "Lasègue rechts",       befund: "positiv ab 50°" },
      { name: "Schober",                befund: "10/14 cm" },
      { name: "Finger-Boden-Abstand",   befund: "18 cm" },
    ],
    befundtext: "Mediolateraler Diskusprolaps L5/S1 rechts mit Tangierung S1. Konservative Therapie greift gut: KGG + Manuelle Therapie + Stabilisationsprogramm.",
  });

  // ─── Friedrich Lange (Z.n. Schlaganfall, BTHG-Teilhabe, Wiedereingliederung) ──
  const FL = "klient-fl";

  s.imaging.push({
    id: "img-fl-001",
    klientId: FL,
    modalitaet: "mrt",
    region: "Schädel",
    datum: tageVor(180),
    ansichten: [
      { projektion: "axial",    bildUrl: "/befunde/demo/schaedel-mrt-ax-fl.png" },
      { projektion: "coronar",  bildUrl: "/befunde/demo/schaedel-mrt-cor-fl.png" },
    ],
    befundtext: "Z.n. ausgedehntem Mediainfarkt rechts mit zystischer Defektheilung. Wallersche Degeneration der Pyramidenbahn. Restitution funktionell partiell.",
    diagnose: "I63.0",
    radiologe: "Dr. Wendt",
  });

  s.labor.push({
    id: "lab-fl-001",
    klientId: FL,
    material: "blut",
    panel: "Schlaganfall-Sekundärprophylaxe",
    datum: tageVor(30),
    werte: [
      { parameter: "Hämoglobin",     wert: 14.2, einheit: "g/dl",  referenzVon: 13, referenzBis: 17, flag: "normal" },
      { parameter: "INR",             wert: 2.6, einheit: "",      referenzVon: 2,  referenzBis: 3,  flag: "normal" },
      { parameter: "HbA1c",           wert: 6.1, einheit: "%",     referenzVon: 4,  referenzBis: 5.7, flag: "hoch" },
      { parameter: "LDL-Cholesterin", wert: 92,  einheit: "mg/dl", referenzVon: 0, referenzBis: 100, flag: "normal" },
      { parameter: "RR systolisch",   wert: 138, einheit: "mmHg",  referenzVon: 90, referenzBis: 140, flag: "normal" },
      { parameter: "Vitamin D 25-OH", wert: 22,  einheit: "ng/ml", referenzVon: 30, referenzBis: 100, flag: "niedrig" },
    ],
    freitext: "Sekundärprophylaxe greift. Blutzucker-Grenzbereich. Vit-D-Mangel.",
    labor: "Labor Berlin Mitte",
  });

  s.gang.push({
    id: "gng-fl-001",
    klientId: FL,
    datum: tageVor(7),
    gehgeschwindigkeit: 0.78,
    schrittlaengeRe: 48,
    schrittlaengeLi: 36,
    kadenz: 92,
    doppelstandzeit: 25,
    abweichungen: [
      { typ: "spastisch", seite: "links", auspraegung: 2 },
      { typ: "stepper",    seite: "links", auspraegung: 2 },
    ],
    hilfsmittel: ["orthese"],
    befundtext: "Spastische Hemiparese links mit Steppergang (Fußheber-Schwäche). Peroneus-Schiene unterstützt. Gangtempo deutlich verbessert seit Bobath-Beginn.",
  });
}
