"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: "6px 14px",
        background: "white",
        color: "black",
        border: "none",
        borderRadius: 4,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      🖨 Drucken / als PDF speichern
    </button>
  );
}
