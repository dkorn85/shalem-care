"use client";

// PreferencesPanel · zentrale Einstellungs-Section im Profil.
//
// Bündelt: Sprach-Switcher, Audio-Stumm-Toggle, Klartext-auto, Push/E-Mail,
// Schicht-Erinnerung. Jede Änderung geht direkt in den Profil-Store +
// Cookie für Sprache. Zeigt einen leichten "gespeichert"-Hinweis nach
// jedem Klick.

import { useState, useTransition } from "react";
import { speicherePreferenzen } from "@/lib/profile/actions";
import type { ProfilPreferenzen } from "@/lib/profile/store";

const SPRACHEN: { code: ProfilPreferenzen["sprache"]; label: string; flag: string }[] = [
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const SCHICHT_OPTIONEN = [0, 15, 30, 60, 120];

export function PreferencesPanel({
  personId,
  preferenzen,
}: {
  personId: string;
  preferenzen: ProfilPreferenzen;
}) {
  const [werte, setWerte] = useState(preferenzen);
  const [pending, start] = useTransition();
  const [gespeichert, setGespeichert] = useState<string | null>(null);

  const update = <K extends keyof ProfilPreferenzen>(key: K, value: ProfilPreferenzen[K]) => {
    setWerte((alt) => ({ ...alt, [key]: value }));
    start(async () => {
      const r = await speicherePreferenzen(personId, { [key]: value } as Partial<ProfilPreferenzen>);
      if (r.ok) {
        setGespeichert(String(key));
        setTimeout(() => setGespeichert(null), 1200);
      }
    });
  };

  return (
    <section className="surface rounded-2xl p-5 anim-slideUp">
      <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-0.5">Präferenzen</p>
          <h2 className="font-display text-[18px] font-semibold tracking-tight2">Wie soll Shalem mit dir reden?</h2>
        </div>
        {gespeichert && <span className="chip text-[10px]" style={{ background: "rgb(var(--thu) / 0.15)", color: "rgb(var(--thu))" }}>gespeichert</span>}
      </div>

      <div className="space-y-4">
        {/* Sprache */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium">Sprache</p>
            <p className="text-[11px] text-mute leading-snug">UI-Sprache · setzt das `shalem_locale`-Cookie für die ganze Plattform.</p>
          </div>
          <div className="flex rounded-lg surface-mute p-0.5 text-[12px]">
            {SPRACHEN.map((s) => (
              <button
                key={s.code}
                onClick={() => update("sprache", s.code)}
                disabled={pending}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  werte.sprache === s.code ? "bg-[rgb(var(--bg-elev))] text-[rgb(var(--fg))]" : "text-mute hover:text-[rgb(var(--fg))]"
                }`}
              >
                <span aria-hidden>{s.flag}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-app-soft">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium">Stimme von Lana und Dennis</p>
            <p className="text-[11px] text-mute leading-snug">Notruf, Konferenz-Start, Klartext-Vorlesen. Stumm = nur Text.</p>
          </div>
          <Toggle
            an={!werte.audioStumm}
            onChange={(an) => update("audioStumm", !an)}
            labels={["Stumm", "An"]}
          />
        </div>

        {/* Klartext-Auto */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-app-soft">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium">Klartext automatisch zeigen</p>
            <p className="text-[11px] text-mute leading-snug">Wenn an: Befunde + Beschlüsse landen direkt in Alltagssprache.</p>
          </div>
          <Toggle
            an={werte.klartextAuto}
            onChange={(an) => update("klartextAuto", an)}
          />
        </div>

        {/* Push */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-app-soft">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium">Push-Benachrichtigungen</p>
            <p className="text-[11px] text-mute leading-snug">Schicht-Tausch-Anfragen, Notrufe, Eskalationen.</p>
          </div>
          <Toggle an={werte.push} onChange={(an) => update("push", an)} />
        </div>

        {/* E-Mail */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-app-soft">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium">E-Mail-Zusammenfassung</p>
            <p className="text-[11px] text-mute leading-snug">Tägliche Wochen-Übersicht + Genossenschafts-News.</p>
          </div>
          <Toggle an={werte.email} onChange={(an) => update("email", an)} />
        </div>

        {/* Schicht-Erinnerung */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-app-soft">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium">Schicht-Erinnerung</p>
            <p className="text-[11px] text-mute leading-snug">Push-Reminder vor Dienstbeginn.</p>
          </div>
          <select
            value={werte.schichtErinnerung}
            onChange={(e) => update("schichtErinnerung", Number(e.target.value))}
            disabled={pending}
            className="select text-[12px] py-1 px-2"
          >
            {SCHICHT_OPTIONEN.map((m) => (
              <option key={m} value={m}>{m === 0 ? "Aus" : `${m} min vorher`}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

function Toggle({
  an,
  onChange,
  labels = ["Aus", "An"],
}: {
  an: boolean;
  onChange: (an: boolean) => void;
  labels?: [string, string];
}) {
  return (
    <button
      role="switch"
      aria-checked={an}
      onClick={() => onChange(!an)}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
      style={{ background: an ? "rgb(var(--thu))" : "rgb(var(--border))" }}
      title={an ? labels[1] : labels[0]}
    >
      <span
        className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow"
        style={{ transform: an ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}
