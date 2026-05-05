"use client";

// KiDienstplanGenerator · Client-UI ruft /api/ai/dienstplan auf,
// rendert das Ergebnis als Bilanz-Tabelle + Tagesvergabe-Chip-Zeile.
//
// Demo-Charakter: zeigt JSON-Tokens, Kosten, Begründung, Constraint-Check.
// Schickt einen Zugangs-Key im X-Shalem-Key-Header (Default 31337,
// gemerkt in localStorage damit der User es nur einmal eingibt).

import { useEffect, useState } from "react";

const KEY_LS = "shalem-dienstplan-key";

type SchichtTyp = "frueh" | "spaet" | "nacht" | "tag" | "geteilter_dienst";

type Zuweisung = {
  personId: string;
  datumISO: string;
  schicht: SchichtTyp;
  startHHMM: string;
  endHHMM: string;
  dauerH?: number;
  bereich?: string;
  begruendung?: string;
};

function dauerVon(z: Zuweisung): number {
  if (typeof z.dauerH === "number") return z.dauerH;
  const [sh, sm] = (z.startHHMM ?? "00:00").split(":").map(Number);
  const [eh, em] = (z.endHHMM ?? "00:00").split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;  // Nachtschicht über Mitternacht
  return Math.round((mins / 60) * 10) / 10;
}

type PlanErgebnis = {
  zeitraum: { jahr: number; monat: number };
  zuweisungen: Zuweisung[];
  stundenBilanz: { personId: string; name: string; soll: number; geplant: number; saldo: number }[];
  constraintsCheck: {
    arbeitszeitOk: boolean;
    ruhezeitOk: boolean;
    wochenendeFair: boolean;
    befunde: string[];
  };
  kommentar: string;
  rawOutput?: string;
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
  planId?: string;
};

type GruppeStatus = {
  beruf: string;
  personenAnzahl: number;
  ok: boolean;
  fehler?: string;
  dauerMs: number;
};

type MultiPlanErgebnis = PlanErgebnis & {
  gruppen?: GruppeStatus[];
  dauerMs?: number;
  erfolgreich?: number;
  gesamtPersonen?: number;
  demoFallback?: boolean;
  demoGrund?: string;
};

type HistoryEintrag = {
  id: string;
  erstelltAm: string;
  zeitraum: { jahr: number; monat: number };
  nurBeruf: string | null;
  hinweis: string | null;
  uebernommen: boolean;
  uebernommenAm: string | null;
  zuweisungenAnzahl: number;
  personenAnzahl: number;
  kostenEur: number;
  kommentarKurz: string;
};

const SCHICHT_FARBE: Record<SchichtTyp, string> = {
  frueh: "var(--mon)",
  spaet: "var(--wed)",
  nacht: "var(--sat)",
  tag: "var(--thu)",
  geteilter_dienst: "var(--fri)",
};

const SCHICHT_LABEL: Record<SchichtTyp, string> = {
  frueh: "F",
  spaet: "S",
  nacht: "N",
  tag: "T",
  geteilter_dienst: "G",
};

type Props = {
  defaultJahr: number;
  defaultMonat: number;
};

export function KiDienstplanGenerator({ defaultJahr, defaultMonat }: Props) {
  const [jahr, setJahr] = useState(defaultJahr);
  const [monat, setMonat] = useState(defaultMonat);
  const [hinweis, setHinweis] = useState("");
  const [nurBeruf, setNurBeruf] = useState<string>("");
  const [zugangsKey, setZugangsKey] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [ergebnis, setErgebnis] = useState<MultiPlanErgebnis | null>(null);
  const [ganzLoading, setGanzLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEintrag[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(KEY_LS);
    if (stored) setZugangsKey(stored);
  }, []);

  // History initial laden + nach jeder Aktion neu ziehen
  useEffect(() => {
    if (zugangsKey) ladeHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zugangsKey]);

  async function ladeHistory() {
    if (!zugangsKey) return;
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/ai/dienstplan/history", {
        headers: { "X-Shalem-Key": zugangsKey },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.eintraege)) setHistory(data.eintraege);
    } catch { /* ignore */ }
    finally { setHistoryLoading(false); }
  }

  async function historyAction(id: string, action: string, extra: Record<string, unknown> = {}) {
    const res = await fetch("/api/ai/dienstplan/history", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shalem-Key": zugangsKey },
      body: JSON.stringify({ id, action, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
    return data;
  }

  async function ladePlanById(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/dienstplan/history/${id}`, {
        headers: { "X-Shalem-Key": zugangsKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setErgebnis({ ...data.ergebnis, planId: data.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function bestaetige(id: string) {
    setError(null);
    try {
      await historyAction(id, "uebernehmen");
      await ladeHistory();
      // Aktuelles Ergebnis ggf. aktualisieren
      if (ergebnis?.planId === id) {
        setErgebnis(ergebnis);  // Re-render, history sagt jetzt "uebernommen"
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function entkoppele(id: string) {
    setError(null);
    try {
      await historyAction(id, "entkoppeln");
      await ladeHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function loescheEintrag(id: string) {
    if (!window.confirm("Diesen Plan wirklich aus der Historie löschen?")) return;
    setError(null);
    try {
      await historyAction(id, "loeschen");
      if (ergebnis?.planId === id) setErgebnis(null);
      await ladeHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function entferneZuweisung(planId: string, idxInZuweisungen: number) {
    if (!ergebnis) return;
    setError(null);
    try {
      await historyAction(planId, "delete-zuweisung", { indexInZuweisungen: idxInZuweisungen });
      // Lokal aus Anzeige entfernen
      const neue = [...ergebnis.zuweisungen];
      neue.splice(idxInZuweisungen, 1);
      setErgebnis({ ...ergebnis, zuweisungen: neue });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function generieren() {
    setLoading(true);
    setError(null);
    try {
      // Key persistieren wenn der Aufruf gleich gleich klappt
      if (typeof window !== "undefined" && zugangsKey) {
        window.localStorage.setItem(KEY_LS, zugangsKey);
      }
      const res = await fetch("/api/ai/dienstplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shalem-Key": zugangsKey,
        },
        body: JSON.stringify({
          jahr,
          monat,
          hinweis: hinweis.trim() || undefined,
          nurBeruf: nurBeruf || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setErgebnis(data as MultiPlanErgebnis);
      // History neu laden, damit die neue Generierung als Eintrag #1 erscheint
      void ladeHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function generiereGanz() {
    setGanzLoading(true);
    setError(null);
    try {
      if (typeof window !== "undefined" && zugangsKey) {
        window.localStorage.setItem(KEY_LS, zugangsKey);
      }
      const res = await fetch("/api/ai/dienstplan/ganz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shalem-Key": zugangsKey,
        },
        body: JSON.stringify({
          jahr,
          monat,
          hinweis: hinweis.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setErgebnis(data as MultiPlanErgebnis);
      void ladeHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGanzLoading(false);
    }
  }

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 mb-6">
      <header className="flex items-baseline justify-between gap-2 flex-wrap mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">KI-Monatsplan · Live-Simulation</p>
          <h2 className="font-display text-[20px] font-bold tracking-tight2">Plan generieren lassen</h2>
        </div>
        <span className="text-[11px] text-mute italic">
          Claude erzeugt einen Vorschlag aus Soll-Stunden + ArbZG. Du übernimmst nur, was passt.
        </span>
      </header>

      <p className="text-[11px] text-mute italic mb-3 max-w-prose">
        Hinweis: Server-seitig auf max. 8 Personen pro Aufruf gekappt — sonst sprengt der
        JSON-Output das Hostinger-Gateway-Timeout. Filter "Nur Beruf" hilft die Auswahl
        gezielt zu lenken.
      </p>

      <div className="grid sm:grid-cols-5 gap-3 mb-4">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium block mb-1">Jahr</span>
          <input
            type="number"
            min={2025}
            max={2030}
            value={jahr}
            onChange={(e) => setJahr(Number(e.target.value))}
            className="w-full surface-mute rounded-md px-2.5 py-1.5 text-[13px] font-mono"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium block mb-1">Monat</span>
          <input
            type="number"
            min={1}
            max={12}
            value={monat}
            onChange={(e) => setMonat(Number(e.target.value))}
            className="w-full surface-mute rounded-md px-2.5 py-1.5 text-[13px] font-mono"
          />
        </label>
        <label className="block sm:col-span-3">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium block mb-1">Nur Beruf (optional)</span>
          <select
            value={nurBeruf}
            onChange={(e) => setNurBeruf(e.target.value)}
            className="w-full surface-mute rounded-md px-2.5 py-1.5 text-[13px]"
          >
            <option value="">Alle Berufe</option>
            <option value="pflege">Pflege</option>
            <option value="therapie">Therapie</option>
            <option value="sozialarbeit">Sozialarbeit</option>
            <option value="lead">Leitung</option>
          </select>
        </label>
      </div>

      <label className="block mb-4">
        <span className="text-[10px] uppercase tracking-wider text-soft font-medium block mb-1">
          Zusatz-Hinweis (Urlaube, Wünsche, Sondersituationen)
        </span>
        <textarea
          value={hinweis}
          onChange={(e) => setHinweis(e.target.value)}
          placeholder="z.B. Yvonne ist 12.-19. im Urlaub. Dennis möchte das Wochenende 17./18. frei. Aylin nur Frühschichten."
          rows={2}
          className="w-full surface-mute rounded-md px-3 py-2 text-[13px] leading-relaxed resize-y"
        />
      </label>

      <label className="block mb-4">
        <span className="text-[10px] uppercase tracking-wider text-soft font-medium block mb-1">
          Zugangs-Key (optional)
        </span>
        <input
          type="password"
          value={zugangsKey}
          onChange={(e) => setZugangsKey(e.target.value)}
          placeholder="leer lassen für Demo-Plan ohne KI-Aufruf"
          className="w-full sm:max-w-xs surface-mute rounded-md px-3 py-2 text-[13px] font-mono"
          autoComplete="off"
        />
        <span className="text-[10px] text-mute italic block mt-1">
          Mit Key: Live-Sonnet-Plan via Anthropic. Ohne Key: deterministischer Demo-Plan
          (rotation-v1, kein KI-Aufruf, keine Kosten). ENV: <code className="font-mono">SHALEM_DIENSTPLAN_KEY</code>.
        </span>
      </label>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={generieren}
          disabled={loading || ganzLoading}
          className="px-4 py-2 rounded-md text-[13px] font-medium transition-all"
          style={{
            background: "rgb(var(--accent) / 0.18)",
            color: "rgb(var(--accent))",
            boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.4)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Plan wird gerechnet …" : "✦ KI-Plan · gefilterte Auswahl (max 8)"}
        </button>
        <button
          type="button"
          onClick={generiereGanz}
          disabled={loading || ganzLoading}
          className="px-4 py-2 rounded-md text-[13px] font-medium transition-all"
          style={{
            background: "rgb(var(--thu) / 0.15)",
            color: "rgb(var(--thu))",
            boxShadow: "inset 0 0 0 1px rgb(var(--thu) / 0.45)",
            opacity: ganzLoading ? 0.6 : 1,
          }}
        >
          {ganzLoading ? "Belegschaft wird verteilt …" : "✦ Ganze Belegschaft · alle Berufe parallel"}
        </button>
        {error && <span className="text-[12px] text-soft italic">{error}</span>}
      </div>
      {ganzLoading && (
        <p className="text-[11px] text-mute italic mt-2">
          Multi-Call läuft: pro Berufsgruppe wird ein eigener Sonnet-Aufruf gestartet (parallel).
          Wallclock typisch 30-50 s — Geduld bitte, der Browser-Tab darf offen bleiben.
        </p>
      )}

      {history.length > 0 && (
        <details className="mt-5 surface-mute rounded-lg p-3" open>
          <summary className="text-[11px] uppercase tracking-wider text-soft font-medium cursor-pointer">
            Letzte Generierungen ({history.length}{historyLoading ? " · lädt …" : ""})
          </summary>
          <ul className="mt-3 space-y-2">
            {history.map((h) => {
              const aktiv = ergebnis?.planId === h.id;
              return (
                <li
                  key={h.id}
                  className="rounded-md p-2.5 transition-all"
                  style={{
                    background: h.uebernommen
                      ? "rgb(var(--thu) / 0.10)"
                      : aktiv ? "rgb(var(--accent) / 0.08)" : "transparent",
                    boxShadow: h.uebernommen
                      ? "inset 0 0 0 1px rgb(var(--thu) / 0.3)"
                      : aktiv ? "inset 0 0 0 1px rgb(var(--accent) / 0.25)" : "inset 0 0 0 1px rgb(var(--fg-mute) / 0.1)",
                  }}
                >
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] tabular-nums">
                        {new Date(h.erstelltAm).toLocaleString("de-DE", {
                          day: "2-digit", month: "2-digit",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      <span className="text-[11px] text-soft">·</span>
                      <span className="text-[11px]">
                        {h.zeitraum.jahr}-{String(h.zeitraum.monat).padStart(2, "0")} ·
                        {" "}{h.personenAnzahl} Personen ·
                        {" "}{h.zuweisungenAnzahl} Schichten
                      </span>
                      {h.nurBeruf && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded surface" style={{ color: "rgb(var(--accent))" }}>
                          {h.nurBeruf}
                        </span>
                      )}
                      {h.uebernommen && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: "rgb(var(--thu) / 0.18)", color: "rgb(var(--thu))" }}>
                          ✓ aktiv im Dienstplan
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-mute font-mono">
                      {h.kostenEur.toFixed(4)} €
                    </span>
                  </div>
                  {h.kommentarKurz && (
                    <p className="text-[12px] text-soft italic leading-snug mb-1.5">"{h.kommentarKurz}"</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => ladePlanById(h.id)}
                      className="text-[11px] px-2 py-0.5 rounded transition-colors text-mute hover:text-[rgb(var(--accent))]"
                    >
                      öffnen
                    </button>
                    {!h.uebernommen ? (
                      <button
                        type="button"
                        onClick={() => bestaetige(h.id)}
                        className="text-[11px] px-2 py-0.5 rounded transition-all"
                        style={{ color: "rgb(var(--thu))", boxShadow: "inset 0 0 0 1px rgb(var(--thu) / 0.4)" }}
                      >
                        ✓ bestätigen
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => entkoppele(h.id)}
                        className="text-[11px] px-2 py-0.5 rounded transition-colors text-mute hover:text-[rgb(var(--fg))]"
                      >
                        entkoppeln
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => loescheEintrag(h.id)}
                      className="text-[11px] px-2 py-0.5 rounded text-mute hover:text-[rgb(var(--sat))] transition-colors ml-auto"
                    >
                      löschen
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </details>
      )}

      {ergebnis && (
        <div className="mt-6 space-y-5">
          {ergebnis.demoFallback && (
            <div
              className="rounded-lg p-3 flex items-baseline gap-2 flex-wrap"
              style={{
                background: "linear-gradient(135deg, rgb(var(--accent) / 0.10), rgb(var(--thu) / 0.06))",
                boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)",
              }}
            >
              <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "rgb(var(--accent))" }}>
                ⓘ Demo-Plan
              </span>
              <span className="text-[12px] text-soft">
                {ergebnis.demoGrund ?? "Deterministisch generiert · kein KI-Aufruf · für Live-Anthropic-Plan Zugangs-Key eintragen."}
              </span>
            </div>
          )}

          {ergebnis.zuweisungen.length === 0 && ergebnis.stundenBilanz.length === 0 && (
            <div
              className="rounded-lg p-4"
              style={{ background: "rgb(var(--sat) / 0.1)", boxShadow: "inset 0 0 0 1px rgb(var(--sat) / 0.3)" }}
            >
              <p className="text-[12px] font-medium" style={{ color: "rgb(var(--sat))" }}>
                ⚠ Plan kam leer zurück — Modell-Antwort konnte nicht geparst werden
              </p>
              <p className="text-[12px] text-soft mt-1 leading-relaxed">
                {ergebnis.kommentar && <span className="block mb-2 italic">"{ergebnis.kommentar}"</span>}
                Probier es nochmal · Filter "Nur Beruf" reduziert die Komplexität.
              </p>
              {ergebnis.rawOutput && (
                <details className="mt-3">
                  <summary className="text-[11px] uppercase tracking-wider text-soft font-medium cursor-pointer">
                    Modell-Rohantwort (erste 1500 Zeichen) anzeigen
                  </summary>
                  <pre className="text-[11px] font-mono mt-2 p-2 rounded surface-mute overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {ergebnis.rawOutput}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="rounded-lg p-4 surface-mute">
            <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
              <p className="text-[10px] uppercase tracking-wider text-soft font-medium">
                Kommentar · {ergebnis.provider} {ergebnis.model}
                {" · "}
                {ergebnis.tokens.input + ergebnis.tokens.output} Tokens · {ergebnis.kostenEur.toFixed(4)} €
              </p>
              {ergebnis.planId && (
                (() => {
                  const eintrag = history.find((h) => h.id === ergebnis.planId);
                  const istUebernommen = eintrag?.uebernommen ?? false;
                  return istUebernommen ? (
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1.5"
                      style={{ background: "rgb(var(--thu) / 0.18)", color: "rgb(var(--thu))" }}
                    >
                      ✓ aktiv im Dienstplan
                      <button
                        type="button"
                        onClick={() => entkoppele(ergebnis.planId!)}
                        className="text-[10px] underline-offset-2 hover:underline opacity-70"
                      >
                        entkoppeln
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => bestaetige(ergebnis.planId!)}
                      className="text-[12px] px-3 py-1 rounded-md font-medium transition-all"
                      style={{
                        color: "rgb(var(--thu))",
                        boxShadow: "inset 0 0 0 1px rgb(var(--thu) / 0.5)",
                      }}
                    >
                      ✓ Bestätigen + im Dienstplan anzeigen
                    </button>
                  );
                })()
              )}
            </div>
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{ergebnis.kommentar}</p>
          </div>

          {/* Multi-Call · Pro-Beruf-Status (nur bei /ganz) */}
          {ergebnis.gruppen && ergebnis.gruppen.length > 0 && (
            <div className="rounded-lg p-4 surface-mute">
              <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium">
                  Multi-Call · {ergebnis.erfolgreich}/{ergebnis.gruppen.length} Berufe ok ·
                  {" "}{ergebnis.gesamtPersonen} Personen ·
                  {" "}{ergebnis.dauerMs ? Math.round(ergebnis.dauerMs / 100) / 10 : "—"} s wallclock
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ergebnis.gruppen.map((g) => (
                  <div
                    key={g.beruf}
                    className="rounded-md p-2 text-[12px]"
                    style={{
                      background: g.ok ? "rgb(var(--thu) / 0.10)" : "rgb(var(--sat) / 0.10)",
                      boxShadow: `inset 0 0 0 1px rgb(var(--${g.ok ? "thu" : "sat"}) / 0.3)`,
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-medium">{g.beruf}</span>
                      <span className="text-[10px] font-mono text-mute">
                        {Math.round(g.dauerMs / 100) / 10}s
                      </span>
                    </div>
                    <p className="text-[10px] text-soft mt-0.5">
                      {g.ok ? `✓ ${g.personenAnzahl} Personen geplant` : `⚠ ${g.fehler?.slice(0, 80) ?? "Fehler"}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraint-Check */}
          <div className="grid sm:grid-cols-3 gap-2">
            <ConstraintBadge ok={ergebnis.constraintsCheck.arbeitszeitOk} label="Arbeitszeit · max 10 h/Tag" />
            <ConstraintBadge ok={ergebnis.constraintsCheck.ruhezeitOk} label="Ruhezeit · 11 h zwischen Schichten" />
            <ConstraintBadge ok={ergebnis.constraintsCheck.wochenendeFair} label="Wochenende fair verteilt" />
          </div>

          {ergebnis.constraintsCheck.befunde.length > 0 && (
            <div className="rounded-lg p-3 surface-mute">
              <p className="text-[10px] uppercase tracking-wider text-soft mb-1 font-medium">Hinweise</p>
              <ul className="text-[12px] space-y-0.5 list-disc pl-4">
                {ergebnis.constraintsCheck.befunde.map((b, i) => (
                  <li key={i} className="text-soft">{b}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Stunden-Bilanz */}
          {ergebnis.stundenBilanz.length > 0 && (
            <div>
              <h3 className="text-[14px] font-bold tracking-tight2 mb-2">Stunden-Bilanz</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] border-collapse">
                  <thead>
                    <tr className="text-left text-soft">
                      <th className="px-2 py-1.5 font-medium">Person</th>
                      <th className="px-2 py-1.5 font-medium font-mono text-right">Soll</th>
                      <th className="px-2 py-1.5 font-medium font-mono text-right">Geplant</th>
                      <th className="px-2 py-1.5 font-medium font-mono text-right">Saldo</th>
                      <th className="px-2 py-1.5 font-medium">Auslastung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ergebnis.stundenBilanz.map((b) => {
                      const aus = b.soll > 0 ? Math.round((b.geplant / b.soll) * 100) : 0;
                      const farbe = aus >= 95 && aus <= 105 ? "var(--thu)" : aus < 90 ? "var(--sat)" : "var(--wed)";
                      return (
                        <tr key={b.personId} className="border-t border-soft">
                          <td className="px-2 py-1.5">{b.name}</td>
                          <td className="px-2 py-1.5 font-mono text-right">{b.soll}</td>
                          <td className="px-2 py-1.5 font-mono text-right">{b.geplant}</td>
                          <td
                            className="px-2 py-1.5 font-mono text-right"
                            style={{ color: b.saldo === 0 ? "rgb(var(--thu))" : b.saldo < 0 ? "rgb(var(--sat))" : "rgb(var(--wed))" }}
                          >
                            {b.saldo > 0 ? "+" : ""}{b.saldo}
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded surface-mute overflow-hidden" style={{ minWidth: 80 }}>
                                <div
                                  className="h-full"
                                  style={{ width: `${Math.min(aus, 110)}%`, background: `rgb(${farbe})` }}
                                />
                              </div>
                              <span className="font-mono text-[11px]" style={{ color: `rgb(${farbe})` }}>{aus} %</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Zuweisungen pro Person */}
          {ergebnis.zuweisungen.length > 0 && (
            <div>
              <h3 className="text-[14px] font-bold tracking-tight2 mb-2">
                Tagesvergabe · {ergebnis.zuweisungen.length} Zuweisungen
              </h3>
              <ZuweisungsListe
                zuweisungen={ergebnis.zuweisungen}
                bilanz={ergebnis.stundenBilanz}
                onDelete={ergebnis.planId ? (idx) => entferneZuweisung(ergebnis.planId!, idx) : undefined}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ConstraintBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-[12px] flex items-center gap-2"
      style={{
        background: ok ? "rgb(var(--thu) / 0.12)" : "rgb(var(--sat) / 0.12)",
        boxShadow: `inset 0 0 0 1px rgb(var(--${ok ? "thu" : "sat"}) / 0.3)`,
      }}
    >
      <span aria-hidden style={{ color: `rgb(var(--${ok ? "thu" : "sat"}))` }}>{ok ? "✓" : "⚠"}</span>
      <span>{label}</span>
    </div>
  );
}

function ZuweisungsListe({
  zuweisungen,
  bilanz,
  onDelete,
}: {
  zuweisungen: Zuweisung[];
  bilanz: PlanErgebnis["stundenBilanz"];
  onDelete?: (idxInZuweisungen: number) => void;
}) {
  const nameMap = new Map(bilanz.map((b) => [b.personId, b.name] as const));
  // Originalindex pro Zuweisung merken — wichtig für Server-side Delete
  const proPerson = new Map<string, { z: Zuweisung; origIdx: number }[]>();
  zuweisungen.forEach((z, origIdx) => {
    const arr = proPerson.get(z.personId) ?? [];
    arr.push({ z, origIdx });
    proPerson.set(z.personId, arr);
  });
  for (const arr of proPerson.values()) {
    arr.sort((a, b) => a.z.datumISO.localeCompare(b.z.datumISO));
  }

  return (
    <ul className="space-y-2.5">
      {[...proPerson.entries()].map(([personId, zs]) => (
        <li key={personId} className="surface-mute rounded-lg p-3">
          <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
            <span className="text-[13px] font-medium">{nameMap.get(personId) ?? personId}</span>
            <span className="text-[11px] text-soft">{zs.length} Schichten · {Math.round(zs.reduce((s, item) => s + dauerVon(item.z), 0) * 10) / 10} h gesamt</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {zs.map((item) => {
              const z = item.z;
              const farbe = SCHICHT_FARBE[z.schicht] ?? "var(--accent)";
              const tooltip = [
                z.bereich,
                `${z.startHHMM}–${z.endHHMM}`,
                z.begruendung,
              ].filter(Boolean).join(" · ");
              return (
                <span
                  key={item.origIdx}
                  title={tooltip}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono group"
                  style={{
                    background: `rgb(${farbe} / 0.15)`,
                    color: `rgb(${farbe})`,
                    boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.3)`,
                  }}
                >
                  <span>{z.datumISO.slice(5)}</span>
                  <span className="font-bold">{SCHICHT_LABEL[z.schicht]}</span>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Schicht ${z.datumISO} (${SCHICHT_LABEL[z.schicht]}) entfernen?`)) {
                          onDelete(item.origIdx);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-[10px] hover:font-bold"
                      title="Schicht entfernen"
                      aria-label="Schicht entfernen"
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}
