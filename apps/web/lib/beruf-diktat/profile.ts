// Generische Beruf-Diktat-Profile · ein Datenmodell für Heilerziehung,
// Hauswirtschaft, Erziehung, Ehrenamt.
//
// Jedes Profil definiert Felder mit Keywords, Klartext-Generator und
// Branchen-Vergleich. Spart 4 separate Stores.

export type DiktatFeld = {
  key: string;
  label: string;
  beschreibung: string;
  farbe: string;
  keywords: string[];
};

export type DiktatProfil = {
  id: string;
  rolle: string;
  titel: string;
  eyebrow: string;
  beispiel: string;
  felder: DiktatFeld[];
  /** Optionale strukturierte Output-Metriken (z.B. ICF-Codes, Stunden-Summen) */
  metriken?: { label: string; berechne: (text: string) => string | null }[];
  klartext_intro: (klientName?: string) => string;
  /** Branchen-Vergleich für Footer */
  vs: { name: string; vorher: string; nachher: string }[];
};

const TEILHABE_FELDER: DiktatFeld[] = [
  { key: "tagesablauf", label: "Tagesablauf", beschreibung: "Was wurde heute strukturiert · welche Module besucht", farbe: "var(--sat)", keywords: ["aufgestanden", "frühstück", "tagesstruktur", "modul", "gruppe", "mittag"] },
  { key: "teilhabe", label: "Teilhabe-Aktivität", beschreibung: "Welche Aktivität · Selbstständigkeit · Begleitungs-Bedarf", farbe: "var(--fri)", keywords: ["aktivität", "ausflug", "spaziergang", "kochen", "einkauf", "schwimm", "musik"] },
  { key: "kommunikation", label: "Kommunikation + Stimmung", beschreibung: "Verbal · nonverbal · Stimmungslage", farbe: "var(--vibe-team)", keywords: ["gesprochen", "lacht", "weint", "ruhig", "unruhig", "ängstlich", "kontakt"] },
  { key: "foerder", label: "Förderung + Lernen", beschreibung: "Konkrete Lernschritte · Fortschritte · Materialien", farbe: "var(--accent)", keywords: ["lerngeschichte", "fortschritt", "neu gelernt", "übte", "begriff", "geschafft"] },
  { key: "sozialraum", label: "Sozialraum + Beziehungen", beschreibung: "Andere Menschen · Familienkontakt · Konflikte", farbe: "var(--thu)", keywords: ["mitbewohner", "familie", "freund", "konflikt", "streit", "zugewandt"] },
  { key: "next", label: "Empfehlung für morgen", beschreibung: "Was wäre als nächstes wichtig", farbe: "var(--vibe-approval)", keywords: ["morgen", "nächste", "empfehl", "weiter mit", "wichtig"] },
];

const HAUSWIRT_FELDER: DiktatFeld[] = [
  { key: "speisen", label: "Speisen-Verteilung", beschreibung: "Was, wie viel, mit Anpassungen für Diäten", farbe: "var(--sun)", keywords: ["frühstück", "mittag", "abend", "kost", "diät", "diabet", "schluck"] },
  { key: "akzeptanz", label: "Akzeptanz Klient", beschreibung: "Wer hat gut/schlecht gegessen, Vorlieben/Abneigungen", farbe: "var(--mon)", keywords: ["aß gut", "verweigert", "lecker", "schmeckt", "abneig", "verlangt"] },
  { key: "hygiene", label: "Hygiene + Reinigung", beschreibung: "Räume, Wäsche, Sanitär — was wurde gemacht", farbe: "var(--vibe-team)", keywords: ["reinigung", "wäsche", "bett", "boden", "küche", "sanit"] },
  { key: "vorrat", label: "Vorrat + Bestellung", beschreibung: "Was geht zur Neige · was bestellt", farbe: "var(--vibe-stats)", keywords: ["aus", "bestellt", "knapp", "fehlt", "milch", "obst"] },
  { key: "ereignis", label: "Besonderes Ereignis", beschreibung: "Geburtstag, Besuch, Vorfälle", farbe: "var(--accent)", keywords: ["geburtstag", "besuch", "feier", "vorfall", "verschüttet"] },
];

const LERNGESCHICHTEN_FELDER: DiktatFeld[] = [
  { key: "kind", label: "Kind · Hauptperson", beschreibung: "Wer war die Hauptperson · Alter · Gruppe", farbe: "var(--wed)", keywords: ["heute", "kind", "junge", "mädchen", "gruppe"] },
  { key: "situation", label: "Situation", beschreibung: "Wo, was, wer war beteiligt", farbe: "var(--fri)", keywords: ["spielte", "saß", "draußen", "garten", "raum", "tisch"] },
  { key: "interesse", label: "Interesse + Forschen", beschreibung: "Was hat das Kind beschäftigt · Motivation", farbe: "var(--accent)", keywords: ["wollte", "interessiert", "ausprobiert", "forsch", "neugierig", "wieder und wieder"] },
  { key: "lernen", label: "Lern-Schritt", beschreibung: "Welcher Bildungsbereich · welche Kompetenz", farbe: "var(--vibe-approval)", keywords: ["zum ersten mal", "geschafft", "verstanden", "begriffen", "selbständig"] },
  { key: "stimmung", label: "Gefühl + Stolz", beschreibung: "Wie ging es dem Kind dabei", farbe: "var(--sun)", keywords: ["stolz", "gefreut", "glücklich", "frustriert", "konzentriert"] },
  { key: "naechster", label: "Nächster Schritt", beschreibung: "Was bieten wir morgen an, um das aufzugreifen", farbe: "var(--thu)", keywords: ["morgen", "nächste", "anbieten", "weiter"] },
];

const EHRENAMT_FELDER: DiktatFeld[] = [
  { key: "kontakt", label: "Kontakt + Begleitung", beschreibung: "Wer · wie lange · was gemeinsam getan", farbe: "var(--thu)", keywords: ["gespräch", "vorgelesen", "spaziergang", "saß", "begleit"] },
  { key: "stimmung", label: "Stimmung Klient", beschreibung: "Wie ging es der Person heute", farbe: "var(--vibe-team)", keywords: ["fröhlich", "traurig", "müde", "unruhig", "gut", "schwer"] },
  { key: "themen", label: "Themen + Erinnerungen", beschreibung: "Worüber gesprochen, welche Lebensgeschichte", farbe: "var(--vibe-profile)", keywords: ["erzählte", "erinnerung", "krieg", "kindheit", "familie", "tochter", "enkel"] },
  { key: "anliegen", label: "Anliegen + Bitten", beschreibung: "Was wünscht sich die Person · konkrete Bitten", farbe: "var(--accent)", keywords: ["möchte", "wunsch", "bitte", "fehlt"] },
  { key: "uebergabe", label: "Übergabe an Pflege", beschreibung: "Was sollte das Pflegeteam wissen", farbe: "var(--mon)", keywords: ["pflege", "schmerz", "weh", "bemerkt", "auffällig", "blutung"] },
];

const HAUSMEISTER_FELDER: DiktatFeld[] = [
  { key: "auftrag", label: "Auftrag + Standort", beschreibung: "Was · wo · wie dringend", farbe: "var(--mon)", keywords: ["zimmer", "bad", "etage", "küche", "garten", "sanitär", "heizung", "licht", "tür", "fenster"] },
  { key: "ursache", label: "Ursache + Diagnose", beschreibung: "Was ist defekt / wodurch entstanden", farbe: "var(--vibe-stats)", keywords: ["kaputt", "defekt", "tropft", "bricht", "verstopf", "kurzschluss", "funktion", "lose", "abgenutzt"] },
  { key: "massnahme", label: "Reparatur-Maßnahme", beschreibung: "Was wurde getan · was wurde ersetzt", farbe: "var(--vibe-team)", keywords: ["repariert", "getauscht", "ersetzt", "abgedichtet", "festgezogen", "gewechselt", "neu eingebaut"] },
  { key: "material", label: "Material + Kosten", beschreibung: "Welche Teile · welcher Preis", farbe: "var(--accent)", keywords: ["material", "ersatzteil", "schraube", "dichtung", "lampe", "filter", "euro", "kosten"] },
  { key: "sicherheit", label: "Sicherheits-Hinweis Pflege", beschreibung: "Was muss Pflege-Team wissen / Sturzgefahr / Hygiene", farbe: "var(--sun)", keywords: ["rutsch", "sturz", "haltegriff", "hygiene", "warnung", "achtung", "vorsicht"] },
  { key: "naechster", label: "Nächster Schritt", beschreibung: "Wartung · Folge-Termin · Bestellung", farbe: "var(--vibe-approval)", keywords: ["nachschauen", "wartung", "bestellt", "übermorgen", "nächste woche", "folge"] },
];

const REINIGUNG_FELDER: DiktatFeld[] = [
  { key: "bereich", label: "Bereich + Räume", beschreibung: "Welcher Bereich wurde gereinigt", farbe: "var(--vibe-team)", keywords: ["zimmer", "bad", "wohnbereich", "küche", "flur", "treppenhaus", "etage"] },
  { key: "art", label: "Reinigungs-Art", beschreibung: "Unterhalts- oder Grundreinigung · Spezial", farbe: "var(--mon)", keywords: ["unterhalt", "grundreinigung", "feucht", "trocken", "desinfek", "spezial", "wäsche"] },
  { key: "produkte", label: "Reiniger + Produkte", beschreibung: "Welche Mittel · Bio/Blauer Engel", farbe: "var(--sat)", keywords: ["bio", "blauer engel", "desinfek", "essig", "soda", "produkt", "ph-neutral"] },
  { key: "hygiene", label: "Hygiene-Beobachtung", beschreibung: "Auffälligkeiten · MRSA-Risiko · Schimmel · Ungeziefer", farbe: "var(--vibe-stats)", keywords: ["schimmel", "mrsa", "keim", "ungezief", "feucht", "stockflecken", "geruch"] },
  { key: "uebergabe", label: "Übergabe Pflege", beschreibung: "Was sollte das Pflege-Team wissen", farbe: "var(--accent)", keywords: ["pflege", "bewohner", "abwesend", "schlaft", "stört", "neuer fleck"] },
  { key: "auffaellig", label: "Verbrauch + Bestellung", beschreibung: "Was geht zur Neige · was bestellt", farbe: "var(--vibe-approval)", keywords: ["leer", "knapp", "bestell", "fehlt", "papierhandtuch", "seife"] },
];

const RECYCLING_FELDER: DiktatFeld[] = [
  { key: "abfallart", label: "Abfall-Art + AVV-Schlüssel", beschreibung: "Was wurde abgeholt · welche Schlüsselnummer", farbe: "var(--sat)", keywords: ["restmüll", "wertstoff", "bio", "papier", "glas", "med", "18 01", "inkontinenz", "pharma"] },
  { key: "menge", label: "Menge + Volumen", beschreibung: "Wie viel kg · wie viele Behälter", farbe: "var(--accent)", keywords: ["kilo", "kg", "tonne", "behälter", "sack", "fass", "liter"] },
  { key: "trennung", label: "Mülltrennungs-Quote", beschreibung: "Wie sauber war die Trennung · Fehlwürfe", farbe: "var(--vibe-team)", keywords: ["sauber", "getrennt", "fehlwurf", "kontamin", "vermischt", "korrekt"] },
  { key: "schulung", label: "Schulungs-Hinweis Pflege", beschreibung: "Wo Pflege-Team Nachschulung braucht", farbe: "var(--sun)", keywords: ["schulung", "nachschulung", "team", "info", "merkblatt"] },
  { key: "auffaellig", label: "Auffälligkeit", beschreibung: "Vorfälle · Geruch · Sicherheits-Risiko", farbe: "var(--vibe-stats)", keywords: ["geruch", "auslauf", "spitze", "kanüle", "infektion", "vorfall", "verletzung"] },
  { key: "co2", label: "CO₂-Beitrag + Reporting", beschreibung: "Recyclingquote · Audit-Tagebuch", farbe: "var(--vibe-approval)", keywords: ["co2", "klima", "audit", "report", "quote", "kreislauf"] },
];

const LEBENSMITTEL_FELDER: DiktatFeld[] = [
  { key: "menue", label: "Menü + Mahlzeit", beschreibung: "Was wurde geliefert · welche Mahlzeit", farbe: "var(--sun)", keywords: ["frühstück", "mittag", "abend", "menü", "suppe", "salat", "auflauf", "smoothie", "fingerfood"] },
  { key: "diaet", label: "Diäten + Anpassungen", beschreibung: "Diabetes/Schluckkost/Demenz/Allergien", farbe: "var(--mon)", keywords: ["diabet", "schluck", "dysphagie", "demenz", "vegetarisch", "vegan", "lakto", "glut"] },
  { key: "qualitaet", label: "Bio + Regional + Saison", beschreibung: "Bio-Anteil · Herkunft · saisonal", farbe: "var(--sat)", keywords: ["bio", "demeter", "regional", "saison", "ernte", "hof", "zertif", "frisch"] },
  { key: "akzeptanz", label: "Akzeptanz Bewohner:in", beschreibung: "Wer hat gut/schlecht gegessen · Vorlieben", farbe: "var(--vibe-team)", keywords: ["aß gut", "verweigert", "lecker", "schmeckt", "abneig", "verlangt", "wunschspeise"] },
  { key: "hygiene", label: "Hygiene + Temperatur", beschreibung: "Lieferungs-Temp · HACCP · Charge", farbe: "var(--vibe-stats)", keywords: ["temperatur", "kühlkette", "haccp", "charge", "mhd", "frisch"] },
  { key: "bestellung", label: "Vorrat + Bestellung", beschreibung: "Was geht zur Neige · was bestellen", farbe: "var(--accent)", keywords: ["aus", "knapp", "bestellt", "milch", "obst", "gemüse", "trinknahrung"] },
];

const KASSE_FELDER: DiktatFeld[] = [
  { key: "fall", label: "Fall + Versicherte:r", beschreibung: "Wer · Versicherten-Nr · Anliegen", farbe: "var(--vibe-stats)", keywords: ["versichert", "frau", "herr", "geboren", "fall"] },
  { key: "leistung", label: "Beantragte Leistung", beschreibung: "HKP, Reha, Hilfsmittel, Pflegegrad-Anpassung etc.", farbe: "var(--accent)", keywords: ["beantragt", "leistung", "hkp", "reha", "hilfsmittel", "pflegegrad", "krankengeld", "verordnung"] },
  { key: "rechtsgrundlage", label: "Rechtsgrundlage", beschreibung: "SGB-V/-XI-Paragraph + Begründung", farbe: "var(--vibe-team)", keywords: ["§", "sgb", "abs", "satz", "richtlinie", "anlage"] },
  { key: "entscheidung", label: "Entscheidung", beschreibung: "Bewilligt / Ablehnung / Teilbewilligung", farbe: "var(--vibe-approval)", keywords: ["bewillig", "abgelehn", "teilbewilligt", "übernehmen", "entscheid"] },
  { key: "begruendung", label: "Begründung in einfacher Sprache", beschreibung: "Klartext-Erklärung warum bewilligt/abgelehnt", farbe: "var(--mon)", keywords: ["weil", "da", "weil sie", "voraussetz", "kriterium"] },
  { key: "rechtsmittel", label: "Rechtsmittel-Belehrung", beschreibung: "Widerspruchsrecht + Frist + wo einreichen", farbe: "var(--sun)", keywords: ["widerspruch", "frist", "monat", "schriftlich", "rechtsmittel"] },
];

export const PROFILES: Record<string, DiktatProfil> = {
  kasse: {
    id: "kasse",
    rolle: "kasse",
    titel: "Bescheid diktieren · in einfacher Sprache",
    eyebrow: "Krankenkasse · §§ 33-37 SGB V / SGB XI",
    beispiel: "Frau Helga Reinhardt geboren neunzehnneunundvierzig, Versicherten-Nummer X123456789. Beantragt häusliche Krankenpflege Behandlungspflege Wundversorgung dreimal wöchentlich für vier Wochen. Rechtsgrundlage Paragraph 37 Absatz 2 SGB V mit Anlage 1 Häusliche-Krankenpflege-Richtlinie. Entscheidung: bewilligt für vier Wochen. Begründung: Die Wundversorgung kann nicht durch die Versicherte selbst durchgeführt werden, ärztliche Verordnung liegt vor. Widerspruch innerhalb eines Monats nach Zustellung schriftlich bei der Krankenkasse einzureichen.",
    felder: KASSE_FELDER,
    klartext_intro: (n) => `Liebe${n ? " Frau / Lieber Herr " + n : "/r Versicherte:r"},\n\nzu Ihrem Antrag haben wir entschieden:`,
    vs: [
      { name: "AOK / Barmer / TK", vorher: "Bescheid in Amtsdeutsch · 60 min Tippen", nachher: "Diktat → Bescheid + Klartext-Begründung in 2 min" },
      { name: "kein Anbieter", vorher: "Bescheid für Versicherte:n unverständlich", nachher: "Klartext-Brücke automatisch beigelegt" },
      { name: "Bürokratie-Abbau", vorher: "Antrags-Stau, Nachfrage-Schleifen", nachher: "Sofortige Klartext-Begründung reduziert Widersprüche um geschätzte 40%" },
    ],
  },

  heilerziehung: {
    id: "heilerziehung",
    rolle: "heilerziehung",
    titel: "Teilhabe-Doku diktieren",
    eyebrow: "Heilerziehung · BTHG-Teilhabe",
    beispiel: "Tarek heute morgen ruhig aufgestanden, Frühstück selbständig, dann Modul Holzwerkstatt zwei Stunden. Hat zum ersten Mal allein einen Nagel eingeschlagen — sehr stolz. Mit Mitbewohner Lukas zusammen am Tisch, kurzer Konflikt um Werkzeug, schnell selbst gelöst. Mittagspause, Spaziergang im Park, hat über seine Schwester gesprochen. Empfehlung morgen: Holzwerkstatt fortsetzen, Lukas dazu einladen.",
    felder: TEILHABE_FELDER,
    klartext_intro: (n) => `Liebe Familie${n ? "/r " + n : ""}, hier eine kurze Notiz von heute:`,
    vs: [
      { name: "VINCI Teilhabe", vorher: "60-Felder-Excel", nachher: "Diktat → 6 Felder" },
      { name: "ProSoz/Klees", vorher: "Drop-Down ICF", nachher: "KI schlägt aus Beschreibung vor" },
      { name: "kein Anbieter", vorher: "—", nachher: "Klartext-Brücke an Familie automatisch" },
    ],
  },
  hauswirtschaft: {
    id: "hauswirtschaft",
    rolle: "hauswirtschaft",
    titel: "Hauswirtschafts-Doku diktieren",
    eyebrow: "Hauswirtschaft · LMHV + Pflege",
    beispiel: "Frühstück Pulmologie 3B verteilt, Diabetes-Diät bei Bertha angepasst, Kartoffelsuppe Mittag. Helga hat heute schlecht gegessen, Vorlieben-Notiz: mag keine Kartoffelsuppe. Wäsche Etage 3 gewaschen. Milch geht zur Neige, Bestellung morgen. Geburtstag Otto am Donnerstag, Kuchen vorbereiten.",
    felder: HAUSWIRT_FELDER,
    klartext_intro: () => "Hauswirtschafts-Übergabe an die Schicht:",
    vs: [
      { name: "Vivendi HW", vorher: "30 min Excel-Eintrag", nachher: "1 min Diktat" },
      { name: "kein Anbieter", vorher: "Speisen-Akzeptanz nicht erfasst", nachher: "Vorlieben/Abneigungen pro Klient + KI-Vorschlag Speiseplan" },
    ],
  },
  erziehung: {
    id: "erziehung",
    rolle: "erziehung",
    titel: "Lerngeschichte diktieren",
    eyebrow: "Kita · Lerngeschichten nach Margret Carr",
    beispiel: "Heute hat Lina vier Jahre im Garten zum ersten Mal allein eine Kletter-Sequenz an der Sprossenwand geschafft. Sie hat es immer wieder probiert, war sehr konzentriert, am Ende hat sie strahlend zur Erzieherin geschaut. Bildungsbereich: Bewegung + Selbstvertrauen. Morgen anbieten: höhere Stufe der Kletterwand mit Begleitung.",
    felder: LERNGESCHICHTEN_FELDER,
    klartext_intro: () => "Liebe Familie, eine Lerngeschichte von heute:",
    vs: [
      { name: "Stepfolio/Pixi", vorher: "Foto + 5 Min Text tippen", nachher: "Foto + 30 Sek Diktat" },
      { name: "kein Anbieter", vorher: "Lerngeschichten-Format manuell strukturiert", nachher: "Margret-Carr-6-Felder automatisch" },
    ],
  },
  ehrenamt: {
    id: "ehrenamt",
    rolle: "ehrenamt",
    titel: "Begleit-Protokoll diktieren",
    eyebrow: "Ehrenamt · Hospiz-Begleitung",
    beispiel: "Bei Helga eine Stunde gesessen, Rosamunde Pilcher vorgelesen. Sie war müde aber ruhig. Hat von ihrer Tochter Petra erzählt, sehr lebendig, schöne Erinnerungen aus der Kindheit. Wunsch: Foto-Album von der Familie holen. Pflege-Übergabe: linkes Bein hat sie öfter gerieben, vielleicht Schmerz, bitte nachschauen.",
    felder: EHRENAMT_FELDER,
    klartext_intro: () => "Übergabe an die Pflege + Familie:",
    vs: [
      { name: "Papier-Heft", vorher: "Hand-Notiz, oft nicht digitalisiert", nachher: "Diktat → digital + Pflege-Übergabe automatisch" },
      { name: "kein Anbieter", vorher: "Kein Tool für Ehrenamt", nachher: "Erstes spezialisiertes Begleit-Doku-Tool" },
    ],
  },

  hausmeister: {
    id: "hausmeister",
    rolle: "hausmeister",
    titel: "Reparatur-Protokoll diktieren",
    eyebrow: "Hausmeister · Facility · DGUV V3",
    beispiel: "Sanitär Etage 3 Zimmer 314, Spülkasten tropft, Dichtung am Eckventil ist abgenutzt. Habe Eckventil komplett getauscht, neue Dichtung eingesetzt. Material 8 Euro 40, ein Eckventil, drei Dichtungsringe. Pflege-Hinweis: Bewohnerin Helga ist sturzgefährdet, Boden nur kurz feucht, Hinweisschild aufgestellt. Wartungs-Folge in zwei Wochen Heizungsfilter prüfen.",
    felder: HAUSMEISTER_FELDER,
    klartext_intro: () => "Stations-Hinweis nach Reparatur:",
    vs: [
      { name: "Papier-Logbuch", vorher: "Hand-Notiz im Reparatur-Buch · selten an Pflege übergeben", nachher: "Diktat → digital · Sicherheits-Hinweis sofort an Pflege" },
      { name: "kein Anbieter", vorher: "Hausmeister-Doku in Pflege-Cockpits ungewöhnlich", nachher: "Erstes Reparatur-Diktat mit DNQP-Sturz-Cross-Trigger" },
    ],
  },

  reinigung: {
    id: "reinigung",
    rolle: "reinigung",
    titel: "Reinigungs-Protokoll diktieren",
    eyebrow: "Reinigung · Hygiene-Plan IfSG § 36",
    beispiel: "Wohnbereich 2 grundgereinigt heute Vormittag, Bad und Toilette desinfiziert mit Blauer-Engel-Reiniger. In Zimmer 217 Schimmelfleck oben an der Decke entdeckt, vermutlich Feuchtigkeit, Hausmeister informiert. Pflege-Hinweis: Bewohner Otto schlief während der Reinigung, nicht gestört. Verbrauch: Papierhandtücher Etage 3 fast leer, bestelle.",
    felder: REINIGUNG_FELDER,
    klartext_intro: () => "Reinigungs-Übergabe:",
    vs: [
      { name: "Stempel-Listen", vorher: "Reinigungs-Plan mit Häkchen, keine Hygiene-Beobachtung erfasst", nachher: "Diktat → strukturiert · Hygiene-Auffälligkeit + Pflege-Übergabe automatisch" },
      { name: "kein Anbieter", vorher: "Reinigungskräfte ohne digitales Tool · Sprache oft Hürde", nachher: "Mehrsprachiges Diktat (Phase 2) · Hygiene-Beobachtung gleichberechtigt mit Pflege" },
    ],
  },

  recycling: {
    id: "recycling",
    rolle: "recycling",
    titel: "Abfall-Protokoll diktieren",
    eyebrow: "Recycling · KrWG § 52 · AVV",
    beispiel: "Heute Wertstoff und Restmüll von Etage 1 und 2 abgeholt. Restmüll achtundvierzig Kilo, Inkontinenz-Material AVV 18 01 04 zweiunddreißig Kilo, Bioabfall siebzehn Kilo. Trennungsquote sehr gut, nur in Etage 2 ein Fehlwurf Glas im Restmüll. Empfehlung: Pflege-Team Etage 2 kurze Auffrischung Mülltrennung. Audit-Tagebuch eingetragen, CO₂-Beitrag minus zwölf Kilo gegenüber Vorwoche.",
    felder: RECYCLING_FELDER,
    klartext_intro: () => "Entsorgungs-Übergabe:",
    vs: [
      { name: "Lieferschein-Stapel", vorher: "Papier-Schein pro Abholung · keine Quote-Erfassung", nachher: "Diktat → strukturiert · CO₂-Bilanz + Audit-Tagebuch automatisch" },
      { name: "Kein Anbieter", vorher: "Recycling als reine Logistik-Frage", nachher: "Recycling als Pflege-Partner · DNQP-Cross-Trigger Inkontinenz + Wunde" },
    ],
  },

  lebensmittel: {
    id: "lebensmittel",
    rolle: "lebensmittel",
    titel: "Speisen-Protokoll diktieren",
    eyebrow: "Lebensmittel · DGE-Pflegestandard",
    beispiel: "Mittagessen heute Wohnbereich 1, Linseneintopf mit Bio-Würstchen aus Demeter-Hof Niederrhein, dreiundzwanzig Portionen verteilt. Diabetes-Variante für Bertha angepasst, Schluck-Portion mit IDDSI Stufe vier für Helga, Demenz-Fingerfood-Variante für Walter. Akzeptanz sehr gut bei zwanzig, Helga hat halb gegessen, Walter hat gestrahlt und alles aufgegessen. Trinknahrung Fresubin geht zur Neige, bestelle morgen. Temperatur bei Lieferung achtundsechzig Grad, HACCP eingehalten.",
    felder: LEBENSMITTEL_FELDER,
    klartext_intro: () => "Mahlzeiten-Übergabe an Pflege + Hauswirtschaft:",
    vs: [
      { name: "Speiseplan-Excel", vorher: "Standard-Plan ohne Anpassungs-Tracking pro Bewohner", nachher: "Diktat → Diät-Anpassung pro Person · Akzeptanz-Verlauf · DNQP-Ernährungs-Brücke" },
      { name: "Edeka Foodservice", vorher: "Lieferschein nur · keine Bewohner-Akzeptanz", nachher: "Akzeptanz-Daten zurück an Lieferant · Speiseplan lernt mit" },
    ],
  },
};

export type StrukturiertesProtokoll = {
  felder: Record<string, string>;
  klartext: string;
  zeitErsparnisSec: number;
  warnungen: string[];
};

export function strukturiereDiktat(transkript: string, profil: DiktatProfil): StrukturiertesProtokoll {
  const saetze = transkript.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  const felder: Record<string, string> = {};

  for (const satz of saetze) {
    const lower = satz.toLowerCase();
    let bestKey: string | null = null;
    let bestScore = 0;
    for (const f of profil.felder) {
      const score = f.keywords.filter((k) => lower.includes(k)).length;
      if (score > bestScore) {
        bestScore = score;
        bestKey = f.key;
      }
    }
    if (bestKey) {
      felder[bestKey] = (felder[bestKey] ? felder[bestKey] + " · " : "") + satz;
    }
  }

  // Klartext aus den ersten 2-3 Feldern
  const teile = [profil.klartext_intro()];
  for (const f of profil.felder.slice(0, 4)) {
    if (felder[f.key]) {
      teile.push(`• ${f.label}: ${kurz(felder[f.key], 100)}`);
    }
  }
  const klartext = teile.join("\n");

  // Warnungen
  const warnungen: string[] = [];
  const lower = transkript.toLowerCase();
  if (lower.includes("schmerz") || lower.includes("blut") || lower.includes("notfall")) {
    warnungen.push("Medizinisches Symptom erwähnt — bitte sofort an Pflege/Arzt eskalieren.");
  }
  if (lower.includes("konflikt") || lower.includes("streit") || lower.includes("aggressi")) {
    warnungen.push("Konflikt-/Aggression-Hinweis — Schicht-Übergabe + ggf. Sozialarbeit informieren.");
  }
  if (lower.includes("traurig") && lower.includes("alle")) {
    warnungen.push("Möglicher emotionaler Bedarf — psychosoziale Begleitung anbieten.");
  }

  // Zeit-Ersparnis
  const woerter = transkript.split(/\s+/).filter(Boolean).length;
  const zeitErsparnisSec = Math.max(0, woerter - 30); // ~1 Sek/Wort gegen Tippen

  return { felder, klartext, zeitErsparnisSec, warnungen };
}

function kurz(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}
