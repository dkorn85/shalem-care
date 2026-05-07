// Cloud-Recording-Metadaten + FHIR-Encounter für Konferenzen.
//
// Eine Fallbesprechung wird auf Wunsch aufgezeichnet (lokal mit
// MediaRecorder oder serverseitig über LiveKit-Egress). Die Aufzeichnung
// + Audit-Trail werden als FHIR-Encounter-Resource modelliert, damit sie
// wie jede andere medizinische Begegnung in die Krankenakte einfließen.
//
// Phase A:
//   - Recording-Metadaten in-memory (Konferenz-ID + Start/Ende + Größe)
//   - FHIR-Encounter-Generator (R4 Profile)
//   - Retention-Policy-Stub (30/90/365 Tage je nach Anlass)
//
// Phase B:
//   - LiveKit-Egress oder Browser-MediaRecorder → Supabase Storage
//   - DocumentReference-Resourcen für die Audio/Video-Datei
//   - eIDAS-Signatur über das Encounter-Bundle
//   - Auto-Cleanup nach Retention-Frist

import type { AuditEvent } from "./fallbesprechung";

export type RetentionGrund =
  | "fall-konferenz"        // 90 Tage · Standard-Pflegekonferenz
  | "audit-md"              // 365 Tage · MD-Begutachtung
  | "schulung"              // 365 Tage · Pflicht-Fortbildung
  | "general-versammlung"   // permanent · GenG-Pflicht (Protokoll)
  | "ad-hoc";               // 30 Tage · spontane Diskussion

export const RETENTION_TAGE: Record<RetentionGrund, number | "permanent"> = {
  "fall-konferenz": 90,
  "audit-md": 365,
  schulung: 365,
  "general-versammlung": "permanent",
  "ad-hoc": 30,
};

export type RecordingFormat = "audio-mp3" | "video-mp4" | "video-webm" | "transcript-json";

export type Recording = {
  id: string;
  konferenzId: string;
  klientId?: string;
  /** Anlass · bestimmt Retention */
  anlass: RetentionGrund;
  /** Wann gestartet/beendet */
  start: string;
  ende: string;
  dauerSek: number;
  /** Format(e) gespeichert */
  formate: RecordingFormat[];
  /** Größe in MB */
  groesseMb: number;
  /** Storage-Pfad (Phase B: Supabase) */
  storagePfad?: string;
  /** Hash über die Datei für Integrität */
  hash?: string;
  /** Aufzeichnung-Modus */
  modus: "browser-mediarecorder" | "livekit-egress" | "stub";
  /** Wer hat aufgezeichnet (Recording-Owner) */
  recorderId: string;
  /** Wer hat zugestimmt (alle Teilnehmer-IDs) */
  zustimmungIds: string[];
  /** Audit-Events während der Aufzeichnung */
  audit: AuditEvent[];
  /** Berechnetes Lösch-Datum */
  loeschungAm: string;
  /** Status */
  status: "aktiv" | "fertig" | "in-pruefung" | "geloescht";
};

export function berechneLoeschung(start: string, anlass: RetentionGrund): string {
  const tage = RETENTION_TAGE[anlass];
  if (tage === "permanent") return "9999-12-31";
  const d = new Date(start);
  d.setDate(d.getDate() + tage);
  return d.toISOString().slice(0, 10);
}

// ─── Store · Phase A in-memory ──────────────────────────────────

type State = { recordings: Recording[]; seeded: boolean };
type GlobalShape = { __shalemRecording?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemRecording) g.__shalemRecording = { recordings: [], seeded: false };
const s = g.__shalemRecording!;

export function listRecordings(): Recording[] {
  return [...s.recordings].sort((a, b) => b.start.localeCompare(a.start));
}

export function getRecording(id: string): Recording | null {
  return s.recordings.find((r) => r.id === id) ?? null;
}

export function erstelleRecording(input: Omit<Recording, "id" | "loeschungAm" | "status">): Recording {
  const r: Recording = {
    ...input,
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    loeschungAm: berechneLoeschung(input.start, input.anlass),
    status: "fertig",
  };
  s.recordings.push(r);
  return r;
}

// ─── FHIR-Encounter-Generator ───────────────────────────────────

export type FhirEncounter = Record<string, unknown>;

export function erzeugeEncounter(r: Recording): FhirEncounter {
  return {
    resourceType: "Encounter",
    id: `enc-${r.id}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1"],
      lastUpdated: r.ende,
    },
    status: r.status === "geloescht" ? "entered-in-error" : "finished",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: r.anlass === "general-versammlung" ? "VR" : "AMB",
      display: r.anlass === "general-versammlung" ? "Virtual" : "Ambulatory",
    },
    type: [
      {
        coding: [
          {
            system: "https://shalem.care/fhir/encounter-type",
            code: r.anlass,
            display: anlassLabel(r.anlass),
          },
        ],
      },
    ],
    subject: r.klientId ? { reference: `Patient/${r.klientId}` } : undefined,
    period: {
      start: r.start,
      end: r.ende,
    },
    length: {
      value: Math.round(r.dauerSek / 60),
      unit: "min",
      system: "http://unitsofmeasure.org",
      code: "min",
    },
    participant: r.zustimmungIds.map((pid) => ({
      type: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType", code: "CON", display: "Consultant" }] }],
      individual: { reference: `Practitioner/${pid}` },
    })),
    reasonCode: [
      {
        text: anlassLabel(r.anlass),
      },
    ],
    extension: [
      {
        url: "https://shalem.care/fhir/recording-meta",
        extension: [
          { url: "konferenzId", valueString: r.konferenzId },
          { url: "modus", valueString: r.modus },
          { url: "groesseMb", valueDecimal: r.groesseMb },
          { url: "loeschungAm", valueDate: r.loeschungAm },
          { url: "hash", valueString: r.hash ?? "—" },
        ],
      },
    ],
  };
}

// ─── DocumentReference für die Datei ────────────────────────────

export function erzeugeDocumentReference(r: Recording): FhirEncounter {
  return {
    resourceType: "DocumentReference",
    id: `dr-${r.id}`,
    status: r.status === "geloescht" ? "superseded" : "current",
    type: {
      coding: [
        {
          system: "http://loinc.org",
          code: "11488-4",
          display: "Consult note",
        },
      ],
    },
    subject: r.klientId ? { reference: `Patient/${r.klientId}` } : undefined,
    date: r.ende,
    content: r.formate.map((format) => ({
      attachment: {
        contentType:
          format === "audio-mp3"
            ? "audio/mpeg"
            : format === "video-mp4"
              ? "video/mp4"
              : format === "video-webm"
                ? "video/webm"
                : "application/json",
        url: r.storagePfad ?? "supabase://recordings/" + r.id + "." + format.split("-")[1],
        size: Math.round(r.groesseMb * 1024 * 1024),
        hash: r.hash ?? undefined,
        title: `Konferenz ${r.konferenzId} · ${format}`,
      },
      format: { display: format },
    })),
    context: {
      encounter: [{ reference: `Encounter/enc-${r.id}` }],
      period: { start: r.start, end: r.ende },
    },
  };
}

// ─── Hilfsfunktionen ────────────────────────────────────────────

export function anlassLabel(a: RetentionGrund): string {
  const map: Record<RetentionGrund, string> = {
    "fall-konferenz": "Interdisziplinäre Fallkonferenz",
    "audit-md": "MD-Audit · Begutachtung",
    schulung: "Pflicht-Fortbildung",
    "general-versammlung": "Generalversammlung eG",
    "ad-hoc": "Ad-hoc-Gespräch",
  };
  return map[a];
}

// ─── Demo-Seed ──────────────────────────────────────────────────

export function seedRecordingOnce() {
  if (s.seeded) return;
  s.seeded = true;

  const heute = new Date();
  const vor = (n: number, h = 0) => {
    const d = new Date(heute);
    d.setDate(d.getDate() - n);
    if (h) d.setHours(d.getHours() - h);
    return d.toISOString();
  };

  // R1: Fallkonferenz Helga Q2 · 35 Min
  s.recordings.push({
    id: "rec-helga-q2",
    konferenzId: "konf-helga-q2",
    klientId: "klient-hr",
    anlass: "fall-konferenz",
    start: vor(0, 2),
    ende: vor(0, 1),
    dauerSek: 35 * 60,
    formate: ["video-webm", "transcript-json"],
    groesseMb: 142.4,
    storagePfad: "supabase://shalem-recordings/konf-helga-q2.webm",
    hash: "sha256:a4f2…7c8b",
    modus: "browser-mediarecorder",
    recorderId: "person-de1",
    zustimmungIds: ["person-de1", "person-arzt-001", "person-therapeut-001", "person-dr"],
    audit: [],
    loeschungAm: berechneLoeschung(vor(0, 2), "fall-konferenz"),
    status: "fertig",
  });

  // R2: MD-Audit · 90 Min
  s.recordings.push({
    id: "rec-md-audit-2026-q1",
    konferenzId: "audit-md-q1-2026",
    anlass: "audit-md",
    start: vor(45),
    ende: vor(45, -90),
    dauerSek: 90 * 60,
    formate: ["audio-mp3", "transcript-json"],
    groesseMb: 88.7,
    storagePfad: "supabase://shalem-recordings/md-audit-2026-q1.mp3",
    hash: "sha256:c1e9…d2f5",
    modus: "stub",
    recorderId: "person-de1",
    zustimmungIds: ["person-de1", "md-007", "md-014"],
    audit: [],
    loeschungAm: berechneLoeschung(vor(45), "audit-md"),
    status: "fertig",
  });

  // R3: Generalversammlung · permanent · 130 Min
  s.recordings.push({
    id: "rec-gv-2025",
    konferenzId: "gv-eg-2025",
    anlass: "general-versammlung",
    start: vor(120),
    ende: vor(120, -130),
    dauerSek: 130 * 60,
    formate: ["video-mp4", "audio-mp3", "transcript-json"],
    groesseMb: 1240.5,
    storagePfad: "supabase://shalem-recordings/gv-eg-2025.mp4",
    hash: "sha256:9b6d…f3a1",
    modus: "stub",
    recorderId: "person-de1",
    zustimmungIds: ["person-de1", "person-dr", "person-ls", "person-as-005", "person-tg-lead", "person-arzt-001"],
    audit: [],
    loeschungAm: "9999-12-31",
    status: "fertig",
  });
}
