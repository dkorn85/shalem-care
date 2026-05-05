// Rollen-Katalog für Registrierung — gespiegelt zur user_role-Enum
// in der DB (lib/auth/profiles).
//
// Jede Rolle weiß, welche Echtheits-Nachweise sie braucht und welcher
// Cockpit-Pfad nach erfolgreicher Verifizierung angesteuert wird.

import type { Berufsfeld } from "@/lib/team-um-klient/store";

export type RegistrierRolle =
  | "pflege" | "arzt" | "therapie" | "sozialarbeit"
  | "heilerziehung" | "ehrenamt" | "hauswirtschaft" | "erziehung"
  | "klient" | "angehoerig" | "lead" | "genossenschaftsmitglied";

export type RolleInfo = {
  id: RegistrierRolle;
  label: string;
  beschreibung: string;
  cockpitPfad: string;
  farbe: string;
  // Welche Felder müssen zur Verifizierung eingereicht werden?
  verifikation: VerifikationsFeld[];
  // Optional: welche Echtheits-Stufe ist mindestens nötig?
  vertrauenMin: "basis" | "verifiziert" | "hoch";
};

export type VerifikationsFeld = {
  key: string;
  label: string;
  typ: "text" | "datei" | "auswahl" | "ik" | "lanr";
  pflicht: boolean;
  hilfe?: string;
  optionen?: string[];
};

export const ROLLEN: Record<RegistrierRolle, RolleInfo> = {
  pflege: {
    id: "pflege",
    label: "Pflegekraft",
    beschreibung: "Examinierte Pflegefachkraft · arbeitet stationär oder ambulant.",
    cockpitPfad: "/pflege",
    farbe: "var(--mon)",
    vertrauenMin: "verifiziert",
    verifikation: [
      { key: "berufsurkunde_url", label: "Berufsurkunde (Foto/PDF)", typ: "datei", pflicht: true, hilfe: "Examensurkunde Pflegefachfrau/-mann oder Altenpflege" },
      { key: "tarifgruppe", label: "Tarifgruppe", typ: "auswahl", pflicht: true, optionen: ["TVOED-P-7","TVOED-P-8","TVOED-P-9","TVOED-P-10","TVOED-P-11","AVR-Caritas","AVR-Diakonie","Haustarif"] },
      { key: "ik_arbeitgeber", label: "IK-Nummer Arbeitgeber", typ: "ik", pflicht: false, hilfe: "9-stellig · falls bekannt" },
    ],
  },
  arzt: {
    id: "arzt",
    label: "Ärzt:in",
    beschreibung: "Approbierte Hausärztin oder Fachärzt:in.",
    cockpitPfad: "/arzt",
    farbe: "var(--vibe-profile)",
    vertrauenMin: "hoch",
    verifikation: [
      { key: "approbations_url", label: "Approbationsurkunde (PDF)", typ: "datei", pflicht: true },
      { key: "lanr", label: "Lebenslange Arztnummer (LANR)", typ: "lanr", pflicht: true, hilfe: "9-stellig" },
      { key: "kv_bezirk", label: "KV-Bezirk", typ: "auswahl", pflicht: true, optionen: ["Baden-Württemberg","Bayern","Berlin","Brandenburg","Bremen","Hamburg","Hessen","Mecklenburg-Vorpommern","Niedersachsen","Nordrhein","Westfalen-Lippe","Rheinland-Pfalz","Saarland","Sachsen","Sachsen-Anhalt","Schleswig-Holstein","Thüringen"] },
    ],
  },
  therapie: {
    id: "therapie",
    label: "Therapeut:in",
    beschreibung: "Physio · Ergo · Logopädie · Manuelle Therapie · MLD.",
    cockpitPfad: "/therapie",
    farbe: "var(--fri)",
    vertrauenMin: "verifiziert",
    verifikation: [
      { key: "therapeuten_ausweis_url", label: "Therapeut:innen-Ausweis (Foto/PDF)", typ: "datei", pflicht: true },
      { key: "ik_arbeitgeber", label: "IK-Nummer Praxis", typ: "ik", pflicht: false, hilfe: "9-stellig · falls bekannt" },
    ],
  },
  sozialarbeit: {
    id: "sozialarbeit",
    label: "Sozialarbeiter:in",
    beschreibung: "Diplom oder Bachelor Soziale Arbeit · DGCC-CM willkommen.",
    cockpitPfad: "/sozial",
    farbe: "var(--tue)",
    vertrauenMin: "verifiziert",
    verifikation: [
      { key: "berufsurkunde_url", label: "Diplom-/Bachelor-Urkunde", typ: "datei", pflicht: true },
    ],
  },
  heilerziehung: {
    id: "heilerziehung",
    label: "Heilerziehungspfleger:in",
    beschreibung: "BTHG-Teilhabe-Begleitung · staatlich anerkannt.",
    cockpitPfad: "/heilerziehung",
    farbe: "var(--sat)",
    vertrauenMin: "verifiziert",
    verifikation: [
      { key: "berufsurkunde_url", label: "Anerkennungsurkunde", typ: "datei", pflicht: true },
    ],
  },
  hauswirtschaft: {
    id: "hauswirtschaft",
    label: "Hauswirtschafts-Fachkraft",
    beschreibung: "LMHV-zertifiziert · Versorgung in der Häuslichkeit.",
    cockpitPfad: "/hauswirtschaft",
    farbe: "var(--sun)",
    vertrauenMin: "basis",
    verifikation: [
      { key: "berufsurkunde_url", label: "Hauswirtschafts-Zertifikat (LMHV)", typ: "datei", pflicht: false, hilfe: "Optional · ohne Zertifikat eingeschränkter Einsatz" },
    ],
  },
  erziehung: {
    id: "erziehung",
    label: "Erzieher:in",
    beschreibung: "Staatlich anerkannt · Kita/Familie/SGB-VIII-Kontext.",
    cockpitPfad: "/erziehung",
    farbe: "var(--vibe-stats)",
    vertrauenMin: "verifiziert",
    verifikation: [
      { key: "berufsurkunde_url", label: "Anerkennungsurkunde", typ: "datei", pflicht: true },
    ],
  },
  ehrenamt: {
    id: "ehrenamt",
    label: "Ehrenamtl. Begleitung",
    beschreibung: "Hospiz · Vorlese-Stunde · Spaziergang · Gespräch.",
    cockpitPfad: "/ehrenamt",
    farbe: "var(--thu)",
    vertrauenMin: "basis",
    verifikation: [
      { key: "fuehrungszeugnis_url", label: "Erweitertes Führungszeugnis", typ: "datei", pflicht: true, hilfe: "Wegen Kontakt zu Schutzbefohlenen verpflichtend" },
    ],
  },
  klient: {
    id: "klient",
    label: "Klient:in",
    beschreibung: "Du selbst empfängst Pflege oder Begleitung.",
    cockpitPfad: "/klient",
    farbe: "var(--wed)",
    vertrauenMin: "basis",
    verifikation: [
      { key: "pflegekassen_nr", label: "Pflegekassen-Versichertennummer", typ: "text", pflicht: false, hilfe: "Optional · für direkte Abrechnung" },
    ],
  },
  angehoerig: {
    id: "angehoerig",
    label: "Angehörige:r mit Vollmacht",
    beschreibung: "Vorsorge- oder Betreuungsvollmacht für eine:n Klient:in.",
    cockpitPfad: "/klient",
    farbe: "var(--vibe-stats)",
    vertrauenMin: "verifiziert",
    verifikation: [
      { key: "vollmacht_url", label: "Vorsorgevollmacht oder Betreuerausweis", typ: "datei", pflicht: true },
    ],
  },
  lead: {
    id: "lead",
    label: "Stationsleitung / WBL",
    beschreibung: "Wohnbereichs- oder Stationsleitung · disponiert das Team.",
    cockpitPfad: "/admin",
    farbe: "var(--vibe-team)",
    vertrauenMin: "verifiziert",
    verifikation: [
      { key: "berufsurkunde_url", label: "Examensurkunde + Leitungs-Weiterbildung", typ: "datei", pflicht: true },
    ],
  },
  genossenschaftsmitglied: {
    id: "genossenschaftsmitglied",
    label: "Genossenschafts-Mitglied",
    beschreibung: "Anteilszeichnung · Stimmrecht · Quartals-Ausschüttung.",
    cockpitPfad: "/genossenschaft",
    farbe: "var(--accent)",
    vertrauenMin: "verifiziert",
    verifikation: [
      { key: "anteilszeichnung_url", label: "Anteils-Zeichnungs-Vertrag (signiert)", typ: "datei", pflicht: true },
    ],
  },
};

// Mapping: Berufsfeld (existing app concept) ↔ RegistrierRolle
export function rolleZuBerufsfeld(r: RegistrierRolle): Berufsfeld | null {
  const map: Partial<Record<RegistrierRolle, Berufsfeld>> = {
    pflege: "pflege", arzt: "arzt", therapie: "therapie", sozialarbeit: "sozialarbeit",
    heilerziehung: "heilerziehung", ehrenamt: "ehrenamt", hauswirtschaft: "hauswirtschaft",
    klient: "klient", angehoerig: "angehoerig", lead: "lead",
  };
  return map[r] ?? null;
}
