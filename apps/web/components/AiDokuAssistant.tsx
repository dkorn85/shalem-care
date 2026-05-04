"use client";

import { useState, useTransition } from "react";
import { aiStructureObservation, saveDokuEntry } from "@/lib/doku/doku-actions";
import { SIS_THEMENFELDER, RISIKO_LABEL, BERUFS_LABEL } from "@/lib/doku/types";
import type { BerufsTyp, SISThemenfeld, RisikoTyp } from "@/lib/doku/types";

type Suggestion = Awaited<ReturnType<typeof aiStructureObservation>>;

export function AiDokuAssistant({
  klientId,
  authorId,
  defaultBeruf = "pflege",
}: {
  klientId: string;
  authorId: string;
  defaultBeruf?: BerufsTyp;
}) {
  const [raw, setRaw] = useState("");
  const [beruf, setBeruf] = useState<BerufsTyp>(defaultBeruf);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [savingPending, startSaveTransition] = useTransition();
  const [aiPending, startAiTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  // Editierbare Felder nach KI-Vorschlag
  const [edit, setEdit] = useState<{
    inhaltKurz: string;
    inhaltLang: string;
    themenfeld: SISThemenfeld | "";
    risiken: Set<RisikoTyp>;
    massnahmen: string[];
    abweichung: boolean;
  }>({
    inhaltKurz: "",
    inhaltLang: "",
    themenfeld: "",
    risiken: new Set(),
    massnahmen: [],
    abweichung: false,
  });

  const callAi = () => {
    setErr(null);
    setSavedOk(false);
    startAiTransition(async () => {
      const result = await aiStructureObservation({ raw, klientId, beruf });
      if (!result.ok) {
        setErr(result.error);
        return;
      }
      setSuggestion(result);
      // Vorschlag in editierbare Felder übernehmen
      const data = result.data;
      const firstSentence = data.inhaltLang.split(/[.!?]/)[0].trim().slice(0, 140);
      setEdit({
        inhaltKurz: firstSentence,
        inhaltLang: data.inhaltLang,
        themenfeld: data.themenfeld ?? "",
        risiken: new Set(data.risiken),
        massnahmen: data.vorgeschlageneMassnahmen,
        abweichung: data.abweichungVomNormalverlauf,
      });
    });
  };

  const save = (signNow: boolean) => {
    setErr(null);
    startSaveTransition(async () => {
      const result = await saveDokuEntry({
        klientId,
        authorId,
        beruf,
        themenfeld: edit.themenfeld || undefined,
        inhaltKurz: edit.inhaltKurz,
        inhaltLang: edit.inhaltLang,
        risiken: [...edit.risiken],
        vorgeschlageneMassnahmen: edit.massnahmen.filter((m) => m.trim()),
        abweichungVomNormalverlauf: edit.abweichung,
        aiAssisted: !!suggestion,
        aiSuggestionRaw: suggestion?.ok ? suggestion.data.rawText : undefined,
        aiProvider: suggestion?.ok ? suggestion.data.meta.provider : undefined,
        signNow,
      });
      if (!result.ok) {
        setErr(result.error);
        return;
      }
      setSavedOk(true);
      setRaw("");
      setSuggestion(null);
      setEdit({
        inhaltKurz: "",
        inhaltLang: "",
        themenfeld: "",
        risiken: new Set(),
        massnahmen: [],
        abweichung: false,
      });
    });
  };

  return (
    <div className="surface rounded-2xl p-5 sm:p-6 space-y-5 anim-slideUp">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">KI-Assistent</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-1">Neuer Doku-Eintrag</h3>
        </div>
        <select
          value={beruf}
          onChange={(e) => setBeruf(e.target.value as BerufsTyp)}
          className="select max-w-[200px]"
        >
          {Object.entries(BERUFS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[13px] font-medium mb-1.5">Beobachtung — schreib einfach was du gesehen hast</label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="z.B.: Frau Reinhardt heute 14:30 Uhr — sie ist aus dem Sessel ohne Hilfe aufgestanden, hat den Rollator genommen und ist bis zum Speisesaal gelaufen, etwa 30 Meter, ohne Pause. Hat sich nicht festgehalten beim Aufstehen. RR vorher 132/78."
          className="textarea resize-none font-sans"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-soft">
            {raw.length}/2000 Zeichen · keine Diagnosen, nur Beobachtetes
          </span>
          <button
            type="button"
            onClick={callAi}
            disabled={aiPending || raw.trim().length < 10}
            className="btn btn-primary"
          >
            {aiPending ? (
              <>
                <span className="pulse-dot" />
                Strukturieren ...
              </>
            ) : (
              <>✨ KI strukturieren</>
            )}
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-lg p-3 text-[13px]" style={{ background: "rgb(var(--mon) / 0.1)", color: "rgb(var(--mon))" }}>
          {err}
        </div>
      )}

      {suggestion?.ok && (
        <div className="space-y-4 pt-3 border-t border-app-soft anim-fadeIn">
          <div className="flex items-center gap-2 text-[11px] text-soft">
            <span className="pulse-dot" />
            <span className="font-mono">
              {suggestion.data.meta.provider} · {suggestion.data.meta.model} · {suggestion.data.meta.tokensInput}+{suggestion.data.meta.tokensOutput} Tokens
              {suggestion.data.meta.costEur > 0 ? ` · ~${(suggestion.data.meta.costEur * 100).toFixed(2)} Cent` : " · 0 € (Mock)"}
            </span>
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5">Kurzbezeichnung</label>
            <input
              type="text"
              value={edit.inhaltKurz}
              onChange={(e) => setEdit((s) => ({ ...s, inhaltKurz: e.target.value }))}
              maxLength={140}
              className="input"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5">Strukturierter Eintrag (vom KI vorgeschlagen, frei editierbar)</label>
            <textarea
              value={edit.inhaltLang}
              onChange={(e) => setEdit((s) => ({ ...s, inhaltLang: e.target.value }))}
              rows={6}
              className="textarea resize-none font-sans"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5">SIS-Themenfeld</label>
              <select
                value={edit.themenfeld}
                onChange={(e) => setEdit((s) => ({ ...s, themenfeld: e.target.value as SISThemenfeld }))}
                className="select"
              >
                <option value="">— wählen —</option>
                {SIS_THEMENFELDER.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="abweichung"
                checked={edit.abweichung}
                onChange={(e) => setEdit((s) => ({ ...s, abweichung: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="abweichung" className="text-[13px]">Abweichung vom Normalverlauf (Berichteblatt)</label>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-2">Risiko-Marker</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(RISIKO_LABEL).map(([id, label]) => {
                const checked = edit.risiken.has(id as RisikoTyp);
                return (
                  <label key={id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(edit.risiken);
                        if (e.target.checked) next.add(id as RisikoTyp);
                        else next.delete(id as RisikoTyp);
                        setEdit((s) => ({ ...s, risiken: next }));
                      }}
                      className="peer sr-only"
                    />
                    <span className="block px-3 py-1.5 rounded-full text-[12px] font-medium surface-mute peer-checked:bg-[rgb(var(--mon)/0.15)] peer-checked:text-[rgb(var(--mon))] transition-all hover:scale-105">
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-2">Vorgeschlagene Maßnahmen</label>
            <div className="space-y-2">
              {edit.massnahmen.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m}
                    onChange={(e) => {
                      const next = [...edit.massnahmen];
                      next[idx] = e.target.value;
                      setEdit((s) => ({ ...s, massnahmen: next }));
                    }}
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setEdit((s) => ({ ...s, massnahmen: s.massnahmen.filter((_, i) => i !== idx) }))}
                    className="btn btn-ghost text-[12px]"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setEdit((s) => ({ ...s, massnahmen: [...s.massnahmen, ""] }))}
                className="btn btn-ghost text-[13px]"
              >
                + Maßnahme hinzufügen
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-app-soft flex-wrap">
            <p className="text-[11px] text-soft max-w-md">
              Mit "Signieren und speichern" wird der Eintrag MDK-prüffest. Korrekturen danach nur als Nachtrag möglich (§ 630f BGB).
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => save(false)}
                disabled={savingPending || !edit.inhaltKurz.trim() || !edit.inhaltLang.trim()}
                className="btn"
              >
                {savingPending ? "..." : "Als Entwurf speichern"}
              </button>
              <button
                type="button"
                onClick={() => save(true)}
                disabled={savingPending || !edit.inhaltKurz.trim() || !edit.inhaltLang.trim()}
                className="btn btn-primary"
              >
                {savingPending ? "..." : "Signieren und speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {savedOk && (
        <div className="rounded-lg p-3 text-[13px] anim-scale-in" style={{ background: "rgb(var(--thu) / 0.1)", color: "rgb(var(--thu))" }}>
          ✓ Doku-Eintrag gespeichert
        </div>
      )}
    </div>
  );
}
