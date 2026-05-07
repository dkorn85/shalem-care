// HBA + SMC-B-Karten-Verwaltung · Phase A in-memory.
//
// HBA (Heilberufeausweis) — personenbezogen, qualifizierte Signatur. Pflicht
// für Ärzt:innen (eRezept, KIM), Psychotherapeut:innen, Apotheker:innen.
// Vertrauensdiensteanbieter (VDA): D-Trust, medisign, T-Systems.
// Gültigkeit: 5 Jahre · Beantragung über zuständige Kammer.
//
// SMC-B (Security Module Card · Betriebsstätte) — institutionsbezogen.
// Pflicht für jede Praxis / Apotheke / jeden Pflegedienst, der TI-Anwendungen
// nutzt. Identifiziert die Betriebsstätte gegenüber der TI.
// Gültigkeit: 5 Jahre · Beantragung über KZBV / Apothekerkammer / Pflege-IK.
//
// Phase B: gematik-VZD-Anfrage (LDAP), Connector-API für Karten-PIN-Status,
// automatische Verlängerungs-Workflows via VDA-Portal.

export type KartenTyp = "hba" | "smc-b";

export type KartenStatus =
  | "bestellt"            // beim VDA, noch nicht zugestellt
  | "aktiv"               // produktiv, PIN gesetzt
  | "abgelaufen"          // > Gültigkeit
  | "gesperrt"            // Verlust / kompromittiert
  | "verlaengerung-laeuft" // 90 Tage vor Ablauf, Folgekarte beantragt
  | "ausser-betrieb";

export type PinStatus =
  | "nicht-gesetzt"      // Karte nie aktiviert
  | "gesetzt"            // PIN.CH oder PIN.QES gesetzt
  | "fehlversuche-1"
  | "fehlversuche-2"
  | "blockiert";         // 3 Fehlversuche · PUK nötig

export type Karte = {
  id: string;
  typ: KartenTyp;
  /** ICCSN — eindeutige Karten-Nummer · 19-stellig hexadezimal */
  iccsn: string;
  /** Telematik-ID · z.B. 1-1.58.X.X.X für HBA, 1-2.X.X.X für SMC-B */
  telematikId: string;
  /** Inhaber:in (HBA) oder Betriebsstätte (SMC-B) */
  inhaberId: string;
  inhaberName: string;
  /** Bei HBA: zusätzlich LANR / Berufsgruppe */
  lanr?: string;
  berufsgruppe?: "arzt" | "zahnarzt" | "apotheker" | "psychotherapeut" | "pflege";
  /** Bei SMC-B: BSNR / IK-Nummer */
  bsnr?: string;
  iknr?: string;
  /** VDA · Vertrauensdiensteanbieter */
  vda: "D-Trust" | "medisign" | "T-Systems" | "Bundesdruckerei";
  /** Datums-Stempel */
  bestelltAm: string;
  ausgegebenAm?: string;
  gueltigBis: string;
  status: KartenStatus;
  pinChStatus: PinStatus;
  pinQesStatus: PinStatus;
  /** Slot im Konnektor (HW) oder Cloud-Bind */
  konnektorSlot?: string;
  /** Notizen für die TI-Admin */
  notiz?: string;
};

type State = { karten: Karte[]; seeded: boolean };
type GlobalShape = { __shalemKarten?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemKarten) g.__shalemKarten = { karten: [], seeded: false };
const s = g.__shalemKarten!;

// ─── Read ───────────────────────────────────────────────────────

export function listKarten(): Karte[] {
  return [...s.karten].sort((a, b) => a.gueltigBis.localeCompare(b.gueltigBis));
}

export function getKarte(id: string): Karte | null {
  return s.karten.find((k) => k.id === id) ?? null;
}

export function listKartenFuerInhaber(inhaberId: string): Karte[] {
  return listKarten().filter((k) => k.inhaberId === inhaberId);
}

// ─── Verlängerungs-Logik ─────────────────────────────────────────

export function tageBisAblauf(k: Karte): number {
  const ablauf = new Date(k.gueltigBis).getTime();
  return Math.round((ablauf - Date.now()) / 86_400_000);
}

export function verlaengerungsHinweis(k: Karte): {
  level: "ok" | "bald" | "kritisch" | "abgelaufen";
  text: string;
} {
  const tage = tageBisAblauf(k);
  if (tage < 0) return { level: "abgelaufen", text: `seit ${-tage} Tagen abgelaufen` };
  if (tage <= 30) return { level: "kritisch", text: `läuft in ${tage} Tagen ab — Folgekarte muss bestellt sein` };
  if (tage <= 90) return { level: "bald", text: `Folgekarte bei VDA bestellen (${tage} Tage)` };
  return { level: "ok", text: `noch ${tage} Tage gültig` };
}

// ─── KPI ────────────────────────────────────────────────────────

export function kartenKpi() {
  const alle = listKarten();
  return {
    total: alle.length,
    hba: alle.filter((k) => k.typ === "hba").length,
    smcb: alle.filter((k) => k.typ === "smc-b").length,
    aktiv: alle.filter((k) => k.status === "aktiv").length,
    inVerlaengerung: alle.filter((k) => k.status === "verlaengerung-laeuft").length,
    bald: alle.filter((k) => verlaengerungsHinweis(k).level === "bald" || verlaengerungsHinweis(k).level === "kritisch").length,
    abgelaufen: alle.filter((k) => verlaengerungsHinweis(k).level === "abgelaufen").length,
    pinBlockiert: alle.filter((k) => k.pinChStatus === "blockiert" || k.pinQesStatus === "blockiert").length,
  };
}

// ─── Demo-Seed ──────────────────────────────────────────────────

export function seedKartenOnce() {
  if (s.seeded) return;
  s.seeded = true;

  const heute = new Date();
  const inJahren = (j: number, m = 0) => {
    const d = new Date(heute);
    d.setFullYear(d.getFullYear() + j);
    d.setMonth(d.getMonth() + m);
    return d.toISOString().slice(0, 10);
  };
  const vor = (n: number) => {
    const d = new Date(heute);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  // K1: HBA · Dr. Hartmann · aktiv, läuft 2030 ab
  s.karten.push({
    id: "k-hba-001",
    typ: "hba",
    iccsn: "80276001011699901234",
    telematikId: "1-1.58.999999900",
    inhaberId: "person-arzt-001",
    inhaberName: "Dr. Susanne Hartmann",
    lanr: "999999900",
    berufsgruppe: "arzt",
    vda: "medisign",
    bestelltAm: "2025-09-12",
    ausgegebenAm: "2025-10-04",
    gueltigBis: inJahren(4, 5),
    status: "aktiv",
    pinChStatus: "gesetzt",
    pinQesStatus: "gesetzt",
    konnektorSlot: "Slot-1 · RISE Cloud",
    notiz: "Komfortsignatur aktiv · 250 Signaturen/Tag freigeschaltet.",
  });

  // K2: HBA · Dr. Klein · läuft in 60 Tagen ab — Folgekarte bestellt
  s.karten.push({
    id: "k-hba-002",
    typ: "hba",
    iccsn: "80276001011699905678",
    telematikId: "1-1.58.999999911",
    inhaberId: "person-arzt-002",
    inhaberName: "Dr. Martin Klein",
    lanr: "999999911",
    berufsgruppe: "arzt",
    vda: "D-Trust",
    bestelltAm: "2020-08-01",
    ausgegebenAm: "2020-08-22",
    gueltigBis: (() => {
      const d = new Date(heute);
      d.setDate(d.getDate() + 60);
      return d.toISOString().slice(0, 10);
    })(),
    status: "verlaengerung-laeuft",
    pinChStatus: "gesetzt",
    pinQesStatus: "fehlversuche-1",
    konnektorSlot: "Slot-2 · RISE Cloud",
    notiz: "Folge-HBA bestellt am 2026-04-12 · Eingang erwartet bis 2026-05-15.",
  });

  // K3: SMC-B · Shalem Care eG i.G. · aktiv
  s.karten.push({
    id: "k-smcb-001",
    typ: "smc-b",
    iccsn: "80276002011700001111",
    telematikId: "1-2.999999901",
    inhaberId: "shalem-care-eg",
    inhaberName: "Shalem Care eG i.G. · Standort Essen",
    bsnr: "999999901",
    iknr: "660999999",
    vda: "Bundesdruckerei",
    bestelltAm: "2025-11-04",
    ausgegebenAm: "2025-12-01",
    gueltigBis: inJahren(4, 7),
    status: "aktiv",
    pinChStatus: "gesetzt",
    pinQesStatus: "nicht-gesetzt",
    konnektorSlot: "Cloud-Bind · RISE",
    notiz: "Standort Essen-Mitte · KIM-Postfach Shalem.Care@arz.kim.telematik aktiv.",
  });

  // K4: HBA · Dr. Lehmann · PIN.QES blockiert nach 3 Fehlversuchen
  s.karten.push({
    id: "k-hba-003",
    typ: "hba",
    iccsn: "80276001011699907890",
    telematikId: "1-1.58.999999922",
    inhaberId: "person-arzt-003",
    inhaberName: "Dr. Andreas Lehmann",
    lanr: "999999922",
    berufsgruppe: "arzt",
    vda: "medisign",
    bestelltAm: "2024-02-08",
    ausgegebenAm: "2024-02-28",
    gueltigBis: inJahren(2, 9),
    status: "aktiv",
    pinChStatus: "gesetzt",
    pinQesStatus: "blockiert",
    konnektorSlot: "—",
    notiz: "PUK in Kartenmappe Tresor Etage 2 · Termin VDA-Hotline gebucht 2026-05-10.",
  });

  // K5: SMC-B · Pilot-Standort 2 · noch bestellt, nicht ausgegeben
  s.karten.push({
    id: "k-smcb-002",
    typ: "smc-b",
    iccsn: "80276002011700002222",
    telematikId: "1-2.999999902",
    inhaberId: "shalem-pilot-2",
    inhaberName: "Shalem Care eG · Pilot-Standort 2 (Bochum)",
    bsnr: "999999902",
    iknr: "660999998",
    vda: "Bundesdruckerei",
    bestelltAm: vor(8),
    gueltigBis: inJahren(5, 0),
    status: "bestellt",
    pinChStatus: "nicht-gesetzt",
    pinQesStatus: "nicht-gesetzt",
    notiz: "Voraussichtlicher Eingang: 2026-05-20. Pilot-Go-Live mit dieser Karte.",
  });
}

// ─── Status-Übergänge ───────────────────────────────────────────

export function setKartenStatus(id: string, status: KartenStatus): Karte | null {
  const k = s.karten.find((x) => x.id === id);
  if (!k) return null;
  k.status = status;
  return k;
}

export function setPinStatus(
  id: string,
  feld: "pinChStatus" | "pinQesStatus",
  status: PinStatus,
): Karte | null {
  const k = s.karten.find((x) => x.id === id);
  if (!k) return null;
  k[feld] = status;
  return k;
}

export const KARTEN_STATUS_LABEL: Record<KartenStatus, string> = {
  bestellt: "Bestellt · beim VDA",
  aktiv: "Aktiv · produktiv",
  abgelaufen: "Abgelaufen",
  gesperrt: "Gesperrt",
  "verlaengerung-laeuft": "Verlängerung läuft",
  "ausser-betrieb": "Außer Betrieb",
};

export const KARTEN_STATUS_FARBE: Record<KartenStatus, string> = {
  bestellt: "var(--vibe-team)",
  aktiv: "var(--vibe-approval)",
  abgelaufen: "var(--mon)",
  gesperrt: "var(--mon)",
  "verlaengerung-laeuft": "var(--sun)",
  "ausser-betrieb": "var(--fg-mute)",
};

export const PIN_STATUS_LABEL: Record<PinStatus, string> = {
  "nicht-gesetzt": "PIN noch nicht gesetzt",
  gesetzt: "PIN gesetzt",
  "fehlversuche-1": "1 Fehlversuch",
  "fehlversuche-2": "2 Fehlversuche",
  blockiert: "Blockiert · PUK nötig",
};
