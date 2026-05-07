// /klient/heute · Tageshub für Klient:in.
//
// Was passiert heute mit dir? Wer kommt? Was steht an? Wie geht's dir?
// Plus: 1-Klick-Akte-verstehen, 1-Klick-Lana-Anruf, Wohlbefinden-Check.

import Link from "next/link";
import { KlientShell } from "@/components/KlientShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { generateKlientPlan } from "@/lib/berufsplan/generator";
import { getKlient } from "@/lib/hierarchy/store";
import { naechsteKonferenzFuerKlient, seedKonferenzOnce } from "@/lib/konferenz/store";

export const metadata = { title: "Klient · Heute" };

const KLIENT_ID = "klient-hr";

const BERUF_LABEL: Record<string, string> = {
  pflege: "Pflege",
  arzt: "Arzt:Ärztin",
  therapie: "Therapie",
  sozialarbeit: "Sozialarbeit",
  ehrenamt: "Begleitung",
  heilerziehung: "Heilerziehung",
  hauswirtschaft: "Hauswirtschaft",
  lead: "Stationsleitung",
};

export default function KlientHeutePage() {
  seedKonferenzOnce();
  const klient = getKlient(KLIENT_ID);
  const heuteISO = new Date().toISOString().slice(0, 10);
  const morgenISO = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const plan = generateKlientPlan(KLIENT_ID, 7);
  const heute = plan.filter((p) => p.datumISO === heuteISO);
  const morgen = plan.filter((p) => p.datumISO === morgenISO);

  const konf = naechsteKonferenzFuerKlient(KLIENT_ID);

  return (
    <KlientShell user={{ name: klient?.name ?? "Helga Reinhardt", initials: klient?.initials ?? "HR", relation: "self", klientId: KLIENT_ID }}>
      <RolePastelHeader rolle="klient" eyebrow={`Heute · ${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}`} titel={`Hallo ${(klient?.name ?? "Helga").split(" ")[0]}.`} loopSrc="/loops/akte-puls.mp4">
        Heute kommen {heute.length} Personen aus {new Set(heute.map((h) => h.beruf)).size} Berufsgruppen zu Ihnen.
        Morgen sind es {morgen.length}. Lana ist da, wenn Sie Fragen haben.
      </RolePastelHeader>

      {/* KPI-Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <Tile label="Heute" value={heute.length.toString()} farbe="var(--wed)" unten="Termine bei Ihnen" />
        <Tile label="Morgen" value={morgen.length.toString()} farbe="var(--vibe-team)" unten="bereits geplant" />
        <Tile label="Berufe heute" value={new Set(heute.map((h) => h.beruf)).size.toString()} farbe="var(--accent)" unten="im Care-Team" />
        <Tile label="Konferenz" value={konf ? "↗" : "—"} farbe="var(--vibe-stats)" unten={konf ? "geplant" : "keine offen"} />
      </section>

      {/* Klient-Werkzeuge · Akte-verstehen + Self-Booker + Buchen */}
      <section className="surface rounded-2xl p-4 mb-4" style={{ borderLeft: "3px solid rgb(var(--wed))" }}>
        <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Selbstbestimmung · Werkzeuge für Sie</p>
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Was Sie selbst entscheiden können</h2>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link href="/klient/akte/verstehen" className="surface-hover rounded-xl p-3 block" style={{ borderTop: "2px solid rgb(var(--accent))" }}>
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--accent))" }}>
              live · Claude
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">Akte verstehen</h3>
            <p className="text-[11px] text-mute leading-snug">Arztbrief / MD-Gutachten in einfacher Sprache · max 15 Worte/Satz</p>
            <p className="text-[10px] mt-2 font-medium" style={{ color: "rgb(var(--accent))" }}>Übersetzen lassen →</p>
          </Link>
          <Link href="/klient/buchen" className="surface-hover rounded-xl p-3 block" style={{ borderTop: "2px solid rgb(var(--vibe-approval))" }}>
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--vibe-approval))" }}>
              live · § 37b SGB XI
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">Direkt buchen</h3>
            <p className="text-[11px] text-mute leading-snug">Begleitung · Verhinderungspflege · Hauswirtschaft · Entlastungsbetrag</p>
            <p className="text-[10px] mt-2 font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>Buchen →</p>
          </Link>
          <div className="surface-mute rounded-xl p-3 opacity-60">
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--vibe-team))" }}>
              PG 2+ · Phase B
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">Self-Booker · Sachleistung</h3>
            <p className="text-[11px] text-mute leading-snug">Stunden-Wallet · Pflegekraft direkt aus Pool wählen</p>
            <p className="text-[10px] mt-2 text-soft font-mono">in Vorbereitung</p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* LINKS · Heute + Morgen */}
        <div className="lg:col-span-2 space-y-4">
          <section className="surface rounded-2xl p-4">
            <header className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Wer kommt heute zu Ihnen</p>
              <h2 className="font-display text-[18px] font-semibold mt-0.5">{heute.length} Termine</h2>
            </header>
            {heute.length === 0 ? (
              <p className="text-[13px] text-mute italic">Heute sind keine Termine geplant. Genießen Sie den Tag.</p>
            ) : (
              <ul className="space-y-2">
                {heute.map((h) => (
                  <li key={h.id} className="flex items-baseline gap-3 rounded-lg p-2.5 surface-mute">
                    <span className="font-mono tabular-nums text-[14px] w-[80px] shrink-0" style={{ color: `rgb(${h.farbe})` }}>
                      {h.startZeit}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[13px] font-medium">{BERUF_LABEL[h.beruf] ?? h.beruf}</span>
                        <span className="text-[10px] uppercase tracking-wider px-1 rounded font-mono" style={{ background: `rgb(${h.farbe} / 0.15)`, color: `rgb(${h.farbe})` }}>
                          {h.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-soft">{h.aktivitaet}</p>
                      {h.ort && <p className="text-[10px] text-soft font-mono">{h.ort}</p>}
                    </div>
                    <span className="text-[10px] font-mono text-soft shrink-0">{h.dauer_min} min</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {morgen.length > 0 && (
            <section className="surface rounded-2xl p-4">
              <header className="mb-3">
                <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Morgen — was kommt</p>
                <h2 className="font-display text-[16px] font-semibold mt-0.5">{morgen.length} Termine</h2>
              </header>
              <ul className="space-y-1.5">
                {morgen.map((h) => (
                  <li key={h.id} className="flex items-baseline gap-2 text-[12px]">
                    <span className="font-mono tabular-nums w-[60px] shrink-0" style={{ color: `rgb(${h.farbe})` }}>{h.startZeit}</span>
                    <span className="font-medium">{BERUF_LABEL[h.beruf] ?? h.beruf}</span>
                    <span className="text-soft">{h.aktivitaet}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* RECHTS · Lana + Wohlbefinden + Akte */}
        <aside className="space-y-4">
          {/* Lana-CTA */}
          <section className="surface rounded-2xl p-4" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)" }}>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>Lana · KI-Begleiterin</p>
            <p className="text-[13px] mt-2 leading-relaxed">
              Hat ein Brief Sie verunsichert? Möchten Sie etwas erklärt bekommen? Oder einfach reden?
            </p>
            <div className="mt-3 space-y-2">
              <Link href="/klient/akte/verstehen" className="block px-3 py-2 rounded-md text-[12px] font-medium" style={{ background: "rgb(var(--accent))", color: "white" }}>
                ✦ Brief / Akte erklären lassen
              </Link>
              <Link href="/messenger" className="block px-3 py-2 rounded-md text-[12px] font-medium surface" style={{ color: "rgb(var(--accent))" }}>
                ✉ Mit Lana chatten
              </Link>
            </div>
          </section>

          {/* Wohlbefinden */}
          <section className="surface rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Wie geht es Ihnen heute?</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { emo: "🌞", label: "gut", farbe: "var(--vibe-approval)" },
                { emo: "🌿", label: "ruhig", farbe: "var(--fri)" },
                { emo: "🌧", label: "müde", farbe: "var(--vibe-stats)" },
                { emo: "🪨", label: "schwer", farbe: "var(--vibe-profile)" },
                { emo: "🔥", label: "Schmerz", farbe: "var(--mon)" },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className="px-2.5 py-1.5 rounded-full text-[12px] transition-colors"
                  style={{ background: `rgb(${s.farbe} / 0.12)`, color: `rgb(${s.farbe})`, boxShadow: `inset 0 0 0 1px rgb(${s.farbe} / 0.3)` }}
                >
                  <span className="mr-1" aria-hidden>{s.emo}</span>
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-soft italic mt-2 leading-relaxed">
              Ihre Antwort ist nur für Sie + Ihr Care-Team sichtbar. Bei "Schmerz" wird die Pflege benachrichtigt.
            </p>
          </section>

          {/* Akte-Snippets */}
          <section className="surface rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Ihre Akte</p>
            <ul className="space-y-1">
              <li><Link href="/klient/akte" className="block text-[12px] px-2 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))]">→ Übersicht</Link></li>
              <li><Link href="/klient/akte/befunde" className="block text-[12px] px-2 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))]">→ Befunde + Bilder</Link></li>
              <li><Link href="/klient/akte/wunde" className="block text-[12px] px-2 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))]">→ Wundverlauf</Link></li>
              <li><Link href="/klient/akte/anamnese" className="block text-[12px] px-2 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))]">→ Anamnese</Link></li>
              <li><Link href="/klient/dienstplan" className="block text-[12px] px-2 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))]">→ Wer kommt wann?</Link></li>
              <li><Link href="/klient/notizen" className="block text-[12px] px-2 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))]">→ Meine Notizen</Link></li>
            </ul>
          </section>

          {/* Konferenz-CTA wenn geplant */}
          {konf && (
            <section className="rounded-2xl p-4" style={{ background: "rgb(var(--vibe-stats) / 0.08)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-stats) / 0.3)" }}>
              <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--vibe-stats))" }}>Konferenz</p>
              <p className="text-[13px] mt-1.5">
                <strong>{konf.anlass}</strong>
              </p>
              <p className="text-[11px] text-soft mt-0.5">
                {new Date(konf.geplantAm).toLocaleString("de-DE", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })} · {konf.ort}
              </p>
              <Link href={`/konferenz/${konf.id}`} className="mt-3 inline-block px-3 py-1.5 rounded-md text-[12px] font-medium" style={{ background: "rgb(var(--vibe-stats))", color: "white" }}>
                Vorbereitung →
              </Link>
            </section>
          )}
        </aside>
      </div>
    </KlientShell>
  );
}

function Tile({ label, value, farbe, unten }: { label: string; value: string; farbe: string; unten: string }) {
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>{label}</p>
      <p className="text-[20px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{value}</p>
      <p className="text-[10px] text-soft">{unten}</p>
    </div>
  );
}
