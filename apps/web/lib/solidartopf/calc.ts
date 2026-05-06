// Berechnungs-Logik für Solidar-Topf-Claims · pure Funktionen.
//
// Regel:
//   Tag 1-6  · 100 % Brutto (Genossenschaft trägt voll vor Krankengeld)
//   Tag 7-42 · 70  % Brutto (parallel zum gesetzlichen Krankengeld 70 %)
//   ab Tag 43 · 0  % (gesetzliches Krankengeld läuft, KK trägt voll)
//
// Caps siehe store.ts: 3.500 €/Claim, 8.000 €/Mitglied/Jahr,
// max 30 Krankentage/Jahr.

import { CAP_PRO_CLAIM_EURO, CAP_PRO_JAHR_EURO, jahresSummeFuerMitglied } from "./store";

export function ausfallQuoteFuerTag(tagOffset: number): number {
  if (tagOffset < 6) return 1.0;
  if (tagOffset < 42) return 0.7;
  return 0;
}

export type ClaimBerechnung = {
  bruttoSummeEuro: number;
  berechnungEuro: number;
  deckelungEuro: number;
  auszahlungEuro: number;
  jahresRest: number;
  notiz: string;
};

export function berechneClaim(
  mitgliedId: string,
  schichten: { slotId: string; bruttoEuro: number; tagOffset: number }[],
): ClaimBerechnung {
  const bruttoSumme = schichten.reduce((sum, s) => sum + s.bruttoEuro, 0);
  const berechnung = schichten.reduce(
    (sum, s) => sum + s.bruttoEuro * ausfallQuoteFuerTag(s.tagOffset),
    0,
  );

  // Cap pro Claim
  const nachClaimCap = Math.min(berechnung, CAP_PRO_CLAIM_EURO);

  // Cap pro Jahr
  const bisherImJahr = jahresSummeFuerMitglied(mitgliedId);
  const jahresRest = Math.max(0, CAP_PRO_JAHR_EURO - bisherImJahr);
  const auszahlung = Math.min(nachClaimCap, jahresRest);

  let notiz = "";
  if (berechnung > nachClaimCap) {
    notiz += `Claim-Cap angewendet (${CAP_PRO_CLAIM_EURO} €). `;
  }
  if (nachClaimCap > auszahlung) {
    notiz += `Jahres-Cap angewendet (Rest ${jahresRest.toFixed(2)} € von ${CAP_PRO_JAHR_EURO} €). `;
  }
  if (auszahlung === 0 && berechnung > 0) {
    notiz = `Jahres-Cap erreicht — ${bisherImJahr.toFixed(0)} € bereits ausgezahlt.`;
  }

  return {
    bruttoSummeEuro: bruttoSumme,
    berechnungEuro: berechnung,
    deckelungEuro: nachClaimCap,
    auszahlungEuro: auszahlung,
    jahresRest,
    notiz: notiz.trim(),
  };
}
