import { NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/pay/stripe-client";
import { handleStripeEvent } from "@/lib/pay/pay-service";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  const body = await req.text();

  if (!signature || !secret) {
    if (process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "missing signature" }, { status: 400 });
    }
    // Mock-Modus: Body als JSON parsen
    try {
      const event = JSON.parse(body);
      await handleStripeEvent(event);
      return NextResponse.json({ received: true, mode: "mock" });
    } catch {
      return NextResponse.json({ error: "invalid json" }, { status: 400 });
    }
  }

  let event;
  try {
    event = await constructWebhookEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `webhook signature failed: ${err instanceof Error ? err.message : "unknown"}` }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown" }, { status: 500 });
  }
}
