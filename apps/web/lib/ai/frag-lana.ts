"use server";

// Frag-Lana · Server-Action mit DNQP-Standards als Knowledge-Base.
// Pflegekraft fragt freitext, Lana antwortet mit Verweis auf Standard /
// Hausmittel / Cross-Beruf — wenn API-Key fehlt fällt sie auf eine
// schlanke Heuristik zurück.

import { getAIProvider } from "@/lib/ai/provider";
import { STANDARDS } from "@/lib/expertenstandards/dnqp";
import { HAUSMITTEL } from "@/lib/heilkunst/hausmittel";

export type FragLanaInput = {
  frage: string;
  klientName?: string;
  naechsteTermine?: { zeit: string; beruf_label: string; aktivitaet: string }[];
  /** Optional: bisherige Chat-Historie für Kontext */
  historie?: { rolle: "user" | "lana"; text: string }[];
};

export type FragLanaErgebnis = {
  antwort: string;
  /** Welche Standards / Quellen zitiert wurden */
  quellen: { titel: string; href: string }[];
  source: "ki" | "heuristik";
  meta?: {
    provider: string;
    model: string;
    kostenEur: number;
    tokens: { input: number; output: number };
  };
};

const SYSTEM_PROMPT = `Du bist Lana — KI-Beraterin für Pflegekräfte in der Genossenschaft Shalem Care.

Du wirst von einer Pflegekraft im Stations-Cockpit gefragt. Deine Antworten müssen kurz, konkret und evidenzbasiert sein.

Strikte Regeln:
1. Maximal 4-5 Sätze. Direkter Tonfall, kein Marketing-Sprech.
2. Wenn ein DNQP-Expertenstandard relevant ist, nenne ihn beim Namen — die Pflegekraft kennt sie und kann den Verweis nutzen.
3. Wenn ein Hausmittel passt (Wickel, Wärmebehandlung, Kräuter), nenne es konkret mit Anwendung.
4. Bei Schmerz, Blutung, Notfall, Sturz, akuter Symptomatik: eskaliere klar — Arzt rufen, Bedarfsmedi, Vitalwerte.
5. Wenn das Pflegekompetenzgesetz (PKG 2025) eine erweiterte Eigen-Entscheidung erlaubt, sag das (z.B. Insulin-Anpassung bei zertifizierter Fachkraft).
6. Du bist keine Diagnose-Maschine. Bei Unsicherheit: "Bitte Arzt-Konsil einholen".
7. Antworte AUSSCHLIESSLICH als JSON. Kein Markdown, kein Begleittext.

Sprache: Deutsch.`;

function buildKnowledgeBase(): string {
  const standardsKurz = STANDARDS.map(
    (s) => `- ${s.titel} (${s.jahr}): ${s.inhaltKurz} Trigger: ${s.trigger.slice(0, 2).join(", ")}.`,
  ).join("\n");
  const hausmittelKurz = HAUSMITTEL.slice(0, 12)
    .map((h) => `- ${h.name}: bei ${h.geeignetBei.slice(0, 3).join(", ")} — ${h.wirkungsweise.slice(0, 2).join(", ")}`)
    .join("\n");
  return [
    "DNQP-Expertenstandards (SGB XI § 113a):",
    standardsKurz,
    "",
    "Hausmittel-Auswahl (Kneipp / Wickel / Aromatherapie):",
    hausmittelKurz,
  ].join("\n");
}

const KNOWLEDGE_BASE = buildKnowledgeBase();

function buildUserPrompt(input: FragLanaInput): string {
  const lines: string[] = [];
  if (input.klientName) lines.push(`Klient:in: ${input.klientName}`);
  if (input.naechsteTermine && input.naechsteTermine.length > 0) {
    lines.push("Nächste Termine heute:");
    for (const t of input.naechsteTermine.slice(0, 5)) {
      lines.push(`  ${t.zeit} ${t.beruf_label}: ${t.aktivitaet}`);
    }
  }
  if (input.historie && input.historie.length > 0) {
    lines.push("");
    lines.push("Bisheriger Gesprächs-Verlauf:");
    for (const m of input.historie.slice(-4)) {
      lines.push(`  ${m.rolle === "user" ? "Pflegekraft" : "Lana"}: ${m.text}`);
    }
  }
  lines.push("");
  lines.push(`Frage: ${input.frage}`);
  lines.push("");
  lines.push("Antworte als JSON:");
  lines.push("{");
  lines.push('  "antwort": "<3-5 Sätze · konkret · mit Verweis auf Standard wenn relevant>",');
  lines.push('  "quellen": [{"titel": "<Standard-Name oder Hausmittel>", "href": "/expertenstandards#<id>"}]');
  lines.push("}");
  return lines.join("\n");
}

function heuristikAntwort(frage: string, ctx: FragLanaInput): FragLanaErgebnis {
  const lower = frage.toLowerCase();
  let antwort = "Das ist eine wichtige Frage. Ohne KI-Provider kann ich nur generisch antworten — schau in den Expertenstandards nach.";
  const quellen: { titel: string; href: string }[] = [];

  if (lower.includes("schmerz")) {
    antwort = "NRS dokumentieren (0-10), bei ≥4 Bedarfsmedi nach Verordnung anbieten, post-Medi nach 60 min nochmal messen. Nicht-medikamentös: Lagerung, Wärme/Kälte, Ablenkung.";
    quellen.push({ titel: "DNQP Schmerzmanagement", href: "/expertenstandards#schmerz-akut" });
  } else if (lower.includes("dekubit") || lower.includes("druckgesch")) {
    antwort = "Braden-Skala erfassen (alle 7 Tage), Lagerung alle 2-3h, druckverteilende Matratze ab 13 Punkten. Bei Hochrisiko Foto-Doku der Risikostellen.";
    quellen.push({ titel: "DNQP Dekubitusprophylaxe", href: "/expertenstandards#dekubitus" });
  } else if (lower.includes("sturz")) {
    antwort = "Tinetti / TUG erfassen, Umgebungs-Check (Stolperfallen), Hilfsmittel + Schuhwerk. Hausmeister-Auftrag bei baulichen Risiken (Haltegriffe, Schwellen). Polypharmazie prüfen.";
    quellen.push({ titel: "DNQP Sturzprophylaxe", href: "/expertenstandards#sturz" });
  } else if (lower.includes("ernähr") || lower.includes("essen") || lower.includes("mangel")) {
    antwort = "MNA-Screening alle 90 Tage, bei Risiko Trinkprotokoll starten, Gewicht wöchentlich. Lebensmittel-Lieferant einbinden für Schluckkost / Demenzkost-Anpassung.";
    quellen.push({ titel: "DNQP Ernährungsmanagement", href: "/expertenstandards#ernaehrung" });
  } else if (lower.includes("schlaf")) {
    antwort = "Schlafprotokoll führen, Lavendel-Aroma am Bett, kein TV nach 19:00, Tagschlaf < 30 min. Bei Demenz: Tagesstruktur + Bewegung am Vormittag.";
    quellen.push({ titel: "Aromatherapie · Lavendel", href: "/" });
  } else if (lower.includes("nächst") || lower.includes("plan")) {
    if (ctx.naechsteTermine && ctx.naechsteTermine.length > 0) {
      const t = ctx.naechsteTermine[0];
      antwort = `Als nächstes: ${t.zeit} ${t.beruf_label} (${t.aktivitaet}). Heute insgesamt ${ctx.naechsteTermine.length} geplante Termine.`;
    } else {
      antwort = "Heute keine weiteren Termine geplant. Nutz die Zeit für Akte-Update + Selbstpflege.";
    }
  }

  return { antwort, quellen, source: "heuristik" };
}

type ParsedKi = { antwort: string; quellen: { titel: string; href: string }[] };

function parseKi(raw: string): ParsedKi | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned);
    if (!obj || typeof obj !== "object") return null;
    return {
      antwort: typeof obj.antwort === "string" ? obj.antwort : "",
      quellen: Array.isArray(obj.quellen)
        ? obj.quellen
            .filter(
              (q: unknown): q is { titel: string; href: string } =>
                !!q && typeof q === "object"
                && typeof (q as { titel?: unknown }).titel === "string"
                && typeof (q as { href?: unknown }).href === "string",
            )
            .map((q: { titel: string; href: string }) => ({ titel: q.titel, href: q.href }))
        : [],
    };
  } catch {
    return null;
  }
}

export async function fragLana(input: FragLanaInput): Promise<FragLanaErgebnis> {
  if (!input.frage.trim()) {
    return { antwort: "Frag mich was Konkretes über Schmerz, Sturz, Ernährung oder Pflegestandards.", quellen: [], source: "heuristik" };
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    return heuristikAntwort(input.frage, input);
  }

  try {
    const provider = getAIProvider();
    const result = await provider.generate(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: KNOWLEDGE_BASE },
        { role: "user", content: buildUserPrompt(input) },
      ],
      { temperature: 0.3, maxTokens: 600, jsonMode: true },
    );

    const parsed = parseKi(result.text);
    if (!parsed || !parsed.antwort) {
      return heuristikAntwort(input.frage, input);
    }

    return {
      antwort: parsed.antwort,
      quellen: parsed.quellen,
      source: "ki",
      meta: {
        provider: result.provider,
        model: result.model,
        kostenEur: result.costEur,
        tokens: result.tokensUsed,
      },
    };
  } catch (err) {
    console.warn("[frag-lana] Fallback auf Heuristik:", err);
    return heuristikAntwort(input.frage, input);
  }
}
