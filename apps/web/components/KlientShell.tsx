import Link from "next/link";
import { Wordmark } from "./Logo";
import { UndoBanner } from "./UndoBanner";
import { BottomNav } from "./BottomNav";
import { LocaleSwitcher } from "./LocaleSwitcher";
// PersonaSwitcher + KlientAvatar entfernt — User-Anzeige läuft zentral
// über das UserMenu (top-right), nicht mehr im KlientShell-Header.
import { getLocale } from "@/lib/i18n/server";
import { CmdK } from "./CmdK";
import { WerkzeugMenu } from "./WerkzeugMenu";

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
            {/* User-Anzeige (Avatar + Name + Verwandtschaft) wandert ins UserMenu (top-right). */}
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
      <WerkzeugMenu
        beruf="klient"
        rolePrimaer={KLIENT_PRIMAER}
        roleLabel={KLIENT_LABEL}
        identityId={user.klientId}
        rolle="klient"
      />
      <CmdK />
    </div>
  );
}
