// Auto-Claim · erzeugt aus einer Krankmeldung automatisch einen
// Solidar-Topf-Claim. Wird vom meldeKrank-Server-Action am Ende
// aufgerufen — kein manuelles Antragstellen mehr.
//
// Tag-Offset: zählt vom vonDatum der Krankmeldung. Tag 1 = Offset 0.
// Anwendung der Quote (100 % vs 70 %) übernimmt lib/solidartopf/calc.

import type { Krankmeldung } from "../krankmeldung/types";
import { calculateBreakdown } from "../tariff";
import type { Person } from "../swap-store";
import { speichereClaim, type SolidarClaim } from "./store";
import { berechneClaim } from "./calc";

// Wir tippen den Input bewusst breit (any) — der bestehende Aufruf in
// meldeKrank reicht uns FHIR-`Slot[]` aus @medplum/fhirtypes durch, das
// kollidiert sonst mit unserem lokalen Slot-Strukturtyp (FHIR-Slot hat
// keine string-Index-Signatur, was Hostinger-Build hart abbricht).
type SlotLike = { id?: string; start?: string };

function tagOffset(slotStart: string, vonDatum: string): number {
  const slotDay = new Date(slotStart);
  const vonDay = new Date(`${vonDatum}T00:00:00`);
  return Math.floor((slotDay.getTime() - vonDay.getTime()) / 86_400_000);
}

export function entwurfClaimAusKrankmeldung(
  km: Krankmeldung,
  person: Pick<Person, "id" | "name" | "tariffGrade">,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  betroffeneSlots: readonly any[],
): SolidarClaim {
  const ausgefallene = (betroffeneSlots as SlotLike[])
    .filter((s) => Boolean(s.start))
    .map((s) => {
      // calculateBreakdown nimmt einen FHIR-Slot — wir reichen das
      // gegebene Objekt opak weiter (Phase-1-Memory-Store gibt
      // FHIR-konforme Slots zurück).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const breakdown = calculateBreakdown(s as any, person.tariffGrade);
      const offset = tagOffset(s.start!, km.vonDatum);
      return {
        slotId: s.id ?? `slot-${Math.random().toString(36).slice(2, 8)}`,
        bruttoEuro: Math.round(breakdown.totalAmount),
        tagOffset: offset,
      };
    });

  const berechnung = berechneClaim(person.id, ausgefallene);

  const claim: SolidarClaim = {
    id: `claim-${km.id}`,
    mitgliedId: person.id,
    mitgliedName: person.name,
    krankmeldungId: km.id,
    vonDatum: km.vonDatum,
    bisDatum: km.bisDatum ?? km.voraussichtlichBis,
    ausgefalleneSchichten: ausgefallene,
    bruttoSummeEuro: berechnung.bruttoSummeEuro,
    ausfallQuote: berechnung.bruttoSummeEuro > 0 ? berechnung.berechnungEuro / berechnung.bruttoSummeEuro : 1.0,
    berechnungEuro: berechnung.berechnungEuro,
    deckelungEuro: berechnung.deckelungEuro,
    auszahlungEuro: berechnung.auszahlungEuro,
    status: "eingereicht",
    bemerkung: berechnung.notiz || "Auto-Claim aus Krankmeldung",
    erstelltAm: new Date().toISOString(),
    verlauf: [
      { event: "claim_eingereicht", at: new Date().toISOString(), meta: "auto aus meldeKrank" },
    ],
  };

  speichereClaim(claim);
  return claim;
}
