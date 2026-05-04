import Link from "next/link";
import { Wordmark } from "./Logo";
import { UndoBanner } from "./UndoBanner";

export type Crumb = { href: string; label: string };

export function SystemShell({
  crumbs,
  children,
}: {
  crumbs: Crumb[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-app-soft bg-[rgb(var(--bg-elev))]">
        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/system" className="block">
              <Wordmark rainbow />
            </Link>
            <span className="text-[12px] text-soft font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[rgb(var(--bg-mute))]">
              System-Terminal
            </span>
          </div>
          <Link href="/admin" className="btn btn-ghost text-[13px]">← Träger-Sicht</Link>
        </div>

        <div className="max-w-screen-app mx-auto px-4 sm:px-8 pb-3">
          <nav aria-label="Hierarchie-Pfad" className="flex items-center gap-1.5 text-[12px] flex-wrap">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <span key={c.href} className="flex items-center gap-1.5">
                  {isLast ? (
                    <span className="text-[rgb(var(--fg))] font-medium">{c.label}</span>
                  ) : (
                    <Link href={c.href} className="text-mute hover:text-[rgb(var(--fg))] transition-colors">{c.label}</Link>
                  )}
                  {!isLast && <span className="text-soft">/</span>}
                </span>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-10">
          <div className="rainbow-bar h-1 rounded-full mb-6 sm:mb-8 opacity-60" />
          {children}
        </div>
      </main>

      <UndoBanner />
    </div>
  );
}
