import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { KlientShell } from "@/components/KlientShell";
import { seedOnce } from "@/lib/seed";
import { getKlient } from "@/lib/hierarchy/store";
import { HELGA_UMFELD, BERUFSFELD_LABEL, BERUFSFELD_FARBE } from "@/lib/team-um-klient/store";
import type { Berufsfeld } from "@/lib/team-um-klient/store";

const KLIENT_ID = "klient-hr";

export const metadata = {
  title: "Mein Team · Meine Akte",
  description: "Alle Menschen, die mich begleiten — Pflege, Arzt, Therapie, Sozialarbeit, Ehrenamt + Familie.",
};

export default async function BegleiterPage() {
  seedOnce();
  const klient = getKlient(KLIENT_ID);
  if (!klient) notFound();

  // Gruppiert nach Beruf
  const groups = HELGA_UMFELD.begleiter.reduce<Record<Berufsfeld, typeof HELGA_UMFELD.begleiter>>((acc, b) => {
    if (!acc[b.beruf]) acc[b.beruf] = [];
    acc[b.beruf].push(b);
    return acc;
  }, {} as Record<Berufsfeld, typeof HELGA_UMFELD.begleiter>);

  const ordered: Berufsfeld[] = ["angehoerig", "pflege", "arzt", "therapie", "sozialarbeit", "ehrenamt"];

  return (
    <KlientShell user={{ name: klient.name, initials: klient.initials, relation: "self", klientId: klient.id }}>
      <header className="mb-6">
        <Link href="/klient/akte" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Akte</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Mein Team · CareTeam</p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Wer mich <span className="rainbow-text">begleitet</span>.
        </h1>
        <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
          {HELGA_UMFELD.begleiter.length} Menschen arbeiten zusammen, damit es mir gut geht — Pflege, Hausärztin,
          Therapie, Sozialarbeit, ehrenamtliche Begleitung und meine Tochter.
          Jede:r hat einen klaren Auftrag und einen festen Rhythmus.
        </p>
      </header>

      {/* Was steht heute / diese Woche an */}
      <section className="surface rounded-2xl p-5 mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Diese Woche</p>
        <ul className="space-y-2 text-[13px]">
          {HELGA_UMFELD.aktuell.pflegeNaechsterDienst && (
            <li className="flex gap-3 items-baseline"><span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--mon))" }} /><span><strong>Pflege</strong> · {HELGA_UMFELD.aktuell.pflegeNaechsterDienst}</span></li>
          )}
          {HELGA_UMFELD.aktuell.arztNaechsterTermin && (
            <li className="flex gap-3 items-baseline"><span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--vibe-profile))" }} /><span><strong>Arzt</strong> · {HELGA_UMFELD.aktuell.arztNaechsterTermin}</span></li>
          )}
          {HELGA_UMFELD.aktuell.therapieNaechsterTermin && (
            <li className="flex gap-3 items-baseline"><span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--fri))" }} /><span><strong>Therapie</strong> · {HELGA_UMFELD.aktuell.therapieNaechsterTermin}</span></li>
          )}
          {HELGA_UMFELD.aktuell.sozialNaechsterTermin && (
            <li className="flex gap-3 items-baseline"><span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--tue))" }} /><span><strong>Sozialarbeit</strong> · {HELGA_UMFELD.aktuell.sozialNaechsterTermin}</span></li>
          )}
          {HELGA_UMFELD.aktuell.ehrenamtNaechsterTermin && (
            <li className="flex gap-3 items-baseline"><span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--thu))" }} /><span><strong>Ehrenamt</strong> · {HELGA_UMFELD.aktuell.ehrenamtNaechsterTermin}</span></li>
          )}
        </ul>
      </section>

      {/* Konferenz */}
      {HELGA_UMFELD.konferenz && (
        <section className="rounded-2xl p-5 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.06), transparent)", border: "1px solid rgb(var(--accent) / 0.2)" }}>
          <p className="text-[11px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: "rgb(var(--accent))" }}>
            Nächste Fallkonferenz
          </p>
          <h2 className="font-display text-[18px] font-bold tracking-tight2">{HELGA_UMFELD.konferenz.naechste}</h2>
          <p className="text-[12px] text-mute mt-2">
            {HELGA_UMFELD.konferenz.teilnehmende.length} Menschen sprechen über meinen Pflege- und
            Hilfeplan. Ich kann dabei sein oder mich vertreten lassen.
          </p>
        </section>
      )}

      {/* Begleiter:innen gruppiert */}
      {ordered.map((feld) => {
        const list = groups[feld];
        if (!list || list.length === 0) return null;
        return (
          <section key={feld} className="mb-6">
            <header className="mb-3 flex items-baseline gap-2">
              <h2 className="font-display text-[16px] font-bold tracking-tight2" style={{ color: `rgb(${BERUFSFELD_FARBE[feld]})` }}>
                {BERUFSFELD_LABEL[feld]}
              </h2>
              <span className="text-[11px] text-soft">{list.length} {list.length === 1 ? "Person" : "Menschen"}</span>
            </header>
            <ul className="grid sm:grid-cols-2 gap-3">
              {list.map((b) => (
                <li key={b.personId}>
                  <Link
                    href={b.zugriffPfad}
                    className="surface-hover rounded-2xl p-4 flex gap-3 relative overflow-hidden block"
                  >
                    <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${BERUFSFELD_FARBE[b.beruf]})` }} />
                    <div className="ml-2.5 flex gap-3 w-full">
                      <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden surface-mute relative grid place-items-center">
                        {b.portrait ? (
                          <Image src={b.portrait} alt="" fill sizes="48px" className="object-cover" />
                        ) : (
                          <span className="font-mono text-[14px] font-semibold" style={{ color: `rgb(${BERUFSFELD_FARBE[b.beruf]})` }}>
                            {b.initials}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[14px] truncate">{b.name}</div>
                        <div className="text-[11px] text-mute truncate">{b.rolle}</div>
                        {b.einrichtung && (
                          <div className="text-[10px] text-soft truncate font-mono">{b.einrichtung}</div>
                        )}
                        <div className="text-[10px] mt-1.5 inline-flex items-center gap-1 font-medium" style={{ color: `rgb(${BERUFSFELD_FARBE[b.beruf]})` }}>
                          {b.rhythmus} <span className="text-soft ml-0.5">→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {b.notiz && (
                    <p className="text-[11px] text-mute italic mt-1.5 px-1">„{b.notiz}"</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Datenschutz · § 65 SGB X · § 630g BGB</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Du entscheidest, was wer sehen darf. Die Akte ist standardmäßig nur für die Berufsgruppe
          sichtbar, die einen direkten Auftrag hat. Familie kann nur eingebunden werden, wenn du
          oder deine Bevollmächtigte das ausdrücklich erlaubst — geregelt über deine Vorsorgevollmacht.
        </p>
      </section>
    </KlientShell>
  );
}
