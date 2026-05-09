// /identity/[id] · Detail-Page für eine Identität.
// Zeigt Stammdaten, Claim-Status + Code, Audit-Trail, Verwaltungs-Aktionen
// (neuer Code, Claim widerrufen).

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { IdentityBadge, ClaimTokenAnzeige } from "@/components/identity/IdentityBadge";
import { IdentityVerwaltungActions } from "@/components/identity/IdentityVerwaltungActions";
import { getIdentity, seedIdentityOnce } from "@/lib/identity/store";

const BERUF_LABEL: Record<string, string> = {
  pflege: "Pflege", arzt: "Arzt", therapie: "Therapie", sozial: "Sozial",
  heilerziehung: "Heilerziehung", hauswirtschaft: "Hauswirtschaft",
  erziehung: "Erziehung", ehrenamt: "Ehrenamt", kasse: "Kasse",
  lead: "PDL", verwaltung: "Verwaltung", klient: "Selbst",
};

export default async function IdentityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  seedIdentityOnce();
  const { id } = await params;
  const e = getIdentity(id);
  if (!e) notFound();

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Verwaltung", initials: "D1" }} station="Identity-Detail">
      <header className="mb-5">
        <Link href="/identity" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Identity-Registry
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">{e.art === "klient" ? "Klient:in" : "Mitarbeiter:in"} · ID</p>
            <h1 className="font-display text-[28px] font-bold tracking-tight2 mt-0.5">{e.name}</h1>
            <code className="text-[11px] text-soft font-mono">{e.id}</code>
          </div>
          <IdentityBadge id={e.id} klickbar={false} size="md" />
        </div>
      </header>

      <LerneTipp rolle="lead" titel="Was passiert hier?">
        Diese Identität wurde am <strong>{e.angelegtAm}</strong> von {BERUF_LABEL[e.angelegtVon] ?? e.angelegtVon}
        angelegt. Solange der Status <em>unbeansprucht</em> ist, hält der Träger die Daten
        treuhänderisch. Sobald die Person den Code einlöst, ist sie <strong>Datenhalterin</strong>
        nach DSGVO Art. 4 Nr. 1 — der Träger wird zur reinen Datenverarbeitungs-Stelle. Bei
        verlorenem Code: „Neuen Code erzeugen" — alter Code wird sofort ungültig.
      </LerneTipp>

      {/* Claim-Token sichtbar wenn unbeansprucht oder widerrufen */}
      {e.claimStatus !== "geclaimt" && (
        <section className="surface rounded-2xl p-5 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-approval))" }}>
          <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
            <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>
              Claim-Code · zur Übergabe an die Person
            </p>
            <Link href="/identity/claim" className="text-[11px] text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline">
              Claim-Page öffnen →
            </Link>
          </header>
          <ClaimTokenAnzeige token={e.claimToken} />
          <p className="text-[12px] text-mute leading-relaxed mt-3">
            Diesen Code mündlich, ausgedruckt oder per QR (Phase 2) an {e.name} weitergeben.
            Sobald der Code auf <code className="font-mono text-[11px]">/identity/claim</code>
            eingegeben wird, ist {e.name === "Helga Reinhardt" ? "sie" : "die Person"}
            Inhaber:in des Profils und kann sich selbst einloggen.
          </p>
        </section>
      )}

      {e.claimStatus === "geclaimt" && (
        <section className="surface rounded-2xl p-5 mb-5" style={{ borderLeft: "3px solid rgb(var(--thu))", background: "rgb(var(--thu) / 0.05)" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--thu))" }}>
            ● Geclaimt · Datenhoheit liegt bei der Person
          </p>
          <p className="text-[13px] mt-1.5 leading-relaxed">
            <strong>{e.name}</strong> hat das Profil am <span className="font-mono">{e.claimedAt?.slice(0, 10) ?? "—"}</span>
            via <em>{e.claimedVia ?? "code"}</em> übernommen. Der Träger handelt ab hier als
            Datenverarbeiter im Auftrag — Auskunfts-, Lösch- und Übertragungsrechte (DSGVO
            Art. 15–20) liegen bei der Person.
          </p>
        </section>
      )}

      {/* Audit + Stammdaten */}
      <section className="surface rounded-2xl p-5 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Stammdaten + Audit</p>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
          <Row label="Art"            value={e.art === "klient" ? "Klient:in" : "Mitarbeiter:in"} />
          <Row label="ID"             value={e.id} mono />
          <Row label="Initialen"      value={e.initials} mono />
          <Row label="Status"         value={e.claimStatus} />
          {e.mitarbeiterRolle && <Row label="Berufsrolle" value={BERUF_LABEL[e.mitarbeiterRolle] ?? e.mitarbeiterRolle} />}
          {e.einrichtungId && <Row label="Einrichtung"   value={e.einrichtungId} mono />}
          {e.stationId && <Row label="Station"            value={e.stationId} mono />}
          <Row label="Angelegt am"    value={e.angelegtAm} mono />
          <Row label="Angelegt von"   value={BERUF_LABEL[e.angelegtVon] ?? e.angelegtVon} />
          {e.angelegtVonPersonId && <Row label="durch"   value={e.angelegtVonPersonId} mono />}
          {e.claimedAt && <Row label="Geclaimt am"        value={e.claimedAt.slice(0, 10)} mono />}
          {e.claimedVia && <Row label="Claim-Methode"     value={e.claimedVia} />}
        </dl>
      </section>

      <NurAbProfi rolle="lead">
        <IdentityVerwaltungActions id={e.id} status={e.claimStatus} />
      </NurAbProfi>
    </AppShell>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-soft uppercase tracking-wide text-[10px]">{label}</dt>
      <dd className={mono ? "font-mono text-[11px]" : ""}>{value}</dd>
    </>
  );
}
