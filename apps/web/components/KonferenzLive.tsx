"use client";

import Link from "next/link";
import { useState, useTransition, useEffect, useRef } from "react";
import {
  konferenzStarten,
  konferenzBeenden,
  konferenzVertagen,
  liveNotizenSpeichern,
  agendaStatusSetzen,
  beschlussHinzufuegen,
  beschlussStatusSetzen,
  beschlussLoeschen,
} from "@/lib/konferenz/actions";
import type { Konferenz, AgendaPunkt, Beschluss } from "@/lib/konferenz/store";
import { KiKlartext } from "./KiKlartext";

const AGENDA_STATUS_LABEL: Record<AgendaPunkt["status"], string> = {
  offen:       "offen",
  diskutiert:  "diskutiert",
  vertagt:     "vertagt",
};

const AGENDA_STATUS_FARBE: Record<AgendaPunkt["status"], string> = {
  offen:       "var(--vibe-approval)",
  diskutiert:  "var(--thu)",
  vertagt:     "var(--fg-soft)",
};

const BESCHLUSS_STATUS_LABEL: Record<Beschluss["status"], string> = {
  offen:           "offen",
  in_bearbeitung:  "in Arbeit",
  erledigt:        "erledigt",
};

const BESCHLUSS_STATUS_FARBE: Record<Beschluss["status"], string> = {
  offen:           "var(--vibe-approval)",
  in_bearbeitung:  "var(--vibe-team)",
  erledigt:        "var(--thu)",
};

export function KonferenzLiveControl({ konferenz }: { konferenz: Konferenz }) {
  const [pending, start] = useTransition();
  const istLive = konferenz.status === "live";
  const istVorbei = konferenz.status === "abgeschlossen" || konferenz.status === "vertagt";
  const startBar = konferenz.status === "geplant" || konferenz.status === "pre_read_offen";

  return (
    <section
      className="surface rounded-2xl p-4 sm:p-5 mb-6 relative overflow-hidden"
      style={
        istLive
          ? { boxShadow: `inset 0 0 0 2px rgb(var(--mon) / 0.4)`, background: "linear-gradient(135deg, rgb(var(--mon) / 0.04), transparent)" }
          : undefined
      }
    >
      <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-baseline gap-2">
          {istLive && <span className="pulse-dot" style={{ background: "rgb(var(--mon))" }} />}
          <h2 className="font-display text-[18px] font-bold tracking-tight2">
            {istLive ? "Konferenz läuft" : istVorbei ? "Konferenz beendet" : "Konferenz starten"}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {startBar && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                // Konferenz-Start-Sound (Dennis-Stimme) wenn nicht stumm
                if (typeof window !== "undefined" && localStorage.getItem("shalem-audio-mute") !== "1") {
                  const audio = new Audio("/sounds/konferenz-start-dennis.mp3");
                  audio.play().catch(() => {/* autoplay-policy */});
                }
                start(() => konferenzStarten({ id: konferenz.id }));
              }}
              className="text-[12px] px-3 py-1 rounded-md transition-colors disabled:opacity-50"
              style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}
            >
              ▶ Starten
            </button>
          )}
          {istLive && (
            <>
              <Link
                href={`/konferenz/${konferenz.id}/live`}
                className="text-[12px] px-3 py-1 rounded-md transition-colors font-medium inline-flex items-center gap-1.5"
                style={{ background: "rgb(var(--accent))", color: "white" }}
              >
                <span aria-hidden>🎥</span>
                <span>Beitreten · Video-Modus</span>
              </Link>
              <button
                type="button"
                disabled={pending}
                onClick={() => start(() => konferenzVertagen({ id: konferenz.id }))}
                className="text-[12px] px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                style={{ background: "transparent", color: "rgb(var(--fg-mute))", boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.3)" }}
              >
                Vertagen
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => start(() => konferenzBeenden({ id: konferenz.id }))}
                className="text-[12px] px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                style={{ background: "rgb(var(--thu) / 0.15)", color: "rgb(var(--thu))" }}
              >
                ✓ Beenden
              </button>
            </>
          )}
        </div>
      </header>

      {istLive && (
        <>
          <LiveNotizen konferenzId={konferenz.id} initial={konferenz.liveNotizen ?? ""} />
          <AgendaLive konferenz={konferenz} />
          <BeschlussComposer konferenzId={konferenz.id} teilnehmende={konferenz.teilnehmende.map((t) => t.name)} />
          <BeschlussListe konferenz={konferenz} />
        </>
      )}

      {!istLive && !istVorbei && (
        <p className="text-[13px] text-mute">
          Sobald alle versammelt sind, „Starten" drücken — dann öffnet sich der Live-Modus mit Notizen, Beschluss-Composer und Agenda-Status.
        </p>
      )}
    </section>
  );
}

function LiveNotizen({ konferenzId, initial }: { konferenzId: string; initial: string }) {
  const [text, setText] = useState(initial);
  const [, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (text === initial) return;
    timer.current = setTimeout(() => {
      start(async () => {
        await liveNotizenSpeichern({ id: konferenzId, notizen: text });
        setSavedAt(new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      });
    }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [text, initial, konferenzId]);

  return (
    <div className="mb-5">
      <header className="flex items-baseline justify-between gap-2 mb-1.5">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Live-Notizen · Verlauf der Konferenz</p>
        <span className="text-[10px] text-soft">
          {savedAt ? `gespeichert ${savedAt}` : "auto-save"}
        </span>
      </header>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Stichworte, Zitate, Stimmungen mitschreiben — wird sekündlich gespeichert."
        rows={6}
        className="w-full surface-mute rounded-lg p-3 text-[13px] leading-relaxed resize-y focus:outline-none focus:ring-1"
        style={{ ["--tw-ring-color" as string]: "rgb(var(--accent) / 0.4)" }}
      />
      {text.trim().length >= 40 && (
        <div className="mt-2">
          <KiKlartext
            beruf="konferenz"
            fachtext={`Live-Notizen einer interdisziplinären Fall-/Hilfeplan-Konferenz:\n\n${text}\n\nBitte fasse zusammen, was die Kernpunkte und welche möglichen Beschlüsse sich abzeichnen.`}
            label="Notizen verdichten · Beschluss-Vorschläge"
            kompakt
          />
        </div>
      )}
    </div>
  );
}

function AgendaLive({ konferenz }: { konferenz: Konferenz }) {
  const [pending, start] = useTransition();
  const offen = konferenz.agenda.filter((a) => a.status === "offen").length;
  const diskutiert = konferenz.agenda.filter((a) => a.status === "diskutiert").length;

  return (
    <div className="mb-5">
      <header className="flex items-baseline justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Agenda · {diskutiert}/{konferenz.agenda.length} besprochen</p>
        <span className="text-[10px] text-soft">{offen} offen</span>
      </header>
      <ol className="space-y-1.5">
        {konferenz.agenda.map((a, i) => {
          const farbe = AGENDA_STATUS_FARBE[a.status];
          return (
            <li
              key={a.id}
              className="surface-mute rounded-lg p-2.5 relative overflow-hidden"
              style={{ opacity: a.status === "vertagt" ? 0.6 : 1 }}
            >
              <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
              <div className="ml-2.5 flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-[12px] text-soft font-bold w-5 shrink-0">{i + 1}</span>
                <span className="font-medium text-[13px] flex-1 min-w-0" style={{ textDecoration: a.status === "diskutiert" ? "line-through" : undefined }}>
                  {a.titel}
                </span>
                <span className="font-mono text-[10px] text-soft">{a.geplant_min} min</span>
                <span className="chip text-[10px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
                  {AGENDA_STATUS_LABEL[a.status]}
                </span>
                {a.status !== "diskutiert" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => start(() => agendaStatusSetzen({ id: konferenz.id, agendaId: a.id, status: "diskutiert" }))}
                    className="text-[10px] px-1.5 py-0.5 rounded transition-colors disabled:opacity-50"
                    style={{ background: "rgb(var(--thu) / 0.15)", color: "rgb(var(--thu))" }}
                  >
                    ✓ besprochen
                  </button>
                )}
                {a.status === "offen" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => start(() => agendaStatusSetzen({ id: konferenz.id, agendaId: a.id, status: "vertagt" }))}
                    className="text-[10px] px-1.5 py-0.5 rounded transition-colors disabled:opacity-50"
                    style={{ background: "transparent", color: "rgb(var(--fg-mute))", boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.3)" }}
                  >
                    vertagen
                  </button>
                )}
                {a.status !== "offen" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => start(() => agendaStatusSetzen({ id: konferenz.id, agendaId: a.id, status: "offen" }))}
                    className="text-[10px] px-1.5 py-0.5 rounded transition-colors disabled:opacity-50"
                    style={{ background: "transparent", color: "rgb(var(--fg-mute))", boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.3)" }}
                  >
                    zurück
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function BeschlussComposer({ konferenzId, teilnehmende }: { konferenzId: string; teilnehmende: string[] }) {
  const [was, setWas] = useState("");
  const [wer, setWer] = useState("");
  const [bis, setBis] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [pending, start] = useTransition();

  const submit = () => {
    if (!was.trim() || !wer.trim()) return;
    start(async () => {
      await beschlussHinzufuegen({ id: konferenzId, was: was.trim(), wer: wer.trim(), bis });
      setWas("");
      setWer("");
    });
  };

  return (
    <div className="mb-3 surface-mute rounded-lg p-3">
      <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Beschluss erfassen</p>
      <div className="space-y-2">
        <textarea
          value={was}
          onChange={(e) => setWas(e.target.value)}
          placeholder='Was wird beschlossen? (z.B. „Wundverband-Intervall auf alle 4 d reduzieren")'
          rows={2}
          className="w-full bg-transparent rounded p-2 text-[13px] resize-y focus:outline-none"
          style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.2)" }}
        />
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={wer}
            onChange={(e) => setWer(e.target.value)}
            list={`teilnehmende-${konferenzId}`}
            placeholder="Wer setzt um?"
            className="flex-1 min-w-[140px] bg-transparent rounded p-2 text-[13px] focus:outline-none"
            style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.2)" }}
          />
          <datalist id={`teilnehmende-${konferenzId}`}>
            {teilnehmende.map((t) => <option key={t} value={t} />)}
          </datalist>
          <input
            type="date"
            value={bis}
            onChange={(e) => setBis(e.target.value)}
            className="bg-transparent rounded p-2 text-[13px] focus:outline-none"
            style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.2)" }}
          />
          <button
            type="button"
            disabled={pending || !was.trim() || !wer.trim()}
            onClick={submit}
            className="text-[12px] px-3 py-1.5 rounded transition-colors disabled:opacity-50"
            style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}
          >
            + Beschluss
          </button>
        </div>
      </div>
    </div>
  );
}

function BeschlussListe({ konferenz }: { konferenz: Konferenz }) {
  const [pending, start] = useTransition();
  if (konferenz.beschluesse.length === 0) {
    return <p className="text-[12px] text-soft text-center py-2 italic">Noch keine Beschlüsse erfasst.</p>;
  }
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">
        Beschlüsse · {konferenz.beschluesse.length}
      </p>
      <ul className="space-y-1.5">
        {konferenz.beschluesse.map((b) => {
          const farbe = BESCHLUSS_STATUS_FARBE[b.status];
          return (
            <li key={b.id} className="surface-mute rounded-lg p-2.5 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
              <div className="ml-2.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium text-[13px] flex-1 min-w-0">{b.was}</span>
                  <span className="chip text-[10px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
                    {BESCHLUSS_STATUS_LABEL[b.status]}
                  </span>
                </div>
                <p className="text-[11px] text-soft mt-0.5">{b.wer} · bis {b.bis}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {(["offen", "in_bearbeitung", "erledigt"] as const).map((zustand) => (
                    <button
                      key={zustand}
                      type="button"
                      disabled={pending || b.status === zustand}
                      onClick={() => start(() => beschlussStatusSetzen({ id: konferenz.id, beschlussId: b.id, status: zustand }))}
                      className="text-[10px] px-1.5 py-0.5 rounded transition-colors disabled:opacity-30"
                      style={{
                        background: b.status === zustand ? `rgb(${BESCHLUSS_STATUS_FARBE[zustand]} / 0.2)` : "transparent",
                        color: `rgb(${BESCHLUSS_STATUS_FARBE[zustand]})`,
                        boxShadow: b.status === zustand ? undefined : `inset 0 0 0 1px rgb(${BESCHLUSS_STATUS_FARBE[zustand]} / 0.25)`,
                      }}
                    >
                      {BESCHLUSS_STATUS_LABEL[zustand]}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => start(() => beschlussLoeschen({ id: konferenz.id, beschlussId: b.id }))}
                    className="text-[10px] px-1.5 py-0.5 rounded transition-colors disabled:opacity-50 ml-auto"
                    style={{ color: "rgb(var(--fg-soft))" }}
                  >
                    löschen
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
