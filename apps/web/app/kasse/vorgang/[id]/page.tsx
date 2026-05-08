import Link from "next/link";
import { notFound } from "next/navigation";
import { KasseShell } from "@/components/KasseShell";
import { VorgangsEntscheidung } from "@/components/VorgangsEntscheidung";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { MusterZwoelfHKP } from "@/components/scheine/MusterZwoelfHKP";
import { MusterEinsAU } from "@/components/scheine/MusterEinsAU";
import { KassenBescheidBrief } from "@/components/scheine/KassenBescheidBrief";
import { KlartextSpalte } from "@/components/scheine/KlartextSpalte";
import { getVorgang, seedKostentraegerOnce } from "@/lib/kostentraeger/store";
import {
  KASSEN_STATUS_LABEL, KASSEN_STATUS_FARBE, VORGANGS_LABEL,
} from "@/lib/kostentraeger/types";
import { seedKrankmeldungOnce } from "@/lib/krankmeldung/store";
import { seedAnfragenOnce } from "@/lib/verordnung/store";
import { scheinFuerVorgang, klartextFuerVorgang } from "@/lib/kasse/bescheid-daten";
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

  const schein = scheinFuerVorgang(v);
  const klartext = klartextFuerVorgang(v);

  // Bescheid-Brief wird zusätzlich angezeigt, sobald Status ≠ eingegangen.
  const zeigeBescheid = v.status !== "eingegangen" && schein.art !== "brief";
  const bescheidDaten =
    zeigeBescheid
      ? scheinFuerVorgang({ ...v, typ: "krankengeld" }).art === "brief"
        ? (scheinFuerVorgang({ ...v, typ: "krankengeld" }) as { art: "brief"; daten: Parameters<typeof KassenBescheidBrief>[0]["daten"] }).daten
        : null
      : null;

  return (
    <KasseShell
      user={{ name: "Sandra Lehmann", ik: CURRENT_KASSE_IK, role: "sachbearbeiterin" }}
      kassenName="AOK Nordost"
    >
      <Link href="/kasse" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
        ← Eingangskorb
      </Link>

      <header className="mb-5">
        <div className="flex items-baseline gap-2 flex-wrap mb-2">
          <span className="chip" style={{ background: `rgb(${KASSEN_STATUS_FARBE[v.status]} / 0.15)`, color: `rgb(${KASSEN_STATUS_FARBE[v.status]})` }}>
            {KASSEN_STATUS_LABEL[v.status]}
          </span>
          <span className="chip" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
            {VORGANGS_LABEL[v.typ]}
          </span>
          {schein.art === "muster12" && (
            <span className="chip text-[10px]" style={{ background: "rgba(107,26,56,0.12)", color: "#6B1A38" }}>Muster 12</span>
          )}
          {schein.art === "muster1" && (
            <span className="chip text-[10px]" style={{ background: "rgba(180,30,30,0.12)", color: "#B41E1E" }}>Muster 1 · eAU</span>
          )}
          {schein.art === "brief" && (
            <span className="chip text-[10px]" style={{ background: "rgba(30,127,68,0.12)", color: "#1E7F44" }}>Bescheid-Brief</span>
          )}
        </div>
        <h1 className="font-display text-[26px] font-bold tracking-tight2">{v.versicherterName}</h1>
        <p className="text-[13px] text-mute mt-1">
          {v.versichertenNr && <>Versichertennr <span className="font-mono">{v.versichertenNr}</span> · </>}
          eingegangen {format(new Date(v.eingegangenAm), "d. MMMM yyyy HH:mm", { locale: de })}
        </p>
      </header>

      <LerneTipp rolle="kasse" titel="Was siehst du hier?">
        Links der Original-Schein wie er bei dir eingeht (Muster 12 = HKP rosé,
        Muster 1 = AU gelb, oder als formaler Bescheid-Brief mit Briefkopf).
        Rechts die Klartext-Spur — was die Codes bedeuten und was als nächstes
        passiert. Unten rechts deine Entscheidungs-Buttons mit Status-Spur.
      </LerneTipp>

      {/* Schein in Original-Optik + Klartext-Spalte */}
      <section className="mb-5">
        {schein.art === "muster12" && (
          <KlartextSpalte
            schein={<MusterZwoelfHKP daten={schein.daten} />}
            klartext={klartext}
          />
        )}
        {schein.art === "muster1" && (
          <KlartextSpalte
            schein={<MusterEinsAU daten={schein.daten} />}
            klartext={klartext}
          />
        )}
        {schein.art === "brief" && (
          <KlartextSpalte
            schein={<KassenBescheidBrief daten={schein.daten} />}
            klartext={klartext}
          />
        )}
        {schein.art === "keiner" && (
          <div className="surface rounded-2xl p-5 text-[13px] text-soft text-center">
            {schein.hinweis}
          </div>
        )}
      </section>

      {/* Sachverhalts-Daten als kollabierbares Detail */}
      <details className="surface rounded-2xl p-4 mb-5">
        <summary className="cursor-pointer text-[12px] uppercase tracking-wider font-medium text-soft">
          Roh-Daten · Vorgangs-Header
        </summary>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[12px] mt-3 pt-3 border-t border-app-soft">
          <Row label="Sachverhalt" value={v.beschreibung} />
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
      </details>

      {/* Bescheid-Vorschau · sobald Entscheidung gefallen ist */}
      {zeigeBescheid && bescheidDaten && (
        <NurAbProfi rolle="kasse">
          <details className="surface rounded-2xl p-4 mb-5">
            <summary className="cursor-pointer text-[12px] uppercase tracking-wider font-medium" style={{ color: "rgb(var(--vibe-stats))" }}>
              ● Bescheid-Brief generieren · Versand-Vorschau
            </summary>
            <div className="mt-4">
              <KassenBescheidBrief daten={bescheidDaten} />
            </div>
          </details>
        </NurAbProfi>
      )}

      {/* Entscheidung */}
      <aside className="surface rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Sachbearbeitung · Status setzen</p>
        <VorgangsEntscheidung
          vorgangId={v.id}
          currentStatus={v.status}
          bearbeiterName="Sandra Lehmann"
        />
      </aside>
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
