import Link from "next/link";
import { Wordmark, Logo } from "./Logo";
import { UndoBanner } from "./UndoBanner";
import { BottomNav } from "./BottomNav";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { PersonAvatar } from "./Avatar";
import { getLocale } from "@/lib/i18n/server";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

type Role = "nurse" | "lead" | "doctor";

const NURSE_NAV = [
  { href: "/",                label: "Dienstplan",    vibe: "var(--vibe-plan)",     icon: PlanIcon },
  { href: "/dienst",          label: "Stationsansicht",vibe: "var(--vibe-team)",    icon: WardIcon },
  { href: "/tausch",          label: "Tausch-Markt",  vibe: "var(--vibe-market)",   icon: SwapIcon },
  { href: "/profil",          label: "Mein Profil",   vibe: "var(--vibe-profile)",  icon: ProfileIcon },
];

const DOCTOR_NAV = [
  { href: "/arzt",            label: "Praxis",        vibe: "var(--vibe-team)",     icon: WardIcon },
  { href: "/arzt/anfragen",   label: "Anfragen",      vibe: "var(--vibe-approval)", icon: CheckIcon },
  { href: "/arzt/patienten",  label: "Patient:innen", vibe: "var(--vibe-profile)",  icon: TeamIcon },
];

const LEAD_NAV = [
  { href: "/admin",                label: "Übersicht",      vibe: "var(--vibe-plan)",     icon: GridIcon },
  { href: "/admin/dienstplan",     label: "Dienstplan",     vibe: "var(--vibe-team)",     icon: PlanIcon },
  { href: "/admin/disposition",    label: "KI-Disposition", vibe: "var(--vibe-market)",   icon: SparkIcon },
  { href: "/admin/genehmigungen",  label: "Genehmigungen",  vibe: "var(--vibe-approval)", icon: CheckIcon },
  { href: "/admin/team",           label: "Team",           vibe: "var(--vibe-team)",     icon: TeamIcon },
  { href: "/admin/zahlungen",      label: "Zahlungen",      vibe: "var(--vibe-stats)",    icon: PayIcon },
  { href: "/admin/erloes",         label: "Erlös",          vibe: "var(--vibe-stats)",    icon: EuroIcon },
  { href: "/admin/dokumentation",  label: "Doku",           vibe: "var(--vibe-team)",     icon: DokuIcon },
  { href: "/admin/auswertung",     label: "Auswertung",     vibe: "var(--vibe-stats)",    icon: ChartIcon },
  { href: "/admin/aktivitaet",     label: "Aktivität",      vibe: "var(--vibe-profile)",  icon: ClockIcon },
];

export async function AppShell({
  role,
  user,
  station,
  children,
}: {
  role: Role;
  user: { id?: string; name: string; subtitle: string; initials: string };
  station: string;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const nav = role === "lead" ? LEAD_NAV : role === "doctor" ? DOCTOR_NAV : NURSE_NAV;
  const switchRole = role === "lead"
    ? { href: "/", label: "→ Pflegekraft-Sicht" }
    : role === "doctor"
      ? { href: "/", label: "→ Pflegekraft-Sicht" }
      : { href: "/admin", label: "→ Träger-Admin" };

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-app-soft bg-[rgb(var(--bg-elev))]">
        <div className="px-5 pt-5 pb-3">
          <Link href="/willkommen" className="block">
            <Wordmark />
          </Link>
          <p className="text-[12px] text-soft mt-1.5 ml-9">{station}</p>
          {DEMO_MODE && (
            <div className="mt-3">
              <PersonaSwitcher demoMode={DEMO_MODE} />
            </div>
          )}
        </div>

        <div className="h-px mx-5 my-2 bg-[rgb(var(--border-soft))]" />

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {nav.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] text-mute transition-colors hover:text-[rgb(var(--fg))] anim-float"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `rgb(${item.vibe})` }}
                />
                <span
                  className="grid place-items-center w-6 h-6 rounded-md transition-colors group-hover:bg-[rgb(var(--bg-mute))]"
                  style={{ color: `rgb(${item.vibe})` }}
                >
                  <Icon />
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3 space-y-0.5">
          {role === "lead" && (
            <Link
              href="/system"
              className="flex items-center gap-2 px-3 py-2 text-[12px] text-soft hover:text-mute rounded-lg hover:bg-[rgb(var(--bg-mute))] transition-colors"
            >
              <span className="rainbow-bar h-1.5 w-1.5 rounded-full" />
              System-Terminal
            </Link>
          )}
          <Link
            href={switchRole.href}
            className="block px-3 py-2 text-[12px] text-soft hover:text-mute rounded-lg hover:bg-[rgb(var(--bg-mute))] transition-colors"
          >
            {switchRole.label}
          </Link>
        </div>

        <div className="border-t border-app-soft px-4 py-3 flex items-center gap-2.5">
          <PersonAvatar id={user.id ?? "—"} initials={user.initials} size={36} role={role === "doctor" ? "doctor" : role} />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium truncate">{user.name}</div>
            <div className="text-[11px] text-soft truncate">{user.subtitle}</div>
          </div>
          <LocaleSwitcher current={locale} />
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="md:hidden border-b border-app-soft px-4 py-3 flex items-center justify-between gap-2 bg-[rgb(var(--bg-elev))]">
          <Wordmark />
          <div className="flex items-center gap-2">
            <LocaleSwitcher current={locale} />
            <Link href={switchRole.href} className="text-[12px] text-soft">{switchRole.label}</Link>
          </div>
          {DEMO_MODE && (
            <div className="basis-full -mx-1 mt-2 overflow-x-auto">
              <PersonaSwitcher demoMode={DEMO_MODE} />
            </div>
          )}
        </header>

        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-24 lg:pb-10">
          <div className="rainbow-bar h-1 rounded-full mb-6 sm:mb-8 opacity-60" />
          {children}
        </div>
      </main>

      <UndoBanner />
      <BottomNav role={role} />
    </div>
  );
}

function PlanIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="10" height="9" rx="1.5" /><path d="M2 6h10M5 3V1.5M9 3V1.5" strokeLinecap="round" /></svg>; }
function SwapIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h9l-2-2M12 9H3l2 2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ProfileIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="5" r="2.5" /><path d="M2.5 12c0-2.2 2-3.5 4.5-3.5s4.5 1.3 4.5 3.5" strokeLinecap="round" /></svg>; }
function GridIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="4" height="4" rx="1" /><rect x="8" y="2" width="4" height="4" rx="1" /><rect x="2" y="8" width="4" height="4" rx="1" /><rect x="8" y="8" width="4" height="4" rx="1" /></svg>; }
function CheckIcon()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7.5l2.5 2.5L11 4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function TeamIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="5" r="2" /><circle cx="10" cy="6" r="1.5" /><path d="M1.5 11.5c0-1.7 1.5-2.7 3.5-2.7s3.5 1 3.5 2.7M9 11.5c0-1.2.7-2 2-2s2 .8 2 2" strokeLinecap="round" /></svg>; }
function ChartIcon()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12V2M2 12h10M5 9V7M8 9V5M11 9V3" strokeLinecap="round" /></svg>; }
function PayIcon()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="3.5" width="11" height="7" rx="1" /><path d="M1.5 6h11M3.5 8.5h2" strokeLinecap="round" /></svg>; }
function SparkIcon()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1.5v3M7 9.5v3M1.5 7h3M9.5 7h3M3 3l1.5 1.5M9.5 9.5L11 11M11 3L9.5 4.5M4.5 9.5L3 11" strokeLinecap="round"/></svg>; }
function ClockIcon()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3l2 1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function EuroIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.5 3.5a4.5 4.5 0 100 7M2.5 5.5h5M2.5 8.5h5" strokeLinecap="round"/></svg>; }
function DokuIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M3 1.5h6l3 3v8a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5V2a.5.5 0 01.5-.5z"/><path d="M9 1.5v3h3M5 7h4M5 9.5h4"/></svg>; }
function WardIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12V5l5-3 5 3v7"/><rect x="5" y="7" width="4" height="5"/><path d="M7 4.5v1.5"/></svg>; }
