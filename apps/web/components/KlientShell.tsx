import Link from "next/link";
import { Wordmark } from "./Logo";
import { UndoBanner } from "./UndoBanner";
import { BottomNav } from "./BottomNav";
import { LocaleSwitcher } from "./LocaleSwitcher";
// PersonaSwitcher entfernt — HauptMenu (UserMenu) deckt Rollenwechsel ab
import { KlientAvatar } from "./Avatar";
import { getLocale } from "@/lib/i18n/server";
import { Brillenmodus } from "./Brillenmodus";
import { GameModeToggle } from "./GameModeToggle";
import { SoundToggle } from "./SoundToggle";
import { NotifyToggle } from "./notify/NotifyToggle";

const KLIENT_PRIMAER = "var(--wed)";
const KLIENT_LABEL = "Klient:in";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export type KlientUser = {
  name: string;
  initials: string;
  relation: "self" | "angehörige" | "betreuer";
  klientName?: string;
  klientId?: string;
};

export async function KlientShell({
  user,
  children,
}: {
  user: KlientUser;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const subtitle =
    user.relation === "self" ? "Klient:in"
    : user.relation === "angehörige" ? `für ${user.klientName ?? "Angehörige"}`
    : `Betreuer:in für ${user.klientName ?? ""}`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-app-soft bg-[rgb(var(--bg-elev))]">
        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/" className="block">
              <Wordmark rainbow />
            </Link>
            <span className="text-[12px] text-soft font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[rgb(var(--bg-mute))]">
              Klient-Sicht
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <LocaleSwitcher current={locale} />
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-medium">{user.name}</div>
              <div className="text-[11px] text-soft">{subtitle}</div>
            </div>
            <KlientAvatar id={user.klientId ?? "—"} initials={user.initials} size={40} />

          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-6 sm:py-10">
          <div className="rainbow-bar h-1 rounded-full mb-6 sm:mb-8 opacity-60" />
          {children}
        </div>
      </main>

      <UndoBanner />
      <BottomNav role="klient" rolePrimaer={KLIENT_PRIMAER} />
      <Brillenmodus beruf="klient" rolePrimaer={KLIENT_PRIMAER} roleLabel={KLIENT_LABEL} />
      <GameModeToggle />
      <SoundToggle />
      <NotifyToggle />
    </div>
  );
}
