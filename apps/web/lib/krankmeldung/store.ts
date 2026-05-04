// In-Memory-Store. Phase 2: FHIR Encounter (status: "in-progress",
// reasonCode: AU) + Communication zu Krankenkasse.

import type { Krankmeldung, Arzttermin, SicknessStatus, ArzttermineStatus } from "./types";

type GlobalShape = {
  __shalemKrankmeldungen?: Krankmeldung[];
  __shalemArztTermine?: Arzttermin[];
};
const g = globalThis as unknown as GlobalShape;
const krankmeldungen: Krankmeldung[] = g.__shalemKrankmeldungen ?? [];
const termine: Arzttermin[] = g.__shalemArztTermine ?? [];
if (!g.__shalemKrankmeldungen) g.__shalemKrankmeldungen = krankmeldungen;
if (!g.__shalemArztTermine) g.__shalemArztTermine = termine;

// ─── Krankmeldung ─────────────────────────────────────────

export function listKrankmeldungenForPerson(personId: string): Krankmeldung[] {
  return krankmeldungen
    .filter((k) => k.personId === personId)
    .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
}

export function listKrankmeldungenForEinrichtung(einrichtungId: string): Krankmeldung[] {
  return krankmeldungen
    .filter((k) => k.einrichtungId === einrichtungId)
    .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
}

export function listAktiveKrankmeldungen(): Krankmeldung[] {
  return krankmeldungen.filter((k) => k.status !== "wieder_arbeitsfaehig");
}

export function getKrankmeldung(id: string): Krankmeldung | null {
  return krankmeldungen.find((k) => k.id === id) ?? null;
}

export function findActiveKrankmeldungForPerson(personId: string, ref: Date = new Date()): Krankmeldung | null {
  const day = ref.toISOString().slice(0, 10);
  return (
    krankmeldungen.find(
      (k) =>
        k.personId === personId &&
        k.status !== "wieder_arbeitsfaehig" &&
        k.vonDatum <= day &&
        (k.bisDatum ?? k.voraussichtlichBis) >= day,
    ) ?? null
  );
}

export function createKrankmeldung(
  input: Omit<Krankmeldung, "id" | "status" | "erstelltAm" | "aktualisiertAm" | "verlauf">,
): Krankmeldung {
  const now = new Date().toISOString();
  const k: Krankmeldung = {
    ...input,
    id: `km-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "gemeldet",
    erstelltAm: now,
    aktualisiertAm: now,
    verlauf: [{ event: "krankmeldung_erstellt", at: now }],
  };
  krankmeldungen.push(k);
  return k;
}

export function updateKrankmeldungStatus(id: string, status: SicknessStatus, meta?: string): Krankmeldung | null {
  const k = krankmeldungen.find((x) => x.id === id);
  if (!k) return null;
  k.status = status;
  k.aktualisiertAm = new Date().toISOString();
  k.verlauf.push({ event: `status:${status}`, at: k.aktualisiertAm, meta });
  return k;
}

export function setBisDatum(id: string, bisDatum: string): Krankmeldung | null {
  const k = krankmeldungen.find((x) => x.id === id);
  if (!k) return null;
  k.bisDatum = bisDatum;
  k.aktualisiertAm = new Date().toISOString();
  k.verlauf.push({ event: "bis_datum_aktualisiert", at: k.aktualisiertAm, meta: bisDatum });
  return k;
}

export function attachEAU(id: string, eauReferenz: string): Krankmeldung | null {
  const k = krankmeldungen.find((x) => x.id === id);
  if (!k) return null;
  k.krankenkasse = {
    ...(k.krankenkasse ?? { name: "—", ikNummer: "—", eauVersendet: false }),
    eauReferenz,
    eauVersendet: true,
    eauVersendetAm: new Date().toISOString(),
  };
  k.status = "au_eingegangen";
  k.aktualisiertAm = new Date().toISOString();
  k.verlauf.push({ event: "eau_eingegangen", at: k.aktualisiertAm, meta: eauReferenz });
  return k;
}

export function attachArzttermin(km: string, terminId: string): Krankmeldung | null {
  const k = krankmeldungen.find((x) => x.id === km);
  if (!k) return null;
  k.arzttermineRef = [...(k.arzttermineRef ?? []), terminId];
  k.aktualisiertAm = new Date().toISOString();
  k.verlauf.push({ event: "arzttermin_verknuepft", at: k.aktualisiertAm, meta: terminId });
  return k;
}

// ─── Arzttermine ──────────────────────────────────────────

export function listArzttermineForPerson(personId: string): Arzttermin[] {
  return termine
    .filter((t) => t.personId === personId)
    .sort((a, b) => a.zeitslot.localeCompare(b.zeitslot));
}

export function getArzttermin(id: string): Arzttermin | null {
  return termine.find((t) => t.id === id) ?? null;
}

export function createArzttermin(input: Omit<Arzttermin, "id" | "erstelltAm">): Arzttermin {
  const t: Arzttermin = {
    ...input,
    id: `at-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    erstelltAm: new Date().toISOString(),
  };
  termine.push(t);
  return t;
}

export function updateArzttermineStatus(id: string, status: ArzttermineStatus, ergebnis?: Arzttermin["ergebnis"]): Arzttermin | null {
  const t = termine.find((x) => x.id === id);
  if (!t) return null;
  t.status = status;
  if (ergebnis) t.ergebnis = ergebnis;
  return t;
}

// ─── Demo-Seed ────────────────────────────────────────────

let _seeded = false;
export function seedKrankmeldungOnce() {
  if (_seeded) return;
  _seeded = true;
  // Keine vorhandene Krankmeldung — Demo startet leer, damit die UI
  // die "Erstanlage" zeigen kann.
}
