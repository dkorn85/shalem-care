// /admin/ti/karten · HBA + SMC-B Karten-Cockpit

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  KARTEN_STATUS_FARBE,
  KARTEN_STATUS_LABEL,
  PIN_STATUS_LABEL,
  kartenKpi,
  listKarten,
  seedKartenOnce,
  tageBisAblauf,
  verlaengerungsHinweis,
  type Karte,
} from "@/lib/ti/karten-store";

export const metadata = {
  title: "TI-Karten · HBA + SMC-B",
};

const TYP_LABEL: Record<Karte["typ"], string> = {
  hba: "HBA · Heilberufeausweis",
  "smc-b": "SMC-B · Betriebsstätte",
};

const HINWEIS_FARBE = {
  ok: "var(--vibe-approval)",
  bald: "var(--sun)",
  kritisch: "var(--mon)",
  abgelaufen: "var(--mon)",
};

export default function KartenCockpit() {
  seedKartenOnce();
  const karten = listKarten();
  const kpi = kartenKpi();

  const hba = karten.filter((k) => k.typ === "hba");
  const smcb = karten.filter((k) => k.typ === "smc-b");

  return (
    <AppShell
      role="lead"
      user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Telematik-Infrastruktur · Karten-Verwaltung
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          HBA + SMC-B
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          Heilberufeausweise (personenbezogen) und SMC-B-Karten
          (Betriebsstätte) — Lifecycle, PIN-Status, Verlängerungs-Reminder
          90/30 Tage vor Ablauf.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <Mini label="HBA aktiv" value={String(kpi.hba)} farbe="var(--vibe-profile)" />
        <Mini label="SMC-B aktiv" value={String(kpi.smcb)} farbe="var(--accent)" />
        <Mini
          label="Bald Verlängerung"
          value={String(kpi.bald)}
          farbe="var(--sun)"
          alarm={kpi.bald > 0}
        />
        <Mini
          label="PIN blockiert"
          value={String(kpi.pinBlockiert)}
          farbe="var(--mon)"
          alarm={kpi.pinBlockiert > 0}
        />
      </section>

      <section className="surface rounded-2xl p-4 mb-6" style={{ background: "linear-gradient(135deg, rgb(var(--vibe-team) / 0.06), transparent)" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
          Phase A · was hier echt ist
        </p>
        <ul className="text-[12px] text-mute space-y-1 leading-relaxed">
          <li>· <strong className="text-[rgb(var(--fg))]">Echt:</strong> Daten-Modell · ICCSN · Telematik-ID · LANR/BSNR/IK · VDA · Verlängerungs-Logik</li>
          <li>· <strong className="text-[rgb(var(--fg))]">Stub:</strong> kein gematik-VZD-LDAP-Abgleich · keine Connector-API für PIN-Status-Sync</li>
          <li>· <strong className="text-[rgb(var(--fg))]">Phase B:</strong> automatischer VZD-Sync · gematik-Konnektor-Polling für PIN-Status · VDA-Portal-API für Folge-Karten-Bestellung</li>
        </ul>
      </section>

      <section className="mb-6">
        <header className="flex items-baseline gap-3 mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">HBA · personenbezogen</h2>
          <span className="text-[11px] text-soft font-mono">{hba.length}</span>
        </header>
        <ul className="space-y-2">
          {hba.map((k) => (
            <KartenZeile key={k.id} k={k} />
          ))}
        </ul>
      </section>

      <section>
        <header className="flex items-baseline gap-3 mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">SMC-B · Betriebsstätten</h2>
          <span className="text-[11px] text-soft font-mono">{smcb.length}</span>
        </header>
        <ul className="space-y-2">
          {smcb.map((k) => (
            <KartenZeile key={k.id} k={k} />
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function KartenZeile({ k }: { k: Karte }) {
  const farbe = KARTEN_STATUS_FARBE[k.status];
  const hinweis = verlaengerungsHinweis(k);
  const tage = tageBisAblauf(k);

  return (
    <li className="surface rounded-2xl p-4">
      <div className="flex items-baseline gap-3 flex-wrap mb-2">
        <span
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
          style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
        >
          {KARTEN_STATUS_LABEL[k.status]}
        </span>
        <h3 className="font-display text-[15px] font-bold tracking-tight2">{k.inhaberName}</h3>
        <span className="text-[11px] text-soft font-mono">{TYP_LABEL[k.typ]}</span>
        <span
          className="text-[11px] font-mono ml-auto"
          style={{ color: `rgb(${HINWEIS_FARBE[hinweis.level]})` }}
        >
          {hinweis.text}
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-2 text-[11px] mb-2">
        <Box label="ICCSN">
          <code className="font-mono break-all">{k.iccsn}</code>
        </Box>
        <Box label="Telematik-ID">
          <code className="font-mono">{k.telematikId}</code>
        </Box>
        <Box label="VDA · Vertrauensdiensteanbieter">{k.vda}</Box>
        <Box label="Ausgabe">{k.ausgegebenAm ?? "—"}</Box>
        <Box label="Gültig bis">
          <span className="font-mono">{k.gueltigBis}</span>{" "}
          <span className="text-soft">({tage > 0 ? `${tage} d` : `seit ${-tage} d`})</span>
        </Box>
        <Box label="Konnektor-Slot">{k.konnektorSlot ?? "—"}</Box>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 text-[11px] mb-2">
        <Box label="PIN.CH · Karten-PIN">
          <span style={{ color: pinFarbe(k.pinChStatus) }}>{PIN_STATUS_LABEL[k.pinChStatus]}</span>
        </Box>
        <Box label="PIN.QES · Signatur-PIN">
          <span style={{ color: pinFarbe(k.pinQesStatus) }}>{PIN_STATUS_LABEL[k.pinQesStatus]}</span>
        </Box>
      </div>

      {(k.lanr || k.bsnr || k.iknr) && (
        <div className="flex flex-wrap gap-2 text-[11px] text-soft font-mono mb-2">
          {k.lanr && <span>LANR {k.lanr}</span>}
          {k.bsnr && <span>BSNR {k.bsnr}</span>}
          {k.iknr && <span>IK {k.iknr}</span>}
          {k.berufsgruppe && <span>· {k.berufsgruppe}</span>}
        </div>
      )}

      {k.notiz && (
        <p className="text-[12px] text-mute italic leading-relaxed">{k.notiz}</p>
      )}
    </li>
  );
}

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="surface-mute rounded-md p-2">
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-0.5">{label}</p>
      <p>{children}</p>
    </div>
  );
}

function Mini({ label, value, farbe, alarm }: { label: string; value: string; farbe: string; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div
        className="font-display font-semibold text-[18px] mt-1 leading-none"
        style={{ color: alarm && value !== "0" ? "rgb(var(--mon))" : `rgb(${farbe})` }}
      >
        {value}
      </div>
    </div>
  );
}

function pinFarbe(status: string): string {
  if (status === "blockiert") return "rgb(var(--mon))";
  if (status === "fehlversuche-2") return "rgb(var(--mon))";
  if (status === "fehlversuche-1") return "rgb(var(--sun))";
  if (status === "gesetzt") return "rgb(var(--vibe-approval))";
  return "rgb(var(--fg-mute))";
}
