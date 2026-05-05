// KI-Klartext · übersetzt Fachsprache in laienverständliche Sprache.
//
// Datenfluss:
//   Eingabe: roher Fach-Text (Befund, Wunddoku, Konferenz-Notiz, ...)
//          + Beruf-Kontext (für Voice + Tonfall)
//          + optional: Klient-Hinweise (Pflegegrad, Alter, Krankheits-Kontext)
//   Ausgabe: 3-5 kurze Sätze in einfacher Sprache, ohne Fachjargon,
//            mit klar markierten Stellen wo der Klient nachfragen sollte.
//
// Server-only: liest ANTHROPIC_API_KEY via getAIProvider().

import { getAIProvider, type AIMessage } from "./provider";

export type KlartextBeruf = "pflege" | "arzt" | "therapie" | "sozialarbeit" | "konferenz";

export type KlartextEingabe = {
  beruf: KlartextBeruf;
  fachtext: string;
  klientHinweis?: string;          // z.B. "78 J., Pflegegrad 3, lebt allein"
  zusatzfrage?: string;            // optionale Klient-Rückfrage zum Text
};

export type KlartextErgebnis = {
  klartext: string;                // 3-5 Sätze, plain language
  glossar: { fach: string; klar: string }[];  // erkannte Fachbegriffe + Übersetzung
  rueckfragen: string[];           // 1-3 Fragen, die der Klient stellen könnte
  voice: "lana" | "dennis";        // empfohlene Stimme für TTS
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
};

const SYSTEM_PROMPT = `Du bist Lana, eine erfahrene Stations-Lead in der Genossenschaft Shalem Care.
Deine Aufgabe: medizinische, pflegerische und sozialrechtliche Fachtexte für Klient:innen
und Angehörige in einfache, würdevolle Sprache übersetzen.

Regeln:
- Nutze Sätze von max. 15 Wörtern.
- Keine Fachbegriffe ohne Erklärung. Wenn ein Fachbegriff unverzichtbar ist, erkläre ihn in Klammern.
- Sprich die Person direkt an ("Sie", "Ihr Befund", "Ihre Wunde").
- Beschönige nichts, aber schüre auch keine Angst. Nüchtern, warm.
- Markiere die EINE Stelle im Text, an der die Person bei ihrer Pflegekraft / Ärztin nachfragen sollte.
- Antworte ausschließlich als JSON nach diesem Schema:
  {
    "klartext": "string · 3-5 kurze Sätze",
    "glossar": [{"fach": "Begriff", "klar": "Erklärung"}],
    "rueckfragen": ["Frage 1", "Frage 2"]
  }
- KEIN Fließtext außerhalb des JSON. Kein Markdown.`;

const VOICE_FOR_BERUF: Record<KlartextBeruf, "lana" | "dennis"> = {
  pflege: "lana",
  arzt: "lana",
  therapie: "lana",
  sozialarbeit: "lana",
  konferenz: "dennis",
};

export async function generiereKlartext(eingabe: KlartextEingabe): Promise<KlartextErgebnis> {
  const provider = getAIProvider();

  const userPrompt = [
    `Beruf-Kontext: ${eingabe.beruf}`,
    eingabe.klientHinweis ? `Klient-Hinweis: ${eingabe.klientHinweis}` : null,
    "",
    "Fachtext:",
    eingabe.fachtext.trim(),
    eingabe.zusatzfrage ? `\nZusätzliche Frage der Person: ${eingabe.zusatzfrage}` : null,
  ].filter(Boolean).join("\n");

  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  const result = await provider.generate(messages, {
    temperature: 0.3,
    maxTokens: 700,
    jsonMode: true,
  });

  const parsed = parseKlartextJson(result.text);

  return {
    klartext: parsed.klartext,
    glossar: parsed.glossar,
    rueckfragen: parsed.rueckfragen,
    voice: VOICE_FOR_BERUF[eingabe.beruf],
    provider: result.provider,
    model: result.model,
    kostenEur: result.costEur,
    tokens: result.tokensUsed,
  };
}

function parseKlartextJson(raw: string): {
  klartext: string;
  glossar: { fach: string; klar: string }[];
  rueckfragen: string[];
} {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned);
    return {
      klartext: typeof obj.klartext === "string" ? obj.klartext : "",
      glossar: Array.isArray(obj.glossar) ? obj.glossar.filter(
        (g: { fach?: unknown; klar?: unknown }) => typeof g?.fach === "string" && typeof g?.klar === "string",
      ) : [],
      rueckfragen: Array.isArray(obj.rueckfragen)
        ? obj.rueckfragen.filter((r: unknown): r is string => typeof r === "string")
        : [],
    };
  } catch {
    return { klartext: cleaned, glossar: [], rueckfragen: [] };
  }
}
