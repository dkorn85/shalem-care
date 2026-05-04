import Link from "next/link";
import { Wordmark } from "./Logo";
import { UndoBanner } from "./UndoBanner";
import { BottomNav } from "./BottomNav";

export type KlientUser = {
  name: string;
  initials: string;
  relation: "self" | "angehörige" | "betreuer";
  klientName?: string;
};

export function KlientShell({
  user,
  children,
}: {
  user: KlientUser;
  children: React.ReactNode;
}) {
  const subtitle =
    user.relation === "self" ? "Klient:in"
    : user.relation === "angehörige" ? `für ${user.klientName ?? "Angehörige"}`
    : `Betreuer:in für ${user.klientName ?? ""}`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-app-soft bg-[rgb(var(--bg-elev))]">
        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/willkommen" className="block">
              <Wordmark rainbow />
            </Link>
            <span className="text-[12px] text-soft font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[rgb(var(--bg-mute))]">
              Klient-Sicht
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-medium">{user.name}</div>
              <div className="text-[11px] text-soft">{subtitle}</div>
            </div>
            <div
              className="w-9 h-9 rounded-full grid place-items-center text-[12px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, rgb(var(--sun)), rgb(var(--fri)))" }}
            >
              {user.initials}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-24 lg:pb-10">
          <div className="rainbow-bar h-1 rounded-full mb-6 sm:mb-8 opacity-60" />
          {children}
        </div>
      </main>

      <UndoBanner />
      <BottomNav role="klient" />
    </div>
  );
}
