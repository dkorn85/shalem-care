// Konferenz-Briefing für Klient:innen + Angehörige.
//
// Eingabe: Konferenz-Objekt (Anlass, Teilnehmende, Beschlüsse, Live-Notizen).
// Ausgabe: 4-6-Satz-Briefing in einfacher Sprache, plus Liste der Beschlüsse
// in Klient-Worten ("Was wir vereinbart haben"), plus drei optionale
// Rückfragen für die nächste Begegnung mit der Bezugspflegekraft.
//
// Das ist ein Patient-Empowerment-Feature — die Klient:in soll zum ersten
// Mal verstehen, was bei *ihrer* Konferenz besprochen wurde, ohne in den
// Beschlussprotokollen einer Sozialarbeiter:in zu graben.

import { getAIProvider, type AIMessage } from "./provider";
import type { Konferenz } from "../konferenz/store";

export type KlientBriefing = {
  zusammenfassung: string;        // 4-6 Sätze, "Sie"-Form, warm aber nüchtern
  vereinbarungen: { was: string; klar: string }[];  // Beschluss + Klartext-Variante
  fragen_fuer_die_pflegekraft: string[];
  voice: "lana" | "dennis";
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
};

const SYSTEM_PROMPT = `Du bist Lana, Stationsleitung in einer Pflege-Genossenschaft.
Du fasst eine soeben beendete interdisziplinäre Hilfeplan-Konferenz für die
betroffene Klient:in oder ihre Angehörigen zusammen.

Regeln:
- Sprich die Person direkt an ("Sie", "Ihre Konferenz", "wir haben besprochen").
- Sätze max. 15 Wörter, keine Fachbegriffe ohne Erklärung in Klammern.
- Beschönige nichts, schüre keine Angst. Nüchtern, warm.
- Die "Vereinbarungen" sind die echten Beschlüsse, aber laienverständlich umformuliert.
- Die "Fragen für die Pflegekraft" sind drei kurze Fragen, die die Person
  stellen könnte — keine Ja/Nein-Fragen, sondern Klärungs-Fragen.
- Antworte AUSSCHLIESSLICH als JSON, kein Markdown, kein Fließtext daneben:
  {
    "zusammenfassung": "string · 4-6 Saetze",
    "vereinbarungen": [{"was": "Original-Beschluss", "klar": "in einfacher Sprache"}],
    "fragen_fuer_die_pflegekraft": ["Frage 1", "Frage 2", "Frage 3"]
  }`;

export async function generiereKonferenzBriefing(konf: Konferenz): Promise<KlientBriefing> {
  const provider = getAIProvider();

  const teilnehmende = konf.teilnehmende.map((t) => `${t.name} (${t.beruf})`).join(", ");
  const beschluesseTxt = konf.beschluesse.length === 0
    ? "(Keine konkreten Beschlüsse protokolliert.)"
    : konf.beschluesse
        .map((b, i) =>
          `${i + 1}. ${b.was} · zuständig: ${b.wer}${b.bis ? ` · bis: ${b.bis}` : ""}${b.status ? ` · Status: ${b.status}` : ""}`,
        )
        .join("\n");

  const userPrompt = [
    `Konferenz-Anlass: ${konf.anlass}`,
    `Klient:in: ${konf.klientName}`,
    `Datum: ${konf.geplantAm}`,
    `Teilnehmende: ${teilnehmende}`,
    "",
    "Beschlüsse:",
    beschluesseTxt,
    "",
    konf.liveNotizen ? `Live-Notizen während der Konferenz:\n${konf.liveNotizen}` : "(Keine Live-Notizen)",
  ].join("\n");

  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  const result = await provider.generate(messages, {
    temperature: 0.3,
    maxTokens: 900,
    jsonMode: true,
  });

  const parsed = parse(result.text);

  return {
    zusammenfassung: parsed.zusammenfassung,
    vereinbarungen: parsed.vereinbarungen,
    fragen_fuer_die_pflegekraft: parsed.fragen,
    voice: "lana",
    provider: result.provider,
    model: result.model,
    kostenEur: result.costEur,
    tokens: result.tokensUsed,
  };
}

function parse(raw: string): {
  zusammenfassung: string;
  vereinbarungen: { was: string; klar: string }[];
  fragen: string[];
} {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned) as Record<string, unknown>;
    return {
      zusammenfassung: typeof obj.zusammenfassung === "string" ? obj.zusammenfassung : "",
      vereinbarungen: Array.isArray(obj.vereinbarungen)
        ? (obj.vereinbarungen as { was?: unknown; klar?: unknown }[])
            .filter((v) => typeof v.was === "string" && typeof v.klar === "string")
            .map((v) => ({ was: v.was as string, klar: v.klar as string }))
        : [],
      fragen: Array.isArray(obj.fragen_fuer_die_pflegekraft)
        ? (obj.fragen_fuer_die_pflegekraft as unknown[]).filter((s): s is string => typeof s === "string")
        : [],
    };
  } catch {
    return { zusammenfassung: cleaned, vereinbarungen: [], fragen: [] };
  }
}
