"use server";

// KI-Server-Action für die Sim-Engine. Claude spielt Personas:
// Helga sagt was, Petra fragt nach, Dr. Hartmann antwortet auf Verordnung,
// usw. Heuristik-Fallback erzeugt eine plausible Skript-Antwort wenn
// kein Provider verfügbar ist.

import { getAIProvider } from "@/lib/ai/provider";
import { getPersona, type Persona } from "./personas";
import { formatZeit, type SimZeit, type SimVital } from "./world";

export type CharakterAusgabe = {
  /** Persona-ID, die spricht */
  personaId: string;
  /** Eigentlicher Text */
  text: string;
  source: "ki" | "heuristik";
  meta?: {
    provider: string;
    model: string;
    kostenEur: number;
    tokens: { input: number; output: number };
  };
};

export type CharakterKontext = {
  zeit: SimZeit;
  vital: SimVital;
  /** Bisherige letzte Events als Kontext (max 8) */
  letzte_events?: { personaId: string; text: string }[];
  /** Anlass: warum spricht jemand jetzt? */
  anlass?: string;
};

const SYSTEM_BASE = `Du bist Sprachrohr für Personen in einer simulierten Pflege-Welt. Du spielst die Rolle EINER Person, die du als Charakter genau kennst.

Strikte Regeln:
1. Bleib in Rolle. Keine Meta-Kommentare ("Als KI ...").
2. Maximal 2-3 Sätze. Kurz, alltags-natürlich, in der Sprache der Person.
3. Verweise auf den Kontext (Zeit, Vital-Werte, letzte Events) — aber nur wenn passend.
4. Niemals Diagnosen oder ärztliche Empfehlungen aus der Rolle einer Klient:in oder Angehörigen.
5. Antworte AUSSCHLIESSLICH als JSON: { "text": "<dein gesprochener Satz>" }
   Kein Markdown, keine Erklärung, kein Anführungs-Wickler.

Sprache: Deutsch.`;

function buildSystem(p: Persona): string {
  return [
    SYSTEM_BASE,
    "",
    `Du spielst: ${p.name} (${p.unterzeile})`,
    "",
    "Biografie:",
    p.charakter.biografie,
    "",
    "Sprache:",
    p.charakter.sprache,
    "",
    `Typische Sorgen: ${p.charakter.typische_sorgen.join(" · ")}`,
    `Heute beschäftigt: ${p.charakter.heute_anliegen.join(" · ")}`,
  ].join("\n");
}

function buildUser(ctx: CharakterKontext, p: Persona): string {
  const lines: string[] = [];
  lines.push(`Aktuelle Welt-Zeit: ${formatZeit(ctx.zeit)}`);
  lines.push(
    `Klient-Vital (Helga): Schmerz NRS ${ctx.vital.schmerzNrs}, Stimmung ${ctx.vital.stimmung}/10, Wachheit ${ctx.vital.wachheit}/10`,
  );
  if (ctx.letzte_events && ctx.letzte_events.length > 0) {
    lines.push("");
    lines.push("Letzte Events (chronologisch, älteste oben):");
    for (const e of ctx.letzte_events.slice(-6)) {
      const persona = getPersona(e.personaId);
      lines.push(`  ${persona?.kurzname ?? e.personaId}: ${e.text}`);
    }
  }
  lines.push("");
  if (ctx.anlass) {
    lines.push(`Anlass für deinen Beitrag: ${ctx.anlass}`);
  } else {
    lines.push(
      `Anlass: Dein nächster Beitrag im Schicht-Geschehen — was würdest du gerade jetzt sagen?`,
    );
  }
  lines.push("");
  lines.push(`Du bist ${p.name}. Sprich.`);
  return lines.join("\n");
}

function heuristik(p: Persona, ctx: CharakterKontext): CharakterAusgabe {
  // Pseudo-zufällig aus typischen Sorgen / Anliegen wählen.
  const pool = [...p.charakter.heute_anliegen, ...p.charakter.typische_sorgen];
  const text = pool[Math.floor(Math.random() * pool.length)] ?? `${p.kurzname} ist heute hier.`;
  void ctx;
  return { personaId: p.id, text, source: "heuristik" };
}

function parse(raw: string): { text: string } | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned);
    if (obj && typeof obj === "object" && typeof obj.text === "string" && obj.text.trim()) {
      return { text: obj.text.trim() };
    }
  } catch {
    // Manchmal antwortet das Modell ohne JSON-Wrapper. Akzeptieren wenn kurz.
    if (raw.length < 400 && !raw.includes("\n\n")) {
      return { text: raw.replace(/^["']|["']$/g, "").trim() };
    }
  }
  return null;
}

export async function simulierePersonaAussage(
  personaId: string,
  ctx: CharakterKontext,
): Promise<CharakterAusgabe> {
  const persona = getPersona(personaId);
  if (!persona) {
    return { personaId, text: "(Unbekannte Persona)", source: "heuristik" };
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    return heuristik(persona, ctx);
  }

  try {
    const provider = getAIProvider();
    const result = await provider.generate(
      [
        { role: "system", content: buildSystem(persona) },
        { role: "user", content: buildUser(ctx, persona) },
      ],
      { temperature: 0.85, maxTokens: 200, jsonMode: true },
    );

    const parsed = parse(result.text);
    if (!parsed) return heuristik(persona, ctx);

    return {
      personaId: persona.id,
      text: parsed.text,
      source: "ki",
      meta: {
        provider: result.provider,
        model: result.model,
        kostenEur: result.costEur,
        tokens: result.tokensUsed,
      },
    };
  } catch (err) {
    console.warn("[sim/charakter] Fallback Heuristik:", err);
    return heuristik(persona, ctx);
  }
}
