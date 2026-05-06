// Cross-Profession-Karte: zeigt für die aktuell sichtbare Klient:in,
// wer noch (außer der eigenen Berufsgruppe) an ihr arbeitet.
//
// Macht das Wichtigste der Genossenschafts-Idee sichtbar: ein Mensch,
// viele Berufe, koordiniert.

import Link from "next/link";
import Image from "next/image";
import { HELGA_UMFELD, BERUFSFELD_LABEL, BERUFSFELD_FARBE } from "@/lib/team-um-klient/store";
import type { Berufsfeld } from "@/lib/team-um-klient/store";

export function AndereBegleiter({
  eigenerBeruf,
  klientName = "Helga Reinhardt",
}: {
  eigenerBeruf: Berufsfeld;
  klientName?: string;
}) {
  const andere = HELGA_UMFELD.begleiter.filter((b) => b.beruf !== eigenerBeruf);
  if (andere.length === 0) return null;

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 mb-6">
      <header className="mb-3">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">CareTeam · Cross-Profession</p>
        <h2 className="font-display text-[16px] font-bold tracking-tight2">
          Wer sonst noch an {klientName} arbeitet
        </h2>
        <p className="text-[12px] text-soft mt-0.5">
          {andere.length} weitere Begleiter:innen aus {new Set(andere.map((b) => b.beruf)).size} Berufsgruppen
        </p>
      </header>

      <ul className="grid sm:grid-cols-2 gap-2">
        {andere.map((b) => (
          <li key={b.personId}>
            <Link
              href={b.zugriffPfad}
              className="surface-hover rounded-xl p-3 flex gap-2.5 items-start relative overflow-hidden block"
            >
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${BERUFSFELD_FARBE[b.beruf]})` }} />
              <div className="ml-2 flex gap-2.5 w-full">
                <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden surface-mute relative grid place-items-center">
                  {b.portrait ? (
                    <Image src={b.portrait} alt="" fill sizes="36px" className="object-cover" />
                  ) : (
                    <span className="font-mono text-[11px] font-semibold" style={{ color: `rgb(${BERUFSFELD_FARBE[b.beruf]})` }}>
                      {b.initials}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-medium text-[12px] truncate">{b.name}</span>
                    <span className="text-[10px]" style={{ color: `rgb(${BERUFSFELD_FARBE[b.beruf]})` }}>
                      {BERUFSFELD_LABEL[b.beruf]}
                    </span>
                  </div>
                  <p className="text-[11px] truncate" style={{ color: "rgb(var(--fg-mute))" }}>{b.rolle}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgb(var(--fg-mute))" }}>{b.rhythmus}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {HELGA_UMFELD.konferenz && (
        <div className="mt-3 rounded-lg p-3" style={{ background: "rgb(var(--accent) / 0.06)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--accent))" }}>
            Nächste Fallkonferenz
          </p>
          <p className="text-[12px] font-medium">{HELGA_UMFELD.konferenz.naechste}</p>
        </div>
      )}
    </section>
  );
}
