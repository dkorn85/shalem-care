// Muster 1 · Arbeitsunfähigkeitsbescheinigung — die berühmte „Gelbe".
//
// Original-Optik: kanariengelber Untergrund, schmale rote Druck-Linien
// im Hintergrund, schwarze Sans-Druckschrift, charakteristische
// Diagnose-Box mit ICD-10-Codes, Stempel-Bereich rechts unten.
//
// Heute formal als eAU (digital), die Optik bleibt im PVS aber als
// vertrautes Layout für Versicherte und Sachbearbeitung erhalten.

import type { ReactNode } from "react";

export type MusterEinsDaten = {
  kassenName: string;
  ikNummer: string;
  versicherterName: string;
  versichertenNr?: string;
  geburtsdatum?: string;
  versichertenStatus?: string;
  betriebsstaette?: string;
  arztBsnr?: string;
  arztLanr?: string;
  arztName: string;
  arztAnschrift: string;
  ausstellungsDatum: string;
  arbeitsunfaehigSeit: string;
  voraussichtlichBis: string;
  istErstbescheinigung: boolean;
  feststellungDatum: string;
  arbeitsunfall: boolean;
  arztDemKvg?: boolean;        // dem Versicherten ausgehändigt
  diagnose: string;
  icd10: string[];
  sonstigeBemerkungen?: string;
};

export function MusterEinsAU({ daten }: { daten: MusterEinsDaten }) {
  return (
    <article
      className="relative font-sans text-[11px] text-black p-5 mx-auto"
      style={{
        background: "#FFF6BC", // Kanariengelb
        boxShadow:
          "0 1px 0 rgb(0 0 0 / 0.06) inset, 0 4px 16px rgb(0 0 0 / 0.10), 0 0 0 1px rgb(0 0 0 / 0.05)",
        maxWidth: "560px",
        borderRadius: 4,
        backgroundImage:
          // Charakteristische rote horizontale Druck-Linien des Originals
          "repeating-linear-gradient(0deg, transparent 0px, transparent 22px, rgba(180,30,30,0.18) 22px, rgba(180,30,30,0.18) 23px)",
      }}
    >
      {/* Vordruck-Kopfzeile */}
      <header className="flex justify-between items-baseline mb-2 pb-1.5" style={{ borderBottom: "1.5px solid #B41E1E" }}>
        <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#B41E1E" }}>
          Muster 1 · Arbeitsunfähigkeitsbescheinigung
        </p>
        <p className="font-mono text-[9px]" style={{ color: "#B41E1E" }}>
          eAU · KIM-übermittelt
        </p>
      </header>

      <h2 className="font-display text-[15px] font-bold tracking-tight2 text-center mb-2" style={{ color: "#B41E1E" }}>
        ARBEITSUNFÄHIGKEITS&shy;BESCHEINIGUNG
      </h2>

      {/* Krankenkasse-Block */}
      <Feld label="Krankenkasse bzw. Kostenträger">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-[12px]">{daten.kassenName}</span>
          <span className="font-mono text-[10px] text-black/70">IK {daten.ikNummer}</span>
        </div>
      </Feld>

      {/* Versicherten-Grid */}
      <div className="grid grid-cols-12 gap-px mt-1" style={{ background: "#B41E1E", border: "1px solid #B41E1E" }}>
        <FeldKlein className="col-span-7" label="Name, Vorname des Versicherten">{daten.versicherterName}</FeldKlein>
        <FeldKlein className="col-span-3" label="geb. am">{daten.geburtsdatum ?? "—"}</FeldKlein>
        <FeldKlein className="col-span-2" label="Status">{daten.versichertenStatus ?? "1000"}</FeldKlein>
        <FeldKlein className="col-span-7" label="Betriebsstätten-Nr.">{daten.betriebsstaette ?? "—"}</FeldKlein>
        <FeldKlein className="col-span-3" label="Arzt-Nr. (LANR)">{daten.arztLanr ?? "—"}</FeldKlein>
        <FeldKlein className="col-span-2" label="Datum">{daten.ausstellungsDatum}</FeldKlein>
      </div>

      {/* Bescheinigungs-Art */}
      <div className="mt-2 flex flex-wrap gap-3">
        <Checkbox checked={daten.istErstbescheinigung} label="Erstbescheinigung" />
        <Checkbox checked={!daten.istErstbescheinigung} label="Folgebescheinigung" />
        <Checkbox checked={daten.arbeitsunfall} label="Arbeitsunfall, -folgen, Berufskrankheit" />
        <Checkbox checked={daten.arztDemKvg ?? false} label="dem Versicherten ausgehändigt" />
      </div>

      {/* AU-Zeitraum-Block */}
      <div className="grid grid-cols-3 gap-px mt-2" style={{ background: "#B41E1E", border: "1px solid #B41E1E" }}>
        <FeldKlein label="arbeitsunfähig seit">{daten.arbeitsunfaehigSeit}</FeldKlein>
        <FeldKlein label="voraussichtlich bis einschließlich">{daten.voraussichtlichBis}</FeldKlein>
        <FeldKlein label="festgestellt am">{daten.feststellungDatum}</FeldKlein>
      </div>

      {/* Diagnose */}
      <Feld label="Diagnose · ICD-10-GM">
        <div className="flex justify-between items-start gap-3">
          <span className="text-[12px] flex-1">{daten.diagnose}</span>
          <div className="flex flex-wrap gap-1 shrink-0">
            {daten.icd10.map((c) => (
              <span
                key={c}
                className="font-mono text-[11px] font-medium px-1.5 py-0.5"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid #B41E1E" }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </Feld>

      {daten.sonstigeBemerkungen && (
        <Feld label="Sonstiges">
          <span className="text-[11px] leading-snug">{daten.sonstigeBemerkungen}</span>
        </Feld>
      )}

      {/* Stempel-Bereich */}
      <footer className="mt-3 pt-2 flex justify-between items-end gap-3" style={{ borderTop: "1px dashed #B41E1E" }}>
        <div className="text-[10px] text-black/70">
          <p>Vertragsärztliche Versorgung · KBV-Vordruck</p>
          <p className="mt-0.5">eAU-Versand an Kasse via KIM</p>
        </div>
        <img
          src="/scheine/stempel-praxis.png"
          alt={`Praxisstempel ${daten.arztName}`}
          className="w-[140px] h-[140px] object-contain pointer-events-none select-none"
          style={{ mixBlendMode: "multiply", transform: "rotate(-7deg)" }}
        />
      </footer>

      {/* eAU-Watermark · diagonal */}
      <img
        src="/scheine/wm-eau.png"
        alt=""
        aria-hidden
        className="absolute pointer-events-none select-none"
        style={{
          mixBlendMode: "multiply",
          left: "10%",
          right: "10%",
          top: "40%",
          width: "80%",
          opacity: 0.55,
        }}
      />
    </article>
  );
}

function Feld({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-1.5 px-2 py-1" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid #B41E1E" }}>
      <p className="text-[8px] uppercase tracking-wider font-medium mb-0.5" style={{ color: "#B41E1E" }}>{label}</p>
      <div>{children}</div>
    </div>
  );
}

function FeldKlein({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`px-2 py-1 ${className ?? ""}`} style={{ background: "rgba(255,255,255,0.5)" }}>
      <p className="text-[8px] uppercase tracking-wider font-medium" style={{ color: "#B41E1E" }}>{label}</p>
      <p className="text-[11px] font-medium leading-tight">{children}</p>
    </div>
  );
}

function Checkbox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px]">
      <span
        aria-hidden
        className="inline-block w-3 h-3 text-center text-[10px] leading-[12px] font-bold"
        style={{ border: "1px solid #B41E1E", background: checked ? "#B41E1E" : "rgba(255,255,255,0.5)", color: "#fff" }}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </span>
  );
}
