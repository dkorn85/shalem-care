// Gemeinwohl-Matrix · vereinfachte Adaption der GWÖ-Matrix 5.0
// (Christian Felber, ecogood.org).
//
// 5 Werte × 4 Berührungsgruppen = 20 Themen. Maximal 1000 Punkte.
// Wir nutzen das System für Lieferanten-Auswahl: priorisiert wird,
// wer höher punktet. Pflege braucht Zulieferer (Lebensmittel, Reinigung,
// Verbrauchsmaterial). Wer das gemeinwohlorientiert macht, bekommt
// Vorzug vor Anbietern, die nur Preis-getrieben sind.
//
// Genuine GWÖ-Bilanz wird durch externe Auditor:innen erstellt;
// hier nutzen wir Selbstauskunft + Stichprobe für Plausibilisierung.

export type GemeinwohlWert =
  | "menschenwuerde"
  | "solidaritaet"
  | "nachhaltigkeit"
  | "transparenz"
  | "mitbestimmung";

export type Beruehrungsgruppe =
  | "lieferanten"        // A · Lieferant:innen
  | "eigentuemer"        // B · Eigentümer:innen + Finanzpartner
  | "mitarbeitende"      // C · Mitarbeitende
  | "kunden"             // D · Kund:innen + Mitunternehmen
  | "gesellschaft";      // E · Gesellschaftliches Umfeld

export type GwoeThema = {
  /** ID wie A1, B2, ... C5 */
  id: string;
  wert: GemeinwohlWert;
  gruppe: Beruehrungsgruppe;
  titel: string;
  /** Was zählt zur Bewertung */
  kriterien: string[];
  /** Maximal-Punkte (klassisch 30 für jedes Themenfeld, 5×20=100, hier 50 für Vereinfachung) */
  maxPunkte: number;
};

// Reduzierter Themenkatalog · 20 Themen, jeweils max 50 Punkte → max 1000.
// Werte sind in 5er-Schritten zu skalieren (Selbstauskunft 0-50).
export const GWOE_THEMEN: GwoeThema[] = [
  // ─── Lieferanten · A ──────────────────────────────────────
  {
    id: "A1",
    wert: "menschenwuerde",
    gruppe: "lieferanten",
    titel: "Menschenwürde in der Zulieferkette",
    kriterien: [
      "Existenzlöhne in der gesamten Kette nachweisbar",
      "ILO-Kernarbeitsnormen eingehalten",
      "Audit-Berichte verfügbar",
    ],
    maxPunkte: 50,
  },
  {
    id: "A2",
    wert: "solidaritaet",
    gruppe: "lieferanten",
    titel: "Solidarität mit Zulieferern",
    kriterien: [
      "Faire Preise (kein Druck auf Zulieferer-Marge)",
      "Längerfristige Partnerschaften statt Spot-Markt",
      "Regionale Vorrang-Politik",
    ],
    maxPunkte: 50,
  },
  {
    id: "A3",
    wert: "nachhaltigkeit",
    gruppe: "lieferanten",
    titel: "Ökologische Beschaffung",
    kriterien: [
      "Bio/EU-Bio bei Lebensmitteln, mind. 60 %",
      "FSC/Recycling bei Verbrauchsmaterial",
      "CO₂-Bilanz pro Liefereinheit dokumentiert",
    ],
    maxPunkte: 50,
  },
  {
    id: "A4",
    wert: "transparenz",
    gruppe: "lieferanten",
    titel: "Transparente Lieferketten",
    kriterien: [
      "Herkunft jeder Zutat / Materialgruppe öffentlich",
      "Audit- und Zertifikat-Reports veröffentlicht",
      "Gewinn-Verteilung kommuniziert",
    ],
    maxPunkte: 50,
  },

  // ─── Eigentümer + Finanzpartner · B ──────────────────────
  {
    id: "B1",
    wert: "menschenwuerde",
    gruppe: "eigentuemer",
    titel: "Ethik der Eigentumsstruktur",
    kriterien: [
      "Genossenschaft / Stiftung / Mitarbeiter-Beteiligung",
      "Keine Konzentration > 25 % bei Einzeleigentümer",
    ],
    maxPunkte: 50,
  },
  {
    id: "B2",
    wert: "solidaritaet",
    gruppe: "eigentuemer",
    titel: "Solidarische Mittelverwendung",
    kriterien: [
      "Gewinn-Begrenzung pro Anteil (typ. 4–6 % p.a.)",
      "Solidar-Topf für ärmere Mitglieder",
    ],
    maxPunkte: 50,
  },
  {
    id: "B3",
    wert: "nachhaltigkeit",
    gruppe: "eigentuemer",
    titel: "Sozial-ökologische Investitionen",
    kriterien: [
      "Bank-Beziehung mit GLS / Triodos / Ethikbank",
      "Keine Anlage in fossil/Rüstung",
    ],
    maxPunkte: 50,
  },
  {
    id: "B4",
    wert: "mitbestimmung",
    gruppe: "eigentuemer",
    titel: "Demokratische Eigentumsstruktur",
    kriterien: [
      "1 Mitglied = 1 Stimme",
      "Generalversammlung mind. 1× p.a.",
    ],
    maxPunkte: 50,
  },

  // ─── Mitarbeitende · C ───────────────────────────────────
  {
    id: "C1",
    wert: "menschenwuerde",
    gruppe: "mitarbeitende",
    titel: "Menschenwürdige Arbeitsplätze",
    kriterien: [
      "Tarif oder über-tarifliche Bezahlung",
      "Gesundheits-Schutz (Burnout-Prävention, Ergonomie)",
      "Selbstbestimmung der Arbeitszeit",
    ],
    maxPunkte: 50,
  },
  {
    id: "C2",
    wert: "solidaritaet",
    gruppe: "mitarbeitende",
    titel: "Solidarisches Miteinander",
    kriterien: [
      "Gehaltsspreizung max 1:5",
      "Quereinsteiger:innen integriert",
    ],
    maxPunkte: 50,
  },
  {
    id: "C3",
    wert: "nachhaltigkeit",
    gruppe: "mitarbeitende",
    titel: "Förderung nachhaltigen Verhaltens",
    kriterien: [
      "Job-Rad / ÖPNV-Ticket subventioniert",
      "Vegetarische Verpflegungs-Optionen",
    ],
    maxPunkte: 50,
  },
  {
    id: "C4",
    wert: "mitbestimmung",
    gruppe: "mitarbeitende",
    titel: "Innerbetriebliche Mitbestimmung",
    kriterien: [
      "Betriebsrat oder Vertretungs-Gremium",
      "Mitarbeitende stimmen über Strategie ab",
    ],
    maxPunkte: 50,
  },

  // ─── Kund:innen + Mitunternehmen · D ─────────────────────
  {
    id: "D1",
    wert: "menschenwuerde",
    gruppe: "kunden",
    titel: "Ethik im Verkauf",
    kriterien: [
      "Keine manipulative Werbung",
      "Schwächere Kund:innen geschützt",
    ],
    maxPunkte: 50,
  },
  {
    id: "D2",
    wert: "solidaritaet",
    gruppe: "kunden",
    titel: "Kooperation mit Mitbewerbern",
    kriterien: [
      "Wissen + Standards offen geteilt",
      "Open Source / freie Lizenzen",
    ],
    maxPunkte: 50,
  },
  {
    id: "D3",
    wert: "nachhaltigkeit",
    gruppe: "kunden",
    titel: "Ökologische Produktverantwortung",
    kriterien: [
      "Produkte langlebig + reparierbar",
      "Verpackung minimiert / recyclebar",
    ],
    maxPunkte: 50,
  },
  {
    id: "D4",
    wert: "transparenz",
    gruppe: "kunden",
    titel: "Erhöhung des sozialen Standards",
    kriterien: [
      "Faire Preise · Inklusionspreise",
      "Kund:innen-Beirat / Beschwerdeweg klar",
    ],
    maxPunkte: 50,
  },

  // ─── Gesellschaft · E ───────────────────────────────────
  {
    id: "E1",
    wert: "menschenwuerde",
    gruppe: "gesellschaft",
    titel: "Sinn und Wirkung der Produkte",
    kriterien: [
      "Bedarfsorientiert statt Konsumdruck",
      "Beitrag zu SDGs nachweisbar",
    ],
    maxPunkte: 50,
  },
  {
    id: "E2",
    wert: "solidaritaet",
    gruppe: "gesellschaft",
    titel: "Beitrag zum Gemeinwesen",
    kriterien: [
      "Spenden / Pro-Bono-Stunden dokumentiert",
      "Lokale Initiativen unterstützt",
    ],
    maxPunkte: 50,
  },
  {
    id: "E3",
    wert: "nachhaltigkeit",
    gruppe: "gesellschaft",
    titel: "Ökologisches Wirken",
    kriterien: [
      "CO₂-Bilanz veröffentlicht",
      "Reduktions-Pfad definiert",
    ],
    maxPunkte: 50,
  },
  {
    id: "E4",
    wert: "transparenz",
    gruppe: "gesellschaft",
    titel: "Transparenz + Mitentscheidung",
    kriterien: [
      "GWÖ-Bilanz extern auditiert",
      "Bürger:innen-Dialog regelmäßig",
    ],
    maxPunkte: 50,
  },
];

export type GwoeBilanz = {
  /** Punkte pro Themen-ID (0..50) */
  punkte: Record<string, number>;
  /** Auditor:in / Selbstauskunft */
  quelle: "selbstauskunft" | "peer-review" | "vollaudit";
  /** Letzte Aktualisierung */
  aktualisiert: string;
};

export function summe(bilanz: GwoeBilanz): number {
  return Object.values(bilanz.punkte).reduce((s, n) => s + n, 0);
}

export function summeProGruppe(
  bilanz: GwoeBilanz,
  gruppe: Beruehrungsgruppe,
): number {
  return GWOE_THEMEN.filter((t) => t.gruppe === gruppe)
    .map((t) => bilanz.punkte[t.id] ?? 0)
    .reduce((s, n) => s + n, 0);
}

export function ampel(score: number): "rot" | "gelb" | "gruen" | "vorbild" {
  // Skala: max 1000
  if (score >= 750) return "vorbild";
  if (score >= 500) return "gruen";
  if (score >= 300) return "gelb";
  return "rot";
}

export function ampelLabel(score: number): string {
  switch (ampel(score)) {
    case "vorbild":
      return "Vorbild";
    case "gruen":
      return "Gemeinwohl-stark";
    case "gelb":
      return "Auf dem Weg";
    case "rot":
      return "Nachholbedarf";
  }
}

export function ampelFarbe(score: number): string {
  switch (ampel(score)) {
    case "vorbild":
      return "var(--vibe-approval)";
    case "gruen":
      return "var(--sat)";
    case "gelb":
      return "var(--sun)";
    case "rot":
      return "var(--vibe-stats)";
  }
}

export const WERT_LABEL: Record<GemeinwohlWert, string> = {
  menschenwuerde: "Menschenwürde",
  solidaritaet: "Solidarität + Gerechtigkeit",
  nachhaltigkeit: "Ökologische Nachhaltigkeit",
  transparenz: "Transparenz",
  mitbestimmung: "Mitentscheidung",
};

export const GRUPPE_LABEL: Record<Beruehrungsgruppe, string> = {
  lieferanten: "Lieferant:innen",
  eigentuemer: "Eigentümer:innen + Finanzpartner",
  mitarbeitende: "Mitarbeitende",
  kunden: "Kund:innen + Mitunternehmen",
  gesellschaft: "Gesellschaftliches Umfeld",
};
