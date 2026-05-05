// KI-Monatsplan-Generator · Claude erzeugt aus Budget + Bedarf einen Vorschlag.
//
// Eingabe:  Liste Mitarbeitende mit Soll-Stunden + Berufsgruppe + Vorlieben,
//           Bedarfsmuster (z.B. 24/7-Coverage Pulmo 3B), Constraints (ArbZG),
//           gewünschter Zeitraum (Jahr/Monat).
// Ausgabe:  Strukturierte Tagesvergabe pro Person mit Schicht-Typ + Stunden,
//           plus Begründung und Constraint-Check (welche Regel erfüllt/verletzt).
//
// Wichtig: Der Plan ist ein Vorschlag, nicht die Wahrheit. Er wird im
// UI angezeigt und kann von der Stationsleitung übernommen, korrigiert
// oder verworfen werden. Erst beim "Anwenden" werden Slots geschrieben.

import { getAIProvider } from "../ai/provider";
import type { AIMessage } from "../ai/provider";
import type { Beruf } from "./budget";

export type KiPlanerEingabe = {
  jahr: number;
  monat: number;                  // 1-12
  mitarbeitende: {
    personId: string;
    name: string;
    beruf: Beruf;
    sollStunden: number;
    qualifikationen?: string[];
    praeferenz?: string;          // freier Text: "keine Nächte", "lieber WB-A", ...
  }[];
  bedarfsmuster: BedarfMuster[];
  constraints?: {
    maxStundenProTag?: number;     // Default 10 (ArbZG § 3)
    minRuheZwischen?: number;      // Stunden, Default 11
    maxStundenProWoche?: number;   // Default 48 (ArbZG § 6)
    wochenendeFair?: boolean;      // Default true · Verteilt Wochenenden gleichmäßig
  };
  hinweis?: string;                // freier Zusatz-Hinweis ("Yvonne ist 12.-19. im Urlaub")
};

export type BedarfMuster = {
  bereich: string;                 // "Pulmo 3B" oder "Tour Augsburg"
  beruf: Beruf;
  schichten: { typ: SchichtTyp; anzahl: number; tage: TagTyp[] }[];
};

export type SchichtTyp = "frueh" | "spaet" | "nacht" | "tag" | "geteilter_dienst";
export type TagTyp = "werktag" | "samstag" | "sonntag" | "feiertag" | "alle";

export type KiPlanZuweisung = {
  personId: string;
  datumISO: string;                // YYYY-MM-DD
  schicht: SchichtTyp;
  startHHMM: string;
  endHHMM: string;
  dauerH: number;
  bereich: string;
  begruendung?: string;
};

export type KiPlanErgebnis = {
  zeitraum: { jahr: number; monat: number };
  zuweisungen: KiPlanZuweisung[];
  stundenBilanz: {
    personId: string;
    name: string;
    soll: number;
    geplant: number;
    saldo: number;
  }[];
  constraintsCheck: {
    arbeitszeitOk: boolean;
    ruhezeitOk: boolean;
    wochenendeFair: boolean;
    befunde: string[];             // freie Hinweise ("Dennis hat 2× Wochenende")
  };
  kommentar: string;                // Lana-Stil-Erklärung des Plans (3-5 Sätze)
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
};

const SYSTEM_PROMPT = `Du bist die KI-Disposition einer Pflege-Genossenschaft (Shalem Care).
Du planst einen kompletten Monat. Deine Aufgabe ist:
- jedes Soll-Stunden-Budget möglichst genau auszunutzen (Saldo nahe 0)
- ArbZG zu respektieren (max. 10 h/Tag, 11 h Ruhe, max. 48 h/Woche)
- Wochenenden gleichmäßig zu verteilen (niemand soll alle Wochenenden arbeiten)
- Vorlieben der Mitarbeitenden zu berücksichtigen wenn der Bedarf das erlaubt
- Bedarfsmuster lückenlos abzudecken

Antworte AUSSCHLIESSLICH als JSON nach diesem Schema (kein Markdown, kein Fließtext daneben):
{
  "zuweisungen": [
    {
      "personId": "string",
      "datumISO": "YYYY-MM-DD",
      "schicht": "frueh|spaet|nacht|tag|geteilter_dienst",
      "startHHMM": "HH:MM",
      "endHHMM": "HH:MM",
      "dauerH": number,
      "bereich": "string",
      "begruendung": "kurz · optional"
    }
  ],
  "stundenBilanz": [
    {"personId": "string", "name": "string", "soll": number, "geplant": number, "saldo": number}
  ],
  "constraintsCheck": {
    "arbeitszeitOk": true|false,
    "ruhezeitOk": true|false,
    "wochenendeFair": true|false,
    "befunde": ["string"]
  },
  "kommentar": "string · 3-5 Sätze in Lana-Stil"
}

Wichtig:
- Plane GENAU 5 aufeinanderfolgende Tage ab dem 1. des Monats (Mo-Fr eines Beispiel-Tages).
  Das ist ein Rotations-Beispiel — die Plattform setzt das Muster fort.
- Stundenbilanz auf den ganzen Monat hochgerechnet (~4.3 Wochen).
- Maximal 5-7 Schichten pro Person in den 5 Tagen.
- Lieber ehrlich zugeben dass eine Constraint nicht erfüllt ist, als zu schummeln.
- Halte den JSON-Output kompakt — kurze Begründungen (max 8 Wörter pro Schicht).`;

function buildUserPrompt(eingabe: KiPlanerEingabe): string {
  const c = eingabe.constraints ?? {};
  const lines: string[] = [
    `Zeitraum: ${eingabe.jahr}-${String(eingabe.monat).padStart(2, "0")}`,
    "",
    "Mitarbeitende:",
    ...eingabe.mitarbeitende.map((m) =>
      `  - ${m.personId} · ${m.name} (${m.beruf}) · Soll ${m.sollStunden} h${
        m.qualifikationen?.length ? ` · Quali: ${m.qualifikationen.join(", ")}` : ""
      }${m.praeferenz ? ` · Vorliebe: ${m.praeferenz}` : ""}`,
    ),
    "",
    "Bedarfsmuster:",
    ...eingabe.bedarfsmuster.flatMap((b) => [
      `  ${b.bereich} (${b.beruf}):`,
      ...b.schichten.map((s) => `    - ${s.typ} × ${s.anzahl} an ${s.tage.join("/")}`),
    ]),
    "",
    "Constraints:",
    `  - max ${c.maxStundenProTag ?? 10} h/Tag`,
    `  - min ${c.minRuheZwischen ?? 11} h Ruhe zwischen Schichten`,
    `  - max ${c.maxStundenProWoche ?? 48} h/Woche`,
    `  - Wochenende fair verteilt: ${c.wochenendeFair ?? true ? "ja" : "nein"}`,
  ];
  if (eingabe.hinweis) {
    lines.push("", `Zusätzlicher Hinweis: ${eingabe.hinweis}`);
  }
  return lines.join("\n");
}

export async function generiereMonatsplan(eingabe: KiPlanerEingabe): Promise<KiPlanErgebnis> {
  // Sonnet 4.6 als Default für Dienstplan — Haiku produziert bei dieser
  // JSON-Komplexität (16 Personen × 7 Tage Beispiel-Rotation) zu oft
  // gekürztes oder schlecht strukturiertes JSON. Override per ENV möglich.
  const modelOverride =
    process.env.SHALEM_DIENSTPLAN_MODEL ?? "claude-sonnet-4-6";
  const provider = getAIProvider({ modelOverride });
  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(eingabe) },
  ];

  const result = await provider.generate(messages, {
    temperature: 0.2,
    // 5000 Token Output reicht fuer 5 Tage x 8 Personen Beispiel-Plan +
    // Bilanz + Kommentar. Bleibt klar unter Hostinger-Proxy-Timeout.
    maxTokens: 5000,
    jsonMode: true,
  });

  const parsed = parsePlan(result.text);

  return {
    zeitraum: { jahr: eingabe.jahr, monat: eingabe.monat },
    zuweisungen: parsed.zuweisungen,
    stundenBilanz: parsed.stundenBilanz,
    constraintsCheck: parsed.constraintsCheck,
    kommentar: parsed.kommentar,
    provider: result.provider,
    model: result.model,
    kostenEur: result.costEur,
    tokens: result.tokensUsed,
  };
}

function parsePlan(raw: string): {
  zuweisungen: KiPlanZuweisung[];
  stundenBilanz: KiPlanErgebnis["stundenBilanz"];
  constraintsCheck: KiPlanErgebnis["constraintsCheck"];
  kommentar: string;
} {
  let cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");

  // Best-effort: bei abgeschnittenem JSON versuchen, eine valide Form daraus zu machen.
  let obj: Record<string, unknown> = {};
  try {
    obj = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    obj = repairTruncatedJson(cleaned);
  }

  const zuw = (Array.isArray(obj.zuweisungen) ? obj.zuweisungen : [])
    .filter((z): z is KiPlanZuweisung =>
      !!z &&
      typeof (z as KiPlanZuweisung).personId === "string" &&
      typeof (z as KiPlanZuweisung).datumISO === "string",
    );
  const bil = (Array.isArray(obj.stundenBilanz) ? obj.stundenBilanz : [])
    .filter((b): b is KiPlanErgebnis["stundenBilanz"][number] =>
      !!b && typeof (b as { personId?: unknown }).personId === "string",
    );
  const cc = (obj.constraintsCheck ?? {}) as KiPlanErgebnis["constraintsCheck"];

  return {
    zuweisungen: zuw,
    stundenBilanz: bil,
    constraintsCheck: {
      arbeitszeitOk: cc.arbeitszeitOk ?? false,
      ruhezeitOk: cc.ruhezeitOk ?? false,
      wochenendeFair: cc.wochenendeFair ?? false,
      befunde: Array.isArray(cc.befunde) ? cc.befunde : [],
    },
    kommentar: typeof obj.kommentar === "string" ? obj.kommentar : extractKommentar(cleaned),
  };
}

/**
 * Repair-Versuch für abgeschnittene JSON-Antworten. Schließt offene Arrays
 * + Objekte und versucht erneut zu parsen. Liefert leeres Object wenn nichts
 * zu retten ist.
 */
function repairTruncatedJson(raw: string): Record<string, unknown> {
  let s = raw;
  // Letzten unvollständigen Eintrag abschneiden bis zum letzten kompletten "}"
  const lastClose = s.lastIndexOf("}");
  if (lastClose > 0) s = s.slice(0, lastClose + 1);
  // Offene Klammern automatisch schließen
  const open = (s.match(/\{/g) ?? []).length;
  const close = (s.match(/\}/g) ?? []).length;
  for (let i = 0; i < open - close; i++) s += "}";
  const openA = (s.match(/\[/g) ?? []).length;
  const closeA = (s.match(/\]/g) ?? []).length;
  for (let i = 0; i < openA - closeA; i++) s += "]";
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function extractKommentar(raw: string): string {
  // Quick-Regex-Extraktion falls Parser komplett fehlschlägt
  const m = raw.match(/"kommentar"\s*:\s*"([^"]+)"/);
  return m?.[1] ?? "Plan konnte nicht vollständig generiert werden — bitte Modell-Output prüfen.";
}

/**
 * Demo-Bedarf · Standard-24/7-Pulmo-3B-Bedarf, der mit unseren Demo-Personas
 * zusammenpasst. Wird auf der UI als Default angeboten.
 */
export const DEMO_BEDARFSMUSTER: BedarfMuster[] = [
  {
    bereich: "Pulmologie 3B Essen",
    beruf: "pflege",
    schichten: [
      { typ: "frueh", anzahl: 2, tage: ["alle"] },
      { typ: "spaet", anzahl: 2, tage: ["alle"] },
      { typ: "nacht", anzahl: 1, tage: ["alle"] },
    ],
  },
  {
    bereich: "St. Lukas Wohnbereich A",
    beruf: "pflege",
    schichten: [
      { typ: "frueh", anzahl: 2, tage: ["alle"] },
      { typ: "spaet", anzahl: 1, tage: ["alle"] },
      { typ: "nacht", anzahl: 1, tage: ["alle"] },
    ],
  },
  {
    bereich: "Tour Augsburg Süd",
    beruf: "pflege",
    schichten: [
      { typ: "frueh", anzahl: 1, tage: ["alle"] },
      { typ: "spaet", anzahl: 1, tage: ["werktag"] },
    ],
  },
  {
    bereich: "Therapie Praxis Bochum",
    beruf: "therapie",
    schichten: [
      { typ: "tag", anzahl: 1, tage: ["werktag"] },
    ],
  },
  {
    bereich: "Sozialarbeit Casemanagement",
    beruf: "sozialarbeit",
    schichten: [
      { typ: "tag", anzahl: 1, tage: ["werktag"] },
    ],
  },
];
