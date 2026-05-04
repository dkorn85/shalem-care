"use client";

import { useState, useTransition, useMemo } from "react";
import {
  uebernehmeAnfrage,
  rueckfrageStellen,
  lehneAnfrageAb,
  stelleVerordnungAus,
} from "@/lib/verordnung/actions";
import type { AnfrageStatus, VerordnungsKategorie, Verordnungswunsch } from "@/lib/verordnung/types";
import type { Medikament } from "@/lib/medikation/types";
import { DARREICHUNG_LABEL } from "@/lib/medikation/types";

export function ArztEntscheidung({
  anfrageId,
  kategorie,
  wunsch,
  status,
  notizenArzt,
  ausgestellteVerordnungId,
  eRezeptCode,
  arztId,
  arztName,
  katalog,
}: {
  anfrageId: string;
  kategorie: VerordnungsKategorie;
  wunsch: Verordnungswunsch;
  status: AnfrageStatus;
  notizenArzt?: string;
  ausgestellteVerordnungId?: string;
  eRezeptCode?: string;
  arztId: string;
  arztName: string;
  katalog: Medikament[];
}) {
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showRueck, setShowRueck] = useState(false);
  const [rueckText, setRueckText] = useState("");
  const [showAblehn, setShowAblehn] = useState(false);
  const [ablehnText, setAblehnText] = useState("");

  // Rx-Form
  const isMedikament = kategorie === "medikament";
  const wunschMed = isMedikament ? (wunsch as Extract<Verordnungswunsch, { kategorie: "medikament" }>) : null;
  const empfMed = useMemo(() => {
    if (!wunschMed) return null;
    if (wunschMed.medikamentId) return katalog.find((m) => m.id === wunschMed.medikamentId);
    if (wunschMed.wirkstoff)
      return katalog.find((m) =>
        m.wirkstoff.toLowerCase() === wunschMed.wirkstoff!.toLowerCase()
        && (!wunschMed.staerke || m.staerke === wunschMed.staerke),
      );
    return null;
  }, [wunschMed, katalog]);
  const [medId, setMedId] = useState<string>(empfMed?.id ?? "");
  const [search, setSearch] = useState("");
  const [indikation, setIndikation] = useState<string>("");
  const [dose, setDose] = useState<{ morgens?: string; mittags?: string; abends?: string; nachts?: string; beiBedarf?: string }>(
    parseDoseString(wunschMed?.dosierung)
  );
  const [bisDatum, setBisDatum] = useState<string>("");
  const [notiz, setNotiz] = useState("");

  const filteredKatalog = useMemo(() => {
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

  const isClosed = status === "ausgestellt" || status === "abgelehnt";

  const uebernehmen = () => start(async () => {
    setFeedback(null);
    const r = await uebernehmeAnfrage(anfrageId, arztId);
    setFeedback(r.ok ? "✓ Anfrage in Prüfung übernommen" : `✕ ${r.error}`);
  });

  const senden = () => start(async () => {
    setFeedback(null);
    const r = await rueckfrageStellen({ anfrageId, arztId, text: rueckText });
    if (r.ok) {
      setShowRueck(false); setRueckText("");
      setFeedback("✓ Rückfrage an Pflege gesendet");
    } else {
      setFeedback(`✕ ${r.error}`);
    }
  });

  const ablehnen = () => start(async () => {
    setFeedback(null);
    const r = await lehneAnfrageAb({ anfrageId, arztId, begruendung: ablehnText });
    if (r.ok) {
      setShowAblehn(false);
      setFeedback("✓ Abgelehnt — Pflege wird informiert");
    } else {
      setFeedback(`✕ ${r.error}`);
    }
  });

  const ausstellen = () => start(async () => {
    setFeedback(null);
    const r = await stelleVerordnungAus({
      anfrageId,
      arztId,
      arztName,
      medikamentId: isMedikament ? medId : undefined,
      indikation: indikation || undefined,
      dosierung: isMedikament ? dose : undefined,
      bisDatum: bisDatum || undefined,
      notiz: notiz || undefined,
    });
    if (r.ok) {
      setFeedback(`✓ Verordnung ausgestellt${r.eRezeptCode ? ` · eRezept ${r.eRezeptCode}` : ""}`);
    } else {
      setFeedback(`✕ ${r.error}`);
    }
  });

  if (isClosed) {
    return (
      <section className="surface rounded-2xl p-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">
          {status === "ausgestellt" ? "Ausgestellt" : "Abgelehnt"}
        </h2>
        {eRezeptCode && (
          <div className="rounded-lg p-3 mb-3 text-[13px] font-mono" style={{ background: "rgb(var(--thu) / 0.1)", color: "rgb(var(--thu))" }}>
            eRezept-Code · {eRezeptCode}
          </div>
        )}
        {ausgestellteVerordnungId && (
          <p className="text-[12px] text-mute mb-2">
            Verordnung-Ref: <span className="font-mono">{ausgestellteVerordnungId}</span>
          </p>
        )}
        {notizenArzt && (
          <div className="surface-mute rounded-lg p-3 text-[13px] italic">
            „{notizenArzt}“
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="surface rounded-2xl p-5 space-y-4">
      <header className="flex items-baseline justify-between gap-2 flex-wrap">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2">Entscheidung</h2>
        {status === "offen" && (
          <button onClick={uebernehmen} disabled={pending} className="btn text-[12px]">
            ▶ In Prüfung nehmen
          </button>
        )}
      </header>

      {feedback && (
        <div
          className="rounded-lg p-3 text-[13px]"
          style={{
            background: feedback.startsWith("✓") ? "rgb(var(--thu) / 0.1)" : "rgb(var(--mon) / 0.1)",
            color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))",
          }}
        >
          {feedback}
        </div>
      )}

      {/* Medikamenten-Auswahl */}
      {isMedikament && (
        <div className="space-y-2">
          <label className="block text-[12px] font-medium">Medikament aus Katalog auswählen</label>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setMedId(""); }}
            placeholder="Suche · Wirkstoff · PZN · ATC"
            className="input text-[13px]"
          />
          {!medId && empfMed && (
            <button
              onClick={() => setMedId(empfMed.id)}
              className="surface-mute rounded-lg p-2 w-full text-left text-[12px] hover:bg-[rgb(var(--bg-mute))]"
            >
              <div className="font-medium">Vorschlag aus Anfrage: {empfMed.handelsname}</div>
              <div className="text-soft font-mono">
                {empfMed.wirkstoff} · {empfMed.staerke} · ATC {empfMed.atc}
              </div>
            </button>
          )}
          <ul className="max-h-48 overflow-y-auto rounded-lg surface-mute divide-y divide-[rgb(var(--bg-mute))]">
            {filteredKatalog.map((m) => (
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
                <div className="text-soft text-[11px] font-mono">{m.wirkstoff} · {m.staerke} · {DARREICHUNG_LABEL[m.darreichung]} · ATC {m.atc} · PZN {m.pzn}</div>
              </li>
            ))}
          </ul>
          <div>
            <label className="block text-[12px] font-medium mt-2">Indikation</label>
            <input value={indikation} onChange={(e) => setIndikation(e.target.value)} placeholder="z.B. Hypertonie" className="input text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium mt-1">Dosierung mo-mi-ab-na</label>
            <div className="grid grid-cols-4 gap-1.5">
              <input value={dose.morgens ?? ""} onChange={(e) => setDose((d) => ({ ...d, morgens: e.target.value || undefined }))} placeholder="mo" className="input text-[13px] font-mono" />
              <input value={dose.mittags ?? ""} onChange={(e) => setDose((d) => ({ ...d, mittags: e.target.value || undefined }))} placeholder="mi" className="input text-[13px] font-mono" />
              <input value={dose.abends ?? ""}  onChange={(e) => setDose((d) => ({ ...d, abends:  e.target.value || undefined }))} placeholder="ab" className="input text-[13px] font-mono" />
              <input value={dose.nachts ?? ""}  onChange={(e) => setDose((d) => ({ ...d, nachts:  e.target.value || undefined }))} placeholder="na" className="input text-[13px] font-mono" />
            </div>
            <input
              value={dose.beiBedarf ?? ""}
              onChange={(e) => setDose((d) => ({ ...d, beiBedarf: e.target.value || undefined }))}
              placeholder="Bei Bedarf · z.B. max. 4× tgl. bei NRS > 4"
              className="input text-[13px] mt-1.5"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium mt-1">Befristung (optional)</label>
            <input type="date" value={bisDatum} onChange={(e) => setBisDatum(e.target.value)} className="input text-[13px]" />
          </div>
        </div>
      )}

      <div>
        <label className="block text-[12px] font-medium">Ärztliche Notiz (intern)</label>
        <textarea value={notiz} onChange={(e) => setNotiz(e.target.value)} rows={2} className="textarea text-[13px]" placeholder="z.B. „Folgeverordnung 90 Tage, Wundabstrich Mi“" />
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-app-soft">
        <button onClick={() => setShowRueck((s) => !s)} disabled={pending} className="btn text-[12px]">❓ Rückfrage</button>
        <button onClick={() => setShowAblehn((s) => !s)} disabled={pending} className="btn text-[12px]" style={{ color: "rgb(var(--mon))" }}>✕ Ablehnen</button>
        <div className="flex-1" />
        <button onClick={ausstellen} disabled={pending || (isMedikament && !medId)} className="btn btn-primary text-[13px]">
          {pending ? "..." : "✓ Verordnung ausstellen + eRezept"}
        </button>
      </div>

      {showRueck && (
        <div className="surface-mute rounded-lg p-3 space-y-2">
          <textarea value={rueckText} onChange={(e) => setRueckText(e.target.value)} rows={3} placeholder="Frage an Pflege/Klient (z.B. „Bitte Schmerzskala der letzten 3 Tage senden“)" className="textarea text-[13px]" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowRueck(false)} className="btn btn-ghost text-[12px]">Abbrechen</button>
            <button onClick={senden} disabled={pending || !rueckText.trim()} className="btn btn-primary text-[12px]">Rückfrage senden</button>
          </div>
        </div>
      )}

      {showAblehn && (
        <div className="surface-mute rounded-lg p-3 space-y-2">
          <textarea value={ablehnText} onChange={(e) => setAblehnText(e.target.value)} rows={3} placeholder="Begründung (Pflicht — wird der Pflege/Klient mitgeteilt)" className="textarea text-[13px]" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAblehn(false)} className="btn btn-ghost text-[12px]">Abbrechen</button>
            <button onClick={ablehnen} disabled={pending || !ablehnText.trim()} className="btn text-[12px]" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>
              Ablehnen
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function parseDoseString(s?: string): { morgens?: string; mittags?: string; abends?: string; nachts?: string; beiBedarf?: string } {
  if (!s) return {};
  const parts = s.split("-").map((p) => p.trim());
  if (parts.length < 3) return { beiBedarf: s };
  return {
    morgens: parts[0] !== "0" ? parts[0] : undefined,
    mittags: parts[1] !== "0" ? parts[1] : undefined,
    abends:  parts[2] !== "0" ? parts[2] : undefined,
    nachts:  parts[3] && parts[3] !== "0" ? parts[3] : undefined,
  };
}
