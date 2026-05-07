import Link from "next/link";
import Image from "next/image";
import { Wordmark } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import {
  GWOE_THEMEN,
  WERT_LABEL,
  GRUPPE_LABEL,
  type Beruehrungsgruppe,
  type GemeinwohlWert,
} from "@/lib/gemeinwohl/matrix";

// Glyphen pro Wert + Berührungsgruppe (aus Grid 3 erzeugt)
const WERT_GLYPH: Record<GemeinwohlWert, string> = {
  menschenwuerde: "/icons/gwoe-menschenwuerde.png",
  solidaritaet: "/icons/gwoe-solidaritaet.png",
  nachhaltigkeit: "/icons/gwoe-nachhaltigkeit.png",
  transparenz: "/icons/gwoe-transparenz.png",
  mitbestimmung: "/icons/gwoe-mitbestimmung.png",
};

const GRUPPE_GLYPH: Partial<Record<Beruehrungsgruppe, string>> = {
  lieferanten: "/icons/gwoe-grp-lieferanten.png",
  eigentuemer: "/icons/gwoe-grp-eigentuemer.png",
  mitarbeitende: "/icons/gwoe-grp-mitarbeitende.png",
  kunden: "/icons/gwoe-grp-kunden.png",
};

export const metadata = {
  title: "Gemeinwohl-Indikator · so wählen wir Lieferanten",
  description:
    "20 Themen × 5 Werte = 1000 Punkte. Wer hoch punktet, kommt zuerst zum Zug. So funktioniert die Gemeinwohl-Auswahl bei Shalem Care.",
};

const GRUPPEN: Beruehrungsgruppe[] = [
  "lieferanten",
  "eigentuemer",
  "mitarbeitende",
  "kunden",
  "gesellschaft",
];

const GRUPPE_FARBE: Record<Beruehrungsgruppe, string> = {
  lieferanten: "var(--mon)",
  eigentuemer: "var(--vibe-stats)",
  mitarbeitende: "var(--vibe-team)",
  kunden: "var(--sun)",
  gesellschaft: "var(--sat)",
};

const STUFEN = [
  { ab: 750, label: "Vorbild", farbe: "var(--vibe-approval)", desc: "Externe Vollaudit-Bilanz, Mitarbeiter-Mit-Eigentum, CO₂-Reduktionspfad gelebt." },
  { ab: 500, label: "Gemeinwohl-stark", farbe: "var(--sat)", desc: "Solide Praxis in allen Wert-Dimensionen, einzelne Themen sind Vorzeige-Beispiele." },
  { ab: 300, label: "Auf dem Weg", farbe: "var(--sun)", desc: "Selbstauskunft mit erkennbarem Bemühen, aber noch klare Lücken — Aufnahme nur mit Verbesserungs-Plan." },
  { ab: 0,   label: "Nachholbedarf", farbe: "var(--vibe-stats)", desc: "Klassisches gewinnmaximierendes Modell. Werden nicht aufgenommen, oder zeitlich begrenzt unter Auflagen." },
];

export default function GemeinwohlPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/lieferanten" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Lieferanten-Pool
          </Link>
          <Link href="/expertenstandards" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Expertenstandards
          </Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-10 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Gemeinwohl-Indikator · GWÖ-Matrix 5.0 adaptiert
        </p>
        <h1
          className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp"
          style={{ animationDelay: "0.05s" }}
        >
          Wer den höchsten <span className="rainbow-text">Score</span> hat, kommt zuerst.
        </h1>
        <p
          className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp"
          style={{ animationDelay: "0.1s" }}
        >
          Shalem priorisiert Lieferanten und Partner nach 20 Themen aus der
          Gemeinwohl-Ökonomie. Maximalpunktzahl 1000. Vorbild ab 750.
          Träger im Pool sehen den Score und wählen automatisch oben.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="surface rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Woher das Modell kommt
          </p>
          <p className="text-[14px] text-mute leading-relaxed">
            Die Gemeinwohl-Ökonomie (GWÖ) wurde 2010 von Christian Felber begründet.
            Über 1.000 Unternehmen weltweit haben eine GWÖ-Bilanz erstellt. Wir nutzen
            eine vereinfachte 20-Themen-Variante (klassisch sind es 60 Indikatoren in
            der Matrix 5.0) — präzise genug für Vergleich, schlank genug für
            mittelständische Pflege-Lieferanten.
          </p>
          <p className="text-[14px] text-mute leading-relaxed mt-3">
            Mehr unter{" "}
            <a
              href="https://web.ecogood.org/de/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              ecogood.org
            </a>
            . Voll-Audits werden von akkreditierten Auditor:innen durchgeführt; bei
            uns reicht für Aufnahme zunächst Selbstauskunft + Peer-Review.
          </p>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Stufen der Bewertung
          </p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2">
            4 Stufen · 1000 Punkte gesamt
          </h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {STUFEN.map((s) => (
            <div
              key={s.label}
              className="surface rounded-2xl p-5"
              style={{ borderTop: `3px solid rgb(${s.farbe})` }}
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-soft">
                ab {s.ab} Pkt
              </p>
              <h3
                className="font-display text-[18px] font-bold tracking-tight2 mt-1.5 mb-2"
                style={{ color: `rgb(${s.farbe})` }}
              >
                {s.label}
              </h3>
              <p className="text-[12px] text-mute leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Die 20 Themen
          </p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2">
            5 Wertedimensionen × 4 Berührungsgruppen
          </h2>
          <p className="text-[14px] text-mute max-w-2xl mx-auto mt-3">
            Jedes Thema bringt maximal 50 Punkte. Selbstauskunft, Peer-Review oder
            Voll-Audit als Quelle. Audit erhöht Vertrauens-Faktor.
          </p>
        </header>
        <div className="space-y-10 max-w-4xl mx-auto">
          {GRUPPEN.map((g) => {
            const themen = GWOE_THEMEN.filter((t) => t.gruppe === g);
            const farbe = GRUPPE_FARBE[g];
            return (
              <section key={g}>
                <header className="mb-4 flex items-center gap-3">
                  {GRUPPE_GLYPH[g] && (
                    <div className="relative w-12 h-12 shrink-0">
                      <Image
                        src={GRUPPE_GLYPH[g]!}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <p
                      className="font-mono text-[10px] uppercase tracking-wider mb-1"
                      style={{ color: `rgb(${farbe})` }}
                    >
                      Berührungsgruppe
                    </p>
                    <h3 className="font-display text-[22px] font-bold tracking-tight2">
                      {GRUPPE_LABEL[g]}
                    </h3>
                  </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {themen.map((t) => (
                    <article
                      key={t.id}
                      className="surface rounded-2xl p-4 relative overflow-hidden flex gap-3"
                      style={{ borderLeft: `3px solid rgb(${farbe})` }}
                    >
                      <div className="relative w-10 h-10 shrink-0 mt-0.5">
                        <Image
                          src={WERT_GLYPH[t.wert]}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span
                          className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            background: `rgb(${farbe} / 0.15)`,
                            color: `rgb(${farbe})`,
                          }}
                        >
                          {t.id}
                        </span>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-soft">
                          {WERT_LABEL[t.wert]}
                        </p>
                      </div>
                      <h4 className="font-display text-[14px] font-bold tracking-tight2 leading-snug">
                        {t.titel}
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {t.kriterien.map((k, i) => (
                          <li
                            key={i}
                            className="text-[12px] text-mute leading-relaxed flex items-start gap-1.5"
                          >
                            <span aria-hidden className="text-soft shrink-0">·</span>
                            <span>{k}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-soft font-mono mt-2.5">
                        max {t.maxPunkte} Pkt
                      </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="surface rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Was Shalem mit dem Score macht
          </p>
          <h3 className="font-display text-[20px] font-bold tracking-tight2 mb-4">
            Konkrete Auswirkung
          </h3>
          <ul className="space-y-2.5">
            {[
              "Der Score steht in jedem Lieferanten-Profil sichtbar — Pflege-Team und Träger sehen ihn.",
              "Anbieter mit Score ≥ 750 erscheinen automatisch als Vorzugs-Anbieter, wenn Träger einen neuen Vertrag vergibt.",
              "Vorzugs-Anbieter zahlen 1-1.5 % Solidar-Cut auf Monatsvolumen, der direkt in den Genossenschafts-Topf fließt — Mitglieds-Ausschüttung.",
              "Anbieter mit Score < 300 werden nach 6 Monaten Auflagen ausgelistet, wenn keine Verbesserung dokumentiert.",
              "Pflegekräfte können ein Anbieter-Veto einlegen, wenn der Alltag nicht zur Selbstauskunft passt — Score wird gesenkt.",
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span aria-hidden className="text-[16px] accent-text">→</span>
                <span className="text-[13px] text-mute leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 mt-6">
            <Link href="/lieferanten" className="btn btn-primary text-[14px] px-4 py-2">
              Lieferanten-Pool ansehen
            </Link>
            <Link href="/kontakt" className="btn btn-ghost text-[14px] px-4 py-2">
              Anbieter werden
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
