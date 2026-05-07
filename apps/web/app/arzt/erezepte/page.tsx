// /arzt/erezepte · eRezept-Pilot-Cockpit für die Ärzt:innen.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CURRENT_USER_ID } from "@/lib/seed";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import {
  erzeugeErezeptBundle,
  listErezepte,
  seedErezepteOnce,
  type Erezept,
  type ErezeptStatus,
} from "@/lib/ti/erezept-store";

export const metadata = {
  title: "eRezept-Pilot · Arzt",
};

const STATUS_LABEL: Record<ErezeptStatus, string> = {
  entwurf: "Entwurf",
  signiert: "Signiert · HBA",
  "im-fdv": "im Fachdienst",
  abgerufen: "Abgerufen · Apotheke",
  abgegeben: "Abgegeben",
  abgerechnet: "Abgerechnet",
  geloescht: "Gelöscht",
};

const STATUS_FARBE: Record<ErezeptStatus, string> = {
  entwurf: "var(--fg-mute)",
  signiert: "var(--vibe-team)",
  "im-fdv": "var(--accent)",
  abgerufen: "var(--sun)",
  abgegeben: "var(--vibe-approval)",
  abgerechnet: "var(--vibe-stats)",
  geloescht: "var(--mon)",
};

export default async function ErezeptePage() {
  seedErezepteOnce();
  const rezepte = listErezepte();
  const persona = await getActivePersona(CURRENT_USER_ID, "arzt");
  const personId = persona.demoPersonId ?? "person-arzt-001";
  const user = userPropsAus(persona, {
    id: personId,
    name: "Dr. Susanne Hartmann",
    subtitle: "Hausärztin · Pilot-Cockpit",
    initials: "SH",
  });

  const offen = rezepte.filter((r) => r.status !== "abgegeben" && r.status !== "abgerechnet" && r.status !== "geloescht");
  const fertig = rezepte.filter((r) => r.status === "abgegeben" || r.status === "abgerechnet");

  return (
    <AppShell role="doctor" user={user} station="Hausarztpraxis">
      <header className="mb-6">
        <Link href="/arzt" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Praxis</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          eRezept-Pilot · gematik FdV · Phase A · Stub
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Elektronisches Rezept
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          Pilot-Cockpit zeigt, wie das eRezept aussieht, bevor wir den
          gematik-Konnektor anbinden. Token + AccessCode sind Stub, das
          FHIR-Bundle ist KBV-konform.
        </p>
      </header>

      <section className="surface rounded-2xl p-4 mb-6" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.06), transparent)" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Pilot-Zugang · was hier echt ist</p>
        <ul className="text-[12px] text-mute space-y-1 leading-relaxed">
          <li>· <strong className="text-[rgb(var(--fg))]">FHIR-Bundle:</strong> nach KBV_PR_ERP_Prescription 1.1 inkl. Composition · MedicationRequest · Medication-PZN · Patient · Coverage</li>
          <li>· <strong className="text-[rgb(var(--fg))]">Token-Format:</strong> 160.000.X.X.X-Schema, gleicher Pattern wie gematik-Tokens</li>
          <li>· <strong className="text-[rgb(var(--fg))]">Stub:</strong> kein gematik-FdV-Versand, keine echte HBA-Signatur — kommt mit RISE-Anbindung</li>
        </ul>
      </section>

      <section className="mb-6">
        <header className="flex items-baseline gap-3 mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Offen</h2>
          <span className="text-[11px] text-soft font-mono">{offen.length}</span>
        </header>
        <ul className="space-y-2">
          {offen.length === 0 ? (
            <li className="text-[13px] text-soft italic">Keine offenen eRezepte.</li>
          ) : (
            offen.map((r) => <Row key={r.id} r={r} />)
          )}
        </ul>
      </section>

      {fertig.length > 0 && (
        <section>
          <header className="flex items-baseline gap-3 mb-3">
            <h2 className="font-display text-[18px] font-bold tracking-tight2">Abgegeben</h2>
            <span className="text-[11px] text-soft font-mono">{fertig.length}</span>
          </header>
          <ul className="space-y-2 opacity-70">
            {fertig.map((r) => <Row key={r.id} r={r} />)}
          </ul>
        </section>
      )}
    </AppShell>
  );
}

function Row({ r }: { r: Erezept }) {
  const farbe = STATUS_FARBE[r.status];
  const bundle = erzeugeErezeptBundle(r);

  return (
    <li className="surface rounded-2xl p-4">
      <div className="flex items-baseline gap-3 flex-wrap mb-2">
        <span
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
          style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
        >
          {STATUS_LABEL[r.status]}
        </span>
        <h3 className="font-display text-[15px] font-bold tracking-tight2">{r.medikament}</h3>
        {r.autIdem && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono bg-[rgb(var(--bg-mute))]">
            aut-idem
          </span>
        )}
        <span className="text-[11px] text-soft font-mono ml-auto">{r.ausgestellt}</span>
      </div>
      <p className="text-[12px] text-mute leading-relaxed mb-2">
        {r.darreichungsform} · {r.packungsgroesse} · {r.anzahl}× · {r.dosierung} · ICD-10 {r.diagnose}
      </p>
      <div className="grid sm:grid-cols-2 gap-2 text-[11px] mb-2">
        <div className="surface-mute rounded-md p-2">
          <p className="text-[10px] text-soft uppercase tracking-wider font-mono">Klient</p>
          <p className="font-mono">{r.klientId} · {r.versichertenNr}</p>
          <p className="text-soft">{r.krankenkasse} · IK {r.krankenkasseIk}</p>
        </div>
        <div className="surface-mute rounded-md p-2">
          <p className="text-[10px] text-soft uppercase tracking-wider font-mono">gematik-Token</p>
          <p className="font-mono break-all text-[10px]">{r.gematikToken}</p>
          <p className="text-soft">AccessCode <span className="font-mono">{r.accessCode}</span></p>
        </div>
      </div>
      {r.apothekeName && (
        <p className="text-[11px] text-soft mt-2">
          📌 Eingelöst bei <strong>{r.apothekeName}</strong> · IK {r.apothekeIk} · {r.abgegeben?.slice(0, 16).replace("T", " ")}
        </p>
      )}
      <details className="mt-3">
        <summary className="text-[11px] text-soft cursor-pointer font-mono">FHIR-Bundle anzeigen ({bundle.entry.length} Resourcen)</summary>
        <pre className="text-[10px] font-mono leading-relaxed overflow-x-auto mt-2 p-2 rounded surface-mute">
          {JSON.stringify(bundle, null, 2).slice(0, 3500)}
          {JSON.stringify(bundle, null, 2).length > 3500 ? "\n…" : ""}
        </pre>
      </details>
    </li>
  );
}
