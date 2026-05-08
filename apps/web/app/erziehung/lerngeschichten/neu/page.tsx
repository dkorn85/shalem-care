import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { LerngeschichteEntwurfBox } from "@/components/LerngeschichteEntwurfBox";

export const metadata = { title: "Erziehung · Neue Lerngeschichte" };

export default function NeueLerngeschichtePage() {
  return (
    <AppShell role="erziehung" user={{ id: "erzieher-001", name: "Yvonne Berger", subtitle: "Erzieherin", initials: "YB" }} station="Kita Sonnenblume">
      <header className="mb-5">
        <Link href="/erziehung/lerngeschichten" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Lerngeschichten
        </Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Neue Lerngeschichte</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Beobachtung in 2–6 Sätzen festhalten · Lana strukturiert nach Carr (Bildungsbereich +
          Lerndisposition + 80–180-Wort-Text). Du polierst, korrigierst, veröffentlichst.
        </p>
      </header>

      <LerngeschichteEntwurfBox />

      <section className="surface rounded-2xl p-5 mt-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Carr-Prinzipien</p>
        <ul className="space-y-1.5 text-[12px] text-mute">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Stärken sehen, nicht Defizite — was gelingt heute?</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Konkret beschreiben, nicht interpretieren — was wurde getan/gesagt?</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Lerndispositionen würdigen — Interesse, Engagement, Standhalten, Sich-ausdrücken, Verantwortung</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Wertschätzend formulieren — als Brief an das Kind oder die Eltern</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
