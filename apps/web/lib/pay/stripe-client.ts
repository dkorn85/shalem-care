// Stripe SDK Wrapper
// In production: echte Stripe-SDK aufrufen
// Im Dev ohne Secret: Mock-Modus mit deterministischen IDs

import "server-only";

type StripeMode = "live" | "mock";

function getMode(): StripeMode {
  return process.env.STRIPE_SECRET_KEY ? "live" : "mock";
}

// Lazy-load echte Stripe-SDK nur wenn Secret vorhanden
let _stripeReal: unknown;
async function getRealStripe() {
  if (_stripeReal) return _stripeReal;
  const Stripe = (await import("stripe")).default;
  _stripeReal = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.acacia" as never });
  return _stripeReal;
}

// Mock-IDs für deterministische Tests
function mockId(prefix: string, seed: string): string {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `${prefix}_${h.toString(16).padStart(12, "0")}`;
}

// ───────────────────────────────────────────────
// Account-API (Pflegekräfte als Connect-Empfänger)
// ───────────────────────────────────────────────

export async function createConnectAccount(input: {
  practitionerId: string;
  email: string;
  country?: string;
}): Promise<{ id: string; status: string }> {
  if (getMode() === "live") {
    const stripe = await getRealStripe() as any;
    const acc = await stripe.accounts.create({
      type: "express",
      country: input.country ?? "DE",
      email: input.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      metadata: { practitionerId: input.practitionerId },
    });
    return { id: acc.id, status: "pending" };
  }

  return { id: mockId("acct", input.practitionerId), status: "pending" };
}

export async function createOnboardingLink(input: {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}): Promise<{ url: string }> {
  if (getMode() === "live") {
    const stripe = await getRealStripe() as any;
    const link = await stripe.accountLinks.create({
      account: input.accountId,
      type: "account_onboarding",
      return_url: input.returnUrl,
      refresh_url: input.refreshUrl,
    });
    return { url: link.url };
  }

  return { url: `${input.returnUrl}?mock=true&account=${input.accountId}` };
}

export async function retrieveAccount(accountId: string): Promise<{
  id: string;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  capabilities: Record<string, string>;
}> {
  if (getMode() === "live") {
    const stripe = await getRealStripe() as any;
    const acc = await stripe.accounts.retrieve(accountId);
    return {
      id: acc.id,
      detailsSubmitted: acc.details_submitted ?? false,
      payoutsEnabled: acc.payouts_enabled ?? false,
      capabilities: acc.capabilities ?? {},
    };
  }

  // Mock: nach Onboarding "active"
  return {
    id: accountId,
    detailsSubmitted: true,
    payoutsEnabled: true,
    capabilities: { transfers: "active", card_payments: "active" },
  };
}

// ───────────────────────────────────────────────
// Customer-API (Träger / Klienten als Zahler)
// ───────────────────────────────────────────────

export async function createCustomer(input: {
  payerId: string;
  email: string;
  name: string;
}): Promise<{ id: string }> {
  if (getMode() === "live") {
    const stripe = await getRealStripe() as any;
    const cus = await stripe.customers.create({
      email: input.email,
      name: input.name,
      metadata: { payerId: input.payerId },
    });
    return { id: cus.id };
  }

  return { id: mockId("cus", input.payerId) };
}

// ───────────────────────────────────────────────
// PaymentIntent — Mehrparteien-Flow mit Cut
// ───────────────────────────────────────────────

export async function createPaymentIntent(input: {
  amountCents: number;
  customerId: string;
  destinationAccountId: string;
  applicationFeeCents: number;
  description: string;
  metadata?: Record<string, string>;
}): Promise<{ id: string; clientSecret: string; status: string }> {
  if (getMode() === "live") {
    const stripe = await getRealStripe() as any;
    const intent = await stripe.paymentIntents.create({
      amount: input.amountCents,
      currency: "eur",
      customer: input.customerId,
      application_fee_amount: input.applicationFeeCents,
      transfer_data: { destination: input.destinationAccountId },
      description: input.description,
      metadata: input.metadata,
      automatic_payment_methods: { enabled: true },
    });
    return {
      id: intent.id,
      clientSecret: intent.client_secret,
      status: intent.status,
    };
  }

  const id = mockId("pi", `${input.customerId}-${Date.now()}`);
  return { id, clientSecret: `${id}_secret_mock`, status: "requires_payment_method" };
}

export async function capturePayment(paymentIntentId: string): Promise<{ status: string }> {
  if (getMode() === "live") {
    const stripe = await getRealStripe() as any;
    const intent = await stripe.paymentIntents.confirm(paymentIntentId);
    return { status: intent.status };
  }

  return { status: "succeeded" };
}

export async function refundPayment(input: {
  paymentIntentId: string;
  amountCents?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}): Promise<{ id: string; status: string }> {
  if (getMode() === "live") {
    const stripe = await getRealStripe() as any;
    const refund = await stripe.refunds.create({
      payment_intent: input.paymentIntentId,
      amount: input.amountCents,
      reason: input.reason,
    });
    return { id: refund.id, status: refund.status };
  }

  return { id: mockId("re", input.paymentIntentId), status: "succeeded" };
}

// ───────────────────────────────────────────────
// Webhook Verification
// ───────────────────────────────────────────────

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Promise<{ type: string; data: { object: Record<string, unknown> } }> {
  if (getMode() === "live") {
    const stripe = await getRealStripe() as any;
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }

  // Mock: Event aus Body parsen ohne Verifikation
  return JSON.parse(typeof payload === "string" ? payload : payload.toString());
}

export const STRIPE_MODE = getMode();
