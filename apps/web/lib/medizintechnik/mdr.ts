// EU-Medizinprodukte-Verordnung MDR 2017/745 (in DE seit 2021 verbindlich).
//
// Ablöse der MDD 93/42/EWG. Kernbestandteile:
//  · CE-Kennzeichnung mit Benannte-Stelle-Nummer
//  · UDI (Unique Device Identifier) als weltweit eindeutiger Barcode
//  · 4 Risikoklassen I, IIa, IIb, III
//  · EUDAMED zentrale EU-Datenbank
//  · PMS (Post-Market Surveillance) verpflichtend
//
// Quellen: VO (EU) 2017/745, BfArM-Vollzugshinweise, EUDAMED-Modul-Status 2024.

export type MdrRisikoKlasse = "I" | "Is" | "Im" | "IIa" | "IIb" | "III";

export type MdrProdukt = {
  id:               string;
  bezeichnung:      string;
  hersteller:       string;
  herstellerLand:   string;
  klasse:           MdrRisikoKlasse;
  udiDi:            string;            // Device Identifier — bleibt fix
  ceNummer?:        string;            // 4-stellig, Benannte Stelle (z.B. 0124 für DEKRA)
  benannteStelle?:  string;
  zertGueltigBis?:  string;            // YYYY-MM-DD
  eudamedReg?:      string;            // SRN-Nummer im EUDAMED
  pmsBerichtFaellig?: string;          // YYYY-MM-DD · jährlich Klasse IIa+, sonst alle 2 J
  feldEinsatz:      string;            // wo läuft das Produkt im Haus
  bemerkung?:       string;
};

export const MDR_KLASSE_LABEL: Record<MdrRisikoKlasse, string> = {
  I:   "Klasse I · niedriges Risiko",
  Is:  "Klasse I steril",
  Im:  "Klasse I messend",
  IIa: "Klasse IIa · mittleres Risiko",
  IIb: "Klasse IIb · höheres mittleres Risiko",
  III: "Klasse III · hohes Risiko · Implantate",
};

export const MDR_KLASSE_FARBE: Record<MdrRisikoKlasse, string> = {
  I:   "var(--thu)",
  Is:  "var(--vibe-stats)",
  Im:  "var(--vibe-stats)",
  IIa: "var(--vibe-team)",
  IIb: "var(--vibe-approval)",
  III: "var(--mon)",
};

export const MDR_PRODUKTE: MdrProdukt[] = [
  {
    id: "mdr-001",
    bezeichnung: "Pflegebett Burmeier Dali Standard",
    hersteller: "Burmeier GmbH",
    herstellerLand: "DE",
    klasse: "I",
    udiDi: "(01)04047841005571",
    ceNummer: "—",
    feldEinsatz: "St. Lukas WB-A · 28 Plätze",
    bemerkung: "Klasse I Eigenkonformitätserklärung · keine Benannte Stelle erforderlich",
  },
  {
    id: "mdr-002",
    bezeichnung: "CPAP-Gerät ResMed AirSense 11",
    hersteller: "ResMed Pty Ltd",
    herstellerLand: "AU/EU-RP",
    klasse: "IIa",
    udiDi: "(01)09419411037420",
    ceNummer: "0123",
    benannteStelle: "TÜV SÜD Product Service",
    zertGueltigBis: "2027-03-31",
    eudamedReg: "DE-CA-MF-000044122",
    pmsBerichtFaellig: "2026-08-01",
    feldEinsatz: "Pulmologie 3B · Wilhelm Brand",
  },
  {
    id: "mdr-003",
    bezeichnung: "Sauerstoff-Konzentrator Inogen One G5",
    hersteller: "Inogen Inc.",
    herstellerLand: "US/EU-RP",
    klasse: "IIa",
    udiDi: "(01)00819220020012",
    ceNummer: "0297",
    benannteStelle: "DQS Med GmbH",
    zertGueltigBis: "2026-11-15",
    eudamedReg: "DE-CA-MF-000088191",
    pmsBerichtFaellig: "2026-12-01",
    feldEinsatz: "Tour Augsburg · Friedrich Lange",
    bemerkung: "Wartung nach 4500 Betriebsstunden überfällig — STK-Termin 2026-05-14",
  },
  {
    id: "mdr-004",
    bezeichnung: "Insulinpumpe Medtronic MiniMed 780G",
    hersteller: "Medtronic MiniMed",
    herstellerLand: "US/EU-RP",
    klasse: "IIb",
    udiDi: "(01)00763000111122",
    ceNummer: "0123",
    benannteStelle: "TÜV SÜD Product Service",
    zertGueltigBis: "2026-09-30",
    eudamedReg: "DE-CA-MF-000077301",
    pmsBerichtFaellig: "2026-06-30",
    feldEinsatz: "Charité Päd. · Jonas Kaltenecker",
    bemerkung: "Software-Update v3.2 verfügbar · Patch-Verteilung mit Endokrinologie",
  },
  {
    id: "mdr-005",
    bezeichnung: "Defibrillator Schiller Fred easyport plus",
    hersteller: "Schiller Medical SAS",
    herstellerLand: "FR",
    klasse: "IIb",
    udiDi: "(01)07640104190208",
    ceNummer: "0459",
    benannteStelle: "GMED",
    zertGueltigBis: "2027-12-15",
    eudamedReg: "FR-CA-MF-000051922",
    pmsBerichtFaellig: "2026-07-15",
    feldEinsatz: "St. Lukas Foyer · AED-Wand",
    bemerkung: "Batterie schwach · Service-Ticket svc-552 läuft",
  },
  {
    id: "mdr-006",
    bezeichnung: "Patientenheber Joey Aktiv-Lifter Hercules",
    hersteller: "Lifting Care Sweden",
    herstellerLand: "SE",
    klasse: "I",
    udiDi: "(01)07350031550017",
    feldEinsatz: "Geriatrie München · 4 Etagen",
    bemerkung: "Akku tauschen · Service-Ticket svc-550",
  },
  {
    id: "mdr-007",
    bezeichnung: "Implantierbarer Schrittmacher Biotronik Edora 8 SR-T",
    hersteller: "Biotronik SE",
    herstellerLand: "DE",
    klasse: "III",
    udiDi: "(01)04047409110821",
    ceNummer: "0344",
    benannteStelle: "DEKRA Certification",
    zertGueltigBis: "2028-04-30",
    eudamedReg: "DE-CA-MF-000022091",
    pmsBerichtFaellig: "2026-04-30",
    feldEinsatz: "Kardio-Konsil · 4 Bewohner unter Telemonitoring",
    bemerkung: "PSUR (Periodic Safety Update Report) eingereicht 2026-04-22",
  },
];

export function produkteNachKlasse(k: MdrRisikoKlasse): MdrProdukt[] {
  return MDR_PRODUKTE.filter((p) => p.klasse === k);
}

export function pmsFaellig(innerhalbTage = 60): MdrProdukt[] {
  const grenze = Date.now() + innerhalbTage * 86400000;
  return MDR_PRODUKTE.filter((p) => p.pmsBerichtFaellig && +new Date(p.pmsBerichtFaellig) <= grenze);
}

export function zertAuslaufend(innerhalbTage = 180): MdrProdukt[] {
  const grenze = Date.now() + innerhalbTage * 86400000;
  return MDR_PRODUKTE.filter((p) => p.zertGueltigBis && +new Date(p.zertGueltigBis) <= grenze);
}
