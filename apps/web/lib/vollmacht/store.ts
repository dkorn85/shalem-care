// Vollmacht-Store · Hybrid Memory + Supabase.
//
// Vorsorge-/Betreuungs-/Patientenverfügungs-/Angehörigen-Vollmachten
// pro Klient:in. Demo-Seed mit 3 Einträgen für Helga (Tochter Liane,
// PV, Schwester Heike).

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";

export type VollmachtArt =
  | "vorsorge"
  | "betreuung"
  | "patientenverfuegung"
  | "angehoerige"
  | "ehegatten-notvertretung";

export type Aufgabenkreis =
  | "gesundheit"
  | "aufenthalt"
  | "vermoegen"
  | "behoerden"
  | "wohnung"
  | "post";

export type Vollmacht = {
  id?:                       number;
  klientId:                  string;
  art:                       VollmachtArt;
  bevollmaechtigterUserId?:  string;
  bevollmaechtigterName:     string;
  bevollmaechtigterAnschrift?: string;
  bevollmaechtigterTelefon?: string;
  beziehung?:                string;
  aufgabenkreise:            Aufgabenkreis[];
  beglaubigtDurch?:          string;
  beglaubigtAm?:             string;
  gueltigVon:                string;
  gueltigBis?:               string;
  dokumentUrl?:              string;
  notizen?:                  string;
  aktiv:                     boolean;
  widerrufenAm?:             string;
  widerrufenGrund?:          string;
};

export const ART_LABEL: Record<VollmachtArt, string> = {
  vorsorge:                "Vorsorge-Vollmacht",
  betreuung:               "Gesetzliche Betreuung",
  patientenverfuegung:     "Patientenverfügung",
  angehoerige:             "Angehörigen-Vereinbarung",
  "ehegatten-notvertretung": "Ehegatten-Notvertretung",
};

export const ART_FARBE: Record<VollmachtArt, string> = {
  vorsorge:                "var(--vibe-team)",
  betreuung:               "var(--vibe-approval)",
  patientenverfuegung:     "var(--thu)",
  angehoerige:             "var(--fri)",
  "ehegatten-notvertretung": "var(--vibe-approval)",
};

export const AUFGABENKREIS_LABEL: Record<Aufgabenkreis, string> = {
  gesundheit: "Gesundheitssorge",
  aufenthalt: "Aufenthaltsbestimmung",
  vermoegen:  "Vermögenssorge",
  behoerden:  "Behördenangelegenheiten",
  wohnung:    "Wohnungsangelegenheiten",
  post:       "Post + Telekommunikation",
};

// ─────────────────────────────────────────────────────────────────────
// Memory-Cache + Demo-Seed
// ─────────────────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __SHALEM_VOLLMACHT__: Vollmacht[] | undefined;
}

function seedDemo(): Vollmacht[] {
  return [
    {
      klientId: "klient-hr",
      art: "vorsorge",
      bevollmaechtigterName: "Liane Volkmann",
      beziehung: "Tochter",
      aufgabenkreise: ["gesundheit", "aufenthalt", "behoerden", "post"],
      beglaubigtDurch: "Notar Dr. Schreiber, Essen",
      beglaubigtAm: "2024-03-12",
      gueltigVon: "2024-03-12",
      notizen: "Vorsorgevollmacht für medizinische + behördliche Angelegenheiten · Anschrift gemeinsamer Lebensmittelpunkt",
      aktiv: true,
    },
    {
      klientId: "klient-hr",
      art: "patientenverfuegung",
      bevollmaechtigterName: "Helga Reinhardt selbst",
      beziehung: "—",
      aufgabenkreise: ["gesundheit"],
      beglaubigtDurch: "eigenhändig + 2 Zeugen",
      beglaubigtAm: "2023-09-04",
      gueltigVon: "2023-09-04",
      notizen: "Schriftliche PV nach BGB § 1827 · Wunsch nach Sterbe-Begleitung, keine Reanimation, palliative Versorgung priorisiert",
      aktiv: true,
    },
    {
      klientId: "klient-hr",
      art: "angehoerige",
      bevollmaechtigterName: "Heike Liebenau",
      beziehung: "Schwester",
      aufgabenkreise: ["gesundheit"],
      gueltigVon: "2026-01-15",
      notizen: "Familiär vereinbarte Erreichbarkeit als 2. Ansprechpartnerin · informelle Vereinbarung, keine notarielle Beglaubigung",
      aktiv: true,
    },
  ];
}

const STORE: Vollmacht[] = globalThis.__SHALEM_VOLLMACHT__ ?? seedDemo();
globalThis.__SHALEM_VOLLMACHT__ = STORE;

// ─────────────────────────────────────────────────────────────────────
// Sync-API
// ─────────────────────────────────────────────────────────────────────

export function vollmachtenFuerKlient(klientId: string): Vollmacht[] {
  return STORE.filter((v) => v.klientId === klientId && v.aktiv);
}

export function vollmachtenFuerBevollmaechtigten(userId: string): Vollmacht[] {
  return STORE.filter((v) => v.bevollmaechtigterUserId === userId && v.aktiv);
}

/** Darf user_id im Aufgabenkreis X für Klient:in handeln? */
export function darfImNamenHandeln(klientId: string, userId: string, aufgabe: Aufgabenkreis): boolean {
  const heute = new Date().toISOString().slice(0, 10);
  return STORE.some((v) =>
    v.klientId === klientId
    && v.bevollmaechtigterUserId === userId
    && v.aktiv
    && !v.widerrufenAm
    && v.aufgabenkreise.includes(aufgabe)
    && (!v.gueltigVon || v.gueltigVon <= heute)
    && (!v.gueltigBis || v.gueltigBis >= heute),
  );
}

// ─────────────────────────────────────────────────────────────────────
// Async-API · Supabase-aware
// ─────────────────────────────────────────────────────────────────────

type SupabaseRow = {
  id:                          number;
  klient_id:                   string;
  art:                         VollmachtArt;
  bevollmaechtigter_user_id:   string | null;
  bevollmaechtigter_name:      string;
  bevollmaechtigter_anschrift: string | null;
  bevollmaechtigter_telefon:   string | null;
  beziehung:                   string | null;
  aufgabenkreise:              Aufgabenkreis[];
  beglaubigt_durch:            string | null;
  beglaubigt_am:               string | null;
  gueltig_von:                 string;
  gueltig_bis:                 string | null;
  dokument_url:                string | null;
  notizen:                     string | null;
  aktiv:                       boolean;
  widerrufen_am:               string | null;
  widerrufen_grund:            string | null;
};

function ausRow(r: SupabaseRow): Vollmacht {
  return {
    id:                          r.id,
    klientId:                    r.klient_id,
    art:                         r.art,
    bevollmaechtigterUserId:     r.bevollmaechtigter_user_id    ?? undefined,
    bevollmaechtigterName:       r.bevollmaechtigter_name,
    bevollmaechtigterAnschrift:  r.bevollmaechtigter_anschrift  ?? undefined,
    bevollmaechtigterTelefon:    r.bevollmaechtigter_telefon    ?? undefined,
    beziehung:                   r.beziehung                    ?? undefined,
    aufgabenkreise:              r.aufgabenkreise,
    beglaubigtDurch:             r.beglaubigt_durch             ?? undefined,
    beglaubigtAm:                r.beglaubigt_am                ?? undefined,
    gueltigVon:                  r.gueltig_von,
    gueltigBis:                  r.gueltig_bis                  ?? undefined,
    dokumentUrl:                 r.dokument_url                 ?? undefined,
    notizen:                     r.notizen                      ?? undefined,
    aktiv:                       r.aktiv,
    widerrufenAm:                r.widerrufen_am                ?? undefined,
    widerrufenGrund:             r.widerrufen_grund             ?? undefined,
  };
}

export async function ladeVollmachtenFuerKlient(klientId: string): Promise<Vollmacht[]> {
  if (!isSupabaseConfigured()) return vollmachtenFuerKlient(klientId);
  try {
    const rows = await supabaseSelect<SupabaseRow[]>(
      `vollmacht?klient_id=eq.${klientId}&aktiv=eq.true&select=*&order=art.asc`,
    );
    const mapped = rows.map(ausRow);
    if (mapped.length > 0) {
      // Memory-Refresh
      for (let i = STORE.length - 1; i >= 0; i--) {
        if (STORE[i].klientId === klientId) STORE.splice(i, 1);
      }
      STORE.push(...mapped);
    }
    return mapped;
  } catch {
    return vollmachtenFuerKlient(klientId);
  }
}
