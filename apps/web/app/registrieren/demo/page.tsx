// /registrieren/demo · Schnell-Anmeldung als Viewer / Superuser / Tester
//
// Drei Account-Typen für die Lebenssimulation, ohne Verifikations-Hürden.
// Anonym-Signin bietet sofortigen Zugang ohne Email — Profil persistiert
// bis Browser-Cookies gelöscht werden.

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DEMO_MODI, type DemoModus } from "@/lib/auth/demo-modi";
import { ROLLEN, type RegistrierRolle } from "@/lib/auth/rollen";
import { demoAnonymStarten } from "@/lib/auth/demo-actions";

const MODUS_BILD: Record<DemoModus, string> = {
  real:      "/auth/vertrauen-hoch.png",
  viewer:    "/demo/modus-viewer.png",
  superuser: "/demo/modus-superuser.png",
  tester:    "/demo/modus-tester.png",
};

const MODUS_LOOP: Record<DemoModus, string> = {
  real:      "",
  viewer:    "/loops/demo-modus-viewer.mp4",
  superuser: "/loops/demo-modus-superuser.mp4",
  tester:    "/loops/demo-modus-tester.mp4",
};

export const metadata = {
  title: "Demo-Zugang · Shalem Care",
  description: "Probiere Shalem Care aus — als Viewer, Superuser oder Tester. Ohne Email, ohne Berufsnachweis.",
};

const DEMO_REIHENFOLGE: DemoModus[] = ["viewer", "superuser", "tester"];

const ROLLEN_FUER_DEMO: RegistrierRolle[] = [
  "klient", "pflege", "arzt", "therapie", "sozialarbeit", "lead",
];

type SearchParams = { modus?: DemoModus; rolle?: RegistrierRolle; error?: string };

export default async function DemoPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const modus = params.modus && DEMO_MODI[params.modus] ? params.modus : null;
  const rolle = params.rolle && ROLLEN[params.rolle] ? params.rolle : null;
  const errorMsg = params.error;

  // Wenn beide gesetzt: direkt starten
  if (modus && rolle && modus !== "real") {
    async function start() {
      "use server";
      try {
        await demoAnonymStarten({ modus: modus!, rolle: rolle! });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Demo-Start fehlgeschlagen.";
        redirect(`/registrieren/demo?error=${encodeURIComponent(msg)}`);
      }
    }
    return (
      <main className="min-h-screen bg-app">
        <article className="max-w-md mx-auto px-6 py-12 text-center">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Demo-Start</p>
          <h1 className="font-display text-[28px] font-bold tracking-tight2 mb-2">
            Du gehst gleich rein als <span className="rainbow-text">{DEMO_MODI[modus].label}</span> · {ROLLEN[rolle].label}
          </h1>
          <p className="text-[13px] text-mute leading-relaxed mb-6 max-w-prose mx-auto">
            {DEMO_MODI[modus].detail}
          </p>
          <form action={start}>
            <button type="submit" className="btn btn-primary text-[14px]">
              Anonyme Demo-Session starten →
            </button>
          </form>
          <p className="text-[11px] text-soft mt-4">
            Keine Email · keine Verifikation · Profil im Browser-Cookie · jederzeit beendbar.
          </p>
          <p className="text-[11px] text-soft mt-2">
            <Link href="/registrieren/demo" className="hover:text-[rgb(var(--fg))]">← Andere Wahl</Link>
          </p>
        </article>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-4xl mx-auto px-6 sm:px-12 py-12 space-y-10">
        <header>
          <Link href="/registrieren" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Echter Account</Link>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Demo-Zugang · Lebenssimulation</p>
          <h1 className="font-display text-[36px] sm:text-[48px] font-bold tracking-tight3 leading-[1.05]">
            Probier es aus, ohne <span className="rainbow-text">Risiko</span>.
          </h1>
          <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
            Drei Demo-Modi — du wählst deinen Geschmack: nur lesen, voll mitmachen, oder Wiedereinstieg
            simulieren. Keine Email nötig, kein Berufsnachweis. Daten leben im Demo-Pool und
            können sich gegenseitig sehen — wie ein simuliertes Leben.
          </p>
        </header>

        {errorMsg && (
          <section className="surface rounded-xl p-4" style={{ background: "rgb(var(--mon) / 0.06)" }}>
            <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--mon))" }}>Fehler</p>
            <p className="text-[13px]">{errorMsg}</p>
            <p className="text-[11px] text-soft mt-2">
              Falls „Anonymous Sign-in" nicht aktiv ist: Supabase Dashboard → Authentication → Providers → Anonymous → einschalten.
            </p>
          </section>
        )}

        {/* Schritt 1 · Modus wählen */}
        {!modus && (
          <section>
            <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-3">1. Welcher Modus?</h2>
            <ul className="grid sm:grid-cols-3 gap-3">
              {DEMO_REIHENFOLGE.map((id) => {
                const m = DEMO_MODI[id];
                return (
                  <li key={id}>
                    <Link
                      href={`/registrieren/demo?modus=${id}`}
                      className="surface-hover rounded-xl block relative overflow-hidden h-full"
                    >
                      <div className="relative aspect-square">
                        <Image src={MODUS_BILD[id]} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                        <video
                          src={MODUS_LOOP[id]}
                          autoPlay muted loop playsInline
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-hidden
                        />
                      </div>
                      <div className="p-3 relative">
                        <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${m.farbe})` }} />
                        <div className="ml-2.5">
                          <p className="font-display text-[15px] font-bold tracking-tight2 mb-1" style={{ color: `rgb(${m.farbe})` }}>{m.label}</p>
                          <p className="text-[12px] text-mute leading-snug mb-2">{m.beschreibung}</p>
                          <p className="text-[10px] text-soft leading-snug">{m.detail}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="chip text-[9px]" style={{ background: `rgb(${m.farbe} / 0.12)`, color: `rgb(${m.farbe})` }}>
                              {m.schreibrecht ? "schreiben ✓" : "nur lesen"}
                            </span>
                            <span className="chip text-[9px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                              {m.sessionDauerMin ? `${m.sessionDauerMin} min Session` : "unbegrenzt"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Schritt 2 · Rolle wählen */}
        {modus && !rolle && (
          <section>
            <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: `rgb(${DEMO_MODI[modus].farbe})` }}>
              Modus: {DEMO_MODI[modus].label} · <Link href="/registrieren/demo" className="underline">ändern</Link>
            </p>
            <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-3">2. Welche Rolle?</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {ROLLEN_FUER_DEMO.map((id) => {
                const r = ROLLEN[id];
                return (
                  <li key={id}>
                    <Link
                      href={`/registrieren/demo?modus=${modus}&rolle=${id}`}
                      className="surface-hover rounded-xl p-3 block relative overflow-hidden"
                    >
                      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${r.farbe})` }} />
                      <div className="ml-2.5">
                        <span className="font-display text-[14px] font-semibold tracking-tight2">{r.label}</span>
                        <p className="text-[11px] text-mute mt-0.5">{r.beschreibung}</p>
                        <p className="text-[10px] text-soft mt-1 font-mono">→ {r.cockpitPfad}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="text-[11px] text-soft mt-3">
              Mehr Rollen verfügbar nach echter Registrierung mit Berufsnachweis.
            </p>
          </section>
        )}

        <footer className="text-center text-[11px] text-soft pt-4">
          <Link href="/registrieren" className="hover:text-[rgb(var(--fg))]">← Echter Account mit Berufsnachweis</Link>
        </footer>
      </article>
    </main>
  );
}
