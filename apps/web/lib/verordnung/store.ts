// In-Memory Anfragen-Store. Phase 2: FHIR ServiceRequest +
// MedicationRequest auf Medplum, eRezept-Pipeline via gematik.

import type { VerordnungsAnfrage, AnfrageStatus } from "./types";

type GlobalShape = { __shalemVerordnungsAnfragen?: VerordnungsAnfrage[] };
const g = globalThis as unknown as GlobalShape;
const anfragen: VerordnungsAnfrage[] = g.__shalemVerordnungsAnfragen ?? [];
if (!g.__shalemVerordnungsAnfragen) g.__shalemVerordnungsAnfragen = anfragen;

export function listAnfragen(filter?: { klientId?: string; arztId?: string; status?: AnfrageStatus[] }): VerordnungsAnfrage[] {
  return anfragen
    .filter((a) => !filter?.klientId || a.klientId === filter.klientId)
    .filter((a) => !filter?.arztId || a.arztId === filter.arztId)
    .filter((a) => !filter?.status || filter.status.includes(a.status))
    .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
}

export function listOffeneFuerArzt(arztId: string): VerordnungsAnfrage[] {
  return listAnfragen({ arztId, status: ["offen", "in_pruefung", "rueckfrage"] });
}

export function getAnfrage(id: string): VerordnungsAnfrage | null {
  return anfragen.find((a) => a.id === id) ?? null;
}

export function createAnfrage(
  input: Omit<VerordnungsAnfrage, "id" | "status" | "erstelltAm" | "aktualisiertAm" | "verlauf">,
): VerordnungsAnfrage {
  const now = new Date().toISOString();
  const a: VerordnungsAnfrage = {
    ...input,
    id: `va-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "offen",
    erstelltAm: now,
    aktualisiertAm: now,
    verlauf: [{ event: "anfrage_erstellt", at: now, actor: input.anfragendeId }],
  };
  anfragen.push(a);
  return a;
}

export function updateAnfrageStatus(
  id: string,
  status: AnfrageStatus,
  actor: string,
  meta?: { notizenArzt?: string; ausgestellteVerordnungId?: string; eRezeptCode?: string },
): VerordnungsAnfrage | null {
  const a = anfragen.find((x) => x.id === id);
  if (!a) return null;
  a.status = status;
  a.aktualisiertAm = new Date().toISOString();
  if (meta?.notizenArzt !== undefined) a.notizenArzt = meta.notizenArzt;
  if (meta?.ausgestellteVerordnungId) a.ausgestellteVerordnungId = meta.ausgestellteVerordnungId;
  if (meta?.eRezeptCode) a.eRezeptCode = meta.eRezeptCode;
  if (status === "ausgestellt" || status === "abgelehnt") a.geschlossenAm = a.aktualisiertAm;
  a.verlauf.push({ event: `status:${status}`, at: a.aktualisiertAm, actor, meta: meta?.notizenArzt });
  return a;
}

// ─── Demo-Seed ────────────────────────────────────────────

let _seeded = false;
export function seedAnfragenOnce() {
  if (_seeded) return;
  _seeded = true;
  if (anfragen.length > 0) return;

  const now = new Date();
  const isoMinus = (h: number) => {
    const d = new Date(now); d.setHours(d.getHours() - h); return d.toISOString();
  };

  const seed: Omit<VerordnungsAnfrage, "id">[] = [
    {
      klientId: "klient-wb",
      anfragendeRolle: "pflege",
      anfragendeId: "person-fk-004",
      anfragendeName: "Mara Klink",
      arztId: "person-arzt-001",
      arztName: "Dr. Hartmann",
      fachrichtung: "Allgemeinmedizin",
      kategorie: "haeusl_pflege",
      wunsch: {
        kategorie: "haeusl_pflege",
        module: [
          { code: "HKP-31", haeufigkeitProTag: 1, tage: "Mo–So" },
          { code: "HKP-33", haeufigkeitProTag: 1, tage: "Mo, Mi, Fr" },
        ],
      },
      begruendung:
        "Wundverlauf Ferse rechts seit 5 Wochen, leichter Belag persistierend. Verbandwechsel + Tablettenstellung aktuell ärztlich noch nicht verordnet — Folgeverordnung erforderlich.",
      dringlichkeit: "dringlich",
      status: "offen",
      erstelltAm: isoMinus(3),
      aktualisiertAm: isoMinus(3),
      verlauf: [{ event: "anfrage_erstellt", at: isoMinus(3), actor: "person-fk-004" }],
    },
    {
      klientId: "klient-eg",
      anfragendeRolle: "pflege",
      anfragendeId: "person-as-005",
      anfragendeName: "Aysel Sayin",
      arztId: "person-arzt-001",
      arztName: "Dr. Hartmann",
      kategorie: "medikament",
      wunsch: {
        kategorie: "medikament",
        wirkstoff: "Mirtazapin",
        staerke: "15 mg",
        dosierung: "0-0-1",
        menge: "30 Tbl N1",
      },
      begruendung:
        "Frau Gramberg lehnt Citalopram seit drei Tagen ab. Mirtazapin als Alternative zur Stimmungs- und Schlafregulation überlegen — palliativ-geriatrisch zugelassen.",
      dringlichkeit: "routine",
      status: "in_pruefung",
      erstelltAm: isoMinus(20),
      aktualisiertAm: isoMinus(2),
      verlauf: [
        { event: "anfrage_erstellt", at: isoMinus(20), actor: "person-as-005" },
        { event: "status:in_pruefung", at: isoMinus(2), actor: "person-arzt-001" },
      ],
    },
    {
      klientId: "klient-hr",
      anfragendeRolle: "klient",
      anfragendeId: "klient-hr",
      anfragendeName: "Helga Reinhardt",
      arztId: "person-arzt-002",
      arztName: "Dr. Vasilev",
      fachrichtung: "Neurologie",
      kategorie: "heilmittel",
      wunsch: {
        kategorie: "heilmittel",
        modulCode: "KG",
        einheiten: 10,
        frequenzProWoche: 2,
        dauerWochen: 5,
      },
      begruendung:
        "Mobilität verbessert sich (siehe Doku 30 m am Stück). Krankengymnastik soll Sturzrisiko weiter reduzieren — Otago-Programm angedacht.",
      dringlichkeit: "routine",
      status: "offen",
      erstelltAm: isoMinus(36),
      aktualisiertAm: isoMinus(36),
      verlauf: [{ event: "anfrage_erstellt", at: isoMinus(36), actor: "klient-hr" }],
    },
  ];

  for (const a of seed) anfragen.push({ ...a, id: `va-seed-${anfragen.length}` });
}
