// Ehrenamt-Begleitung · Stub-Store mit 3 Klient:innen + Termin-Verlauf.
// Stimmungsskala 1–5 (Brüggemann/Hospiz-Verein-Berlin-Curriculum):
// 1 = sehr trüb · 2 = trüb · 3 = neutral · 4 = aufgehellt · 5 = freudig.

export type StimmungsWert = 1 | 2 | 3 | 4 | 5;

export const STIMMUNG_LABEL: Record<StimmungsWert, string> = {
  1: "sehr trüb",
  2: "trüb",
  3: "neutral",
  4: "aufgehellt",
  5: "freudig",
};

export const STIMMUNG_FARBE: Record<StimmungsWert, string> = {
  1: "var(--mon)",
  2: "var(--vibe-profile)",
  3: "var(--bg-mute)",
  4: "var(--vibe-team)",
  5: "var(--thu)",
};

export type BegleitTermin = {
  id: string;
  datum: string;       // ISO yyyy-mm-dd
  dauer_min: number;
  stimmung: StimmungsWert;
  themen: string[];    // 1–3 Schlagworte
  notiz: string;       // 1–2 Sätze, was bewegt hat
};

export type Lebenslage =
  | "trauer"
  | "einsamkeit"
  | "angst-vorm-tod"
  | "demenz-progression"
  | "familien-konflikt"
  | "spirituelle-suche"
  | "körperlicher-abbau";

export const LEBENSLAGE_LABEL: Record<Lebenslage, string> = {
  "trauer":              "Trauer",
  "einsamkeit":          "Einsamkeit",
  "angst-vorm-tod":      "Angst vor dem Sterben",
  "demenz-progression":  "Demenz schreitet voran",
  "familien-konflikt":   "Familien-Konflikt",
  "spirituelle-suche":   "Spirituelle Suche",
  "körperlicher-abbau":  "Körperlicher Abbau",
};

export const LEBENSLAGE_FARBE: Record<Lebenslage, string> = {
  "trauer":              "var(--vibe-profile)",
  "einsamkeit":          "var(--tue)",
  "angst-vorm-tod":      "var(--mon)",
  "demenz-progression":  "var(--sun)",
  "familien-konflikt":   "var(--vibe-stats)",
  "spirituelle-suche":   "var(--vibe-team)",
  "körperlicher-abbau":  "var(--fri)",
};

export type BegleitKlient = {
  id: string;
  name: string;
  alter: number;
  seit: string;
  rhythmus: string;
  farbe: string;
  biografie: string;
  aktivitaeten: string[];
  grenzen: string;
  kontaktNotfall: string;
  lebenslagen: Lebenslage[];
  termine: BegleitTermin[];
};

const KLIENTEN: BegleitKlient[] = [
  {
    id: "klient-hr",
    name: "Helga Reinhardt",
    alter: 78,
    seit: "8 Monate",
    rhythmus: "wöchentlich Donnerstag 15–16:30",
    farbe: "var(--wed)",
    biografie:
      "Geboren 1948 in Posen, Übersiedlung 1956. Lehrerin im Ruhestand. Tochter Karin in Hamburg. " +
      "Liebt Kaffee mit Kondensmilch, alte Reise-Diakästen, Astrid Lindgren. " +
      "Mann verstorben 2017 — Thema kommt von ihr aus, nicht von außen.",
    aktivitaeten: ["Tee-Nachmittag mit Erinnerungs-Gespräch", "Spaziergang im Park", "Vorlesen alter Briefe"],
    grenzen:
      "keine politischen Gespräche · keine Religion · " +
      "niemals nach dem Mann fragen ohne dass sie ihn erwähnt",
    kontaktNotfall: "Tochter Karin · 0173 / 4567 ...",
    lebenslagen: ["einsamkeit", "trauer"],
    termine: [
      { id: "t-1", datum: "2026-03-12", dauer_min: 90, stimmung: 4, themen: ["Posen", "Mutter"], notiz: "Hat zum ersten Mal von der Übersiedlung 1956 erzählt — viele Bilder." },
      { id: "t-2", datum: "2026-03-19", dauer_min: 90, stimmung: 3, themen: ["Karin", "Hamburg"], notiz: "Tochter war zwei Wochen nicht da. Sehnsucht spürbar." },
      { id: "t-3", datum: "2026-03-26", dauer_min: 75, stimmung: 4, themen: ["Schule", "alte Klasse"], notiz: "Erinnerung an ihre Lehrer-Zeit · viele Anekdoten · gelacht." },
      { id: "t-4", datum: "2026-04-02", dauer_min: 90, stimmung: 5, themen: ["Hochzeit"], notiz: "Hat von ihrer Hochzeit erzählt — viele Erinnerungen." },
      { id: "t-5", datum: "2026-04-09", dauer_min: 90, stimmung: 3, themen: ["Karin", "Krankenhaus"], notiz: "Karin hatte OP — Helga sehr besorgt, schwer abzulenken." },
      { id: "t-6", datum: "2026-04-16", dauer_min: 60, stimmung: 2, themen: ["Müdigkeit"], notiz: "Sehr müde, hat viel geschlafen. Habe nur dagesessen." },
      { id: "t-7", datum: "2026-04-23", dauer_min: 90, stimmung: 4, themen: ["Briefe", "Mann"], notiz: "Sie selbst hat ihren verstorbenen Mann erwähnt — sanft, dann gemeinsam Briefe gelesen." },
      { id: "t-8", datum: "2026-04-30", dauer_min: 90, stimmung: 4, themen: ["Spaziergang"], notiz: "Frühling im Park, sie hat viel gefragt zu Pflanzen." },
    ],
  },
  {
    id: "klient-wb",
    name: "Walter Brand",
    alter: 84,
    seit: "5 Monate",
    rhythmus: "vierzehntägig Samstag",
    farbe: "var(--thu)",
    biografie:
      "Geboren 1942 in Berlin. Schiffsingenieur. Ehefrau verstorben 2019. Keine Kinder. " +
      "Liebt Schach, schwarzen Tee, klassische Musik (besonders Sibelius). " +
      "Knie-Schmerzen seit 2024, daher Spaziergänge kürzer.",
    aktivitaeten: ["Spaziergang Tiergarten", "Schach", "Sibelius-Konzert auf YouTube"],
    grenzen:
      "Spaziergang max 60 min · bei Schmerzen pausieren · " +
      "Schach-Niederlage nicht problematisieren · Bundeswehr-Erlebnisse nur, wenn er anfängt",
    kontaktNotfall: "Hospiz-Koordinator · 030 / 12345 ...",
    lebenslagen: ["einsamkeit", "körperlicher-abbau", "trauer"],
    termine: [
      { id: "t-1", datum: "2026-03-07", dauer_min: 60, stimmung: 3, themen: ["Schach"], notiz: "Hat erstmals seit Wochen wieder gewonnen — kurzer Stolz-Moment." },
      { id: "t-2", datum: "2026-03-21", dauer_min: 50, stimmung: 2, themen: ["Knie", "Müdigkeit"], notiz: "Kürzerer Spaziergang, Knie hat geschmerzt." },
      { id: "t-3", datum: "2026-04-04", dauer_min: 70, stimmung: 4, themen: ["Sibelius", "Schiff"], notiz: "Geschichten von der Werft — sehr lebendig." },
      { id: "t-4", datum: "2026-04-18", dauer_min: 60, stimmung: 3, themen: ["Frau"], notiz: "Hat seine verstorbene Frau erwähnt — kurz, aber er ließ es zu." },
      { id: "t-5", datum: "2026-05-02", dauer_min: 50, stimmung: 2, themen: ["Schmerzen", "Pflegegrad"], notiz: "Sorgen um steigenden Pflegebedarf, keine Familie da. An Pflege weitergeleitet." },
    ],
  },
  {
    id: "klient-eg",
    name: "Erika Gärtner",
    alter: 81,
    seit: "3 Monate",
    rhythmus: "wöchentlich Mittwoch 16–16:45",
    farbe: "var(--vibe-team)",
    biografie:
      "Geboren 1945 in Sachsen. Grundschullehrerin. Drei Enkelkinder. " +
      "Beginnende Demenz seit 2024 (vaskulärer Typ). Reagiert sehr auf Berührung und Stimme. " +
      "Liebt Kinderbücher (Pippi Langstrumpf, Karlsson), kurze Lieder.",
    aktivitaeten: ["Vorlesen (Astrid Lindgren)", "kurze Hand-Massage", "alte Schulreime"],
    grenzen:
      "Demenz-Erkrankung · klare Sätze, keine schnellen Themenwechsel · ruhige Stimme · " +
      "kein Test-Charakter, keine Quiz-Fragen — sie braucht keine Erinnerungs-Prüfung",
    kontaktNotfall: "Pflegeheim · 030 / 98765 ...",
    lebenslagen: ["demenz-progression", "einsamkeit"],
    termine: [
      { id: "t-1", datum: "2026-03-04", dauer_min: 45, stimmung: 4, themen: ["Pippi"], notiz: "Hat mitgelacht beim Vorlesen — sehr präsent heute." },
      { id: "t-2", datum: "2026-03-11", dauer_min: 45, stimmung: 3, themen: ["Hand"], notiz: "Hand-Massage hat sie genossen, wenig Worte." },
      { id: "t-3", datum: "2026-03-18", dauer_min: 30, stimmung: 2, themen: ["Verwirrung"], notiz: "Mich nicht erkannt, war unruhig. Habe leise gesprochen, sie wieder ruhiger." },
      { id: "t-4", datum: "2026-03-25", dauer_min: 45, stimmung: 3, themen: ["Karlsson"], notiz: "Vorlesen, sie ist eingeschlafen — sanft." },
      { id: "t-5", datum: "2026-04-01", dauer_min: 45, stimmung: 4, themen: ["Schulreim"], notiz: "Sie hat einen Reim aus ihrer Kindheit selbst zu Ende gesprochen!" },
      { id: "t-6", datum: "2026-04-08", dauer_min: 30, stimmung: 2, themen: ["Müdigkeit"], notiz: "Sehr müde, kaum gesprochen. Hand gehalten." },
      { id: "t-7", datum: "2026-04-15", dauer_min: 45, stimmung: 4, themen: ["Pippi", "Singen"], notiz: "„Hej Pippi Langstrumpf“ — sie hat mitgesummt." },
    ],
  },
];

export function listBegleitKlienten(): BegleitKlient[] {
  return KLIENTEN;
}

export function getBegleitKlient(id: string): BegleitKlient | undefined {
  return KLIENTEN.find((k) => k.id === id);
}

// Mittlere Stimmung der letzten N Termine. Liefert null bei leerem Verlauf.
export function stimmungsMittel(termine: BegleitTermin[], letzteN = 4): number | null {
  const slice = termine.slice(-letzteN);
  if (slice.length === 0) return null;
  return slice.reduce((s, t) => s + t.stimmung, 0) / slice.length;
}

// Tendenz: vergleicht ersten Hälfte mit zweiter Hälfte des Verlaufs.
export type StimmungsTendenz = "fallend" | "steigend" | "stabil" | "—";

export function stimmungsTendenz(termine: BegleitTermin[]): StimmungsTendenz {
  if (termine.length < 4) return "—";
  const mid = Math.floor(termine.length / 2);
  const a = termine.slice(0, mid).reduce((s, t) => s + t.stimmung, 0) / mid;
  const b = termine.slice(mid).reduce((s, t) => s + t.stimmung, 0) / (termine.length - mid);
  const delta = b - a;
  if (delta < -0.4) return "fallend";
  if (delta >  0.4) return "steigend";
  return "stabil";
}
