"use client";

// SchichtGruppenchat · Live-Chat für eine Pflege-Schicht mit @lana-Bot.
//
// Mechanik:
// - Lokale Chat-Liste (in-memory + localStorage pro Schicht-Thema)
// - Wenn Nachricht mit "@lana" oder "@bot" beginnt: KI-Antwort holen
// - Bot-Antworten als eigene Bubble rechts mit Lana-Akzent
// - Tipp-Stichpunkte als kleine Chips unter der Antwort

import { useEffect, useRef, useState } from "react";

type Nachricht = {
  id: string;
  zeit: string;
  von: string;
  inhalt: string;
  istBot?: boolean;
  tipps?: string[];
};

type Props = {
  schichtThema: string;       // z.B. "Frühschicht Pulmo 3B Mo 5.5."
  pflegekraft: string;        // Name der eingeloggten Person
  kompakt?: boolean;          // false = volle Höhe, true = max-h-96
};

const STORAGE_KEY = (thema: string) => `shalem-schicht-chat:${thema}`;

function jetzt(): string {
  return new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}
function id(): string {
  return `m-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function SchichtGruppenchat({ schichtThema, pflegekraft, kompakt = false }: Props) {
  const [nachrichten, setNachrichten] = useState<Nachricht[]>([]);
  const [eingabe, setEingabe] = useState("");
  const [botLaedt, setBotLaedt] = useState(false);
  const listeEnde = useRef<HTMLDivElement>(null);

  // Initial: aus localStorage laden
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY(schichtThema));
    if (stored) {
      try { setNachrichten(JSON.parse(stored) as Nachricht[]); }
      catch { /* ignore */ }
    } else {
      // Demo-Seed mit ein paar Nachrichten
      setNachrichten([
        { id: id(), zeit: "06:18", von: "Aylin Stein", inhalt: "Übergabe: Helga gut geschlafen, NRS 2 morgens. Wundverband 17 Uhr fällig." },
        { id: id(), zeit: "06:34", von: "Felix Kaminski", inhalt: "Wilhelm hat heute Vormittag Physio-Termin um 10:30." },
      ]);
    }
  }, [schichtThema]);

  // Speichern + scrollen
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (nachrichten.length > 0) {
      localStorage.setItem(STORAGE_KEY(schichtThema), JSON.stringify(nachrichten.slice(-100)));
    }
    listeEnde.current?.scrollIntoView({ behavior: "smooth" });
  }, [nachrichten, schichtThema]);

  async function senden() {
    const inhalt = eingabe.trim();
    if (!inhalt) return;
    setEingabe("");

    const neue: Nachricht = { id: id(), zeit: jetzt(), von: pflegekraft, inhalt };
    setNachrichten((arr) => [...arr, neue]);

    // Bot-Trigger: @lana oder @bot
    const istBotFrage = /^@(lana|bot)\b/i.test(inhalt);
    if (!istBotFrage) return;

    const frageOhneTrigger = inhalt.replace(/^@(lana|bot)\b\s*[:,]?\s*/i, "");
    setBotLaedt(true);
    try {
      const res = await fetch("/api/ai/schicht-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frage: frageOhneTrigger,
          schichtThema,
          kontext: nachrichten.slice(-15).map((n) => ({
            von: n.von, zeit: n.zeit, inhalt: n.inhalt, istBot: n.istBot,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const bot: Nachricht = {
        id: id(),
        zeit: jetzt(),
        von: "Lana",
        inhalt: data.antwort,
        istBot: true,
        tipps: data.tipps ?? [],
      };
      setNachrichten((arr) => [...arr, bot]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setNachrichten((arr) => [...arr, {
        id: id(), zeit: jetzt(), von: "Lana", inhalt: `(Fehler beim Holen der Antwort: ${msg})`, istBot: true,
      }]);
    } finally {
      setBotLaedt(false);
    }
  }

  return (
    <section className="surface rounded-2xl p-4 sm:p-5">
      <header className="flex items-baseline justify-between gap-2 flex-wrap mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-soft mb-0.5 font-medium">Schicht-Chat · @lana fragt für dich</p>
          <h2 className="font-display text-[16px] font-bold tracking-tight2">{schichtThema}</h2>
        </div>
        <span className="text-[10px] text-mute italic">
          {nachrichten.length} Nachrichten · lokal gespeichert
        </span>
      </header>

      <div
        className={`overflow-y-auto pr-1 mb-3 ${kompakt ? "max-h-72" : "max-h-[440px]"}`}
        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, transparent 100%)" }}
      >
        <ul className="space-y-2">
          {nachrichten.map((n) => (
            <li key={n.id} className={`flex gap-2 ${n.istBot ? "flex-row-reverse" : ""}`}>
              <div
                className="rounded-2xl px-3 py-1.5 max-w-[80%]"
                style={{
                  background: n.istBot
                    ? "linear-gradient(135deg, rgb(var(--accent) / 0.10), rgb(var(--accent) / 0.05))"
                    : "rgb(var(--bg-mute))",
                  boxShadow: n.istBot
                    ? "inset 0 0 0 1px rgb(var(--accent) / 0.25)"
                    : "inset 0 0 0 1px rgb(var(--fg-mute) / 0.08)",
                }}
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] font-medium" style={{ color: n.istBot ? "rgb(var(--accent))" : "rgb(var(--fg-soft))" }}>
                    {n.von}{n.istBot && " ✦"}
                  </span>
                  <span className="text-[9px] font-mono text-mute">{n.zeit}</span>
                </div>
                <p className="text-[13px] leading-snug mt-0.5 whitespace-pre-wrap">{n.inhalt}</p>
                {n.tipps && n.tipps.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {n.tipps.map((t, i) => (
                      <li key={i} className="text-[11px]" style={{ color: "rgb(var(--accent))" }}>
                        → {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
          {botLaedt && (
            <li className="flex gap-2 flex-row-reverse">
              <div className="rounded-2xl px-3 py-1.5 surface-mute">
                <span className="text-[12px] text-soft italic">Lana denkt nach …</span>
              </div>
            </li>
          )}
          <div ref={listeEnde} />
        </ul>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); senden(); } }}
          placeholder="Nachricht … oder @lana <Frage> für KI-Hilfe"
          className="flex-1 surface-mute rounded-md px-3 py-2 text-[13px]"
        />
        <button
          type="button"
          onClick={senden}
          disabled={!eingabe.trim()}
          className="px-3 py-2 rounded-md text-[13px] font-medium transition-all"
          style={{
            background: "rgb(var(--accent) / 0.15)",
            color: "rgb(var(--accent))",
            boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.4)",
            opacity: eingabe.trim() ? 1 : 0.5,
          }}
        >
          ↵
        </button>
      </div>
      <p className="text-[10px] text-mute italic mt-2">
        @lana / @bot ruft die KI · sie liest die letzten 15 Nachrichten als Kontext · Antworten werden
        nicht persistent gespeichert (Phase 2: Supabase + DSGVO-Audit-Log).
      </p>
    </section>
  );
}
