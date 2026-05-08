"use client";

// Game-Mode-Toggle · kompaktes Floater-Switch unter dem Brillenmodus-FAB.
//
// Spielsymbol 🎮 · ein Klick aktiviert/deaktiviert. Bei Aktivierung kurz
// Toast „Game-Mode an · Mini-Games erscheinen auf den Cockpits".

import { useState } from "react";
import { useGameMode } from "@/lib/ui/game-mode";

export function GameModeToggle() {
  const { aktiv, toggle, mounted } = useGameMode();
  const [toast, setToast] = useState<string | null>(null);

  if (!mounted) return null;

  function handleClick() {
    toggle();
    setToast(aktiv ? "Game-Mode aus" : "🎮 Game-Mode an · Mini-Games sind auf den Cockpits sichtbar");
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={aktiv ? "Game-Mode aus" : "Game-Mode an"}
        title={aktiv ? "Game-Mode aus" : "Game-Mode an · Mini-Games erscheinen"}
        className="fixed right-4 bottom-36 lg:bottom-22 z-40 w-10 h-10 rounded-full grid place-items-center transition-all hover:scale-105 active:scale-95"
        style={{
          background: aktiv ? "rgb(var(--vibe-stats))" : "rgb(var(--bg-elev))",
          color: aktiv ? "white" : "rgb(var(--fg-mute))",
          boxShadow: aktiv
            ? "0 6px 20px rgb(var(--vibe-stats) / 0.4)"
            : "0 2px 8px rgb(0 0 0 / 0.08), inset 0 0 0 1px rgb(var(--border-soft))",
        }}
      >
        <span aria-hidden style={{ fontSize: "16px" }}>🎮</span>
      </button>

      {toast && (
        <div
          className="fixed left-1/2 bottom-44 lg:bottom-28 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl text-[13px] font-medium pointer-events-none"
          style={{
            background: "rgb(var(--bg-elev))",
            color: "rgb(var(--fg))",
            boxShadow: "0 6px 24px rgb(0 0 0 / 0.15), 0 0 0 1px rgb(var(--vibe-stats) / 0.4)",
            animation: "gameToast 2.2s ease-out forwards",
            maxWidth: "min(90vw, 360px)",
            textAlign: "center",
          }}
        >
          {toast}
          <style>{`
            @keyframes gameToast {
              0% { opacity: 0; transform: translate(-50%, 8px); }
              15% { opacity: 1; transform: translate(-50%, 0); }
              85% { opacity: 1; transform: translate(-50%, 0); }
              100% { opacity: 0; transform: translate(-50%, -8px); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
