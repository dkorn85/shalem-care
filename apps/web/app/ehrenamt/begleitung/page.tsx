import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitListItem, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  listBegleitKlienten, stimmungsMittel, stimmungsTendenz,
  LEBENSLAGE_LABEL, LEBENSLAGE_FARBE,
} from "@/lib/ehrenamt/begleit-store";

export const metadata = { title: "Ehrenamt · Begleitung" };

const TENDENZ_BADGE: Record<string, string> = {
  fallend:  "↓ trübt ein",
  steigend: "↑ hellt auf",
  stabil:   "≈ stabil",
  "—":      "neu",
};

export default async function BegleitungListePage() {
  const klienten = listBegleitKlienten();
  const lebenslagenZahl = new Set(klienten.flatMap((k) => k.lebenslagen)).size;
  const termineGesamt = klienten.reduce((s, k) => s + k.termine.length, 0);

  return (
    <AppShell role="ehrenamt" user={{ id: "person-ehrenamt-001", name: "Rita Schöndorf", subtitle: "Ehrenamtliche Begleitung", initials: "RS" }} station="Hospiz-Verein Berlin">
      <header className="mb-5">
        <Link href="/ehrenamt" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Meine Klient:innen</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Klick auf eine Person öffnet Biografie, Lebenslagen, vereinbarte Grenzen und
          den Stimmungs-Verlauf der letzten Termine. So fängst du nie bei null an.
        </p>
      </header>

      <LerneTipp rolle="ehrenamt" titel="Was ist Hospiz-Begleitung?">
        Du begleitest Menschen, die nicht mehr in der Mitte des Lebens stehen — oft
        einsam, manchmal sterbend. <strong>Biographische Arbeit</strong> nach
        Erika Schuchardt heißt: deine Klient:in ist viel mehr als die jetzige Situation.
        <strong> Stimmungsskala 1–5</strong> nach DHPV-Curriculum hilft, den Verlauf
        zu spüren — keine Note, sondern eine Antenne. Bei Stimmung ≤ 2 zwei Mal in
        Folge: dem Hospiz-Koordinator melden.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Begleitungen"      value={klienten.length}    farbe="var(--thu)" />
        <CockpitKpi label="Termine erfasst"   value={termineGesamt}      farbe="var(--vibe-team)" />
        <CockpitKpi label="Lebenslagen"        value={lebenslagenZahl}    farbe="var(--vibe-profile)" />
        <CockpitKpi label="Mittlere Stimmung" value={(klienten.reduce((s, k) => s + (stimmungsMittel(k.termine) ?? 3), 0) / Math.max(1, klienten.length)).toFixed(1)} farbe="var(--vibe-stats)" />
      </div>

      <NurAbProfi rolle="ehrenamt">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Hospizfachkraft · Lebenslagen-Verteilung</p>
          {(() => {
            const counts = new Map<string, number>();
            klienten.forEach((k) => k.lebenslagen.forEach((l) => counts.set(l, (counts.get(l) ?? 0) + 1)));
            const max = Math.max(1, ...counts.values());
            const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
            return (
              <ul className="space-y-1.5">
                {sorted.map(([l, n]) => (
                  <li key={l} className="flex items-baseline gap-2 text-[12px]">
                    <span className="w-[180px] shrink-0 text-mute">{LEBENSLAGE_LABEL[l as keyof typeof LEBENSLAGE_LABEL]}</span>
                    <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                      <span className="block h-full rounded-full" style={{ width: `${(n / max) * 100}%`, background: `rgb(${LEBENSLAGE_FARBE[l as keyof typeof LEBENSLAGE_FARBE]})` }} />
                    </span>
                    <span className="font-mono tabular-nums text-[11px] w-[24px] text-right">{n}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
          <p className="text-[10px] text-soft mt-2 italic">
            Dauer-Themen sichtbar machen — wenn z.B. mehrere Begleitete in spiritueller Suche
            sind, lohnt eine Themen-Supervision mit dem Koordinator.
          </p>
        </section>
      </NurAbProfi>

      <CockpitSection eyebrow="Begleit-Karten" title="Klient:innen" count={klienten.length}>
        <ul className="space-y-2">
          {klienten.map((k) => {
            const tendenz = stimmungsTendenz(k.termine);
            return (
              <CockpitListItem
                key={k.id}
                href={`/ehrenamt/begleitung/${k.id}`}
                badge={k.rhythmus.split(" ")[0]}
                badgeFarbe={k.farbe}
                title={`${k.name} · ${k.alter} J.`}
                subtitle={`seit ${k.seit} · ${k.termine.length} Termine · ${TENDENZ_BADGE[tendenz]}`}
                meta={k.lebenslagen.map((l) => LEBENSLAGE_LABEL[l]).join(" · ")}
              />
            );
          })}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 mt-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">In jeder Begleit-Akte</p>
        <ul className="space-y-1.5 text-[12px] text-mute">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Biografie nach Schuchardt · was diese Person ausmacht jenseits der Krankheit</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Aktuelle Lebenslagen · was bewegt gerade (Trauer, Einsamkeit, Demenz, Angst …)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Vereinbarte Grenzen · was du <em>nicht</em> tust, weil es nicht passt</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Stimmungs-Verlauf-Sparkline · Tendenz fallend/steigend/stabil</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
