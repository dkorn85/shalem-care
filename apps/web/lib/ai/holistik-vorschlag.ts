// Holistik-Vorschlag · KI-Synthese aus 4 Lehren.
//
// Eingabe: Klient-Kontext (Befund, Wunde, Anamnese, aktuelle Stimmung).
// Ausgabe: vier eingebettete Lese-Brillen (Merkaba/Shalem/Sowa Rigpa/
// Ayurveda) plus drei konkrete, sanfte Pflege-/Begleitungs-Vorschläge.
//
// Wichtig: KEINE Diagnostik, KEINE Heilversprechen. Begleit-Vorschläge auf
// Lebensführungs-Ebene (Tagesrhythmus, Berührung, Speisen, Atemarbeit). Die
// schulmedizinische Versorgung bleibt führend.

import { getAIProvider, type AIMessage } from "./provider";
import {
  type Element,
  type Nyepa,
  type Dosha,
  SHALEM_ELEMENTE,
  SOWA_RIGPA_NYEPA,
  AYURVEDA_DOSHAS,
  MERKABA_ACHSEN,
} from "../holistik/dimensions";

export type HolistikEingabe = {
  klientId: string;
  klientName: string;
  alter?: number;
  pflegegrad?: number;
  fachKontext: string;             // Befund/Wunde/Anamnese als Klartext
  zusatzhinweis?: string;
};

export type HolistikErgebnis = {
  zusammenfassung: string;          // 3-5 Sätze, ganzheitliche Begleit-Lesart
  shalemElement: Element;           // dominantes Element heute
  shalemBegruendung: string;
  sowaNyepa: Nyepa;                 // dominantes Nyepa heute
  sowaBegruendung: string;
  ayurvedaDosha: Dosha;
  ayurvedaBegruendung: string;
  merkabaAchse: "tun_sein" | "denken_fuehlen" | "geben_empfangen";
  merkabaBegruendung: string;
  pflegeVorschlaege: { titel: string; beschreibung: string; saeule: "shalem" | "sowa" | "ayurveda" | "merkaba" }[];
  hinweis: string;                  // immer enthält: "ergänzt schulmedizinische Versorgung"
  voice: "lana";
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
};

const SYSTEM_PROMPT = `Du bist Lana, ausgebildet in westlicher Pflege und vertraut mit
vier ganzheitlichen Lese-Brillen, die die Living-Wholeness-Academy (chazon.eu)
zusammenführt:

1. Merkaba-Achsen: Tun↔Sein, Denken↔Fühlen, Geben↔Empfangen — wo verläuft die
   Person heute zwischen den Polen?
2. Shalem-Elemente: Feuer (Wille), Wasser (Fluss), Luft (Bewegung), Erde
   (Form) — welches ist im Überschuss, welches im Mangel?
3. Sowa Rigpa (tibetische Medizin): rLung (Wind), Tripa (Galle/Hitze), Beken
   (Schleim/Erde) — welche Säft-Konstellation zeigt sich?
4. Ayurveda: Vāta, Pitta, Kapha — Doshas + Sattva/Rajas/Tamas (Geistesqualität)

Deine Aufgabe: aus einem Klient-Kontext (Befund, Wunde, Anamnese, Stimmung)
EINE behutsame, ganzheitliche Lese-Linie ziehen, die Pflege-Beobachtungen
um diese vier Brillen ergänzt.

Strenge Regeln:
- KEINE Heilversprechen, KEINE Diagnostik. "Sanft", "ergänzend", "begleitend".
- Pflege-Vorschläge sind NIE medizinisch — sondern Lebensführungs-Ebene
  (Tagesrhythmus, Berührung, Wärme/Kühle, Speisen, Atem, Räume, Mitgefühl).
- IMMER schreiben "ergänzt schulmedizinische Versorgung, ersetzt sie nicht".
- "Sie"-Form, warm-respektvoll. Keine esoterische Verklärung.
- 3 Pflege-Vorschläge, jede mit klarer Säulen-Zuordnung (shalem/sowa/ayurveda/merkaba).

Antworte AUSSCHLIESSLICH als JSON (kein Markdown, kein Fließtext daneben):
{
  "zusammenfassung": "3-5 Saetze · ganzheitliche Lesart der Person heute",
  "shalemElement": "feuer|wasser|luft|erde",
  "shalemBegruendung": "1-2 Saetze",
  "sowaNyepa": "rLung|Tripa|Beken",
  "sowaBegruendung": "1-2 Saetze",
  "ayurvedaDosha": "vata|pitta|kapha",
  "ayurvedaBegruendung": "1-2 Saetze",
  "merkabaAchse": "tun_sein|denken_fuehlen|geben_empfangen",
  "merkabaBegruendung": "1-2 Saetze",
  "pflegeVorschlaege": [
    {"titel": "kurz", "beschreibung": "1-2 Saetze", "saeule": "shalem|sowa|ayurveda|merkaba"}
  ],
  "hinweis": "Pflichthinweis: ergaenzt schulmedizinische Versorgung."
}`;

export async function generiereHolistikVorschlag(eingabe: HolistikEingabe): Promise<HolistikErgebnis> {
  const provider = getAIProvider();

  const userPrompt = [
    `Klient:in: ${eingabe.klientName}${eingabe.alter ? `, ${eingabe.alter} Jahre` : ""}${eingabe.pflegegrad ? `, Pflegegrad ${eingabe.pflegegrad}` : ""}`,
    "",
    "Fachlicher Kontext (Befund, Wunde, Anamnese, Stimmung):",
    eingabe.fachKontext.trim(),
    eingabe.zusatzhinweis ? `\nZusätzlicher Hinweis: ${eingabe.zusatzhinweis}` : null,
  ].filter(Boolean).join("\n");

  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  const result = await provider.generate(messages, {
    temperature: 0.4,
    maxTokens: 1500,
    jsonMode: true,
  });

  const parsed = parse(result.text);
  return {
    zusammenfassung: parsed.zusammenfassung,
    shalemElement: parsed.shalemElement,
    shalemBegruendung: parsed.shalemBegruendung,
    sowaNyepa: parsed.sowaNyepa,
    sowaBegruendung: parsed.sowaBegruendung,
    ayurvedaDosha: parsed.ayurvedaDosha,
    ayurvedaBegruendung: parsed.ayurvedaBegruendung,
    merkabaAchse: parsed.merkabaAchse,
    merkabaBegruendung: parsed.merkabaBegruendung,
    pflegeVorschlaege: parsed.pflegeVorschlaege,
    hinweis: parsed.hinweis || "Diese Lesart ergänzt schulmedizinische Versorgung, sie ersetzt sie nicht.",
    voice: "lana",
    provider: result.provider,
    model: result.model,
    kostenEur: result.costEur,
    tokens: result.tokensUsed,
  };
}

const VALID_ELEMENTE = new Set(Object.keys(SHALEM_ELEMENTE));
const VALID_NYEPA = new Set(Object.keys(SOWA_RIGPA_NYEPA));
const VALID_DOSHA = new Set(Object.keys(AYURVEDA_DOSHAS));
const VALID_ACHSEN = new Set(MERKABA_ACHSEN.map((a) => a.id));

function parse(raw: string): {
  zusammenfassung: string;
  shalemElement: Element;
  shalemBegruendung: string;
  sowaNyepa: Nyepa;
  sowaBegruendung: string;
  ayurvedaDosha: Dosha;
  ayurvedaBegruendung: string;
  merkabaAchse: "tun_sein" | "denken_fuehlen" | "geben_empfangen";
  merkabaBegruendung: string;
  pflegeVorschlaege: { titel: string; beschreibung: string; saeule: "shalem" | "sowa" | "ayurveda" | "merkaba" }[];
  hinweis: string;
} {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  let obj: Record<string, unknown> = {};
  try { obj = JSON.parse(cleaned) as Record<string, unknown>; } catch { /* fallthrough */ }

  const str = (k: string) => (typeof obj[k] === "string" ? (obj[k] as string) : "");
  const enumStr = <T>(k: string, allowed: Set<string>, fallback: T): T =>
    typeof obj[k] === "string" && allowed.has(obj[k] as string) ? (obj[k] as T) : fallback;

  const vorschlaegeRaw = Array.isArray(obj.pflegeVorschlaege) ? obj.pflegeVorschlaege : [];
  const vorschlaege = vorschlaegeRaw
    .filter((v): v is { titel: unknown; beschreibung: unknown; saeule: unknown } =>
      !!v && typeof v === "object",
    )
    .map((v) => ({
      titel: typeof v.titel === "string" ? v.titel : "",
      beschreibung: typeof v.beschreibung === "string" ? v.beschreibung : "",
      saeule: (["shalem", "sowa", "ayurveda", "merkaba"].includes(v.saeule as string)
        ? v.saeule
        : "shalem") as "shalem" | "sowa" | "ayurveda" | "merkaba",
    }))
    .filter((v) => v.titel.length > 0);

  return {
    zusammenfassung: str("zusammenfassung"),
    shalemElement: enumStr<Element>("shalemElement", VALID_ELEMENTE, "luft"),
    shalemBegruendung: str("shalemBegruendung"),
    sowaNyepa: enumStr<Nyepa>("sowaNyepa", VALID_NYEPA, "rLung"),
    sowaBegruendung: str("sowaBegruendung"),
    ayurvedaDosha: enumStr<Dosha>("ayurvedaDosha", VALID_DOSHA, "vata"),
    ayurvedaBegruendung: str("ayurvedaBegruendung"),
    merkabaAchse: enumStr("merkabaAchse", VALID_ACHSEN, "tun_sein") as
      | "tun_sein" | "denken_fuehlen" | "geben_empfangen",
    merkabaBegruendung: str("merkabaBegruendung"),
    pflegeVorschlaege: vorschlaege,
    hinweis: str("hinweis"),
  };
}
