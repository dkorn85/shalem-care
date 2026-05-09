// Wiederverwendbares A4-quer-Mittelfalz-Layout für die Broschüren.
// Pro Variante 4 Felder (Außen-Rückseite, Außen-Titel, Innen-Links,
// Innen-Rechts) als Slot-Props.

import type { ReactNode } from "react";
import Image from "next/image";
import { Wordmark, Logo } from "@/components/Logo";
import { DruckenButton } from "@/components/scheine/DruckenButton";

export type BroschuereLayoutProps = {
  hintergrundFarbe?: string;     // CSS-var z.B. "var(--accent)"
  titelClaim: ReactNode;
  titelUntertitel: ReactNode;
  heroBild: string;              // /broschuere/...png
  rueckseite: ReactNode;
  innenLinks: ReactNode;
  innenRechts: ReactNode;
  drucktitel: string;            // für DruckenButton-Label
};

export function BroschuereLayout(p: BroschuereLayoutProps) {
  const farbe = p.hintergrundFarbe ?? "var(--accent)";
  return (
    <div className="broschuere-root">
      <div className="broschuere-toolbar no-print">
        <DruckenButton label={`🖨 ${p.drucktitel}`} />
        <span className="hint">
          A4 quer · beidseitig · entlang langer Kante wenden · 100 % Skalierung · Ränder 0
        </span>
      </div>

      {/* AUSSEN · linkes Feld Rückseite, rechts Titel */}
      <article className="broschuere-seite">
        <section className="feld feld-rueckseite">
          {p.rueckseite}
        </section>
        <section className="feld feld-titel" style={{ background: `linear-gradient(180deg, rgb(${farbe} / 0.06), rgb(${farbe} / 0.14))` }}>
          <div className="hero-bild">
            <Image src={p.heroBild} alt="" fill sizes="148mm" className="object-cover" priority />
          </div>
          <div className="titel-text">
            <Wordmark rainbow />
            <h1 className="font-display font-bold text-[34px] leading-[1.05] tracking-tight2 mt-6" style={{ color: `rgb(${farbe})` }}>
              {p.titelClaim}
            </h1>
            <p className="text-[14px] text-mute mt-4 leading-relaxed">
              {p.titelUntertitel}
            </p>
          </div>
        </section>
      </article>

      {/* INNEN · 2 Felder · linker und rechter Spread */}
      <article className="broschuere-seite">
        <section className="feld feld-innen">{p.innenLinks}</section>
        <section className="feld feld-innen">{p.innenRechts}</section>
      </article>

      <BroschuereStyles akzent={farbe} />
    </div>
  );
}

// Reusable shared elements

export function FeatureItem({ bild, titel, text, akzent = "var(--accent)" }: { bild: string; titel: string; text: string; akzent?: string }) {
  return (
    <li className="flex gap-3 items-start">
      <Image src={bild} alt="" width={88} height={59} className="rounded-md shrink-0 object-cover" style={{ aspectRatio: "3/2" }} />
      <div className="min-w-0">
        <p className="font-display font-semibold text-[12.5px] leading-tight" style={{ color: `rgb(${akzent})` }}>
          {titel}
        </p>
        <p className="text-[10.5px] text-mute mt-1 leading-snug">{text}</p>
      </div>
    </li>
  );
}

export function Schritt({ nr, titel, akzent = "var(--accent)", children }: { nr: number; titel: string; akzent?: string; children: ReactNode }) {
  return (
    <li className="flex gap-3 items-baseline">
      <span
        className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-[13px] font-bold font-mono"
        style={{ background: `rgb(${akzent} / 0.15)`, color: `rgb(${akzent})` }}
      >
        {nr}
      </span>
      <div className="min-w-0">
        <p className="font-display font-semibold text-[12px] leading-tight" style={{ color: `rgb(${akzent})` }}>
          {titel}
        </p>
        <p className="text-[10.5px] text-mute mt-0.5 leading-snug">{children}</p>
      </div>
    </li>
  );
}

export function MagicBox({ bild, eyebrow, titel, text, akzent = "var(--accent)" }: { bild?: string; eyebrow: string; titel: string; text: ReactNode; akzent?: string }) {
  return (
    <div className="genossen-box" style={{ background: `rgb(${akzent} / 0.06)`, borderLeftColor: `rgb(${akzent})` }}>
      {bild && <Image src={bild} alt="" width={140} height={94} className="rounded-md mb-2" />}
      <p className="text-[10.5px] uppercase tracking-wider font-medium" style={{ color: `rgb(${akzent})` }}>
        {eyebrow}
      </p>
      <p className="font-display font-bold text-[13.5px] mt-0.5" style={{ color: `rgb(${akzent})` }}>
        {titel}
      </p>
      <p className="text-[11px] mt-1 leading-relaxed text-mute">{text}</p>
    </div>
  );
}

export function RueckseiteBlock({ pitch, akzent = "var(--accent)" }: { pitch: ReactNode; akzent?: string }) {
  return (
    <>
      <header className="mb-6">
        <Logo size={28} />
        <p className="font-display text-[18px] font-bold mt-3 leading-tight" style={{ color: `rgb(${akzent})` }}>
          Shalem Care
        </p>
        <p className="text-[10px] uppercase tracking-wider text-soft mt-0.5">
          Genossenschaftliche Pflegeplattform
        </p>
      </header>

      <div className="space-y-3 text-[12px] leading-relaxed">{pitch}</div>

      <div className="mt-6 pt-3" style={{ borderTop: "1px solid rgb(var(--border-soft))" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">So findest du uns</p>
        <p className="text-[12px] font-mono">shalem.de</p>
        <p className="text-[11px] text-mute mt-0.5">hallo@shalem.de</p>
      </div>

      <footer className="mt-auto pt-4 text-[9px] text-soft leading-tight">
        <p>Shalem Care eG i.G.</p>
        <p>Bochum / Berlin</p>
        <p className="mt-1">DSGVO Art. 4 Nr. 1 · Datenhoheit liegt bei der Person.</p>
        <p className="mt-1">FHIR · Open Source AGPLv3 · GenG § 1.</p>
      </footer>
    </>
  );
}

function BroschuereStyles({ akzent }: { akzent: string }) {
  // CSS string-interpoliert damit der Akzent pro Variante mitwandert.
  return (
    <style>{`
      .broschuere-root {
        min-height: 100vh;
        background: rgb(var(--bg-mute));
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
      }
      .broschuere-toolbar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgb(var(--bg-elev) / 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        padding: 8px 12px;
        border-radius: 999px;
        box-shadow: 0 4px 14px rgb(0 0 0 / 0.10), 0 0 0 1px rgb(var(--border-soft));
        margin-bottom: 8px;
      }
      .broschuere-toolbar .hint {
        font-size: 11px;
        color: rgb(var(--fg-mute));
      }
      .broschuere-seite {
        width: 297mm;
        height: 210mm;
        display: grid;
        grid-template-columns: 1fr 1fr;
        background: rgb(var(--bg-elev));
        box-shadow: 0 6px 24px rgb(0 0 0 / 0.10), 0 0 0 1px rgb(0 0 0 / 0.06);
        position: relative;
        overflow: hidden;
      }
      .broschuere-seite::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 1px;
        background: repeating-linear-gradient(180deg, rgb(0 0 0 / 0.10) 0 4px, transparent 4px 8px);
        pointer-events: none;
      }
      .feld {
        padding: 14mm 12mm;
        display: flex;
        flex-direction: column;
      }
      .feld-titel {
        padding: 0;
        position: relative;
      }
      .hero-bild {
        position: relative;
        width: 100%;
        height: 56%;
      }
      .titel-text {
        padding: 12mm;
        flex: 1;
      }
      .feld-rueckseite {
        background: #FAFAF6;
      }
      .feld-innen {
        background: rgb(var(--bg-elev));
        gap: 10px;
      }
      .genossen-box {
        margin-top: auto;
        padding: 10px 12px;
        border-left: 2px solid rgb(${akzent});
        border-radius: 4px;
      }

      @media print {
        .broschuere-root { padding: 0; gap: 0; background: white; }
        .broschuere-toolbar { display: none !important; }
        .broschuere-seite {
          box-shadow: none;
          page-break-after: always;
          margin: 0;
        }
        .broschuere-seite::after { opacity: 0.3; }
        @page {
          size: A4 landscape;
          margin: 0;
        }
      }
    `}</style>
  );
}
