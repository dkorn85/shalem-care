"use client";

import { useState, useTransition } from "react";
import { setzeZiel, aktualisiereZiel, notiereZum, setzeStatus } from "@/lib/selbstbestimmung/actions";
import {
  ZIEL_LABEL, ZIEL_FARBE, ZIEL_STATUS_LABEL,
} from "@/lib/selbstbestimmung/types";
import type { Lebensziel, ZielKategorie, ZielStatus } from "@/lib/selbstbestimmung/types";

export function Lebensziele({
  klientId,
  klientName,
  ziele,
  authorId,
  asKlient,
}: {
  klientId: string;
  klientName: string;
  ziele: Lebensziel[];
  authorId: string;
  asKlient: boolean;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <section className="surface rounded-2xl p-5 sm:p-6 anim-slideUp">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Person-zentrierte Pflege</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-1">
            {asKlient ? "Meine Lebensziele" : `Lebensziele · ${klientName}`}
          </h3>
          <p className="text-[12px] text-mute mt-1 max-w-prose">
            {asKlient
              ? "In deinen eigenen Worten — was möchtest du erreichen, erleben, erhalten? Das Pflege-Team passt sich an deine Ziele an, nicht umgekehrt."
              : "Die Klientin/der Klient formuliert eigene Ziele. Die Maßnahmenplanung folgt diesen Wünschen — Pflegehandwerk im Dienst der Person."}
          </p>
        </div>
        <button onClick={() => setAdding((s) => !s)} className="btn btn-primary text-[12px]">
          {adding ? "× Schließen" : "+ Neues Ziel"}
        </button>
      </header>

      {adding && (
        <div className="mb-5">
          <ZielForm
            klientId={klientId}
            authorId={authorId}
            asKlient={asKlient}
            onDone={() => setAdding(false)}
          />
        </div>
      )}

      {ziele.length === 0 ? (
        <p className="text-[13px] text-soft">Noch kein Ziel gesetzt.</p>
      ) : (
        <ul className="space-y-3">
          {ziele.map((z) => (
            <ZielCard key={z.id} ziel={z} authorId={authorId} asKlient={asKlient} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ZielForm({ klientId, authorId, asKlient, onDone }: { klientId: string; authorId: string; asKlient: boolean; onDone: () => void }) {
  const [kategorie, setKategorie] = useState<ZielKategorie>("freude_sinn");
  const [wunsch, setWunsch] = useState("");
  const [schritt, setSchritt] = useState("");
  const [prio, setPrio] = useState<1 | 2 | 3>(2);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const r = await setzeZiel({
        klientId,
        kategorie,
        wunsch,
        schritt: schritt || undefined,
        prioritaet: prio,
        bezugsperson: asKlient ? undefined : authorId,
      });
      if (r.ok) onDone();
      else setErr(r.error);
    });
  };

  return (
    <div className="surface-mute rounded-xl p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium mb-1">Kategorie</label>
          <select value={kategorie} onChange={(e) => setKategorie(e.target.value as ZielKategorie)} className="select text-[13px]">
            {(Object.entries(ZIEL_LABEL) as [ZielKategorie, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1">Wichtigkeit</label>
          <div className="flex gap-1.5">
            {([1, 2, 3] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPrio(p)}
                className="chip text-[12px] flex-1"
                style={{
                  background: prio === p ? "rgb(var(--vibe-team) / 0.18)" : "rgb(var(--bg-mute))",
                  color: prio === p ? "rgb(var(--vibe-team))" : "rgb(var(--fg-mute))",
                }}
              >
                {p === 1 ? "wichtig" : p === 2 ? "mittel" : "nice-to-have"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-medium mb-1">
          {asKlient ? "Was möchte ich? (in meinen Worten)" : "Wunsch der Klientin/des Klienten"}
        </label>
        <textarea
          value={wunsch}
          onChange={(e) => setWunsch(e.target.value)}
          rows={2}
          placeholder={asKlient
            ? "z.B. „Ich möchte sonntags wieder mit meiner Tochter telefonieren."
            : "Klient hat formuliert: …"}
          className="textarea text-[13px]"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium mb-1">Erster konkreter Schritt (optional)</label>
        <textarea
          value={schritt}
          onChange={(e) => setSchritt(e.target.value)}
          rows={2}
          placeholder="Was wäre ein erster, kleiner Schritt?"
          className="textarea text-[13px]"
        />
      </div>

      {err && <div className="text-[12px] rounded-lg p-2" style={{ background: "rgb(var(--mon) / 0.1)", color: "rgb(var(--mon))" }}>{err}</div>}

      <div className="flex justify-end gap-2 pt-2 border-t border-app-soft">
        <button onClick={onDone} className="btn btn-ghost text-[13px]">Abbrechen</button>
        <button onClick={submit} disabled={pending || !wunsch.trim()} className="btn btn-primary text-[13px]">
          {pending ? "..." : "Ziel setzen"}
        </button>
      </div>
    </div>
  );
}

function ZielCard({ ziel, authorId, asKlient }: { ziel: Lebensziel; authorId: string; asKlient: boolean }) {
  const [pending, start] = useTransition();
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const farbe = ZIEL_FARBE[ziel.kategorie];

  const setStatus = (status: ZielStatus) => start(async () => { await setzeStatus(ziel.id, status); });
  const setProgress = (pct: number) => start(async () => { await aktualisiereZiel(ziel.id, { fortschrittPct: pct }); });
  const addNote = () => start(async () => {
    if (!note.trim()) return;
    await notiereZum(ziel.id, authorId, note);
    setNote(""); setShowNote(false);
  });

  return (
    <li className="surface-mute rounded-xl p-3.5 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5">
        <header className="flex items-baseline gap-2 flex-wrap mb-1">
          <span className="chip text-[10px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
            {ZIEL_LABEL[ziel.kategorie]}
          </span>
          <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
            {ZIEL_STATUS_LABEL[ziel.status]}
          </span>
          <span className="text-[10px] text-soft font-mono">
            Prio {ziel.prioritaet} · {ziel.fortschrittPct}%
          </span>
        </header>
        <p className="text-[14px] font-medium leading-snug">„{ziel.wunsch}"</p>
        {ziel.schritt && (
          <p className="text-[12px] text-mute mt-1">→ {ziel.schritt}</p>
        )}

        {/* Fortschritt */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full surface overflow-hidden">
            <div className="h-full" style={{ width: `${ziel.fortschrittPct}%`, background: `rgb(${farbe})` }} />
          </div>
          {!asKlient && (
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={ziel.fortschrittPct}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-24"
              disabled={pending}
              style={{ accentColor: `rgb(${farbe})` }}
            />
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          <button onClick={() => setShowDetails((s) => !s)} className="btn btn-ghost text-[11px]">
            {showDetails ? "× Details" : `Notizen (${ziel.notizen.length})`}
          </button>
          {!asKlient && ziel.status !== "erreicht" && (
            <button onClick={() => setStatus("erreicht")} disabled={pending} className="btn text-[11px]" style={{ color: "rgb(var(--thu))" }}>
              ✓ erreicht
            </button>
          )}
          {!asKlient && ziel.status !== "pausiert" && ziel.status !== "erreicht" && (
            <button onClick={() => setStatus("pausiert")} disabled={pending} className="btn btn-ghost text-[11px]">
              ⏸ pausieren
            </button>
          )}
          <button onClick={() => setShowNote((s) => !s)} className="btn btn-ghost text-[11px]">
            + Notiz
          </button>
        </div>

        {showNote && (
          <div className="mt-2 flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Beobachtung, Fortschritt, Hindernis …"
              className="input text-[12px] flex-1"
            />
            <button onClick={addNote} disabled={pending || !note.trim()} className="btn btn-primary text-[12px]">
              speichern
            </button>
          </div>
        )}

        {showDetails && ziel.notizen.length > 0 && (
          <ul className="mt-2 space-y-1.5 text-[12px]">
            {ziel.notizen.slice().reverse().map((n, i) => (
              <li key={i} className="surface rounded-lg p-2.5">
                <div className="text-[10px] text-soft font-mono mb-0.5">
                  {new Date(n.at).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · {n.by}
                </div>
                <div className="text-[12px]">{n.text}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
