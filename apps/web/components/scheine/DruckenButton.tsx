"use client";

// Triggert window.print() — die Druck-Stylesheet in globals.css übernimmt
// das Layout (nur Schein/Bescheid sichtbar, Sidebar/FABs ausgeblendet).

export function DruckenButton({ label = "🖨 Drucken" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-[12px] px-3 py-1.5 rounded-md font-medium transition-colors"
      style={{
        background: "rgb(var(--bg-mute))",
        color: "rgb(var(--fg-mute))",
        boxShadow: "inset 0 0 0 1px rgb(var(--border-soft))",
      }}
    >
      {label}
    </button>
  );
}
