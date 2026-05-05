import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const EINTRAEGE = [
  {
    id: "p-1",
    klient: "Helga Reinhardt",
    datum: "06.05.2026",
    von: "15:00",
    bis: "16:30",
    fahrt_km: 8,
    stimmung: "fröhlich",
    aktivitaet: "Tee-Nachmittag · Erinnerungs-Gespräch",
    notiz: "Hat von ihrer Hochzeit erzählt — viele Details aus dem Sommer 1972. Hat zum ersten Mal selbst Tee aufgebrüht (war seit dem Sturz im April nicht mehr der Fall).",
    aufruf_koord: false,
  },
  {
    id: "p-2",
    klient: "Walter Brand",
    datum: "04.05.2026",
    von: "11:00",
    bis: "12:00",
    fahrt_km: 12,
    stimmung: "ruhig",
    aktivitaet: "Spaziergang Tiergarten",
    notiz: "Kürzerer Spaziergang als geplant, Knie hat ab Minute 30 geschmerzt. Auf Bank gesetzt, von Schiff erzählt das er 1968 in Hamburg mitgebaut hat. Wirkt im Allgemeinen ruhig aber zunehmend müde.",
    aufruf_koord: true,
    koord_notiz: "An Hospiz-Koordinator: Schmerz-Episode bei Belastung verstärkt. Bitte Pflege-Team informieren.",
  },
  {
    id: "p-3",
    klient: "Erika Gärtner",
    datum: "01.05.2026",
    von: "16:00",
    bis: "16:45",
    fahrt_km: 8,
    stimmung: "verwirrt-zugewandt",
    aktivitaet: "Vorlesen 'Pippi Langstrumpf'",
    notiz: 'Hat heute nicht mehr ihren Sohn gemeint, sondern ihren Vater (verstorben 1989). Habe mitgesponnen, war kein Stress für sie. Beim Vorlesen hat sie wie immer aufmerksam gelauscht und am Ende „Danke" gesagt.',
    aufruf_koord: false,
  },
];

export const metadata = { title: "Ehrenamt · Protokoll" };

export default async function ProtokollPage() {
  const totalStunden = EINTRAEGE.reduce((s, e) => {
    const [h1, m1] = e.von.split(":").map(Number);
    const [h2, m2] = e.bis.split(":").map(Number);
    return s + ((h2 - h1) + (m2 - m1) / 60);
  }, 0);
  const totalKm = EINTRAEGE.reduce((s, e) => s + e.fahrt_km, 0);
  return (
    <AppShell role="ehrenamt" user={{ id: "person-ehrenamt-001", name: "Rita Schöndorf", subtitle: "Ehrenamtliche Begleitung", initials: "RS" }} station="Hospiz-Verein Berlin">
      <header className="mb-6">
        <Link href="/ehrenamt" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Begleit-Protokoll</h1>
        <p className="text-[13px] text-mute mt-2">
          {EINTRAEGE.length} Einträge · {totalStunden.toFixed(1)} h Begleitzeit · {totalKm} km Fahrt
        </p>
      </header>

      <ul className="space-y-3 mb-6">
        {EINTRAEGE.map((e) => (
          <article key={e.id} className="surface rounded-2xl p-5">
            <header className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
              <div>
                <h2 className="font-display text-[16px] font-semibold tracking-tight2">{e.klient}</h2>
                <p className="text-[11px] font-mono text-soft mt-0.5">{e.datum} · {e.von}–{e.bis} · {e.fahrt_km} km</p>
              </div>
              <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                Stimmung: {e.stimmung}
              </span>
            </header>
            <p className="text-[13px] text-mute italic mb-2">{e.aktivitaet}</p>
            <p className="text-[14px] leading-relaxed">{e.notiz}</p>

            {e.aufruf_koord && (
              <div className="mt-3 rounded-lg p-3" style={{ background: "rgb(var(--mon) / 0.06)" }}>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: "rgb(var(--mon))" }}>
                  An Koordination weitergegeben
                </p>
                <p className="text-[12px]">{e.koord_notiz}</p>
              </div>
            )}
          </article>
        ))}
      </ul>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Aufwand-Zusammenfassung</p>
        <ul className="space-y-1 text-[13px]">
          <li className="flex justify-between gap-3"><span className="text-mute">Begleitzeit gesamt</span><span className="font-mono">{totalStunden.toFixed(1)} h × 8 €</span></li>
          <li className="flex justify-between gap-3"><span className="text-mute">Fahrt</span><span className="font-mono">{totalKm} km × 0,30 €</span></li>
          <li className="flex justify-between gap-3 border-t border-app-soft pt-2 font-semibold"><span>Summe</span><span className="font-mono">{(totalStunden * 8 + totalKm * 0.3).toFixed(2)} €</span></li>
        </ul>
        <p className="text-[10px] text-soft mt-3 italic">
          Steuerfrei nach § 3 Nr. 26a EStG (Ehrenamtspauschale 840 €/Jahr) · Auszahlung am Monatsende.
        </p>
      </section>
    </AppShell>
  );
}
