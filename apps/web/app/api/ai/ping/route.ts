import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const provider = getAIProvider();
    const result = await provider.generate(
      [
        { role: "system", content: "Du antwortest knapp auf Deutsch." },
        { role: "user", content: "Sag in einem Satz, dass die Anbindung funktioniert." },
      ],
      { temperature: 0, maxTokens: 80 },
    );

    return NextResponse.json({
      ok: true,
      provider: result.provider,
      model: result.model,
      text: result.text,
      tokens: result.tokensUsed,
      kosten_eur: Number(result.costEur.toFixed(6)),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
