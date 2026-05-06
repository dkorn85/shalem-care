"use client";

// Sozial-Diktat-UI · Hilfeplan-Erstellung per Sprache.

import { useEffect, useRef, useState } from "react";
import {
  type SozialFeld,
  type StrukturierterHilfeplan,
  SOZ_LABEL,
  SOZ_FARBE,
  SOZ_BESCHREIBUNG,
  strukturiereHilfeplan,
} from "@/lib/sozial/diktat-store";

const BEISPIEL = "Margot Bergmann, 58 Jahre, lebt allein in Mietwohnung Berlin. Parkinson Stadium 3, Schluckstörung. Selbstversorgung eingeschränkt: Anziehen mit Anleitung, Essen pürierte Kost. Mobilität mit Rollator innerhalb Wohnung, draußen nur mit Begleitung. Möchte selbstbestimmt wohnen bleiben. Bedarf: tägliche Assistenzstunden für Körperpflege und Mahlzeiten, drei Stunden pro Tag. Tagesstruktur in Werkstatt für Behinderte zwei mal die Woche, vier Stunden. Ziel: selbstständig Frühstück bereiten in sechs Monaten. Sozialraum: Selbsthilfegruppe Parkinson im Ortsteil, ein mal pro Monat besucht.";

export function SozialDiktat() {
  const [transkript, setTranskript] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<StrukturierterHilfeplan | null>(null);
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
    setResult(strukturiereHilfeplan(transkript));
  };

  const updateFeld = (feld: SozialFeld, value: string) => {
    if (!result) return;
    setResult({ ...result, felder: { ...result.felder, [feld]: value } });
  };

  const wordCount = transkript.trim() ? transkript.trim().split(/\s+/).length : 0;
  const recordSecFmt = `${Math.floor(recordSec / 60)}:${String(recordSec % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      <section className="surface rounded-2xl p-4 sm:p-5" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--tue) / 0.25)" }}>
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--tue))" }}>Schritt 1 · Diktat</p>
            <h2 className="font-display text-[18px] font-semibold mt-0.5">Hilfeplan sprechen — BTHG-konform</h2>
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
              Stopp · {recordSecFmt}
            </button>
          )}
          {audioUrl && !recording && <audio src={audioUrl} controls className="h-9" />}
          <button type="button" onClick={() => setTranskript(BEISPIEL)} className="text-[11px] underline-offset-2 hover:underline text-soft">Beispiel einfügen</button>
        </div>

        <textarea
          value={transkript}
          onChange={(e) => setTranskript(e.target.value)}
          rows={6}
          placeholder={`Z.B. "${BEISPIEL.slice(0, 100)}..."`}
          className="w-full px-3 py-2 rounded-md text-[13px] surface-mute border-0 focus:outline-none"
          style={{ outline: "none", lineHeight: 1.5 }}
        />

        <div className="flex items-baseline gap-2 mt-3">
          <button type="button" onClick={strukturiere} disabled={!transkript.trim()} className="px-3 py-1.5 rounded-md text-[12px] font-medium disabled:opacity-40" style={{ background: "rgb(var(--tue))", color: "white" }}>
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
          <section className="rounded-2xl p-4" style={{ background: "rgb(var(--vibe-approval) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)" }}>
            <p className="text-[11px] font-mono mb-1" style={{ color: "rgb(var(--vibe-approval))" }}>
              ✓ {Object.values(result.felder).filter(Boolean).length} Felder · {result.icf_codes.length} ICF-Codes ·
              {result.leistungs_vorschlaege.length} SGB-IX-Vorschläge · {result.smart_ziele.length} Ziele ·
              ~{Math.round(result.zeitErsparnisSec / 60)} min gespart
            </p>
          </section>

          {result.warnungen.length > 0 && (
            <section className="rounded-2xl p-4" style={{ background: "rgb(var(--mon) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.3)" }}>
              <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>⚠ KI-Warnungen</p>
              <ul className="space-y-1.5">
                {result.warnungen.map((w, i) => <li key={i} className="text-[12px] flex gap-2"><span className="shrink-0">•</span><span>{w}</span></li>)}
              </ul>
            </section>
          )}

          {/* 9 Felder */}
          <section className="grid sm:grid-cols-2 gap-2.5">
            {(Object.keys(SOZ_LABEL) as SozialFeld[]).map((feld) => {
              const farbe = SOZ_FARBE[feld];
              const inhalt = result.felder[feld] ?? "";
              return (
                <div key={feld} className="surface rounded-xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / ${inhalt ? 0.3 : 0.15})` }}>
                  <p className="text-[11px] font-medium mb-1" style={{ color: `rgb(${farbe})` }}>{SOZ_LABEL[feld]}</p>
                  <p className="text-[10px] text-soft mb-1.5 leading-relaxed">{SOZ_BESCHREIBUNG[feld]}</p>
                  <textarea
                    value={inhalt}
                    onChange={(e) => updateFeld(feld, e.target.value)}
                    rows={2}
                    placeholder={inhalt ? "" : "(KI nichts erkannt)"}
                    className="w-full px-2 py-1.5 rounded text-[12px] surface-mute border-0 focus:outline-none"
                    style={{ outline: "none" }}
                  />
                </div>
              );
            })}
          </section>

          {/* ICF-Codes + Leistungs-Vorschläge */}
          <div className="grid sm:grid-cols-2 gap-2.5">
            {result.icf_codes.length > 0 && (
              <section className="surface rounded-xl p-3">
                <p className="text-[11px] font-medium mb-2" style={{ color: "rgb(var(--fri))" }}>ICF-Codes</p>
                <ul className="space-y-1">
                  {result.icf_codes.map((c, i) => (
                    <li key={i} className="flex items-baseline gap-2 text-[12px]">
                      <span className="text-[10px] font-mono px-1.5 rounded shrink-0" style={{ background: "rgb(var(--bg-mute))" }}>{c.code}</span>
                      <span className="text-soft text-[10px] shrink-0">{c.kategorie}</span>
                      <span className="text-[11px]">{c.beschreibung}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {result.leistungs_vorschlaege.length > 0 && (
              <section className="surface rounded-xl p-3">
                <p className="text-[11px] font-medium mb-2" style={{ color: "rgb(var(--accent))" }}>SGB-IX-Leistungs-Vorschläge</p>
                <ul className="space-y-1.5">
                  {result.leistungs_vorschlaege.map((l, i) => (
                    <li key={i} className="text-[12px]">
                      <p className="font-medium">{l.gruppe}</p>
                      <p className="text-[10px] text-soft font-mono">{l.paragraph} · {l.begruendung}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* SMART-Ziele */}
          {result.smart_ziele.length > 0 && (
            <section className="surface rounded-xl p-3">
              <p className="text-[11px] font-medium mb-2" style={{ color: "rgb(var(--vibe-approval))" }}>SMART-Ziele · KI-Score</p>
              <ul className="space-y-2">
                {result.smart_ziele.map((z, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0"
                      style={{
                        background: z.smart_score >= 3 ? "rgb(var(--vibe-approval) / 0.2)" : "rgb(var(--sun) / 0.2)",
                        color: z.smart_score >= 3 ? "rgb(var(--vibe-approval))" : "rgb(var(--sun))",
                      }}
                    >
                      {z.smart_score}/4 SMART
                    </span>
                    <span className="text-[12px] flex-1">{z.ziel}</span>
                    <span className="text-[10px] text-soft font-mono shrink-0">{z.zeitraum}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Klartext */}
          <section className="rounded-xl p-3" style={{ background: "rgb(var(--vibe-team) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.3)" }}>
            <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-team))" }}>Hilfeplan-Zusammenfassung für Klient:in</p>
            <pre className="text-[12px] whitespace-pre-wrap leading-relaxed font-sans">{result.klartext}</pre>
          </section>

          <section className="flex items-baseline justify-between gap-3 flex-wrap pt-2">
            {signedTime ? (
              <p className="text-[12px]" style={{ color: "rgb(var(--vibe-approval))" }}>
                ✓ Signiert · {new Date(signedTime).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · ASD-System aktualisiert
              </p>
            ) : (
              <p className="text-[11px] text-soft">Prüfen · korrigieren · signieren — Hilfeplan wird in der Akte hinterlegt + ASD-Eintrag erstellt.</p>
            )}
            <button
              type="button"
              onClick={() => setSignedTime(new Date().toISOString())}
              disabled={!!signedTime}
              className="px-4 py-2 rounded-md text-[13px] font-medium disabled:opacity-50"
              style={{ background: signedTime ? "rgb(var(--vibe-approval))" : "rgb(var(--tue))", color: "white" }}
            >
              {signedTime ? "Signiert ✓" : "Hilfeplan signieren"}
            </button>
          </section>
        </>
      )}
    </div>
  );
}
