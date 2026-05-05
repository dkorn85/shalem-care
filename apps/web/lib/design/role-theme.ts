// Rollen-Theme-System · zentrale Farb-Tokens, Akzente, Pattern-Backgrounds.
//
// Jede Rolle bekommt eine eindeutige visuelle Identität:
// - primaer:  Hauptfarbe (CSS-Var wie "var(--mon)")
// - sekundaer: Akzent (z.B. für KPI-Tiles)
// - flaeche: gedämpfter Hintergrund-Tint (für Section-Backgrounds)
// - chip: Chip-Hintergrund (10-15% Opacity)
// - linie: Akzent-Linie (40% Opacity, für Section-Trennung)
//
// Die Rolle-Farben spiegeln das Wochentage-System aus den vorhandenen
// CSS-Variablen — Pflege=Mon (rot-warm), Sozial=Tue (grün-türkis), etc.
//
// Cockpits / Sub-Routes / Components nutzen das hier statt selbst Farb-
// Tokens zu hardcoden. Das macht Theme-Updates global möglich.

export type RolleTheme = {
  id: string;
  label: string;
  // CSS-Variablen — passen zum bestehenden System in globals.css
  primaer: string;          // 'var(--mon)'
  primaerRgb: string;       // 'rgb(var(--mon))'
  flaeche: string;          // weicher Background-Tint (linear-gradient)
  chipBg: string;           // 'rgb(var(--mon) / 0.15)'
  chipFg: string;           // 'rgb(var(--mon))'
  linie: string;            // 'rgb(var(--mon) / 0.35)'
  shadow: string;           // 'rgb(var(--mon) / 0.12)'  — für Hover-Effekte
  // Optional: Asset-Pfade
  patternBg?: string;       // ggf. Watercolor-Hintergrund-Bild
};

const make = (id: string, label: string, varName: string, patternBg?: string): RolleTheme => ({
  id,
  label,
  primaer: `var(${varName})`,
  primaerRgb: `rgb(var(${varName}))`,
  flaeche: `linear-gradient(135deg, rgb(var(${varName}) / 0.06), transparent)`,
  chipBg: `rgb(var(${varName}) / 0.15)`,
  chipFg: `rgb(var(${varName}))`,
  linie: `rgb(var(${varName}) / 0.35)`,
  shadow: `0 8px 32px rgb(var(${varName}) / 0.12)`,
  patternBg,
});

export const ROLE_THEMES: Record<string, RolleTheme> = {
  pflege:        make("pflege",        "Pflege",          "--mon",            "/akte/header-konferenz.png"),
  arzt:          make("arzt",          "Arzt:Ärztin",     "--vibe-profile",   "/akte/header-arzt.png"),
  therapie:      make("therapie",      "Therapie",        "--fri",            "/anamnese/header-therapie.png"),
  sozialarbeit:  make("sozialarbeit",  "Sozialarbeit",    "--tue",            "/anamnese/header-sozial.png"),
  heilerziehung: make("heilerziehung", "Heilerziehung",   "--sat"),
  ehrenamt:      make("ehrenamt",      "Ehrenamt",        "--thu",            "/anamnese/header-ehrenamt.png"),
  hauswirtschaft:make("hauswirtschaft","Hauswirtschaft",  "--sun"),
  erziehung:     make("erziehung",     "Erziehung",       "--vibe-stats"),
  klient:        make("klient",        "Klient:in",       "--wed"),
  angehoerig:    make("angehoerig",    "Angehörige:r",    "--vibe-stats"),
  lead:          make("lead",          "Stationsleitung", "--vibe-team"),
  // Strukturell — kein Beruf, sondern Plattform-Modul
  treuhand:      make("treuhand",      "Treuhand",        "--accent"),
  compliance:    make("compliance",    "Compliance",      "--vibe-team"),
  notfall:       make("notfall",       "Notfall",         "--mon"),
  genossenschaft:make("genossenschaft","Genossenschaft",  "--accent"),
  konferenz:     make("konferenz",     "Konferenz",       "--accent"),
  default:       make("default",       "Plattform",       "--accent"),
};

export function themeFor(rolle: string): RolleTheme {
  return ROLE_THEMES[rolle] ?? ROLE_THEMES.default;
}
