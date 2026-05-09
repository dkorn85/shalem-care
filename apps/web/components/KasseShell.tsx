import Link from "next/link";
import { Wordmark, Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
// PersonaSwitcher entfernt — HauptMenu (UserMenu) deckt Rollenwechsel ab
import { getLocale } from "@/lib/i18n/server";
import { Brillenmodus } from "./Brillenmodus";
import { GameModeToggle } from "./GameModeToggle";
import { SoundToggle } from "./SoundToggle";
import { ExpertiseChip } from "./ExpertiseChip";

const KASSE_PRIMAER = "var(--vibe-approval)";
const KASSE_LABEL = "Krankenkasse";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export type KasseUser = {
  name: string;
  ik: string;
  role: "sachbearbeiterin" | "leitung" | "medizinischer_dienst";
};

const ROLE_LABEL: Record<KasseUser["role"], string> = {
  sachbearbeiterin:     "Sachbearbeitung",
  leitung:              "Fachbereichsleitung",
  medizinischer_dienst: "Medizinischer Dienst",
};

export async function KasseShell({
  user,
  kassenName,
  children,
}: {
  user: KasseUser;
  kassenName: string;
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-app-soft bg-[rgb(var(--bg-elev))]">
        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/" className="block"><Wordmark rainbow /></Link>
            <span className="text-[12px] text-soft font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[rgb(var(--bg-mute))]">
              Kostenträger-Portal
            </span>
            <span className="text-[13px] font-medium">{kassenName}</span>
            <span className="text-[11px] text-soft font-mono">IK {user.ik}</span>
          </div>
          <div className="flex items-center gap-3">
            <ExpertiseChip rolle="kasse" />
            <LocaleSwitcher current={locale} />
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-medium">{user.name}</div>
              <div className="text-[11px] text-soft">{ROLE_LABEL[user.role]}</div>
            </div>
            <div
              className="w-10 h-10 rounded-full grid place-items-center text-[12px] font-semibold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, rgb(var(--vibe-stats)), rgb(var(--vibe-team)))" }}
            >
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
          </div>
        </div>
        <nav className="max-w-screen-app mx-auto px-4 sm:px-8 -mt-1 flex items-center gap-1 overflow-x-auto pb-2">
          <Tab href="/kasse">Eingangskorb</Tab>
          <Tab href="/kasse/eau">eAU-Eingang</Tab>
          <Tab href="/kasse/krankengeld">Krankengeld</Tab>
          <Tab href="/kasse/hkp">HKP-Genehmigung</Tab>
          <Tab href="/kasse/abrechnung">Abrechnung / DTA</Tab>
        </nav>
      </header>

      <main className="flex-1">
        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-56 lg:pb-40">
          <div className="rainbow-bar h-1 rounded-full mb-6 sm:mb-8 opacity-60" />
          {children}
        </div>
      </main>

      <footer className="border-t border-app-soft px-4 sm:px-8 py-6 pb-24 lg:pb-10">
        <div className="max-w-screen-app mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Logo size={18} className="accent-text" />
            <span className="text-[12px] text-mute">Shalem Care · Kostenträger-Portal · AGPLv3</span>
          </div>
          <div className="text-[11px] text-soft">
            DTA-Schnittstelle nach SGB XI Anlage 5 / SGB V § 302 (Phase-2)
          </div>
        </div>
      </footer>
      <Brillenmodus beruf="lead" rolePrimaer={KASSE_PRIMAER} roleLabel={KASSE_LABEL} />
      <GameModeToggle />
      <SoundToggle />
    </div>
  );
}

function Tab({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[13px] px-3 py-1.5 rounded-md text-mute hover:text-[rgb(var(--fg))] hover:bg-[rgb(var(--bg-mute))] whitespace-nowrap"
    >
      {children}
    </Link>
  );
}
