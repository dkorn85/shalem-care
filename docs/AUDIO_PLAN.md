# Audio-Plan · Shalem Care

**Stand:** 2026-05-05 · **Pipeline:** ElevenLabs (TTS + Voice-Clone) + ggf. Soundly für Ambient
**Ziel:** Audio-Branding-Strategie + konkrete Asset-Liste (Block 25). Phase A neutrale Stimmen,
Phase B optionale Stimm-Klone von Demo-Personas Dennis und Lana.

---

## Grundhaltung · Stille als Default

Pflege-Software ist High-Stakes. Eine Stationsleitung hat 14 Tabs offen, ein Notruf läuft,
parallel klingelt ein Telefon. Wenn unsere Plattform jetzt anfängt zu **pingen wie Slack**,
wird sie als Stressquelle wahrgenommen und stumm-geschaltet — und damit wertlos für genau
die Momente, in denen Sound wirklich helfen würde (Notruf-Bestätigung, Schicht-Anker).

**Drei harte Regeln:**

1. **Stille ist Default.** Audio nur bei expliziter User-Aktion oder als Empathie-Signal —
   nie als reines "neue Nachricht"-Notification.
2. **Privacy by Design.** Setting `"Ton aktiviert?"` startet auf **AUS**. Erst-Aktivierung
   nur bewusst durch User über Profil-Einstellung.
3. **Reduced-Motion respektiert Reduced-Sound.** Wenn `prefers-reduced-motion: reduce` →
   Audio automatisch aus, auch wenn User-Setting an war (vermutlich bewusste Wahl wegen
   Migräne / Sensibilität).

**Wir sind kein Chat-Tool.** Slack-Pings, WhatsApp-Twonk, Mac-Boings — bewusst weggelassen.
Stattdessen: Sounds, die wie ein **leises Räuspern in einem ruhigen Raum** wirken.

---

## Wo Audio Sinn macht (7 Orte)

| # | Ort | Funktion | Lautstärke |
|---|---|---|---|
| 1 | **Notruf-Bestätigung** (`/notfall` → SOS-Knopf) | Klient hört nach Druck "Wir sind unterwegs." — wichtigster Empathie-Moment der Plattform | normal · 70 % |
| 2 | **Konferenz-Live-Start** (`/konferenz/[id]` → "Start") | Sehr leise Glocke (Klangschale, einmal) signalisiert "wir sind jetzt im Gespräch, Notizen laufen" | leise · 30 % |
| 3 | **Onboarding-Tour-Voice-Over** (Startseite, `OnboardingTour`) | Optionale gesprochene Begleitung der 5 Loops — User klickt aktiv "Mit Stimme erleben" | normal · 60 % |
| 4 | **Klartext-Begleiter** (`/klient/akte/befunde`, Wundverlauf, Anamnese) | Gesprochene Erklärung des Befundes für Klient:innen mit Lese-Schwäche oder Sehbeeinträchtigung — wichtigstes Barrierefreiheits-Feature | normal · 70 % |
| 5 | **Schicht-Start-Mantra** (`/pflege` Dashboard, optional) | 30-s ruhige Atemführung beim Login zur Schicht. Opt-in pro Pflegekraft. Kein Default. | normal · 50 % |
| 6 | **Stations-Ansagen** (Lead, Push-Layer Phase 2) | Stationsleitung kann Team-Ansage einsprechen, Plattform synthetisiert mit Standard-Stimme — schnell, einheitlich | normal · 70 % |
| 7 | **Atmo-Loop Akte-Hintergrund** (Klient-Akte, optional) | Sehr leiser Atmo-Layer (Vogelgezwitscher / Brunnen) für Klient:innen-Sicht — hilft gegen "klinisch-leeres" Gefühl | sehr leise · 15 % |

### Wo NICHT

- ❌ **Inbox-neue-Aufgabe** — wäre der schnellste Weg, dass User stumm-schalten
- ❌ **Erfolgs-Sound bei "Wunddoku gespeichert"** — Pflege ist Routine, kein Spiel
- ❌ **Page-Transition-Sounds** — würden die UI laut machen
- ❌ **Hover-Sounds, Click-Sounds** — Browser-Native ist genug
- ❌ **Background-Music auf Marketing-Pages** (`/warum`) — User entscheiden selbst, was sie dabei hören
- ❌ **Notruf-Alarm-Ton für Pflegekräfte** — der vibriert das Smartphone, kein Browser-Loud-Audio (das wäre eAcustic in Phase 2 über die mobile App)

---

## Stimmen-Konzept

### Phase A · Zwei neutrale ElevenLabs-Stimmen (zum Demo-Launch)

| ID | Profil | Verwendung |
|---|---|---|
| **Voice A · Klara** | Weiblich, Mitte 40, warm, etwas tief, leichte rheinische Färbung, niemals aufgeregt | Klartext-Begleiter, Notruf-Bestätigung, Onboarding-Tour |
| **Voice B · Jonas** | Männlich, Anfang 50, ruhig, sachlich, mitteldeutscher Standard | Stations-Ansagen, Konferenz-Hinweise, Mantra-Ankündigung |

ElevenLabs-Modell: **Eleven Multilingual v2** (deutsch nativ-klingend) · Stability 0.55 ·
Similarity 0.75 · Style 0.20 (eher zurückhaltend).

**Warum 2 Stimmen?** Eine wäre zu wenig (alles klingt gleich, Kontext geht verloren), drei
zu viel (Cast-Charakter, irritiert in Pflege-Kontext). Zwei schafft die feinste Trennung:
**Klient-zugewandt** (Klara) vs. **Team-zugewandt** (Jonas).

### Phase B · Stimm-Klone von Dennis und Lana (optional, später)

**Dennis Reuter** (P7-Pflegekraft, `person-dr`) und **Lana** (Kurzform für Detektiv-Eins,
Stationsleitung in der Demo bekannt als "Lana") werden in Phase B **optional** als
Persönlichkeits-Layer eingespielt:

- Im **Persona-Switcher** wäre wählbar: "neutrale Stimme" (Default) ODER "Dennis-Stimme"
  bzw. "Lana-Stimme"
- Use-Case: Demos vor Investoren, in denen die Konsistenz "das ist wirklich Dennis,
  der spricht" emotional packt — der Demo-Charakter wird zum Kollegen
- Einsatz **nicht** für echte Klient-Kommunikation — dort bleibt Klara/Jonas Standard,
  weil sie nicht an eine reale Person gebunden sind und Verwechslungs-Risiko entfällt

### Datenschutz · Stimm-Klon (DSGVO Art. 9)

Stimm-Aufnahmen sind biometrische Daten — Voice-Cloning ohne Einwilligung ist sowohl
DSGVO-rechtlich als auch zivilrechtlich (allgemeines Persönlichkeitsrecht) **nicht
zulässig**. Vor jeder Klon-Erstellung:

1. **Einwilligungs-Formular schriftlich** — Zweck, Verwendungs-Bereiche, Speicherdauer,
   Widerrufsrecht. Muster im `lib/compliance/`-Ordner anlegen (Phase 2).
2. **Verarbeitungsverzeichnis-Eintrag** (§ 30 BDSG) — Empfänger ElevenLabs (USA, Schrems-II
   ggf. via SCCs), Datenkategorie biometrische Sprachaufnahmen, Aufbewahrungsdauer.
3. **Eigener Storage-Bucket** für Original-Aufnahmen, AES-256 verschlüsselt, Zugriff nur
   über Service-Role.
4. **Widerruf jederzeit** — bei Widerruf: ElevenLabs-Voice via API löschen, lokale Caches
   löschen, alle bestehenden mp3-Dateien mit dieser Stimme purgen + neu generieren mit
   Default-Stimme.

**Konkurrenz-/Missbrauchs-Risiko:** Wenn ElevenLabs gehackt wird oder ein Mitarbeiter:in
die Original-Aufnahmen exfiltriert, kann jemand "Dennis sagt X" generieren. Mitigation:

- **Watermarking** — ElevenLabs-eigenes Audio-Watermark auf allen produzierten Files (ist
  per Default an)
- **Plattform-Stimme statt Klon als Default** — Klone sind Premium-Feature für Demos,
  nicht für Produktion. So bleibt das Angriffs-Volumen klein.
- **Keine Klone von Klient:innen oder Angehörigen** — diese Personen sind besonders
  schutzbedürftig, hier wird **niemals** geklont, auch nicht mit Einwilligung.

---

## Asset-Brief Block 25

### Block 25.1 · Klartext-Begleiter (Voice A · Klara) — 6 Files

| Datei | Länge | Skript |
|---|---|---|
| `/sounds/klartext-befunde-intro.mp3` | 12 s | "Ich erkläre Ihnen jetzt Ihren Befund. In Ruhe, in einfacher Sprache. Tippen Sie jederzeit auf Pause." |
| `/sounds/klartext-wunde-stabil.mp3` | 8 s | "Ihre Wunde ist auf gutem Weg. Sie wird kleiner. Wir bleiben dran." |
| `/sounds/klartext-wunde-vorsicht.mp3` | 10 s | "Die Wunde braucht jetzt mehr Aufmerksamkeit. Pflege und Arzt sprechen sich gerade ab." |
| `/sounds/klartext-anamnese-warum.mp3` | 14 s | "Wir fragen Sie das, weil Ihre Antworten der Pflegekasse zeigen, wie viel Unterstützung Sie wirklich brauchen. Ehrliche Antworten helfen am meisten." |
| `/sounds/klartext-pflegegrad.mp3` | 16 s | "Ein Pflegegrad ist keine Note. Er beschreibt, wieviel Hilfe Ihnen zusteht. Sie bekommen das, was Sie brauchen — nicht weniger." |
| `/sounds/klartext-konferenz-was.mp3` | 12 s | "Eine Fall-Konferenz heißt: Alle, die Sie betreuen, sprechen miteinander. Über Sie. Mit Ihnen, wenn Sie wollen." |

### Block 25.2 · Notruf + Konferenz (Voice A · Klara) — 3 Files

| Datei | Länge | Skript |
|---|---|---|
| `/sounds/notruf-bestaetigt.mp3` | 3 s | "Wir sind unterwegs." |
| `/sounds/notruf-detail.mp3` | 7 s | "Pflegekraft Dennis ist informiert. Bleiben Sie sitzen, wir sind bei Ihnen in wenigen Minuten." |
| `/sounds/konferenz-glocke.mp3` | 2 s | (keine Sprache · einmaliger weicher Klangschalen-Anschlag, leiser Nachhall, dann Stille) |

### Block 25.3 · Stations-Ansagen + Mantra (Voice B · Jonas) — 4 Files

| Datei | Länge | Skript |
|---|---|---|
| `/sounds/dienstplan-veroeffentlicht.mp3` | 6 s | "Der Dienstplan für Mai steht. Sie können tauschen bis Mittwoch." |
| `/sounds/schicht-uebergabe.mp3` | 8 s | "Übergabe in fünf Minuten. Drei Klient:innen mit Status-Änderung seit gestern." |
| `/sounds/mantra-atem-30s.mp3` | 30 s | "Bevor Ihre Schicht beginnt: Atmen Sie einmal langsam ein… und wieder aus. Drei Mal. Sie sind nicht allein. Ihr Team ist da. Ihre Klient:innen warten auf Sie — nicht auf Perfektion. Auf Sie." |
| `/sounds/mantra-feierabend-20s.mp3` | 20 s | "Ihre Schicht endet jetzt. Was heute liegen blieb, war nicht wegen Ihnen. Atmen Sie aus. Gehen Sie nach Hause." |

### Block 25.4 · Onboarding-Tour Voice-Over (Voice A · Klara) — 5 Files

Korrespondieren mit den 5 vertikalen Loops aus `OnboardingTour`:

| Datei | Länge | Skript |
|---|---|---|
| `/sounds/tour-1-self-booker.mp3` | 12 s | "Klient:innen buchen ihre Pflege selbst. Mit transparenten Preisen. Vierundachtzig Prozent gehen an die Pflegekraft." |
| `/sounds/tour-2-pflege-schicht.mp3` | 12 s | "Pflegekräfte sehen ihre Schichten Wochen im Voraus. Tauschen direkt im Team. Krankmelden mit drei Klicks." |
| `/sounds/tour-3-konferenz.mp3` | 14 s | "Wenn ein Fall kompliziert wird, sprechen alle Beteiligten miteinander. Nicht hintereinander, sondern gleichzeitig — in einer Konferenz." |
| `/sounds/tour-4-beitritt.mp3` | 12 s | "Die Genossenschaft gehört allen, die mitmachen. Ein Anteil kostet hundert Euro. Eine Stimme pro Mitglied." |
| `/sounds/tour-5-notfall.mp3` | 10 s | "Im Notfall ein Knopf. Vier Eskalations-Stufen. In neunzig Sekunden ist jemand erreichbar." |

**Summe Voice-Assets: 18 Files** (6 Klartext + 3 Notruf/Konferenz + 4 Stations/Mantra + 5 Tour)

### Block 25.5 · Ambient-Loops (kein Sprecher, sehr leise) — 4 Files

Klar getrennt von visuellen Loops aus `ASSETS_FLOWSTATE.md`. Diese sind reines Audio,
loop-fähig, 20–60 Sekunden, mit perfektem Anfang-Ende-Match (Cross-Fade ≤200 ms).

| Datei | Länge | Beschreibung |
|---|---|---|
| `/sounds/atmo-akte-vogel.mp3` | 60 s | Sehr leiser Hintergrund: ferner Vogel, Wind in Blättern, dezenter Brunnen. Loopt nahtlos. |
| `/sounds/atmo-konferenz-raum.mp3` | 45 s | Raumton: Holz-Knacken, leiser Heizungs-Pulse, ein dezenter Atemzug. Schafft "Wir-sind-zusammen-im-Raum". |
| `/sounds/atmo-pflege-station.mp3` | 30 s | Station ohne Hektik: ferner Wagen-Rollen, weicher Telefon-Klingelton in der Distanz, Lüftung. |
| `/sounds/atmo-mantra-bett.mp3` | 60 s | Klangbett für Mantra: tiefer Pad-Ton in F-Dur, sehr langsame Atemkurve im Lautstärke-Layer. Spielt unter `mantra-atem-30s.mp3`. |

**Summe Ambient: 4 Files**

---

## Tech-Integration

### HTML5-Audio mit Lazy-Loading

```tsx
// lib/audio/player.ts (Phase 1, in-memory Cache)
const audioCache = new Map<string, HTMLAudioElement>();

export function spielAb(pfad: string, lautstaerke = 0.7): void {
  if (!audioAktiviert()) return;       // User-Setting
  if (reducedMotion()) return;         // OS-Pref
  let el = audioCache.get(pfad);
  if (!el) {
    el = new Audio(pfad);
    el.preload = "none";              // lazy: erst beim ersten Play
    audioCache.set(pfad, el);
  }
  el.volume = lautstaerke;
  el.currentTime = 0;
  void el.play().catch(() => {/* user-gesture-blocked, ok */});
}
```

### User-Setting (Default AUS)

```ts
// lib/settings/audio.ts
export const AUDIO_DEFAULT = false;   // Privacy-by-Design

export function audioAktiviert(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("shalem-audio") === "an";
}
```

UI: in `/profil/einstellungen` ein Switch "Sprach-Begleitung aktivieren" mit Erklär-Text:
> Standardmäßig aus. Wenn aktiviert: gesprochene Erklärungen, Notruf-Bestätigung,
> optionales Schicht-Mantra. Sie hören nie ohne Ihre Aktion.

### Reduced-Motion / Reduced-Sound

```ts
function reducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
```

### ElevenLabs-API · Server-Cache

**Niemals** bei jedem Request neu generieren — das wäre teuer (≈ 0,18 ¢/1 k Zeichen)
und langsam. Stattdessen:

```
scripts/generate-audio.ts
  → liest docs/AUDIO_PLAN.md Block 25
  → ruft ElevenLabs API mit Voice-IDs Klara/Jonas
  → speichert direkt nach apps/web/public/sounds/*.mp3
  → wird nur manuell ausgeführt bei Skript-Änderungen, nicht bei Build
```

CI-Hook: `npm run audio:check` prüft, ob alle in `lib/audio/manifest.ts` aufgeführten
Files in `public/sounds/` existieren — sonst Build-Fail.

**Cache-Busting:** Filenames haben kein Hash-Suffix (statisches Asset), Browser-Cache
ist OK. Bei inhaltlicher Änderung: Datei umbenennen oder per `?v=2` query.

---

## Stimm-Klon-Datenschutz · Konkrete Workflow-Schritte (Phase B)

1. **Aufnahme-Session** mit Dennis und Lana — je 3 Min sauberes Studio-Audio
   (ElevenLabs braucht ≥ 1 Min, optimal 3–5 Min). Ort: ruhiger Raum, Yeti-Mikro,
   keine Skript-Vorgabe — natürliches Sprechen.
2. **Einwilligungs-Formular** unterschreiben — Muster `lib/compliance/voice-consent.ts`
   (Phase 2). Inhalt: Zweck "Plattform-Stimm-Layer für Demo-Personas Dennis & Lana",
   Empfänger ElevenLabs (USA via SCC), Speicherdauer "bis Widerruf", Widerruf jederzeit
   formfrei per E-Mail.
3. **Upload zu ElevenLabs Voice-Lab** — als "Instant Voice Clone" oder besser
   "Professional Voice Clone" (höhere Qualität, dauert ~24 h). Voice-ID notieren.
4. **Eintrag im Verarbeitungsverzeichnis** — `docs/COMPLIANCE_VVT.md` (existiert noch
   nicht, in Phase 2 anlegen) ergänzen.
5. **Storage Original-Aufnahmen** — Supabase Storage Bucket `voice-originals`,
   RLS-Policy: Zugriff nur via Service-Role. Aufbewahrung als Beweis der Einwilligung
   und für eventuelle Re-Trainings.
6. **UI-Switch im Persona-Switcher** — Dropdown bekommt "🎙 Stimme: neutral / Dennis / Lana".
   Voreinstellung: neutral.
7. **Widerrufs-Endpoint** — `/api/voice-revoke` ruft ElevenLabs API → Voice löschen,
   lokale Cache-Files mit Voice-Tag purgen, Bucket-File löschen.

---

## Liefer-Reihenfolge

1. **Erstwelle (Phase A):** Block 25.2 (Notruf 3 Files) + Block 25.4 (Tour 5 Files) →
   8 Files mit Voice A. Sofort einbaubar in `/notfall` und `OnboardingTour`.
2. **Zweitwelle (Phase A):** Block 25.1 (Klartext 6 Files) — sobald Klartext-Wrapper
   auf Befunde + Wundverlauf gespread ist.
3. **Drittwelle (Phase A):** Block 25.3 (Jonas-Ansagen 4 Files) + Block 25.5 (Ambient 4 Files).
4. **Viertwelle (Phase B):** Stimm-Klon-Setup für Dennis + Lana (nur wenn das geplante
   Investoren-Demo es rechtfertigt — sonst bleibt's bei Phase A).

---

## Risiken · ehrlich

- **ElevenLabs-Abhängigkeit:** Wenn der Service ausfällt oder Preise steigen, müssen wir
  alle gecachten mp3s weiterspielen können (lokal in `public/sounds/`). Tun wir, weil
  serverseitig generiert. Aber: für Stimm-Klon-Updates sind wir an ElevenLabs gebunden.
  Alternativ: Coqui TTS selbst hosten (DSGVO-Vorteil, aber Qualität merklich schwächer).
- **Deutsche TTS-Qualität:** Eleven Multilingual v2 ist gut, aber bei medizinischen
  Begriffen ("Sakraldekubitus", "Pflegegrad") muss manuell phonetisch korrigiert werden
  via SSML oder Pre-Editing. Plan: Test-Generation pro File anhören vor Auslieferung.
- **Sprach-Unterschiede:** Aktuell nur Deutsch. EN/TR/AR-Versionen für i18n in Phase 3
  — das verdoppelt/verdreifacht den Asset-Pool. Für jetzt OK, weil Demo-Markt DE.
- **"Stimme klingt KI"** — Manche User hören's und finden's gruselig. Mitigation:
  Klara/Jonas sind bewusst zurückhaltend gestylt (Stability hoch, Style niedrig), nicht
  performativ. Wer's nicht mag: Setting bleibt aus, Fallback ist Lese-Text — alle
  Sprach-Inhalte sind **immer auch geschriebene UI**, niemals Audio-only.
- **Investorendemo-Fallstrick** mit Stimm-Klon: Wenn Dennis-Stimme zu gut funktioniert,
  könnten Investoren denken "das macht Marketing aus" — wir müssen klar kommunizieren,
  dass Klon-Layer optional ist und Plattform-Default neutral bleibt.

---

## Naming-Konvention

- Voice-Files: `kebab-case.mp3`, abgelegt unter `apps/web/public/sounds/`
- Manifest: `apps/web/lib/audio/manifest.ts` listet alle erwarteten Files mit Pfad,
  Voice (A/B), Skript, Länge — eine Quelle der Wahrheit, kann von CI geprüft werden.
- ElevenLabs Voice-IDs in `apps/web/lib/audio/voices.ts` als Konstanten (nicht in `.env`,
  weil keine Secrets — sind öffentliche Voice-IDs).

---

## Hinweis für die Pipeline

ElevenLabs: bei jedem deutschen Skript explizit `<lang xml:lang="de-DE">` SSML setzen,
sonst spricht das Modell deutsche Wörter manchmal englisch aus ("Pflege" → "Pflé-ge").

Lautstärke-Targets: alle Voice-Files normalisiert auf **−16 LUFS** (Loudness Units),
Ambient auf **−28 LUFS**. So sind die Lautstärke-Werte im Player (`0.7`, `0.15`)
konsistent ohne Korrekturen.
