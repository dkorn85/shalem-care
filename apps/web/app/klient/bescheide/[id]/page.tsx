// /klient/bescheide/[id] · Versicherten-Bescheid in Original-Optik + Klartext.
//
// Re-use der Schein-Komponenten aus Kasse — gleicher Look, andere Spalte:
// links der Original-Schein wie er die Kasse verlässt, rechts Lana erklärt
// in einfachen Sätzen, was für die Klientin daraus folgt + Widerspruchs-Recht.

import Link from "next/link";
import { notFound } from "next/navigation";
import { KlientShell } from "@/components/KlientShell";
import { MusterZwoelfHKP } from "@/components/scheine/MusterZwoelfHKP";
import { MusterEinsAU } from "@/components/scheine/MusterEinsAU";
import { KassenBescheidBrief } from "@/components/scheine/KassenBescheidBrief";
import { KlartextSpalte } from "@/components/scheine/KlartextSpalte";
import { DruckenButton } from "@/components/scheine/DruckenButton";
import { WiderspruchEntwurfBox } from "@/components/scheine/WiderspruchEntwurfBox";
import { getVorgang, seedKostentraegerOnce } from "@/lib/kostentraeger/store";
import { seedKrankmeldungOnce } from "@/lib/krankmeldung/store";
import { seedAnfragenOnce } from "@/lib/verordnung/store";
import { scheinFuerVorgang, klartextFuerVorgang } from "@/lib/kasse/bescheid-daten";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const KLIENT_ID = "klient-hr";
const KLIENT_NAME = "Helga Reinhardt";

export default async function KlientBescheidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  seedKrankmeldungOnce();
  seedAnfragenOnce();
  seedKostentraegerOnce();

  const { id } = await params;
  const v = getVorgang(id);
  if (!v) notFound();

  // Schutz: nur eigene Bescheide
  if (v.klientId !== KLIENT_ID && v.versicherterName !== KLIENT_NAME) {
    notFound();
  }

  const schein = scheinFuerVorgang(v);
  const klartext = klartextFuerVorgang(v);

  // Wenn die Kasse schon entschieden hat, zusätzlich den Bescheid-Brief.
  const istEntschieden = v.status === "genehmigt" || v.status === "abgelehnt";
  const bescheidBrief = istEntschieden && schein.art !== "brief"
    ? scheinFuerVorgang({ ...v, typ: "krankengeld" })
    : null;
  const bescheidBriefDaten = bescheidBrief && bescheidBrief.art === "brief"
    ? bescheidBrief.daten
    : null;

  const istWiderspruchsfaehig = v.status === "abgelehnt";

  return (
    <KlientShell user={{ name: KLIENT_NAME, initials: "HR", relation: "self", klientId: KLIENT_ID }}>
      <div className="flex items-baseline justify-between gap-2 mb-3 no-print">
        <Link href="/klient/bescheide" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1">
          ← Meine Bescheide
        </Link>
        <DruckenButton />
      </div>

      <header className="mb-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono">
          Eingegangen {format(new Date(v.eingegangenAm), "d. MMMM yyyy", { locale: de })}
          {v.bearbeitetAm && <> · entschieden {format(new Date(v.bearbeitetAm), "d. MMM", { locale: de })}</>}
        </p>
        <h1 className="font-display text-[24px] font-bold tracking-tight2 mt-1">
          {v.beschreibung}
        </h1>
        <p className="text-[13px] text-mute mt-1">
          Bei deiner Kasse · <strong>{v.kassenName}</strong>
          {v.versichertenNr && <> · Vers.-Nr <span className="font-mono">{v.versichertenNr}</span></>}
        </p>
      </header>

      {/* Original-Schein + Klartext */}
      <section className="mb-6">
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
            Für diese Antrags-Art gibt es noch keine Klartext-Vorlage. Sprich
            mit deiner Pflege oder dem Hospiz-Koordinator.
          </div>
        )}
      </section>

      {/* Bescheid-Brief separat sichtbar, wenn entschieden */}
      {bescheidBriefDaten && (
        <section className="mb-6">
          <header className="mb-3">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">
              Der Bescheid-Brief deiner Kasse
            </p>
            <h2 className="font-display text-[18px] font-bold tracking-tight2">
              Was Schwarz auf Weiß bei dir landet
            </h2>
          </header>
          <KassenBescheidBrief daten={bescheidBriefDaten} />
        </section>
      )}

      {/* Widerspruchs-Hinweis + KI-Editor bei Ablehnung */}
      {istWiderspruchsfaehig && (
        <>
          <section
            className="surface rounded-2xl p-5 mb-5 no-print"
            style={{ borderLeft: "3px solid rgb(var(--mon))", background: "rgb(var(--mon) / 0.05)" }}
          >
            <p className="text-[10px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>
              ⚠ Widerspruch möglich · § 84 SGG
            </p>
            <h3 className="font-display text-[16px] font-bold tracking-tight2 mb-2">
              Du hast 1 Monat Zeit, um zu widersprechen
            </h3>
            <p className="text-[13px] leading-relaxed text-pretty mb-3">
              Lana baut dir unten einen <strong>fertigen Brief</strong>, den du nur noch drucken
              und unterschreiben musst. Er muss innerhalb von <strong>einem Monat nach Erhalt
              des Bescheids</strong> bei deiner Kasse ankommen. Eine Begründung ist nicht
              zwingend — auch ohne ist der Widerspruch gültig.
            </p>
            <p className="text-[12px] text-mute leading-relaxed">
              Wenn du dir unsicher bist: deine <strong>Pflegekraft</strong>, der <strong>
              Hospiz-Koordinator</strong> oder eine <strong>Sozialberatungs-Stelle</strong>
              prüfen den Brief gerne mit dir — kostet nichts.
            </p>
          </section>

          <WiderspruchEntwurfBox
            vorgang={v}
            klientName={KLIENT_NAME}
            klientAnrede="Frau"
            klientAnschrift={"Pulmologie 3B\nGutleutstraße 88\n45128 Essen"}
            ortAusstellung="Essen"
          />
        </>
      )}
    </KlientShell>
  );
}
