import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { KlientShell } from "@/components/KlientShell";
import { AnamneseFormular } from "@/components/AnamneseFormular";
import { seedOnce } from "@/lib/seed";
import { getKlient } from "@/lib/hierarchy/store";
import { ALLE_SCHEMAS, schemaFuerBeruf } from "@/lib/anamnese/schemas";
import type { Schema } from "@/lib/anamnese/schemas";
import { BERUF_LABEL, BERUF_FARBE } from "@/lib/fortbildung/katalog";

const KLIENT_ID = "klient-hr";

type SearchParams = { beruf?: Schema["beruf"] };

const HEADER_BY_BERUF: Record<Schema["beruf"], string> = {
  pflege:         "/anamnese/header-pflege.png",
  arzt:           "/anamnese/header-arzt.png",
  therapie:       "/anamnese/header-therapie.png",
  sozialarbeit:   "/anamnese/header-sozial.png",
  erziehung:      "/anamnese/header-erziehung.png",
  heilerziehung:  "/anamnese/header-heilerz.png",
  hauswirtschaft: "/anamnese/header-hauswirt.png",
  ehrenamt:       "/anamnese/header-ehrenamt.png",
};

export const metadata = {
  title: "Anamnese · Meine Akte",
  description: "Berufsspezifische Anamnese-Bögen — Pflege, Arzt, Therapie, Soziales, Heilerziehung u.a.",
};

export default async function AnamnesePage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  seedOnce();
  const params = (await searchParams) ?? {};
  const beruf: Schema["beruf"] = params.beruf ?? "pflege";

  const klient = getKlient(KLIENT_ID);
  if (!klient) notFound();

  const schema = schemaFuerBeruf(beruf);
  const headerImage = HEADER_BY_BERUF[beruf];

  return (
    <KlientShell user={{ name: klient.name, initials: klient.initials, relation: "self", klientId: klient.id }}>
      <header className="mb-6">
        <Link href="/klient/akte" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Zurück zur Akte
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Assessment + Anamnese · pro Berufsgruppe
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Wer dich begleitet, sieht <span className="rainbow-text">seinen eigenen Bogen</span>.
        </h1>
        <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
          Jede Berufsgruppe arbeitet mit einem fachlich fundierten Anamnese-Schema —
          von SIS für die Pflege über ICF/Heilmittel für die Therapie bis zu BTHG-Teilhabe
          in der Heilerziehung. Du kannst die Bögen auch selbst einsehen.
        </p>
      </header>

      {/* Berufs-Tabs */}
      <nav className="flex flex-wrap gap-1.5 mb-6">
        {(Object.keys(ALLE_SCHEMAS) as Schema["beruf"][]).map((b) => {
          const active = b === beruf;
          return (
            <Link
              key={b}
              href={`/klient/akte/anamnese?beruf=${b}`}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
              style={{
                background: active ? `rgb(${BERUF_FARBE[b]} / 0.15)` : "rgb(var(--bg-mute))",
                color: active ? `rgb(${BERUF_FARBE[b]})` : "rgb(var(--fg-mute))",
                border: active ? `1px solid rgb(${BERUF_FARBE[b]} / 0.3)` : "1px solid transparent",
              }}
            >
              {BERUF_LABEL[b]}
            </Link>
          );
        })}
      </nav>

      {headerImage && (
        <div className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden mb-5 surface">
          <Image
            src={headerImage}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--bg-elev)/0.85)] via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center px-5">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono">{schema.id}</p>
              <p className="font-display text-[16px] font-semibold mt-1" style={{ color: `rgb(${BERUF_FARBE[beruf]})` }}>
                {BERUF_LABEL[beruf]}
              </p>
            </div>
          </div>
        </div>
      )}

      <AnamneseFormular schema={schema} klientName={klient.name} />

      <p className="text-[11px] text-soft mt-6 leading-relaxed max-w-prose">
        Phase 1: lokales Speichern im Browser. Phase 2: Migration auf FHIR Questionnaire +
        QuestionnaireResponse, mit Verschlüsselung pro Akte und Sichtbarkeitsregel pro Berufsrolle.
      </p>
    </KlientShell>
  );
}
