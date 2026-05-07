// eVerordnungs-Skelett für gematik-Anschluss in Phase B.
// FHIR-MedicationRequest / ServiceRequest als Basis.
// Phase 1: lokale Verordnung + KIM-Mail-Stub. Phase 2: gematik-Konnektor.

import type { LeistungsArt } from "@/lib/pvs/abrechnung/types";

export type VerordnungsTyp =
  | "eRezept"           // Arznei-/Hilfsmittel via gematik-eRezept
  | "hkp"               // Häusliche Krankenpflege § 37 SGB V
  | "hmv-physio"        // Heilmittel Physiotherapie
  | "hmv-ergo"          // Heilmittel Ergotherapie
  | "hmv-logo"          // Heilmittel Logopädie
  | "hilfsmittel"       // Hilfsmittel-Verordnung § 33 SGB V
  | "krankenfahrt"      // Krankentransport-Verordnung
  | "soziotherapie"     // § 37a SGB V
  | "med-reha"          // Anschluss-Reha § 40 SGB V
  | "pflegegrad-antrag" // SGB XI Pflegegrad-Antrag
  | "pflegehilfsmittel" // § 40 SGB XI
  | "wohnumfeld";       // § 40 Abs. 4 SGB XI Wohnumfeld-Anpassung

export type VerordnungsStatus =
  | "entwurf"
  | "ausgestellt"        // Arzt hat unterschrieben/signiert
  | "kim-versendet"      // an Pflegekasse / Therapie via KIM
  | "genehmigt"          // Kostenträger hat genehmigt
  | "abgelehnt"
  | "in-erbringung"      // Leistung wird gerade erbracht
  | "abgeschlossen"
  | "abgerechnet";

export type Verordnung = {
  id: string;
  typ: VerordnungsTyp;
  /** Verordnender Arzt / Therapeut / Pflegefachkraft */
  ausstellerId: string;
  ausstellerLanr?: string;       // Lebenslange Arztnummer
  ausstellerBsnr?: string;       // Betriebsstättennummer
  /** Klient-/Patient-ID */
  klientId: string;
  /** Versicherten-Status */
  versichertenStatus?: {
    krankenkasse: string;
    versichertenNr: string;
    iknr: string;                // Institutionskennzeichen Kostenträger
  };
  /** Leistungs-Position */
  leistung: {
    art: LeistungsArt;
    /** Konkrete Position (HKP-Ziffer, HMV-Code, eRezept-PZN) */
    code: string;
    bezeichnung: string;
    haeufigkeit?: string;        // z.B. "3x wöchentlich"
    dauerWochen?: number;        // wie lange
  };
  /** ICD-10-Diagnose-Schlüssel */
  diagnosen: string[];
  /** Verordnungs-Datum */
  datumAusstellung: string;
  /** Gültig bis (oft Quartal-Ende) */
  datumGueltigBis?: string;
  /** Verordnungs-Begründung (Freitext) */
  begruendung: string;
  /** Status-Verlauf */
  status: VerordnungsStatus;
  /** Bei eRezept: Token von gematik */
  erezeptToken?: string;
  /** KIM-Mail-Versand-Referenz */
  kimMessageId?: string;
};

/**
 * Plausibilitätsprüfung vor Versand.
 * Phase 1: simpler Check; Phase 2: vollständige KBV-Plausibilisierung.
 */
export function pruefePlausibilitaet(v: Verordnung): {
  ok: boolean;
  fehler: string[];
} {
  const fehler: string[] = [];
  if (!v.klientId) fehler.push("Klient-ID fehlt");
  if (!v.ausstellerId) fehler.push("Aussteller fehlt");
  if (v.diagnosen.length === 0) fehler.push("Mindestens eine Diagnose nötig");
  if (!v.leistung.code) fehler.push("Leistungs-Code fehlt");
  if (v.typ === "hkp" && !v.leistung.haeufigkeit) {
    fehler.push("HKP braucht Häufigkeit (z.B. 3x wöchentlich)");
  }
  if (v.typ === "eRezept" && !v.versichertenStatus) {
    fehler.push("eRezept braucht Versicherten-Status");
  }
  return { ok: fehler.length === 0, fehler };
}

// ─── KIM-Mail-Stub ──────────────────────────────────────────────

export type KimMessage = {
  id: string;
  /** Sender HBA-Karte (Arzt) */
  senderHba: string;
  /** Empfänger SMC-B (Praxis / Pflegedienst / Krankenkasse) */
  empfaengerSmcb: string;
  empfaengerName: string;
  betreff: string;
  /** Verordnungs-Referenz */
  verordnungId: string;
  /** S/MIME-signierte FHIR-Resource als Anhang */
  fhirAttachment: string;
  versendet?: string;
  bestaetigt?: string;
  status: "entwurf" | "versendet" | "zugestellt" | "fehler";
};

/**
 * Phase-1-Stub: lokal speichern, kein gematik-Versand.
 * Phase 2: echter KIM-Mail-Versand via gematik-Konnektor.
 */
export async function sendeKimMail(
  msg: Omit<KimMessage, "id" | "status" | "versendet">,
): Promise<KimMessage> {
  // TODO Phase 2: gematik-Konnektor anbinden
  return {
    ...msg,
    id: `kim-${Date.now()}`,
    status: "entwurf",
  };
}
