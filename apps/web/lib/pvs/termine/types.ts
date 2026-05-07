// Cross-Beruf-Termin · ein einziges Termin-Modell für alle Cockpits.
// Basis: FHIR R4 Appointment + Schedule + Slot.
// Pflege-Tour, Arzt-Visite, Therapie-Einheit, Hauswirtschafts-Lieferung,
// Hausmeister-Reparatur — alles dasselbe Datenmodell, nur unterschiedliche
// "Practitioner" und "ServiceCategory".

import type { PvsBeruf } from "@/lib/pvs/matrix";

export type TerminTyp =
  | "pflege-tour"
  | "pflege-haus-besuch"
  | "arzt-visite"
  | "arzt-haus-besuch"
  | "arzt-praxis-termin"
  | "therapie-einheit"
  | "sozial-hilfeplan-gespraech"
  | "heilerziehung-modul"
  | "hauswirtschaft-mahlzeit"
  | "hauswirtschaft-reinigung"
  | "ehrenamt-begleitung"
  | "hausmeister-reparatur"
  | "lieferung-lebensmittel"
  | "lieferung-recycling"
  | "konferenz-fall"
  | "audit-md"
  | "schulung";

export type TerminStatus =
  | "geplant"            // proposed
  | "bestaetigt"         // booked
  | "in-bearbeitung"     // arrived/in-progress
  | "abgeschlossen"      // fulfilled
  | "abgesagt"           // cancelled
  | "verschoben"         // entered-in-error / rescheduled
  | "no-show";

export type Termin = {
  id: string;
  typ: TerminTyp;
  /** Welcher Beruf den Lead hat (entscheidend fürs Cockpit-Routing) */
  leadBeruf: PvsBeruf;
  /** Co-Berufe, die parallel beteiligt sind (z.B. Pflege + Therapie) */
  coBerufe?: PvsBeruf[];
  /** Wer führt durch */
  erbringerIds: string[];
  /** Klient/Patient (kann fehlen bei Reparatur etc.) */
  klientId?: string;
  /** Verordnungs-Referenz (HKP, HMV, eRezept) */
  verordnungId?: string;
  /** Standort (Heim-Adresse, Praxis, Wohngruppe) */
  standort?: { stationId?: string; einrichtungId?: string; adresse?: string };
  /** Zeitfenster */
  start: string; // ISO 8601
  ende: string;
  /** Geplante Dauer in Minuten — Anker für Tour-Optimierung */
  dauerMin: number;
  /** Tatsächliche Anwesenheit (Phase B) */
  startTatsaechlich?: string;
  endeTatsaechlich?: string;
  /** Frei-Text-Anliegen / Tour-Position */
  beschreibung: string;
  status: TerminStatus;
  /** Audit-Trail */
  geaendertAm?: string;
  geaendertVon?: string;
};

export type TerminFilter = {
  beruf?: PvsBeruf;
  klientId?: string;
  status?: TerminStatus[];
  von?: string;
  bis?: string;
};

/**
 * Konflikt-Erkennung: Pflegekraft an zwei Orten gleichzeitig?
 * Phase A: simple Overlap-Logik.
 * Phase B: ArbZG-Validierung (11h Ruhezeit etc.) + Reisedauer berücksichtigen.
 */
export function findeKonflikte(termine: Termin[]): Array<{ a: Termin; b: Termin; grund: string }> {
  const konflikte: Array<{ a: Termin; b: Termin; grund: string }> = [];
  for (let i = 0; i < termine.length; i++) {
    for (let j = i + 1; j < termine.length; j++) {
      const a = termine[i];
      const b = termine[j];
      const gemeinsame = a.erbringerIds.filter((e) => b.erbringerIds.includes(e));
      if (gemeinsame.length === 0) continue;

      const aStart = new Date(a.start).getTime();
      const aEnde = new Date(a.ende).getTime();
      const bStart = new Date(b.start).getTime();
      const bEnde = new Date(b.ende).getTime();

      if (aStart < bEnde && bStart < aEnde) {
        konflikte.push({
          a,
          b,
          grund: `Erbringer ${gemeinsame.join(", ")} hat zeitliche Überschneidung`,
        });
      }
    }
  }
  return konflikte;
}

/**
 * Cross-Beruf-Sicht: alle Termine eines Klienten an einem Tag,
 * gruppiert nach Beruf — Basis für die Stations-Cockpit-Timeline.
 */
export function tagesSichtKlient(
  termine: Termin[],
  klientId: string,
  datum: string,
): Termin[] {
  const dayStart = new Date(datum);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(datum);
  dayEnd.setHours(23, 59, 59, 999);

  return termine
    .filter((t) => t.klientId === klientId)
    .filter((t) => {
      const start = new Date(t.start);
      return start >= dayStart && start <= dayEnd;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * FHIR R4 Appointment-Konvertierung — für Phase B Export an externe PVS.
 */
export function toFhirAppointment(t: Termin): Record<string, unknown> {
  return {
    resourceType: "Appointment",
    id: t.id,
    status: t.status === "geplant" ? "proposed" : t.status === "bestaetigt" ? "booked" : t.status === "in-bearbeitung" ? "arrived" : t.status === "abgeschlossen" ? "fulfilled" : "cancelled",
    serviceCategory: [{ text: t.leadBeruf }],
    serviceType: [{ text: t.typ }],
    start: t.start,
    end: t.ende,
    minutesDuration: t.dauerMin,
    description: t.beschreibung,
    participant: [
      ...(t.klientId
        ? [{ actor: { reference: `Patient/${t.klientId}` }, status: "accepted" }]
        : []),
      ...t.erbringerIds.map((id) => ({
        actor: { reference: `Practitioner/${id}` },
        status: "accepted",
      })),
    ],
  };
}
