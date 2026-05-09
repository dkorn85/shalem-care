// Sterbe-Wache · Vigilie-Plan + terminale Zeichen + 'Was tun wenn?'.
//
// Quellen: DGP-Leitfaden Symptomkontrolle Palliativ (2021), BAG Hospiz
// Standards Sterbebegleitung, S3-Leitlinie Palliativmedizin 2.2 (2021),
// Charta zur Betreuung schwerstkranker und sterbender Menschen 2010.

export type AtmungsMuster =
  | "ruhig-flach"
  | "cheyne-stokes"
  | "schnappatmung"
  | "rasselnd"
  | "apnoe-phasen";

export type TerminaleZeichen =
  | "marmoriert-haut"
  | "akren-kalt"
  | "facies-hippocratica"
  | "puls-faden"
  | "blutdruck-nicht-mess"
  | "bewusstsein-eingetrubt"
  | "nahrungs-trinkverweigerung"
  | "ausscheidung-gestoppt"
  | "rasselatmung"
  | "kreislauf-zentralisierung";

export type Vigilie = {
  id:               string;
  klient:           string;
  einrichtung:      string;
  beginnAm:         string;       // ISO
  prognoseStunden:  string;       // freie Schätzung
  einwilligungsId:  string;
  begleiter:        string;
  schichten:        { zeit: string; person: string; bemerkung?: string }[];
  aktuell: {
    atmung:          AtmungsMuster;
    terminaleZeichen: TerminaleZeichen[];
    medikation:      string[];     // z.B. „Morphin 2,5 mg s.c. b.B. lt. Bedarfsplan"
    familieAnwesend: boolean;
    seelsorgeRufbar: boolean;
  };
  letzteWuensche?:  string[];      // z.B. „Lieblings-Foto auf Bauch", „Klang-Schale"
  bemerkung?:       string;
};

export const ATMUNG_LABEL: Record<AtmungsMuster, string> = {
  "ruhig-flach":     "ruhig + flach",
  "cheyne-stokes":   "Cheyne-Stokes (an-/abschwellend)",
  "schnappatmung":   "Schnappatmung",
  "rasselnd":        "rasselnd (Sekret oberflächlich)",
  "apnoe-phasen":    "Apnoe-Phasen >20 sek",
};

export const TZ_LABEL: Record<TerminaleZeichen, string> = {
  "marmoriert-haut":            "marmorierte Haut Knie/Hüfte",
  "akren-kalt":                 "Akren kalt",
  "facies-hippocratica":        "Facies hippocratica",
  "puls-faden":                 "Puls fadenförmig",
  "blutdruck-nicht-mess":       "RR nicht mehr messbar",
  "bewusstsein-eingetrubt":     "Bewusstsein eingetrübt",
  "nahrungs-trinkverweigerung": "Nahrungs-/Trinkverweigerung",
  "ausscheidung-gestoppt":      "Ausscheidung gestoppt",
  "rasselatmung":               "Rasselatmung",
  "kreislauf-zentralisierung":  "Kreislaufzentralisierung",
};

export const VIGILIEN: Vigilie[] = [
  {
    id: "vig-2026-0506-01",
    klient: "Otto Tannhäuser",
    einrichtung: "St. Lukas WB-A · Zi 312",
    beginnAm: "2026-05-05T22:30:00",
    prognoseStunden: "Stunden bis 2 Tage",
    einwilligungsId: "ew-002",
    begleiter: "Marlene Voss",
    schichten: [
      { zeit: "22:00-02:00", person: "Marlene Voss",      bemerkung: "Atmung Cheyne-Stokes seit 23:15 · ruhige Mimik" },
      { zeit: "02:00-06:00", person: "Anna Berkstein",     bemerkung: "Familienanruf 03:14 · Sohn unterwegs" },
      { zeit: "06:00-10:00", person: "Heinz Lautenberg",   bemerkung: "Hospiz-Ehrenamt aus dem Verein" },
    ],
    aktuell: {
      atmung: "cheyne-stokes",
      terminaleZeichen: ["marmoriert-haut", "akren-kalt", "bewusstsein-eingetrubt", "puls-faden", "rasselatmung"],
      medikation: ["Morphin 2,5 mg s.c. alle 4h n. Bedarf", "Buscopan 20 mg s.c. b.B. gegen Rasseln", "Lorazepam 0,5 mg s.l. b.B. gegen Unruhe"],
      familieAnwesend: false,
      seelsorgeRufbar: true,
    },
    letzteWuensche: ["Lieblings-Foto vom Garten auf der Brust", "Brahms Schlaflied leise im Hintergrund", "Hand halten von der Familie wenn da"],
    bemerkung: "Patient ist Witwer · Sohn ist seit 1 h unterwegs aus Köln · Ankunft ca. 04:30 · Hospiz-Koordination informiert.",
  },
  {
    id: "vig-2026-0506-02",
    klient: "Hannelore Mertens",
    einrichtung: "Hospiz Bergmannsheil",
    beginnAm: "2026-05-06T11:00:00",
    prognoseStunden: "Tage",
    einwilligungsId: "ew-007",
    begleiter: "Anna Berkstein",
    schichten: [
      { zeit: "11:00-15:00", person: "Anna Berkstein" },
      { zeit: "15:00-19:00", person: "Hospiz-Koordination" },
      { zeit: "19:00-23:00", person: "Familie selbst (Tochter + Schwiegersohn)" },
    ],
    aktuell: {
      atmung: "ruhig-flach",
      terminaleZeichen: ["bewusstsein-eingetrubt", "nahrungs-trinkverweigerung", "akren-kalt"],
      medikation: ["Fentanyl Pflaster 25 µg/h", "Mundpflege mit Salbei-Tee 2-stdl."],
      familieAnwesend: true,
      seelsorgeRufbar: true,
    },
    letzteWuensche: ["Hand halten · Tochter immer eine Hand · Begleiter:in andere Hand", "Keine Vorhänge zu — sie will die Bäume sehen"],
    bemerkung: "Friedliche Atmosphäre · Tochter ist Hebamme + sehr ruhig · Begleitung im Wechsel mit Familien-Pause empfohlen.",
  },
];

export type WasTunWenn = {
  id:   string;
  was:  string;
  wer:  "begleitung" | "pflege" | "arzt" | "familie" | "seelsorge";
  wie:  string;
};

export const WAS_TUN_WENN: WasTunWenn[] = [
  { id: "w1", was: "Atmung wird rasselnd",                    wer: "pflege",     wie: "Pflege rufen · Buscopan s.c. n. Bedarfsplan · Lagerung leicht erhöht · Familie aufklären: Geräusch belastet sie mehr als Patient" },
  { id: "w2", was: "Patient wird unruhig + grimassiert",       wer: "pflege",     wie: "Pflege rufen · Lorazepam s.l. n. Bedarfsplan · Schmerz vs. Angst differenzieren · Atemfrequenz beobachten" },
  { id: "w3", was: "Familie kommt verzweifelt an",             wer: "begleitung", wie: "Begrüßen · in Sterbe-Zimmer führen · kurzer Status (Atmung, was wir hören) · Rolle anbieten (Hand halten, schweigen) · Tee/Wasser bringen" },
  { id: "w4", was: "Atmung setzt aus für >30 sek",             wer: "begleitung", wie: "Hand auf Brustkorb · zählen · meist atmet er/sie wieder · wenn nicht mehr: Pflege rufen für Status · keine Reanimation bei dokum. PV" },
  { id: "w5", was: "Patient ist verstorben",                    wer: "pflege",     wie: "Pflege ruft Hausarzt für Totenschein · Familie Zeit lassen · Würde-Versorgung beginnt nach 1-2 h Verabschiedungs-Zeit · Bestatter informieren" },
  { id: "w6", was: "Seelsorge wird angefragt",                  wer: "seelsorge",  wie: "Krankenhaus-Seelsorge anrufen (24h-Rufbereitschaft) · auch konfessionsfrei möglich · Patient muss nicht religiös sein" },
  { id: "w7", was: "Sturz in Sterbe-Phase",                     wer: "pflege",     wie: "Pflege rufen · Vitalcheck · meist keine OP-Indikation mehr · Schmerztherapie aufstocken · Ruhe-Lagerung" },
  { id: "w8", was: "Begleiter:in selbst überfordert",           wer: "begleitung", wie: "Übergabe an nächste Schicht früher · kurze Pause draußen · Supervision in nächster Sitzung · Tränen sind erlaubt — nicht vor Familie" },
];

export const WER_LABEL: Record<WasTunWenn["wer"], string> = {
  begleitung: "Begleitung",
  pflege:     "Pflege",
  arzt:       "Arzt",
  familie:    "Familie",
  seelsorge:  "Seelsorge",
};

export const WER_FARBE: Record<WasTunWenn["wer"], string> = {
  begleitung: "var(--wed)",
  pflege:     "var(--accent)",
  arzt:       "var(--vibe-team)",
  familie:    "var(--fri)",
  seelsorge:  "var(--vibe-profile)",
};

export function aktiveVigilien(): Vigilie[] {
  return VIGILIEN;
}
