// KI-Schichtbriefing — Zusammenfassung der Klienten-Lage
// für die nächste Schicht (Frühstück bis Übergabe).

import { getAIProvider } from "./provider";
import type { Klient } from "../hierarchy/types";
import type { DokuEntry, RisikoTyp } from "../doku/types";
import type { Verordnung, Vergabe } from "../medikation/types";

export type SchichtBriefing = {
  zusammenfassung: string;
  prioritaeten: { klientId: string; klientName: string; prio: "hoch" | "mittel" | "niedrig"; punkte: string[] }[];
  hinweise: string[];
  meta: {
    provider: string;
    model: string;
    tokensInput: number;
    tokensOutput: number;
  };
};

const SYSTEM_PROMPT = `Du bist eine Pflegedienst-Übergabe-Assistenz und erstellst Schichtbriefings für die kommende Schicht.

Regeln:
1. Faktenbasiert — nur was in den übergebenen Daten steht.
2. Priorisiere nach Risiko: instabile Klienten zuerst, dann Routinen.
3. Knappe, scanfähige Sprache — kurze Sätze, Aufzählungen.
4. Keine Diagnosen, keine Annahmen jenseits der Daten.
5. Hebe MDK-relevante Abweichungen hervor.

Sprache: Deutsch.`;

export async function generateSchichtBriefing(input: {
  schichtTyp: string;          // "Frühschicht", "Spätschicht", "Nachtschicht"
  station: string;
  klienten: Array<{
    klient: Klient;
    letzteDoku: DokuEntry[];
    aktiveRisiken: RisikoTyp[];
    aktiveVerordnungen: Verordnung[];
    letzteVergaben: Vergabe[];
  }>;
}): Promise<SchichtBriefing> {
  const ai = getAIProvider();

  const klientensummary = input.klienten.map((k) => {
    const lastDoku = k.letzteDoku[0];
    const verweigert = k.letzteVergaben.filter((v) => v.status === "verweigert").length;
    return [
      `${k.klient.name} (PG ${k.klient.pflegegrad}${k.klient.notes ? ` — ${k.klient.notes}` : ""})`,
      k.aktiveRisiken.length > 0 ? `  Risiken: ${k.aktiveRisiken.join(", ")}` : "",
      `  Aktive Medikation: ${k.aktiveVerordnungen.length} Verordnungen${verweigert > 0 ? `, ${verweigert} Vergaben verweigert (24h)` : ""}`,
      lastDoku
        ? `  Letzte Doku: ${lastDoku.inhaltKurz}${lastDoku.abweichungVomNormalverlauf ? "  ⚠ Abweichung Normalverlauf" : ""}`
        : "  Noch keine Doku-Einträge",
    ].filter(Boolean).join("\n");
  }).join("\n\n");

  const userPrompt = [
    `Station: ${input.station}`,
    `Kommende Schicht: ${input.schichtTyp}`,
    "",
    "Klienten der Station:",
    klientensummary,
    "",
    "Aufgabe:",
    "Erstelle ein Schichtbriefing als JSON mit:",
    "- zusammenfassung: 2–3 knappe Sätze zur Gesamtlage der Station",
    "- prioritaeten: Array, je Klient mit { klientId, klientName, prio: 'hoch'|'mittel'|'niedrig', punkte: [3-5 konkrete To-dos] }",
    "- hinweise: Array bis 3 Strings, allgemeine Hinweise (z.B. Personalstärke, Übergabezeiten)",
    "Antworte nur als JSON, keine Code-Fences.",
  ].join("\n");

  const result = await ai.generate(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, temperature: 0.3, maxTokens: 1500 }
  );

  let parsed: any = result.json;
  if (!parsed && result.text) {
    const cleaned = result.text.replace(/```json\s*|\s*```/g, "").trim();
    try { parsed = JSON.parse(cleaned); } catch { parsed = null; }
  }

  // Fallback wenn KI nicht parsbar antwortet (Mock-Provider)
  if (!parsed || typeof parsed !== "object") {
    parsed = buildFallbackBriefing(input);
  }

  return {
    zusammenfassung: typeof parsed.zusammenfassung === "string"
      ? parsed.zusammenfassung
      : `${input.klienten.length} Klienten in ${input.station}, ${input.schichtTyp} startet.`,
    prioritaeten: Array.isArray(parsed.prioritaeten) ? parsed.prioritaeten : [],
    hinweise: Array.isArray(parsed.hinweise) ? parsed.hinweise : [],
    meta: {
      provider: result.provider,
      model: result.model,
      tokensInput: result.tokensUsed.input,
      tokensOutput: result.tokensUsed.output,
    },
  };
}

function buildFallbackBriefing(input: Parameters<typeof generateSchichtBriefing>[0]) {
  const prioritaeten = input.klienten.map((k) => {
    const hochrisiko = k.aktiveRisiken.includes("dekubitus") || k.aktiveRisiken.includes("aspiration") || k.aktiveRisiken.includes("sturz");
    const abweichung = k.letzteDoku[0]?.abweichungVomNormalverlauf;
    const prio: "hoch" | "mittel" | "niedrig" =
      hochrisiko || abweichung ? "hoch" : k.aktiveRisiken.length > 0 ? "mittel" : "niedrig";
    const punkte: string[] = [];
    if (k.aktiveRisiken.includes("sturz")) punkte.push("Sturzrisiko: Antirutsch-Socken, Rufanlage griffbereit");
    if (k.aktiveRisiken.includes("dekubitus")) punkte.push("Lagewechsel alle 2h, Hautinspektion bei VW");
    if (k.aktiveRisiken.includes("mangelernaehrung")) punkte.push("Trinkprotokoll, Trinknahrung anbieten, wiegen");
    if (k.aktiveRisiken.includes("schmerz")) punkte.push("NRS bei Aufnahme + 1×/Schicht, Bedarfsmedikation rechtzeitig");
    if (k.aktiveRisiken.includes("aspiration")) punkte.push("Andickung Stufe 2-3, aufrechte Sitzposition beim Essen");
    if (k.aktiveVerordnungen.length > 0) punkte.push(`${k.aktiveVerordnungen.length} Medikamenten-Verordnungen — Stelltermine prüfen`);
    if (k.letzteDoku[0]?.abweichungVomNormalverlauf) punkte.push(`Abweichung im Verlauf: ${k.letzteDoku[0].inhaltKurz}`);
    if (punkte.length === 0) punkte.push("Routine-Pflege, Beobachtung dokumentieren");
    return { klientId: k.klient.id, klientName: k.klient.name, prio, punkte: punkte.slice(0, 5) };
  });

  return {
    zusammenfassung: `${input.klienten.length} Klienten · ${prioritaeten.filter((p) => p.prio === "hoch").length} Hochrisiko · ${input.schichtTyp} ${input.station}.`,
    prioritaeten,
    hinweise: [
      "Übergabe protokollieren, neue Risiken sofort markieren",
      "BtM-Bestände prüfen vor Schichtbeginn",
      "Bei Verschlechterung Hausarzt/Bereitschaft kontaktieren",
    ],
  };
}
