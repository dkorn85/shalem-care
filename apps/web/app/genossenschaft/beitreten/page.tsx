"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Wordmark, Logo } from "@/components/Logo";
import { MITGLIED_LABEL, MITGLIED_FARBE, NOMINAL_EURO } from "@/lib/genossenschaft/store";
import type { Mitgliedstyp } from "@/lib/genossenschaft/store";

type Step = 0 | 1 | 2 | 3;

export default function BeitretenPage() {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [typ, setTyp] = useState<Mitgliedstyp>("pflegekraft");
  const [anteile, setAnteile] = useState(1);
  const [satzungAkzeptiert, setSatzungAkzeptiert] = useState(false);
  const [datenschutz, setDatenschutz] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const einlage = anteile * NOMINAL_EURO;
  const farbe = MITGLIED_FARBE[typ];

  const stepLabels = ["Person", "Mitgliedstyp", "Anteile", "Bestätigung"];

  return (
    <div className="min-h-screen">
      <nav className="max-w-screen-app mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/"><Wordmark rainbow /></Link>
        <Link href="/genossenschaft" className="btn btn-ghost text-[13px] px-3 py-1.5">← Übersicht</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
        <header className="mb-8">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Genossenschaft Shalem Care eG i.G.
          </p>
          <h1 className="font-display text-[36px] sm:text-[44px] font-extrabold tracking-tight3 leading-[1.05] text-balance">
            <span className="rainbow-text">Mitglied werden</span>.
          </h1>
          <p className="text-[14px] text-mute mt-3 leading-relaxed">
            Vier kurze Schritte — keine Verkaufsformulare, keine versteckten Kosten.
            Pflichtanteil ist 1 (= {NOMINAL_EURO} €), eine Stimme pro Mitglied.
          </p>
        </header>

        {/* Stepper */}
        <ol className="flex items-center mb-10">
          {stepLabels.map((label, i) => (
            <li key={label} className="flex-1 flex items-center gap-1">
              <div
                className="w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold shrink-0"
                style={{
                  background: i <= step ? `rgb(${farbe})` : "rgb(var(--bg-mute))",
                  color: i <= step ? "white" : "rgb(var(--fg-soft))",
                }}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[11px] font-medium hidden sm:inline ${i === step ? "" : "text-soft"}`}>{label}</span>
              {i < stepLabels.length - 1 && (
                <span aria-hidden className="flex-1 h-[2px] mx-1.5" style={{ background: i < step ? `rgb(${farbe} / 0.3)` : "rgb(var(--bg-mute))" }} />
              )}
            </li>
          ))}
        </ol>

        {/* Step 0 — Person */}
        {step === 0 && (
          <section className="surface rounded-2xl p-6 anim-slideUp">
            <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-4">Wer bist du?</h2>
            <div className="space-y-4">
              <Field label="Vor- und Nachname" pflicht>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Maria Schmidt"
                  className="w-full rounded-lg border border-app-soft px-3 py-2 text-[14px] bg-[rgb(var(--bg-elev))] focus:outline-none focus:border-[rgb(var(--accent))]"
                />
              </Field>
              <Field label="E-Mail" pflicht>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@example.com"
                  className="w-full rounded-lg border border-app-soft px-3 py-2 text-[14px] font-mono bg-[rgb(var(--bg-elev))] focus:outline-none focus:border-[rgb(var(--accent))]"
                />
              </Field>
              <p className="text-[12px] text-soft">
                Phase 2: Identitätsbestätigung über eGK / HBA / Ausweis (Postident oder VideoIdent).
                Demo: Schritt überspringen.
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                disabled={!name.trim() || !email.includes("@")}
                onClick={() => setStep(1)}
                className="btn btn-primary text-[13px] disabled:opacity-40"
              >
                Weiter →
              </button>
            </div>
          </section>
        )}

        {/* Step 1 — Mitgliedstyp */}
        {step === 1 && (
          <section className="surface rounded-2xl p-6 anim-slideUp">
            <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-1">Welcher Mitgliedstyp?</h2>
            <p className="text-[12px] text-soft mb-4">
              Bestimmt deine Sicht in der Plattform und dein Mitspracherecht (jede Stimme zählt gleich).
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {(Object.keys(MITGLIED_LABEL) as Mitgliedstyp[]).map((t) => {
                const f = MITGLIED_FARBE[t];
                const aktiv = t === typ;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTyp(t)}
                    className="text-left rounded-xl p-4 border-2 transition-all"
                    style={{
                      background: aktiv ? `rgb(${f} / 0.08)` : "rgb(var(--bg-elev))",
                      borderColor: aktiv ? `rgb(${f} / 0.4)` : "rgb(var(--border-soft))",
                    }}
                  >
                    <div className="font-display text-[14px] font-semibold mb-1" style={{ color: `rgb(${f})` }}>
                      {MITGLIED_LABEL[t]}
                    </div>
                    <p className="text-[11px] text-mute leading-relaxed">
                      {t === "pflegekraft"  && "Pflege-, Therapie-, Sozialberuf — als Mit-Eigentümer der Plattform."}
                      {t === "klient"       && "Empfängerin von Pflege/Begleitung — Selbstbestimmung über deine Akte + Buchungen."}
                      {t === "traeger"      && "Einrichtung / Träger — als Service-Partner statt Verleih-Verhältnis."}
                      {t === "foerderndes"  && "Du unterstützt das Projekt finanziell, ohne aktiv mitzuwirken."}
                      {t === "ehrenamt"     && "Begleitung, Hospiz, Sterbebegleitung — mit Aufwandsentschädigung."}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(0)} className="btn btn-ghost text-[13px]">← Zurück</button>
              <button type="button" onClick={() => setStep(2)} className="btn btn-primary text-[13px]">Weiter →</button>
            </div>
          </section>
        )}

        {/* Step 2 — Anteile */}
        {step === 2 && (
          <section className="surface rounded-2xl p-6 anim-slideUp">
            <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-1">Wie viele Anteile?</h2>
            <p className="text-[12px] text-soft mb-4">
              Pflichtanteil ist 1 (= {NOMINAL_EURO} €). Mehr Anteile sind freiwillig — eine Stimme pro Mitglied,
              unabhängig von der Anzahl.
            </p>

            <div className="surface-mute rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-soft font-medium">Anteile</div>
                  <div className="font-display font-bold text-[36px] leading-none mt-1" style={{ color: `rgb(${farbe})` }}>
                    {anteile}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-soft font-medium">Einlage</div>
                  <div className="font-display font-bold text-[36px] leading-none mt-1">
                    {einlage} <span className="text-[16px] text-mute">€</span>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={anteile}
                onChange={(e) => setAnteile(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: `rgb(${farbe})` }}
              />
              <div className="flex justify-between text-[10px] text-soft mt-1">
                <span>1 (Pflicht)</span>
                <span>20</span>
              </div>
            </div>

            <ul className="space-y-1.5 text-[12px] text-mute">
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Anteile sind <strong>kein Investment</strong> — keine Verzinsung, keine Kursschwankungen.</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Quartals-Ausschüttung anteilig (zuletzt 1 % vom Honorar-Volumen).</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Bei Austritt: Rückzahlung deiner Einlage gemäß GnoSatz (4-Quartals-Frist).</span></li>
            </ul>

            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(1)} className="btn btn-ghost text-[13px]">← Zurück</button>
              <button type="button" onClick={() => setStep(3)} className="btn btn-primary text-[13px]">Weiter →</button>
            </div>
          </section>
        )}

        {/* Step 3 — Bestätigung */}
        {step === 3 && !confirmed && (
          <section className="surface rounded-2xl p-6 anim-slideUp">
            <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-4">Zusammenfassung + Beitritt</h2>

            <ul className="space-y-2 text-[13px] mb-5">
              <li className="flex justify-between gap-3 border-b border-app-soft pb-1.5"><span className="text-mute">Name</span><span className="font-medium">{name}</span></li>
              <li className="flex justify-between gap-3 border-b border-app-soft pb-1.5"><span className="text-mute">E-Mail</span><span className="font-mono text-[12px]">{email}</span></li>
              <li className="flex justify-between gap-3 border-b border-app-soft pb-1.5">
                <span className="text-mute">Mitgliedstyp</span>
                <span className="font-medium" style={{ color: `rgb(${farbe})` }}>{MITGLIED_LABEL[typ]}</span>
              </li>
              <li className="flex justify-between gap-3 border-b border-app-soft pb-1.5"><span className="text-mute">Anteile</span><span className="font-mono">{anteile} ({einlage} €)</span></li>
            </ul>

            <div className="space-y-2 mb-5">
              <label className="flex items-baseline gap-2 cursor-pointer text-[12px]">
                <input type="checkbox" checked={satzungAkzeptiert} onChange={(e) => setSatzungAkzeptiert(e.target.checked)} className="w-4 h-4 mt-0.5" />
                <span>Ich habe die Satzung der Shalem Care eG i.G. zur Kenntnis genommen und akzeptiere sie. <span className="text-soft italic">(Volltext folgt mit Notar-Termin · Stand siehe <Link href="/roadmap" className="underline">Roadmap</Link>)</span></span>
              </label>
              <label className="flex items-baseline gap-2 cursor-pointer text-[12px]">
                <input type="checkbox" checked={datenschutz} onChange={(e) => setDatenschutz(e.target.checked)} className="w-4 h-4 mt-0.5" />
                <span>Ich habe die <Link href="/datenschutz" className="underline">Datenschutz-Erklärung</Link> gelesen.</span>
              </label>
            </div>

            <div className="rounded-lg p-3 mb-5" style={{ background: "rgb(var(--accent) / 0.06)" }}>
              <p className="text-[11px] text-mute leading-relaxed">
                <strong>Nächster Schritt:</strong> Phase 2 — SEPA-Mandat über {einlage} € einmalig zur Einlage.
                Anteile sind nach 28 Tagen aktiv (gesetzliche Bedenkzeit).
              </p>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="btn btn-ghost text-[13px]">← Zurück</button>
              <button
                type="button"
                disabled={!satzungAkzeptiert || !datenschutz}
                onClick={() => setConfirmed(true)}
                className="btn btn-primary text-[13px] disabled:opacity-40"
              >
                Beitritt bestätigen ✓
              </button>
            </div>
          </section>
        )}

        {/* Bestätigung */}
        {confirmed && (
          <section className="surface rounded-2xl p-6 sm:p-8 text-center anim-slideUp">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <Image src="/onboarding/welcome.png" alt="" fill sizes="128px" className="object-contain" />
            </div>
            <h2 className="font-display text-[28px] font-bold tracking-tight2 mb-3">
              Willkommen, <span className="rainbow-text">{name.split(" ")[0]}</span>.
            </h2>
            <p className="text-[14px] text-mute mb-5 leading-relaxed max-w-md mx-auto">
              Du bist jetzt Mitglied Nr. <strong>#{Math.floor(Math.random() * 100) + 12}</strong> — herzlich willkommen
              in der Genossenschaft. Wir schicken dir die SEPA-Bestätigung an <span className="font-mono">{email}</span>.
            </p>
            <Link href="/genossenschaft" className="btn btn-primary inline-flex">
              Zum Mitglieder-Register →
            </Link>
            <Logo size={20} className="accent-text mx-auto mt-8 opacity-50" />
          </section>
        )}
      </main>
    </div>
  );
}

function Field({ label, pflicht, children }: { label: string; pflicht?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[12px] font-medium mb-1.5">
        {label}
        {pflicht && <span className="text-[rgb(var(--mon))] ml-1">*</span>}
      </div>
      {children}
    </label>
  );
}
