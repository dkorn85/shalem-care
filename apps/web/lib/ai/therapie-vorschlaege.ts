// KI-Therapievorschläge für einen einzelnen Klienten.
//
// Strategie:
//   1. Deterministisch: zuerst werden zu den aktiven Risiken die kuratierten
//      Studien und Alternativ-Methoden aus lib/therapie/* zugeordnet.
//   2. KI: ergänzt mit individualisierter Begründung pro Klient
//      (warum gerade dieser Klient von dieser Methode profitieren würde).
//
// So bleibt jede Empfehlung nachvollziehbar zu Quellen verlinkt
// und die KI führt nur die individuelle Einschätzung durch.

import { getAIProvider } from "./provider";
import { evidenzFuerRisiken } from "../therapie/studien";
import { alternativenFuerRisiken } from "../therapie/alternativ";
import type { StudienEintrag } from "../therapie/studien";
import type { AlternativMethode } from "../therapie/alternativ";
import type { Klient } from "../hierarchy/types";
import type { RisikoTyp } from "../doku/types";

export type TherapieEmpfehlung = {
  klientId: string;
  // Schulmedizin-Empfehlungen mit Studien-Quellen
  evidenzbasiert: Array<{
    studie: StudienEintrag;
    individualisierung: string;        // KI-Anpassung an diesen Klient
  }>;
  // Komplementäre Methoden
  alternativ: Array<{
    methode: AlternativMethode;
    individualisierung: string;
  }>;
  warnungen: string[];                 // z.B. Wechselwirkungen, Kontraindikationen
  meta: {
    provider: string;
    model: string;
    aktualisiert: string;              // ISO Datum
  };
};

const SYSTEM_PROMPT = `Du bist eine KI-Assistenz für Pflegefachkräfte. Du wertest aktive Risiken und Klient-Kontext aus und individualisierst evidenzbasierte sowie komplementäre Therapie-Vorschläge.

Strikte Regeln:
1. Nur über Methoden urteilen, die dir explizit als Liste übergeben werden — keine Methoden erfinden.
2. Pro Methode nur eine kurze (1–2 Sätze) Individualisierung schreiben: warum gerade dieser Klient profitieren könnte, was zu beachten ist.
3. Wenn Kontraindikationen aus dem Klient-Profil erkennbar sind, in "warnungen" auflisten.
4. Keine medikamentösen Verordnungen — die macht der Arzt.
5. Sprache: Deutsch, knapp, faktisch.`;

export async function generateTherapieEmpfehlung(input: {
  klient: Klient;
  aktiveRisiken: RisikoTyp[];
  klientNotizen?: string;
  medikationsHinweise?: string[];      // z.B. ["Antikoagulation Apixaban", "Donepezil"]
}): Promise<TherapieEmpfehlung> {
  const evidenz = evidenzFuerRisiken(input.aktiveRisiken);
  const alternativen = alternativenFuerRisiken(input.aktiveRisiken);

  const ai = getAIProvider();

  const evidenzListe = evidenz.map((e, i) =>
    `[E${i + 1}] ${e.thema} — adressiert: ${e.risiken.join(", ")}. Empfehlungen: ${e.empfehlungen.slice(0, 3).join("; ")}`
  ).join("\n");

  const altListe = alternativen.map((m, i) =>
    `[A${i + 1}] ${m.name} (${m.tradition}) — ${m.beschreibung}. Indikation: ${m.indikationen.join("; ")}. Kontraindikationen: ${m.kontraindikationen.join("; ")}`
  ).join("\n");

  const userPrompt = [
    `Klient: ${input.klient.name}, Pflegegrad ${input.klient.pflegegrad}.`,
    input.klientNotizen ? `Hintergrund: ${input.klientNotizen}` : "",
    `Aktive Risiken: ${input.aktiveRisiken.length > 0 ? input.aktiveRisiken.join(", ") : "keine erfasst"}.`,
    input.medikationsHinweise && input.medikationsHinweise.length > 0
      ? `Medikation: ${input.medikationsHinweise.join(", ")}`
      : "",
    "",
    "Schulmedizinische Methoden (Evidenz-basiert):",
    evidenzListe || "— keine spezifischen —",
    "",
    "Komplementäre Methoden:",
    altListe || "— keine spezifischen —",
    "",
    "Aufgabe:",
    "Erzeuge JSON {",
    '  "evidenzbasiert": [{ "id": "E1", "individualisierung": "..." }, ...],',
    '  "alternativ":     [{ "id": "A1", "individualisierung": "..." }, ...],',
    '  "warnungen": ["..."]',
    "}",
    "Wähle 2–4 Empfehlungen pro Kategorie. Keine Code-Fences.",
  ].filter(Boolean).join("\n");

  const result = await ai.generate(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, temperature: 0.3, maxTokens: 1200 }
  );

  let parsed: any = result.json;
  if (!parsed && result.text) {
    const cleaned = result.text.replace(/```json\s*|\s*```/g, "").trim();
    try { parsed = JSON.parse(cleaned); } catch { parsed = null; }
  }

  // Mapping IDs zurück zu Studien/Methoden
  const evidenzMap: TherapieEmpfehlung["evidenzbasiert"] = [];
  const evIds: { id: string; individualisierung: string }[] =
    parsed && Array.isArray(parsed.evidenzbasiert) ? parsed.evidenzbasiert : [];
  for (const e of evIds) {
    const idx = parseInt((e.id ?? "").replace(/[^0-9]/g, ""), 10) - 1;
    const studie = evidenz[idx];
    if (studie) {
      evidenzMap.push({
        studie,
        individualisierung: typeof e.individualisierung === "string" ? e.individualisierung : "",
      });
    }
  }

  const alternativMap: TherapieEmpfehlung["alternativ"] = [];
  const altIds: { id: string; individualisierung: string }[] =
    parsed && Array.isArray(parsed.alternativ) ? parsed.alternativ : [];
  for (const a of altIds) {
    const idx = parseInt((a.id ?? "").replace(/[^0-9]/g, ""), 10) - 1;
    const methode = alternativen[idx];
    if (methode) {
      alternativMap.push({
        methode,
        individualisierung: typeof a.individualisierung === "string" ? a.individualisierung : "",
      });
    }
  }

  // Wenn KI nichts liefert: heuristische Auswahl
  if (evidenzMap.length === 0) {
    for (const e of evidenz.slice(0, 3)) {
      evidenzMap.push({
        studie: e,
        individualisierung: `Bei ${input.klient.name.split(" ")[0]} wegen ${e.risiken.filter((r) => input.aktiveRisiken.includes(r)).join(", ")} relevant.`,
      });
    }
  }
  if (alternativMap.length === 0) {
    for (const m of alternativen.slice(0, 3)) {
      alternativMap.push({
        methode: m,
        individualisierung: `${m.tradition === "kneipp" ? "Niedrigschwellig anwendbar" : "Sanftes ergänzendes Angebot"} — Vorlieben des Klienten erfragen.`,
      });
    }
  }

  return {
    klientId: input.klient.id,
    evidenzbasiert: evidenzMap,
    alternativ: alternativMap,
    warnungen: Array.isArray(parsed?.warnungen) ? parsed.warnungen : buildHeuristischeWarnungen(input),
    meta: {
      provider: result.provider,
      model: result.model,
      aktualisiert: new Date().toISOString(),
    },
  };
}

function buildHeuristischeWarnungen(input: Parameters<typeof generateTherapieEmpfehlung>[0]): string[] {
  const w: string[] = [];
  const meds = input.medikationsHinweise?.join(" ").toLowerCase() ?? "";
  if (meds.includes("apixaban") || meds.includes("rivaroxaban") || meds.includes("phenprocoumon") || meds.includes("marcumar")) {
    w.push("Antikoagulation aktiv — Akupunktur/Tuina nur mit Vorsicht, Hautpflege eher streichen als kneten.");
  }
  if (meds.includes("digitalis") || meds.includes("digoxin")) {
    w.push("Digitalis-Therapie — Lakritz-Phytotherapeutika meiden, Kalium-Status beachten.");
  }
  if (input.aktiveRisiken.includes("sturz")) {
    w.push("Sturzrisiko — Hydrotherapie/Wassertreten nur mit Anti-Rutsch und Begleitperson.");
  }
  return w;
}
