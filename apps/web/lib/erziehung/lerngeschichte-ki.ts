"use server";

// Server-Action: Beobachtungs-Klartext zu Lerngeschichte strukturieren.
// Carr-Methode: Bildungsbereiche + Lerndispositionen + Würdigungs-Entwurf.

import { getAIProvider } from "@/lib/ai/provider";
import {
  type Bildungsbereich, type Lerndisposition,
  BB_LABEL, LERNDISPO_LABEL,
} from "./lerngeschichten-store";

export type LerngeschichteEntwurf = {
  titel: string;
  bildungsbereiche: Bildungsbereich[];
  lerndispo: Lerndisposition[];
  text: string;
};

export type LerngeschichteResult =
  | {
      ok: true;
      entwurf: LerngeschichteEntwurf;
      source: "ki" | "heuristik";
      meta?: { provider: string; model: string; kostenEur: number; tokens: { input: number; output: number } };
    }
  | { ok: false; error: string };

const SYSTEM_PROMPT = `Du bist Lana — KI-Hilfe für Lerngeschichten nach Margaret Carr (NZ Te Whāriki / dt. Adaption Bayerischer Bildungsplan).

Aufgabe: Aus einer freien Beobachtung eine wertschätzende Lerngeschichte entwerfen.

Carr-Prinzipien:
- Stärken sehen, Defizite NICHT betonen.
- Konkret beschreiben, was das Kind tut/sagt — nicht interpretieren.
- Lerndispositionen würdigen: Interesse, Engagement, Standhalten, Sich-ausdrücken, Verantwortung.
- Erzählform — direkt an das Kind oder an Eltern adressiert ("Du hast heute …" oder "Mia hat heute …").

Pflicht-Output (JSON):
- titel: 5-10 Wörter, ohne Wertung "schön/toll"
- bildungsbereiche: 1-3 aus [sprache, sozial, natur, mathe, kunst, werte, koerper]
- lerndispo: 1-3 aus [interesse, engagement, ausdauer, kommunikation, verantwortung]
- text: 80-180 Wörter, beschreibend, würdigend, ohne Defizit-Sprache

Regeln:
- Nichts erfinden — nur was in der Beobachtung steht.
- Antwort AUSSCHLIESSLICH als JSON. Kein Markdown, keine Code-Fences.

Schema:
{
  "titel": "...",
  "bildungsbereiche": ["sozial", "sprache"],
  "lerndispo": ["interesse"],
  "text": "..."
}`;

const BB_KEYS: Bildungsbereich[] = ["sprache", "sozial", "natur", "mathe", "kunst", "werte", "koerper"];
const DISPO_KEYS: Lerndisposition[] = ["interesse", "engagement", "ausdauer", "kommunikation", "verantwortung"];

const REGEX_BB: { rx: RegExp; bb: Bildungsbereich }[] = [
  { rx: /\b(sprech|sagt|sing|wort|sätze?|spr(ach|ech)|erzähl|fragt|antwort)/i,         bb: "sprache" },
  { rx: /\b(freund|trösten?|teil(en|t)|streit|gruppe|gemeinsam|umarm|kreis)/i,        bb: "sozial" },
  { rx: /\b(natur|baum|tier|wasser|sand|stein|matsch|wald|garten|insekt)/i,             bb: "natur" },
  { rx: /\b(zähl|menge|sortier|reihenfolge|größer|kleiner|gleich|muster|symmetr)/i,    bb: "mathe" },
  { rx: /\b(mal|zeichn|musik|tanz|trommel|farb|baut|knet|formt|rhyth)/i,                bb: "kunst" },
  { rx: /\b(streit|fair|gerecht|teilen|helfen|verantwortung|regel)/i,                   bb: "werte" },
  { rx: /\b(klett|renn|spring|hüpf|balanc|schaukel|toben|bewegung|sport)/i,             bb: "koerper" },
];

const REGEX_DISPO: { rx: RegExp; dispo: Lerndisposition }[] = [
  { rx: /\b(interess|neugier|guckt|beobacht|will wissen|fragt|warum)/i,                 dispo: "interesse" },
  { rx: /\b(begeistert|vertieft|konzentr|stundenlang|völlig|ganz dabei)/i,              dispo: "engagement" },
  { rx: /\b(immer wieder|nochmal|versucht|gibt nicht auf|schafft|erst .* dann)/i,        dispo: "ausdauer" },
  { rx: /\b(sagt|erzählt|fragt|sing|teilt mit|erklärt|antwort)/i,                        dispo: "kommunikation" },
  { rx: /\b(hilft|tröstet|kümmert|aufpassen|verantwortung|holt|bringt|achtet)/i,          dispo: "verantwortung" },
];

function heuristikEntwurf(beobachtung: string, kindName?: string): LerngeschichteEntwurf {
  const txt = beobachtung.trim();
  const erkannteBb = REGEX_BB.filter((r) => r.rx.test(txt)).map((r) => r.bb);
  const dedupBb = Array.from(new Set(erkannteBb)).slice(0, 3);
  const erkannteDispo = REGEX_DISPO.filter((r) => r.rx.test(txt)).map((r) => r.dispo);
  const dedupDispo = Array.from(new Set(erkannteDispo)).slice(0, 3);

  const ersterSatz = txt.split(/[.!?]/)[0]?.trim() ?? "";
  const titelKern = ersterSatz.length > 10 && ersterSatz.length < 80
    ? ersterSatz
    : `${kindName ? kindName + " " : ""}im Bildungs-Moment`;
  const titel = titelKern.length > 70 ? titelKern.slice(0, 67) + "…" : titelKern;

  const text = [
    kindName ? `${kindName} hat heute einen besonderen Bildungs-Moment gezeigt.` : `Ein besonderer Bildungs-Moment ist heute aufgefallen.`,
    "",
    txt,
    "",
    dedupDispo.length > 0
      ? `Auffallend: ${dedupDispo.map((d) => LERNDISPO_LABEL[d].toLowerCase()).join(" und ")}.`
      : "Wir würdigen den Mut, den dieses Verhalten zeigt.",
    dedupBb.length > 0
      ? `Bildungsbereiche: ${dedupBb.map((b) => BB_LABEL[b]).join(" · ")}.`
      : "",
  ].filter(Boolean).join(" ");

  return {
    titel,
    bildungsbereiche: dedupBb.length > 0 ? dedupBb : ["sozial"],
    lerndispo: dedupDispo.length > 0 ? dedupDispo : ["interesse"],
    text,
  };
}

function parseKi(raw: string): LerngeschichteEntwurf | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned) as Record<string, unknown>;
    if (!obj || typeof obj !== "object") return null;
    const titel = typeof obj.titel === "string" ? obj.titel.trim() : "";
    const text = typeof obj.text === "string" ? obj.text.trim() : "";
    const rawBb = Array.isArray(obj.bildungsbereiche) ? obj.bildungsbereiche : [];
    const rawDispo = Array.isArray(obj.lerndispo) ? obj.lerndispo : [];
    const bildungsbereiche = rawBb.filter((x): x is Bildungsbereich => typeof x === "string" && (BB_KEYS as string[]).includes(x));
    const lerndispo = rawDispo.filter((x): x is Lerndisposition => typeof x === "string" && (DISPO_KEYS as string[]).includes(x));
    if (!titel || !text) return null;
    return { titel, text, bildungsbereiche, lerndispo };
  } catch {
    return null;
  }
}

export async function entwirfLerngeschichte(beobachtung: string, kindName?: string): Promise<LerngeschichteResult> {
  const text = beobachtung.trim();
  if (text.length < 30) return { ok: false, error: "Beobachtung zu kurz — beschreib in 2–6 Sätzen, was du gesehen hast." };

  const fallback = heuristikEntwurf(text, kindName);

  if (!process.env.ANTHROPIC_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    return { ok: true, entwurf: fallback, source: "heuristik" };
  }

  try {
    const provider = getAIProvider();
    const userPrompt = [
      kindName ? `Kind: ${kindName}` : "",
      "",
      "Beobachtung:",
      `"""${text}"""`,
      "",
      "Schreibe eine Lerngeschichte nach Carr.",
    ].filter(Boolean).join("\n");

    const result = await provider.generate(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.4, maxTokens: 700, jsonMode: true },
    );
    const parsed = parseKi(result.text);
    if (!parsed) return { ok: true, entwurf: fallback, source: "heuristik" };
    return {
      ok: true,
      entwurf: parsed,
      source: "ki",
      meta: {
        provider: result.provider,
        model: result.model,
        kostenEur: result.costEur,
        tokens: result.tokensUsed,
      },
    };
  } catch (err) {
    console.warn("[lerngeschichte-ki] Fallback auf Heuristik:", err);
    return { ok: true, entwurf: fallback, source: "heuristik" };
  }
}
