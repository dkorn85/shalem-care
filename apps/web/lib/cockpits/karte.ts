// Anreicherung der CockpitSubNav-Registry mit Beruf-Akzent + Expertise-Label.
//
// Quelle der Wahrheit: `lib/cockpit-sub-nav/registry.ts` für die Sub-Reiter
// pro Familie · `components/AppShell.tsx` für Akzent + Label · `lib/ui/expertise.ts`
// für Expertise-Stufen. Hier nur kuratierte Brücke ohne Komponenten-Import,
// damit auch von Server-Components ohne "use client"-Kette nutzbar.

import { COCKPIT_SUB_NAV, type SubNavGruppe } from "@/lib/cockpit-sub-nav/registry";
import { EXPERTISE_LABELS, type ExpertiseRolle } from "@/lib/ui/expertise";

/** Mapping Cockpit-Basis-Route → Beruf-Akzentfarbe (CSS-var-Form, ohne `var()`). */
export const KARTE_AKZENT: Record<string, string> = {
  "/pflege":         "var(--mon)",
  "/arzt":           "var(--vibe-profile)",
  "/therapie":       "var(--fri)",
  "/sozial":         "var(--tue)",
  "/admin":          "var(--vibe-team)",
  "/klient":         "var(--thu)",
  "/genossenschaft": "var(--thu)",
  "/apotheke":       "var(--vibe-team)",
  "/medizintechnik": "var(--vibe-stats)",
  "/rettungsdienst": "var(--mon)",
  "/bestatter":      "var(--vibe-profile)",
  "/begleitung":     "var(--wed)",
};

/** Mapping Basis-Route → ExpertiseRolle (für Stufen-Anzeige). */
export const KARTE_EXPERTISE: Record<string, ExpertiseRolle | null> = {
  "/pflege":         "pflege",
  "/arzt":           "arzt",
  "/therapie":       "therapie",
  "/sozial":         "sozial",
  "/admin":          "lead",
  "/klient":         null,
  "/genossenschaft": "genossenschaft",
  "/apotheke":       "apotheke",
  "/medizintechnik": "medizintechnik",
  "/rettungsdienst": "rettungsdienst",
  "/bestatter":      "bestatter",
  "/begleitung":     "begleitung",
};

export type AngereicherteGruppe = SubNavGruppe & {
  akzent:        string;
  expertiseRolle: ExpertiseRolle | null;
  expertiseStufen?: { lerne: string; praxis: string; profi: string };
};

export function alleAngereicherten(): AngereicherteGruppe[] {
  return COCKPIT_SUB_NAV.map((g) => {
    const rolle = KARTE_EXPERTISE[g.basis] ?? null;
    return {
      ...g,
      akzent: KARTE_AKZENT[g.basis] ?? "var(--vibe-team)",
      expertiseRolle: rolle,
      expertiseStufen: rolle
        ? {
            lerne:  EXPERTISE_LABELS[rolle].lerne,
            praxis: EXPERTISE_LABELS[rolle].praxis,
            profi:  EXPERTISE_LABELS[rolle].profi,
          }
        : undefined,
    };
  });
}
