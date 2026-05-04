import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Wordmark, Logo } from "@/components/Logo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Presse",
  description: "Shalem Care · Press kit, boilerplate, logos, key facts.",
};

export default async function PressePage() {
  const locale = await getLocale();
  const isEN = locale === "en";

  return (
    <div className="min-h-screen">
      <nav className="max-w-screen-app mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/willkommen"><Wordmark rainbow /></Link>
        <div className="flex items-center gap-2.5">
          <LocaleSwitcher current={locale} />
          <Link href="/willkommen" className="btn">{isEN ? "Home" : "Startseite"}</Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-10">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-6" />
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">{isEN ? "Press kit" : "Press Kit"}</p>
        <h1 className="font-display text-[42px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance mb-6">
          {isEN ? <>For <span className="rainbow-text">journalists</span> and partners.</> : <>Für <span className="rainbow-text">Redaktionen</span> und Partner.</>}
        </h1>
        <p className="text-[16px] text-mute max-w-2xl leading-relaxed">
          {isEN
            ? "Logos, boilerplate text, key facts and contact. Free to reuse under attribution."
            : "Logos, Boilerplate-Texte, Kennzahlen, Kontakt. Frei verwendbar unter Namensnennung."}
        </p>
      </section>

      {/* ─── Boilerplate ─────────────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 border-t border-app-soft">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">{isEN ? "Boilerplate" : "Boilerplate"}</p>
        <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight3 mb-4">
          {isEN ? "Short version" : "Kurzfassung"}
        </h2>
        <div className="surface rounded-2xl p-5 mb-3 max-w-3xl">
          <p className="text-[14px] leading-relaxed">
            {isEN
              ? "Shalem Care is an open social-care platform — for nursing, care, education, counseling, therapy and volunteering. Cooperatively owned by the people who do the work, FHIR-native, AGPLv3, with a 4 % platform cut instead of the 30–50 % of classic temp agencies. The first demo runs on shalem.de."
              : "Shalem Care ist eine offene soziale Plattform — für Pflege, Betreuung, Erziehung, Beratung, Therapie und ehrenamtliche Begleitung. Genossenschaftlich getragen von denen, die die Arbeit machen, FHIR-nativ, AGPLv3, mit 4 % Plattform-Cut statt 30–50 % bei klassischen Verleihern. Erste Demo läuft auf shalem.de."}
          </p>
        </div>

        <h3 className="font-display text-[18px] font-semibold tracking-tight3 mt-6 mb-3">
          {isEN ? "Long version" : "Langfassung"}
        </h3>
        <div className="surface rounded-2xl p-5 max-w-3xl space-y-3 text-[14px] leading-relaxed">
          {isEN ? (
            <>
              <p>
                Shalem Care builds the social-care infrastructure that the welfare state used to provide — but as a worker-owned cooperative, fully open source, with FHIR at its core. The platform covers four roles natively: care workers, clients, ward leads, and physicians/therapists.
              </p>
              <p>
                Care workers see their schedule, swap shifts via marketplace (with hours-of-work-act validation in the background), document MDK-compliant in the SIS structural model, manage medication including controlled substances, request prescriptions from their attending physician, report sick with auto-replacement at a bonus, and have a shift chat with an AI coach. Clients see who's coming, can book preferred carers, see their medication plan and request prescriptions themselves. Ward leads coordinate, approve, and read full revenue breakdowns by cost carrier (SGB XI/V/IX/VIII/XII, KiBiZ). Physicians have a practice dashboard for prescription requests with eRx-pipeline.
              </p>
              <p>
                What's special: a burnout radar with automatic compensation increase when no replacement can be found, a fully integrated home-remedies and Kneipp library cited from Cochrane and AWMF guidelines, and the philosophical basis of an open Care Handbook covering salutogenesis, mind-body medicine and epigenetics. The platform is provider-agnostic for AI (DeepSeek, Anthropic, Mistral, Aleph Alpha) and falls back to a deterministic mock without API keys.
              </p>
              <p>
                Cooperative model: one member, one vote. 4 % platform cut. What's left flows back to the pool. Care workers become co-owners — Mondragon model, Smart eG precedent.
              </p>
            </>
          ) : (
            <>
              <p>
                Shalem Care baut die soziale Infrastruktur, die früher der Sozialstaat selbst getragen hat — aber als Genossenschaft im Eigentum derer, die die Arbeit machen, vollständig Open Source und FHIR-nativ. Die Plattform unterstützt vier Rollen direkt: Pflegekräfte, Klient:innen, Stationsleitungen und Ärzt:innen / Therapeut:innen.
              </p>
              <p>
                Pflegekräfte sehen ihren Dienstplan, tauschen Schichten über einen Marktplatz mit ArbZG-Validierung im Hintergrund, dokumentieren MDK-prüffest nach Strukturmodell SIS, verwalten Medikation inkl. Betäubungsmittel, fragen Verordnungen beim Hausarzt an, melden sich krank mit Auto-Vertretung mit Bonus und nutzen einen Schicht-Chat mit KI-Coach. Klient:innen sehen wer kommt, buchen Wunschpflegekräfte, sehen ihren Medikamentenplan und stellen selbst Verordnungs-Anfragen. Stationsleitungen koordinieren, genehmigen und lesen die Erlös-Aufschlüsselung über alle Kostenträger (SGB XI/V/IX/VIII/XII, KiBiZ). Ärzt:innen haben ein Praxis-Dashboard für Verordnungs-Anfragen mit eRezept-Pipeline.
              </p>
              <p>
                Das Besondere: ein Burnout-Radar mit automatischer Vergütungs-Erhöhung wenn keine Vertretung gefunden wird, eine vollintegrierte Hausmittel- und Kneipp-Bibliothek mit Cochrane- und AWMF-Quellen, und das philosophische Fundament eines offenen Pflege-Handbuchs zu Salutogenese, Mind-Body-Medizin und Epigenetik. Die Plattform ist provider-agnostisch für KI (DeepSeek, Anthropic, Mistral, Aleph Alpha) und fällt ohne API-Key auf einen deterministischen Mock zurück.
              </p>
              <p>
                Genossenschaftsmodell: ein Mitglied, eine Stimme. 4 % Plattform-Cut. Was bleibt, fließt zurück in den Pool. Pflegekräfte werden Mit-Eigentümer — Mondragon-Modell, Smart eG als Präzedenz.
              </p>
            </>
          )}
        </div>
      </section>

      {/* ─── Key Facts ─────────────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 border-t border-app-soft">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">{isEN ? "Key facts" : "Kennzahlen"}</p>
        <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight3 mb-6">
          {isEN ? "Numbers worth quoting." : "Zahlen, die zitierbar sind."}
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Stat n="4 %" desc={isEN ? "platform cut — vs. 30–50 % at classic temp agencies" : "Plattform-Cut — vs. 30–50 % bei klassischen Honorar-Verleihern"} />
          <Stat n="33+" desc={isEN ? "routes / pages live in the demo" : "Routen / Seiten in der Demo live"} />
          <Stat n="35+" desc={isEN ? "billable modules across 10 cost carriers" : "abrechenbare Leistungs-Module über 10 Kostenträger"} />
          <Stat n="35+" desc={isEN ? "drugs in the catalog incl. BtM and PRISCUS markers" : "Medikamente im Katalog inkl. BtM- und PRISCUS-Markern"} />
          <Stat n="25+" desc={isEN ? "Kneipp & home-remedy applications" : "Kneipp- und Hausmittel-Anwendungen"} />
          <Stat n="9" desc={isEN ? "evidence-based therapy briefs with Cochrane/AWMF/DNQP sources" : "evidenzbasierte Therapie-Briefs mit Cochrane/AWMF/DNQP-Quellen"} />
          <Stat n="8" desc={isEN ? "social professions in scope" : "soziale Berufe abgedeckt"} />
          <Stat n="13" desc={isEN ? "chapters of the open Care Handbook" : "Kapitel des offenen Pflege-Handbuchs"} />
          <Stat n="2" desc={isEN ? "languages (DE/EN), more in Phase 3" : "Sprachen (DE/EN), weitere in Phase 3"} />
        </div>
      </section>

      {/* ─── Logos ─────────────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 border-t border-app-soft">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">{isEN ? "Logos & assets" : "Logos & Assets"}</p>
        <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight3 mb-6">
          {isEN ? "Free to use under attribution." : "Frei zur Verwendung unter Namensnennung."}
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <LogoCard src="/brand/01_logo_hero_1x1.png" alt="Shalem Care · Hero" />
          <LogoCard src="/brand/01b_logo_hero_alt_1x1.png" alt="Shalem Care · Alternative" />
          <LogoCard src="/brand/02_og_card_16x9.png" alt="Shalem Care · OG Card 16:9" widescreen />
        </div>
        <p className="text-[12px] text-soft mt-4">
          {isEN
            ? "Higher-resolution SVG and brand-book PDF on request."
            : "Höher aufgelöste SVG und Brand-Book-PDF auf Anfrage."}
        </p>
      </section>

      {/* ─── Kontakt ─────────────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 border-t border-app-soft">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">{isEN ? "Contact" : "Kontakt"}</p>
        <div className="surface rounded-2xl p-6 max-w-2xl">
          <h2 className="font-display text-[22px] font-semibold tracking-tight3">Dennis Reuter</h2>
          <p className="text-[13px] text-mute mt-1">{isEN ? "Founder & maintainer" : "Gründer & Maintainer"}</p>
          <div className="mt-4 space-y-1 text-[14px]">
            <p>📧 <a href="mailto:hello@shalem.de" className="hover:underline">hello@shalem.de</a></p>
            <p>🐙 <a href="https://github.com/dkorn85/shalem-care" className="hover:underline">github.com/dkorn85/shalem-care</a></p>
            <p>🌐 <a href="https://merkabaprojekt.de" className="hover:underline">merkabaprojekt.de</a></p>
          </div>
        </div>
      </section>

      <footer className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 border-t border-app-soft">
        <div className="rainbow-bar h-0.5 w-full rounded-full mb-6 opacity-60" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={20} className="accent-text" />
            <span className="text-[13px] text-mute">Shalem Care · 2026 · AGPLv3</span>
          </div>
          <div className="flex items-center gap-5 text-[13px] text-mute">
            <Link href="/willkommen" className="hover:text-[rgb(var(--fg))]">{isEN ? "Home" : "Startseite"}</Link>
            <Link href="/ueber-uns" className="hover:text-[rgb(var(--fg))]">{isEN ? "About" : "Über uns"}</Link>
            <Link href="/roadmap" className="hover:text-[rgb(var(--fg))]">Roadmap</Link>
            <Link href="/datenschutz" className="hover:text-[rgb(var(--fg))]">{isEN ? "Privacy" : "Datenschutz"}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, desc }: { n: string; desc: string }) {
  return (
    <div className="surface rounded-xl p-5">
      <div className="font-display text-[36px] font-bold tracking-tight3 leading-none rainbow-text">{n}</div>
      <div className="text-[13px] text-mute mt-2">{desc}</div>
    </div>
  );
}

function LogoCard({ src, alt, widescreen }: { src: string; alt: string; widescreen?: boolean }) {
  return (
    <a href={src} download className="surface-hover rounded-2xl p-4 block group">
      <div
        className={`rounded-xl overflow-hidden surface-mute relative ${widescreen ? "aspect-[16/9]" : "aspect-square"}`}
      >
        <Image src={src} alt={alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-contain p-2" />
      </div>
      <div className="text-[12px] mt-2 flex items-center justify-between">
        <span>{alt}</span>
        <span className="text-mute group-hover:text-[rgb(var(--fg))]">↓</span>
      </div>
    </a>
  );
}
