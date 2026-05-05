// Tagesfeed-Generator · "Was hat Mama heute gemacht?"
//
// Aggregiert Events aus dem Aktivitäts-Feed eines Tages für eine:n Klient:in
// und übersetzt sie in eine warme, 4-6-Satz-Mitteilung an Angehörige.
// Optional auch Konferenz-Erkenntnisse + Wundverlauf-Updates des Tages.

import { getAIProvider, type AIMessage } from "./provider";
import { listEvents, type AktivitaetEvent } from "../aktivitaet/feed";

export type TagesfeedEingabe = {
  klientId: string;
  klientName: string;
  datumISO: string;                // YYYY-MM-DD
};

export type TagesfeedErgebnis = {
  einTagInWenigenSaetzen: string;  // 4-6 Sätze, Familien-Ton
  highlights: string[];            // 3 Stichpunkte ("ist 8 Schritte gelaufen", "hat zur Suppe genickt")
  hinweise: string[];              // optional: was ist anders als sonst, was sollte besprochen werden
  ereignisAnzahl: number;          // wieviele Events wurden zusammengefasst
  voice: "lana";
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
};

const SYSTEM_PROMPT = `Du bist Lana, Stationsleitung in einer Pflege-Genossenschaft.
Du schreibst eine kurze Tages-Mitteilung an die Familie einer Klient:in — wie
eine vertraute Pflegekraft, die abends kurz anruft und erzählt, wie es heute
gelaufen ist.

Regeln:
- Warm, konkret, nicht klinisch. Sätze max. 15 Wörter.
- Kein Marketing-Sprech, keine Pflege-Fachbegriffe ohne Erklärung.
- Wenn der Tag ruhig war: das ehrlich so schreiben, nicht aufblähen.
- Keine Diagnosen, keine Sorgen-Aufmachen-Formulierungen — Beobachtungen.
- "Ihre Mutter" / "Frau X", nicht "die Patientin".
- Antworte AUSSCHLIESSLICH als JSON, kein Markdown daneben:
  {
    "einTagInWenigenSaetzen": "string · 4-6 Saetze, warmer Familien-Ton",
    "highlights": ["1-Satz-Beobachtung", "..."],
    "hinweise": ["optional, leer wenn nichts auffaellig"]
  }`;

function eventsAusTag(events: AktivitaetEvent[], klientId: string, datumISO: string): AktivitaetEvent[] {
  return events.filter((e) => {
    if (e.klientId !== klientId) return false;
    return e.zeitstempel.startsWith(datumISO);
  });
}

export async function generiereTagesfeed(eingabe: TagesfeedEingabe): Promise<TagesfeedErgebnis> {
  const alle = listEvents(500);
  const heute = eventsAusTag(alle, eingabe.klientId, eingabe.datumISO);

  const provider = getAIProvider();

  const eventsTxt = heute.length === 0
    ? "(Heute wurden keine Events dokumentiert. Schreibe einen ehrlichen, ruhigen Tagesbericht.)"
    : heute
        .map((e) => {
          const zeit = e.zeitstempel.slice(11, 16);
          const meta = e.meta && Object.keys(e.meta).length > 0
            ? ` [${Object.entries(e.meta).map(([k, v]) => `${k}: ${v}`).join(", ")}]`
            : "";
          return `${zeit} · ${e.vonName} (${e.vonBeruf}) · ${e.inhalt}${meta}`;
        })
        .join("\n");

  const userPrompt = [
    `Klient:in: ${eingabe.klientName}`,
    `Tag: ${eingabe.datumISO}`,
    "",
    "Was wurde dokumentiert (Zeit · Person · Beschreibung):",
    eventsTxt,
  ].join("\n");

  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  const result = await provider.generate(messages, {
    temperature: 0.4,
    maxTokens: 600,
    jsonMode: true,
  });

  const parsed = parse(result.text);

  return {
    einTagInWenigenSaetzen: parsed.einTagInWenigenSaetzen,
    highlights: parsed.highlights,
    hinweise: parsed.hinweise,
    ereignisAnzahl: heute.length,
    voice: "lana",
    provider: result.provider,
    model: result.model,
    kostenEur: result.costEur,
    tokens: result.tokensUsed,
  };
}

function parse(raw: string): {
  einTagInWenigenSaetzen: string;
  highlights: string[];
  hinweise: string[];
} {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned) as Record<string, unknown>;
    const arr = (k: string) =>
      Array.isArray(obj[k]) ? (obj[k] as unknown[]).filter((s): s is string => typeof s === "string") : [];
    return {
      einTagInWenigenSaetzen: typeof obj.einTagInWenigenSaetzen === "string" ? obj.einTagInWenigenSaetzen : cleaned,
      highlights: arr("highlights"),
      hinweise: arr("hinweise"),
    };
  } catch {
    return { einTagInWenigenSaetzen: cleaned, highlights: [], hinweise: [] };
  }
}
