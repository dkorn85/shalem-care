// Anthropic Provider — Claude-API direkt via fetch (kein SDK nötig)
//
// Endpoint: https://api.anthropic.com/v1/messages
// Doku:     https://docs.anthropic.com/en/api/messages
//
// Empfohlene Modelle (Stand 2026):
//   claude-haiku-4-5-20251001   schnell + günstig (~$1/1M in, $5/1M out)
//   claude-sonnet-4-6           Allrounder (~$3/1M in, $15/1M out)
//   claude-opus-4-7             höchste Qualität (~$15/1M in, $75/1M out)
//
// DSGVO-Hinweis:
//   Anthropic hostet (Stand 2026) primär in den USA. Für Pflegedaten
//   echter Klient:innen entweder anonymisieren vor dem Call oder über
//   AWS Bedrock Frankfurt-Region routen. Für die Demo (synthetische
//   Daten) ist der Direkt-Endpoint okay.

import type { AIProvider, AIMessage, GenerateOptions, AIResult } from "./provider";

const USD_TO_EUR = 0.92;

type Pricing = { inputPerMTokUsd: number; outputPerMTokUsd: number };

const PRICING: Record<string, Pricing> = {
  "claude-haiku-4-5-20251001": { inputPerMTokUsd: 1.0, outputPerMTokUsd: 5.0 },
  "claude-sonnet-4-6": { inputPerMTokUsd: 3.0, outputPerMTokUsd: 15.0 },
  "claude-opus-4-7": { inputPerMTokUsd: 15.0, outputPerMTokUsd: 75.0 },
};

export class AnthropicProvider implements AIProvider {
  readonly name = "Anthropic";
  readonly model: string;
  private apiKey: string;
  private endpoint: string;
  private apiVersion: string;

  constructor(opts: { apiKey: string; model?: string; endpoint?: string; apiVersion?: string }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? "claude-haiku-4-5-20251001";
    this.endpoint = opts.endpoint ?? "https://api.anthropic.com/v1/messages";
    this.apiVersion = opts.apiVersion ?? "2023-06-01";
  }

  async generate(messages: AIMessage[], options: GenerateOptions = {}): Promise<AIResult> {
    const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content);
    const turnMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: options.maxTokens ?? 1500,
      temperature: options.temperature ?? 0.3,
      messages: turnMessages,
    };
    if (systemParts.length > 0) {
      body.system = systemParts.join("\n\n");
    }
    if (options.stop && options.stop.length > 0) {
      body.stop_sequences = options.stop;
    }

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": this.apiVersion,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Anthropic API ${res.status}: ${errorText.slice(0, 300)}`);
    }

    const data = await res.json();
    const text: string = (data.content ?? [])
      .filter((block: { type: string }) => block.type === "text")
      .map((block: { text: string }) => block.text)
      .join("");

    const inputTokens = data.usage?.input_tokens ?? 0;
    const outputTokens = data.usage?.output_tokens ?? 0;
    const pricing = PRICING[this.model] ?? { inputPerMTokUsd: 3.0, outputPerMTokUsd: 15.0 };
    const costUsd =
      (inputTokens / 1_000_000) * pricing.inputPerMTokUsd +
      (outputTokens / 1_000_000) * pricing.outputPerMTokUsd;
    const costEur = costUsd * USD_TO_EUR;

    let json: unknown | undefined;
    if (options.jsonMode) {
      try { json = JSON.parse(text); } catch { /* optional */ }
    }

    return {
      text,
      json,
      tokensUsed: { input: inputTokens, output: outputTokens },
      costEur,
      provider: this.name,
      model: this.model,
    };
  }
}
