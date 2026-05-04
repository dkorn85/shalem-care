// DeepSeek Provider — OpenAI-kompatible API
//
// Endpoint: https://api.deepseek.com/v1/chat/completions
// Pricing (Stand 2026, beim Anbieter prüfen):
//   deepseek-chat (V3): ~$0.27/1M input, ~$1.10/1M output
//   Cache-Hit: ~$0.07/1M input
//
// Achtung Datenschutz: DeepSeek-Standard-Endpoint hostet außerhalb der EU.
// Für DSGVO-Pflegedaten besser:
//   - DeepSeek über AWS Bedrock (Frankfurt-Region)
//   - Aleph Alpha (deutscher Anbieter)
//   - Mistral Large (EU-Hosted)
//   - Self-hosted via vLLM/Ollama

import type { AIProvider, AIMessage, GenerateOptions, AIResult } from "./provider";

const USD_TO_EUR = 0.92;

export class DeepSeekProvider implements AIProvider {
  readonly name = "DeepSeek";
  readonly model: string;
  private apiKey: string;
  private endpoint: string;

  constructor(opts: { apiKey: string; model?: string; endpoint?: string }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? "deepseek-chat";
    this.endpoint = opts.endpoint ?? "https://api.deepseek.com/v1/chat/completions";
  }

  async generate(messages: AIMessage[], options: GenerateOptions = {}): Promise<AIResult> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 1500,
    };
    if (options.jsonMode) {
      body.response_format = { type: "json_object" };
    }
    if (options.stop) {
      body.stop = options.stop;
    }

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`DeepSeek API ${res.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const inputTokens = data.usage?.prompt_tokens ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;

    // Aktuelle Pricing (siehe Header) — bei Cache-Hits günstiger
    const inputCostUsd = (inputTokens / 1_000_000) * 0.27;
    const outputCostUsd = (outputTokens / 1_000_000) * 1.10;
    const costEur = (inputCostUsd + outputCostUsd) * USD_TO_EUR;

    let json: unknown | undefined;
    if (options.jsonMode) {
      try { json = JSON.parse(text); } catch { /* JSON-Parsing optional */ }
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
