// Tibetische Medizin (Sowa Rigpa) — Grundlagen für die ganzheitliche
// Deutung schulmedizinischer Befunde.
//
// Die tibetische Medizin versteht den Menschen als dynamisches Gleichgewicht
// dreier Energieprinzipien (Nyepa) und fünf Elemente. Krankheit entsteht,
// wenn dieses Gleichgewicht gestört ist — körperlich, emotional und durch
// Lebensführung. Die schulmedizinische Diagnose („was") wird ergänzt durch
// die tibetische Deutung („warum, in welchem Kontext, was sagt es über
// das Ganze").
//
// Quellen:
//   - rGyud-bzhi (Vier Tantras), insbesondere die Wurzeltantra-Bäume
//   - Khenpo Troru Tsenam, Tibetan Medicine Illustrated in Original Texts
//   - Dr. Pasang Yonten Arya, External Therapies of Tibetan Medicine
//
// Wichtig: Diese Deutungen ergänzen schulmedizinische Diagnostik, sie
// ersetzen sie nicht. Im Zweifel gilt evidenzbasierte Versorgung.

// ─── Drei Säfte / Energien (Nyepa Sum) ───────────────────────────────

export type Nyepa = "rLung" | "mKhrispa" | "BadKan";

export const NYEPA_LABEL: Record<Nyepa, string> = {
  rLung:    "rLung — Wind / Bewegung",
  mKhrispa: "Tripa — Galle / Wärme",
  BadKan:   "Beken — Schleim / Erdfeuchte",
};

export const NYEPA_FARBE: Record<Nyepa, string> = {
  rLung:    "var(--sat)",      // luftig blau-violett
  mKhrispa: "var(--mon)",      // hitze rot
  BadKan:   "var(--fri)",      // wasser-erde grünblau
};

export const NYEPA_DETAIL: Record<Nyepa, {
  element: string;
  qualitaet: string[];
  funktion: string;
  sitz: string;
  zeitpunkt: string;
  lebensphase: string;
  geschmack: string[];
  emotion: string[];
  klima: string;
  ueberschuss: string[];
  mangel: string[];
}> = {
  rLung: {
    element:     "Luft",
    qualitaet:   ["leicht", "rau", "kühl", "fein", "hart", "beweglich"],
    funktion:    "Bewegung — Atmung, Herzschlag, Nervenleitung, Gedanken, Gelenke",
    sitz:        "Becken, unterer Rumpf, Knochen, Ohren, Haut",
    zeitpunkt:   "frühmorgens (3–7) und früher Abend (15–19)",
    lebensphase: "Alter (>60 Jahre)",
    geschmack:   ["bitter", "scharf", "herb"],
    emotion:     ["Verlangen", "Anhaftung", "Angst", "Sorge"],
    klima:       "Sommer / regnerisch / windig",
    ueberschuss: ["Schlaflosigkeit", "Tinnitus", "Tremor", "Tachykardie", "Verstopfung", "Gewichtsverlust", "innere Unruhe", "Schwindel"],
    mangel:      ["Müdigkeit", "schwache Stimme", "Antriebslosigkeit", "Atemarmut"],
  },
  mKhrispa: {
    element:     "Feuer",
    qualitaet:   ["heiß", "scharf", "leicht", "ölig", "fließend"],
    funktion:    "Verdauung, Stoffwechsel, Sehen, Mut, Hautfarbe, Hunger/Durst",
    sitz:        "Leber, Galle, Blut, Schweiß, Augen, Mittelbauch",
    zeitpunkt:   "Mittag (11–15) und tiefe Nacht (23–3)",
    lebensphase: "Erwachsenenalter (15–60)",
    geschmack:   ["süß", "bitter", "herb"],
    emotion:     ["Hass", "Zorn", "Eifersucht", "Stolz"],
    klima:       "Herbst / heiß / trocken",
    ueberschuss: ["Hitzewallungen", "bittere Mundfeuchte", "Gelbsucht", "Migräne mit Pulsation", "Hauterytheme", "Durchfall mit Brennen", "Reizbarkeit"],
    mangel:      ["fahler Teint", "Verdauungsschwäche", "Kälteempfindlichkeit"],
  },
  BadKan: {
    element:     "Erde + Wasser",
    qualitaet:   ["kühl", "schwer", "stumpf", "ölig", "weich", "stabil"],
    funktion:    "Stabilität — Schleim, Synovia, Geduld, Schlaf, Gewebsmasse, Geschmack",
    sitz:        "Brust, Magen-Oberteil, Gelenke, Lunge, Speichel",
    zeitpunkt:   "vormittags (7–11) und früher Abend (19–23)",
    lebensphase: "Kindheit (0–15)",
    geschmack:   ["süß", "sauer", "salzig"],
    emotion:     ["Trägheit", "Anhaftung", "Verschlossenheit", "Trauer"],
    klima:       "Frühling / kalt / feucht",
    ueberschuss: ["Schweregefühl", "Übergewicht", "Ödeme", "Schleim auf Lunge", "Kälte", "langsame Verdauung", "Depression mit Lethargie"],
    mangel:      ["trockene Schleimhäute", "Knochenmark-Schwäche", "Flüssigkeitsverlust"],
  },
};

// ─── Fünf Elemente (Jung-Wa Lnga) ────────────────────────────────────

export type Element = "erde" | "wasser" | "feuer" | "luft" | "raum";

export const ELEMENT_LABEL: Record<Element, string> = {
  erde:    "Erde",
  wasser:  "Wasser",
  feuer:   "Feuer",
  luft:    "Luft",
  raum:    "Raum",
};

export const ELEMENT_DETAIL: Record<Element, { funktion: string; gewebe: string; sinn: string }> = {
  erde:   { funktion: "Festigkeit, Form",       gewebe: "Muskel, Knochen",         sinn: "Geruch" },
  wasser: { funktion: "Zusammenhalt, Feuchte",  gewebe: "Blut, Lymphe, Schleim",   sinn: "Geschmack" },
  feuer:  { funktion: "Reife, Verdauung",       gewebe: "Stoffwechsel, Hautwärme", sinn: "Sehen" },
  luft:   { funktion: "Bewegung",                gewebe: "Atem, Nervenleitung",     sinn: "Tastsinn" },
  raum:   { funktion: "Hohlraum, Möglichkeit",  gewebe: "Körperkavitäten",         sinn: "Hören" },
};

// ─── Drei Lebensgrundlagen (gNas-pa-gsum) ────────────────────────────

export type Lebensgrundlage = "lus" | "ngag" | "yid";

export const LEBENSGRUNDLAGE_LABEL: Record<Lebensgrundlage, string> = {
  lus:  "Lü — Körper",
  ngag: "Ngag — Sprache / Atem",
  yid:  "Yi — Geist",
};

// ─── Behandlungssäulen ───────────────────────────────────────────────

export type TibBehandlungssaeule =
  | "ernaehrung"
  | "lebensfuehrung"
  | "kraeutermedizin"
  | "aeussere_therapien"
  | "meditation_bewegung";

export const BEHANDLUNG_LABEL: Record<TibBehandlungssaeule, string> = {
  ernaehrung:           "Ernährung (Sowa)",
  lebensfuehrung:       "Lebensführung (Cho-La)",
  kraeutermedizin:      "Kräutermedizin (Men)",
  aeussere_therapien:   "Äußere Therapien (Cha-Ka)",
  meditation_bewegung:  "Geistesübung & Bewegung (Lung-Trul)",
};

// ─── Befund-Typ → tibetische Deutung ─────────────────────────────────

// Wir mappen typische schulmedizinische Befundtypen auf tibetische
// Imbalance-Muster. Jede Deutung enthält:
//   - dominantes Nyepa
//   - mit-betroffene Lebensgrundlage
//   - kontextualisierte Bedeutung im "Ganzen"
//   - empfohlene tibetische Behandlungsachsen

export type DualeDeutung = {
  schulmedizinKurz: string;
  schulmedizinLang: string;
  schulmedizinNorm?: string;        // ICD / Leitlinie
  tibBefund: string;
  tibDominantes: Nyepa[];
  tibLebensgrundlage: Lebensgrundlage[];
  tibBedeutungGanzheit: string;
  tibEmpfehlung: { saeule: TibBehandlungssaeule; was: string }[];
};

// Mappingschluessel: Befundtyp + ggf. Region/Lab-Parameter
export const DEUTUNGS_KATALOG: Record<string, DualeDeutung> = {
  // ─── Wirbelsäule ─────────────────────────────────
  "wirbel:bandscheibenvorfall": {
    schulmedizinKurz: "Bandscheibenvorfall (Prolaps)",
    schulmedizinLang: "Verlagerung von Nucleus-pulposus-Material durch den Anulus fibrosus, mit potenzieller Kompression einer Nervenwurzel oder des Rückenmarks. Typisch Lumboischialgie, Sensibilitätsstörungen, motorische Defizite je nach Segment.",
    schulmedizinNorm: "ICD-10 M51.- · AWMF S2k Lumbale Radikulopathie",
    tibBefund: "rLung-BadKan-Stau im Becken-Lendenbereich; sekundäre rLung-Aufwärtsverlagerung verursacht stechenden Schmerz.",
    tibDominantes: ["rLung", "BadKan"],
    tibLebensgrundlage: ["lus"],
    tibBedeutungGanzheit:
      "Die untere Wirbelsäule ist Sitz des rLung — sie trägt die Last des Lebens, dort sammelt sich das, was wir nicht losgelassen haben. " +
      "Ein Bandscheibenvorfall zeigt eine Schwere/Festigkeit (BadKan), die die Bewegungsenergie (rLung) blockiert, bis sie in einen scharfen Schmerz umschlägt. " +
      "Der Mensch wird buchstäblich gezwungen, langsamer zu werden und nach innen zu lauschen.",
    tibEmpfehlung: [
      { saeule: "lebensfuehrung",      was: "Hebe-/Trag-Belastungen pausieren · regelmäßige Wärme im unteren Rücken · feste Schlafzeiten 22–6 Uhr" },
      { saeule: "aeussere_therapien",  was: "Hor-Me (Ölkompresse mit Sesamöl + Muskatnuss) im Lendenbereich · Moxa an Du-mai 4 (Mingmen)" },
      { saeule: "kraeutermedizin",     was: "Agar-35 (entspannt rLung) · Sogo Nyungne bei Akutem · gegen Restschmerz Bya-rGod 13" },
      { saeule: "meditation_bewegung", was: "Lu-Jong-Bewegungen für rLung · sanftes Kum-Nye · keine Yoga-Inversion akut" },
      { saeule: "ernaehrung",          was: "Warm + ölig: Knochenbrühe, Hafer, Mandeln, getrockneter Ingwer · vermeide Rohkost und Kaffee am Morgen" },
    ],
  },
  "wirbel:spondylose": {
    schulmedizinKurz: "Spondylose",
    schulmedizinLang: "Degenerative Veränderungen an Wirbelkörperrändern und Bandscheiben mit Osteophytenbildung. Häufig altersbedingt, oft auch in jüngeren Jahren bei chronischer Fehlbelastung.",
    schulmedizinNorm: "ICD-10 M47.-",
    tibBefund: "Chronische BadKan-Verfestigung in den Knochen, Trockenheit durch rLung-Erschöpfung.",
    tibDominantes: ["BadKan", "rLung"],
    tibLebensgrundlage: ["lus"],
    tibBedeutungGanzheit:
      "Knochen entstehen aus dem Erdelement und werden vom Mark genährt. " +
      "Spondylose zeigt langsam fortschreitenden Verlust an Feuchte und Beweglichkeit — der Körper wird buchstäblich \"starrer\" als das Leben gerade verlangt. " +
      "Oft Hinweis auf zu wenig Pause, zu viel Festhalten am Bekannten.",
    tibEmpfehlung: [
      { saeule: "kraeutermedizin",     was: "Olo-28 (nährt Knochenmark) · Vitamin-D-reiche Lebensmittel" },
      { saeule: "aeussere_therapien",  was: "Tägliche Ölmassage (Sesamöl, warm) entlang der Wirbelsäule" },
      { saeule: "meditation_bewegung", was: "Sanfte Mobilisation morgens · Tara-Atemübungen für rLung-Versorgung" },
      { saeule: "ernaehrung",          was: "Sesam, Mandelmilch, Mark-Knochenbrühe, Datteln · warm und nährend" },
    ],
  },
  "wirbel:skoliose": {
    schulmedizinKurz: "Skoliose",
    schulmedizinLang: "Dreidimensionale strukturelle Verkrümmung der Wirbelsäule mit Cobb-Winkel ≥10°. Idiopathisch (Adoleszenz) oder sekundär.",
    schulmedizinNorm: "ICD-10 M41.-",
    tibBefund: "Asymmetrisches rLung-Strömen, oft begleitet von Tripa-Stagnation auf der konkaven Seite.",
    tibDominantes: ["rLung", "mKhrispa"],
    tibLebensgrundlage: ["lus", "yid"],
    tibBedeutungGanzheit:
      "Die Wirbelsäule ist die zentrale Achse, an der sich Körper, Atem und Geist organisieren. " +
      "Eine Krümmung kann zeigen, dass der Mensch innerlich \"in eine Richtung gezogen\" wird, die seiner Mitte nicht entspricht — " +
      "in der Kindheit oft durch emotionale Lasten oder einseitige Anforderungen geprägt.",
    tibEmpfehlung: [
      { saeule: "meditation_bewegung", was: "Tibetan Yoga (Tsalung Trul-Khor) zur Reorganisation des rLung um die Mittellinie" },
      { saeule: "aeussere_therapien",  was: "Kunye-Massage entlang Du-mai · Moxa-Wärme an Spannungspunkten" },
      { saeule: "lebensfuehrung",      was: "Symmetrische Belastung im Alltag · ausreichend Schlaf in Rückenlage" },
    ],
  },
  "wirbel:kyphose": {
    schulmedizinKurz: "Hyperkyphose",
    schulmedizinLang: "Verstärkte Krümmung der Brustwirbelsäule nach hinten (>40°). Häufig bei Osteoporose, Morbus Scheuermann, oder posturaler Fehlbelastung.",
    tibBefund: "BadKan-Schwere im Brustkorb, Lungen-rLung eingeschränkt, oft mit Tripa-Mangel im Herzen.",
    tibDominantes: ["BadKan", "rLung"],
    tibLebensgrundlage: ["lus", "yid"],
    tibBedeutungGanzheit:
      "Eine zusammenfallende BWS verschließt den Brustraum, in dem nach tibetischer Sicht das \"Wind des Lebens\" (Sog-rLung) wohnt. " +
      "Der Mensch trägt körperlich, was er emotional an Lasten und ungesagten Worten mit sich nimmt. " +
      "Aufrichten heißt zugleich: das Herz wieder in den Tag öffnen.",
    tibEmpfehlung: [
      { saeule: "meditation_bewegung", was: "Brustöffnende Asanas · Sa-Lung-Atemübungen (Erd-Atem stabilisiert)" },
      { saeule: "aeussere_therapien",  was: "Moxibustion an Lung-1, Du-mai 12 · warme Brustwickel mit Beifuß" },
      { saeule: "lebensfuehrung",      was: "Tagesstruktur mit echten Pausen · regelmäßiger Aufenthalt im Freien (Sog-rLung-Nahrung)" },
    ],
  },

  // ─── Labor ───────────────────────────────────────
  "lab:vitamin_d_niedrig": {
    schulmedizinKurz: "Vitamin-D-Mangel",
    schulmedizinLang: "Serum-25-OH-D < 20 ng/ml. Erhöhtes Risiko für Osteomalazie, Stürze, Infektanfälligkeit und Stimmungstief.",
    schulmedizinNorm: "DGE-Empfehlung 800–2000 IE/Tag, Supplementierung bei Mangel 4000+ IE/Tag",
    tibBefund: "rLung-Schwäche durch unzureichende Sog-rLung-Aufnahme + BadKan-Stagnation in Knochen.",
    tibDominantes: ["rLung", "BadKan"],
    tibLebensgrundlage: ["lus", "ngag"],
    tibBedeutungGanzheit:
      "Vitamin D entsteht durch Sonnenlicht — das Sonnenelement nährt das Feuer und die Knochenmark-Essenz. " +
      "Ein Mangel zeigt: das Leben findet zu sehr im Innen statt, ohne sich vom Sonnenlicht durchdringen zu lassen.",
    tibEmpfehlung: [
      { saeule: "lebensfuehrung",  was: "20 Minuten Tageslicht morgens auf Gesicht und Arme · Atmung auf der Veranda" },
      { saeule: "ernaehrung",      was: "Hering, Lachs, Eigelb, Pilze auf Sonnenseite · Mandelöl-Massage" },
      { saeule: "kraeutermedizin", was: "Bya-Khung-3 (kräftigt rLung) · zusätzliche Cholecalciferol-Supplementation rein schulmedizinisch" },
    ],
  },
  "lab:eisenmangel_anaemie": {
    schulmedizinKurz: "Eisenmangelanämie",
    schulmedizinLang: "Hb erniedrigt + Ferritin niedrig. Fatigue, Belastungsdyspnoe, Konzentrationsstörungen, Restless-Legs.",
    schulmedizinNorm: "ICD-10 D50.-",
    tibBefund: "Schwäche von Tripa und Mar (Knochenmark-Essenz), kommt aus chronischer rLung-Belastung mit unzureichender Nahrungsaufnahme.",
    tibDominantes: ["mKhrispa", "rLung"],
    tibLebensgrundlage: ["lus"],
    tibBedeutungGanzheit:
      "Blut ist im tibetischen Verständnis eine späte Reife der Nahrung. Ein Mangel zeigt: die Verdauung kommt nicht mehr nach, " +
      "oder der Mensch verbraucht mehr Lebenskraft als er aufnimmt. Müdigkeit ist hier kein Symptom, das man unterdrücken sollte — sondern eine Bitte.",
    tibEmpfehlung: [
      { saeule: "ernaehrung",       was: "Rote-Bete-Saft, Hirse, getrocknete Aprikosen, Knochenmark-Brühe · warm + leicht verdaulich" },
      { saeule: "kraeutermedizin",  was: "Tig-Ta-Wang oder Da-trig-13 zur Anregung der Tripa-Verdauung" },
      { saeule: "lebensfuehrung",   was: "Schlaf vor 22 Uhr · keine späten Mahlzeiten · Hauptmahlzeit mittags" },
    ],
  },
  "lab:blutzucker_hoch": {
    schulmedizinKurz: "Hyperglykämie / Diabetes mellitus T2",
    schulmedizinLang: "HbA1c ≥ 6.5 % oder Nüchternblutzucker ≥ 126 mg/dl. Risiko für Mikro- und Makroangiopathie.",
    schulmedizinNorm: "ICD-10 E11 · DDG/AWMF NVL",
    tibBefund: "Khrispa-Übermaß im Stoffwechsel mit BadKan-Trägheit der Verarbeitung.",
    tibDominantes: ["mKhrispa", "BadKan"],
    tibLebensgrundlage: ["lus"],
    tibBedeutungGanzheit:
      "Süßer Geschmack ist die Sprache der Erde — er nährt, beruhigt und verbindet. " +
      "Diabetes bedeutet: der Mensch sucht außen nach Süße, weil im Inneren das ruhige BadKan-Erden fehlt. " +
      "Bewegung, Wärme, echte Ruhepausen sind die langfristige Antwort.",
    tibEmpfehlung: [
      { saeule: "ernaehrung",       was: "Bitter und scharf bevorzugen: Fenchel, Kurkuma, Bockshornklee, Bittersalat · vor Hauptmahlzeit lauwarmes Wasser" },
      { saeule: "kraeutermedizin",  was: "Ru-Tag-Lia oder Sa-Pro-25 unter Aufsicht eines Amchi" },
      { saeule: "meditation_bewegung", was: "Tägliche Bewegung 30 min · sanftes Pranayama vor dem Frühstück" },
    ],
  },

  // ─── Gangbild ───────────────────────────────────
  "gang:antalgisch": {
    schulmedizinKurz: "Antalgischer Gang",
    schulmedizinLang: "Schmerzbedingte Verkürzung der Standphase auf der betroffenen Seite. Häufig bei Hüft-, Knie- oder Lumbal-Pathologie.",
    tibBefund: "rLung-Aufstauung distal der Belastungszone — der Körper schützt sich, indem er die Bewegung modifiziert.",
    tibDominantes: ["rLung"],
    tibLebensgrundlage: ["lus"],
    tibBedeutungGanzheit:
      "Der Gang ist die rhythmische Verkörperung des Atems. Antalgisches Hinken zeigt, dass der Mensch unter dem Schritt etwas trägt, was nicht zu seiner Last gehört. " +
      "Über die Schmerzlinderung hinaus geht es um die Frage: was würde die volle Standphase wieder erlauben?",
    tibEmpfehlung: [
      { saeule: "aeussere_therapien", was: "Ölbad für die betroffene Seite · sanfte Kunye-Massage in den Glutaeen" },
      { saeule: "lebensfuehrung",     was: "Belastungspause + schrittweise Wiedereingliederung · keine harten Schuhe" },
    ],
  },
  "gang:scherengang": {
    schulmedizinKurz: "Scherengang",
    schulmedizinLang: "Adduktorenspastik mit Überkreuzen der Beine. Typisch bei spastischer Diparese, Multipler Sklerose.",
    tibBefund: "rLung-Nervensystem-Übererregung in den unteren Extremitäten, oft chronisch.",
    tibDominantes: ["rLung"],
    tibLebensgrundlage: ["lus", "yid"],
    tibBedeutungGanzheit:
      "Spastik ist nach tibetischem Verständnis ein verfestigter rLung-Sturm — die Lebensbewegung versucht zu fließen, findet aber keinen Raum. " +
      "Die Behandlung sucht den weiten Raum (Stille, Wärme, Halt) zurückzugeben.",
    tibEmpfehlung: [
      { saeule: "aeussere_therapien", was: "Tägliche warme Sesamölmassage der gesamten unteren Extremitäten" },
      { saeule: "kraeutermedizin",    was: "Agar-35 + Bsam-pa-bDe-Sel zur rLung-Beruhigung" },
      { saeule: "meditation_bewegung", was: "Sehr ruhiges Lu-Jong, viel Liegen mit Atemfokus" },
    ],
  },
  "gang:stepper": {
    schulmedizinKurz: "Steppergang",
    schulmedizinLang: "Anheben des Knies kompensiert Fußheberparese (N. peroneus oder L5-Wurzel).",
    tibBefund: "Lokale rLung-Schwäche entlang des Bein-Kanals, oft sekundär zu Wirbel-Wurzelreizung.",
    tibDominantes: ["rLung"],
    tibLebensgrundlage: ["lus"],
    tibBedeutungGanzheit:
      "Der Schritt verliert seinen leichten Aufschwung — das Bein muss bewusst gehoben werden. Im tibetischen Bild heißt das: " +
      "die rLung-Bewegung fliesst nicht mehr klar von oben, der Mensch muss kompensieren statt zu strömen.",
    tibEmpfehlung: [
      { saeule: "aeussere_therapien", was: "Moxa entlang der Peroneus-Bahn · Kunye-Massage" },
      { saeule: "kraeutermedizin",    was: "Agar-31 zur Wiederherstellung des absteigenden rLung" },
      { saeule: "meditation_bewegung", was: "Aktive Fußheberübung 3×5 min/Tag" },
    ],
  },
};

// Hilfsfunktion: Deutung suchen
export function findeDeutung(key: string): DualeDeutung | null {
  return DEUTUNGS_KATALOG[key] ?? null;
}

// Sammelfunktion: alle Deutungen zu einem Wirbelschaden-Typ
export function deutungFuerSchaden(typ: string): DualeDeutung | null {
  return findeDeutung(`wirbel:${typ}`);
}

// Sammelfunktion: alle Lab-Deutungen zu einer Wert-Konstellation
export function deutungenFuerLabor(werte: { parameter: string; flag?: string }[]): DualeDeutung[] {
  const out: DualeDeutung[] = [];
  for (const w of werte) {
    if (w.parameter === "Vitamin D 25-OH" && (w.flag === "niedrig" || w.flag === "kritisch_niedrig")) {
      out.push(DEUTUNGS_KATALOG["lab:vitamin_d_niedrig"]);
    }
    if ((w.parameter === "Hämoglobin" || w.parameter === "Ferritin") && (w.flag === "niedrig" || w.flag === "kritisch_niedrig")) {
      if (!out.some((d) => d.schulmedizinKurz.includes("Eisenmangel"))) {
        out.push(DEUTUNGS_KATALOG["lab:eisenmangel_anaemie"]);
      }
    }
    if (w.parameter === "HbA1c" && w.flag === "hoch") {
      out.push(DEUTUNGS_KATALOG["lab:blutzucker_hoch"]);
    }
  }
  return out;
}
