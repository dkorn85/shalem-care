// AI Provider — abstrakte Schnittstelle für mehrere LLM-Anbieter
//
// Default-Provider: DeepSeek (kostengünstig, OpenAI-kompatibel)
// Fallback: Mock (deterministische Demo-Antworten ohne API-Key)
// Optional: Anthropic Claude Haiku, Mistral, Aleph Alpha (DSGVO)

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GenerateOptions = {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  stop?: string[];
};

export type AIResult = {
  text: string;
  json?: unknown;
  tokensUsed: { input: number; output: number };
  costEur: number;
  provider: string;
  model: string;
};

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  generate(messages: AIMessage[], options?: GenerateOptions): Promise<AIResult>;
}

// ─── Auswahl des Providers via Env ───────────────────────

import { DeepSeekProvider } from "./deepseek";
import { AnthropicProvider } from "./anthropic";
import { MockProvider } from "./mock";

export type ProviderOverride = {
  /** Konkretes Modell pro Aufruf — z.B. "claude-sonnet-4-6" für komplexe Tasks. */
  modelOverride?: string;
};

export function getAIProvider(opts: ProviderOverride = {}): AIProvider {
  const provider = (process.env.SHALEM_AI_PROVIDER ?? "auto").toLowerCase();

  if (provider === "anthropic" || (provider === "auto" && process.env.ANTHROPIC_API_KEY)) {
    return new AnthropicProvider({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      model: opts.modelOverride ?? process.env.SHALEM_AI_MODEL ?? "claude-haiku-4-5-20251001",
    });
  }

  if (provider === "deepseek" || (provider === "auto" && process.env.DEEPSEEK_API_KEY)) {
    return new DeepSeekProvider({
      apiKey: process.env.DEEPSEEK_API_KEY!,
      model: opts.modelOverride ?? process.env.SHALEM_AI_MODEL ?? "deepseek-chat",
    });
  }

  // Mock als Fallback — App läuft auch ohne API-Key
  return new MockProvider();
}
