// Mock-Provider — App läuft ohne API-Key, gibt deterministisch eingebettete Demo-Antworten
// Genau das was die echte KI für die Demo-Prompts liefern würde, in plausiblem Format.

import type { AIProvider, AIMessage, GenerateOptions, AIResult } from "./provider";

export class MockProvider implements AIProvider {
  readonly name = "Mock";
  readonly model = "mock-doku-v1";

  async generate(messages: AIMessage[], options: GenerateOptions = {}): Promise<AIResult> {
    // Letzte User-Message als Eingabe behandeln
    const userMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const systemMsg = messages.find((m) => m.role === "system")?.content ?? "";

    const text = generateMockResponse(systemMsg, userMsg, options.jsonMode === true);

    let json: unknown | undefined;
    if (options.jsonMode) {
      try { json = JSON.parse(text); } catch { /* */ }
    }

    // Simuliere kleine Latenz für realistische UX
    await new Promise((r) => setTimeout(r, 300));

    return {
      text,
      json,
      tokensUsed: { input: estimateTokens(messages.map((m) => m.content).join(" ")), output: estimateTokens(text) },
      costEur: 0,
      provider: this.name,
      model: this.model,
    };
  }
}

function estimateTokens(s: string): number {
  return Math.ceil(s.length / 4);  // Rule of thumb für deutsche Texte
}

function generateMockResponse(systemPrompt: string, userPrompt: string, jsonMode: boolean): string {
  const lower = (userPrompt + " " + systemPrompt).toLowerCase();

  if (jsonMode) {
    // Strukturierte Antwort für SIS-Themen-Klassifizierung
    if (lower.includes("themenfeld") || lower.includes("klassifizier")) {
      const themenfeld = guessThemenfeld(lower);
      const risiken = guessRisiken(lower);
      return JSON.stringify({
        themenfeld,
        risiken,
        abweichungVomNormalverlauf: lower.includes("schmerz") || lower.includes("blut") || lower.includes("sturz") || lower.includes("verletzt") || lower.includes("plötzlich"),
        konfidenz: 0.78,
      });
    }
    return JSON.stringify({ note: "Mock-Provider — bitte Prompts spezifischer formulieren oder echten API-Key setzen." });
  }

  // Strukturierte Doku-Vorschläge
  if (lower.includes("strukturier") || lower.includes("dokumenta") || lower.includes("eintrag") || lower.includes("beobachtung")) {
    const themenfeld = guessThemenfeld(lower);
    const risiken = guessRisiken(lower);
    return [
      `**Strukturierter Eintrag** (${THEMENFELD_LABEL[themenfeld]}):`,
      "",
      "Beobachtungs-Inhalt:",
      buildObservationBody(userPrompt),
      "",
      "Vorgeschlagene Maßnahmen:",
      ...buildMeasures(themenfeld, risiken),
      "",
      risiken.length > 0
        ? `Erkannte Risiken: ${risiken.map((r) => RISIKO_LABEL[r] ?? r).join(", ")}`
        : "Keine akuten Risiken identifiziert.",
      "",
      "_(Mock-Antwort — DEEPSEEK_API_KEY in .env setzen für echte KI-Antworten)_",
    ].join("\n");
  }

  if (lower.includes("massnahm") || lower.includes("maßnahm")) {
    return [
      "Vorgeschlagene Maßnahmen:",
      "- Engmaschige Beobachtung über 24–48 h, Befund schriftlich erfassen",
      "- Hausärztin telefonisch informieren",
      "- Tochter/Bezugsperson über Verlauf in Kenntnis setzen",
      "",
      "_(Mock — DEEPSEEK_API_KEY setzen für echte Vorschläge)_",
    ].join("\n");
  }

  return "Keine Mock-Antwort für diese Anfrage. DEEPSEEK_API_KEY in .env setzen für echte KI.";
}

function guessThemenfeld(text: string): string {
  if (text.match(/sturz|gehen|laufen|mobil|rollator|stehen|gleichgewicht/)) return "mobilitaet_bewegung";
  if (text.match(/wund|schmerz|medikament|blut|fieber|atmen|insulin|diabetes/)) return "krankheitsbezogen";
  if (text.match(/körper|wasch|essen|trinken|toilette|inkontin|katheter|kleid/)) return "selbstversorgung";
  if (text.match(/orient|sprach|verwirrt|kognitiv|gedächt|verständigen|hörgerät/)) return "kognition_kommunikation";
  if (text.match(/angehör|tochter|sohn|besuch|stimmung|sozial|allein|einsam/)) return "soziale_beziehungen";
  if (text.match(/zimmer|wohnung|hilfsmittel|umgebung|sicher|aufräumen/)) return "wohnen_haeuslichkeit";
  return "selbstversorgung";
}

function guessRisiken(text: string): string[] {
  const r: string[] = [];
  if (text.match(/sturz|gestürzt|gefallen|wackel|schwindel/)) r.push("sturz");
  if (text.match(/wund|druckstelle|liegt|rötung|dekubit/)) r.push("dekubitus");
  if (text.match(/abgenommen|kg verloren|isst wenig|ablehn.*essen|appetit/)) r.push("mangelernaehrung");
  if (text.match(/schluck|verschluckt|aspir|husten beim trinken/)) r.push("aspiration");
  if (text.match(/schmerz|nrs|vas/)) r.push("schmerz");
  if (text.match(/verwirrt|orientierung|halluzin/)) r.push("verwirrtheit");
  if (text.match(/depress|traurig|in sich gekehrt|antrieb|isoliert/)) r.push("depression");
  if (text.match(/trink.*wenig|weniger als|exsikkose|hautturgor/)) r.push("exsikkose");
  return r;
}

const THEMENFELD_LABEL: Record<string, string> = {
  mobilitaet_bewegung: "Mobilität und Bewegung",
  krankheitsbezogen: "Krankheitsbezogene Anforderungen",
  selbstversorgung: "Selbstversorgung",
  kognition_kommunikation: "Kognition und Kommunikation",
  soziale_beziehungen: "Leben in sozialen Beziehungen",
  wohnen_haeuslichkeit: "Wohnen und Häuslichkeit",
};

const RISIKO_LABEL: Record<string, string> = {
  sturz: "Sturzrisiko",
  dekubitus: "Dekubitusrisiko",
  mangelernaehrung: "Mangelernährung",
  aspiration: "Aspirationsrisiko",
  schmerz: "Schmerz",
  verwirrtheit: "Verwirrtheit",
  depression: "Depressivität",
  exsikkose: "Exsikkose",
};

function buildObservationBody(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length < 30) {
    return `${trimmed}. _(Eingabe sehr knapp — bitte Zeit, Ort, beobachtete Aktivität, Werte und Reaktion ergänzen.)_`;
  }
  // Mock fügt strukturierende Sätze hinzu
  return `${trimmed}\n\nKein akuter Handlungsbedarf außer dokumentierter Maßnahmen. Verlauf in 24h re-evaluieren.`;
}

function buildMeasures(themenfeld: string, risiken: string[]): string[] {
  const measures: string[] = [];
  if (themenfeld === "mobilitaet_bewegung") {
    measures.push("- Mobilisation gemäß Gehprogramm fortsetzen");
    measures.push("- Hilfsmittel-Funktionalität prüfen");
  } else if (themenfeld === "krankheitsbezogen") {
    measures.push("- Vitalparameter dokumentieren, NRS-Schmerzskala erfassen");
    measures.push("- Bei Veränderung Hausarzt kontaktieren");
  } else if (themenfeld === "selbstversorgung") {
    measures.push("- Aktivierende Pflege: Klient soweit möglich selbst durchführen lassen");
    measures.push("- Trink-/Essprotokoll führen");
  } else if (themenfeld === "soziale_beziehungen") {
    measures.push("- Bezugspflege festlegen, Tagesstruktur stabilisieren");
    measures.push("- Angehörige einbinden, Besuche fördern");
  } else {
    measures.push("- Beobachtung fortsetzen, Befund dokumentieren");
    measures.push("- Bei Verschlechterung Visite anfordern");
  }
  if (risiken.includes("sturz")) measures.push("- Sturzrisiko-Re-Assessment, Antirutsch-Socken konsequent");
  if (risiken.includes("dekubitus")) measures.push("- Lagewechsel alle 2h, Hautinspektion täglich");
  if (risiken.includes("mangelernaehrung")) measures.push("- Wiegen wöchentlich, Trinknahrung anbieten, Ernährungsberatung");
  return measures;
}
