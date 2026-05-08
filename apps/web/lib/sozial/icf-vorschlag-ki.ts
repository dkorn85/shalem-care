"use server";

// Server-Action: ICF-Code-Vorschläge aus Klartext-Beobachtung.
// Beispiel-Input: "Hr. Schmidt kann seit dem Schlaganfall nur mit
// Stock 5 Meter gehen, das Bad-Bett-Wechsel braucht zwei Personen,
// er versteht alles, antwortet aber langsam."
// Output: 4-7 ICF-Codes mit Bewertung 0-4 + Begründung.

import { getAIProvider } from "@/lib/ai/provider";
import type { IcfDomain, IcfEintrag } from "./hilfeplan-store";

export type IcfVorschlag = IcfEintrag & {
  begruendung: string;
};

export type IcfVorschlagResult =
  | {
      ok: true;
      vorschlaege: IcfVorschlag[];
      source: "ki" | "heuristik";
      meta?: { provider: string; model: string; kostenEur: number; tokens: { input: number; output: number } };
    }
  | { ok: false; error: string };

const SYSTEM_PROMPT = `Du bist Lana — KI-Hilfe für ICF-Klassifikation in der Sozialarbeit / Heilerziehung.

Aufgabe: Aus einer Klartext-Beobachtung passende ICF-Codes vorschlagen (Internationale Klassifikation der Funktionsfähigkeit, Behinderung und Gesundheit · WHO 2001).

Vorgehen:
1. Beobachtung verstehen — welche Domains sind betroffen?
2. 4-7 ICF-Codes vorschlagen, gemischt aus:
   - b · Körperfunktionen (mental, sensorisch, Sprache, Stimme, Schmerz, Bewegung, Stoffwechsel)
   - s · Körperstrukturen (selten — nur wenn explizit relevant)
   - d · Aktivitäten + Teilhabe (Lernen, Aufgaben, Mobilität, Selbstversorgung, Haushalt, Beziehungen, Bildung, Arbeit, Gemeinschaft)
   - e · Umweltfaktoren (Produkte/Technik, natürliche Umwelt, Unterstützung, Einstellungen, Dienste/Politik)
3. Pro Code eine Bewertung 0-4: 0 nicht beeinträchtigt · 1 leicht · 2 mäßig · 3 erheblich · 4 voll beeinträchtigt
4. Begründung pro Code: 1 kurzer Satz, der den Bezug zur Beobachtung herstellt.

Strikte Regeln:
- Nur Codes vorschlagen, deren Beeinträchtigung in der Beobachtung wirklich erkennbar ist.
- Echte ICF-Codes verwenden (z.B. b730, d450, e310). Kein Erfinden.
- Bewertung konservativ — bei Unsicherheit eine Stufe niedriger.
- Antwort AUSSCHLIESSLICH als JSON nach dem Schema. Kein Markdown, keine Code-Fences.

Schema:
{
  "vorschlaege": [
    { "code": "d450", "label": "Gehen", "domain": "d", "bewertung": 3, "begruendung": "..." }
  ]
}`;

function buildUserPrompt(beobachtung: string): string {
  return [
    "Beobachtung:",
    `"""${beobachtung.trim()}"""`,
    "",
    "Schlage passende ICF-Codes vor.",
  ].join("\n");
}

const REGEX: { rx: RegExp; eintrag: IcfVorschlag }[] = [
  { rx: /\b(geh(en)?|laufen|stehen|stock|rollator|treppe)\b/i,                eintrag: { code: "d450", label: "Gehen",                       domain: "d", bewertung: 3, begruendung: "Mobilitäts-Einschränkung in der Beobachtung benannt." } },
  { rx: /\b(transfer|aufstehen|bett-?bett|umsetzen|stand[- ]?bett)\b/i,        eintrag: { code: "d420", label: "Sich verlagern",              domain: "d", bewertung: 3, begruendung: "Transfer benötigt Unterstützung." } },
  { rx: /\b(schmerz|weh\w+|schmerzhaft)\b/i,                                    eintrag: { code: "b280", label: "Schmerz",                     domain: "b", bewertung: 2, begruendung: "Schmerzen werden in der Beobachtung erwähnt." } },
  { rx: /\b(spr(echen|ache)|verständigen|stottern|stumm|aphas)/i,               eintrag: { code: "b167", label: "Mentale Sprachfunktionen",     domain: "b", bewertung: 2, begruendung: "Sprachliche Auffälligkeit benannt." } },
  { rx: /\b(verstehen|kapieren|begreif\w+|kognitiv|merk)/i,                     eintrag: { code: "b164", label: "Höhere kognitive Funktionen",  domain: "b", bewertung: 2, begruendung: "Kognitive Verarbeitung verlangsamt oder eingeschränkt." } },
  { rx: /\b(gedächtnis|vergiss|vergessen|erinner)/i,                            eintrag: { code: "b144", label: "Funktionen des Gedächtnisses", domain: "b", bewertung: 2, begruendung: "Gedächtnis-Anhaltspunkte in der Beobachtung." } },
  { rx: /\b(wasch|dusch|bad|hygien)/i,                                          eintrag: { code: "d510", label: "Sich waschen",                 domain: "d", bewertung: 2, begruendung: "Selbstversorgung in der Körperpflege beeinträchtigt." } },
  { rx: /\b(anzieh|kleide|hose|hemd|schuh)/i,                                   eintrag: { code: "d540", label: "Sich kleiden",                 domain: "d", bewertung: 2, begruendung: "Ankleide-Aktivität braucht Unterstützung." } },
  { rx: /\b(essen|trinken|mahlzeit|schluck)/i,                                  eintrag: { code: "d550", label: "Essen",                        domain: "d", bewertung: 2, begruendung: "Nahrungs-/Flüssigkeits-Aufnahme erschwert." } },
  { rx: /\b(arbeit|beruf|job|stell|wfbm)/i,                                     eintrag: { code: "d850", label: "Bezahlte Tätigkeit ausüben",   domain: "d", bewertung: 3, begruendung: "Erwerbstätigkeit aktuell eingeschränkt." } },
  { rx: /\b(familie|tochter|sohn|partner|ehemann|ehefrau|großmutter|mutter)\b/i, eintrag: { code: "e310", label: "Engste Familie",              domain: "e", bewertung: 1, begruendung: "Familiäre Unterstützung in der Beobachtung sichtbar." } },
  { rx: /\b(wohn(ung)?|treppe|bad-?umbau|barrier)/i,                             eintrag: { code: "e155", label: "Wohnverhältnisse",            domain: "e", bewertung: 3, begruendung: "Wohnumfeld passt aktuell nicht zum Bedarf." } },
  { rx: /\b(stress|überfor|nervös|reiz|panik|schlaf)/i,                          eintrag: { code: "d240", label: "Stress + Anforderungen bewältigen", domain: "d", bewertung: 3, begruendung: "Stress-Belastung in der Beobachtung deutlich." } },
  { rx: /\b(kontakt|freund|sozial|gemeinschaft|isol)/i,                          eintrag: { code: "d910", label: "Gemeinschaftsleben",           domain: "d", bewertung: 2, begruendung: "Soziale Teilhabe ist Thema." } },
  { rx: /\b(geld|finanz|miete|schuld|grundsicher|sgb)/i,                         eintrag: { code: "e165", label: "Vermögenswerte",              domain: "e", bewertung: 4, begruendung: "Finanzielle Unsicherheit ist Hauptbelastung." } },
];

function heuristikVorschlaege(beobachtung: string): IcfVorschlag[] {
  const treffer = REGEX.filter((r) => r.rx.test(beobachtung)).map((r) => r.eintrag);
  // dedup nach code
  const seen = new Set<string>();
  const dedup: IcfVorschlag[] = [];
  for (const e of treffer) {
    if (!seen.has(e.code)) {
      seen.add(e.code);
      dedup.push(e);
    }
  }
  return dedup.slice(0, 7);
}

function parseKi(raw: string): IcfVorschlag[] | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned);
    if (!obj || !Array.isArray(obj.vorschlaege)) return null;
    const out: IcfVorschlag[] = [];
    for (const v of obj.vorschlaege) {
      if (typeof v !== "object" || !v) continue;
      const { code, label, domain, bewertung, begruendung } = v as Record<string, unknown>;
      if (typeof code !== "string" || typeof label !== "string") continue;
      if (typeof bewertung !== "number" || bewertung < 0 || bewertung > 4) continue;
      if (domain !== "b" && domain !== "s" && domain !== "d" && domain !== "e") continue;
      out.push({
        code,
        label,
        domain: domain as IcfDomain,
        bewertung: Math.round(bewertung) as 0 | 1 | 2 | 3 | 4,
        begruendung: typeof begruendung === "string" ? begruendung : "",
      });
    }
    return out;
  } catch {
    return null;
  }
}

export async function vorschlagIcfCodes(beobachtung: string): Promise<IcfVorschlagResult> {
  const text = beobachtung.trim();
  if (text.length < 20) return { ok: false, error: "Beobachtung zu kurz — mindestens ein, zwei Sätze bitte." };

  const fallback = heuristikVorschlaege(text);

  if (!process.env.ANTHROPIC_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    return { ok: true, vorschlaege: fallback, source: "heuristik" };
  }

  try {
    const provider = getAIProvider();
    const result = await provider.generate(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(text) },
      ],
      { temperature: 0.2, maxTokens: 700, jsonMode: true },
    );
    const parsed = parseKi(result.text);
    if (!parsed || parsed.length === 0) {
      return { ok: true, vorschlaege: fallback, source: "heuristik" };
    }
    return {
      ok: true,
      vorschlaege: parsed.slice(0, 7),
      source: "ki",
      meta: {
        provider: result.provider,
        model: result.model,
        kostenEur: result.costEur,
        tokens: result.tokensUsed,
      },
    };
  } catch (err) {
    console.warn("[icf-vorschlag-ki] Fallback auf Heuristik:", err);
    return { ok: true, vorschlaege: fallback, source: "heuristik" };
  }
}
