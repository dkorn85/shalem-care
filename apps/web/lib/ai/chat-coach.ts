// KI-Schicht-Coach — generiert Vorschläge zur Schichtoptimierung
// auf Basis der jüngsten Doku-Einträge, aktiver Risiken und
// Vergabe-Quoten.

import { getAIProvider } from "./provider";
import type { DokuEntry } from "../doku/types";

export type CoachSuggestion = {
  text: string;
  severity: "info" | "wichtig" | "kritisch";
  klientId?: string;
  meta: { provider: string; model: string };
};

const SYSTEM = `Du bist Schicht-Coach für eine Pflege-Station. Aus den letzten
Doku-Einträgen, Risiken und Medikationsereignissen formulierst du KURZE,
umsetzbare Vorschläge für die laufende Schicht.

Regeln:
- Maximal ein Vorschlag pro Antwort.
- 1–2 Sätze, immer konkret und handlungsbar.
- Niemals Diagnosen stellen, keine medikamentösen Anordnungen.
- Wenn alles im grünen Bereich, gib einen positiven Verstärker zurück.
- Sprache: Deutsch.`;

export async function suggestForChannel(input: {
  stationName: string;
  dokuKurz: DokuEntry[];
  ereignisse: string[];          // freitexte: "Vergabe verweigert", "Wunde stagniert", "Adhärenz < 70 %"
}): Promise<CoachSuggestion> {
  const ai = getAIProvider();
  const prompt = [
    `Station: ${input.stationName}`,
    "",
    "Letzte Doku-Einträge:",
    ...input.dokuKurz.slice(0, 8).map((d) => `- ${d.inhaltKurz}${d.abweichungVomNormalverlauf ? " ⚠ Abweichung" : ""}`),
    "",
    "Aktuelle Ereignisse:",
    ...input.ereignisse.slice(0, 8).map((e) => `- ${e}`),
    "",
    "Aufgabe: Gib EINEN Vorschlag zurück als JSON:",
    "{ \"text\": \"...\", \"severity\": \"info|wichtig|kritisch\", \"klientId\": \"optional-id\" }",
    "Keine Code-Fences.",
  ].join("\n");

  const result = await ai.generate(
    [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
    { jsonMode: true, temperature: 0.4, maxTokens: 250 },
  );

  let parsed: any = result.json;
  if (!parsed && result.text) {
    const cleaned = result.text.replace(/```json\s*|\s*```/g, "").trim();
    try { parsed = JSON.parse(cleaned); } catch { parsed = null; }
  }

  if (!parsed || typeof parsed.text !== "string") {
    return {
      text: heuristikVorschlag(input.dokuKurz, input.ereignisse),
      severity: "info",
      meta: { provider: result.provider, model: result.model },
    };
  }

  const sev: CoachSuggestion["severity"] =
    parsed.severity === "kritisch" || parsed.severity === "wichtig" ? parsed.severity : "info";

  return {
    text: parsed.text,
    severity: sev,
    klientId: typeof parsed.klientId === "string" ? parsed.klientId : undefined,
    meta: { provider: result.provider, model: result.model },
  };
}

function heuristikVorschlag(doku: DokuEntry[], ereignisse: string[]): string {
  const abweichung = doku.find((d) => d.abweichungVomNormalverlauf);
  if (abweichung) {
    return `Abweichung im Verlauf bei einem Klienten dokumentiert (${abweichung.inhaltKurz}). Bei Übergabe priorisieren — Hausarzt-Information prüfen.`;
  }
  if (ereignisse.some((e) => e.toLowerCase().includes("verweigert"))) {
    return "Eine Medikamentengabe wurde verweigert — alternative Annäherung versuchen (Aromastick, Beziehungsarbeit), später erneut anbieten.";
  }
  if (doku.length > 0) {
    return "Schicht im grünen Bereich — Beobachtungen lückenlos dokumentieren, Pausen bewusst nehmen.";
  }
  return "Ruhiger Anfang — Atem-Reset 4–6 vor Klientenkontakt einbauen, Beziehungspflege priorisieren.";
}
