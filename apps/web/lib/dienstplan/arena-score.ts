// Live-Score für die Dienstplan-Arena.
//
// Fünf Dimensionen, jede 0-100. Aggregat-Score = gewichteter Mittelwert.
// Phase A: deterministische Regeln auf in-memory-Daten.
// Phase B: ML-Modell mit echten Personalpräferenzen + Krankheits-Historie.

export type Schicht = "frueh" | "spaet" | "nacht" | "frei";

export type Assignment = {
  personId: string;
  /** YYYY-MM-DD */
  date: string;
  schicht: Schicht;
};

export type ArenaPerson = {
  id: string;
  name: string;
  initials: string;
  /** Soll-Stunden in der Woche · z.B. 38.5 für Vollzeit */
  sollWoche: number;
  /** Persönliche Wünsche · 0-1 weight */
  wuenscht: { keineNaechte?: boolean; keinWochenende?: boolean; keinFrueh?: boolean };
  /** Burnout-Risiko-Anker · 0-100 */
  burnoutRisiko: number;
};

export type Bedarf = {
  /** YYYY-MM-DD */
  date: string;
  /** Schicht-Typ */
  schicht: Schicht;
  /** Wieviele Personen mindestens */
  minBesetzung: number;
};

export type Score = {
  fairness: number;
  coverage: number;
  arbzg: number;
  wuensche: number;
  burnout: number;
  /** Gewichteter Aggregat-Score */
  gesamt: number;
  /** Konflikte für UI-Anzeige */
  konflikte: Konflikt[];
};

export type Konflikt = {
  art: "arbzg-11h" | "arbzg-tag" | "arbzg-woche" | "doppelbelegung" | "untererledigt" | "wunsch-verletzt";
  text: string;
  schwere: "warnung" | "verstoss";
  personId?: string;
  date?: string;
};

const STUNDEN_PRO_SCHICHT: Record<Schicht, number> = {
  frueh: 8,
  spaet: 8,
  nacht: 9,
  frei: 0,
};

// ─── Score-Berechnung ────────────────────────────────────────────

export function berechneScore(
  personen: ArenaPerson[],
  assignments: Assignment[],
  bedarfe: Bedarf[],
): Score {
  const konflikte: Konflikt[] = [];

  // ── 1. Coverage · wieviele Bedarfe sind gedeckt ──
  const totalBedarf = bedarfe.reduce((s, b) => s + b.minBesetzung, 0);
  let gedeckt = 0;
  for (const b of bedarfe) {
    const besetzt = assignments.filter((a) => a.date === b.date && a.schicht === b.schicht).length;
    gedeckt += Math.min(besetzt, b.minBesetzung);
    if (besetzt < b.minBesetzung) {
      konflikte.push({
        art: "untererledigt",
        text: `${b.date} · ${b.schicht}: ${besetzt}/${b.minBesetzung} besetzt`,
        schwere: "warnung",
        date: b.date,
      });
    }
  }
  const coverage = totalBedarf === 0 ? 100 : Math.round((gedeckt / totalBedarf) * 100);

  // ── 2. ArbZG-Compliance ──
  let arbzgScore = 100;
  for (const p of personen) {
    const eigene = assignments.filter((a) => a.personId === p.id);

    // Doppelbelegung am selben Tag
    const tage = new Map<string, Schicht[]>();
    for (const a of eigene) {
      const arr = tage.get(a.date) ?? [];
      arr.push(a.schicht);
      tage.set(a.date, arr);
    }
    for (const [date, schichten] of tage) {
      if (schichten.length > 1) {
        konflikte.push({
          art: "doppelbelegung",
          text: `${p.name} ${date}: ${schichten.length} Schichten gleichzeitig`,
          schwere: "verstoss",
          personId: p.id,
          date,
        });
        arbzgScore -= 15;
      }
    }

    // 11h Ruhezeit zwischen aufeinanderfolgenden Schichten
    const sortiert = [...eigene].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < sortiert.length; i++) {
      const gestern = sortiert[i - 1];
      const heute = sortiert[i];
      const tagDiff = (new Date(heute.date).getTime() - new Date(gestern.date).getTime()) / 86_400_000;
      if (tagDiff !== 1) continue;
      // Nacht → Früh am Folgetag = harter Verstoß
      if (gestern.schicht === "nacht" && heute.schicht === "frueh") {
        konflikte.push({
          art: "arbzg-11h",
          text: `${p.name} ${gestern.date}→${heute.date}: Nacht→Früh ohne 11h Ruhe`,
          schwere: "verstoss",
          personId: p.id,
          date: heute.date,
        });
        arbzgScore -= 20;
      }
    }

    // Maximal 5 aufeinanderfolgende Tage
    let runde = 0;
    let prev: string | null = null;
    for (const a of sortiert) {
      if (a.schicht === "frei") {
        runde = 0;
        continue;
      }
      if (prev) {
        const diff = (new Date(a.date).getTime() - new Date(prev).getTime()) / 86_400_000;
        runde = diff === 1 ? runde + 1 : 1;
      } else {
        runde = 1;
      }
      prev = a.date;
      if (runde > 5) {
        konflikte.push({
          art: "arbzg-woche",
          text: `${p.name} ${a.date}: 6. Tag in Folge ohne freien Tag`,
          schwere: "warnung",
          personId: p.id,
          date: a.date,
        });
        arbzgScore -= 5;
      }
    }
  }
  arbzgScore = Math.max(0, arbzgScore);

  // ── 3. Fairness · Stundenverteilung relativ zum Soll ──
  const stundenIst = new Map<string, number>();
  for (const a of assignments) {
    stundenIst.set(a.personId, (stundenIst.get(a.personId) ?? 0) + STUNDEN_PRO_SCHICHT[a.schicht]);
  }
  let fairnessSum = 0;
  let fairnessN = 0;
  for (const p of personen) {
    const ist = stundenIst.get(p.id) ?? 0;
    const soll = p.sollWoche;
    const abweichung = Math.abs(ist - soll) / Math.max(1, soll);
    const score = Math.max(0, 100 - abweichung * 100);
    fairnessSum += score;
    fairnessN++;
  }
  const fairness = fairnessN === 0 ? 100 : Math.round(fairnessSum / fairnessN);

  // ── 4. Wunsch-Erfüllung ──
  let wuenscheScore = 100;
  let wunschVerstoesse = 0;
  for (const p of personen) {
    const eigene = assignments.filter((a) => a.personId === p.id);
    if (p.wuenscht.keineNaechte && eigene.some((a) => a.schicht === "nacht")) {
      konflikte.push({
        art: "wunsch-verletzt",
        text: `${p.name}: wünscht keine Nachtschichten`,
        schwere: "warnung",
        personId: p.id,
      });
      wunschVerstoesse++;
    }
    if (p.wuenscht.keinFrueh && eigene.some((a) => a.schicht === "frueh")) {
      wunschVerstoesse++;
    }
    if (p.wuenscht.keinWochenende) {
      const we = eigene.filter((a) => {
        const d = new Date(a.date).getDay();
        return d === 0 || d === 6;
      });
      if (we.length > 0) wunschVerstoesse += we.length;
    }
  }
  wuenscheScore = Math.max(0, 100 - wunschVerstoesse * 10);

  // ── 5. Burnout-Belastung ──
  let burnoutScore = 100;
  for (const p of personen) {
    const stunden = stundenIst.get(p.id) ?? 0;
    if (stunden > p.sollWoche * 1.1) {
      burnoutScore -= 8;
    }
    if (p.burnoutRisiko > 70) {
      const eigene = assignments.filter((a) => a.personId === p.id);
      const naechte = eigene.filter((a) => a.schicht === "nacht").length;
      if (naechte > 1) burnoutScore -= 5;
    }
  }
  burnoutScore = Math.max(0, burnoutScore);

  // ── Aggregat · Gewichtung ──
  const gesamt = Math.round(
    coverage * 0.35 +
      arbzgScore * 0.30 +
      fairness * 0.15 +
      wuenscheScore * 0.10 +
      burnoutScore * 0.10,
  );

  return {
    fairness,
    coverage,
    arbzg: arbzgScore,
    wuensche: wuenscheScore,
    burnout: burnoutScore,
    gesamt,
    konflikte,
  };
}

// ─── KI-Vorschlags-Logik (deterministisch · Phase A) ─────────────

export function naechsterVorschlag(
  personen: ArenaPerson[],
  assignments: Assignment[],
  bedarfe: Bedarf[],
): Assignment | null {
  // Finde unbesetzten Bedarf
  const unbesetzt = bedarfe.find((b) => {
    const besetzt = assignments.filter((a) => a.date === b.date && a.schicht === b.schicht).length;
    return besetzt < b.minBesetzung;
  });
  if (!unbesetzt) return null;

  // Wähle die Person mit den wenigsten zugewiesenen Stunden, ohne Konflikt
  const stundenIst = new Map<string, number>();
  for (const a of assignments) {
    stundenIst.set(a.personId, (stundenIst.get(a.personId) ?? 0) + STUNDEN_PRO_SCHICHT[a.schicht]);
  }

  const kandidaten = personen
    .filter((p) => {
      // Wunsch-Filter
      if (unbesetzt.schicht === "nacht" && p.wuenscht.keineNaechte) return false;
      if (unbesetzt.schicht === "frueh" && p.wuenscht.keinFrueh) return false;
      const tag = new Date(unbesetzt.date).getDay();
      if ((tag === 0 || tag === 6) && p.wuenscht.keinWochenende) return false;
      // Doppelbelegung verhindern
      const hasShift = assignments.some((a) => a.personId === p.id && a.date === unbesetzt.date);
      if (hasShift) return false;
      // Nacht-Früh-Konflikt verhindern
      const vortag = new Date(unbesetzt.date);
      vortag.setDate(vortag.getDate() - 1);
      const vortagISO = vortag.toISOString().slice(0, 10);
      if (
        unbesetzt.schicht === "frueh" &&
        assignments.some((a) => a.personId === p.id && a.date === vortagISO && a.schicht === "nacht")
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (stundenIst.get(a.id) ?? 0) - (stundenIst.get(b.id) ?? 0));

  const beste = kandidaten[0];
  if (!beste) return null;
  return {
    personId: beste.id,
    date: unbesetzt.date,
    schicht: unbesetzt.schicht,
  };
}

// ─── Demo-Seed-Daten für die Arena ─────────────────────────────

export function arenaDemoPersonen(): ArenaPerson[] {
  return [
    { id: "person-dr",      name: "Dennis Reuter",     initials: "DR", sollWoche: 38.5, wuenscht: {}, burnoutRisiko: 45 },
    { id: "person-ls",      name: "Lina Sommer",       initials: "LS", sollWoche: 30, wuenscht: { keineNaechte: true }, burnoutRisiko: 30 },
    { id: "person-as-005",  name: "Anika Stein",       initials: "AS", sollWoche: 38.5, wuenscht: {}, burnoutRisiko: 70 },
    { id: "person-tg-lead", name: "Tobias Grasse",     initials: "TG", sollWoche: 38.5, wuenscht: { keinFrueh: true }, burnoutRisiko: 25 },
    { id: "person-ay",      name: "Aylin Sözen",       initials: "AY", sollWoche: 32, wuenscht: { keinWochenende: true }, burnoutRisiko: 50 },
    { id: "person-fk",      name: "Felix Kaminski",    initials: "FK", sollWoche: 38.5, wuenscht: {}, burnoutRisiko: 35 },
  ];
}

export function arenaDemoBedarf(weekStart: string): Bedarf[] {
  const bedarfe: Bedarf[] = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    bedarfe.push({ date: iso, schicht: "frueh", minBesetzung: 2 });
    bedarfe.push({ date: iso, schicht: "spaet", minBesetzung: 2 });
    bedarfe.push({ date: iso, schicht: "nacht", minBesetzung: 1 });
  }
  return bedarfe;
}

export const SCHICHT_LABEL: Record<Schicht, string> = {
  frueh: "Früh",
  spaet: "Spät",
  nacht: "Nacht",
  frei: "Frei",
};

export const SCHICHT_FARBE: Record<Schicht, string> = {
  frueh: "var(--sun)",
  spaet: "var(--vibe-profile)",
  nacht: "var(--sat)",
  frei: "var(--fg-mute)",
};

export const SCHICHT_KEY: Record<string, Schicht> = {
  f: "frueh",
  s: "spaet",
  n: "nacht",
  z: "frei",
};
