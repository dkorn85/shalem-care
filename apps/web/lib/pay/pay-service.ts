// Pay-Service — geschäftliche Logik der Mehrparteien-Zahlflüsse
// Wraps stripe-client mit Domain-Konzepten: Pflegekraft, Träger/Klient, Plattform-Cut

import {
  createConnectAccount,
  createOnboardingLink,
  retrieveAccount,
  createCustomer,
  createPaymentIntent,
  capturePayment,
  refundPayment,
  STRIPE_MODE,
} from "./stripe-client";
import type { PayoutAccount, PayerProfile, Payment, PaymentRequest } from "./types";

// In-Memory-Tabellen für PoC. In Production: in Medplum als Account/Person mit Pay-Extensions
// oder in eigener Postgres-Tabelle.
const payoutAccounts = new Map<string, PayoutAccount>();
const payerProfiles = new Map<string, PayerProfile>();
const payments = new Map<string, Payment>();

const PLATFORM_FEE_BPS_DEFAULT = 400; // 4 %

// ───────────────────────────────────────────────
// Onboarding Pflegekraft → Connect-Account
// ───────────────────────────────────────────────

export async function onboardPractitioner(input: {
  practitionerId: string;
  email: string;
  returnUrl: string;
  refreshUrl: string;
}): Promise<{ accountId: string; onboardingUrl: string }> {
  const existing = payoutAccounts.get(input.practitionerId);

  let accountId: string;
  if (existing) {
    accountId = existing.stripeAccountId;
  } else {
    const acc = await createConnectAccount({
      practitionerId: input.practitionerId,
      email: input.email,
    });
    accountId = acc.id;
    payoutAccounts.set(input.practitionerId, {
      practitionerId: input.practitionerId,
      stripeAccountId: accountId,
      status: "pending",
      detailsSubmitted: false,
      payoutsEnabled: false,
      createdAt: new Date().toISOString(),
      capabilitiesActive: [],
    });
  }

  const link = await createOnboardingLink({
    accountId,
    returnUrl: input.returnUrl,
    refreshUrl: input.refreshUrl,
  });

  return { accountId, onboardingUrl: link.url };
}

export async function refreshPractitionerStatus(practitionerId: string): Promise<PayoutAccount | null> {
  const existing = payoutAccounts.get(practitionerId);
  if (!existing) return null;

  const fresh = await retrieveAccount(existing.stripeAccountId);
  const updated: PayoutAccount = {
    ...existing,
    detailsSubmitted: fresh.detailsSubmitted,
    payoutsEnabled: fresh.payoutsEnabled,
    capabilitiesActive: Object.entries(fresh.capabilities)
      .filter(([, status]) => status === "active")
      .map(([cap]) => cap),
    status: fresh.payoutsEnabled ? "active" : fresh.detailsSubmitted ? "pending" : "pending",
  };
  payoutAccounts.set(practitionerId, updated);
  return updated;
}

export function getPayoutAccount(practitionerId: string): PayoutAccount | null {
  return payoutAccounts.get(practitionerId) ?? null;
}

// ───────────────────────────────────────────────
// Onboarding Zahler (Träger oder Klient)
// ───────────────────────────────────────────────

export async function onboardPayer(input: {
  payerId: string;
  type: "facility" | "client";
  email: string;
  name: string;
}): Promise<PayerProfile> {
  const existing = payerProfiles.get(input.payerId);
  if (existing) return existing;

  const cus = await createCustomer({
    payerId: input.payerId,
    email: input.email,
    name: input.name,
  });

  const profile: PayerProfile = {
    payerId: input.payerId,
    type: input.type,
    stripeCustomerId: cus.id,
    createdAt: new Date().toISOString(),
  };
  payerProfiles.set(input.payerId, profile);
  return profile;
}

export function getPayerProfile(payerId: string): PayerProfile | null {
  return payerProfiles.get(payerId) ?? null;
}

// ───────────────────────────────────────────────
// Bezahlung: Träger/Klient → Plattform → Pflegekraft
// ───────────────────────────────────────────────

export async function chargeForShift(req: PaymentRequest): Promise<Payment> {
  const payer = payerProfiles.get(req.payerId);
  if (!payer) throw new Error(`Payer ${req.payerId} ist nicht onboarded`);

  const payoutAccount = payoutAccounts.get(req.practitionerId);
  if (!payoutAccount) throw new Error(`Pflegekraft ${req.practitionerId} hat kein Pay-Account`);
  if (payoutAccount.status !== "active") throw new Error(`Pflegekraft-Account ist ${payoutAccount.status}, nicht active`);

  const feeBps = req.platformFeeBps ?? PLATFORM_FEE_BPS_DEFAULT;
  const platformFeeCents = Math.round((req.amountCents * feeBps) / 10_000);
  const payoutCents = req.amountCents - platformFeeCents;

  const intent = await createPaymentIntent({
    amountCents: req.amountCents,
    customerId: payer.stripeCustomerId,
    destinationAccountId: payoutAccount.stripeAccountId,
    applicationFeeCents: platformFeeCents,
    description: req.description,
    metadata: {
      shiftId: req.shiftId,
      practitionerId: req.practitionerId,
      payerId: req.payerId,
      ...req.metadata,
    },
  });

  const payment: Payment = {
    id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    stripePaymentIntentId: intent.id,
    status: intent.status === "succeeded" ? "succeeded" : "pending",
    shiftId: req.shiftId,
    payerId: req.payerId,
    practitionerId: req.practitionerId,
    amountCents: req.amountCents,
    platformFeeCents,
    payoutCents,
    createdAt: new Date().toISOString(),
  };
  payments.set(payment.id, payment);

  // Im Mock-Modus direkt capture für PoC-Demo-Flow
  if (STRIPE_MODE === "mock") {
    await capturePayment(intent.id);
    payment.status = "succeeded";
    payment.succeededAt = new Date().toISOString();
    payments.set(payment.id, payment);
  }

  return payment;
}

export function getPayment(id: string): Payment | null {
  return payments.get(id) ?? null;
}

export function listPaymentsForPractitioner(practitionerId: string, fromDate?: string): Payment[] {
  return Array.from(payments.values())
    .filter((p) => p.practitionerId === practitionerId)
    .filter((p) => !fromDate || p.createdAt >= fromDate)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listPaymentsForPayer(payerId: string): Payment[] {
  return Array.from(payments.values())
    .filter((p) => p.payerId === payerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAllPayments(): Payment[] {
  return Array.from(payments.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ───────────────────────────────────────────────
// Refund (z.B. bei Streit-Schlichtung)
// ───────────────────────────────────────────────

export async function refundShiftPayment(input: {
  paymentId: string;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  amountCents?: number;
}): Promise<Payment> {
  const payment = payments.get(input.paymentId);
  if (!payment) throw new Error(`Payment ${input.paymentId} nicht gefunden`);

  await refundPayment({
    paymentIntentId: payment.stripePaymentIntentId,
    amountCents: input.amountCents,
    reason: input.reason,
  });

  const updated: Payment = { ...payment, status: "refunded" };
  payments.set(payment.id, updated);
  return updated;
}

// ───────────────────────────────────────────────
// Reporting für Pflegekraft (monatliche Übersicht)
// ───────────────────────────────────────────────

export function summaryForPractitioner(input: {
  practitionerId: string;
  from: string;
  to: string;
}): { paymentsCount: number; grossCents: number; platformFeeCents: number; netCents: number; estimatedTaxCents: number } {
  const items = Array.from(payments.values())
    .filter((p) => p.practitionerId === input.practitionerId)
    .filter((p) => p.createdAt >= input.from && p.createdAt <= input.to)
    .filter((p) => p.status === "succeeded");

  const gross = items.reduce((s, p) => s + p.amountCents, 0);
  const fee = items.reduce((s, p) => s + p.platformFeeCents, 0);
  const net = items.reduce((s, p) => s + p.payoutCents, 0);

  // Sehr grobe Steuer-Schätzung für Reporting (echte Berechnung muss Lohnbuchhalter machen)
  const estimatedTaxCents = Math.round(net * 0.30);

  return {
    paymentsCount: items.length,
    grossCents: gross,
    platformFeeCents: fee,
    netCents: net,
    estimatedTaxCents,
  };
}

// ───────────────────────────────────────────────
// Webhook-Handler-Logik (wird aus dem API-Route aufgerufen)
// ───────────────────────────────────────────────

export async function handleStripeEvent(event: { type: string; data: { object: Record<string, unknown> } }): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as { id: string; metadata?: Record<string, string> };
      const payment = Array.from(payments.values()).find((p) => p.stripePaymentIntentId === intent.id);
      if (payment) {
        payments.set(payment.id, { ...payment, status: "succeeded", succeededAt: new Date().toISOString() });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as { id: string; last_payment_error?: { message?: string } };
      const payment = Array.from(payments.values()).find((p) => p.stripePaymentIntentId === intent.id);
      if (payment) {
        payments.set(payment.id, {
          ...payment,
          status: "failed",
          failureReason: intent.last_payment_error?.message ?? "unbekannt",
        });
      }
      break;
    }
    case "account.updated": {
      const account = event.data.object as { id: string; details_submitted?: boolean; payouts_enabled?: boolean; metadata?: Record<string, string> };
      const practitionerId = account.metadata?.practitionerId;
      if (practitionerId) {
        await refreshPractitionerStatus(practitionerId);
      }
      break;
    }
    default:
      // alle anderen Events: ignorieren oder loggen
      break;
  }
}
