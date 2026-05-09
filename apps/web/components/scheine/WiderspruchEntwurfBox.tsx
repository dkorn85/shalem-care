"use client";

// Lana-Editor für Widerspruchs-Brief — bei abgelehnten Vorgängen.
// Klient:in kann optional persönliche Sicht reinschreiben, KI baut
// Begründung daraus, beides landet im WiderspruchBrief darunter.

import { useState, useTransition } from "react";
import { generiereWiderspruch } from "@/lib/kasse/widerspruch-ki";
import { spiele } from "@/lib/sound/sound-player";
import { WiderspruchBrief, type WiderspruchBriefDaten } from "./WiderspruchBrief";
import { DruckenButton } from "./DruckenButton";
import type { KassenVorgang } from "@/lib/kostentraeger/types";

const KASSEN_ADRESSE: Record<string, string> = {
  "100000031": "Wilhelmstraße 1\n10963 Berlin",
  "101575519": "Bramfelder Straße 140\n22305 Hamburg",
};

export function WiderspruchEntwurfBox({
  vorgang,
  klientName,
  klientAnrede,
  klientAnschrift,
  ortAusstellung,
}: {
  vorgang: KassenVorgang;
  klientName: string;
  klientAnrede: "Frau" | "Herr";
  klientAnschrift: string;
  ortAusstellung?: string;
}) {
  const [statement, setStatement] = useState("");
  const [entwurf, setEntwurf] = useState<{ begruendung: string; argumente: string[]; source: "ki" | "heuristik" } | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function vorschlagen() {
    setFehler(null);
    startTransition(async () => {
      const r = await generiereWiderspruch({ vorgang, klientStatement: statement.trim() || undefined });
      if (r.ok) {
        spiele("lana");
        setEntwurf({ begruendung: r.entwurf.begruendung, argumente: r.entwurf.argumente, source: r.source });
      } else {
        spiele("fehler");
        setFehler(r.error);
      }
    });
  }

  const briefDaten: WiderspruchBriefDaten | null = entwurf
    ? {
        absenderAnrede: klientAnrede,
        absenderName: klientName,
        absenderAnschrift: klientAnschrift,
        versichertenNr: vorgang.versichertenNr,
        kassenName: vorgang.kassenName,
        kassenAdresse: KASSEN_ADRESSE[vorgang.ikNummer] ?? "Krankenkassen-Hauptverwaltung",
        ikNummer: vorgang.ikNummer,
        bezugAktenzeichen: vorgang.id.toUpperCase(),
        bezugDatum: deDatum(vorgang.bearbeitetAm ?? vorgang.eingegangenAm),
        bezugLeistung: vorgang.beschreibung,
        ausstellungsDatum: deDatum(new Date().toISOString()),
        ortAusstellung: ortAusstellung,
        begruendung: entwurf.begruendung,
        fristverlaengerung: !statement.trim(),
      }
    : null;

  return (
    <section className="space-y-4">
      <div className="surface rounded-2xl p-4" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
        <header className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
          <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>
            ✦ Lana hilft beim Widerspruch
          </p>
          {entwurf && (
            <span className="text-[10px] font-mono text-soft">
              {entwurf.source === "ki" ? "KI-Entwurf" : "Standard-Vorlage (KI offline)"}
            </span>
          )}
        </header>

        <p className="text-[12px] text-mute leading-relaxed mb-3">
          Du musst <strong>nichts</strong> begründen — der Widerspruch ist auch ohne Begründung
          gültig. Wenn du aber kurz aufschreibst, was du anders siehst, baut Lana daraus eine
          formelle Begründung. Du polierst, Lana macht den Brief.
        </p>

        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-soft font-medium">
            Was siehst du anders? (optional, frei)
          </span>
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={4}
            placeholder="z.B. ‚Ich kann die Wundversorgung nicht selbst machen — ich sehe sie nicht und habe niemanden, der mir hilft.'"
            className="mt-1 w-full rounded-lg border border-app-soft p-2.5 text-[13px] resize-y bg-[rgb(var(--bg))]"
          />
        </label>

        <div className="mt-3 flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={vorschlagen}
            disabled={pending}
            className="text-[12px] px-3 py-1.5 rounded-md font-medium"
            style={{
              background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--accent))",
              color: pending ? "rgb(var(--fg-mute))" : "white",
            }}
          >
            {pending ? "Lana denkt …" : entwurf ? "Neu vorschlagen" : "Widerspruch entwerfen ✦"}
          </button>
          {entwurf && <DruckenButton label="🖨 Widerspruch drucken" />}
        </div>

        {fehler && (
          <p className="text-[11px] mt-2" style={{ color: "rgb(var(--mon))" }}>
            Lana konnte gerade nicht antworten — {fehler}
          </p>
        )}
      </div>

      {/* Argumente-Liste · zum Polieren */}
      {entwurf && entwurf.argumente.length > 0 && (
        <div className="surface rounded-2xl p-4 no-print">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
            Argumente — die Lana nutzt
          </p>
          <ul className="space-y-1">
            {entwurf.argumente.map((a, i) => (
              <li key={i} className="text-[12px] flex gap-2 items-baseline">
                <span className="font-mono text-[10px] shrink-0 text-soft">{i + 1}.</span>
                <span className="leading-snug">{a}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-soft mt-2 italic">
            Wenn ein Argument für dich nicht passt: einfach im Statement oben schreiben „Argument
            X bitte rauslassen" und nochmal entwerfen.
          </p>
        </div>
      )}

      {/* Brief-Vorschau */}
      {briefDaten && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-mono mb-2 no-print">
            Brief-Vorschau · druckbereit
          </p>
          <WiderspruchBrief daten={briefDaten} />
        </div>
      )}
    </section>
  );
}

function deDatum(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
