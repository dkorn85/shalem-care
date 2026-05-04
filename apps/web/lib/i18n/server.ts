// Server-Helper: Aktive Locale aus Cookie ableiten + t-Funktion bauen.

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./types";
import type { Locale } from "./types";
import { DICTIONARIES, DE } from "./dictionary";

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get("shalem_locale")?.value;
  if (v && SUPPORTED_LOCALES.includes(v as Locale)) return v as Locale;
  return DEFAULT_LOCALE;
}

export async function getT(): Promise<(key: string) => string> {
  const locale = await getLocale();
  const dict = DICTIONARIES[locale];
  return (key: string) => dict[key] ?? DE[key] ?? key;
}

export type T = Awaited<ReturnType<typeof getT>>;
