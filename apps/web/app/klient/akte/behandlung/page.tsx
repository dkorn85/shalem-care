import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { KlientShell } from "@/components/KlientShell";
import { seedOnce } from "@/lib/seed";
import { getKlient } from "@/lib/hierarchy/store";
import { BERUF_LABEL, BERUF_FARBE } from "@/lib/fortbildung/katalog";

const KLIENT_ID = "klient-hr";

export const metadata = {
  title: "Behandlung · Meine Akte",
  description: "Interdisziplinärer Behandlungsplan: Ziele, Maßnahmen, Verantwortlichkeiten.",
};

// Demo-Behandlungsplan — wird Phase 2 aus lib/befund/store gelesen.
const DEMO_PLAN = {
  primaerverantwortung: "pflege" as const,
  beteiligteBerufe: ["pflege", "arzt", "therapie", "sozialarbeit"] as const,
  ziele: [
    {
      id: "z1",
      formulierung: "Schmerzfreie Mobilität bis zum Garten (50 m) ohne Rollator-Bremse",
      zielwert: "NRS ≤ 3 bei 50 m Gehstrecke",
      zielerreichungBis: "2026-08-15",
      status: "in_bearbeitung" as const,
    },
    {
      id: "z2",
      formulierung: "Schlaf 6 h zusammenhängend ohne Schmerzunterbrechung",
      zielwert: "Schmerztagebuch zeigt < 1 Aufwachen/Nacht",
      zielerreichungBis: "2026-07-01",
      status: "in_bearbeitung" as const,
    },
    {
      id: "z3",
      formulierung: "Vitamin-D-Spiegel zurück in Normbereich",
      zielwert: "25-OH-D ≥ 30 ng/ml",
      zielerreichungBis: "2026-09-01",
      status: "offen" as const,
    },
  ],
  massnahmen: [
    { id: "m1", beruf: "pflege" as const,        beschreibung: "Schmerzbeobachtung 4x/Tag, NRS-Tagebuch", frequenz: "täglich", dauer: "ongoing", evidenzklasse: "Ia" as const, quelle: "DNQP-Schmerzmanagement", status: "laufend" as const },
    { id: "m2", beruf: "pflege" as const,        beschreibung: "Wärmewickel LWS abends 20 min", frequenz: "täglich", dauer: "4 Wochen", evidenzklasse: "IIb" as const, status: "laufend" as const },
    { id: "m3", beruf: "arzt" as const,          beschreibung: "Schmerztherapie nach WHO-Stufenschema; Vitamin-D-Substitution 4000 IE/d", frequenz: "Re-Evaluation 2-wöchentlich", dauer: "6 Wochen", evidenzklasse: "Ia" as const, quelle: "AWMF Lumbale Radikulopathie", status: "laufend" as const },
    { id: "m4", beruf: "therapie" as const,      beschreibung: "Manuelle Therapie LWS + Mobilisation, anschließend Stabilisationsprogramm", frequenz: "2x/Woche", dauer: "12 Sitzungen", evidenzklasse: "Ia" as const, quelle: "AWMF S3 Kreuzschmerz NVL", status: "laufend" as const },
    { id: "m5", beruf: "therapie" as const,      beschreibung: "Gangschule mit Rollator-Anpassung", frequenz: "1x/Woche", dauer: "6 Wochen", evidenzklasse: "IIa" as const, status: "laufend" as const },
    { id: "m6", beruf: "sozialarbeit" as const,  beschreibung: "Hilfsmittelantrag Toilettensitzerhöhung + Badewannenbrett", frequenz: "einmalig", dauer: "—", status: "laufend" as const },
  ],
  reviewIntervallTage: 28,
};

export default async function BehandlungPage() {
  seedOnce();
  const klient = getKlient(KLIENT_ID);
  if (!klient) notFound();

  return (
    <KlientShell user={{ name: klient.name, initials: klient.initials, relation: "self", klientId: klient.id }}>
      <header className="mb-6">
        <Link href="/klient/akte" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Zurück zur Akte
        </Link>
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
              Behandlungsplan · interdisziplinär
            </p>
            <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
              Was wir <span className="rainbow-text">gemeinsam</span> tun.
            </h1>
            <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
              Pflege, Arzt, Therapie, Sozialarbeit — alle arbeiten mit denselben Zielen, jede mit ihrer Methode.
              Du siehst, wer was tut, mit welcher Evidenz, und wann das nächste Review ist.
            </p>
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden surface">
            <Image src="/akte/header-behandlung.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
          </div>
        </div>
      </header>

      {/* Beteiligte */}
      <section className="mb-8">
        <p className="text-[10px] uppercase tracking-wider text-soft mb-2 font-medium">Beteiligte Berufe</p>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_PLAN.beteiligteBerufe.map((b) => (
            <span
              key={b}
              className="chip text-[11px]"
              style={{
                background: `rgb(${BERUF_FARBE[b]} / 0.15)`,
                color: `rgb(${BERUF_FARBE[b]})`,
                border: b === DEMO_PLAN.primaerverantwortung ? `1px solid rgb(${BERUF_FARBE[b]} / 0.4)` : undefined,
                fontWeight: b === DEMO_PLAN.primaerverantwortung ? 600 : 500,
              }}
            >
              {b === DEMO_PLAN.primaerverantwortung && "★ "}{BERUF_LABEL[b]}
            </span>
          ))}
        </div>
      </section>

      {/* Ziele */}
      <section className="mb-10">
        <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-3">Ziele (SMART)</h2>
        <ul className="space-y-3">
          {DEMO_PLAN.ziele.map((z) => (
            <li key={z.id} className="surface rounded-2xl p-4">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <p className="font-medium text-[14px] flex-1">{z.formulierung}</p>
                <span
                  className="chip text-[10px]"
                  style={{
                    background:
                      z.status === "in_bearbeitung" ? "rgb(var(--vibe-team) / 0.15)" : "rgb(var(--bg-mute))",
                    color:
                      z.status === "in_bearbeitung" ? "rgb(var(--vibe-team))" : "rgb(var(--fg-mute))",
                  }}
                >
                  {(z.status as string).replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-[12px] text-mute mt-2">
                <span className="text-soft uppercase tracking-wider text-[9px] mr-1.5">Messbar:</span>
                {z.zielwert}
              </p>
              <p className="text-[11px] text-soft mt-1 font-mono">bis {z.zielerreichungBis}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Maßnahmen, gruppiert nach Beruf */}
      <section className="mb-10">
        <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-3">Maßnahmen</h2>
        <div className="space-y-4">
          {DEMO_PLAN.beteiligteBerufe.map((b) => {
            const mas = DEMO_PLAN.massnahmen.filter((m) => m.beruf === b);
            if (mas.length === 0) return null;
            return (
              <div key={b}>
                <p className="text-[11px] uppercase tracking-wider mb-2 font-medium font-mono" style={{ color: `rgb(${BERUF_FARBE[b]})` }}>
                  {BERUF_LABEL[b]}
                </p>
                <ul className="space-y-2">
                  {mas.map((m) => (
                    <li key={m.id} className="surface-hover rounded-xl p-3 relative overflow-hidden">
                      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${BERUF_FARBE[b]})` }} />
                      <div className="ml-2.5">
                        <p className="text-[13px] font-medium">{m.beschreibung}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-mute mt-1">
                          <span><span className="text-soft">Frequenz:</span> {m.frequenz}</span>
                          <span><span className="text-soft">Dauer:</span> {m.dauer}</span>
                          {m.evidenzklasse && <span><span className="text-soft">Evidenz:</span> <span className="font-mono">{m.evidenzklasse}</span></span>}
                          {m.quelle && <span className="text-soft italic">{m.quelle}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <div className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Review</p>
        <p className="text-[13px]">
          Nächstes Team-Review in {DEMO_PLAN.reviewIntervallTage} Tagen — alle beteiligten Berufe besprechen
          gemeinsam Fortschritt, Hindernisse, Anpassungen. Du bist eingeladen, dabei zu sein.
        </p>
      </div>
    </KlientShell>
  );
}
