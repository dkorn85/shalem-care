// Partner-Store · externe Brand-Partner als Bridge zwischen Zeitarbeits-
// firmen und der Genossenschaft.
//
// Use-Case: Eine bestehende Zeitarbeitsfirma (z.B. pk-ruhr.de in Bochum)
// hat 50+ Pflegekräfte und 12+ Klinik-/Heim-Verträge. Statt sie in den
// Wettbewerb zu drängen, holen wir sie als "Brücke" rein:
//
//   1. Ihre Pflegekräfte erscheinen im Genossenschafts-Pool
//   2. Ihre Stelle-Bedarfe erscheinen für Mitglieder
//   3. Pro vermitteltem Einsatz fließt ein Multiplier-Cut (1.5%) zurück
//   4. Pflegekräfte können freiwillig zur eG-Mitgliedschaft konvertieren
//   5. Über 24 Monate konvergiert das Geschäftsmodell schrittweise
//
// Phase 2: API-Anbindung an pk-ruhr-Backoffice via FHIR-Schedule + Slot.
// Heute: realistisch wirkende Demo-Daten.

export type PartnerStatus = "interessiert" | "demo" | "vertrag-läuft" | "voll-mitglied";

export type PartnerFirma = {
  id: string;
  name: string;
  shortName: string;
  /** Logo-Pfad (Phase-2 echtes Logo) */
  logoUrl?: string;
  rechtsform: "GmbH" | "UG" | "GbR" | "GmbH & Co. KG" | "eG";
  domain: string;
  region: string;
  gruendung: number;
  status: PartnerStatus;
  /** Anzahl angestellter Pflegekräfte */
  pflegekraefte: number;
  /** Anzahl Vertrags-Einrichtungen */
  einrichtungen: number;
  /** Stundensatz-Range an Einrichtung (€/h, brutto) */
  stundensatzRange: { min: number; max: number };
  /** Anteil der Pflegekraft am Stundensatz (heute) */
  pflegekraftAnteilPct: number;
  /** Vermittlungs-Marge der Firma */
  margePct: number;
  /** Multiplier-Brücke-Cut (was an Shalem fließt pro Vermittlung) */
  multiplierCutPct: number;
  /** Onboarding-Datum bei Shalem */
  partnerSeit: string;
  /** Telefon + Mail für PDL-Kontakt */
  kontaktName?: string;
  kontaktTel?: string;
  kontaktMail?: string;
  /** Geschäftsbeschreibung */
  beschreibung: string;
  /** Konvertierungs-Statistik: wie viele Pflegekräfte sind schon eG-Mitglied geworden */
  konvertiert: number;
  /** Aktuelles Brücken-Volumen pro Monat (€) */
  bridgeVolumeMonthEur: number;
};

// Demo-Daten: pk-ruhr.de als realer öffentlich angebotener Partner
// (Pflegekräfte Ruhr GmbH · Bochum · pk-ruhr.de)
const PARTNERS: PartnerFirma[] = [
  {
    id: "pk-ruhr",
    name: "Pflegekräfte Ruhr GmbH",
    shortName: "PK-Ruhr",
    domain: "pk-ruhr.de",
    rechtsform: "GmbH",
    region: "Ruhrgebiet · Bochum / Essen / Dortmund",
    gruendung: 2014,
    status: "demo",
    pflegekraefte: 58,
    einrichtungen: 14,
    stundensatzRange: { min: 28, max: 42 },
    pflegekraftAnteilPct: 56,
    margePct: 38,
    multiplierCutPct: 1.5,
    partnerSeit: "2026-04-15",
    kontaktName: "Geschäftsleitung · Demo-Kontakt",
    kontaktTel: "—",
    kontaktMail: "info@pk-ruhr.de",
    beschreibung:
      "Etablierte regionale Zeitarbeitsfirma im Ruhrgebiet seit 2014. 58 Pflegefachkräfte, 14 Vertrags-Einrichtungen. Klassisches Modell: Pflegekraft fest angestellt bei PK-Ruhr, wird stunden-/tageweise an Krankenhäuser/Heime verliehen. Übliche Marge 35-40%.",
    konvertiert: 9,
    bridgeVolumeMonthEur: 248_500,
  },
  {
    id: "pflege-plus-leverkusen",
    name: "Pflege+ Leverkusen",
    shortName: "Pflege+ LEV",
    domain: "pflege-plus-lev.de",
    rechtsform: "UG",
    region: "Köln / Leverkusen",
    gruendung: 2019,
    status: "interessiert",
    pflegekraefte: 22,
    einrichtungen: 6,
    stundensatzRange: { min: 26, max: 38 },
    pflegekraftAnteilPct: 60,
    margePct: 32,
    multiplierCutPct: 1.5,
    partnerSeit: "2026-04-30",
    beschreibung:
      "Junge UG, eher mit Festanstellungs-Schwerpunkt. 22 Pflegekräfte, 6 Einrichtungen. Hat über LinkedIn-Kontakt Interesse signalisiert.",
    konvertiert: 0,
    bridgeVolumeMonthEur: 0,
  },
  {
    id: "scharrer-augsburg",
    name: "Scharrer Pflegevermittlung",
    shortName: "Scharrer AUG",
    domain: "scharrer-aug.de",
    rechtsform: "GmbH & Co. KG",
    region: "Augsburg / München",
    gruendung: 2009,
    status: "vertrag-läuft",
    pflegekraefte: 134,
    einrichtungen: 41,
    stundensatzRange: { min: 30, max: 48 },
    pflegekraftAnteilPct: 52,
    margePct: 41,
    multiplierCutPct: 1.5,
    partnerSeit: "2026-03-08",
    beschreibung:
      "Größerer Player, 134 Pflegekräfte, 41 Einrichtungen. Hat Pilot-Vertrag mit Shalem über 6 Monate für 30 ausgewählte Pflegekräfte gestartet.",
    konvertiert: 4,
    bridgeVolumeMonthEur: 612_300,
  },
];

export function listPartners(): PartnerFirma[] {
  return PARTNERS;
}

export function getPartner(id: string): PartnerFirma | null {
  return PARTNERS.find((p) => p.id === id) ?? null;
}

// ─── Multiplier-Brücke Berechnung ────────────────────────────────

/**
 * Berechnet, wie viel pro Brücken-Schicht an wen fließt.
 *
 * Beispiel pk-ruhr-Schicht über Shalem-Pool vermittelt:
 *   Einrichtung zahlt 35€/h × 8h = 280€
 *   Pflegekraft (PK-Ruhr-Angestellte) bekommt 56% = 156.80€
 *   PK-Ruhr-Marge 38% = 106.40€  (statt vorher 42%)
 *   Multiplier-Cut Shalem 4% = 11.20€  (davon 1.5% Operations, 2.5% in Genossenschafts-Solidartopf)
 *   Pflegekraft hat zudem Option auf Genossenschafts-Anteil 87€/Monat als Mitglied
 */
export type SchichtVerteilung = {
  schichtBrutto: number;
  pflegekraft: number;
  partnerFirma: number;
  shalemMultiplier: number;
  shalemSolidartopf: number;
  einsatzdauer_h: number;
  stundensatz: number;
};

export function berechneVerteilung(
  partnerId: string,
  stundensatz: number,
  einsatzdauer_h: number,
): SchichtVerteilung | null {
  const p = getPartner(partnerId);
  if (!p) return null;
  const brutto = stundensatz * einsatzdauer_h;
  const pflegekraft = (brutto * p.pflegekraftAnteilPct) / 100;
  const partnerFirma = (brutto * (p.margePct - p.multiplierCutPct - 2.5)) / 100;
  const shalemMultiplier = (brutto * p.multiplierCutPct) / 100;
  const shalemSolidartopf = (brutto * 2.5) / 100;
  return {
    schichtBrutto: brutto,
    pflegekraft,
    partnerFirma,
    shalemMultiplier,
    shalemSolidartopf,
    einsatzdauer_h,
    stundensatz,
  };
}

// ─── Konvertierungs-Workflow ─────────────────────────────────────

export type KonvertSchritt = {
  id: number;
  titel: string;
  beschreibung: string;
  dauer: string;
  status: "geplant" | "läuft" | "erledigt";
};

export const KONVERT_SCHRITTE: KonvertSchritt[] = [
  {
    id: 1,
    titel: "Demo-Setup · Sandbox",
    beschreibung: "Pflegekräfte-Daten anonymisiert in Shalem-Sandbox importieren · 3 Test-Pflegekräfte schalten Shalem-Account frei",
    dauer: "1 Woche",
    status: "erledigt",
  },
  {
    id: 2,
    titel: "Brücken-Vertrag",
    beschreibung: "Multiplier-Vertrag mit 4% Cut fix · Pflegekräfte bleiben angestellt bei Partner-Firma · Schichten laufen über Shalem-Pool",
    dauer: "2-4 Wochen",
    status: "läuft",
  },
  {
    id: 3,
    titel: "Soft-Launch · 10 Pflegekräfte",
    beschreibung: "10 ausgewählte Pflegekräfte testen Shalem als parallele Plattform · Doppel-Account zugelassen · Feedback alle 2 Wochen",
    dauer: "8 Wochen",
    status: "geplant",
  },
  {
    id: 4,
    titel: "Eingangs-Tor zur eG",
    beschreibung: "Erste Pflegekräfte konvertieren freiwillig zur eG-Mitgliedschaft · 87€/Monat Anteil · Shalem-Pflegekräfte erhalten Festanstellung über die Genossenschaft",
    dauer: "12-24 Wochen",
    status: "geplant",
  },
  {
    id: 5,
    titel: "Volle Migration · Kooperations-Vertrag",
    beschreibung: "Partner-Firma wird offizieller Genossenschafts-Co-Kooperator · Übernahme der Vermittlung über Shalem · Partner behält Kunden-Beziehungen",
    dauer: "24+ Monate",
    status: "geplant",
  },
];

// ─── Aggregierte KPIs für /trading ────────────────────────────────

export function tradingKpis() {
  const partners = listPartners();
  return {
    partnerAktiv: partners.filter((p) => p.status === "demo" || p.status === "vertrag-läuft" || p.status === "voll-mitglied").length,
    pflegekraefteImBrueckensystem: partners.reduce((s, p) => s + p.pflegekraefte, 0),
    einrichtungenAngebunden: partners.reduce((s, p) => s + p.einrichtungen, 0),
    konvertiertGesamt: partners.reduce((s, p) => s + p.konvertiert, 0),
    monatsVolumenEur: partners.reduce((s, p) => s + p.bridgeVolumeMonthEur, 0),
    multiplierEinnahmeMonatEur: partners.reduce(
      (s, p) => s + Math.round(p.bridgeVolumeMonthEur * (p.multiplierCutPct / 100)),
      0,
    ),
    solidartopfMonatEur: partners.reduce((s, p) => s + Math.round(p.bridgeVolumeMonthEur * 0.025), 0),
  };
}
