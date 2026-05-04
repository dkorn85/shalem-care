// Pay-Layer Domain Types
// Pflegekraft = Connect-Account (Empfänger)
// Träger / Klient = Customer (Zahler)
// Plattform = Genossenschaft (zieht Cut)

export type PayoutAccount = {
  practitionerId: string;     // Bezug zur Person
  stripeAccountId: string;    // "acct_xxx"
  status: "pending" | "active" | "restricted" | "rejected";
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  createdAt: string;
  capabilitiesActive: string[];
};

export type PayerProfile = {
  payerId: string;            // Träger-ID oder Klient-ID
  type: "facility" | "client";
  stripeCustomerId: string;   // "cus_xxx"
  defaultPaymentMethodId?: string;
  createdAt: string;
};

export type PaymentRequest = {
  shiftId: string;
  payerId: string;
  practitionerId: string;
  amountCents: number;          // Bruttobetrag in Cent (z.B. 21000 für 210€)
  platformFeeBps: number;       // Basispunkte für Plattform-Cut, default 400 = 4%
  description: string;          // "Spätschicht Pulmologie 3B, 14-22 Uhr, KW 19"
  metadata?: Record<string, string>;
};

export type Payment = {
  id: string;                   // shalem-payment-id
  stripePaymentIntentId: string;
  status: "pending" | "processing" | "succeeded" | "failed" | "refunded";
  shiftId: string;
  payerId: string;
  practitionerId: string;
  amountCents: number;
  platformFeeCents: number;     // tatsächlicher Cut nach Berechnung
  payoutCents: number;          // an Pflegekraft
  createdAt: string;
  succeededAt?: string;
  failureReason?: string;
};

export type PayoutSummary = {
  practitionerId: string;
  periodFrom: string;
  periodTo: string;
  paymentsCount: number;
  grossCents: number;
  platformFeeCents: number;
  netCents: number;
  estimatedTaxCents: number;     // grobe Schätzung für Reporting
};
