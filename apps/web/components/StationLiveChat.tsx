"use client";

// StationLiveChat · gemeinsamer Klient-Chat aller anwesenden Berufe.
// Phase-1: Polling alle 5 Sek auf neue Nachrichten. Phase-2: Supabase
// Realtime Channel `cockpit:<klientId>`.

import { useEffect, useRef, useState, useTransition } from "react";
import { postNachricht, reagiere } from "@/lib/station-cockpit/actions";
import type { CockpitNachricht } from "@/lib/station-cockpit/store";
import type { Berufsfeld } from "@/lib/team-um-klient/store";
import { announce } from "@/components/GlobalLiveRegion";

const BERUF_FARBE: Record<Berufsfeld, string> = {
  pflege: "var(--mon)", arzt: "var(--vibe-profile)", therapie: "var(--fri)",
  sozialarbeit: "var(--tue)", heilerziehung: "var(--sat)", ehrenamt: "var(--thu)",
  hauswirtschaft: "var(--sun)", klient: "var(--wed)", angehoerig: "var(--vibe-stats)",
  lead: "var(--vibe-team)",
};

const REAKTIONS_EMOJIS = ["👍", "❤️", "🙏", "👀"];

export function StationLiveChat({
  klientId, klientName, viewerPersonId, viewerName, viewerBeruf,
  initialNachrichten,
}: {
  klientId: string;
  klientName: string;
  viewerPersonId: string;
  viewerName: string;
  viewerBeruf: Berufsfeld;
  initialNachrichten: CockpitNachricht[];
}) {
  const [nachrichten, setNachrichten] = useState(initialNachrichten);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [fehler, setFehler] = useState<string | null>(null);
  const endRef = useRef<HTMLLIElement | null>(null);

  // Auto-Scroll bei neuen Nachrichten
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [nachrichten.length]);

  // Polling alle 5 Sek auf neue Nachrichten
  useEffect(() => {
    const sinceISO = nachrichten.at(-1)?.zeitstempel ?? new Date(0).toISOString();
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/station/messages?klientId=${encodeURIComponent(klientId)}&since=${encodeURIComponent(sinceISO)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setNachrichten((alt) => {
            // de-dupe per id
            const ids = new Set(alt.map((n) => n.id));
            const neu = data.messages.filter((n: CockpitNachricht) => !ids.has(n.id));
            if (neu.length === 0) return alt;
            announce(`${neu.length} neue Nachricht${neu.length === 1 ? "" : "en"} im Cockpit von ${klientName}`, "polite");
            return [...alt, ...neu];
          });
        }
      } catch {}
    }, 5000);
    return () => clearInterval(id);
  }, [klientId, klientName, nachrichten]);

  const senden = () => {
    if (!text.trim()) return;
    setFehler(null);
    const aktuell = text.trim();
    setText("");
    start(async () => {
      const r = await postNachricht({
        klientId, vonPersonId: viewerPersonId, vonName: viewerName, vonBeruf: viewerBeruf, text: aktuell,
      });
      if (!r.ok) {
        setFehler(r.error);
        setText(aktuell);
      } else {
        setNachrichten((alt) => [...alt, r.nachricht]);
      }
    });
  };

  const reagiereAuf = (nachrichtId: string, emoji: string) => {
    start(async () => {
      await reagiere(klientId, nachrichtId, emoji, viewerPersonId);
      // Optimistisch updaten: Reaktion lokal toggeln
      setNachrichten((alt) =>
        alt.map((n) => {
          if (n.id !== nachrichtId) return n;
          const reaktionen = n.reaktionen ?? [];
          const idx = reaktionen.findIndex((r) => r.emoji === emoji && r.vonPersonId === viewerPersonId);
          if (idx >= 0) {
            return { ...n, reaktionen: reaktionen.filter((_, i) => i !== idx) };
          } else {
            return { ...n, reaktionen: [...reaktionen, { emoji, vonPersonId: viewerPersonId }] };
          }
        }),
      );
    });
  };

  return (
    <section className="surface rounded-2xl p-4 flex flex-col" style={{ minHeight: "420px", maxHeight: "70vh" }} aria-label={`Live-Chat zu ${klientName}`}>
      <header className="flex items-baseline justify-between gap-2 flex-wrap mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Live-Chat · {klientName}</p>
          <p className="text-[12px] text-mute">Alle anwesenden Berufe schreiben in einen Faden. Polling 5 Sek · Phase-2 Realtime.</p>
        </div>
        <span className="chip text-[11px]" style={{ background: `rgb(${BERUF_FARBE[viewerBeruf]} / 0.15)`, color: `rgb(${BERUF_FARBE[viewerBeruf]})` }}>
          du · {viewerBeruf}
        </span>
      </header>

      <ul className="flex-1 overflow-y-auto space-y-2.5 pr-1" role="log" aria-live="polite">
        {nachrichten.map((n) => {
          const farbe = BERUF_FARBE[n.vonBeruf];
          const eigenes = n.vonPersonId === viewerPersonId;
          return (
            <li
              key={n.id}
              className="rounded-xl p-3 relative overflow-hidden"
              style={{
                background: eigenes ? `rgb(${farbe} / 0.08)` : "rgb(var(--bg-mute))",
                marginLeft: eigenes ? "8%" : "0",
                marginRight: eigenes ? "0" : "8%",
              }}
            >
              <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full" style={{ background: `rgb(${farbe})` }} />
              <div className="ml-2">
                <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                  <span className="text-[12px] font-medium" style={{ color: `rgb(${farbe})` }}>{n.vonName}</span>
                  <span className="text-[10px] text-soft uppercase tracking-wider">{n.vonBeruf}</span>
                  <span className="text-[10px] text-soft font-mono ml-auto">{new Date(n.zeitstempel).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-[14px] leading-relaxed">{n.text}</p>
                {n.anhang?.typ === "foto" && n.anhang.url && (
                  <div className="mt-2 surface rounded-md overflow-hidden inline-block max-w-xs">
                    <img src={n.anhang.url} alt={n.anhang.titel ?? ""} className="block max-w-full h-auto" />
                    {n.anhang.titel && <p className="text-[11px] text-mute px-2 py-1">{n.anhang.titel}</p>}
                  </div>
                )}
                {n.anhang?.typ === "vital" && (
                  <span className="chip text-[10px] mt-1.5 inline-flex" style={{ background: `rgb(${farbe} / 0.12)`, color: `rgb(${farbe})` }}>
                    {n.anhang.titel ?? "Vitalwert"} {n.anhang.meta ? `· ${Object.entries(n.anhang.meta).map(([k, v]) => `${k}: ${v}`).join(", ")}` : ""}
                  </span>
                )}
                {n.anhang?.typ === "ki_vorschlag" && (
                  <p className="text-[12px] mt-1.5 italic" style={{ color: "rgb(var(--accent))" }}>
                    ✦ KI-Vorschlag: {n.anhang.titel}
                  </p>
                )}
                {/* Reaktionen */}
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {(n.reaktionen ?? []).reduce((acc, r) => {
                    const e = acc.find((x) => x.emoji === r.emoji);
                    if (e) e.count++;
                    else acc.push({ emoji: r.emoji, count: 1 });
                    return acc;
                  }, [] as { emoji: string; count: number }[]).map((g) => (
                    <span key={g.emoji} className="text-[11px] px-1.5 py-0.5 rounded surface-mute">{g.emoji} {g.count}</span>
                  ))}
                  <details className="ml-auto">
                    <summary className="text-[10px] text-soft cursor-pointer hover:text-[rgb(var(--fg))]">+ reagieren</summary>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {REAKTIONS_EMOJIS.map((e) => (
                        <button
                          key={e}
                          onClick={() => reagiereAuf(n.id, e)}
                          className="text-[14px] px-1.5 py-0.5 rounded surface-mute hover:bg-app-elev"
                          aria-label={`Mit ${e} reagieren`}
                        >{e}</button>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </li>
          );
        })}
        <li ref={endRef} aria-hidden />
      </ul>

      {/* Composer */}
      <div className="mt-3 flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) senden(); }}
          rows={2}
          placeholder={`Schreib was zu ${klientName} … (⌘/Ctrl+Enter)`}
          className="textarea text-[13px] flex-1 resize-none"
          disabled={pending}
          aria-label="Neue Chat-Nachricht"
        />
        <button
          onClick={senden}
          disabled={pending || !text.trim()}
          className="text-[12px] px-4 py-2 rounded-md self-end"
          style={{ background: `rgb(${BERUF_FARBE[viewerBeruf]})`, color: "white", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "…" : "Senden"}
        </button>
      </div>
      {fehler && <p className="text-[11px] mt-1.5" style={{ color: "rgb(var(--mon))" }}>{fehler}</p>}
    </section>
  );
}
