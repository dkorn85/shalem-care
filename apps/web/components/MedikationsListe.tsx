"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createVerordnung,
  pauseVerordnung,
  resumeVerordnung,
  endVerordnung,
  recordVergabe,
} from "@/lib/medikation/actions";
import {
  ATC_LABEL,
  DARREICHUNG_LABEL,
  VERGABEZEIT_LABEL,
  VERGABE_STATUS_LABEL,
  dosierAlsText,
  priscusHinweis,
} from "@/lib/medikation/types";
import type {
  Verordnung,
  Vergabe,
  VergabeStatus,
  Vergabezeit,
  Medikament,
  Dosierschema,
} from "@/lib/medikation/types";

type Row = {
  verordnung: Verordnung;
  medikament: Medikament;
  letzteVergaben: Vergabe[];
};

export function MedikationsListe({
  klientId,
  klientName,
  authorId,
  rows,
  katalog,
  vergabeQuotePct,
  vergabenLast7d,
}: {
  klientId: string;
  klientName: string;
  authorId: string;
  rows: Row[];
  katalog: Medikament[];
  vergabeQuotePct: number;
  vergabenLast7d: number;
}) {
  const aktiv = rows.filter((r) => r.verordnung.status === "aktiv");
  const inaktiv = rows.filter((r) => r.verordnung.status !== "aktiv");
  const btmAktiv = aktiv.filter((r) => r.medikament.btm).length;
  const priscusAktiv = aktiv.filter((r) => r.medikament.priscus).length;

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 space-y-5 anim-slideUp" style={{ animationDelay: "0.1s" }}>
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">AMG · BtMG · § 630f BGB</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-1">
            Medikation — {klientName}
          </h3>
          <p className="text-[12px] text-mute mt-1">
            {aktiv.length} aktive Verordnungen · {vergabenLast7d} Vergaben (7&nbsp;Tage) · Adhärenz {vergabeQuotePct}%
            {btmAktiv > 0 && <> · <span style={{ color: "rgb(var(--mon))" }}>{btmAktiv} BtM</span></>}
            {priscusAktiv > 0 && <> · <span style={{ color: "rgb(var(--vibe-profile))" }}>{priscusAktiv} PRISCUS</span></>}
          </p>
        </div>
        <NeuerVerordnungsDialog klientId={klientId} katalog={katalog} />
      </header>

      {aktiv.length === 0 ? (
        <p className="text-[13px] text-mute">Keine aktiven Verordnungen.</p>
      ) : (
        <ul className="space-y-2.5">
          {aktiv.map((r) => (
            <VerordnungsRow key={r.verordnung.id} row={r} authorId={authorId} />
          ))}
        </ul>
      )}

      {inaktiv.length > 0 && (
        <details className="pt-3 border-t border-app-soft">
          <summary className="text-[12px] text-soft cursor-pointer hover:text-[rgb(var(--fg))]">
            Beendet / Pausiert ({inaktiv.length})
          </summary>
          <ul className="space-y-2 mt-3">
            {inaktiv.map((r) => (
              <VerordnungsRow key={r.verordnung.id} row={r} authorId={authorId} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function VerordnungsRow({ row, authorId }: { row: Row; authorId: string }) {
  const { verordnung: vo, medikament: m, letzteVergaben } = row;
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const priscus = priscusHinweis(m);

  const vergabe = (zeit: Vergabezeit, dosis: string, status: VergabeStatus, begruendung?: string, btm?: number) => {
    start(async () => {
      await recordVergabe({
        verordnungId: vo.id,
        zeit,
        geplanteDosis: dosis,
        status,
        begruendung,
        gegebenVon: authorId,
        btmRestbestand: btm,
      });
    });
  };

  const stateChip =
    vo.status === "aktiv"     ? { bg: "rgb(var(--thu) / 0.15)", fg: "rgb(var(--thu))", label: "Aktiv" } :
    vo.status === "pausiert"  ? { bg: "rgb(var(--wed) / 0.2)",  fg: "rgb(var(--fg-mute))", label: "Pausiert" } :
                                { bg: "rgb(var(--bg-mute))",     fg: "rgb(var(--fg-mute))", label: "Beendet" };

  return (
    <li className="surface-mute rounded-xl p-3.5">
      <div
        className="flex items-start gap-3 cursor-pointer"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={`${m.handelsname} Details ${open ? "schließen" : "öffnen"}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); } }}
      >
        <div
          className="w-9 h-9 rounded-lg grid place-items-center text-[11px] font-bold shrink-0"
          style={{
            background: m.btm     ? "rgb(var(--mon) / 0.15)" :
                        m.priscus ? "rgb(var(--vibe-profile) / 0.15)" :
                                    "rgb(var(--vibe-team) / 0.12)",
            color:      m.btm     ? "rgb(var(--mon))" :
                        m.priscus ? "rgb(var(--vibe-profile))" :
                                    "rgb(var(--vibe-team))",
          }}
        >
          {m.atcGruppe}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[14px] font-medium">{m.handelsname}</span>
            {m.btm && (
              <span className="chip" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>BtM</span>
            )}
            {m.priscus && (
              <span className="chip" style={{ background: "rgb(var(--vibe-profile) / 0.15)", color: "rgb(var(--vibe-profile))" }}>PRISCUS</span>
            )}
            <span className="chip" style={{ background: stateChip.bg, color: stateChip.fg }}>{stateChip.label}</span>
          </div>
          <div className="text-[12px] text-mute mt-0.5 font-mono">
            {m.wirkstoff} · {m.staerke} · {DARREICHUNG_LABEL[m.darreichung]} · ATC {m.atc}
          </div>
          <div className="text-[12px] text-mute mt-1">
            <span className="text-soft">Dosierung:</span> <span className="font-mono">{dosierAlsText(vo.dosierung)}</span>
          </div>
          <div className="text-[11px] text-soft mt-0.5">
            {vo.indikation} · verordnet {vo.verordnetAm} · {vo.verordnetVon}
          </div>
        </div>
        <span className="text-mute text-[13px] shrink-0">{open ? "▴" : "▾"}</span>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-app-soft space-y-3 anim-fadeIn">
          {(m.hinweise || priscus) && (
            <div className="text-[12px] rounded-lg p-2.5" style={{ background: "rgb(var(--vibe-profile) / 0.08)", color: "rgb(var(--fg-mute))" }}>
              {m.hinweise && <div>⚠ {m.hinweise}</div>}
              {priscus && <div className="mt-1">⚠ {priscus}</div>}
            </div>
          )}

          {vo.status === "aktiv" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(["morgens", "mittags", "abends", "nachts"] as const).map((z) => {
                const dosis = vo.dosierung[z];
                if (!dosis) return null;
                return (
                  <button
                    key={z}
                    onClick={() => vergabe(z, dosis, "gegeben", undefined, m.btm ? Math.max(0, 100 - vergabenForToday(letzteVergaben, z)) : undefined)}
                    disabled={pending}
                    className="btn btn-primary text-[12px] py-2"
                  >
                    ✓ {VERGABEZEIT_LABEL[z]} ({dosis})
                  </button>
                );
              })}
              {vo.dosierung.beiBedarf && (
                <BedarfsVergabe
                  voId={vo.id}
                  authorId={authorId}
                  bedarfsHinweis={vo.dosierung.beiBedarf}
                  isBtm={m.btm}
                />
              )}
            </div>
          )}

          {vo.status === "aktiv" && (
            <details>
              <summary className="text-[11px] text-soft cursor-pointer">Verweigert / ausgefallen erfassen</summary>
              <AbweichendeVergabe verordnung={vo} authorId={authorId} />
            </details>
          )}

          {letzteVergaben.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-1.5">Letzte Vergaben</p>
              <ul className="space-y-1 text-[12px]">
                {letzteVergaben.slice(0, 5).map((v) => (
                  <li key={v.id} className="flex items-baseline gap-2">
                    <span className="font-mono text-soft shrink-0">{new Date(v.gegebenAm).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="chip text-[10px]" style={{
                      background: v.status === "gegeben"     ? "rgb(var(--thu) / 0.15)" :
                                  v.status === "verweigert"  ? "rgb(var(--mon) / 0.15)" :
                                                               "rgb(var(--bg-mute))",
                      color:      v.status === "gegeben"     ? "rgb(var(--thu))" :
                                  v.status === "verweigert"  ? "rgb(var(--mon))" :
                                                               "rgb(var(--fg-mute))",
                    }}>
                      {VERGABE_STATUS_LABEL[v.status]}
                    </span>
                    <span className="text-mute">{VERGABEZEIT_LABEL[v.zeit]} · {v.geplanteDosis}</span>
                    {v.btmRestbestand !== undefined && (
                      <span className="font-mono text-soft text-[11px]">Rest: {v.btmRestbestand}</span>
                    )}
                    {v.begruendung && <span className="text-soft italic truncate">— {v.begruendung}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-app-soft flex-wrap">
            <p className="text-[11px] text-soft mr-auto">
              ATC: {ATC_LABEL[m.atcGruppe]} · PZN {m.pzn}
            </p>
            {vo.status === "aktiv" ? (
              <button onClick={() => start(async () => { await pauseVerordnung(vo.id); })} disabled={pending} className="btn btn-ghost text-[12px]">Pausieren</button>
            ) : vo.status === "pausiert" ? (
              <button onClick={() => start(async () => { await resumeVerordnung(vo.id); })} disabled={pending} className="btn btn-ghost text-[12px]">Fortsetzen</button>
            ) : null}
            {vo.status !== "beendet" && (
              <button onClick={() => start(async () => { await endVerordnung(vo.id); })} disabled={pending} className="btn btn-ghost text-[12px]" style={{ color: "rgb(var(--mon))" }}>Beenden</button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function vergabenForToday(list: Vergabe[], _zeit: Vergabezeit): number {
  const today = new Date().toISOString().slice(0, 10);
  return list.filter((v) => v.gegebenAm.slice(0, 10) === today).length;
}

function BedarfsVergabe({ voId, authorId, bedarfsHinweis, isBtm }: { voId: string; authorId: string; bedarfsHinweis: string; isBtm: boolean }) {
  const [open, setOpen] = useState(false);
  const [dose, setDose] = useState("");
  const [reason, setReason] = useState("");
  const [btm, setBtm] = useState<number | "">("");
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn text-[12px] py-2" style={{ background: "rgb(var(--vibe-profile) / 0.15)", color: "rgb(var(--vibe-profile))" }}>
        + Bedarf
      </button>
    );
  }

  return (
    <div className="col-span-full surface rounded-lg p-3 space-y-2">
      <p className="text-[11px] text-soft">Bedarfsrahmen: {bedarfsHinweis}</p>
      <div className="flex gap-2 flex-wrap">
        <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Dosis (z.B. 5 mg)" className="input flex-1 text-[12px]" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Begründung (Schmerz NRS, Unruhe …)" className="input flex-[2] text-[12px]" />
        {isBtm && (
          <input
            type="number"
            value={btm}
            onChange={(e) => setBtm(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="BtM-Rest"
            className="input w-28 text-[12px] font-mono"
          />
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="btn btn-ghost text-[12px]">Abbrechen</button>
        <button
          onClick={() => start(async () => {
            const r = await recordVergabe({
              verordnungId: voId,
              zeit: "bedarf",
              geplanteDosis: dose || "1",
              status: "gegeben",
              begruendung: reason,
              gegebenVon: authorId,
              btmRestbestand: isBtm ? (btm === "" ? undefined : btm) : undefined,
            });
            if (r.ok) {
              setOpen(false); setDose(""); setReason(""); setBtm("");
            }
          })}
          disabled={pending || !dose.trim() || !reason.trim() || (isBtm && btm === "")}
          className="btn btn-primary text-[12px]"
        >
          {pending ? "..." : "Bedarfsgabe erfassen"}
        </button>
      </div>
    </div>
  );
}

function AbweichendeVergabe({ verordnung, authorId }: { verordnung: Verordnung; authorId: string }) {
  const [zeit, setZeit] = useState<Vergabezeit>("morgens");
  const [status, setStatus] = useState<VergabeStatus>("verweigert");
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const dosisFor = (z: Vergabezeit) => verordnung.dosierung[z as keyof Dosierschema] ?? "—";

  return (
    <div className="mt-2 surface rounded-lg p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <select value={zeit} onChange={(e) => setZeit(e.target.value as Vergabezeit)} className="select text-[12px]">
          <option value="morgens">Morgens</option>
          <option value="mittags">Mittags</option>
          <option value="abends">Abends</option>
          <option value="nachts">Nachts</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as VergabeStatus)} className="select text-[12px]">
          <option value="verweigert">verweigert</option>
          <option value="ausgefallen">ausgefallen</option>
          <option value="alternativ">alternativ</option>
          <option value="nicht_verfuegbar">nicht verfügbar</option>
        </select>
      </div>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Begründung (Pflicht — MDK)" className="textarea text-[12px]" />
      <div className="flex justify-end">
        <button
          disabled={pending || !reason.trim()}
          onClick={() => start(async () => {
            const r = await recordVergabe({
              verordnungId: verordnung.id,
              zeit,
              geplanteDosis: String(dosisFor(zeit)),
              status,
              begruendung: reason,
              gegebenVon: authorId,
            });
            if (r.ok) setReason("");
          })}
          className="btn text-[12px]"
          style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}
        >
          {pending ? "..." : "Erfassen"}
        </button>
      </div>
    </div>
  );
}

function NeuerVerordnungsDialog({ klientId, katalog }: { klientId: string; katalog: Medikament[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [medId, setMedId] = useState<string>("");
  const [arzt, setArzt] = useState("");
  const [indikation, setIndikation] = useState("");
  const [dos, setDos] = useState<Dosierschema>({});
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return katalog.slice(0, 12);
    return katalog
      .filter((m) =>
        m.handelsname.toLowerCase().includes(q) ||
        m.wirkstoff.toLowerCase().includes(q) ||
        m.atc.toLowerCase().includes(q) ||
        m.pzn.includes(q),
      )
      .slice(0, 20);
  }, [search, katalog]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary text-[12px]">+ Verordnung</button>
    );
  }

  const submit = () => {
    setErr(null);
    if (!medId) return setErr("Medikament wählen.");
    start(async () => {
      const r = await createVerordnung({
        klientId,
        medikamentId: medId,
        verordnetVon: arzt,
        indikation,
        dosierung: dos,
        ab: new Date().toISOString().slice(0, 10),
      });
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      setOpen(false);
      setSearch(""); setMedId(""); setArzt(""); setIndikation(""); setDos({});
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 anim-fadeIn">
      <div className="surface rounded-2xl p-5 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <header className="flex items-baseline justify-between">
          <h4 className="font-display text-[16px] font-semibold tracking-tight2">Neue Verordnung</h4>
          <button onClick={() => setOpen(false)} className="btn btn-ghost text-[12px]">✕</button>
        </header>

        <div>
          <label className="block text-[12px] font-medium mb-1">Medikament suchen (Handelsname, Wirkstoff, PZN, ATC)</label>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setMedId(""); }} className="input text-[13px]" placeholder="z.B. Metoprolol oder C09AA05" />
          <ul className="mt-2 max-h-40 overflow-y-auto rounded-lg surface-mute divide-y divide-[rgb(var(--bg-mute))]">
            {filtered.map((m) => (
              <li
                key={m.id}
                onClick={() => setMedId(m.id)}
                className={`p-2 cursor-pointer text-[12px] hover:bg-[rgb(var(--bg-mute))] ${medId === m.id ? "bg-[rgb(var(--vibe-team)/0.1)]" : ""}`}
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium">{m.handelsname}</span>
                  {m.btm && <span className="chip text-[10px]" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>BtM</span>}
                  {m.priscus && <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-profile) / 0.15)", color: "rgb(var(--vibe-profile))" }}>PRISCUS</span>}
                </div>
                <div className="text-soft text-[11px] font-mono">{m.wirkstoff} · {m.staerke} · ATC {m.atc} · PZN {m.pzn}</div>
              </li>
            ))}
            {filtered.length === 0 && <li className="p-3 text-[12px] text-soft">Keine Treffer.</li>}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium mb-1">Verordnender Arzt</label>
            <input value={arzt} onChange={(e) => setArzt(e.target.value)} placeholder="z.B. Dr. Hartmann" className="input text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1">Indikation</label>
            <input value={indikation} onChange={(e) => setIndikation(e.target.value)} placeholder="z.B. Hypertonie" className="input text-[13px]" />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium mb-1">Dosierung (mo-mi-ab-na)</label>
          <div className="grid grid-cols-4 gap-1.5">
            <input value={dos.morgens ?? ""} onChange={(e) => setDos((d) => ({ ...d, morgens: e.target.value || undefined }))} placeholder="mo" className="input text-[13px] font-mono" />
            <input value={dos.mittags ?? ""} onChange={(e) => setDos((d) => ({ ...d, mittags: e.target.value || undefined }))} placeholder="mi" className="input text-[13px] font-mono" />
            <input value={dos.abends ?? ""}  onChange={(e) => setDos((d) => ({ ...d, abends:  e.target.value || undefined }))} placeholder="ab" className="input text-[13px] font-mono" />
            <input value={dos.nachts ?? ""}  onChange={(e) => setDos((d) => ({ ...d, nachts:  e.target.value || undefined }))} placeholder="na" className="input text-[13px] font-mono" />
          </div>
          <input
            value={dos.beiBedarf ?? ""}
            onChange={(e) => setDos((d) => ({ ...d, beiBedarf: e.target.value || undefined }))}
            placeholder="Bei Bedarf — z.B. max. 4× tgl. bei NRS > 4"
            className="input text-[13px] mt-1.5"
          />
        </div>

        {err && <div className="text-[12px] rounded-lg p-2" style={{ background: "rgb(var(--mon) / 0.1)", color: "rgb(var(--mon))" }}>{err}</div>}

        <div className="flex justify-end gap-2 pt-2 border-t border-app-soft">
          <button onClick={() => setOpen(false)} className="btn btn-ghost text-[13px]">Abbrechen</button>
          <button onClick={submit} disabled={pending || !medId} className="btn btn-primary text-[13px]">
            {pending ? "..." : "Verordnung anlegen"}
          </button>
        </div>
      </div>
    </div>
  );
}
