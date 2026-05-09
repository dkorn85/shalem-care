// Betäubungsmittel-Buch nach § 13 BtMG + BtMVV.
//
// Pflicht zur lückenlosen Dokumentation jedes Zugangs + jeder Abgabe.
// Doppel-Signatur durch Apothekenleitung + Beobachter ist Standard.
// Esketamin (Spravato) ist als Anlage III zwar BtM-pflichtig, wird aber
// in spezialisierten Zentren mit eigenen Setting-Anforderungen abgegeben.
//
// Quellen: BtMG (1981 ff.), BtMVV (2024-Fassung), § 17 ApBetrO, § 22
// ApBetrO (Vernichtung mit Zeugen), DACH-Apothekerverband-Leitlinie.

export type BtMAnlage = "I" | "II" | "III";

export type BtMRichtung = "zugang" | "abgabe" | "vernichtung" | "umbuchung";

export type BtMEintrag = {
  id:               string;
  datum:            string;            // YYYY-MM-DD
  uhrzeit:          string;            // HH:MM
  praeparat:        string;
  wirkstoff:        string;
  anlage:           BtMAnlage;
  bestandVorher:    number;
  menge:            number;            // positiv für Zugang, negativ für Abgabe/Vernichtung
  einheit:          string;            // mg / Stk. / ml
  bestandNachher:   number;
  richtung:         BtMRichtung;
  herkunftZiel:     string;            // Lieferant bei Zugang, Klient/Verordner bei Abgabe
  rezeptNr?:        string;            // BtM-Rezept-Nr. (gelb) bei Abgabe
  signaturEins:     string;            // Apothekenleitung
  signaturZwei?:    string;            // Beobachter (Pflicht bei Vernichtung)
  bemerkung?:       string;
};

export const BTM_ANLAGE_LABEL: Record<BtMAnlage, string> = {
  I:   "Anlage I · nicht verkehrsfähig",
  II:  "Anlage II · verkehrsfähig, nicht verschreibungsfähig",
  III: "Anlage III · verkehrs- + verschreibungsfähig (BtM-Rezept gelb)",
};

export const BTM_ANLAGE_FARBE: Record<BtMAnlage, string> = {
  I:   "var(--mon)",
  II:  "var(--vibe-approval)",
  III: "var(--vibe-team)",
};

export const BTM_RICHTUNG_LABEL: Record<BtMRichtung, string> = {
  zugang:      "Zugang",
  abgabe:      "Abgabe",
  vernichtung: "Vernichtung",
  umbuchung:   "Umbuchung",
};

// Demo-Bestandsbuch · letzte 14 Tage einer Krankenhaus-Apotheke
export const BTM_BUCH_DEMO: BtMEintrag[] = [
  {
    id: "btm-2026-0508-01", datum: "2026-05-08", uhrzeit: "09:14",
    praeparat: "Tilidin 100/8 retard", wirkstoff: "Tilidin + Naloxon",
    anlage: "III", bestandVorher: 12, menge: -1, einheit: "Pkg. 20 St.", bestandNachher: 11,
    richtung: "abgabe", herkunftZiel: "Helga Reinhardt · Pulmologie 3B",
    rezeptNr: "BTM-2026-118822-K", signaturEins: "Lukas Faber",
    bemerkung: "Schmerztherapie palliativ · wöchentliche Anpassung",
  },
  {
    id: "btm-2026-0508-02", datum: "2026-05-08", uhrzeit: "11:02",
    praeparat: "Cannabis Bedrocan 22/1", wirkstoff: "THC 22 % · CBD <1 %",
    anlage: "III", bestandVorher: 24, menge: -1, einheit: "g", bestandNachher: 23,
    richtung: "abgabe", herkunftZiel: "Friedrich Lange · Spastik MS",
    rezeptNr: "BTM-2026-118823-FL", signaturEins: "Lukas Faber",
    bemerkung: "5 g/Monat Bedarfsplan · Nutzungsbericht beim Arzt",
  },
  {
    id: "btm-2026-0507-04", datum: "2026-05-07", uhrzeit: "16:31",
    praeparat: "Spravato 28 mg Nasenspray", wirkstoff: "Esketamin",
    anlage: "III", bestandVorher: 8, menge: -2, einheit: "Sticks", bestandNachher: 6,
    richtung: "abgabe", herkunftZiel: "TRD-Zentrum Charité Tagesklinik",
    rezeptNr: "BTM-2026-118801-CHA", signaturEins: "Lukas Faber",
    bemerkung: "REMS-Programm · Abgabe nur an zertifiziertes Zentrum",
  },
  {
    id: "btm-2026-0506-09", datum: "2026-05-06", uhrzeit: "08:45",
    praeparat: "Morphin Merck 10 mg/ml", wirkstoff: "Morphin",
    anlage: "III", bestandVorher: 6, menge: 30, einheit: "Amp.", bestandNachher: 36,
    richtung: "zugang", herkunftZiel: "Großhandel Phoenix",
    signaturEins: "Lukas Faber",
    bemerkung: "Lieferschein 2026-PHO-44288",
  },
  {
    id: "btm-2026-0505-02", datum: "2026-05-05", uhrzeit: "17:15",
    praeparat: "Fentanyl 50 µg Pflaster", wirkstoff: "Fentanyl",
    anlage: "III", bestandVorher: 4, menge: -4, einheit: "Pflaster", bestandNachher: 0,
    richtung: "vernichtung", herkunftZiel: "Beobachter: Dr. Helena Brandt",
    signaturEins: "Lukas Faber", signaturZwei: "Dr. Helena Brandt",
    bemerkung: "Verfallen 2026-04 · Vernichtung mit Saugmaterial laut § 22 ApBetrO",
  },
];

export function btmBestand(praeparat: string): { menge: number; einheit: string } | null {
  const eintraege = BTM_BUCH_DEMO.filter((e) => e.praeparat === praeparat);
  const letzter = eintraege[0];
  if (!letzter) return null;
  return { menge: letzter.bestandNachher, einheit: letzter.einheit };
}

export function btmEintraegeFuerAnlage(a: BtMAnlage): BtMEintrag[] {
  return BTM_BUCH_DEMO.filter((e) => e.anlage === a);
}

export function btmHeute(): BtMEintrag[] {
  const heute = new Date().toISOString().slice(0, 10);
  return BTM_BUCH_DEMO.filter((e) => e.datum === heute);
}
