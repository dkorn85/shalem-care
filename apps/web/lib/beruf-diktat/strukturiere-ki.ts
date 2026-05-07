"use server";

// Server-Action: Diktat-Transkript mit Claude strukturieren.
// Fällt bei Fehler / fehlendem API-Key auf die lokale Heuristik zurück.
//
// Verwendet den bestehenden getAIProvider() — Anthropic wenn ANTHROPIC_API_KEY
// gesetzt, sonst DeepSeek, sonst Mock. Modell-Override pro Profil möglich.

import { getAIProvider } from "@/lib/ai/provider";
import {
  PROFILES,
  strukturiereDiktat,
  type DiktatProfil,
  type StrukturiertesProtokoll,
} from "./profile";

export type AiProtokoll = StrukturiertesProtokoll & {
  /** Wo der Output herkommt — fürs UI-Badge */
  source: "ki" | "heuristik";
  /** Provider-Info, nur bei source=ki gesetzt */
  meta?: {
    provider: string;
    model: string;
    kostenEur: number;
    tokens: { input: number; output: number };
  };
};

const SYSTEM_PROMPT_BASE = `Du bist Lana — KI-Strukturierungs-Hilfe für Pflege- und Sozialberufe in der Genossenschaft Shalem Care.

Aufgabe: Ein freies Diktat (gesprochener Schicht-Bericht, Reparatur-Auftrag, Lieferungs-Notiz) in vorgegebene Felder strukturieren.

Strikte Regeln:
1. Nur Inhalte verwenden, die im Diktat tatsächlich stehen — niemals erfinden.
2. Pro Feld 1-3 prägnante Sätze. Wenn nichts dazu im Diktat steht: leerer String.
3. Personen-Namen, Zahlen, Codes (ICD, AVV, NRS, BMI) wörtlich übernehmen.
4. Bei medizinischen Symptomen, Schmerzen, Blutungen, Notfall-Hinweisen, Aggressions-Vorfällen oder Sturz: in "warnungen" eskalieren mit konkreter Empfehlung.
5. Klartext-Brücke: 3-5 kurze Sätze in einfacher Sprache (max 15 Wörter pro Satz) für Adressat:in (Familie, Klient:in oder Pflege-Übergabe).
6. Antwort AUSSCHLIESSLICH als JSON nach dem vorgegebenen Schema. Kein Begleittext, kein Markdown, keine Code-Fences.

Sprache: Deutsch.`;

type ParsedKi = {
  felder: Record<string, string>;
  klartext: string;
  warnungen: string[];
};

function buildUserPrompt(profil: DiktatProfil, transkript: string): string {
  const felderListe = profil.felder
    .map((f) => `  "${f.key}": "${f.label} — ${f.beschreibung}"`)
    .join(",\n");

  return [
    `Berufs-Kontext: ${profil.eyebrow}`,
    `Profil: ${profil.titel}`,
    "",
    "Diktat-Transkript:",
    `"""${transkript.trim()}"""`,
    "",
    "Felder, in die du strukturieren sollst:",
    "{",
    felderListe,
    "}",
    "",
    `Klartext-Einleitung (nutze diese als ersten Satz): "${profil.klartext_intro()}"`,
    "",
    "Antworte als JSON:",
    "{",
    '  "felder": { "<feld_key>": "<inhalt>", ... },',
    '  "klartext": "<string · 3-5 kurze Sätze · einfache Sprache>",',
    '  "warnungen": ["<string>", ...]',
    "}",
  ].join("\n");
}

function parseKiAntwort(raw: string): ParsedKi | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned);
    if (!obj || typeof obj !== "object") return null;
    const felder: Record<string, string> = {};
    if (obj.felder && typeof obj.felder === "object") {
      for (const [k, v] of Object.entries(obj.felder as Record<string, unknown>)) {
        if (typeof v === "string" && v.trim()) felder[k] = v.trim();
      }
    }
    return {
      felder,
      klartext: typeof obj.klartext === "string" ? obj.klartext : "",
      warnungen: Array.isArray(obj.warnungen)
        ? obj.warnungen.filter((w: unknown): w is string => typeof w === "string")
        : [],
    };
  } catch {
    return null;
  }
}

export async function strukturiereDiktatMitKi(
  transkript: string,
  profilId: string,
): Promise<AiProtokoll> {
  const profil = PROFILES[profilId];
  if (!profil) {
    throw new Error(`Unbekanntes Diktat-Profil: ${profilId}`);
  }

  // Heuristik immer als Sicherheitsnetz berechnen — z.B. für zeitErsparnisSec.
  const heuristik = strukturiereDiktat(transkript, profil);

  // Wenn kein KI-Provider konfiguriert ist, gib direkt die Heuristik zurück.
  if (!process.env.ANTHROPIC_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    return { ...heuristik, source: "heuristik" };
  }

  try {
    const provider = getAIProvider();
    const result = await provider.generate(
      [
        { role: "system", content: SYSTEM_PROMPT_BASE },
        { role: "user", content: buildUserPrompt(profil, transkript) },
      ],
      { temperature: 0.2, maxTokens: 1200, jsonMode: true },
    );

    const parsed = parseKiAntwort(result.text);
    if (!parsed) {
      return { ...heuristik, source: "heuristik" };
    }

    // Validierung: nur erlaubte Feld-Keys übernehmen.
    const erlaubteKeys = new Set(profil.felder.map((f) => f.key));
    const validFelder: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed.felder)) {
      if (erlaubteKeys.has(k)) validFelder[k] = v;
    }

    return {
      felder: validFelder,
      klartext: parsed.klartext || heuristik.klartext,
      warnungen: parsed.warnungen.length > 0 ? parsed.warnungen : heuristik.warnungen,
      zeitErsparnisSec: heuristik.zeitErsparnisSec,
      source: "ki",
      meta: {
        provider: result.provider,
        model: result.model,
        kostenEur: result.costEur,
        tokens: result.tokensUsed,
      },
    };
  } catch (err) {
    console.warn("[diktat-ki] Fallback auf Heuristik:", err);
    return { ...heuristik, source: "heuristik" };
  }
}
