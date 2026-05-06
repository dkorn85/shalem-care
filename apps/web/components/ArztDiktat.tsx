"use client";

// ArztDiktat · Sprachdiktat-UI für Arzt-Verordnungen.
// Spricht: "Helga Reinhardt, 78, COPD, Salbutamol 100µg 2x täglich, KG 6er
// wegen LWS, Hausbesuch alle 14 Tage" — KI strukturiert in Verordnungs-
// Karten, schlägt ICD-10 vor, generiert GoÄ-Codes + Klartext für Patient.

import { useState, useRef, useEffect } from "react";
import {
  type DiktatResult,
  ART_LABEL,
  ART_FARBE,
  strukturiereDiktat,
} from "@/lib/arzt/diktat-store";

const BEISPIEL = "Helga Reinhardt, 78 Jahre, COPD und LWS-Syndrom. Salbutamol Spray 100 Mikrogramm 2x täglich. Krankengymnastik 6er-Verordnung wegen LWS. Hausbesuch alle 14 Tage zur Vital-Kontrolle. Ibuprofen 400 mg bei Bedarf gegen Schmerz, max 3x täglich.";

export function ArztDiktat() {
  const [transkript, setTranskript] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DiktatResult | null>(null);
  const [signedTime, setSignedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
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
      r.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      r.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorderRef.current = r;
      r.start();
      setRecording(true);
      setRecordSec(0);
      tickRef.current = window.setInterval(() => setRecordSec((s) => s + 1), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mikrofon-Zugriff verweigert");
    }
  };

  const stopRec = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const strukturiere = () => {
    if (!transkript.trim()) {
      setError("Erst Transkript eintragen");
      return;
    }
    setError(null);
    setResult(strukturiereDiktat(transkript));
  };

  const recordSecFmt = `${Math.floor(recordSec / 60)}:${String(recordSec % 60).padStart(2, "0")}`;
  const wordCount = transkript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Diktat-Eingabe */}
      <section
        className="surface rounded-2xl p-4 sm:p-5"
        style={{ boxShadow: "inset 0 0 0 1px rgb(var(--vibe-profile) / 0.25)" }}
      >
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--vibe-profile))" }}>
              Schritt 1 · Diktat oder Eingabe
            </p>
            <h2 className="font-display text-[18px] font-semibold mt-0.5">Verordnung sprechen oder tippen</h2>
          </div>
          {wordCount > 0 && <span className="text-[11px] text-soft font-mono">{wordCount} Wörter</span>}
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
            <button
              type="button"
              onClick={stopRec}
              className="px-4 py-2 rounded-full text-[13px] font-medium inline-flex items-center gap-2 animate-pulse"
              style={{ background: "rgb(var(--mon))", color: "white" }}
            >
              <span aria-hidden className="w-3 h-3 rounded-sm bg-white" />
              Stopp · {recordSecFmt}
            </button>
          )}
          {audioUrl && !recording && <audio src={audioUrl} controls className="h-9" />}
          <button
            type="button"
            onClick={() => setTranskript(BEISPIEL)}
            className="text-[11px] underline-offset-2 hover:underline text-soft"
          >
            Beispiel-Diktat einfügen
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
          <button
            type="button"
            onClick={strukturiere}
            disabled={!transkript.trim()}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors disabled:opacity-40"
            style={{ background: "rgb(var(--vibe-profile))", color: "white" }}
          >
            ✦ KI-Strukturierung
          </button>
          {transkript && (
            <button
              type="button"
              onClick={() => {
                setTranskript("");
                setResult(null);
              }}
              className="text-[11px] text-soft hover:text-[rgb(var(--fg))]"
            >
              Zurücksetzen
            </button>
          )}
        </div>
        {error && <p className="text-[11px] mt-2" style={{ color: "rgb(var(--mon))" }}>{error}</p>}
      </section>

      {/* Ergebnis */}
      {result && (
        <>
          <section
            className="rounded-2xl p-4"
            style={{ background: "rgb(var(--vibe-approval) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)" }}
          >
            <p className="text-[11px] font-mono mb-1" style={{ color: "rgb(var(--vibe-approval))" }}>
              ✓ {result.verordnungen.length} Verordnung{result.verordnungen.length === 1 ? "" : "en"} erkannt ·{" "}
              {result.warnungen.length > 0 && <strong style={{ color: "rgb(var(--mon))" }}>{result.warnungen.length} Warnung{result.warnungen.length === 1 ? "" : "en"}</strong>}
              {" · "}~{Math.round(result.zeitErsparnisSec / 60)} min gespart vs CGM/doxter Click-Workflow
            </p>
          </section>

          {/* Warnungen */}
          {result.warnungen.length > 0 && (
            <section
              className="rounded-2xl p-4"
              style={{ background: "rgb(var(--mon) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.3)" }}
            >
              <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>
                ⚠ KI-Plausi-Warnungen
              </p>
              <ul className="space-y-1.5">
                {result.warnungen.map((w, i) => (
                  <li key={i} className="text-[12px] flex gap-2 leading-relaxed">
                    <span className="shrink-0">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Verordnungs-Karten */}
          <section className="grid sm:grid-cols-2 gap-2.5">
            {result.verordnungen.map((v, i) => {
              const f = ART_FARBE[v.art];
              return (
                <article
                  key={i}
                  className="surface rounded-xl p-3"
                  style={{ boxShadow: `inset 0 0 0 1px rgb(${f} / 0.3)` }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded" style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}>
                      {ART_LABEL[v.art]}
                    </span>
                    {v.icd10_vorschlag && (
                      <span className="text-[10px] font-mono text-soft">{v.icd10_vorschlag.split(" · ")[0]}</span>
                    )}
                  </div>
                  {v.klient_name && <p className="text-[13px] font-medium">{v.klient_name}</p>}
                  {v.praeparat && (
                    <p className="text-[12px] mt-0.5">
                      <strong>{v.praeparat}</strong>
                      {v.staerke && <> {v.staerke}</>}
                    </p>
                  )}
                  {v.dosierung && <p className="text-[11px] text-mute">{v.dosierung}</p>}
                  {v.heilmittel_typ && (
                    <p className="text-[12px]">
                      <strong>{v.heilmittel_typ}</strong>
                      {v.heilmittel_anzahl && <> · {v.heilmittel_anzahl} Termine</>}
                    </p>
                  )}
                  {v.hkp_frequenz && <p className="text-[12px]"><strong>HKP:</strong> {v.hkp_frequenz}</p>}
                  {v.icd10_vorschlag && <p className="text-[10px] text-soft mt-1 italic">→ {v.icd10_vorschlag}</p>}
                  {v.notiz && <p className="text-[11px] text-soft italic mt-1.5 leading-relaxed">"{v.notiz}"</p>}
                  <button
                    type="button"
                    onClick={() => alert(`Phase 2: eRezept-Generierung über gematik-Konnektor.\n\n${ART_LABEL[v.art]} · ${v.praeparat ?? v.heilmittel_typ ?? "—"}`)}
                    className="mt-2 text-[11px] px-2 py-1 rounded transition-colors"
                    style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}
                  >
                    eRezept generieren →
                  </button>
                </article>
              );
            })}
          </section>

          {/* GoÄ-Codes */}
          {result.goa_codes.length > 0 && (
            <section className="surface rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">GoÄ-Codes vorgeschlagen</p>
              <ul className="space-y-1.5">
                {result.goa_codes.map((g, i) => (
                  <li key={i} className="flex items-baseline gap-3 text-[12px]">
                    <span className="font-mono text-soft shrink-0 w-[60px]">{g.code}</span>
                    <span className="flex-1">{g.bezeichnung}</span>
                    <span className="font-mono text-soft tabular-nums">{g.punkte} Pkt</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Klartext */}
          <section
            className="rounded-2xl p-4"
            style={{ background: "rgb(var(--vibe-team) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.3)" }}
          >
            <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-team))" }}>
              Klartext für Patient:in
            </p>
            <pre className="text-[12px] whitespace-pre-wrap leading-relaxed font-sans">
              {result.klartext}
            </pre>
            <p className="text-[10px] text-soft italic mt-2">
              Phase 2: Lana liest den Text vor + sendet ihn als Audio + PDF an die Patient-App.
            </p>
          </section>

          {/* Signieren */}
          <section className="flex items-baseline justify-between gap-3 flex-wrap pt-2">
            {signedTime ? (
              <p className="text-[12px]" style={{ color: "rgb(var(--vibe-approval))" }}>
                ✓ Verordnungen signiert · {new Date(signedTime).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                · eRezept-Code wird via TI übertragen
              </p>
            ) : (
              <p className="text-[11px] text-soft">
                Prüfen · ggf. anpassen · dann signieren — eRezept(e) gehen via TI an die Apotheke.
              </p>
            )}
            <button
              type="button"
              onClick={() => setSignedTime(new Date().toISOString())}
              disabled={!!signedTime}
              className="px-4 py-2 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50"
              style={{ background: signedTime ? "rgb(var(--vibe-approval))" : "rgb(var(--vibe-profile))", color: "white" }}
            >
              {signedTime ? "Signiert ✓" : "eRezept(e) signieren"}
            </button>
          </section>
        </>
      )}
    </div>
  );
}
