"use server";

// Server-Action: Therapie-Verlaufsbrief für die Krankenkasse aus
// strukturierten Sitzungs-Daten generieren. Heuristik-Fallback wenn
// kein KI-Provider konfiguriert ist.

import { getAIProvider } from "@/lib/ai/provider";
import { getTherapiePatient, tendenzVas, type TherapiePatient } from "./verlauf";

export type TherapieBriefResult =
  | {
      ok: true;
      brief: string;
      source: "ki" | "heuristik";
      meta?: { provider: string; model: string; kostenEur: number; tokens: { input: number; output: number } };
    }
  | { ok: false; error: string };

const SYSTEM_PROMPT = `Du bist Lana — KI-Hilfe für Therapie-Verlaufsberichte an die Krankenkasse.

Aufgabe: Ein knapper, fachlich präziser Verlaufsbericht (300-450 Wörter) auf Basis strukturierter Sitzungs-Daten. Adressat: Sachbearbeitung der GKV — sie braucht einen klaren Beleg, dass Folge-Verordnung sinnvoll ist.

Pflicht-Bestandteile:
1. Anrede + Patient-Kopf (Name, geb., Diagnose ICD).
2. Verordnung + bisherige Sitzungs-Anzahl (in HMV-Code-Sprache).
3. Verlauf objektiv: Erst-Werte vs. aktuelle Werte für VAS, ROM, MRC. Tendenz benennen.
4. ICF-Bezug: 1-2 ICF-Codes mit Bewertung erwähnen.
5. SMART-Ziele kurz: was erreicht, was noch offen.
6. Empfehlung: Folge-Verordnung sinnvoll? Wenn ja, welche Anzahl + ggf. ergänzendes Heilmittel.
7. Schlussformel mit Therapeut:innen-Unterschrift-Platz.

Strikte Regeln:
- Keine Daten erfinden — nur was im JSON steht.
- Sachlich, ohne Marketing-Sprache.
- Wenn keine Tendenz erkennbar (z.B. bei Plateau): ehrlich benennen.
- Format: durchgehender Brief in Deutsch, Absätze, keine Bullet-Points im Kern, kein Markdown.`;

function buildUserPrompt(p: TherapiePatient): string {
  const sitz = p.termine.length;
  const erst = p.termine[0];
  const letzte = p.termine[sitz - 1];

  return [
    `Patient: ${p.name}, geb. ${p.geburt}`,
    `Diagnose: ${p.diagnoseIcd} · ${p.diagnoseKlartext}`,
    `Region: ${p.region}`,
    `Verordnung: ${p.vo}, HMV-Code ${p.hmvCode}`,
    `Bisherige Sitzungen: ${p.fortschritt} (${sitz} dokumentiert) · Stand: ${p.stand}`,
    "",
    "Sitzungs-Daten:",
    p.termine.map((t) => {
      const teile = [`${t.datumISO}: VAS ${t.vas}/10`, t.romGrad > 0 ? `ROM ${t.romGrad}°` : null, `MRC ${t.kraftMrc}/5`];
      if (t.notiz) teile.push(`Notiz: ${t.notiz}`);
      return "  - " + teile.filter(Boolean).join(" · ");
    }).join("\n"),
    "",
    erst && letzte ? `Erstwerte → aktuell: VAS ${erst.vas}→${letzte.vas} · ROM ${erst.romGrad}°→${letzte.romGrad}° · MRC ${erst.kraftMrc}→${letzte.kraftMrc}` : "",
    "",
    "ICF-Bezug:",
    p.icfCodes.map((c) => `  - ${c.code}: ${c.label}`).join("\n"),
    "",
    "Therapie-Ziele (SMART):",
    p.smartZiele.map((z) => `  - ${z}`).join("\n"),
    "",
    `Tendenz Schmerz: ${tendenzVas(p.termine)}`,
    "",
    "Schreibe den Verlaufsbericht.",
  ].filter(Boolean).join("\n");
}

function heuristikBrief(p: TherapiePatient): string {
  const sitz = p.termine.length;
  if (sitz === 0) {
    return [
      `Sehr geehrte Damen und Herren,`,
      ``,
      `${p.name} (geb. ${p.geburt}, ${p.diagnoseIcd} · ${p.diagnoseKlartext}) ist im Erstgespräch. Verordnung: ${p.vo}.`,
      ``,
      `Ein Verlaufsbericht folgt nach den ersten Sitzungen.`,
      ``,
      `Mit freundlichen Grüßen,`,
      `Sebastian Rauer · Praxis Steglitz`,
    ].join("\n");
  }

  const erst = p.termine[0];
  const letzte = p.termine[sitz - 1];
  const tendenz = tendenzVas(p.termine);
  const dVas = letzte.vas - erst.vas;
  const dRom = letzte.romGrad - erst.romGrad;
  const dKraft = letzte.kraftMrc - erst.kraftMrc;

  const verbessert = (dVas < 0 || dRom > 0 || dKraft > 0);
  const empfehlung = verbessert
    ? `Wir empfehlen die Fortsetzung der Therapie mit einer Folge-Verordnung.`
    : `Aktuell zeigt sich ein Plateau. Wir empfehlen eine fachärztliche Re-Evaluation, ob eine Anpassung der Therapie sinnvoll ist.`;

  return [
    `Sehr geehrte Damen und Herren,`,
    ``,
    `betreffend ${p.name} (geb. ${p.geburt}, Diagnose ${p.diagnoseIcd} · ${p.diagnoseKlartext}, Region ${p.region}):`,
    ``,
    `Im Rahmen der Verordnung „${p.vo}" (HMV-Code ${p.hmvCode}) wurden bislang ${sitz} Sitzungen durchgeführt (Stand ${p.fortschritt}). Der Therapieverlauf zeigt eine ${tendenz === "fallend" ? "deutliche Schmerzreduktion" : tendenz === "steigend" ? "Schmerz-Zunahme, die wir engmaschig beobachten" : "stabile Symptomlage"}.`,
    ``,
    `Objektive Verlaufsdaten:`,
    `Schmerz nach VAS verlief von ${erst.vas}/10 auf aktuell ${letzte.vas}/10 (${dVas >= 0 ? "+" : ""}${dVas}). ${letzte.romGrad > 0 ? `Bewegungsumfang ROM von ${erst.romGrad}° auf ${letzte.romGrad}° (${dRom >= 0 ? "+" : ""}${dRom}°). ` : ""}Muskelkraft nach MRC von ${erst.kraftMrc}/5 auf ${letzte.kraftMrc}/5.`,
    ``,
    `Funktionell (ICF-Bezug): ${p.icfCodes.slice(0, 2).map((c) => `${c.code} (${c.label})`).join(" und ")} sind weiterhin therapierelevant.`,
    ``,
    `Therapie-Ziele:`,
    p.smartZiele.map((z) => `  • ${z}`).join("\n"),
    ``,
    empfehlung,
    ``,
    `Mit freundlichen Grüßen,`,
    `Sebastian Rauer · Praxis Steglitz`,
    `Stand: ${new Date().toISOString().slice(0, 10)}`,
  ].join("\n");
}

export async function verfasseTherapieBrief(patientId: string): Promise<TherapieBriefResult> {
  const p = getTherapiePatient(patientId);
  if (!p) return { ok: false, error: "Patient:in nicht gefunden." };

  const fallback = heuristikBrief(p);

  if (!process.env.ANTHROPIC_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    return { ok: true, brief: fallback, source: "heuristik" };
  }

  try {
    const provider = getAIProvider();
    const result = await provider.generate(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(p) },
      ],
      { temperature: 0.3, maxTokens: 800 },
    );
    const text = result.text.trim();
    if (text.length < 80) {
      return { ok: true, brief: fallback, source: "heuristik" };
    }
    return {
      ok: true,
      brief: text,
      source: "ki",
      meta: {
        provider: result.provider,
        model: result.model,
        kostenEur: result.costEur,
        tokens: result.tokensUsed,
      },
    };
  } catch (err) {
    console.warn("[therapie-brief-ki] Fallback auf Heuristik:", err);
    return { ok: true, brief: fallback, source: "heuristik" };
  }
}
