import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce } from "@/lib/seed";
import { listAnfragen, seedAnfragenOnce } from "@/lib/verordnung/store";
import { STATUS_LABEL, STATUS_FARBE, KATEGORIE_LABEL, KATEGORIE_FARBE, DRINGLICHKEIT_LABEL } from "@/lib/verordnung/types";
import type { AnfrageStatus } from "@/lib/verordnung/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CURRENT_DOCTOR_ID = "person-arzt-001";

export default async function AnfragenListePage({ searchParams }: { searchParams: Promise<{ status?: AnfrageStatus | "alle" }> }) {
  seedOnce();
  seedAnfragenOnce();

  const arzt = (await store.getPerson(CURRENT_DOCTOR_ID))!;
  const { status: filter } = await searchParams;
  const all = listAnfragen({ arztId: CURRENT_DOCTOR_ID });
  const list = filter && filter !== "alle"
    ? all.filter((a) => a.status === filter)
    : all;

  const counts: Record<AnfrageStatus | "alle", number> = {
    alle: all.length,
    offen: all.filter((a) => a.status === "offen").length,
    in_pruefung: all.filter((a) => a.status === "in_pruefung").length,
    rueckfrage: all.filter((a) => a.status === "rueckfrage").length,
    ausgestellt: all.filter((a) => a.status === "ausgestellt").length,
    abgelehnt: all.filter((a) => a.status === "abgelehnt").length,
  };

  return (
    <AppShell
      role="doctor"
      user={{ name: arzt.name, subtitle: arzt.fachrichtung ?? "Arzt", initials: arzt.initials }}
      station={arzt.arztPraxis ?? "Praxis"}
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Verordnungs-Anfragen</h1>
        <p className="text-[13px] text-mute mt-1.5 max-w-prose">
          Offene Anfragen aus Pflege und Klient:innen. Bearbeitung mit eRezept-Pipeline und automatischer
          Doku in der Klientenakte.
        </p>
      </header>

      <nav className="flex flex-wrap gap-1.5 mb-5">
        {(["alle", "offen", "in_pruefung", "rueckfrage", "ausgestellt", "abgelehnt"] as const).map((f) => (
          <Link
            key={f}
            href={f === "alle" ? "/arzt/anfragen" : `/arzt/anfragen?status=${f}`}
            className="chip text-[12px]"
            style={{
              background: (filter ?? "alle") === f ? "rgb(var(--vibe-team) / 0.18)" : "rgb(var(--bg-mute))",
              color:      (filter ?? "alle") === f ? "rgb(var(--vibe-team))" : "rgb(var(--fg-mute))",
            }}
          >
            {f === "alle" ? "Alle" : STATUS_LABEL[f as AnfrageStatus]} · {counts[f]}
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="text-[13px] text-soft">Keine Anfragen mit diesem Filter.</p>
      ) : (
        <ul className="space-y-2.5">
          {list.map((a, idx) => (
            <li key={a.id}>
              <Link
                href={`/arzt/anfragen/${a.id}`}
                className="surface-hover rounded-2xl p-4 block anim-float relative overflow-hidden"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${KATEGORIE_FARBE[a.kategorie]})` }} />
                <div className="ml-2.5 flex items-baseline justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <span className="text-[14px] font-medium">{KATEGORIE_LABEL[a.kategorie]}</span>
                      <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[a.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[a.status]})` }}>
                        {STATUS_LABEL[a.status]}
                      </span>
                      <span
                        className="chip text-[10px]"
                        style={{
                          background: a.dringlichkeit === "akut" ? "rgb(var(--mon) / 0.18)" : a.dringlichkeit === "dringlich" ? "rgb(var(--fri) / 0.15)" : "rgb(var(--bg-mute))",
                          color:      a.dringlichkeit === "akut" ? "rgb(var(--mon))" : a.dringlichkeit === "dringlich" ? "rgb(var(--fri))" : "rgb(var(--fg-mute))",
                        }}
                      >
                        {DRINGLICHKEIT_LABEL[a.dringlichkeit]}
                      </span>
                    </div>
                    <p className="text-[12px] text-mute line-clamp-2">{a.begruendung}</p>
                    <p className="text-[11px] text-soft mt-1">
                      Klient {a.klientId} · {format(new Date(a.erstelltAm), "d. MMM HH:mm", { locale: de })}
                      {a.eRezeptCode && <span className="font-mono ml-2">· eRx {a.eRezeptCode}</span>}
                    </p>
                  </div>
                  <span className="text-mute shrink-0">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
