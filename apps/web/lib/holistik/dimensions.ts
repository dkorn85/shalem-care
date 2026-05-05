// Holistik · die vier ganzheitlichen Dimensionen für Shalem-KI-Vorschläge.
//
// Diese Datei verbindet vier Lehren:
//   1. Merkaba   (Bewusstsein · Vereinigung von Gegensätzen)
//   2. Shalem    (Ganzheit · 4-Elemente-Inner-Balance)
//   3. Sowa Rigpa (tibetische Medizin · 3 Säfte rLung/Tripa/Beken)
//   4. Ayurveda  (3 Doshas Vata/Pitta/Kapha + 3 Gunas Sattva/Rajas/Tamas)
//
// Quellen:
//   - chazon.eu (Living Wholeness Academy · Merkaba+Shalem+Chazon)
//   - rGyud-bzhi (Sowa Rigpa Vier Tantras)
//   - Charaka-Samhita / Sushruta-Samhita (Ayurveda)
//
// Wichtig: Diese Schicht ist *Begleitung*, nicht Diagnose. Sie ergänzt
// schulmedizinische Versorgung um eine kulturell-poetische Lese-Brille.

// ─── Merkaba · Bewusstseins-Achsen ────────────────────────────────────

export type MerkabaPol = "tun" | "sein" | "denken" | "fuehlen" | "geben" | "empfangen";

export type MerkabaAchse = {
  id: "tun_sein" | "denken_fuehlen" | "geben_empfangen";
  pole: [MerkabaPol, MerkabaPol];
  beschreibung: string;
  imBalance: string;
  ausBalance: string;
};

export const MERKABA_ACHSEN: MerkabaAchse[] = [
  {
    id: "tun_sein",
    pole: ["tun", "sein"],
    beschreibung: "Aktivität und Ruhe — Handeln und Da-Sein.",
    imBalance: "Sinnvolles Handeln aus innerer Ruhe heraus.",
    ausBalance: "Hyperaktivität ohne Atemraum oder Lähmung in Endlosgrübeln.",
  },
  {
    id: "denken_fuehlen",
    pole: ["denken", "fuehlen"],
    beschreibung: "Verstand und Empfindung — Klarheit und Wärme.",
    imBalance: "Klare Gedanken, die mit dem Herzen verbunden sind.",
    ausBalance: "Kalte Analyse ohne Empathie oder Gefühlsturbulenz ohne Boden.",
  },
  {
    id: "geben_empfangen",
    pole: ["geben", "empfangen"],
    beschreibung: "Hingabe und Annahme — fließender Austausch.",
    imBalance: "Selbstverständliches Geben ohne Erschöpfung, Annehmen ohne Schuld.",
    ausBalance: "Helfer-Syndrom (nur geben) oder Erstarrung (nur empfangen).",
  },
];

// ─── Shalem · 4 Elemente / Inner Balance ──────────────────────────────

export type Element = "feuer" | "wasser" | "luft" | "erde";

export type ElementProfil = {
  id: Element;
  label: string;
  farbe: string;             // CSS-Variable aus tokens
  qualitaet: string;
  imAlltag: string;
  ueberschuss: string;
  mangel: string;
  unterstuetzendeHandlung: string;
};

export const SHALEM_ELEMENTE: Record<Element, ElementProfil> = {
  feuer: {
    id: "feuer",
    label: "Feuer · Wille, Verdauung, Verwandlung",
    farbe: "var(--mon)",          // warmes Rot
    qualitaet: "heiß, scharf, transformierend",
    imAlltag: "Antrieb, Fokus, Verdauungskraft, Hitze",
    ueberschuss: "Reizbarkeit, Entzündung, Hauterschöpfung, Schlaflosigkeit",
    mangel: "Antriebsarmut, kalte Hände/Füße, schwache Verdauung, Resignation",
    unterstuetzendeHandlung: "Bewegung in der Sonne, scharfe Speisen reduzieren, klare Tagesstruktur",
  },
  wasser: {
    id: "wasser",
    label: "Wasser · Fluss, Beziehung, Mitgefühl",
    farbe: "var(--fri)",          // weichgrünblau
    qualitaet: "weich, kühlend, verbindend",
    imAlltag: "Empathie, Tränen, Schweiß, Beziehungspflege",
    ueberschuss: "Schwermut, Ödeme, Trägheit, Selbstaufgabe",
    mangel: "Trockenheit (Haut, Schleimhäute), emotionale Härte, Bindungsangst",
    unterstuetzendeHandlung: "warme Bäder, Suppen, Berührung in Würde, Trauerraum",
  },
  luft: {
    id: "luft",
    label: "Luft · Bewegung, Atem, Gedanke",
    farbe: "var(--sat)",          // luftig blau-violett
    qualitaet: "leicht, beweglich, fein",
    imAlltag: "Atmung, Nervenleitung, Inspiration",
    ueberschuss: "Unruhe, Schlafstörung, Gedanken-Springen, Tinnitus",
    mangel: "Stagnation, Antriebshemmung, kalte Schwere",
    unterstuetzendeHandlung: "ruhige Atemarbeit, Pranayama-light, fester Tagesrhythmus",
  },
  erde: {
    id: "erde",
    label: "Erde · Form, Verlässlichkeit, Substanz",
    farbe: "var(--thu)",          // sattes Grün-Erde
    qualitaet: "schwer, stabil, nährend",
    imAlltag: "Knochen, Muskulatur, Sicherheit, Routine",
    ueberschuss: "Schwerfälligkeit, Zähigkeit, mangelnde Veränderung",
    mangel: "Brüchigkeit, Verlust von Stabilität, Wurzellosigkeit",
    unterstuetzendeHandlung: "wurzelnahrung (Karotte, Süßkartoffel), Berührung mit Boden, klare Räume",
  },
};

// ─── Sowa Rigpa · 3 Nyepa (Säfte) ─────────────────────────────────────

export type Nyepa = "rLung" | "Tripa" | "Beken";

export type NyepaProfil = {
  id: Nyepa;
  label: string;
  farbe: string;
  element: string;
  funktion: string;
  ueberschuss: string;
  mangel: string;
  empfehlung: string;
};

export const SOWA_RIGPA_NYEPA: Record<Nyepa, NyepaProfil> = {
  rLung: {
    id: "rLung",
    label: "rLung · Wind",
    farbe: "var(--sat)",
    element: "Luft + Raum",
    funktion: "Bewegung, Atem, Nervenleitung, Geist-Aktivität",
    ueberschuss: "Schlafstörung, Angst, Tinnitus, springende Schmerzen, Gewichtsverlust",
    mangel: "Antriebslosigkeit, Stagnation, Schwere",
    empfehlung: "Ruhe-Kost (warm, ölig, süß-salzig-sauer), regelmäßige Schlafzeiten, weiche Berührung, Sesamöl-Massage",
  },
  Tripa: {
    id: "Tripa",
    label: "Tripa · Galle / Hitze",
    farbe: "var(--mon)",
    element: "Feuer",
    funktion: "Verdauung, Wärme, Stoffwechsel, Sehkraft, Mut",
    ueberschuss: "Entzündung, Reizbarkeit, Sodbrennen, Hautausschlag, Gelbfärbung",
    mangel: "Kalte Verdauung, Antriebsarmut, Resignation",
    empfehlung: "kühlende Speisen (Bittergemüse, Gurke, Kokos), Schatten, Mondlicht-Spaziergang, Geduld kultivieren",
  },
  Beken: {
    id: "Beken",
    label: "Beken · Schleim / Erdfeuchte",
    farbe: "var(--fri)",
    element: "Erde + Wasser",
    funktion: "Struktur, Schmierung, Geduld, Stabilität, Schlaf",
    ueberschuss: "Schwere, Ödeme, Müdigkeit, Schleim, Schwermut, Adipositas",
    mangel: "Trockenheit, Brüchigkeit, Unruhe",
    empfehlung: "warme bewegende Speisen (Ingwer, Kreuzkümmel), Bewegung am Morgen, klare Räume, leichte Wärme",
  },
};

// ─── Ayurveda · 3 Doshas + 3 Gunas (Manas) ────────────────────────────

export type Dosha = "vata" | "pitta" | "kapha";
export type Guna = "sattva" | "rajas" | "tamas";

export type DoshaProfil = {
  id: Dosha;
  label: string;
  farbe: string;
  elemente: string;
  signatur: string;
  ausBalance: string;
  empfehlung: string;
};

export const AYURVEDA_DOSHAS: Record<Dosha, DoshaProfil> = {
  vata: {
    id: "vata",
    label: "Vāta · Bewegung",
    farbe: "var(--sat)",
    elemente: "Luft + Äther",
    signatur: "kalt, trocken, leicht, beweglich, klar",
    ausBalance: "Angst, Schlaflosigkeit, Verstopfung, Tinnitus, springende Gelenkschmerzen",
    empfehlung: "abhyanga (warme Öl-Selbstmassage), warme süße Speisen, Routine, sanftes Yoga, frühes Schlafen",
  },
  pitta: {
    id: "pitta",
    label: "Pitta · Verwandlung",
    farbe: "var(--mon)",
    elemente: "Feuer + Wasser",
    signatur: "heiß, scharf, leicht-ölig, flüssig, sauer",
    ausBalance: "Entzündung, Reizbarkeit, Sodbrennen, Hautrötung, Perfektionismus",
    empfehlung: "kühlende Speisen (Kokos, Koriander), Mondlicht-Spaziergang, Mitgefühl-Meditation, Schatten suchen",
  },
  kapha: {
    id: "kapha",
    label: "Kapha · Struktur",
    farbe: "var(--fri)",
    elemente: "Erde + Wasser",
    signatur: "schwer, langsam, kühl, ölig, stabil",
    ausBalance: "Lethargie, Adipositas, Schleim, Schwermut, Anhaftung",
    empfehlung: "trocken-warme Speisen (Hülsenfrüchte, Ingwer), Bewegung am Morgen, neue Eindrücke, Dampfbäder",
  },
};

export const AYURVEDA_GUNAS: Record<Guna, { label: string; beschreibung: string; ausBalance: string }> = {
  sattva: {
    label: "Sattva · Klarheit, Harmonie",
    beschreibung: "klarer Verstand, Mitgefühl, ruhige Wachheit",
    ausBalance: "(zuviel Sattva selten — bleibt Ziel)",
  },
  rajas: {
    label: "Rajas · Aktivität, Hitze",
    beschreibung: "Antrieb, Bewegung, Streben",
    ausBalance: "Unruhe, Reizbarkeit, ständige Aktivität ohne Pause, Erschöpfung durch Über-Aktion",
  },
  tamas: {
    label: "Tamas · Trägheit, Verdunklung",
    beschreibung: "Schlaf, Erholung, Ruhe",
    ausBalance: "Resignation, Depression, Lethargie, Verdrängung, Schwermut",
  },
};

// ─── Konzept-Mapping zwischen den vier Säulen ─────────────────────────

/**
 * Welche Begriffe der vier Lehren zeigen auf dieselbe Phänomen-Klasse?
 * Dieser Map wird in der UI als "Resonanz-Brücke" genutzt — wenn die KI
 * z.B. "rLung-Überschuss" diagnostiziert, kann sie zugleich auf Vāta,
 * Luft-Element und die Tun-Sein-Achse referenzieren.
 */
export type Resonanz = {
  thema: string;
  shalemElement: Element;
  sowaNyepa: Nyepa;
  ayurvedaDosha: Dosha;
  merkabaAchse: MerkabaAchse["id"];
};

export const RESONANZEN: Resonanz[] = [
  {
    thema: "Innere Unruhe / Schlafstörung / Angst",
    shalemElement: "luft",
    sowaNyepa: "rLung",
    ayurvedaDosha: "vata",
    merkabaAchse: "tun_sein",
  },
  {
    thema: "Reizbarkeit / Entzündung / Hitze",
    shalemElement: "feuer",
    sowaNyepa: "Tripa",
    ayurvedaDosha: "pitta",
    merkabaAchse: "denken_fuehlen",
  },
  {
    thema: "Schwere / Schwermut / Anhaftung",
    shalemElement: "wasser",
    sowaNyepa: "Beken",
    ayurvedaDosha: "kapha",
    merkabaAchse: "geben_empfangen",
  },
  {
    thema: "Wurzellosigkeit / Brüchigkeit / Sicherheitsverlust",
    shalemElement: "erde",
    sowaNyepa: "rLung",
    ayurvedaDosha: "vata",
    merkabaAchse: "geben_empfangen",
  },
];

export function findeResonanzNachThema(stichwort: string): Resonanz | undefined {
  const s = stichwort.toLowerCase();
  return RESONANZEN.find((r) => r.thema.toLowerCase().includes(s));
}
