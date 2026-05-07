"use server";

// Server-Action: medizinisches Dokument mit Claude in Klartext übersetzen.
// Heuristik (verstehendeAkte) bleibt als Fallback aktiv.

import { getAIProvider } from "@/lib/ai/provider";
import {
  verstehendeAkte,
  GLOSSAR,
  DOK_LABEL,
  type AkteVerstaendnis,
  type DokumentTyp,
} from "./akte-verstehen";

export type AkteVerstaendnisKi = AkteVerstaendnis & {
  source: "ki" | "heuristik";
  meta?: {
    provider: string;
    model: string;
    kostenEur: number;
    tokens: { input: number; output: number };
  };
};

const SYSTEM_PROMPT = `Du bist Lana — KI-Klartext-Übersetzerin für medizinische Dokumente bei Shalem Care.

Empfänger:in ist eine pflegebedürftige Person oder Angehörige ohne Medizin-Vorbildung.

Strikte Regeln:
1. Nur den Inhalt des übergebenen Dokuments verwenden — niemals erfinden, ergänzen oder vermuten.
2. Maximale Satzlänge 15 Wörter. Aktiv statt Passiv. Direkte Anrede ("Sie", "Ihr Arzt sagt …").
3. Beschönige nichts, schüre keine Angst. Nüchtern und warm.
4. Erkläre Fachbegriffe am Wort, das im Text vorkommt — keine Lehrbuch-Definitionen.
5. Bei dringenden Hinweisen (Notfall, Fahruntauglichkeit, akute Komplikation): in "warnungen" hervorheben.
6. Antworte AUSSCHLIESSLICH als JSON nach Schema. Kein Markdown, keine Code-Fences, kein Begleittext.

Sprache: Deutsch.`;

function buildUserPrompt(text: string, typ: DokumentTyp): string {
  // Ein paar bekannte Glossar-Begriffe als Hinweis mitgeben (10 zufällige).
  const glossarHinweis = GLOSSAR.slice(0, 10)
    .map((g) => `${g.begriff}: ${g.klartext}`)
    .join(" · ");

  return [
    `Dokumenten-Typ: ${DOK_LABEL[typ]}`,
    "",
    "Text:",
    `"""${text.trim()}"""`,
    "",
    "Verfügbare Glossar-Beispiele (kannst du nutzen, musst nicht):",
    glossarHinweis,
    "",
    "Antworte als JSON mit diesem Schema:",
    "{",
    '  "zusammenfassung": "1-2 Sätze · was steht im Dokument",',
    '  "bedeutung": "2-4 Sätze · was es konkret für die Person bedeutet",',
    '  "handlungsschritte": [{"schritt": "string", "bis_wann": "string?", "wer": "string"}],',
    '  "fragen_fuer_arzt": ["string", ...],',
    '  "glossar": [{"begriff": "string", "klartext": "string", "warum_wichtig": "string?"}],',
    '  "warnungen": ["string", ...]',
    "}",
  ].join("\n");
}

type Parsed = {
  zusammenfassung: string;
  bedeutung: string;
  handlungsschritte: AkteVerstaendnis["handlungsschritte"];
  fragen_fuer_arzt: string[];
  glossar: AkteVerstaendnis["glossar"];
  warnungen: string[];
};

function parse(raw: string): Parsed | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned);
    if (!obj || typeof obj !== "object") return null;
    return {
      zusammenfassung: typeof obj.zusammenfassung === "string" ? obj.zusammenfassung : "",
      bedeutung: typeof obj.bedeutung === "string" ? obj.bedeutung : "",
      handlungsschritte: Array.isArray(obj.handlungsschritte)
        ? obj.handlungsschritte
            .filter((h: unknown): h is { schritt: string; bis_wann?: string; wer: string } =>
              !!h && typeof h === "object" && typeof (h as { schritt?: unknown }).schritt === "string",
            )
            .map((h: { schritt: string; bis_wann?: unknown; wer?: unknown }) => ({
              schritt: h.schritt,
              bis_wann: typeof h.bis_wann === "string" ? h.bis_wann : undefined,
              wer: typeof h.wer === "string" ? h.wer : "Sie selbst",
            }))
        : [],
      fragen_fuer_arzt: Array.isArray(obj.fragen_fuer_arzt)
        ? obj.fragen_fuer_arzt.filter((q: unknown): q is string => typeof q === "string")
        : [],
      glossar: Array.isArray(obj.glossar)
        ? obj.glossar
            .filter((g: unknown): g is { begriff: string; klartext: string; warum_wichtig?: string } =>
              !!g && typeof g === "object"
              && typeof (g as { begriff?: unknown }).begriff === "string"
              && typeof (g as { klartext?: unknown }).klartext === "string",
            )
            .map((g: { begriff: string; klartext: string; warum_wichtig?: unknown }) => ({
              begriff: g.begriff,
              klartext: g.klartext,
              warum_wichtig: typeof g.warum_wichtig === "string" ? g.warum_wichtig : undefined,
            }))
        : [],
      warnungen: Array.isArray(obj.warnungen)
        ? obj.warnungen.filter((w: unknown): w is string => typeof w === "string")
        : [],
    };
  } catch {
    return null;
  }
}

export async function verstehendeAkteMitKi(
  text: string,
  typ: DokumentTyp,
): Promise<AkteVerstaendnisKi> {
  const heuristik = verstehendeAkte(text, typ);

  if (!process.env.ANTHROPIC_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    return { ...heuristik, source: "heuristik" };
  }

  try {
    const provider = getAIProvider();
    const result = await provider.generate(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(text, typ) },
      ],
      { temperature: 0.2, maxTokens: 1500, jsonMode: true },
    );

    const parsed = parse(result.text);
    if (!parsed) return { ...heuristik, source: "heuristik" };

    // Reading-Level aus dem KI-Output: Fachbegriff-Anteil im Klartext.
    const woerter = parsed.zusammenfassung.split(/\s+/).length + parsed.bedeutung.split(/\s+/).length;
    const fachbegriffe = parsed.glossar.length;
    const reading_level = Math.max(0, Math.min(100, Math.round(100 - (fachbegriffe / Math.max(woerter, 1)) * 100 * 8)));

    return {
      dokument_typ: typ,
      zusammenfassung: parsed.zusammenfassung || heuristik.zusammenfassung,
      bedeutung: parsed.bedeutung || heuristik.bedeutung,
      handlungsschritte: parsed.handlungsschritte.length > 0 ? parsed.handlungsschritte : heuristik.handlungsschritte,
      fragen_fuer_arzt: parsed.fragen_fuer_arzt.length > 0 ? parsed.fragen_fuer_arzt : heuristik.fragen_fuer_arzt,
      glossar: parsed.glossar.length > 0 ? parsed.glossar : heuristik.glossar,
      warnungen: parsed.warnungen.length > 0 ? parsed.warnungen : heuristik.warnungen,
      reading_level,
      source: "ki",
      meta: {
        provider: result.provider,
        model: result.model,
        kostenEur: result.costEur,
        tokens: result.tokensUsed,
      },
    };
  } catch (err) {
    console.warn("[akte-verstehen-ki] Fallback auf Heuristik:", err);
    return { ...heuristik, source: "heuristik" };
  }
}
