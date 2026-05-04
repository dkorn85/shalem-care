// Tele-Doktor-API · Phase-1-Stub.
//
// Phase 2: Echte Anbindung an einen der zugelassenen Anbieter:
//   - kry.de (Online-Krankschreibung mit Rezept, GKV-Verträge)
//   - jameda.de · Videosprechstunde
//   - teleclinic.com · Tele-AU
//   - eAU via gematik / TI-Konnektor (KIM)
//
// API-Schema orientiert sich an einer minimalen Booking-API:
//   POST /appointments    { fachrichtung, art, slot? } → { id, slot, providerLink }
//   GET  /appointments/:id
//   POST /tele-au         { km_id, ärztl. Anamnese }    → { eauReferenz, gueltigBis }

export type ProviderId = "doctor.api" | "kry" | "jameda" | "shalem-tele";

export type AvailableSlot = {
  provider: ProviderId;
  praxisName: string;
  arztName?: string;
  fachrichtung: string;
  zeitslot: string;          // ISO
  durationMin: number;
  videoCallSupported: boolean;
  freeText?: string;
};

const FACHRICHTUNG_FIT: Record<string, string[]> = {
  atemwege:              ["Allgemeinmedizin", "HNO", "Pneumologie"],
  magen_darm:            ["Allgemeinmedizin", "Gastroenterologie"],
  muskuloskelettal:      ["Orthopädie", "Allgemeinmedizin"],
  infekt_fieber:         ["Allgemeinmedizin"],
  kopfschmerz_migraene:  ["Allgemeinmedizin", "Neurologie"],
  psychisch:             ["Psychotherapie", "Allgemeinmedizin"],
  verletzung:            ["Unfallchirurgie", "Orthopädie"],
  sonstiges:             ["Allgemeinmedizin"],
};

// Demo-Praxen — würden in Phase 2 aus einem KV-Praxisverzeichnis kommen
const DEMO_PRAXEN: Array<Omit<AvailableSlot, "zeitslot">> = [
  { provider: "shalem-tele", praxisName: "Shalem Tele-Praxis Dr. Lieb",  arztName: "Dr. Susanna Lieb",   fachrichtung: "Allgemeinmedizin", durationMin: 15, videoCallSupported: true,  freeText: "Online-AU bis 7 Tage" },
  { provider: "kry",         praxisName: "KRY Online-Sprechstunde",       arztName: "Dr. M. Borg",        fachrichtung: "Allgemeinmedizin", durationMin: 12, videoCallSupported: true,  freeText: "Auch Folgerezept" },
  { provider: "jameda",      praxisName: "Hausarztpraxis Dr. Vogt (Wedding)", arztName: "Dr. K. Vogt",    fachrichtung: "Allgemeinmedizin", durationMin: 20, videoCallSupported: true },
  { provider: "doctor.api",  praxisName: "MVZ Charité — Tele-Schulter",   arztName: "Dr. P. Hartwig",     fachrichtung: "Orthopädie",       durationMin: 25, videoCallSupported: true },
  { provider: "doctor.api",  praxisName: "Praxis Dr. Renner Pneumologie", arztName: "Dr. F. Renner",      fachrichtung: "Pneumologie",      durationMin: 30, videoCallSupported: false, freeText: "Nur Präsenz" },
  { provider: "doctor.api",  praxisName: "Tele-Psychotherapie L. Brüning",arztName: "Dipl.-Psych. L. Brüning", fachrichtung: "Psychotherapie", durationMin: 50, videoCallSupported: true,  freeText: "Akut-Sprechstunde" },
];

export async function searchAvailableSlots(input: {
  symptomKategorie: string;
  preferVideo?: boolean;
  earliestISO?: string;       // frühester Termin
}): Promise<AvailableSlot[]> {
  const fits = new Set(FACHRICHTUNG_FIT[input.symptomKategorie] ?? ["Allgemeinmedizin"]);
  const baseTime = input.earliestISO ? new Date(input.earliestISO) : new Date();
  // Generiere 3 Slots in den nächsten 24h pro passender Praxis
  const slots: AvailableSlot[] = [];
  let i = 0;
  for (const praxis of DEMO_PRAXEN) {
    if (!fits.has(praxis.fachrichtung)) continue;
    if (input.preferVideo && !praxis.videoCallSupported) continue;
    for (let s = 0; s < 3; s++) {
      const t = new Date(baseTime);
      t.setHours(t.getHours() + 1 + i + s * 2);
      t.setMinutes(0, 0, 0);
      slots.push({ ...praxis, zeitslot: t.toISOString() });
    }
    i++;
  }
  // Mock-Latenz für realistische UX
  await new Promise((r) => setTimeout(r, 200));
  return slots
    .sort((a, b) => a.zeitslot.localeCompare(b.zeitslot))
    .slice(0, 12);
}

export async function bookSlot(input: {
  slot: AvailableSlot;
  personId: string;
  anliegen: string;
  krankmeldungId?: string;
}): Promise<{
  ok: true;
  bookingId: string;
  videoCallUrl?: string;
}> {
  // Phase 2: echter API-Call zur Provider-API
  await new Promise((r) => setTimeout(r, 250));
  const bookingId = `${input.slot.provider}-${Date.now().toString(36)}`;
  const videoCallUrl = input.slot.videoCallSupported
    ? `https://${input.slot.provider}.example/${bookingId}#km=${encodeURIComponent(input.krankmeldungId ?? "")}`
    : undefined;
  return { ok: true, bookingId, videoCallUrl };
}

export async function requestTeleAU(input: {
  personId: string;
  symptomKategorie: string;
  freitext: string;
  krankmeldungId: string;
}): Promise<{ ok: true; eauReferenz: string; gueltigBis: string; arztName: string } | { ok: false; reason: string }> {
  // Phase 2: echte gematik eAU-Pipeline (KIM-Postfach des AG, AOK-Fachdienste).
  await new Promise((r) => setTimeout(r, 350));
  // Heuristik: einfache Beschwerden bekommen Tele-AU automatisch (Demo)
  const erlaubt = ["atemwege", "magen_darm", "kopfschmerz_migraene", "infekt_fieber"].includes(input.symptomKategorie);
  if (!erlaubt) {
    return { ok: false, reason: "Diese Symptomkategorie erfordert ärztliche Untersuchung — bitte Termin buchen." };
  }
  const heute = new Date();
  const bis = new Date(heute);
  bis.setDate(bis.getDate() + 3);
  return {
    ok: true,
    eauReferenz: `EAU-${Date.now().toString(36).toUpperCase()}`,
    gueltigBis: bis.toISOString().slice(0, 10),
    arztName: "Dr. S. Lieb (Shalem Tele)",
  };
}
