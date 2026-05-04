// Betriebliches Eingliederungsmanagement · § 167 Abs. 2 SGB IX.
//
// Pflicht des Arbeitgebers, BEM anzubieten, sobald ein Beschäftigter innerhalb
// von 12 Monaten länger als 6 Wochen ununterbrochen oder wiederholt
// arbeitsunfähig war. Ziel: Arbeitsunfähigkeit überwinden, erneuter AU
// vorbeugen, Arbeitsplatz erhalten.
//
// Ablauf:
//   1. AG identifiziert berechtigten MA (datenschutzkonform, § 26 BDSG).
//   2. Schriftliche Einladung mit Aufklärung (Freiwilligkeit, Datenschutz,
//      Beteiligte, Ziele).
//   3. Zustimmung MA (frei widerruflich).
//   4. Erstgespräch — Bestandsaufnahme der Belastung.
//   5. Maßnahmenplan (Arbeitsanpassung, Reha, Stufenwiedereingliederung,
//      Schulung, Team-Anpassung, externe Unterstützung).
//   6. Verlauf + Abschluss-Dokumentation.
//
// Beteiligte (alle nur mit Zustimmung MA):
//   - Vorgesetzter / HR
//   - Betriebsrat / Personalrat (§ 167 II 4 SGB IX)
//   - Schwerbehindertenvertretung (bei Schwerbehinderung / Gleichstellung)
//   - Betriebsarzt
//   - Reha-Träger (Rentenversicherung, BG, Integrationsamt)
//
// Phase 1: In-Memory-Workflow.
// Phase 2: FHIR `CarePlan` mit `category: BEM`, Reha-Träger als
// `Communication` resources.

export type BemStatus =
  | "berechtigt"        // Schwelle 6 Wo / 12 Mo erreicht, Einladung steht aus
  | "eingeladen"        // Einladung versandt, Antwort steht aus
  | "abgelehnt"         // MA hat abgelehnt — Akte schließen, kein Nachteil zulässig
  | "zustimmung"        // MA hat zugestimmt
  | "erstgespraech"     // Erstgespräch terminiert / durchgeführt
  | "massnahmen_aktiv"  // Massnahmen laufen
  | "abgeschlossen"     // erfolgreich abgeschlossen
  | "gescheitert";      // ohne Erfolg beendet

export const BEM_STATUS_LABEL: Record<BemStatus, string> = {
  berechtigt:       "Berechtigt — Einladung vorbereiten",
  eingeladen:       "Einladung versandt",
  abgelehnt:        "Abgelehnt durch Mitarbeiter:in",
  zustimmung:       "Zustimmung erteilt",
  erstgespraech:    "Erstgespräch geplant",
  massnahmen_aktiv: "Maßnahmen laufen",
  abgeschlossen:    "Erfolgreich abgeschlossen",
  gescheitert:      "Ohne Erfolg beendet",
};

export type BemBeteiligter = {
  rolle:
    | "vorgesetzte"
    | "hr"
    | "betriebsrat"
    | "schwerbehindertenvertretung"
    | "betriebsarzt"
    | "reha_traeger"
    | "vertrauensperson";
  name?: string;
  zustimmungMA: boolean; // MA hat Beteiligung explizit zugestimmt
};

export type BemMassnahmenkategorie =
  | "arbeitsplatz_anpassung"      // ergonomisch, technisch
  | "arbeitszeit_anpassung"        // Reduktion, Schichtmodell
  | "stufenweise_wiedereingl"      // Hamburger Modell, eigenes Modul
  | "qualifizierung"               // Fortbildung, Umschulung
  | "team_kommunikation"           // Teamgespräch, Mediation
  | "betriebsarzt_check"           // Untersuchung
  | "med_reha"                     // medizinische Reha (DRV/KK)
  | "berufl_reha"                  // berufliche Reha (DRV/BA, LTA)
  | "integrationsamt"              // Schwerbehinderung
  | "psych_unterstuetzung"
  | "sonstiges";

export const MASSNAHMEN_LABEL: Record<BemMassnahmenkategorie, string> = {
  arbeitsplatz_anpassung:    "Arbeitsplatz anpassen",
  arbeitszeit_anpassung:     "Arbeitszeit anpassen",
  stufenweise_wiedereingl:   "Stufenweise Wiedereingliederung",
  qualifizierung:            "Qualifizierung / Schulung",
  team_kommunikation:        "Team-Kommunikation",
  betriebsarzt_check:        "Betriebsarzt-Untersuchung",
  med_reha:                  "Medizinische Reha (DRV/KK)",
  berufl_reha:               "Berufliche Reha (DRV/BA)",
  integrationsamt:           "Integrationsamt einbinden",
  psych_unterstuetzung:      "Psychologische Unterstützung",
  sonstiges:                 "Sonstiges",
};

export type BemMassnahme = {
  id: string;
  kategorie: BemMassnahmenkategorie;
  beschreibung: string;
  ab: string;        // ISO YYYY-MM-DD
  bis?: string;
  status: "geplant" | "laufend" | "abgeschlossen" | "abgebrochen";
  verantwortlich?: string;
  reviewAm?: string;
};

export type BemFall = {
  id: string;
  personId: string;
  ausloeser: { kumulierteAuTage12Mo: number; ankerDatum: string };
  status: BemStatus;
  einladungVersandtAm?: string;
  zustimmungAm?: string;
  ablehnungAm?: string;
  erstgespraechAm?: string;
  beteiligte: BemBeteiligter[];
  massnahmen: BemMassnahme[];
  abschlussNotiz?: string;
  // Datenschutzrelevant: getrennte Akte (§ 26 BDSG)
  separateAkte: boolean;
  erstelltAm: string;
  aktualisiertAm: string;
  verlauf: { event: string; at: string; meta?: string }[];
};

type GlobalShape = { __shalemBemFaelle?: BemFall[] };
const g = globalThis as unknown as GlobalShape;
const faelle: BemFall[] = g.__shalemBemFaelle ?? [];
if (!g.__shalemBemFaelle) g.__shalemBemFaelle = faelle;

export function listBemFaelle(): BemFall[] {
  return [...faelle].sort((a, b) => b.aktualisiertAm.localeCompare(a.aktualisiertAm));
}

export function listBemFaelleForPerson(personId: string): BemFall[] {
  return faelle.filter((f) => f.personId === personId);
}

export function getBemFall(id: string): BemFall | null {
  return faelle.find((f) => f.id === id) ?? null;
}

export function findActiveBemFallForPerson(personId: string): BemFall | null {
  return (
    faelle.find(
      (f) =>
        f.personId === personId &&
        f.status !== "abgeschlossen" &&
        f.status !== "abgelehnt" &&
        f.status !== "gescheitert",
    ) ?? null
  );
}

export function createBemFall(input: {
  personId: string;
  kumulierteAuTage12Mo: number;
  ankerDatum: string;
}): BemFall {
  const now = new Date().toISOString();
  const fall: BemFall = {
    id: `bem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    personId: input.personId,
    ausloeser: {
      kumulierteAuTage12Mo: input.kumulierteAuTage12Mo,
      ankerDatum: input.ankerDatum,
    },
    status: "berechtigt",
    beteiligte: [],
    massnahmen: [],
    separateAkte: true,
    erstelltAm: now,
    aktualisiertAm: now,
    verlauf: [{ event: "fall_angelegt", at: now }],
  };
  faelle.push(fall);
  return fall;
}

export function updateBemStatus(id: string, status: BemStatus, meta?: string): BemFall | null {
  const f = faelle.find((x) => x.id === id);
  if (!f) return null;
  f.status = status;
  f.aktualisiertAm = new Date().toISOString();
  f.verlauf.push({ event: `status:${status}`, at: f.aktualisiertAm, meta });

  if (status === "eingeladen") f.einladungVersandtAm = f.aktualisiertAm;
  if (status === "zustimmung") f.zustimmungAm = f.aktualisiertAm;
  if (status === "abgelehnt") f.ablehnungAm = f.aktualisiertAm;
  if (status === "erstgespraech") f.erstgespraechAm = f.aktualisiertAm;

  return f;
}

export function addBemMassnahme(
  bemId: string,
  m: Omit<BemMassnahme, "id">,
): BemFall | null {
  const f = faelle.find((x) => x.id === bemId);
  if (!f) return null;
  f.massnahmen.push({ ...m, id: `mas-${Date.now()}-${Math.floor(Math.random() * 1000)}` });
  f.aktualisiertAm = new Date().toISOString();
  f.verlauf.push({ event: `massnahme:${m.kategorie}`, at: f.aktualisiertAm });
  return f;
}

export function addBemBeteiligter(bemId: string, b: BemBeteiligter): BemFall | null {
  const f = faelle.find((x) => x.id === bemId);
  if (!f) return null;
  f.beteiligte.push(b);
  f.aktualisiertAm = new Date().toISOString();
  f.verlauf.push({ event: `beteiligt:${b.rolle}`, at: f.aktualisiertAm, meta: b.name });
  return f;
}

// Demo-Seed
let _seeded = false;
export function seedBemOnce() {
  if (_seeded) return;
  _seeded = true;
  // Leer — UI zeigt "Kein BEM-Fall offen", bei demo-Trigger entsteht einer.
}
