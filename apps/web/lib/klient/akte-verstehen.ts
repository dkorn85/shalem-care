// Klient · Akte-verstehen-Layer · Klartext-Übersetzer für medizinische
// Dokumente (Arztbriefe, Befunde, Verordnungen, MD-Gutachten, Pflegeplan).
//
// Branchen-Stand: washabich.de, mein-arztbefund.de, BefundKlar machen das
// als externer Service mit ~1-3 Tagen Wartezeit. Niemand hat es in eine
// Pflege-/Akten-App integriert.
//
// Shalem-Pfad: Klient öffnet Dokument in der Akte → "Verstehen lassen" →
// KI strukturiert in:
//   1. Was ist passiert? (Klartext-Zusammenfassung)
//   2. Was bedeutet das für mich? (Auswirkungen)
//   3. Was muss ich tun? (Handlungs-Schritte)
//   4. Was sollte ich fragen? (offene Punkte für nächsten Termin)
//   5. Fachbegriffe (Glossar mit Klartext-Erklärung)
//
// Phase 1: deterministische Heuristik mit medizinischem Vokabular.
// Phase 2: Anthropic mit Pflege-System-Prompt + Reading-Level B1.

export type DokumentTyp = "arztbrief" | "befund" | "verordnung" | "md_gutachten" | "pflegeplan" | "laborbefund";

export const DOK_LABEL: Record<DokumentTyp, string> = {
  arztbrief: "Arztbrief",
  befund: "Befund (Bildgebung)",
  verordnung: "Verordnung / Rezept",
  md_gutachten: "MD-Gutachten Pflegegrad",
  pflegeplan: "Pflegeplan",
  laborbefund: "Laborbefund",
};

export const DOK_FARBE: Record<DokumentTyp, string> = {
  arztbrief: "var(--vibe-profile)",
  befund: "var(--vibe-team)",
  verordnung: "var(--accent)",
  md_gutachten: "var(--mon)",
  pflegeplan: "var(--fri)",
  laborbefund: "var(--vibe-stats)",
};

// Glossar: Fachbegriff → Klartext (Auszug, deterministisch)
const GLOSSAR: { begriff: string; klartext: string; warum_wichtig?: string }[] = [
  { begriff: "Hypertonie", klartext: "Bluthochdruck", warum_wichtig: "Erhöht das Risiko für Schlaganfall + Herzinfarkt" },
  { begriff: "Hypotonie", klartext: "Niedriger Blutdruck", warum_wichtig: "Kann zu Schwindel + Stürzen führen" },
  { begriff: "COPD", klartext: "Chronische Lungenerkrankung mit verengten Atemwegen", warum_wichtig: "Belastung schwerer · Sauerstoff oft nötig" },
  { begriff: "Apoplex", klartext: "Schlaganfall — plötzliche Durchblutungsstörung im Gehirn", warum_wichtig: "Frühzeitige Reha entscheidend" },
  { begriff: "Myokardinfarkt", klartext: "Herzinfarkt — Verschluss eines Herzkranzgefäßes" },
  { begriff: "Diabetes mellitus", klartext: "Zuckerkrankheit", warum_wichtig: "Blutzucker regelmäßig kontrollieren" },
  { begriff: "Demenz", klartext: "Fortschreitende Gedächtnis- und Denkstörung" },
  { begriff: "Dekubitus", klartext: "Druckgeschwür · Wunde durch langes Liegen", warum_wichtig: "Lagerung alle 2 h vermindert Risiko" },
  { begriff: "Polypharmazie", klartext: "Einnahme von 5+ Medikamenten gleichzeitig", warum_wichtig: "Wechselwirkungen sollten geprüft werden" },
  { begriff: "Sturzrisiko", klartext: "Gefahr zu fallen · oft durch Schwindel, Schwäche, Medikamente" },
  { begriff: "Osteoporose", klartext: "Knochenschwund · Knochen brechen leichter" },
  { begriff: "Arrhythmie", klartext: "Herzrhythmus-Störung" },
  { begriff: "kardiale Dekompensation", klartext: "Herz schafft seine Arbeit nicht mehr · Wasser im Körper" },
  { begriff: "PEG", klartext: "Sonde durch die Bauchwand für Ernährung" },
  { begriff: "Katheter", klartext: "Schlauch — z.B. zum Ableiten von Urin" },
  { begriff: "Anästhesie", klartext: "Betäubung für eine Operation" },
  { begriff: "Rezidiv", klartext: "Rückfall · Krankheit kommt wieder" },
  { begriff: "metastasiert", klartext: "Krebs hat sich auf andere Organe ausgebreitet" },
  { begriff: "palliativ", klartext: "Lindernd · nicht mehr heilend, sondern Schmerz + Leid mildern" },
  { begriff: "akut", klartext: "Plötzlich auftretend" },
  { begriff: "chronisch", klartext: "Dauerhaft · meist über 6 Monate" },
  { begriff: "PG", klartext: "Pflegegrad · 1 (gering) bis 5 (höchst)" },
  { begriff: "MD", klartext: "Medizinischer Dienst — beurteilt den Pflegegrad" },
  { begriff: "BMI", klartext: "Body-Mass-Index · Verhältnis Gewicht zu Größe" },
  { begriff: "BZ", klartext: "Blutzucker" },
  { begriff: "RR", klartext: "Blutdruck (z.B. 120/80 mmHg)" },
  { begriff: "ICD", klartext: "Diagnose-Code · weltweite Krankheits-Klassifikation" },
  { begriff: "ICF", klartext: "Klassifikation für Aktivitäten + Teilhabe (BTHG-Standard)" },
  { begriff: "Heilmittel", klartext: "Therapie (KG, MLD, Logo, Ergo) — vom Arzt verordnet" },
  { begriff: "Hilfsmittel", klartext: "Geräte (Rollator, Pflegebett, Hörgerät) — von der Kasse bezahlt" },
  { begriff: "Eigenanteil", klartext: "Geldbetrag, den Sie selbst zahlen müssen" },
  { begriff: "Verhinderungspflege", klartext: "Pflegekasse zahlt Vertretung wenn Pflegende:r krank/Urlaub" },
  { begriff: "AU", klartext: "Arbeitsunfähigkeitsbescheinigung — Krankschreibung" },
];

const FACHBEGRIFFE_PATTERN = new RegExp(
  "\\b(" + GLOSSAR.map((g) => g.begriff.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b",
  "gi",
);

export type AkteVerstaendnis = {
  dokument_typ: DokumentTyp;
  zusammenfassung: string;
  bedeutung: string;
  handlungsschritte: { schritt: string; bis_wann?: string; wer: string }[];
  fragen_fuer_arzt: string[];
  glossar: { begriff: string; klartext: string; warum_wichtig?: string }[];
  warnungen: string[];
  /** Reading-Level-Score: 0-100, höher = einfacher */
  reading_level: number;
};

export function verstehendeAkte(text: string, typ: DokumentTyp = "arztbrief"): AkteVerstaendnis {
  const lower = text.toLowerCase();

  // Fachbegriffe extrahieren
  const treffer = new Set<string>();
  let m;
  const re = new RegExp(FACHBEGRIFFE_PATTERN);
  while ((m = re.exec(text)) !== null) {
    treffer.add(m[1].toLowerCase());
  }
  const glossar = GLOSSAR.filter((g) => treffer.has(g.begriff.toLowerCase()));

  // Zusammenfassung — aus erstem Absatz + erkannten Schlüsselwörtern
  const ersterAbsatz = text.split(/\n\s*\n/)[0]?.trim() ?? text.slice(0, 200);
  const zusammenfassung = vereinfache(ersterAbsatz, glossar);

  // Bedeutung
  const bedeutung = generiereBedeutung(typ, lower, glossar);

  // Handlungsschritte
  const handlungsschritte: AkteVerstaendnis["handlungsschritte"] = [];
  if (lower.includes("medikament") || lower.includes("verordn") || lower.includes("rezept")) {
    handlungsschritte.push({ schritt: "Rezept in der Apotheke einlösen", bis_wann: "innerhalb 28 Tage", wer: "Sie selbst oder Angehörige" });
  }
  if (lower.includes("kontrolle") || lower.includes("wieder")) {
    handlungsschritte.push({ schritt: "Kontroll-Termin beim Arzt vereinbaren", wer: "Sie selbst" });
  }
  if (lower.includes("therapie") || lower.includes("kg") || lower.includes("kranken")) {
    handlungsschritte.push({ schritt: "Termin mit Therapie-Praxis abstimmen", bis_wann: "zeitnah", wer: "Therapie-Praxis kontaktiert Sie" });
  }
  if (typ === "md_gutachten") {
    handlungsschritte.push({ schritt: "Pflegegrad-Bescheid abwarten — kommt per Post", bis_wann: "ca. 25 Tage nach Begutachtung", wer: "Pflegekasse schickt automatisch" });
  }

  // Fragen für nächsten Termin
  const fragen: string[] = [];
  if (lower.includes("möglich") || lower.includes("könnte")) {
    fragen.push("Sie schreiben: 'könnte sein' — wie wahrscheinlich ist das wirklich?");
  }
  if (treffer.size > 5) {
    fragen.push("Im Brief stehen viele Fachbegriffe. Welche sind für mich am wichtigsten?");
  }
  if (lower.includes("nebenwirkung") || lower.includes("medikament")) {
    fragen.push("Welche Nebenwirkungen sollte ich beobachten und melden?");
  }
  if (lower.includes("operation") || lower.includes("op")) {
    fragen.push("Was passiert genau bei der Operation und wie lange ist die Erholung?");
  }
  if (lower.includes("prognose") || lower.includes("verlauf")) {
    fragen.push("Wie wird sich das in den nächsten 6 Monaten voraussichtlich entwickeln?");
  }
  if (fragen.length === 0) {
    fragen.push("Habe ich alles richtig verstanden? Können Sie mir das in einem Satz zusammenfassen?");
  }

  // Warnungen
  const warnungen: string[] = [];
  if (lower.includes("dringlich") || lower.includes("akut") || lower.includes("notfall")) {
    warnungen.push("Im Text wird von einer dringenden Situation gesprochen — bitte zeitnah klären, nicht aufschieben.");
  }
  if (lower.includes("kontroll") && lower.includes("4 wochen")) {
    warnungen.push("Kontroll-Termin in 4 Wochen empfohlen — vergessen Sie das nicht.");
  }
  if (lower.includes("nicht fahren") || lower.includes("fahrtüchtig")) {
    warnungen.push("Eingeschränkte Fahrtüchtigkeit — kein Auto fahren bis zur Freigabe.");
  }

  // Reading-Level
  const woerter = text.split(/\s+/).length;
  const fachbegriff_anteil = treffer.size / Math.max(woerter, 1);
  const reading_level = Math.max(0, Math.min(100, Math.round(100 - fachbegriff_anteil * 100 * 8)));

  return {
    dokument_typ: typ,
    zusammenfassung,
    bedeutung,
    handlungsschritte,
    fragen_fuer_arzt: fragen,
    glossar,
    warnungen,
    reading_level,
  };
}

function vereinfache(text: string, glossar: AkteVerstaendnis["glossar"]): string {
  let out = text;
  for (const g of glossar) {
    const re = new RegExp(`\\b${g.begriff}\\b`, "gi");
    out = out.replace(re, `${g.begriff} (= ${g.klartext})`);
  }
  return out;
}

function generiereBedeutung(typ: DokumentTyp, lower: string, glossar: AkteVerstaendnis["glossar"]): string {
  const teile: string[] = [];
  if (typ === "arztbrief") teile.push("Das ist ein Arztbrief — eine Zusammenfassung Ihrer letzten Untersuchung oder eines Krankenhaus-Aufenthalts.");
  else if (typ === "befund") teile.push("Das ist ein Befund-Bericht — der Arzt beschreibt, was er auf Bildern oder bei der Untersuchung gesehen hat.");
  else if (typ === "verordnung") teile.push("Das ist eine Verordnung — der Arzt verschreibt Ihnen eine Therapie, ein Medikament oder ein Hilfsmittel.");
  else if (typ === "md_gutachten") teile.push("Das ist das MD-Gutachten — der Medizinische Dienst hat begutachtet, welchen Pflegegrad Sie bekommen sollen.");
  else if (typ === "pflegeplan") teile.push("Das ist Ihr Pflegeplan — was die Pflegekräfte regelmäßig für Sie tun.");

  if (lower.includes("akut") || lower.includes("dringlich")) teile.push("Ein wichtiger Aspekt verlangt zeitnahe Aufmerksamkeit.");
  if (lower.includes("verbessert") || lower.includes("besserung")) teile.push("Es gibt eine Besserung im Verlauf.");
  if (lower.includes("verschlechter")) teile.push("Im Verlauf gab es eine Verschlechterung.");
  if (glossar.length > 5) teile.push(`Es kommen ${glossar.length} medizinische Fachbegriffe vor — die wichtigsten erkläre ich unten.`);

  return teile.join(" ");
}

// Demo-Dokumente
export const DEMO_DOKUMENTE = [
  {
    id: "doc-arztbrief-helga",
    titel: "Arztbrief · Pneumologie Bochum · Helga Reinhardt",
    typ: "arztbrief" as DokumentTyp,
    datum: "2026-04-28",
    text: `Sehr geehrte Frau Kollegin,

ich berichte über die stationäre Behandlung von Frau Helga Reinhardt.

Diagnosen:
- COPD GOLD III mit aktueller Exazerbation
- Hypertonie mit kardialer Dekompensation
- Demenz mittelgradig (MMSE 18/30)
- Z.n. Apoplex 2024 mit linksseitiger Hemiparese

Aktuell besteht eine akute Verschlechterung der COPD mit Sauerstoff-Bedarf. Die kardiale Dekompensation wurde mit Diuretika eingestellt. Die Polypharmazie sollte bei der nächsten Hausarzt-Vorstellung kritisch geprüft werden.

Empfehlung: Atemtherapie 2x wöchentlich, Sauerstoff 2 L/min nachts. Kontroll-Termin in 4 Wochen. Bei Verschlechterung sofort Wiedervorstellung. Sturzrisiko erhöht — bitte Rollator-Anpassung.`,
  },
  {
    id: "doc-md-gutachten-helga",
    titel: "MD-Gutachten · Pflegegrad Helga Reinhardt",
    typ: "md_gutachten" as DokumentTyp,
    datum: "2026-03-12",
    text: `Pflegegrad-Begutachtung nach NBA-Modulen

Modul 1 Mobilität: 6.25 Punkte (mittel)
Modul 2 Kognitive Fähigkeiten: 11 Punkte (mittel)
Modul 3 Verhalten: 9 Punkte (mittel)
Modul 4 Selbstversorgung: 22.5 Punkte (mittel)
Modul 5 Krankheitsbewältigung: 4.6 Punkte (mittel)
Modul 6 Alltagsleben: 0 Punkte (gering)

Gesamtpunkte: 53.7
Empfehlung: Pflegegrad 4

Begründung: Die Klientin zeigt mittlere Beeinträchtigungen in allen relevanten Bereichen. Insbesondere die kognitiven Fähigkeiten (Demenz mittelgradig) und die Selbstversorgung (Hilfsbedarf bei Körperpflege, An-/Auskleiden) führen zu einem hohen Hilfsbedarf.`,
  },
];
