// Hausmittel- und Kneipp-Anwendungen aus dem Hausmittelrunde-Kompendium 3.0.4.
// Inhaltlich übernommen aus dem PDF (Kneipp-Anwendungen, Hausmittel-Übersicht,
// Aromatherapie und Schmerzöle).
//
// Strukturierung erlaubt der App, jede Anwendung mit Indikation,
// Material, Anleitung und Hinweisen anzuzeigen — und im KI-Therapie-
// Modul deterministisch zu verlinken (siehe lib/therapie/alternativ.ts).

export type Anwendungstyp =
  | "kneipp"           // Hydrotherapie, Wassertreten u. ä.
  | "wickel_auflage"   // Auflagen, Kompressen, Wickel
  | "aromatherapie"    // Ätherische Öle
  | "schmerzoel"       // anthroposophische Schmerzöle (Wala, Weleda)
  | "kraeuter";        // Tee, Phyto-Extrakte

export const ANWENDUNGSTYP_LABEL: Record<Anwendungstyp, string> = {
  kneipp:         "Kneipp-Anwendung",
  wickel_auflage: "Wickel & Auflagen",
  aromatherapie:  "Aromatherapie",
  schmerzoel:     "Schmerzöl",
  kraeuter:       "Kräuter & Tee",
};

export const ANWENDUNGSTYP_FARBE: Record<Anwendungstyp, string> = {
  kneipp:         "var(--vibe-team)",
  wickel_auflage: "var(--fri)",
  aromatherapie:  "var(--vibe-profile)",
  schmerzoel:     "var(--mon)",
  kraeuter:       "var(--thu)",
};

export type Hausmittel = {
  id: string;
  typ: Anwendungstyp;
  name: string;
  motto?: string;            // z.B. „Der Allrounder", „Tasse Kaffee"
  geeignetBei: string[];
  vorsichtBei: string[];
  wirkungsweise: string[];
  material: string[];
  anleitung: string[];        // Schritt für Schritt
  dauer?: string;             // „45–75 min"
  hinweis?: string;
  quelle: string;
};

export const HAUSMITTEL: Hausmittel[] = [
  // ─── Kneipp-Anwendungen ─────────────────────────────────
  {
    id: "kneipp-brustwickel-kalt",
    typ: "kneipp",
    name: "Kalter Brustwickel",
    motto: "Der Allrounder",
    geeignetBei: [
      "akute Atemwegsbeschwerden",
      "Schwächezustände (mild)",
      "chronische Schmerzerkrankungen",
    ],
    vorsichtBei: [
      "Frieren, Frösteln",
      "Starke Schwächezustände",
    ],
    wirkungsweise: [
      "entzündungshemmend",
      "durchblutungssteigernd",
      "Sekretverdünnung in den Atemwegen",
      "fiebersenkend",
      "schmerzlindernd",
    ],
    material: ["Leinentuch", "Wolltuch", "kaltes Wasser"],
    anleitung: [
      "Tücher faltenlos straff um die Brust wickeln: auf der Haut Leinentuch in kaltes Wasser getaucht und ausgewrungen, darüber Wolltuch.",
      "Platzierung: Achselhöhle bis eine Handbreit unter dem Rippenbogen.",
      "Liegedauer: bis gute Durchwärmung eingetreten ist (45–75 min).",
    ],
    dauer: "45–75 min",
    quelle: "Hausmittelrunde 3.0.4 (Kneipp-Anwendungen)",
  },
  {
    id: "kneipp-armbad-kalt",
    typ: "kneipp",
    name: "Kaltes Armbad",
    motto: "Tasse Kaffee",
    geeignetBei: [
      "Abgeschlagenheit",
      "körperliche und geistige Erschöpfung",
      "Nervöses Herzklopfen ohne organische Herzkrankheit",
      "Schmerzen in den Armen",
      "Schlafförderung bei niedrigem Blutdruck",
      "Blutdrucksenkung bei hohem Blutdruck",
    ],
    vorsichtBei: [
      "Angina pectoris, organische Herzkrankheiten",
      "kalte Hände vor Anwendung (vorher erwärmen)",
      "Raynaud-Syndrom (Gefäßkrämpfe in den Händen)",
    ],
    wirkungsweise: [
      "Herzschlagfrequenz senkend, beruhigend",
      "erfrischend, anregend ohne aufzuregen",
    ],
    material: ["Armbadewanne / Waschbecken / Brunnentrog", "kaltes Wasser 12–18 °C"],
    anleitung: [
      "Gefäß mit kaltem Wasser füllen (so kalt wie möglich, ca. 12–18 °C).",
      "Arme bis Mitte Oberarm eintauchen.",
      "Bis 30 Sekunden, je nach Wassertemperatur — bis zum Eintreten von Kälteempfinden / -schmerz.",
      "Wasser nur abstreifen, nicht abtrocknen — Reizstärke wird durch Verdunstungskälte vergrößert.",
      "Arme bewegen (pendeln), bis Wärmegefühl eintritt.",
    ],
    dauer: "≤ 30 Sekunden",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "kneipp-taulaufen",
    typ: "kneipp",
    name: "Taulaufen / Schneegehen",
    motto: "Erden und Schwung für den Tag",
    geeignetBei: [
      "chronische Kopfschmerzen",
      "Infektanfälligkeit",
      "Abgeschlagenheit, Müdigkeit",
    ],
    vorsichtBei: [
      "Harnwegsinfekte, Blasen-/Nierenkrankheiten",
      "Ischiasnervenschmerzen",
      "starke arterielle Durchblutungsstörungen",
      "Menstruation",
      "Gefühlsstörungen in den Füßen (Diabetes mellitus)",
    ],
    wirkungsweise: [
      "durchblutungsfördernd, venenkräftigend",
      "vegetativ stabilisierend",
      "infektvorbeugend, erfrischend",
    ],
    material: ["taufeuchter Rasen oder frisch gefallener Schnee", "Frotteehandtuch", "warme Wollsocken"],
    anleitung: [
      "Anfang: nur wenige Minuten Tautreten, wenige Sekunden Schneetreten.",
      "Im Verlauf der Tagesroutine Dauer auf 10 bzw. 3 Minuten steigern.",
      "Auf Wiedererwärmung achten: Bett, Wollsocken, schnelles Gehen, Trockenfrottieren.",
    ],
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "kneipp-nasse-stroempfe",
    typ: "kneipp",
    name: "Nasse Strümpfe",
    motto: "Die Erdung",
    geeignetBei: ["Einschlafstörungen", "Krampfadern", "Venenleiden"],
    vorsichtBei: ["akute Harnwegsinfekte", "Frieren, Frösteln", "Menstruation"],
    wirkungsweise: ["schlaffördernd", "venentonisierend", "beruhigend"],
    material: ["Leinenstrümpfe", "lange Wollstrümpfe", "Unterlage fürs Bett"],
    anleitung: [
      "Leinenstrümpfe in kaltes Wasser tauchen, ausdrücken, anziehen, glattstreichen.",
      "Wollstrümpfe darüber ziehen.",
      "Liegedauer variabel — bei Bedarf die ganze Nacht.",
    ],
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "kneipp-leibwaschung",
    typ: "kneipp",
    name: "Leibwaschung",
    motto: "Die Abführ- und Einschlafpille",
    geeignetBei: ["Einschlafstörungen", "Verdauungsstörungen (Darmträgheit, Blähungen)"],
    vorsichtBei: ["Kältegefühl, Frösteln", "Harnwegsinfekt"],
    wirkungsweise: ["Darmtätigkeit wird angeregt", "schlaffördernd"],
    material: ["Leinenwaschtuch", "Gefäß mit Wasser 18–22 °C (im Verlauf kälter)"],
    anleitung: [
      "Tuch ins Wasser tauchen und ausdrücken.",
      "Langsam, kreisförmig im Uhrzeigersinn bewegen — Beginn rechts auf Höhe des Hüftknochens.",
      "20- bis 40-mal kreisen.",
      "Tuch mehrmals wieder anfeuchten.",
    ],
    quelle: "Hausmittelrunde 3.0.4",
  },

  // ─── Wickel und Auflagen ────────────────────────────────
  {
    id: "auflage-lavendel-herz",
    typ: "wickel_auflage",
    name: "Lavendel-Herz-Auflage",
    geeignetBei: [
      "Bluthochdruck",
      "erhöhter Puls",
      "Einschlafschwierigkeiten",
      "Unruhezustände",
      "Angstzustände",
    ],
    vorsichtBei: [],
    wirkungsweise: [
      "antibakteriell, krampflösend, entzündungshemmend",
      "Dämpfung des sympathischen Nervensystems (beruhigend)",
    ],
    material: ["Geschirrtuch", "Lavendelöl 5 %", "Frotteetuch"],
    anleitung: [
      "Geschirrtuch in kaltes Wasser tauchen, auswringen, dreifach falten (ca. DIN A4) und mit Lavendelöl beträufeln.",
      "Herzgegend mit Lavendelöl einreiben, nasses Tuch auf die Herzgegend legen, mit Frotteetuch abdecken.",
      "Mindestens 30 Minuten liegen lassen.",
    ],
    dauer: "≥ 30 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-rosmarin-herz",
    typ: "wickel_auflage",
    name: "Rosmarin-Herz-Auflage",
    geeignetBei: ["niedriger Blutdruck", "Kreislaufschwäche", "depressive Zustände"],
    vorsichtBei: [],
    wirkungsweise: [
      "stimmungsaufhellend",
      "konzentrationssteigernd",
      "entzündungshemmend, harntreibend, verdauungsfördernd",
    ],
    material: ["Geschirrtuch", "Rosmarinöl 5 %", "Frotteetuch"],
    anleitung: [
      "Geschirrtuch in kaltes Wasser tauchen, auswringen, dreifach falten (ca. DIN A4) und mit Rosmarinöl beträufeln.",
      "Herzgegend mit Rosmarinöl einreiben, nasses Tuch auf die Herzgegend legen, mit Frotteetuch abdecken.",
      "Mindestens 30 Minuten liegen lassen.",
    ],
    dauer: "≥ 30 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-quark-kalt",
    typ: "wickel_auflage",
    name: "Quarkauflage (kalt)",
    geeignetBei: [
      "Halsschmerzen",
      "Gelenkentzündung",
      "Brustdrüsenentzündung",
      "Venenentzündung",
      "Prellungen",
      "Sonnenbrand",
    ],
    vorsichtBei: [],
    wirkungsweise: [
      "kühlend, abschwellend",
      "schmerzlindernd, schleimlösend",
      "durchblutungsfördernd, entzündungshemmend",
    ],
    material: ["Stofftuch oder Kompresse", "Speisequark", "Mullbinde oder Schal", "großes Handtuch als Unterlage"],
    anleitung: [
      "Speisequark ausreichend abtropfen lassen.",
      "Quark fingerdick auf das Stofftuch / die Kompresse streichen und entsprechend des Hautareals falten.",
      "Mindestens 30 Minuten liegen lassen.",
    ],
    dauer: "≥ 30 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-retterspitz",
    typ: "wickel_auflage",
    name: "Retterspitz-Auflage (kalt)",
    geeignetBei: ["wie Quarkauflage"],
    vorsichtBei: [],
    wirkungsweise: ["wie Quarkauflage"],
    material: ["Stofftuch oder Kompresse", "Retterspitz Äußerlich", "Mullbinde / Schal", "großes Handtuch"],
    anleitung: [
      "Retterspitz Äußerlich auf die Kompresse auftragen (durchtränkt, aber nicht tropfend).",
      "Durchtränkte Kompresse auf das Hautareal auflegen, mit leichtem Druck fixieren.",
      "Mindestens 30 Minuten einwirken lassen.",
    ],
    dauer: "≥ 30 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-kuemmel-leib",
    typ: "wickel_auflage",
    name: "Kümmelöl-Leib-Auflage",
    geeignetBei: ["Völlegefühl", "Blähungen", "Bauchschmerzen", "Reizdarm"],
    vorsichtBei: [],
    wirkungsweise: ["verdauungsfördernd", "krampflösend", "durchblutungsfördernd"],
    material: ["Geschirrtuch", "Kümmelöl 5 %", "Frotteetuch", "Wärmflasche"],
    anleitung: [
      "Geschirrtuch in warmes Wasser tauchen, auswringen, dreifach falten.",
      "Bauch mit Kümmelöl 5 % im Uhrzeigersinn einreiben.",
      "Feuchtwarmes Geschirrtuch darüber legen.",
      "Wärmflasche in Frotteetuch wickeln und mind. 30 Minuten auf den Bauch legen.",
    ],
    dauer: "≥ 30 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-melissen",
    typ: "wickel_auflage",
    name: "Melissen-Auflage",
    geeignetBei: ["wie Kümmelöl", "innere Unruhe und Schlafstörungen", "Menstruationsbeschwerden"],
    vorsichtBei: [],
    wirkungsweise: ["wie Kümmelöl"],
    material: ["Geschirrtuch", "Melissenöl 5 %", "Frotteetuch", "Wärmflasche"],
    anleitung: [
      "Geschirrtuch in warmes Wasser tauchen, auswringen, dreifach falten.",
      "Bauch mit Melissenöl 5 % im Uhrzeigersinn einreiben.",
      "Feuchtwarmes Geschirrtuch darüber legen.",
      "Wärmflasche in Frotteetuch, mind. 30 min auf den Bauch.",
    ],
    dauer: "≥ 30 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-eukalyptus-blase",
    typ: "wickel_auflage",
    name: "Eukalyptus-Blasenkompresse",
    geeignetBei: ["Harnverhalt (auch postoperativ)", "Restharn", "Harnwegsinfektion", "Zystitis"],
    vorsichtBei: [],
    wirkungsweise: [
      "entkrampfend, analgetisch",
      "antiviral, antibakteriell, entzündungshemmend",
    ],
    material: ["Stofftuch / Kompresse", "Eukalyptusöl 5 %", "Frotteetuch", "Wärmflasche"],
    anleitung: [
      "Stofftuch / Kompresse mit Eukalyptusöl beträufeln und auf die Blasenregion legen.",
      "Wärmflasche mit wenig heißem Wasser in Frottee wickeln, auf Unterbauch legen, mit Handtuch abdecken.",
      "Mindestens 60 Minuten einwirken lassen, evtl. über Nacht.",
    ],
    dauer: "≥ 60 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-ingwer-niere",
    typ: "wickel_auflage",
    name: "Ingwer-Nieren-Wickel",
    geeignetBei: [
      "Erschöpfung",
      "Rückenschmerzen",
      "Angstzustände",
      "Muskelverhärtung",
      "Bluthochdruck",
      "Infektionen",
    ],
    vorsichtBei: ["Allergie", "Neurodermitis", "offene und schuppige Hautstellen", "Kinder"],
    wirkungsweise: ["wärmend, durchblutungsfördernd, entkrampfend"],
    material: ["gemahlener Ingwerwurzelstock", "Stofftuch / Kompressen", "Wolltuch / Badetuch"],
    anleitung: [
      "Päckchen ca. 10×20 cm packen, mit heißem Aufguss übergießen, ggf. mit Vaseline auf dem LWS-Bereich platzieren.",
      "Mit saugfähiger Unterlage in das Wolltuch einwickeln.",
      "Ca. 30 Minuten einwirken lassen.",
    ],
    dauer: "ca. 30 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-senfmehl-stirn",
    typ: "wickel_auflage",
    name: "Senfmehl-Auflage Stirn / NNH",
    geeignetBei: ["Erkältung", "Sinusitis"],
    vorsichtBei: ["Allergie", "Neurodermitis", "offene/schuppige Hautstellen", "Kinder"],
    wirkungsweise: ["stark hyperämisierend (Durchblutung steigt)"],
    material: ["Senfmehl (gemahlene Senfsamen)", "Kompressen", "Vaseline"],
    anleitung: [
      "Auf Kompresse (~4×4 cm) ca. 1–2 TL Senfmehl geben, Päckchen falten.",
      "Drei Päckchen auf Teller, mit siedendem Wasser übergießen, 1 min ziehen.",
      "Mit zweitem Teller ausdrücken.",
      "Bereich dick mit Vaseline einreiben, Augen mit feuchten Kompressen abdecken, Päckchen 1–3 min einwirken lassen.",
    ],
    dauer: "1–3 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-senfmehl-sternum",
    typ: "wickel_auflage",
    name: "Senfmehl-Auflage Sternum",
    geeignetBei: ["Bronchitis", "Erkältung", "Asthma"],
    vorsichtBei: ["Allergie", "Neurodermitis", "offene/schuppige Hautstellen", "Kinder"],
    wirkungsweise: ["sekretolytisch, schleimlösend, stark hyperämisierend"],
    material: ["Senfmehl", "Kompressen", "Vaseline"],
    anleitung: [
      "Kompresse (~8×12 cm) mit 3–4 EL Senfmehl füllen, Päckchen falten.",
      "Mit siedendem Wasser übergießen, 1 min ziehen, ausdrücken.",
      "Sternum mit Vaseline einreiben, Päckchen 1–3 min auflegen.",
    ],
    dauer: "1–3 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-senfmehl-bad",
    typ: "wickel_auflage",
    name: "Senfmehl Fuß-/Handbad",
    geeignetBei: ["beginnende Erkältung", "Kopfschmerzen", "Einschlafschwierigkeiten"],
    vorsichtBei: ["Krampfadern"],
    wirkungsweise: ["durchblutungsfördernd, ableitend"],
    material: ["Fuß- / Handwanne", "Senfmehl", "Handtuch", "Olivenöl"],
    anleitung: [
      "Wanne knöchelhoch mit warmem Wasser füllen.",
      "1–2 EL Senfmehl darin auflösen, Füße baden.",
      "Nach und nach heißes Wasser bis zur Wadenhöhe zugießen — ca. 20 min.",
      "Anschließend Füße gut abspülen (Zehenzwischenräume!) und mit Olivenöl einreiben.",
    ],
    dauer: "ca. 20 min",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-kohl",
    typ: "wickel_auflage",
    name: "Kohlauflage",
    geeignetBei: ["chronische Gelenkbeschwerden", "Krampfadern", "Lymphstau", "offene Beine", "Rheuma"],
    vorsichtBei: [],
    wirkungsweise: ["entzündungshemmend, schmerzlindernd, entgiftend, kühlend"],
    material: ["Wirsing oder Weißkohl", "Mullbinde zum Fixieren"],
    anleitung: [
      "Ausgewalzten Kohl (bis Saft heraustritt) direkt auf das Hautareal legen, fest wickeln.",
      "Für 1 bis 12 Stunden (über Nacht) einwirken lassen.",
    ],
    dauer: "1–12 h",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-heilerde",
    typ: "wickel_auflage",
    name: "Heilerde-Emulsion",
    geeignetBei: [
      "trockene, gerötete, beanspruchte Haut",
      "Ekzeme",
      "Psoriasis",
      "Akne",
      "Bartflechte (Hautpilz bei Männern)",
    ],
    vorsichtBei: [],
    wirkungsweise: ["antibakteriell", "hohe Absorptionsfähigkeit"],
    material: ["Heilerde äußerlich", "Honig", "Olivenöl", "Salzwasser 0,9 %"],
    anleitung: [
      "4 Teile Heilerde, 1 Teil Honig, 1 Teil Olivenöl, 1 Teil Salzwasser zu Emulsion vermischen.",
      "Auf betroffene Stellen auftragen, evtl. abdecken.",
      "Ca. 2 h bzw. bis zum Trocknen einwirken lassen.",
      "Anschließend mit warmem Wasser abwaschen.",
    ],
    dauer: "ca. 2 h",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "auflage-nackenrolle",
    typ: "wickel_auflage",
    name: "Heiße Nackenrolle",
    geeignetBei: ["Spannungskopfschmerzen", "Nackenverspannung", "Nackenschmerzen"],
    vorsichtBei: [],
    wirkungsweise: ["wärmend, muskelentspannend"],
    material: ["Frotteehandtuch", "Wärmflasche"],
    anleitung: [
      "Frotteetuch zum Viertel aufrollen.",
      "100 ml siedendes Wasser darüber träufeln, ganz aufrollen, evtl. Wärmflasche hinzufügen.",
      "Rechtzeitig die abgekühlte Rolle entfernen, ggf. wiederholen.",
    ],
    quelle: "Hausmittelrunde 3.0.4",
  },

  // ─── Kräuter & Zubereitungen ────────────────────────────
  {
    id: "kraeuter-leinsamenschleim",
    typ: "kraeuter",
    name: "Leinsamenschleim",
    geeignetBei: ["Magenschmerzen", "Magenschleimhautentzündung", "Sodbrennen", "Verstopfung"],
    vorsichtBei: [],
    wirkungsweise: ["schleimhautschützend", "mild abführend"],
    material: ["Leinsamen", "Kochtopf", "engmaschiges Sieb", "Thermoskanne"],
    anleitung: [
      "2–3 EL Leinsamen in 500 ml Wasser für mind. 30 min köcheln lassen.",
      "Wenn Kochwasser dickflüssig ist, durchsieben, in Thermoskanne füllen.",
      "Schluckweise warm trinken.",
    ],
    quelle: "Hausmittelrunde 3.0.4",
  },

  // ─── Aromatherapie ─────────────────────────────────────
  {
    id: "aroma-stick-depression",
    typ: "aromatherapie",
    name: "Aromastick · Depression / Angst",
    motto: "Auf ärztliche Anordnung",
    geeignetBei: ["depressive Verstimmung", "Angst"],
    vorsichtBei: ["Allergien gegen Bestandteile"],
    wirkungsweise: ["stimmungsaufhellend, angstlösend"],
    material: ["Aromastick / Riechstift", "Weihrauch 2 Tropfen", "Bergamotte 4 Tropfen"],
    anleitung: ["Tropfen auf Aromastick geben", "Bei Bedarf inhalieren, 3–5 langsame Atemzüge"],
    hinweis: "Anwendung nur nach ärztlicher Anordnung dokumentieren.",
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "aroma-stick-uebelkeit",
    typ: "aromatherapie",
    name: "Aromastick · Übelkeit",
    motto: "Auf ärztliche Anordnung",
    geeignetBei: ["Übelkeit, Brechreiz"],
    vorsichtBei: ["Asthma"],
    wirkungsweise: ["antiemetisch"],
    material: ["Aromastick", "Zitrone 3–4 Tropfen"],
    anleitung: ["Bei akuter Übelkeit kurz inhalieren"],
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "aroma-stick-schlaf",
    typ: "aromatherapie",
    name: "Aromastick · Schlafstörungen",
    motto: "Auf ärztliche Anordnung",
    geeignetBei: ["Einschlaf- und Durchschlafstörungen"],
    vorsichtBei: [],
    wirkungsweise: ["entspannend, beruhigend"],
    material: ["Aromastick", "Tonka 2 Tropfen", "Benzoe 2 Tropfen", "Neroli 1 Tropfen"],
    anleitung: ["30 min vor Schlaf 3–5 langsame Atemzüge inhalieren"],
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "aroma-stick-kopfschmerz",
    typ: "aromatherapie",
    name: "Aromastick · Kopfschmerz / Migräne",
    motto: "Auf ärztliche Anordnung",
    geeignetBei: ["Spannungskopfschmerz", "Migräne"],
    vorsichtBei: ["Asthma (Pfefferminze)"],
    wirkungsweise: ["entspannend, kühlend, schmerzlindernd"],
    material: ["Aromastick", "Zitrone 4–6 Tropfen", "Pfefferminze 1 Tropfen", "Lavendel 1 Tropfen"],
    anleitung: ["Bei Kopfschmerzbeginn 3–5 langsame Atemzüge inhalieren"],
    quelle: "Hausmittelrunde 3.0.4",
  },

  // ─── Schmerzöle (anthroposophisch) ─────────────────────
  {
    id: "schmerzoel-aconit",
    typ: "schmerzoel",
    name: "Wala Aconit-Schmerzöl",
    geeignetBei: [
      "rheumatische Muskel- und Gelenkbeschwerden",
      "Rücken-, Nacken-, Schulterverspannungen",
      "Nervenschmerzen (-entzündungen)",
    ],
    vorsichtBei: [],
    wirkungsweise: [
      "natürlich schmerzlindernd und lösend",
      "wärmt wohltuend",
      "Lavendelöl entspannt körperlich und seelisch",
    ],
    material: ["Wala Aconit-Schmerzöl"],
    anleitung: [
      "Sparsam auf betroffene Stelle einreiben (mit Inhaltsstoffen Blauer Eisenhut, echter Kampfer, Lavendelöl).",
      "Anschließend warm einwickeln und ruhen lassen.",
    ],
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "schmerzoel-solum",
    typ: "schmerzoel",
    name: "Wala Solum Öl",
    geeignetBei: ["rheumatische Schmerzen", "Wetterfühligkeit", "Erschöpfung"],
    vorsichtBei: [],
    wirkungsweise: [
      "schmerzlindernd",
      "entstauend, ausleitend",
      "stärkt und durchwärmt den Organismus",
      "schützt gegenüber Außenreizen",
    ],
    material: ["Wala Solum Öl"],
    anleitung: [
      "Öl mit Hochmoortorf, Rosskastanie, Ackerschachtelhalm und Lavendel auf belastete Areale auftragen.",
      "Sanft einmassieren, warm bedecken.",
    ],
    quelle: "Hausmittelrunde 3.0.4",
  },
  {
    id: "schmerzoel-johannis",
    typ: "schmerzoel",
    name: "Johanniskrautöl (Rotöl)",
    geeignetBei: ["Nervenschmerzen", "Rheuma", "Hexenschuss", "Verstauchung"],
    vorsichtBei: ["Photosensibilität — Sonnenexposition meiden"],
    wirkungsweise: [
      "beruhigend, wundheilend, entzündungshemmend",
      "schmerzlindernd, stimmungsaufhellend",
    ],
    material: ["Johanniskrautöl"],
    anleitung: ["Sparsam auf betroffene Stelle einreiben, NICHT vor Sonnenexposition."],
    quelle: "Hausmittelrunde 3.0.4",
  },
];

// Zusatz: Wirkstoff-Mini-Lexikon der ätherischen Öle (aus PDF Seite 5)

export type EssentialOil = {
  id: string;
  name: string;
  botanisch: string;
  geeignetBei: string[];
  wirkungsweise: string[];
  hinweis?: string;
};

export const AETHERISCHE_OELE: EssentialOil[] = [
  {
    id: "oel-lavendel",
    name: "Lavendelöl",
    botanisch: "Lavandula angustifolia · Lippenblütler · Oleum lavendulae",
    geeignetBei: ["innere Anspannung", "Schlafstörungen", "emotionale und körperliche Schmerzen"],
    wirkungsweise: ["beruhigend, entspannend, harmonisierend", "stärkt innere Mitte und Selbstbewusstsein"],
  },
  {
    id: "oel-rosmarin",
    name: "Rosmarinöl",
    botanisch: "Rosmarinus officinalis · Lippenblütler",
    geeignetBei: ["Kreislaufschwäche", "Konzentrationsstörung", "Trägheit"],
    wirkungsweise: ["konzentrationsfördernd", "kreislaufanregend", "stimmungsaufhellend"],
  },
  {
    id: "oel-melisse",
    name: "Melissenöl",
    botanisch: "Melissa officinalis · Lippenblütler",
    geeignetBei: ["Unruhe", "Angst", "Schlaflosigkeit", "Trauer", "Magen-Darm-Beschwerden"],
    wirkungsweise: ["beruhigend, lindert Angst", "fördert Serotonin-Produktion"],
  },
  {
    id: "oel-rose",
    name: "Rosenöl",
    botanisch: "Rosa damascena · Rosengewächse",
    geeignetBei: ["Herzschmerz, Kummer", "depressive Verstimmung", "Trauer"],
    wirkungsweise: ["harmonisierend, herzöffnend", "Loslassen und Resonanz fördern"],
  },
  {
    id: "oel-kuemmel",
    name: "Kümmelöl",
    botanisch: "Carum carvi · Doldenblütler · für Säuglinge geeignet",
    geeignetBei: ["Blähungen", "Reizmagen", "Reizdarm", "Verdauungsstörungen"],
    wirkungsweise: ["verdauungsfördernd, krampflösend"],
  },
  {
    id: "oel-eukalyptus",
    name: "Eukalyptusöl",
    botanisch: "Oleum eucalypti · Myrtengewächse",
    geeignetBei: ["Erkältungen", "Bronchitis", "virale/bakterielle Infektionen", "Blasenentzündung"],
    wirkungsweise: ["antibakteriell, antiviral, schleimlösend, kühlend"],
  },
];

// Lookups

export function getHausmittel(id: string): Hausmittel | null {
  return HAUSMITTEL.find((h) => h.id === id) ?? null;
}

export function listHausmittel(typ?: Anwendungstyp): Hausmittel[] {
  return typ ? HAUSMITTEL.filter((h) => h.typ === typ) : HAUSMITTEL;
}
