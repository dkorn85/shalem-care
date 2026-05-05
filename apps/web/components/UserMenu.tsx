"use client";

// UserMenu · Dropdown im Header mit Modus-Anzeige + Rollen-Switch.
//
// Wird vom Server mit Initial-State befuellt (eingeloggter User, aktueller
// Rollen-Switch). Client-Component damit das Dropdown auf-/zugeht.
// Switch-Aktionen rufen Server-Actions auf, die Cookies setzen.

import { useState, useTransition } from "react";
import Link from "next/link";
import { switcheRolle, clearRolleSwitch } from "@/lib/auth/rolle-switch";
import { signOut } from "@/lib/auth/actions";
import { ROLLEN, type RegistrierRolle } from "@/lib/auth/rollen";
import { DEMO_MODI, type DemoModus } from "@/lib/auth/demo-modi";

const ROLLEN_REIHENFOLGE: RegistrierRolle[] = [
  "klient", "angehoerig", "pflege", "arzt", "therapie",
  "sozialarbeit", "heilerziehung", "ehrenamt", "hauswirtschaft",
  "erziehung", "lead", "genossenschaftsmitglied",
];

export type UserMenuProps = {
  eingeloggt: boolean;
  email?: string | null;
  displayName?: string | null;
  demoMode?: DemoModus;
  hauptRolle?: RegistrierRolle | null;
  switchedZu?: RegistrierRolle | null;
  darfSwitchen: boolean;
};

export function UserMenu({
  eingeloggt,
  email,
  displayName,
  demoMode = "real",
  hauptRolle,
  switchedZu,
  darfSwitchen,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const m = DEMO_MODI[demoMode];

  if (!eingeloggt) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/anmelden" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">Anmelden</Link>
        <Link href="/registrieren" className="text-[12px] px-3 py-1.5 rounded-md" style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}>
          Konto anlegen
        </Link>
      </div>
    );
  }

  const initials = (displayName ?? email ?? "U").split(/[\s@]+/).filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const aktuelleRolle: RegistrierRolle | null = switchedZu ?? hauptRolle ?? null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 surface-hover rounded-full pl-1 pr-3 py-1 transition-colors"
        aria-expanded={open}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold tracking-wider"
          style={{ background: `rgb(${m.farbe} / 0.15)`, color: `rgb(${m.farbe})` }}
        >
          {initials}
        </span>
        <span className="text-[12px] font-medium hidden sm:inline">
          {switchedZu ? `${ROLLEN[switchedZu].label} 🎭` : (displayName ?? email ?? "Du")}
        </span>
        <span aria-hidden className="text-[9px] text-soft">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40"
            tabIndex={-1}
          />

          <div
            className="absolute right-0 top-full mt-2 w-80 surface rounded-xl shadow-lg z-50 overflow-hidden"
            style={{ boxShadow: "0 16px 48px rgb(0 0 0 / 0.18), inset 0 0 0 1px rgb(var(--border-soft))" }}
          >
            {/* Status-Header */}
            <div className="p-3" style={{ background: `linear-gradient(135deg, rgb(${m.farbe} / 0.08), transparent)` }}>
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `rgb(${m.farbe})` }}>
                {m.label} · eingeloggt
              </p>
              <p className="text-[13px] font-semibold mt-0.5 truncate">{displayName ?? email}</p>
              {email && email !== displayName && <p className="text-[10px] text-soft font-mono truncate">{email}</p>}
              {hauptRolle && (
                <p className="text-[11px] text-mute mt-1">
                  Haupt-Rolle: <strong>{ROLLEN[hauptRolle].label}</strong>
                </p>
              )}
            </div>

            {/* Aktive Switch-Anzeige */}
            {switchedZu && (
              <div className="px-3 py-2 border-t border-app-soft" style={{ background: `rgb(${ROLLEN[switchedZu].farbe} / 0.06)` }}>
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `rgb(${ROLLEN[switchedZu].farbe})` }}>
                      Switched zu
                    </p>
                    <p className="text-[12px] font-medium">{ROLLEN[switchedZu].label}</p>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => start(() => clearRolleSwitch())}
                    className="text-[11px] px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                    style={{ color: "rgb(var(--fg-mute))", boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.3)" }}
                  >
                    Switch beenden
                  </button>
                </div>
              </div>
            )}

            {/* Rollen-Switch-Liste */}
            {darfSwitchen && (
              <div className="border-t border-app-soft">
                <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-soft font-medium">
                  Rolle wechseln {!hauptRolle && "(temporär)"}
                </p>
                <ul className="max-h-[320px] overflow-y-auto pb-2">
                  {ROLLEN_REIHENFOLGE.map((rolle) => {
                    const r = ROLLEN[rolle];
                    const aktiv = aktuelleRolle === rolle;
                    return (
                      <li key={rolle}>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => start(() => switcheRolle(rolle))}
                          className="w-full px-3 py-1.5 text-left flex items-baseline justify-between gap-2 transition-colors hover:bg-[rgb(var(--bg-mute))] disabled:opacity-50"
                        >
                          <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                            <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: `rgb(${r.farbe})` }} />
                            <span className="text-[12px] font-medium truncate" style={{ color: aktiv ? `rgb(${r.farbe})` : undefined }}>
                              {r.label}
                            </span>
                            {aktiv && <span className="text-[9px] text-soft">aktiv</span>}
                          </div>
                          <span aria-hidden className="text-[10px] text-soft font-mono">{r.cockpitPfad}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Footer-Links */}
            <div className="border-t border-app-soft py-1">
              <Link href="/profil" className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">
                Mein Profil
              </Link>
              <Link href="/profil/dsgvo" className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">
                DSGVO · Daten + Löschen
              </Link>
              <Link href="/messenger" className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">
                Messenger
              </Link>
              {(demoMode === "superuser" || hauptRolle === "lead") && (
                <>
                  <Link href="/admin/verifikationen" className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">
                    Verifikationen prüfen
                  </Link>
                  <Link href="/admin/audit-log" className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">
                    Audit-Log
                  </Link>
                </>
              )}
              <form action={signOut}>
                <button type="submit" className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]" style={{ color: "rgb(var(--fg-mute))" }}>
                  Ausloggen
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
