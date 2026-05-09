// Cross-Beruf-Brücken pro Sub-Cockpit-Route.
//
// Wo verlässt eine Information dieses Cockpit? An wen geht sie? Mit
// welchem konkreten Schritt? Diese Brücken machen die multidisziplinäre
// Sicht klickbar — keine doppelte Datenhaltung, nur ein „nach hier weiter"
// am Ende der Cockpit-Page.

export type Bruecke = {
  zielHref:    string;            // Sprungziel
  zielLabel:   string;            // wo lande ich (Beruf · Bereich)
  was:         string;            // was geht da rein / was passiert dort
  richtung:    "raus" | "rein";   // raus = ich gebe weiter · rein = ich bekomme von dort
};

/** Mapping Cockpit-Route → ausgewählte Brücken. Keys exakte pathname-Matches. */
export const BRUECKEN: Record<string, Bruecke[]> = {
  // ───────────── Apotheke ─────────────
  "/apotheke/heimversorgung": [
    { zielHref: "/pflege/heute",      zielLabel: "Pflege · Heute",        was: "AMTS-Hinweise je Bewohner:in landen im Pflege-Briefing",                       richtung: "raus" },
    { zielHref: "/arzt/anfragen",     zielLabel: "Arzt · Anfragen",       was: "Polypharmazie-Konsil bei AMTS-Score ≥6 anstoßen",                              richtung: "raus" },
    { zielHref: "/klient/team",       zielLabel: "Klient · Team",         was: "Stellplan + Bedarfsmedikation in der Klient:innen-Akte sichtbar",              richtung: "raus" },
  ],
  "/apotheke/btm": [
    { zielHref: "/arzt/erezepte",      zielLabel: "Arzt · eRezept",        was: "BtM-Rezept-Eingang aus Arzt-Cockpit (gelb) wird hier verbucht",               richtung: "rein" },
    { zielHref: "/admin/dokumentation",zielLabel: "Träger · Doku",          was: "Quartalsbestand 31.3 / 30.6 / 30.9 / 31.12 in PDL-Doku",                       richtung: "raus" },
  ],
  "/apotheke/wechselwirkung": [
    { zielHref: "/therapie/naturheil", zielLabel: "Therapie · Naturheil",   was: "Phyto-Crossings (Johanniskraut, Mistel) kommen aus dem Naturheil-Stack",     richtung: "rein" },
    { zielHref: "/therapie/psychedelika", zielLabel: "Therapie · Psychedelika", was: "Spravato↔MAO + Cannabis↔Marcumar werden im Trip-Sitting beachtet",      richtung: "raus" },
  ],

  // ───────────── Medizintechnik ─────────────
  "/medizintechnik/mdr": [
    { zielHref: "/admin/dokumentation",zielLabel: "Träger · Doku",          was: "Bestandsverzeichnis-Print + Medizinproduktebuch nach § 13 MPBetreibV",       richtung: "raus" },
    { zielHref: "/pflege/wunde",       zielLabel: "Pflege · Wunde",         was: "Wechseldruck-Matratze-Einweisung wird im Pflege-Brief erfasst",              richtung: "raus" },
  ],
  "/medizintechnik/wartung": [
    { zielHref: "/pflege/heute",       zielLabel: "Pflege · Heute",         was: "Vorkommnis-Briefing: Pflege erhält Hygiene-/Bedienhinweis",                  richtung: "raus" },
    { zielHref: "/admin/genehmigungen",zielLabel: "Träger · Genehmig.",     was: "Außerbetriebnahme-Antrag bei kritischer Vigilanz",                            richtung: "raus" },
  ],
  "/medizintechnik/pool": [
    { zielHref: "/admin/erloes",       zielLabel: "Träger · Erlös",         was: "Wiedereinsatz-Ersparnis fließt in Quartals-Wirtschaftlichkeit",               richtung: "raus" },
    { zielHref: "/lieferanten",        zielLabel: "Lieferanten",            was: "Aufbereitungs-Partner (Hygiene-Wäscherei, Werkstatt) verwaltet",              richtung: "rein" },
  ],

  // ───────────── Rettungsdienst ─────────────
  "/rettungsdienst/protokoll": [
    { zielHref: "/arzt/heute",         zielLabel: "Arzt · Heute",           was: "Mind2-Übergabe an aufnehmende:n Diensthabende:n in der Klinik",              richtung: "raus" },
    { zielHref: "/pflege/heute",       zielLabel: "Pflege · Heute",         was: "Heim-Bewohner:in zurück: Vor-Medikation + Maßnahmen kommen in die Akte",     richtung: "raus" },
    { zielHref: "/klient/team",        zielLabel: "Klient · Team",          was: "Klient:in/Familie sieht den Einsatz im Team-um-Klient-Cockpit",              richtung: "raus" },
  ],
  "/rettungsdienst/sop": [
    { zielHref: "/fortbildung",        zielLabel: "Fortbildung",            was: "30 h NotSan-Pflicht-Fortbildung jährlich · Algorithmus-Training",            richtung: "raus" },
  ],
  "/rettungsdienst/hygiene": [
    { zielHref: "/bestatter/versorgung", zielLabel: "Bestatter · Versorgung", was: "Bei verstorbenen Infekt-Patient:innen: PSA-Empfehlung wird übergeben",      richtung: "raus" },
    { zielHref: "/pflege/heute",        zielLabel: "Pflege · Heute",         was: "Heim-Übergabe mit Hygiene-Stichwort an die zuständige Schicht",             richtung: "raus" },
  ],

  // ───────────── Bestatter ─────────────
  "/bestatter/versorgung": [
    { zielHref: "/pflege/heute",         zielLabel: "Pflege · Heute",         was: "Letzte Pflege-Schicht übergibt Sterbe-Phase-Doku + Wünsche",                richtung: "rein" },
    { zielHref: "/begleitung/sterbewache", zielLabel: "Begleitung · Sterbe-Wache", was: "Vigilie-Schichtplan endet · Übergabe nach Eintritt des Todes",         richtung: "rein" },
    { zielHref: "/rettungsdienst/hygiene", zielLabel: "Rettungsdienst · Hygiene", was: "RKI-Profile teilen die PSA-Stufe für die Versorgung",                    richtung: "rein" },
  ],
  "/bestatter/bestattungsarten": [
    { zielHref: "/sozial/hilfeplan",     zielLabel: "Sozial · Hilfeplan",     was: "§ 74 SGB XII Sozialhilfe-Bestattung beim örtlichen Sozialamt beantragen",   richtung: "raus" },
    { zielHref: "/klient/holistik",      zielLabel: "Klient · Holistik",      was: "Vorsorge-Wünsche im Lebensbuch hinterlegen",                                 richtung: "rein" },
  ],
  "/bestatter/trauerbegleitung": [
    { zielHref: "/ehrenamt",             zielLabel: "Ehrenamt",                was: "Hospiz-Verein-Trauergruppen + Casual-Begleitung verfügbar",                  richtung: "raus" },
    { zielHref: "/begleitung/repertoire",zielLabel: "Begleitung · Repertoire", was: "Familien-Berührungs-Begleitung nach Tod eines Angehörigen",                  richtung: "raus" },
  ],

  // ───────────── Begleitung ─────────────
  "/begleitung/repertoire": [
    { zielHref: "/fortbildung",         zielLabel: "Fortbildung",             was: "Berkana / Validation / Aroma-Pflege als zertifizierte Module",               richtung: "raus" },
    { zielHref: "/pflege/heute",        zielLabel: "Pflege · Heute",          was: "Methoden-Wahl wird in der Pflege-Schicht abgesprochen",                       richtung: "raus" },
  ],
  "/begleitung/einwilligung": [
    { zielHref: "/identity",            zielLabel: "Identity-Registry",        was: "Vorsorge-Vollmacht / Patientenverfügung als Identity-Asset gespeichert",     richtung: "rein" },
    { zielHref: "/admin/dokumentation", zielLabel: "Träger · Doku",            was: "Verlauf-Doku DSGVO-konform pseudonymisiert archiviert",                       richtung: "raus" },
  ],
  "/begleitung/sterbewache": [
    { zielHref: "/pflege/heute",        zielLabel: "Pflege · Heute",           was: "Bedarfs-Medikation (Morphin/Buscopan/Lorazepam) wird vom Pflegeplan gegeben", richtung: "rein" },
    { zielHref: "/bestatter/versorgung",zielLabel: "Bestatter · Versorgung",   was: "Nach Eintritt des Todes übernimmt der Bestatter die Versorgung",              richtung: "raus" },
    { zielHref: "/ehrenamt",            zielLabel: "Ehrenamt · Hospiz",        was: "Schicht-Plan kann durch ausgebildete Hospiz-Ehrenamtliche ergänzt werden",    richtung: "rein" },
  ],

  // ───────────── Therapie · neu (Naturheil + Psychedelika) ─────────────
  "/therapie/naturheil": [
    { zielHref: "/apotheke/wechselwirkung", zielLabel: "Apotheke · Wechselwirkung", was: "Phyto-Crossings (Johanniskraut, Mistel) prüfen vor Anwendung",         richtung: "raus" },
    { zielHref: "/pflege/wunde",            zielLabel: "Pflege · Wunde",            was: "Wickel + Aroma sind pflegerisch integrierbar (Berkana-Schnitt)",        richtung: "raus" },
  ],
  "/therapie/psychedelika": [
    { zielHref: "/apotheke/btm",            zielLabel: "Apotheke · BtM",          was: "Esketamin (Spravato) + Cannabis-Bedrocan über BtM-Buch dokumentieren",   richtung: "raus" },
    { zielHref: "/begleitung/sterbewache",  zielLabel: "Begleitung · Sterbe-Wache", was: "Schwere-Therapie-Resistenz: Trauerprozess zusätzlich begleiten",       richtung: "raus" },
  ],
};

/** Holt Brücken für eine Route. Leerer Array wenn nichts hinterlegt. */
export function brueckenFuer(pathname: string): Bruecke[] {
  return BRUECKEN[pathname] ?? [];
}
