// ICD-10-GM · kuratiertes Set der häufigsten Diagnosen in der
// Hausarzt-Praxis und Geriatrie. Vollständiger Katalog hat ~13.000
// Codes — Phase 2 wird er als FHIR ValueSet aus dem GKV-Spitzenverband
// gezogen. Dieser Auszug deckt ~80 % der Demo-Patienten ab.

export type IcdEintrag = {
  code: string;            // z.B. I10
  bezeichnung: string;     // Essentielle (primäre) Hypertonie
  kategorie: string;       // I00-I99 Kreislauf
  klartext?: string;        // patientenverständliche Erklärung
};

export const ICD10: IcdEintrag[] = [
  // I00–I99 Kreislaufsystem
  { code: "I10",  bezeichnung: "Essentielle (primäre) Hypertonie",       kategorie: "Kreislauf",   klartext: "Bluthochdruck ohne erkennbare andere Ursache." },
  { code: "I48.0", bezeichnung: "Vorhofflimmern, paroxysmal",             kategorie: "Kreislauf",   klartext: "Vorhofflimmern, das in Schüben kommt und wieder geht." },
  { code: "I48.1", bezeichnung: "Vorhofflimmern, persistierend",          kategorie: "Kreislauf",   klartext: "Vorhofflimmern, das anhält bis es behandelt wird." },
  { code: "I50.13", bezeichnung: "Linksherzinsuffizienz NYHA III",         kategorie: "Kreislauf",   klartext: "Herzschwäche, schon bei leichter Belastung Beschwerden." },
  { code: "I63.9", bezeichnung: "Hirninfarkt, n.n.bez.",                   kategorie: "Kreislauf",   klartext: "Schlaganfall durch Gefäßverschluss im Gehirn." },
  { code: "I69.4", bezeichnung: "Folgen Schlaganfall, n.n.bez.",           kategorie: "Kreislauf",   klartext: "Bleibende Folgen nach einem Schlaganfall." },
  { code: "I83.9", bezeichnung: "Varizen ohne Ulkus oder Entzündung",      kategorie: "Kreislauf" },

  // E10–E14 Diabetes
  { code: "E11.9",  bezeichnung: "Diabetes mellitus Typ 2 ohne Komplikationen", kategorie: "Stoffwechsel", klartext: "Zuckerkrankheit Typ 2 ohne Begleitschäden." },
  { code: "E11.4",  bezeichnung: "Diabetes mellitus Typ 2 mit neurologischen Komplikationen", kategorie: "Stoffwechsel", klartext: "Diabetes Typ 2 mit Nervenschäden (Polyneuropathie)." },
  { code: "E11.7",  bezeichnung: "Diabetes mellitus Typ 2 mit multiplen Komplikationen", kategorie: "Stoffwechsel" },
  { code: "E03.9",  bezeichnung: "Hypothyreose, n.n.bez.",                  kategorie: "Stoffwechsel", klartext: "Schilddrüsenunterfunktion." },
  { code: "E66.0",  bezeichnung: "Adipositas, alimentär",                   kategorie: "Stoffwechsel" },

  // F00–F99 Psychisch
  { code: "F00.1", bezeichnung: "Demenz bei Alzheimer-Krankheit, mittelgradig", kategorie: "Psychisch", klartext: "Mittelgradige Alzheimer-Demenz." },
  { code: "F00.2", bezeichnung: "Demenz bei Alzheimer-Krankheit, schwer",   kategorie: "Psychisch", klartext: "Schwere Alzheimer-Demenz." },
  { code: "F03",   bezeichnung: "Nicht näher bezeichnete Demenz",           kategorie: "Psychisch" },
  { code: "F32.1", bezeichnung: "Mittelgradige depressive Episode",         kategorie: "Psychisch", klartext: "Mittelschwere Depression." },
  { code: "F33.1", bezeichnung: "Rezidivierende depressive Störung, mittelgradig", kategorie: "Psychisch" },
  { code: "F41.1", bezeichnung: "Generalisierte Angststörung",              kategorie: "Psychisch" },
  { code: "F43.0", bezeichnung: "Akute Belastungsreaktion",                 kategorie: "Psychisch" },
  { code: "F45.0", bezeichnung: "Somatisierungsstörung",                    kategorie: "Psychisch" },

  // M00–M99 Muskel-Skelett
  { code: "M54.5", bezeichnung: "Kreuzschmerz",                              kategorie: "Muskel-Skelett", klartext: "Kreuzschmerz / Hexenschuss." },
  { code: "M54.2", bezeichnung: "Zervikalgie",                               kategorie: "Muskel-Skelett", klartext: "Nackenschmerzen." },
  { code: "M17.1", bezeichnung: "Sonstige primäre Gonarthrose",              kategorie: "Muskel-Skelett", klartext: "Kniegelenks-Arthrose." },
  { code: "M16.1", bezeichnung: "Sonstige primäre Koxarthrose",              kategorie: "Muskel-Skelett", klartext: "Hüftgelenks-Arthrose." },
  { code: "M81.99", bezeichnung: "Osteoporose, n.n.bez.",                     kategorie: "Muskel-Skelett", klartext: "Knochenschwund." },
  { code: "G20",   bezeichnung: "Primäres Parkinson-Syndrom",                kategorie: "Nervensystem", klartext: "Parkinson-Krankheit." },
  { code: "G35",   bezeichnung: "Multiple Sklerose",                         kategorie: "Nervensystem" },
  { code: "G47.0", bezeichnung: "Ein- und Durchschlafstörungen",             kategorie: "Nervensystem" },

  // Sonstige
  { code: "L89.32", bezeichnung: "Dekubitus 3. Grades: Ferse",                kategorie: "Haut", klartext: "Druckgeschwür (Wundliegen) 3. Grad an der Ferse." },
  { code: "L89.31", bezeichnung: "Dekubitus 2. Grades: Ferse",                kategorie: "Haut" },
  { code: "L02.4", bezeichnung: "Hautabszess der Extremität",                 kategorie: "Haut" },
  { code: "R52.2", bezeichnung: "Sonstiger chronischer Schmerz",              kategorie: "Symptom" },
  { code: "R26.0", bezeichnung: "Ataktischer Gang",                            kategorie: "Symptom", klartext: "Unsicherer, schwankender Gang." },
  { code: "R32",   bezeichnung: "Nicht näher bezeichnete Harninkontinenz",    kategorie: "Symptom" },
  { code: "R33",   bezeichnung: "Harnverhaltung",                              kategorie: "Symptom" },
  { code: "R63.3", bezeichnung: "Ernährungsprobleme + unsachgem. Ernährung",   kategorie: "Symptom" },
  { code: "Z74.1", bezeichnung: "Hilfebedürftigkeit · Körperpflege",           kategorie: "Z-Code", klartext: "Person braucht Hilfe bei der Körperpflege." },
  { code: "Z74.3", bezeichnung: "Hilfebedürftigkeit · ständige Beaufsichtigung", kategorie: "Z-Code" },
  { code: "Z51.5", bezeichnung: "Palliativmedizinische Behandlung",            kategorie: "Z-Code" },
  { code: "Z02.7", bezeichnung: "Ausstellung Atteste / Bescheinigungen",       kategorie: "Z-Code" },
];

export function searchIcd(query: string, limit = 8): IcdEintrag[] {
  const q = query.trim().toLowerCase();
  if (!q) return ICD10.slice(0, limit);
  return ICD10.filter((e) =>
    e.code.toLowerCase().includes(q) ||
    e.bezeichnung.toLowerCase().includes(q) ||
    e.kategorie.toLowerCase().includes(q),
  ).slice(0, limit);
}
