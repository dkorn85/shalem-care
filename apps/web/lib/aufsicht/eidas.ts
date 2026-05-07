// eIDAS-Signatur-Vorschau für PDF-Export des Quartalsberichts.
//
// eIDAS (Verordnung (EU) 910/2014) regelt drei Signatur-Stufen:
//   QES — qualifizierte elektronische Signatur (handschriftlich gleichgestellt)
//   FES — fortgeschrittene elektronische Signatur
//   EES — einfache elektronische Signatur
//
// Für Aufsichtsrats-Berichte einer eingetragenen Genossenschaft reicht
// gem. GenG § 38 + KonTraG eine FES (durch zwei Unterzeichner). Wir
// zeigen aber die QES-Anbindung als Stub — sie ist die gerichtsfeste Variante.
//
// Phase B: D-Trust Sign-Me · sproof Sign · ZSign · Bundesdruckerei
// QES-Service mit RemoteSigning-API.

import type { Quartalsbericht } from "./bericht";

export type EidasContainer = {
  /** Hash über das Bericht-PDF (SHA-256) */
  dokumentHash: string;
  signaturStufe: "EES" | "FES" | "QES";
  /** Vertrauensdiensteanbieter */
  vda: string;
  /** Zertifikats-Inhaber */
  unterzeichner: { name: string; rolle: string; email?: string }[];
  /** Signatur-Zeitpunkt (TSP-Stempel) */
  zeitstempel: string;
  /** Time-Stamping-Authority */
  tsa: string;
  /** Audit-Trail-URL (ETSI EN 319 122-2) */
  auditUrl?: string;
  /** Validität-Status */
  validierung: "gueltig" | "abgelaufen" | "widerrufen" | "in-pruefung";
  /** PAdES-Format · Container-Größe */
  padesGroesseKb: number;
};

export function erzeugeEidasContainer(bericht: Quartalsbericht): EidasContainer {
  // Stub-Hash über die wesentlichen Bericht-Felder
  const json = JSON.stringify({
    quartal: bericht.quartal,
    jahr: bericht.jahr,
    zusammenfassung: bericht.zusammenfassung,
    risiko: bericht.risiko_ampel,
  });
  let h = 0;
  for (let i = 0; i < json.length; i++) h = ((h << 5) - h + json.charCodeAt(i)) | 0;
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  const dokumentHash = `sha256:${hex}…${hex.split("").reverse().join("")}`;

  return {
    dokumentHash,
    signaturStufe: "QES",
    vda: "Bundesdruckerei D-Trust GmbH",
    unterzeichner: [
      {
        name: bericht.unterzeichner.split("·")[0]?.trim() || "Aufsichtsrats-Vorsitzende:r",
        rolle: "Aufsichtsrats-Vorsitzende:r",
      },
      {
        name: "Lana KI-Co-Pilot",
        rolle: "KI-generiert · informativ · ohne Rechtswirkung",
      },
    ],
    zeitstempel: bericht.erstellt_am,
    tsa: "D-Trust TSA · ETSI EN 319 422",
    auditUrl: `https://shalem.de/audit/aufsicht/${bericht.jahr}-${bericht.quartal}`,
    validierung: "gueltig",
    padesGroesseKb: 24 + Math.round(bericht.sektionen.length * 1.5),
  };
}

// Hilfsfunktion: PDF-Druck-Hinweis (für die Druck-Ansicht)

export const DRUCK_HINWEIS = `
Dieses Dokument ist die Druck-Ansicht des KI-generierten Aufsichtsrats-
Quartalsberichts. Über den Browser-Druck (Strg+P / ⌘P) lässt es sich als
PDF speichern. Im PDF-Footer ist die eIDAS-Signatur-Container-Vorschau
sichtbar — die echte qualifizierte Signatur wird in Phase B durch die
Bundesdruckerei D-Trust hinzugefügt, sobald das Aufsichtsrats-Mitglied
mit seinem Sign-Me-Account signiert.
`;
