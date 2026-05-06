// Pflege-Tageshub Daten-Layer · aggregiert die Schicht in eine fokussierte
// "Was steht heute an"-Sicht. Aufbau:
//   - Übergabe-Highlights (aus letzter Schicht)
//   - Tour-Reihenfolge (KI-optimiert nach Eile + Lokation)
//   - Vital-Reminder (wer braucht heute Vital-Check)
//   - Maßnahmen offen
//   - Selbstpflege-Score
//
// Phase 2: ersetzt durch FHIR Encounter + Observation + Task Resourcen
// + echter Tour-Optimierer mit Geo-Distanz.

import { CASELOADS } from "@/lib/zuordnung/store";
import { generateBerufsplan } from "@/lib/berufsplan/generator";
import { listSisFuerKlient } from "./sis-store";

export type UebergabeHighlight = {
  klientId: string;
  klientName: string;
  vonPflegekraft: string;
  highlight: string;
  prioritaet: "hoch" | "mittel" | "niedrig";
  zeit: string; // HH:MM
  art: "schmerz" | "wunde" | "stimmung" | "medikation" | "kontakt" | "sturz";
};

export type TourPunkt = {
  reihenfolge: number;
  klientId: string;
  klientName: string;
  pflegegrad?: number;
  aufgabe: string;
  geschaetzteDauer_min: number;
  prioritaet: "akut" | "geplant" | "fakultativ";
  zeitFenster?: string;
  begruendung?: string; // KI-Begründung warum diese Reihenfolge
};

export type VitalReminder = {
  klientId: string;
  klientName: string;
  letzteMessung?: string;
  faelligIn_min: number;
  art: "RR" | "Puls" | "SpO2" | "Temp" | "BZ" | "NRS";
};

export type SelbstpflegeScore = {
  energie: number; // 0-100
  stress: number; // 0-100
  schlaf_h: number;
  pausen_genommen: number;
  pausen_geplant: number;
  schichten_diese_woche: number;
  hinweis: string;
};

const KLIENT_NAMES: Record<string, string> = {
  "klient-hr": "Helga Reinhardt",
  "klient-wb": "Wilhelm Brand",
  "klient-eg": "Erika Gärtner",
  "klient-ot": "Otto Tannenberger",
  "klient-gh": "Gertrud Hopfauf",
  "klient-bs": "Bertha Schäffer",
  "klient-pn": "Peter Niedermeier",
  "klient-as-77": "Alma Schober",
};

const KLIENT_PG: Record<string, number> = {
  "klient-hr": 3,
  "klient-wb": 4,
  "klient-eg": 5,
  "klient-ot": 4,
  "klient-gh": 5,
  "klient-bs": 3,
  "klient-pn": 3,
  "klient-as-77": 4,
};

function strHash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

const HIGHLIGHT_VARIANTS: Omit<UebergabeHighlight, "klientId" | "klientName" | "vonPflegekraft" | "zeit">[] = [
  { highlight: "Schmerz NRS 4 letzte Nacht — Reservemedikation gegeben, Wirkung gut", prioritaet: "hoch", art: "schmerz" },
  { highlight: "Wundverband Sakral · trocken · nächster Wechsel heute 14:00", prioritaet: "mittel", art: "wunde" },
  { highlight: "Familienbesuch heute Nachmittag erwartet — vorher mobilisieren", prioritaet: "mittel", art: "kontakt" },
  { highlight: "Unruhig in der Nacht · Konsiliarisch psychiatrisch angemeldet", prioritaet: "hoch", art: "stimmung" },
  { highlight: "Neue Medikation seit gestern · auf Übelkeit/Schwindel achten", prioritaet: "hoch", art: "medikation" },
  { highlight: "Heute morgen kurzer Schwindel beim Aufstehen — Sturzprophylaxe", prioritaet: "hoch", art: "sturz" },
  { highlight: "Stimmung ausgeglichen · hat von der Tochter erzählt", prioritaet: "niedrig", art: "stimmung" },
];

const TOUR_AUFGABEN = [
  "Morgen-Pflege + Frühstück anreichen",
  "Wundverband-Wechsel + Doku",
  "Vital-Check + Medikation",
  "Mobilisation + Toiletten-Gang",
  "Mittag-Pflege + Lagerung",
  "Insulin-Spritze + BZ-Messung",
  "Anziehen + Therapie-Vorbereitung",
];

export function buildUebergabe(personId: string, klientIds: string[]): UebergabeHighlight[] {
  const heute = new Date();
  const baseHash = strHash(personId + heute.toDateString());
  return klientIds.slice(0, 6).map((kid, i) => {
    const variant = HIGHLIGHT_VARIANTS[(baseHash + i) % HIGHLIGHT_VARIANTS.length];
    const stunde = 19 + ((baseHash + i) % 5);
    return {
      klientId: kid,
      klientName: KLIENT_NAMES[kid] ?? kid,
      vonPflegekraft: i % 2 === 0 ? "Aylin Sözen (Spätdienst)" : "Felix Kaminski (Nachtdienst)",
      zeit: `${String(stunde).padStart(2, "0")}:${String(((baseHash + i) % 60)).padStart(2, "0")}`,
      ...variant,
    };
  });
}

export function buildTour(personId: string, klientIds: string[]): TourPunkt[] {
  const baseHash = strHash(personId + "tour");
  // KI-Heuristik: höhere PG zuerst, Akut-Fälle ganz oben, dann nach PG-Stufe
  const sortedByPg = [...klientIds].sort((a, b) => (KLIENT_PG[b] ?? 0) - (KLIENT_PG[a] ?? 0));
  const tour: TourPunkt[] = [];
  let zeit = 6 * 60 + 30; // 06:30
  for (let i = 0; i < sortedByPg.length; i++) {
    const kid = sortedByPg[i];
    const aufgabe = TOUR_AUFGABEN[(baseHash + i) % TOUR_AUFGABEN.length];
    const istAkut = (baseHash + i) % 7 === 0;
    const dauer = istAkut ? 35 : 20 + ((baseHash + i) % 15);
    const startStunde = `${String(Math.floor(zeit / 60)).padStart(2, "0")}:${String(zeit % 60).padStart(2, "0")}`;
    const endZeit = zeit + dauer;
    const endStunde = `${String(Math.floor(endZeit / 60)).padStart(2, "0")}:${String(endZeit % 60).padStart(2, "0")}`;
    tour.push({
      reihenfolge: i + 1,
      klientId: kid,
      klientName: KLIENT_NAMES[kid] ?? kid,
      pflegegrad: KLIENT_PG[kid],
      aufgabe,
      geschaetzteDauer_min: dauer,
      prioritaet: istAkut ? "akut" : i < 3 ? "geplant" : "fakultativ",
      zeitFenster: `${startStunde}–${endStunde}`,
      begruendung: i === 0
        ? `Höchster Pflegegrad (PG ${KLIENT_PG[kid] ?? "?"}) → zuerst, frische Energie wichtig`
        : istAkut
          ? "Akute Maßnahme · zuerst stabilisieren"
          : `PG ${KLIENT_PG[kid] ?? "?"} · standardisierter Slot`,
    });
    zeit = endZeit + 5;
  }
  return tour;
}

export function buildVitalReminder(klientIds: string[]): VitalReminder[] {
  const arten: VitalReminder["art"][] = ["RR", "Puls", "SpO2", "Temp", "BZ", "NRS"];
  const heute = new Date();
  return klientIds.slice(0, 5).map((kid, i) => {
    const h = strHash(kid + "vital");
    const letzteMessung = new Date(heute.getTime() - (h % 14) * 3600 * 1000).toISOString();
    return {
      klientId: kid,
      klientName: KLIENT_NAMES[kid] ?? kid,
      letzteMessung,
      faelligIn_min: ((h % 6) - 1) * 30, // negative = überfällig
      art: arten[h % arten.length],
    };
  });
}

export function buildSelbstpflege(personId: string): SelbstpflegeScore {
  const h = strHash(personId + "selbst" + new Date().toDateString());
  const energie = 50 + (h % 40);
  const stress = 25 + ((h >> 4) % 50);
  return {
    energie,
    stress,
    schlaf_h: 6.5 + ((h >> 8) % 30) / 10,
    pausen_genommen: (h >> 10) % 3,
    pausen_geplant: 3,
    schichten_diese_woche: 4 + ((h >> 12) % 2),
    hinweis: stress > 60
      ? "Hoher Stress-Level — gönn dir die nächste Pause + 5 min Atem-Übung."
      : energie < 50
        ? "Energie etwas niedrig — Wasser, Snack, kurzer Schritt nach draußen."
        : "Du bist heute im grünen Bereich. Die nächste Pause steht in ca. 90 min an.",
  };
}

export function offeneMassnahmenZahl(klientIds: string[]): number {
  let n = 0;
  for (const kid of klientIds) {
    const eintraege = listSisFuerKlient(kid, 5);
    for (const e of eintraege) {
      n += e.massnahmen.length;
    }
  }
  return n;
}

export function caseloadFuerPflegekraft(personId: string): string[] {
  const cl = CASELOADS.find((c) => c.personId === personId && c.beruf === "pflege");
  return cl?.klientIds ?? [];
}

export type Tagesblock = {
  datumISO: string;
  startZeit: string;
  endZeit: string;
  schichtArt: "Frühdienst" | "Spätdienst" | "Nachtdienst";
  schichtFarbe: string;
  klientCount: number;
};

export function aktuelleSchicht(personId: string): Tagesblock {
  const heute = new Date();
  const stunde = heute.getHours();
  let art: Tagesblock["schichtArt"] = "Frühdienst";
  let startZeit = "06:00";
  let endZeit = "14:00";
  let farbe = "var(--mon)";
  if (stunde >= 14 && stunde < 22) {
    art = "Spätdienst";
    startZeit = "14:00";
    endZeit = "22:00";
    farbe = "var(--wed)";
  } else if (stunde >= 22 || stunde < 6) {
    art = "Nachtdienst";
    startZeit = "22:00";
    endZeit = "06:00";
    farbe = "var(--sat)";
  }
  const klients = caseloadFuerPflegekraft(personId);
  return {
    datumISO: heute.toISOString().slice(0, 10),
    startZeit,
    endZeit,
    schichtArt: art,
    schichtFarbe: farbe,
    klientCount: klients.length,
  };
}

export function naechsteTermineCrossProfession(klientIds: string[]): {
  klientName: string;
  zeit: string;
  beruf: string;
  aktivitaet: string;
}[] {
  const items: { klientName: string; zeit: string; beruf: string; aktivitaet: string }[] = [];
  const heute = new Date();
  const heuteISO = heute.toISOString().slice(0, 10);
  const jetztMin = heute.getHours() * 60 + heute.getMinutes();
  for (const kid of klientIds) {
    const klName = KLIENT_NAMES[kid] ?? kid;
    // Termine aller Berufe heute für diesen Klienten
    for (const beruf of ["arzt", "therapie", "sozialarbeit", "ehrenamt"] as const) {
      const cl = CASELOADS.find((c) => c.beruf === beruf && c.klientIds.includes(kid));
      if (!cl) continue;
      const items_b = generateBerufsplan(cl.personId, beruf, 1).filter((i) => i.datumISO === heuteISO);
      for (const it of items_b.filter((i) => i.klientId === kid)) {
        const [h, m] = it.startZeit.split(":").map(Number);
        if (h * 60 + m > jetztMin) {
          items.push({ klientName: klName, zeit: it.startZeit, beruf, aktivitaet: it.aktivitaet });
        }
      }
    }
  }
  return items.sort((a, b) => a.zeit.localeCompare(b.zeit)).slice(0, 8);
}
