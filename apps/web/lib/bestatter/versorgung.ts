// Hygienische Versorgung der/des Verstorbenen + Überführung.
//
// Quellen: Bestattungsgesetze der Länder, RKI „Empfehlungen für die
// Versorgung von Verstorbenen mit Infektionserkrankungen" (2018, Update
// 2024), TRBA 250, Personenstandsgesetz § 31 (Sterbeurkunde),
// § 168 StGB (Störung der Totenruhe), DBV-Standesregeln.
//
// Workflow: Eingang → Identifikation → Würde-bewahrende Versorgung →
// Aufbahrung → Einsargung → Überführung (mit Beförderungsschein).

export type VersorgungsPhase =
  | "eingang"
  | "identifikation"
  | "totenfuersorge"
  | "aufbahrung"
  | "einsargung"
  | "ueberfuehrung";

export const PHASE_LABEL: Record<VersorgungsPhase, string> = {
  "eingang":         "1 · Eingang Würde-Raum",
  "identifikation":  "2 · Identifikation + Doku",
  "totenfuersorge":  "3 · Totenfürsorge · Waschen, Ankleiden",
  "aufbahrung":      "4 · Aufbahrung für Familie",
  "einsargung":      "5 · Einsargung",
  "ueberfuehrung":   "6 · Überführung mit Beförderungsschein",
};

export const PHASE_FARBE: Record<VersorgungsPhase, string> = {
  "eingang":         "var(--accent)",
  "identifikation":  "var(--vibe-stats)",
  "totenfuersorge":  "var(--thu)",
  "aufbahrung":      "var(--vibe-team)",
  "einsargung":      "var(--vibe-profile)",
  "ueberfuehrung":   "var(--vibe-approval)",
};

export type SonderlageTyp =
  | "infektion-rki"
  | "obduktion-staatsanwalt"
  | "unbekannte-todesart"
  | "organspende-laeuft"
  | "religionsspezifisch"
  | "kind-saeugling"
  | "no-touch-wunsch";

export type FallVersorgung = {
  id:                 string;
  verstorben:         string;
  alter:              number;
  einrichtung:        string;
  todeszeit:          string;            // ISO
  totenscheinDurch:   string;            // Arzt
  todesart:           "natuerlich" | "ungeklaert" | "nicht-natuerlich";
  phase:              VersorgungsPhase;
  sonderlage?:        SonderlageTyp[];
  wuerdeNotizen?:     string;            // Wünsche der Familie / Bewohnerin (z.B. Lieblingsbluse)
  beforderungsschein?: string;           // Aktenzeichen
  bemerkung?:         string;
};

export const SONDERLAGE_LABEL: Record<SonderlageTyp, string> = {
  "infektion-rki":           "Infektionserkr. nach RKI",
  "obduktion-staatsanwalt":  "Obduktion · StA-Anordnung",
  "unbekannte-todesart":     "Todesart ungeklärt",
  "organspende-laeuft":      "Organspende läuft",
  "religionsspezifisch":     "Religiöse Versorgung",
  "kind-saeugling":          "Kind / Säugling",
  "no-touch-wunsch":         "No-Touch-Wunsch der Familie",
};

export const SONDERLAGE_FARBE: Record<SonderlageTyp, string> = {
  "infektion-rki":           "var(--mon)",
  "obduktion-staatsanwalt":  "var(--vibe-approval)",
  "unbekannte-todesart":     "var(--vibe-approval)",
  "organspende-laeuft":      "var(--accent)",
  "religionsspezifisch":     "var(--vibe-profile)",
  "kind-saeugling":          "var(--fri)",
  "no-touch-wunsch":         "var(--vibe-team)",
};

export const FAELLE_VERSORGUNG: FallVersorgung[] = [
  {
    id: "v-2026-0506-1",
    verstorben: "Margot Volkmann",
    alter: 87,
    einrichtung: "Wohnstift Prenzl-Berg Berlin",
    todeszeit: "2026-05-06T05:14:00",
    totenscheinDurch: "Dr. Sabine Adler (Hausärztin)",
    todesart: "natuerlich",
    phase: "aufbahrung",
    wuerdeNotizen: "Lila Strickjacke + Perlohrringe (Wunsch der Tochter Liane). Hände gefaltet, Lieblings-Foto vom Garten dazulegen.",
    bemerkung: "Familie wünscht 6h offene Aufbahrung im Wohnstift, Verabschiedung der Mitbewohner:innen.",
  },
  {
    id: "v-2026-0506-2",
    verstorben: "Hubertus Liedtke",
    alter: 91,
    einrichtung: "Charité Pädiatrie (Begleitperson eines Enkels)",
    todeszeit: "2026-05-06T11:42:00",
    totenscheinDurch: "Dr. Helena Brandt (Klinikärztin)",
    todesart: "natuerlich",
    phase: "eingang",
    wuerdeNotizen: "Eigener dunkelgrauer Anzug. Im Sarg eine handgeschriebene Karte vom Enkel.",
  },
  {
    id: "v-2026-0506-3",
    verstorben: "Reinhardt Otto",
    alter: 79,
    einrichtung: "St. Lukas Bochum",
    todeszeit: "2026-05-05T22:08:00",
    totenscheinDurch: "Dr. Susanne Hartmann",
    todesart: "natuerlich",
    phase: "einsargung",
    sonderlage: ["religionsspezifisch"],
    wuerdeNotizen: "Konfessionslos · einfacher Holzsarg, kein Kreuz. Tochter wünscht Friedmut-Lied im Hintergrund während der Versorgung.",
  },
  {
    id: "v-2026-0506-4",
    verstorben: "Sabine Friedrich",
    alter: 64,
    einrichtung: "Bergmannsheil Bochum (verstarb auf Intensiv)",
    todeszeit: "2026-05-06T03:21:00",
    totenscheinDurch: "Dr. Möbius (Notärztin)",
    todesart: "ungeklaert",
    phase: "identifikation",
    sonderlage: ["obduktion-staatsanwalt", "infektion-rki"],
    wuerdeNotizen: "Familie informiert über Obduktions-Anordnung. Versorgung erst nach StA-Freigabe — voraussichtlich Mi.",
    bemerkung: "MRSA-Besiedlung dokumentiert · PSA-Stufe Kontaktschutz · keine Aufbahrung mit Berührung",
  },
  {
    id: "v-2026-0506-5",
    verstorben: "Levi Bachmann",
    alter: 8,
    einrichtung: "Charité Pädiatrische Onkologie",
    todeszeit: "2026-05-06T09:55:00",
    totenscheinDurch: "Dr. Wiesel (Päd-Onko)",
    todesart: "natuerlich",
    phase: "totenfuersorge",
    sonderlage: ["kind-saeugling", "religionsspezifisch"],
    wuerdeNotizen: "Eltern selbst beim Waschen dabei (Wunsch). Eigene Lieblings-Pyjama-Hose mit Rakete. Stofftier 'Henri' zwischen die Hände.",
    bemerkung: "Bunter Kindersarg vorbereitet (Atelier Müller, Werkstatt-Anfertigung) · Trauerbegleitung Familie über Kinderhospiz Sonnenhof aktiv",
  },
];

export function faelleNachPhase(p: VersorgungsPhase): FallVersorgung[] {
  return FAELLE_VERSORGUNG.filter((f) => f.phase === p);
}

export function offeneSonderlagen(): FallVersorgung[] {
  return FAELLE_VERSORGUNG.filter((f) => f.sonderlage && f.sonderlage.length > 0);
}
