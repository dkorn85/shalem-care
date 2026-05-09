// Sicherheits- + messtechnische Kontrollen + Vorkommnis-Meldungen.
//
// MPBetreibV (Medizinprodukte-Betreiberverordnung):
//  · § 11 STK · sicherheitstechnische Kontrolle · jährlich oder
//    nach Hersteller-Vorgabe
//  · § 14 MTK · messtechnische Kontrolle · 2-jährig für u.a. Blutdruck,
//    Audiometer, Defibrillatoren-Energieabgabe
//  · Bestandsverzeichnis + Medizinproduktebuch nach § 13/§ 12
//
// Vorkommnis-Meldepflicht nach MPSV / MDR Art. 87 → BfArM in 30 Tagen
// (Tod/schwere Schädigung in 10 Tagen, Beinahe-Vorfall in 30 Tagen).

export type Pruefart = "STK" | "MTK" | "Inspektion" | "Funktionspruefung";
export type PruefStatus = "faellig" | "ueberfaellig" | "geplant" | "erledigt";

export type Pruefung = {
  id:           string;
  produktId:    string;             // Verweis auf MDR_PRODUKTE.id
  produkt:      string;             // denormalisiert für Anzeige
  art:          Pruefart;
  intervallM:   number;             // Monate
  letzte:       string;             // YYYY-MM-DD
  faelligAm:    string;
  status:       PruefStatus;
  pruefer?:     string;
  bericht?:     string;
};

export type VorkommnisSchwere = "beinahe" | "leicht" | "schwer" | "tod";
export type VorkommnisStatus = "offen" | "an-bfarm-gemeldet" | "in-untersuchung" | "abgeschlossen";

export type Vorkommnis = {
  id:           string;
  meldungAm:    string;
  produktId:    string;
  produkt:      string;
  beschreibung: string;
  schwere:      VorkommnisSchwere;
  status:       VorkommnisStatus;
  bfArmRef?:    string;             // BfArM-Aktenzeichen
  herstellerInformiert: boolean;
  fristMeldungBfArm: string;        // YYYY-MM-DD
};

export const PRUEFART_LABEL: Record<Pruefart, string> = {
  STK:               "STK · § 11 MPBetreibV",
  MTK:               "MTK · § 14 MPBetreibV",
  Inspektion:        "Inspektion (Hersteller)",
  Funktionspruefung: "Funktionsprüfung",
};

export const PRUEF_STATUS_FARBE: Record<PruefStatus, string> = {
  faellig:     "var(--vibe-approval)",
  ueberfaellig: "var(--mon)",
  geplant:     "var(--vibe-team)",
  erledigt:    "var(--thu)",
};

export const PRUEFUNGEN: Pruefung[] = [
  {
    id: "pr-001", produktId: "mdr-003", produkt: "Sauerstoff-Konzentrator Inogen One G5",
    art: "STK", intervallM: 12, letzte: "2024-11-04", faelligAm: "2025-11-04",
    status: "ueberfaellig", pruefer: "TÜV Nord Service",
    bericht: "Wartung über 6 Monate offen · Klient Friedrich Lange weiter versorgt — Eskalation nötig",
  },
  {
    id: "pr-002", produktId: "mdr-005", produkt: "Defibrillator Schiller easyport plus",
    art: "MTK", intervallM: 24, letzte: "2024-08-15", faelligAm: "2026-08-15",
    status: "geplant", pruefer: "Schiller Service Frankfurt",
  },
  {
    id: "pr-003", produktId: "mdr-002", produkt: "CPAP ResMed AirSense 11",
    art: "Funktionspruefung", intervallM: 6, letzte: "2025-12-01", faelligAm: "2026-06-01",
    status: "faellig",
    bericht: "Maskendichtigkeit + Schlauchhygiene · Pflege bietet Termin im Hausbesuch",
  },
  {
    id: "pr-004", produktId: "mdr-007", produkt: "Schrittmacher Biotronik Edora 8",
    art: "Inspektion", intervallM: 12, letzte: "2025-10-12", faelligAm: "2026-10-12",
    status: "geplant", pruefer: "Biotronik Home Monitoring",
    bericht: "Telemonitoring kontinuierlich · jährliche Vor-Ort-Inspektion durch Kardio-Service",
  },
  {
    id: "pr-005", produktId: "mdr-006", produkt: "Patientenheber Joey Hercules",
    art: "STK", intervallM: 12, letzte: "2025-04-20", faelligAm: "2026-04-20",
    status: "faellig", pruefer: "MEDsupply Nord-Werkstatt",
    bericht: "Akku-Tausch im selben Termin (Service-Ticket svc-550)",
  },
  {
    id: "pr-006", produktId: "mdr-001", produkt: "Pflegebett Burmeier Dali",
    art: "Funktionspruefung", intervallM: 6, letzte: "2026-02-10", faelligAm: "2026-08-10",
    status: "erledigt", pruefer: "MEDsupply Nord-Werkstatt",
  },
];

export const VORKOMMNISSE: Vorkommnis[] = [
  {
    id: "vk-2026-001",
    meldungAm: "2026-04-28",
    produktId: "mdr-005", produkt: "Defibrillator Schiller easyport plus",
    beschreibung: "Batterie-Warnung deutlich vor angegebener Standzeit · Verfügbarkeit 18 Monate statt 24",
    schwere: "beinahe",
    status: "an-bfarm-gemeldet",
    bfArmRef: "BfArM-MDR-2026-04881",
    herstellerInformiert: true,
    fristMeldungBfArm: "2026-05-28",
  },
  {
    id: "vk-2026-002",
    meldungAm: "2026-04-12",
    produktId: "mdr-003", produkt: "Sauerstoff-Konzentrator Inogen One G5",
    beschreibung: "Akustischer Alarm reagiert verzögert (>15 Sek) bei Sensor-Auslösung im Test",
    schwere: "leicht",
    status: "in-untersuchung",
    bfArmRef: "BfArM-MDR-2026-04209",
    herstellerInformiert: true,
    fristMeldungBfArm: "2026-05-12",
  },
];

export const SCHWERE_FARBE: Record<VorkommnisSchwere, string> = {
  beinahe: "var(--vibe-approval)",
  leicht:  "var(--vibe-stats)",
  schwer:  "var(--mon)",
  tod:     "var(--mon)",
};

export const SCHWERE_LABEL: Record<VorkommnisSchwere, string> = {
  beinahe: "Beinahe-Vorkommnis",
  leicht:  "leicht (vorübergehend)",
  schwer:  "schwer · stationäre Behandlung",
  tod:     "Todesfall",
};

export function pruefungenNachStatus(s: PruefStatus): Pruefung[] {
  return PRUEFUNGEN.filter((p) => p.status === s);
}
