import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import {
  getPayoutAccount,
  getPayerProfile,
  listAllPayments,
  summaryForPractitioner,
} from "@/lib/pay/pay-service";
import {
  onboardPractitionerAction,
  refreshPractitionerStatusAction,
  onboardPayerAction,
  chargeForShiftAction,
  refundPaymentAction,
} from "@/lib/pay/pay-actions";
import { STRIPE_MODE } from "@/lib/pay/stripe-client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const TRAEGER_PAYER_ID = "facility-pulmologie-3b";

export default async function ZahlungenPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const people = (await store.listPeople()).filter((p) => p.role === "nurse");

  // Status laden
  const accounts = people.map((p) => ({
    person: p,
    account: getPayoutAccount(p.id),
    summary: summaryForPractitioner({
      practitionerId: p.id,
      from: "2026-05-01T00:00:00Z",
      to: "2026-05-31T23:59:59Z",
    }),
  }));

  const traeger = getPayerProfile(TRAEGER_PAYER_ID);
  const payments = listAllPayments();

  return (
    <AppShell
      role="lead"
      user={{ name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Zahlungen</h1>
        <p className="text-[13px] text-mute mt-1">
          Stripe-Connect-Setup, Mehrparteien-Flow, Plattform-Cut.
          {" "}
          <span className="chip" style={{ background: STRIPE_MODE === "mock" ? "rgb(var(--tue) / 0.15)" : "rgb(var(--thu) / 0.15)", color: STRIPE_MODE === "mock" ? "rgb(var(--tue))" : "rgb(var(--thu))" }}>
            Stripe-Modus: {STRIPE_MODE}
          </span>
        </p>
      </header>

      <section className="mb-8">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Träger-Account (Zahler)</h2>
        {traeger ? (
          <div className="surface rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-medium">Pulmologie 3B</div>
              <div className="text-[12px] text-mute font-mono mt-0.5">Stripe-Customer: {traeger.stripeCustomerId}</div>
            </div>
            <span className="chip" style={{ background: "rgb(var(--thu) / 0.15)", color: "rgb(var(--thu))" }}>onboarded</span>
          </div>
        ) : (
          <form
            action={async () => {
              "use server";
              await onboardPayerAction({
                payerId: TRAEGER_PAYER_ID,
                type: "facility",
                email: "buchhaltung@pulmologie-3b.de",
                name: "Pulmologie 3B",
              });
            }}
            className="surface rounded-xl p-4 flex items-center justify-between"
          >
            <div className="text-[13px] text-mute">Träger ist noch nicht als Stripe-Customer angelegt.</div>
            <button type="submit" className="btn btn-primary">Träger onboarden</button>
          </form>
        )}
      </section>

      <section className="mb-8">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Pflegekräfte (Zahlungs-Empfänger)</h2>
        <div className="space-y-2">
          {accounts.map(({ person, account, summary }, idx) => (
            <article
              key={person.id}
              className="surface rounded-xl p-4 anim-float relative overflow-hidden"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ background: account?.status === "active" ? "rgb(var(--thu))" : "rgb(var(--tue))" }}
              />
              <div className="ml-2 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium">{person.name}</div>
                  {account ? (
                    <div className="text-[12px] text-mute mt-1 font-mono">
                      {account.stripeAccountId} · status: {account.status} · payouts: {account.payoutsEnabled ? "aktiv" : "—"}
                    </div>
                  ) : (
                    <div className="text-[12px] text-soft mt-1">Noch kein Connect-Account</div>
                  )}
                  {summary.paymentsCount > 0 && (
                    <div className="text-[12px] text-mute mt-1.5">
                      Mai 2026: {summary.paymentsCount} Zahlungen · Brutto {(summary.grossCents / 100).toFixed(2)} € · Cut {(summary.platformFeeCents / 100).toFixed(2)} € · Netto {(summary.netCents / 100).toFixed(2)} €
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!account && (
                    <form action={async () => {
                      "use server";
                      await onboardPractitionerAction({ practitionerId: person.id, email: `${person.id}@example.com` });
                    }}>
                      <button type="submit" className="btn">Onboarden</button>
                    </form>
                  )}
                  {account && account.status !== "active" && (
                    <form action={async () => {
                      "use server";
                      await refreshPractitionerStatusAction(person.id);
                    }}>
                      <button type="submit" className="btn">Status prüfen</button>
                    </form>
                  )}
                  {account?.status === "active" && traeger && (
                    <form action={async () => {
                      "use server";
                      await chargeForShiftAction({
                        shiftId: `demo-shift-${Date.now()}`,
                        payerId: TRAEGER_PAYER_ID,
                        practitionerId: person.id,
                        amountCents: 21000,
                        description: `Demo: Schicht für ${person.name}, 8h × 26,25 €`,
                      });
                    }}>
                      <button type="submit" className="btn btn-primary">Demo-Zahlung 210 €</button>
                    </form>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Zahlungs-Historie</h2>
        {payments.length === 0 ? (
          <div className="surface rounded-xl p-6 text-center text-[13px] text-mute">
            Noch keine Zahlungen gelaufen. Onboarde eine Pflegekraft und löse eine Demo-Zahlung aus.
          </div>
        ) : (
          <div className="surface rounded-xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 border-b border-app-soft text-[11px] uppercase text-soft tracking-wide font-medium">
              <div className="col-span-3">Zeit</div>
              <div className="col-span-3">Pflegekraft</div>
              <div className="col-span-2 text-right">Brutto</div>
              <div className="col-span-2 text-right">Cut</div>
              <div className="col-span-2 text-right">Netto</div>
            </div>
            <ul className="divide-y divide-[rgb(var(--border-soft))]">
              {payments.map((p, idx) => {
                const person = people.find((x) => x.id === p.practitionerId);
                const color = ["var(--mon)", "var(--tue)", "var(--thu)", "var(--fri)", "var(--sun)"][idx % 5];
                return (
                  <li
                    key={p.id}
                    className="relative grid grid-cols-2 sm:grid-cols-12 gap-3 px-5 py-3 anim-float items-center"
                    style={{ animationDelay: `${idx * 0.03}s` }}
                  >
                    <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${color})` }} />
                    <div className="text-[12px] text-mute font-mono sm:col-span-3">{format(new Date(p.createdAt), "d.M. HH:mm:ss", { locale: de })}</div>
                    <div className="text-[13px] sm:col-span-3">
                      {person?.name ?? p.practitionerId}
                      <span className="ml-2 chip" style={{ background: p.status === "succeeded" ? "rgb(var(--thu) / 0.15)" : p.status === "refunded" ? "rgb(var(--mon) / 0.15)" : "rgb(var(--tue) / 0.15)", color: p.status === "succeeded" ? "rgb(var(--thu))" : p.status === "refunded" ? "rgb(var(--mon))" : "rgb(var(--tue))" }}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-[13px] font-mono sm:col-span-2 sm:text-right">{(p.amountCents / 100).toFixed(2)} €</div>
                    <div className="text-[13px] font-mono text-mute sm:col-span-2 sm:text-right">{(p.platformFeeCents / 100).toFixed(2)} €</div>
                    <div className="text-[13px] font-mono font-semibold sm:col-span-2 sm:text-right">{(p.payoutCents / 100).toFixed(2)} €</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <p className="text-[11px] text-soft mt-8 max-w-prose">
        Hinweis Phase-1-PoC: Im Mock-Modus (kein <code className="font-mono">STRIPE_SECRET_KEY</code> gesetzt) werden Stripe-Calls simuliert. Setze die Env-Variable, um echte Stripe-Test-Calls zu machen — Doku in <code className="font-mono">docs/PAY_LAYER.md</code>.
      </p>
    </AppShell>
  );
}
