// Muster 13 · Heilmittel-Verordnung — die graue/hellblaue HMV.
//
// Original-Optik: pastell-grauer Untergrund, schmale blaue Druck-Linien
// im Hintergrund, schwarze Sans-Druckschrift. Kennzeichen:
// Therapieart-Checkboxen (Physio/Ergo/Logo/Podo), Diagnosegruppe-Code
// (z.B. WS1a für Wirbelsäule), Behandlungs-Pos.-Tabelle mit Anzahl +
// Doppelbehandlung, Therapie-Frequenz-Box.

import type { ReactNode } from "react";

export type MusterDreizehnDaten = {
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

  therapieArt: "physio" | "ergo" | "logo" | "podo";
  istErstverordnung: boolean;
  ausserhalbRegelfall?: boolean;
  hausbesuch?: boolean;
  therapieBericht?: boolean;
  dringendInnerhalb14T?: boolean;

  diagnose: string;
  icd10: string;
  diagnoseGruppe: string;          // z.B. "WS1a", "EX1c", "ZN1b"
  leitsymptomatik: string;
  therapieZiele: string;

  positionen: Array<{
    nr: number;
    leistung: string;             // z.B. "KG-Mobilisation"
    anzahl: number;
    doppelbehandlung?: boolean;
  }>;
  frequenz: string;                // "1-3 × pro Woche"
};

const THERAPIEART_LABEL: Record<MusterDreizehnDaten["therapieArt"], string> = {
  physio: "Physiotherapie",
  ergo:   "Ergotherapie",
  logo:   "Logopädie/Sprachtherapie",
  podo:   "Podologische Therapie",
};

export function MusterDreizehnHMV({ daten }: { daten: MusterDreizehnDaten }) {
  return (
    <article
      className="relative font-sans text-[11px] text-black p-5 mx-auto"
      style={{
        background: "#E8EFF6",
        boxShadow:
          "0 1px 0 rgb(0 0 0 / 0.06) inset, 0 4px 16px rgb(0 0 0 / 0.10), 0 0 0 1px rgb(0 0 0 / 0.05)",
        maxWidth: "560px",
        borderRadius: 4,
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent 0px, transparent 22px, rgba(30,80,140,0.10) 22px, rgba(30,80,140,0.10) 23px)",
      }}
    >
      <header className="flex justify-between items-baseline mb-2 pb-1.5" style={{ borderBottom: "1.5px solid #1E508C" }}>
        <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#1E508C" }}>
          Muster 13 · Heilmittel-Verordnung
        </p>
        <p className="font-mono text-[9px]" style={{ color: "#1E508C" }}>HeilM-RL · § 32 SGB V</p>
      </header>

      <h2 className="font-display text-[14px] font-bold tracking-tight2 text-center mb-2" style={{ color: "#1E508C" }}>
        VERORDNUNG VON HEILMITTELN
      </h2>

      {/* Therapieart-Checkboxen oben */}
      <div className="mb-2 flex gap-3 flex-wrap">
        {(["physio", "ergo", "logo", "podo"] as const).map((art) => (
          <Checkbox key={art} checked={daten.therapieArt === art} label={THERAPIEART_LABEL[art]} />
        ))}
      </div>

      {/* Krankenkasse-Block */}
      <Feld label="Krankenkasse bzw. Kostenträger">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-[12px]">{daten.kassenName}</span>
          <span className="font-mono text-[10px] text-black/70">IK {daten.ikNummer}</span>
        </div>
      </Feld>

      {/* Versicherten-Grid */}
      <div className="grid grid-cols-12 gap-px mt-1" style={{ background: "#1E508C", border: "1px solid #1E508C" }}>
        <FeldKlein className="col-span-7" label="Name, Vorname des Versicherten">{daten.versicherterName}</FeldKlein>
        <FeldKlein className="col-span-3" label="geb. am">{daten.geburtsdatum ?? "—"}</FeldKlein>
        <FeldKlein className="col-span-2" label="Status">{daten.versichertenStatus ?? "1000"}</FeldKlein>
        <FeldKlein className="col-span-7" label="Betriebsstätten-Nr.">{daten.betriebsstaette ?? "—"}</FeldKlein>
        <FeldKlein className="col-span-3" label="Arzt-Nr. (LANR)">{daten.arztLanr ?? "—"}</FeldKlein>
        <FeldKlein className="col-span-2" label="Datum">{daten.ausstellungsDatum}</FeldKlein>
      </div>

      {/* Verordnungs-Art */}
      <div className="mt-2 flex gap-3 flex-wrap">
        <Checkbox checked={daten.istErstverordnung} label="Erstverordnung" />
        <Checkbox checked={!daten.istErstverordnung} label="Folgeverordnung" />
        <Checkbox checked={daten.ausserhalbRegelfall ?? false} label="außerhalb des Regelfalls" />
        <Checkbox checked={daten.hausbesuch ?? false} label="Hausbesuch" />
        <Checkbox checked={daten.therapieBericht ?? false} label="Therapiebericht" />
        <Checkbox checked={daten.dringendInnerhalb14T ?? false} label="dringender Behandlungsbedarf (Therapie ≤14 Tage)" />
      </div>

      {/* Diagnose + Diagnosegruppe */}
      <div className="grid grid-cols-12 gap-px mt-2" style={{ background: "#1E508C", border: "1px solid #1E508C" }}>
        <FeldKlein className="col-span-9" label="Diagnose · ICD-10-GM">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[12px]">{daten.diagnose}</span>
            <span className="font-mono text-[11px] font-medium px-1 py-0.5" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid #1E508C" }}>
              {daten.icd10}
            </span>
          </div>
        </FeldKlein>
        <FeldKlein className="col-span-3" label="Diagnosegruppe">
          <span className="font-mono text-[13px] font-bold">{daten.diagnoseGruppe}</span>
        </FeldKlein>
      </div>

      {/* Leitsymptomatik + Therapieziele */}
      <Feld label="Leitsymptomatik">
        <span className="text-[11px] leading-snug">{daten.leitsymptomatik}</span>
      </Feld>
      <Feld label="Spezifische Therapieziele">
        <span className="text-[11px] leading-snug">{daten.therapieZiele}</span>
      </Feld>

      {/* Behandlungs-Pos.-Tabelle */}
      <div className="mt-2">
        <p className="text-[9px] uppercase tracking-wider font-medium mb-0.5" style={{ color: "#1E508C" }}>
          Verordnete Heilmittel · Behandlungspositionen
        </p>
        <table className="w-full text-[11px]" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid #1E508C" }}>
          <thead>
            <tr style={{ background: "rgba(30,80,140,0.12)", borderBottom: "1px solid #1E508C" }}>
              <th className="text-left p-1.5 font-medium" style={{ width: "8%" }}>Pos</th>
              <th className="text-left p-1.5 font-medium">Leistung</th>
              <th className="text-right p-1.5 font-medium" style={{ width: "12%" }}>Anzahl</th>
              <th className="text-center p-1.5 font-medium" style={{ width: "18%" }}>Doppel-VW</th>
            </tr>
          </thead>
          <tbody>
            {daten.positionen.map((p, i) => (
              <tr key={p.nr} style={{ borderTop: i > 0 ? "1px dashed rgba(30,80,140,0.4)" : undefined }}>
                <td className="p-1.5 font-mono">{p.nr}</td>
                <td className="p-1.5">{p.leistung}</td>
                <td className="p-1.5 font-mono text-right">{p.anzahl}</td>
                <td className="p-1.5 text-center">{p.doppelbehandlung ? "✓" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Frequenz */}
      <div className="mt-2 px-2 py-1.5" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid #1E508C" }}>
        <p className="text-[8px] uppercase tracking-wider font-medium" style={{ color: "#1E508C" }}>Therapie-Frequenz</p>
        <p className="text-[12px] font-medium leading-tight">{daten.frequenz}</p>
      </div>

      {/* Stempel */}
      <footer className="mt-3 pt-2 flex justify-between items-end gap-3" style={{ borderTop: "1px dashed #1E508C" }}>
        <div className="text-[10px] text-black/70">
          <p>Vertragsärztliche Versorgung · KBV-Vordruck</p>
          <p className="mt-0.5">Heilmittel-Richtlinie · zur Vorlage in Therapie-Praxis</p>
        </div>
        <img
          src="/scheine/stempel-praxis.png"
          alt={`Praxisstempel ${daten.arztName}`}
          className="w-[140px] h-[140px] object-contain pointer-events-none select-none"
          style={{ mixBlendMode: "multiply", transform: "rotate(-7deg)" }}
        />
      </footer>
    </article>
  );
}

function Feld({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-1.5 px-2 py-1" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid #1E508C" }}>
      <p className="text-[8px] uppercase tracking-wider font-medium mb-0.5" style={{ color: "#1E508C" }}>{label}</p>
      <div>{children}</div>
    </div>
  );
}

function FeldKlein({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`px-2 py-1 ${className ?? ""}`} style={{ background: "rgba(255,255,255,0.55)" }}>
      <p className="text-[8px] uppercase tracking-wider font-medium" style={{ color: "#1E508C" }}>{label}</p>
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
        style={{ border: "1px solid #1E508C", background: checked ? "#1E508C" : "rgba(255,255,255,0.55)", color: "#fff" }}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </span>
  );
}
