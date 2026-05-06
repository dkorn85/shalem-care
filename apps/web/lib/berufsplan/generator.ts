// Berufsplan-Generator · per-Profession 14-Tage-Demo-Termine.
//
// Idee: Statt für jeden Beruf eine eigene Termin-Datenstruktur zu pflegen,
// derivieren wir Termine deterministisch aus dem Caseload + einer Tages-
// Frequenz pro Beruf. Jede Person bekommt einen stabilen Offset aus dem
// Personen-ID-Hash, sodass Demo-Ansicht reproduzierbar ist und sich nicht
// mit jedem Refresh ändert.
//
// Phase 2: ersetzt durch FHIR Appointment-Resourcen pro Beruf, dann gefiltert
// per CareTeam.participant-Mitgliedschaft.

import { CASELOADS, type Caseload, caseLoadsForKlient } from "@/lib/zuordnung/store";

export type BerufsplanItem = {
  id: string;
  datumISO: string;          // YYYY-MM-DD
  startZeit: string;         // HH:MM
  endZeit: string;           // HH:MM
  klientId: string | null;   // null wenn nicht-klient-bezogen (z.B. Hauswirtschaft Speiseplan)
  klientName?: string;
  ort?: string;
  aktivitaet: string;        // "Hausbesuch", "MLD", "Hilfeplan-Gespräch", ...
  status: "geplant" | "läuft" | "erledigt" | "verschoben";
  beruf: Caseload["beruf"];
  farbe: string;             // var(--xxx) oder rgb(...)
  dauer_min: number;
  notiz?: string;
};

const KLIENT_NAMES: Record<string, string> = {
  "klient-hr": "Helga Reinhardt",
  "klient-wb": "Wilhelm Brand",
  "klient-eg": "Erika Gärtner",
  "klient-rk": "Rüdiger Kempf",
  "klient-im": "Inge Müller",
  "klient-fl": "Friedrich Lenz",
  "klient-mc": "Michael Cordes",
  "klient-ko": "Konrad Ostermann",
  "klient-jw": "Jürgen Wahl",
  "klient-bs": "Bertha Schulze",
  "klient-ot": "Otto Tannert",
  "klient-gh": "Gertrud Heß",
  "klient-pn": "Peter Nowak",
  "klient-as-77": "Alma Schreiber",
  "klient-vh": "Volker Heinrich",
  "klient-mb-66": "Margot Berner",
  "klient-hk": "Hannelore Kraus",
  "klient-rs-58": "Rolf Sander",
  "klient-ed-83": "Edith Dietz",
  "klient-jh-77": "Josef Hartl",
};

function klientName(id: string | null): string | undefined {
  if (!id) return undefined;
  return KLIENT_NAMES[id] ?? id;
}

// ─── Beruf-Konfiguration ──────────────────────────────────────────

type BerufConfig = {
  farbe: string;
  /** Wochentage (0=So…6=Sa), an denen pro Klient Termine stattfinden */
  wochentage: number[];
  /** Mehrere Termine an einem Tag (z.B. zweimal Praxis) — sonst 1 */
  proKlientProTag: number;
  /** Aktivitäts-Pool — wird pro Termin durchrotiert */
  aktivitaeten: string[];
  /** Termin-Dauer in Minuten */
  dauer_min: number;
  /** Arbeits-Beginn-Stunde */
  startStunde: number;
  /** Slot-Abstand in Minuten zwischen Klient-Terminen */
  slotMin: number;
  /** Standard-Ort */
  ort?: string;
};

const BERUF_CONFIG: Partial<Record<Caseload["beruf"], BerufConfig>> = {
  arzt: {
    farbe: "var(--vibe-profile)",
    wochentage: [1, 4],   // Mo + Do Hausbesuche
    proKlientProTag: 1,
    aktivitaeten: [
      "Hausbesuch · Visite",
      "Medikations-Plan",
      "Wundkontrolle",
      "AU-Verlängerung",
      "Verordnung HKP",
      "Lab-Befund",
    ],
    dauer_min: 25,
    startStunde: 9,
    slotMin: 30,
    ort: "Hausbesuch",
  },
  therapie: {
    farbe: "var(--fri)",
    wochentage: [1, 3, 5],   // Mo, Mi, Fr
    proKlientProTag: 1,
    aktivitaeten: [
      "MLD + Kompression",
      "Manuelle Therapie",
      "KGG · Gerätegestützt",
      "Bobath-Therapie",
      "Mobilisation",
      "ADL-Training",
    ],
    dauer_min: 45,
    startStunde: 8,
    slotMin: 60,
    ort: "Praxis · Hausbesuch",
  },
  sozialarbeit: {
    farbe: "var(--tue)",
    wochentage: [2, 4],   // Di + Do
    proKlientProTag: 1,
    aktivitaeten: [
      "Hilfeplan-Gespräch",
      "MD-Begutachtung Vorbereitung",
      "BTHG-Antrag · Beratung",
      "Schutzauftrag-Check",
      "Angehörigen-Gespräch",
      "Pflegekassen-Klärung",
    ],
    dauer_min: 60,
    startStunde: 10,
    slotMin: 90,
    ort: "Hausbesuch · Beratung",
  },
  ehrenamt: {
    farbe: "var(--thu)",
    wochentage: [2, 6],   // Di + Sa
    proKlientProTag: 1,
    aktivitaeten: [
      "Vorlesen · Begleitung",
      "Spaziergang · Garten",
      "Gespräch · Da sein",
      "Spiele · Erinnerung",
      "Mahlzeit-Begleitung",
      "Hospiz · Sitzwache",
    ],
    dauer_min: 90,
    startStunde: 14,
    slotMin: 120,
    ort: "Hausbesuch · Hospiz",
  },
  heilerziehung: {
    farbe: "var(--sat)",
    wochentage: [1, 2, 3, 4, 5],  // werktäglich
    proKlientProTag: 1,
    aktivitaeten: [
      "Teilhabe-Begleitung",
      "Bildungs-Modul",
      "Tagesstruktur",
      "Inklusion · Gruppe",
      "Förderung · 1:1",
    ],
    dauer_min: 60,
    startStunde: 9,
    slotMin: 75,
    ort: "Tagesstätte",
  },
  hauswirtschaft: {
    farbe: "var(--sun)",
    wochentage: [1, 2, 3, 4, 5, 6, 0],  // täglich
    proKlientProTag: 2,   // Frühstück + Abendessen-Vorbereitung
    aktivitaeten: [
      "Speisen-Verteilung",
      "Mahlzeit-Anrichten",
      "Reinigung · Kabine",
      "Wäsche-Versorgung",
      "Einkauf",
    ],
    dauer_min: 30,
    startStunde: 7,
    slotMin: 40,
    ort: "Station / Wohnbereich",
  },
};

// ─── Hash für deterministische Offsets ────────────────────────────

function strHash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// ─── Generator ────────────────────────────────────────────────────

/**
 * Generiert N Tage Berufsplan für eine Person. Items sind sortiert nach
 * datum + startZeit. Terminierung deterministisch aus Person-ID-Hash.
 */
export function generateBerufsplan(
  personId: string,
  beruf: Caseload["beruf"],
  tage = 14,
  startDatum?: Date,
): BerufsplanItem[] {
  const config = BERUF_CONFIG[beruf];
  if (!config) return [];

  const caseload = CASELOADS.find((c) => c.personId === personId && c.beruf === beruf);
  if (!caseload) return [];

  const klienten = caseload.klientIds;
  if (klienten.length === 0) return [];

  const heute = startDatum ? new Date(startDatum) : new Date();
  heute.setHours(0, 0, 0, 0);

  const personHash = strHash(personId);
  const items: BerufsplanItem[] = [];

  for (let tagIdx = 0; tagIdx < tage; tagIdx++) {
    const tag = new Date(heute);
    tag.setDate(tag.getDate() + tagIdx);
    if (!config.wochentage.includes(tag.getDay())) continue;

    const datumISO = `${tag.getFullYear()}-${String(tag.getMonth() + 1).padStart(2, "0")}-${String(tag.getDate()).padStart(2, "0")}`;

    let slotIdx = 0;
    for (let kIdx = 0; kIdx < klienten.length; kIdx++) {
      const klientId = klienten[(kIdx + (personHash % klienten.length) + tagIdx) % klienten.length];

      for (let p = 0; p < config.proKlientProTag; p++) {
        const startMin = config.startStunde * 60 + slotIdx * config.slotMin;
        if (startMin >= 18 * 60) break; // nicht über 18:00 hinaus
        const endMin = startMin + config.dauer_min;
        const startZeit = `${String(Math.floor(startMin / 60)).padStart(2, "0")}:${String(startMin % 60).padStart(2, "0")}`;
        const endZeit = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;

        const aktivitaet = config.aktivitaeten[(kIdx + tagIdx + p) % config.aktivitaeten.length];

        // Status-Logik: vergangene Tage = erledigt; heute mit Slot in Vergangenheit = läuft/erledigt
        const jetzt = new Date();
        let status: BerufsplanItem["status"] = "geplant";
        if (tag < new Date(jetzt.toDateString())) {
          status = "erledigt";
        } else if (tagIdx === 0) {
          const jetztMin = jetzt.getHours() * 60 + jetzt.getMinutes();
          if (jetztMin > endMin) status = "erledigt";
          else if (jetztMin >= startMin) status = "läuft";
        }

        items.push({
          id: `bp-${personId}-${datumISO}-${slotIdx}-${p}`,
          datumISO,
          startZeit,
          endZeit,
          klientId,
          klientName: klientName(klientId),
          ort: config.ort,
          aktivitaet,
          status,
          beruf,
          farbe: config.farbe,
          dauer_min: config.dauer_min,
        });
        slotIdx++;
      }
    }
  }

  return items.sort((a, b) =>
    a.datumISO === b.datumISO
      ? a.startZeit.localeCompare(b.startZeit)
      : a.datumISO.localeCompare(b.datumISO),
  );
}

/**
 * Klient-Sicht: Aggregiert Termine ALLER Berufe für eine:n Klient:in über N Tage.
 * Zeigt "wer kommt heute / morgen / diese Woche zu mir".
 */
export function generateKlientPlan(klientId: string, tage = 14): BerufsplanItem[] {
  const caseloads = caseLoadsForKlient(klientId);
  const items: BerufsplanItem[] = [];
  for (const cl of caseloads) {
    const planItems = generateBerufsplan(cl.personId, cl.beruf, tage);
    items.push(...planItems.filter((i) => i.klientId === klientId));
  }
  return items.sort((a, b) =>
    a.datumISO === b.datumISO
      ? a.startZeit.localeCompare(b.startZeit)
      : a.datumISO.localeCompare(b.datumISO),
  );
}

/**
 * Stations-Sicht: Aggregiert Termine ALLER Berufe für ALLE Klient:innen einer
 * Station über N Tage. Quasi: was passiert heute überall an dem Ort.
 */
export function generateStationPlan(klientIds: string[], tage = 14): BerufsplanItem[] {
  const items: BerufsplanItem[] = [];
  const seen = new Set<string>();
  for (const klientId of klientIds) {
    for (const item of generateKlientPlan(klientId, tage)) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }
  }
  return items.sort((a, b) =>
    a.datumISO === b.datumISO
      ? a.startZeit.localeCompare(b.startZeit)
      : a.datumISO.localeCompare(b.datumISO),
  );
}

/** Gruppiert Items nach datumISO. Behält Sortier-Reihenfolge. */
export function groupByDay(items: BerufsplanItem[]): { datumISO: string; items: BerufsplanItem[] }[] {
  const map = new Map<string, BerufsplanItem[]>();
  for (const i of items) {
    const arr = map.get(i.datumISO) ?? [];
    arr.push(i);
    map.set(i.datumISO, arr);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([datumISO, items]) => ({ datumISO, items }));
}

export const BERUF_LABEL: Record<Caseload["beruf"], string> = {
  pflege: "Pflege",
  arzt: "Arzt:Ärztin",
  therapie: "Therapie",
  sozialarbeit: "Sozialarbeit",
  lead: "Stationsleitung",
  ehrenamt: "Ehrenamt",
  heilerziehung: "Heilerziehung",
  hauswirtschaft: "Hauswirtschaft",
};

export const STATUS_FARBE: Record<BerufsplanItem["status"], string> = {
  geplant: "var(--vibe-team)",
  "läuft": "var(--mon)",
  erledigt: "var(--vibe-approval)",
  verschoben: "var(--vibe-stats)",
};
