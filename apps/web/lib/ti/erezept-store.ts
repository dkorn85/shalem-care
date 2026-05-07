// eRezept-Pilot · Phase A in-memory.
//
// Das echte eRezept braucht: HBA-Karte (Komfortsignatur), gematik-
// Token-Service, Apotheken-Empfänger-Liste, FHIR-MedicationRequest mit
// KBV-Profilen.
//
// Hier: Store + Stub-Token-Generator + FHIR-MedicationRequest-Bundle,
// damit das Cockpit demonstrieren kann, was an die TI ginge.

import type { FhirBundle } from "./fhir-bundle";

export type ErezeptStatus =
  | "entwurf"
  | "signiert"           // mit HBA signiert · liegt im FdV
  | "im-fdv"             // im Fachdienst der gematik
  | "abgerufen"          // Apotheke hat eingelöst
  | "abgegeben"          // Medikament ausgegeben
  | "abgerechnet"
  | "geloescht";         // gelöscht durch Versicherten

export type Verordnungsart = "kassenrezept" | "privatrezept" | "btm" | "tcoa" | "entlassrezept";

export type Erezept = {
  id: string;
  /** gematik-Token · 7-stellig + Prüfziffer + UUID-Suffix */
  gematikToken: string;
  /** AccessCode — wird der Apotheke übergeben */
  accessCode: string;
  art: Verordnungsart;
  ausstellerId: string;
  ausstellerLanr: string;
  ausstellerBsnr: string;
  klientId: string;
  versichertenNr: string;
  krankenkasse: string;
  krankenkasseIk: string;
  /** Pharmazentralnummer */
  pzn: string;
  /** Handelsname Medikament */
  medikament: string;
  darreichungsform: string;
  packungsgroesse: "N1" | "N2" | "N3";
  /** Anzahl Packungen */
  anzahl: number;
  dosierung: string;
  /** ICD-10-Diagnose */
  diagnose: string;
  status: ErezeptStatus;
  ausgestellt: string;
  gueltigBis: string;
  /** Apotheken-Empfänger nach Einlösung */
  apothekeName?: string;
  apothekeIk?: string;
  abgerufen?: string;
  abgegeben?: string;
  /** Wirtschaftlichkeit-Hinweis (Aut-idem-Kreuz) */
  autIdem: boolean;
};

type State = { rezepte: Erezept[]; seeded: boolean };
type GlobalShape = { __shalemErezepte?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemErezepte) g.__shalemErezepte = { rezepte: [], seeded: false };
const s = g.__shalemErezepte!;

// ─── Token-Generator (Stub) ─────────────────────────────────────

function makeToken(): { token: string; accessCode: string } {
  const heute = Date.now().toString(16).slice(-7).toUpperCase();
  const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
  const uuid = crypto.randomUUID().slice(0, 8);
  return {
    token: `160.000.${heute}.${rand}.${uuid}`,
    accessCode: rand.slice(0, 6),
  };
}

// ─── Read ───────────────────────────────────────────────────────

export function listErezepte(): Erezept[] {
  return [...s.rezepte].sort((a, b) => b.ausgestellt.localeCompare(a.ausgestellt));
}

export function getErezept(id: string): Erezept | null {
  return s.rezepte.find((r) => r.id === id) ?? null;
}

export function listErezepteFuerArzt(arztId: string): Erezept[] {
  return listErezepte().filter((r) => r.ausstellerId === arztId);
}

// ─── Write ──────────────────────────────────────────────────────

export function erstelleErezept(
  input: Omit<Erezept, "id" | "gematikToken" | "accessCode" | "status">,
): Erezept {
  const { token, accessCode } = makeToken();
  const r: Erezept = {
    ...input,
    id: `erp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    gematikToken: token,
    accessCode,
    status: "entwurf",
  };
  s.rezepte.push(r);
  return r;
}

export function setErezeptStatus(id: string, status: ErezeptStatus): Erezept | null {
  const r = s.rezepte.find((x) => x.id === id);
  if (!r) return null;
  r.status = status;
  if (status === "abgerufen") r.abgerufen = new Date().toISOString();
  if (status === "abgegeben") r.abgegeben = new Date().toISOString();
  return r;
}

// ─── FHIR-MedicationRequest-Bundle ──────────────────────────────

export function erzeugeErezeptBundle(r: Erezept): FhirBundle {
  const heute = new Date().toISOString();
  return {
    resourceType: "Bundle",
    id: `bundle-${r.id}`,
    meta: {
      profile: ["https://gematik.de/fhir/erp/StructureDefinition/GEM_ERP_PR_Bundle|1.3"],
      lastUpdated: heute,
    },
    type: "document",
    timestamp: heute,
    entry: [
      {
        fullUrl: `urn:uuid:composition-${r.id}`,
        resource: {
          resourceType: "Composition",
          id: `comp-${r.id}`,
          status: "final",
          type: { coding: [{ system: "https://fhir.kbv.de/CodeSystem/KBV_CS_SFHIR_KBV_FORMULAR_ART", code: "e16A" }] },
          subject: { reference: `Patient/${r.klientId}` },
          author: [{ reference: `Practitioner/${r.ausstellerId}` }],
          date: heute,
          extension: [
            {
              url: "https://fhir.kbv.de/StructureDefinition/KBV_EX_FOR_Legal_basis",
              valueCoding: { code: r.art === "btm" ? "01" : "00" },
            },
          ],
        },
      },
      {
        fullUrl: `MedicationRequest/${r.id}`,
        resource: {
          resourceType: "MedicationRequest",
          id: r.id,
          meta: { profile: ["https://fhir.kbv.de/StructureDefinition/KBV_PR_ERP_Prescription|1.1"] },
          status: r.status === "entwurf" ? "draft" : "active",
          intent: "order",
          subject: { reference: `Patient/${r.klientId}` },
          authoredOn: r.ausgestellt,
          requester: { reference: `Practitioner/${r.ausstellerId}` },
          dispenseRequest: { quantity: { value: r.anzahl, unit: "Packung" } },
          dosageInstruction: [{ text: r.dosierung }],
          substitution: { allowedBoolean: !r.autIdem },
          medicationReference: { reference: `Medication/med-${r.id}` },
          reasonCode: [{ coding: [{ system: "http://fhir.de/CodeSystem/dimdi/icd-10-gm", code: r.diagnose }] }],
          extension: [
            {
              url: "https://gematik.de/fhir/erp/StructureDefinition/GEM_ERP_EX_Token",
              valueString: r.gematikToken,
            },
          ],
        },
      },
      {
        fullUrl: `Medication/med-${r.id}`,
        resource: {
          resourceType: "Medication",
          id: `med-${r.id}`,
          meta: { profile: ["https://fhir.kbv.de/StructureDefinition/KBV_PR_ERP_Medication_PZN|1.1"] },
          code: { coding: [{ system: "http://fhir.de/CodeSystem/ifa/pzn", code: r.pzn, display: r.medikament }] },
          form: { text: r.darreichungsform },
          amount: { numerator: { value: r.anzahl, unit: r.packungsgroesse } },
        },
      },
      {
        fullUrl: `Patient/${r.klientId}`,
        resource: {
          resourceType: "Patient",
          id: r.klientId,
          identifier: [{ system: "http://fhir.de/sid/gkv/kvid-10", value: r.versichertenNr }],
        },
      },
      {
        fullUrl: `Practitioner/${r.ausstellerId}`,
        resource: {
          resourceType: "Practitioner",
          id: r.ausstellerId,
          identifier: [{ system: "https://fhir.kbv.de/NamingSystem/KBV_NS_Base_ANR", value: r.ausstellerLanr }],
        },
      },
      {
        fullUrl: `Coverage/cov-${r.id}`,
        resource: {
          resourceType: "Coverage",
          id: `cov-${r.id}`,
          status: "active",
          type: { coding: [{ system: "http://fhir.de/CodeSystem/versicherungsart-de-basis", code: "GKV" }] },
          beneficiary: { reference: `Patient/${r.klientId}` },
          payor: [
            {
              display: r.krankenkasse,
              identifier: { system: "http://fhir.de/sid/arge-ik/iknr", value: r.krankenkasseIk },
            },
          ],
        },
      },
    ],
  };
}

// ─── Demo-Seed ──────────────────────────────────────────────────

export function seedErezepteOnce() {
  if (s.seeded) return;
  s.seeded = true;

  const heute = new Date();
  const vor = (n: number) => {
    const d = new Date(heute);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const inN = (n: number) => {
    const d = new Date(heute);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  // R1: Helga · Metformin · im FdV
  erstelleErezept({
    art: "kassenrezept",
    ausstellerId: "person-arzt-001",
    ausstellerLanr: "999999900",
    ausstellerBsnr: "999999901",
    klientId: "klient-hr",
    versichertenNr: "X123456789",
    krankenkasse: "AOK Rheinland/Hamburg",
    krankenkasseIk: "108310400",
    pzn: "11530493",
    medikament: "Metformin AL 1000 mg",
    darreichungsform: "Filmtabletten",
    packungsgroesse: "N3",
    anzahl: 1,
    dosierung: "1-0-1, mit den Mahlzeiten einnehmen",
    diagnose: "E11.9",
    autIdem: false,
    ausgestellt: vor(2),
    gueltigBis: inN(28),
  });
  s.rezepte[s.rezepte.length - 1].status = "im-fdv";

  // R2: Helga · Ramipril · abgerufen + abgegeben
  erstelleErezept({
    art: "kassenrezept",
    ausstellerId: "person-arzt-001",
    ausstellerLanr: "999999900",
    ausstellerBsnr: "999999901",
    klientId: "klient-hr",
    versichertenNr: "X123456789",
    krankenkasse: "AOK Rheinland/Hamburg",
    krankenkasseIk: "108310400",
    pzn: "06149927",
    medikament: "Ramipril 5 mg HEXAL",
    darreichungsform: "Tabletten",
    packungsgroesse: "N3",
    anzahl: 1,
    dosierung: "1-0-0, morgens vor dem Frühstück",
    diagnose: "I10.0",
    autIdem: false,
    ausgestellt: vor(7),
    gueltigBis: inN(23),
  });
  const r2 = s.rezepte[s.rezepte.length - 1];
  r2.status = "abgegeben";
  r2.apothekeName = "Sonnen-Apotheke Essen";
  r2.apothekeIk = "300819203";
  r2.abgerufen = vor(5) + "T10:21:00";
  r2.abgegeben = vor(5) + "T11:05:00";

  // R3: Wilhelm · Insulin · BTM (Aut-idem)
  erstelleErezept({
    art: "kassenrezept",
    ausstellerId: "person-arzt-001",
    ausstellerLanr: "999999900",
    ausstellerBsnr: "999999901",
    klientId: "klient-wb",
    versichertenNr: "Y987654321",
    krankenkasse: "BARMER",
    krankenkasseIk: "104940005",
    pzn: "16235870",
    medikament: "NovoRapid Penfill 100 E/ml",
    darreichungsform: "Injektionslsg.",
    packungsgroesse: "N3",
    anzahl: 1,
    dosierung: "Nach BZ-Tabelle, Korrekturschema beachten",
    diagnose: "E11.9",
    autIdem: true,
    ausgestellt: vor(1),
    gueltigBis: inN(29),
  });
  s.rezepte[s.rezepte.length - 1].status = "signiert";
}
