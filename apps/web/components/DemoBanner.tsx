// Demo-Banner — wird angezeigt wenn NEXT_PUBLIC_DEMO_MODE=1.
// Macht für Besucher:innen sofort klar, dass sie Demo-Daten sehen
// und keine echten Patient:innen.

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "1") return null;

  return (
    <div
      className="text-[12px] px-4 py-2 text-center font-medium"
      style={{
        background: "linear-gradient(90deg, rgb(var(--mon) / 0.12), rgb(var(--vibe-team) / 0.12), rgb(var(--thu) / 0.12))",
        color: "rgb(var(--fg))",
        borderBottom: "1px solid rgb(var(--border-soft))",
      }}
      role="note"
      aria-label="Demo-Hinweis"
    >
      <span aria-hidden className="mr-1.5">●</span>
      <span className="font-semibold">DEMO</span>
      <span className="mx-2 text-soft">·</span>
      <span className="text-mute">
        Alle Personen, Klient:innen und Verordnungen sind frei erfunden.
        Keine echten Patientendaten.
      </span>
    </div>
  );
}
