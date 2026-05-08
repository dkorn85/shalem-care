"use server";

// Server-Action: Tages-Speiseplan-Vorschlag aus Klient-Bedarf + Vorrat.
// Nutzt den Wochenplan-Katalog als Inspirations-Pool und passt Mahlzeiten
// an Kostform-Kombination + Allergen-Ausschlüsse an.

import { getAIProvider } from "@/lib/ai/provider";
import {
  WOCHENPLAN, KOSTFORM_LABEL, ALLERGEN_LABEL, MAHLZEIT_LABEL, MAHLZEIT_ZEIT,
  type Kostform, type Mahlzeit, type Allergen,
} from "./wochenplan";

export type SpeiseplanInput = {
  kostformen: Kostform[];      // 1+ Kostform-Anforderungen
  ausschluss: Allergen[];      // Allergen-Ausschlüsse (z.B. Lachs raus)
  hinweise?: string;           // freier Klartext-Hinweis
};

export type Tagesvorschlag = {
  mahlzeit: Mahlzeit;
  zeit: string;
  was: string;
  begruendung: string;
  kalorien: number;
};

export type SpeiseplanResult =
  | {
      ok: true;
      vorschlaege: Tagesvorschlag[];
      kcalGesamt: number;
      source: "ki" | "heuristik";
      meta?: { provider: string; model: string; kostenEur: number; tokens: { input: number; output: number } };
    }
  | { ok: false; error: string };

const ALLE_MAHLZEITEN: Mahlzeit[] = ["fruehstueck", "zwischen-vm", "mittag", "kaffee", "abendbrot"];

const SYSTEM_PROMPT = `Du bist Lana — KI-Hilfe für Speiseplanung in Pflege-/Altenheimen.

Aufgabe: Aus Klient-Kostform-Anforderungen und Allergen-Ausschlüssen einen Tages-Speiseplan vorschlagen.

Pflicht:
1. 5 Mahlzeiten: Frühstück, Zwischenmahl-VM, Mittagessen, Kaffeezeit, Abendbrot.
2. Pro Mahlzeit:
   - was (konkrete Mahlzeit, deutsch, ggf. zwei Komponenten)
   - begruendung (kurz, warum es passt: Kostform-Bezug)
   - kalorien (geschätzte Zahl 100-700 kcal)
3. Tages-Gesamt-kcal soll im Bereich 1600-2400 sein (ggf. höher bei Hochkalorisch-Anforderung).

Strikte Regeln:
- Allergene aus dem Ausschluss-Set NIEMALS vorschlagen.
- Wenn Kostform "dysphagie": nur Konsistenz-angepasste, weiche/pürierbare Speisen.
- Wenn "diabetes": niedriger Zuckerzusatz, keine Süßspeisen ohne Begründung.
- Wenn "vegetarisch": kein Fleisch/Fisch.
- DGE-orientierte Vollkost-Logik.
- Antwort AUSSCHLIESSLICH als JSON. Kein Markdown.

Schema:
{
  "vorschlaege": [
    { "mahlzeit": "fruehstueck", "was": "...", "begruendung": "...", "kalorien": 380 }
  ]
}`;

function buildUserPrompt(input: SpeiseplanInput): string {
  return [
    `Kostform-Anforderungen: ${input.kostformen.map((k) => KOSTFORM_LABEL[k]).join(" + ")}`,
    `Allergen-Ausschlüsse: ${input.ausschluss.length === 0 ? "keine" : input.ausschluss.map((a) => `${a} (${ALLERGEN_LABEL[a]})`).join(", ")}`,
    input.hinweise?.trim() ? `Zusatz-Hinweise: ${input.hinweise.trim()}` : "",
    "",
    "Inspirations-Pool (Mo-So aus dem aktuellen Wochenplan, du musst dich daran NICHT halten — kannst aber Mahlzeiten variieren):",
    WOCHENPLAN.slice(0, 14).map((w) => `  - ${MAHLZEIT_LABEL[w.mahlzeit]}: ${w.was} [${w.kalorien} kcal, Allergene ${w.allergene.join(",")}]`).join("\n"),
    "",
    "Schlage einen Tagesplan vor.",
  ].filter(Boolean).join("\n");
}

function heuristikVorschlag(input: SpeiseplanInput): Tagesvorschlag[] {
  const out: Tagesvorschlag[] = [];
  for (const m of ALLE_MAHLZEITEN) {
    // Pool: alle Wochenplan-Einträge dieser Mahlzeit
    const pool = WOCHENPLAN.filter((w) => w.mahlzeit === m);
    // Filter: passt zu mindestens einer geforderten Kostform (oder keine geforderte = alle)
    const passend = input.kostformen.length === 0
      ? pool
      : pool.filter((w) => input.kostformen.some((k) => w.passendFuer.includes(k)));
    // Allergen-Ausschluss: keiner darf treffen
    const sicher = passend.filter((w) => !w.allergene.some((a) => input.ausschluss.includes(a)));
    const kandidaten = sicher.length > 0 ? sicher : passend;
    // Bei Hochkalor: kalorienreichste, sonst mittlere wählen
    const ist = input.kostformen.includes("hochkalor") ? [...kandidaten].sort((a, b) => b.kalorien - a.kalorien)[0]
              : input.kostformen.includes("diabetes")  ? [...kandidaten].sort((a, b) => a.kalorien - b.kalorien)[0]
              : kandidaten[Math.floor(kandidaten.length / 2)];
    if (!ist) continue;
    const kostHinweise = input.kostformen
      .filter((k) => ist.passendFuer.includes(k))
      .map((k) => KOSTFORM_LABEL[k]);
    const begruendung = kostHinweise.length > 0
      ? `Passt zu ${kostHinweise.join(" + ")}.`
      : "Vollkost-tauglich.";
    out.push({
      mahlzeit: m,
      zeit: MAHLZEIT_ZEIT[m],
      was: ist.was,
      begruendung,
      kalorien: ist.kalorien,
    });
  }
  return out;
}

function parseKi(raw: string): Tagesvorschlag[] | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned);
    if (!obj || !Array.isArray(obj.vorschlaege)) return null;
    const valide: Tagesvorschlag[] = [];
    for (const v of obj.vorschlaege) {
      if (typeof v !== "object" || !v) continue;
      const { mahlzeit, was, begruendung, kalorien } = v as Record<string, unknown>;
      if (typeof mahlzeit !== "string" || !ALLE_MAHLZEITEN.includes(mahlzeit as Mahlzeit)) continue;
      if (typeof was !== "string" || was.trim().length === 0) continue;
      if (typeof kalorien !== "number" || kalorien < 50 || kalorien > 1500) continue;
      valide.push({
        mahlzeit: mahlzeit as Mahlzeit,
        zeit: MAHLZEIT_ZEIT[mahlzeit as Mahlzeit],
        was: was.trim(),
        begruendung: typeof begruendung === "string" ? begruendung : "",
        kalorien: Math.round(kalorien),
      });
    }
    return valide;
  } catch {
    return null;
  }
}

export async function vorschlagSpeiseplan(input: SpeiseplanInput): Promise<SpeiseplanResult> {
  if (input.kostformen.length === 0) {
    return { ok: false, error: "Mindestens eine Kostform auswählen." };
  }

  const fallback = heuristikVorschlag(input);
  const fallbackKcal = fallback.reduce((s, v) => s + v.kalorien, 0);

  if (!process.env.ANTHROPIC_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    return { ok: true, vorschlaege: fallback, kcalGesamt: fallbackKcal, source: "heuristik" };
  }

  try {
    const provider = getAIProvider();
    const result = await provider.generate(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      { temperature: 0.5, maxTokens: 1100, jsonMode: true },
    );
    const parsed = parseKi(result.text);
    if (!parsed || parsed.length < 3) {
      return { ok: true, vorschlaege: fallback, kcalGesamt: fallbackKcal, source: "heuristik" };
    }
    const kcal = parsed.reduce((s, v) => s + v.kalorien, 0);
    return {
      ok: true,
      vorschlaege: parsed,
      kcalGesamt: kcal,
      source: "ki",
      meta: {
        provider: result.provider,
        model: result.model,
        kostenEur: result.costEur,
        tokens: result.tokensUsed,
      },
    };
  } catch (err) {
    console.warn("[speiseplan-ki] Fallback auf Heuristik:", err);
    return { ok: true, vorschlaege: fallback, kcalGesamt: fallbackKcal, source: "heuristik" };
  }
}
