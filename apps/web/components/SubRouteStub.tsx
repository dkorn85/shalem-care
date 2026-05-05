// Wiederverwendbarer Stub-Wrapper für Sub-Routen die noch in Bau sind.
// Konsistente Optik mit AppShell + back-Link + Phase-2-Hinweis.

import Link from "next/link";
import Image from "next/image";
import { existsSync } from "fs";
import path from "path";
import { AppShell } from "./AppShell";

type Role = Parameters<typeof AppShell>[0]["role"];

export function SubRouteStub({
  role,
  user,
  station,
  parentPfad,
  parentLabel,
  eyebrow,
  titel,
  subline,
  headerImage,
  bausteine,
}: {
  role: Role;
  user: { id: string; name: string; subtitle: string; initials: string };
  station: string;
  parentPfad: string;
  parentLabel: string;
  eyebrow: string;
  titel: string;
  subline: string;
  headerImage?: string;
  bausteine: { label: string; beschreibung: string; farbe?: string }[];
}) {
  // Bild-Existenz-Check
  let imgVorhanden = false;
  if (headerImage) {
    try {
      const abs = path.join(process.cwd(), "public", headerImage);
      imgVorhanden = existsSync(abs);
    } catch {
      imgVorhanden = false;
    }
  }

  return (
    <AppShell role={role} user={user} station={station}>
      <Link href={parentPfad} className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← {parentLabel}</Link>
      <header className="mb-6">
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">{eyebrow}</p>
            <h1 className="font-display text-[32px] sm:text-[40px] font-bold tracking-tight3 leading-[1.05]">{titel}</h1>
            <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">{subline}</p>
          </div>
          {imgVorhanden && headerImage && (
            <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden surface">
              <Image src={headerImage} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
            </div>
          )}
        </div>
      </header>

      <section className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Funktions-Bausteine · Phase 2</p>
        <ul className="grid sm:grid-cols-2 gap-2">
          {bausteine.map((b, i) => (
            <li key={i} className="surface rounded-xl p-3 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${b.farbe ?? "var(--accent)"})` }} />
              <div className="ml-2.5">
                <p className="font-medium text-[13px]">{b.label}</p>
                <p className="text-[12px] text-mute mt-0.5 leading-snug">{b.beschreibung}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Stand</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Diese Sub-Route ist gerade ein Platzhalter — die Funktions-Bausteine oben zeigen,
          was hier in Phase 2 lebt. Das Cockpit darüber ist bereits voll. Sub-Routen kommen
          getaktet, sobald wir Pilotkunden-Feedback haben — wir wollen nicht ins Blaue bauen.
        </p>
      </section>
    </AppShell>
  );
}
