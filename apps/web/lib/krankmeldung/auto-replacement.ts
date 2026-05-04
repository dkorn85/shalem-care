// Auto-Replacement: bei Krankmeldung werden betroffene Schichten
// automatisch im Swap-Market publiziert — mit Bonus-Aufschlag, sodass
// schnellere Übernahme attraktiver wird.
//
// Konditionen:
//   - Standard-Bonus 0–30 % (in Basispunkten, BPS)
//   - Höher bei Last-Minute (< 12 h) oder Nachtschicht
//   - Markierung "krank-vertretung" im seekingFreeText, damit Lead/KI
//     bevorzugt zustimmen können

import type { Slot } from "@medplum/fhirtypes";
import { store } from "../swap-store";
import { getShiftType } from "../fhir";
import type { BurnoutRiskAssessment } from "../burnout/risk";

export type ReplacementOffer = {
  slotId: string;
  bonusBps: number;            // 0..4500
  effectiveRate: number;        // Stundensatz × (1 + bonus)
  reason: string;
  hoursToShift: number;
};

const DEFAULT_BONUS_BPS = 1500;     // +15 % Standard
const URGENT_BONUS_BPS = 2500;       // +25 % wenn < 12 h
const NIGHT_EXTRA_BPS = 500;         // +5 % wenn Nachtschicht
const BONUS_CAP_BPS = 4500;          // Cap +45 % inkl. Burnout-Aufschlag

export function computeBonusFor(
  slot: Slot,
  baseRate: number,
  ref: Date = new Date(),
  burnout?: BurnoutRiskAssessment,
): ReplacementOffer {
  const start = new Date(slot.start!).getTime();
  const hoursToShift = Math.max(0, (start - ref.getTime()) / 3_600_000);
  let bonus = DEFAULT_BONUS_BPS;
  let reason = "Krankheits-Vertretung · Standard-Bonus +15 %";

  if (hoursToShift < 12) {
    bonus = URGENT_BONUS_BPS;
    reason = "Last-Minute (< 12 h) · Bonus +25 %";
  }

  const shiftType = getShiftType(slot);
  if (shiftType === "night") {
    bonus += NIGHT_EXTRA_BPS;
    reason += " · Nachtschicht +5 %";
  }

  // Burnout-Aufschlag: kann nicht delegiert werden, deshalb höhere Vergütung
  if (burnout && burnout.autoBonusBpsBeiNichtErsetzbarkeit > 0) {
    bonus += burnout.autoBonusBpsBeiNichtErsetzbarkeit;
    reason += ` · Burnout-Schutz +${(burnout.autoBonusBpsBeiNichtErsetzbarkeit / 100).toFixed(0)} %`;
  }

  bonus = Math.min(BONUS_CAP_BPS, bonus);

  const effectiveRate = baseRate * (1 + bonus / 10_000);

  return {
    slotId: slot.id ?? "?",
    bonusBps: bonus,
    effectiveRate,
    reason,
    hoursToShift,
  };
}

export async function publishReplacementOffer(input: {
  slotId: string;
  bonusBps: number;
  reason: string;
  offeredBy: string;
  krankmeldungId: string;
}): Promise<{ ok: true; offerId: string } | { ok: false; error: string }> {
  const slot = await store.getSlot(input.slotId);
  if (!slot) return { ok: false, error: "Slot nicht gefunden." };

  const seekingFreeText =
    `🩺 Krank-Vertretung · ${input.reason} · ` +
    `Übernahme ohne Gegenleistung erforderlich (kein Tausch). Ref: ${input.krankmeldungId}`;

  const offer = await store.createOffer({
    state: "open",
    slotId: input.slotId,
    offeredBy: input.offeredBy,
    offeredAt: new Date().toISOString(),
    seekingFreeText,
  });

  return { ok: true, offerId: offer.id };
}
