// Seed-Daten für Hierarchie
// 3 Bundesländer · 6 Einrichtungen · 14 Stationen · ~50 Personen

import type { Bundesland, Einrichtung, Station } from "./types";
import type { Person } from "../swap-store";

export const BUNDESLAENDER: Bundesland[] = [
  { id: "nrw", code: "NRW", name: "Nordrhein-Westfalen", capital: "Düsseldorf", population: 17_900_000 },
  { id: "by",  code: "BY",  name: "Bayern",              capital: "München",    population: 13_200_000 },
  { id: "be",  code: "BE",  name: "Berlin",              capital: "Berlin",     population:  3_800_000 },
];

export const EINRICHTUNGEN: Einrichtung[] = [
  // NRW
  {
    id: "kh-essen-mitte", bundeslandId: "nrw", type: "hospital",
    name: "Klinikum Essen-Mitte", shortName: "KEM",
    city: "Essen", address: "Henricistraße 92, 45136 Essen",
    ik: "260100100", tarifvertrag: "TVÖD-P", bedCount: 480,
    location: { lat: 51.4556, lng: 7.0116 },
  },
  {
    id: "ph-bochum-süd", bundeslandId: "nrw", type: "nursing-home",
    name: "Pflegeheim Sankt Lukas", shortName: "St. Lukas",
    city: "Bochum", address: "Lukasweg 14, 44805 Bochum",
    ik: "260200200", tarifvertrag: "AVR-Caritas", bedCount: 120,
    location: { lat: 51.4960, lng: 7.2240 },
  },
  // BY
  {
    id: "kh-münchen-nord", bundeslandId: "by", type: "hospital",
    name: "Klinikum München-Nord", shortName: "KMN",
    city: "München", address: "Schwabinger Str. 200, 80809 München",
    ik: "510100300", tarifvertrag: "TVÖD-P", bedCount: 620,
    location: { lat: 48.1882, lng: 11.5827 },
  },
  {
    id: "amb-augsburg", bundeslandId: "by", type: "ambulant",
    name: "Ambulanter Pflegedienst Lechfeld", shortName: "APL",
    city: "Augsburg", address: "Lechufer 8, 86150 Augsburg",
    ik: "510200400", tarifvertrag: "Haustarif",
    location: { lat: 48.3705, lng: 10.8978 },
  },
  // BE
  {
    id: "kh-charite-mitte", bundeslandId: "be", type: "hospital",
    name: "Charité — Campus Mitte", shortName: "Charité CCM",
    city: "Berlin", address: "Charitéplatz 1, 10117 Berlin",
    ik: "110100500", tarifvertrag: "TVÖD-P", bedCount: 980,
    location: { lat: 52.5252, lng: 13.3782 },
  },
  {
    id: "ph-prenzl-berg", bundeslandId: "be", type: "nursing-home",
    name: "Wohnstift Am Wasserturm", shortName: "Wasserturm",
    city: "Berlin", address: "Knaackstraße 23, 10405 Berlin",
    ik: "110200600", tarifvertrag: "AVR-Diakonie", bedCount: 80,
    location: { lat: 52.5394, lng: 13.4205 },
  },
];

export const STATIONS: Station[] = [
  // Klinikum Essen-Mitte (4 Stationen)
  { id: "st-kem-pulmo-3b",  einrichtungId: "kh-essen-mitte", name: "Pulmologie 3B",  shortName: "Pulmo-3B",  fachbereich: "Innere Medizin", bedCount: 32, leadPersonId: "person-de1" },
  { id: "st-kem-card-2a",   einrichtungId: "kh-essen-mitte", name: "Kardiologie 2A", shortName: "Card-2A",   fachbereich: "Innere Medizin", bedCount: 28, leadPersonId: "person-mk-lead" },
  { id: "st-kem-onko-4c",   einrichtungId: "kh-essen-mitte", name: "Onkologie 4C",   shortName: "Onko-4C",   fachbereich: "Onkologie",      bedCount: 24, leadPersonId: "person-jb-lead" },
  { id: "st-kem-int-1",     einrichtungId: "kh-essen-mitte", name: "Intensivstation 1", shortName: "ITS-1",  fachbereich: "Intensivmedizin", bedCount: 14, leadPersonId: "person-rk-lead" },

  // St. Lukas (2 Stationen)
  { id: "st-luk-wohn-a",    einrichtungId: "ph-bochum-süd",  name: "Wohnbereich Annahof", shortName: "WB-A", fachbereich: "Pflege",   bedCount: 30, leadPersonId: "person-mh-lead" },
  { id: "st-luk-wohn-b",    einrichtungId: "ph-bochum-süd",  name: "Wohnbereich Buchenhof", shortName: "WB-B", fachbereich: "Pflege", bedCount: 24, leadPersonId: "person-sf-lead" },

  // Klinikum München-Nord (3 Stationen)
  { id: "st-kmn-neuro-7",   einrichtungId: "kh-münchen-nord", name: "Neurologie 7",   shortName: "Neuro-7",  fachbereich: "Neurologie",     bedCount: 30, leadPersonId: "person-ah-lead" },
  { id: "st-kmn-geri-5",    einrichtungId: "kh-münchen-nord", name: "Geriatrie 5",    shortName: "Geri-5",   fachbereich: "Geriatrie",      bedCount: 26, leadPersonId: "person-tg-lead" },
  { id: "st-kmn-chir-9",    einrichtungId: "kh-münchen-nord", name: "Chirurgie 9",    shortName: "Chir-9",   fachbereich: "Chirurgie",      bedCount: 22, leadPersonId: "person-pl-lead" },

  // APL ambulant (1 "Tour" als virtuelle Station)
  { id: "st-apl-tour-süd",  einrichtungId: "amb-augsburg",   name: "Tour Augsburg-Süd", shortName: "Tour-S", fachbereich: "Ambulante Pflege", bedCount: 0, leadPersonId: "person-bf-lead" },

  // Charité (3 Stationen)
  { id: "st-cha-anä-12",    einrichtungId: "kh-charite-mitte", name: "Anästhesie 12",  shortName: "Anä-12",  fachbereich: "Anästhesie",     bedCount: 16, leadPersonId: "person-vk-lead" },
  { id: "st-cha-päd-3",     einrichtungId: "kh-charite-mitte", name: "Pädiatrie 3",    shortName: "Päd-3",   fachbereich: "Pädiatrie",      bedCount: 24, leadPersonId: "person-cn-lead" },
  { id: "st-cha-nicu",      einrichtungId: "kh-charite-mitte", name: "NICU",           shortName: "NICU",     fachbereich: "Neonatologie",   bedCount: 12, leadPersonId: "person-eu-lead" },

  // Wasserturm (1 Station)
  { id: "st-wat-haupt",     einrichtungId: "ph-prenzl-berg", name: "Hauptbereich",     shortName: "Haupt",   fachbereich: "Pflege",         bedCount: 80, leadPersonId: "person-wm-lead" },
];

// Personen-Roster — Pflegekräfte je Station und Stationsleitungen
type PersonSeed = Person & { stationId?: string };

export const HIERARCHY_PEOPLE: PersonSeed[] = [
  // Bestehende aus Phase 0 (alle KEM Pulmo-3B)
  { id: "person-dr",  name: "Dennis Reuter", initials: "DR", role: "nurse", qualifications: ["RN"], tariffGrade: "TVOED-P_P7", stationId: "st-kem-pulmo-3b" },
  { id: "person-ls",  name: "Lana Schmidt",  initials: "LS", role: "nurse", qualifications: ["RN"], tariffGrade: "TVOED-P_P7", stationId: "st-kem-pulmo-3b" },
  { id: "person-tw",  name: "Tom Weber",     initials: "TW", role: "nurse", qualifications: ["RN"], tariffGrade: "TVOED-P_P8", stationId: "st-kem-pulmo-3b" },
  { id: "person-mk",  name: "Mira-Ki",       initials: "MK", role: "nurse", qualifications: ["RN"], tariffGrade: "TVOED-P_P7", stationId: "st-kem-pulmo-3b" },
  { id: "person-de1", name: "Detektiv Eins", initials: "D1", role: "lead",  qualifications: ["RN", "LEAD"], tariffGrade: "TVOED-P_P9", stationId: "st-kem-pulmo-3b" },

  // Stationsleitungen
  { id: "person-mk-lead", name: "Maren Köhler",      initials: "MK", role: "lead", qualifications: ["RN", "LEAD"], tariffGrade: "TVOED-P_P9", stationId: "st-kem-card-2a" },
  { id: "person-jb-lead", name: "Jonas Bertram",     initials: "JB", role: "lead", qualifications: ["RN", "LEAD"], tariffGrade: "TVOED-P_P9", stationId: "st-kem-onko-4c" },
  { id: "person-rk-lead", name: "Rebecca Kowalski",  initials: "RK", role: "lead", qualifications: ["RN", "LEAD", "ITS"], tariffGrade: "TVOED-P_P10", stationId: "st-kem-int-1" },
  { id: "person-mh-lead", name: "Martina Heinen",    initials: "MH", role: "lead", qualifications: ["RN", "LEAD"], tariffGrade: "TVOED-P_P9", stationId: "st-luk-wohn-a" },
  { id: "person-sf-lead", name: "Steffen Faber",     initials: "SF", role: "lead", qualifications: ["RN", "LEAD"], tariffGrade: "TVOED-P_P9", stationId: "st-luk-wohn-b" },
  { id: "person-ah-lead", name: "Anika Hofmeister",  initials: "AH", role: "lead", qualifications: ["RN", "LEAD"], tariffGrade: "TVOED-P_P9", stationId: "st-kmn-neuro-7" },
  { id: "person-tg-lead", name: "Tobias Grünwald",   initials: "TG", role: "lead", qualifications: ["RN", "LEAD"], tariffGrade: "TVOED-P_P9", stationId: "st-kmn-geri-5" },
  { id: "person-pl-lead", name: "Petra Lindgren",    initials: "PL", role: "lead", qualifications: ["RN", "LEAD"], tariffGrade: "TVOED-P_P9", stationId: "st-kmn-chir-9" },
  { id: "person-bf-lead", name: "Bernhard Fuchs",    initials: "BF", role: "lead", qualifications: ["RN", "LEAD"], tariffGrade: "TVOED-P_P9", stationId: "st-apl-tour-süd" },
  { id: "person-vk-lead", name: "Vera Krämer",       initials: "VK", role: "lead", qualifications: ["RN", "LEAD", "ANÄ"], tariffGrade: "TVOED-P_P10", stationId: "st-cha-anä-12" },
  { id: "person-cn-lead", name: "Clara Naumann",     initials: "CN", role: "lead", qualifications: ["RN", "LEAD", "PÄD"], tariffGrade: "TVOED-P_P9", stationId: "st-cha-päd-3" },
  { id: "person-eu-lead", name: "Esther Unger",      initials: "EU", role: "lead", qualifications: ["RN", "LEAD", "NICU"], tariffGrade: "TVOED-P_P10", stationId: "st-cha-nicu" },
  { id: "person-wm-lead", name: "Wolfgang Mertens",  initials: "WM", role: "lead", qualifications: ["RN", "LEAD"], tariffGrade: "TVOED-P_P9", stationId: "st-wat-haupt" },

  // Pflegekräfte verteilt auf Stationen
  { id: "person-na-001", name: "Nadia Asadi",       initials: "NA", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-kem-card-2a" },
  { id: "person-pj-002", name: "Paul Jäger",        initials: "PJ", role: "nurse", qualifications: ["RN", "ITS"],  tariffGrade: "TVOED-P_P8", stationId: "st-kem-int-1" },
  { id: "person-ic-003", name: "Iva Cvetkovic",     initials: "IC", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-kem-onko-4c" },
  { id: "person-fk-004", name: "Felix Kaminski",    initials: "FK", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-luk-wohn-a" },
  { id: "person-as-005", name: "Aylin Sözen",       initials: "AS", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-luk-wohn-a" },
  { id: "person-jm-006", name: "Jana Möbius",       initials: "JM", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P8", stationId: "st-luk-wohn-b" },
  { id: "person-rw-007", name: "Robin Westphal",    initials: "RW", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-kmn-neuro-7" },
  { id: "person-vb-008", name: "Veronica Bianchi",  initials: "VB", role: "nurse", qualifications: ["RN", "GERI"], tariffGrade: "TVOED-P_P8", stationId: "st-kmn-geri-5" },
  { id: "person-le-009", name: "Lukas Eberhart",    initials: "LE", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-kmn-geri-5" },
  { id: "person-no-010", name: "Noor Othman",       initials: "NO", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-kmn-chir-9" },
  { id: "person-st-011", name: "Sven Trautmann",    initials: "ST", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-apl-tour-süd" },
  { id: "person-ed-012", name: "Eda Demir",         initials: "ED", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-apl-tour-süd" },
  { id: "person-mn-013", name: "Marek Nowak",       initials: "MN", role: "nurse", qualifications: ["RN", "ANÄ"],  tariffGrade: "TVOED-P_P8", stationId: "st-cha-anä-12" },
  { id: "person-yh-014", name: "Yuna Hartmann",     initials: "YH", role: "nurse", qualifications: ["RN", "PÄD"],  tariffGrade: "TVOED-P_P8", stationId: "st-cha-päd-3" },
  { id: "person-bj-015", name: "Beate Joost",       initials: "BJ", role: "nurse", qualifications: ["RN", "PÄD"],  tariffGrade: "TVOED-P_P7", stationId: "st-cha-päd-3" },
  { id: "person-ow-016", name: "Olek Wiśniewski",   initials: "OW", role: "nurse", qualifications: ["RN", "NICU"], tariffGrade: "TVOED-P_P9", stationId: "st-cha-nicu" },
  { id: "person-rt-017", name: "Ruth Tischler",     initials: "RT", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-wat-haupt" },
  { id: "person-mb-018", name: "Mehmet Balta",      initials: "MB", role: "nurse", qualifications: ["RN"],         tariffGrade: "TVOED-P_P7", stationId: "st-wat-haupt" },

  // Ärzt:innen / Therapeut:innen — verordnungsberechtigt
  { id: "person-arzt-001", name: "Dr. Susanne Hartmann", initials: "SH", role: "doctor", qualifications: ["MD", "ALLG"],  tariffGrade: "ARZT_OA", fachrichtung: "Allgemeinmedizin", arztPraxis: "Hausarztpraxis Bochum-Süd" },
  { id: "person-arzt-002", name: "Dr. Igor Vasilev",     initials: "IV", role: "doctor", qualifications: ["MD", "NEURO"], tariffGrade: "ARZT_OA", fachrichtung: "Neurologie",      arztPraxis: "MVZ Charité Neurologie" },
  { id: "person-arzt-003", name: "Dr. Marie Lehmann",    initials: "ML", role: "doctor", qualifications: ["MD", "DIAB"],  tariffGrade: "ARZT_OA", fachrichtung: "Diabetologie",   arztPraxis: "Diabetes-Schwerpunktpraxis Essen" },
  { id: "person-arzt-004", name: "Dr. Frank Krüger",     initials: "FK", role: "doctor", qualifications: ["MD", "PALL"],  tariffGrade: "ARZT_OA", fachrichtung: "Palliativmedizin",arztPraxis: "Palliativ-Konsil St. Lukas" },
  { id: "person-psy-001",  name: "Dipl.-Psych. Lara Brüning", initials: "LB", role: "psychologist", qualifications: ["DIPL_PSY", "VT"], tariffGrade: "PSY_FT", fachrichtung: "Verhaltenstherapie", arztPraxis: "Tele-Psychotherapie Brüning" },
];

import type { Klient } from "./types";

export const KLIENTEN: Klient[] = [
  // Wohnbereich Annahof, St. Lukas, Bochum
  { id: "klient-hr",  name: "Helga Reinhardt", initials: "HR", pflegegrad: 3, einrichtungId: "ph-bochum-süd",  stationId: "st-luk-wohn-a",
    address: "Lukasweg 14, Zi. 12, 44805 Bochum", location: { lat: 51.4960, lng: 7.2240 },
    preferredCarerIds: ["person-fk-004", "person-as-005"], isSelfBooker: true,
    notes: "Demenz mittelgradig, mobil mit Rollator" },
  { id: "klient-wb",  name: "Wilhelm Brand",   initials: "WB", pflegegrad: 4, einrichtungId: "ph-bochum-süd",  stationId: "st-luk-wohn-a",
    address: "Lukasweg 14, Zi. 14, 44805 Bochum", location: { lat: 51.4960, lng: 7.2240 },
    preferredCarerIds: ["person-fk-004"], isSelfBooker: false,
    notes: "Diabetes Typ II, Wundmanagement Ferse" },
  { id: "klient-eg",  name: "Elfriede Gramberg", initials: "EG", pflegegrad: 5, einrichtungId: "ph-bochum-süd", stationId: "st-luk-wohn-a",
    address: "Lukasweg 14, Zi. 8, 44805 Bochum", location: { lat: 51.4960, lng: 7.2240 },
    preferredCarerIds: [], isSelfBooker: false,
    notes: "Bettlägerig, Palliativ-Betreuung" },

  // Wohnstift Wasserturm, Berlin Prenzlauer Berg
  { id: "klient-rk",  name: "Reinhardt Kuhn",  initials: "RK", pflegegrad: 2, einrichtungId: "ph-prenzl-berg", stationId: "st-wat-haupt",
    address: "Knaackstr. 23, App. 4B, 10405 Berlin", location: { lat: 52.5394, lng: 13.4205 },
    preferredCarerIds: ["person-rt-017"], isSelfBooker: true,
    notes: "Selbstständig im Alltag, braucht Medikamenten-Stellung" },
  { id: "klient-im",  name: "Ingrid Mayrhofer", initials: "IM", pflegegrad: 3, einrichtungId: "ph-prenzl-berg", stationId: "st-wat-haupt",
    address: "Knaackstr. 23, App. 7C, 10405 Berlin", location: { lat: 52.5394, lng: 13.4205 },
    preferredCarerIds: [], isSelfBooker: true,
    notes: "Parkinson, mobil mit Stock" },

  // Ambulant: APL Augsburg, Tour Süd
  { id: "klient-fl",  name: "Friedrich Liebenau", initials: "FL", pflegegrad: 2, einrichtungId: "amb-augsburg", stationId: "st-apl-tour-süd",
    address: "Am Schäfflerbach 17, 86150 Augsburg", location: { lat: 48.3565, lng: 10.8898 },
    preferredCarerIds: ["person-st-011"], isSelfBooker: true,
    notes: "Wohnt allein, Tochter kommt 2× wöchentlich" },
  { id: "klient-mc",  name: "Maria Chmielewski", initials: "MC", pflegegrad: 4, einrichtungId: "amb-augsburg", stationId: "st-apl-tour-süd",
    address: "Lechufer 22, 86150 Augsburg", location: { lat: 48.3692, lng: 10.8956 },
    preferredCarerIds: ["person-ed-012"], isSelfBooker: true,
    notes: "Schlaganfall vor 8 Monaten, Therapie läuft" },

  // Klinikum München-Nord, Geriatrie 5
  { id: "klient-ko",  name: "Konrad Obermair",  initials: "KO", pflegegrad: 4, einrichtungId: "kh-münchen-nord", stationId: "st-kmn-geri-5",
    address: "Schwabinger Str. 200, Zi. 511, 80809 München", location: { lat: 48.1882, lng: 11.5827 },
    preferredCarerIds: ["person-vb-008"], isSelfBooker: false,
    notes: "Postoperativ Hüft-OP, Reha-Vorbereitung" },

  // Charité, Pädiatrie 3 — Klient ist hier ein Kind, "isSelfBooker" via Eltern-Account
  { id: "klient-jw",  name: "Jonas Wendt (10 J.)", initials: "JW", pflegegrad: 3, einrichtungId: "kh-charite-mitte", stationId: "st-cha-päd-3",
    address: "Charitéplatz 1, Zi. 3-12, 10117 Berlin", location: { lat: 52.5252, lng: 13.3782 },
    preferredCarerIds: ["person-yh-014"], isSelfBooker: false,
    notes: "Eltern als Bezugspersonen, chronische Erkrankung" },

  // Klinikum Essen-Mitte, Pulmologie 3B
  { id: "klient-bs",  name: "Bertha Schäffer",  initials: "BS", pflegegrad: 3, einrichtungId: "kh-essen-mitte", stationId: "st-kem-pulmo-3b",
    address: "Henricistr. 92, Zi. 3B-04, 45136 Essen", location: { lat: 51.4556, lng: 7.0116 },
    preferredCarerIds: ["person-dr", "person-ls"], isSelfBooker: false,
    notes: "COPD Stadium III, Sauerstoffpflichtig" },

  // ─── Erweiterung auf 20 Klient:innen ──────────────────────────────
  // Pflegeheim St. Lukas, Wohnbereich A (gleiche Station wie Helga)
  { id: "klient-ot",  name: "Otto Tannenberger", initials: "OT", pflegegrad: 4, einrichtungId: "ph-bochum-süd", stationId: "st-luk-wohn-a",
    address: "Lukasweg 14, Zi. 18, 44805 Bochum", location: { lat: 51.4961, lng: 7.2241 },
    preferredCarerIds: ["person-fk-004", "person-as-005"], isSelfBooker: false,
    notes: "Z.n. Schlaganfall, Aphasie, Hemiparese rechts" },
  { id: "klient-gh",  name: "Gertrud Hopfauf",   initials: "GH", pflegegrad: 5, einrichtungId: "ph-bochum-süd", stationId: "st-luk-wohn-a",
    address: "Lukasweg 14, Zi. 22, 44805 Bochum", location: { lat: 51.4961, lng: 7.2240 },
    preferredCarerIds: ["person-as-005", "person-fk-004"], isSelfBooker: false,
    notes: "Palliativ, Tumorwunde, Schmerzpumpe aktiv" },

  // Wohnbereich B (St. Lukas)
  { id: "klient-pn",  name: "Peter Niedermeier", initials: "PN", pflegegrad: 3, einrichtungId: "ph-bochum-süd", stationId: "st-luk-wohn-b",
    address: "Lukasweg 14, Zi. B-08, 44805 Bochum", location: { lat: 51.4960, lng: 7.2238 },
    preferredCarerIds: ["person-jm-006"], isSelfBooker: true,
    notes: "Diabetes mellitus T1, Insulinpflichtig, kognitiv klar" },
  { id: "klient-as-77", name: "Alma Schober",     initials: "AS", pflegegrad: 4, einrichtungId: "ph-bochum-süd", stationId: "st-luk-wohn-b",
    address: "Lukasweg 14, Zi. B-11, 44805 Bochum", location: { lat: 51.4960, lng: 7.2238 },
    preferredCarerIds: ["person-jm-006"], isSelfBooker: false,
    notes: "Demenz fortgeschritten, Validations-Therapie" },

  // Pflegeheim Prenzl-Berg, Hauptstation Wattwege (gleiche Station wie Reinhardt Kuhn)
  { id: "klient-vh",  name: "Volker Hagedorn",   initials: "VH", pflegegrad: 3, einrichtungId: "ph-prenzl-berg", stationId: "st-wat-haupt",
    address: "Wattgasse 22, Zi. 4, 10405 Berlin", location: { lat: 52.5392, lng: 13.4194 },
    preferredCarerIds: [], isSelfBooker: true,
    notes: "Z.n. Hüft-TEP, Reha-Phase, Mobilisation aktiv" },
  { id: "klient-mb-66", name: "Margot Bergmann", initials: "MB", pflegegrad: 4, einrichtungId: "ph-prenzl-berg", stationId: "st-wat-haupt",
    address: "Wattgasse 22, Zi. 9, 10405 Berlin", location: { lat: 52.5392, lng: 13.4194 },
    preferredCarerIds: [], isSelfBooker: false,
    notes: "Parkinson Stadium 3 (Hoehn-Yahr), Schluckstörung" },

  // Ambulant Augsburg, Tour Süd (gleiche Tour wie Friedrich + Maria)
  { id: "klient-hk",  name: "Hannelore Kärcher", initials: "HK", pflegegrad: 3, einrichtungId: "amb-augsburg", stationId: "st-apl-tour-süd",
    address: "Maximilianstraße 47, 86150 Augsburg", location: { lat: 48.3636, lng: 10.8980 },
    preferredCarerIds: ["person-st-011", "person-ed-012"], isSelfBooker: true,
    notes: "Multiple Sklerose, Selbst-Booker für Wunschpflegekraft" },
  { id: "klient-rs-58", name: "Rolf Schiller",   initials: "RS", pflegegrad: 2, einrichtungId: "amb-augsburg", stationId: "st-apl-tour-süd",
    address: "Theaterstraße 3, 86150 Augsburg", location: { lat: 48.3691, lng: 10.8946 },
    preferredCarerIds: ["person-ed-012"], isSelfBooker: true,
    notes: "Mobilitäts-Hilfe + Begleitung, COPD II" },

  // Klinikum München-Nord, Geriatrie (gleiche Station wie Konrad Obermair)
  { id: "klient-ed-83", name: "Edith Donhauser", initials: "ED", pflegegrad: 4, einrichtungId: "kh-münchen-nord", stationId: "st-kmn-geri-5",
    address: "Englschalkinger Str. 77, Zi. 5-12, 81925 München", location: { lat: 48.1690, lng: 11.6485 },
    preferredCarerIds: ["person-vb-008", "person-le-009"], isSelfBooker: false,
    notes: "Demenz + Diabetes + Mobilitätseinschränkung" },
  { id: "klient-jh-77", name: "Josef Hinterbrandner", initials: "JH", pflegegrad: 5, einrichtungId: "kh-münchen-nord", stationId: "st-kmn-geri-5",
    address: "Englschalkinger Str. 77, Zi. 5-15, 81925 München", location: { lat: 48.1691, lng: 11.6485 },
    preferredCarerIds: ["person-vb-008"], isSelfBooker: false,
    notes: "Palliativ, Lungenkarzinom, Schmerz-Therapie" },
];
