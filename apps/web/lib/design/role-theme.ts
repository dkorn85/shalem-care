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
  // Pastell-Layer (großzügig eingesetzt für Cockpit-Headers, Cards, Hover)
  pastel: string;           // 'rgb(255 220 200)' — sehr weicher Pastel-Ton
  pastelGlanz: string;      // 'rgb(255 240 230)' — noch heller
  akzent: string;           // 'rgb(220 130 80)' — dazu passender Akzent
  // Optional: Asset-Pfade
  patternBg?: string;       // ggf. Watercolor-Hintergrund-Bild
};

const make = (
  id: string, label: string, varName: string,
  pastel: string, pastelGlanz: string, akzent: string,
  patternBg?: string,
): RolleTheme => ({
  id,
  label,
  primaer: `var(${varName})`,
  primaerRgb: `rgb(var(${varName}))`,
  flaeche: `linear-gradient(135deg, rgb(var(${varName}) / 0.06), transparent)`,
  chipBg: `rgb(var(${varName}) / 0.15)`,
  chipFg: `rgb(var(${varName}))`,
  linie: `rgb(var(${varName}) / 0.35)`,
  shadow: `0 8px 32px rgb(var(${varName}) / 0.12)`,
  pastel,
  pastelGlanz,
  akzent,
  patternBg,
});

// Pastell-Palette — abgestimmt für warme, würdevolle Demo-Optik.
// Identisch zu den Farben auf /livemap, damit der Look konsistent ist.
export const ROLE_THEMES: Record<string, RolleTheme> = {
  pflege:        make("pflege",        "Pflege",          "--mon",
                       "rgb(255 220 200)", "rgb(255 240 230)", "rgb(220 130  80)",
                       "/akte/header-konferenz.png"),
  arzt:          make("arzt",          "Arzt:Ärztin",     "--vibe-profile",
                       "rgb(225 215 250)", "rgb(240 235 255)", "rgb(140 110 210)",
                       "/akte/header-arzt.png"),
  therapie:      make("therapie",      "Therapie",        "--fri",
                       "rgb(210 240 230)", "rgb(230 248 240)", "rgb( 90 170 140)",
                       "/anamnese/header-therapie.png"),
  sozialarbeit:  make("sozialarbeit",  "Sozialarbeit",    "--tue",
                       "rgb(220 240 255)", "rgb(238 248 255)", "rgb( 80 140 190)",
                       "/anamnese/header-sozial.png"),
  heilerziehung: make("heilerziehung", "Heilerziehung",   "--sat",
                       "rgb(245 220 230)", "rgb(252 238 245)", "rgb(190 120 150)"),
  ehrenamt:      make("ehrenamt",      "Ehrenamt",        "--thu",
                       "rgb(225 245 215)", "rgb(240 250 232)", "rgb(110 170  90)",
                       "/anamnese/header-ehrenamt.png"),
  hauswirtschaft:make("hauswirtschaft","Hauswirtschaft",  "--sun",
                       "rgb(255 240 215)", "rgb(255 248 235)", "rgb(210 170  80)"),
  erziehung:     make("erziehung",     "Erziehung",       "--vibe-stats",
                       "rgb(255 245 215)", "rgb(255 250 235)", "rgb(210 180  80)"),
  klient:        make("klient",        "Klient:in",       "--wed",
                       "rgb(255 230 240)", "rgb(255 245 248)", "rgb(220 100 150)"),
  angehoerig:    make("angehoerig",    "Angehörige:r",    "--vibe-stats",
                       "rgb(245 230 250)", "rgb(252 244 254)", "rgb(170 130 200)"),
  lead:          make("lead",          "Stationsleitung", "--vibe-team",
                       "rgb(220 230 250)", "rgb(238 244 252)", "rgb(110 130 200)"),
  // Strukturell — kein Beruf, sondern Plattform-Modul (neutralere Pastels)
  treuhand:      make("treuhand",      "Treuhand",        "--accent",
                       "rgb(230 240 245)", "rgb(244 250 252)", "rgb(100 150 170)"),
  compliance:    make("compliance",    "Compliance",      "--vibe-team",
                       "rgb(225 235 245)", "rgb(242 248 252)", "rgb(110 140 180)"),
  notfall:       make("notfall",       "Notfall",         "--mon",
                       "rgb(255 215 215)", "rgb(255 235 235)", "rgb(220 100 100)"),
  genossenschaft:make("genossenschaft","Genossenschaft",  "--accent",
                       "rgb(245 240 230)", "rgb(252 248 240)", "rgb(180 150 100)"),
  konferenz:     make("konferenz",     "Konferenz",       "--accent",
                       "rgb(240 235 250)", "rgb(248 245 254)", "rgb(150 130 200)"),
  default:       make("default",       "Plattform",       "--accent",
                       "rgb(235 240 245)", "rgb(248 250 252)", "rgb(120 140 170)"),
};

export function themeFor(rolle: string): RolleTheme {
  return ROLE_THEMES[rolle] ?? ROLE_THEMES.default;
}
