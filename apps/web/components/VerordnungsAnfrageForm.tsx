"use client";

import { useState, useTransition, useMemo } from "react";
import { stelleAnfrage } from "@/lib/verordnung/actions";
import {
  KATEGORIE_LABEL, KATEGORIE_FARBE, STATUS_LABEL, STATUS_FARBE, DRINGLICHKEIT_LABEL,
} from "@/lib/verordnung/types";
import type {
  VerordnungsKategorie, Dringlichkeit, Verordnungswunsch, VerordnungsAnfrage,
} from "@/lib/verordnung/types";

type Doctor = { id: string; name: string; fachrichtung?: string; arztPraxis?: string };

export function VerordnungsAnfrageForm({
  klientId,
  authorId,
  authorName,
  authorRole,
  doctors,
  bestehende,
}: {
  klientId: string;
  authorId: string;
  authorName: string;
  authorRole: "pflege" | "klient" | "lead" | "angehoerig";
  doctors: Doctor[];
  bestehende: VerordnungsAnfrage[];
}) {
  const [show, setShow] = useState(false);
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const [kategorie, setKategorie] = useState<VerordnungsKategorie>("medikament");
  const [arztId, setArztId] = useState<string>(doctors[0]?.id ?? "");
  const [begruendung, setBegruendung] = useState("");
  const [dringlichkeit, setDringlichkeit] = useState<Dringlichkeit>("routine");

  // Felder pro Kategorie
  const [wirkstoff, setWirkstoff] = useState("");
  const [staerke, setStaerke] = useState("");
  const [dosierung, setDosierung] = useState("");
  const [menge, setMenge] = useState("30 Tbl N1");
  const [hilfsmittel, setHilfsmittel] = useState("");
  const [heilmittelCode, setHeilmittelCode] = useState("KG");
  const [heilmittelEinh, setHeilmittelEinh] = useState(10);
  const [heilmittelFreq, setHeilmittelFreq] = useState(2);
  const [hkpCode, setHkpCode] = useState("HKP-31");
  const [hkpFreq, setHkpFreq] = useState(1);
  const [psyVerfahren, setPsyVerfahren] = useState("Verhaltenstherapie");
  const [psySitzungen, setPsySitzungen] = useState(12);
  const [ueberweisung, setUeberweisung] = useState({ fachrichtung: "", fragestellung: "" });
  const [au, setAu] = useState({
    vonDatum: new Date().toISOString().slice(0, 10),
    bisDatum: new Date(Date.now() + 3 * 24 * 3_600_000).toISOString().slice(0, 10),
    folgeAU: false,
  });
  const [freitext, setFreitext] = useState("");

  const ausgewaehlterArzt = useMemo(
    () => doctors.find((d) => d.id === arztId),
    [doctors, arztId],
  );

  const wunsch: Verordnungswunsch = useMemo(() => {
    switch (kategorie) {
      case "medikament":      return { kategorie: "medikament", wirkstoff, staerke, dosierung, menge };
      case "heilmittel":      return { kategorie: "heilmittel", modulCode: heilmittelCode, einheiten: heilmittelEinh, frequenzProWoche: heilmittelFreq };
      case "hilfsmittel":     return { kategorie: "hilfsmittel", bezeichnung: hilfsmittel };
      case "haeusl_pflege":   return { kategorie: "haeusl_pflege", module: [{ code: hkpCode, haeufigkeitProTag: hkpFreq }] };
      case "psycho_therapie": return { kategorie: "psycho_therapie", verfahren: psyVerfahren, sitzungen: psySitzungen };
      case "ueberweisung":    return { kategorie: "ueberweisung", fachrichtung: ueberweisung.fachrichtung, fragestellung: ueberweisung.fragestellung };
      case "krankschreibung": return { kategorie: "krankschreibung", ...au };
      case "sonstiges":       return { kategorie: "sonstiges", freitext };
    }
  }, [kategorie, wirkstoff, staerke, dosierung, menge, hilfsmittel, heilmittelCode, heilmittelEinh, heilmittelFreq, hkpCode, hkpFreq, psyVerfahren, psySitzungen, ueberweisung, au, freitext]);

  const submit = () => {
    setFeedback(null);
    start(async () => {
      const r = await stelleAnfrage({
        klientId,
        anfragendeRolle: authorRole,
        anfragendeId: authorId,
        anfragendeName: authorName,
        arztId: ausgewaehlterArzt?.id,
        arztName: ausgewaehlterArzt?.name,
        fachrichtung: ausgewaehlterArzt?.fachrichtung,
        kategorie,
        wunsch,
        begruendung,
        dringlichkeit,
      });
      if (r.ok) {
        setFeedback(`✓ Anfrage gestellt — ${ausgewaehlterArzt?.name ?? "Arzt"} wurde benachrichtigt.`);
        setShow(false);
        setBegruendung("");
      } else {
        setFeedback(`✕ ${r.error}`);
      }
    });
  };

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 anim-slideUp">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Verordnungen</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-1">
            Übersicht & Anfrage an Arzt
          </h3>
          <p className="text-[12px] text-mute mt-1">
            Medikamente, Heilmittel, Hilfsmittel, HKP, Psychotherapie, Überweisung, AU.
            eRezept-Code wird mit Ausstellung erzeugt.
          </p>
        </div>
        <button onClick={() => setShow((s) => !s)} className="btn btn-primary text-[12px]">
          {show ? "× Schließen" : "+ Verordnung anfordern"}
        </button>
      </header>

      {feedback && (
        <div
          className="rounded-lg p-3 text-[13px] mb-3"
          style={{
            background: feedback.startsWith("✓") ? "rgb(var(--thu) / 0.1)" : "rgb(var(--mon) / 0.1)",
            color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))",
          }}
        >
          {feedback}
        </div>
      )}

      {/* Bestehende Anfragen-Übersicht */}
      {bestehende.length > 0 && (
        <ul className="space-y-1.5 mb-4">
          {bestehende.slice(0, 6).map((a) => (
            <li key={a.id} className="surface-mute rounded-lg p-2.5 text-[12px]">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="chip text-[10px]"
                  style={{ background: `rgb(${KATEGORIE_FARBE[a.kategorie]} / 0.15)`, color: `rgb(${KATEGORIE_FARBE[a.kategorie]})` }}
                >
                  {KATEGORIE_LABEL[a.kategorie]}
                </span>
                <span
                  className="chip text-[10px]"
                  style={{ background: `rgb(${STATUS_FARBE[a.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[a.status]})` }}
                >
                  {STATUS_LABEL[a.status]}
                </span>
                <span className="text-soft text-[11px] font-mono ml-auto">
                  {a.arztName ?? "—"}
                  {a.eRezeptCode && <span className="ml-2">eRx {a.eRezeptCode}</span>}
                </span>
              </div>
              <p className="text-mute mt-1 line-clamp-1">{a.begruendung}</p>
              {a.notizenArzt && (
                <p className="text-[11px] italic mt-1" style={{ color: "rgb(var(--mon))" }}>
                  Arzt: „{a.notizenArzt}“
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {show && (
        <div className="space-y-3 pt-3 border-t border-app-soft">
          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[12px] font-medium mb-1">Kategorie</label>
              <select value={kategorie} onChange={(e) => setKategorie(e.target.value as VerordnungsKategorie)} className="select text-[13px]">
                {Object.entries(KATEGORIE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1">Arzt / Therapeut:in</label>
              <select value={arztId} onChange={(e) => setArztId(e.target.value)} className="select text-[13px]">
                <option value="">— keinen direkt —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.fachrichtung ? ` · ${d.fachrichtung}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kategorie-spezifische Felder */}
          {kategorie === "medikament" && (
            <div className="grid sm:grid-cols-2 gap-2">
              <input value={wirkstoff} onChange={(e) => setWirkstoff(e.target.value)} placeholder="Wirkstoff (z.B. Mirtazapin)" className="input text-[13px]" />
              <input value={staerke} onChange={(e) => setStaerke(e.target.value)} placeholder="Stärke (z.B. 15 mg)" className="input text-[13px]" />
              <input value={dosierung} onChange={(e) => setDosierung(e.target.value)} placeholder="Dosierung (z.B. 0-0-1)" className="input text-[13px] font-mono" />
              <input value={menge} onChange={(e) => setMenge(e.target.value)} placeholder="Menge (z.B. 30 Tbl N1)" className="input text-[13px]" />
            </div>
          )}
          {kategorie === "heilmittel" && (
            <div className="grid sm:grid-cols-3 gap-2">
              <select value={heilmittelCode} onChange={(e) => setHeilmittelCode(e.target.value)} className="select text-[13px]">
                <option value="KG">KG · Krankengymnastik</option>
                <option value="KG-ZNS">KG-ZNS</option>
                <option value="KG-MT">Manuelle Therapie</option>
                <option value="ERG-MOT">Ergo motorisch-funktionell</option>
                <option value="ERG-SENS">Ergo sensomotorisch</option>
                <option value="LOG-EBT">Logopädie</option>
              </select>
              <input type="number" min={1} value={heilmittelEinh} onChange={(e) => setHeilmittelEinh(parseInt(e.target.value) || 0)} placeholder="Einheiten" className="input text-[13px]" />
              <input type="number" min={1} value={heilmittelFreq} onChange={(e) => setHeilmittelFreq(parseInt(e.target.value) || 0)} placeholder="× pro Woche" className="input text-[13px]" />
            </div>
          )}
          {kategorie === "hilfsmittel" && (
            <input value={hilfsmittel} onChange={(e) => setHilfsmittel(e.target.value)} placeholder="Bezeichnung (z.B. Rollator GKV-Standard)" className="input text-[13px]" />
          )}
          {kategorie === "haeusl_pflege" && (
            <div className="grid sm:grid-cols-2 gap-2">
              <select value={hkpCode} onChange={(e) => setHkpCode(e.target.value)} className="select text-[13px]">
                <option value="HKP-24">HKP-24 Injektion</option>
                <option value="HKP-26">HKP-26 RR-Messung</option>
                <option value="HKP-27">HKP-27 BZ-Messung</option>
                <option value="HKP-31">HKP-31 Medikamentengabe</option>
                <option value="HKP-32">HKP-32 Wundversorgung klein</option>
                <option value="HKP-33">HKP-33 Wundversorgung groß</option>
                <option value="HKP-35">HKP-35 Kompressionsverband</option>
              </select>
              <input type="number" min={1} value={hkpFreq} onChange={(e) => setHkpFreq(parseInt(e.target.value) || 1)} placeholder="× pro Tag" className="input text-[13px]" />
            </div>
          )}
          {kategorie === "psycho_therapie" && (
            <div className="grid sm:grid-cols-2 gap-2">
              <select value={psyVerfahren} onChange={(e) => setPsyVerfahren(e.target.value)} className="select text-[13px]">
                <option>Verhaltenstherapie</option>
                <option>Tiefenpsychologisch fundierte Therapie</option>
                <option>Analytische Psychotherapie</option>
                <option>Systemische Therapie</option>
              </select>
              <input type="number" min={1} max={300} value={psySitzungen} onChange={(e) => setPsySitzungen(parseInt(e.target.value) || 0)} placeholder="Sitzungen" className="input text-[13px]" />
            </div>
          )}
          {kategorie === "ueberweisung" && (
            <div className="space-y-2">
              <input value={ueberweisung.fachrichtung} onChange={(e) => setUeberweisung((s) => ({ ...s, fachrichtung: e.target.value }))} placeholder="Fachrichtung" className="input text-[13px]" />
              <input value={ueberweisung.fragestellung} onChange={(e) => setUeberweisung((s) => ({ ...s, fragestellung: e.target.value }))} placeholder="Fragestellung" className="input text-[13px]" />
            </div>
          )}
          {kategorie === "krankschreibung" && (
            <div className="grid sm:grid-cols-3 gap-2 items-end">
              <div>
                <label className="block text-[11px] text-soft mb-1">von</label>
                <input type="date" value={au.vonDatum} onChange={(e) => setAu((s) => ({ ...s, vonDatum: e.target.value }))} className="input text-[13px]" />
              </div>
              <div>
                <label className="block text-[11px] text-soft mb-1">bis</label>
                <input type="date" value={au.bisDatum} onChange={(e) => setAu((s) => ({ ...s, bisDatum: e.target.value }))} className="input text-[13px]" />
              </div>
              <label className="flex items-center gap-2 text-[12px]">
                <input type="checkbox" checked={au.folgeAU} onChange={(e) => setAu((s) => ({ ...s, folgeAU: e.target.checked }))} />
                Folge-AU
              </label>
            </div>
          )}
          {kategorie === "sonstiges" && (
            <textarea value={freitext} onChange={(e) => setFreitext(e.target.value)} rows={3} placeholder="Freitext-Anliegen" className="textarea text-[13px]" />
          )}

          {/* Begründung + Dringlichkeit */}
          <div>
            <label className="block text-[12px] font-medium">Begründung (klinisch / pflegerisch)</label>
            <textarea
              value={begruendung}
              onChange={(e) => setBegruendung(e.target.value)}
              rows={3}
              placeholder="Was wird beobachtet? Wie ist der Verlauf? Was sollte sich ändern?"
              className="textarea text-[13px]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-[12px] text-soft">Dringlichkeit:</label>
            {(["routine", "dringlich", "akut"] as Dringlichkeit[]).map((d) => (
              <label key={d} className="cursor-pointer">
                <input
                  type="radio"
                  checked={dringlichkeit === d}
                  onChange={() => setDringlichkeit(d)}
                  className="peer sr-only"
                />
                <span
                  className="chip text-[11px] peer-checked:bg-[rgb(var(--vibe-team)/0.2)] peer-checked:text-[rgb(var(--vibe-team))]"
                  style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
                >
                  {DRINGLICHKEIT_LABEL[d]}
                </span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-app-soft">
            <button onClick={() => setShow(false)} className="btn btn-ghost text-[13px]">Abbrechen</button>
            <button onClick={submit} disabled={pending || !begruendung.trim()} className="btn btn-primary text-[13px]">
              {pending ? "..." : "Anfrage absenden"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
