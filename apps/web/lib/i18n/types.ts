// i18n-Gerüst — leichtgewichtig, ohne externe Lib.
//
// Locale wird per Cookie `shalem_locale` persistiert (Server-Component
// liest cookies()). Default: de. Unterstützt: de, en. Englische Strings
// werden Schritt für Schritt ergänzt; jede fehlende Übersetzung fällt
// automatisch auf de zurück.

export type Locale = "de" | "en";
export const SUPPORTED_LOCALES: Locale[] = ["de", "en"];
export const DEFAULT_LOCALE: Locale = "de";

export const LOCALE_LABEL: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
};
