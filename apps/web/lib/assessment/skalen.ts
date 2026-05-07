// Pflege-Assessment-Skalen · Berechnungs-Logik für die DNQP-relevanten
// Standard-Tools. Ein Stelle für alle Risiko-Klassifikationen — verhindert
// Drift zwischen Pflege-Cockpit, Klient-Akte und Quartalsbericht.
//
// Quellen:
//   Braden BJ, Bergstrom N. 1987 — Braden-Skala (Dekubitus-Risiko)
//   Bourgault, Morrison, Gillies 2011 — NRS Schmerz
//   Guigoz, Vellas, Garry 1996 — MNA Mini Nutritional Assessment
//   Tinetti ME 1986 — Tinetti Performance-Oriented Mobility Assessment

// ─── Braden-Skala · Dekubitusprophylaxe ──────────────────────────
// 6 Subskalen × 1-4 Punkte (Reibung 1-3) = 6 bis 23 Punkte gesamt.
// Niedrige Punktzahl = höheres Risiko.

export type BradenInput = {
  /** Sensorisches Empfinden 1-4 */
  empfinden: 1 | 2 | 3 | 4;
  /** Hautfeuchtigkeit 1-4 */
  feuchtigkeit: 1 | 2 | 3 | 4;
  /** Aktivität 1-4 */
  aktivitaet: 1 | 2 | 3 | 4;
  /** Mobilität 1-4 */
  mobilitaet: 1 | 2 | 3 | 4;
  /** Ernährung 1-4 */
  ernaehrung: 1 | 2 | 3 | 4;
  /** Reibung + Scherkräfte 1-3 */
  reibung: 1 | 2 | 3;
};

export type BradenErgebnis = {
  punkte: number;
  klasse: "kein-risiko" | "gering" | "mittel" | "hoch" | "sehr-hoch";
  klasseLabel: string;
  empfehlungen: string[];
  /** Frequenz der Re-Beurteilung */
  reBeurteilung: string;
};

export const BRADEN_LABEL = {
  empfinden: ["1 fehlt", "2 stark eingeschränkt", "3 leicht eingeschränkt", "4 vorhanden"],
  feuchtigkeit: ["1 ständig feucht", "2 oft feucht", "3 gelegentlich feucht", "4 selten feucht"],
  aktivitaet: ["1 bettlägerig", "2 sitzt auf", "3 geht gelegentlich", "4 geht regelmäßig"],
  mobilitaet: ["1 immobil", "2 stark eingeschränkt", "3 wenig eingeschränkt", "4 mobil"],
  ernaehrung: ["1 sehr schlecht", "2 unzureichend", "3 angemessen", "4 ausgezeichnet"],
  reibung: ["1 problematisch", "2 potentiell problematisch", "3 kein Problem"],
} as const;

export function berechneBraden(b: BradenInput): BradenErgebnis {
  const punkte = b.empfinden + b.feuchtigkeit + b.aktivitaet + b.mobilitaet + b.ernaehrung + b.reibung;
  let klasse: BradenErgebnis["klasse"];
  let klasseLabel: string;
  let empfehlungen: string[];
  let reBeurteilung: string;

  if (punkte >= 19) {
    klasse = "kein-risiko";
    klasseLabel = "Kein Risiko";
    empfehlungen = ["Routine-Pflege ausreichend", "Hautstatus 1× täglich"];
    reBeurteilung = "alle 14 Tage";
  } else if (punkte >= 15) {
    klasse = "gering";
    klasseLabel = "Geringes Risiko";
    empfehlungen = [
      "Hautstatus 1× pro Schicht",
      "Mobilisations-Plan abstimmen",
      "Druck-Verteilung bei Sitzen ≥ 2 h",
    ];
    reBeurteilung = "alle 7 Tage";
  } else if (punkte >= 13) {
    klasse = "mittel";
    klasseLabel = "Mittleres Risiko";
    empfehlungen = [
      "Hautstatus 2× pro Schicht",
      "Mikro-Lagerung alle 2-3 h",
      "Druckverteilende Matratze",
      "Ernährungs-Konsil bei BMI < 22",
    ];
    reBeurteilung = "alle 3 Tage";
  } else if (punkte >= 10) {
    klasse = "hoch";
    klasseLabel = "Hohes Risiko";
    empfehlungen = [
      "Hautstatus jede Schicht",
      "Lagerung alle 2 h streng nach Plan",
      "Wechseldruck-Matratze (z.B. Therion)",
      "Ernährungs-Konsil + Trinkprotokoll",
      "Reibungs-Risiko durch Hilfsmittel reduzieren",
    ];
    reBeurteilung = "täglich";
  } else {
    klasse = "sehr-hoch";
    klasseLabel = "Sehr hohes Risiko";
    empfehlungen = [
      "Pflege-Visite ärztlich + Wundmanager:in einbinden",
      "Lagerung alle 1.5 h",
      "Wechseldruck-Matratze (Vario-Druck)",
      "Komplette Druckumverteilung Sitzen + Liegen",
      "Tägliches Ernährungs-Audit",
      "Foto-Dokumentation aller Risikostellen",
    ];
    reBeurteilung = "täglich · bei Veränderung sofort";
  }

  return { punkte, klasse, klasseLabel, empfehlungen, reBeurteilung };
}

// ─── NRS · Numerische Rating Scale Schmerz ────────────────────────
// 0-10 (0 kein Schmerz, 10 stärkster vorstellbarer Schmerz).

export type NrsErgebnis = {
  punkte: number;
  klasse: "kein" | "leicht" | "mittel" | "stark" | "sehr-stark";
  klasseLabel: string;
  empfehlungen: string[];
  /** Frequenz der Verlaufs-Erfassung */
  reBeurteilung: string;
  /** Soll Bedarfsmedikation angeboten werden */
  bedarfsMedi: boolean;
};

export function berechneNrs(p: number): NrsErgebnis {
  const punkte = Math.max(0, Math.min(10, Math.round(p)));
  if (punkte === 0) {
    return {
      punkte,
      klasse: "kein",
      klasseLabel: "Kein Schmerz",
      empfehlungen: ["Re-Erfassung bei Veränderung"],
      reBeurteilung: "alle 24 h",
      bedarfsMedi: false,
    };
  }
  if (punkte <= 3) {
    return {
      punkte,
      klasse: "leicht",
      klasseLabel: "Leichter Schmerz",
      empfehlungen: ["Nicht-medikamentöse Maßnahmen anbieten (Lagerung, Wärme/Kälte, Ablenkung)", "Verlauf dokumentieren"],
      reBeurteilung: "1× pro Schicht",
      bedarfsMedi: false,
    };
  }
  if (punkte <= 6) {
    return {
      punkte,
      klasse: "mittel",
      klasseLabel: "Mittlerer Schmerz",
      empfehlungen: ["Bedarfsmedikation laut Verordnung", "Wirkungs-Kontrolle binnen 60 min", "Nicht-medikamentöse Maßnahmen kombinieren"],
      reBeurteilung: "alle 4 h, post-Medi nach 60 min",
      bedarfsMedi: true,
    };
  }
  if (punkte <= 8) {
    return {
      punkte,
      klasse: "stark",
      klasseLabel: "Starker Schmerz",
      empfehlungen: ["Bedarfsmedikation sofort", "Arzt-Kontakt — ggf. Therapie-Anpassung", "Ursache klären (Wunde? Frischer Befund?)"],
      reBeurteilung: "alle 2 h, post-Medi nach 30 + 60 min",
      bedarfsMedi: true,
    };
  }
  return {
    punkte,
    klasse: "sehr-stark",
    klasseLabel: "Sehr starker Schmerz · Notfall",
    empfehlungen: [
      "Sofort Arzt rufen",
      "Bedarfsmedikation parallel verabreichen",
      "Klient nicht alleine lassen",
      "Vital-Parameter erfassen (Puls, RR, Atmung)",
      "Schmerz-Ursache strukturiert klären",
    ],
    reBeurteilung: "alle 30 min bis Schmerz < 5",
    bedarfsMedi: true,
  };
}

// ─── MNA-SF · Mini Nutritional Assessment Short-Form ─────────────
// 6 Items, 0-14 Punkte. < 11 = Risiko, < 8 = Mangelernährung.

export type MnaInput = {
  /** Nahrungsaufnahme 0-2 (0 stark, 1 mäßig, 2 normal vermindert) */
  nahrungsaufnahme: 0 | 1 | 2;
  /** Gewichtsverlust 3 Monate · 0-3 (0 > 3 kg, 1 unbekannt, 2 1-3 kg, 3 keiner) */
  gewichtsverlust: 0 | 1 | 2 | 3;
  /** Mobilität 0-2 (0 bettlägerig, 1 mit Hilfe auf, 2 mobil) */
  mobilitaet: 0 | 1 | 2;
  /** Akute Krankheit/Stress · 0/2 (0 ja, 2 nein) */
  akutKrank: 0 | 2;
  /** Demenz/Depression · 0-2 (0 schwer, 1 leicht, 2 keine) */
  psyche: 0 | 1 | 2;
  /** BMI · 0-3 (0 < 19, 1 19-21, 2 21-23, 3 > 23) — alternativ Wadenumfang */
  bmiOderWade: 0 | 1 | 2 | 3;
};

export type MnaErgebnis = {
  punkte: number;
  klasse: "normal" | "risiko" | "mangelernaehrt";
  klasseLabel: string;
  empfehlungen: string[];
  reBeurteilung: string;
};

export function berechneMna(m: MnaInput): MnaErgebnis {
  const punkte =
    m.nahrungsaufnahme +
    m.gewichtsverlust +
    m.mobilitaet +
    m.akutKrank +
    m.psyche +
    m.bmiOderWade;
  if (punkte >= 12) {
    return {
      punkte,
      klasse: "normal",
      klasseLabel: "Normaler Ernährungs-Status",
      empfehlungen: ["Regelmäßige Re-Erfassung im Routine-Intervall"],
      reBeurteilung: "alle 90 Tage",
    };
  }
  if (punkte >= 8) {
    return {
      punkte,
      klasse: "risiko",
      klasseLabel: "Risiko für Mangelernährung",
      empfehlungen: [
        "Trinkprotokoll starten · Ziel ≥ 1.5 L/Tag",
        "Speiseplan-Anpassung mit Hauswirtschaft + Lebensmittel-Lieferant",
        "Kleine Portionen, energiereich",
        "Wöchentliches Wiegen",
      ],
      reBeurteilung: "alle 4 Wochen",
    };
  }
  return {
    punkte,
    klasse: "mangelernaehrt",
    klasseLabel: "Mangelernährung",
    empfehlungen: [
      "Hausarzt-Konsil + Ernährungsberatung",
      "Trinknahrung verordnungspflichtig (z.B. Fresubin, Ensure)",
      "Tägliches Wiegen + Trinkprotokoll",
      "Bei Dysphagie: Logopädie-Konsil",
      "Lebensmittel-Lieferant: spezialisierte Schluckkost / Demenz-Fingerfood",
    ],
    reBeurteilung: "alle 14 Tage",
  };
}

// ─── Tinetti · Performance Oriented Mobility Assessment ──────────
// 16 Items, 0-28 Punkte. Niedriger = höheres Sturzrisiko.
// Vereinfacht hier: 5 Schlüssel-Items, 0-2 Punkte je → 0-10 Punkte.
// Bei < 7 Punkten → hohes Sturzrisiko.

export type TinettiInput = {
  /** Aufstehen aus dem Stuhl 0-2 */
  aufstehen: 0 | 1 | 2;
  /** Stehgleichgewicht (geschlossene Augen 5 Sek) 0-2 */
  stehen: 0 | 1 | 2;
  /** Gangbild (Schrittlänge + Symmetrie) 0-2 */
  gang: 0 | 1 | 2;
  /** Drehen 360° 0-2 */
  drehen: 0 | 1 | 2;
  /** Hinsetzen 0-2 */
  hinsetzen: 0 | 1 | 2;
};

export type TinettiErgebnis = {
  punkte: number;
  /** Skala 0-10 */
  maxPunkte: 10;
  klasse: "kein-risiko" | "gering" | "mittel" | "hoch";
  klasseLabel: string;
  empfehlungen: string[];
  reBeurteilung: string;
};

export const TINETTI_LABEL = {
  aufstehen: ["0 nicht möglich/ohne Hilfe nicht", "1 mit Armhebel", "2 ohne Armhebel"],
  stehen: ["0 unsicher", "1 sicher mit weiter Standfläche", "2 sicher mit enger Standfläche"],
  gang: ["0 abweichend / ataktisch", "1 leicht abweichend", "2 normal symmetrisch"],
  drehen: ["0 unsicher / Schritte ungleich", "1 verlangsamt aber sicher", "2 normal"],
  hinsetzen: ["0 unsicher / fällt", "1 mit Armhebel", "2 sicher kontrolliert"],
} as const;

export function berechneTinetti(t: TinettiInput): TinettiErgebnis {
  const punkte = t.aufstehen + t.stehen + t.gang + t.drehen + t.hinsetzen;
  if (punkte >= 9) {
    return {
      punkte,
      maxPunkte: 10,
      klasse: "kein-risiko",
      klasseLabel: "Kein erhöhtes Sturzrisiko",
      empfehlungen: ["Bewegungs-Routine fortsetzen"],
      reBeurteilung: "alle 6 Monate",
    };
  }
  if (punkte >= 7) {
    return {
      punkte,
      maxPunkte: 10,
      klasse: "gering",
      klasseLabel: "Geringes Sturzrisiko",
      empfehlungen: [
        "Umgebungs-Check (Stolperfallen, Beleuchtung)",
        "Schuhwerk + Hilfsmittel anpassen",
        "Kraft + Balance-Übungen 2× pro Woche",
      ],
      reBeurteilung: "alle 3 Monate",
    };
  }
  if (punkte >= 5) {
    return {
      punkte,
      maxPunkte: 10,
      klasse: "mittel",
      klasseLabel: "Mittleres Sturzrisiko",
      empfehlungen: [
        "Umgebungs-Check + Hausmeister-Auftrag (Haltegriffe, Schwellen)",
        "Therapie-Konsil (Physio + Ergo)",
        "Hilfsmittel-Versorgung erweitern",
        "Polypharmazie-Review",
      ],
      reBeurteilung: "alle 6 Wochen",
    };
  }
  return {
    punkte,
    maxPunkte: 10,
    klasse: "hoch",
    klasseLabel: "Hohes Sturzrisiko",
    empfehlungen: [
      "Tägliches Mobilitäts-Training mit Begleitung",
      "Sturzprotokoll-Pflicht bei jedem Sturz",
      "Wohnumfeld-Anpassung baulich (Hausmeister)",
      "Hüftprotektoren erwägen",
      "Beleuchtung Nachtbeleuchtung 24/7",
      "Polypharmazie + Medi-Liste prüfen (Sedativa raus)",
    ],
    reBeurteilung: "alle 4 Wochen + bei Sturz",
  };
}

// ─── Helfer für UI ───────────────────────────────────────────────

export function ampelFarbeRisiko(klasse: string): string {
  if (klasse.includes("kein") || klasse === "normal") return "var(--vibe-approval)";
  if (klasse === "gering" || klasse === "leicht") return "var(--sat)";
  if (klasse === "mittel" || klasse === "risiko") return "var(--sun)";
  if (klasse === "hoch" || klasse === "stark") return "var(--mon)";
  return "var(--vibe-stats)"; // sehr-hoch / mangelernaehrt / sehr-stark
}
