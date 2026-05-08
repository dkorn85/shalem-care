"use client";

// Wrapper · zeigt children NUR wenn Game-Mode aktiv ist.
// Vor Mount: nichts rendern (sonst Hydration-Mismatch).

import type { ReactNode } from "react";
import { useGameMode } from "@/lib/ui/game-mode";

export function GameModeOnly({ children }: { children: ReactNode }) {
  const { aktiv, mounted } = useGameMode();
  if (!mounted) return null;
  if (!aktiv) return null;
  return <>{children}</>;
}

// Optional umgekehrt: wenn man eine "klassisch"-Kachel zeigen will nur wenn aus
export function ClassicOnly({ children }: { children: ReactNode }) {
  const { aktiv, mounted } = useGameMode();
  if (!mounted) return null;
  if (aktiv) return null;
  return <>{children}</>;
}
