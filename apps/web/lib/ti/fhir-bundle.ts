// FHIR-Bundle-Generator für KIM-Mail-Versand · Phase A.
//
// Erzeugt einen FHIR-R4-Bundle vom Typ "message" (KBV-AM-EVB Profil) für
// HKP-Verordnungen, eRezept oder andere TI-Workflows. Das Bundle ist das,
// was tatsächlich als signierter S/MIME-Anhang in eine KIM-Mail geht.
//
// Profile-Referenzen:
//   - KBV_PR_EVDGA_HKP_Verordnung 1.0
//   - KBV_PR_ERP_Bundle 1.1
//   - de.medizininformatikinitiative.kerndatensatz.medikation 2.0
//
// Phase B: echte Validierung gegen die KBV-Profile, S/MIME-Signatur via
// SMC-B + HBA, Versand über KIM-Konnektor-API.

import type { Verordnung } from "@/lib/pvs/eVerordnung/types";

export type FhirBundle = {
  resourceType: "Bundle";
  id: string;
  meta: { profile: string[]; lastUpdated: string };
  type: "message" | "document";
  timestamp: string;
  entry: FhirEntry[];
};

type FhirEntry = {
  fullUrl: string;
  resource: Record<string, unknown>;
};

// ─── HKP-Verordnungs-Bundle ─────────────────────────────────────

export function erzeugeHkpBundle(v: Verordnung): FhirBundle {
  const heute = new Date().toISOString();
  const bundleId = `bundle-${v.id}`;

  const messageHeader: Record<string, unknown> = {
    resourceType: "MessageHeader",
    id: `mh-${v.id}`,
    eventCoding: {
      system: "https://gematik.de/fhir/erp/CodeSystem/Action",
      code: "evdga-action",
      display: "Versand HKP-Verordnung an Pflegekasse",
    },
    source: {
      software: "Shalem Care PVS",
      version: "0.12",
      endpoint: `kim:Shalem.Care@arz.kim.telematik`,
    },
    destination: [
      {
        endpoint: `kim:Pflegekasse.${v.versichertenStatus?.iknr ?? "unbekannt"}@kim.telematik`,
      },
    ],
    focus: [{ reference: `ServiceRequest/${v.id}` }],
  };

  const serviceRequest: Record<string, unknown> = {
    resourceType: "ServiceRequest",
    id: v.id,
    meta: { profile: ["https://fhir.kbv.de/StructureDefinition/KBV_PR_EVDGA_HKP_Verordnung|1.0"] },
    status: "active",
    intent: "order",
    category: [
      { coding: [{ system: "https://fhir.kbv.de/CodeSystem/KBV_CS_EVDGA_HKP_Kategorie", code: "primary", display: "Häusliche Krankenpflege" }] },
    ],
    code: {
      coding: [
        {
          system: "https://fhir.kbv.de/CodeSystem/KBV_CS_EVDGA_HKP_Ziffern",
          code: v.leistung.code,
          display: v.leistung.bezeichnung,
        },
      ],
      text: v.leistung.bezeichnung,
    },
    subject: { reference: `Patient/${v.klientId}` },
    requester: { reference: `Practitioner/${v.ausstellerId}` },
    authoredOn: v.datumAusstellung,
    occurrencePeriod: {
      start: v.datumAusstellung,
      end: v.datumGueltigBis,
    },
    quantityQuantity: {
      value: v.leistung.dauerWochen ?? 4,
      unit: "Woche",
      system: "http://unitsofmeasure.org",
      code: "wk",
    },
    reasonCode: v.diagnosen.map((d) => ({
      coding: [{ system: "http://fhir.de/CodeSystem/dimdi/icd-10-gm", code: d }],
    })),
    note: [{ text: v.begruendung }],
    extension: v.leistung.haeufigkeit
      ? [
          {
            url: "https://fhir.kbv.de/StructureDefinition/KBV_EX_EVDGA_HKP_Haeufigkeit",
            valueString: v.leistung.haeufigkeit,
          },
        ]
      : undefined,
  };

  const patient: Record<string, unknown> = {
    resourceType: "Patient",
    id: v.klientId,
    identifier: v.versichertenStatus
      ? [
          {
            system: "http://fhir.de/sid/gkv/kvid-10",
            value: v.versichertenStatus.versichertenNr,
          },
        ]
      : [],
  };

  const practitioner: Record<string, unknown> = {
    resourceType: "Practitioner",
    id: v.ausstellerId,
    identifier: v.ausstellerLanr
      ? [
          {
            system: "https://fhir.kbv.de/NamingSystem/KBV_NS_Base_ANR",
            value: v.ausstellerLanr,
          },
        ]
      : [],
  };

  const coverage: Record<string, unknown> | null = v.versichertenStatus
    ? {
        resourceType: "Coverage",
        id: `cov-${v.id}`,
        status: "active",
        type: { coding: [{ system: "http://fhir.de/CodeSystem/versicherungsart-de-basis", code: "GKV" }] },
        beneficiary: { reference: `Patient/${v.klientId}` },
        payor: [
          {
            display: v.versichertenStatus.krankenkasse,
            identifier: { system: "http://fhir.de/sid/arge-ik/iknr", value: v.versichertenStatus.iknr },
          },
        ],
      }
    : null;

  const entry: FhirEntry[] = [
    { fullUrl: `urn:uuid:${messageHeader.id}`, resource: messageHeader },
    { fullUrl: `ServiceRequest/${v.id}`, resource: serviceRequest },
    { fullUrl: `Patient/${v.klientId}`, resource: patient },
    { fullUrl: `Practitioner/${v.ausstellerId}`, resource: practitioner },
  ];
  if (coverage) entry.push({ fullUrl: `Coverage/cov-${v.id}`, resource: coverage });

  return {
    resourceType: "Bundle",
    id: bundleId,
    meta: {
      profile: ["https://fhir.kbv.de/StructureDefinition/KBV_PR_EVDGA_Bundle|1.0"],
      lastUpdated: heute,
    },
    type: "message",
    timestamp: heute,
    entry,
  };
}

// ─── S/MIME-Container-Vorschau ──────────────────────────────────

export type SMimeContainer = {
  /** Base64-Hash über das FHIR-Bundle (SHA-256) */
  bundleHash: string;
  /** S/MIME-Signatur-Algorithmus */
  signaturAlgo: "SHA256-RSA" | "SHA256-ECDSA";
  /** SMC-B-Aussteller */
  smcbAussteller: string;
  /** SMC-B-Telematik-ID */
  smcbTelematikId: string;
  /** HBA-Aussteller (für Komfortsignatur des HKP) */
  hbaAussteller?: string;
  /** Zertifikats-Gültigkeit */
  zertifikatGueltigBis: string;
  /** PKCS#7-Container-Bytes (Stub-Wert) */
  pkcs7Bytes: number;
  /** Versand-Status */
  versandStatus: "entwurf" | "signiert" | "versendet" | "zugestellt" | "fehler";
};

export function erzeugeSMimePreview(bundle: FhirBundle, v: Verordnung): SMimeContainer {
  const json = JSON.stringify(bundle);
  // Stub-Hash · Phase B mit echter Krypto
  let hash = 0;
  for (let i = 0; i < json.length; i++) hash = ((hash << 5) - hash + json.charCodeAt(i)) | 0;
  const hashHex = (hash >>> 0).toString(16).padStart(8, "0");
  const bundleHash = `${hashHex}…${hashHex.split("").reverse().join("")}`;

  const heute = new Date();
  const inDreiJahren = new Date(heute);
  inDreiJahren.setFullYear(inDreiJahren.getFullYear() + 3);

  return {
    bundleHash: `sha256:${bundleHash}`,
    signaturAlgo: "SHA256-ECDSA",
    smcbAussteller: "medisign GmbH",
    smcbTelematikId: `1-2.${v.ausstellerBsnr ?? "999999901"}`,
    hbaAussteller: v.ausstellerLanr ? "Bundesärztekammer · Heilberufeausweis" : undefined,
    zertifikatGueltigBis: inDreiJahren.toISOString().slice(0, 10),
    pkcs7Bytes: Math.round(json.length * 1.4) + 2048, // Bundle + Signatur + Cert-Chain
    versandStatus: v.kimMessageId ? "zugestellt" : "entwurf",
  };
}
