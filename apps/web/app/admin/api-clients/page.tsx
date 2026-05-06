// /admin/api-clients · Stationsleitung-Sicht auf registrierte
// API-Konsumenten (Krankenkassen, Träger, Apotheken, Forschung).
//
// Phase-1: Read-Only Liste mit Status + letztem Request. Phase-2:
// Edit-/Pausieren-/Sperren-Buttons + Audit-Log-Drilldown.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { listApiClients, seedApiClientsOnce } from "@/lib/api/clients";

export const metadata = {
  title: "API-Konsumenten · Admin",
};

const STATUS_FARBE = {
  aktiv:     "var(--thu)",
  pausiert:  "var(--sun)",
  gesperrt:  "var(--mon)",
} as const;

const PRICING_LABEL = {
  kostenlos:     "kostenlos",
  traeger_99:    "Träger · 99 €/Mo",
  kasse_499:     "Kasse · 499 €/Mo",
  apotheke_49:   "Apotheke · 49 €/Mo",
  forschung_199: "Forschung · 199 €/Mo",
  bank_inkl:     "Bank-Partner · inkl.",
} as const;

export default function ApiClientsPage() {
  seedApiClientsOnce();
  const clients = listApiClients();

  return (
    <AppShell
      role="lead"
      user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }}
      station="Plattform-Admin"
    >
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] inline-flex items-center gap-1 mb-3" style={{ color: "rgb(var(--fg-mute))" }}>
          ← Admin-Übersicht
        </Link>
        <SectionHeader
          eyebrow="API · v0.1 · Phase-1 Demo"
          titel={<>{clients.length} registrierte API-Konsumenten</>}
          size="large"
          lead={<>Externe Unternehmen mit OAuth2-/Client-Credentials-Zugriff. Spec: <Link href="/entwickler" className="underline" style={{ color: "rgb(var(--accent))" }}>/entwickler</Link>. Volle Doku: docs/API_EXTERNAL.md.</>}
        />
      </header>

      <ul className="space-y-3">
        {clients.map((c) => (
          <li key={c.id} className="surface rounded-2xl p-4 relative overflow-hidden">
            <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${STATUS_FARBE[c.status]})` }} />
            <div className="ml-2.5 grid lg:grid-cols-12 gap-3">
              <div className="lg:col-span-7">
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <h3 className="font-display text-[16px] font-semibold leading-tight">{c.name}</h3>
                  <span className="chip text-[11px]" style={{ background: `rgb(${STATUS_FARBE[c.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[c.status]})` }}>
                    {c.status}
                  </span>
                  <span className="chip text-[11px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                    {c.authMode}
                  </span>
                </div>
                <p className="text-[13px]" style={{ color: "rgb(var(--fg-mute))" }}>
                  {c.organisation}
                  {c.ikNummer && <span className="font-mono"> · IK {c.ikNummer}</span>}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.scopes.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded font-mono" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{s}</span>
                  ))}
                </div>
              </div>
              <dl className="lg:col-span-5 text-[12px] space-y-1">
                <div className="flex gap-2"><dt className="w-32 shrink-0" style={{ color: "rgb(var(--fg-mute))" }}>Pricing</dt><dd>{PRICING_LABEL[c.pricing]}</dd></div>
                <div className="flex gap-2"><dt className="w-32 shrink-0" style={{ color: "rgb(var(--fg-mute))" }}>Rate-Limit</dt><dd>{c.rateLimit.perMin}/min · Burst {c.rateLimit.burst}</dd></div>
                {c.avvUnterzeichnetAm && (
                  <div className="flex gap-2"><dt className="w-32 shrink-0" style={{ color: "rgb(var(--fg-mute))" }}>AVV unterzeichnet</dt><dd>{new Date(c.avvUnterzeichnetAm).toLocaleDateString("de-DE")}</dd></div>
                )}
                {c.webhookUrl && (
                  <div className="flex gap-2"><dt className="w-32 shrink-0" style={{ color: "rgb(var(--fg-mute))" }}>Webhook</dt><dd className="font-mono text-[11px] truncate">{c.webhookUrl}</dd></div>
                )}
                {c.letzterRequestAm && (
                  <div className="flex gap-2"><dt className="w-32 shrink-0" style={{ color: "rgb(var(--fg-mute))" }}>Letzter Request</dt><dd>{c.letzterRequestEndpoint}<br/><span className="text-[11px]" style={{ color: "rgb(var(--fg-mute))" }}>{new Date(c.letzterRequestAm).toLocaleString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></dd></div>
                )}
              </dl>
            </div>
          </li>
        ))}
      </ul>

      <section className="surface rounded-2xl p-5 mt-8">
        <p className="text-[11px] uppercase tracking-wider font-medium mb-2" style={{ color: "rgb(var(--fg-mute))" }}>
          Phase 2 · was als nächstes kommt
        </p>
        <ul className="space-y-1.5 text-[13px] leading-relaxed" style={{ color: "rgb(var(--fg-mute))" }}>
          <li>• Client-Self-Service-Portal (eigenes Secret rotieren, Webhook-URL ändern)</li>
          <li>• mTLS-Zertifikats-Issue + Rotation für Server-zu-Server-Clients</li>
          <li>• Audit-Log-Drilldown pro Client mit accessed_resource Heat-Map</li>
          <li>• Pause-/Sperr-Buttons (Datenpanne → sofort sperren)</li>
          <li>• AVV-PDF-Generator + automatischer DSB-Mailer</li>
          <li>• Stripe-Connect-Auto-Billing pro Pricing-Tier</li>
        </ul>
      </section>
    </AppShell>
  );
}
