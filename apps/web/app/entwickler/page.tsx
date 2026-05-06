// /entwickler — öffentliche Developer-Doc für die Shalem Care API v1.
//
// Phase-1 Demo: zeigt das OAuth2-Token-Endpoint, zwei Live-Endpoints,
// curl-Beispiele. Phase-2: Swagger-/OpenAPI-Spec + try-it-out-Sandbox.
//
// Spec: docs/API_EXTERNAL.md

import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { HeroBanner } from "@/components/HeroBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { SmoothReveal } from "@/components/SmoothReveal";
import { RainbowText } from "@/components/Rainbow";
import { NumberedList } from "@/components/NumberedList";
import { BulletList } from "@/components/BulletList";
import { getLocale } from "@/lib/i18n/server";

export const metadata = {
  title: "Entwickler · Shalem Care API",
  description: "Externe API für Krankenkassen, Träger, Apotheken, Forschung. OAuth2 + FHIR-aligned. EU-Hosting, DSGVO-by-Design.",
};

const TOKEN_BEISPIEL = `curl -X POST https://shalem.de/api/v1/oauth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type": "client_credentials",
    "client_id": "diakonie-augsburg",
    "client_secret": "***",
    "scope": "read:eigene-stellen webhook:subscribe"
  }'`;

const POOL_BEISPIEL = `curl https://shalem.de/api/v1/ShalemPoolStelle?region=Bayern \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Accept: application/fhir+json" \\
  -H "X-Shalem-Purpose: traeger-job-aggregation"`;

const PRACTITIONER_BEISPIEL = `curl https://shalem.de/api/v1/Practitioner/me \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Accept: application/fhir+json"`;

export default async function EntwicklerPage() {
  const locale = await getLocale();
  return (
    <div className="min-h-screen bg-app">
      <nav className="max-w-screen-app mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/"><Wordmark rainbow /></Link>
        <div className="flex items-center gap-2.5">
          <LocaleSwitcher current={locale} />
          <Link href="/" className="btn btn-ghost text-[13px] px-3 py-1.5">← Startseite</Link>
        </div>
      </nav>

      <HeroBanner
        bild="/akte/header-ki-bruecke.png"
        variante="tall"
        eyebrow="Shalem Care API · v0.1 · Phase-1 Demo"
        titel={<>Externe Anbindung — <RainbowText>FHIR-aligned, DSGVO-first</RainbowText>.</>}
        untertitel={
          <>
            Krankenkassen, Träger, Apotheken, Forschung. OAuth2 + Bearer-Token, EU-Region-Hosting,
            granulare Scopes pro Endpoint. Diese Seite zeigt zwei Live-Endpoints + ein Token-Endpoint;
            volle Spec siehe <a href="https://github.com/dkorn85/shalem-care/blob/main/docs/API_EXTERNAL.md" className="underline">docs/API_EXTERNAL.md</a>.
          </>
        }
      />

      <article className="max-w-4xl mx-auto px-6 sm:px-12 py-12 space-y-12">

        {/* 3-Schritt Onboarding */}
        <SmoothReveal direction="up">
          <section>
            <SectionHeader
              eyebrow="In drei Schritten"
              titel="Wie ihr euch anbindet"
              size="large"
              accent="var(--accent)"
            />
            <NumberedList
              variante="horizontal"
              className="mt-4"
              items={[
                { nummer: 1, titel: "AVV unterzeichnen", text: "Standard-Auftragsverarbeitung nach Art. 28 DSGVO. Templates auf Anfrage. Wir führen Verzeichnis nach Art. 30.", akzent: "var(--vibe-team)" },
                { nummer: 2, titel: "Client-Credentials erhalten", text: "client_id + client_secret per verschlüsselter Email. Phase-2 → mTLS-Cert + Rotation alle 12 Monate.", akzent: "var(--vibe-stats)" },
                { nummer: 3, titel: "Token + Endpoint", text: "POST /oauth/token → access_token. Bearer-Header → API. Webhooks subscribed über client_credentials-Grant.", akzent: "var(--thu)" },
              ]}
            />
          </section>
        </SmoothReveal>

        {/* OAuth2 Token Endpoint */}
        <SmoothReveal direction="up">
          <section>
            <SectionHeader
              eyebrow="Schritt 1 · POST /api/v1/oauth/token"
              titel="Access-Token holen"
              size="medium"
              accent="var(--vibe-team)"
            />
            <p className="text-[14px] mt-2 leading-relaxed" style={{ color: "rgb(var(--fg-mute))" }}>
              client_credentials-Grant für Server-zu-Server. Phase-1 ohne client_secret-Validation
              (Demo); Phase-2 mit bcrypt-Compare. Token TTL 3600 s.
            </p>
            <pre className="surface rounded-xl p-4 mt-3 overflow-x-auto text-[12px] font-mono leading-relaxed" style={{ background: "rgb(var(--bg-mute))" }}>{TOKEN_BEISPIEL}</pre>
            <details className="mt-3">
              <summary className="text-[12px] cursor-pointer hover:text-[rgb(var(--fg))]" style={{ color: "rgb(var(--fg-mute))" }}>Antwort-Beispiel</summary>
              <pre className="surface rounded-xl p-3 mt-2 overflow-x-auto text-[11px] font-mono" style={{ background: "rgb(var(--bg-mute))" }}>{`{
  "access_token": "shalem_abc123def456...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "expires_at": "2026-05-06T13:00:00.000Z",
  "scope": "read:eigene-stellen webhook:subscribe"
}`}</pre>
            </details>
          </section>
        </SmoothReveal>

        {/* Endpoint 1: Practitioner/me */}
        <SmoothReveal direction="up">
          <section>
            <SectionHeader
              eyebrow="Endpoint · GET /api/v1/Practitioner/me"
              titel="Eigenes Mitglieder-Profil"
              size="medium"
              accent="var(--mon)"
            />
            <p className="text-[14px] mt-2 leading-relaxed" style={{ color: "rgb(var(--fg-mute))" }}>
              FHIR-R4-Practitioner-Resource des authentisierten Mitglieds. Scope: <code className="text-[12px] font-mono" style={{ color: "rgb(var(--accent))" }}>read:mitglied-eigen</code>.
              Phase-2 → mit Care-Team-Mapping auf Patient/$everything erweitert.
            </p>
            <pre className="surface rounded-xl p-4 mt-3 overflow-x-auto text-[12px] font-mono leading-relaxed" style={{ background: "rgb(var(--bg-mute))" }}>{PRACTITIONER_BEISPIEL}</pre>
            <details className="mt-3">
              <summary className="text-[12px] cursor-pointer hover:text-[rgb(var(--fg))]" style={{ color: "rgb(var(--fg-mute))" }}>Antwort-Beispiel</summary>
              <pre className="surface rounded-xl p-3 mt-2 overflow-x-auto text-[11px] font-mono" style={{ background: "rgb(var(--bg-mute))" }}>{`{
  "resourceType": "Practitioner",
  "id": "person-dr",
  "active": true,
  "name": [{
    "use": "official",
    "text": "Dennis Reuter",
    "family": "Reuter",
    "given": ["Dennis"]
  }],
  "qualification": [
    { "code": { "text": "Pflegefachkraft" } }
  ],
  "extension": [
    { "url": "https://shalem.de/fhir/StructureDefinition/tariffGrade",
      "valueString": "TVOED-P_P9" }
  ]
}`}</pre>
            </details>
          </section>
        </SmoothReveal>

        {/* Endpoint 2: ShalemPoolStelle */}
        <SmoothReveal direction="up">
          <section>
            <SectionHeader
              eyebrow="Endpoint · GET /api/v1/ShalemPoolStelle"
              titel="Offene Pool-Stellen für Träger-Aggregation"
              size="medium"
              accent="var(--vibe-team)"
            />
            <p className="text-[14px] mt-2 leading-relaxed" style={{ color: "rgb(var(--fg-mute))" }}>
              FHIR-Bundle (searchset) mit ShalemPoolStelle-Resources. Filter: <code className="text-[12px] font-mono">region</code>,{" "}
              <code className="text-[12px] font-mono">typ</code> (festanstellung/schicht/vertretung/tour),{" "}
              <code className="text-[12px] font-mono">offen</code> (default true).
              Scope: <code className="text-[12px] font-mono" style={{ color: "rgb(var(--accent))" }}>read:eigene-stellen</code>.
            </p>
            <pre className="surface rounded-xl p-4 mt-3 overflow-x-auto text-[12px] font-mono leading-relaxed" style={{ background: "rgb(var(--bg-mute))" }}>{POOL_BEISPIEL}</pre>
          </section>
        </SmoothReveal>

        {/* Quick Try */}
        <SmoothReveal direction="up">
          <section className="surface rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.06), transparent)" }}>
            <SectionHeader
              eyebrow="Schnell-Test · ohne Anmeldung"
              titel="Demo-Tokens für die drei Beispiel-Clients"
              size="medium"
              accent="var(--accent)"
            />
            <p className="text-[14px] mt-2 leading-relaxed" style={{ color: "rgb(var(--fg-mute))" }}>
              Phase-1 läuft mit Seed-Daten und Test-Clients. Probiere direkt:
            </p>
            <BulletList
              className="mt-3"
              size="md"
              marker="color"
              items={[
                { text: <><strong>diakonie-augsburg</strong> · Träger · Scopes: read/write:eigene-stellen, webhook:subscribe</>, akzent: "var(--vibe-team)" },
                { text: <><strong>aok-bayern-prod</strong> · Krankenkasse · Scopes: read:mitglied-eigen, webhook:subscribe</>, akzent: "var(--vibe-stats)" },
                { text: <><strong>apotheke-am-markt</strong> · Apotheke · Scopes: read:erezepte, write:erezept-status</>, akzent: "var(--thu)" },
              ]}
            />
            <p className="text-[12px] mt-3 italic" style={{ color: "rgb(var(--fg-mute))" }}>
              Hinweis: Phase-1 prüft client_secret nicht — Demo-Modus. Vor Produktiv-Pilot wird ein
              echtes Secret-Hashing-Setup deployed.
            </p>
          </section>
        </SmoothReveal>

        {/* Roadmap */}
        <SmoothReveal direction="up">
          <section>
            <SectionHeader
              eyebrow="Roadmap"
              titel="Was noch kommt — und wann"
              size="medium"
            />
            <BulletList
              className="mt-3"
              size="md"
              marker="chevron"
              items={[
                { text: <><strong>Phase 0.2 · Q4 2026:</strong> mTLS für Krankenkassen, Coverage + MedicationRequest, Webhooks krankmeldung.*</> },
                { text: <><strong>Phase 0.3 · Q4 2026:</strong> Patient/$everything (DSGVO Art. 20 Datenexport) + DSGVO-Audit-Log + Solidar-Topf-Webhooks</> },
                { text: <><strong>Phase 0.4 · Q1 2027:</strong> Aggregate-Endpoints mit k-Anonymity ≥ 5 + Forschungs-Pilot</> },
                { text: <><strong>Phase 0.5 · Q2 2027:</strong> SMART-on-FHIR + Charité-Pilot</> },
                { text: <><strong>v1.0 · Q2 2027:</strong> Public Launch + Pricing-Modell live (Mitglied kostenlos, Träger 99/Mo, Kasse 499/Mo)</> },
              ]}
            />
          </section>
        </SmoothReveal>

        {/* Lawful Basis */}
        <SmoothReveal direction="up">
          <section className="surface rounded-2xl p-5">
            <SectionHeader
              eyebrow="DSGVO-Architektur"
              titel="Was wir tun, was wir nicht tun"
              size="medium"
            />
            <BulletList
              className="mt-3"
              size="md"
              marker="dot"
              items={[
                { text: <>Audit-Log pro Request mit accessed_resource, purpose, requester_id (siehe ShalemAuditLog-Endpoint)</> },
                { text: <>Aggregate-Endpoints liefern null wenn k-Anonymity {"<"} 5 nicht erfüllt</> },
                { text: <>Webhooks senden pseudonyme IDs wo möglich; Klartextdaten nur mit explizitem Consent</> },
                { text: <><strong>Nicht angeboten:</strong> Diagnose-API · Patient-Lookup ohne Consent · LLM-Pass-through · Voice-Cloning-API</> },
                { text: <>Datenpannen-Meldepflicht binnen 24 h an Shalem-Care-eG zusätzlich zu eigener Aufsichtsbehörde</> },
              ]}
            />
          </section>
        </SmoothReveal>

        <footer className="text-center text-[13px] pt-4 pb-8" style={{ color: "rgb(var(--fg-mute))" }}>
          <Link href="/compliance" className="hover:text-[rgb(var(--fg))]">Compliance</Link>
          <span className="mx-2">·</span>
          <Link href="/datenschutz" className="hover:text-[rgb(var(--fg))]">Datenschutz</Link>
          <span className="mx-2">·</span>
          <a href="https://github.com/dkorn85/shalem-care/blob/main/docs/API_EXTERNAL.md" className="hover:text-[rgb(var(--fg))]">Volle Spec auf GitHub</a>
          <span className="mx-2">·</span>
          <Link href="/" className="hover:text-[rgb(var(--fg))]">← Startseite</Link>
        </footer>
      </article>
    </div>
  );
}
