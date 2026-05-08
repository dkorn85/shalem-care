// Lerngeschichten-Store nach Margaret Carr · 5 Lerndispositionen.
// Phase-1-Pattern: in-memory Demo-Daten.

export type Lerndisposition =
  | "interesse"           // Sich interessieren
  | "engagement"          // Engagiert sein
  | "ausdauer"            // Standhalten
  | "kommunikation"       // Sich ausdrücken + mitteilen
  | "verantwortung";      // Verantwortung übernehmen

export const LERNDISPO_LABEL: Record<Lerndisposition, string> = {
  interesse:      "Sich interessieren",
  engagement:     "Engagiert sein",
  ausdauer:       "Standhalten",
  kommunikation:  "Sich ausdrücken",
  verantwortung:  "Verantwortung übernehmen",
};

export const LERNDISPO_FARBE: Record<Lerndisposition, string> = {
  interesse:      "var(--fri)",
  engagement:     "var(--mon)",
  ausdauer:       "var(--vibe-team)",
  kommunikation:  "var(--vibe-approval)",
  verantwortung:  "var(--thu)",
};

export type Bildungsbereich =
  | "sprache"             // Sprache + Kommunikation
  | "sozial"              // Soziales + Gefühle
  | "natur"               // Natur + Umwelt + Technik
  | "mathe"               // Mathematik + Logik
  | "kunst"               // Kunst, Musik, Bewegung
  | "werte"               // Werte, Religion, Ethik
  | "koerper";            // Körper + Gesundheit + Bewegung

export const BB_LABEL: Record<Bildungsbereich, string> = {
  sprache:  "Sprache + Kommunikation",
  sozial:   "Soziales + Gefühle",
  natur:    "Natur + Umwelt",
  mathe:    "Mathematik + Logik",
  kunst:    "Kunst + Musik + Bewegung",
  werte:    "Werte + Religion + Ethik",
  koerper:  "Körper + Gesundheit",
};

export const BB_FARBE: Record<Bildungsbereich, string> = {
  sprache:  "var(--vibe-approval)",
  sozial:   "var(--mon)",
  natur:    "var(--thu)",
  mathe:    "var(--vibe-stats)",
  kunst:    "var(--fri)",
  werte:    "var(--sat)",
  koerper:  "var(--vibe-team)",
};

export type Lerngeschichte = {
  id: string;
  kindId: string;
  kind: string;
  alter: string;             // "3;5" Notation
  titel: string;
  datum: string;
  autorin: string;
  bildungsbereiche: Bildungsbereich[];
  lerndispo: Lerndisposition[];
  typ: string;
  status: "entwurf" | "veroeffentlicht";
  text: string;
  fotoVorhanden: boolean;
};

const GESCHICHTEN: Lerngeschichte[] = [
  {
    id: "lg-1",
    kindId: "kind-mia",
    kind: "Mia S.",
    alter: "3;5",
    titel: "Mia kommt jetzt selbstständig in den Kreis",
    datum: "2026-05-06",
    autorin: "Yvonne Berger",
    bildungsbereiche: ["sozial", "sprache"],
    lerndispo: ["interesse", "engagement"],
    typ: "Eingewöhnung Phase 2 abgeschlossen",
    status: "veroeffentlicht",
    text: 'Heute beim Sing-Kreis hat Mia zum ersten Mal ohne Aufforderung in der Mitte Platz genommen. Sie hat sich zu Tarek und Aisha gesetzt, hat gewinkt und mitgesungen — der ganze Refrain von "Mein Hut, der hat drei Ecken". Beim Schluss-Kreis hat sie aktiv ihren Tag erzählt: "Ich war im Werkbereich und hab ein Auto gebaut. Mit Henri." Drei Sätze hintereinander, ungefragt. Eingewöhnung Phase 2 ist offiziell abgeschlossen. Wir bleiben aufmerksam für die typischen kleinen Rückschritte in den nächsten Wochen — aber heute ist ein Meilenstein.',
    fotoVorhanden: false,
  },
  {
    id: "lg-2",
    kindId: "kind-tarek",
    kind: "Tarek B.",
    alter: "4;1",
    titel: "Tarek hat heute zum ersten Mal aktiv um Hilfe gebeten",
    datum: "2026-05-04",
    autorin: "Yvonne Berger",
    bildungsbereiche: ["sprache", "sozial"],
    lerndispo: ["kommunikation", "verantwortung"],
    typ: "Sozialer Meilenstein",
    status: "entwurf",
    text: 'Beim Werkbereich hat Tarek mit dem Holzleim gekämpft — Deckel klemmt. Er hat zu mir geschaut, "Yvonne … bitte" gesagt und auf den Deckel gezeigt. Das war seine erste explizite Hilfsanfrage in voller Sprache. Anika sagt, sie hat ihn die letzten Wochen oft beobachtet, wie er leise nach Lösungen suchte. Heute hat er Mut gefasst. Foto vom Werk angehängt — sein erstes selbstgemaltes Bild für die Mama.',
    fotoVorhanden: true,
  },
  {
    id: "lg-3",
    kindId: "kind-henri",
    kind: "Henri F.",
    alter: "5;7",
    titel: "Henri organisiert das Vorlese-Quartett",
    datum: "2026-04-29",
    autorin: "Yasemin Adler",
    bildungsbereiche: ["mathe", "sozial", "sprache"],
    lerndispo: ["engagement", "verantwortung", "kommunikation"],
    typ: "Schulreife-Beobachtung",
    status: "veroeffentlicht",
    text: 'Henri hat in der Adler-Gruppe vier Bücher zu vier Gruppen-Fächern zugeordnet (Tiere, Berufe, Jahreszeiten, Helden). Die Zuordnung war ohne Hinweis fast vollständig korrekt. Beim Vorlesen hat er die anderen Kinder nach Themenwunsch gefragt und vermittelt: "Lukas will Tiere, du wolltest Berufe — wir machen erst Tiere, dann Berufe." Selbstorganisierte Konfliktlösung mit Begründung. Schulreife-Indikator deutlich.',
    fotoVorhanden: false,
  },
  {
    id: "lg-4",
    kindId: "kind-liana",
    kind: "Liana M.",
    alter: "3;8",
    titel: "Liana erzählt auf Russisch und übersetzt",
    datum: "2026-04-27",
    autorin: "Yvonne Berger",
    bildungsbereiche: ["sprache", "kunst"],
    lerndispo: ["kommunikation", "interesse"],
    typ: "Mehrsprachigkeit aktiv",
    status: "veroeffentlicht",
    text: 'Im Sing-Kreis hat Liana das Lied „Сорока-белобока" auf Russisch vorgestellt. Sie hat dabei spontan übersetzt („Das ist die Elster, sie kocht Brei für Kinder") — fast wortgetreu. BISC-Sprachstand wird nächsten Mittwoch erfasst, aber heute war der Moment einen Eintrag wert.',
    fotoVorhanden: false,
  },
  {
    id: "lg-5",
    kindId: "kind-luca",
    kind: "Luca K.",
    alter: "4;3",
    titel: "Luca baut eine Murmelbahn mit Gefälle",
    datum: "2026-04-22",
    autorin: "Yasemin Adler",
    bildungsbereiche: ["mathe", "natur"],
    lerndispo: ["ausdauer", "engagement"],
    typ: "Naturwissenschaftliche Beobachtung",
    status: "veroeffentlicht",
    text: 'Luca hat heute Vormittag 40 Minuten an einer Murmelbahn gebaut. Erst horizontal — die Murmel rollt nicht. Er hat zwei Bauklötze drunter geschoben, geschaut, korrigiert. Am Ende hatten wir drei Stockwerke und einen Looping. Ohne Hilfe. Auf meine Frage „Warum funktioniert das jetzt?" sagte er: „Weil die Murmel hinunter will, da wo es schräg ist." Physik-Intuition.',
    fotoVorhanden: true,
  },
  {
    id: "lg-6",
    kindId: "kind-aisha",
    kind: "Aisha D.",
    alter: "5;2",
    titel: "Aisha tröstet Lina nach dem Sturz",
    datum: "2026-04-18",
    autorin: "Anika Stein",
    bildungsbereiche: ["sozial", "werte"],
    lerndispo: ["verantwortung", "kommunikation"],
    typ: "Empathie + Selbstwirksamkeit",
    status: "veroeffentlicht",
    text: 'Lina ist auf dem Klettergerüst gestürzt, weint laut. Bevor ich da war, ist Aisha hingelaufen, hat sich neben sie gesetzt und ihre Hand genommen. „Soll ich Yvonne holen?" Lina nickt. Aisha läuft zu mir, sagt ruhig: „Lina hat sich am Knie weh getan, sie braucht ein Pflaster." Klare Beobachtung, klare Bitte. Auf dem Rückweg hat sie Lina noch in den Arm genommen. Empathie-Rolle übernommen.',
    fotoVorhanden: false,
  },
];

export function listLerngeschichten(): Lerngeschichte[] {
  return GESCHICHTEN;
}

export function getLerngeschichte(id: string): Lerngeschichte | null {
  return GESCHICHTEN.find((g) => g.id === id) ?? null;
}

export function listGeschichtenFuerKind(kindId: string): Lerngeschichte[] {
  return GESCHICHTEN.filter((g) => g.kindId === kindId);
}
