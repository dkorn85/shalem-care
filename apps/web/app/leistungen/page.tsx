import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import {
  LEISTUNGEN,
  ZUSATZLEISTUNGEN,
  PG_KURZ,
  PG_FARBE,
  STAND_STEMPEL,
  eur,
} from "@/lib/pflegegrad/leistungen";
import type { Pflegegrad } from "@/lib/pflegegrad/leistungen";

export const metadata = {
  title: "Pflegekassen-Leistungen · was steht dir zu?",
  description:
    "Übersicht über alle Leistungen der gesetzlichen Pflegeversicherung nach SGB XI — Pflegegeld, Sachleistung, Tagespflege, Verhinderungspflege, Entlastungsbetrag. Stand 2025.",
};

const PG_REIHE: Pflegegrad[] = [1, 2, 3, 4, 5];

type SearchParams = { pg?: string };

export default async function LeistungenPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const pgParam = Number(params.pg);
  const pg: Pflegegrad = (PG_REIHE.includes(pgParam as Pflegegrad) ? pgParam : 2) as Pflegegrad;
  const paket = LEISTUNGEN[pg];
  const farbe = PG_FARBE[pg];

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <Link href="/anmelden" className="btn btn-ghost text-[13px] px-3 py-1.5">
          Anmelden
        </Link>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-10 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Pflegekassen-Leistungen · SGB XI
        </p>
        <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Was steht dir <span className="rainbow-text">eigentlich</span> zu?
        </h1>
        <p className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Wähle einen Pflegegrad und sieh alle Leistungen, die dir oder deinem
          Angehörigen monatlich zustehen — ohne Amtsdeutsch.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-8">
        <div className="surface rounded-2xl p-3 sm:p-4">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium px-2">
            Pflegegrad wählen
          </p>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {PG_REIHE.map((p) => {
              const aktiv = p === pg;
              return (
                <Link
                  key={p}
                  href={`/leistungen?pg=${p}`}
                  scroll={false}
                  className="relative rounded-xl py-3 sm:py-4 text-center transition"
                  style={{
                    background: aktiv ? `rgb(${PG_FARBE[p]} / 0.15)` : "transparent",
                    border: aktiv
                      ? `1.5px solid rgb(${PG_FARBE[p]})`
                      : "1.5px solid rgb(var(--border-soft))",
                  }}
                  aria-current={aktiv ? "true" : undefined}
                >
                  <div
                    className="font-display font-bold text-[20px] sm:text-[24px] leading-none"
                    style={{ color: aktiv ? `rgb(${PG_FARBE[p]})` : "rgb(var(--fg-mute))" }}
                  >
                    PG {p}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-soft mt-1 leading-tight px-1">
                    {PG_KURZ[p]}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <LeistungsKachel
            kategorie="§ 37 SGB XI"
            label="Pflegegeld"
            betrag={paket.pflegegeld}
            einheit="pro Monat"
            beschreibung="Wenn Angehörige zu Hause pflegen — frei verfügbar."
            farbe={farbe}
            verfuegbar={paket.pflegegeld > 0}
          />
          <LeistungsKachel
            kategorie="§ 36 SGB XI"
            label="Pflegesachleistung"
            betrag={paket.sachleistung}
            einheit="pro Monat"
            beschreibung="Wenn ein ambulanter Dienst pflegt — direkt mit der Kasse abgerechnet."
            farbe={farbe}
            verfuegbar={paket.sachleistung > 0}
          />
          <LeistungsKachel
            kategorie="§ 41 SGB XI"
            label="Tages- / Nachtpflege"
            betrag={paket.tagespflege}
            einheit="pro Monat"
            beschreibung="Teilstationäre Pflege — entlastet pflegende Angehörige."
            farbe={farbe}
            verfuegbar={paket.tagespflege > 0}
          />
          <LeistungsKachel
            kategorie="§ 43 SGB XI"
            label="Vollstationär"
            betrag={paket.vollstationaer}
            einheit="pro Monat"
            beschreibung="Wenn Pflege im Heim stattfindet — Eigenanteil bleibt."
            farbe={farbe}
            verfuegbar={paket.vollstationaer > 0}
          />
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-10">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
          Zusätzlich · für alle Pflegegrade (oder ab PG 2)
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <ZusatzKachel
            kategorie="§ 45b · alle PG · monatlich"
            label="Entlastungsbetrag"
            betrag={eur(ZUSATZLEISTUNGEN.entlastungsbetrag)}
            beschreibung="Frei für Haushaltshilfe, Betreuung, Begleitung. Ansparbar bis Halbjahresende."
          />
          <ZusatzKachel
            kategorie="§ 39 · ab PG 2 · jährlich"
            label="Verhinderungspflege"
            betrag={eur(ZUSATZLEISTUNGEN.verhinderungspflege)}
            beschreibung="Wenn die Hauptpflegeperson pausiert — Ersatz wird bezahlt."
          />
          <ZusatzKachel
            kategorie="§ 42 · ab PG 2 · jährlich"
            label="Kurzzeitpflege"
            betrag={eur(ZUSATZLEISTUNGEN.kurzzeitpflege)}
            beschreibung="Übergangsweise stationäre Pflege — z.B. nach Klinik-Aufenthalt."
          />
          <ZusatzKachel
            kategorie="§ 40 · alle PG · monatlich"
            label="Pflegehilfsmittel"
            betrag={eur(ZUSATZLEISTUNGEN.hilfsmittel)}
            beschreibung="Verbrauchsmaterial wie Handschuhe, Bettschutz, Desinfektion."
          />
          <ZusatzKachel
            kategorie="§ 40 · alle PG · einmalig"
            label="Wohnumfeld-Verbesserung"
            betrag={`bis ${eur(ZUSATZLEISTUNGEN.wohnumfeld)}`}
            beschreibung="Bad-Umbau, Treppenlift, Türverbreiterung — pro Maßnahme."
          />
          <ZusatzKachel
            kategorie="§ 38a · ab PG 2 · monatlich"
            label="Wohngruppenzuschlag"
            betrag={eur(ZUSATZLEISTUNGEN.wohngruppe)}
            beschreibung="Wenn du in einer ambulant betreuten WG lebst."
          />
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="surface rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            So setzt du das mit Shalem ein
          </p>
          <h3 className="font-display text-[22px] sm:text-[26px] font-bold tracking-tight2 mb-3">
            Vom <span className="rainbow-text">Anspruch</span> zur tatsächlichen Pflege.
          </h3>
          <p className="text-[14px] text-mute leading-relaxed mb-5">
            Du musst kein Verleih-Honorar zahlen, um deine Sachleistung zu nutzen.
            Über die Genossenschaft buchst du die Pflegekraft direkt — Marktpreise
            transparent, 84 % gehen an die Pflegekraft, 4 % an den Plattform-Pool.
            So reicht dein Budget weiter.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/pflegegrad-check" className="btn btn-primary text-[14px] px-4 py-2">
              Pflegegrad schätzen
            </Link>
            <Link href="/klient/buchen" className="btn btn-ghost text-[14px] px-4 py-2">
              Direkt buchen anschauen
            </Link>
            <Link href="/klient/anfrage" className="btn btn-ghost text-[14px] px-4 py-2">
              Erstanfrage stellen
            </Link>
            <Link href="/genossenschaft" className="btn btn-ghost text-[14px] px-4 py-2">
              Wie die Genossenschaft funktioniert
            </Link>
            <Link href="/kontakt" className="btn btn-ghost text-[14px] px-4 py-2">
              Beratungstermin
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-8">
        <div className="rounded-2xl p-5 text-[12px] text-mute leading-relaxed" style={{ background: "rgb(var(--bg-mute))" }}>
          <strong className="font-medium text-[rgb(var(--fg))]">Hinweis:</strong>{" "}
          Beträge nach SGB XI · {STAND_STEMPEL}. Die Übersicht ersetzt keine
          individuelle Beratung — Eigenanteile, Kombinationsleistungen
          (Pflegegeld + Sachleistung), Steuerberücksichtigung und Sondersituationen
          (z.B. Härtefallregelung in PG 5) hängen vom Einzelfall ab. Quellen:{" "}
          <a href="https://www.gesetze-im-internet.de/sgb_11/" className="underline">
            SGB XI · gesetze-im-internet.de
          </a>{" "}
          ·{" "}
          <a href="https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege.html" className="underline">
            BMG Online-Ratgeber Pflege
          </a>.
        </div>
      </section>

      <footer className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-8">
        <div className="rainbow-bar h-0.5 w-full rounded-full opacity-60" />
        <p className="text-[12px] text-soft mt-4 font-mono text-center">
          Shalem Care · 2026 · AGPLv3
        </p>
      </footer>
    </main>
  );
}

function LeistungsKachel({
  kategorie,
  label,
  betrag,
  einheit,
  beschreibung,
  farbe,
  verfuegbar,
}: {
  kategorie: string;
  label: string;
  betrag: number;
  einheit: string;
  beschreibung: string;
  farbe: string;
  verfuegbar: boolean;
}) {
  return (
    <article
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: verfuegbar ? `rgb(${farbe} / 0.08)` : "rgb(var(--bg-mute))",
        opacity: verfuegbar ? 1 : 0.55,
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
        style={{ background: `rgb(${farbe})` }}
      />
      <div className="ml-2.5">
        <p className="font-mono text-[10px] text-soft mb-1.5">{kategorie}</p>
        <h3 className="font-display text-[15px] font-semibold tracking-tight2 mb-2">
          {label}
        </h3>
        {verfuegbar ? (
          <>
            <div className="font-display font-bold text-[28px] leading-tight" style={{ color: `rgb(${farbe})` }}>
              {eur(betrag)}
            </div>
            <p className="text-[11px] text-soft font-mono mb-3">{einheit}</p>
          </>
        ) : (
          <p className="text-[13px] font-medium text-mute mb-3">In diesem Pflegegrad nicht vorgesehen.</p>
        )}
        <p className="text-[12px] text-mute leading-relaxed">{beschreibung}</p>
      </div>
    </article>
  );
}

function ZusatzKachel({
  kategorie,
  label,
  betrag,
  beschreibung,
}: {
  kategorie: string;
  label: string;
  betrag: string;
  beschreibung: string;
}) {
  return (
    <article className="surface-hover rounded-xl p-4">
      <p className="font-mono text-[10px] text-soft mb-1">{kategorie}</p>
      <h4 className="font-display text-[14px] font-semibold tracking-tight2">{label}</h4>
      <div className="font-display font-bold text-[18px] leading-tight mt-1.5" style={{ color: "rgb(var(--accent))" }}>
        {betrag}
      </div>
      <p className="text-[11px] text-mute leading-relaxed mt-2">{beschreibung}</p>
    </article>
  );
}
