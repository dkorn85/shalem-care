// Welt-Zustand der Live-Simulation. Reine Datenstrukturen, keine
// Browser- oder Next-Spezialitäten — wird vom Client gehalten und tickt
// alle N Sekunden. Server-Actions liefern KI-Inhalt für einzelne Events.
//
// Bewusst keine Persistenz — bei Reload startet die Welt frisch. Das ist
// Demo-typisch und vermeidet komplizierte State-Sync-Pfade.

export type SimZeit = {
  /** Stunde 0-23 */
  stunde: number;
  /** Minute 0-59 */
  minute: number;
};

export type SimVital = {
  schmerzNrs: number; // 0-10
  stimmung: number; // 0-10 (10 = blendend)
  schlafQualitaet: number; // 0-10
  /** Wachheit / Lethargie 0-10 */
  wachheit: number;
};

export type SimEventTyp =
  | "vital-update"
  | "schicht-uebergabe"
  | "termin-start"
  | "termin-ende"
  | "angehoerig-frage"
  | "klient-aussage"
  | "kollege-info"
  | "lieferung"
  | "reparatur"
  | "system";

export type SimEvent = {
  id: string;
  zeit: SimZeit;
  typ: SimEventTyp;
  /** ID der Persona, die das Event auslöst */
  personaId: string;
  text: string;
  /** Optionaler Bezugs-Klient */
  klientId?: string;
  /** Source: 'ki' wenn Claude generiert, 'skript' wenn vorgefertigt, 'heuristik' bei Fallback */
  source?: "ki" | "skript" | "heuristik";
  /** Optionale Tags für UI-Filterung */
  tags?: string[];
};

export type SimWelt = {
  zeit: SimZeit;
  vital: SimVital;
  events: SimEvent[];
  /** Welche Persona-IDs sind heute aktiv */
  aktivePersonas: string[];
  /** Tick-Counter — jede Tick-Funktion erhöht ihn */
  tick: number;
};

export const STARTZEIT: SimZeit = { stunde: 14, minute: 0 };

export const STARTVITAL: SimVital = {
  schmerzNrs: 3,
  stimmung: 6,
  schlafQualitaet: 5,
  wachheit: 7,
};

export function formatZeit(z: SimZeit): string {
  return `${z.stunde.toString().padStart(2, "0")}:${z.minute.toString().padStart(2, "0")}`;
}

export function zeitPlus(z: SimZeit, minuten: number): SimZeit {
  const total = z.stunde * 60 + z.minute + minuten;
  const wrap = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return { stunde: Math.floor(wrap / 60), minute: wrap % 60 };
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Zufalls-Drift der Vital-Werte. Schmerz steigt langsam, sinkt nach
 * Schmerzmittel-Events.
 */
export function driftVital(v: SimVital): SimVital {
  return {
    schmerzNrs: clamp(Math.round((v.schmerzNrs + rand(-0.4, 0.5)) * 10) / 10, 0, 10),
    stimmung: clamp(Math.round((v.stimmung + rand(-0.3, 0.3)) * 10) / 10, 0, 10),
    schlafQualitaet: v.schlafQualitaet, // ändert sich nur in Nacht
    wachheit: clamp(Math.round((v.wachheit + rand(-0.4, 0.4)) * 10) / 10, 0, 10),
  };
}

/**
 * Vorgefertigte Skript-Events. Der Sim-Engine zieht aus diesem Pool
 * jede 2-3 Ticks eines, dazwischen entscheidet sie sich für KI-Events.
 */
export const SKRIPT_EVENTS: Omit<SimEvent, "id" | "zeit" | "tick">[] = [
  {
    typ: "schicht-uebergabe",
    personaId: "person-dr",
    text: "Schichtbeginn 14:00 · Helga hat die Nacht unruhig geschlafen, NRS heute morgen 4. Ziel der Schicht: Wundpflege Steißbein + Therapie 14:00 + Kontakt Petra.",
    klientId: "klient-hr",
    source: "skript",
    tags: ["übergabe"],
  },
  {
    typ: "termin-start",
    personaId: "person-therapeut-001",
    text: "14:30 Therapie-Einheit beginnt. Mobilisations-Programm 30 min.",
    klientId: "klient-hr",
    source: "skript",
    tags: ["therapie"],
  },
  {
    typ: "termin-ende",
    personaId: "person-therapeut-001",
    text: "15:00 Therapie beendet. Tinetti-Score heute 7/10 — kleiner Fortschritt.",
    klientId: "klient-hr",
    source: "skript",
    tags: ["therapie"],
  },
  {
    typ: "lieferung",
    personaId: "person-lm-001",
    text: "11:30 SoLaWi-Lieferung 23 Mittagessen verteilt. Diabetes-Variante für Bertha + Schluckkost für Walter dabei.",
    source: "skript",
    tags: ["lieferung"],
  },
  {
    typ: "reparatur",
    personaId: "person-hm-001",
    text: "Eckventil Zimmer 314 getauscht. Boden kurz feucht — Hinweisschild gesetzt. Pflege bitte sturzgefährdete Bewohnerin nicht alleine ins Bad lassen.",
    source: "skript",
    tags: ["reparatur", "sturz"],
  },
  {
    typ: "system",
    personaId: "person-pdl-001",
    text: "Dienstplan-Push: Christina krank gemeldet. Nachtdienst wird auf Tarek + Vera umgestellt.",
    source: "skript",
    tags: ["dienstplan"],
  },
];
