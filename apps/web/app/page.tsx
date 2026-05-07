import Link from "next/link";
import Image from "next/image";
import { Wordmark } from "@/components/Logo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { RolePortal } from "@/components/RolePortal";
import { OnboardingTour } from "@/components/OnboardingTour";
import { SiteFooter } from "@/components/SiteFooter";
import {
  HANDBUCH_KAPITEL,
  WANDEL_TABELLE,
  KNEIPP_SAEULEN,
} from "@/lib/heilkunst/philosophie";
import {
  HAUSMITTEL,
  AETHERISCHE_OELE,
  ANWENDUNGSTYP_LABEL,
  ANWENDUNGSTYP_FARBE,
} from "@/lib/heilkunst/hausmittel";
import type { Anwendungstyp } from "@/lib/heilkunst/hausmittel";
import { getLocale, getT } from "@/lib/i18n/server";
import { SmoothReveal } from "@/components/SmoothReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { AccentCard } from "@/components/AccentCard";
import { MediaSplit } from "@/components/MediaSplit";
import { BulletList } from "@/components/BulletList";
import { RainbowText } from "@/components/Rainbow";
import { lieferantenKpis } from "@/lib/lieferanten/store";
import { STANDARDS } from "@/lib/expertenstandards/dnqp";

const PROFESSIONS = [
  { src: "/portraits/10_1_portrait_pflege_1x1.png",   label: "Pflege",         color: "var(--mon)" },
  { src: "/portraits/10_2_portrait_sozial_1x1.png",   label: "Sozialarbeit",   color: "var(--tue)" },
  { src: "/portraits/10_3_portrait_erzieh_1x1.png",   label: "Erziehung",      color: "var(--wed)" },
  { src: "/portraits/10_4_portrait_beratung_1x1.png", label: "Beratung",       color: "var(--thu)" },
  { src: "/portraits/10_5_portrait_ergo_1x1.png",     label: "Therapie",       color: "var(--fri)" },
  { src: "/portraits/10_6_portrait_heiler_1x1.png",   label: "Heilerziehung",  color: "var(--sat)" },
  { src: "/portraits/10_7_portrait_hauswirt_1x1.png", label: "Hauswirtschaft", color: "var(--sun)" },
  { src: "/portraits/10_8_portrait_ehrenamt_1x1.png", label: "Ehrenamt",       color: "var(--mon)" },
];

const PILLARS = [
  { title: "Dienstplan & Tausch",       body: "Wochenplan, Schichttausch-Marktplatz, Genehmigung — mit ArbZG-Validierung im Hintergrund.", color: "var(--vibe-plan)" },
  { title: "Klientenakte (Phase 3)",    body: "Pflegedoku im FHIR-Standard. Wundbeobachtung, Pflegeplan, Maßnahmen — interoperabel mit der ePA.", color: "var(--vibe-team)" },
  { title: "Genossenschafts-Pool",      body: "Was an Verwaltungskosten gespart wird, fließt zurück. Pflege als Gemeingut, nicht Renditeobjekt.", color: "var(--vibe-stats)" },
];

const TEASER_KARTEN = [
  {
    href: "/expertenstandards",
    eyebrow: "DNQP · 11 Standards",
    titel: "Auslieferungs-Niveau ab Tag 1",
    body: "Braden, NRS, MNA, Tinetti — alle MD-Audit-relevanten Skalen mit Berechnung + Empfehlung.",
    farbe: "var(--accent)",
    cta: "Standards öffnen",
  },
  {
    href: "/gemeinwohl",
    eyebrow: "GWÖ · 1000 Punkte",
    titel: "Gemeinwohl statt billigster Preis",
    body: "20 Themen × 5 Werte. Vorbild ab 750. Vorzugs-Anbieter zahlen 1.5 % Solidar-Cut zurück.",
    farbe: "var(--sat)",
    cta: "Indikator verstehen",
  },
  {
    href: "/lieferanten",
    eyebrow: "Pool · 7 Anbieter",
    titel: "Hausmeister, Reinigung, Recycling, Lebensmittel",
    body: "4 Lieferanten-Branchen sortiert nach Score. Genossenschaften zuerst, Konzerne nach Audit-Eignung.",
    farbe: "var(--sun)",
    cta: "Pool ansehen",
  },
  {
    href: "/netz/berufe",
    eyebrow: "Netz · 13 Rollen",
    titel: "Pflege ist Mannschafts-Sport",
    body: "Wer arbeitet wann mit wem? Standards × Berufe × Lieferanten in einer Matrix.",
    farbe: "var(--vibe-team)",
    cta: "Netz öffnen",
  },
];

export default async function LandingPage() {
  const locale = await getLocale();
  const t = await getT();
  const kpis = lieferantenKpis();
  const stats = [
    { wert: "4 %", label: "Plattform-Cut", sub: "statt 30–50 % Verleih-Marge", farbe: "var(--vibe-approval)" },
    { wert: "131", label: "Routen live", sub: "12 Berufe + 4 Lieferanten", farbe: "var(--vibe-team)" },
    { wert: "11", label: "DNQP-Standards", sub: `${STANDARDS.length} mit Beruf-Mapping`, farbe: "var(--accent)" },
    { wert: `${Math.round(kpis.vorzugsmodellAnteilVolumen * 100)} %`, label: "Vorzugs-Anteil", sub: `${kpis.anzahl} GWÖ-bewertete Anbieter`, farbe: "var(--sat)" },
  ];

  return (
    <div className="min-h-screen">
      <nav className="max-w-screen-app mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Wordmark rainbow />
        <div className="flex items-center gap-2.5">
          <LocaleSwitcher current={locale} />
          <Link href="/system" className="btn btn-ghost text-[13px] px-3 py-1.5">
            {t("landing.cta.system")}
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 pt-6 sm:pt-12 pb-16 sm:pb-24 relative">
        <div aria-hidden className="absolute -top-20 -left-40 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-br from-mon-200 via-tue-200 to-sat-200 opacity-20 blur-3xl pointer-events-none" />
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center relative">
          <div className="lg:col-span-5">
            <div className="rainbow-bar h-1.5 w-24 rounded-full mb-6" />
            <h1 className="font-display text-[44px] sm:text-[64px] font-extrabold tracking-tight3 leading-[1.02] text-balance anim-slideUp">
              {t("landing.heroTitle.line1")}<br />
              {locale === "en" ? (
                <>carrying <span className="rainbow-text">everyone</span>.</>
              ) : (
                <>die <span className="rainbow-text">alle</span> trägt.</>
              )}
            </h1>
            <p className="text-[16px] sm:text-[18px] text-mute mt-5 leading-relaxed max-w-lg text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
              {t("landing.heroSubtitle")}
            </p>
            <div className="flex flex-wrap gap-2.5 mt-7 anim-slideUp" style={{ animationDelay: "0.16s" }}>
              <Link href="/willkommen" className="btn btn-primary text-[14px] px-5 py-2.5">
                {locale === "en" ? "Pick a portal" : "Portal wählen"}
              </Link>
              <Link href="/registrieren/demo" className="btn btn-ghost text-[14px] px-5 py-2.5">
                {locale === "en" ? "Demo-Account" : "Demo-Account"}
              </Link>
              <Link href="/kontakt" className="btn btn-ghost text-[14px] px-5 py-2.5">
                {locale === "en" ? "Contact" : "Kontakt"}
              </Link>
            </div>
            <p className="text-[12px] uppercase tracking-[0.2em] text-soft mt-8 mb-3 font-mono anim-slideUp" style={{ animationDelay: "0.2s" }}>
              {locale === "en" ? "Choose your seat" : "Wähle deinen Platz"}
            </p>
          </div>

          <div className="lg:col-span-7 relative anim-slideUp" style={{ animationDelay: "0.25s" }}>
            <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-mon-200 via-tue-200 to-sat-200 opacity-25 blur-3xl pointer-events-none" />
            <div className="relative">
              <RolePortal />
            </div>
          </div>
        </div>

        <p className="text-[12px] text-soft mt-10 font-mono">
          {t("common.openSource")}
        </p>
      </section>

      <OnboardingTour />

      {/* ─── Stats-Bar ─────────────────────────────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 pb-12 sm:pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <SmoothReveal key={s.label} direction="up" delay={i * 60}>
              <div
                className="surface rounded-2xl p-5 sm:p-6 relative overflow-hidden h-full"
                style={{ borderTop: `3px solid rgb(${s.farbe})` }}
              >
                <p
                  className="font-display font-extrabold tracking-tight3 tabular-nums leading-none"
                  style={{
                    fontSize: "clamp(2.4rem, 6vw, 3.5rem)",
                    color: `rgb(${s.farbe})`,
                  }}
                >
                  {s.wert}
                </p>
                <p className="text-[12px] uppercase tracking-wider text-soft font-mono mt-2.5 font-medium">
                  {s.label}
                </p>
                <p className="text-[12px] text-mute mt-1 leading-snug">{s.sub}</p>
              </div>
            </SmoothReveal>
          ))}
        </div>
      </section>

      {/* ─── 3 Pillars ─────────────────────────────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div className="grid sm:grid-cols-3 gap-3">
          {PILLARS.map((p, i) => (
            <SmoothReveal key={p.title} direction="up" delay={i * 80}>
              <AccentCard
                accent={p.color}
                titel={p.title}
                beschreibung={p.body}
                variante="tile"
              />
            </SmoothReveal>
          ))}
        </div>
      </section>

      {/* ─── Berufe-Grid ──────────────────────────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-24 border-t border-app-soft">
        <div className="max-w-2xl mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Nordstern</p>
          <h2 className="font-display text-[32px] sm:text-[42px] font-bold tracking-tight3 leading-[1.08]">
            Pflege ist unser Eintritt.<br />
            <span className="rainbow-text">Aber wir bauen für alle</span>,<br />
            die sich um andere kümmern.
          </h2>
          <p className="text-[15px] text-mute mt-5 leading-relaxed">
            Pflege, Sozialarbeit, Erziehung, Beratung, Therapie, Heilerziehung,
            Hauswirtschaft, ehrenamtliche Begleitung — alles auf einer Codebase,
            getragen von einer Genossenschaft.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {PROFESSIONS.map((p, i) => (
            <figure
              key={p.src}
              className="group anim-float"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <Image
                  src={p.src}
                  alt={p.label}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition group-hover:scale-[1.03]"
                />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1" style={{ background: `rgb(${p.color})` }} />
              </div>
              <figcaption className="text-[13px] mt-2 px-0.5 font-medium" style={{ color: `rgb(${p.color})` }}>
                {p.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ─── 4 Schicht-Karten · GWÖ + DNQP + Lieferanten + Netz ── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-app-soft">
        <div className="max-w-2xl mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Was uns von anderen Plattformen unterscheidet</p>
          <h2 className="font-display text-[28px] sm:text-[38px] font-bold tracking-tight3 leading-[1.1]">
            Auslieferungs-Niveau, <span className="rainbow-text">nicht Demo-Niveau</span>.
          </h2>
          <p className="text-[15px] text-mute mt-4 leading-relaxed">
            Vier Bausteine, die Shalem trägt: Standards, Werte-Bilanz, Lieferanten-Pool, Vernetzung.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEASER_KARTEN.map((k, i) => (
            <SmoothReveal key={k.href} direction="up" delay={i * 60}>
              <Link
                href={k.href}
                className="surface-hover rounded-2xl p-5 block h-full relative overflow-hidden group"
                style={{ borderTop: `3px solid rgb(${k.farbe})` }}
              >
                <div
                  aria-hidden
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-30 transition-opacity blur-2xl"
                  style={{ background: `rgb(${k.farbe})` }}
                />
                <p
                  className="font-mono text-[10px] uppercase tracking-wider mb-2"
                  style={{ color: `rgb(${k.farbe})` }}
                >
                  {k.eyebrow}
                </p>
                <h3 className="font-display text-[18px] font-bold tracking-tight2 leading-snug mb-2">
                  {k.titel}
                </h3>
                <p className="text-[13px] text-mute leading-relaxed">{k.body}</p>
                <p
                  className="text-[12px] font-medium mt-4 inline-flex items-center gap-1 transition group-hover:gap-2"
                  style={{ color: `rgb(${k.farbe})` }}
                >
                  {k.cta} →
                </p>
              </Link>
            </SmoothReveal>
          ))}
        </div>
      </section>

      {/* ─── Drei Mitglieder · MediaSplit ───────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-app-soft">
        <SmoothReveal direction="up">
          <MediaSplit
            bild="/onboarding/welcome.png"
            imageSide="left"
            imageAspect="wide"
            imageSpan={5}
            glow="var(--mon)"
          >
            <SectionHeader
              eyebrow="Wie die Genossenschaft funktioniert"
              titel={<>Drei Mitglieder, ein <RainbowText>Schlussstein</RainbowText>.</>}
              size="large"
              lead={
                <>
                  Jedes Mitglied bringt einen Anteil ein — Pflegekraft, Klient, Träger.
                  Was sonst Vermittlungs-Marge und Verwaltungs-Overhead frisst, fließt
                  zurück in den gemeinsamen Pool. Ein:e Stimme pro Mitglied. Plattform-Cut
                  4 % statt 30–50 % bei Honorar-Verleihern.
                </>
              }
            />
            <BulletList
              className="mt-6 text-[14px]"
              size="md"
              marker="color"
              items={[
                { text: <><span className="font-medium">Pflegekräfte</span> werden Mit-Eigentümer — Mondragon-Modell, Smart eG-Präzedenz</>, akzent: "var(--mon)" },
                { text: <><span className="font-medium">Klient:innen</span> mit Pflegegrad 2+ können sich als Self-Booker freischalten</>, akzent: "var(--wed)" },
                { text: <><span className="font-medium">Träger</span> als Service-Partner statt Verleiher — IK-Anbindung über Genossenschaft</>, akzent: "var(--sun)" },
                { text: <><span className="font-medium">Solidar-Topf</span> trägt jedes Mitglied in Krankheit + Verdienstausfall, solange das Modell lebt</>, akzent: "var(--thu)" },
              ]}
            />
          </MediaSplit>
        </SmoothReveal>
      </section>

      {/* ─── Pflege-Handbuch · ausklappbar ─────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-app-soft">
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
                  Pflege-Handbuch 1.0 · Source Open · {HANDBUCH_KAPITEL.length} Kapitel
                </p>
                <h2 className="font-display text-[32px] sm:text-[42px] font-bold tracking-tight3 leading-[1.05]">
                  Vom <span className="rainbow-text">Kammerdiener</span><br />
                  zur Pflegekraft.
                </h2>
                <p className="text-[15px] text-mute mt-4 leading-relaxed text-pretty max-w-xl">
                  Pflege ist kein Job. Sie ist eine Form der Kulturarbeit — fundiert in
                  Wissenschaft, erprobt im Alltag.
                </p>
              </div>
              <span className="surface rounded-full px-4 py-2.5 text-[12px] uppercase tracking-wider font-mono inline-flex items-center gap-2 transition group-open:bg-[rgb(var(--bg-soft))]">
                <span className="hidden group-open:inline">Schließen</span>
                <span className="group-open:hidden">Aufklappen</span>
                <span aria-hidden className="text-[14px] transition-transform group-open:rotate-45">+</span>
              </span>
            </div>
          </summary>

          <div className="mt-10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {HANDBUCH_KAPITEL.map((k) => (
                <article
                  key={k.id}
                  className="surface-hover rounded-2xl p-5 relative overflow-hidden"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                    style={{ background: `rgb(var(--${k.farbe}))` }}
                  />
                  <div className="ml-2.5">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-mono text-[10px] text-soft">
                        KAP {k.nummer.toString().padStart(2, "0")}
                      </span>
                      {k.untertitel && (
                        <span className="text-[10px] uppercase tracking-wide" style={{ color: `rgb(var(--${k.farbe}))` }}>
                          {k.untertitel}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-[17px] font-semibold tracking-tight2 mb-2 leading-snug">
                      {k.titel}
                    </h3>
                    <p className="text-[13px] text-mute leading-relaxed">{k.kernaussage}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 surface rounded-2xl p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
                Zusammenfassung des Wandels
              </p>
              <h3 className="font-display text-[20px] sm:text-[24px] font-bold tracking-tight2 mb-5">
                Pflege ist keine Dienstleistung mehr. Sie ist <span className="rainbow-text">Bewusstseinsarchitektur</span>.
              </h3>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-[14px]">
                {WANDEL_TABELLE.map((w, i) => (
                  <li key={i} className="flex items-center gap-3 py-2 border-b border-app-soft last:border-b-0">
                    <span className="font-mono text-soft text-[12px] line-through w-32 shrink-0">{w.alt}</span>
                    <span aria-hidden className="text-soft">→</span>
                    <span className="font-medium">{w.neu}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>
      </section>

      {/* ─── Heilkunst-Bibliothek · ausklappbar ───────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-app-soft">
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
                  Heilkunst-Bibliothek · {HAUSMITTEL.length} Anwendungen · {AETHERISCHE_OELE.length} Öle
                </p>
                <h2 className="font-display text-[32px] sm:text-[42px] font-bold tracking-tight3 leading-[1.05]">
                  Wasser, Wickel, <span className="rainbow-text">Würde</span>.
                </h2>
                <p className="text-[15px] text-mute mt-4 leading-relaxed text-pretty max-w-xl">
                  Was Sebastian Kneipp im 19. Jahrhundert begründete, ist heute belegte
                  Salutogenese — Hydrotherapie, Wickel, Kräuter, ätherische Öle.
                </p>
              </div>
              <span className="surface rounded-full px-4 py-2.5 text-[12px] uppercase tracking-wider font-mono inline-flex items-center gap-2 transition group-open:bg-[rgb(var(--bg-soft))]">
                <span className="hidden group-open:inline">Schließen</span>
                <span className="group-open:hidden">Bibliothek aufklappen</span>
                <span aria-hidden className="text-[14px] transition-transform group-open:rotate-45">+</span>
              </span>
            </div>
          </summary>

          <div className="mt-10 grid lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-7">
              <p className="text-[14px] text-soft italic">
                „Wasser ist das natürlichste, einfachste, wohlfeilste und, recht angewendet,
                das sicherste Mittel." — S. Kneipp
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="surface rounded-2xl p-5">
                <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
                  Kneipps fünf Säulen
                </p>
                <ol className="space-y-2.5">
                  {KNEIPP_SAEULEN.map((s) => (
                    <li key={s.id} className="flex gap-3 items-baseline">
                      <span className="font-display font-bold text-[18px] text-mute w-5 shrink-0 leading-none">
                        {s.nummer}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-[14px]">{s.name}</div>
                        <div className="text-[12px] text-mute leading-snug">{s.kurz}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {(["kneipp", "wickel_auflage", "aromatherapie", "schmerzoel", "kraeuter"] as Anwendungstyp[]).map((typ) => {
              const items = HAUSMITTEL.filter((h) => h.typ === typ);
              if (items.length === 0) return null;
              return (
                <div key={typ}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={{ background: `rgb(${ANWENDUNGSTYP_FARBE[typ]})` }} />
                    <h3 className="font-display text-[17px] font-semibold tracking-tight2">
                      {ANWENDUNGSTYP_LABEL[typ]}
                    </h3>
                    <span className="text-[11px] text-soft">{items.length} Anwendungen</span>
                  </div>
                  <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {items.map((h) => (
                      <li key={h.id} className="surface-mute rounded-lg p-3 text-[12px]">
                        <div className="font-medium">{h.name}</div>
                        {h.motto && <p className="text-[11px] italic text-soft mt-0.5">„{h.motto}"</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-10 surface rounded-2xl p-6">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
              Mini-Lexikon · Ätherische Öle
            </p>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AETHERISCHE_OELE.map((o) => (
                <li key={o.id} className="surface-mute rounded-lg p-3">
                  <div className="text-[13px] font-medium">{o.name}</div>
                  <div className="text-[11px] text-soft font-mono mb-1.5">{o.botanisch}</div>
                  <div className="text-[12px] text-mute">
                    <span className="text-soft uppercase tracking-wide text-[9px]">Wirkt:</span>{" "}
                    {o.wirkungsweise.join(", ")}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-soft mt-8 max-w-prose">
            Quellen: Hausmittelrunde 3.0.4 · Pflege-Handbuch 1.0 · Cochrane · AWMF · DNQP · NICE.
          </p>
        </details>
      </section>

      {/* ─── Final CTA ──────────────────────────────────────── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-24 border-t border-app-soft">
        <div className="surface rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-mon-200 via-tue-200 to-sat-200 opacity-20 blur-3xl pointer-events-none" />
          <div className="relative max-w-2xl">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Wähle deinen Weg</p>
            <h2 className="font-display text-[32px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
              Drei Wege rein, <span className="rainbow-text">eine Plattform</span>.
            </h2>
            <p className="text-[15px] text-mute mt-4 leading-relaxed">
              Demo zeigt, wie es sich anfühlt. Pflegekraft + Träger sind die zwei
              Mitgliedspfade, an denen es ernst wird.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 relative">
            <Link
              href="/demo/leben"
              className="surface-hover rounded-2xl p-5 block group"
              style={{ borderTop: "3px solid rgb(var(--accent))" }}
            >
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[rgb(var(--accent))]">
                ✦ Live · KI · 10 min
              </p>
              <h3 className="font-display text-[18px] font-bold tracking-tight2 mb-1.5">
                Live-Demo · KI-Schicht
              </h3>
              <p className="text-[12px] text-mute leading-relaxed">
                11 Charaktere von Claude gespielt. Eine 8-Stunden-Schicht im Zeitraffer.
              </p>
              <p className="text-[12px] font-medium mt-3 text-[rgb(var(--accent))] group-hover:underline">
                Schicht starten →
              </p>
            </Link>
            <Link
              href="/pflegekraft-werden"
              className="surface-hover rounded-2xl p-5 block group"
              style={{ borderTop: "3px solid rgb(var(--mon))" }}
            >
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[rgb(var(--mon))]">
                Pflegekraft
              </p>
              <h3 className="font-display text-[18px] font-bold tracking-tight2 mb-1.5">
                Mit-Eigentümer:in werden
              </h3>
              <p className="text-[12px] text-mute leading-relaxed">
                4 % Cut statt 30–50 %. Stimmrecht ab Tag 1. Solidar-Topf für Krankheit.
              </p>
              <p className="text-[12px] font-medium mt-3 text-[rgb(var(--mon))] group-hover:underline">
                Pfad ansehen →
              </p>
            </Link>
            <Link
              href="/traeger-werden"
              className="surface-hover rounded-2xl p-5 block group"
              style={{ borderTop: "3px solid rgb(var(--sun))" }}
            >
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[rgb(var(--sun))]">
                Träger
              </p>
              <h3 className="font-display text-[18px] font-bold tracking-tight2 mb-1.5">
                Pilot starten
              </h3>
              <p className="text-[12px] text-mute leading-relaxed">
                Bis zu 3 Monate ohne Cut. Eine Station, ein Tour-Block. Echte Daten.
              </p>
              <p className="text-[12px] font-medium mt-3 text-[rgb(var(--sun))] group-hover:underline">
                Pilot konfigurieren →
              </p>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
