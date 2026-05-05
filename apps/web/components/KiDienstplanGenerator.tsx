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
  dauerH: number;
  bereich: string;
  begruendung?: string;
};

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
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
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
  const [ergebnis, setErgebnis] = useState<PlanErgebnis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(KEY_LS);
    if (stored) setZugangsKey(stored);
  }, []);

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
      setErgebnis(data as PlanErgebnis);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
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
          Zugangs-Key
        </span>
        <input
          type="password"
          value={zugangsKey}
          onChange={(e) => setZugangsKey(e.target.value)}
          placeholder="erforderlich · einmal eingeben, wird im Browser gespeichert"
          className="w-full sm:max-w-xs surface-mute rounded-md px-3 py-2 text-[13px] font-mono"
          autoComplete="off"
        />
        <span className="text-[10px] text-mute italic block mt-1">
          Verhindert Anthropic-Budget-Verbrennung durch zufällige Demo-Besucher:innen.
          Default in der ENV: <code className="font-mono">SHALEM_DIENSTPLAN_KEY</code>.
        </span>
      </label>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={generieren}
          disabled={loading}
          className="px-4 py-2 rounded-md text-[13px] font-medium transition-all"
          style={{
            background: "rgb(var(--accent) / 0.18)",
            color: "rgb(var(--accent))",
            boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.4)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Plan wird gerechnet …" : "✦ KI-Plan generieren"}
        </button>
        {error && <span className="text-[12px] text-soft italic">{error}</span>}
      </div>

      {ergebnis && (
        <div className="mt-6 space-y-5">
          {ergebnis.zuweisungen.length === 0 && ergebnis.stundenBilanz.length === 0 && (
            <div
              className="rounded-lg p-4"
              style={{ background: "rgb(var(--sat) / 0.1)", boxShadow: "inset 0 0 0 1px rgb(var(--sat) / 0.3)" }}
            >
              <p className="text-[12px] font-medium" style={{ color: "rgb(var(--sat))" }}>
                ⚠ Plan kam leer zurück
              </p>
              <p className="text-[12px] text-soft mt-1 leading-relaxed">
                Vermutlich Token-Limit überschritten oder JSON-Antwort abgebrochen. Probier mit
                weniger Personen (Filter "Nur Beruf") oder kürzerem Hinweis nochmal. {ergebnis.kommentar && (
                  <span className="block mt-2 italic">"{ergebnis.kommentar}"</span>
                )}
              </p>
            </div>
          )}

          <div className="rounded-lg p-4 surface-mute">
            <p className="text-[10px] uppercase tracking-wider text-soft mb-1 font-medium">
              Kommentar · {ergebnis.provider} {ergebnis.model}
              {" · "}
              {ergebnis.tokens.input + ergebnis.tokens.output} Tokens · {ergebnis.kostenEur.toFixed(4)} €
            </p>
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{ergebnis.kommentar}</p>
          </div>

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
              <ZuweisungsListe zuweisungen={ergebnis.zuweisungen} bilanz={ergebnis.stundenBilanz} />
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
}: {
  zuweisungen: Zuweisung[];
  bilanz: PlanErgebnis["stundenBilanz"];
}) {
  const nameMap = new Map(bilanz.map((b) => [b.personId, b.name] as const));
  const proPerson = new Map<string, Zuweisung[]>();
  for (const z of zuweisungen) {
    const arr = proPerson.get(z.personId) ?? [];
    arr.push(z);
    proPerson.set(z.personId, arr);
  }
  for (const arr of proPerson.values()) {
    arr.sort((a, b) => a.datumISO.localeCompare(b.datumISO));
  }

  return (
    <ul className="space-y-2.5">
      {[...proPerson.entries()].map(([personId, zs]) => (
        <li key={personId} className="surface-mute rounded-lg p-3">
          <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
            <span className="text-[13px] font-medium">{nameMap.get(personId) ?? personId}</span>
            <span className="text-[11px] text-soft">{zs.length} Schichten · {zs.reduce((s, z) => s + z.dauerH, 0)} h gesamt</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {zs.map((z, i) => {
              const farbe = SCHICHT_FARBE[z.schicht] ?? "var(--accent)";
              return (
                <span
                  key={i}
                  title={`${z.bereich} · ${z.startHHMM}–${z.endHHMM}${z.begruendung ? ` · ${z.begruendung}` : ""}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono"
                  style={{
                    background: `rgb(${farbe} / 0.15)`,
                    color: `rgb(${farbe})`,
                    boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.3)`,
                  }}
                >
                  <span>{z.datumISO.slice(5)}</span>
                  <span className="font-bold">{SCHICHT_LABEL[z.schicht]}</span>
                </span>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}
