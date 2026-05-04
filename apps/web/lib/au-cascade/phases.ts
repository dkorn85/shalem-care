// AU-Phasen-Kaskade nach deutschem Recht.
//
// Phasen einer länger andauernden Arbeitsunfähigkeit:
//
//   ┌──────────────────────────┬─────────────────────┬───────────────────┐
//   │ Phase                    │ Norm                │ Träger            │
//   ├──────────────────────────┼─────────────────────┼───────────────────┤
//   │ 0–42  Lohnfortzahlung    │ § 3 EFZG            │ Arbeitgeber       │
//   │ 28–42 BEM-Vorbereitung   │ § 167 II SGB IX     │ Arbeitgeber       │
//   │ 43+   Krankengeld         │ § 44 SGB V          │ Krankenkasse      │
//   │ ≥42d/12Mo BEM-Pflicht    │ § 167 II SGB IX     │ Arbeitgeber       │
//   │ Stufenw. Wiedereingl.    │ § 74 SGB V          │ KK + Reha-Träger  │
//   │ 546   Aussteuerung KG    │ § 48 SGB V          │ Krankenkasse      │
//   │ 546+  Nahtlosigkeit ALG  │ § 145 SGB III       │ Bundesagentur     │
//   │       Erwerbsminderungsr. │ §§ 43,240 SGB VI    │ DRV              │
//   └──────────────────────────┴─────────────────────┴───────────────────┘
//
// Diese Datei berechnet aus AU-Beginn + heutigem Datum die aktuelle Phase
// und alle Folgemilestones. Reine Funktion, kein State, kein Netzwerk.

export type Phase =
  | "lohnfortzahlung"     // Tag 1–42, AG zahlt 100 %
  | "uebergang_kg"        // Tag 28–42: BEM-Brief vorbereiten, KG-Antrag bei KK
  | "krankengeld"         // Tag 43–546, KK zahlt ~70 % brutto / max 90 % netto
  | "wiedereingliederung" // Hamburger Modell läuft (überlagert KG-Phase)
  | "aussteuerung"        // Tag 547+ KG endet, Nahtlosigkeit aktiv
  | "alg_nahtlos"         // ALG 1 nach § 145 SGB III, BA zahlt
  | "em_rente_pruefung"   // Erwerbsminderungs­rente parallel beantragt
  | "wieder_arbeitsfaehig";

export const PHASE_LABEL: Record<Phase, string> = {
  lohnfortzahlung:        "Lohnfortzahlung (AG)",
  uebergang_kg:           "Übergang in Krankengeld",
  krankengeld:            "Krankengeld (KK)",
  wiedereingliederung:    "Stufenweise Wiedereingliederung",
  aussteuerung:           "Aussteuerung (KG endet)",
  alg_nahtlos:            "ALG 1 · Nahtlosigkeit (BA)",
  em_rente_pruefung:      "Erwerbsminderungsrente · Prüfung",
  wieder_arbeitsfaehig:   "Wieder arbeitsfähig",
};

export const PHASE_FARBE: Record<Phase, string> = {
  lohnfortzahlung:        "var(--thu)",
  uebergang_kg:           "var(--tue)",
  krankengeld:            "var(--vibe-team)",
  wiedereingliederung:    "var(--fri)",
  aussteuerung:           "var(--mon)",
  alg_nahtlos:            "var(--vibe-stats)",
  em_rente_pruefung:      "var(--vibe-profile)",
  wieder_arbeitsfaehig:   "var(--thu)",
};

export type PhaseMilestone = {
  phase: Phase;
  label: string;
  norm: string;
  ab: string;             // ISO YYYY-MM-DD (inklusiv)
  bis: string;            // ISO YYYY-MM-DD (inklusiv)
  tageVomBeginn: { ab: number; bis: number };
  traeger: "Arbeitgeber" | "Krankenkasse" | "Bundesagentur" | "DRV" | "Pflegeperson";
  pflicht?: string;       // gesetzliche Aktion, die der Träger schulden muss
  mitarbeiterAktion?: string; // was der Mitarbeiter selbst tun sollte
};

export type AuStatus = {
  auBeginn: string;            // ISO YYYY-MM-DD
  heute: string;
  tageBisher: number;
  aktuellePhase: Phase;
  aktuellerMilestone: PhaseMilestone;
  zeitachse: PhaseMilestone[];
  // bem-relevant: kumulierte AU-Tage in den letzten 12 Monaten (input von außen)
  kumulierteAuTage12Mo?: number;
  bemPflichtErreicht?: boolean; // ≥ 42 Tage in 12 Mo (§ 167 II SGB IX)
};

const TAG = 24 * 3600 * 1000;

function addDays(iso: string, n: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / TAG);
}

export function computeZeitachse(auBeginn: string): PhaseMilestone[] {
  // Tag-Definitionen relativ zu AU-Beginn (Tag 0):
  //   Lohnfortzahlung: 0..41    (42 Tage = 6 Wochen, § 3 EFZG)
  //   Übergangsfenster: 28..41  (überschneidet, BEM-Vorbereitung)
  //   Krankengeld:     42..545  (78 Wochen × 7 = 546, abzüglich LFZ)
  //   Aussteuerung-Tag: 546
  //   Nahtlos-ALG:     ab 547
  return [
    {
      phase: "lohnfortzahlung",
      label: "Lohnfortzahlung läuft",
      norm: "§ 3 EFZG",
      ab: auBeginn,
      bis: addDays(auBeginn, 41),
      tageVomBeginn: { ab: 0, bis: 41 },
      traeger: "Arbeitgeber",
      pflicht: "Voller Lohn bis Tag 42, ohne Abzug. AU-Bescheinigung ab Tag 4.",
      mitarbeiterAktion: "Arbeitgeber sofort informieren. Folge-AU spätestens am ersten Werktag nach Auslauf.",
    },
    {
      phase: "uebergang_kg",
      label: "Übergangsfenster — BEM und KG vorbereiten",
      norm: "§ 167 II SGB IX · § 44 SGB V",
      ab: addDays(auBeginn, 28),
      bis: addDays(auBeginn, 41),
      tageVomBeginn: { ab: 28, bis: 41 },
      traeger: "Arbeitgeber",
      pflicht: "BEM-Einladung muss vorbereitet sein, falls 6-Wo-Schwelle in 12-Mo überschritten wird.",
      mitarbeiterAktion: "KK kontaktieren wegen Krankengeld-Antrag. AU-Folgebescheinigung lückenlos halten.",
    },
    {
      phase: "krankengeld",
      label: "Krankengeld der Krankenkasse",
      norm: "§ 44 SGB V",
      ab: addDays(auBeginn, 42),
      bis: addDays(auBeginn, 545),
      tageVomBeginn: { ab: 42, bis: 545 },
      traeger: "Krankenkasse",
      pflicht: "70 % brutto / max 90 % netto Auszahlung. Bezugsdauer max. 78 Wochen je Krankheit innerhalb von 3 Jahren.",
      mitarbeiterAktion: "Lückenlose AU-Folgebescheinigungen, sonst Anspruch ruht. KK-Beratungsgespräch (§ 44 IV) wahrnehmen.",
    },
    {
      phase: "aussteuerung",
      label: "Aussteuerung Krankengeld (78-Wochen-Höchstdauer)",
      norm: "§ 48 SGB V",
      ab: addDays(auBeginn, 546),
      bis: addDays(auBeginn, 546),
      tageVomBeginn: { ab: 546, bis: 546 },
      traeger: "Krankenkasse",
      pflicht: "Aussteuerungsmitteilung mindestens 4 Wochen vor Ablauf, Hinweis auf BA und DRV.",
      mitarbeiterAktion: "Spätestens jetzt: ALG-1-Antrag bei BA (§ 145 SGB III) und EM-Renten-Antrag bei DRV.",
    },
    {
      phase: "alg_nahtlos",
      label: "ALG 1 · Nahtlosigkeit",
      norm: "§ 145 SGB III",
      ab: addDays(auBeginn, 547),
      bis: addDays(auBeginn, 547 + 365),
      tageVomBeginn: { ab: 547, bis: 547 + 365 },
      traeger: "Bundesagentur",
      pflicht: "ALG 1 wird gezahlt, auch wenn Vermittlungsfähigkeit < 15 Std/Woche, solange DRV-Entscheidung aussteht.",
      mitarbeiterAktion: "BA-Online-Meldung. Reha-Antrag bei DRV. Mitwirkungspflicht (§§ 60ff SGB I) beachten.",
    },
  ];
}

export function computeAuStatus(input: {
  auBeginn: string;                  // ISO YYYY-MM-DD
  bisDatum?: string;                 // wenn gesetzt → wieder_arbeitsfaehig nach diesem Datum
  heute?: string;
  kumulierteAuTage12Mo?: number;
  wiedereingliederungAktiv?: boolean;
}): AuStatus {
  const heute = input.heute ?? new Date().toISOString().slice(0, 10);
  const tageBisher = Math.max(0, diffDays(input.auBeginn, heute));
  const zeitachse = computeZeitachse(input.auBeginn);

  // Wieder-arbeitsfähig wenn bisDatum < heute
  if (input.bisDatum && input.bisDatum < heute) {
    return {
      auBeginn: input.auBeginn,
      heute,
      tageBisher,
      aktuellePhase: "wieder_arbeitsfaehig",
      aktuellerMilestone: zeitachse[0],
      zeitachse,
      kumulierteAuTage12Mo: input.kumulierteAuTage12Mo,
      bemPflichtErreicht: (input.kumulierteAuTage12Mo ?? tageBisher) >= 42,
    };
  }

  // Wiedereingliederung dominiert visuell, bleibt aber rechtlich KG-Phase
  let aktuell: Phase = "lohnfortzahlung";
  if (tageBisher >= 547) aktuell = "alg_nahtlos";
  else if (tageBisher >= 546) aktuell = "aussteuerung";
  else if (tageBisher >= 42) aktuell = "krankengeld";
  else if (tageBisher >= 28) aktuell = "uebergang_kg";

  if (input.wiedereingliederungAktiv && (aktuell === "krankengeld" || aktuell === "uebergang_kg")) {
    aktuell = "wiedereingliederung";
  }

  const milestone =
    zeitachse.find((m) => m.phase === aktuell) ??
    zeitachse[0];

  const kumuliert = input.kumulierteAuTage12Mo ?? tageBisher;
  return {
    auBeginn: input.auBeginn,
    heute,
    tageBisher,
    aktuellePhase: aktuell,
    aktuellerMilestone: milestone,
    zeitachse,
    kumulierteAuTage12Mo: kumuliert,
    bemPflichtErreicht: kumuliert >= 42,
  };
}

// Hilfsfunktion: Krankengeld-Berechnung (§ 47 SGB V)
// Regelentgelt brutto × 70 %, max. 90 % des Nettoarbeitsentgelts.
// 2026: Bemessungsgrenze 5.512,50 € / Monat (West/Ost einheitlich).
export function computeKrankengeldBetrag(input: {
  bruttoMonat: number;
  nettoMonat: number;
}): { tagesatzBrutto: number; tagesatzNetto: number; ausgezahlt: number; quote: number } {
  const tagBrutto = input.bruttoMonat / 30;
  const tagNetto = input.nettoMonat / 30;
  const kapBrutto = Math.min(tagBrutto, 5512.5 / 30);
  const sollSiebzigBrutto = kapBrutto * 0.7;
  const obergrenzeNetto = tagNetto * 0.9;
  const ausgezahlt = Math.min(sollSiebzigBrutto, obergrenzeNetto);
  return {
    tagesatzBrutto: Math.round(sollSiebzigBrutto * 100) / 100,
    tagesatzNetto: Math.round(obergrenzeNetto * 100) / 100,
    ausgezahlt: Math.round(ausgezahlt * 100) / 100,
    quote: input.nettoMonat > 0 ? Math.round((ausgezahlt * 30 / input.nettoMonat) * 100) / 100 : 0,
  };
}
