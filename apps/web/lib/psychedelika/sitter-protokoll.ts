// Trip-Sitter / Sitzungs-Begleitungs-Protokoll für psychedelisch-
// assistierte Therapie. Strukturiert in 3 Phasen nach MAPS- und
// COMPASS-Standard:
//
//   1. Preparation (Set + Setting · Intention · Vorgespräche)
//   2. Dosing Session (eigentliche Sitzung · Begleitung 6-8 h)
//   3. Integration (Nachgespräche · Bedeutung verarbeiten)
//
// Pflege-Aufgaben sind klar abgegrenzt: Vital-Monitoring, Sicherheit,
// Würde-bewahrende Begleitung — keine therapeutische Intervention.

export type SitterPhase = "preparation" | "dosing" | "integration";

export type SitterAufgabe = {
  phase: SitterPhase;
  zeitpunkt: string;             // z.B. "1 Wo. vor", "T-15 min", "T+30 min"
  was: string;
  zustaendig: ("therapeut" | "pflege" | "klient")[];
  warum: string;
};

export const SITTER_PROTOKOLL: SitterAufgabe[] = [
  // ─── Preparation · 2-3 Vorbereitungs-Sitzungen ─────────────────────────
  { phase: "preparation", zeitpunkt: "2 Wo. vor", was: "Anamnese · Ausschluss psychotische Risiken · Medikations-Wash-out planen (SSRI 2 Wo.)", zustaendig: ["therapeut"], warum: "Schizophrenie/Bipolar-I sind Kontraindikation · SSRI dämpft Wirkung" },
  { phase: "preparation", zeitpunkt: "1 Wo. vor", was: "Vorbereitungs-Sitzung 1: Vertrauen aufbauen · Therapie-Setting erklären · Ängste benennen", zustaendig: ["therapeut", "klient"], warum: "Set (mentale Verfassung) entscheidet maßgeblich über die Erfahrung" },
  { phase: "preparation", zeitpunkt: "3 Tage vor", was: "Vorbereitungs-Sitzung 2: Intention klären · was ist der Heilungs-Wunsch", zustaendig: ["therapeut", "klient"], warum: "klare Intention erhöht therapeutischen Nutzen" },
  { phase: "preparation", zeitpunkt: "1 Tag vor", was: "Setting-Check · Raum vorbereiten · Musik-Playlist · Augenmaske · Decke", zustaendig: ["pflege", "therapeut"], warum: "Setting (Umgebung) zweite Säule neben Set" },
  { phase: "preparation", zeitpunkt: "Morgens", was: "leichtes Frühstück · keine Stimulanzien (Kaffee) · Vital-Werte-Baseline", zustaendig: ["pflege", "klient"], warum: "Übelkeit minimieren · Baseline für Vergleich" },

  // ─── Dosing Session · der Sitzungs-Tag ─────────────────────────────────
  { phase: "dosing", zeitpunkt: "T-30 min", was: "Klient eintreffen · Vital-Check · Aufklärung wiederholen · Konsens prüfen", zustaendig: ["therapeut", "pflege"], warum: "Informierter Konsens nach BGB § 630e direkt vor Substanz-Gabe" },
  { phase: "dosing", zeitpunkt: "T-15 min", was: "Lagerung · Kopfhörer · Augenmaske · Hand-Position vereinbaren (für Wegruf)", zustaendig: ["pflege", "klient"], warum: "körperliches Sicherheits-Gefühl, klare Notfall-Geste" },
  { phase: "dosing", zeitpunkt: "T-0", was: "Substanz-Gabe protokolliert · Zeit notieren · Therapeut bleibt im Raum", zustaendig: ["therapeut"], warum: "exakte Zeit-Doku für Wirk-Verlauf" },
  { phase: "dosing", zeitpunkt: "T+15 min", was: "Vital-Check · Klient ruhig assoziieren lassen · keine Eingriffe ohne Anfrage", zustaendig: ["pflege", "therapeut"], warum: "Stille Begleitung · Therapeut-Eingriff nur wenn Klient signalisiert" },
  { phase: "dosing", zeitpunkt: "T+60 min", was: "Peak-Phase · Anwesenheit + Halten · keine analytischen Fragen", zustaendig: ["therapeut"], warum: "schwere Erfahrungen brauchen ruhige Präsenz, nicht Worte" },
  { phase: "dosing", zeitpunkt: "T+180 min", was: "Vital-Check · Snack/Wasser anbieten · Klient kann sprechen wenn er will", zustaendig: ["pflege"], warum: "Hypotonie/Tachykardie-Phase überschritten · Hydration" },
  { phase: "dosing", zeitpunkt: "T+360 min", was: "Sitzungs-Ende · keine Selbstfahrt · Begleitperson abholt oder Übernachtung", zustaendig: ["therapeut", "pflege", "klient"], warum: "Restwirkung 12-24 h · Verkehrs-Sicherheit" },

  // ─── Integration · 2-3 Nach-Sitzungen ──────────────────────────────────
  { phase: "integration", zeitpunkt: "T+1 Tag", was: "Kurz-Follow-Up: schlief Klient · Stimmung · besondere Reaktionen", zustaendig: ["therapeut"], warum: "Frühzeitig psychotische Reaktion oder Erhöhung Suizidalität erkennen" },
  { phase: "integration", zeitpunkt: "T+1 Wo.", was: "Integrations-Sitzung 1: Bedeutung der Erfahrung · was bleibt", zustaendig: ["therapeut", "klient"], warum: "ohne Integration verpufft 80 % des therapeutischen Nutzens" },
  { phase: "integration", zeitpunkt: "T+1 Mo.", was: "Integrations-Sitzung 2: konkrete Lebens-Veränderungen · Anker setzen", zustaendig: ["therapeut", "klient"], warum: "Erfahrungs-Inhalte in Alltag übersetzen" },
  { phase: "integration", zeitpunkt: "T+3 Mo.", was: "Outcome-Assessment · standardisierte Skalen (BDI, MADRS, CAPS-5 bei PTBS)", zustaendig: ["therapeut"], warum: "messbare Wirkung dokumentieren" },
];

export const PHASE_LABEL: Record<SitterPhase, string> = {
  preparation: "Vorbereitung",
  dosing:      "Sitzung",
  integration: "Integration",
};

export const PHASE_FARBE: Record<SitterPhase, string> = {
  preparation: "var(--vibe-team)",
  dosing:      "var(--vibe-profile)",
  integration: "var(--thu)",
};

// Pflege-spezifische Verantwortlichkeiten in Klartext
export const PFLEGE_KOMPETENZ_FELD = {
  ja_pflege: [
    "Vital-Monitoring (Blutdruck, Puls, SpO2)",
    "Würde-bewahrende körperliche Sicherheit (Lagerung, Toilette)",
    "Hydration + Snack-Angebot bei nachlassender Wirkung",
    "Ruhige Präsenz · Halten der Hand wenn Klient signalisiert",
    "Notfall-Erkennung + BLS bei Bedarf",
    "Doku der Vital-Werte + Verlauf-Stichworte",
  ],
  nein_pflege: [
    "Keine therapeutische Deutung der Erfahrung",
    "Keine Substanz-Verabreichung (das ist Arzt:Therapeut)",
    "Keine Diagnose-Stellung",
    "Keine ungebeten gestellten Fragen während Peak-Phase",
    "Keine Beruhigungs-Medikation ohne Therapeut-Anweisung",
  ],
  bei_krise: [
    "Therapeut sofort informieren (immer im Raum oder rufbereit)",
    "Notfall-Medikation (Lorazepam) nur nach Therapeut-Anweisung verabreichen",
    "Bei Vital-Entgleisung: BLS · 112 wenn nicht Klinik-Setting",
    "Klient niemals allein lassen",
  ],
};

export function aufgabenFuerPhase(phase: SitterPhase): SitterAufgabe[] {
  return SITTER_PROTOKOLL.filter((a) => a.phase === phase);
}
