"use client";

// ProfilMenschlich · "Mensch hinter dem Beruf"-Sektion mit Bio,
// Lebensmotto, Hobbys, Lebensziele, typischer Tag, Erreichbarkeit.
//
// Inline-Edit-Pattern: Klick auf Feld → wird zu textarea, Blur speichert.
// Hobbys + Sprachen sind Listen — Add-Button + Chip-Liste.

import { useState, useTransition } from "react";
import { speichereProfilMenschlich, fuegeSpracheHinzu, entferneSprache } from "@/lib/profile/actions";
import type { ProfilMenschlich, ProfilSprache } from "@/lib/profile/store";

const NIVEAU_LABEL: Record<ProfilSprache["niveau"], string> = {
  muttersprache: "Muttersprache",
  verhandlung: "verhandlungssicher",
  alltag: "Alltag",
  grundkenntnis: "Grundkenntnis",
};

const NIVEAU_FARBE: Record<ProfilSprache["niveau"], string> = {
  muttersprache: "var(--thu)",
  verhandlung: "var(--vibe-team)",
  alltag: "var(--sun)",
  grundkenntnis: "var(--fg-mute)",
};

const NIVEAU_ICON: Record<ProfilSprache["niveau"], string> = {
  muttersprache: "/icons/sprache-mutter.png",
  verhandlung: "/icons/sprache-verhandlung.png",
  alltag: "/icons/sprache-alltag.png",
  grundkenntnis: "/icons/sprache-grund.png",
};

export function ProfilMenschlichSection({ profil }: { profil: ProfilMenschlich }) {
  return (
    <section className="surface rounded-2xl p-5 anim-slideUp">
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-0.5">Mensch hinter dem Beruf</p>
        <h2 className="font-display text-[18px] font-semibold tracking-tight2">Wer bist du, abseits der Akte?</h2>
        <p className="text-[12px] text-mute mt-1 leading-snug">
          Diese Felder sind freiwillig und nur für deine Klient:innen + dein Team sichtbar. Sie helfen, den richtigen Menschen mit dem richtigen Menschen zu matchen.
        </p>
      </header>

      <div className="space-y-4">
        <Feld label="Über mich" hint="Zwei Sätze in deinen eigenen Worten." personId={profil.personId} feld="bio" wert={profil.bio} mehrzeilig />
        <Feld label="Lebensmotto" hint="Ein Satz oder Zitat, das dich trägt." personId={profil.personId} feld="lebensmotto" wert={profil.lebensmotto} />
        <HobbyListe profil={profil} />
        <SprachListe profil={profil} />
        <Feld label="Lebensziele" hint="Was treibt dich langfristig?" personId={profil.personId} feld="lebensziele" wert={profil.lebensziele} mehrzeilig />
        <Feld label="Mein typischer Tag" hint="Tagesrhythmus, Mittagspause-Rituale." personId={profil.personId} feld="typischerTag" wert={profil.typischerTag} mehrzeilig />
        <Feld label="Erreichbarkeit" hint="Wann ja, wann lieber nicht?" personId={profil.personId} feld="erreichbarkeit" wert={profil.erreichbarkeit} />
      </div>
    </section>
  );
}

function Feld({
  label,
  hint,
  personId,
  feld,
  wert,
  mehrzeilig,
}: {
  label: string;
  hint: string;
  personId: string;
  feld: "bio" | "lebensmotto" | "lebensziele" | "typischerTag" | "erreichbarkeit";
  wert?: string;
  mehrzeilig?: boolean;
}) {
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState(wert ?? "");
  const [pending, start] = useTransition();

  const speichern = () => {
    setEdit(false);
    if (text === (wert ?? "")) return;
    start(async () => {
      await speichereProfilMenschlich(personId, { [feld]: text || undefined });
    });
  };

  return (
    <div className="border-b border-app-soft pb-3 last:border-0">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <p className="text-[12px] uppercase tracking-wide text-soft font-medium">{label}</p>
        {!edit && (
          <button onClick={() => setEdit(true)} className="text-[11px] text-soft hover:text-[rgb(var(--fg))]">
            {wert ? "ändern" : "+ hinzufügen"}
          </button>
        )}
      </div>
      {edit ? (
        mehrzeilig ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={speichern}
            autoFocus
            rows={3}
            className="textarea text-[13px] w-full"
            placeholder={hint}
            disabled={pending}
          />
        ) : (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={speichern}
            onKeyDown={(e) => { if (e.key === "Enter") speichern(); }}
            autoFocus
            className="input text-[13px] w-full"
            placeholder={hint}
            disabled={pending}
          />
        )
      ) : wert ? (
        <p className={`text-[13px] leading-relaxed ${feld === "lebensmotto" ? "italic" : ""}`}>{wert}</p>
      ) : (
        <p className="text-[12px] text-soft italic">{hint}</p>
      )}
    </div>
  );
}

function HobbyListe({ profil }: { profil: ProfilMenschlich }) {
  const [neu, setNeu] = useState("");
  const [pending, start] = useTransition();
  const hobbys = profil.hobbys ?? [];

  const add = () => {
    if (!neu.trim()) return;
    const naechste = [...hobbys, neu.trim()];
    setNeu("");
    start(async () => {
      await speichereProfilMenschlich(profil.personId, { hobbys: naechste });
    });
  };

  const entferne = (h: string) => {
    start(async () => {
      await speichereProfilMenschlich(profil.personId, { hobbys: hobbys.filter((x) => x !== h) });
    });
  };

  return (
    <div className="border-b border-app-soft pb-3">
      <p className="text-[12px] uppercase tracking-wide text-soft font-medium mb-2">Hobbys</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {hobbys.length === 0 && <p className="text-[12px] text-soft italic">Was machst du, wenn niemand zuschaut?</p>}
        {hobbys.map((h) => (
          <span key={h} className="chip text-[11px] flex items-center gap-1.5" style={{ background: "rgb(var(--bg-mute))" }}>
            {h}
            <button onClick={() => entferne(h)} className="text-mute hover:text-[rgb(var(--mon))]" aria-label={`${h} entfernen`}>×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={neu}
          onChange={(e) => setNeu(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          placeholder="z.B. Imkerei, Bouldern, Lyrik schreiben"
          className="input text-[12px] flex-1"
          disabled={pending}
        />
        <button onClick={add} disabled={pending || !neu.trim()} className="text-[12px] px-3 rounded-md" style={{ background: "rgb(var(--accent) / 0.12)", color: "rgb(var(--accent))" }}>
          +
        </button>
      </div>
    </div>
  );
}

const SPRACH_OPTIONEN = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "Englisch" },
  { code: "tr", label: "Türkisch" },
  { code: "ar", label: "Arabisch" },
  { code: "ru", label: "Russisch" },
  { code: "uk", label: "Ukrainisch" },
  { code: "pl", label: "Polnisch" },
  { code: "ro", label: "Rumänisch" },
  { code: "fr", label: "Französisch" },
  { code: "es", label: "Spanisch" },
  { code: "it", label: "Italienisch" },
  { code: "fa", label: "Persisch" },
  { code: "vi", label: "Vietnamesisch" },
  { code: "tlh", label: "Gebärdensprache (DGS)" },
];

function SprachListe({ profil }: { profil: ProfilMenschlich }) {
  const [code, setCode] = useState("");
  const [niveau, setNiveau] = useState<ProfilSprache["niveau"]>("alltag");
  const [pending, start] = useTransition();
  const sprachen = profil.sprachen ?? [];

  const add = () => {
    if (!code) return;
    const opt = SPRACH_OPTIONEN.find((s) => s.code === code);
    if (!opt) return;
    setCode("");
    start(async () => {
      await fuegeSpracheHinzu(profil.personId, { code, label: opt.label, niveau });
    });
  };

  const entferne = (c: string) => {
    start(async () => {
      await entferneSprache(profil.personId, c);
    });
  };

  const verfuegbar = SPRACH_OPTIONEN.filter((o) => !sprachen.find((s) => s.code === o.code));

  return (
    <div className="border-b border-app-soft pb-3">
      <p className="text-[12px] uppercase tracking-wide text-soft font-medium mb-2">Sprachen, die ich spreche</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {sprachen.length === 0 && <p className="text-[12px] text-soft italic">Wichtig fürs Klient-Matching — auch Mundart oder Gebärdensprache zählt.</p>}
        {sprachen.map((s) => (
          <span
            key={s.code}
            className="chip text-[11px] flex items-center gap-1.5"
            style={{ background: `rgb(${NIVEAU_FARBE[s.niveau]} / 0.15)`, color: `rgb(${NIVEAU_FARBE[s.niveau]})` }}
          >
            <img src={NIVEAU_ICON[s.niveau]} alt="" width={14} height={14} className="shrink-0" />
            {s.label} · {NIVEAU_LABEL[s.niveau]}
            <button onClick={() => entferne(s.code)} className="hover:opacity-70" aria-label={`${s.label} entfernen`}>×</button>
          </span>
        ))}
      </div>
      {verfuegbar.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <select value={code} onChange={(e) => setCode(e.target.value)} className="select text-[12px] flex-1 min-w-[120px]" disabled={pending}>
            <option value="">Sprache wählen…</option>
            {verfuegbar.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
          <select value={niveau} onChange={(e) => setNiveau(e.target.value as ProfilSprache["niveau"])} className="select text-[12px]" disabled={pending}>
            {(Object.keys(NIVEAU_LABEL) as ProfilSprache["niveau"][]).map((n) => (
              <option key={n} value={n}>{NIVEAU_LABEL[n]}</option>
            ))}
          </select>
          <button onClick={add} disabled={pending || !code} className="text-[12px] px-3 rounded-md" style={{ background: "rgb(var(--accent) / 0.12)", color: "rgb(var(--accent))" }}>
            +
          </button>
        </div>
      )}
    </div>
  );
}
