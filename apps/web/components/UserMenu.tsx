"use client";

// HauptMenu (UserMenu) · die EINE Navigation für alles.
//
// Konsolidiert vorher zwei konkurrierende Menüs (Demo-PersonaSwitcher in
// den Shells + Auth-UserMenu im Layout) zu einer einzigen Quelle.
//
// Reihenfolge nach Usability:
//   1. Status-Header (wer bin ich, welcher Modus, Switch-Anzeige)
//   2. Aktiv-Indicator (du bist hier ↓ aktueller Pfad)
//   3. Empfänger:in + Angehörige (Plattform-Mitte)
//   4. Pflege-Versorgung (8 Berufe)
//   5. Gesundheits-Partner (5 neue: Apotheke/MedTech/Rettung/Bestatter/Begleitung)
//   6. Plattform-Sichten (Netz, Livemap, Schicht-Akten, Konferenz, Treuhand)
//   7. Mein Konto (Profil, DSGVO, Messenger, KI, Verifikation, Audit)
//   8. Logout

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { switcheRolle, clearRolleSwitch } from "@/lib/auth/rolle-switch";
import { signOut } from "@/lib/auth/actions";
import { ROLLEN, type RegistrierRolle } from "@/lib/auth/rollen";
import { DEMO_MODI, type DemoModus } from "@/lib/auth/demo-modi";

type Ziel = {
  id: string;
  label: string;
  href: string;
  farbe: string;
  beschreibung?: string;
  switchRolle?: RegistrierRolle;     // wenn gesetzt: Cookie-Switch statt Link
  matches: (path: string) => boolean;
};

type Sektion = {
  label: string;
  ziele: Ziel[];
};

const SEKTIONEN: Sektion[] = [
  {
    label: "Empfänger:in",
    ziele: [
      { id: "klient", label: "Klient:in · Helga", href: "/klient", farbe: "var(--wed)", switchRolle: "klient", matches: (p) => p === "/klient" || (p.startsWith("/klient/") && !p.startsWith("/klient-")) },
      { id: "angehoerig", label: "Angehörige:r", href: "/klient/dienstplan", farbe: "var(--vibe-stats)", switchRolle: "angehoerig", matches: (p) => p.startsWith("/klient/dienstplan") },
    ],
  },
  {
    label: "Pflege-Versorgung",
    ziele: [
      { id: "pflege", label: "Pflegekraft", href: "/pflege", farbe: "var(--mon)", switchRolle: "pflege", matches: (p) => p === "/pflege" || p.startsWith("/pflege/") || p.startsWith("/dienst") || p.startsWith("/tausch") },
      { id: "lead", label: "Stationsleitung", href: "/admin", farbe: "var(--vibe-team)", switchRolle: "lead", matches: (p) => p.startsWith("/admin") },
      { id: "arzt", label: "Arzt:Ärztin", href: "/arzt", farbe: "var(--vibe-profile)", switchRolle: "arzt", matches: (p) => p.startsWith("/arzt") },
      { id: "therapie", label: "Therapie", href: "/therapie", farbe: "var(--fri)", switchRolle: "therapie", matches: (p) => p.startsWith("/therapie") },
      { id: "sozialarbeit", label: "Sozialarbeit", href: "/sozial", farbe: "var(--tue)", switchRolle: "sozialarbeit", matches: (p) => p.startsWith("/sozial") },
      { id: "heilerziehung", label: "Heilerziehung", href: "/heilerziehung", farbe: "var(--sat)", switchRolle: "heilerziehung", matches: (p) => p.startsWith("/heilerziehung") },
      { id: "ehrenamt", label: "Ehrenamt · Hospiz", href: "/ehrenamt", farbe: "var(--thu)", switchRolle: "ehrenamt", matches: (p) => p.startsWith("/ehrenamt") },
      { id: "hauswirtschaft", label: "Hauswirtschaft", href: "/hauswirtschaft", farbe: "var(--sun)", switchRolle: "hauswirtschaft", matches: (p) => p.startsWith("/hauswirtschaft") },
      { id: "erziehung", label: "Erziehung", href: "/erziehung", farbe: "var(--vibe-stats)", switchRolle: "erziehung", matches: (p) => p.startsWith("/erziehung") },
      { id: "kasse", label: "Krankenkasse", href: "/kasse", farbe: "var(--vibe-stats)", matches: (p) => p.startsWith("/kasse") },
    ],
  },
  {
    label: "Gesundheits-Partner",
    ziele: [
      { id: "apotheke", label: "Apotheke", href: "/apotheke", farbe: "rgb(70 160 130)", matches: (p) => p.startsWith("/apotheke") },
      { id: "medizintechnik", label: "Medizintechnik", href: "/medizintechnik", farbe: "rgb(110 130 180)", matches: (p) => p.startsWith("/medizintechnik") },
      { id: "rettungsdienst", label: "Rettungsdienst", href: "/rettungsdienst", farbe: "rgb(220 100 100)", matches: (p) => p.startsWith("/rettungsdienst") },
      { id: "bestatter", label: "Bestatter:in", href: "/bestatter", farbe: "rgb(120 110 145)", matches: (p) => p.startsWith("/bestatter") },
      { id: "begleitung", label: "Würde-Begleitung", href: "/begleitung", farbe: "rgb(200 120 170)", matches: (p) => p.startsWith("/begleitung") },
    ],
  },
  {
    label: "Plattform-Sichten",
    ziele: [
      { id: "netz", label: "Netz · Übersicht", href: "/netz", farbe: "var(--accent)", matches: (p) => p.startsWith("/netz") },
      { id: "livemap", label: "Live-Map · 24 h", href: "/livemap", farbe: "var(--accent)", matches: (p) => p.startsWith("/livemap") },
      { id: "schicht", label: "Schicht-Akten", href: "/schicht", farbe: "var(--vibe-team)", matches: (p) => p.startsWith("/schicht") },
      { id: "treuhand", label: "Treuhand", href: "/treuhand", farbe: "rgb(100 150 170)", matches: (p) => p.startsWith("/treuhand") },
      { id: "compliance", label: "Compliance", href: "/compliance", farbe: "rgb(110 140 180)", matches: (p) => p.startsWith("/compliance") },
      { id: "genossenschaft", label: "Genossenschaft", href: "/genossenschaft", farbe: "var(--sun)", matches: (p) => p === "/genossenschaft" },
      { id: "pool", label: "Pool · Arbeitsamt-Ersatz", href: "/genossenschaft/pool", farbe: "var(--vibe-team)", matches: (p) => p.startsWith("/genossenschaft/pool") },
      { id: "solidartopf", label: "Solidar-Topf · Krankheit", href: "/genossenschaft/solidartopf", farbe: "var(--thu)", matches: (p) => p.startsWith("/genossenschaft/solidartopf") },
      { id: "warum", label: "Warum Genossenschaft?", href: "/warum", farbe: "var(--accent)", matches: (p) => p.startsWith("/warum") },
      { id: "ki", label: "KI · Klartext + Berufs-Brücke", href: "/ki", farbe: "var(--accent)", matches: (p) => p === "/ki" },
      { id: "fortbildung", label: "Fortbildung", href: "/fortbildung", farbe: "var(--vibe-stats)", matches: (p) => p.startsWith("/fortbildung") },
    ],
  },
];

export type UserMenuProps = {
  eingeloggt: boolean;
  email?: string | null;
  displayName?: string | null;
  demoMode?: DemoModus;
  hauptRolle?: RegistrierRolle | null;
  switchedZu?: RegistrierRolle | null;
  darfSwitchen: boolean;
  isDemoEnv: boolean;
};

const ROLLEN_OHNE_SWITCH: RegistrierRolle[] = ["genossenschaftsmitglied"];

export function UserMenu({
  eingeloggt,
  email,
  displayName,
  demoMode = "real",
  hauptRolle,
  switchedZu,
  darfSwitchen,
  isDemoEnv,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransitionFallback();
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const m = DEMO_MODI[demoMode];
  const aktuelleRolle: RegistrierRolle | null = switchedZu ?? hauptRolle ?? null;

  // Aktives Ziel ermitteln
  const aktivesZiel = (() => {
    for (const sek of SEKTIONEN) {
      for (const z of sek.ziele) {
        if (z.matches(pathname)) return { ...z, sektion: sek.label };
      }
    }
    return null;
  })();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Wenn weder eingeloggt noch Demo: minimale CTA-Pille
  if (!eingeloggt && !isDemoEnv) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/anmelden" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">Anmelden</Link>
        <Link href="/registrieren" className="text-[12px] px-3 py-1.5 rounded-md" style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}>
          Konto anlegen
        </Link>
      </div>
    );
  }

  const initials = (displayName ?? email ?? "Demo").split(/[\s@]+/).filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const triggerLabel = switchedZu
    ? `${ROLLEN[switchedZu].label} 🎭`
    : aktivesZiel?.label ?? (displayName ?? email ?? "Menü");

  const triggerFarbe = switchedZu
    ? `rgb(${ROLLEN[switchedZu].farbe})`
    : aktivesZiel?.farbe ?? `rgb(${m.farbe})`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 surface-hover rounded-full pl-1 pr-3 py-1 transition-colors"
        aria-expanded={open}
        title={aktivesZiel ? `Du bist hier: ${aktivesZiel.label}` : "Menü öffnen"}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold tracking-wider"
          style={{
            background: `${triggerFarbe.replace(")", " / 0.15)").replace("rgb(", "rgb(")}`,
            color: triggerFarbe,
          }}
        >
          {initials}
        </span>
        <span className="text-[12px] font-medium hidden sm:inline truncate max-w-[140px]" style={{ color: triggerFarbe }}>
          {triggerLabel}
        </span>
        <span aria-hidden className="text-[9px] text-soft">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[340px] surface rounded-xl z-50 overflow-hidden anim-slideUp"
          style={{ boxShadow: "0 16px 48px rgb(0 0 0 / 0.18), inset 0 0 0 1px rgb(var(--border-soft))" }}
        >
          {/* Status-Header */}
          <div className="p-3" style={{ background: `linear-gradient(135deg, rgb(${m.farbe} / 0.08), transparent)` }}>
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `rgb(${m.farbe})` }}>
                {eingeloggt ? `${m.label} · eingeloggt` : isDemoEnv ? "Demo-Modus · alle Rollen offen" : "Gast"}
              </p>
              {aktivesZiel && (
                <span className="text-[10px] text-soft">
                  hier: <span style={{ color: aktivesZiel.farbe.startsWith("rgb") ? aktivesZiel.farbe : `rgb(${aktivesZiel.farbe})` }}>{aktivesZiel.label}</span>
                </span>
              )}
            </div>
            {eingeloggt && <p className="text-[13px] font-semibold mt-0.5 truncate">{displayName ?? email}</p>}
            {eingeloggt && email && email !== displayName && <p className="text-[10px] text-soft font-mono truncate">{email}</p>}
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
                  <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `rgb(${ROLLEN[switchedZu].farbe})` }}>Switched zu</p>
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

          {/* Sektionen — die Eine-Wahrheit-Liste */}
          <div className="max-h-[440px] overflow-y-auto">
            {SEKTIONEN.map((sek) => (
              <div key={sek.label} className="border-t border-app-soft">
                <p className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-wider text-soft font-mono">{sek.label}</p>
                <ul className="pb-1">
                  {sek.ziele.map((z) => {
                    const aktiv = z.matches(pathname);
                    const farbe = z.farbe.startsWith("rgb") ? z.farbe : `rgb(${z.farbe})`;
                    const istSwitch = z.switchRolle && darfSwitchen && !ROLLEN_OHNE_SWITCH.includes(z.switchRolle);
                    return (
                      <li key={z.id}>
                        {istSwitch && z.switchRolle ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => { setOpen(false); start(() => switcheRolle(z.switchRolle!)); }}
                            className="w-full px-3 py-1.5 text-left flex items-baseline justify-between gap-2 hover:bg-[rgb(var(--bg-mute))] transition-colors disabled:opacity-50"
                            style={{ background: aktiv ? `${farbe.replace(")", " / 0.06)")}` : undefined }}
                          >
                            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                              <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: farbe }} />
                              <span className="text-[12px] font-medium truncate" style={{ color: aktiv ? farbe : undefined }}>{z.label}</span>
                              {aktiv && <span className="text-[9px] text-soft">aktiv</span>}
                            </div>
                            <span aria-hidden className="text-[10px] text-soft font-mono">{z.href}</span>
                          </button>
                        ) : (
                          <Link
                            href={z.href}
                            onClick={() => setOpen(false)}
                            className="px-3 py-1.5 flex items-baseline justify-between gap-2 hover:bg-[rgb(var(--bg-mute))] transition-colors"
                            style={{ background: aktiv ? `${farbe.replace(")", " / 0.06)")}` : undefined }}
                          >
                            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                              <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: farbe }} />
                              <span className="text-[12px] font-medium truncate" style={{ color: aktiv ? farbe : undefined }}>{z.label}</span>
                              {aktiv && <span className="text-[9px] text-soft">aktiv</span>}
                            </div>
                            <span aria-hidden className="text-[10px] text-soft font-mono">{z.href}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Mein Konto */}
          {eingeloggt ? (
            <div className="border-t border-app-soft py-1">
              <p className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-wider text-soft font-mono">Mein Konto</p>
              <Link href="/profil" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">Profil</Link>
              <Link href="/profil/dsgvo" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">DSGVO · Daten + Löschen</Link>
              <Link href="/messenger" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">Messenger</Link>
              {(demoMode === "superuser" || hauptRolle === "lead") && (
                <>
                  <Link href="/admin/verifikationen" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">Verifikationen prüfen</Link>
                  <Link href="/admin/audit-log" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">Audit-Log</Link>
                </>
              )}
              <form action={signOut}>
                <button type="submit" className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]" style={{ color: "rgb(var(--fg-mute))" }}>
                  Ausloggen
                </button>
              </form>
            </div>
          ) : (
            <div className="border-t border-app-soft py-1">
              <Link href="/anmelden" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]" style={{ color: "rgb(var(--accent))" }}>
                Anmelden — für persistente Daten + Audit
              </Link>
              <Link href="/registrieren" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] hover:bg-[rgb(var(--bg-mute))]">
                Konto anlegen
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mini-Polyfill for useTransition: Server-Actions need it for non-blocking calls.
import { useTransition as reactUseTransition } from "react";
function useTransitionFallback() {
  return reactUseTransition();
}
