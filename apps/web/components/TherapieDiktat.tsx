"use client";

// TherapieDiktat · Sprachdiktat-UI für Therapie-Termin-Doku.
//
// Theorg/Buchner: 8-Felder-Formular per Hand, ~6 min/Termin.
// Shalem-Pfad: 30 Sek. sprechen → KI strukturiert + HMV-Code + ICF-Ziele
// + Klartext für Klient.

import { useEffect, useRef, useState } from "react";
import {
  type TherapieFeld,
  type StrukturierterTherapieEintrag,
  FELD_LABEL,
  FELD_FARBE,
  FELD_BESCHREIBUNG,
  strukturiereTherapieDiktat,
} from "@/lib/therapie/diktat-store";

const BEISPIEL = "Helga Reinhardt, COPD und LWS-Schmerz. Im Verlauf seit letzter Sitzung leichte Besserung beim Treppensteigen, NRS Schmerz drei Komma fünf. Heute KG-Atemtherapie mit Lippenbremse zwanzig Minuten plus PNF Diagonalmuster für die linke obere Extremität. Lagerung in halbsitzender Position mit Keilkissen. Patientin tolerierte gut, am Ende leichte Erschöpfung. Therapieziel: 100m Gehstrecke ohne Hilfsmittel in vier Wochen. Eigenübung: Lippenbremse drei mal täglich fünf Minuten zuhause.";

export function TherapieDiktat() {
  const [transkript, setTranskript] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<StrukturierterTherapieEintrag | null>(null);
  const [signedTime, setSignedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const startRec = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunksRef.current = [];
      r.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      r.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
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
    if (!transkript.trim()) {
      setError("Erst Transkript eintragen");
      return;
    }
    setError(null);
    setResult(strukturiereTherapieDiktat(transkript));
  };

  const updateFeld = (feld: TherapieFeld, value: string) => {
    if (!result) return;
    setResult({ ...result, felder: { ...result.felder, [feld]: value } });
  };

  const wordCount = transkript.trim() ? transkript.trim().split(/\s+/).length : 0;
  const recordSecFmt = `${Math.floor(recordSec / 60)}:${String(recordSec % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      {/* Diktat */}
      <section className="surface rounded-2xl p-4 sm:p-5" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fri) / 0.25)" }}>
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--fri))" }}>
              Schritt 1 · Diktat oder Eingabe
            </p>
            <h2 className="font-display text-[18px] font-semibold mt-0.5">Therapie-Termin sprechen</h2>
          </div>
          {wordCount > 0 && <span className="text-[11px] text-soft font-mono">{wordCount} Wörter · ↓ ~{Math.round(wordCount * 0.5)} Sek vs Tippen</span>}
        </header>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {!recording ? (
            <button
              type="button"
              onClick={startRec}
              className="px-4 py-2 rounded-full text-[13px] font-medium inline-flex items-center gap-2"
              style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.4)" }}
            >
              <span aria-hidden className="w-3 h-3 rounded-full" style={{ background: "rgb(var(--mon))" }} />
              Aufnahme
            </button>
          ) : (
            <button type="button" onClick={stopRec} className="px-4 py-2 rounded-full text-[13px] font-medium inline-flex items-center gap-2 animate-pulse" style={{ background: "rgb(var(--mon))", color: "white" }}>
              <span aria-hidden className="w-3 h-3 rounded-sm bg-white" />
              Stopp · {recordSecFmt}
            </button>
          )}
          {audioUrl && !recording && <audio src={audioUrl} controls className="h-9" />}
          <button type="button" onClick={() => setTranskript(BEISPIEL)} className="text-[11px] underline-offset-2 hover:underline text-soft">
            Beispiel einfügen
          </button>
        </div>

        <textarea
          value={transkript}
          onChange={(e) => setTranskript(e.target.value)}
          rows={5}
          placeholder={`Z.B. "${BEISPIEL.slice(0, 80)}..."`}
          className="w-full px-3 py-2 rounded-md text-[13px] surface-mute border-0 focus:outline-none"
          style={{ outline: "none", lineHeight: 1.5 }}
        />

        <div className="flex items-baseline gap-2 mt-3">
          <button type="button" onClick={strukturiere} disabled={!transkript.trim()} className="px-3 py-1.5 rounded-md text-[12px] font-medium disabled:opacity-40" style={{ background: "rgb(var(--fri))", color: "white" }}>
            ✦ KI-Strukturierung
          </button>
          {transkript && (
            <button type="button" onClick={() => { setTranskript(""); setResult(null); }} className="text-[11px] text-soft hover:text-[rgb(var(--fg))]">
              Zurücksetzen
            </button>
          )}
        </div>
        {error && <p className="text-[11px] mt-2" style={{ color: "rgb(var(--mon))" }}>{error}</p>}
      </section>

      {result && (
        <>
          <section className="rounded-2xl p-4" style={{ background: "rgb(var(--vibe-approval) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)" }}>
            <p className="text-[11px] font-mono mb-1" style={{ color: "rgb(var(--vibe-approval))" }}>
              ✓ {Object.values(result.felder).filter(Boolean).length} Felder befüllt · {result.hmv_codes.length} HMV-Code{result.hmv_codes.length !== 1 && "s"} · ~{Math.round(result.zeitErsparnisSec / 60)} min gespart
              {result.vas_schmerz !== undefined && <> · VAS {result.vas_schmerz}/10</>}
              {result.diagnose_text && <> · Diagnose: {result.diagnose_text}</>}
            </p>
          </section>

          {result.warnungen.length > 0 && (
            <section className="rounded-2xl p-4" style={{ background: "rgb(var(--mon) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.3)" }}>
              <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>⚠ KI-Warnungen</p>
              <ul className="space-y-1.5">
                {result.warnungen.map((w, i) => <li key={i} className="text-[12px] flex gap-2 leading-relaxed"><span className="shrink-0">•</span><span>{w}</span></li>)}
              </ul>
            </section>
          )}

          {/* Felder */}
          <section className="grid sm:grid-cols-2 gap-2.5">
            {(Object.keys(FELD_LABEL) as TherapieFeld[]).map((feld) => {
              const farbe = FELD_FARBE[feld];
              const inhalt = result.felder[feld] ?? "";
              return (
                <div key={feld} className="surface rounded-xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / ${inhalt ? 0.3 : 0.15})` }}>
                  <p className="text-[11px] font-medium mb-1" style={{ color: `rgb(${farbe})` }}>{FELD_LABEL[feld]}</p>
                  <p className="text-[10px] text-soft mb-1.5 leading-relaxed">{FELD_BESCHREIBUNG[feld]}</p>
                  <textarea
                    value={inhalt}
                    onChange={(e) => updateFeld(feld, e.target.value)}
                    rows={2}
                    placeholder={inhalt ? "" : "(KI hat hier nichts erkannt)"}
                    className="w-full px-2 py-1.5 rounded text-[12px] surface-mute border-0 focus:outline-none"
                    style={{ outline: "none" }}
                  />
                </div>
              );
            })}
          </section>

          {/* HMV-Codes */}
          {result.hmv_codes.length > 0 && (
            <section className="surface rounded-xl p-3">
              <p className="text-[11px] font-medium mb-2" style={{ color: "rgb(var(--fri))" }}>
                HMV-Codes · Heilmittel-Verordnung 2026
              </p>
              <ul className="space-y-1.5">
                {result.hmv_codes.map((c, i) => (
                  <li key={i} className="flex items-baseline gap-3 text-[12px]">
                    <span className="font-mono text-soft w-[60px] shrink-0">{c.code}</span>
                    <span className="flex-1">{c.bezeichnung}</span>
                    <span className="font-mono text-[11px] text-soft tabular-nums">{c.dauer_min} min</span>
                    <span className="font-mono text-[11px] tabular-nums" style={{ color: "rgb(var(--fri))" }}>{c.punkte} Pkt</span>
                  </li>
                ))}
                <li className="flex items-baseline gap-3 text-[12px] pt-1.5 border-t" style={{ borderColor: "rgb(var(--border-soft))" }}>
                  <span className="text-soft text-[10px] flex-1">Summe</span>
                  <span className="font-mono font-semibold tabular-nums" style={{ color: "rgb(var(--fri))" }}>
                    {result.hmv_codes.reduce((s, c) => s + c.punkte, 0)} Pkt
                  </span>
                </li>
              </ul>
            </section>
          )}

          {/* ICF-Ziele */}
          {result.icf_ziele.length > 0 && (
            <section className="surface rounded-xl p-3">
              <p className="text-[11px] font-medium mb-2" style={{ color: "rgb(var(--vibe-approval))" }}>
                ICF-Therapieziele
              </p>
              <ul className="space-y-1">
                {result.icf_ziele.map((z, i) => (
                  <li key={i} className="flex items-baseline gap-2 text-[12px]">
                    <span className="text-[10px] font-mono w-[60px] shrink-0 text-soft">{z.icf_code ?? "—"}</span>
                    <span>{z.ziel}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Klartext */}
          <section className="rounded-xl p-3" style={{ background: "rgb(var(--vibe-team) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.3)" }}>
            <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-team))" }}>
              Klartext für Klient:in
            </p>
            <pre className="text-[12px] whitespace-pre-wrap leading-relaxed font-sans">{result.klartext}</pre>
          </section>

          {/* Signieren */}
          <section className="flex items-baseline justify-between gap-3 flex-wrap pt-2">
            {signedTime ? (
              <p className="text-[12px]" style={{ color: "rgb(var(--vibe-approval))" }}>
                ✓ Signiert · {new Date(signedTime).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                · in der Akte · Abrechnung an Krankenkasse
              </p>
            ) : (
              <p className="text-[11px] text-soft">Prüfen · korrigieren · signieren — Eintrag landet in der Akte + HMV-Codes gehen an die Abrechnung.</p>
            )}
            <button
              type="button"
              onClick={() => setSignedTime(new Date().toISOString())}
              disabled={!!signedTime}
              className="px-4 py-2 rounded-md text-[13px] font-medium disabled:opacity-50"
              style={{ background: signedTime ? "rgb(var(--vibe-approval))" : "rgb(var(--fri))", color: "white" }}
            >
              {signedTime ? "Signiert ✓" : "Eintrag signieren"}
            </button>
          </section>
        </>
      )}
    </div>
  );
}
