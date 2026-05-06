// Supervisor-Store · Träger-Vorstand-Aggregat über mehrere Einrichtungen.
//
// Ebenen über der PDL:
//   1. PDL · Pflegedienstleitung (1 Station)
//   2. Heimleitung / Klinik-Direktion (1 Einrichtung)
//   3. Träger-Vorstand (mehrere Einrichtungen)
//   4. Genossenschafts-Vorstand (Shalem-Mitglieder)
//   5. Aufsichtsrat (Kontrolle)
//
// Heute: Vivendi/orgavision/SAP zeigen einrichtungs-spezifische KPIs aber
// keine Cross-Einrichtungs-Live-Sicht mit KI-Frühwarnungen.

import {
  EINRICHTUNGEN,
  STATIONS,
  HIERARCHY_PEOPLE,
  KLIENTEN,
} from "@/lib/hierarchy/seed-hierarchy";
import { computeEinrichtungVitals, computeStationVitals } from "@/lib/hierarchy/store";

export type SupervisorLevel = "heim" | "traeger" | "vorstand_eg" | "aufsichtsrat";

export const LEVEL_LABEL: Record<SupervisorLevel, string> = {
  heim: "Heimleitung · 1 Einrichtung",
  traeger: "Träger-Vorstand · mehrere Einrichtungen",
  vorstand_eg: "Genossenschafts-Vorstand · Shalem eG",
  aufsichtsrat: "Aufsichtsrat · Kontrolle + Strategie",
};

export const LEVEL_FARBE: Record<SupervisorLevel, string> = {
  heim: "var(--vibe-team)",
  traeger: "var(--accent)",
  vorstand_eg: "var(--vibe-approval)",
  aufsichtsrat: "var(--vibe-stats)",
};

export type SupervisorVerantwortung = {
  rolle: string;
  paragraph: string;
  beschreibung: string;
};

export const VERANTWORTUNGEN: Record<SupervisorLevel, SupervisorVerantwortung[]> = {
  heim: [
    { rolle: "Pflege-Qualität", paragraph: "§ 113 SGB XI", beschreibung: "Sicherstellung der Mindestqualität, Indikatoren-Dokumentation" },
    { rolle: "Personal-Schlüssel", paragraph: "§ 113c SGB XI", beschreibung: "Personalbemessung nach PeBeM-Ist" },
    { rolle: "MDK-Prüfungen", paragraph: "§ 114 SGB XI", beschreibung: "Vorbereitung + Durchführung der Qualitätsprüfungen" },
    { rolle: "Hygiene", paragraph: "§ 36 IfSG", beschreibung: "Hygiene-Plan + Schulungen + Begehungen" },
  ],
  traeger: [
    { rolle: "Wirtschaftliche Führung", paragraph: "HGB", beschreibung: "Bilanz, GuV, Kostenrechnung über alle Einrichtungen" },
    { rolle: "Investitions-Steuerung", paragraph: "§ 82 SGB XI", beschreibung: "Investitionsplan + Förder-Anträge" },
    { rolle: "Kollektiv-Tarife", paragraph: "TVöD-P / AVR", beschreibung: "Tarif-Verhandlungen, Lohnstruktur" },
    { rolle: "Compliance", paragraph: "MDR / DSGVO / NIS-2", beschreibung: "EU-Verordnungen umsetzen" },
  ],
  vorstand_eg: [
    { rolle: "Mitglieder-Verwaltung", paragraph: "GenG § 24", beschreibung: "Aufnahme, Anteile, Generalversammlung" },
    { rolle: "Solidartopf-Steuerung", paragraph: "Satzung § 12", beschreibung: "Krankheits-Lohnfortzahlung, Urlaub, Fortbildung" },
    { rolle: "Multiplier-Verträge", paragraph: "GenG § 8", beschreibung: "Partner-Firmen + Konvergenz-Pfad" },
    { rolle: "Quartal-Ausschüttung", paragraph: "GenG § 19", beschreibung: "Bilanz-Prüfung + Verteilung an Mitglieder" },
  ],
  aufsichtsrat: [
    { rolle: "Vorstands-Kontrolle", paragraph: "GenG § 38", beschreibung: "Quartalsweise Bilanz-Prüfung + Strategie-Sicht" },
    { rolle: "Risiko-Management", paragraph: "KonTraG", beschreibung: "Frühwarn-System + Compliance-Audit" },
    { rolle: "Berufung Vorstand", paragraph: "GenG § 27", beschreibung: "Personal-Entscheidung Vorstand" },
    { rolle: "Generalversammlung", paragraph: "GenG § 47", beschreibung: "Bericht an Mitglieder, Entlastung Vorstand" },
  ],
};

export type EinrichtungAggregat = {
  id: string;
  name: string;
  shortName: string;
  bedCount: number;
  staffCount: number;
  klientenCount: number;
  occupancyPct: number;
  openShifts: number;
  arbzgWarnings: number;
  swapsActive: number;
  paymentVolumeMonthEur: number;
  /** KI-Gesundheits-Score 0-100, kombiniert aus mehreren Faktoren */
  health_score: number;
  /** Status-Indikator */
  status: "gruen" | "gelb" | "rot";
  /** Frühwarnungen aus KI */
  fruehwarnungen: string[];
};

export function aggregateEinrichtungen(): EinrichtungAggregat[] {
  return EINRICHTUNGEN.map((e) => {
    const vit = computeEinrichtungVitals(e.id);
    const klientenCount = KLIENTEN.filter((k) => k.einrichtungId === e.id).length;
    const fruehwarnungen: string[] = [];
    if (vit.openShifts >= 4) fruehwarnungen.push(`${vit.openShifts} offene Schichten — Pool aktivieren`);
    if (vit.arbzgWarnings >= 2) fruehwarnungen.push(`${vit.arbzgWarnings} ArbZG-Konflikte — Tausch nötig`);
    if (vit.occupancyPct < 75) fruehwarnungen.push(`Auslastung ${vit.occupancyPct}% — Marketing-Trigger`);
    if (vit.occupancyPct > 95) fruehwarnungen.push(`Vollbelegung ${vit.occupancyPct}% — Aufnahme-Stopp prüfen`);

    // Health-Score aus 4 Faktoren
    const score =
      Math.max(0, Math.min(100, 100 - vit.openShifts * 8 - vit.arbzgWarnings * 12)) * 0.4 +
      Math.max(0, Math.min(100, vit.occupancyPct < 95 ? vit.occupancyPct : 100 - (vit.occupancyPct - 95) * 5)) * 0.3 +
      Math.max(0, 100 - vit.swapsActive * 6) * 0.15 +
      (vit.staffCount > 0 ? 80 : 0) * 0.15;
    const health_score = Math.round(score);
    const status: EinrichtungAggregat["status"] = health_score >= 75 ? "gruen" : health_score >= 50 ? "gelb" : "rot";

    return {
      id: e.id,
      name: e.name,
      shortName: e.shortName,
      bedCount: e.bedCount ?? 0,
      staffCount: vit.staffCount,
      klientenCount,
      occupancyPct: vit.occupancyPct,
      openShifts: vit.openShifts,
      arbzgWarnings: vit.arbzgWarnings,
      swapsActive: vit.swapsActive,
      paymentVolumeMonthEur: Math.round(vit.paymentVolumeMonthCents / 100),
      health_score,
      status,
      fruehwarnungen,
    };
  });
}

export type TraegerKpi = {
  einrichtungenTotal: number;
  bettenTotal: number;
  staffTotal: number;
  klientenTotal: number;
  monatsvolumenEur: number;
  durchschnittsbelegung: number;
  offeneSchichten: number;
  arbzgKonflikteGesamt: number;
  health_score_avg: number;
  rot: number;
  gelb: number;
  gruen: number;
};

export function traegerKpis(): TraegerKpi {
  const aggs = aggregateEinrichtungen();
  return {
    einrichtungenTotal: aggs.length,
    bettenTotal: aggs.reduce((s, a) => s + a.bedCount, 0),
    staffTotal: aggs.reduce((s, a) => s + a.staffCount, 0),
    klientenTotal: aggs.reduce((s, a) => s + a.klientenCount, 0),
    monatsvolumenEur: aggs.reduce((s, a) => s + a.paymentVolumeMonthEur, 0),
    durchschnittsbelegung: Math.round(aggs.reduce((s, a) => s + a.occupancyPct, 0) / Math.max(aggs.length, 1)),
    offeneSchichten: aggs.reduce((s, a) => s + a.openShifts, 0),
    arbzgKonflikteGesamt: aggs.reduce((s, a) => s + a.arbzgWarnings, 0),
    health_score_avg: Math.round(aggs.reduce((s, a) => s + a.health_score, 0) / Math.max(aggs.length, 1)),
    rot: aggs.filter((a) => a.status === "rot").length,
    gelb: aggs.filter((a) => a.status === "gelb").length,
    gruen: aggs.filter((a) => a.status === "gruen").length,
  };
}

// KI-Strategie-Vorschläge auf Träger-Ebene
export type StrategieVorschlag = {
  id: string;
  thema: string;
  beschreibung: string;
  potenzial: string;
  aufwand: string;
  prio: "hoch" | "mittel" | "niedrig";
};

export function kiStrategieVorschlaege(): StrategieVorschlag[] {
  const aggs = aggregateEinrichtungen();
  const vorschlaege: StrategieVorschlag[] = [];

  // Personalmangel-Pattern
  const offen = aggs.reduce((s, a) => s + a.openShifts, 0);
  if (offen >= 10) {
    vorschlaege.push({
      id: "pool-skalieren",
      thema: "Genossenschafts-Pool skalieren",
      beschreibung: `${offen} offene Schichten über alle Einrichtungen. Pool-Aktivierung + Multiplier-Partner einbinden.`,
      potenzial: `~${offen * 8} Pflege-Stunden/Woche · ~${(offen * 8 * 35).toLocaleString("de-DE")} € Erlös`,
      aufwand: "1-2 Wochen",
      prio: "hoch",
    });
  }

  // Auslastungs-Optimierung
  const unterausgelastet = aggs.filter((a) => a.occupancyPct < 80);
  if (unterausgelastet.length > 0) {
    vorschlaege.push({
      id: "auslastung",
      thema: `Auslastungs-Plan ${unterausgelastet.map((a) => a.shortName).join(" + ")}`,
      beschreibung: `${unterausgelastet.length} Einrichtung${unterausgelastet.length === 1 ? "" : "en"} unter 80% Belegung. Marketing-Push + Self-Booker-Aktivierung.`,
      potenzial: `~${unterausgelastet.reduce((s, a) => s + Math.round(a.bedCount * 0.15), 0)} zusätzliche Belegungen`,
      aufwand: "4-6 Wochen",
      prio: "mittel",
    });
  }

  // Kompetenz-Querschnitt
  vorschlaege.push({
    id: "fortbildung-cluster",
    thema: "Fortbildungs-Cluster Wundmanagement",
    beschreibung: "Übergreifend: 12 MA mit Wundverband-Skill, davon 3 ICW-Zertifiziert. Cluster bilden + Aylin als Mentorin.",
    potenzial: "30% weniger Wundheilungs-Komplikationen + bessere MD-Bewertung",
    aufwand: "3 Monate Programmlauf",
    prio: "mittel",
  });

  // Compliance-Frühwarnung
  const arbzgGes = aggs.reduce((s, a) => s + a.arbzgWarnings, 0);
  if (arbzgGes >= 5) {
    vorschlaege.push({
      id: "compliance",
      thema: "ArbZG-Compliance-Audit",
      beschreibung: `${arbzgGes} ArbZG-Konflikte über alle Einrichtungen. Zentrales Audit + automatisierte Detektion in HUD.`,
      potenzial: "Bußgeld-Risiko -80% · Arbeitgeber-Reputation",
      aufwand: "2 Wochen Audit + KI-HUD-Setup",
      prio: "hoch",
    });
  }

  return vorschlaege;
}

// Eskalations-Hierarchie für Risiken
export const ESKALATION = [
  { stufe: 1, rolle: "Pflegekraft", aktion: "Beobachtung dokumentieren in SIS-Doku" },
  { stufe: 2, rolle: "Schichtleitung", aktion: "Übergabe + Maßnahmen-Plan" },
  { stufe: 3, rolle: "PDL", aktion: "Visite + Eskalation an Heimleitung wenn nötig" },
  { stufe: 4, rolle: "Heimleitung", aktion: "Träger informieren bei systemischen Issues" },
  { stufe: 5, rolle: "Träger-Vorstand", aktion: "Strategische Maßnahme + Aufsichtsrat-Briefing" },
  { stufe: 6, rolle: "Aufsichtsrat", aktion: "Quartalsbericht an Mitglieder + ggf. Generalversammlung" },
];
