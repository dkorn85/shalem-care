"use client";

// SisDiktat · Sprachdiktat-UI für SIS-Doku.
//
// Pflegekraft drückt Mikrofon, spricht 30-90 Sek. ihre Beobachtungen, KI
// strukturiert in 6 SIS-Felder, extrahiert Maßnahmen, generiert Klartext-
// Brücke für Angehörige. Pflegekraft prüft, korrigiert, signiert.
//
// Phase 1: MediaRecorder im Browser, Heuristik-Strukturierung.
// Phase 2: Audio → ElevenLabs STT → Anthropic-Strukturierung mit
// Pflege-System-Prompt + RAG über Akte.

import { useEffect, useRef, useState } from "react";
import {
  type SisFeld,
  type SisEintrag,
  SIS_LABEL,
  SIS_FARBE,
  SIS_BESCHREIBUNG,
  strukturiereTranskript,
  generiereKlartext,
} from "@/lib/pflege/sis-store";

const STIMMUNG_FARBE: Record<NonNullable<SisEintrag["stimmung"]>, string> = {
  ruhig: "var(--vibe-approval)",
  ausgeglichen: "var(--fri)",
  froh: "var(--sun)",
  unruhig: "var(--vibe-stats)",
  schmerzgeplagt: "var(--mon)",
};

export function SisDiktat({
  klientId,
  klientName,
  pflegekraftId,
  pflegekraftName,
  letzteEintraege,
}: {
  klientId: string;
  klientName: string;
  pflegekraftId: string;
  pflegekraftName: string;
  letzteEintraege: SisEintrag[];
}) {
  const [transkript, setTranskript] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [strukturiert, setStrukturiert] = useState<ReturnType<typeof strukturiereTranskript> | null>(null);
  const [klartext, setKlartext] = useState("");
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

  const startRecording = async () => {
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
        setAudioBlob(blob);
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

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const strukturiere = () => {
    if (!transkript.trim()) {
      setError("Erst Transkript eintragen — entweder via Mikrofon-Aufnahme + Phase-2-STT oder direkt tippen/einfügen.");
      return;
    }
    setError(null);
    const result = strukturiereTranskript(transkript);
    setStrukturiert(result);
    setKlartext(generiereKlartext(result.felder, klientName));
  };

  const updateFeld = (feld: SisFeld, value: string) => {
    if (!strukturiert) return;
    setStrukturiert({
      ...strukturiert,
      felder: { ...strukturiert.felder, [feld]: value },
    });
  };

  const signiere = () => {
    setSignedTime(new Date().toISOString());
    // Phase 2: persist via Server-Action mit Audit-Log.
  };

  const recordSecFmt = `${Math.floor(recordSec / 60)}:${String(recordSec % 60).padStart(2, "0")}`;
  const wordCount = transkript.trim() ? transkript.trim().split(/\s+/).length : 0;
  const tippZeitMin = wordCount > 0 ? Math.round((wordCount / 35) * 1.6) : 0; // 35 wpm Pflege-Tippen, 1.6× Strukturierung
  const diktierZeitMin = wordCount > 0 ? Math.max(1, Math.round(wordCount / 130)) : 0; // 130 wpm sprechen
  const ersparnis = Math.max(0, tippZeitMin - diktierZeitMin);

  return (
    <div className="space-y-4">
      {/* Aufnahme + Transkript */}
      <section
        className="surface rounded-2xl p-4 sm:p-5"
        style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.2)" }}
      >
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>
              Schritt 1 · Diktat oder Texteingabe
            </p>
            <h2 className="font-display text-[18px] font-semibold mt-0.5">
              Was ist seit der letzten Übergabe passiert?
            </h2>
          </div>
          {wordCount > 0 && (
            <div className="text-[11px] text-soft font-mono">
              {wordCount} Wörter · ↓ {ersparnis} min gespart vs Tippen
            </div>
          )}
        </header>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              className="px-4 py-2 rounded-full text-[13px] font-medium transition-colors inline-flex items-center gap-2"
              style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.4)" }}
            >
              <span aria-hidden className="w-3 h-3 rounded-full" style={{ background: "rgb(var(--mon))" }} />
              Aufnahme starten
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="px-4 py-2 rounded-full text-[13px] font-medium transition-colors inline-flex items-center gap-2 animate-pulse"
              style={{ background: "rgb(var(--mon))", color: "white" }}
            >
              <span aria-hidden className="w-3 h-3 rounded-sm bg-white" />
              Stopp · {recordSecFmt}
            </button>
          )}
          {audioUrl && !recording && (
            <audio src={audioUrl} controls className="h-9" />
          )}
          <span className="text-[10px] text-soft italic">
            Phase 2: Audio → ElevenLabs-STT → automatisches Transkript. Heute: Eintragen oder einfügen.
          </span>
        </div>

        <textarea
          value={transkript}
          onChange={(e) => setTranskript(e.target.value)}
          rows={6}
          placeholder={`Beispiel: "${klientName.split(" ")[0]} heute morgen wach und ansprechbar, hat von ihrer Tochter erzählt — Erinnerung war klar. Beim Aufstehen Schwindel, NRS-Schmerz drei am Knie, Ibuprofen vierhundert vor zwanzig Minuten gegeben..."`}
          className="w-full px-3 py-2 rounded-md text-[13px] surface-mute border-0 focus:outline-none focus:ring-2"
          style={{ outline: "none", lineHeight: 1.5 }}
        />

        <div className="flex items-baseline gap-2 mt-3">
          <button
            type="button"
            onClick={strukturiere}
            disabled={!transkript.trim()}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors disabled:opacity-40"
            style={{ background: "rgb(var(--accent))", color: "white" }}
          >
            ✦ KI-Strukturierung anwenden
          </button>
          {transkript && (
            <button
              type="button"
              onClick={() => {
                setTranskript("");
                setStrukturiert(null);
                setKlartext("");
              }}
              className="text-[11px] text-soft hover:text-[rgb(var(--fg))]"
            >
              Zurücksetzen
            </button>
          )}
        </div>
        {error && <p className="text-[11px] mt-2" style={{ color: "rgb(var(--mon))" }}>{error}</p>}
      </section>

      {/* Strukturierte SIS-Felder */}
      {strukturiert && (
        <section className="space-y-3">
          <header className="flex items-baseline justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>
                Schritt 2 · KI hat strukturiert · prüfen + korrigieren
              </p>
              <h2 className="font-display text-[18px] font-semibold mt-0.5">SIS-6-Felder</h2>
            </div>
            <div className="flex items-baseline gap-2">
              {strukturiert.stimmung && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded font-mono"
                  style={{
                    background: `rgb(${STIMMUNG_FARBE[strukturiert.stimmung]} / 0.15)`,
                    color: `rgb(${STIMMUNG_FARBE[strukturiert.stimmung]})`,
                  }}
                >
                  Stimmung: {strukturiert.stimmung}
                </span>
              )}
              {strukturiert.schmerz_nrs !== undefined && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded font-mono"
                  style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}
                >
                  Schmerz NRS {strukturiert.schmerz_nrs}/10
                </span>
              )}
            </div>
          </header>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {(Object.keys(SIS_LABEL) as SisFeld[]).map((feld) => {
              const farbe = SIS_FARBE[feld];
              const inhalt = strukturiert.felder[feld] ?? "";
              const leer = !inhalt;
              return (
                <div
                  key={feld}
                  className="surface rounded-xl p-3"
                  style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / ${leer ? 0.15 : 0.3})` }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-[11px] font-medium" style={{ color: `rgb(${farbe})` }}>
                      {SIS_LABEL[feld]}
                    </span>
                    {leer && <span className="text-[9px] text-soft italic">leer</span>}
                  </div>
                  <p className="text-[10px] text-soft leading-relaxed mb-1.5">{SIS_BESCHREIBUNG[feld]}</p>
                  <textarea
                    value={inhalt}
                    onChange={(e) => updateFeld(feld, e.target.value)}
                    rows={2}
                    placeholder={leer ? "(KI hat hier nichts erkannt — manuell ergänzen)" : ""}
                    className="w-full px-2 py-1.5 rounded text-[12px] surface-mute border-0 focus:outline-none"
                    style={{ outline: "none", color: leer ? "rgb(var(--fg-mute))" : undefined }}
                  />
                </div>
              );
            })}
          </div>

          {/* Maßnahmen */}
          {strukturiert.massnahmen.length > 0 && (
            <section className="surface rounded-xl p-3" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.3)" }}>
              <p className="text-[11px] font-medium mb-2" style={{ color: "rgb(var(--vibe-approval))" }}>
                ✓ Extrahierte Maßnahmen · {strukturiert.massnahmen.length}
              </p>
              <ul className="space-y-1">
                {strukturiert.massnahmen.map((m, i) => (
                  <li key={i} className="flex items-baseline gap-2 text-[12px]">
                    <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: "rgb(var(--vibe-approval))" }} />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Klartext-Brücke */}
          <section className="surface rounded-xl p-3" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.3)" }}>
            <header className="flex items-baseline justify-between gap-2 mb-2">
              <p className="text-[11px] font-medium" style={{ color: "rgb(var(--vibe-team))" }}>
                ✦ Klartext-Brücke für Angehörige
              </p>
              <button
                type="button"
                onClick={() => setKlartext(generiereKlartext(strukturiert.felder, klientName))}
                className="text-[10px] text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline"
              >
                Neu generieren
              </button>
            </header>
            <textarea
              value={klartext}
              onChange={(e) => setKlartext(e.target.value)}
              rows={3}
              placeholder="Wird automatisch aus den Feldern generiert. Du kannst sie anpassen."
              className="w-full px-2 py-1.5 rounded text-[12px] surface-mute border-0 focus:outline-none"
              style={{ outline: "none" }}
            />
            <p className="text-[10px] text-soft italic mt-1.5">
              Phase 2: Lana liest den Text vor + sendet ihn als Audio-Update an die Angehörigen-App.
            </p>
          </section>

          {/* Signieren */}
          <section className="flex items-baseline justify-between gap-3 flex-wrap pt-2">
            {signedTime ? (
              <p className="text-[12px]" style={{ color: "rgb(var(--vibe-approval))" }}>
                ✓ Signiert · {new Date(signedTime).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                · in der Akte
              </p>
            ) : (
              <p className="text-[11px] text-soft">
                Prüfen · ggf. anpassen · dann signieren — Eintrag landet in der Akte mit Audit-Log.
              </p>
            )}
            <button
              type="button"
              onClick={signiere}
              disabled={!!signedTime}
              className="px-4 py-2 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50"
              style={{ background: signedTime ? "rgb(var(--vibe-approval))" : "rgb(var(--accent))", color: "white" }}
            >
              {signedTime ? "Signiert ✓" : "Signieren + in Akte übergeben"}
            </button>
          </section>
        </section>
      )}

      {/* Letzte Einträge */}
      {letzteEintraege.length > 0 && (
        <section className="surface rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-soft font-mono mb-2">
            Letzte SIS-Einträge · {letzteEintraege.length}
          </p>
          <ul className="space-y-1.5">
            {letzteEintraege.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-baseline gap-3 text-[12px]">
                <span className="font-mono text-soft tabular-nums">
                  {new Date(e.zeitpunkt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="font-medium">{e.pflegekraftName}</span>
                <span className="text-soft truncate">
                  {Object.values(e.felder).join(" · ").slice(0, 100)}…
                </span>
                {e.zeitErsparnisSec > 0 && (
                  <span className="text-[10px] font-mono ml-auto" style={{ color: "rgb(var(--vibe-approval))" }}>
                    -{Math.round(e.zeitErsparnisSec / 60)} min
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
