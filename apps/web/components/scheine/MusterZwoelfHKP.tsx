// Muster 12 · Verordnung häuslicher Krankenpflege § 37 SGB V.
//
// Original-Optik: rosé-/altrosa-Hintergrund, schwarze Druckschrift,
// charakteristische Feld-Tabelle oben (Krankenkasse + Versicherter),
// Diagnose-Box, Maßnahmen-Tabelle, Zeitraum, Erstverordnung/Folge,
// Arzt-Stempel-Feld unten rechts.
//
// Bewusst keine echten Logos — die Optik ist generisch wie das KBV-Vordruck.

import type { ReactNode } from "react";

export type MusterZwoelfDaten = {
  kassenName: string;
  ikNummer: string;
  versicherterName: string;
  versichertenNr?: string;
  geburtsdatum?: string;
  versichertenStatus?: string; // M/F/R · 1000/3000/5000
  betriebsstaette?: string;
  arztBsnr?: string;
  arztLanr?: string;
  arztName: string;
  arztAnschrift: string;
  ausstellungsDatum: string;
  diagnose: string;
  icd10: string;
  massnahmen: Array<{ leistung: string; haeufigkeit: string; dauer: string }>;
  vonDatum: string;
  bisDatum: string;
  istErstverordnung: boolean;
  begruendung?: string;
  unfallVerursacht?: boolean;
  arbeitsunfall?: boolean;
  istBg?: boolean;
};

export function MusterZwoelfHKP({ daten }: { daten: MusterZwoelfDaten }) {
  return (
    <article
      className="relative font-sans text-[11px] text-black p-5 mx-auto"
      style={{
        background: "linear-gradient(180deg, #FBE5EE 0%, #F8DCEA 100%)",
        boxShadow:
          "0 1px 0 rgb(0 0 0 / 0.06) inset, 0 4px 16px rgb(0 0 0 / 0.10), 0 0 0 1px rgb(0 0 0 / 0.05)",
        maxWidth: "560px",
        borderRadius: 4,
        backgroundImage:
          // Subtile Druck-Raster-Linien wie auf dem Original-Vordruck
          "repeating-linear-gradient(0deg, rgba(120,30,70,0.04) 0px, rgba(120,30,70,0.04) 1px, transparent 1px, transparent 28px), linear-gradient(180deg, #FBE5EE 0%, #F8DCEA 100%)",
      }}
    >
      {/* Vordruck-Kopfzeile */}
      <header className="flex justify-between items-baseline mb-2 pb-1.5" style={{ borderBottom: "1.5px solid #6B1A38" }}>
        <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B1A38" }}>
          Muster 12 (7.2024) · Verordnung häuslicher Krankenpflege
        </p>
        <p className="font-mono text-[9px]" style={{ color: "#6B1A38" }}>§ 37 SGB V</p>
      </header>

      {/* Krankenkasse-Block */}
      <Feld label="Krankenkasse bzw. Kostenträger">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-[12px]">{daten.kassenName}</span>
          <span className="font-mono text-[10px] text-black/70">IK {daten.ikNummer}</span>
        </div>
      </Feld>

      {/* Versicherten-Block · 4-Felder-Grid */}
      <div className="grid grid-cols-12 gap-px mt-1" style={{ background: "#6B1A38", border: "1px solid #6B1A38" }}>
        <FeldKlein className="col-span-7" label="Name, Vorname des Versicherten">{daten.versicherterName}</FeldKlein>
        <FeldKlein className="col-span-3" label="geb. am">{daten.geburtsdatum ?? "—"}</FeldKlein>
        <FeldKlein className="col-span-2" label="Status">{daten.versichertenStatus ?? "1000"}</FeldKlein>
        <FeldKlein className="col-span-7" label="Betriebsstätten-Nr.">{daten.betriebsstaette ?? "—"}</FeldKlein>
        <FeldKlein className="col-span-3" label="Arzt-Nr. (LANR)">{daten.arztLanr ?? "—"}</FeldKlein>
        <FeldKlein className="col-span-2" label="Datum">{daten.ausstellungsDatum}</FeldKlein>
      </div>

      {/* Verordnungs-Art */}
      <div className="mt-2 flex gap-3">
        <Checkbox checked={daten.istErstverordnung} label="Erstverordnung" />
        <Checkbox checked={!daten.istErstverordnung} label="Folgeverordnung" />
        <Checkbox checked={daten.unfallVerursacht ?? false} label="Unfallfolge" />
        <Checkbox checked={daten.arbeitsunfall ?? false} label="Arbeitsunfall" />
        <Checkbox checked={daten.istBg ?? false} label="BG / sonstiger Unfallversicherungsträger" />
      </div>

      {/* Diagnose-Box */}
      <Feld label="Diagnose(n) · ICD-10-GM">
        <div className="flex justify-between items-start gap-3">
          <span className="text-[12px]">{daten.diagnose}</span>
          <span className="font-mono text-[11px] font-medium px-1.5 py-0.5" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid #6B1A38" }}>
            {daten.icd10}
          </span>
        </div>
      </Feld>

      {/* Maßnahmen-Tabelle */}
      <div className="mt-2">
        <p className="text-[9px] uppercase tracking-wider font-medium mb-0.5" style={{ color: "#6B1A38" }}>
          Verordnete Maßnahmen
        </p>
        <table className="w-full text-[11px]" style={{ background: "rgba(255,255,255,0.45)", border: "1px solid #6B1A38" }}>
          <thead>
            <tr style={{ background: "rgba(107,26,56,0.12)", borderBottom: "1px solid #6B1A38" }}>
              <th className="text-left p-1.5 font-medium">Leistung</th>
              <th className="text-left p-1.5 font-medium" style={{ width: "30%" }}>Häufigkeit</th>
              <th className="text-left p-1.5 font-medium" style={{ width: "18%" }}>Dauer</th>
            </tr>
          </thead>
          <tbody>
            {daten.massnahmen.map((m, i) => (
              <tr key={i} style={{ borderTop: i > 0 ? "1px dashed rgba(107,26,56,0.4)" : undefined }}>
                <td className="p-1.5">{m.leistung}</td>
                <td className="p-1.5 font-mono">{m.haeufigkeit}</td>
                <td className="p-1.5 font-mono">{m.dauer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Zeitraum */}
      <div className="grid grid-cols-2 gap-px mt-2" style={{ background: "#6B1A38", border: "1px solid #6B1A38" }}>
        <FeldKlein label="Verordnung gültig von">{daten.vonDatum}</FeldKlein>
        <FeldKlein label="bis voraussichtlich">{daten.bisDatum}</FeldKlein>
      </div>

      {/* Begründung */}
      {daten.begruendung && (
        <Feld label="Begründung">
          <span className="text-[11px] leading-snug">{daten.begruendung}</span>
        </Feld>
      )}

      {/* Arzt-Stempel-Bereich */}
      <footer className="mt-3 pt-2 flex justify-between items-end gap-3" style={{ borderTop: "1px dashed #6B1A38" }}>
        <div className="text-[10px] text-black/70">
          <p>Vertragsärztliche Versorgung · KBV-Vordruck</p>
          <p className="mt-0.5">Ausgestellt am {daten.ausstellungsDatum}</p>
        </div>
        <div
          className="text-right text-[10px] font-medium px-2 py-1.5 rotate-[-1deg]"
          style={{ background: "rgba(255,255,255,0.6)", border: "1.5px solid #1E3A8A", color: "#1E3A8A", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
        >
          <p className="font-bold">{daten.arztName}</p>
          <p className="font-normal whitespace-pre-line text-[9px]">{daten.arztAnschrift}</p>
          {daten.arztBsnr && <p className="font-mono text-[9px] mt-0.5">BSNR {daten.arztBsnr}</p>}
        </div>
      </footer>
    </article>
  );
}

function Feld({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-1.5 px-2 py-1" style={{ background: "rgba(255,255,255,0.45)", border: "1px solid #6B1A38" }}>
      <p className="text-[8px] uppercase tracking-wider font-medium mb-0.5" style={{ color: "#6B1A38" }}>{label}</p>
      <div>{children}</div>
    </div>
  );
}

function FeldKlein({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`px-2 py-1 ${className ?? ""}`} style={{ background: "rgba(255,255,255,0.45)" }}>
      <p className="text-[8px] uppercase tracking-wider font-medium" style={{ color: "#6B1A38" }}>{label}</p>
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
        style={{ border: "1px solid #6B1A38", background: checked ? "#6B1A38" : "rgba(255,255,255,0.5)", color: "#fff" }}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </span>
  );
}
