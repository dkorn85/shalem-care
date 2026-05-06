// Politik-Schnittstelle · Aggregat-Daten + Steuerbescheide + KI-Gesundheits-
// minister-Simulation.
//
// Vision: Eine Genossenschaft mit 1000+ Mitgliedern produziert in der täglichen
// Arbeit Daten, aus denen sich gesundheitspolitische Entscheidungen ableiten
// lassen — anonymisiert, aggregiert, transparent. Statt Lobby-Verbänden
// liefert die Plattform der Politik direkt eine Sicht auf die Realität.
//
// Drei Bausteine:
//   1. Aggregat-Daten-Pakete (für Bundes-/Land-Min, MD, Selbstverwaltung)
//   2. Steuerbescheid-Verständnis (Mitglieder-Sicht: was wird wo abgezogen?)
//   3. KI-Gesundheitsminister-Simulator (Was-wäre-wenn-Szenarien)

export type AggregatPaket = {
  id: string;
  thema: string;
  empfaenger: string;
  granularitaet: "bund" | "land" | "kreis" | "gemeinde";
  /** Anonymisierungs-Level */
  k_anonymitaet: number;
  /** Daten-Punkte im Paket */
  metriken: { label: string; wert: string; trend?: "↑" | "↓" | "→" }[];
  beschreibung: string;
  rechtsgrundlage: string;
  zustand: "veroeffentlicht" | "in_pruefung" | "entwurf";
};

// Realistische aggregierte Demo-Daten — würden in Phase-2 aus aggregierten
// anonymisierten Klient-/Personal-/Erlös-Daten entstehen.
export const AGGREGAT_PAKETE: AggregatPaket[] = [
  {
    id: "pflege-pers-bund",
    thema: "Pflege-Personal-Schlüssel · Realität vs PeBeM",
    empfaenger: "BMG · Referat 41 (Pflegeversicherung)",
    granularitaet: "bund",
    k_anonymitaet: 50,
    metriken: [
      { label: "Pflegekräfte Vollzeit-Äquivalente", wert: "1.247", trend: "↑" },
      { label: "Soll/Ist nach PeBeM", wert: "82%", trend: "↑" },
      { label: "Krankheits-Quote", wert: "8.4%", trend: "↓" },
      { label: "Fluktuation 12 Monate", wert: "11%", trend: "↓" },
      { label: "Burnout-Score (BARMER)", wert: "29%", trend: "↓" },
    ],
    beschreibung: "Personal-Realität in 6 Einrichtungen, anonymisiert auf Träger-Ebene aggregiert. Zeigt Differenz zwischen PeBeM-Soll und Ist + Trend mit/ohne Genossenschafts-Pool.",
    rechtsgrundlage: "§ 113c SGB XI · Personalbemessung",
    zustand: "veroeffentlicht",
  },
  {
    id: "wundheilung-mdk",
    thema: "Wundheilung · MDK-Indikatoren-Verlauf",
    empfaenger: "MD Spitzenverband + IQTIG",
    granularitaet: "bund",
    k_anonymitaet: 30,
    metriken: [
      { label: "Dekubitus-Inzidenz", wert: "2.1%", trend: "↓" },
      { label: "Heilzeit Durchschnitt", wert: "21 d", trend: "↓" },
      { label: "ICW-zertifizierte MA", wert: "3 / 78", trend: "↑" },
      { label: "MD-Note ø", wert: "1.8", trend: "↑" },
    ],
    beschreibung: "DNQP-konforme Wunddoku über alle Einrichtungen. Indikatoren als Zeit-Reihe, ohne Klient-Bezug. Zeigt Effekt von ICW-Fortbildung + Foto-KI-Vermessung.",
    rechtsgrundlage: "§ 114a SGB XI · Qualitätsindikatoren",
    zustand: "veroeffentlicht",
  },
  {
    id: "klientenstruktur-laender",
    thema: "Klient:innen-Struktur · Pflegegrad-Verteilung pro Bundesland",
    empfaenger: "Sozialministerien NRW · BY · BE",
    granularitaet: "land",
    k_anonymitaet: 100,
    metriken: [
      { label: "PG 1", wert: "8%", trend: "→" },
      { label: "PG 2", wert: "23%", trend: "↓" },
      { label: "PG 3", wert: "31%", trend: "→" },
      { label: "PG 4", wert: "26%", trend: "↑" },
      { label: "PG 5", wert: "12%", trend: "↑" },
    ],
    beschreibung: "Verschiebung der Pflegegrad-Struktur — Zeichen für späteren Pflege-Eintritt + intensiveren Pflegebedarf am Lebensende.",
    rechtsgrundlage: "§ 14-15 SGB XI · Begutachtung",
    zustand: "in_pruefung",
  },
  {
    id: "tarifbruch-tvoed",
    thema: "Tarif-Realität · TVöD-P vs Haus-/AVR-Tarif",
    empfaenger: "ver.di + Caritas Tarifkommission",
    granularitaet: "bund",
    k_anonymitaet: 25,
    metriken: [
      { label: "TVöD-P Anteil", wert: "42%" },
      { label: "AVR-Caritas/Diakonie", wert: "31%" },
      { label: "Haus-Tarif", wert: "27%" },
      { label: "Lohn-Spread P7-Stufe 4", wert: "± 380 €" },
    ],
    beschreibung: "Lohn-Realität in der Pflege — Spread zwischen Tarif-Modellen pro Berufs-/Tätigkeits-Klasse. Anker für Tarif-Verhandlungen.",
    rechtsgrundlage: "TVG · Tarifautonomie",
    zustand: "entwurf",
  },
  {
    id: "kostenstruktur",
    thema: "Investitions-Stau · Pflege-Heim-Modernisierung",
    empfaenger: "Länder-Sozialministerien · § 82 SGB XI",
    granularitaet: "land",
    k_anonymitaet: 30,
    metriken: [
      { label: "Investitionsförderung pro Bett", wert: "1.840 €/Jahr" },
      { label: "Tatsächlicher Bedarf", wert: "3.250 €/Jahr" },
      { label: "Förderlücke", wert: "−1.410 €", trend: "↓" },
      { label: "Eigenanteil Klient", wert: "+2.480 €/Mo", trend: "↑" },
    ],
    beschreibung: "Wo die Investitionsförderung der Länder nicht reicht — und der Eigenanteil der Klient:innen die Lücke schließt. Trend untragbar.",
    rechtsgrundlage: "§ 82 Abs. 2 SGB XI · Investitionskosten",
    zustand: "veroeffentlicht",
  },
];

// Steuerbescheid-Erklärung pro Mitglied: was wird wo abgezogen?
export type SteuerPosition = {
  bezeichnung: string;
  betrag_eur: number;
  paragraph: string;
  klartext: string;
  zweck: string;
  farbe: string;
};

export type Steuerbescheid = {
  jahr: number;
  brutto_eur: number;
  netto_eur: number;
  positionen: SteuerPosition[];
  /** Wofür wird mein Geld verwendet? */
  verwendung: { kategorie: string; anteil_pct: number; farbe: string }[];
};

export function beispielSteuerbescheid(jahresbrutto = 42_000): Steuerbescheid {
  const lst = Math.round(jahresbrutto * 0.156);
  const soli = Math.round(lst * 0.055);
  const ki = Math.round(jahresbrutto * 0.087);
  const rv = Math.round(jahresbrutto * 0.093);
  const av = Math.round(jahresbrutto * 0.013);
  const pv = Math.round(jahresbrutto * 0.018);
  const positionen: SteuerPosition[] = [
    { bezeichnung: "Lohnsteuer", betrag_eur: lst, paragraph: "§ 38 EStG", klartext: "Einkommensteuer auf dein Gehalt", zweck: "Bund + Länder + Gemeinden", farbe: "var(--vibe-stats)" },
    { bezeichnung: "Solidaritätszuschlag", betrag_eur: soli, paragraph: "SolzG", klartext: "Zusätzliche Steuer für Aufbau Ost — heute fast nur noch Spitzenverdiener", zweck: "Bund", farbe: "var(--mon)" },
    { bezeichnung: "Krankenversicherung", betrag_eur: ki, paragraph: "§ 241 SGB V", klartext: "Pflicht-Beitrag für deine Krankenkasse", zweck: "Krankenkasse · Arzt + Krankenhaus + Medikamente", farbe: "var(--vibe-team)" },
    { bezeichnung: "Rentenversicherung", betrag_eur: rv, paragraph: "§ 157 SGB VI", klartext: "Beitrag für deine spätere Rente + heute Renten anderer", zweck: "Renten + Reha + Hinterbliebene", farbe: "var(--accent)" },
    { bezeichnung: "Arbeitslosenversicherung", betrag_eur: av, paragraph: "§ 341 SGB III", klartext: "Beitrag für ALG 1 falls du arbeitslos wirst", zweck: "Bundesagentur für Arbeit", farbe: "var(--sun)" },
    { bezeichnung: "Pflegeversicherung", betrag_eur: pv, paragraph: "§ 55 SGB XI", klartext: "Beitrag für Pflege im Alter — auch deine eigene Pflege!", zweck: "Pflegekassen · die Branche, in der wir arbeiten", farbe: "var(--mon)" },
  ];
  const abzug = positionen.reduce((s, p) => s + p.betrag_eur, 0);
  return {
    jahr: new Date().getFullYear(),
    brutto_eur: jahresbrutto,
    netto_eur: jahresbrutto - abzug,
    positionen,
    verwendung: [
      { kategorie: "Soziale Sicherung", anteil_pct: 41, farbe: "var(--vibe-team)" },
      { kategorie: "Bildung + Forschung", anteil_pct: 11, farbe: "var(--fri)" },
      { kategorie: "Verteidigung", anteil_pct: 10, farbe: "var(--mon)" },
      { kategorie: "Verkehr + Infrastruktur", anteil_pct: 9, farbe: "var(--vibe-stats)" },
      { kategorie: "Wirtschaftsförderung", anteil_pct: 7, farbe: "var(--accent)" },
      { kategorie: "Klima + Umwelt", anteil_pct: 6, farbe: "var(--vibe-approval)" },
      { kategorie: "Innere Sicherheit", anteil_pct: 5, farbe: "var(--vibe-profile)" },
      { kategorie: "Sonstiges", anteil_pct: 11, farbe: "var(--fg-mute)" },
    ],
  };
}

// ─── KI-Gesundheitsminister-Simulator ─────────────────────────────

export type SzenarioParameter = {
  /** Pflege-Personal-Schlüssel-Erhöhung in % */
  personal_schluessel_delta: number;
  /** Lohn-Anpassung in % */
  lohn_delta: number;
  /** Pflegegrad-Stufung umverteilen (z.B. PG 3 → 4) */
  pg_verschiebung: "keine" | "konservativ" | "expansiv";
  /** Investitions-Förderung pro Bett in % */
  investition_delta: number;
  /** Eigenanteil-Deckel ja/nein */
  eigenanteil_deckel: boolean;
  /** Genossenschafts-Modell als Pflicht-Option für Pflege-Bedarfe */
  genossenschaft_pflicht: boolean;
};

export const DEFAULT_SZENARIO: SzenarioParameter = {
  personal_schluessel_delta: 0,
  lohn_delta: 0,
  pg_verschiebung: "keine",
  investition_delta: 0,
  eigenanteil_deckel: false,
  genossenschaft_pflicht: false,
};

export type SzenarioErgebnis = {
  /** Effekt auf Klient-Lebensqualität (0-100, höher = besser) */
  qualitaet: number;
  /** Effekt auf Personal-Zufriedenheit */
  ma_zufriedenheit: number;
  /** Erwartete Personal-Fluktuation in % (niedriger = besser) */
  fluktuation_pct: number;
  /** Erwartete Versorgungs-Lücken in 5 Jahren */
  versorgungsluecke_2030_personen: number;
  /** Bundeshaushalt-Mehrkosten in Mrd € */
  haushalts_kosten_mrd: number;
  /** Eigenanteil-Veränderung in € pro Monat */
  eigenanteil_delta_eur: number;
  /** Politik-Risiko (bürokratisch / sozial / wirtschaftlich) */
  politik_risiken: { kategorie: string; bewertung: "niedrig" | "mittel" | "hoch"; kommentar: string }[];
  /** KI-Empfehlung */
  empfehlung: string;
};

/**
 * Berechnet ein Szenario deterministisch. Die Modell-Annahmen sind
 * vereinfacht aber nicht beliebig — sie reflektieren Trend-Daten aus
 * Pflegebericht 2024 / BARMER / DBfK.
 */
export function simuliereSzenario(p: SzenarioParameter): SzenarioErgebnis {
  // Basis-Werte (Status quo 2026)
  let qualitaet = 65;
  let ma_zufriedenheit = 58;
  let fluktuation_pct = 14;
  let versorgungsluecke_2030 = 320_000;
  let haushalts_kosten_mrd = 0;
  let eigenanteil_delta = 0;

  // Personal-Schlüssel
  qualitaet += p.personal_schluessel_delta * 0.6;
  ma_zufriedenheit += p.personal_schluessel_delta * 0.8;
  fluktuation_pct -= p.personal_schluessel_delta * 0.3;
  versorgungsluecke_2030 -= p.personal_schluessel_delta * 12_000;
  haushalts_kosten_mrd += p.personal_schluessel_delta * 0.45;
  eigenanteil_delta += p.personal_schluessel_delta * 18;

  // Lohn
  ma_zufriedenheit += p.lohn_delta * 1.2;
  fluktuation_pct -= p.lohn_delta * 0.6;
  versorgungsluecke_2030 -= p.lohn_delta * 18_000;
  haushalts_kosten_mrd += p.lohn_delta * 0.32;
  eigenanteil_delta += p.lohn_delta * 24;

  // PG-Verschiebung
  if (p.pg_verschiebung === "konservativ") {
    haushalts_kosten_mrd -= 1.2;
    qualitaet -= 4;
    eigenanteil_delta += 90;
  } else if (p.pg_verschiebung === "expansiv") {
    haushalts_kosten_mrd += 4.8;
    qualitaet += 8;
    eigenanteil_delta -= 60;
  }

  // Investitions-Förderung
  qualitaet += p.investition_delta * 0.25;
  haushalts_kosten_mrd += p.investition_delta * 0.18;
  eigenanteil_delta -= p.investition_delta * 14;

  // Eigenanteil-Deckel
  if (p.eigenanteil_deckel) {
    eigenanteil_delta = Math.min(eigenanteil_delta, 0);
    haushalts_kosten_mrd += 5.6;
    qualitaet += 5;
  }

  // Genossenschaft als Pflicht-Option
  if (p.genossenschaft_pflicht) {
    qualitaet += 12;
    ma_zufriedenheit += 18;
    fluktuation_pct -= 5;
    versorgungsluecke_2030 -= 80_000;
    haushalts_kosten_mrd -= 2.1; // Eigentlich Einsparung durch reduzierte Verleih-Marge
    eigenanteil_delta -= 110;
  }

  // Clamping
  qualitaet = Math.max(0, Math.min(100, Math.round(qualitaet)));
  ma_zufriedenheit = Math.max(0, Math.min(100, Math.round(ma_zufriedenheit)));
  fluktuation_pct = Math.max(2, Math.min(40, +fluktuation_pct.toFixed(1)));
  versorgungsluecke_2030 = Math.max(0, Math.round(versorgungsluecke_2030));
  haushalts_kosten_mrd = +haushalts_kosten_mrd.toFixed(1);
  eigenanteil_delta = Math.round(eigenanteil_delta);

  // Politik-Risiken
  const politik_risiken: SzenarioErgebnis["politik_risiken"] = [];
  if (haushalts_kosten_mrd > 8) {
    politik_risiken.push({ kategorie: "Haushaltspolitik", bewertung: "hoch", kommentar: `${haushalts_kosten_mrd.toFixed(1)} Mrd € Mehrbelastung — schwer durchzusetzen ohne Steuererhöhung` });
  } else if (haushalts_kosten_mrd > 3) {
    politik_risiken.push({ kategorie: "Haushaltspolitik", bewertung: "mittel", kommentar: `${haushalts_kosten_mrd.toFixed(1)} Mrd € Mehrbelastung — Finanzierungsstreit erwartbar` });
  } else if (haushalts_kosten_mrd < -1) {
    politik_risiken.push({ kategorie: "Haushaltspolitik", bewertung: "niedrig", kommentar: `Einsparung ${Math.abs(haushalts_kosten_mrd).toFixed(1)} Mrd €/Jahr — politisch attraktiv` });
  }

  if (eigenanteil_delta > 80) {
    politik_risiken.push({ kategorie: "Sozialpolitik", bewertung: "hoch", kommentar: `+${eigenanteil_delta} € Eigenanteil/Monat — Verarmungsrisiko Mittelschicht` });
  } else if (eigenanteil_delta < -50) {
    politik_risiken.push({ kategorie: "Sozialpolitik", bewertung: "niedrig", kommentar: `−${Math.abs(eigenanteil_delta)} € Eigenanteil/Monat — Entlastung pflegebedürftiger Familien` });
  }

  if (p.genossenschaft_pflicht) {
    politik_risiken.push({ kategorie: "Wettbewerbspolitik", bewertung: "mittel", kommentar: "Private Träger könnten als Marktverzerrung klagen — sorgfältige Ausgestaltung mit Wahlfreiheit nötig" });
  }
  if (p.lohn_delta > 8) {
    politik_risiken.push({ kategorie: "Tarifautonomie", bewertung: "mittel", kommentar: "Tarif-Druck via Gesetz greift in Tarifautonomie ein — Verfassungsrechtlich prüfen" });
  }

  // Empfehlung
  let empfehlung: string;
  if (qualitaet > 80 && haushalts_kosten_mrd < 4 && eigenanteil_delta < 50) {
    empfehlung = "✓ Empfohlen · gut ausbalanciertes Szenario mit deutlicher Qualitätsverbesserung bei moderaten Kosten.";
  } else if (qualitaet > 75 && p.genossenschaft_pflicht) {
    empfehlung = "✓ Strukturwandel-Empfohlen · die Genossenschaftslogik trägt das Modell, Marktverzerrungs-Risiken adressieren.";
  } else if (haushalts_kosten_mrd > 8) {
    empfehlung = "⚠ Finanzierungs-Lücke · schrittweise Einführung über 5 Jahre erwägen.";
  } else if (eigenanteil_delta > 100) {
    empfehlung = "⚠ Sozial unhaltbar · Eigenanteil-Deckel zwingend kombinieren.";
  } else {
    empfehlung = "→ Tragfähig · Trade-offs sind vertretbar, aber kein Game-Changer.";
  }

  return {
    qualitaet,
    ma_zufriedenheit,
    fluktuation_pct,
    versorgungsluecke_2030_personen: versorgungsluecke_2030,
    haushalts_kosten_mrd,
    eigenanteil_delta_eur: eigenanteil_delta,
    politik_risiken,
    empfehlung,
  };
}
