"use client";

// Mobile-Hamburger-Drawer · ergänzt die BottomNav um die volle Sidebar.
// Erscheint nur unter md-Breakpoint. Slide-in von links, Backdrop-Klick
// + Esc schließen, Body-Scroll wird gesperrt während offen.

import Link from "next/link";
import { useEffect, useState } from "react";

export type DrawerItem = {
  href: string;
  label: string;
  vibe: string;
  iconNode: React.ReactNode;
};

export function MobileNavDrawer({
  items,
  station,
  user,
  switchRole,
  rolePrimaer,
  roleLabel,
}: {
  items: DrawerItem[];
  station: string;
  user: { name: string; subtitle: string };
  switchRole: { href: string; label: string };
  rolePrimaer: string;  // z.B. "var(--mon)"
  roleLabel: string;    // z.B. "Pflege"
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors active:scale-95"
        style={{
          color: `rgb(${rolePrimaer})`,
          background: `rgb(${rolePrimaer} / 0.08)`,
          boxShadow: `inset 0 0 0 1px rgb(${rolePrimaer} / 0.2)`,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40"
            style={{ background: "rgb(0 0 0 / 0.45)", backdropFilter: "blur(4px)" }}
            aria-hidden
          />
          <aside
            className="fixed left-0 top-0 bottom-0 w-[280px] z-50 flex flex-col"
            style={{
              background: "rgb(var(--bg-elev))",
              borderRight: `2px solid rgb(${rolePrimaer} / 0.5)`,
              animation: "drawerSlideIn 0.22s ease-out",
              boxShadow: `8px 0 32px rgb(${rolePrimaer} / 0.15)`,
            }}
          >
            <div
              className="px-5 pt-5 pb-3 flex items-start justify-between gap-2"
              style={{ background: `linear-gradient(180deg, rgb(${rolePrimaer} / 0.08), transparent)` }}
            >
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider font-mono mb-1"
                  style={{ color: `rgb(${rolePrimaer})` }}
                >
                  {roleLabel}
                </p>
                <p className="font-display font-bold text-[18px] tracking-tight2 leading-tight">
                  Shalem
                </p>
                <p className="text-[11px] text-soft mt-0.5">{station}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-mute hover:text-[rgb(var(--fg))] -mr-1 p-1"
                aria-label="Menü schließen"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="h-px mx-5 mb-2 bg-[rgb(var(--border-soft))]" />

            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-mute hover:text-[rgb(var(--fg))] hover:bg-[rgb(var(--bg-mute))] transition-colors"
                >
                  <span
                    className="grid place-items-center w-7 h-7 rounded-md shrink-0"
                    style={{
                      color: `rgb(${item.vibe})`,
                      background: `rgb(${item.vibe} / 0.1)`,
                    }}
                  >
                    {item.iconNode}
                  </span>
                  <span className="font-medium truncate">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="px-3 pb-2">
              <Link
                href={switchRole.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-[12px] text-soft rounded-lg hover:bg-[rgb(var(--bg-mute))] hover:text-mute transition-colors"
              >
                {switchRole.label}
              </Link>
            </div>

            <div className="border-t border-app-soft px-4 py-3 bg-[rgb(var(--bg))]">
              <div className="text-[13px] font-medium truncate">{user.name}</div>
              <div className="text-[11px] text-soft truncate">{user.subtitle}</div>
            </div>
          </aside>
        </>
      )}

      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
