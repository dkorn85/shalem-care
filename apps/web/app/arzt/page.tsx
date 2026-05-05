import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce } from "@/lib/seed";
import { listAnfragen, seedAnfragenOnce } from "@/lib/verordnung/store";
import { STATUS_LABEL, KATEGORIE_LABEL, KATEGORIE_FARBE, STATUS_FARBE, DRINGLICHKEIT_LABEL } from "@/lib/verordnung/types";
import { PraxisCockpit } from "@/components/PraxisCockpit";
import { CrossProfessionInbox } from "@/components/CrossProfessionInbox";
import { listInbox, inboxKpi, seedInboxOnce } from "@/lib/inbox/store";
import { seedAktivitaetOnce } from "@/lib/aktivitaet/feed";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const metadata = {
  title: "Arzt-Praxis",
  description: "Verordnungs-Anfragen aus Pflege und Klient:innen, mit eRezept-Pipeline.",
  openGraph: {
    title: "Praxis · Shalem Care",
    description: "Verordnungen in 3 Klicks — eRezept-Code automatisch.",
    images: [{ url: "/og/arzt.png", width: 1200, height: 630, alt: "Shalem Care · Arzt-Praxis" }],
  },
};

const CURRENT_DOCTOR_ID = "person-arzt-001";

export default async function ArztPraxisPage() {
  seedOnce();
  seedAnfragenOnce();
  seedAktivitaetOnce();
  seedInboxOnce();

  const arzt = (await store.getPerson(CURRENT_DOCTOR_ID))!;
  const inboxItems = listInbox("arzt");
  const inboxStats = inboxKpi("arzt");
  const offene = listAnfragen({ arztId: CURRENT_DOCTOR_ID, status: ["offen", "in_pruefung", "rueckfrage"] });
  const ausgestellt = listAnfragen({ arztId: CURRENT_DOCTOR_ID, status: ["ausgestellt"] }).slice(0, 5);
  const akute = offene.filter((a) => a.dringlichkeit === "akut").length;
  const dringliche = offene.filter((a) => a.dringlichkeit === "dringlich").length;

  return (
    <AppShell
      role="doctor"
      user={{ id: arzt.id, name: arzt.name, subtitle: arzt.fachrichtung ?? "Arzt", initials: arzt.initials }}
      station={arzt.arztPraxis ?? "Praxis"}
    >
      <header className="mb-6 anim-slideUp">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">{arzt.fachrichtung}</p>
        <h1 className="font-display text-[32px] font-bold tracking-tight2">
          Guten Tag, <span className="rainbow-text">{arzt.name.split(" ").pop()}</span>.
        </h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Verordnungs-Anfragen aus Pflege und Klient:innen — hier zentral, nach Dringlichkeit sortiert.
          eRezept-Code wird direkt mit Ausstellung erzeugt; in Phase 2 läuft das über die TI / gematik.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Tile label="Offene Anfragen"  value={offene.length} color="var(--fri)" />
        <Tile label="Akut"             value={akute}         color="var(--mon)" alarm={akute > 0} />
        <Tile label="Dringlich"        value={dringliche}    color="var(--vibe-profile)" />
        <Tile label="Heute ausgestellt" value={ausgestellt.filter((a) => a.geschlossenAm?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length} color="var(--thu)" />
      </section>

      <CrossProfessionInbox beruf="arzt" items={inboxItems} kpi={inboxStats} zugewiesenAn={arzt.name} />

      <PraxisCockpit
        scheineQuartal={142}
        abrechnungEur={28430}
        scheineFehlend={6}
        patientenHeute={11}
        arztName={arzt.name}
        termineHeute={[
          { zeit: "08:30", patient: "Helga Reinhardt",   anliegen: "Folgerezept Donepezil" },
          { zeit: "09:00", patient: "Friedrich Liebenau",anliegen: "Wundkontrolle", videoCall: true },
          { zeit: "09:30", patient: "Frieder Vogel",     anliegen: "Routine BD-Kontrolle" },
          { zeit: "10:00", patient: "Anneliese Krause",  anliegen: "Husten + Fieber, Tele-AU", videoCall: true },
          { zeit: "10:30", patient: "Wilhelm Brand",     anliegen: "HKP-Folgeverordnung" },
          { zeit: "11:00", patient: "Ines Becker",       anliegen: "Diabetes-Schulung" },
        ]}
      />

      <section className="mb-8">
        <div className="flex items-baseline justify-between mb-3 gap-2 flex-wrap">
          <h2 className="font-display text-[18px] font-semibold tracking-tight2">Eingehende Anfragen</h2>
          <Link href="/arzt/anfragen" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">
            Alle anzeigen →
          </Link>
        </div>
        {offene.length === 0 ? (
          <p className="text-[13px] text-mute">Keine offenen Anfragen — gönn dir einen Tee. ☕</p>
        ) : (
          <ul className="space-y-2.5">
            {offene.map((a, idx) => (
              <li key={a.id}>
                <Link
                  href={`/arzt/anfragen/${a.id}`}
                  className="surface-hover rounded-2xl p-4 block anim-float relative overflow-hidden"
                  style={{ animationDelay: `${idx * 0.04}s` }}
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
                        Klient {a.klientId} · von {a.anfragendeName} ({a.anfragendeRolle}) · {format(new Date(a.erstelltAm), "d. MMM HH:mm", { locale: de })}
                      </p>
                    </div>
                    <span className="text-mute shrink-0">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {ausgestellt.length > 0 && (
        <section>
          <h2 className="font-display text-[18px] font-semibold tracking-tight2 mb-3">Zuletzt ausgestellt</h2>
          <ul className="space-y-2 text-[12px]">
            {ausgestellt.map((a) => (
              <li key={a.id} className="surface rounded-xl p-3 flex items-baseline justify-between gap-3 flex-wrap">
                <span>
                  <span className="font-medium">{KATEGORIE_LABEL[a.kategorie]}</span> · {a.klientId}
                </span>
                <span className="font-mono text-soft">
                  {a.eRezeptCode ?? "—"} · {a.geschlossenAm && format(new Date(a.geschlossenAm), "d.M. HH:mm", { locale: de })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}

function Tile({ label, value, color, alarm }: { label: string; value: number; color: string; alarm?: boolean }) {
  return (
    <div className="stat-tile" style={{ ["--tile-color" as string]: color }}>
      <div className="text-[11px] text-soft font-medium tracking-wide uppercase">{label}</div>
      <div className="mt-1 font-display font-semibold tracking-tight2 text-[24px] leading-none" style={{ color: alarm ? `rgb(var(--mon))` : `rgb(${color})` }}>
        {value}
      </div>
    </div>
  );
}
