import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NURSE_NAV: NavItem[] = [
  { href: "/pflege", label: "Heute", icon: <HomeIcon /> },
  { href: "/dienst", label: "Station", icon: <WardIcon /> },
  { href: "/tausch", label: "Markt", icon: <MarketIcon /> },
  { href: "/profil", label: "Profil", icon: <UserIcon /> },
];

const LEAD_NAV: NavItem[] = [
  { href: "/admin", label: "Übersicht", icon: <HomeIcon /> },
  { href: "/admin/disposition", label: "Disposition", icon: <SparkIcon /> },
  { href: "/admin/genehmigungen", label: "Approvals", icon: <CheckIcon /> },
  { href: "/admin/erloes", label: "Erlös", icon: <EuroIcon /> },
  { href: "/system", label: "System", icon: <GridIcon /> },
];

const KLIENT_NAV: NavItem[] = [
  { href: "/klient", label: "Heute", icon: <HomeIcon /> },
  { href: "/klient/akte", label: "Akte", icon: <UserIcon /> },
  { href: "/klient/buchen", label: "Buchen", icon: <PlusIcon /> },
  { href: "/klient/bewertung", label: "Bewerten", icon: <StarIcon /> },
];

const DOCTOR_NAV: NavItem[] = [
  { href: "/arzt", label: "Praxis", icon: <HomeIcon /> },
  { href: "/arzt/anfragen", label: "Anfragen", icon: <CheckIcon /> },
  { href: "/arzt/patienten", label: "Pat.", icon: <UserIcon /> },
];

export function BottomNav({ role }: { role: "nurse" | "lead" | "klient" | "doctor" }) {
  const items =
    role === "lead"   ? LEAD_NAV   :
    role === "klient" ? KLIENT_NAV :
    role === "doctor" ? DOCTOR_NAV :
                        NURSE_NAV;

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[rgb(var(--bg-elev)/0.92)] border-t border-app-soft bottom-nav-safe"
      style={{ backdropFilter: "saturate(180%) blur(12px)", WebkitBackdropFilter: "saturate(180%) blur(12px)" }}
    >
      <ul className="flex items-stretch justify-around max-w-screen-app mx-auto">
        {items.map((item) => (
          <li key={item.href} className="flex-1">
            <Link
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 text-[10px] text-mute hover:text-[rgb(var(--fg))] transition-colors group"
            >
              <span className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function HomeIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>; }
function WardIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8l9-5 9 5v13"/><rect x="9" y="13" width="6" height="8"/><path d="M12 7v3"/></svg>; }
function MarketIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M2 4h3l3 12h11l2-8H6"/></svg>; }
function UserIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-7 8-7s6.5 2.5 8 7"/></svg>; }
function SparkIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/></svg>; }
function CheckIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>; }
function EuroIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M18 5.5a8 8 0 100 13M3 9.5h9M3 13.5h9"/></svg>; }
function GridIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>; }
function PlusIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>; }
function StarIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M12 2l3 6.3 7 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8L2 9.3l7-1z"/></svg>; }
