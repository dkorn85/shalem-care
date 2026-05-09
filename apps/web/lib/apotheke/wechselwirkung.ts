// Vereinfachter Wechselwirkungs-Check als Lehr- + Cockpit-Demo.
//
// Echtdaten kommen in Phase 2 aus der ABDA-Datenbank (CAVE,
// Interaktion + AMTS-WAR-Tabelle). Hier ein kuratierter Mini-Katalog
// häufiger relevanter Konstellationen für die Pflege- + Heimversorgung,
// inkl. typischer Schul-/Naturheil-Crossings.

export type WwSchwere = "leicht" | "moderat" | "schwer" | "kontraindiziert";

export type Wechselwirkung = {
  id:        string;
  links:     string;            // Wirkstoff A (z.B. Tilidin, Citalopram, Phenprocoumon)
  rechts:    string;            // Wirkstoff B (z.B. Tramadol, Mirtazapin, Johanniskraut)
  schwere:   WwSchwere;
  wirkung:   string;
  empfehlung: string;
  quelle?:   string;            // ABDA-Quellen-Stub / Studien-Referenz
};

export const WW_KATALOG: Wechselwirkung[] = [
  {
    id: "ww-johanniskraut-warfarin",
    links: "Johanniskraut", rechts: "Phenprocoumon / Warfarin",
    schwere: "schwer",
    wirkung: "CYP3A4-Induktion · INR-Abfall · Thrombose-Risiko steigt",
    empfehlung: "Johanniskraut absetzen oder INR engmaschig (wöchentlich) kontrollieren · ESCOP-Monographie warnt explizit",
    quelle: "ESCOP Hypericum + Roten-Hand-Brief 2002",
  },
  {
    id: "ww-johanniskraut-citalopram",
    links: "Johanniskraut", rechts: "Citalopram / SSRI",
    schwere: "schwer",
    wirkung: "Serotonerges Syndrom · Tremor, Agitation, Tachykardie",
    empfehlung: "Kombination vermeiden · 14-Tage-Auswasch zwischen Wechsel · Alternativ Lavendel-Öl-Kapseln (Silexan) erwägen",
    quelle: "ABDA CAVE",
  },
  {
    id: "ww-tilidin-citalopram",
    links: "Tilidin", rechts: "Citalopram",
    schwere: "moderat",
    wirkung: "QT-Verlängerung · Torsade-Risiko bei höheren Dosen",
    empfehlung: "EKG vor Dosis-Erhöhung · Kalium-/Magnesium-Spiegel prüfen · ggf. Tilidin durch Tramadol Vorsicht (gleiches Risiko)",
    quelle: "BfArM Hinweis 2018",
  },
  {
    id: "ww-cannabis-warfarin",
    links: "Cannabis (THC/CBD)", rechts: "Phenprocoumon",
    schwere: "moderat",
    wirkung: "CBD hemmt CYP2C9 · Marcumar-Wirkung steigt · Blutungs-Risiko",
    empfehlung: "INR engmaschig (1-2 wöchentlich) bei Therapie-Start · Dosis ggf. anpassen",
    quelle: "Damkier 2019 · Br J Clin Pharmacol",
  },
  {
    id: "ww-spravato-mao",
    links: "Esketamin (Spravato)", rechts: "MAO-Hemmer",
    schwere: "kontraindiziert",
    wirkung: "Hypertensive Krise · Stroke-Risiko",
    empfehlung: "MAO-Hemmer 14 Tage vorher pausieren · Dokumentation im REMS-Programm",
    quelle: "EMA Spravato Fachinfo 2024",
  },
  {
    id: "ww-mistel-imatinib",
    links: "Mistel (Iscador) i.v.", rechts: "Imatinib / TKI",
    schwere: "moderat",
    wirkung: "Möglich verstärkte Immun-Modulation · Studienlage uneinheitlich",
    empfehlung: "Onkologen einbeziehen · keine eigenständige Mistel-Gabe in laufender Tumor-Therapie ohne Konsil",
    quelle: "S3-Leitlinie Komplementärmedizin Onkologie 2021",
  },
  {
    id: "ww-arnica-warfarin",
    links: "Arnica (D6)", rechts: "Phenprocoumon",
    schwere: "leicht",
    wirkung: "Bei Hochpotenzen klinisch unbedeutend · bei Urtinktur theoretisch Blutungs-Effekt",
    empfehlung: "D6 unbedenklich · Urtinktur bei Antikoagulation nicht topisch auf offene Wunden",
    quelle: "HAB · Hahnemann-Verlag",
  },
  {
    id: "ww-lavendel-benzo",
    links: "Lavendelöl-Kapseln (Silexan)", rechts: "Benzodiazepine (Tavor)",
    schwere: "leicht",
    wirkung: "Additiv sedierend bei Tagesdosis ≥160 mg",
    empfehlung: "Bei älteren Pat. langsam einschleichen · ggf. Reduktions-Plan Benzo (Off-Label)",
    quelle: "EMA HMPC Lavandula 2017",
  },
];

/** Findet alle Wechselwirkungen, in denen einer der Wirkstoffe vorkommt. */
export function wwFuerWirkstoff(wirkstoff: string): Wechselwirkung[] {
  const w = wirkstoff.toLowerCase();
  return WW_KATALOG.filter(
    (e) => e.links.toLowerCase().includes(w) || e.rechts.toLowerCase().includes(w),
  );
}

/** Sucht eine Wechselwirkung zwischen zwei konkreten Wirkstoffen. */
export function wwZwischen(a: string, b: string): Wechselwirkung | null {
  const x = a.toLowerCase(), y = b.toLowerCase();
  return (
    WW_KATALOG.find(
      (e) =>
        (e.links.toLowerCase().includes(x) && e.rechts.toLowerCase().includes(y)) ||
        (e.links.toLowerCase().includes(y) && e.rechts.toLowerCase().includes(x)),
    ) ?? null
  );
}

export const WW_FARBE: Record<WwSchwere, string> = {
  leicht:           "var(--vibe-stats)",
  moderat:          "var(--vibe-approval)",
  schwer:           "var(--mon)",
  kontraindiziert:  "var(--mon)",
};

export const WW_LABEL: Record<WwSchwere, string> = {
  leicht:           "leicht",
  moderat:          "moderat",
  schwer:           "schwer",
  kontraindiziert:  "kontraindiziert",
};
