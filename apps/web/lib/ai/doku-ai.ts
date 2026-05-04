// Doku-AI — high-level Helfer für die Pflegedoku
// Nutzt den abstrakten AIProvider, kennt aber Doku-Spezifika.

import { getAIProvider } from "./provider";
import { SIS_THEMENFELDER, RISIKO_LABEL } from "../doku/types";
import type { SISThemenfeld, RisikoTyp, BerufsTyp } from "../doku/types";

const SYSTEM_PROMPT_PFLEGE = `Du unterstützt Pflegekräfte beim Erstellen MDK-prüfungsfähiger Pflegedokumentation nach SGB XI § 113b (Strukturmodell SIS).

Regeln, die du strikt einhältst:
1. Nur dokumentieren, was beobachtet wurde — keine Interpretationen oder Diagnosen.
2. Nachvollziehbar, plausibel, vollständig (Zeit, Ort, Aktivität, Werte, Reaktion).
3. Fachsprache angemessen, aber verständlich. Keine Abkürzungen, die nicht etabliert sind.
4. Keine personenbezogenen Daten erfinden — nur die übergebenen Inhalte verwenden.
5. Bei Risiken (Sturz, Dekubitus, Mangelernährung, Aspiration, Kontraktur, Schmerz, Verwirrtheit, Depression, Exsikkose, Inkontinenz, Weglauf): konkrete prophylaktische Maßnahmen nach Expertenstandards (DNQP).
6. Datenschutz: keine Reproduktion sensibler Inhalte, knapp und präzise.

Sprache: Deutsch.`;

const SYSTEM_PROMPT_SOZARB = `Du unterstützt Sozialarbeitende bei Hilfeplandokumentation gemäß SGB VIII § 36 (Jugendhilfe) bzw. SGB IX (Teilhabe).
Strikt: nur Beobachtetes dokumentieren, keine Wertungen, ressourcenorientierte Sprache, ICF-Bezug wo passend.
Sprache: Deutsch.`;

const SYSTEM_PROMPT_HEILERZ = `Du unterstützt Heilerziehungspflegende bei ICF-basierter Teilhabeplandoku gemäß BTHG (SGB IX).
Verwende ICF-Codes (b=Körperfunktion, d=Aktivität/Teilhabe, e=Umweltfaktoren) wenn passend.
Sprache: Deutsch.`;

function systemFor(beruf: BerufsTyp): string {
  switch (beruf) {
    case "pflege": return SYSTEM_PROMPT_PFLEGE;
    case "sozialarbeit": return SYSTEM_PROMPT_SOZARB;
    case "heilerziehung": return SYSTEM_PROMPT_HEILERZ;
    default: return SYSTEM_PROMPT_PFLEGE;  // Fallback — andere Berufe als generisch behandeln
  }
}

// ─── Strukturierter Doku-Vorschlag aus roher Beobachtung ───

export type StructureResult = {
  inhaltLang: string;
  themenfeld: SISThemenfeld | null;
  risiken: RisikoTyp[];
  abweichungVomNormalverlauf: boolean;
  vorgeschlageneMassnahmen: string[];
  rawText: string;
  meta: {
    provider: string;
    model: string;
    tokensInput: number;
    tokensOutput: number;
    costEur: number;
  };
};

export async function structureObservation(
  rawObservation: string,
  beruf: BerufsTyp = "pflege",
  klientContext?: { name: string; pflegegrad?: number }
): Promise<StructureResult> {
  const ai = getAIProvider();

  const themenfeldList = SIS_THEMENFELDER.map((t) => `${t.id} (${t.label})`).join(", ");
  const risikoList = Object.entries(RISIKO_LABEL).map(([k, v]) => `${k} (${v})`).join(", ");

  const userPrompt = [
    klientContext ? `Klient:in: ${klientContext.name}${klientContext.pflegegrad ? `, Pflegegrad ${klientContext.pflegegrad}` : ""}.` : "",
    "",
    "Rohe Beobachtung der Pflegekraft:",
    `"${rawObservation}"`,
    "",
    "Aufgabe:",
    "1. Strukturiere diesen Eintrag MDK-prüfungsfähig (Zeit, beobachtete Aktivität, konkrete Werte, Reaktion).",
    "2. Klassifiziere ins SIS-Themenfeld. Wähle EINS aus:",
    `   ${themenfeldList}`,
    "3. Identifiziere Risiken aus dieser Liste (kann mehrere sein, kann leer sein):",
    `   ${risikoList}`,
    "4. Markiere ob Abweichung vom Normalverlauf vorliegt (boolean).",
    "5. Schlage 2–4 konkrete Maßnahmen vor.",
    "",
    "Antworte als JSON in EXAKT diesem Schema (keine Code-Fences, kein Begleittext, nur JSON):",
    "{",
    '  "inhaltLang": "string — strukturierter Doku-Eintrag",',
    '  "themenfeld": "string — eine ID aus der Liste, oder null",',
    '  "risiken": ["string", ...],',
    '  "abweichungVomNormalverlauf": true|false,',
    '  "vorgeschlageneMassnahmen": ["string", ...]',
    "}",
  ].join("\n");

  const result = await ai.generate(
    [
      { role: "system", content: systemFor(beruf) },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, temperature: 0.2, maxTokens: 1200 }
  );

  // Parse JSON-Antwort robust
  let parsed: any = result.json;
  if (!parsed && result.text) {
    const cleaned = result.text.replace(/```json\s*|\s*```/g, "").trim();
    try { parsed = JSON.parse(cleaned); } catch { parsed = null; }
  }

  if (!parsed || typeof parsed !== "object") {
    // Wenn KI-Antwort nicht JSON-konform: gib raw text zurück, sodass der Mensch es selber zusammenstellt
    return {
      inhaltLang: result.text,
      themenfeld: null,
      risiken: [],
      abweichungVomNormalverlauf: false,
      vorgeschlageneMassnahmen: [],
      rawText: result.text,
      meta: {
        provider: result.provider,
        model: result.model,
        tokensInput: result.tokensUsed.input,
        tokensOutput: result.tokensUsed.output,
        costEur: result.costEur,
      },
    };
  }

  // Validiere themenfeld
  const validThemenfelder = new Set(SIS_THEMENFELDER.map((t) => t.id));
  const themenfeld = (parsed.themenfeld && validThemenfelder.has(parsed.themenfeld))
    ? (parsed.themenfeld as SISThemenfeld)
    : null;

  // Validiere risiken
  const validRisiken = new Set(Object.keys(RISIKO_LABEL));
  const risiken = (Array.isArray(parsed.risiken) ? parsed.risiken : [])
    .filter((r: unknown) => typeof r === "string" && validRisiken.has(r)) as RisikoTyp[];

  return {
    inhaltLang: typeof parsed.inhaltLang === "string" ? parsed.inhaltLang : result.text,
    themenfeld,
    risiken,
    abweichungVomNormalverlauf: parsed.abweichungVomNormalverlauf === true,
    vorgeschlageneMassnahmen: Array.isArray(parsed.vorgeschlageneMassnahmen)
      ? parsed.vorgeschlageneMassnahmen.filter((m: unknown) => typeof m === "string").slice(0, 6)
      : [],
    rawText: result.text,
    meta: {
      provider: result.provider,
      model: result.model,
      tokensInput: result.tokensUsed.input,
      tokensOutput: result.tokensUsed.output,
      costEur: result.costEur,
    },
  };
}

// ─── Maßnahmen-Vorschläge zu bestehender Doku ──────────────

export async function suggestMeasures(
  inhaltLang: string,
  themenfeld: SISThemenfeld | null,
  risiken: RisikoTyp[],
  beruf: BerufsTyp = "pflege"
): Promise<{ measures: string[]; meta: StructureResult["meta"] }> {
  const ai = getAIProvider();
  const userPrompt = [
    themenfeld ? `Themenfeld: ${themenfeld}` : "",
    risiken.length > 0 ? `Identifizierte Risiken: ${risiken.join(", ")}` : "",
    "",
    "Doku-Eintrag:",
    `"${inhaltLang}"`,
    "",
    "Schlage 3–5 konkrete, MDK-prüfungsfähige Pflegemaßnahmen vor.",
    "Maßnahmen müssen umsetzbar, beobachtbar, mit Frequenz/Frist sein.",
    "Antworte als JSON-Array von Strings, sonst nichts:",
    '["Maßnahme 1", "Maßnahme 2", ...]',
  ].join("\n");

  const result = await ai.generate(
    [
      { role: "system", content: systemFor(beruf) },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, temperature: 0.2, maxTokens: 600 }
  );

  let arr: unknown = result.json;
  if (!arr && result.text) {
    const cleaned = result.text.replace(/```json\s*|\s*```/g, "").trim();
    try { arr = JSON.parse(cleaned); } catch { arr = []; }
  }

  const measures = Array.isArray(arr)
    ? arr.filter((s: unknown) => typeof s === "string").slice(0, 6) as string[]
    : [];

  return {
    measures,
    meta: {
      provider: result.provider,
      model: result.model,
      tokensInput: result.tokensUsed.input,
      tokensOutput: result.tokensUsed.output,
      costEur: result.costEur,
    },
  };
}
