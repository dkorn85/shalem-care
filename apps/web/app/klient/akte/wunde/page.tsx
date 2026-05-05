import Link from "next/link";
import { notFound } from "next/navigation";
import { KlientShell } from "@/components/KlientShell";
import { WundverlaufDoku } from "@/components/WundverlaufDoku";
import { seedOnce } from "@/lib/seed";
import { getKlient } from "@/lib/hierarchy/store";
import { listWundenFor, listEintraegeFor, seedWundeOnce } from "@/lib/wunde/store";

const KLIENT_ID = "klient-hr";

export const metadata = {
  title: "Wundverlauf · Meine Akte",
  description: "Foto-Doku, Größenverlauf, Verbandstoff-Wechsel — DNQP-Standard.",
};

export default async function WundePage() {
  seedOnce();
  seedWundeOnce();

  const klient = getKlient(KLIENT_ID);
  if (!klient) notFound();

  const wunden = listWundenFor(KLIENT_ID);

  return (
    <KlientShell user={{ name: klient.name, initials: klient.initials, relation: "self", klientId: klient.id }}>
      <header className="mb-6">
        <Link href="/klient/akte" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Zurück zur Akte
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Wundverlauf · DNQP-Expertenstandard
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Was sich verändert, <span className="rainbow-text">sichtbar gemacht</span>.
        </h1>
        <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
          Bei jedem Verbandwechsel werden Größe, Wundgrund, Exsudat, Verband und ein Foto
          dokumentiert. So kannst du, deine Pflegeperson und dein Arzt sehen, ob sich die Wunde
          schließt — und in welchem Tempo.
        </p>
      </header>

      {wunden.length === 0 ? (
        <div className="surface rounded-2xl p-8 text-center">
          <p className="text-[14px] text-mute">Aktuell sind keine Wunden dokumentiert.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {wunden.map((w) => (
            <WundverlaufDoku key={w.id} wunde={w} eintraege={listEintraegeFor(w.id)} />
          ))}
        </div>
      )}
    </KlientShell>
  );
}
