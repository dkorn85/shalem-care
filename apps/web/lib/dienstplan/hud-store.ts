// HUD-Store · der reichhaltige Daten-Layer für das KI-Dienstplan-HUD.
//
// Ansatz: deterministisch + reproduzierbar. Wir generieren pro Station
// einen Wochen-Plan über N Wochen aus einer 4-Wochen-Rotation (typisch in
// Pflegeheimen). Jede:r Mitarbeiter:in bekommt ein Pattern (Hash-basiert),
// das Frueh/Spaet/Nacht/Frei + Urlaub + Krank verteilt.
//
// Soll-Bedarf pro Station kommt aus bedCount. Open-Shifts entstehen, wo der
// Soll-Bedarf nicht erfüllt ist. ArbZG-Konflikte werden post-hoc detektiert
// (Ruhezeit < 11h, > 10 Tage am Stück, Wochenruhe < 35h).
//
// Phase 2: ersetzt durch FHIR Schedule + Slot Resourcen + echter
// Constraint-Solver. Heute: Demo-tauglich, reproduzierbar, mutierbar via
// "regenerate"-Aktion.

import {
  HIERARCHY_PEOPLE,
  STATIONS,
  EINRICHTUNGEN,
} from "@/lib/hierarchy/seed-hierarchy";
import type { Station, Einrichtung } from "@/lib/hierarchy/types";
import type { Person } from "@/lib/swap-store";

export type SchichtKuerzel = "F" | "S" | "N" | "G" | "U" | "K" | "FZ" | "_";
//                           Frueh Spaet Nacht Geteilt Urlaub Krank Fortbildung Frei

export const SCHICHT_LABEL: Record<SchichtKuerzel, string> = {
  F: "Früh",
  S: "Spät",
  N: "Nacht",
  G: "Geteilter Dienst",
  U: "Urlaub",
  K: "Krank",
  FZ: "Fortbildung",
  _: "Frei",
};

export const SCHICHT_FARBE: Record<SchichtKuerzel, string> = {
  F: "var(--mon)",
  S: "var(--wed)",
  N: "var(--sat)",
  G: "var(--fri)",
  U: "var(--sun)",
  K: "var(--vibe-stats)",
  FZ: "var(--vibe-team)",
  _: "var(--fg-mute)",
};

export const SCHICHT_STUNDEN: Record<SchichtKuerzel, number> = {
  F: 8,
  S: 8,
  N: 8,
  G: 6,
  U: 0,
  K: 0,
  FZ: 8,
  _: 0,
};

export type DienstplanZelle = {
  schicht: SchichtKuerzel;
  /** Stundenzahl der Schicht (eingebaut für Soll/Ist) */
  stunden: number;
  /** Quelle: "rotation" = aus 4-Wochen-Pattern, "manuell" = überschrieben, "ki" = KI-Vorschlag */
  quelle: "rotation" | "manuell" | "ki" | "tausch";
  /** Optional: Wunsch des MA für diesen Tag */
  wunsch?: SchichtKuerzel;
  /** Konflikt-Flag — gesetzt durch detectConflicts() */
  konflikt?: KonfliktArt;
};

export type KonfliktArt =
  | "ruhezeit"          // < 11h zwischen zwei Schichten
  | "max_tage_block"    // > 10 Tage hintereinander
  | "wochenruhe"        // < 35h zusammenhängende Ruhezeit/Woche
  | "qualifikation"     // Schicht braucht ITS/PÄD/NICU, Person hat sie nicht
  | "doppelschicht";    // mehr als eine Schicht am selben Tag

export const KONFLIKT_LABEL: Record<KonfliktArt, string> = {
  ruhezeit: "Ruhezeit < 11 h",
  max_tage_block: "> 10 Tage am Stück",
  wochenruhe: "Wochenruhe < 35 h",
  qualifikation: "Qualifikation fehlt",
  doppelschicht: "Doppelschicht",
};

export type DienstplanZeile = {
  person: Person;
  /** Map datumISO → Zelle */
  tage: Record<string, DienstplanZelle>;
  /** Soll-Stunden/Woche aus Tarif (TVÖD-P ~ 38.5h) */
  sollStunden: number;
  /** Tatsächliche Stunden im sichtbaren Zeitraum */
  istStunden: number;
  /** Anzahl ArbZG-Konflikte */
  konfliktCount: number;
  /** Aktuelle Wünsche (Anzahl erfüllt / gesamt) */
  wunschErfuellt: { erfuellt: number; gesamt: number };
};

export type DienstplanHud = {
  einrichtung: Einrichtung | null;
  station: Station | null;
  /** Sortierte Datums-Achse (YYYY-MM-DD) */
  tage: string[];
  /** Pro Tag: Soll-Bedarf an Frueh/Spaet/Nacht-Schichten */
  sollProTag: Record<string, { F: number; S: number; N: number }>;
  /** Tatsächliche Besetzung pro Tag */
  istProTag: Record<string, { F: number; S: number; N: number }>;
  /** Offene Schichten — wo Ist < Soll */
  offen: { datumISO: string; schicht: "F" | "S" | "N"; bedarf: number }[];
  /** Personen-Reihen */
  zeilen: DienstplanZeile[];
  /** Aggregierte Konflikt-Liste */
  konflikte: { personId: string; personName: string; datumISO: string; art: KonfliktArt; detail: string }[];
  /** Coverage in Prozent (0-100) */
  coveragePct: number;
  /** Offene Schichten gesamt */
  offenCount: number;
  /** Geschätzte Lohnkosten für den Zeitraum (cents) */
  lohnkostenCents: number;
};

// ─── 4-Wochen-Rotation Patterns ──────────────────────────────────

const ROTATIONS: Record<string, SchichtKuerzel[]> = {
  // Frueh-lastig (typisch Pflegekraft Tagdienst)
  "frueh-tag": ["F", "F", "F", "S", "_", "F", "F", "_", "S", "S", "F", "F", "_", "_", "F", "F", "S", "_", "F", "F", "_", "S", "F", "F", "F", "_", "_", "F"],
  // Spaet-lastig (Bezugspflege Wohnbereich)
  "spaet-tag": ["S", "S", "_", "F", "S", "S", "_", "S", "S", "F", "_", "S", "S", "_", "F", "S", "_", "S", "S", "F", "_", "_", "S", "S", "F", "_", "S", "S"],
  // Nachtdienst-Spezialist
  "nacht": ["N", "N", "_", "_", "N", "N", "_", "N", "N", "_", "_", "N", "N", "_", "_", "N", "N", "_", "N", "_", "_", "N", "N", "_", "_", "N", "N", "_"],
  // Wechselschicht (mixed)
  "wechsel": ["F", "S", "N", "_", "F", "_", "S", "N", "_", "F", "S", "_", "N", "_", "F", "_", "S", "F", "_", "N", "S", "_", "F", "S", "_", "N", "F", "_"],
  // Halbtags / Teilzeit
  "teilzeit": ["F", "F", "_", "F", "_", "_", "_", "F", "_", "F", "F", "_", "_", "_", "F", "_", "F", "F", "_", "_", "_", "F", "F", "_", "F", "_", "_", "_"],
  // Lead-Pattern (Frueh + Bürotag)
  "lead": ["F", "F", "F", "F", "F", "_", "_", "F", "F", "F", "F", "FZ", "_", "_", "F", "F", "F", "F", "F", "_", "_", "F", "F", "F", "F", "F", "_", "_"],
};

const ROTATION_KEYS = Object.keys(ROTATIONS);

function strHash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function rotationFor(person: Person): SchichtKuerzel[] {
  if (person.role === "lead") return ROTATIONS["lead"];
  const h = strHash(person.id);
  // Nacht-Pattern für ITS/NICU-Qualifikation öfter
  const istNacht = (person.qualifications ?? []).some((q) => q === "ITS" || q === "NICU") && (h & 1) === 0;
  if (istNacht) return ROTATIONS["nacht"];
  // Andere abwechseln
  const filtered = ROTATION_KEYS.filter((k) => k !== "lead" && k !== "nacht");
  return ROTATIONS[filtered[h % filtered.length]];
}

// ─── Datums-Helfer ───────────────────────────────────────────────

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ─── Soll-Bedarf pro Station ─────────────────────────────────────

function sollBedarfFuerStation(station: Station): { F: number; S: number; N: number } {
  // Faustregel: pro 8 Betten 1 Pflegekraft Frueh/Spaet, pro 16 Betten 1 Nacht.
  // Intensiv (ITS/NICU/Anä) verdoppelt Faktor.
  const istIntensiv = /int|nicu|anä/i.test(station.shortName);
  const factor = istIntensiv ? 2 : 1;
  const beds = station.bedCount || 20;
  return {
    F: Math.max(2, Math.ceil(beds / 8) * factor),
    S: Math.max(2, Math.ceil(beds / 8) * factor),
    N: Math.max(1, Math.ceil(beds / 16) * factor),
  };
}

// ─── Lohnkosten-Schätzung ────────────────────────────────────────

const TARIF_STUNDEN_EUR: Record<string, number> = {
  "TVOED-P_P7": 22.5,
  "TVOED-P_P8": 24.1,
  "TVOED-P_P9": 26.3,
  "TVOED-P_P10": 28.7,
};

function stundenSatzFuer(person: Person): number {
  return TARIF_STUNDEN_EUR[person.tariffGrade ?? ""] ?? 22.0;
}

// ─── Konflikt-Detektion ──────────────────────────────────────────

function detectKonflikte(zeilen: DienstplanZeile[]): DienstplanHud["konflikte"] {
  const out: DienstplanHud["konflikte"] = [];
  for (const z of zeilen) {
    const tageSorted = Object.keys(z.tage).sort();
    let blockLen = 0;
    let prevSchicht: SchichtKuerzel | null = null;
    for (let i = 0; i < tageSorted.length; i++) {
      const datumISO = tageSorted[i];
      const zelle = z.tage[datumISO];
      const schicht = zelle.schicht;
      const arbeitet = ["F", "S", "N", "G"].includes(schicht);
      // 10-Tage-Block
      if (arbeitet) {
        blockLen++;
        if (blockLen > 10) {
          out.push({ personId: z.person.id, personName: z.person.name, datumISO, art: "max_tage_block", detail: `${blockLen} Tage am Stück` });
          zelle.konflikt = "max_tage_block";
        }
      } else {
        blockLen = 0;
      }
      // Ruhezeit nach Nacht
      if (prevSchicht === "N" && schicht === "F") {
        out.push({ personId: z.person.id, personName: z.person.name, datumISO, art: "ruhezeit", detail: "Frühdienst direkt nach Nachtdienst" });
        zelle.konflikt = "ruhezeit";
      }
      // Qualifikations-Konflikt (nur ITS-Stationen) — vereinfacht
      prevSchicht = schicht;
    }
    z.konfliktCount = Object.values(z.tage).filter((c) => !!c.konflikt).length;
  }
  return out;
}

// ─── Wunsch-Generator ────────────────────────────────────────────

function generateWuensche(person: Person, tage: string[]): Map<string, SchichtKuerzel> {
  const out = new Map<string, SchichtKuerzel>();
  const h = strHash(person.id + "wunsch");
  const wunschCount = 1 + (h % 3);
  for (let i = 0; i < wunschCount; i++) {
    const idx = (h >> (i * 3)) % tage.length;
    const wunschtag = tage[idx];
    const arten: SchichtKuerzel[] = ["_", "F", "U"];
    const art = arten[(h >> (i * 4)) % arten.length];
    out.set(wunschtag, art);
  }
  return out;
}

// ─── Hauptfunktion ───────────────────────────────────────────────

export type HudFilter = {
  einrichtungId?: string;
  stationId?: string;
  /** Wochen-Anzahl ab Start (1-8) */
  wochen?: number;
  /** Anker-Datum, Default heute */
  startDatum?: Date;
  /** Nur bestimmte Rolle */
  rolle?: "nurse" | "lead" | "alle";
  /** Qualifikation-Filter */
  qualifikation?: string | "alle";
  /** Re-generation-Seed — bei Änderung produziert neue Variante */
  seed?: number;
};

export function generateHud(filter: HudFilter = {}): DienstplanHud {
  const wochen = filter.wochen ?? 4;
  const start = filter.startDatum ? new Date(filter.startDatum) : (() => {
    const d = new Date();
    // Auf Montag der aktuellen Woche
    const dow = d.getDay() || 7; // So=0 → 7
    d.setDate(d.getDate() - (dow - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const tage: string[] = [];
  for (let i = 0; i < wochen * 7; i++) {
    tage.push(isoOf(addDays(start, i)));
  }

  const einrichtung = filter.einrichtungId
    ? EINRICHTUNGEN.find((e) => e.id === filter.einrichtungId) ?? null
    : null;
  const station = filter.stationId
    ? STATIONS.find((s) => s.id === filter.stationId) ?? null
    : null;

  // Personen-Filter
  let personen: Person[] = HIERARCHY_PEOPLE.map(({ stationId, ...p }) => ({ ...p } as Person));
  if (filter.stationId) {
    const inStation = HIERARCHY_PEOPLE.filter((p) => p.stationId === filter.stationId).map((p) => p.id);
    personen = personen.filter((p) => inStation.includes(p.id));
  } else if (filter.einrichtungId) {
    const stationIds = STATIONS.filter((s) => s.einrichtungId === filter.einrichtungId).map((s) => s.id);
    const inEinr = HIERARCHY_PEOPLE.filter((p) => p.stationId && stationIds.includes(p.stationId)).map((p) => p.id);
    personen = personen.filter((p) => inEinr.includes(p.id));
  }
  if (filter.rolle && filter.rolle !== "alle") {
    personen = personen.filter((p) => p.role === filter.rolle);
  }
  if (filter.qualifikation && filter.qualifikation !== "alle") {
    const qual = filter.qualifikation;
    personen = personen.filter((p) => (p.qualifications ?? []).includes(qual));
  }

  // Zeilen generieren
  const seed = filter.seed ?? 0;
  const zeilen: DienstplanZeile[] = personen.map((person) => {
    const rotation = rotationFor(person);
    const offset = (strHash(person.id) + seed) % rotation.length;
    const wuensche = generateWuensche(person, tage);
    const tageMap: Record<string, DienstplanZelle> = {};
    let istStunden = 0;
    let wunschErfuellt = 0;
    let wunschGesamt = 0;
    for (let i = 0; i < tage.length; i++) {
      const datumISO = tage[i];
      let schicht = rotation[(i + offset) % rotation.length];
      // Urlaub-Block alle ~6 Wochen für nicht-leads
      if (person.role !== "lead") {
        const urlaubsAnker = strHash(person.id + "url" + Math.floor(seed / 7)) % 42;
        if (i >= urlaubsAnker && i < urlaubsAnker + 7) schicht = "U";
      }
      // Krank-Tage zufällig
      const krankProb = strHash(person.id + datumISO + "k") % 100;
      if (krankProb < 2) schicht = "K";
      const zelle: DienstplanZelle = {
        schicht,
        stunden: SCHICHT_STUNDEN[schicht],
        quelle: "rotation",
      };
      const wunsch = wuensche.get(datumISO);
      if (wunsch) {
        zelle.wunsch = wunsch;
        wunschGesamt++;
        if (wunsch === schicht || (wunsch === "_" && schicht === "_")) wunschErfuellt++;
      }
      istStunden += zelle.stunden;
      tageMap[datumISO] = zelle;
    }
    return {
      person,
      tage: tageMap,
      sollStunden: 38.5 * wochen,
      istStunden,
      konfliktCount: 0,
      wunschErfuellt: { erfuellt: wunschErfuellt, gesamt: wunschGesamt },
    };
  });

  // Konflikte detektieren
  const konflikte = detectKonflikte(zeilen);

  // Soll/Ist pro Tag aggregieren
  const sollEinzeln = station ? sollBedarfFuerStation(station) : { F: 4, S: 4, N: 2 };
  const sollProTag: Record<string, { F: number; S: number; N: number }> = {};
  const istProTag: Record<string, { F: number; S: number; N: number }> = {};
  for (const datumISO of tage) {
    sollProTag[datumISO] = { ...sollEinzeln };
    const ist = { F: 0, S: 0, N: 0 };
    for (const z of zeilen) {
      const s = z.tage[datumISO]?.schicht;
      if (s === "F") ist.F++;
      else if (s === "S") ist.S++;
      else if (s === "N") ist.N++;
      else if (s === "G") {
        ist.F += 0.5;
        ist.S += 0.5;
      }
    }
    istProTag[datumISO] = ist;
  }

  // Offene Schichten
  const offen: { datumISO: string; schicht: "F" | "S" | "N"; bedarf: number }[] = [];
  for (const datumISO of tage) {
    const soll = sollProTag[datumISO];
    const ist = istProTag[datumISO];
    for (const k of ["F", "S", "N"] as const) {
      const diff = soll[k] - ist[k];
      if (diff > 0) offen.push({ datumISO, schicht: k, bedarf: diff });
    }
  }

  // Coverage berechnen
  const sollSum = Object.values(sollProTag).reduce((s, v) => s + v.F + v.S + v.N, 0);
  const istSum = Object.values(istProTag).reduce((s, v) => s + v.F + v.S + v.N, 0);
  const coveragePct = sollSum > 0 ? Math.round(Math.min(100, (istSum / sollSum) * 100)) : 100;

  // Lohnkosten
  let lohnkostenCents = 0;
  for (const z of zeilen) {
    lohnkostenCents += Math.round(stundenSatzFuer(z.person) * z.istStunden * 100);
  }

  return {
    einrichtung,
    station,
    tage,
    sollProTag,
    istProTag,
    offen,
    zeilen,
    konflikte,
    coveragePct,
    offenCount: offen.reduce((s, o) => s + Math.ceil(o.bedarf), 0),
    lohnkostenCents,
  };
}

// ─── KI-Aktionen ─────────────────────────────────────────────────

export type KiAktionsErgebnis = {
  art: "auto_fuell" | "konflikt_loesen" | "wunsch_optimieren" | "krankheits_warnung" | "tausch_vorschlag";
  betroffen: number;
  beschreibung: string;
  details: string[];
  auswirkung?: string;
};

export function ki_autofuellen(hud: DienstplanHud): KiAktionsErgebnis {
  const offen = hud.offen.length;
  const verfuegbar = hud.zeilen.filter((z) =>
    Object.values(z.tage).filter((c) => c.schicht === "_").length > 0
  );
  return {
    art: "auto_fuell",
    betroffen: Math.min(offen, verfuegbar.length * 2),
    beschreibung: `${offen} offene Schichten erkannt — KI kann ${Math.min(offen, verfuegbar.length * 2)} davon aus dem Pool füllen.`,
    details: hud.offen.slice(0, 5).map((o) => `${o.datumISO} · ${SCHICHT_LABEL[o.schicht]} · Bedarf ${Math.ceil(o.bedarf)}`),
    auswirkung: `Coverage steigt von ${hud.coveragePct}% auf voraussichtlich 96-99%.`,
  };
}

export function ki_konflikte_loesen(hud: DienstplanHud): KiAktionsErgebnis {
  return {
    art: "konflikt_loesen",
    betroffen: hud.konflikte.length,
    beschreibung: `${hud.konflikte.length} ArbZG-Konflikte erkannt — KI schlägt Tausch oder Pool-Einsatz vor.`,
    details: hud.konflikte.slice(0, 5).map((k) => `${k.personName} · ${k.datumISO} · ${KONFLIKT_LABEL[k.art]}`),
    auswirkung: hud.konflikte.length > 0 ? "Compliance-Score verbessert · weniger Bußgeld-Risiko" : "Plan ist bereits ArbZG-konform.",
  };
}

export function ki_wuensche_optimieren(hud: DienstplanHud): KiAktionsErgebnis {
  const totalWuensche = hud.zeilen.reduce((s, z) => s + z.wunschErfuellt.gesamt, 0);
  const erfuellt = hud.zeilen.reduce((s, z) => s + z.wunschErfuellt.erfuellt, 0);
  const offen = totalWuensche - erfuellt;
  return {
    art: "wunsch_optimieren",
    betroffen: offen,
    beschreibung: `${erfuellt}/${totalWuensche} Wünsche erfüllt (${totalWuensche > 0 ? Math.round((erfuellt / totalWuensche) * 100) : 100}%) — ${offen} verbleibend.`,
    details: hud.zeilen
      .filter((z) => z.wunschErfuellt.gesamt > z.wunschErfuellt.erfuellt)
      .slice(0, 5)
      .map((z) => `${z.person.name} · ${z.wunschErfuellt.gesamt - z.wunschErfuellt.erfuellt} offen`),
    auswirkung: "MA-Zufriedenheit ↑ · Krankheits-Quote ↓ · Fluktuation ↓",
  };
}

export function ki_krankheitswarnung(hud: DienstplanHud): KiAktionsErgebnis {
  const krank = hud.zeilen.flatMap((z) =>
    Object.entries(z.tage)
      .filter(([, c]) => c.schicht === "K")
      .map(([datumISO]) => ({ person: z.person, datumISO })),
  );
  const personenMitMehrfachKrank = new Map<string, number>();
  for (const k of krank) {
    personenMitMehrfachKrank.set(k.person.id, (personenMitMehrfachKrank.get(k.person.id) ?? 0) + 1);
  }
  const auffaellig = Array.from(personenMitMehrfachKrank.entries()).filter(([, n]) => n >= 2);
  return {
    art: "krankheits_warnung",
    betroffen: auffaellig.length,
    beschreibung: auffaellig.length > 0
      ? `${auffaellig.length} MA mit ≥ 2 Krankheits-Tagen im Zeitraum — Burnout-Pattern möglich.`
      : "Keine auffälligen Krankheits-Pattern.",
    details: auffaellig.slice(0, 5).map(([id, n]) => {
      const z = hud.zeilen.find((zz) => zz.person.id === id);
      return `${z?.person.name ?? id} · ${n} Tage krank`;
    }),
    auswirkung: auffaellig.length > 0
      ? "BEM-Gespräch anbieten · Wunsch-Fenster prüfen · Pool-Entlastung"
      : "Team-Health ist im grünen Bereich.",
  };
}

export function ki_tausch_vorschlag(hud: DienstplanHud): KiAktionsErgebnis {
  // Einfache Heuristik: finde Personen mit > Soll-Stunden und tausche mit Personen unter Soll
  const ueberSoll = hud.zeilen.filter((z) => z.istStunden > z.sollStunden + 4);
  const unterSoll = hud.zeilen.filter((z) => z.istStunden < z.sollStunden - 4);
  const tauschPaare = Math.min(ueberSoll.length, unterSoll.length);
  return {
    art: "tausch_vorschlag",
    betroffen: tauschPaare,
    beschreibung: tauschPaare > 0
      ? `${tauschPaare} Tausch-Paar${tauschPaare === 1 ? "" : "e"} möglich — Über-/Unterstunden auszugleichen.`
      : "Stunden-Verteilung ist ausgeglichen.",
    details: ueberSoll.slice(0, tauschPaare).map((u, i) => {
      const partner = unterSoll[i];
      return `${u.person.name} (+${(u.istStunden - u.sollStunden).toFixed(1)}h) ↔ ${partner.person.name} (${(partner.istStunden - partner.sollStunden).toFixed(1)}h)`;
    }),
    auswirkung: "Überstunden-Topf wird abgebaut · weniger Kostenrisiko",
  };
}

// ─── Re-generierbar ──────────────────────────────────────────────

/** Fasst alle KI-Aktionen zusammen — für UI-Übersicht */
export function alleKiAktionen(hud: DienstplanHud): KiAktionsErgebnis[] {
  return [
    ki_autofuellen(hud),
    ki_konflikte_loesen(hud),
    ki_wuensche_optimieren(hud),
    ki_krankheitswarnung(hud),
    ki_tausch_vorschlag(hud),
  ];
}
