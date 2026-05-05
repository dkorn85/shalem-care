// /registrieren/start?provider=<id>
//
// Diese Seite wird von /registrieren angesprungen wenn ein Provider geklickt
// wird. Sie führt direkt die Server-Action startOAuth() aus, die uns zu
// Google/Apple/etc. redirected. Bei email/password zeigt sie das Form.

import { redirect } from "next/navigation";
import Link from "next/link";
import { startOAuth, signUpWithEmail } from "@/lib/auth/actions";
import { isNextRedirectError } from "@/lib/auth/redirect-error";

export const dynamic = "force-dynamic";

const SOCIAL_PROVIDER = ["google", "apple", "azure", "github"];

type SearchParams = { provider?: string; error?: string };

export default async function StartPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const provider = params.provider;
  const errorMsg = params.error;

  if (provider && SOCIAL_PROVIDER.includes(provider)) {
    // Server-Action direkt ausführen — leitet weiter zum Provider-OAuth-Endpoint.
    // Wichtig: redirect() wirft intern NEXT_REDIRECT — das muss ans Framework
    // durchgereicht werden, NICHT abgefangen. Wir fangen nur echte Fehler.
    try {
      await startOAuth(provider);
      // startOAuth() endet mit redirect() und kehrt nie zurück.
    } catch (err) {
      if (isNextRedirectError(err)) throw err;
      const msg = err instanceof Error ? err.message : "OAuth-Start fehlgeschlagen.";
      redirect(`/registrieren/start?error=${encodeURIComponent(msg)}`);
    }
  }

  // Email-Pfad oder Fehler-Anzeige
  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-md mx-auto px-6 py-12">
        <Link href="/registrieren" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-4">← Anbieter wählen</Link>

        {errorMsg && (
          <section className="surface rounded-xl p-4 mb-5" style={{ background: "rgb(var(--mon) / 0.06)" }}>
            <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--mon))" }}>Fehler</p>
            <p className="text-[13px] leading-relaxed">{errorMsg}</p>
            <p className="text-[11px] text-soft mt-2 leading-relaxed">
              Wenn der Provider in Supabase noch nicht konfiguriert ist, siehe <code className="font-mono text-[11px]">docs/AUTH_SETUP.md</code>.
            </p>
          </section>
        )}

        {provider === "email" || !provider ? (
          <>
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Anmeldung mit Email</p>
            <h1 className="font-display text-[28px] font-bold tracking-tight2 mb-4 leading-tight">
              Konto <span className="rainbow-text">anlegen</span>
            </h1>
            <EmailSignupForm />
          </>
        ) : null}
      </article>
    </main>
  );
}

function EmailSignupForm() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || password.length < 8) {
      redirect(`/registrieren/start?provider=email&error=${encodeURIComponent("Email + Passwort (mind. 8 Zeichen) erforderlich.")}`);
    }
    const result = await signUpWithEmail({ email, password });
    if (!result.ok) {
      redirect(`/registrieren/start?provider=email&error=${encodeURIComponent(result.error)}`);
    }
    redirect(`/registrieren/start?provider=email&success=1`);
  }
  return (
    <form action={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="text-[12px] font-medium block mb-1.5">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full surface-mute rounded-lg p-2.5 text-[13px] focus:outline-none focus:ring-1"
          style={{ ["--tw-ring-color" as string]: "rgb(var(--accent) / 0.4)" }}
        />
      </label>
      <label className="block">
        <span className="text-[12px] font-medium block mb-1.5">Passwort (mind. 8 Zeichen)</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full surface-mute rounded-lg p-2.5 text-[13px] focus:outline-none focus:ring-1"
          style={{ ["--tw-ring-color" as string]: "rgb(var(--accent) / 0.4)" }}
        />
      </label>
      <button type="submit" className="btn btn-primary w-full text-[13px]">Konto anlegen</button>
      <p className="text-[11px] text-soft text-center pt-1">
        Du bekommst eine Bestätigungs-Email — Klick auf den Link → eingeloggt.
      </p>
    </form>
  );
}
