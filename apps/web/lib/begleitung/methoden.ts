// Methoden-Repertoire der Würde-Begleitung.
//
// Anders als „Sex-Begleitung" oder „Cuddle-Therapy": kein Wellness-Angebot,
// sondern fundierte, dokumentierte Nähe in würdigem Rahmen — meist im
// Pflegeheim, Hospiz, Palliativ-Setting.
//
// Quellen: Berkana-Akademie (Berührungs-Pflege), Andreas Fröhlich
// (Basale Stimulation), Naomi Feil (Validation bei Demenz),
// Snoezelen-Konzept (Multi-Sinnes-Raum), Lifebook-Method (biografisches
// Erzählen, Erika Schuchardt), DGP-Empfehlung Berührung Palliativ.

export type Methode =
  | "berkana-beruehrung"
  | "basale-stimulation"
  | "validation-feil"
  | "snoezelen"
  | "biografisches-erzaehlen"
  | "hand-in-hand-vorlesen"
  | "schweige-praesenz"
  | "musik-singen"
  | "aroma-basis-pflege"
  | "tier-besuch";

export type AusbildungsStufe = "casual" | "zertifiziert" | "fachkraft";

export type MethodenKarte = {
  id:                 Methode;
  label:              string;
  beschreibung:       string;
  indikation:         string[];
  kontraindikation:   string[];
  ausbildungAb:       AusbildungsStufe;
  quelleStandard:     string;
  dauerMin:           [number, number];     // Min - Max sinnvolle Sitzungsdauer
  dokuPflicht:        string;               // Was muss in der Sitzungs-Doku festgehalten werden
};

export const METHODEN_KATALOG: MethodenKarte[] = [
  {
    id: "berkana-beruehrung",
    label: "Berührungs-Pflege nach Berkana",
    beschreibung: "Sanfte, ankommende Berührung an Hand, Schulter oder Fuß. Klar abgegrenzt von Massage — keine Bewegungs-Tiefe, sondern halten. Klassisch beim Einstieg in die Begleitung.",
    indikation: ["Einsamkeit", "Demenz frühe Phase", "palliative Phase", "depressive Verstimmung", "post-Verlust-Trauer"],
    kontraindikation: ["aktive Hautläsionen am Berührungs-Ort", "Berührungsabwehr (verbal oder Körper)", "akute Trauma-Trigger"],
    ausbildungAb: "zertifiziert",
    quelleStandard: "Berkana-Akademie 2014, 80h-Curriculum",
    dauerMin: [15, 45],
    dokuPflicht: "Berührungs-Ort, Dauer, Reaktion (Mimik, Atmung, Verbalisierung), nächste empfohlene Frequenz",
  },
  {
    id: "basale-stimulation",
    label: "Basale Stimulation nach Fröhlich",
    beschreibung: "Wahrnehmungs-Förderung über somatische, vibratorische, vestibuläre Anregung. Für Menschen mit stark eingeschränktem Bewusstsein (Wachkoma, schwere Demenz, Sterbebegleitung).",
    indikation: ["Wachkoma", "Apallisches Syndrom", "schwere Demenz", "Sterbe-Phase mit minimaler Reaktion"],
    kontraindikation: ["instabile Vitalwerte", "akuter Krampfanfall in den letzten 24h", "Hautläsionen am Stimulationsort"],
    ausbildungAb: "fachkraft",
    quelleStandard: "Andreas Fröhlich, 1981 ff. · DGfBSt-Curriculum",
    dauerMin: [10, 30],
    dokuPflicht: "Stimulationsart (somatisch/vestibulär/vibratorisch/oral/visuell/auditiv), Reaktion, Vitalwerte vor/nach",
  },
  {
    id: "validation-feil",
    label: "Validation nach Naomi Feil",
    beschreibung: "Kommunikations-Methode für Menschen mit fortgeschrittener Demenz. Statt Realitäts-Korrektur Anerkennen der inneren Welt + emotionale Spiegelung.",
    indikation: ["Demenz Phase II-IV nach Feil", "Verwirrtheit mit emotionaler Not", "Heimwehzustände im Pflegeheim"],
    kontraindikation: ["wache Demenz mit Realitäts-Anker (Phase I)", "akut psychotische Phase"],
    ausbildungAb: "zertifiziert",
    quelleStandard: "Naomi Feil 1989 · VTI Validation Training Institute · 2-stufige Zertifizierung",
    dauerMin: [10, 30],
    dokuPflicht: "Phase nach Feil, Themen-Welt, emotionale Resonanz, ob Beruhigung erreicht wurde",
  },
  {
    id: "snoezelen",
    label: "Snoezelen · Multi-Sinnes-Raum",
    beschreibung: "Bewusst gestalteter Raum mit weichem Licht, taktilen Materialien, Musik + Düften. Eingesetzt für Entspannung + Selbstwahrnehmung.",
    indikation: ["Demenz mit Unruhe", "Behinderung mit Reizüberflutung", "Palliativ-Begleitung Wachphase"],
    kontraindikation: ["aktive Reizüberflutung", "Lichtsensitiver Krampf"],
    ausbildungAb: "casual",
    quelleStandard: "Hulsegge & Verheul 1987 · ISNA-Standard 2015",
    dauerMin: [20, 60],
    dokuPflicht: "Raum-Konfiguration, Aufenthaltsdauer, Wirkung auf Anspannung (1-10 NRS)",
  },
  {
    id: "biografisches-erzaehlen",
    label: "Biografisches Erzählen / Lebensbuch",
    beschreibung: "Strukturiertes Hören und Festhalten der Lebens-Geschichte. Wirkt identitätsstiftend, hilft beim Loslassen, schafft Vermächtnis für Familie.",
    indikation: ["Palliativ-Phase mit erhaltener Sprache", "Demenz frühe Phase", "schwer kranke Menschen mit Wunsch zu erzählen", "Sterbebegleitung mit Vermächtnis-Wunsch"],
    kontraindikation: ["aktive Trauma-Reaktivierung", "kognitiver Verfall, der Erzählen unmöglich macht (dann eher: Validation)"],
    ausbildungAb: "casual",
    quelleStandard: "Erika Schuchardt 'Warum gerade ich?' · Lifebook-Method, IBA Berlin",
    dauerMin: [30, 90],
    dokuPflicht: "Themenkapitel, ob Audio-Aufnahme erfolgt (mit Einwilligung), Übergabe an Familie",
  },
  {
    id: "hand-in-hand-vorlesen",
    label: "Hand-in-Hand · Vorlesen",
    beschreibung: "Klassische Begleitung: Vorlesen vertrauter Texte (Bibel, Märchen, Tageszeitung, Lieblings-Roman) bei gehaltener Hand.",
    indikation: ["Bettlägerigkeit", "depressive Verstimmung", "Palliativ-Phase", "Demenz mit Erinnerung an Texte"],
    kontraindikation: ["akute Stimm-Empfindlichkeit", "Patient möchte Stille"],
    ausbildungAb: "casual",
    quelleStandard: "Klassische Hospiz-Begleitung · BAG Hospiz",
    dauerMin: [15, 60],
    dokuPflicht: "Gelesener Text, Reaktion, ob Patient eingeschlafen / berührt wurde",
  },
  {
    id: "schweige-praesenz",
    label: "Schweigende Präsenz",
    beschreibung: "Einfach DA sein. Kein Reden, kein Erzählen — nur sitzen, atmen, halten. Die wirksamste und schwerste Begleitung. In der Sterbe-Wache zentral.",
    indikation: ["Sterbe-Phase Stunden-Tage", "Trauer-Bestürzung der Familie", "post-traumatische Erschöpfung"],
    kontraindikation: ["Patient wünscht ausdrücklich Gespräch oder Vorlesen"],
    ausbildungAb: "zertifiziert",
    quelleStandard: "BAG Hospiz · Schweige-Praxis im DGP-Curriculum",
    dauerMin: [30, 240],
    dokuPflicht: "Anwesenheits-Dauer, Atmungsmuster des Patienten, Familien-Reaktion",
  },
  {
    id: "musik-singen",
    label: "Musik + Singen am Bett",
    beschreibung: "Vorsingen oder gemeinsames Summen vertrauter Lieder. Wirkt bei Demenz (musikalische Erinnerung bleibt bis spät erhalten) und in der Sterbe-Phase.",
    indikation: ["Demenz alle Phasen", "Sterbe-Phase mit erhaltener Hörverarbeitung", "kulturell verbundene Lieder (Wiegenlieder, Kirchenlieder)"],
    kontraindikation: ["Patient wünscht Stille", "Familienkonflikt um Liedauswahl"],
    ausbildungAb: "casual",
    quelleStandard: "Music-Thanatology nach Therese Schroeder-Sheker · MusicSpace e.V. DE",
    dauerMin: [10, 30],
    dokuPflicht: "Lieder, Reaktion (Mitsingen, Tränen, Atemruhe), Familien-Beteiligung",
  },
  {
    id: "aroma-basis-pflege",
    label: "Aroma-Basis-Pflege",
    beschreibung: "Anwendung therapeutischer Öle (Lavendel, Rose, Sandelholz) als Hand-Einreibung oder Raumduft. Für Beruhigung, Schlaf-Förderung, würdiges Sterbe-Setting.",
    indikation: ["Schlaflosigkeit", "Unruhe", "Trauerbegleitung Familie nach Tod", "würdige Aufbahrung"],
    kontraindikation: ["bekannte Allergie", "aktive Atemwegserkrankung mit Triggerempfindlichkeit"],
    ausbildungAb: "zertifiziert",
    quelleStandard: "Aromapflege-Curriculum nach Eliane Zimmermann · DGAA",
    dauerMin: [15, 30],
    dokuPflicht: "Verwendetes Öl, Verdünnung, Anwendungsort, Reaktion, Allergie-Anamnese geprüft",
  },
  {
    id: "tier-besuch",
    label: "Tier-gestützter Besuch",
    beschreibung: "Begleitung mit zertifiziertem Therapie-Hund (selten Katze) im Heim. Wirkt nachweislich blutdrucksenkend + stimmungsaufhellend.",
    indikation: ["Depressive Verstimmung im Heim", "Demenz mit Tier-Biografie", "Kinder-Hospiz"],
    kontraindikation: ["Tier-Allergie", "Tier-Phobie", "frische OP-Wunde"],
    ausbildungAb: "fachkraft",
    quelleStandard: "ESAAT (European Society for Animal Assisted Therapy) · IAHAIO",
    dauerMin: [15, 45],
    dokuPflicht: "Begegnungs-Dauer, Tier-Hygiene-Status, Reaktion, ob Wieder-Besuch erwünscht",
  },
];

export const STUFE_LABEL: Record<AusbildungsStufe, string> = {
  casual:       "Casual · Einführungs-Wochenende reicht",
  zertifiziert: "Zertifiziert · 60-200 h Curriculum",
  fachkraft:    "Fachkraft · grundständige Pflege/Therapie + Spezial-Schulung",
};

export const STUFE_FARBE: Record<AusbildungsStufe, string> = {
  casual:       "var(--thu)",
  zertifiziert: "var(--vibe-team)",
  fachkraft:    "var(--vibe-profile)",
};

export function methodenAbStufe(s: AusbildungsStufe): MethodenKarte[] {
  const order: AusbildungsStufe[] = ["casual", "zertifiziert", "fachkraft"];
  const grenze = order.indexOf(s);
  return METHODEN_KATALOG.filter((m) => order.indexOf(m.ausbildungAb) <= grenze);
}
