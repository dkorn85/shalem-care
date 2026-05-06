"use client";

// MessengerShell · 3-Spalten-Discord-Layout für /messenger.
//
// Spalten:
//   ┌─ Sidebar (Channels in Kategorien · Suche · Server-Info)
//   ├─ Main (Channel-Header · Messages · Compose)
//   └─ Member-Liste (Presence + Anzahl pro Status)
//
// Mobile: Sidebar collapsed via Hamburger.

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  type Channel,
  type ChannelKategorie,
  type Presence,
  type Reaction,
  KATEGORIE_LABEL,
  KATEGORIE_PRAEFIX,
  KATEGORIE_FARBE,
  PRESENCE_FARBE,
  PRESENCE_LABEL,
  STANDARD_EMOJIS,
} from "@/lib/messenger/channels";

const KATEGORIEN_ORDER: ChannelKategorie[] = ["allgemein", "klient", "beruf", "prozess", "voice", "dm"];

export type MessengerShellProps = {
  channelsProKategorie: Record<ChannelKategorie, Channel[]>;
  aktiverChannel: Channel | null;
  presence: Presence[];
  /** Bereits gerenderte Messages-Liste (Server-Component) */
  children: React.ReactNode;
  /** Compose-Form (Server-Component) */
  composer?: React.ReactNode;
  /** Total Member-Count über alle Channels */
  serverMembers: number;
};

export function MessengerShell({
  channelsProKategorie,
  aktiverChannel,
  presence,
  children,
  composer,
  serverMembers,
}: MessengerShellProps) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<ChannelKategorie>>(new Set());
  const [memberCollapsed, setMemberCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleKat = (k: ChannelKategorie) => {
    setCollapsed((c) => {
      const n = new Set(c);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  };

  const filteredChannels = useMemo(() => {
    if (!search.trim()) return channelsProKategorie;
    const q = search.toLowerCase();
    const filt: Record<ChannelKategorie, Channel[]> = {
      allgemein: [], klient: [], beruf: [], prozess: [], voice: [], dm: [],
    };
    for (const k of KATEGORIEN_ORDER) {
      filt[k] = channelsProKategorie[k].filter(
        (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
      );
    }
    return filt;
  }, [search, channelsProKategorie]);

  const presenceGruppen = useMemo(() => {
    const groups: Record<string, Presence[]> = {};
    for (const p of presence) {
      groups[p.status] = groups[p.status] ?? [];
      groups[p.status].push(p);
    }
    return groups;
  }, [presence]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_240px] gap-0 h-[calc(100vh-120px)] min-h-[640px] -mx-4 sm:-mx-8">
      {/* ─── Sidebar · Channels ─── */}
      <aside
        className={`${sidebarOpen ? "fixed inset-0 z-40" : "hidden"} md:relative md:block md:inset-auto md:z-auto bg-[rgb(var(--bg-elev))] border-r border-app-soft overflow-y-auto`}
      >
        {sidebarOpen && (
          <div className="md:hidden flex justify-end p-2">
            <button onClick={() => setSidebarOpen(false)} type="button" className="text-[12px] px-2 py-1 surface-mute rounded">✕ schließen</button>
          </div>
        )}
        {/* Server-Header */}
        <header className="px-3 py-3 border-b border-app-soft">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Care-Discord · Pilot</p>
          <h2 className="font-display text-[14px] font-semibold mt-0.5">Shalem · Care-Net</h2>
          <p className="text-[10px] text-soft mt-0.5 font-mono">{serverMembers} Mitglieder</p>
        </header>

        {/* Suche */}
        <div className="px-3 py-2 border-b border-app-soft sticky top-0 z-10" style={{ background: "rgb(var(--bg-elev))" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Channels suchen…"
            className="w-full px-2 py-1.5 rounded text-[11px] surface-mute border-0 focus:outline-none"
            style={{ outline: "none" }}
          />
        </div>

        {/* Kategorien */}
        <nav className="py-2">
          {KATEGORIEN_ORDER.map((kat) => {
            const channels = filteredChannels[kat];
            if (channels.length === 0) return null;
            const isCollapsed = collapsed.has(kat);
            const farbe = KATEGORIE_FARBE[kat];
            const farbeBg = farbe.startsWith("rgb") ? farbe.replace(")", " / 0.06)") : `rgb(${farbe} / 0.06)`;
            const farbeFg = farbe.startsWith("rgb") ? farbe : `rgb(${farbe})`;
            return (
              <section key={kat} className="mb-2">
                <button
                  type="button"
                  onClick={() => toggleKat(kat)}
                  className="w-full px-3 py-1.5 flex items-baseline justify-between gap-2 hover:bg-[rgb(var(--bg-mute))] transition-colors"
                >
                  <span className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: farbeFg }}>
                    {KATEGORIE_LABEL[kat]}
                  </span>
                  <span className="text-[10px] font-mono shrink-0" style={{ color: farbeFg, opacity: 0.5 }}>
                    {isCollapsed ? "▸" : "▾"} {channels.length}
                  </span>
                </button>
                {!isCollapsed && (
                  <ul>
                    {channels.map((c) => {
                      const aktiv = aktiverChannel?.id === c.id;
                      return (
                        <li key={c.id}>
                          <Link
                            href={`/messenger?channel=${c.slug}`}
                            onClick={() => setSidebarOpen(false)}
                            className="px-3 py-1 flex items-baseline justify-between gap-2 transition-colors hover:bg-[rgb(var(--bg-mute))]"
                            style={{ background: aktiv ? farbeBg : undefined, borderLeft: aktiv ? `2px solid ${farbeFg}` : "2px solid transparent" }}
                          >
                            <span className="flex items-baseline gap-1.5 min-w-0 flex-1">
                              <span className="text-[10px] font-mono shrink-0" style={{ color: farbeFg, opacity: 0.6 }}>
                                {KATEGORIE_PRAEFIX[kat]}
                              </span>
                              <span
                                className={`text-[12px] truncate ${aktiv ? "font-medium" : ""} ${(c.ungelesen ?? 0) > 0 ? "font-medium" : ""}`}
                                style={aktiv ? { color: farbeFg } : undefined}
                              >
                                {c.name}
                              </span>
                              {c.e2e_ready && (
                                <span aria-hidden className="text-[8px] shrink-0" style={{ color: "rgb(var(--vibe-approval))" }} title="End-to-End-bereit (Phase-2 Matrix)">🔒</span>
                              )}
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                              {(c.erwaehnt ?? 0) > 0 && (
                                <span className="text-[9px] px-1 rounded font-mono font-bold" style={{ background: "rgb(var(--mon))", color: "white" }}>
                                  @{c.erwaehnt}
                                </span>
                              )}
                              {(c.ungelesen ?? 0) > 0 && (
                                <span className="text-[9px] px-1 rounded font-mono" style={{ background: `${farbeFg.replace("rgb(", "rgb(").replace(")", " / 0.2)")}`, color: farbeFg }}>
                                  {c.ungelesen}
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </nav>
      </aside>

      {/* ─── Main · Channel ─── */}
      <main className="flex flex-col min-w-0 bg-[rgb(var(--bg))]">
        {/* Channel-Header */}
        <header className="px-4 py-3 border-b border-app-soft flex items-baseline justify-between gap-3 flex-wrap">
          <div className="flex items-baseline gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[14px] mr-1"
              aria-label="Channels öffnen"
            >
              ☰
            </button>
            {aktiverChannel ? (
              <>
                <span className="text-[14px] font-mono shrink-0" style={{ color: KATEGORIE_FARBE[aktiverChannel.kategorie].startsWith("rgb") ? KATEGORIE_FARBE[aktiverChannel.kategorie] : `rgb(${KATEGORIE_FARBE[aktiverChannel.kategorie]})` }}>
                  {KATEGORIE_PRAEFIX[aktiverChannel.kategorie]}
                </span>
                <h1 className="font-display text-[16px] font-semibold truncate">{aktiverChannel.name}</h1>
                {aktiverChannel.privat && (
                  <span className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded font-mono surface-mute" style={{ color: "rgb(var(--fg-mute))" }}>
                    privat
                  </span>
                )}
                {aktiverChannel.e2e_ready && (
                  <span className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded font-mono" style={{ background: "rgb(var(--vibe-approval) / 0.15)", color: "rgb(var(--vibe-approval))" }}>
                    🔒 E2E-bereit
                  </span>
                )}
                <span className="text-[10px] text-soft truncate hidden sm:inline">{aktiverChannel.beschreibung}</span>
              </>
            ) : (
              <h1 className="font-display text-[16px] font-semibold">Wähle einen Channel</h1>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <button
              type="button"
              onClick={() => setMemberCollapsed(!memberCollapsed)}
              className="hidden xl:inline text-[11px] text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline"
            >
              {memberCollapsed ? "Mitglieder einblenden" : "Mitglieder ausblenden"}
            </button>
          </div>
        </header>

        {/* Messages-Bereich (children) */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4">
          {children}
        </div>

        {/* Compose */}
        {composer && (
          <div className="border-t border-app-soft p-3 bg-[rgb(var(--bg-elev))]">
            {composer}
          </div>
        )}
      </main>

      {/* ─── Member-Sidebar (xl only) ─── */}
      {!memberCollapsed && (
        <aside className="hidden xl:block bg-[rgb(var(--bg-elev))] border-l border-app-soft overflow-y-auto py-3">
          <header className="px-3 mb-2">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Mitglieder · {presence.length}</p>
          </header>
          {(["online", "im-dienst", "abwesend", "offline"] as const).map((status) => {
            const list = presenceGruppen[status] ?? [];
            if (list.length === 0) return null;
            const f = PRESENCE_FARBE[status];
            return (
              <section key={status} className="mb-3">
                <p className="px-3 text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: f.startsWith("rgb") ? f : `rgb(${f})` }}>
                  {PRESENCE_LABEL[status]} · {list.length}
                </p>
                <ul>
                  {list.map((p) => (
                    <li key={p.personId} className="px-3 py-1 flex items-center gap-2 hover:bg-[rgb(var(--bg-mute))] transition-colors">
                      <span aria-hidden className="w-2 h-2 rounded-full shrink-0" style={{ background: f.startsWith("rgb") ? f : `rgb(${f})` }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] truncate">{p.name}</p>
                        <p className="text-[10px] text-soft truncate font-mono">{p.beruf}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {/* Phase-2-Note */}
          <section className="px-3 mt-4 pt-3 border-t border-app-soft">
            <p className="text-[9px] uppercase tracking-wider text-soft font-mono mb-1">Phase 2 · Realtime</p>
            <p className="text-[10px] text-soft leading-relaxed">
              Heute mock. Phase 2: Supabase Realtime presence-channel · Latenz {"<"} 1 s.
            </p>
          </section>
        </aside>
      )}
    </div>
  );
}

// Kleines Reactions-Bar als Helfer (mock)
export function ReactionsBar({
  reactions,
  onToggle,
}: {
  reactions: Reaction[];
  onToggle: (emoji: string) => void;
}) {
  return (
    <div className="mt-1.5 flex items-center gap-1 flex-wrap">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onToggle(r.emoji)}
          className="text-[11px] px-1.5 py-0.5 rounded transition-colors"
          style={{
            background: r.hatIchReagiert ? "rgb(var(--accent) / 0.15)" : "rgb(var(--bg-mute))",
            boxShadow: r.hatIchReagiert ? "inset 0 0 0 1px rgb(var(--accent) / 0.3)" : undefined,
            color: r.hatIchReagiert ? "rgb(var(--accent))" : undefined,
          }}
        >
          {r.emoji} {r.count}
        </button>
      ))}
      <details className="relative">
        <summary className="text-[11px] px-1.5 py-0.5 rounded cursor-pointer surface-mute hover:bg-[rgb(var(--bg-mute))] list-none">
          ＋
        </summary>
        <div className="absolute bottom-full left-0 mb-1 surface rounded-lg p-1 flex gap-0.5 z-20" style={{ boxShadow: "0 8px 24px rgb(0 0 0 / 0.15)" }}>
          {STANDARD_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onToggle(e)}
              className="text-[14px] px-1 hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
