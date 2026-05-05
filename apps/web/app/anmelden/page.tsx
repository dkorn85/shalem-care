// /anmelden — Login für bereits registrierte Accounts.
// Spiegelt /registrieren, aber mit Fokus "schon Konto vorhanden".

import Link from "next/link";
import { redirect } from "next/navigation";
import { startOAuth, signUpWithEmail } from "@/lib/auth/actions";

export const metadata = {
  title: "Anmelden · Shalem Care",
  description: "Login für bestehende Accounts.",
};

export const dynamic = "force-dynamic";

type SearchParams = { provider?: string; error?: string };

const SOCIAL_PROVIDER = ["google", "apple", "azure", "github"];

export default async function AnmeldenPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  if (params.provider && SOCIAL_PROVIDER.includes(params.provider)) {
    try {
      await startOAuth(params.provider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "OAuth-Start fehlgeschlagen.";
      redirect(`/anmelden?error=${encodeURIComponent(msg)}`);
    }
  }

  async function handleEmailLogin(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) {
      redirect(`/anmelden?error=${encodeURIComponent("Email + Passwort erforderlich.")}`);
    }
    // signInWithPassword nutzen
    const { serverClient } = await import("@/lib/auth/client");
    const supabase = await serverClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(`/anmelden?error=${encodeURIComponent(error.message)}`);
    }
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-md mx-auto px-6 py-12">
        <Link href="/" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-4">← Startseite</Link>

        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Anmelden</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2 mb-1 leading-tight">
          Willkommen <span className="rainbow-text">zurück</span>.
        </h1>
        <p className="text-[13px] text-mute mb-6">
          Login für bestehende Accounts. Noch keinen?{" "}
          <Link href="/registrieren" className="text-[rgb(var(--accent))] hover:underline">Konto anlegen</Link>.
        </p>

        {params.error && (
          <section className="surface rounded-xl p-3 mb-5" style={{ background: "rgb(var(--mon) / 0.06)" }}>
            <p className="text-[12px]" style={{ color: "rgb(var(--mon))" }}>{params.error}</p>
          </section>
        )}

        {/* OAuth-Buttons */}
        <div className="space-y-2 mb-5">
          {SOCIAL_PROVIDER.map((p) => (
            <Link
              key={p}
              href={`/anmelden?provider=${p}`}
              className="surface-hover rounded-lg p-3 flex items-center justify-between text-[13px] font-medium"
            >
              <span>Mit {p === "google" ? "Google" : p === "apple" ? "Apple" : p === "azure" ? "Microsoft" : "GitHub"} anmelden</span>
              <span className="text-mute">→</span>
            </Link>
          ))}
        </div>

        <div className="text-center text-[11px] text-soft my-5">— oder —</div>

        {/* Email/Pass-Form */}
        <form action={handleEmailLogin} className="space-y-3">
          <label className="block">
            <span className="text-[12px] font-medium block mb-1.5">Email</span>
            <input type="email" name="email" required autoComplete="email"
              className="w-full surface-mute rounded-lg p-2.5 text-[13px] focus:outline-none focus:ring-1"
              style={{ ["--tw-ring-color" as string]: "rgb(var(--accent) / 0.4)" }} />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium block mb-1.5">Passwort</span>
            <input type="password" name="password" required autoComplete="current-password"
              className="w-full surface-mute rounded-lg p-2.5 text-[13px] focus:outline-none focus:ring-1"
              style={{ ["--tw-ring-color" as string]: "rgb(var(--accent) / 0.4)" }} />
          </label>
          <button type="submit" className="btn btn-primary w-full text-[13px]">Anmelden</button>
        </form>

        <p className="text-[11px] text-soft text-center mt-5">
          Demo ohne Anmeldung? <Link href="/registrieren/demo" className="text-[rgb(var(--accent))] hover:underline">Demo-Zugang</Link>
        </p>
      </article>
    </main>
  );
}
