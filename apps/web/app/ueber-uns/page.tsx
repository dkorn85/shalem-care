import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Wordmark, Logo } from "@/components/Logo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Über uns",
  description: "Shalem Care · Mission, Genossenschaftsmodell, Team und Werte. Pflege als Bewusstseinsarchitektur.",
};

export default async function UeberUnsPage() {
  const locale = await getLocale();
  const isEN = locale === "en";

  return (
    <div className="min-h-screen">
      <nav className="max-w-screen-app mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/"><Wordmark rainbow /></Link>
        <div className="flex items-center gap-2.5">
          <LocaleSwitcher current={locale} />
          <Link href="/" className="btn">{isEN ? "Home" : "Startseite"}</Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-10">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-6" />
        <h1 className="font-display text-[42px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance mb-6">
          {isEN ? <>Care as <span className="rainbow-text">cultural work</span>.</> : <>Pflege als <span className="rainbow-text">Kulturarbeit</span>.</>}
        </h1>
        <p className="text-[16px] sm:text-[18px] text-mute max-w-2xl leading-relaxed">
          {isEN
            ? "Shalem Care builds the social-care infrastructure that the welfare state used to provide — but as a worker-owned cooperative, fully open source, with FHIR at its core. Our north star: human dignity scales when the platform pays back instead of paying out."
            : "Shalem Care baut die soziale Infrastruktur, die früher der Sozialstaat selbst getragen hat — aber als Genossenschaft im Eigentum derer, die die Arbeit machen, vollständig Open Source und FHIR-nativ. Unser Nordstern: Menschlichkeit skaliert, wenn die Plattform zurückgibt statt auszuschütten."}
        </p>
      </section>

      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">{isEN ? "Mission" : "Mission"}</p>
            <h2 className="font-display text-[28px] sm:text-[34px] font-bold tracking-tight3 leading-tight">
              {isEN ? "Three convictions." : "Drei Überzeugungen."}
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <Conviction
              num={1}
              color="var(--mon)"
              de={["Pflege ist Frühwarnsystem.", "Wenn Solidarität, Empathie und Ruhe vorhanden sind, regeneriert sich Pflege selbst. Wenn Angst und Druck dominieren, erkrankt sie zuerst — sie zeigt, was im Gesamtsystem nicht mehr stimmt."]}
              en={["Care is the early-warning system.", "When solidarity, empathy and calm are present, care regenerates itself. When fear and pressure dominate, it falls ill first — it shows what's broken in the larger system."]}
            />
            <Conviction
              num={2}
              color="var(--vibe-team)"
              de={["Werte vor Effizienz — biologisch effizient.", "Würde, Verbindung und Sinn sind keine Romantik. Studien der Stressforschung zeigen: Kohärenzgefühl korreliert direkt mit Immunstärke, Schlafqualität und Herzgesundheit. Werte-getriebene Systeme haben weniger Krankheitstage."]}
              en={["Values before efficiency — biologically efficient.", "Dignity, connection and meaning aren't romance. Stress research shows: a sense of coherence correlates with immune strength, sleep, cardiac health. Values-driven systems have lower sick-leave rates."]}
            />
            <Conviction
              num={3}
              color="var(--thu)"
              de={["Die Arbeit macht das Eigentum.", "Wer pflegt, soll Anteil am Wert der Plattform haben. Genossenschaft heißt: ein Mitglied, eine Stimme. 4 % Plattform-Cut statt 30–50 % wie bei klassischen Honorar-Verleihern. Was bleibt, fließt zurück."]}
              en={["Those who do the work own it.", "Whoever cares, should share in the value of the platform. Cooperative means: one member, one vote. 4 % platform cut instead of the 30–50 % charged by classic temp agencies. What's left flows back."]}
            />
          </div>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">{isEN ? "Cooperative" : "Genossenschaft"}</p>
            <h2 className="font-display text-[28px] sm:text-[34px] font-bold tracking-tight3 leading-tight">
              {isEN ? "Three members. One keystone." : "Drei Mitglieder. Ein Schlussstein."}
            </h2>
            <p className="text-[14px] text-mute mt-4 leading-relaxed">
              {isEN
                ? "Each member contributes a share — care worker, client, provider. What classic platforms swallow as commission, flows back into a shared pool."
                : "Jedes Mitglied bringt einen Anteil ein — Pflegekraft, Klient:in, Träger. Was klassische Plattformen als Marge verschlucken, fließt zurück in einen gemeinsamen Pool."}
            </p>
          </div>
          <div className="lg:col-span-7 relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-mon-200 via-wed-200 to-sun-200 opacity-25 blur-2xl" />
            <div className="relative surface rounded-2xl overflow-hidden p-6">
              <Image
                src="/onboarding/welcome.png"
                alt="Drei Mitglieder, die einen Schlussstein gemeinsam tragen"
                width={1200}
                height={900}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-12 border-t border-app-soft">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">{isEN ? "Values" : "Werte"}</p>
        <h2 className="font-display text-[28px] sm:text-[34px] font-bold tracking-tight3 leading-tight mb-8">
          {isEN ? "How we work." : "Wie wir arbeiten."}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {VALUES(isEN).map((v, i) => (
            <article key={v.title} className="surface-hover rounded-2xl p-5 anim-float relative overflow-hidden" style={{ animationDelay: `${i * 0.05}s` }}>
              <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${v.color})` }} />
              <div className="ml-2.5">
                <div className="text-[20px] mb-2">{v.icon}</div>
                <h3 className="font-display text-[15px] font-semibold tracking-tight2">{v.title}</h3>
                <p className="text-[12px] text-mute mt-1.5 leading-relaxed">{v.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-12 border-t border-app-soft">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">{isEN ? "Tech foundations" : "Technisches Fundament"}</p>
        <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight3 leading-tight mb-6">
          {isEN ? "Open by design." : "Offen, by design."}
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <FactCard label={isEN ? "License" : "Lizenz"} value="AGPLv3" sub={isEN ? "Strong copyleft — improvements stay open." : "Starkes Copyleft — Verbesserungen bleiben offen."} />
          <FactCard label="FHIR" value="R4 / Medplum" sub={isEN ? "Native interoperability with EHR / ePA." : "Interoperabel mit eAkte / ePA out-of-box."} />
          <FactCard label="Stack" value="Next.js · React · TypeScript" sub={isEN ? "Server Components, Server Actions, no client-side state libs." : "Server Components, Server Actions, kein Client-State-Tooling."} />
          <FactCard label={isEN ? "AI" : "KI"} value="Provider-agnostisch" sub={isEN ? "DeepSeek, Anthropic, Mistral, Aleph Alpha. Mock works without keys." : "DeepSeek, Anthropic, Mistral, Aleph Alpha. Mock-Modus ohne Keys."} />
          <FactCard label={isEN ? "Data sovereignty" : "Datenhoheit"} value="EU/DE" sub={isEN ? "GDPR-compliant. AVV-ready providers only." : "DSGVO-konform. Nur AVV-fähige Anbieter."} />
          <FactCard label="Code" value="github.com/dkorn85/shalem-care" sub={isEN ? "Public mirror — fork, audit, contribute." : "Öffentlicher Mirror — forken, prüfen, beitragen."} />
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
            <Link href="/" className="hover:text-[rgb(var(--fg))]">{isEN ? "Home" : "Startseite"}</Link>
            <Link href="/roadmap" className="hover:text-[rgb(var(--fg))]">Roadmap</Link>
            <Link href="/presse" className="hover:text-[rgb(var(--fg))]">{isEN ? "Press" : "Presse"}</Link>
            <Link href="/datenschutz" className="hover:text-[rgb(var(--fg))]">{isEN ? "Privacy" : "Datenschutz"}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Conviction({ num, color, de, en }: { num: number; color: string; de: [string, string]; en: [string, string] }) {
  return (
    <div className="surface rounded-2xl p-5 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${color})` }} />
      <div className="ml-3">
        <div className="flex items-baseline gap-3 mb-1.5">
          <span className="font-mono text-[14px] text-soft">0{num}</span>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2">{de[0]}</h3>
        </div>
        <p className="text-[14px] text-mute leading-relaxed">{de[1]}</p>
      </div>
    </div>
  );
}

function FactCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="surface rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div className="font-display font-semibold text-[18px] mt-1 tracking-tight2">{value}</div>
      <div className="text-[12px] text-mute mt-1">{sub}</div>
    </div>
  );
}

function VALUES(en: boolean) {
  return [
    { icon: "🌿", color: "var(--thu)", title: en ? "Dignity over efficiency" : "Würde vor Effizienz", body: en ? "Time with people isn't wasted productivity — it's the source." : "Zeit für Menschen ist keine verlorene Produktivität — sie ist ihre Quelle." },
    { icon: "🤝", color: "var(--vibe-team)", title: en ? "Connection over control" : "Verbindung vor Kontrolle", body: en ? "Trust replaces coercion, cooperation replaces fear." : "Vertrauen ersetzt Zwang, Kooperation ersetzt Angst." },
    { icon: "🧭", color: "var(--vibe-profile)", title: en ? "Meaning over routine" : "Sinn vor Routine", body: en ? "Meaning is the strongest biochemical antidepressant." : "Sinn ist das stärkste biochemische Antidepressivum." },
    { icon: "🔓", color: "var(--mon)", title: en ? "Open by default" : "Offen by default", body: en ? "Code, standards, processes — open. Closed only what GDPR forces us to close." : "Code, Standards, Prozesse — offen. Geschlossen nur was die DSGVO zu schließen verpflichtet." },
  ];
}
