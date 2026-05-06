// Profil-Erweiterung · "Mensch hinter dem Beruf".
//
// Phase 1 in-memory Store mit Seed pro Demo-Persona. Speichert Daten,
// die nicht in der Personal-Akte stehen, aber zum Zusammenarbeiten
// helfen: Bio in eigenen Worten, Hobbys, Sprachen, Lebensmotto,
// Profilbild-URL (data: oder /uploads/...). Phase 2 → FHIR
// Person.extension oder eigene Tabelle.

export type ProfilSprache = {
  code: string;          // ISO 639-1 (de, tr, ar, ru, en, ...)
  label: string;         // Anzeigename
  niveau: "muttersprache" | "verhandlung" | "alltag" | "grundkenntnis";
};

export type ProfilMenschlich = {
  personId: string;
  bio?: string;                       // 2-3 Sätze in eigenen Worten
  lebensmotto?: string;               // ein Satz / Zitat
  hobbys?: string[];                  // Liste freier Texte
  sprachen?: ProfilSprache[];         // wichtig für Klient-Pflege-Matching
  lebensziele?: string;               // langfristig — was treibt dich
  typischerTag?: string;              // Tagesrhythmus, Mittagspause-Rituale
  erreichbarkeit?: string;            // "Mo-Fr 8-18, danach nur Notfall"
  profilbildUrl?: string;             // data: oder /uploads/<id>.png
  preferenzen?: ProfilPreferenzen;
  updatedAt?: string;
};

export type ProfilPreferenzen = {
  sprache: "de" | "en";               // UI-Sprache
  audioStumm: boolean;                // Lana/Dennis-Stimme aus
  email: boolean;                     // E-Mail-Benachrichtigungen
  push: boolean;                      // Push-Benachrichtigungen
  schichtErinnerung: number;          // Minuten vor Schicht (0=aus)
  klartextAuto: boolean;              // Klartext automatisch zeigen
};

const DEFAULT_PREFS: ProfilPreferenzen = {
  sprache: "de",
  audioStumm: false,
  email: true,
  push: true,
  schichtErinnerung: 30,
  klartextAuto: true,
};

type State = { profile: Map<string, ProfilMenschlich> };
type GlobalShape = { __shalemProfile?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemProfile) g.__shalemProfile = { profile: new Map() };
const s = g.__shalemProfile!;

export function getProfil(personId: string): ProfilMenschlich {
  const p = s.profile.get(personId);
  if (p) return p;
  return { personId, preferenzen: { ...DEFAULT_PREFS } };
}

export function updateProfil(personId: string, patch: Partial<ProfilMenschlich>): ProfilMenschlich {
  const aktuell = getProfil(personId);
  const next: ProfilMenschlich = {
    ...aktuell,
    ...patch,
    personId,
    preferenzen: patch.preferenzen ? { ...DEFAULT_PREFS, ...aktuell.preferenzen, ...patch.preferenzen } : aktuell.preferenzen,
    updatedAt: new Date().toISOString(),
  };
  s.profile.set(personId, next);
  return next;
}

export function setProfilbild(personId: string, url: string): ProfilMenschlich {
  return updateProfil(personId, { profilbildUrl: url });
}

let _seeded = false;
export function seedProfilOnce() {
  if (_seeded) return;
  _seeded = true;

  updateProfil("person-dr", {
    bio: "Pflegekraft mit zehn Jahren Erfahrung in der Onkologie. Ich glaube, dass jeder Mensch gehört werden möchte — auch wenn er nicht mehr sprechen kann.",
    lebensmotto: "„Würde ist kein Pflegestandard.“",
    hobbys: ["Bouldern", "Imker:in seit 2022", "Tibetisches Kochen"],
    sprachen: [
      { code: "de", label: "Deutsch", niveau: "muttersprache" },
      { code: "tr", label: "Türkisch", niveau: "alltag" },
      { code: "en", label: "Englisch", niveau: "verhandlung" },
    ],
    lebensziele: "Eine kleine Pflegegenossenschaft im Umland mitgründen, die nicht nach Akkord rechnet.",
    typischerTag: "Frühdienst 6:30, danach Hund + Backofen-Brot, abends Yoga oder Imkerei.",
    erreichbarkeit: "Werktags 7-19, Notrufpiepser auch nachts.",
    preferenzen: { sprache: "de", audioStumm: false, email: true, push: true, schichtErinnerung: 30, klartextAuto: true },
  });

  updateProfil("klient-hr", {
    bio: "Ich bin Helga, 78, Witwe seit 6 Jahren. Pflegegrad 3 wegen meines Sakraldekubitus. Aber ich bin nicht meine Wunde.",
    lebensmotto: "„Solange ich noch lachen kann, bin ich noch da.“",
    hobbys: ["Stricken", "Kreuzworträtsel", "Kontakt zu Enkelin Lisa per Video"],
    sprachen: [
      { code: "de", label: "Deutsch", niveau: "muttersprache" },
      { code: "pl", label: "Polnisch", niveau: "grundkenntnis" },
    ],
    lebensziele: "Den 80. Geburtstag noch zu Hause feiern, mit beiden Enkelkindern.",
    typischerTag: "Aufstehen 7:00, Kaffee, Tagesschau-Lesung mit Pflege, Mittagsschlaf, abends Strickrunde.",
    erreichbarkeit: "Lieber morgens. Nachmittags Mittagsruhe nicht stören.",
  });

  updateProfil("person-de1", {
    bio: "Stationsleitung mit Detektiv-Geist. Was die Pflegestatistik nicht zeigt, finde ich heraus.",
    lebensmotto: "„Daten sind Geschichten, die noch keiner erzählt hat.“",
    hobbys: ["Krimi-Hörbücher", "Schach", "Tour de France gucken"],
    sprachen: [
      { code: "de", label: "Deutsch", niveau: "muttersprache" },
      { code: "en", label: "Englisch", niveau: "verhandlung" },
      { code: "fr", label: "Französisch", niveau: "alltag" },
    ],
    erreichbarkeit: "Mo-Fr 8-18, dann nur echter Notfall.",
  });
}
