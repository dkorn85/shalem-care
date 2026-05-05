// Anomalie-Sanftansage · "Wie geht's Mama heute?"
//
// Ein-Satz-Antwort an Angehörige. Vergleicht heute vs. rollende 14-Tage-
// Baseline. Wow-Mechanik: ambient reassurance — die Mitteilung ist primär
// beruhigend ("Heute war ein normaler Tag"), nicht alarmierend.
//
// Wenn etwas auffällt: diplomatisch, ohne Sorgen-Aufmachen-Formulierungen.

import { getAIProvider, type AIMessage } from "./provider";
import { listEvents, type AktivitaetEvent } from "../aktivitaet/feed";

export type AnomalieEingabe = {
  klientId: string;
  klientName: string;
  jetztISO?: string;
};

export type AnomalieErgebnis = {
  satz: string;                  // genau ein Satz, höchstens zwei
  tendenz: "ruhig" | "leicht_anders" | "auffaellig";
  ereignisseHeute: number;
  ereignisseSchnitt: number;
  voice: "lana";
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
};

const SYSTEM_PROMPT = `Du bist Lana, Stationsleitung in einer Pflege-Genossenschaft.
Eine Angehörige fragt: "Wie geht's Mama heute?"

Deine Antwort: GENAU EIN SATZ, höchstens zwei. Maximale Wärme, minimale
Worte. Niemals Diagnose-Sprache.

Regeln:
- Wenn alles im Rahmen ist: ruhige, kurze Beruhigung. "Heute war ein normaler
  Tag." oder "Sie hat gut gegessen und war beim Spaziergang."
- Wenn etwas auffällig anders ist als der 14-Tage-Schnitt: ehrlich nennen, aber
  diplomatisch. KEINE Sorgen-Aufmachen-Formulierungen wie "leider", "es gab
  einen Vorfall", "nicht so gut". Stattdessen: "Heute war sie etwas stiller als
  sonst — die Pflegerin hat das notiert."
- Schreibe nicht "Frau X" — sag "Ihre Mutter" oder "sie".
- Tendenz beurteilen:
  - "ruhig"           = innerhalb des 14-Tage-Normalbereichs, nichts auffälliges
  - "leicht_anders"   = leichte Abweichung, keine Eskalation, einfach so erwähnen
  - "auffaellig"      = klare Veränderung, Pflegekraft hat reagiert, Familie sollte Bescheid wissen
- Antworte AUSSCHLIESSLICH als JSON, kein Markdown:
  {
    "satz": "string · 1 Satz max 2",
    "tendenz": "ruhig|leicht_anders|auffaellig"
  }`;

function eventsAm(events: AktivitaetEvent[], klientId: string, datumISO: string): AktivitaetEvent[] {
  return events.filter((e) => e.klientId === klientId && e.zeitstempel.startsWith(datumISO));
}

export async function generiereAnomalieSatz(eingabe: AnomalieEingabe): Promise<AnomalieErgebnis> {
  const jetzt = eingabe.jetztISO ? new Date(eingabe.jetztISO) : new Date();
  const heuteISO = jetzt.toISOString().slice(0, 10);

  const alleEvents = listEvents(500);
  const heuteEvents = eventsAm(alleEvents, eingabe.klientId, heuteISO);

  // 14-Tage-Baseline für Anzahl Events pro Tag
  const baselineCounts: number[] = [];
  for (let i = 1; i <= 14; i++) {
    const tag = new Date(jetzt.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    baselineCounts.push(eventsAm(alleEvents, eingabe.klientId, tag).length);
  }
  const schnitt = baselineCounts.length > 0
    ? Math.round((baselineCounts.reduce((s, n) => s + n, 0) / baselineCounts.length) * 10) / 10
    : 0;

  const heuteEventsTxt = heuteEvents.length === 0
    ? "(keine Ereignisse heute dokumentiert)"
    : heuteEvents
        .map((e) => {
          const zeit = e.zeitstempel.slice(11, 16);
          return `${zeit} ${e.vonBeruf}: ${e.inhalt}`;
        })
        .join("\n");

  const userPrompt = [
    `Klient:in: ${eingabe.klientName}`,
    `Heute: ${heuteISO} (${heuteEvents.length} Ereignisse)`,
    `14-Tage-Schnitt: ${schnitt} Ereignisse pro Tag`,
    "",
    "Heute dokumentiert:",
    heuteEventsTxt,
  ].join("\n");

  const provider = getAIProvider();
  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  const result = await provider.generate(messages, {
    temperature: 0.4,
    maxTokens: 200,
    jsonMode: true,
  });

  const parsed = parse(result.text);

  return {
    satz: parsed.satz,
    tendenz: parsed.tendenz,
    ereignisseHeute: heuteEvents.length,
    ereignisseSchnitt: schnitt,
    voice: "lana",
    provider: result.provider,
    model: result.model,
    kostenEur: result.costEur,
    tokens: result.tokensUsed,
  };
}

function parse(raw: string): { satz: string; tendenz: AnomalieErgebnis["tendenz"] } {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned) as { satz?: unknown; tendenz?: unknown };
    const tendenz = obj.tendenz === "leicht_anders" || obj.tendenz === "auffaellig" ? obj.tendenz : "ruhig";
    return {
      satz: typeof obj.satz === "string" ? obj.satz : cleaned,
      tendenz,
    };
  } catch {
    return { satz: cleaned, tendenz: "ruhig" };
  }
}
