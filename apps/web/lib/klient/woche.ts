// Klient-Wochenübersicht — alle Termine quer durch alle Berufe,
// die diese:n Klient:in in den nächsten 7 Tagen betreffen.
//
// Single-Source-Demo-Stand: Helga Reinhardt (`klient-hr`). Phase 2:
// Aggregation aus Pflege-Tour + Therapie-Plan + Apotheke-Verblisterung
// + Medizintechnik-Wartung + Begleitung-Sitzungen + Arzt-Visite +
// Sozial-Hilfeplan + Ehrenamt-Hospiz-Stunden + Bestatter-Vorsorge.

export type WocheBeruf =
  | "pflege"
  | "arzt"
  | "therapie"
  | "apotheke"
  | "medizintechnik"
  | "begleitung"
  | "bestatter"
  | "sozial"
  | "ehrenamt"
  | "kueche"
  | "hauswirtschaft";

export type WocheStatus = "geplant" | "laeuft" | "erledigt" | "verschoben" | "abgesagt";

export type WocheTermin = {
  id:           string;
  klientId:     string;
  datum:        string;            // YYYY-MM-DD
  uhrzeit:      string;            // HH:MM
  dauerMin:     number;
  beruf:        WocheBeruf;
  titel:        string;             // z.B. "Manuelle Therapie · Schulter li."
  person:       string;             // wer kommt — z.B. "Sebastian Rauer (Physio)"
  ort:          string;             // "im Zimmer 102" / "in Praxis Steglitz"
  wasPassiert:  string;             // 1 Satz Klartext
  meinWunsch?:  string;             // dokumentierter Wunsch der/des Klient:in
  status:       WocheStatus;
  linkCockpit:  string;             // → wo die Profi-Sicht läuft
};

export const WOCHE_BERUF_LABEL: Record<WocheBeruf, string> = {
  pflege:         "Pflege",
  arzt:           "Arzt",
  therapie:       "Therapie",
  apotheke:       "Apotheke",
  medizintechnik: "Medizintechnik",
  begleitung:     "Würde-Begleitung",
  bestatter:      "Bestatter · Vorsorge",
  sozial:         "Sozialarbeit",
  ehrenamt:       "Ehrenamt · Hospiz",
  kueche:         "Küche",
  hauswirtschaft: "Hauswirtschaft",
};

export const WOCHE_BERUF_FARBE: Record<WocheBeruf, string> = {
  pflege:         "var(--mon)",
  arzt:           "var(--vibe-profile)",
  therapie:       "var(--fri)",
  apotheke:       "var(--vibe-team)",
  medizintechnik: "var(--vibe-stats)",
  begleitung:     "var(--wed)",
  bestatter:      "var(--vibe-profile)",
  sozial:         "var(--tue)",
  ehrenamt:       "var(--thu)",
  kueche:         "var(--sun)",
  hauswirtschaft: "var(--sun)",
};

export const WOCHE_BERUF_GLYPH: Record<WocheBeruf, string> = {
  pflege:         "✚",
  arzt:           "℞",
  therapie:       "◇",
  apotheke:       "℞",
  medizintechnik: "▤",
  begleitung:     "🤲",
  bestatter:      "🕊",
  sozial:         "◌",
  ehrenamt:       "♡",
  kueche:         "◐",
  hauswirtschaft: "❀",
};

export const STATUS_LABEL: Record<WocheStatus, string> = {
  geplant:    "geplant",
  laeuft:     "läuft",
  erledigt:   "erledigt",
  verschoben: "verschoben",
  abgesagt:   "abgesagt",
};

export const STATUS_FARBE: Record<WocheStatus, string> = {
  geplant:    "var(--vibe-team)",
  laeuft:     "var(--accent)",
  erledigt:   "var(--thu)",
  verschoben: "var(--vibe-approval)",
  abgesagt:   "var(--fg-mute)",
};

// Demo-Termine für Helga Reinhardt · Mo-So der aktuellen Woche
const HEUTE = new Date().toISOString().slice(0, 10);
function plus(tage: number): string {
  const d = new Date(HEUTE);
  d.setDate(d.getDate() + tage);
  return d.toISOString().slice(0, 10);
}

export const KLIENT_WOCHE: WocheTermin[] = [
  // ───── HEUTE ─────
  {
    id: "kw-001", klientId: "klient-hr", datum: HEUTE, uhrzeit: "07:30", dauerMin: 25,
    beruf: "pflege",
    titel: "Morgen-Pflege · Körperwäsche + Anziehen",
    person: "Maria Klein (PFK)",
    ort: "in Zimmer 102",
    wasPassiert: "Beruhigt waschen, Lavendel-Lotion auf Schultern, Kompressionsstrumpf links anlegen",
    meinWunsch: "bitte erst Tee, dann waschen",
    status: "erledigt",
    linkCockpit: "/pflege/heute",
  },
  {
    id: "kw-002", klientId: "klient-hr", datum: HEUTE, uhrzeit: "09:30", dauerMin: 45,
    beruf: "therapie",
    titel: "MLD + Kompression · linkes Bein",
    person: "Sebastian Rauer (Physio)",
    ort: "in Zimmer 102",
    wasPassiert: "Manuelle Lymphdrainage 30 min, danach Kompressionsbinde frisch wickeln",
    status: "geplant",
    linkCockpit: "/therapie/patienten",
  },
  {
    id: "kw-003", klientId: "klient-hr", datum: HEUTE, uhrzeit: "11:00", dauerMin: 30,
    beruf: "begleitung",
    titel: "Berkana-Berührung · Schulter + Hand",
    person: "Marlene Voss (Würde-Begleitung)",
    ort: "in Zimmer 102",
    wasPassiert: "30 min Hand- und Schulterhalten, leise Brahms-Schlaflied im Hintergrund",
    meinWunsch: "keine Füße bitte (Lymph-OP)",
    status: "geplant",
    linkCockpit: "/begleitung/repertoire",
  },
  {
    id: "kw-004", klientId: "klient-hr", datum: HEUTE, uhrzeit: "12:30", dauerMin: 30,
    beruf: "kueche",
    titel: "Mittagessen · Wunschkost",
    person: "Küche Pulmologie",
    ort: "im Zimmer / Tablett",
    wasPassiert: "Kartoffelsuppe + Apfelmus · weich, da Kau-Erschöpfung",
    status: "geplant",
    linkCockpit: "/lebensmittel",
  },
  {
    id: "kw-005", klientId: "klient-hr", datum: HEUTE, uhrzeit: "16:00", dauerMin: 45,
    beruf: "ehrenamt",
    titel: "Hospiz-Stunde · Vorlesen Lieblings-Roman",
    person: "Rita Schöndorf (Hospiz-Verein)",
    ort: "in Zimmer 102",
    wasPassiert: "Vorlesen Buddenbrooks Kapitel 4-5 · Tee + ruhige Musik",
    meinWunsch: "Lavendel-Tee mit Honig",
    status: "geplant",
    linkCockpit: "/ehrenamt",
  },

  // ───── MORGEN ─────
  {
    id: "kw-101", klientId: "klient-hr", datum: plus(1), uhrzeit: "08:30", dauerMin: 30,
    beruf: "arzt",
    titel: "Visite · Hausarzt",
    person: "Dr. Susanne Hartmann",
    ort: "in Zimmer 102",
    wasPassiert: "INR-Wert besprechen, Marcumar anpassen, Atmung auskultieren",
    status: "geplant",
    linkCockpit: "/arzt/heute",
  },
  {
    id: "kw-102", klientId: "klient-hr", datum: plus(1), uhrzeit: "14:00", dauerMin: 60,
    beruf: "therapie",
    titel: "KG-Mobilisation · LWS",
    person: "Sebastian Rauer (Physio)",
    ort: "in Therapieraum 1",
    wasPassiert: "Bewegungserweiterung LWS, Stabilität M. multifidus, ROM-Reeval",
    status: "geplant",
    linkCockpit: "/therapie/patienten",
  },

  // ───── + 2 ─────
  {
    id: "kw-201", klientId: "klient-hr", datum: plus(2), uhrzeit: "10:00", dauerMin: 30,
    beruf: "apotheke",
    titel: "Wochenverblisterung Lieferung + Stellplan-Check",
    person: "Lukas Faber (Apothekenleitung)",
    ort: "Übergabe an Pflege",
    wasPassiert: "Neue Wochen-Blister mit Tilidin/Spiriva/Citalopram · AMTS-Check geprüft",
    meinWunsch: "weiße Tabletten bitte mit kleiner Wasserschluck-Karte",
    status: "geplant",
    linkCockpit: "/apotheke/heimversorgung",
  },
  {
    id: "kw-202", klientId: "klient-hr", datum: plus(2), uhrzeit: "11:30", dauerMin: 20,
    beruf: "begleitung",
    titel: "Berkana-Berührung · Hand",
    person: "Marlene Voss",
    ort: "in Zimmer 102",
    wasPassiert: "20 min Hand-Halten, schweigen oder leichtes Erzählen",
    status: "geplant",
    linkCockpit: "/begleitung/repertoire",
  },

  // ───── + 3 ─────
  {
    id: "kw-301", klientId: "klient-hr", datum: plus(3), uhrzeit: "09:00", dauerMin: 60,
    beruf: "medizintechnik",
    titel: "Wartung Pflegebett Burmeier · Funktionsprüfung",
    person: "MEDsupply Nord-Werkstatt",
    ort: "in Zimmer 102",
    wasPassiert: "Halbjährliche STK-Funktionsprüfung · Liftmotor + Handterminal",
    status: "geplant",
    linkCockpit: "/medizintechnik/wartung",
  },
  {
    id: "kw-302", klientId: "klient-hr", datum: plus(3), uhrzeit: "13:00", dauerMin: 30,
    beruf: "sozial",
    titel: "Hilfeplan-Gespräch · Pflegegrad-Überprüfung",
    person: "Aysha Kamal (Sozialarbeit)",
    ort: "in Zimmer 102",
    wasPassiert: "PG 4 Aktualisierung · Hilfsmittelbedarf neu erfassen, Tochter dabei",
    meinWunsch: "Tochter Liane soll dazu kommen",
    status: "geplant",
    linkCockpit: "/sozial/hilfeplan",
  },

  // ───── + 4 ─────
  {
    id: "kw-401", klientId: "klient-hr", datum: plus(4), uhrzeit: "15:00", dauerMin: 90,
    beruf: "bestatter",
    titel: "Vorsorge-Gespräch · Erdbestattung Familiengrab",
    person: "Hannah Mainberg (Bestatterin)",
    ort: "im Wohnzimmer (Hausbesuch)",
    wasPassiert: "Wünsche durchgehen: Familiengrab St. Lukas, einfacher Holzsarg, Brahms am Grab",
    meinWunsch: "lila Strickjacke + Perlohrringe (wie Mama auch)",
    status: "geplant",
    linkCockpit: "/bestatter/bestattungsarten",
  },

  // ───── + 5 ─────
  {
    id: "kw-501", klientId: "klient-hr", datum: plus(5), uhrzeit: "11:00", dauerMin: 45,
    beruf: "ehrenamt",
    titel: "Hospiz-Stunde · Vorlesen + Spaziergang",
    person: "Rita Schöndorf",
    ort: "im Garten + Zimmer",
    wasPassiert: "Falls Wetter mild: Rollstuhl in den Garten · sonst weiter Buddenbrooks",
    status: "geplant",
    linkCockpit: "/ehrenamt",
  },
  {
    id: "kw-502", klientId: "klient-hr", datum: plus(5), uhrzeit: "16:30", dauerMin: 25,
    beruf: "pflege",
    titel: "Wundkontrolle · Sakrum",
    person: "Maria Klein (PFK)",
    ort: "in Zimmer 102",
    wasPassiert: "Wundverband wechseln · Polihexanid-Spülung · Foto-Doku",
    status: "geplant",
    linkCockpit: "/pflege/wunde",
  },

  // ───── + 6 ─────
  {
    id: "kw-601", klientId: "klient-hr", datum: plus(6), uhrzeit: "10:00", dauerMin: 30,
    beruf: "begleitung",
    titel: "Berkana-Berührung · Hand + Schulter",
    person: "Marlene Voss",
    ort: "in Zimmer 102",
    wasPassiert: "30 min Halten, evtl. mit Aroma-Lavendel-Tropfen",
    status: "geplant",
    linkCockpit: "/begleitung/repertoire",
  },
];

export function wocheFuerKlient(klientId: string): WocheTermin[] {
  return KLIENT_WOCHE
    .filter((t) => t.klientId === klientId)
    .sort((a, b) => `${a.datum} ${a.uhrzeit}`.localeCompare(`${b.datum} ${b.uhrzeit}`));
}

export function termineProTag(termine: WocheTermin[]): { datum: string; termine: WocheTermin[] }[] {
  const map = new Map<string, WocheTermin[]>();
  for (const t of termine) {
    if (!map.has(t.datum)) map.set(t.datum, []);
    map.get(t.datum)!.push(t);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([datum, termine]) => ({ datum, termine }));
}

export function berufeImEinsatz(termine: WocheTermin[]): WocheBeruf[] {
  const set = new Set<WocheBeruf>();
  termine.forEach((t) => set.add(t.beruf));
  return Array.from(set);
}
