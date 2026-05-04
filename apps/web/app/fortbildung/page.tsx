import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { store } from "@/lib/swap-store";
import { getStationOfPerson, getStation } from "@/lib/hierarchy/store";
import {
  KATALOG,
  BERUF_LABEL,
  BERUF_FARBE,
  CREDIT_LABEL,
  FORMAT_LABEL,
  empfehlung,
  PFLICHTUMFANG,
} from "@/lib/fortbildung/katalog";
import type { Berufsgruppe } from "@/lib/fortbildung/katalog";
import {
  berechneFortschritt,
  listAbsolviertePerson,
  seedFortbildungOnce,
} from "@/lib/fortbildung/store";

export const metadata = {
  title: "Fortbildung",
  description:
    "Berufsgruppen-spezifische Fortbildungspakete · Pflicht-Module · CME, RbP, ZVK/IFK · Genossenschafts-Pool.",
};

type SearchParams = { rolle?: string };

export default async function FortbildungPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  seedOnce();
  const params = (await searchParams) ?? {};
  const aktuelleRolle: Berufsgruppe = (params.rolle as Berufsgruppe) ?? "pflege";
  seedFortbildungOnce(CURRENT_USER_ID, aktuelleRolle);

  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
  const stationId = getStationOfPerson(CURRENT_USER_ID);
  const station = stationId ? getStation(stationId) : null;

  const fortschritt = berechneFortschritt(CURRENT_USER_ID, aktuelleRolle);
  const absolvierte = listAbsolviertePerson(CURRENT_USER_ID);
  const empf = empfehlung({
    beruf: aktuelleRolle,
    jahresfortschrittStunden: fortschritt.stunden,
    bereitsAbsolviertModulIds: absolvierte.map((a) => a.modulId),
  });

  const farbe = BERUF_FARBE[aktuelleRolle];

  return (
    <AppShell
      role="nurse"
      user={{ id: nurse.id, name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <header className="mb-6">
        <Link href="/pflege" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Pflege-Cockpit
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Berufsbildung · Pflicht-Module · Genossenschafts-Akademie
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Fortbildung — <span style={{ color: `rgb(${farbe})` }}>{BERUF_LABEL[aktuelleRolle]}</span>
        </h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Wir bündeln Pflicht-Schulungen und Empfehlungen je Berufsgruppe — von BLS-Reanimation
          über Wundmanagement-ICW bis Bobath. Punkte fließen automatisch in deinen
          Jahres-Bilanz für Kammer, Berufsverband und Genossenschaft.
        </p>
      </header>

      {/* Berufs-Tabs */}
      <nav className="flex flex-wrap gap-1.5 mb-6">
        {(Object.keys(BERUF_LABEL) as Berufsgruppe[]).map((b) => {
          const active = b === aktuelleRolle;
          return (
            <Link
              key={b}
              href={`/fortbildung?rolle=${b}`}
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

      {/* Jahres-Cockpit */}
      <section className="surface rounded-2xl p-5 sm:p-6 mb-6">
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Jahres-Bilanz {fortschritt.jahr}</p>
            <h2 className="font-display text-[20px] font-bold tracking-tight2">Dein Fortschritt</h2>
          </div>
          {fortschritt.sollProJahr && fortschritt.einheit && (
            <div className="text-right">
              <div className="text-[11px] text-soft uppercase tracking-wider">{CREDIT_LABEL[fortschritt.einheit]}</div>
              <div className="font-display font-bold text-[24px] leading-none" style={{ color: `rgb(${farbe})` }}>
                {fortschritt.einheit === "cme"             ? fortschritt.cme :
                 fortschritt.einheit === "rbp"             ? fortschritt.rbp :
                 fortschritt.einheit === "zvk_ifk_punkte"  ? fortschritt.zvk :
                 fortschritt.einheit === "fortbildungstage" ? fortschritt.fortbildungstage :
                                                              fortschritt.stunden}
                <span className="text-[14px] text-mute font-normal"> / {fortschritt.sollProJahr}</span>
              </div>
            </div>
          )}
        </header>

        {fortschritt.quote !== null && (
          <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: "rgb(var(--bg-mute))" }}>
            <div
              className="h-full transition-[width] duration-700"
              style={{ width: `${Math.round(fortschritt.quote * 100)}%`, background: `rgb(${farbe})` }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[12px]">
          <KPI label="Stunden" value={fortschritt.stunden} />
          <KPI label="CME" value={fortschritt.cme} />
          <KPI label="RbP" value={fortschritt.rbp} />
          <KPI label="ZVK/IFK" value={fortschritt.zvk} />
          <KPI label="F-Tage" value={fortschritt.fortbildungstage} />
        </div>

        {(() => {
          const pflicht = PFLICHTUMFANG.find((p) => p.beruf === aktuelleRolle);
          return pflicht ? (
            <p className="text-[11px] text-soft mt-3 italic">
              Rechtsgrundlage: {pflicht.norm} {pflicht.zwingend ? "· verbindlich" : "· Empfehlung"}.
            </p>
          ) : null;
        })()}
      </section>

      {/* Pflichtmodule offen */}
      {empf.pflichtoffen.length > 0 && (
        <section className="mb-8">
          <header className="mb-3 flex items-baseline gap-2">
            <h2 className="font-display text-[18px] font-bold tracking-tight2">Pflicht — noch offen</h2>
            <span className="chip text-[11px]" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>
              {empf.pflichtoffen.length}
            </span>
          </header>
          <ul className="grid sm:grid-cols-2 gap-3">
            {empf.pflichtoffen.map((m) => (
              <ModulCard key={m.id} m={m} farbe={farbe} pflicht />
            ))}
          </ul>
        </section>
      )}

      {/* Empfehlungen */}
      {empf.vorschlaege.length > 0 && (
        <section className="mb-8">
          <header className="mb-3">
            <h2 className="font-display text-[18px] font-bold tracking-tight2">Empfehlungen für dich</h2>
            <p className="text-[12px] text-soft mt-0.5">Sortiert nach Passung — Format, Themen, freie Stunden im Jahr.</p>
          </header>
          <ul className="grid sm:grid-cols-2 gap-3">
            {empf.vorschlaege.map((m) => (
              <ModulCard key={m.id} m={m} farbe={farbe} />
            ))}
          </ul>
        </section>
      )}

      {/* Vollständiger Katalog */}
      <section>
        <header className="mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Vollständiger Katalog · {BERUF_LABEL[aktuelleRolle]}</h2>
          <p className="text-[12px] text-soft mt-0.5">{KATALOG.filter((m) => m.zielgruppen.includes(aktuelleRolle)).length} Module</p>
        </header>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KATALOG.filter((m) => m.zielgruppen.includes(aktuelleRolle)).map((m) => (
            <ModulCard key={m.id} m={m} farbe={farbe} compact />
          ))}
        </ul>
      </section>

      {/* Erweiterungen / Roadmap */}
      <section className="mt-12 surface rounded-2xl p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · geplante Erweiterungen</p>
        <h3 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">
          Was noch in den Lernpfad einfließt
        </h3>
        <ul className="space-y-2 text-[13px]">
          <li className="flex gap-3 items-baseline">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: `rgb(${farbe})` }} />
            <span><strong>BildungsCheck-NRW + Bildungsprämie</strong> automatisch beantragen — bis 500 € pro Person/Jahr förderfähig.</span>
          </li>
          <li className="flex gap-3 items-baseline">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: `rgb(${farbe})` }} />
            <span><strong>Aufstiegs-BAföG</strong> für Fachweiterbildung (z.B. Fachpfleger:in Anästhesie/Intensiv) — Antrag direkt aus dem Cockpit.</span>
          </li>
          <li className="flex gap-3 items-baseline">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: `rgb(${farbe})` }} />
            <span><strong>Qualifizierungschancengesetz (§ 82 SGB III)</strong> — BA-geförderte Umschulung & Anpassung.</span>
          </li>
          <li className="flex gap-3 items-baseline">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: `rgb(${farbe})` }} />
            <span><strong>Registrierung beruflich Pflegender (RbP)</strong> — automatischer Punkte-Übertrag für 2-Jahres-Zyklus.</span>
          </li>
          <li className="flex gap-3 items-baseline">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: `rgb(${farbe})` }} />
            <span><strong>BÄK-CME-Konto</strong> — direkte Übermittlung Arzt-Punkte via EFN.</span>
          </li>
          <li className="flex gap-3 items-baseline">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: `rgb(${farbe})` }} />
            <span><strong>Peer-Learning-Pool</strong> — Genossenschaftsmitglieder bieten Hospitationen + Mikro-Module gegenseitig an, Verrechnung über Plattform-Punkte.</span>
          </li>
        </ul>
      </section>
    </AppShell>
  );
}

function KPI({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-mute rounded-lg p-2.5">
      <div className="text-soft text-[10px] uppercase tracking-wider">{label}</div>
      <div className="font-display font-bold text-[18px] mt-0.5 leading-none">{value}</div>
    </div>
  );
}

function ModulCard({ m, farbe, pflicht, compact }: { m: typeof KATALOG[number]; farbe: string; pflicht?: boolean; compact?: boolean }) {
  return (
    <li
      className="surface-hover rounded-xl p-4 relative overflow-hidden"
      style={{
        borderColor: pflicht ? `rgb(${farbe} / 0.4)` : undefined,
        background: pflicht ? `linear-gradient(135deg, rgb(${farbe} / 0.05), transparent)` : undefined,
      }}
    >
      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5">
        <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
          <h3 className="font-display text-[14px] font-semibold tracking-tight2 leading-snug">
            {m.kurztitel ?? m.titel}
          </h3>
          {m.pflicht && (
            <span className="chip text-[10px]" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>
              Pflicht
            </span>
          )}
          {m.zertifiziert && (
            <span className="chip text-[10px]" style={{ background: "rgb(var(--thu) / 0.15)", color: "rgb(var(--thu))" }}>
              Zert.
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-mute mb-2">
          <span>{FORMAT_LABEL[m.format]}</span>
          <span>·</span>
          <span className="font-mono">{m.dauerStunden} h</span>
          {m.preisEuro !== undefined && m.preisEuro > 0 && (
            <>
              <span>·</span>
              <span className="font-mono">{m.preisEuro.toLocaleString("de-DE")} €</span>
            </>
          )}
        </div>

        {!compact && (
          <p className="text-[12px] text-mute leading-relaxed mb-2">
            {m.lernziele.slice(0, 2).join(" · ")}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-2">
          {m.credits.map((c, i) => (
            <span
              key={i}
              className="chip text-[10px] font-mono"
              style={{ background: `rgb(${farbe} / 0.12)`, color: `rgb(${farbe})` }}
            >
              {c.punkte} {CREDIT_LABEL[c.einheit]}
            </span>
          ))}
        </div>

        <p className="text-[11px] text-soft truncate">{m.anbieter}</p>
      </div>
    </li>
  );
}
