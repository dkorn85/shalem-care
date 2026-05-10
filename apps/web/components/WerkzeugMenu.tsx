"use client";

// Zentrales Werkzeuge-Menü · ein FAB rechts unten · klappt nach oben aus.
//
// Bündelt was vorher als gestapelte FABs am rechten Rand schwirrte:
//  · 🔎 Suche (öffnet Cmd-K via Custom-Event)
//  · ◯ Brillenmodus
//  · 🔔 Benachrichtigungen
//  · 🔊 Sound
//  · 🎮 Game-Mode
//
// Klick auf den FAB öffnet eine kompakte, glasige Karte mit allen
// Toggles als Inline-Reihen (Icon + Label + Toggle-Button rechts).
// Click outside schließt. Esc schließt.

import { useEffect, useRef, useState } from "react";
import { Brillenmodus } from "./Brillenmodus";
import { GameModeToggle } from "./GameModeToggle";
import { SoundToggle } from "./SoundToggle";
import { NotifyToggle } from "./notify/NotifyToggle";

export function WerkzeugMenu({
  beruf,
  rolePrimaer,
  roleLabel,
  identityId,
  rolle,
  stationId,
  einrichtungId,
}: {
  beruf:        string;
  rolePrimaer:  string;
  roleLabel:    string;
  identityId?:  string;
  rolle?:       string;
  stationId?:   string;
  einrichtungId?: string;
}) {
  const [offen, setOffen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Click outside + Esc
  useEffect(() => {
    if (!offen) return;
    function onDoc(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOffen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOffen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [offen]);

  function oeffneCmdK() {
    setOffen(false);
    // Cmd-K hört auf den Hotkey ⌘K, simuliere via KeyboardEvent
    setTimeout(() => {
      const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
      window.dispatchEvent(ev);
    }, 50);
  }

  return (
    <>
      {/* Brillenmodus rendert nicht nur den Trigger, sondern auch sein eigenes
          fixed-Modal (Eingabe-Panel) — das soll außerhalb des Menüs leben.
          Im embedded-Mode hat es nur einen kompakten Button. */}
      <div ref={panelRef} className="fixed right-4 bottom-20 lg:bottom-6 z-40 no-print">
        {/* FAB · zentraler Werkzeuge-Trigger */}
        <button
          type="button"
          onClick={() => setOffen((v) => !v)}
          aria-label="Werkzeuge-Menü"
          aria-expanded={offen}
          className="w-12 h-12 rounded-full grid place-items-center transition-all hover:scale-105 active:scale-95 ml-auto"
          style={{
            background: offen
              ? `linear-gradient(135deg, rgb(${rolePrimaer}), rgb(var(--accent)))`
              : "rgb(var(--bg-elev))",
            color: offen ? "white" : `rgb(${rolePrimaer})`,
            boxShadow: offen
              ? `0 8px 24px rgb(${rolePrimaer} / 0.4)`
              : `0 4px 12px rgb(0 0 0 / 0.12), inset 0 0 0 1.5px rgb(${rolePrimaer} / 0.35)`,
          }}
        >
          <span aria-hidden style={{ fontSize: "20px", lineHeight: 1 }}>{offen ? "✕" : "⚙"}</span>
        </button>

        {/* Panel · klappt nach oben auf */}
        {offen && (
          <div
            className="absolute bottom-14 right-0 w-[280px] rounded-2xl overflow-hidden anim-toast-in"
            style={{
              background: "rgb(var(--bg-elev) / 0.96)",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              boxShadow: "0 16px 40px rgb(0 0 0 / 0.18), 0 0 0 1px rgb(var(--border-soft))",
            }}
          >
            <header className="px-3 pt-2.5 pb-1">
              <p className="text-[9px] uppercase tracking-wider font-mono font-medium text-soft">
                Werkzeuge · {roleLabel}
              </p>
            </header>

            <ul className="px-1 pb-1 space-y-0.5">
              {/* Suche */}
              <li>
                <button
                  type="button"
                  onClick={oeffneCmdK}
                  className="w-full px-2 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-[rgb(var(--bg-mute))] transition-colors text-left"
                >
                  <span aria-hidden className="text-[16px] w-9 text-center">🔎</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium leading-tight">Suchen</p>
                    <p className="text-[10px] text-soft font-mono leading-tight">⌘K · alle Cockpits + Inhalte</p>
                  </div>
                  <kbd className="font-mono text-[9px] px-1 py-0.5 rounded bg-[rgb(var(--bg-mute))] text-mute">⌘K</kbd>
                </button>
              </li>

              {/* Brillenmodus */}
              <li className="px-2 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-[rgb(var(--bg-mute))] transition-colors">
                <Brillenmodus
                  beruf={beruf}
                  rolePrimaer={rolePrimaer}
                  roleLabel={roleLabel}
                  embedded
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium leading-tight">Brillenmodus</p>
                  <p className="text-[10px] text-soft font-mono leading-tight">KI-Klartext · Begriff erklären</p>
                </div>
              </li>

              {/* Benachrichtigungen */}
              <li className="px-2 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-[rgb(var(--bg-mute))] transition-colors">
                <NotifyToggle identityId={identityId} rolle={rolle} stationId={stationId} einrichtungId={einrichtungId} embedded />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium leading-tight">Benachrichtigungen</p>
                  <p className="text-[10px] text-soft font-mono leading-tight">aus · in-App · OS-Push</p>
                </div>
              </li>

              {/* Sound */}
              <li className="px-2 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-[rgb(var(--bg-mute))] transition-colors">
                <SoundToggle embedded />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium leading-tight">Sound</p>
                  <p className="text-[10px] text-soft font-mono leading-tight">an/aus · Long-Press → Lautstärke</p>
                </div>
              </li>

              {/* Game-Mode */}
              <li className="px-2 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-[rgb(var(--bg-mute))] transition-colors">
                <GameModeToggle embedded />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium leading-tight">Game-Mode</p>
                  <p className="text-[10px] text-soft font-mono leading-tight">Mini-Games auf Cockpits</p>
                </div>
              </li>
            </ul>

            <footer className="px-3 py-1.5 text-[9px] text-soft font-mono" style={{ borderTop: "1px solid rgb(var(--bg-mute))" }}>
              Tipp: Esc oder Click outside schließt.
            </footer>
          </div>
        )}
      </div>
    </>
  );
}
