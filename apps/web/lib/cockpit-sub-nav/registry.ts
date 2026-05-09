// Registry für die kontextuelle Sub-Navigation in Cockpit-Bereichen.
//
// Die Hauptnavigation (links/Drawer) zeigt die Top-Level-Bereiche je Rolle.
// Diese SubNav ist eine zweite, horizontale Ebene direkt unter dem Header
// — sie zeigt Unter-Bereiche der aktuellen Cockpit-Familie und wechselt
// kontextabhängig.
//
// Beispiel: /therapie/* zeigt unter dem Header die Reiter
// Heute · Patient:innen · Naturheil · Psychedelika · Abrechnung
// — sodass der Wechsel zwischen Schul-/Komplementärmedizin nur einen
// Klick entfernt ist statt drei Drawer-Etagen.

export type SubNavItem = {
  href: string;
  label: string;
  vibe: string;
  /** kurzes Erklärungs-Label, erscheint optional als Tooltip / Sub-Zeile */
  hint?: string;
  /** Symbol als unicode glyph — bewusst kein react-icon-pkg, damit es leicht bleibt */
  glyph?: string;
};

export type SubNavGruppe = {
  /** route-Präfix, ab dem diese SubNav greift; muss mit "/" beginnen */
  basis: string;
  eyebrow: string;
  items: SubNavItem[];
};

export const COCKPIT_SUB_NAV: SubNavGruppe[] = [
  {
    basis: "/therapie",
    eyebrow: "Therapie · Praxis",
    items: [
      { href: "/therapie/heute",        label: "Heute",         vibe: "var(--accent)",        glyph: "◐", hint: "Tagesplan" },
      { href: "/therapie",              label: "Cockpit",       vibe: "var(--fri)",           glyph: "◇", hint: "Übersicht" },
      { href: "/therapie/patienten",    label: "Patient:innen", vibe: "var(--vibe-profile)",  glyph: "◌", hint: "VAS · ROM · Kraft" },
      { href: "/therapie/naturheil",    label: "Naturheil",     vibe: "var(--thu)",           glyph: "❀", hint: "TCM · Phyto · Anthroposophie" },
      { href: "/therapie/psychedelika", label: "Psychedelika",  vibe: "var(--vibe-profile)",  glyph: "✦", hint: "Esketamin · Cannabis · MDMA-Pipeline" },
      { href: "/therapie/diktat",       label: "Diktat",        vibe: "var(--fri)",           glyph: "◴", hint: "KI-Termin-Doku" },
      { href: "/therapie/abrechnung",   label: "Abrechnung",    vibe: "var(--vibe-stats)",    glyph: "€",  hint: "DTA SGB V" },
    ],
  },
  {
    basis: "/pflege",
    eyebrow: "Pflege · Station",
    items: [
      { href: "/pflege/heute",   label: "Heute",         vibe: "var(--accent)",        glyph: "◐", hint: "Schicht jetzt" },
      { href: "/pflege",         label: "Cockpit",       vibe: "var(--vibe-plan)",     glyph: "◇", hint: "Übersicht" },
      { href: "/pflege/tour",    label: "Tour-KI",       vibe: "var(--fri)",           glyph: "✦", hint: "Routen-Optimierung" },
      { href: "/pflege/wunde",   label: "Wunde",         vibe: "var(--vibe-profile)",  glyph: "✚", hint: "Wundmanagement" },
      { href: "/pflege/selbst",  label: "Selbstpflege",  vibe: "var(--mon)",           glyph: "♡", hint: "Akku auffüllen" },
      { href: "/dienst",         label: "Station",       vibe: "var(--vibe-team)",     glyph: "▤", hint: "Übergabe + Wand" },
      { href: "/tausch",         label: "Tausch",        vibe: "var(--vibe-market)",   glyph: "⇆", hint: "Schicht-Markt" },
    ],
  },
  {
    basis: "/arzt",
    eyebrow: "Arzt · Praxis",
    items: [
      { href: "/arzt/heute",      label: "Heute",          vibe: "var(--accent)",       glyph: "◐", hint: "Sprechstunde" },
      { href: "/arzt",            label: "Cockpit",        vibe: "var(--vibe-team)",    glyph: "◇", hint: "Übersicht" },
      { href: "/arzt/patienten",  label: "Patient:innen", vibe: "var(--vibe-profile)", glyph: "◌", hint: "Akten" },
      { href: "/arzt/diktat",     label: "VO-Diktat",     vibe: "var(--vibe-profile)", glyph: "◴", hint: "Verordnung-Diktat" },
      { href: "/arzt/erezepte",   label: "eRezept",       vibe: "var(--accent)",       glyph: "℞", hint: "TI-Pilot" },
      { href: "/arzt/anfragen",   label: "Anfragen",      vibe: "var(--vibe-approval)",glyph: "✓", hint: "Heimbesuch · Konsil" },
    ],
  },
  {
    basis: "/sozial",
    eyebrow: "Sozialarbeit",
    items: [
      { href: "/sozial",            label: "Cockpit",       vibe: "var(--tue)",           glyph: "◇", hint: "Übersicht" },
      { href: "/sozial/faelle",     label: "Fälle",          vibe: "var(--vibe-team)",     glyph: "◌", hint: "Klient:innen" },
      { href: "/sozial/hilfeplan",  label: "Hilfeplan",     vibe: "var(--vibe-approval)", glyph: "✓", hint: "SGB IX § 19" },
      { href: "/sozial/diktat",     label: "Diktat",        vibe: "var(--tue)",           glyph: "◴", hint: "Hilfeplan-Diktat" },
      { href: "/sozial/schutz",     label: "Schutzauftrag", vibe: "var(--mon)",           glyph: "⚠", hint: "§ 8a SGB VIII" },
    ],
  },
  {
    basis: "/admin",
    eyebrow: "Träger-Admin",
    items: [
      { href: "/admin",                   label: "Cockpit",        vibe: "var(--vibe-plan)",     glyph: "◇" },
      { href: "/admin/dienstplan/hud",    label: "KI-HUD",          vibe: "var(--accent)",        glyph: "✦" },
      { href: "/admin/dienstplan",        label: "Dienstplan",     vibe: "var(--vibe-team)",     glyph: "▤" },
      { href: "/admin/team",              label: "Team",           vibe: "var(--vibe-team)",     glyph: "◌" },
      { href: "/admin/kompetenz",         label: "Kompetenz",       vibe: "var(--vibe-profile)",  glyph: "✦", hint: "EU 2005/36/EG" },
      { href: "/admin/genehmigungen",     label: "Genehmig.",      vibe: "var(--vibe-approval)", glyph: "✓" },
      { href: "/admin/zahlungen",         label: "Zahlungen",      vibe: "var(--vibe-stats)",    glyph: "€" },
      { href: "/admin/erloes",            label: "Erlös",          vibe: "var(--vibe-stats)",    glyph: "€" },
      { href: "/admin/auswertung",        label: "Auswertung",      vibe: "var(--vibe-stats)",    glyph: "▲" },
      { href: "/admin/aktivitaet",        label: "Aktivität",       vibe: "var(--vibe-profile)",  glyph: "◴" },
    ],
  },
  {
    basis: "/klient",
    eyebrow: "Mein Bereich",
    items: [
      { href: "/klient",          label: "Übersicht", vibe: "var(--thu)",          glyph: "◇" },
      { href: "/klient/team",     label: "Mein Team", vibe: "var(--vibe-team)",    glyph: "◌", hint: "Wer kümmert sich" },
      { href: "/klient/bescheide",label: "Bescheide", vibe: "var(--vibe-approval)",glyph: "✉", hint: "Kasse + Widerspruch" },
      { href: "/klient/familie",  label: "Familie",   vibe: "var(--fri)",           glyph: "♡" },
    ],
  },
  {
    basis: "/genossenschaft",
    eyebrow: "Genossenschaft",
    items: [
      { href: "/genossenschaft",            label: "Übersicht", vibe: "var(--thu)",          glyph: "◇" },
      { href: "/genossenschaft/mitglieder", label: "Mitglieder",vibe: "var(--vibe-team)",    glyph: "◌" },
      { href: "/genossenschaft/anteile",    label: "Anteile",   vibe: "var(--vibe-stats)",   glyph: "◐" },
      { href: "/genossenschaft/protokoll",  label: "Protokolle",vibe: "var(--vibe-profile)", glyph: "◴" },
    ],
  },
];

/** Findet die passende SubNav-Gruppe zum aktuellen pathname (längster Treffer gewinnt). */
export function gruppeFuerPath(pathname: string): SubNavGruppe | null {
  let beste: SubNavGruppe | null = null;
  for (const g of COCKPIT_SUB_NAV) {
    if (pathname === g.basis || pathname.startsWith(g.basis + "/")) {
      if (!beste || g.basis.length > beste.basis.length) beste = g;
    }
  }
  return beste;
}

/** Prüft, ob ein Item im pathname als aktiv markiert werden soll. */
export function istAktiv(item: SubNavItem, pathname: string): boolean {
  if (item.href === pathname) return true;
  // exakte Cockpit-Übersichtsseite (z.B. /therapie) wird nicht aktiv,
  // wenn eine speziellere Unter-Route (z.B. /therapie/heute) gerade läuft
  const hatSpezifischere = COCKPIT_SUB_NAV
    .flatMap((g) => g.items)
    .some((i) => i.href !== item.href && i.href.startsWith(item.href + "/") && pathname.startsWith(i.href));
  if (hatSpezifischere) return false;
  return pathname.startsWith(item.href + "/");
}
