import Link from "next/link";
import Image from "next/image";
import { Wordmark, Logo } from "@/components/Logo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { RolePortal } from "@/components/RolePortal";
import { OnboardingTour } from "@/components/OnboardingTour";
import { HANDBUCH_KAPITEL, WANDEL_TABELLE, KNEIPP_SAEULEN } from "@/lib/heilkunst/philosophie";
import { HAUSMITTEL, AETHERISCHE_OELE, ANWENDUNGSTYP_LABEL, ANWENDUNGSTYP_FARBE } from "@/lib/heilkunst/hausmittel";
import type { Anwendungstyp } from "@/lib/heilkunst/hausmittel";
import { getLocale, getT } from "@/lib/i18n/server";
import { SmoothReveal } from "@/components/SmoothReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { AccentCard } from "@/components/AccentCard";
import { MediaSplit } from "@/components/MediaSplit";
import { BulletList } from "@/components/BulletList";
import { RainbowText } from "@/components/Rainbow";

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

export default async function LandingPage() {
  const locale = await getLocale();
  const t = await getT();
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

      {/* ─── Hero · Dynamische Rollenwahl ─── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 pt-6 sm:pt-12 pb-16 sm:pb-24">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-5">
            <div className="rainbow-bar h-1.5 w-24 rounded-full mb-6" />
            <h1 className="font-display text-[44px] sm:text-[64px] font-extrabold tracking-tight3 leading-[1.02] text-balance anim-slideUp">
              {t("landing.heroTitle.line1")}<br />
              {locale === "en"
                ? <>carrying <span className="rainbow-text">everyone</span>.</>
                : <>die <span className="rainbow-text">alle</span> trägt.</>
              }
            </h1>
            <p className="text-[16px] sm:text-[18px] text-mute mt-5 leading-relaxed max-w-lg text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
              {t("landing.heroSubtitle")}
            </p>
            <p className="text-[12px] uppercase tracking-[0.2em] text-soft mt-8 mb-3 font-mono anim-slideUp" style={{ animationDelay: "0.18s" }}>
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

      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-app-soft">
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

      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-24 border-t border-app-soft">
        <div className="max-w-2xl mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Nordstern</p>
          <h2 className="font-display text-[32px] sm:text-[42px] font-bold tracking-tight3 leading-[1.08]">
            Pflege ist unser Eintritt.<br />
            <span className="rainbow-text">Aber wir bauen für alle</span>,<br />
            die sich um andere kümmern.
          </h2>
          <p className="text-[15px] text-mute mt-5 leading-relaxed">
            Pflege, Sozialarbeit, Erziehung, Beratung, Therapie, Heilerziehung, Hauswirtschaft, ehrenamtliche Begleitung — alles auf einer Codebase, getragen von einer Genossenschaft.
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
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1"
                  style={{ background: `rgb(${p.color})` }}
                />
              </div>
              <figcaption
                className="text-[13px] mt-2 px-0.5 font-medium"
                style={{ color: `rgb(${p.color})` }}
              >
                {p.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

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
                  Jedes Mitglied bringt einen Anteil ein — Pflegekraft, Klient, Träger. Was sonst Vermittlungs-Marge und Verwaltungs-Overhead frisst, fließt zurück in den gemeinsamen Pool. Ein:e Stimme pro Mitglied. Plattform-Cut 4 % statt 30–50 % bei Honorar-Verleihern.
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

      {/* ─── Pflege-Handbuch · Vom Kammerdiener zur Pflegekraft ─── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-24 border-t border-app-soft">
        <div className="max-w-2xl mb-12">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Pflege-Handbuch 1.0 · Source Open</p>
          <h2 className="font-display text-[32px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
            Vom <span className="rainbow-text">Kammerdiener</span><br />
            zur Pflegekraft.
          </h2>
          <p className="text-[16px] text-mute mt-5 leading-relaxed text-pretty">
            Pflege ist kein Job. Sie ist eine Form der Kulturarbeit — fundiert in Wissenschaft, erprobt im Alltag.
            Verstand und Herz, in einem Wegweiser zur inneren und äußeren Balance.
          </p>
          <p className="text-[14px] text-soft mt-4 italic">
            „Pflege ist der Ort, an dem sich das Menschliche am deutlichsten zeigt — und am tiefsten vergessen wurde."
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HANDBUCH_KAPITEL.map((k, i) => (
            <article
              key={k.id}
              className="surface-hover rounded-2xl p-5 anim-float relative overflow-hidden"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                style={{ background: `rgb(var(--${k.farbe}))` }}
              />
              <div className="ml-2.5">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-[10px] text-soft">KAP {k.nummer.toString().padStart(2, "0")}</span>
                  {k.untertitel && (
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: `rgb(var(--${k.farbe}))` }}>
                      {k.untertitel}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-[17px] font-semibold tracking-tight2 mb-2 leading-snug">{k.titel}</h3>
                <p className="text-[13px] text-mute leading-relaxed">{k.kernaussage}</p>
                <details className="mt-3 group">
                  <summary className="text-[11px] uppercase tracking-wider text-soft font-medium cursor-pointer hover:text-[rgb(var(--fg))]">
                    Prinzipien · Zitate
                  </summary>
                  <div className="mt-3 space-y-3">
                    {k.zitate.length > 0 && (
                      <div className="space-y-1.5">
                        {k.zitate.map((z, zi) => (
                          <p key={zi} className="text-[12px] italic text-mute leading-relaxed border-l-2 pl-2.5"
                             style={{ borderColor: `rgb(var(--${k.farbe}))` }}>
                            „{z}"
                          </p>
                        ))}
                      </div>
                    )}
                    <ul className="space-y-1 text-[12px]">
                      {k.prinzipien.map((p, pi) => (
                        <li key={pi} className="flex gap-2 items-baseline">
                          <span aria-hidden className="text-soft shrink-0">›</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 surface rounded-2xl p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Zusammenfassung des Wandels</p>
          <h3 className="font-display text-[22px] sm:text-[28px] font-bold tracking-tight2 mb-6">
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
      </section>

      {/* ─── Heilkunst-Bibliothek ─── */}
      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-24 border-t border-app-soft">
        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Heilkunst-Bibliothek · Hausmittelrunde 3.0</p>
            <h2 className="font-display text-[32px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
              Wasser, Wickel, <span className="rainbow-text">Würde</span>.
            </h2>
            <p className="text-[16px] text-mute mt-5 leading-relaxed text-pretty">
              Was Sebastian Kneipp im 19. Jahrhundert begründete, ist heute belegte
              Salutogenese: Hydrotherapie aktiviert den Vagusnerv, reguliert Kreislauf,
              stärkt Immunsystem und Selbstwahrnehmung. Pflegekräfte, die diese Werkzeuge
              in den Alltag integrieren, lehren Gesundheit, ohne sie zu predigen.
            </p>
            <p className="text-[14px] text-soft mt-4 italic">
              „Wasser ist das natürlichste, einfachste, wohlfeilste und, recht angewendet,
              das sicherste Mittel." — S. Kneipp
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="surface rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Kneipps fünf Säulen</p>
              <ol className="space-y-2.5">
                {KNEIPP_SAEULEN.map((s) => (
                  <li key={s.id} className="flex gap-3 items-baseline">
                    <span className="font-display font-bold text-[18px] text-mute w-5 shrink-0 leading-none">{s.nummer}</span>
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

        <div className="space-y-8">
          {(["kneipp", "wickel_auflage", "aromatherapie", "schmerzoel", "kraeuter"] as Anwendungstyp[]).map((typ) => {
            const items = HAUSMITTEL.filter((h) => h.typ === typ);
            if (items.length === 0) return null;
            return (
              <div key={typ}>
                <div className="flex items-baseline gap-3 mb-3">
                  <span
                    aria-hidden
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: `rgb(${ANWENDUNGSTYP_FARBE[typ]})` }}
                  />
                  <h3 className="font-display text-[18px] font-semibold tracking-tight2">
                    {ANWENDUNGSTYP_LABEL[typ]}
                  </h3>
                  <span className="text-[11px] text-soft">{items.length} Anwendungen</span>
                </div>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {items.map((h) => (
                    <li
                      key={h.id}
                      className="surface-hover rounded-xl p-4 relative overflow-hidden"
                    >
                      <span
                        aria-hidden
                        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                        style={{ background: `rgb(${ANWENDUNGSTYP_FARBE[typ]})` }}
                      />
                      <div className="ml-2.5">
                        <div className="text-[13px] font-medium leading-tight">{h.name}</div>
                        {h.motto && (
                          <p className="text-[11px] italic text-soft mt-0.5">„{h.motto}"</p>
                        )}
                        <details className="mt-2">
                          <summary className="text-[11px] cursor-pointer text-mute hover:text-[rgb(var(--fg))]">
                            Indikation · Anleitung
                          </summary>
                          <div className="mt-2 space-y-2 text-[11px]">
                            {h.geeignetBei.length > 0 && (
                              <p>
                                <span className="text-soft uppercase tracking-wide text-[9px]">Geeignet bei:</span>{" "}
                                {h.geeignetBei.join(", ")}
                              </p>
                            )}
                            {h.vorsichtBei.length > 0 && (
                              <p style={{ color: "rgb(var(--mon))" }}>
                                <span className="uppercase tracking-wide text-[9px]">Vorsicht:</span>{" "}
                                {h.vorsichtBei.join(", ")}
                              </p>
                            )}
                            <p>
                              <span className="text-soft uppercase tracking-wide text-[9px]">Wirkung:</span>{" "}
                              {h.wirkungsweise.join(", ")}
                            </p>
                            {h.material.length > 0 && (
                              <p>
                                <span className="text-soft uppercase tracking-wide text-[9px]">Material:</span>{" "}
                                {h.material.join(" · ")}
                              </p>
                            )}
                            <ol className="mt-1 space-y-0.5 list-decimal list-inside">
                              {h.anleitung.map((a, ai) => (
                                <li key={ai}>{a}</li>
                              ))}
                            </ol>
                            {h.dauer && (
                              <p className="text-soft font-mono mt-1">⏱ {h.dauer}</p>
                            )}
                            {h.hinweis && (
                              <p className="text-soft italic mt-1">{h.hinweis}</p>
                            )}
                          </div>
                        </details>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 surface rounded-2xl p-6">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Mini-Lexikon · Ätherische Öle</p>
          <h3 className="font-display text-[20px] font-semibold tracking-tight2 mb-4">
            Sechs Düfte, sechs Wirkungen.
          </h3>
          <p className="text-[12px] text-mute mb-5">
            Werden zur äußerlichen Anwendung nie pur verwendet. Therapeutischer Bereich 2–13 % in
            Basisölen wie Olivenöl oder Jojobaöl.
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AETHERISCHE_OELE.map((o) => (
              <li key={o.id} className="surface-mute rounded-lg p-3">
                <div className="text-[13px] font-medium">{o.name}</div>
                <div className="text-[11px] text-soft font-mono mb-1.5">{o.botanisch}</div>
                <div className="text-[12px] text-mute">
                  <span className="text-soft uppercase tracking-wide text-[9px]">Bei:</span>{" "}
                  {o.geeignetBei.join(", ")}
                </div>
                <div className="text-[12px] text-mute mt-1">
                  <span className="text-soft uppercase tracking-wide text-[9px]">Wirkt:</span>{" "}
                  {o.wirkungsweise.join(", ")}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-soft mt-8 max-w-prose">
          Quellen: Hausmittelrunde 3.0.4 · Pflege-Handbuch 1.0 — Vom Kammerdiener zur Pflegekraft (Source Open).
          Studien-Referenzen (Cochrane, AWMF, DNQP, NICE) im Therapie-Modul des Klienten-Detail verlinkt.
        </p>
      </section>

      <footer className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 border-t border-app-soft">
        <div className="rainbow-bar h-0.5 w-full rounded-full mb-6 opacity-60" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={20} className="accent-text" />
            <span className="text-[13px] text-mute">Shalem Care · 2026 · AGPLv3</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-mute">
            <Link href="/genossenschaft/solidartopf" className="hover:text-[rgb(var(--fg))]">Solidar-Topf</Link>
            <Link href="/genossenschaft/pool" className="hover:text-[rgb(var(--fg))]">Pool</Link>
            <Link href="/netz" className="hover:text-[rgb(var(--fg))]">Netz · Übersicht</Link>
            <Link href="/livemap" className="hover:text-[rgb(var(--fg))]">Live-Map · 24 h</Link>
            <Link href="/schicht" className="hover:text-[rgb(var(--fg))]">Schicht-Akten</Link>
            <Link href="/ki" className="hover:text-[rgb(var(--fg))]">KI · Klartext</Link>
            <Link href="/apotheke" className="hover:text-[rgb(var(--fg))]">Apotheke</Link>
            <Link href="/medizintechnik" className="hover:text-[rgb(var(--fg))]">MedTech</Link>
            <Link href="/rettungsdienst" className="hover:text-[rgb(var(--fg))]">Rettungsdienst</Link>
            <Link href="/bestatter" className="hover:text-[rgb(var(--fg))]">Bestatter</Link>
            <Link href="/begleitung" className="hover:text-[rgb(var(--fg))]">Würde-Begleitung</Link>
            <Link href="/entwickler" className="hover:text-[rgb(var(--fg))]">Entwickler-API</Link>
            <Link href="/compliance" className="hover:text-[rgb(var(--fg))]">Compliance</Link>
            <Link href="/pflegekraft-werden" className="hover:text-[rgb(var(--fg))]">Pflegekraft werden</Link>
            <Link href="/traeger-werden" className="hover:text-[rgb(var(--fg))]">Träger werden</Link>
            <Link href="/faq" className="hover:text-[rgb(var(--fg))]">FAQ</Link>
            <Link href="/glossar" className="hover:text-[rgb(var(--fg))]">Glossar</Link>
            <Link href="/kontakt" className="hover:text-[rgb(var(--fg))]">Kontakt</Link>
            <Link href="/datenschutz" className="hover:text-[rgb(var(--fg))]">Datenschutz</Link>
            <a href="https://merkabaprojekt.de" className="hover:text-[rgb(var(--fg))]">Merkaba Project</a>
            <Link href="/pflege" className="hover:text-[rgb(var(--fg))]">App</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
