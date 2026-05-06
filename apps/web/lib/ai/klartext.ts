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

// Quell-Berufe: aus deren Fach-Sprache wird übersetzt.
// Erweitert auf alle Berufe + Plattform-Module aus role-theme.ts.
export type KlartextBeruf =
  | "pflege" | "arzt" | "therapie" | "sozialarbeit" | "heilerziehung"
  | "ehrenamt" | "hauswirtschaft" | "erziehung" | "apotheke"
  | "medizintechnik" | "rettungsdienst" | "bestatter" | "begleitung"
  | "lead" | "klient" | "angehoerig" | "konferenz";

// Ziel: in welche Sprache übersetzt werden soll.
// "klient" = Alltagssprache für Klient:in/Angehörige (Default).
// Sonst: in die Berufssprache der Ziel-Rolle (z.B. arzt → pflege).
export type KlartextZiel =
  | "klient" | "pflege" | "arzt" | "therapie" | "sozialarbeit"
  | "heilerziehung" | "ehrenamt" | "hauswirtschaft" | "erziehung"
  | "apotheke" | "lead";

export type KlartextEingabe = {
  beruf: KlartextBeruf;
  fachtext: string;
  klientHinweis?: string;          // z.B. "78 J., Pflegegrad 3, lebt allein"
  zusatzfrage?: string;            // optionale Klient-Rückfrage zum Text
  zielBeruf?: KlartextZiel;        // Default: "klient" (Alltagssprache)
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

const SYSTEM_PROMPT = `Du bist Lana / Dennis, KI-Brücke zwischen den Berufen in der Genossenschaft Shalem Care.
Deine Aufgabe: einen Text aus der Fachsprache eines Berufs in die Fachsprache (oder
Alltagssprache) eines anderen Adressaten übersetzen — ohne Inhalt zu verfälschen.

Regeln:
- Lies "Quell-Beruf" und "Ziel-Adressat" aus dem User-Prompt.
- Wenn Ziel = Klient:in/Angehörige: max. 15 Wörter pro Satz, keine Fachbegriffe ohne Erklärung,
  direkte Anrede ("Sie", "Ihr Befund").
- Wenn Ziel = anderer Beruf: passende Fach-Kürzel und Logik der Ziel-Disziplin verwenden,
  knapp, handlungsorientiert.
- Beschönige nichts, aber schüre auch keine Angst. Nüchtern, warm.
- Markiere — wenn passend — die EINE Stelle, an der die Adressat:in nachfragen sollte.
- Glossar: erkannte Fachbegriffe aus dem Quelltext erklären (für Adressat:in passend).
- Rückfragen: 1-3 Fragen, die der/die Adressat:in stellen könnte.
- Antworte ausschließlich als JSON nach diesem Schema:
  {
    "klartext": "string · 3-5 kurze Sätze (länger nur bei Beruf-Adressat)",
    "glossar": [{"fach": "Begriff", "klar": "Erklärung"}],
    "rueckfragen": ["Frage 1", "Frage 2"]
  }
- KEIN Fließtext außerhalb des JSON. Kein Markdown.`;

const VOICE_FOR_BERUF: Record<KlartextBeruf, "lana" | "dennis"> = {
  pflege: "lana", arzt: "lana", therapie: "lana", sozialarbeit: "lana",
  heilerziehung: "lana", ehrenamt: "lana", hauswirtschaft: "lana",
  erziehung: "lana", apotheke: "dennis", medizintechnik: "dennis",
  rettungsdienst: "dennis", bestatter: "dennis", begleitung: "lana",
  lead: "dennis", klient: "lana", angehoerig: "lana", konferenz: "dennis",
};

const ZIEL_HINWEIS: Record<KlartextZiel, string> = {
  klient:        "die Klient:in oder Angehörige (Alltagssprache, max. 15 Wörter pro Satz, keine Fachbegriffe)",
  pflege:        "eine Pflegekraft (knapp, handlungsorientiert, Pflege-Doku-Kürzel ok wie SIS, NRS, BMI, RR)",
  arzt:          "eine Ärztin/einen Arzt (klinisch-fachlich, ICD-10, Befund-Format)",
  therapie:      "eine Therapeut:in (funktional, ROM, ICF-Klassifikation, NRS)",
  sozialarbeit:  "eine Sozialarbeiter:in (Casemanagement-Sprache, SGB-Bezüge, Hilfeplan-Logik)",
  heilerziehung: "eine Heilerziehungspflegerin (BeWo, Teilhabe, ITP)",
  ehrenamt:      "eine ehrenamtliche Begleitung (warm, ohne Jargon, Aufmerksamkeit auf Beziehung)",
  hauswirtschaft:"eine Hauswirtschaftskraft (alltagsnah, Tagesablauf-orientiert, Ernährung/Haushalt)",
  erziehung:     "eine Erzieher:in/Kindheitspädagog:in (entwicklungsorientiert, Lerngeschichten-Stil)",
  apotheke:      "eine Apotheker:in (Pharma-Fachsprache, Wirkstoff statt Markenname, Wechselwirkung explizit)",
  lead:          "eine Stationsleitung (Entscheidungs-orientiert, Kosten/Personal-Bezug, kurz)",
};

export async function generiereKlartext(eingabe: KlartextEingabe): Promise<KlartextErgebnis> {
  const provider = getAIProvider();
  const ziel: KlartextZiel = eingabe.zielBeruf ?? "klient";

  const userPrompt = [
    `Quell-Beruf (woher kommt der Text): ${eingabe.beruf}`,
    `Ziel-Adressat:in: ${ZIEL_HINWEIS[ziel]}`,
    eingabe.klientHinweis ? `Klient-Hinweis: ${eingabe.klientHinweis}` : null,
    "",
    "Fachtext:",
    eingabe.fachtext.trim(),
    eingabe.zusatzfrage ? `\nZusätzliche Frage: ${eingabe.zusatzfrage}` : null,
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
