"use client";

// Globale Live-Region · zentraler Punkt für Screenreader-Ansagen.
//
// Jede Komponente, die "etwas hat passieren wahrgenommen" werden soll,
// kann via Custom-Event `shalem:announce` einen Text reinschicken — die
// Region rendert ihn unsichtbar in `aria-live`, Screenreader liest vor.
// Auch nicht-blinde User können das im Profil als Vorlese-Layer aktiv-
// schalten (PreferencesPanel · Audio-Toggle existiert).
//
// Verwendung in beliebiger Component:
//   import { announce } from "@/components/GlobalLiveRegion";
//   announce("Krankmeldung gespeichert. Vertretung wird gesucht.");
//   announce("Notruf wird ausgelöst.", "assertive");

import { useEffect, useState } from "react";

type Stufe = "polite" | "assertive";

declare global {
  interface WindowEventMap {
    "shalem:announce": CustomEvent<{ text: string; stufe: Stufe }>;
  }
}

export function announce(text: string, stufe: Stufe = "polite") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("shalem:announce", { detail: { text, stufe } }));
}

export function GlobalLiveRegion() {
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");

  useEffect(() => {
    const handler = (e: CustomEvent<{ text: string; stufe: Stufe }>) => {
      const { text, stufe } = e.detail;
      // kurz löschen damit gleicher Text wieder vorgelesen wird
      if (stufe === "assertive") {
        setAssertive("");
        setTimeout(() => setAssertive(text), 30);
      } else {
        setPolite("");
        setTimeout(() => setPolite(text), 30);
      }
    };
    window.addEventListener("shalem:announce", handler as EventListener);
    return () => window.removeEventListener("shalem:announce", handler as EventListener);
  }, []);

  // Zwei separate Regionen — assertive für Notruf/Alarm, polite für Status
  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {polite}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertive}
      </div>
    </>
  );
}
