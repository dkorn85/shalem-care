// Care-Team-Store · Hybrid Memory + Supabase.
//
// Wer kümmert sich um welche Klient:in. Synchron mit dem
// Demo-Bestand aus /klient/team (statische Liste) — bei Supabase-
// Konfiguration kommen dieselben Daten aus der `care_team`-Tabelle
// (siehe supabase/migrations/0003_care_team.sql).
//
// Nutzung:
//  · Sync-API: careTeamFuerKlient(klientId) für SSR-Render mit Default
//  · Async-API: ladeCareTeamFuerKlient(klientId) für Hydration

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";

export type CareTeamBeruf =
  | "pflege" | "arzt" | "therapie" | "sozial" | "apotheke"
  | "medizintechnik" | "rettungsdienst" | "bestatter" | "begleitung"
  | "ehrenamt" | "heilerziehung" | "hauswirtschaft" | "erziehung";

export type CareTeamMitglied = {
  id?:          number;
  userId?:      string;
  personId?:    string;
  klientId:     string;
  beruf:        CareTeamBeruf;
  personName:   string;
  rolle:        string;
  was?:         string;
  linkCockpit?: string;
  primaer:      boolean;
  aktiv:        boolean;
  vonDatum:     string;
  bisDatum?:    string;
};

const BERUF_FARBE: Record<CareTeamBeruf, string> = {
  pflege:         "var(--mon)",
  arzt:           "var(--vibe-profile)",
  therapie:       "var(--fri)",
  sozial:         "var(--tue)",
  apotheke:       "var(--vibe-team)",
  medizintechnik: "var(--vibe-stats)",
  rettungsdienst: "var(--mon)",
  bestatter:      "var(--vibe-profile)",
  begleitung:     "var(--wed)",
  ehrenamt:       "var(--thu)",
  heilerziehung:  "var(--sat)",
  hauswirtschaft: "var(--sun)",
  erziehung:      "var(--wed)",
};

const BERUF_LABEL: Record<CareTeamBeruf, string> = {
  pflege:         "Pflege",
  arzt:           "Arzt",
  therapie:       "Therapie",
  sozial:         "Sozialarbeit",
  apotheke:       "Apotheke",
  medizintechnik: "Medizintechnik",
  rettungsdienst: "Rettungsdienst",
  bestatter:      "Bestatter",
  begleitung:     "Würde-Begleitung",
  ehrenamt:       "Ehrenamt",
  heilerziehung:  "Heilerziehung",
  hauswirtschaft: "Hauswirtschaft",
  erziehung:      "Erziehung",
};

export function berufFarbe(b: CareTeamBeruf): string { return BERUF_FARBE[b]; }
export function berufLabel(b: CareTeamBeruf): string { return BERUF_LABEL[b]; }

// ─────────────────────────────────────────────────────────────────────
// Memory-Cache + Demo-Seed
// ─────────────────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __SHALEM_CARE_TEAM__: CareTeamMitglied[] | undefined;
}

function seedDemo(): CareTeamMitglied[] {
  const heute = new Date().toISOString().slice(0, 10);
  return [
    { klientId: "klient-hr", beruf: "pflege",         personName: "Dennis Reuter",        rolle: "Bezugspflegekraft P7", was: "Tour täglich · SIS-Doku · Wundverlauf",        linkCockpit: "/pflege/heute",          primaer: true, aktiv: true, vonDatum: heute },
    { klientId: "klient-hr", beruf: "arzt",           personName: "Dr. Susanne Hartmann", rolle: "Hausärztin",            was: "Visite 1×/Woche · Verordnungen · Konsile",       linkCockpit: "/arzt/heute",            primaer: true, aktiv: true, vonDatum: heute },
    { klientId: "klient-hr", beruf: "therapie",       personName: "Sebastian Rauer",      rolle: "Physiotherapeut",       was: "KG Mob 2×/Wo · 12 Sitzungen · WS1a",             linkCockpit: "/therapie/patienten",    primaer: true, aktiv: true, vonDatum: heute },
    { klientId: "klient-hr", beruf: "sozial",         personName: "Mira Wagner",          rolle: "Sozialarbeiterin",      was: "Hilfeplan-Review · Pflegegrad-Antrag",          linkCockpit: "/sozial/hilfeplan",      primaer: true, aktiv: true, vonDatum: heute },
    { klientId: "klient-hr", beruf: "heilerziehung",  personName: "Anika Stein",          rolle: "Heilerziehungspflege",  was: "Teilhabe-Plan + HPK · BTHG",                     linkCockpit: "/heilerziehung",         primaer: true, aktiv: true, vonDatum: heute },
    { klientId: "klient-hr", beruf: "hauswirtschaft", personName: "Helmut Brandt",        rolle: "HW-Leitung",            was: "Diabetes-Kostform · Allergen-Filter",            linkCockpit: "/hauswirtschaft",        primaer: true, aktiv: true, vonDatum: heute },
    { klientId: "klient-hr", beruf: "ehrenamt",       personName: "Rita Schöndorf",       rolle: "Hospiz-Begleitung",     was: "Wöchentlich Do 15-16:30 · Tee + Erinnerung",     linkCockpit: "/ehrenamt",              primaer: true, aktiv: true, vonDatum: heute },
    { klientId: "klient-hr", beruf: "begleitung",     personName: "Marlene Voss",         rolle: "Würde-Begleiterin",     was: "Berkana-Berührung 30 min · Hand+Schulter",       linkCockpit: "/begleitung/repertoire", primaer: true, aktiv: true, vonDatum: heute },
    { klientId: "klient-hr", beruf: "apotheke",       personName: "Lukas Faber",          rolle: "Apothekenleitung",      was: "Wochen-Verblisterung + AMTS-Check",              linkCockpit: "/apotheke/heimversorgung", primaer: true, aktiv: true, vonDatum: heute },
  ];
}

const STORE: CareTeamMitglied[] = globalThis.__SHALEM_CARE_TEAM__ ?? seedDemo();
globalThis.__SHALEM_CARE_TEAM__ = STORE;

// ─────────────────────────────────────────────────────────────────────
// Sync-API · Memory
// ─────────────────────────────────────────────────────────────────────

export function careTeamFuerKlient(klientId: string): CareTeamMitglied[] {
  return STORE.filter((m) => m.klientId === klientId && m.aktiv);
}

export function klientenFuerUser(userId: string): string[] {
  return Array.from(new Set(STORE.filter((m) => m.userId === userId && m.aktiv).map((m) => m.klientId)));
}

export function alleAktivenMitglieder(): CareTeamMitglied[] {
  return STORE.filter((m) => m.aktiv);
}

// ─────────────────────────────────────────────────────────────────────
// Async-API · Supabase-aware Hydration
// ─────────────────────────────────────────────────────────────────────

type SupabaseRow = {
  id:            number;
  user_id:       string | null;
  person_id:     string | null;
  klient_id:     string;
  beruf:         CareTeamBeruf;
  person_name:   string;
  rolle:         string;
  was:           string | null;
  link_cockpit:  string | null;
  primaer:       boolean;
  aktiv:         boolean;
  von_datum:     string;
  bis_datum:     string | null;
};

function ausRow(r: SupabaseRow): CareTeamMitglied {
  return {
    id:          r.id,
    userId:      r.user_id      ?? undefined,
    personId:    r.person_id    ?? undefined,
    klientId:    r.klient_id,
    beruf:       r.beruf,
    personName:  r.person_name,
    rolle:       r.rolle,
    was:         r.was          ?? undefined,
    linkCockpit: r.link_cockpit ?? undefined,
    primaer:     r.primaer,
    aktiv:       r.aktiv,
    vonDatum:    r.von_datum,
    bisDatum:    r.bis_datum    ?? undefined,
  };
}

export async function ladeCareTeamFuerKlient(klientId: string): Promise<CareTeamMitglied[]> {
  if (!isSupabaseConfigured()) return careTeamFuerKlient(klientId);
  try {
    const rows = await supabaseSelect<SupabaseRow[]>(
      `care_team?klient_id=eq.${klientId}&aktiv=eq.true&select=*&order=primaer.desc,beruf.asc`,
    );
    const mapped = rows.map(ausRow);
    // Memory-Refresh — vorhandene Demo-Daten ggf. ersetzen, neue ergänzen
    if (mapped.length > 0) {
      // Entferne den alten Klient-Stand
      for (let i = STORE.length - 1; i >= 0; i--) {
        if (STORE[i].klientId === klientId) STORE.splice(i, 1);
      }
      STORE.push(...mapped);
    }
    return mapped;
  } catch {
    return careTeamFuerKlient(klientId);
  }
}
