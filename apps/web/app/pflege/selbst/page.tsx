// /pflege/selbst · Selbstpflege-Hub für die Pflegekraft.
//
// Was kein anderer Anbieter macht: die Pflegekraft selbst als
// "Klient" mit eigenem Energie-/Stress-/Schlaf-Tracking, mit Mikro-
// Pausen-Vorschlägen, Atem-Übungen, Erinnerungen.
//
// Branchen-Kontext: Pflege-Burnout ist die Hauptursache für Fluktuation
// (Studie BARMER 2024: 38 % Burnout-Risiko in Vollzeit-Pflege). Aktuell
// kümmert sich kein Dienstplaner darum. Shalem macht es zur ersten Pflicht.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { CURRENT_USER_ID } from "@/lib/seed";
import { buildSelbstpflege } from "@/lib/pflege/tageshub";

export const metadata = {
  title: "Pflege · Selbstpflege",
};

export default async function PflegeSelbstPage() {
  const persona = await getActivePersona(CURRENT_USER_ID, "pflege");
  const personId = persona.demoPersonId ?? CURRENT_USER_ID;
  const user = userPropsAus(persona, {
    id: personId,
    name: "Dennis Reuter",
    subtitle: "Pflegefachkraft P7",
    initials: "DR",
  });

  const selbst = buildSelbstpflege(personId);
  const stressRisiko = selbst.stress > 70 ? "hoch" : selbst.stress > 50 ? "mittel" : "niedrig";

  return (
    <AppShell role="nurse" user={user} station="Pulmologie 3B Essen">
      <header className="mb-4">
        <Link href="/pflege/heute" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Tageshub
        </Link>
      </header>
      <RolePastelHeader rolle="pflege" eyebrow="Selbstpflege" titel="Du zählst auch.">
        Pflege-Burnout ist die Hauptursache für Fluktuation (BARMER 2024: 38 % Risiko).
        Hier siehst du dich selbst — Energie, Stress, Schlaf, Pausen. Lana erinnert
        sanft, wenn es Zeit ist.
      </RolePastelHeader>

      {/* Aktueller Score */}
      <section
        className="rounded-2xl p-5 mb-4"
        style={{ background: "rgb(var(--accent) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.2)" }}
      >
        <p className="text-[10px] uppercase tracking-wider font-mono mb-3" style={{ color: "rgb(var(--accent))" }}>
          Heute · {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Score label="Energie" wert={selbst.energie} farbe={selbst.energie > 65 ? "var(--vibe-approval)" : selbst.energie > 40 ? "var(--sun)" : "var(--mon)"} />
          <Score label="Stress" wert={selbst.stress} farbe={stressRisiko === "niedrig" ? "var(--vibe-approval)" : stressRisiko === "mittel" ? "var(--sun)" : "var(--mon)"} invertSchlecht />
        </div>
        <div className="grid sm:grid-cols-3 gap-2.5">
          <KpiTile label="Schlaf letzte Nacht" value={`${selbst.schlaf_h.toFixed(1)} h`} farbe={selbst.schlaf_h >= 7 ? "var(--vibe-approval)" : selbst.schlaf_h >= 6 ? "var(--sun)" : "var(--mon)"} unten={selbst.schlaf_h >= 7 ? "ausreichend" : "kürzer als ideal"} />
          <KpiTile label="Pausen heute" value={`${selbst.pausen_genommen}/${selbst.pausen_geplant}`} farbe="var(--fri)" unten={selbst.pausen_genommen >= 2 ? "im Plan" : "noch eine fehlt"} />
          <KpiTile label="Schichten · KW" value={selbst.schichten_diese_woche.toString()} farbe="var(--vibe-team)" unten={selbst.schichten_diese_woche > 5 ? "viel" : "im Rahmen"} />
        </div>
        <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "rgb(var(--accent))" }}>
          ✦ {selbst.hinweis}
        </p>
      </section>

      {/* Mikro-Pausen */}
      <section className="surface rounded-2xl p-4 mb-4">
        <header className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Mikro-Pause · 2 min</p>
          <h2 className="font-display text-[18px] font-semibold mt-0.5">Drei Atemwege</h2>
          <p className="text-[12px] text-mute mt-1">Wähle eine. Lana zählt mit, du atmest.</p>
        </header>
        <div className="grid sm:grid-cols-3 gap-2.5">
          <MikroPause titel="4-7-8" beschreibung="4 Sek einatmen · 7 Sek halten · 8 Sek aus. Beruhigt das Nervensystem." dauerSec={120} farbe="var(--fri)" />
          <MikroPause titel="Box-Atmen" beschreibung="4-4-4-4 — quadratisch atmen. Stabilisiert nach Stress." dauerSec={120} farbe="var(--vibe-team)" />
          <MikroPause titel="Bauchatmung" beschreibung="Hand auf Bauch · 6 Sek tief ein · 6 Sek aus. Erdet sofort." dauerSec={120} farbe="var(--sun)" />
        </div>
      </section>

      {/* Stimmungs-Check */}
      <section className="surface rounded-2xl p-4 mb-4">
        <header className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Wie geht es dir gerade?</p>
          <h2 className="font-display text-[18px] font-semibold mt-0.5">Ehrliche Antwort, nur du siehst sie</h2>
        </header>
        <div className="flex gap-2 flex-wrap">
          {[
            { emo: "🌿", label: "ruhig", farbe: "var(--vibe-approval)" },
            { emo: "🌞", label: "wach", farbe: "var(--sun)" },
            { emo: "🌊", label: "im Fluss", farbe: "var(--vibe-team)" },
            { emo: "🪨", label: "schwer", farbe: "var(--vibe-stats)" },
            { emo: "🔥", label: "überfordert", farbe: "var(--mon)" },
            { emo: "🌧", label: "traurig", farbe: "var(--vibe-profile)" },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              className="px-3 py-2 rounded-full text-[12px] transition-colors hover:scale-105"
              style={{ background: `rgb(${s.farbe} / 0.12)`, color: `rgb(${s.farbe})`, boxShadow: `inset 0 0 0 1px rgb(${s.farbe} / 0.3)` }}
            >
              <span className="mr-1.5" aria-hidden>{s.emo}</span>
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-soft italic mt-3">
          Antwort wird verschlüsselt gespeichert · niemand sonst sieht sie · Pattern-Erkennung
          warnt nur bei dauerhaft "überfordert" oder "traurig" Lana, die dich kontaktiert.
        </p>
      </section>

      {/* Branchen-Aussage */}
      <section
        className="rounded-2xl p-4"
        style={{ background: "rgb(var(--vibe-team) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.2)" }}
      >
        <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-team))" }}>
          Was Branchen-Studien sagen
        </p>
        <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
          <li className="flex gap-2"><span className="shrink-0">›</span><span><strong>BARMER 2024</strong>: 38 % der Vollzeit-Pflegekräfte mit Burnout-Risiko. Hauptfaktor: keine Pause-Disziplin.</span></li>
          <li className="flex gap-2"><span className="shrink-0">›</span><span><strong>DBfK 2025</strong>: Pflegekräfte mit aktivem Selbstpflege-Coaching bleiben 2.4 Jahre länger im Beruf.</span></li>
          <li className="flex gap-2"><span className="shrink-0">›</span><span><strong>Hippocratic AI Polaris</strong>: zeigt im US-Markt, dass empathische KI-Voice die Pflegekraft entlastet — wir machen es DSGVO-nativ.</span></li>
          <li className="flex gap-2"><span className="shrink-0">›</span><span>Heute kümmert sich kein Dienstplaner um die Pflegekraft selbst. <strong>Shalem macht das zur ersten Pflicht.</strong></span></li>
        </ul>
      </section>
    </AppShell>
  );
}

function Score({ label, wert, farbe, invertSchlecht }: { label: string; wert: number; farbe: string; invertSchlecht?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-wider font-mono text-soft">{label}</span>
        <span className="text-[20px] font-display font-semibold tabular-nums" style={{ color: `rgb(${farbe})` }}>{wert}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden surface-mute">
        <span className="block h-full rounded-full transition-all" style={{ width: `${wert}%`, background: `rgb(${farbe})` }} />
      </div>
      {invertSchlecht && (
        <p className="text-[10px] text-soft mt-1">höher = stressiger</p>
      )}
    </div>
  );
}

function KpiTile({ label, value, farbe, unten }: { label: string; value: string; farbe: string; unten: string }) {
  return (
    <div className="surface rounded-xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: `rgb(${farbe})` }}>{label}</p>
      <p className="text-[18px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{value}</p>
      <p className="text-[10px] text-soft">{unten}</p>
    </div>
  );
}

function MikroPause({ titel, beschreibung, dauerSec, farbe }: { titel: string; beschreibung: string; dauerSec: number; farbe: string }) {
  return (
    <button
      type="button"
      className="text-left rounded-xl p-3 transition-all hover:scale-[1.02]"
      style={{ background: `rgb(${farbe} / 0.08)`, boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[14px] font-medium" style={{ color: `rgb(${farbe})` }}>{titel}</span>
        <span className="text-[10px] font-mono text-soft">{Math.round(dauerSec / 60)} min</span>
      </div>
      <p className="text-[11px] text-mute mt-1 leading-relaxed">{beschreibung}</p>
      <span className="text-[11px] mt-2 inline-block" style={{ color: `rgb(${farbe})` }}>
        ▶ Atem-Übung starten
      </span>
    </button>
  );
}
