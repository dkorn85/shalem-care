"use client";

// AnomalieEinSatz · "Wie geht's Mama heute?" — ein einziger Satz Antwort.
// Mechanik: Ambient Reassurance. Standard ist Beruhigung, nur bei echter
// Auffälligkeit kommt ein zweiter Satz oder anderer Ton.

import { useEffect, useState } from "react";

type Ergebnis = {
  satz: string;
  tendenz: "ruhig" | "leicht_anders" | "auffaellig";
  ereignisseHeute: number;
  ereignisseSchnitt: number;
  voice: "lana";
  kostenEur: number;
  tokens: { input: number; output: number };
};

const TENDENZ_FARBE: Record<Ergebnis["tendenz"], string> = {
  ruhig: "var(--thu)",
  leicht_anders: "var(--wed)",
  auffaellig: "var(--sat)",
};

const TENDENZ_LABEL: Record<Ergebnis["tendenz"], string> = {
  ruhig: "ruhig",
  leicht_anders: "leichte Veränderung",
  auffaellig: "Pflegeteam ansprechen",
};

type Props = {
  klientId: string;
  klientName: string;
  autoLoad?: boolean;
};

export function AnomalieEinSatz({ klientId, klientName, autoLoad = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function laden() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/anomalie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ klientId, klientName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setErgebnis(data as Ergebnis);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoLoad) laden();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  const farbe = ergebnis ? TENDENZ_FARBE[ergebnis.tendenz] : "var(--accent)";

  return (
    <div
      className="surface rounded-2xl p-4 sm:p-5 relative overflow-hidden"
      style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}
    >
      <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2 flex items-baseline justify-between gap-2 flex-wrap">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium">
          Wie geht es {klientName.split(" ")[0]} heute?
        </p>
        {ergebnis && (
          <span className="text-[10px] font-medium" style={{ color: `rgb(${farbe})` }}>
            {TENDENZ_LABEL[ergebnis.tendenz]} · {ergebnis.ereignisseHeute}/{ergebnis.ereignisseSchnitt} Ø
          </span>
        )}
      </div>

      {!ergebnis && !loading && !error && (
        <button
          type="button"
          onClick={laden}
          className="mt-2 text-[13px] px-3 py-1.5 rounded-md transition-all"
          style={{ color: `rgb(${farbe})`, boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.4)` }}
        >
          ✦ In einem Satz nachschauen
        </button>
      )}

      {loading && <p className="text-[13px] text-soft italic mt-1.5 ml-0.5">Lana schaut nach …</p>}

      {error && <p className="text-[12px] text-soft italic mt-1.5">{error}</p>}

      {ergebnis && (
        <p className="text-[15px] leading-relaxed mt-2 ml-0.5" style={{ color: ergebnis.tendenz === "auffaellig" ? `rgb(${farbe})` : undefined }}>
          {ergebnis.satz}
        </p>
      )}

      {ergebnis && (
        <button
          type="button"
          onClick={laden}
          className="mt-2 text-[10px] text-mute underline-offset-2 hover:underline"
        >
          neu nachschauen
        </button>
      )}
    </div>
  );
}
