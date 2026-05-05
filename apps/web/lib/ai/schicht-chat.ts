// Schicht-Chat-Bot · KI-Helfer im Gruppenchat einer Schicht.
//
// Mechanik: Wenn jemand "@lana <frage>" oder "@bot <frage>" schreibt,
// liest der Bot die letzten N Nachrichten als Kontext und antwortet
// kurz, hilfreich, fachlich. Pflegerisch korrekt, ohne Diagnose-Ton.
//
// Kontext-Quellen:
//   - die letzten Chat-Nachrichten (übergeben vom Caller)
//   - aktive Konferenzen für die Klient:innen der Caseload
//   - offene Beschluesse
//
// Antwort-Stil: max 4 Sätze, "du" zu Pflegekräften, klare Schritte.

import { getAIProvider, type AIMessage } from "./provider";

export type ChatNachricht = {
  von: string;            // Name oder "Lana (Bot)"
  zeit: string;           // "14:32"
  inhalt: string;
  istBot?: boolean;
};

export type SchichtChatEingabe = {
  kontext: ChatNachricht[];     // letzte ~20 Nachrichten
  frage: string;                // die @lana-Frage
  schichtThema?: string;        // z.B. "Frühschicht Pulmo 3B Mo 5.5."
};

export type SchichtChatErgebnis = {
  antwort: string;
  tipps: string[];              // 0-3 weiterführende Tipps
  voice: "lana";
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
};

const SYSTEM_PROMPT = `Du bist Lana — der KI-Helfer im Schicht-Gruppenchat einer
Pflege-Genossenschaft. Du wirst per @lana oder @bot gerufen.

Stil:
- Pflegekraft an Pflegekraft, "du", warm aber knapp.
- Max 4 Sätze in der Antwort.
- KEINE medizinischen Diagnosen. KEINE Verordnungs-Empfehlungen.
- Bei Symptom-Fragen: konkrete Pflege-Schritte (Lagerung, Beobachtung, Doku) +
  Hinweis "Bei Verschlechterung: Bezugspflege oder Arzt-Kontakt".
- Bei Doku-/Workflow-Fragen: präzise auf Shalem-Module verweisen
  (Cockpit-Pfade wie /klient/akte, /admin/dienstplan).
- Bei Stimmung im Chat (Müdigkeit, Frust): kurz anerkennen, einen
  konkreten nächsten Schritt nennen, dann Stopp.
- Tipps (0-3 Stichpunkte): nur wenn wirklich relevant. Lieber leer lassen.

Antworte AUSSCHLIESSLICH als JSON, nichts anderes:
{
  "antwort": "string · max 4 Saetze",
  "tipps": ["1-Zeilen-Tipp", "..."]
}`;

export async function generiereChatAntwort(eingabe: SchichtChatEingabe): Promise<SchichtChatErgebnis> {
  const provider = getAIProvider();

  const kontextTxt = eingabe.kontext.length === 0
    ? "(noch keine vorherigen Nachrichten)"
    : eingabe.kontext.map((n) => `[${n.zeit}] ${n.von}${n.istBot ? " (Bot)" : ""}: ${n.inhalt}`).join("\n");

  const userPrompt = [
    eingabe.schichtThema ? `Schicht: ${eingabe.schichtThema}` : null,
    "",
    "Letzter Chat-Verlauf:",
    kontextTxt,
    "",
    `Aktuelle Frage an dich: ${eingabe.frage}`,
  ].filter((x) => x !== null).join("\n");

  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  const result = await provider.generate(messages, {
    temperature: 0.4,
    maxTokens: 500,
    jsonMode: true,
  });

  const parsed = parse(result.text);
  return {
    antwort: parsed.antwort,
    tipps: parsed.tipps,
    voice: "lana",
    provider: result.provider,
    model: result.model,
    kostenEur: result.costEur,
    tokens: result.tokensUsed,
  };
}

function parse(raw: string): { antwort: string; tipps: string[] } {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned) as { antwort?: unknown; tipps?: unknown };
    return {
      antwort: typeof obj.antwort === "string" ? obj.antwort : cleaned,
      tipps: Array.isArray(obj.tipps)
        ? (obj.tipps as unknown[]).filter((t): t is string => typeof t === "string").slice(0, 3)
        : [],
    };
  } catch {
    return { antwort: cleaned, tipps: [] };
  }
}
