"use client";

// LanaKiBerater · KI-gestützter Beratungs-Block für die Stationssicht.
//
// Vier Bereiche:
//   1. "Was kommt als nächstes?" — die nächsten N Termine über alle Berufe
//   2. "Was kann jetzt für den Klienten getan werden?" — kontextuelle
//      Suggestions (Tageszeit · letzte Vital · ganzheitliche Betrachtung)
//   3. "Weiterführende Angebote" — Genossenschaft-Cross-Sell (Hospiz,
//      Begleitung, Therapie-Erweiterung, Tibet-Säfte)
//   4. "Frag Lana" — Inline-Stub-Chat (Phase 2: echter Stream über
//      lib/ai/lana-chat.ts mit RAG über Klient-Akte)
//
// Phase 2: ersetzt durch echte Anthropic-Calls mit Klient-Kontext via
// CareTeam-RLS-gefilterten Akte-Snippets als Prompt-Anchor.

import { useState } from "react";
import Link from "next/link";
import { fragLana } from "@/lib/ai/frag-lana";

export type NaechsterTermin = {
  zeit: string;
  beruf: string;
  beruf_label: string;
  aktivitaet: string;
  farbe: string;
};

export type LanaSuggestion = {
  id: string;
  titel: string;
  beschreibung: string;
  cta?: { label: string; href: string };
  ikone?: string;
  farbe: string;
};

export function LanaKiBerater({
  klientName,
  naechste,
  jetzt_aktiv,
  suggestions,
  weiterfuehrend,
  saftZustand,
}: {
  klientName: string;
  naechste: NaechsterTermin[];
  jetzt_aktiv: number;
  suggestions: LanaSuggestion[];
  weiterfuehrend: LanaSuggestion[];
  saftZustand?: { rLung: number; tripa: number; beken: number };
}) {
  const [chatInput, setChatInput] = useState("");
  type ChatItem = {
    rolle: "user" | "lana";
    text: string;
    quellen?: { titel: string; href: string }[];
    source?: "ki" | "heuristik";
    meta?: {
      provider: string;
      model: string;
      kostenEur: number;
      tokens: { input: number; output: number };
    };
  };
  const [chatHistorie, setChatHistorie] = useState<ChatItem[]>([
    {
      rolle: "lana",
      text: `Hallo. Ich bin Lana und hab heute ein Auge auf ${klientName}. Frag mich zu Schmerz, Sturz, Ernährung, Hausmitteln — ich beziehe mich auf die DNQP-Standards.`,
    },
  ]);
  const [pending, setPending] = useState(false);

  const sendeNachricht = async () => {
    const text = chatInput.trim();
    if (!text || pending) return;
    const historieFuerKi = chatHistorie
      .filter((m) => m.text)
      .map((m) => ({ rolle: m.rolle, text: m.text }));
    setChatHistorie((h) => [...h, { rolle: "user", text }]);
    setChatInput("");
    setPending(true);

    try {
      const res = await fragLana({
        frage: text,
        klientName,
        naechsteTermine: naechste.map((n) => ({
          zeit: n.zeit,
          beruf_label: n.beruf_label,
          aktivitaet: n.aktivitaet,
        })),
        historie: historieFuerKi,
      });
      setChatHistorie((h) => [
        ...h,
        {
          rolle: "lana",
          text: res.antwort,
          quellen: res.quellen,
          source: res.source,
          meta: res.meta,
        },
      ]);
    } catch (err) {
      setChatHistorie((h) => [
        ...h,
        {
          rolle: "lana",
          text: "Fehler bei der KI-Anfrage. Versuch es nochmal.",
          source: "heuristik",
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between gap-2 flex-wrap">
        <div className="flex items-baseline gap-2.5">
          <span
            aria-hidden
            className="w-2 h-2 rounded-full"
            style={{ background: "rgb(var(--accent))", boxShadow: "0 0 6px rgb(var(--accent) / 0.6)" }}
          />
          <h2 className="font-display text-[20px] font-semibold tracking-tight2">Lana · KI-Beratung</h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-soft font-mono">ganzheitlich · kontext-aware</span>
      </header>

      {/* Section 1: was kommt als nächstes */}
      <section
        className="rounded-2xl p-4"
        style={{ background: "rgb(var(--accent) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.2)" }}
      >
        <p className="text-[11px] uppercase tracking-wider font-medium mb-2.5" style={{ color: "rgb(var(--accent))" }}>
          Was kommt als nächstes?
        </p>
        {naechste.length === 0 ? (
          <p className="text-[12px] text-mute">Heute keine weiteren Termine. Eintragen kannst du das oben über das Cockpit.</p>
        ) : (
          <ul className="space-y-1.5">
            {naechste.slice(0, 4).map((t, i) => (
              <li key={i} className="flex items-baseline gap-2.5 text-[12px]">
                <span className="font-mono tabular-nums w-[44px] shrink-0" style={{ color: `rgb(${t.farbe})` }}>{t.zeit}</span>
                <span className="font-medium shrink-0" style={{ color: `rgb(${t.farbe})` }}>{t.beruf_label}</span>
                <span className="text-soft truncate">{t.aktivitaet}</span>
              </li>
            ))}
          </ul>
        )}
        {jetzt_aktiv > 0 && (
          <p className="text-[10px] mt-2 font-mono" style={{ color: "rgb(var(--mon))" }}>
            ● {jetzt_aktiv} Termin{jetzt_aktiv === 1 ? "" : "e"} läuft gerade
          </p>
        )}
      </section>

      {/* Section 2: was kann jetzt getan werden */}
      <section className="rounded-2xl p-4 surface">
        <p className="text-[11px] uppercase tracking-wider font-medium text-soft mb-2.5">
          Was kann jetzt für {klientName} getan werden?
        </p>
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li key={s.id} className="flex items-baseline gap-2.5">
              <span aria-hidden className="w-1 h-5 rounded-full shrink-0" style={{ background: `rgb(${s.farbe})` }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[13px] font-medium">{s.titel}</span>
                  {s.cta && (
                    <Link
                      href={s.cta.href}
                      className="text-[10px] underline-offset-2 hover:underline"
                      style={{ color: `rgb(${s.farbe})` }}
                    >
                      {s.cta.label} ›
                    </Link>
                  )}
                </div>
                <p className="text-[11px] text-soft mt-0.5">{s.beschreibung}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 3: Ganzheitliche Betrachtung — Tibet-Säfte */}
      {saftZustand && (
        <section className="rounded-2xl p-4 surface">
          <p className="text-[11px] uppercase tracking-wider font-medium text-soft mb-2.5">
            Ganzheitliche Betrachtung · Tibet-Säfte
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "rLung · Wind", wert: saftZustand.rLung, farbe: "var(--vibe-team)" },
              { label: "Tripa · Galle", wert: saftZustand.tripa, farbe: "var(--sun)" },
              { label: "Beken · Schleim", wert: saftZustand.beken, farbe: "var(--wed)" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10px] text-soft font-mono">{s.label}</p>
                <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                  <span
                    className="block h-full rounded-full transition-all"
                    style={{ width: `${s.wert}%`, background: `rgb(${s.farbe})` }}
                  />
                </div>
                <p className="text-[10px] mt-0.5 font-mono tabular-nums" style={{ color: `rgb(${s.farbe})` }}>
                  {s.wert}%
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-soft italic mt-2.5">
            Sowa-Rigpa-Lehre · Stand aus letzter Anamnese + Vital-Drift. Nicht-diagnostisch, ergänzend.
          </p>
        </section>
      )}

      {/* Section 4: Weiterführende Angebote */}
      {weiterfuehrend.length > 0 && (
        <section className="rounded-2xl p-4 surface">
          <p className="text-[11px] uppercase tracking-wider font-medium text-soft mb-2.5">
            Weiterführende Genossenschafts-Angebote
          </p>
          <ul className="grid sm:grid-cols-2 gap-2">
            {weiterfuehrend.map((s) => (
              <li
                key={s.id}
                className="rounded-lg p-3 transition-colors hover:bg-[rgb(var(--bg-mute))]"
                style={{ boxShadow: `inset 0 0 0 1px rgb(${s.farbe} / 0.25)` }}
              >
                <p className="text-[12px] font-medium" style={{ color: `rgb(${s.farbe})` }}>{s.titel}</p>
                <p className="text-[11px] text-soft mt-0.5">{s.beschreibung}</p>
                {s.cta && (
                  <Link
                    href={s.cta.href}
                    className="text-[10px] mt-1.5 inline-block underline-offset-2 hover:underline"
                    style={{ color: `rgb(${s.farbe})` }}
                  >
                    {s.cta.label} ›
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Section 5: Frag Lana */}
      <section className="rounded-2xl p-4 surface" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}>
        <p className="text-[11px] uppercase tracking-wider font-medium mb-2.5" style={{ color: "rgb(var(--accent))" }}>
          Frag Lana · Chat
        </p>
        <ul className="space-y-2 max-h-[260px] overflow-y-auto mb-3">
          {chatHistorie.map((m, i) => (
            <li
              key={i}
              className={`text-[12px] leading-relaxed rounded-lg px-3 py-2 ${m.rolle === "user" ? "ml-8" : "mr-8"}`}
              style={{
                background: m.rolle === "user" ? "rgb(var(--bg-mute))" : "rgb(var(--accent) / 0.07)",
                color: m.rolle === "user" ? "rgb(var(--fg))" : undefined,
              }}
            >
              <span className="text-[10px] uppercase tracking-wider font-mono block mb-0.5" style={{ color: m.rolle === "user" ? "rgb(var(--fg-mute))" : "rgb(var(--accent))" }}>
                {m.rolle === "user" ? "du" : "Lana"}
                {m.source === "ki" && m.meta && (
                  <span className="ml-1.5 text-soft normal-case">
                    · {m.meta.model.replace(/-\d{8}$/, "")} · {m.meta.kostenEur.toFixed(4)} €
                  </span>
                )}
                {m.source === "heuristik" && m.rolle === "lana" && (
                  <span className="ml-1.5 text-soft normal-case">· Heuristik</span>
                )}
              </span>
              {m.text}
              {m.quellen && m.quellen.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.quellen.map((q, qi) => (
                    <Link
                      key={qi}
                      href={q.href}
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}
                    >
                      {q.titel} →
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
          {pending && (
            <li className="text-[12px] text-soft italic mr-8 px-3 py-2">Lana denkt …</li>
          )}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendeNachricht();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Frag was über ${klientName} — Schmerz, Schlaf, Ernährung, Familie …`}
            className="flex-1 px-3 py-2 rounded-md text-[12px] surface-mute border-0 focus:outline-none focus:ring-2"
            style={{ outline: "none" }}
            disabled={pending}
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || pending}
            className="px-3 py-2 rounded-md text-[12px] font-medium transition-colors disabled:opacity-40"
            style={{ background: "rgb(var(--accent))", color: "white" }}
          >
            Senden
          </button>
        </form>
        <p className="text-[10px] text-soft mt-2 italic">
          Claude mit DNQP-Standards + Hausmittel als Knowledge-Base. Wenn API-Key fehlt: Heuristik-Fallback.
        </p>
      </section>
    </div>
  );
}
