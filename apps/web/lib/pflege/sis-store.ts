// SIS-Doku-Store · "Strukturierte Informationssammlung" nach SIS-Standard
// (Pflege-Reform 2017). Statt freier Tagesnotizen entstehen 6 Themenfelder
// nach Beziehungsgestaltung, Mobilität, Selbstversorgung, Krankheits-
// bewältigung, soziale Kontakte, Wohnen.
//
// In jedem Pflege-Tool heute (Vivendi/Snap) tippt die Pflegekraft die
// Felder von Hand. Das frisst 30-90 min pro Schicht.
//
// Shalem-Pfad: Pflegekraft spricht 30-60 Sek. ihre Beobachtung. KI
// strukturiert in die SIS-6-Felder + extrahiert Maßnahmen + erstellt
// einen Klartext-Eintrag für Angehörige. Pflegekraft prüft + signiert.
//
// Phase 2: ElevenLabs-STT + Anthropic-Strukturierung mit Pflege-System-
// Prompt. Heute: deterministische Heuristik-Stub, der das Pattern zeigt.

export type SisFeld =
  | "beziehungsgestaltung"
  | "mobilität"
  | "selbstversorgung"
  | "krankheitsbewältigung"
  | "kontakte"
  | "wohnen";

export const SIS_LABEL: Record<SisFeld, string> = {
  beziehungsgestaltung: "Beziehung & Kommunikation",
  mobilität: "Mobilität & Bewegung",
  selbstversorgung: "Selbstversorgung & Pflege",
  krankheitsbewältigung: "Krankheitsbewältigung & Therapie",
  kontakte: "Soziale Kontakte",
  wohnen: "Wohnen & Umgebung",
};

export const SIS_FARBE: Record<SisFeld, string> = {
  beziehungsgestaltung: "var(--vibe-team)",
  mobilität: "var(--fri)",
  selbstversorgung: "var(--mon)",
  krankheitsbewältigung: "var(--vibe-profile)",
  kontakte: "var(--thu)",
  wohnen: "var(--sun)",
};

export const SIS_BESCHREIBUNG: Record<SisFeld, string> = {
  beziehungsgestaltung: "Stimmung · Kontakt zur Bezugspflegekraft · Verstehen + Verstanden-werden",
  mobilität: "Eigene Bewegung · Hilfsmittel · Sturzrisiko · Lagerung",
  selbstversorgung: "Hygiene · Essen · Trinken · An-/Auskleiden · Toilette",
  krankheitsbewältigung: "Symptom-Verlauf · Schmerz · Medikation · Wundverlauf · Therapie-Compliance",
  kontakte: "Familie · Freunde · Mitbewohner · Teilhabe an Aktivitäten",
  wohnen: "Zimmer · Lichteinfall · Lärm · Lieblings-Gegenstände · Sicherheit",
};

export type SisEintrag = {
  id: string;
  klientId: string;
  pflegekraftId: string;
  pflegekraftName: string;
  /** ISO-DateTime */
  zeitpunkt: string;
  /** Original-Sprach-Aufnahme (URL oder data-uri) — kann leer sein wenn manuell */
  audioUrl?: string;
  audioDauerSec?: number;
  /** Original-Transkript wenn Audio diktiert */
  transkript?: string;
  /** SIS-Felder, gefüllt von KI oder manuell */
  felder: Partial<Record<SisFeld, string>>;
  /** Extrahierte Maßnahmen aus dem Diktat (Action-Items) */
  massnahmen: string[];
  /** Klartext-Version für Angehörige */
  klartext?: string;
  /** Stimmungs-Tag aus dem Diktat detektiert */
  stimmung?: "ruhig" | "unruhig" | "schmerzgeplagt" | "froh" | "ausgeglichen";
  /** Schmerz-NRS wenn explizit erwähnt */
  schmerz_nrs?: number;
  /** Status: draft = noch nicht signiert, signed = signiert + in Akte */
  status: "draft" | "signed";
  /** Geschätzte Sekunden, die mit Diktat gespart wurden vs Tippen */
  zeitErsparnisSec: number;
};

// In-memory Demo-Store. Phase 2: Supabase-Tabelle mit RLS auf CareTeam.
const eintraege = new Map<string, SisEintrag>();
let _seedDone = false;

export function seedSisOnce() {
  if (_seedDone) return;
  _seedDone = true;
  const heute = new Date();
  heute.setHours(7, 30, 0, 0);
  const beispiel: SisEintrag = {
    id: "sis-demo-hr-1",
    klientId: "klient-hr",
    pflegekraftId: "person-dr",
    pflegekraftName: "Dennis Reuter",
    zeitpunkt: heute.toISOString(),
    audioDauerSec: 47,
    transkript: "Helga heute morgen wach und ansprechbar, hat von ihrer Tochter erzählt — Erinnerung war klar. Beim Aufstehen Schwindel, NRS-Schmerz drei am Knie, Ibuprofen vierhundert vor zwanzig Minuten gegeben. Frühstück selbständig gegessen, eineinhalb Brötchen. Wundverband Sakral trocken, kein Geruch. Nachmittag-Therapie Termin 14:00 mit Sebastian, sollte mobilisiert werden. Tochter hat angerufen, will heute Abend besuchen.",
    felder: {
      beziehungsgestaltung: "Wach + ansprechbar. Erzählt von Tochter, Erinnerung klar. Stimmung ruhig.",
      mobilität: "Beim Aufstehen Schwindel — Sturzprophylaxe verstärkt. Mobilisation 14:00 (Sebastian).",
      selbstversorgung: "Frühstück selbständig (1.5 Brötchen). Hygiene mit Anleitung.",
      krankheitsbewältigung: "Schmerz NRS 3 (Knie) → Ibuprofen 400mg 7:10. Wundverband Sakral trocken, geruchsfrei.",
      kontakte: "Tochter angekündigt für heute Abend.",
      wohnen: "Zimmer ruhig, Lichteinfall morgens gut.",
    },
    massnahmen: [
      "Sturzprophylaxe verstärken (Schwindel beim Aufstehen)",
      "Schmerz-NRS um 11:00 nachkontrollieren",
      "Wundverband-Wechsel: nächster Termin Mittwoch 14:00",
      "Therapie-Übergabe an Sebastian: Mobilisation 14:00",
    ],
    klartext: "Liebe Familie, Helga ist heute morgen wach und gut gestimmt. Sie hat von Ihnen erzählt — die Erinnerung ist klar. Beim Aufstehen war ihr kurz schwindelig, das beobachten wir. Den Schmerz im Knie haben wir mit einer Tablette gelindert. Sie hat selbständig gefrühstückt. Der Wundverband ist trocken. Nachmittag kommt Sebastian zur Mobilisation, abends freut sie sich auf den Besuch.",
    stimmung: "ruhig",
    schmerz_nrs: 3,
    status: "signed",
    zeitErsparnisSec: 1380, // ~23 min gespart
  };
  eintraege.set(beispiel.id, beispiel);
}

export function listSisFuerKlient(klientId: string, limit = 50): SisEintrag[] {
  return Array.from(eintraege.values())
    .filter((e) => e.klientId === klientId)
    .sort((a, b) => b.zeitpunkt.localeCompare(a.zeitpunkt))
    .slice(0, limit);
}

export function getSis(id: string): SisEintrag | null {
  return eintraege.get(id) ?? null;
}

export function speichereSis(eintrag: SisEintrag): void {
  eintraege.set(eintrag.id, eintrag);
}

export function gesamtZeitErsparnis(pflegekraftId: string): { stundenWoche: number; eintraege: number } {
  const eigene = Array.from(eintraege.values()).filter((e) => e.pflegekraftId === pflegekraftId);
  const sum = eigene.reduce((s, e) => s + e.zeitErsparnisSec, 0);
  return {
    stundenWoche: Math.round(sum / 360) / 10,
    eintraege: eigene.length,
  };
}

// ─── KI-Strukturierung (Heuristik-Stub) ──────────────────────────

const FELD_KEYWORDS: Record<SisFeld, string[]> = {
  beziehungsgestaltung: ["wach", "ansprechbar", "erinnerung", "stimmung", "verwirrt", "klar", "freut", "weint", "gesprochen", "erzählt"],
  mobilität: ["aufstehen", "schwindel", "sturz", "lagerung", "bewegt", "gehen", "rollator", "bettlägerig", "mobilis", "transfer"],
  selbstversorgung: ["frühstück", "essen", "trinken", "wasser", "tee", "hygiene", "wasch", "dusche", "anziehen", "toilette", "windel", "kontinenz"],
  krankheitsbewältigung: ["schmerz", "nrs", "medikation", "tablette", "ibuprofen", "novalgin", "wunde", "wundverband", "blutzucker", "rr", "blutdruck", "puls", "fieber", "atmung", "spo2", "infekt", "therapie"],
  kontakte: ["tochter", "sohn", "tochter", "angehörig", "familie", "freund", "besuch", "anruf", "telefon", "mitbewohner"],
  wohnen: ["zimmer", "bett", "fenster", "licht", "lärm", "kälte", "warm", "lieblings"],
};

const STIMMUNG_KEYWORDS: Record<NonNullable<SisEintrag["stimmung"]>, string[]> = {
  ruhig: ["ruhig", "entspannt", "ausgeglichen", "fröhlich freut"],
  unruhig: ["unruhig", "agitiert", "verwirrt", "ängstlich"],
  schmerzgeplagt: ["schmerz", "weh", "stöhn", "schwer"],
  froh: ["froh", "freut", "lacht", "gut"],
  ausgeglichen: ["ausgeglichen", "klar", "wach"],
};

export function strukturiereTranskript(transkript: string): {
  felder: Partial<Record<SisFeld, string>>;
  massnahmen: string[];
  stimmung?: SisEintrag["stimmung"];
  schmerz_nrs?: number;
} {
  const text = transkript.toLowerCase();
  const saetze = transkript
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const felder: Partial<Record<SisFeld, string>> = {};
  for (const satz of saetze) {
    const lower = satz.toLowerCase();
    for (const [feld, keywords] of Object.entries(FELD_KEYWORDS) as [SisFeld, string[]][]) {
      if (keywords.some((k) => lower.includes(k))) {
        felder[feld] = (felder[feld] ? felder[feld] + " · " : "") + satz;
      }
    }
  }

  // Maßnahmen: Sätze mit "muss", "sollte", "Termin", Imperativ-Verben
  const massnahmenKW = ["sollte", "muss ", "termin", "kontroll", "wechsel", "übergabe", "achten", "beobachten"];
  const massnahmen: string[] = [];
  for (const satz of saetze) {
    const lower = satz.toLowerCase();
    if (massnahmenKW.some((k) => lower.includes(k))) {
      massnahmen.push(satz);
    }
  }

  // Stimmung
  let stimmung: SisEintrag["stimmung"] | undefined;
  let bestScore = 0;
  for (const [s, kws] of Object.entries(STIMMUNG_KEYWORDS) as [NonNullable<SisEintrag["stimmung"]>, string[]][]) {
    const score = kws.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      stimmung = s;
    }
  }

  // Schmerz-NRS via Regex
  let schmerz_nrs: number | undefined;
  const m = transkript.match(/(?:nrs|schmerz)[\s\-:]*?(\d{1,2})/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 0 && n <= 10) schmerz_nrs = n;
  } else {
    // Worte wie "Schmerz drei", "Schmerz vier"
    const wortzahl: Record<string, number> = {
      null: 0, eins: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10,
    };
    for (const [w, n] of Object.entries(wortzahl)) {
      const re = new RegExp(`schmerz\\s+(?:nrs\\s+)?${w}`, "i");
      if (re.test(transkript)) {
        schmerz_nrs = n;
        break;
      }
    }
  }

  return { felder, massnahmen, stimmung, schmerz_nrs };
}

export function generiereKlartext(felder: Partial<Record<SisFeld, string>>, klientName: string): string {
  const teile: string[] = [`Liebe Familie, ${klientName.split(" ")[0]} ist heute`];
  if (felder.beziehungsgestaltung) {
    teile.push(felder.beziehungsgestaltung.toLowerCase().includes("wach") ? "wach und ansprechbar" : "im Kontakt mit uns");
  }
  if (felder.krankheitsbewältigung && felder.krankheitsbewältigung.toLowerCase().includes("schmerz")) {
    teile.push("· Schmerzen werden überwacht und gelindert");
  }
  if (felder.selbstversorgung) {
    teile.push("· beim Essen begleitet");
  }
  if (felder.kontakte) {
    teile.push("· wir freuen uns über Ihren Besuch");
  }
  return teile.join(" ").replace(/^(.)/, (c) => c.toUpperCase()) + ".";
}
