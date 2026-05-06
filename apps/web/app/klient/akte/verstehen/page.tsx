// /klient/akte/verstehen · Klartext-Übersetzer für medizinische Dokumente.

import Link from "next/link";
import { KlientShell } from "@/components/KlientShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { AkteVerstaendnisView } from "@/components/AkteVerstaendnis";

export const metadata = {
  title: "Akte verstehen · Klartext-Übersetzer",
  description: "Arztbriefe, Befunde, MD-Gutachten in einfache Sprache übersetzt — mit Glossar, Handlungsschritten und Fragen für den nächsten Termin.",
};

export default function AkteVerstehenPage() {
  return (
    <KlientShell user={{ name: "Helga Reinhardt", initials: "HR", relation: "self", klientId: "klient-hr" }}>
      <header className="mb-4">
        <Link href="/klient/akte" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Akte
        </Link>
      </header>
      <RolePastelHeader rolle="klient" eyebrow="Akte verstehen · KI-Klartext" titel="Was steht da eigentlich?" loopSrc="/loops/akte-puls.mp4">
        Arztbriefe, Befunde und Gutachten sind voll mit Fachsprache. Lana übersetzt in einfache
        Sprache, erklärt Begriffe, sagt was zu tun ist und was du beim nächsten Termin fragen
        solltest. Kein Wartezeit · sofort verstehen.
      </RolePastelHeader>

      <AkteVerstaendnisView />

      <section className="rounded-2xl p-4 mt-5" style={{ background: "rgb(var(--vibe-approval) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)" }}>
        <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-approval))" }}>
          Übertrifft washabich.de, BefundKlar, mein-arztbefund
        </p>
        <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>washabich.de</strong>: 1-3 Tage Wartezeit, externer Service. Wir: sofort, in der Akte.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>BefundKlar</strong>: nur Befund-Übersetzung. Wir: 6 Dokument-Typen + Handlungs-Schritte + Fragen-Vorbereitung.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>mein-arztbefund.de</strong>: Crowd-übersetzt. Wir: KI mit Pflege-System-Prompt + Reading-Level-Score.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span>Bonus: Lana liest auf Wunsch vor (ElevenLabs in Phase 2).</span></li>
        </ul>
      </section>
    </KlientShell>
  );
}
