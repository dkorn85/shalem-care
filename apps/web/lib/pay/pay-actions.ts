"use server";

import { revalidatePath } from "next/cache";
import {
  onboardPractitioner as svcOnboardPractitioner,
  refreshPractitionerStatus,
  onboardPayer as svcOnboardPayer,
  chargeForShift,
  refundShiftPayment,
} from "./pay-service";

export async function onboardPractitionerAction(input: {
  practitionerId: string;
  email: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const result = await svcOnboardPractitioner({
    practitionerId: input.practitionerId,
    email: input.email,
    returnUrl: `${baseUrl}/admin/zahlungen?onboarded=${input.practitionerId}`,
    refreshUrl: `${baseUrl}/admin/zahlungen?refresh=${input.practitionerId}`,
  });
  revalidatePath("/admin/zahlungen");
  return result;
}

export async function refreshPractitionerStatusAction(practitionerId: string) {
  const result = await refreshPractitionerStatus(practitionerId);
  revalidatePath("/admin/zahlungen");
  return result;
}

export async function onboardPayerAction(input: {
  payerId: string;
  type: "facility" | "client";
  email: string;
  name: string;
}) {
  const result = await svcOnboardPayer(input);
  revalidatePath("/admin/zahlungen");
  return result;
}

export async function chargeForShiftAction(input: {
  shiftId: string;
  payerId: string;
  practitionerId: string;
  amountCents: number;
  description: string;
}) {
  try {
    const payment = await chargeForShift({
      shiftId: input.shiftId,
      payerId: input.payerId,
      practitionerId: input.practitionerId,
      amountCents: input.amountCents,
      platformFeeBps: 400,
      description: input.description,
    });
    revalidatePath("/admin/zahlungen");
    return { ok: true, payment };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unbekannt" };
  }
}

export async function refundPaymentAction(paymentId: string, reason?: "duplicate" | "fraudulent" | "requested_by_customer") {
  try {
    const result = await refundShiftPayment({ paymentId, reason });
    revalidatePath("/admin/zahlungen");
    return { ok: true, payment: result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unbekannt" };
  }
}
