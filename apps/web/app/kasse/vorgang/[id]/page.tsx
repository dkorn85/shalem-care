import Link from "next/link";
import { notFound } from "next/navigation";
import { KasseShell } from "@/components/KasseShell";
import { VorgangsEntscheidung } from "@/components/VorgangsEntscheidung";
import { getVorgang, seedKostentraegerOnce } from "@/lib/kostentraeger/store";
import {
  KASSEN_STATUS_LABEL, KASSEN_STATUS_FARBE, VORGANGS_LABEL,
} from "@/lib/kostentraeger/types";
import { seedKrankmeldungOnce } from "@/lib/krankmeldung/store";
import { seedAnfragenOnce } from "@/lib/verordnung/store";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CURRENT_KASSE_IK = "100000031";

export default async function VorgangPage({ params }: { params: Promise<{ id: string }> }) {
  seedKrankmeldungOnce();
  seedAnfragenOnce();
  seedKostentraegerOnce();

  const { id } = await params;
  const v = getVorgang(id);
  if (!v) notFound();

  return (
    <KasseShell
      user={{ name: "Sandra Lehmann", ik: CURRENT_KASSE_IK, role: "sachbearbeiterin" }}
      kassenName="AOK Nordost"
    >
      <Link href="/kasse" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
        ← Eingangskorb
      </Link>

      <header className="mb-6">
        <div className="flex items-baseline gap-2 flex-wrap mb-2">
          <span className="chip" style={{ background: `rgb(${KASSEN_STATUS_FARBE[v.status]} / 0.15)`, color: `rgb(${KASSEN_STATUS_FARBE[v.status]})` }}>
            {KASSEN_STATUS_LABEL[v.status]}
          </span>
          <span className="chip" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
            {VORGANGS_LABEL[v.typ]}
          </span>
        </div>
        <h1 className="font-display text-[26px] font-bold tracking-tight2">{v.versicherterName}</h1>
        <p className="text-[13px] text-mute mt-1">
          {v.versichertenNr && <>Versichertennr <span className="font-mono">{v.versichertenNr}</span> · </>}
          eingegangen {format(new Date(v.eingegangenAm), "d. MMMM yyyy HH:mm", { locale: de })}
        </p>
      </header>

      <div className="grid lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 surface rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Sachverhalt</p>
          <p className="text-[14px] mb-3">{v.beschreibung}</p>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[12px] mt-4 pt-3 border-t border-app-soft">
            {v.einrichtungName && <Row label="Leistungserbringer" value={v.einrichtungName} />}
            {v.betreffRef && <Row label="Referenz" value={v.betreffRef} mono />}
            {v.betragCents !== undefined && <Row label="Betrag" value={`${(v.betragCents / 100).toFixed(2)} €`} mono />}
            {v.bearbeitetAm && (
              <Row label="zuletzt bearbeitet" value={`${format(new Date(v.bearbeitetAm), "d.M. HH:mm", { locale: de })} · ${v.bearbeitetVon ?? "—"}`} />
            )}
          </dl>
          {v.notiz && (
            <div className="surface-mute rounded-lg p-3 mt-4">
              <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-1">Notiz</p>
              <p className="text-[13px] italic">„{v.notiz}"</p>
            </div>
          )}
        </section>

        <aside className="lg:col-span-5">
          <VorgangsEntscheidung
            vorgangId={v.id}
            currentStatus={v.status}
            bearbeiterName="Sandra Lehmann"
          />
        </aside>
      </div>
    </KasseShell>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-soft uppercase tracking-wide text-[10px]">{label}</dt>
      <dd className={mono ? "font-mono" : ""}>{value}</dd>
    </>
  );
}
