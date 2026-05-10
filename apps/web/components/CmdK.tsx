"use client";

// Globaler Cmd-K / Ctrl-K / "/"-Launcher.
//
// Modal-Overlay mit Live-Such-Filter durch alle Cockpit-Reiter aus
// der COCKPIT_SUB_NAV-Registry plus die Beruf-Hubs selbst.
//
// Tasten:
//  · ⌘K / Ctrl-K  → öffnen
//  · /            → öffnen (außer in Eingabefeldern)
//  · Esc          → schließen
//  · ↑/↓          → Auswahl bewegen
//  · Enter        → öffnen
//  · Click outside → schließen

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { COCKPIT_SUB_NAV } from "@/lib/cockpit-sub-nav/registry";

type Eintrag = {
  href:    string;
  label:   string;        // angezeigtes Label
  gruppe:  string;        // Beruf · Familie
  hint?:   string;        // Untertitel
  glyph?:  string;
};

const ALLE_EINTRAEGE: Eintrag[] = COCKPIT_SUB_NAV.flatMap((g) => [
  // Beruf-Hub selbst
  { href: g.basis, label: g.eyebrow, gruppe: g.eyebrow, hint: "Cockpit-Übersicht", glyph: "◇" },
  // Sub-Reiter
  ...g.items.map((i) => ({
    href:   i.href,
    label:  i.label,
    gruppe: g.eyebrow,
    hint:   i.hint,
    glyph:  i.glyph,
  })),
]);

export function CmdK() {
  const router = useRouter();
  const [offen, setOffen] = useState(false);
  const [query, setQuery] = useState("");
  const [aktiv, setAktiv] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Tastenkombi-Listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const ziel = e.target as HTMLElement | null;
      const inFeld = ziel?.tagName === "INPUT" || ziel?.tagName === "TEXTAREA" || ziel?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOffen((v) => !v);
        return;
      }
      if (e.key === "/" && !inFeld) {
        e.preventDefault();
        setOffen(true);
        return;
      }
      if (e.key === "Escape" && offen) {
        e.preventDefault();
        setOffen(false);
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [offen]);

  // Auf Open: Fokus in Suchfeld
  useEffect(() => {
    if (offen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setAktiv(0);
    } else {
      setQuery("");
    }
  }, [offen]);

  // Filter
  const treffer = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALLE_EINTRAEGE.slice(0, 20);
    const scored = ALLE_EINTRAEGE
      .map((e) => {
        const heu = `${e.label} ${e.gruppe} ${e.hint ?? ""} ${e.href}`.toLowerCase();
        const idx = heu.indexOf(q);
        return { e, score: idx === -1 ? Infinity : idx };
      })
      .filter((x) => x.score !== Infinity)
      .sort((a, b) => a.score - b.score)
      .slice(0, 50)
      .map((x) => x.e);
    return scored;
  }, [query]);

  // Aktiv-Auswahl Tasten
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!offen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setAktiv((i) => Math.min(treffer.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setAktiv((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const eintrag = treffer[aktiv];
        if (eintrag) {
          setOffen(false);
          router.push(eintrag.href);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [offen, treffer, aktiv, router]);

  // Aktiv-Eintrag in Sicht scrollen
  useEffect(() => {
    if (!offen || !listRef.current) return;
    const item = listRef.current.children[aktiv] as HTMLElement | undefined;
    if (item) item.scrollIntoView({ block: "nearest" });
  }, [aktiv, offen]);

  // Reset Aktiv bei neuem Query
  useEffect(() => { setAktiv(0); }, [query]);

  if (!offen) {
    return <CmdKHotkeyChip onClick={() => setOffen(true)} />;
  }

  return (
    <>
      <CmdKHotkeyChip onClick={() => setOffen(true)} />
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
        style={{ background: "rgb(0 0 0 / 0.45)", backdropFilter: "blur(6px)" }}
        onClick={() => setOffen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Cockpit-Suche"
      >
        <div
          className="surface rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
          style={{ background: "rgb(var(--bg-elev))" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pt-3 pb-2 border-b border-app-soft">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cockpit suchen — z.B. BtM, Naturheil, Sterbe-Wache, Hilfeplan"
              className="w-full bg-transparent text-[15px] py-2 outline-none"
            />
            <p className="text-[10px] text-soft font-mono mt-1">
              {treffer.length} {treffer.length === 1 ? "Treffer" : "Treffer"} ·
              <kbd className="font-mono mx-1 px-1 rounded surface-mute text-[9px]">↑↓</kbd>navigieren
              <kbd className="font-mono mx-1 px-1 rounded surface-mute text-[9px]">↵</kbd>öffnen
              <kbd className="font-mono mx-1 px-1 rounded surface-mute text-[9px]">Esc</kbd>schließen
            </p>
          </div>
          {treffer.length === 0 ? (
            <p className="p-6 text-center text-mute text-[13px]">
              Nichts zu „{query}" gefunden.
            </p>
          ) : (
            <ul ref={listRef} className="max-h-[55vh] overflow-y-auto py-1">
              {treffer.map((e, i) => (
                <li key={e.href + i}>
                  <Link
                    href={e.href}
                    onClick={() => setOffen(false)}
                    onMouseEnter={() => setAktiv(i)}
                    className="px-4 py-2 flex items-baseline gap-2 transition-colors"
                    style={{
                      background: i === aktiv ? "rgb(var(--accent) / 0.12)" : "transparent",
                      color: i === aktiv ? "rgb(var(--fg))" : "rgb(var(--fg))",
                    }}
                  >
                    <span aria-hidden className="text-[13px] leading-none w-4 shrink-0 text-soft">{e.glyph ?? "→"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium leading-tight">
                        <span className="text-soft text-[10px] uppercase tracking-wider font-mono mr-2">{e.gruppe}</span>
                        {e.label}
                      </p>
                      {e.hint && <p className="text-[11px] text-soft leading-tight font-mono mt-0.5">{e.hint}</p>}
                    </div>
                    <code className="font-mono text-[10px] text-soft shrink-0">{e.href}</code>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <footer className="border-t border-app-soft px-4 py-2 flex items-center justify-between text-[10px] text-soft font-mono">
            <span>Cmd-K · Ctrl-K · /</span>
            <Link href="/cockpits" className="hover:underline" onClick={() => setOffen(false)}>
              alle Cockpits-Karte →
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
}

function CmdKHotkeyChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cockpit-Suche öffnen"
      className="fixed bottom-4 left-4 z-30 surface rounded-full pl-2 pr-2.5 py-1 text-[11px] font-mono inline-flex items-center gap-1.5 hover:translate-y-[-1px] transition-transform"
      style={{ background: "rgb(var(--bg-elev) / 0.92)", boxShadow: "0 4px 16px rgb(0 0 0 / 0.10)" }}
    >
      <span aria-hidden className="text-[12px]">⌘</span>
      <span className="text-soft">K</span>
      <span className="text-soft">·</span>
      <span>suchen</span>
    </button>
  );
}
