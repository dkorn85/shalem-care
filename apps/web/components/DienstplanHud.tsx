"use client";

// DienstplanHud · die zentrale PDL-Arbeitsfläche.
//
// Aufbau:
//   ┌─ Filter-Bar (Einrichtung · Station · Wochen · Rolle · Qualifikation · Re-Generate)
//   ├─ KPI-Strip (Coverage · Offene Schichten · Konflikte · Lohnkosten · Wunsch-Score)
//   ├─ Konflikt-Strip (kompakt, klickbar)
//   ├─ Person × Tag-Matrix (Hauptarbeitsfläche · scrollbar)
//   │    Zellen: gefärbte Schicht-Kürzel mit Konflikt-Marker, Wunsch-Indikator,
//   │           Click → Schicht-Editor-Popover
//   ├─ Soll/Ist-Footer pro Tag
//   └─ KI-Aktions-Panel (rechts, sticky)
//
// State liegt komplett im Client — Hud wird als initialData übergeben,
// regenerate() ruft die Server-Action mit neuem Seed.

import { useState, useTransition, useMemo, useEffect } from "react";
import type {
  DienstplanHud,
  HudFilter,
  KiAktionsErgebnis,
  SchichtKuerzel,
} from "@/lib/dienstplan/hud-store";
import {
  SCHICHT_LABEL,
  SCHICHT_FARBE,
  SCHICHT_STUNDEN,
  KONFLIKT_LABEL,
  alleKiAktionen,
} from "@/lib/dienstplan/hud-store";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function formatDate(iso: string): { wd: string; tag: string; istHeute: boolean; istWoEnde: boolean } {
  const d = new Date(iso);
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  const wdIdx = dow === 0 ? 6 : dow - 1;
  return {
    wd: WEEKDAYS[wdIdx],
    tag: `${d.getDate()}.${d.getMonth() + 1}.`,
    istHeute: d.getTime() === heute.getTime(),
    istWoEnde: dow === 0 || dow === 6,
  };
}

function formatEur(cents: number): string {
  return `${(cents / 100).toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`;
}

export type DienstplanHudProps = {
  einrichtungen: { id: string; name: string; shortName: string }[];
  stations: { id: string; einrichtungId: string; name: string; shortName: string; bedCount: number }[];
  qualifikationen: string[];
  initialFilter: HudFilter;
  initialHud: DienstplanHud;
  onApplyFilter: (filter: HudFilter) => Promise<DienstplanHud>;
  /** Optional: speichert den aktuellen Hud-Zustand. Wird in Phase-2 Supabase-persistent. */
  onSpeichern?: (titel: string, hud: DienstplanHud, mutations: PendingMutation[]) => Promise<{ ok: boolean; snapshotId?: string }>;
};

export type PendingMutation = {
  personId: string;
  personName: string;
  datumISO: string;
  vorher: string;
  nachher: string;
};

export function DienstplanHudView({
  einrichtungen,
  stations,
  qualifikationen,
  initialFilter,
  initialHud,
  onApplyFilter,
  onSpeichern,
}: DienstplanHudProps) {
  const [filter, setFilter] = useState<HudFilter>(initialFilter);
  const [hud, setHud] = useState<DienstplanHud>(initialHud);
  const [pending, startTransition] = useTransition();
  const [aktiveZelle, setAktiveZelle] = useState<{ personId: string; datumISO: string } | null>(null);
  const [aktiveAktion, setAktiveAktion] = useState<KiAktionsErgebnis | null>(null);
  const [editierModus, setEditierModus] = useState(false);
  const [pendingMutations, setPendingMutations] = useState<PendingMutation[]>([]);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [saveTitel, setSaveTitel] = useState("");

  // Beim Filter-Wechsel die Mutations leeren — neuer Plan, neue Edits
  useEffect(() => {
    setPendingMutations([]);
  }, [filter.einrichtungId, filter.stationId, filter.wochen, filter.seed]);

  const stationsForEinrichtung = useMemo(
    () => filter.einrichtungId ? stations.filter((s) => s.einrichtungId === filter.einrichtungId) : stations,
    [stations, filter.einrichtungId],
  );

  const apply = (next: HudFilter) => {
    setFilter(next);
    startTransition(async () => {
      const neu = await onApplyFilter(next);
      setHud(neu);
    });
  };

  const regenerate = () => apply({ ...filter, seed: (filter.seed ?? 0) + 1 });

  /** Mutiert eine Zelle lokal, trackt die Mutation für späteren Save. */
  const mutiereZelle = (personId: string, datumISO: string, neueSchicht: SchichtKuerzel) => {
    setHud((prev) => {
      const zeilen = prev.zeilen.map((z) => {
        if (z.person.id !== personId) return z;
        const alteZelle = z.tage[datumISO];
        if (!alteZelle) return z;
        const alteStunden = alteZelle.stunden;
        const neueStunden = SCHICHT_STUNDEN[neueSchicht];
        const neueZelle = { ...alteZelle, schicht: neueSchicht, stunden: neueStunden, quelle: "manuell" as const };
        return {
          ...z,
          istStunden: z.istStunden - alteStunden + neueStunden,
          tage: { ...z.tage, [datumISO]: neueZelle },
        };
      });
      return { ...prev, zeilen };
    });
    const z = hud.zeilen.find((zz) => zz.person.id === personId);
    if (z) {
      const alt = z.tage[datumISO]?.schicht ?? "_";
      setPendingMutations((m) => [
        ...m.filter((mm) => !(mm.personId === personId && mm.datumISO === datumISO)),
        { personId, personName: z.person.name, datumISO, vorher: alt, nachher: neueSchicht },
      ]);
    }
    setAktiveZelle(null);
  };

  const speichereJetzt = async () => {
    if (!onSpeichern) return;
    const titel = saveTitel.trim() || `${hud.station?.name ?? hud.einrichtung?.shortName ?? "Plan"} · ${new Date().toLocaleDateString("de-DE")}`;
    startTransition(async () => {
      const res = await onSpeichern(titel, hud, pendingMutations);
      if (res.ok) {
        setSavedToast(`✓ Gespeichert · ${pendingMutations.length} Mutation${pendingMutations.length === 1 ? "" : "en"} geloggt`);
        setPendingMutations([]);
        setSaveTitel("");
        setTimeout(() => setSavedToast(null), 3500);
      }
    });
  };

  const aktionen = useMemo(() => alleKiAktionen(hud), [hud]);

  const kiAktionFarbe: Record<KiAktionsErgebnis["art"], string> = {
    auto_fuell: "var(--vibe-team)",
    konflikt_loesen: "var(--mon)",
    wunsch_optimieren: "var(--accent)",
    krankheits_warnung: "var(--vibe-stats)",
    tausch_vorschlag: "var(--fri)",
  };
  const kiAktionLabel: Record<KiAktionsErgebnis["art"], string> = {
    auto_fuell: "Auto-Füllen",
    konflikt_loesen: "Konflikte lösen",
    wunsch_optimieren: "Wünsche optimieren",
    krankheits_warnung: "Krankheits-Warnung",
    tausch_vorschlag: "Tausch-Vorschläge",
  };

  return (
    <div className="space-y-3">
      {/* Filter-Bar */}
      <section
        className="rounded-2xl p-3 sm:p-4 surface flex flex-wrap items-end gap-3"
        style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.2)" }}
      >
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[10px] uppercase tracking-wider text-soft font-mono">Einrichtung</label>
          <select
            value={filter.einrichtungId ?? ""}
            onChange={(e) => apply({ ...filter, einrichtungId: e.target.value || undefined, stationId: undefined })}
            className="px-2 py-1.5 rounded-md surface-mute text-[12px] border-0 focus:outline-none focus:ring-2"
            disabled={pending}
          >
            <option value="">Alle Einrichtungen</option>
            {einrichtungen.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[10px] uppercase tracking-wider text-soft font-mono">Station</label>
          <select
            value={filter.stationId ?? ""}
            onChange={(e) => apply({ ...filter, stationId: e.target.value || undefined })}
            className="px-2 py-1.5 rounded-md surface-mute text-[12px] border-0 focus:outline-none focus:ring-2"
            disabled={pending}
          >
            <option value="">{filter.einrichtungId ? "Alle Stationen der Einrichtung" : "—"}</option>
            {stationsForEinrichtung.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.shortName})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-soft font-mono">Zeitraum</label>
          <select
            value={filter.wochen ?? 4}
            onChange={(e) => apply({ ...filter, wochen: Number(e.target.value) })}
            className="px-2 py-1.5 rounded-md surface-mute text-[12px] border-0"
            disabled={pending}
          >
            {[1, 2, 4, 6, 8].map((w) => (
              <option key={w} value={w}>{w} Wochen</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-soft font-mono">Rolle</label>
          <select
            value={filter.rolle ?? "alle"}
            onChange={(e) => apply({ ...filter, rolle: e.target.value as "nurse" | "lead" | "alle" })}
            className="px-2 py-1.5 rounded-md surface-mute text-[12px] border-0"
            disabled={pending}
          >
            <option value="alle">Alle</option>
            <option value="nurse">Pflege</option>
            <option value="lead">Leitung</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-soft font-mono">Qualifikation</label>
          <select
            value={filter.qualifikation ?? "alle"}
            onChange={(e) => apply({ ...filter, qualifikation: e.target.value })}
            className="px-2 py-1.5 rounded-md surface-mute text-[12px] border-0"
            disabled={pending}
          >
            <option value="alle">Alle</option>
            {qualifikationen.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setEditierModus(!editierModus)}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors inline-flex items-center gap-2"
            style={{
              background: editierModus ? "rgb(var(--mon))" : "transparent",
              color: editierModus ? "white" : "rgb(var(--mon))",
              boxShadow: editierModus ? undefined : "inset 0 0 0 1px rgb(var(--mon) / 0.4)",
            }}
            title="Edit-Modus toggeln · Zellen werden klickbar zum Ändern"
          >
            {editierModus ? "✎ Bearbeiten · aktiv" : "✎ Bearbeiten"}
          </button>

          <button
            type="button"
            onClick={regenerate}
            disabled={pending}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            style={{ background: "rgb(var(--accent))", color: "white" }}
            title="Generiert eine neue Plan-Variante mit anderem Rotation-Versatz"
          >
            {pending ? "…" : "↻"} Neu generieren
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium surface-mute hover:bg-[rgb(var(--bg-mute))] transition-colors"
          >
            Drucken
          </button>
        </div>
      </section>

      {/* Save-Bar wenn Mutations pending oder edit-modus + onSpeichern */}
      {(pendingMutations.length > 0 || (editierModus && onSpeichern)) && (
        <section
          className="rounded-2xl p-3 flex items-center gap-3 flex-wrap"
          style={{
            background: pendingMutations.length > 0 ? "rgb(var(--accent) / 0.06)" : "rgb(var(--vibe-team) / 0.06)",
            boxShadow: `inset 0 0 0 1px rgb(${pendingMutations.length > 0 ? "var(--accent)" : "var(--vibe-team)"} / 0.25)`,
          }}
        >
          <span className="text-[12px]" style={{ color: pendingMutations.length > 0 ? "rgb(var(--accent))" : "rgb(var(--vibe-team))" }}>
            {pendingMutations.length === 0
              ? "Edit-Modus aktiv — Klick auf eine Zelle zum Ändern."
              : `${pendingMutations.length} Änderung${pendingMutations.length === 1 ? "" : "en"} · noch nicht gespeichert`}
          </span>
          {pendingMutations.length > 0 && onSpeichern && (
            <>
              <input
                type="text"
                value={saveTitel}
                onChange={(e) => setSaveTitel(e.target.value)}
                placeholder="Titel · z.B. „Mai 2026 · Pulmo 3B“"
                className="px-2 py-1 rounded text-[12px] surface-mute border-0 focus:outline-none flex-1 min-w-[200px]"
                style={{ outline: "none" }}
              />
              <button
                type="button"
                onClick={speichereJetzt}
                disabled={pending}
                className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors disabled:opacity-50"
                style={{ background: "rgb(var(--accent))", color: "white" }}
              >
                {pending ? "…" : "💾 Speichern"}
              </button>
            </>
          )}
          {pendingMutations.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPendingMutations([]);
                regenerate();
              }}
              className="text-[11px] text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline"
            >
              Verwerfen
            </button>
          )}
          {savedToast && (
            <span className="text-[11px] font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>
              {savedToast}
            </span>
          )}
        </section>
      )}

      {/* KPI-Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <KpiTile
          label="Coverage"
          value={`${hud.coveragePct}%`}
          farbe={hud.coveragePct >= 95 ? "var(--vibe-approval)" : hud.coveragePct >= 85 ? "var(--sun)" : "var(--mon)"}
          unten={`${hud.zeilen.length} MA · ${hud.tage.length} Tage`}
        />
        <KpiTile
          label="Offene Schichten"
          value={hud.offenCount.toString()}
          farbe={hud.offenCount === 0 ? "var(--vibe-approval)" : "var(--mon)"}
          unten={hud.offenCount === 0 ? "vollständig besetzt" : `${hud.offen.length} Lücken`}
        />
        <KpiTile
          label="Konflikte"
          value={hud.konflikte.length.toString()}
          farbe={hud.konflikte.length === 0 ? "var(--vibe-approval)" : "var(--mon)"}
          unten={hud.konflikte.length === 0 ? "ArbZG-konform" : "Aufmerksamkeit"}
        />
        <KpiTile
          label="Lohnkosten"
          value={formatEur(hud.lohnkostenCents)}
          farbe="var(--vibe-stats)"
          unten={`${hud.tage.length / 7} Wochen`}
        />
        <KpiTile
          label="Wünsche"
          value={(() => {
            const t = hud.zeilen.reduce((s, z) => s + z.wunschErfuellt.gesamt, 0);
            const e = hud.zeilen.reduce((s, z) => s + z.wunschErfuellt.erfuellt, 0);
            return `${t > 0 ? Math.round((e / t) * 100) : 100}%`;
          })()}
          farbe="var(--accent)"
          unten={`${hud.zeilen.reduce((s, z) => s + z.wunschErfuellt.erfuellt, 0)} von ${hud.zeilen.reduce((s, z) => s + z.wunschErfuellt.gesamt, 0)}`}
        />
      </section>

      {/* Konflikt-Strip */}
      {hud.konflikte.length > 0 && (
        <section
          className="rounded-2xl p-3 overflow-x-auto"
          style={{ background: "rgb(var(--mon) / 0.08)", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.3)" }}
        >
          <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5" style={{ color: "rgb(var(--mon))" }}>
            ⚠ ArbZG-Konflikte · {hud.konflikte.length}
          </p>
          <div className="flex gap-2 flex-wrap">
            {hud.konflikte.slice(0, 8).map((k, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded font-mono"
                style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}
              >
                {k.personName.split(" ")[0]} · {k.datumISO.slice(5)} · {KONFLIKT_LABEL[k.art]}
              </span>
            ))}
            {hud.konflikte.length > 8 && (
              <span className="text-[11px] text-soft">+{hud.konflikte.length - 8} weitere</span>
            )}
          </div>
        </section>
      )}

      {/* Hauptarbeitsfläche · 12-Spalten Grid: Matrix links breit, KI-Panel rechts */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Matrix */}
        <section className="lg:col-span-8 surface rounded-2xl p-3 overflow-x-auto" style={{ minWidth: 0 }}>
          {hud.zeilen.length === 0 ? (
            <p className="text-[13px] text-mute py-12 text-center">
              Keine Mitarbeiter:innen für diese Filter — ändere die Auswahl oben.
            </p>
          ) : (
            <table className="w-full text-[12px] border-collapse" style={{ minWidth: hud.tage.length * 36 + 200 }}>
              <thead>
                <tr>
                  <th className="text-left text-[10px] uppercase tracking-wider text-soft font-mono px-2 py-2 sticky left-0 bg-[rgb(var(--bg-elev))] z-10 min-w-[180px]">
                    Mitarbeiter:in
                  </th>
                  {hud.tage.map((iso) => {
                    const f = formatDate(iso);
                    return (
                      <th
                        key={iso}
                        className="text-center text-[9px] font-mono px-1 py-1 whitespace-nowrap"
                        style={{
                          color: f.istHeute ? "rgb(var(--accent))" : f.istWoEnde ? "rgb(var(--fg-mute))" : undefined,
                          background: f.istHeute ? "rgb(var(--accent) / 0.06)" : undefined,
                          minWidth: 32,
                        }}
                      >
                        <div>{f.wd}</div>
                        <div>{f.tag}</div>
                      </th>
                    );
                  })}
                  <th className="text-right text-[10px] uppercase tracking-wider text-soft font-mono px-2 py-2">
                    Soll/Ist
                  </th>
                </tr>
              </thead>
              <tbody>
                {hud.zeilen.map((z) => (
                  <tr key={z.person.id} className="border-t border-[rgb(var(--border-soft))]">
                    <td className="px-2 py-1.5 sticky left-0 bg-[rgb(var(--bg-elev))] z-10">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-[12px] font-medium truncate">{z.person.name}</span>
                        {z.person.role === "lead" && (
                          <span className="text-[8px] px-1 rounded font-mono" style={{ background: "rgb(var(--vibe-team) / 0.2)", color: "rgb(var(--vibe-team))" }}>
                            PDL
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 text-[9px] text-soft font-mono">
                        <span>{z.person.tariffGrade?.replace("TVOED-P_", "") ?? ""}</span>
                        {(z.person.qualifications ?? []).slice(0, 3).map((q) => (
                          <span key={q} className="px-1 rounded surface-mute">{q}</span>
                        ))}
                        {z.konfliktCount > 0 && (
                          <span className="px-1 rounded" style={{ background: "rgb(var(--mon) / 0.2)", color: "rgb(var(--mon))" }}>
                            ⚠{z.konfliktCount}
                          </span>
                        )}
                      </div>
                    </td>
                    {hud.tage.map((iso) => {
                      const zelle = z.tage[iso];
                      const aktiv = aktiveZelle?.personId === z.person.id && aktiveZelle?.datumISO === iso;
                      return (
                        <td key={iso} className="p-0.5 text-center">
                          <Zelle
                            zelle={zelle}
                            aktiv={aktiv}
                            onClick={() =>
                              setAktiveZelle(aktiv ? null : { personId: z.person.id, datumISO: iso })
                            }
                          />
                        </td>
                      );
                    })}
                    <td className="px-2 py-1.5 text-right">
                      <div className="text-[11px] font-mono tabular-nums">
                        <span style={{ color: z.istStunden < z.sollStunden - 4 ? "rgb(var(--mon))" : z.istStunden > z.sollStunden + 4 ? "rgb(var(--vibe-stats))" : undefined }}>
                          {z.istStunden.toFixed(0)}
                        </span>
                        <span className="text-soft"> / {z.sollStunden.toFixed(0)}h</span>
                      </div>
                      {z.wunschErfuellt.gesamt > 0 && (
                        <div className="text-[9px] font-mono" style={{ color: "rgb(var(--accent))" }}>
                          ★ {z.wunschErfuellt.erfuellt}/{z.wunschErfuellt.gesamt}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Soll/Ist-Footer pro Tag */}
              <tfoot>
                <tr className="border-t-2 border-[rgb(var(--border-soft))]">
                  <td className="px-2 py-1.5 text-[10px] uppercase tracking-wider font-mono text-soft sticky left-0 bg-[rgb(var(--bg-elev))] z-10">
                    Soll/Ist · F+S+N
                  </td>
                  {hud.tage.map((iso) => {
                    const soll = hud.sollProTag[iso];
                    const ist = hud.istProTag[iso];
                    const sollSum = soll.F + soll.S + soll.N;
                    const istSum = Math.round(ist.F + ist.S + ist.N);
                    const ok = istSum >= sollSum;
                    return (
                      <td key={iso} className="text-center text-[9px] font-mono py-1">
                        <span style={{ color: ok ? "rgb(var(--vibe-approval))" : "rgb(var(--mon))" }}>
                          {istSum}/{sollSum}
                        </span>
                      </td>
                    );
                  })}
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        {/* KI-Aktions-Panel */}
        <aside className="lg:col-span-4 space-y-2">
          <div className="surface rounded-2xl p-4" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}>
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h2 className="font-display text-[16px] font-semibold tracking-tight2" style={{ color: "rgb(var(--accent))" }}>
                KI-Co-Pilot · 5 Aktionen
              </h2>
              <span aria-hidden className="w-2 h-2 rounded-full animate-pulse" style={{ background: "rgb(var(--accent))" }} />
            </div>
            <p className="text-[11px] text-soft mb-3 leading-relaxed">
              Lana analysiert den aktuellen Plan und schlägt fünf Aktionen vor.
              Klick → Details + auswirken-lassen-Stub (Phase 2: echte Mutation).
            </p>
            <ul className="space-y-1.5">
              {aktionen.map((a) => {
                const f = kiAktionFarbe[a.art];
                const aktiv = aktiveAktion?.art === a.art;
                return (
                  <li key={a.art}>
                    <button
                      type="button"
                      onClick={() => setAktiveAktion(aktiv ? null : a)}
                      className="w-full text-left rounded-lg px-3 py-2 transition-all"
                      style={{
                        background: aktiv ? `rgb(${f} / 0.12)` : "transparent",
                        boxShadow: `inset 0 0 0 1px rgb(${f} / ${aktiv ? 0.45 : 0.2})`,
                      }}
                    >
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <span className="text-[13px] font-medium" style={{ color: `rgb(${f})` }}>
                          {kiAktionLabel[a.art]}
                        </span>
                        <span
                          className="text-[10px] px-1.5 rounded font-mono"
                          style={{ background: `rgb(${f} / 0.2)`, color: `rgb(${f})` }}
                        >
                          {a.betroffen}
                        </span>
                      </div>
                      <p className="text-[11px] text-soft mt-0.5 leading-snug">{a.beschreibung}</p>
                      {aktiv && (
                        <div className="mt-2 pt-2 border-t" style={{ borderColor: `rgb(${f} / 0.2)` }}>
                          <ul className="space-y-0.5 mb-2">
                            {a.details.map((d, i) => (
                              <li key={i} className="text-[11px] text-mute font-mono">· {d}</li>
                            ))}
                          </ul>
                          {a.auswirkung && (
                            <p className="text-[11px] italic" style={{ color: `rgb(${f})` }}>
                              → {a.auswirkung}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Phase 2: Diese Aktion mutiert den Plan. Heute: Vorschlag, kein echter Eingriff.\n\nIn der Live-Version würde Lana hier ${a.beschreibung}`);
                            }}
                            className="mt-2 px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                            style={{ background: `rgb(${f})`, color: "white" }}
                          >
                            Anwenden →
                          </button>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Schicht-Editor-Popover wenn Zelle aktiv */}
          {aktiveZelle && (() => {
            const z = hud.zeilen.find((zz) => zz.person.id === aktiveZelle.personId);
            const zelle = z?.tage[aktiveZelle.datumISO];
            if (!z || !zelle) return null;
            return (
              <div className="surface rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">
                  {z.person.name}
                </p>
                <p className="text-[14px] font-medium mb-2">{aktiveZelle.datumISO}</p>
                <p className="text-[12px] text-mute mb-3">
                  Aktuell: <span className="font-mono" style={{ color: `rgb(${SCHICHT_FARBE[zelle.schicht]})` }}>{SCHICHT_LABEL[zelle.schicht]}</span>
                  {zelle.wunsch && zelle.wunsch !== zelle.schicht && (
                    <> · Wunsch: <span style={{ color: "rgb(var(--accent))" }}>{SCHICHT_LABEL[zelle.wunsch]}</span></>
                  )}
                  {zelle.konflikt && (
                    <> · <span style={{ color: "rgb(var(--mon))" }}>{KONFLIKT_LABEL[zelle.konflikt]}</span></>
                  )}
                </p>
                <p className="text-[11px] text-soft mb-2">Auf andere Schicht ändern:</p>
                <div className="grid grid-cols-4 gap-1">
                  {(["F", "S", "N", "G", "U", "K", "FZ", "_"] as SchichtKuerzel[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={!editierModus}
                      onClick={() => mutiereZelle(aktiveZelle.personId, aktiveZelle.datumISO, s)}
                      className="px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors disabled:opacity-40"
                      style={{
                        background: `rgb(${SCHICHT_FARBE[s]} / 0.15)`,
                        color: `rgb(${SCHICHT_FARBE[s]})`,
                        boxShadow: `inset 0 0 0 1px rgb(${SCHICHT_FARBE[s]} / 0.3)`,
                      }}
                      title={editierModus ? SCHICHT_LABEL[s] : "Zum Bearbeiten Edit-Modus aktivieren"}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {!editierModus && (
                  <p className="text-[10px] mt-2" style={{ color: "rgb(var(--mon))" }}>
                    Edit-Modus oben aktivieren, um Schichten zu ändern.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setAktiveZelle(null)}
                  className="mt-3 text-[10px] text-soft hover:text-[rgb(var(--fg))]"
                >
                  Schließen
                </button>
              </div>
            );
          })()}

          {/* Legende */}
          <div className="surface-mute rounded-2xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Legende</p>
            <div className="grid grid-cols-4 gap-1.5">
              {(["F", "S", "N", "G", "U", "K", "FZ", "_"] as SchichtKuerzel[]).map((s) => (
                <div key={s} className="flex items-baseline gap-1.5 text-[10px]">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono font-bold"
                    style={{ background: `rgb(${SCHICHT_FARBE[s]} / 0.15)`, color: `rgb(${SCHICHT_FARBE[s]})` }}
                  >
                    {s}
                  </span>
                  <span className="text-soft">{SCHICHT_LABEL[s]}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function KpiTile({ label, value, farbe, unten }: { label: string; value: string; farbe: string; unten: string }) {
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>
        {label}
      </p>
      <p className="text-[22px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{value}</p>
      <p className="text-[10px] text-soft mt-0.5">{unten}</p>
    </div>
  );
}

function Zelle({
  zelle,
  aktiv,
  onClick,
}: {
  zelle: { schicht: SchichtKuerzel; konflikt?: string; wunsch?: SchichtKuerzel } | undefined;
  aktiv: boolean;
  onClick: () => void;
}) {
  if (!zelle) {
    return <button type="button" onClick={onClick} className="w-7 h-7 rounded text-[10px] surface-mute" />;
  }
  const f = SCHICHT_FARBE[zelle.schicht];
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-7 h-7 rounded text-[10px] font-bold font-mono relative transition-all"
      style={{
        background: `rgb(${f} / ${zelle.schicht === "_" ? 0.05 : 0.18})`,
        color: `rgb(${f})`,
        boxShadow: aktiv
          ? `inset 0 0 0 2px rgb(${f})`
          : `inset 0 0 0 1px rgb(${f} / ${zelle.schicht === "_" ? 0.15 : 0.35})`,
      }}
      title={`${SCHICHT_LABEL[zelle.schicht]}${zelle.wunsch ? ` · Wunsch: ${SCHICHT_LABEL[zelle.wunsch]}` : ""}${zelle.konflikt ? ` · ${zelle.konflikt}` : ""}`}
    >
      <span>{zelle.schicht === "_" ? "·" : zelle.schicht}</span>
      {zelle.konflikt && (
        <span
          aria-hidden
          className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full"
          style={{ background: "rgb(var(--mon))", transform: "translate(40%,-40%)" }}
        />
      )}
      {zelle.wunsch && zelle.wunsch !== zelle.schicht && (
        <span
          aria-hidden
          className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full"
          style={{ background: "rgb(var(--accent))", transform: "translate(-40%,40%)" }}
          title={`Wunsch: ${SCHICHT_LABEL[zelle.wunsch]}`}
        />
      )}
    </button>
  );
}
