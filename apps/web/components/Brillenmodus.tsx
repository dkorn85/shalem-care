"use client";

// Brillenmodus · Multi-Tool-Floater zur KI-Erklärung beliebiger Begriffe.
//
// Aktivierung: Toggle rechts unten (FAB). Wenn aktiv, erscheint das
// Eingabe-Panel mit dem aktuell markierten Text vorausgefüllt — der User
// kann auch jeden eigenen Text reinschreiben.
// Submit → POST /api/ai/klartext mit beruf-Kontext der aktuellen Cockpit-
// Rolle → 3-5-Sätze-Erklärung + Glossar + Rückfragen.
//
// Persistenz: localStorage("shalem.brillenmodus") = "an" | "aus".

import { useEffect, useRef, useState } from "react";

type Ergebnis = {
  klartext: string;
  glossar: { fach: string; klar: string }[];
  rueckfragen: string[];
  voice: "lana" | "dennis";
  kostenEur: number;
  tokens: { input: number; output: number };
};

export function Brillenmodus({
  beruf,
  rolePrimaer,
  roleLabel,
  embedded = false,
}: {
  beruf: string;
  rolePrimaer: string;
  roleLabel: string;
  embedded?: boolean;
}) {
  const [aktiv, setAktiv] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const v = localStorage.getItem("shalem.brillenmodus");
    setAktiv(v === "an");
  }, []);

  useEffect(() => {
    if (!open) return;
    const sel = typeof window !== "undefined" ? window.getSelection?.()?.toString().trim() : "";
    if (sel) setText(sel);
    requestAnimationFrame(() => inputRef.current?.focus());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function toggleAktiv() {
    const next = !aktiv;
    setAktiv(next);
    localStorage.setItem("shalem.brillenmodus", next ? "an" : "aus");
    if (next) setOpen(true);
    else setOpen(false);
  }

  async function frageNach() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setErgebnis(null);
    try {
      const res = await fetch("/api/ai/klartext", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beruf,
          fachtext: text.trim(),
        }),
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

  if (!aktiv && !open) {
    // FAB nur — minimaler Footprint
    return (
      <button
        onClick={toggleAktiv}
        aria-label="Brillenmodus aktivieren · KI-Klartext für jeden Begriff"
        className={
          embedded
            ? "w-9 h-9 rounded-full grid place-items-center transition-all hover:scale-105 active:scale-95 shrink-0"
            : "fixed right-4 bottom-20 lg:bottom-6 z-40 w-12 h-12 rounded-full grid place-items-center transition-all hover:scale-105 active:scale-95"
        }
        style={{
          background: "rgb(var(--bg-elev))",
          color: `rgb(${rolePrimaer})`,
          boxShadow: `0 4px 12px rgb(${rolePrimaer} / 0.25), inset 0 0 0 1.5px rgb(${rolePrimaer} / 0.4)`,
        }}
      >
        <BrilleIcon />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => (open ? setOpen(false) : setOpen(true))}
        aria-label={open ? "Brillenmodus-Panel schließen" : "Brillenmodus-Panel öffnen"}
        className={
          embedded
            ? "w-9 h-9 rounded-full grid place-items-center transition-all hover:scale-105 active:scale-95 shrink-0"
            : "fixed right-4 bottom-20 lg:bottom-6 z-40 w-12 h-12 rounded-full grid place-items-center transition-all hover:scale-105 active:scale-95"
        }
        style={{
          background: `rgb(${rolePrimaer})`,
          color: "white",
          boxShadow: `0 6px 20px rgb(${rolePrimaer} / 0.45)`,
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <BrilleIcon />
        )}
      </button>

      {open && (
        <div
          className="fixed right-3 left-3 sm:left-auto sm:w-[420px] bottom-36 lg:bottom-24 z-40 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "rgb(var(--bg-elev))",
            boxShadow: `0 16px 48px rgb(0 0 0 / 0.25), 0 0 0 2px rgb(${rolePrimaer} / 0.4)`,
            maxHeight: "min(70vh, 600px)",
          }}
        >
          <header
            className="px-4 py-3 flex items-baseline justify-between gap-2 shrink-0"
            style={{ background: `linear-gradient(180deg, rgb(${rolePrimaer} / 0.15), transparent)` }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: `rgb(${rolePrimaer})` }}>
                Brillenmodus · {roleLabel}-Sicht
              </p>
              <h2 className="font-display text-[15px] font-bold tracking-tight2 leading-tight">
                Begriff in Klartext
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="flex items-center gap-1.5 text-[11px] text-soft cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aktiv}
                  onChange={toggleAktiv}
                  className="accent-[rgb(var(--vibe-approval))]"
                />
                Floater bleibt
              </label>
            </div>
          </header>

          <div className="px-4 py-3 overflow-y-auto flex-1">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Markiere Text auf der Seite oder schreibe einen Begriff hier rein — Lana erklärt ihn in einfacher Sprache."
              rows={3}
              className="w-full surface-mute rounded-lg p-2.5 text-[13px] leading-relaxed mb-3"
              style={{ resize: "vertical" }}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={frageNach}
                disabled={loading || !text.trim()}
                className="text-[13px] px-3 py-1.5 rounded-md font-medium transition-all disabled:opacity-50"
                style={{
                  background: `rgb(${rolePrimaer})`,
                  color: "white",
                }}
              >
                {loading ? "Lana denkt nach …" : "✦ Erklären lassen"}
              </button>
              {ergebnis && (
                <button
                  onClick={() => {
                    setErgebnis(null);
                    setText("");
                    inputRef.current?.focus();
                  }}
                  className="text-[12px] text-soft hover:text-mute"
                >
                  Neue Anfrage
                </button>
              )}
              <span className="text-[10px] text-soft ml-auto font-mono">
                {beruf} · /api/ai/klartext
              </span>
            </div>

            {error && (
              <p className="text-[11px] mt-3 italic" style={{ color: "rgb(var(--mon))" }}>
                {error}
              </p>
            )}

            {ergebnis && (
              <div className="mt-3 surface-mute rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1.5">
                  Klartext · {ergebnis.voice}
                </p>
                <p className="text-[14px] leading-relaxed mb-3">{ergebnis.klartext}</p>

                {ergebnis.glossar.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">
                      Begriffe
                    </p>
                    <ul className="space-y-1">
                      {ergebnis.glossar.map((g, i) => (
                        <li key={i} className="text-[12px]">
                          <span className="font-medium">{g.fach}</span>
                          <span className="text-soft"> · {g.klar}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {ergebnis.rueckfragen.length > 0 && (
                  <div className="mb-1">
                    <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">
                      Rückfragen
                    </p>
                    <ul className="space-y-0.5 list-disc pl-4">
                      {ergebnis.rueckfragen.map((q, i) => (
                        <li key={i} className="text-[12px] text-soft">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-[10px] text-soft italic mt-2">
                  {ergebnis.tokens.input + ergebnis.tokens.output} Tokens · {ergebnis.kostenEur.toFixed(4)} €
                </p>
              </div>
            )}

            {!ergebnis && !loading && !error && (
              <div className="mt-3 surface-mute rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1.5">
                  Tipp · 3 Wege
                </p>
                <ul className="text-[12px] text-mute space-y-1.5 leading-relaxed">
                  <li>1. Text auf der Seite markieren → Floater klicken → ist vorausgefüllt</li>
                  <li>2. Begriff direkt eintippen (z.B. „Sakraldekubitus Kategorie 2&quot;)</li>
                  <li>3. Ganzen Befund einfügen — Lana macht 3-5 Sätze daraus</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function BrilleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="14" r="3.5" />
      <circle cx="18" cy="14" r="3.5" />
      <path d="M9.5 14h5" />
      <path d="M3 8l1.5-2.5L7 6" />
      <path d="M21 8l-1.5-2.5L17 6" />
    </svg>
  );
}
