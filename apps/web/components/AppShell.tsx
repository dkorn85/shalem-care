import Link from "next/link";
import { Wordmark, Logo } from "./Logo";
import { UndoBanner } from "./UndoBanner";
import { BottomNav } from "./BottomNav";
import { LocaleSwitcher } from "./LocaleSwitcher";
// PersonaSwitcher + PersonAvatar entfernt — User-Anzeige läuft zentral
// über das UserMenu (top-right), nicht mehr in der Sidebar.
import { getLocale } from "@/lib/i18n/server";
import { MobileNavDrawer, type DrawerItem } from "./MobileNavDrawer";
import { Brillenmodus } from "./Brillenmodus";
import { GameModeToggle } from "./GameModeToggle";
import { SoundToggle } from "./SoundToggle";
import { NotifyToggle } from "./notify/NotifyToggle";
import { ExpertiseChip } from "./ExpertiseChip";
import type { ExpertiseRolle } from "@/lib/ui/expertise";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

type Role = "nurse" | "lead" | "doctor" | "therapie" | "sozial" | "erziehung" | "ehrenamt" | "hauswirtschaft" | "heilerziehung" | "apotheke" | "medizintechnik" | "rettungsdienst" | "bestatter" | "begleitung";

// Beruf-Akzent-Farbe pro Role · für Sidebar-Border, Mobile-Header,
// Drawer-Trigger, Brillenmodus-Floater. Wert ist der "Inhalt" der CSS-var
// ohne `var()`, also direkt einsetzbar als `rgb(${ROLE_PRIMAER[role]} / 0.X)`.
const ROLE_PRIMAER: Record<Role, string> = {
  nurse: "var(--mon)",
  doctor: "var(--vibe-profile)",
  therapie: "var(--fri)",
  sozial: "var(--tue)",
  erziehung: "var(--wed)",
  ehrenamt: "var(--thu)",
  hauswirtschaft: "var(--sun)",
  heilerziehung: "var(--sat)",
  lead: "var(--vibe-team)",
  apotheke: "var(--vibe-team)",
  medizintechnik: "var(--vibe-stats)",
  rettungsdienst: "var(--mon)",
  bestatter: "var(--vibe-profile)",
  begleitung: "var(--wed)",
};

const ROLE_LABEL: Record<Role, string> = {
  nurse: "Pflege",
  doctor: "Arzt",
  therapie: "Therapie",
  sozial: "Sozial",
  erziehung: "Erziehung",
  ehrenamt: "Ehrenamt",
  hauswirtschaft: "Hauswirtschaft",
  heilerziehung: "Heilerziehung",
  lead: "Stationsleitung",
  apotheke: "Apotheke",
  medizintechnik: "Medizintechnik",
  rettungsdienst: "Rettungsdienst",
  bestatter: "Bestatter",
  begleitung: "Begleitung",
};

// Mapping AppShell-Role → Expertise-Rolle. null wenn kein Expertise-Modus existiert.
const ROLE_EXPERTISE: Record<Role, ExpertiseRolle | null> = {
  nurse: "pflege",
  doctor: "arzt",
  therapie: "therapie",
  sozial: "sozial",
  erziehung: "erziehung",
  ehrenamt: "ehrenamt",
  hauswirtschaft: "hauswirtschaft",
  heilerziehung: "heilerziehung",
  lead: "lead",
  apotheke: null,
  medizintechnik: null,
  rettungsdienst: null,
  bestatter: null,
  begleitung: null,
};

// Quell-Beruf für KI-Klartext (vom Brillenmodus an /api/ai/klartext)
const ROLE_KLARTEXT: Record<Role, string> = {
  nurse: "pflege",
  doctor: "arzt",
  therapie: "therapie",
  sozial: "sozialarbeit",
  erziehung: "erziehung",
  ehrenamt: "ehrenamt",
  hauswirtschaft: "hauswirtschaft",
  heilerziehung: "heilerziehung",
  lead: "lead",
  apotheke: "apotheke",
  medizintechnik: "medizintechnik",
  rettungsdienst: "rettungsdienst",
  bestatter: "bestatter",
  begleitung: "begleitung",
};

const NURSE_NAV = [
  { href: "/pflege/heute",    label: "Heute",          vibe: "var(--accent)",        icon: SparkIcon },
  { href: "/pflege",          label: "Dienstplan",    vibe: "var(--vibe-plan)",     icon: PlanIcon },
  { href: "/pflege/tour",     label: "Tour-KI",        vibe: "var(--fri)",           icon: SparkIcon },
  { href: "/pflege/wunde",    label: "Wundmanagement", vibe: "var(--vibe-profile)",  icon: SparkIcon },
  { href: "/dienst",          label: "Stationsansicht",vibe: "var(--vibe-team)",    icon: WardIcon },
  { href: "/tausch",          label: "Tausch-Markt",  vibe: "var(--vibe-market)",   icon: SwapIcon },
  { href: "/pflege/selbst",   label: "Selbstpflege",   vibe: "var(--mon)",           icon: SparkIcon },
  { href: "/fortbildung",     label: "Fortbildung",   vibe: "var(--fri)",           icon: BookIcon },
  { href: "/profil",          label: "Mein Profil",   vibe: "var(--vibe-profile)",  icon: ProfileIcon },
];

const DOCTOR_NAV = [
  { href: "/arzt/heute",        label: "Heute",          vibe: "var(--accent)",        icon: SparkIcon },
  { href: "/arzt",              label: "Praxis",        vibe: "var(--vibe-team)",     icon: WardIcon },
  { href: "/arzt/diktat",       label: "Verordnung-Diktat", vibe: "var(--vibe-profile)", icon: SparkIcon },
  { href: "/arzt/erezepte",     label: "eRezept-Pilot", vibe: "var(--accent)",        icon: SparkIcon },
  { href: "/arzt/dienstplan",   label: "Dienstplan",    vibe: "var(--vibe-plan)",     icon: PlanIcon },
  { href: "/arzt/anfragen",     label: "Anfragen",      vibe: "var(--vibe-approval)", icon: CheckIcon },
  { href: "/arzt/patienten",    label: "Patient:innen", vibe: "var(--vibe-profile)",  icon: TeamIcon },
];

const THERAPIE_NAV = [
  { href: "/therapie/heute",      label: "Heute",          vibe: "var(--accent)",        icon: SparkIcon },
  { href: "/therapie",            label: "Praxis",        vibe: "var(--fri)",           icon: WardIcon },
  { href: "/therapie/diktat",     label: "Termin-Diktat",  vibe: "var(--fri)",           icon: SparkIcon },
  { href: "/therapie/dienstplan", label: "Dienstplan",     vibe: "var(--vibe-plan)",     icon: PlanIcon },
  { href: "/therapie/patienten",  label: "Patient:innen", vibe: "var(--vibe-profile)",  icon: TeamIcon },
  { href: "/therapie/abrechnung", label: "Abrechnung",    vibe: "var(--vibe-stats)",    icon: EuroIcon },
  { href: "/fortbildung",         label: "Fortbildung",   vibe: "var(--fri)",           icon: BookIcon },
];

const SOZIAL_NAV = [
  { href: "/sozial",            label: "Übersicht",      vibe: "var(--tue)",           icon: GridIcon },
  { href: "/sozial/diktat",     label: "Hilfeplan-Diktat", vibe: "var(--tue)",         icon: SparkIcon },
  { href: "/sozial/dienstplan", label: "Dienstplan",     vibe: "var(--vibe-plan)",     icon: PlanIcon },
  { href: "/sozial/faelle",     label: "Fälle",           vibe: "var(--vibe-team)",     icon: TeamIcon },
  { href: "/sozial/hilfeplan",  label: "Hilfeplan",       vibe: "var(--vibe-approval)", icon: CheckIcon },
  { href: "/sozial/schutz",      label: "Schutzauftrag",   vibe: "var(--mon)",           icon: SparkIcon },
  { href: "/fortbildung",       label: "Fortbildung",    vibe: "var(--fri)",           icon: BookIcon },
];

const ERZIEHUNG_NAV = [
  { href: "/erziehung",                label: "Übersicht",      vibe: "var(--wed)",          icon: GridIcon },
  { href: "/erziehung/diktat",         label: "Lerngeschichte-Diktat", vibe: "var(--wed)",   icon: SparkIcon },
  { href: "/erziehung/gruppen",        label: "Gruppen",         vibe: "var(--vibe-team)",    icon: TeamIcon },
  { href: "/erziehung/lerngeschichten",label: "Lerngeschichten", vibe: "var(--vibe-profile)", icon: DokuIcon },
  { href: "/fortbildung",              label: "Fortbildung",    vibe: "var(--fri)",          icon: BookIcon },
];

const EHRENAMT_NAV = [
  { href: "/ehrenamt",            label: "Heute",         vibe: "var(--thu)",          icon: PlanIcon },
  { href: "/ehrenamt/diktat",     label: "Begleit-Diktat", vibe: "var(--thu)",          icon: SparkIcon },
  { href: "/ehrenamt/dienstplan", label: "Dienstplan",    vibe: "var(--vibe-plan)",    icon: PlanIcon },
  { href: "/ehrenamt/begleitung", label: "Begleitung",    vibe: "var(--vibe-team)",     icon: TeamIcon },
  { href: "/ehrenamt/protokoll",  label: "Protokoll",     vibe: "var(--vibe-profile)",  icon: DokuIcon },
];

const HAUSWIRT_NAV = [
  { href: "/hauswirtschaft",            label: "Übersicht",    vibe: "var(--sun)",          icon: GridIcon },
  { href: "/hauswirtschaft/diktat",     label: "Doku-Diktat",  vibe: "var(--sun)",          icon: SparkIcon },
  { href: "/hauswirtschaft/dienstplan", label: "Dienstplan",   vibe: "var(--vibe-plan)",    icon: PlanIcon },
  { href: "/fortbildung",               label: "Fortbildung",  vibe: "var(--fri)",          icon: BookIcon },
];

const HEILERZ_NAV = [
  { href: "/heilerziehung",            label: "Übersicht",    vibe: "var(--sat)",          icon: GridIcon },
  { href: "/heilerziehung/diktat",     label: "Teilhabe-Diktat", vibe: "var(--sat)",       icon: SparkIcon },
  { href: "/heilerziehung/dienstplan", label: "Dienstplan",   vibe: "var(--vibe-plan)",    icon: PlanIcon },
  { href: "/fortbildung",              label: "Fortbildung",  vibe: "var(--fri)",          icon: BookIcon },
];

const LEAD_NAV = [
  { href: "/admin",                label: "Übersicht",      vibe: "var(--vibe-plan)",     icon: GridIcon },
  { href: "/admin/dienstplan/hud", label: "KI-HUD",          vibe: "var(--accent)",        icon: SparkIcon },
  { href: "/admin/dienstplan/archiv",label: "Archiv 3-Zonen", vibe: "var(--vibe-stats)",    icon: ClockIcon },
  { href: "/admin/dienstplan",     label: "Dienstplan",     vibe: "var(--vibe-team)",     icon: PlanIcon },
  { href: "/trading",              label: "Trading-Hub",     vibe: "var(--accent)",        icon: SparkIcon },
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
  expertiseRolleOverride,
}: {
  role: Role;
  user: { id?: string; name: string; subtitle: string; initials: string };
  station: string;
  children: React.ReactNode;
  // Wenn gesetzt, überschreibt diese Rolle das ROLE_EXPERTISE-Mapping —
  // z.B. damit Genossenschafts-Pages mit role="lead" trotzdem den
  // genossenschaft-Toggle zeigen.
  expertiseRolleOverride?: ExpertiseRolle;
}) {
  const locale = await getLocale();
  const nav =
    role === "lead"           ? LEAD_NAV       :
    role === "doctor"         ? DOCTOR_NAV     :
    role === "therapie"       ? THERAPIE_NAV   :
    role === "sozial"         ? SOZIAL_NAV     :
    role === "erziehung"      ? ERZIEHUNG_NAV  :
    role === "ehrenamt"       ? EHRENAMT_NAV   :
    role === "hauswirtschaft" ? HAUSWIRT_NAV   :
    role === "heilerziehung"  ? HEILERZ_NAV    :
                                NURSE_NAV;
  const switchRole = role === "lead"
    ? { href: "/pflege", label: "→ Pflegekraft-Sicht" }
    : role === "doctor"
      ? { href: "/pflege", label: "→ Pflegekraft-Sicht" }
      : role === "nurse"
        ? { href: "/admin", label: "→ Träger-Admin" }
        : { href: "/", label: "→ Startseite" };

  const rolePrimaer = ROLE_PRIMAER[role];
  const roleLabel = ROLE_LABEL[role];
  const drawerItems: DrawerItem[] = nav.map((item) => {
    const Icon = item.icon;
    return {
      href: item.href,
      label: item.label,
      vibe: item.vibe,
      iconNode: <Icon />,
    };
  });

  return (
    <div className="min-h-screen flex" style={{ background: `linear-gradient(180deg, rgb(${rolePrimaer} / 0.025), transparent 240px)` }}>
      <aside
        className="hidden md:flex w-[240px] shrink-0 flex-col bg-[rgb(var(--bg-elev))]"
        style={{ borderRight: `2px solid rgb(${rolePrimaer} / 0.35)` }}
      >
        <div
          className="px-5 pt-5 pb-3 relative"
          style={{ background: `linear-gradient(180deg, rgb(${rolePrimaer} / 0.10), transparent)` }}
        >
          <Link href="/" className="block">
            <Wordmark />
          </Link>
          <div className="mt-1.5 ml-9 flex items-baseline gap-2 flex-wrap">
            <span
              className="text-[10px] uppercase tracking-wider font-mono font-semibold"
              style={{ color: `rgb(${rolePrimaer})` }}
            >
              {roleLabel}
            </span>
            <span className="text-[12px] text-soft">· {station}</span>
          </div>
          <div className="mt-2 ml-9 flex items-center gap-2 flex-wrap">
            {(expertiseRolleOverride ?? ROLE_EXPERTISE[role]) && (
              <ExpertiseChip rolle={(expertiseRolleOverride ?? ROLE_EXPERTISE[role])!} />
            )}
            <LocaleSwitcher current={locale} />
          </div>
          {/* User-Anzeige + Rollen-Wechsel + Avatar laufen zentral
              ueber das UserMenu im globalen Layout, top-right. */}
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

      </aside>

      <main className="flex-1 min-w-0">
        <header
          className="md:hidden px-3 py-2.5 flex items-center justify-between gap-2 bg-[rgb(var(--bg-elev))] sticky top-0 z-30"
          style={{ borderBottom: `2px solid rgb(${rolePrimaer} / 0.35)` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <MobileNavDrawer
              items={drawerItems}
              station={station}
              user={{ name: user.name, subtitle: user.subtitle }}
              switchRole={switchRole}
              rolePrimaer={rolePrimaer}
              roleLabel={roleLabel}
            />
            <div className="min-w-0">
              <p
                className="text-[9px] uppercase tracking-wider font-mono leading-tight"
                style={{ color: `rgb(${rolePrimaer})` }}
              >
                {roleLabel}
              </p>
              <p className="text-[12px] font-medium leading-tight truncate">{station}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {(expertiseRolleOverride ?? ROLE_EXPERTISE[role]) && <ExpertiseChip rolle={(expertiseRolleOverride ?? ROLE_EXPERTISE[role])!} />}
            <LocaleSwitcher current={locale} />
          </div>
        </header>

        <div
          aria-hidden
          className="hidden md:block h-1"
          style={{ background: `linear-gradient(90deg, rgb(${rolePrimaer}) 0%, rgb(${rolePrimaer} / 0.4) 60%, transparent 100%)` }}
        />

        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-6 sm:py-10">
          {children}
        </div>
      </main>

      <UndoBanner />
      <BottomNav role={mapRoleForBottomNav(role)} rolePrimaer={rolePrimaer} />
      <Brillenmodus beruf={ROLE_KLARTEXT[role]} rolePrimaer={rolePrimaer} roleLabel={roleLabel} />
      <GameModeToggle />
      <SoundToggle />
      <NotifyToggle
        identityId={user.id}
        rolle={ROLE_KLARTEXT[role]}
        stationId={undefined}
      />
    </div>
  );
}

// Neue Berufe (apotheke, medizintechnik, rettungsdienst, bestatter, begleitung)
// teilen sich vorerst die "lead"-Bottom-Nav-Variante, bis sie eigene
// Sub-Routen-Strukturen bekommen.
function mapRoleForBottomNav(r: Role): "nurse" | "lead" | "doctor" | "therapie" | "sozial" | "erziehung" | "ehrenamt" | "hauswirtschaft" | "heilerziehung" {
  if (r === "apotheke" || r === "medizintechnik" || r === "rettungsdienst" || r === "bestatter" || r === "begleitung") {
    return "lead";
  }
  return r;
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
function BookIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2.5h7a1.5 1.5 0 011.5 1.5v8a.5.5 0 01-.5.5H4a1 1 0 01-1-1V2.5zM3 11.5h8.5"/><path d="M6 5h3"/></svg>; }
