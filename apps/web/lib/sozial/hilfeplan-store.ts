// In-memory Hilfepläne nach BTHG / SGB IX, XII, VIII. Phase-1-Pattern.
// Strukturiert: ICF-Bedarf · SMART-Ziele · Maßnahmen · Review-Zyklus · Verlauf.

export type HilfeplanStatus = "in_bearbeitung" | "vorbereitet" | "erreicht" | "abgebrochen";

export type IcfDomain = "b" | "s" | "d" | "e";

export type IcfEintrag = {
  code: string;
  label: string;
  domain: IcfDomain;
  bewertung: 0 | 1 | 2 | 3 | 4; // 0 nicht beeinträchtigt → 4 voll beeinträchtigt
};

export type Ziel = {
  id: string;
  text: string;
  zeitperspektive: string;
  status: HilfeplanStatus;
  traeger: string;
};

export type Massnahme = {
  id: string;
  was: string;
  traeger: string;
  finanzierung: string;
  start: string;
  status: "läuft" | "geplant" | "Antrag" | "abgeschlossen" | "abgelehnt";
};

export type ReviewEintrag = {
  datum: string;
  veranstaltung: "Erst-Hilfeplan" | "Halbjahres-Review" | "Quartals-Review" | "Anlass-Review";
  ergebnis: string;
  beteiligt: string[];
};

export type Hilfeplan = {
  id: string;
  klient: string;
  geburt: string;
  sgb: "VIII" | "IX" | "XI" | "XII";
  ueberschrift: string;
  thema: string;
  phase: string;
  prio: 1 | 2 | 3;
  farbe: string;
  zustaendig: string;
  partizipativ: string;            // wie wird Klient:in beteiligt
  icf: IcfEintrag[];
  ziele: Ziel[];
  massnahmen: Massnahme[];
  reviewIntervall: string;
  letzteReview: string;
  naechsteReview: string;
  verlauf: ReviewEintrag[];
};

const PLAENE: Hilfeplan[] = [
  {
    id: "hp-lange",
    klient: "Friedrich Lange",
    geburt: "1962-04-15",
    sgb: "IX",
    ueberschrift: "Teilhabeplan nach Schlaganfall",
    thema: "BTHG-Teilhabe nach Schlaganfall",
    phase: "Bedarfsfeststellung läuft",
    prio: 3,
    farbe: "var(--mon)",
    zustaendig: "Mira Wagner · ASD Pankow",
    partizipativ: "Klient spricht selbst · Tochter Anna als Vertrauensperson dabei",
    icf: [
      { code: "b730",  label: "Funktionen der Muskelkraft",     domain: "b", bewertung: 3 },
      { code: "b167",  label: "Mentale Sprachfunktionen",         domain: "b", bewertung: 2 },
      { code: "d450",  label: "Gehen",                            domain: "d", bewertung: 3 },
      { code: "d540",  label: "Sich kleiden",                     domain: "d", bewertung: 2 },
      { code: "d850",  label: "Bezahlte Tätigkeit ausüben",       domain: "d", bewertung: 4 },
      { code: "e310",  label: "Engste Familie",                   domain: "e", bewertung: 1 },
      { code: "e155",  label: "Wohnverhältnisse · Bad/Treppe",   domain: "e", bewertung: 3 },
    ],
    ziele: [
      { id: "z-1", text: "Selbstständige Körperpflege im Alltag wieder erreichen",                  zeitperspektive: "12 Mo", status: "in_bearbeitung", traeger: "Reha-Klinik · Pflegekasse" },
      { id: "z-2", text: "Rückkehr in den Beruf (50 % Stelle als Bürokraft)",                        zeitperspektive: "18 Mo", status: "vorbereitet",     traeger: "Integrationsamt · BA-Reha" },
      { id: "z-3", text: "Kommunikative Selbstständigkeit (sprachliche Barrieren reduzieren)",        zeitperspektive: "9 Mo",  status: "in_bearbeitung", traeger: "Logopädie · Selbsthilfegruppe" },
    ],
    massnahmen: [
      { id: "m-1", was: "Ergotherapie 2× wöchentlich",                                      traeger: "Heilmittelerbringer", finanzierung: "GKV (HKP)",                  start: "läuft seit 03/2026", status: "läuft" },
      { id: "m-2", was: "Logopädie 2× wöchentlich",                                          traeger: "Heilmittelerbringer", finanzierung: "GKV (HKP)",                  start: "läuft seit 03/2026", status: "läuft" },
      { id: "m-3", was: "Stufenweise Wiedereingliederung Hamburger Modell",                   traeger: "Hausarzt + AG",       finanzierung: "GKV (KG-Bezug)",             start: "Q3/2026",            status: "geplant" },
      { id: "m-4", was: "Wohnumfeld-Anpassung Bad/Treppe",                                    traeger: "Pflegekasse",         finanzierung: "§ 40 SGB XI bis 4.180 €",     start: "Antrag 04/2026",     status: "Antrag" },
      { id: "m-5", was: "Persönliches Budget § 29 SGB IX (Eingliederungshilfe)",               traeger: "Sozialamt",           finanzierung: "Eingliederungshilfe",         start: "Antrag in Prüfung",   status: "Antrag" },
    ],
    reviewIntervall: "alle 6 Monate",
    letzteReview: "2026-02-15",
    naechsteReview: "2026-08-15",
    verlauf: [
      { datum: "2026-01-12", veranstaltung: "Erst-Hilfeplan",      ergebnis: "Bedarfsbogen erfasst · 3 Hauptziele formuliert · Heilmittel-VOs eingeleitet",         beteiligt: ["Klient", "Tochter", "Mira W. (ASD)", "Hausärztin", "Reha-Sozialdienst"] },
      { datum: "2026-02-15", veranstaltung: "Anlass-Review",       ergebnis: "Wohnumfeld-Antrag finalisiert · Ergo + Logo gestartet · Berufs-Ziel auf Q3 verschoben", beteiligt: ["Klient", "Tochter", "Mira W. (ASD)", "Reha-Klinik"] },
    ],
  },
  {
    id: "hp-otto",
    klient: "Karina Otto",
    geburt: "1979-08-23",
    sgb: "XII",
    ueberschrift: "Existenzsicherung + Wohnungs-Verbleib",
    thema: "Grundsicherung + Wohnung",
    phase: "Antrag läuft",
    prio: 2,
    farbe: "var(--tue)",
    zustaendig: "Mira Wagner · ASD Pankow",
    partizipativ: "Klientin entscheidet · Begleitung durch Mira W. zu allen Behörden-Terminen",
    icf: [
      { code: "b152",  label: "Emotionale Funktionen",            domain: "b", bewertung: 2 },
      { code: "d240",  label: "Stress + Anforderungen bewältigen",  domain: "d", bewertung: 3 },
      { code: "d845",  label: "Arbeit erhalten + behalten",         domain: "d", bewertung: 3 },
      { code: "e165",  label: "Vermögenswerte",                    domain: "e", bewertung: 4 },
      { code: "e525",  label: "Wohnen + Wohnungsdienste",           domain: "e", bewertung: 3 },
    ],
    ziele: [
      { id: "z-1", text: "Grundsicherung gesichert (Antrag läuft, vorläufige Zahlung beantragt)",     zeitperspektive: "3 Mo",  status: "in_bearbeitung", traeger: "Sozialamt" },
      { id: "z-2", text: "Wohnung erhalten · keine Räumungsklage",                                     zeitperspektive: "3 Mo",  status: "in_bearbeitung", traeger: "Vermieter · Sozialamt KdU" },
      { id: "z-3", text: "Mittelfristig Wiedereinstieg Teilzeit",                                       zeitperspektive: "12 Mo", status: "vorbereitet",     traeger: "Jobcenter · Reha-Beratung" },
    ],
    massnahmen: [
      { id: "m-1", was: "Antrag SGB XII Grundsicherung (Eilantrag)",                                  traeger: "Sozialamt Pankow", finanzierung: "—",                              start: "Antrag 04/2026",      status: "Antrag" },
      { id: "m-2", was: "Mietschulden-Übernahme nach § 36 SGB XII",                                    traeger: "Sozialamt Pankow", finanzierung: "§ 36 SGB XII bis 2 Mietmonate",   start: "Antrag 04/2026",      status: "Antrag" },
      { id: "m-3", was: "Schuldnerberatung Diakonie (Termin in 10 Tagen)",                              traeger: "Diakonie Berlin",   finanzierung: "kostenfrei",                     start: "Termin 14.05.",        status: "geplant" },
      { id: "m-4", was: "Psychosoziale Beratung (depressive Episode begleiten)",                       traeger: "Beratungsstelle",   finanzierung: "kostenfrei",                     start: "Termin in 5 Tagen",    status: "geplant" },
    ],
    reviewIntervall: "alle 3 Monate (Antragsphase)",
    letzteReview: "2026-04-22",
    naechsteReview: "2026-07-22",
    verlauf: [
      { datum: "2026-04-22", veranstaltung: "Erst-Hilfeplan",     ergebnis: "Soforthilfe gesichert · 4 Maßnahmen vereinbart · Vermieter informiert (KdU-Direkt)",  beteiligt: ["Klientin", "Mira W. (ASD)", "Schuldnerberatung-Anbahnung"] },
    ],
  },
  {
    id: "hp-cordes",
    klient: "Familie Cordes",
    geburt: "Tochter 2021-09-12 (4 J.)",
    sgb: "VIII",
    ueberschrift: "Hilfe zur Erziehung · § 31 SGB VIII (SPFH)",
    thema: "Hilfe zur Erziehung",
    phase: "Hilfeplan aktiv",
    prio: 2,
    farbe: "var(--vibe-team)",
    zustaendig: "Mira Wagner · ASD Pankow",
    partizipativ: "Eltern + Tochter (alters-angemessen) · SPFH 2× wöchentlich · Vertrauensperson Großmutter",
    icf: [
      { code: "d240",  label: "Stress + Anforderungen bewältigen (Eltern)", domain: "d", bewertung: 3 },
      { code: "d250",  label: "Eigenes Verhalten steuern",                 domain: "d", bewertung: 2 },
      { code: "d760",  label: "Familienbeziehungen",                       domain: "d", bewertung: 3 },
      { code: "d815",  label: "Vorschulbildung",                           domain: "d", bewertung: 1 },
      { code: "e310",  label: "Engste Familie",                            domain: "e", bewertung: 2 },
    ],
    ziele: [
      { id: "z-1", text: "Familienalltag stabilisieren · feste Tagesstruktur Mo-So",                  zeitperspektive: "6 Mo",  status: "in_bearbeitung", traeger: "SPFH" },
      { id: "z-2", text: "Bindung Mutter-Tochter stärken · gemeinsame Zeit täglich 30 min",            zeitperspektive: "6 Mo",  status: "in_bearbeitung", traeger: "SPFH" },
      { id: "z-3", text: "Mutter beruflich orientiert (Praktikum oder Qualifikation)",                  zeitperspektive: "12 Mo", status: "vorbereitet",     traeger: "Jobcenter · BIWAQ" },
    ],
    massnahmen: [
      { id: "m-1", was: "SPFH 2× wöchentlich · 4 Stunden",                                              traeger: "Träger Diakonie",      finanzierung: "§ 31 SGB VIII",            start: "läuft seit 02/2026",  status: "läuft" },
      { id: "m-2", was: "Kita-Platz vollzeit (statt halbtags)",                                          traeger: "Kita Sonnenblume",     finanzierung: "JUH-Gutschein",           start: "läuft seit 03/2026",  status: "läuft" },
      { id: "m-3", was: "Erziehungsberatung Mutter (14-tägig)",                                          traeger: "Caritas Erz-Beratung",  finanzierung: "kostenfrei",              start: "läuft",                status: "läuft" },
      { id: "m-4", was: "Bewerbungs-Coaching",                                                          traeger: "Jobcenter",             finanzierung: "AZAV",                    start: "Q3 2026",              status: "geplant" },
    ],
    reviewIntervall: "alle 3 Monate",
    letzteReview: "2026-04-15",
    naechsteReview: "2026-07-15",
    verlauf: [
      { datum: "2026-01-25", veranstaltung: "Erst-Hilfeplan",     ergebnis: "SPFH genehmigt · Kita-Vollzeit zugesagt · drei Hauptziele formuliert",                beteiligt: ["Mutter", "Tochter (anwesend)", "Mira W. (ASD)", "SPFH-Fachkraft", "Großmutter"] },
      { datum: "2026-04-15", veranstaltung: "Quartals-Review",    ergebnis: "Tagesstruktur stabilisiert · Bindung verbessert · Beruf-Ziel auf Q3 verschoben",       beteiligt: ["Mutter", "Mira W. (ASD)", "SPFH-Fachkraft"] },
    ],
  },
  {
    id: "hp-reinhardt",
    klient: "Helga Reinhardt",
    geburt: "1944-11-04",
    sgb: "XI",
    ueberschrift: "Pflegegrad-Erhöhung 3 → 4",
    thema: "Pflegegrad-Erhöhung",
    phase: "MD-Begutachtung vorbereitet",
    prio: 1,
    farbe: "var(--thu)",
    zustaendig: "Mira Wagner + Detektiv Eins (PDL)",
    partizipativ: "Klientin entscheidet selbst · Tochter nicht ortsansässig · Pflege + Therapie + Hausarzt liefern Vorbefunde",
    icf: [
      { code: "b730",  label: "Funktionen der Muskelkraft",                domain: "b", bewertung: 3 },
      { code: "b4352", label: "Funktionen der Lymphgefäße",                 domain: "b", bewertung: 3 },
      { code: "d410",  label: "Eine elementare Körperposition wechseln",     domain: "d", bewertung: 3 },
      { code: "d450",  label: "Gehen",                                       domain: "d", bewertung: 3 },
      { code: "d510",  label: "Sich waschen",                                domain: "d", bewertung: 3 },
      { code: "d540",  label: "Sich kleiden",                                domain: "d", bewertung: 3 },
    ],
    ziele: [
      { id: "z-1", text: "PG 4 anerkannt · höhere Sachleistung + Entlastungsbetrag",                 zeitperspektive: "3 Mo",  status: "in_bearbeitung", traeger: "Pflegekasse · MD" },
      { id: "z-2", text: "Verhinderungspflege ausschöpfen (1.612 € + Kombi-Leistung)",                 zeitperspektive: "12 Mo", status: "vorbereitet",     traeger: "Pflegekasse" },
    ],
    massnahmen: [
      { id: "m-1", was: "MD-Begutachtungstermin koordiniert",                                          traeger: "MD Berlin",         finanzierung: "—",                              start: "Termin in 21 Tagen",  status: "geplant" },
      { id: "m-2", was: "NBA-Modul-Vorbereitung mit Pflege/Therapie/Arzt-Befunden",                     traeger: "Shalem Care eG",     finanzierung: "kostenfrei",                     start: "läuft",                status: "läuft" },
      { id: "m-3", was: "Wohnumfeld-Anpassung (Pflege-Bett, Aufstehhilfe)",                              traeger: "Pflegekasse",        finanzierung: "§ 40 SGB XI bis 4.180 €",         start: "Antrag in 14 Tagen",   status: "geplant" },
    ],
    reviewIntervall: "anlassbezogen",
    letzteReview: "2026-04-30",
    naechsteReview: "2026-05-29",
    verlauf: [
      { datum: "2026-04-30", veranstaltung: "Erst-Hilfeplan",     ergebnis: "MD-Antrag eingereicht · NBA-Vorbereitung gestartet · Verhinderungspflege-Aufklärung",  beteiligt: ["Klientin", "Mira W. (ASD)", "Pflege Dennis R.", "Hausarzt"] },
    ],
  },
];

export function listHilfeplaene(): Hilfeplan[] {
  return PLAENE;
}

export function getHilfeplan(id: string): Hilfeplan | null {
  return PLAENE.find((p) => p.id === id) ?? null;
}

export const ICF_DOMAIN_LABEL: Record<IcfDomain, string> = {
  b: "Körperfunktionen",
  s: "Körperstrukturen",
  d: "Aktivitäten + Teilhabe",
  e: "Umweltfaktoren",
};

export const ICF_DOMAIN_FARBE: Record<IcfDomain, string> = {
  b: "var(--vibe-team)",
  s: "var(--vibe-stats)",
  d: "var(--vibe-approval)",
  e: "var(--thu)",
};

export const ICF_BEWERTUNG_LABEL: Record<number, string> = {
  0: "nicht beeinträchtigt",
  1: "leicht",
  2: "mäßig",
  3: "erheblich",
  4: "voll beeinträchtigt",
};
