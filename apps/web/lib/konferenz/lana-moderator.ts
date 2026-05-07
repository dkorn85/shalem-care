"use server";

// Lana als KI-Moderatorin für Live-Fallbesprechungen.
// Nimmt PreReads + Live-Notizen + Audit-Trail-Auszug + Klient-Kontext
// und liefert:
//   1. Live-Zusammenfassung (was bisher gesagt wurde)
//   2. Vorgeschlagene Beschlüsse (basierend auf Pre-Reads + Diskussion)
//   3. Offene Pre-Read-Punkte (was noch nicht behandelt wurde)
//
// Heuristik-Fallback wenn kein API-Key.

import { getAIProvider } from "@/lib/ai/provider";

export type LanaModerationsInput = {
  klientName: string;
  preReadsKurz: { beruf: string; autorName: string; aktuellerStand: string }[];
  /** Letzte Audit-Ereignisse als Diskussions-Indiz */
  letzteEreignisse: { person: string; ereignis: string; detail?: string }[];
  /** Live-Notizen wenn vorhanden */
  liveNotizen?: string;
  /** Anlass der Konferenz */
  anlass: string;
};

export type LanaModerationsOutput = {
  zusammenfassung: string;
  vorgeschlageneBeschluesse: { was: string; wer: string; bis?: string }[];
  offeneFragen: string[];
  source: "ki" | "heuristik";
  meta?: {
    provider: string;
    model: string;
    kostenEur: number;
    tokens: { input: number; output: number };
  };
};

const SYSTEM_PROMPT = `Du bist Lana — KI-Moderatorin für interdisziplinäre Fallbesprechungen bei Shalem Care.

Du beobachtest Pre-Reads aller Beteiligten + Live-Diskussion + Audit-Trail.
Deine Aufgabe ist eine kurze Moderations-Hilfe für die Stationsleitung.

Strikte Regeln:
1. Keine Diagnosen, keine ärztlichen Empfehlungen.
2. Beschluss-Vorschläge müssen aus den Pre-Reads + bisherigen Wortmeldungen ableitbar sein, nicht erfunden.
3. Wer-Bis-Was-Format für Beschluss-Vorschläge.
4. Offene Fragen aus Pre-Reads listen, die noch nicht in der Diskussion adressiert wurden.
5. Maximal 3 Sätze Zusammenfassung, max 4 Beschluss-Vorschläge, max 4 offene Fragen.
6. Antworte ausschließlich als JSON nach Schema. Kein Markdown, keine Code-Fences.

Sprache: Deutsch.`;

function buildUserPrompt(input: LanaModerationsInput): string {
  const lines: string[] = [];
  lines.push(`Klient:in: ${input.klientName}`);
  lines.push(`Anlass der Konferenz: ${input.anlass}`);
  lines.push("");
  lines.push("Pre-Reads der Beteiligten:");
  for (const p of input.preReadsKurz.slice(0, 6)) {
    lines.push(`- ${p.beruf} (${p.autorName}): ${p.aktuellerStand}`);
  }
  if (input.liveNotizen?.trim()) {
    lines.push("");
    lines.push("Live-Notizen bisher:");
    lines.push(input.liveNotizen);
  }
  if (input.letzteEreignisse.length > 0) {
    lines.push("");
    lines.push("Letzte Wortmeldungen + Ereignisse:");
    for (const e of input.letzteEreignisse.slice(-8)) {
      lines.push(
        `- ${e.person}: ${e.ereignis}${e.detail ? ` · "${e.detail}"` : ""}`,
      );
    }
  }
  lines.push("");
  lines.push("Antworte als JSON:");
  lines.push("{");
  lines.push('  "zusammenfassung": "<2-3 Sätze · was bisher gesagt wurde>",');
  lines.push('  "vorgeschlageneBeschluesse": [{"was": "string", "wer": "string", "bis": "YYYY-MM-DD?"}],');
  lines.push('  "offeneFragen": ["string", ...]');
  lines.push("}");
  return lines.join("\n");
}

function heuristik(input: LanaModerationsInput): LanaModerationsOutput {
  const fragen: string[] = [];
  for (const p of input.preReadsKurz.slice(0, 4)) {
    fragen.push(
      `Wie wurde ${p.beruf}-Pre-Read von ${p.autorName} adressiert?`,
    );
  }
  return {
    zusammenfassung: `Konferenz zu ${input.klientName}. Anlass: ${input.anlass}. ${input.preReadsKurz.length} Pre-Reads liegen vor, ${input.letzteEreignisse.length} Wortmeldungen bisher. KI-Provider nicht verfügbar — Heuristik.`,
    vorgeschlageneBeschluesse: [],
    offeneFragen: fragen.slice(0, 4),
    source: "heuristik",
  };
}

function parse(raw: string): {
  zusammenfassung: string;
  vorgeschlageneBeschluesse: { was: string; wer: string; bis?: string }[];
  offeneFragen: string[];
} | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned);
    if (!obj || typeof obj !== "object") return null;
    return {
      zusammenfassung:
        typeof obj.zusammenfassung === "string" ? obj.zusammenfassung : "",
      vorgeschlageneBeschluesse: Array.isArray(obj.vorgeschlageneBeschluesse)
        ? obj.vorgeschlageneBeschluesse
            .filter(
              (b: unknown): b is { was: string; wer: string; bis?: string } =>
                !!b &&
                typeof b === "object" &&
                typeof (b as { was?: unknown }).was === "string" &&
                typeof (b as { wer?: unknown }).wer === "string",
            )
            .map((b: { was: string; wer: string; bis?: unknown }) => ({
              was: b.was,
              wer: b.wer,
              bis: typeof b.bis === "string" ? b.bis : undefined,
            }))
        : [],
      offeneFragen: Array.isArray(obj.offeneFragen)
        ? obj.offeneFragen.filter((f: unknown): f is string => typeof f === "string")
        : [],
    };
  } catch {
    return null;
  }
}

export async function lanaModeriert(
  input: LanaModerationsInput,
): Promise<LanaModerationsOutput> {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    return heuristik(input);
  }

  try {
    const provider = getAIProvider();
    const result = await provider.generate(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      { temperature: 0.3, maxTokens: 800, jsonMode: true },
    );

    const parsed = parse(result.text);
    if (!parsed) return heuristik(input);

    return {
      zusammenfassung: parsed.zusammenfassung || heuristik(input).zusammenfassung,
      vorgeschlageneBeschluesse: parsed.vorgeschlageneBeschluesse,
      offeneFragen: parsed.offeneFragen,
      source: "ki",
      meta: {
        provider: result.provider,
        model: result.model,
        kostenEur: result.costEur,
        tokens: result.tokensUsed,
      },
    };
  } catch (err) {
    console.warn("[lana-moderator] Fallback Heuristik:", err);
    return heuristik(input);
  }
}
