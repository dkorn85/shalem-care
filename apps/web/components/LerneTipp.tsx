"use client";

import type { ReactNode } from "react";
import { NurBeiLerne } from "./ExpertiseGate";
import type { ExpertiseRolle } from "@/lib/ui/expertise";

// Kurzer Hilfe-Banner · nur sichtbar, wenn Expertise-Level "lerne" ist.
// Stiller Begleiter für Auszubildende / Casual-User.

export function LerneTipp({
  rolle,
  titel,
  children,
}: {
  rolle: ExpertiseRolle;
  titel?: string;
  children: ReactNode;
}) {
  return (
    <NurBeiLerne rolle={rolle}>
      <aside
        className="surface rounded-xl p-3 mb-4 text-[12px] leading-relaxed"
        style={{
          background: "rgb(var(--vibe-approval) / 0.07)",
          boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)",
        }}
        aria-label="Lern-Hinweis"
      >
        <p
          className="font-mono text-[10px] uppercase tracking-wider mb-1.5"
          style={{ color: "rgb(var(--vibe-approval))" }}
        >
          ◯ Lern-Tipp · {titel ?? "Was bedeutet das?"}
        </p>
        <div className="text-mute">{children}</div>
      </aside>
    </NurBeiLerne>
  );
}
