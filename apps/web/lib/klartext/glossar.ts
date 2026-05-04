// Klartext-Glossar · medizinisches/pflegerisches Fachvokabular
// in verständlicher Alltagssprache.
//
// Quelle/Anker: Verständlichkeits-Standards des „Schreibwerkstatt
// Verständliche Sprache"-Projekts (Universität Hohenheim) und der
// Patientenleitlinien des ÄZQ. Ziel: Lese-Niveau B1 (GER), maximal
// 18 Wörter pro Satz, keine Fremdwörter ohne Erklärung.
//
// Verwendung:
//   - Tooltips / Klick-zum-Erklären in der Klient-Akte
//   - Doku-Übersetzer ersetzt jedes gefundene Stichwort durch
//     Stichwort + (Erklärung) bei der „einfach erklärt"-Aktion

export type GlossarEintrag = {
  term: string;                 // Originalbegriff (kanonisch)
  variants: string[];           // Schreibvarianten / Beugungen
  klartext: string;             // 1-Satz-Erklärung
  beispiel?: string;             // optional ein konkreter Bezug
  kategorie:
    | "diagnose"
    | "wirkstoff"
    | "untersuchung"
    | "skala"
    | "doku"
    | "anatomie"
    | "ablauf"
    | "rechtlich";
};

export const GLOSSAR: GlossarEintrag[] = [
  // ─── Diagnosen / Krankheitsbilder ──────────────────────
  {
    term: "Hypertonie",
    variants: ["Hypertonie", "essentielle Hypertonie", "art. Hypertonie", "art. HTN"],
    klartext: "Bluthochdruck — der Druck in den Adern ist dauerhaft zu hoch.",
    kategorie: "diagnose",
  },
  {
    term: "Diabetes mellitus Typ II",
    variants: ["Diabetes Typ II", "Diabetes mellitus Typ 2", "Diab. mell. II", "DM II", "Altersdiabetes"],
    klartext: "Zuckerkrankheit. Der Körper kann den Zucker im Blut nicht mehr gut steuern.",
    kategorie: "diagnose",
  },
  {
    term: "Vorhofflimmern",
    variants: ["Vorhofflimmern", "VHF", "Vorhof-flimmern", "absolute Arrhythmie"],
    klartext: "Das Herz schlägt unregelmäßig. Im Vorhof zuckt es statt richtig zu pumpen.",
    kategorie: "diagnose",
  },
  {
    term: "Herzinsuffizienz",
    variants: ["Herzinsuffizienz", "Herzschwäche", "NYHA II", "NYHA III"],
    klartext: "Herzschwäche. Das Herz kann nicht mehr genug Blut durch den Körper pumpen.",
    kategorie: "diagnose",
  },
  {
    term: "Demenz",
    variants: ["Demenz", "Alzheimer-Demenz", "vaskuläre Demenz", "demenzielle Erkrankung"],
    klartext: "Gedächtnis und Denken verändern sich. Erinnerungen werden weniger, Gefühle bleiben.",
    kategorie: "diagnose",
  },
  {
    term: "Dekubitus",
    variants: ["Dekubitus", "Druckgeschwür", "Wundliegen", "Druckulkus"],
    klartext: "Wundliegen. Wenn ein Körperteil zu lange auf einer Stelle Druck bekommt, geht die Haut kaputt.",
    kategorie: "diagnose",
  },
  {
    term: "Mangelernährung",
    variants: ["Mangelernährung", "Malnutrition", "Kachexie"],
    klartext: "Der Körper bekommt nicht genug Nährstoffe oder Energie. Man verliert Gewicht und Kraft.",
    kategorie: "diagnose",
  },
  {
    term: "Aspiration",
    variants: ["Aspiration", "Aspirationsrisiko", "Verschlucken"],
    klartext: "Beim Essen oder Trinken kann etwas in die Luftröhre rutschen statt in die Speiseröhre.",
    kategorie: "diagnose",
  },
  {
    term: "Inkontinenz",
    variants: ["Inkontinenz", "Harninkontinenz", "Stuhl-Inkontinenz"],
    klartext: "Der Körper kann Urin oder Stuhl nicht mehr zurückhalten. Das ist häufig im Alter und behandelbar.",
    kategorie: "diagnose",
  },
  {
    term: "Exsikkose",
    variants: ["Exsikkose", "Dehydratation", "Austrocknung"],
    klartext: "Der Körper hat zu wenig Flüssigkeit. Mund wird trocken, man wird müde, Haut wird schlaffer.",
    kategorie: "diagnose",
  },
  {
    term: "Kontraktur",
    variants: ["Kontraktur", "Gelenkversteifung"],
    klartext: "Ein Gelenk wird steif. Wenn es zu lange in einer Stellung bleibt, kann man es kaum bewegen.",
    kategorie: "diagnose",
  },
  {
    term: "Apoplex",
    variants: ["Apoplex", "Schlaganfall", "Hirninfarkt", "Insult"],
    klartext: "Schlaganfall. Im Gehirn ist ein Gefäß verstopft oder geplatzt. Teile des Körpers können danach schwächer sein.",
    kategorie: "diagnose",
  },
  {
    term: "Parkinson",
    variants: ["Parkinson", "M. Parkinson", "Parkinson-Krankheit"],
    klartext: "Eine Krankheit des Gehirns. Bewegungen werden langsamer, Hände zittern, Muskeln werden steif.",
    kategorie: "diagnose",
  },
  {
    term: "Reflux",
    variants: ["Reflux", "GERD", "Sodbrennen", "Refluxkrankheit"],
    klartext: "Magensäure läuft zurück in die Speiseröhre. Brennt hinter dem Brustbein.",
    kategorie: "diagnose",
  },

  // ─── Wirkstoffe ──────────────────────────────────────────
  {
    term: "Metoprolol",
    variants: ["Metoprolol", "Metoprolol succinat", "Beloc"],
    klartext: "Senkt Puls und Blutdruck. Schützt das Herz vor zu starker Belastung.",
    kategorie: "wirkstoff",
  },
  {
    term: "Bisoprolol",
    variants: ["Bisoprolol", "Concor"],
    klartext: "Beruhigt das Herz. Senkt Blutdruck und Puls, hilft bei Herzschwäche und Vorhofflimmern.",
    kategorie: "wirkstoff",
  },
  {
    term: "Ramipril",
    variants: ["Ramipril", "Delix"],
    klartext: "Senkt Bluthochdruck. Schützt Herz und Nieren auf Dauer.",
    kategorie: "wirkstoff",
  },
  {
    term: "Apixaban",
    variants: ["Apixaban", "Eliquis"],
    klartext: "Macht das Blut etwas dünner. Verhindert Schlaganfälle bei Vorhofflimmern.",
    kategorie: "wirkstoff",
  },
  {
    term: "Pantoprazol",
    variants: ["Pantoprazol", "Pantozol"],
    klartext: "Schützt den Magen, wenn er zu viel Säure macht. Hilft bei Sodbrennen und Magenschmerzen.",
    kategorie: "wirkstoff",
  },
  {
    term: "Metformin",
    variants: ["Metformin", "Glucophage"],
    klartext: "Senkt den Blutzucker bei Diabetes Typ II. Wird zu den Mahlzeiten genommen.",
    kategorie: "wirkstoff",
  },
  {
    term: "Furosemid",
    variants: ["Furosemid", "Lasix"],
    klartext: "Wassertablette — der Körper scheidet mehr Wasser aus. Hilft bei Beinwasser und Herzschwäche.",
    kategorie: "wirkstoff",
  },
  {
    term: "Citalopram",
    variants: ["Citalopram", "Cipramil"],
    klartext: "Stimmungsaufhellend bei Depression und Ängsten. Wirkung baut sich über 2–4 Wochen auf.",
    kategorie: "wirkstoff",
  },
  {
    term: "Mirtazapin",
    variants: ["Mirtazapin", "Remergil"],
    klartext: "Hilft bei Schlafstörung und Depression — abends genommen, macht müde, regt Appetit an.",
    kategorie: "wirkstoff",
  },
  {
    term: "Donepezil",
    variants: ["Donepezil", "Aricept"],
    klartext: "Wird bei Alzheimer-Demenz gegeben. Soll das Gedächtnis länger erhalten.",
    kategorie: "wirkstoff",
  },
  {
    term: "Levothyroxin",
    variants: ["Levothyroxin", "L-Thyroxin", "Euthyrox"],
    klartext: "Schilddrüsen-Hormon. Wird genommen, wenn die Schilddrüse zu wenig macht.",
    kategorie: "wirkstoff",
  },
  {
    term: "Insulin glargin",
    variants: ["Insulin glargin", "Lantus", "Toujeo"],
    klartext: "Lang wirksames Insulin. Wird einmal am Tag gespritzt und hält 24 Stunden.",
    kategorie: "wirkstoff",
  },
  {
    term: "Fentanyl",
    variants: ["Fentanyl", "Fentanyl-TTS", "Durogesic"],
    klartext: "Starkes Schmerzmittel als Pflaster. Wirkt 3 Tage. Wird bei starken Tumorschmerzen eingesetzt.",
    kategorie: "wirkstoff",
  },
  {
    term: "Morphin",
    variants: ["Morphin", "Morphium", "MST"],
    klartext: "Sehr starkes Schmerzmittel. Wird bei akuten oder Tumorschmerzen gegeben.",
    kategorie: "wirkstoff",
  },

  // ─── Untersuchungen / Werte ─────────────────────────────
  {
    term: "RR",
    variants: ["RR", "Blutdruck", "BP"],
    klartext: "Blutdruck. Erste Zahl = wenn das Herz pumpt, zweite = wenn es ruht.",
    beispiel: "RR 132/78 heißt 132 oben, 78 unten — gut.",
    kategorie: "untersuchung",
  },
  {
    term: "BZ",
    variants: ["BZ", "Blutzucker", "BG"],
    klartext: "Zucker im Blut. Wird bei Diabetes regelmäßig gemessen.",
    beispiel: "Nüchtern unter 100 mg/dl ist normal.",
    kategorie: "untersuchung",
  },
  {
    term: "INR",
    variants: ["INR", "Quick"],
    klartext: "Wert wie schnell das Blut gerinnt. Bei blutverdünnenden Tabletten regelmäßig kontrollieren.",
    kategorie: "untersuchung",
  },
  {
    term: "HbA1c",
    variants: ["HbA1c", "Langzeit-Zucker"],
    klartext: "Zeigt den Durchschnitts-Blutzucker der letzten 3 Monate.",
    kategorie: "untersuchung",
  },

  // ─── Risiko-Skalen ────────────────────────────────────────
  {
    term: "Braden-Skala",
    variants: ["Braden", "Braden-Skala", "Bradenskala"],
    klartext: "Bewertet das Risiko für Wundliegen. Niedriger Wert = höheres Risiko.",
    kategorie: "skala",
  },
  {
    term: "NRS",
    variants: ["NRS", "Numerische Rating-Skala"],
    klartext: "Schmerz-Skala von 0 (kein Schmerz) bis 10 (stärkster Schmerz).",
    kategorie: "skala",
  },
  {
    term: "BESD",
    variants: ["BESD", "Beurteilung von Schmerzen bei Demenz"],
    klartext: "Schmerz-Bewertung über Beobachtung bei Menschen, die nicht mehr selbst sagen können wie weh es tut.",
    kategorie: "skala",
  },
  {
    term: "MNA-SF",
    variants: ["MNA-SF", "Mini Nutritional Assessment", "MNA"],
    klartext: "Ernährungs-Check. 6 Fragen, ob jemand zu wenig isst.",
    kategorie: "skala",
  },

  // ─── Doku-Begriffe ────────────────────────────────────────
  {
    term: "SIS",
    variants: ["SIS", "Strukturmodell SIS", "Strukturierte Informationssammlung"],
    klartext: "Pflege-Doku-Form mit 6 Themenfeldern. So machen es die Heime und Pflegedienste in Deutschland.",
    kategorie: "doku",
  },
  {
    term: "Berichteblatt",
    variants: ["Berichteblatt", "Bericht"],
    klartext: "Eintrag in der Pflegedoku — nur dann nötig, wenn etwas vom Normalverlauf abweicht.",
    kategorie: "doku",
  },
  {
    term: "Pflegegrad",
    variants: ["Pflegegrad", "PG", "PG 1", "PG 2", "PG 3", "PG 4", "PG 5"],
    klartext: "Stufe von 1 bis 5, wie viel Hilfe jemand braucht. Je höher, desto mehr Unterstützung wird bezahlt.",
    kategorie: "rechtlich",
  },
  {
    term: "MDK",
    variants: ["MDK", "MD", "Medizinischer Dienst"],
    klartext: "Der Medizinische Dienst prüft, ob die Pflege gut gemacht wird und ob der Pflegegrad stimmt.",
    kategorie: "rechtlich",
  },
  {
    term: "BtM",
    variants: ["BtM", "Betäubungsmittel"],
    klartext: "Starke Schmerz- oder Beruhigungsmittel mit Sondervorschriften (z.B. Morphin, Fentanyl).",
    kategorie: "rechtlich",
  },
  {
    term: "AU",
    variants: ["AU", "Arbeitsunfähigkeitsbescheinigung", "Krankschreibung", "eAU"],
    klartext: "Krankschreibung vom Arzt. Wird elektronisch direkt an die Krankenkasse geschickt.",
    kategorie: "rechtlich",
  },
  {
    term: "HKP",
    variants: ["HKP", "Häusliche Krankenpflege"],
    klartext: "Pflege zu Hause, die der Arzt verordnet — z.B. Verband, Spritze, Tabletten richten. Die Krankenkasse zahlt.",
    kategorie: "rechtlich",
  },

  // ─── Anatomie / Ablauf ─────────────────────────────────
  {
    term: "Sturzprophylaxe",
    variants: ["Sturzprophylaxe", "Sturzvorbeugung"],
    klartext: "Maßnahmen damit man nicht stürzt: Anti-Rutsch-Socken, gutes Licht, Hilfsmittel, Übungen.",
    kategorie: "ablauf",
  },
  {
    term: "Mobilisation",
    variants: ["Mobilisation", "Mobi", "mobilisieren"],
    klartext: "Bewegung anregen — vom Bett aufstehen, sitzen, gehen, soweit es geht.",
    kategorie: "ablauf",
  },
  {
    term: "Verbandwechsel",
    variants: ["Verbandwechsel", "VW"],
    klartext: "Alter Verband ab, Wunde anschauen und reinigen, neuer Verband drauf.",
    kategorie: "ablauf",
  },
  {
    term: "Vitalwerte",
    variants: ["Vitalwerte", "Vitalparameter", "Vitalzeichen"],
    klartext: "Wichtige Werte des Körpers: Blutdruck, Puls, Atmung, Temperatur, Sauerstoff im Blut.",
    kategorie: "untersuchung",
  },
];

export function findGlossarEintrag(term: string): GlossarEintrag | null {
  const t = term.toLowerCase().trim();
  return (
    GLOSSAR.find((e) => e.term.toLowerCase() === t)
    ?? GLOSSAR.find((e) => e.variants.some((v) => v.toLowerCase() === t))
    ?? null
  );
}

// Substring-Suche für Doku-Übersetzer
export function annotateText(text: string): Array<{ type: "text" | "term"; value: string; entry?: GlossarEintrag }> {
  const out: Array<{ type: "text" | "term"; value: string; entry?: GlossarEintrag }> = [];
  let cursor = 0;
  // Sortiere nach Länge der Variante (lange zuerst), damit "essentielle Hypertonie" vor "Hypertonie" matcht
  const all = GLOSSAR.flatMap((e) => e.variants.map((v) => ({ entry: e, variant: v })))
    .sort((a, b) => b.variant.length - a.variant.length);

  while (cursor < text.length) {
    let matched = false;
    for (const { entry, variant } of all) {
      const slice = text.slice(cursor, cursor + variant.length);
      if (slice.toLowerCase() === variant.toLowerCase()) {
        // Wortgrenzen prüfen
        const before = cursor === 0 ? " " : text[cursor - 1];
        const after = text[cursor + variant.length] ?? " ";
        if (!/[\wÄÖÜäöüß]/.test(before) && !/[\wÄÖÜäöüß]/.test(after)) {
          out.push({ type: "term", value: slice, entry });
          cursor += variant.length;
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      const last = out[out.length - 1];
      if (last && last.type === "text") {
        last.value += text[cursor];
      } else {
        out.push({ type: "text", value: text[cursor] });
      }
      cursor++;
    }
  }
  return out;
}
