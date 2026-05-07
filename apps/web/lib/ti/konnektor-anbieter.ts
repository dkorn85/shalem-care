// gematik-Konnektor-Anbieter-Katalog · Stand 2026-Q1.
//
// Quelle: gematik-Zulassungsliste, Anbieter-Webseiten, vdek-Pflege-Branchen-
// Reports. Preise sind List-Preise oder Schätzungen aus öffentlichen
// Verträgen — die echten Verhandlungs-Preise sind häufig niedriger.
//
// Phase B: aus der Liste ein Anbieter wählen, vertraglich anbinden,
// Konnektor-Box am Pflegestützpunkt installieren, SMC-B-Karten ordern.

export type Konnektor = {
  id: string;
  hersteller: string;
  produkt: string;
  /** Anschluss-Typ */
  typ: "hardware" | "tim-as-a-service" | "rise-cloud";
  /** gematik-Zulassungs-ID */
  zulassung: string;
  /** Zulassungs-Stand */
  zulassungAb: string;
  /** Einmal-Anschaffung in Euro */
  einmalEuro: number;
  /** Monatliche Kosten in Euro */
  monatlichEuro: number;
  /** Zielgruppe */
  zielgruppe: ("praxis" | "klinik" | "pflegedienst" | "apotheke" | "heilmittel")[];
  /** Was an TI-Anwendungen unterstützt wird */
  anwendungen: TiAnwendung[];
  /** Stärken */
  pro: string[];
  /** Schwächen */
  contra: string[];
  /** Empfohlen für Shalem? */
  shalemFit: "ja" | "vielleicht" | "nein";
  shalemBegruendung: string;
  /** Web-Referenz */
  webRef?: string;
};

export type TiAnwendung =
  | "kim-mail"
  | "erezept"
  | "epa"          // elektronische Patientenakte
  | "tim"          // TI-Messenger
  | "vsdm"         // Versichertenstammdaten-Mgmt
  | "kep"          // Komfortsignatur
  | "nfdm"         // Notfalldatenmanagement
  | "emp"          // elektronischer Medikationsplan
  | "evb"          // elektronische Verordnung Behandlungspflege
  | "evb-haupp";   // elektronische Verordnung Heilmittel

export const TI_LABEL: Record<TiAnwendung, string> = {
  "kim-mail": "KIM-Mail",
  erezept: "eRezept",
  epa: "ePA · 3.0",
  tim: "TI-Messenger",
  vsdm: "VSDM (Karte einlesen)",
  kep: "Komfortsignatur HBA",
  nfdm: "Notfalldaten",
  emp: "Medikationsplan eMP",
  evb: "eVerordnung HKP",
  "evb-haupp": "eHeilmittel-Verordnung",
};

export const KONNEKTOREN: Konnektor[] = [
  {
    id: "rise-cloud",
    hersteller: "RISE",
    produkt: "RISE Connect Cloud",
    typ: "rise-cloud",
    zulassung: "PTV5+",
    zulassungAb: "2024-Q3",
    einmalEuro: 0,
    monatlichEuro: 89,
    zielgruppe: ["pflegedienst", "praxis", "heilmittel"],
    anwendungen: ["kim-mail", "erezept", "tim", "vsdm", "evb", "evb-haupp"],
    pro: [
      "Keine Hardware-Box · reine Cloud-Lösung",
      "Skaliert auf mehrere Standorte ohne neue Konnektoren",
      "Wartung + Updates inklusive",
      "API-First-Architektur · gut für Integration in eigene PVS",
    ],
    contra: [
      "Internet-Abhängigkeit · bei Ausfall keine VSDM",
      "Datensouveränität: Cloud-Anbieter sieht Metadaten",
      "Erzeugt monatliche Fixkosten ohne Ende",
    ],
    shalemFit: "ja",
    shalemBegruendung:
      "Cloud-Lösung skaliert mit unserem Multi-Träger-Modell. Cross-Beruf-Bündelung = ein Konnektor für viele Cockpits.",
    webRef: "rise.de",
  },
  {
    id: "secunet-konnektor",
    hersteller: "secunet",
    produkt: "secunet konnektor",
    typ: "hardware",
    zulassung: "PTV5",
    zulassungAb: "2023-Q2",
    einmalEuro: 1899,
    monatlichEuro: 18,
    zielgruppe: ["praxis", "klinik", "pflegedienst"],
    anwendungen: ["kim-mail", "erezept", "epa", "tim", "vsdm", "kep", "nfdm", "emp", "evb"],
    pro: [
      "Marktführer · stabile Hardware-Box",
      "Vollständige TI-Anwendungs-Abdeckung inkl. Komfortsignatur",
      "Made in Germany · BSI-zertifiziert",
      "Niedrige laufende Kosten",
    ],
    contra: [
      "Hardware-Anschaffung pro Standort",
      "Updates manuell · IT-Aufwand",
      "Nicht ideal für mobile Pflege ohne festen Standort",
    ],
    shalemFit: "vielleicht",
    shalemBegruendung:
      "Stabilster Marktstandard, aber pro Standort eigene Box nötig. Für Pilot-Standort sinnvoll, danach RISE-Cloud-Migration prüfen.",
    webRef: "secunet.com",
  },
  {
    id: "cgm-konnektor",
    hersteller: "CompuGroup Medical",
    produkt: "CGM eHealth-Konnektor (KoCoBox)",
    typ: "hardware",
    zulassung: "PTV5",
    zulassungAb: "2022-Q4",
    einmalEuro: 1799,
    monatlichEuro: 22,
    zielgruppe: ["praxis", "klinik"],
    anwendungen: ["kim-mail", "erezept", "epa", "vsdm", "kep", "nfdm", "emp"],
    pro: [
      "Tiefe Integration mit CGM-PVS (Albis, Medistar)",
      "KoCoBox FX/MED+ verbreitet in dt. Praxen",
      "Solide Hotline + Vor-Ort-Service",
    ],
    contra: [
      "Keine TIM-Unterstützung",
      "Hersteller-Lock-In bei tiefer Integration",
      "Pflegedienst-Workflows weniger ausgereift",
    ],
    shalemFit: "nein",
    shalemBegruendung:
      "Auf Arzt-Praxen optimiert. Wir wollen Pflege als Lead, da ist CGM nicht stark.",
    webRef: "cgm.com",
  },
  {
    id: "akquinet-tim",
    hersteller: "akquinet",
    produkt: "akquinet TIM-as-a-Service",
    typ: "tim-as-a-service",
    zulassung: "TIM-Pro 1.1",
    zulassungAb: "2025-Q1",
    einmalEuro: 0,
    monatlichEuro: 49,
    zielgruppe: ["pflegedienst", "klinik"],
    anwendungen: ["tim", "kim-mail"],
    pro: [
      "Reiner TI-Messenger · Fokus statt Allzweck",
      "Cloud-native · sofort einsatzbereit",
      "Niedrige Schwelle für Nicht-IT-Affine",
    ],
    contra: [
      "Keine eRezept- oder ePA-Anbindung",
      "Reicht nicht als Voll-Konnektor-Ersatz",
    ],
    shalemFit: "vielleicht",
    shalemBegruendung:
      "Als Brücke bis Voll-Konnektor da ist · billig + sofort einsatzbereit. Aber kein eRezept = keine HKP-Pipeline.",
    webRef: "akquinet.com",
  },
  {
    id: "x-iso-konnektor",
    hersteller: "x.iso",
    produkt: "x.iso Konnektor",
    typ: "hardware",
    zulassung: "PTV5",
    zulassungAb: "2023-Q4",
    einmalEuro: 1599,
    monatlichEuro: 15,
    zielgruppe: ["praxis", "pflegedienst"],
    anwendungen: ["kim-mail", "erezept", "epa", "vsdm", "kep"],
    pro: [
      "Günstiger Hardware-Anschaffung als Mitbewerb",
      "REST-API für Drittanbindung",
      "Zertifiziert auch für ambulante Pflege",
    ],
    contra: [
      "Kleinerer Anbieter · Long-Term-Stabilität unklar",
      "TIM noch nicht zertifiziert",
      "Begrenzter Vor-Ort-Service",
    ],
    shalemFit: "vielleicht",
    shalemBegruendung:
      "Für Pilot-Standort günstige Alternative. Bei Skalierung Cloud bevorzugen.",
    webRef: "x-iso.de",
  },
  {
    id: "telekom-tim",
    hersteller: "Deutsche Telekom",
    produkt: "T-TIM",
    typ: "tim-as-a-service",
    zulassung: "TIM-Pro 1.1",
    zulassungAb: "2024-Q4",
    einmalEuro: 0,
    monatlichEuro: 39,
    zielgruppe: ["praxis", "klinik", "pflegedienst", "apotheke", "heilmittel"],
    anwendungen: ["tim", "kim-mail"],
    pro: [
      "Etabliert · Telekom-Backend",
      "Branchenoffen · funktioniert über alle Versorger",
      "Gute Smartphone-App",
    ],
    contra: [
      "Nur Messaging — keine Voll-Konnektor-Funktionen",
      "Telekom-Lock-In bei DSL-Verbindung",
    ],
    shalemFit: "vielleicht",
    shalemBegruendung:
      "Sinnvoll als Cross-Beruf-Messenger neben Voll-Konnektor. Standalone reicht uns nicht.",
    webRef: "telekom.de",
  },
];

export const TI_ANWENDUNGS_KOSTEN = {
  /** Pro KIM-Mail-Versand · 0 ct (in Konnektor-Flatrate enthalten) */
  kimProMail: 0,
  /** Pro eRezept · gematik-Gebühr · 5 ct */
  erezeptProTransaktion: 5,
  /** Pro VSDM-Lesung · enthalten in Pauschale, gerechnet nach SGB V */
  vsdmProLesung: 0,
};

/**
 * Empfehlungs-Logik: was passt zu welchem Use Case?
 */
export function empfehlung(useCase: "pilot-standort" | "skaliert-multi" | "messenger-only" | "arzt-fokus"): Konnektor[] {
  switch (useCase) {
    case "pilot-standort":
      return KONNEKTOREN.filter((k) => k.id === "x-iso-konnektor" || k.id === "secunet-konnektor");
    case "skaliert-multi":
      return KONNEKTOREN.filter((k) => k.typ === "rise-cloud");
    case "messenger-only":
      return KONNEKTOREN.filter((k) => k.typ === "tim-as-a-service");
    case "arzt-fokus":
      return KONNEKTOREN.filter((k) => k.id === "cgm-konnektor" || k.id === "secunet-konnektor");
  }
}
