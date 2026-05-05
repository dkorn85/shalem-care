// ElevenLabs Voice-IDs · zentrale Konstanten.
//
// Phase A: Standard-ElevenLabs-Stimmen (Klara/Jonas) — neutrale, lizenz-freie
//          Stimmen für UI-Sounds und Klartext-Begleiter.
// Phase B: Geklonte Stimmen von Dennis & Lana (real existierende Personen,
//          schriftliche Einwilligung notwendig + DSGVO-VVT-Eintrag).
//
// Mapping zu Anwendungs-Kontexten siehe `VOICE_FOR_CONTEXT` weiter unten.
// Cockpits / Audio-Komponenten sollten nicht direkt Voice-IDs hardcoden,
// sondern `voiceFor("klartext")` etc. aufrufen.

export type VoiceId = string;

export type VoiceProfile = {
  id: VoiceId;
  name: string;
  beschreibung: string;
  geschlecht: "weiblich" | "maennlich" | "neutral";
  charakter: "warm" | "ruhig" | "klar" | "froehlich";
  herkunft: "elevenlabs-standard" | "klon";
  einwilligung?: {
    person: string;
    datum?: string;     // ISO YYYY-MM-DD
    widerrufbar: true;
    vvtEintrag?: string;
  };
};

export const VOICES: Record<string, VoiceProfile> = {
  // ─── Phase A · Standard-ElevenLabs-Stimmen ─────────────────────────
  // Diese werden später ergänzt (mit echten Voice-IDs aus ElevenLabs-Library).
  // Bis dahin ist der Default-Voice der Library aktiv (Juniper o.ä.).

  // ─── Phase B · Geklonte Stimmen ────────────────────────────────────
  lana: {
    id: "ZgahlWh5FVSG7MFjZwPE",
    name: "Lana",
    beschreibung: "Stationsleitung-Demo-Persona · warm-weiblich · ideal für Klartext-Begleitung und Klient-empathische Ansagen.",
    geschlecht: "weiblich",
    charakter: "warm",
    herkunft: "klon",
    einwilligung: {
      person: "Lana (Real-Person hinter Demo-Persona)",
      widerrufbar: true,
      // datum: "2026-05-05",  // sobald schriftliche Einwilligung vorliegt
    },
  },
  dennis: {
    id: "wcqN36SUOZ0EhToc2OIu",
    name: "Dennis",
    beschreibung: "Pflegekraft-Demo-Persona (P7) · ruhig-männlich · ideal für Stations-Ansagen und Pflege-Mantras.",
    geschlecht: "maennlich",
    charakter: "ruhig",
    herkunft: "klon",
    einwilligung: {
      person: "Dennis (Real-Person hinter Demo-Persona)",
      widerrufbar: true,
      // datum: "2026-05-05",
    },
  },
};

/**
 * Anwendungs-Kontext → Voice-Mapping. So braucht der Aufrufer keine
 * Voice-IDs zu kennen, nur den Verwendungs-Zweck.
 */
export type AudioKontext =
  | "klartext_pflege"        // Klartext-Begleiter Pflege-Anamnese (Lana, warm)
  | "klartext_arzt"          // Klartext-Begleiter Arzt-Befund (Lana, warm)
  | "klartext_therapie"      // Klartext-Begleiter Therapie (Lana, warm)
  | "klartext_sozial"        // Klartext-Begleiter Sozial (Lana, warm)
  | "notruf_bestaetigt"      // SOS-Bestätigung "Wir sind unterwegs." (Lana, warm)
  | "konferenz_start"        // Konferenz beginnt (Dennis, ruhig)
  | "stations_ansage"        // Stations-Ansage / Schichtwechsel (Dennis, ruhig)
  | "schicht_mantra"         // Optional 30-s ruhige Atemführung (Dennis, ruhig)
  | "onboarding_klient"      // Onboarding-Tour Klient-Self-Booker (Lana)
  | "onboarding_pflege"      // Onboarding-Tour Pflege-Schichtplan (Dennis)
  | "onboarding_konferenz"   // Onboarding-Tour Konferenz (Dennis)
  | "onboarding_genossenschaft" // Onboarding-Tour Beitritt (Lana)
  | "onboarding_notfall";    // Onboarding-Tour Notfall (Lana, warm-beruhigend)

export const VOICE_FOR_CONTEXT: Record<AudioKontext, keyof typeof VOICES> = {
  klartext_pflege:           "lana",
  klartext_arzt:             "lana",
  klartext_therapie:         "lana",
  klartext_sozial:           "lana",
  notruf_bestaetigt:         "lana",
  konferenz_start:           "dennis",
  stations_ansage:           "dennis",
  schicht_mantra:            "dennis",
  onboarding_klient:         "lana",
  onboarding_pflege:         "dennis",
  onboarding_konferenz:      "dennis",
  onboarding_genossenschaft: "lana",
  onboarding_notfall:        "lana",
};

export function voiceFor(kontext: AudioKontext): VoiceProfile {
  const key = VOICE_FOR_CONTEXT[kontext];
  return VOICES[key];
}

export function voiceById(id: VoiceId): VoiceProfile | null {
  return Object.values(VOICES).find((v) => v.id === id) ?? null;
}
