import Link from "next/link";
import { KlientShell } from "@/components/KlientShell";
import { KlientNotizenForm } from "@/components/KlientNotizenForm";
import { ladeNotizenFuerKlient } from "@/lib/klient/notiz-store";

export const metadata = { title: "Notiztafel · Meine Akte" };

const KLIENT_ID = "klient-hr";

export default async function KlientNotizenPage() {
  const initialNotizen = await ladeNotizenFuerKlient(KLIENT_ID);

  return (
    <KlientShell user={{ name: "Helga Reinhardt", initials: "HR", relation: "self", klientId: KLIENT_ID }}>
      <header className="mb-6">
        <Link href="/klient/akte" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Akte</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Meine Notiztafel</p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Was mir <span className="rainbow-text">wichtig</span> ist.
        </h1>
        <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
          Trag hier zwischen den Konferenzen ein, was du besprechen möchtest. Was du als
          „für Konferenz" markierst, sieht dein Team vor dem nächsten gemeinsamen Termin.
          Was du nur für dich aufschreiben willst, bleibt hier.
        </p>
      </header>

      <KlientNotizenForm initialNotizen={initialNotizen} />

      <section className="surface rounded-2xl p-5 mt-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Datenschutz</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Diese Notizen gehören dir. Was du nicht für die Konferenz markierst, sieht niemand außer dir
          (und Personen, denen du explizit Zugriff gewährst — z.B. deine Tochter über die Vorsorgevollmacht).
          Phase 2: Verschlüsselung mit deinem persönlichen Schlüssel.
        </p>
      </section>
    </KlientShell>
  );
}
