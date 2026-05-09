// Druckbare QR-Code-Karte für eine Identity. Server-Component:
// QR wird beim Render mit der `qrcode`-Lib als SVG erzeugt — keine
// Client-Library, kein Layout-Shift. Die URL `/identity/claim?token=…`
// vorbefüllt den Token im Claim-Form.
//
// Apple-Wallet-Style: glasige Karte mit Wordmark oben, Code als
// Mono-Text mittig unter QR. Druck-Stylesheet sorgt dafür, dass beim
// „🖨 drucken"-Klick nur diese Karte aufs Papier kommt.

import QRCode from "qrcode";
import { Logo } from "@/components/Logo";

export type QrCodeKarteDaten = {
  identityId: string;
  name: string;
  art: "klient" | "mitarbeiter" | "lieferant" | "mitglied";
  claimToken: string;
  verifikationsHinweis?: string;
  baseUrl?: string;             // Default https://shalem.de
};

const ART_LABEL: Record<QrCodeKarteDaten["art"], string> = {
  klient: "Klient-Akte",
  mitarbeiter: "Mitarbeiter",
  lieferant: "Lieferant",
  mitglied: "eG-Mitglied",
};

export async function QrCodeKarte({ daten }: { daten: QrCodeKarteDaten }) {
  const base = daten.baseUrl ?? process.env.SHALEM_SITE_URL ?? "https://shalem.de";
  const claimUrl = `${base}/identity/claim?token=${encodeURIComponent(daten.claimToken)}`;
  // QR als SVG-String — direkt einbetten, keine Daten-Roundtrip
  const svg = await QRCode.toString(claimUrl, {
    type: "svg",
    margin: 1,
    width: 256,
    color: { dark: "#0F1117", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });

  return (
    <article
      className="relative font-sans text-black p-6 mx-auto rounded-2xl"
      style={{
        background: "#FFFFFF",
        boxShadow:
          "0 1px 0 rgb(255 255 255 / 0.06) inset, " +
          "0 12px 40px rgb(0 0 0 / 0.12), " +
          "0 0 0 1px rgb(0 0 0 / 0.05)",
        maxWidth: "360px",
      }}
    >
      {/* Wordmark oben */}
      <header className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1.5px solid #DDD8CC" }}>
        <div className="flex items-center gap-2">
          <Logo size={18} />
          <span className="font-display font-bold text-[14px] tracking-tight">Shalem Care</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-mono text-black/55">
          {ART_LABEL[daten.art]}
        </span>
      </header>

      <div
        className="rounded-xl p-3 mx-auto mb-3"
        style={{ background: "#FAFAF6", boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.08)", width: "fit-content" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <p className="text-[12px] text-center text-black/65 mb-3">
        Scan mit dem Handy oder gib den Code per Hand auf
        {" "}<code className="font-mono text-[10px]">/identity/claim</code> ein.
      </p>

      <div className="text-center">
        <p className="text-[10px] uppercase tracking-wider font-mono text-black/55 mb-1">
          Anmelde-Code
        </p>
        <code className="block font-mono text-[28px] font-bold tracking-[0.18em] text-black">
          {daten.claimToken}
        </code>
      </div>

      <footer className="mt-4 pt-3 text-[11px] text-black/65" style={{ borderTop: "1px dashed #C8C2B4" }}>
        <p className="font-medium text-black mb-0.5">{daten.name}</p>
        <p className="font-mono text-[10px]">{daten.identityId}</p>
        {daten.verifikationsHinweis && (
          <p className="text-[10px] mt-1.5 italic">
            Beim Einlösen wirst du zusätzlich nach <strong>{daten.verifikationsHinweis}</strong> gefragt.
          </p>
        )}
        <p className="text-[9px] text-black/45 mt-2 leading-relaxed">
          Dein Profil gehört dir nach DSGVO Art. 4 Nr. 1. Bewahre den Code so auf wie du
          eine Bankkarte aufbewahren würdest.
        </p>
      </footer>
    </article>
  );
}
