"use client";

// Wählt die passenden Forms je nach Bett-Status (frei / belegt /
// blockiert / reserviert).

import { useState } from "react";
import {
  BettBelegenForm,
  BettEntlassenForm,
  BettVerlegenForm,
  BettBlockierenForm,
  BettFreigebenForm,
  BettReservierenForm,
  ReservierungStornierenForm,
} from "./BettAktionForm";
import type { Bett, Belegung, Reservierung } from "@/lib/station/betten-store";

type Aktion = "belegen" | "entlassen" | "verlegen" | "blockieren" | "freigeben" | "reservieren" | "storno-reservierung" | null;

export function BettAktionAccordion({
  bett,
  belegung,
  reservierung,
  stationId,
  zielBetten,
}: {
  bett: Bett;
  belegung: Belegung | null;
  reservierung: Reservierung | null;
  stationId: string;
  zielBetten: Array<{ id: string; label: string }>;
}) {
  const [aktion, setAktion] = useState<Aktion>(null);
  const bettLabel = `Z ${bett.zimmerNr} / Bett ${bett.bettNr}`;

  // Verfügbare Aktionen je Status
  const verfuegbar: { key: Exclude<Aktion, null>; label: string; farbe: string }[] = bett.istBlockiert
    ? [{ key: "freigeben", label: "Freigeben", farbe: "var(--thu)" }]
    : belegung
      ? [
          { key: "verlegen",   label: "Verlegen",   farbe: "var(--vibe-stats)" },
          { key: "entlassen",  label: "Entlassen",  farbe: "var(--vibe-team)" },
        ]
      : reservierung
        ? [
            { key: "belegen",              label: "Reservierung einlösen", farbe: "var(--thu)" },
            { key: "storno-reservierung",  label: "Reservierung stornieren", farbe: "var(--vibe-team)" },
          ]
        : [
            { key: "belegen",    label: "Aufnehmen",   farbe: "var(--thu)" },
            { key: "reservieren", label: "Reservieren", farbe: "var(--sun)" },
            { key: "blockieren", label: "Blockieren",  farbe: "var(--vibe-approval)" },
          ];

  const close = () => setAktion(null);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {verfuegbar.map((a) => (
          <button
            key={a.key} type="button"
            onClick={() => setAktion(aktion === a.key ? null : a.key)}
            className="text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors"
            style={{
              background: aktion === a.key ? `rgb(${a.farbe})` : `rgb(${a.farbe} / 0.12)`,
              color:      aktion === a.key ? "white" : `rgb(${a.farbe})`,
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aktion === "belegen" && (
        <BettBelegenForm bettId={bett.id} stationId={stationId} bettLabel={bettLabel} onDone={close} />
      )}
      {aktion === "reservieren" && (
        <BettReservierenForm bettId={bett.id} stationId={stationId} bettLabel={bettLabel} onDone={close} />
      )}
      {aktion === "entlassen" && belegung && (
        <BettEntlassenForm bettId={bett.id} stationId={stationId} bettLabel={bettLabel} klientName={belegung.klientName} onDone={close} />
      )}
      {aktion === "verlegen" && belegung && (
        <BettVerlegenForm
          bettId={bett.id} stationId={stationId} bettLabel={bettLabel}
          klientName={belegung.klientName} zielBetten={zielBetten}
          onDone={close}
        />
      )}
      {aktion === "blockieren" && (
        <BettBlockierenForm bettId={bett.id} stationId={stationId} bettLabel={bettLabel} onDone={close} />
      )}
      {aktion === "freigeben" && (
        <BettFreigebenForm bettId={bett.id} stationId={stationId} bettLabel={bettLabel} onDone={close} />
      )}
      {aktion === "storno-reservierung" && reservierung && (
        <ReservierungStornierenForm
          bettId={bett.id} stationId={stationId} bettLabel={bettLabel}
          reservierungId={reservierung.id} klientLabel={reservierung.klientName}
          onDone={close}
        />
      )}
    </div>
  );
}
