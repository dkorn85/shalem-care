// Schicht-Briefing · "Übergabe in 30 Sekunden" für Pflegekräfte.
//
// Eingabe: personId der Pflegekraft, optional Schicht-Beginn (default jetzt).
// Aggregiert für jede:n betreute:n Klient:in der Person:
//  - Events der letzten 24 h (Vitalwerte, Schmerz-NRS, Wundverband,
//    Therapie, Befund-Eingang, Konferenz-Beschluss)
//  - Klient-Notizen mit Konferenz-Markierung (offene Anliegen)
//  - Offene Beschlüsse aus laufenden Konferenzen
// Output: 30-Sekunden-Sprechtext im Dennis-Stil + 3-5 Bullet-Stichpunkte
//         pro Klient:in, plus eine Liste "Worauf heute besonders achten".

import { getAIProvider, type AIMessage } from "./provider";
import { listEvents } from "../aktivitaet/feed";
import { listKonferenzenForKlient } from "../konferenz/store";
import { caseloadFor } from "../zuordnung/store";

export type SchichtBriefingEingabe = {
  personId: string;
  personName: string;
  schichtTyp?: "frueh" | "spaet" | "nacht";
  jetztISO?: string;             // ISO-DateTime, default new Date()
};

export type SchichtBriefingErgebnis = {
  briefingText: string;          // 30-Sek-Sprechtext, Dennis-Stil
  proKlient: {
    klientId: string;
    klientName: string;
    bullets: string[];           // 3-5 Stichpunkte
  }[];
  besondereAchtsamkeit: string[]; // 1-3 Punkte fuer den ganzen Schichttag
  klientAnzahl: number;
  ereignisAnzahl: number;
  voice: "dennis";
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
};

const SYSTEM_PROMPT = `Du bist Dennis, eine erfahrene Pflegefachkraft (P7).
Du fasst die Übergabe für eine Kollegin/einen Kollegen zusammen, die/der
gleich die Schicht beginnt. Pflegekraft an Pflegekraft, knapp, präzise.

Regeln:
- Sprich die Pflegekraft direkt an ("du", "achte heute besonders", "schau bitte").
- Pro Klient:in 3-5 Bullets: das Wichtigste seit der letzten Schicht — Vitalveränderung,
  Wundverlauf, Familienanliegen, neue Verordnung, offener Beschluss.
- Keine Allgemeinplätze ("alles ruhig"). Wenn nichts passiert ist: ehrlich so notieren.
- Der "briefingText" ist der 30-Sekunden-Sprechtext (~80-100 Wörter), den Dennis vorliest.
  Anrede natürlich, kein Pflegekraft-Jargon, aber alle wichtigen Fakten drin.
- "besondereAchtsamkeit": 1-3 konkrete Punkte für den ganzen Schichttag (Sturzrisiko,
  Wundkontrolle, Familien-Termin, Konferenz heute). Leer wenn unauffällig.
- Antworte AUSSCHLIESSLICH als JSON, kein Markdown, kein Fließtext daneben:
  {
    "briefingText": "string · 30-Sek-Sprechtext",
    "proKlient": [
      {"klientId": "string", "klientName": "string", "bullets": ["...", "..."]}
    ],
    "besondereAchtsamkeit": ["..."]
  }`;

export async function generiereSchichtBriefing(eingabe: SchichtBriefingEingabe): Promise<SchichtBriefingErgebnis> {
  const cl = caseloadFor(eingabe.personId);
  if (!cl) {
    throw new Error(`Keine Caseload für Person ${eingabe.personId} gefunden.`);
  }

  const jetzt = eingabe.jetztISO ? new Date(eingabe.jetztISO) : new Date();
  const seit = new Date(jetzt.getTime() - 24 * 3_600_000);

  const alleEvents = listEvents(500);
  const relevanteEvents = alleEvents.filter((e) => {
    if (!cl.klientIds.includes(e.klientId)) return false;
    const ts = new Date(e.zeitstempel);
    return ts >= seit && ts <= jetzt;
  });

  const offeneKonferenzBeschluesse = cl.klientIds.flatMap((kid) =>
    listKonferenzenForKlient(kid)
      .filter((k) => k.status === "abgeschlossen" || k.status === "live")
      .flatMap((k) =>
        k.beschluesse
          .filter((b) => b.status === "offen" || b.status === "in_bearbeitung")
          .map((b) => ({ klientId: kid, was: b.was, wer: b.wer, bis: b.bis ?? "" })),
      ),
  );

  // Events pro Klient gruppieren
  const klientNamen = new Map<string, string>();
  const eventsProKlient = new Map<string, string[]>();
  for (const e of relevanteEvents) {
    klientNamen.set(e.klientId, e.klientName);
    const zeit = e.zeitstempel.slice(11, 16);
    const meta = e.meta && Object.keys(e.meta).length > 0
      ? ` [${Object.entries(e.meta).map(([k, v]) => `${k}=${v}`).join(", ")}]`
      : "";
    const line = `${zeit} ${e.vonName} (${e.vonBeruf}): ${e.inhalt}${meta}`;
    const arr = eventsProKlient.get(e.klientId) ?? [];
    arr.push(line);
    eventsProKlient.set(e.klientId, arr);
  }
  // Klient:innen ohne Events trotzdem auflisten
  for (const kid of cl.klientIds) {
    if (!eventsProKlient.has(kid)) {
      eventsProKlient.set(kid, []);
      if (!klientNamen.has(kid)) klientNamen.set(kid, kid);
    }
  }

  const userPrompt = [
    `Pflegekraft: ${eingabe.personName} (${cl.rolle})`,
    `Bereich: ${cl.zustaendigkeitsbereich}`,
    `Schichttyp: ${eingabe.schichtTyp ?? "unbekannt"}`,
    `Stand: ${jetzt.toISOString()}`,
    `Zeitraum: letzte 24 Stunden seit ${seit.toISOString()}`,
    "",
    "Klient:innen + Ereignisse:",
    ...[...eventsProKlient.entries()].map(([kid, lines]) => {
      const name = klientNamen.get(kid) ?? kid;
      const ereignisTxt = lines.length === 0 ? "  (keine Ereignisse seit gestern)" : lines.map((l) => `  - ${l}`).join("\n");
      return `\n[${kid}] ${name}\n${ereignisTxt}`;
    }),
    "",
    "Offene Konferenz-Beschlüsse aus laufenden/abgeschlossenen Konferenzen:",
    offeneKonferenzBeschluesse.length === 0
      ? "  (keine)"
      : offeneKonferenzBeschluesse.map((b) => `  - [${b.klientId}] ${b.was} · zuständig: ${b.wer}${b.bis ? ` · bis ${b.bis}` : ""}`).join("\n"),
  ].join("\n");

  const provider = getAIProvider();
  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  const result = await provider.generate(messages, {
    temperature: 0.3,
    maxTokens: 1100,
    jsonMode: true,
  });

  const parsed = parse(result.text);

  return {
    briefingText: parsed.briefingText,
    proKlient: parsed.proKlient,
    besondereAchtsamkeit: parsed.besondereAchtsamkeit,
    klientAnzahl: cl.klientIds.length,
    ereignisAnzahl: relevanteEvents.length,
    voice: "dennis",
    provider: result.provider,
    model: result.model,
    kostenEur: result.costEur,
    tokens: result.tokensUsed,
  };
}

function parse(raw: string): {
  briefingText: string;
  proKlient: { klientId: string; klientName: string; bullets: string[] }[];
  besondereAchtsamkeit: string[];
} {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned) as Record<string, unknown>;
    const klientArr = Array.isArray(obj.proKlient) ? obj.proKlient as { klientId?: unknown; klientName?: unknown; bullets?: unknown }[] : [];
    return {
      briefingText: typeof obj.briefingText === "string" ? obj.briefingText : cleaned,
      proKlient: klientArr
        .filter((k) => typeof k.klientId === "string" && typeof k.klientName === "string" && Array.isArray(k.bullets))
        .map((k) => ({
          klientId: k.klientId as string,
          klientName: k.klientName as string,
          bullets: (k.bullets as unknown[]).filter((b): b is string => typeof b === "string"),
        })),
      besondereAchtsamkeit: Array.isArray(obj.besondereAchtsamkeit)
        ? (obj.besondereAchtsamkeit as unknown[]).filter((s): s is string => typeof s === "string")
        : [],
    };
  } catch {
    return { briefingText: cleaned, proKlient: [], besondereAchtsamkeit: [] };
  }
}
