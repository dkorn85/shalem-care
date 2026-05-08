"use server";

// Server-Action: Widerspruchs-Begründung als formellen Brief-Text generieren.
//
// Input: KassenVorgang (Ablehnung) + optional ein Klartext-Statement der
// Klient:in („Warum bist du nicht einverstanden?")
// Output: 2-3 Absätze formelle Begründung für den Widerspruchs-Brief
// (§ 84 SGG · § 88 SGG).

import { getAIProvider, type AIMessage } from "@/lib/ai/provider";
import type { KassenVorgang } from "@/lib/kostentraeger/types";

export type WiderspruchEntwurf = {
  begruendung: string;       // 2-3 Absätze
  argumente: string[];       // 3-5 Argument-Punkte für Versicherte zum Polieren
};

export type WiderspruchResult =
  | {
      ok: true;
      entwurf: WiderspruchEntwurf;
      source: "ki" | "heuristik";
      meta?: { provider: string; model: string; kostenEur: number; tokens: { input: number; output: number } };
    }
  | { ok: false; error: string };

const SYSTEM_PROMPT = `Du bist Lana — KI-Hilfe für Versicherte bei einem Widerspruch gegen einen Krankenkassen-Bescheid.

Aufgabe: Eine formelle aber verständliche Widerspruchs-Begründung schreiben, die § 84 SGG entspricht.

Vorgehen:
1. Den Bescheid + Vorgangs-Typ verstehen (HKP-Genehmigung, Krankengeld, Hilfsmittel, Abrechnung).
2. Die persönliche Sicht der Klient:in einbeziehen, falls vorhanden.
3. Begründung in 2-3 Absätzen formulieren — formell, aber nicht juristisch verklausuliert.
4. 3-5 Argument-Punkte als Stichpunkte hinzufügen (für Versicherte zum Polieren).

Strikte Regeln:
- Tonart: respektvoll, sachlich, nicht aggressiv.
- Konkrete SGB-Paragraphen nennen, wenn passend (§ 37 SGB V bei HKP, § 33 SGB V bei Hilfsmittel, § 44 SGB V bei Krankengeld, § 12 SGB V Wirtschaftlichkeit).
- Kein „mein Anwalt", keine Drohung, keine Eile-Phrasen.
- Hinweis auf MD-Stellungnahme einbeziehen, wenn Vorgang abgelehnt wurde.
- Antwort AUSSCHLIESSLICH als JSON. Kein Markdown.

Schema:
{
  "begruendung": "2-3 Absätze\\n\\nformell aber verständlich",
  "argumente": ["Argument 1", "Argument 2", ...]
}`;

export async function generiereWiderspruch({
  vorgang,
  klientStatement,
}: {
  vorgang: KassenVorgang;
  klientStatement?: string;
}): Promise<WiderspruchResult> {
  const provider = getAIProvider();

  const prompt = [
    `Vorgangs-Typ: ${vorgang.typ}`,
    `Beschreibung: ${vorgang.beschreibung}`,
    `Krankenkasse: ${vorgang.kassenName} (IK ${vorgang.ikNummer})`,
    `Aktenzeichen: ${vorgang.id.toUpperCase()}`,
    `Status: ${vorgang.status}`,
    vorgang.notiz ? `Notiz der Kasse: „${vorgang.notiz}"` : undefined,
    "",
    klientStatement
      ? `Persönliche Sicht der Versicherten:\n${klientStatement}`
      : `Keine zusätzliche Klient-Begründung — formuliere generisch, mit Bitte um erneute Prüfung und Hinweis auf MD-Stellungnahme falls vorhanden.`,
  ]
    .filter(Boolean)
    .join("\n");

  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  try {
    const result = await provider.generate(messages, {
      maxTokens: 800,
      temperature: 0.4,
    });

    const parsed = parseEntwurf(result.text);
    if (!parsed) {
      // KI-Antwort konnte nicht geparst werden — auf Heuristik zurückfallen
      return {
        ok: true,
        entwurf: heuristik(vorgang, klientStatement),
        source: "heuristik",
      };
    }

    return {
      ok: true,
      entwurf: parsed,
      source: "ki",
      meta: {
        provider: result.provider,
        model: result.model,
        kostenEur: result.costEur,
        tokens: result.tokensUsed,
      },
    };
  } catch (e) {
    // Fallback auf Heuristik
    return {
      ok: true,
      entwurf: heuristik(vorgang, klientStatement),
      source: "heuristik",
    };
  }
}

function parseEntwurf(text: string): WiderspruchEntwurf | null {
  // JSON robust extrahieren (manche Modelle wickeln in ```json … ```)
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[0]);
    if (typeof obj.begruendung !== "string" || !Array.isArray(obj.argumente)) return null;
    return {
      begruendung: obj.begruendung,
      argumente: obj.argumente.filter((a: unknown) => typeof a === "string").slice(0, 5),
    };
  } catch {
    return null;
  }
}

function heuristik(v: KassenVorgang, klientStatement?: string): WiderspruchEntwurf {
  const istWunde = /wund|verband|vw/i.test(v.beschreibung);
  const istHkp = v.typ === "hkp_genehmigung";
  const istKg = v.typ === "krankengeld";
  const istHm = v.typ === "hilfsmittel";

  const persoenlich = klientStatement
    ? `\n\nAus persönlicher Sicht:\n${klientStatement.trim()}\n`
    : "";

  if (istHkp && istWunde) {
    return {
      begruendung:
        `die abgelehnte Verordnung betrifft die häusliche Wundversorgung. Eine ordnungsgemäße Wundbeurteilung und sterile Verbandwechsel können von mir selbst nicht in der erforderlichen Qualität erbracht werden — eine Selbstvornahme ist im Sinne des § 12 SGB V (Wirtschaftlichkeitsgebot) gerade nicht gegeben, da unsachgemäße Versorgung das Risiko einer Wundinfektion oder Verschlechterung deutlich erhöht.\n\nDie behandelnde Hausärztin hat die Notwendigkeit der Maßnahme medizinisch begründet (vgl. Verordnungs-Bezug). Bitte ziehen Sie hierzu auch eine Stellungnahme des Medizinischen Dienstes (MD) bei und prüfen den Sachverhalt erneut.${persoenlich}`,
      argumente: [
        "Selbstvornahme würde das Risiko einer Wundinfektion erhöhen — Wirtschaftlichkeitsgebot § 12 SGB V wird verletzt, nicht erfüllt.",
        "Hausärztliche Notwendigkeitsbegründung liegt vor.",
        "Bitte um MD-Stellungnahme zur Beurteilung der Selbstversorgungs-Fähigkeit.",
        "Bei Komplikationen entstehen der Kasse höhere Folgekosten als die laufende Versorgung.",
      ],
    };
  }

  if (istHkp) {
    return {
      begruendung:
        `die abgelehnte Verordnung betrifft Behandlungspflege nach § 37 SGB V. Die behandelnde Ärztin hat die medizinische Notwendigkeit auf der Verordnung dokumentiert; ich selbst kann die verordneten Maßnahmen aufgrund meiner gesundheitlichen Verfassung nicht in der erforderlichen Qualität ausführen.\n\nIch bitte um erneute Prüfung unter Berücksichtigung des ärztlich attestierten Bedarfs sowie ggf. um Beizug einer MD-Stellungnahme.${persoenlich}`,
      argumente: [
        "Ärztliche Notwendigkeitsbegründung liegt vor (§ 37 SGB V).",
        "Selbstvornahme nicht möglich — gesundheitliche Einschränkungen.",
        "Bitte um Einbezug einer MD-Stellungnahme.",
        "Wirtschaftlichkeit ist gewahrt — keine alternative ambulante Versorgung möglich.",
      ],
    };
  }

  if (istKg) {
    return {
      begruendung:
        `Ihr Bescheid zum Krankengeldanspruch nach § 44 SGB V berücksichtigt aus meiner Sicht nicht alle eingereichten Unterlagen. Die Arbeitsunfähigkeit ist lückenlos durch ärztliche Bescheinigungen belegt, ein Ausschlusstatbestand nach § 49 SGB V (Ruhen) liegt nicht vor.\n\nIch bitte um erneute Prüfung des Anspruchs unter Berücksichtigung der vollständigen AU-Kette.${persoenlich}`,
      argumente: [
        "AU-Bescheinigungen sind lückenlos eingereicht.",
        "Kein Ruhens-Tatbestand nach § 49 SGB V erkennbar.",
        "Bitte um detaillierte Berechnung des Tagessatzes.",
        "78-Wochen-Höchstgrenze ist nicht erreicht.",
      ],
    };
  }

  if (istHm) {
    return {
      begruendung:
        `das beantragte Hilfsmittel ist im Hilfsmittelverzeichnis des GKV-Spitzenverbandes gelistet und durch ärztliche Verordnung belegt. § 33 SGB V begründet meinen Anspruch auf eine im Einzelfall angemessene Versorgung — die abgelehnte Variante ist medizinisch erforderlich, weil ${istWunde ? "die Druckverteilung an der genannten Stelle nicht durch ein Standard-Hilfsmittel erreichbar ist" : "geringer ausgestattete Alternativen den dokumentierten Bedarf nicht decken"}.\n\nIch bitte um erneute Prüfung, gerne unter Beizug eines Sanitätshaus-Gutachtens.${persoenlich}`,
      argumente: [
        "Hilfsmittel ist im GKV-Hilfsmittelverzeichnis gelistet.",
        "Ärztliche Verordnung liegt vor.",
        "Standard-Alternative deckt den dokumentierten Bedarf nicht.",
        "§ 33 SGB V begründet Anspruch auf einzelfall-angemessene Versorgung.",
      ],
    };
  }

  return {
    begruendung:
      `Ihr Bescheid berücksichtigt aus meiner Sicht den Sachverhalt nicht vollständig. Ich bitte um erneute Prüfung und ausführliche Würdigung der eingereichten Unterlagen.${persoenlich}`,
    argumente: [
      "Bitte um erneute Prüfung des Sachverhalts.",
      "Bitte um schriftliche Bestätigung des Widerspruchs-Eingangs.",
      "Bitte um Mitteilung, welche Unterlagen ggf. fehlen.",
    ],
  };
}
