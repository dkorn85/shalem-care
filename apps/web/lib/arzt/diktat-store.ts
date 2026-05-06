// Arzt-Diktat-Store · Sprachdiktat → strukturierte Verordnung.
//
// CGM/doxter haben heute Verordnungs-Module über Click-Click-Click. Kein
// Sprachdiktat, keine KI-Plausi, kein Klartext. Shalem-Pfad: Arzt spricht
// "Helga Reinhardt, 78 Jahre, COPD III, Asthma-Spray Salbutamol 100µg
// MDI 2x täglich, Krankengymnastik 6er-Verordnung wegen LWS-Syndrom,
// Hausbesuch alle 14 Tage" — KI extrahiert ICD-10, generiert eRezept,
// erstellt Klartext-Erklärung für die Patientin.
//
// Phase 2: ElevenLabs-STT + Anthropic + gematik-eRezept-Konnektor.

export type VerordnungsArt = "medikament" | "heilmittel" | "hilfsmittel" | "haeusliche_pflege" | "ueberweisung" | "krankschreibung";

export const ART_LABEL: Record<VerordnungsArt, string> = {
  medikament: "Medikament",
  heilmittel: "Heilmittel",
  hilfsmittel: "Hilfsmittel",
  haeusliche_pflege: "Häusliche Pflege",
  ueberweisung: "Überweisung",
  krankschreibung: "Krankschreibung · AU",
};

export const ART_FARBE: Record<VerordnungsArt, string> = {
  medikament: "var(--vibe-profile)",
  heilmittel: "var(--fri)",
  hilfsmittel: "var(--vibe-team)",
  haeusliche_pflege: "var(--mon)",
  ueberweisung: "var(--vibe-stats)",
  krankschreibung: "var(--sun)",
};

export type StrukturierteVerordnung = {
  art: VerordnungsArt;
  /** Klar erkannte Daten */
  klient_name?: string;
  klient_geburtsdatum?: string;
  diagnose_text?: string;
  icd10_vorschlag?: string;
  /** Spezifika je nach art */
  praeparat?: string;
  staerke?: string;
  applikation?: string;
  dosierung?: string;
  menge?: string;
  /** Heilmittel */
  heilmittel_typ?: string;
  heilmittel_anzahl?: number;
  /** Häusliche Pflege */
  hkp_dauer?: string;
  hkp_frequenz?: string;
  /** Allgemein */
  notiz?: string;
};

export type DiktatResult = {
  transkript: string;
  verordnungen: StrukturierteVerordnung[];
  klartext: string;
  goa_codes: { code: string; bezeichnung: string; punkte: number }[];
  warnungen: string[];
  zeitErsparnisSec: number;
};

// ─── Heuristische Keywords ────────────────────────────────────────

const ART_KEYWORDS: Record<VerordnungsArt, string[]> = {
  medikament: ["spray", "tablette", "kapsel", "tropfen", "ampulle", "salbe", "tabletten", "mg", "µg", "ml", "1x", "2x", "3x", "morgens", "abends"],
  heilmittel: ["krankengymnastik", "kg ", "physiotherapie", "manuelle therapie", "mld", "lymphdrainage", "ergotherapie", "logopädie", "wärmetherapie"],
  hilfsmittel: ["rollator", "rollstuhl", "pflegebett", "toilettensitz", "gehstock", "kompressionsstrümpfe", "inkontinenz"],
  haeusliche_pflege: ["häusliche pflege", "hausbesuch", "körperpflege", "blutdruckmessung", "wundverband", "injektion", "katheter"],
  ueberweisung: ["überweisung", "facharzt", "neurolog", "kardiolog", "psychiat", "radiolog", "konsil"],
  krankschreibung: ["krankschreibung", "au", "arbeitsunfähig", "gelbschein", "krankschreibe"],
};

// ICD-10 Stub-Mapping nur für Demo-Häufigkeiten
const ICD10_HINTS: Record<string, string> = {
  "copd": "J44.9 · COPD nicht näher bezeichnet",
  "asthma": "J45.9 · Asthma bronchiale",
  "diabetes": "E11.9 · Diabetes mellitus Typ 2",
  "hypertonie": "I10.90 · Essenzielle Hypertonie",
  "demenz": "F03 · Demenz nicht näher bezeichnet",
  "lws": "M54.5 · Kreuzschmerz",
  "knie": "M17.9 · Gonarthrose",
  "hüfte": "M16.9 · Coxarthrose",
  "depression": "F32.9 · Depressive Episode",
  "schmerz": "R52.9 · Schmerz nicht näher bezeichnet",
  "wunde": "T81.4 · Postoperative Wundheilungsstörung",
  "schlaganfall": "I69.4 · Folgen Hirninfarkt",
  "parkinson": "G20 · Primärer Parkinson",
};

// GoÄ-Code-Hints für Hausbesuch + Diktat-Aufwand
const GOA_HINTS: { trigger: string; code: string; bezeichnung: string; punkte: number }[] = [
  { trigger: "hausbesuch", code: "GOÄ 50", bezeichnung: "Besuch in Wohnung", punkte: 360 },
  { trigger: "wundverband", code: "GOÄ 200", bezeichnung: "Verband · Wunde", punkte: 90 },
  { trigger: "spritze", code: "GOÄ 252", bezeichnung: "Injektion · subkutan", punkte: 60 },
  { trigger: "blutdruck", code: "GOÄ 654", bezeichnung: "Lang-RR-Messung", punkte: 200 },
  { trigger: "ekg", code: "GOÄ 651", bezeichnung: "EKG · Ruhe", punkte: 215 },
  { trigger: "beratung", code: "GOÄ 1", bezeichnung: "Beratung über min 10 min", punkte: 80 },
];

// ─── Strukturierer ────────────────────────────────────────────────

export function strukturiereDiktat(transkript: string): DiktatResult {
  const text = transkript.toLowerCase();
  const verordnungen: StrukturierteVerordnung[] = [];
  const warnungen: string[] = [];

  // Klient-Name + Alter
  const nameMatch = transkript.match(/^([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)+)/);
  const klient_name = nameMatch ? nameMatch[1] : undefined;
  const alterMatch = transkript.match(/(\d{1,3})\s*(?:jahre?|jahre alt|j\.)/i);
  const alter = alterMatch ? parseInt(alterMatch[1], 10) : undefined;

  // ICD-10 erste Hint
  let icd10_vorschlag: string | undefined;
  let diagnose_text: string | undefined;
  for (const [k, v] of Object.entries(ICD10_HINTS)) {
    if (text.includes(k)) {
      icd10_vorschlag = v;
      diagnose_text = k.toUpperCase();
      break;
    }
  }

  // Verordnungen extrahieren — pro Satz versuchen wir die Art zu bestimmen
  const saetze = transkript.split(/(?<=[.!?])\s+|\n+|·|;/).map((s) => s.trim()).filter(Boolean);

  for (const satz of saetze) {
    const lower = satz.toLowerCase();
    let bestArt: VerordnungsArt | null = null;
    let bestScore = 0;
    for (const [art, kws] of Object.entries(ART_KEYWORDS) as [VerordnungsArt, string[]][]) {
      const score = kws.filter((k) => lower.includes(k)).length;
      if (score > bestScore) {
        bestScore = score;
        bestArt = art;
      }
    }
    if (!bestArt || bestScore === 0) continue;

    const v: StrukturierteVerordnung = {
      art: bestArt,
      klient_name,
      icd10_vorschlag,
      diagnose_text,
    };

    // Medikament: extrahiere Stärke + Frequenz
    if (bestArt === "medikament") {
      const staerkeM = satz.match(/(\d+(?:[,.]\d+)?)\s*(mg|µg|ml|g|i\.e\.?)/i);
      if (staerkeM) v.staerke = `${staerkeM[1]} ${staerkeM[2]}`;
      const dosierungM = satz.match(/(\d)\s*x\s*(?:täglich|tgl|am tag)?/i);
      if (dosierungM) v.dosierung = `${dosierungM[1]}× täglich`;
      // Präparat: erstes Großgeschriebenes Wort nach Häufigkeits-Verbots-Liste
      const praeparatM = satz.match(/\b([A-ZÄÖÜ][a-zäöüß]{4,})\b/);
      if (praeparatM && praeparatM[1] !== klient_name?.split(" ")[0]) {
        v.praeparat = praeparatM[1];
      }
    }

    // Heilmittel: Anzahl + Typ
    if (bestArt === "heilmittel") {
      const anzahlM = satz.match(/(\d+)er?\s*(?:verordnung|rezept|paket)?/i);
      if (anzahlM) v.heilmittel_anzahl = parseInt(anzahlM[1], 10);
      const typM = satz.match(/(krankengymnastik|kg|manuelle therapie|mld|lymphdrainage|ergotherapie|logopädie)/i);
      if (typM) v.heilmittel_typ = typM[1];
    }

    // HKP: Frequenz
    if (bestArt === "haeusliche_pflege") {
      const freqM = satz.match(/(?:alle\s+)?(\d+|täglich|wöchentlich|monatlich)\s*(?:tage|wochen|monate)?/i);
      if (freqM) v.hkp_frequenz = freqM[0];
      const dauerM = satz.match(/(\d+)\s*(?:wochen|monate|tage)/i);
      if (dauerM) v.hkp_dauer = dauerM[0];
    }

    v.notiz = satz;
    verordnungen.push(v);
  }

  // GoÄ-Codes ermitteln
  const goa_codes = GOA_HINTS.filter((g) => text.includes(g.trigger)).map(({ trigger: _t, ...rest }) => rest);

  // Warnungen
  if (alter && alter >= 75) {
    warnungen.push(`PRISCUS-Liste: Bei ${alter}-jähriger Patient:in besondere Vorsicht bei Benzodiazepinen, Antihistaminika erster Generation.`);
  }
  if (text.includes("ibuprofen") && (text.includes("herz") || text.includes("kardio"))) {
    warnungen.push("Ibuprofen + kardiale Anamnese: NSAR vermeiden, alternativ Paracetamol.");
  }
  if (verordnungen.filter((v) => v.art === "medikament").length >= 5) {
    warnungen.push("Polypharmazie ≥ 5 Medikamente — STOPP/START-Kriterien prüfen.");
  }

  // Klartext generieren
  const klartext = generiereKlartext(verordnungen, klient_name);

  // Zeit-Ersparnis: ~3 min pro klassische Verordnung in CGM/doxter, ~30 Sek mit Diktat
  const zeitErsparnisSec = verordnungen.length * (180 - 30);

  return {
    transkript,
    verordnungen,
    klartext,
    goa_codes,
    warnungen,
    zeitErsparnisSec,
  };
}

function generiereKlartext(vs: StrukturierteVerordnung[], klientName?: string): string {
  if (vs.length === 0) return "";
  const teile: string[] = [`Liebe${klientName ? "r/Liebe " + klientName : ""},`];
  teile.push("nach unserem Gespräch heute folgende Verordnungen:");
  for (const v of vs) {
    if (v.art === "medikament") {
      teile.push(`• ${v.praeparat ?? "Medikament"}${v.staerke ? ` ${v.staerke}` : ""}${v.dosierung ? ` · ${v.dosierung}` : ""} — bitte nach Anleitung einnehmen`);
    } else if (v.art === "heilmittel") {
      teile.push(`• ${v.heilmittel_typ ?? "Heilmittel"}${v.heilmittel_anzahl ? `, ${v.heilmittel_anzahl} Termine` : ""} — Termin bitte selbst beim Therapeuten vereinbaren`);
    } else if (v.art === "haeusliche_pflege") {
      teile.push(`• Häusliche Pflege${v.hkp_frequenz ? `, ${v.hkp_frequenz}` : ""} — Pflegedienst meldet sich`);
    } else if (v.art === "ueberweisung") {
      teile.push("• Facharzt-Überweisung — bitte Termin vereinbaren");
    } else if (v.art === "krankschreibung") {
      teile.push("• Arbeitsunfähigkeitsbescheinigung wurde elektronisch übermittelt");
    } else {
      teile.push(`• ${ART_LABEL[v.art]}: ${v.notiz ?? ""}`);
    }
  }
  teile.push("\nBei Fragen: rufen Sie an oder schreiben Sie über die Patient-App. Gute Besserung.");
  return teile.join("\n");
}
