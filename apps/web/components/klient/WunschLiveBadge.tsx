"use client";

// Realtime-Badge für die Wunsch-Spiegel in den Profi-Cockpits.
//
// Hört auf den klient_wunsch-Channel und zeigt einen kleinen
// Live-Indikator. Bei einer Änderung blinkt es kurz auf und triggert
// router.refresh() — damit der Spiegel auf der Server-Seite neu lädt.
//
// Bewusst kein vollwertiger Toast — der Werkzeuge-Menü-Stil bleibt
// minimalistisch.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeWunschChannel, type WunschEvent } from "@/lib/realtime/wunsch-channel";

export function WunschLiveBadge({ klientId }: { klientId: string }) {
  const router = useRouter();
  const [letzterEvent, setLetzterEvent] = useState<WunschEvent | null>(null);
  const [blinkt, setBlinkt] = useState(false);
  const [verbunden, setVerbunden] = useState(false);

  useEffect(() => {
    const unsub = subscribeWunschChannel(klientId, (event) => {
      setLetzterEvent(event);
      setBlinkt(true);
      window.setTimeout(() => setBlinkt(false), 2400);
      // Hard refresh der Server-Komponente, damit der Spiegel die neuen Werte zieht
      router.refresh();
    });
    setVerbunden(true);
    return () => {
      unsub();
      setVerbunden(false);
    };
  }, [klientId, router]);

  if (!verbunden) return null;

  return (
    <div
      className="inline-flex items-baseline gap-1.5 text-[10px] font-mono"
      title={letzterEvent ? `Letzte Änderung: ${letzterEvent.eventType} ${letzterEvent.new?.termin_id ?? letzterEvent.old?.termin_id ?? ""}` : "Live verbunden"}
    >
      <span
        aria-hidden
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{
          background: blinkt ? "rgb(var(--accent))" : "rgb(var(--thu))",
          boxShadow:  blinkt ? "0 0 6px rgb(var(--accent))" : "none",
          transition: "background 0.3s, box-shadow 0.3s",
        }}
      />
      <span className="text-soft">{blinkt ? "neue Änderung" : "live"}</span>
    </div>
  );
}
