"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SUPPORTED_LOCALES } from "./types";
import type { Locale } from "./types";

export async function setLocale(locale: Locale): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return { ok: false, error: "Unsupported locale" };
  }
  const c = await cookies();
  c.set("shalem_locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,        // 1 Jahr
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
