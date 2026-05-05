"use client";

import { useState } from "react";

type NotizTyp = "wunsch" | "frage" | "sorge" | "freude";

const TYPEN: { id: NotizTyp; label: string; emoji: string; farbe: string; placeholder: string }[] = [
  { id: "wunsch", label: "Wunsch",  emoji: "✨", farbe: "var(--wed)",          placeholder: "Was wünschst du dir, das wir besprechen?" },
  { id: "frage",  label: "Frage",   emoji: "❓", farbe: "var(--vibe-team)",   placeholder: "Was möchtest du wissen?" },
  { id: "sorge",  label: "Sorge",   emoji: "💭", farbe: "var(--vibe-approval)",placeholder: "Was beschäftigt dich, das wir anschauen sollten?" },
  { id: "freude", label: "Freude",  emoji: "🌿", farbe: "var(--thu)",          placeholder: "Was läuft gerade gut?" },
];

type Notiz = {
  id: string;
  typ: NotizTyp;
  text: string;
  fuerKonferenz: boolean;
  erstelltAm: string;
};

const VOR_BEFUELLT: Notiz[] = [
  { id: "n-1", typ: "frage",  text: "Wann darf ich wieder selbstständig zur Toilette? Anika sagt die Wunde verheilt — ich frage mich was das für die Mobilisation bedeutet.",  fuerKonferenz: true,  erstelltAm: "vor 3 Tagen" },
  { id: "n-2", typ: "wunsch", text: "Karin (meine Tochter) soll am Wochenende mit eingeplant werden — sie kommt aus Hamburg, das passt nicht in den normalen Rhythmus.",       fuerKonferenz: true,  erstelltAm: "vor 5 Tagen" },
  { id: "n-3", typ: "freude", text: "Letzte Woche habe ich zum ersten Mal seit dem Sturz selbst Tee aufgebrüht. Rita war dabei. Es war schön.",                                  fuerKonferenz: false, erstelltAm: "vor 6 Tagen" },
  { id: "n-4", typ: "sorge",  text: "Die Tabletten-Liste ist sehr lang. Ich verliere manchmal den Überblick. Können wir gemeinsam schauen ob alles noch nötig ist?",            fuerKonferenz: true,  erstelltAm: "vor 8 Tagen" },
];

export function KlientNotizenForm() {
  const [notizen, setNotizen] = useState<Notiz[]>(VOR_BEFUELLT);
  const [aktiverTyp, setAktiverTyp] = useState<NotizTyp>("wunsch");
  const [text, setText] = useState("");
  const [fuerKonferenz, setFuerKonferenz] = useState(true);

  const speichern = () => {
    if (!text.trim()) return;
    setNotizen([
      { id: `n-${Date.now()}`, typ: aktiverTyp, text: text.trim(), fuerKonferenz, erstelltAm: "gerade eben" },
      ...notizen,
    ]);
    setText("");
  };

  const entfernen = (id: string) => setNotizen((n) => n.filter((x) => x.id !== id));
  const fuerKonferenzCount = notizen.filter((n) => n.fuerKonferenz).length;

  return (
    <>
      <section className="surface rounded-2xl p-5 mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Neuer Eintrag</p>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {TYPEN.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAktiverTyp(t.id)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
              style={{
                background: aktiverTyp === t.id ? `rgb(${t.farbe} / 0.15)` : "rgb(var(--bg-mute))",
                color: aktiverTyp === t.id ? `rgb(${t.farbe})` : "rgb(var(--fg-mute))",
                border: aktiverTyp === t.id ? `1px solid rgb(${t.farbe} / 0.3)` : "1px solid transparent",
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={TYPEN.find((t) => t.id === aktiverTyp)?.placeholder}
          rows={3}
          className="w-full rounded-lg border border-app-soft px-3 py-2 text-[14px] bg-[rgb(var(--bg-elev))] focus:outline-none focus:border-[rgb(var(--accent))] resize-y leading-relaxed"
        />
        <div className="flex items-center justify-between gap-3 flex-wrap mt-3">
          <label className="flex items-center gap-2 text-[12px] cursor-pointer">
            <input
              type="checkbox"
              checked={fuerKonferenz}
              onChange={(e) => setFuerKonferenz(e.target.checked)}
              className="w-4 h-4"
            />
            <span>für die nächste Konferenz sichtbar machen</span>
          </label>
          <button
            type="button"
            onClick={speichern}
            disabled={!text.trim()}
            className="btn btn-primary text-[13px] disabled:opacity-40"
          >
            Eintrag speichern →
          </button>
        </div>
      </section>

      {fuerKonferenzCount > 0 && (
        <section className="rounded-2xl p-4 mb-6" style={{ background: "rgb(var(--accent) / 0.08)" }}>
          <p className="text-[12px]">
            <strong>{fuerKonferenzCount}</strong> Einträge sind für die nächste Konferenz markiert —
            dein Team sieht sie als <em>Pre-Read</em> bevor ihr zusammenkommt.
          </p>
        </section>
      )}

      <ul className="space-y-3">
        {notizen.map((n) => {
          const t = TYPEN.find((x) => x.id === n.typ)!;
          return (
            <li key={n.id} className="surface rounded-2xl p-4 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${t.farbe})` }} />
              <div className="ml-2.5">
                <header className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                  <span className="chip text-[10px]" style={{ background: `rgb(${t.farbe} / 0.15)`, color: `rgb(${t.farbe})` }}>
                    {t.emoji} {t.label}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] text-soft font-mono">{n.erstelltAm}</span>
                    {n.fuerKonferenz && (
                      <span className="chip text-[10px]" style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}>
                        Konferenz
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => entfernen(n.id)}
                      className="text-[10px] text-soft hover:text-[rgb(var(--mon))]"
                    >
                      löschen
                    </button>
                  </div>
                </header>
                <p className="text-[14px] leading-relaxed text-pretty">{n.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
