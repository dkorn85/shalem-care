// OAuth-Provider-Katalog · für /registrieren und /anmelden.
//
// Liste der Provider, die wir in Supabase Auth aktivieren wollen.
// In Supabase Dashboard → Authentication → Providers musst du diese
// einzeln einschalten (siehe docs/AUTH_SETUP.md). Sobald aktiviert,
// kann die Client-Seite via supabase.auth.signInWithOAuth({ provider })
// die Flows starten.
//
// Phase 2 ergänzt: VerimiID + Yes (deutsche Identitäts-Anbieter mit
// echtem Personalausweis-Read-Out via NFC) — die geben uns die
// "Echtheits-Zertifizierung" auf Bürger-Niveau.

export type AuthProvider = {
  id: string;                    // Supabase-Provider-Slug
  label: string;                 // UI-Label
  beschreibung: string;
  farbe: string;                 // CSS-Variable
  icon?: string;                 // optional asset path
  vertrauen: "basis" | "verifiziert" | "hoch";
  vorhanden: "live" | "geplant" | "phase2";
};

export const AUTH_PROVIDER: AuthProvider[] = [
  // ─── Mainstream ──────────────────────────────────────────────────────
  {
    id: "google",
    label: "Google",
    beschreibung: "Schnellster Login. Google-Konto erforderlich.",
    farbe: "var(--vibe-team)",
    vertrauen: "basis",
    vorhanden: "geplant",
  },
  {
    id: "apple",
    label: "Apple",
    beschreibung: "iCloud-Konto. Email-Versteckung möglich.",
    farbe: "var(--fg)",
    vertrauen: "basis",
    vorhanden: "geplant",
  },
  {
    id: "azure",
    label: "Microsoft",
    beschreibung: "Microsoft / Outlook / Office 365.",
    farbe: "var(--vibe-stats)",
    vertrauen: "basis",
    vorhanden: "geplant",
  },
  {
    id: "github",
    label: "GitHub",
    beschreibung: "Für Entwickler:innen — Demo-Zugriff.",
    farbe: "var(--mon)",
    vertrauen: "basis",
    vorhanden: "live",
  },
  // ─── Email/Passwort ──────────────────────────────────────────────────
  {
    id: "email",
    label: "E-Mail + Passwort",
    beschreibung: "Klassisch. Email-Bestätigung erforderlich.",
    farbe: "var(--fri)",
    vertrauen: "basis",
    vorhanden: "live",
  },
  // ─── Health-spezifisch (Phase 2) ─────────────────────────────────────
  {
    id: "verimi",
    label: "Verimi",
    beschreibung: "Deutsche ID-Plattform · Personalausweis-Verifizierung.",
    farbe: "var(--accent)",
    vertrauen: "hoch",
    vorhanden: "phase2",
  },
  {
    id: "yes",
    label: "yes® Bank-Login",
    beschreibung: "Login über deine Bank · KYC-geprüft.",
    farbe: "var(--thu)",
    vertrauen: "verifiziert",
    vorhanden: "phase2",
  },
  {
    id: "gematik",
    label: "Gesundheits-ID (gematik)",
    beschreibung: "Telematikinfrastruktur · für Pflegekräfte mit eHBA.",
    farbe: "var(--vibe-profile)",
    vertrauen: "hoch",
    vorhanden: "phase2",
  },
];

export const VERTRAUEN_LABEL: Record<AuthProvider["vertrauen"], string> = {
  basis:        "Basis-Konto",
  verifiziert:  "Identität geprüft",
  hoch:         "Echtheits-zertifiziert",
};

export const STATUS_LABEL: Record<AuthProvider["vorhanden"], string> = {
  live:    "verfügbar",
  geplant: "in Konfiguration",
  phase2:  "Phase 2",
};
