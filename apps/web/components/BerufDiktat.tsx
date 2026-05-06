"use client";

// Generisches Beruf-Diktat-Tool · konfigurierbar via DiktatProfil.

import { useEffect, useRef, useState } from "react";
import {
  type DiktatProfil,
  type StrukturiertesProtokoll,
  strukturiereDiktat,
} from "@/lib/beruf-diktat/profile";

export function BerufDiktat({ profil }: { profil: DiktatProfil }) {
  const [transkript, setTranskript] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<StrukturiertesProtokoll | null>(null);
  const [signedTime, setSignedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<number | null>(null);

  useEffect(() => () => { if (tickRef.current) clearInterval(tickRef.current); }, []);

  const startRec = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunksRef.current = [];
      r.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      r.onstop = () => {
        setAudioUrl(URL.createObjectURL(new Blob(chunksRef.current, { type: "audio/webm" })));
        stream.getTracks().forEach((t) => t.stop());
      };
      recRef.current = r;
      r.start();
      setRecording(true);
      setRecordSec(0);
      tickRef.current = window.setInterval(() => setRecordSec((s) => s + 1), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mikrofon-Zugriff verweigert");
    }
  };

  const stopRec = () => {
    recRef.current?.stop();
    setRecording(false);
    if (tickRef.current) clearInterval(tickRef.current);
  };

  const strukturiere = () => {
    if (!transkript.trim()) { setError("Erst Transkript eintragen"); return; }
    setError(null);
    setResult(strukturiereDiktat(transkript, profil));
  };

  const updateFeld = (key: string, value: string) => {
    if (!result) return;
    setResult({ ...result, felder: { ...result.felder, [key]: value } });
  };

  const wordCount = transkript.trim() ? transkript.trim().split(/\s+/).length : 0;
  const recFmt = `${Math.floor(recordSec / 60)}:${String(recordSec % 60).padStart(2, "0")}`;

  // Leitfarbe = erste Feld-Farbe
  const leitfarbe = profil.felder[0]?.farbe ?? "var(--accent)";

  return (
    <div className="space-y-4">
      <section className="surface rounded-2xl p-4 sm:p-5" style={{ boxShadow: `inset 0 0 0 1px rgb(${leitfarbe} / 0.25)` }}>
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: `rgb(${leitfarbe})` }}>Schritt 1 · Diktat</p>
            <h2 className="font-display text-[18px] font-semibold mt-0.5">{profil.titel}</h2>
          </div>
          {wordCount > 0 && <span className="text-[11px] text-soft font-mono">{wordCount} Wörter</span>}
        </header>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {!recording ? (
            <button type="button" onClick={startRec} className="px-4 py-2 rounded-full text-[13px] font-medium inline-flex items-center gap-2" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.4)" }}>
              <span aria-hidden className="w-3 h-3 rounded-full" style={{ background: "rgb(var(--mon))" }} />
              Aufnahme
            </button>
          ) : (
            <button type="button" onClick={stopRec} className="px-4 py-2 rounded-full text-[13px] font-medium inline-flex items-center gap-2 animate-pulse" style={{ background: "rgb(var(--mon))", color: "white" }}>
              <span aria-hidden className="w-3 h-3 rounded-sm bg-white" />
              Stopp · {recFmt}
            </button>
          )}
          {audioUrl && !recording && <audio src={audioUrl} controls className="h-9" />}
          <button type="button" onClick={() => setTranskript(profil.beispiel)} className="text-[11px] underline-offset-2 hover:underline text-soft">
            Beispiel einfügen
          </button>
        </div>

        <textarea
          value={transkript}
          onChange={(e) => setTranskript(e.target.value)}
          rows={5}
          placeholder={profil.beispiel.slice(0, 100) + "…"}
          className="w-full px-3 py-2 rounded-md text-[13px] surface-mute border-0 focus:outline-none"
          style={{ outline: "none", lineHeight: 1.5 }}
        />

        <div className="flex items-baseline gap-2 mt-3">
          <button type="button" onClick={strukturiere} disabled={!transkript.trim()} className="px-3 py-1.5 rounded-md text-[12px] font-medium disabled:opacity-40" style={{ background: `rgb(${leitfarbe})`, color: "white" }}>
            ✦ KI-Strukturierung
          </button>
          {transkript && (
            <button type="button" onClick={() => { setTranskript(""); setResult(null); }} className="text-[11px] text-soft hover:text-[rgb(var(--fg))]">Zurücksetzen</button>
          )}
        </div>
        {error && <p className="text-[11px] mt-2" style={{ color: "rgb(var(--mon))" }}>{error}</p>}
      </section>

      {result && (
        <>
          <section className="rounded-2xl p-3" style={{ background: "rgb(var(--vibe-approval) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)" }}>
            <p className="text-[11px] font-mono" style={{ color: "rgb(var(--vibe-approval))" }}>
              ✓ {Object.keys(result.felder).length} / {profil.felder.length} Felder befüllt ·
              {result.warnungen.length > 0 && <strong style={{ color: "rgb(var(--mon))" }}> {result.warnungen.length} Warnung{result.warnungen.length === 1 ? "" : "en"} ·</strong>}
              {" "}{Math.round(result.zeitErsparnisSec / 60)} min gespart vs Tippen
            </p>
          </section>

          {result.warnungen.length > 0 && (
            <section className="rounded-2xl p-4" style={{ background: "rgb(var(--mon) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.3)" }}>
              <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>⚠ Eskalation</p>
              <ul className="space-y-1.5">
                {result.warnungen.map((w, i) => <li key={i} className="text-[12px] flex gap-2"><span className="shrink-0">•</span><span>{w}</span></li>)}
              </ul>
            </section>
          )}

          <section className="grid sm:grid-cols-2 gap-2.5">
            {profil.felder.map((f) => {
              const inhalt = result.felder[f.key] ?? "";
              return (
                <div key={f.key} className="surface rounded-xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${f.farbe} / ${inhalt ? 0.3 : 0.15})` }}>
                  <p className="text-[11px] font-medium mb-1" style={{ color: `rgb(${f.farbe})` }}>{f.label}</p>
                  <p className="text-[10px] text-soft mb-1.5 leading-relaxed">{f.beschreibung}</p>
                  <textarea
                    value={inhalt}
                    onChange={(e) => updateFeld(f.key, e.target.value)}
                    rows={2}
                    placeholder={inhalt ? "" : "(KI nichts erkannt)"}
                    className="w-full px-2 py-1.5 rounded text-[12px] surface-mute border-0 focus:outline-none"
                    style={{ outline: "none" }}
                  />
                </div>
              );
            })}
          </section>

          <section className="rounded-xl p-3" style={{ background: "rgb(var(--vibe-team) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.3)" }}>
            <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-team))" }}>Klartext · weitergeben</p>
            <pre className="text-[12px] whitespace-pre-wrap leading-relaxed font-sans">{result.klartext}</pre>
          </section>

          <section className="flex items-baseline justify-between gap-3 flex-wrap pt-2">
            {signedTime ? (
              <p className="text-[12px]" style={{ color: "rgb(var(--vibe-approval))" }}>
                ✓ Signiert · {new Date(signedTime).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </p>
            ) : (
              <p className="text-[11px] text-soft">Prüfen · ggf. korrigieren · signieren — Eintrag landet in der Akte.</p>
            )}
            <button type="button" onClick={() => setSignedTime(new Date().toISOString())} disabled={!!signedTime} className="px-4 py-2 rounded-md text-[13px] font-medium disabled:opacity-50" style={{ background: signedTime ? "rgb(var(--vibe-approval))" : `rgb(${leitfarbe})`, color: "white" }}>
              {signedTime ? "Signiert ✓" : "Eintrag signieren"}
            </button>
          </section>
        </>
      )}

      {/* Branchen-Vergleich */}
      <section className="rounded-2xl p-4" style={{ background: "rgb(var(--vibe-approval) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)" }}>
        <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-approval))" }}>Übertrifft die Branche</p>
        <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
          {profil.vs.map((v, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0">✓</span>
              <span><strong>{v.name}</strong>: {v.vorher} · Wir: {v.nachher}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
