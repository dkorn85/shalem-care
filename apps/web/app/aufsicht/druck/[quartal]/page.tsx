// Druck-optimierte Vollansicht des Quartalsberichts.
// Auf "Drucken" → "Als PDF speichern" — Browser erledigt PDF-Generierung.

import Link from "next/link";
import { generiereQuartalsbericht } from "@/lib/aufsicht/bericht";
import { erzeugeEidasContainer } from "@/lib/aufsicht/eidas";
import { PrintButton } from "@/components/PrintButton";

export const metadata = {
  title: "Aufsichtsrats-Bericht · Druck",
};

export const dynamic = "force-dynamic";

const TREND_FARBE: Record<string, string> = {
  "↑": "#16a34a",
  "↓": "#dc2626",
  "→": "#737373",
};

const AMPEL_FARBE = { gruen: "#16a34a", gelb: "#ca8a04", rot: "#dc2626" } as const;

export default async function BerichtDruckPage({
  params,
}: {
  params: Promise<{ quartal: string }>;
}) {
  const { quartal } = await params;
  const bericht = generiereQuartalsbericht(quartal, new Date().getFullYear());
  const eidas = erzeugeEidasContainer(bericht);
  const ampelFarbe = AMPEL_FARBE[bericht.risiko_ampel];

  return (
    <div style={{ background: "white", color: "black", minHeight: "100vh" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 18mm 16mm; size: A4; }
          body { background: white !important; }
        }
        @media screen {
          .a4 { max-width: 21cm; margin: 0 auto; padding: 2cm 1.6cm; box-shadow: 0 4px 20px rgba(0,0,0,0.08); background: white; min-height: 29.7cm; }
        }
        .a4 h1 { font-family: Georgia, serif; font-size: 24pt; line-height: 1.15; margin: 0 0 8pt 0; }
        .a4 h2 { font-family: Georgia, serif; font-size: 14pt; margin: 18pt 0 6pt 0; padding-bottom: 4pt; border-bottom: 1pt solid #000; }
        .a4 h3 { font-family: Georgia, serif; font-size: 11pt; margin: 12pt 0 4pt 0; }
        .a4 p { font-size: 10pt; line-height: 1.5; margin: 0 0 8pt 0; }
        .a4 table { width: 100%; border-collapse: collapse; margin: 6pt 0; font-size: 9pt; }
        .a4 td, .a4 th { padding: 3pt 6pt; border-bottom: 0.5pt solid #ccc; text-align: left; vertical-align: top; }
        .a4 th { font-weight: bold; background: #f5f5f5; }
        .a4 .meta { font-size: 8pt; color: #666; }
        .a4 .ampel { padding: 8pt 12pt; border: 1pt solid; border-radius: 4pt; margin: 12pt 0; }
        .a4 .footer { margin-top: 24pt; padding-top: 12pt; border-top: 1pt solid #000; font-size: 8pt; color: #444; }
        .a4 .sig-box { border: 1pt dashed #888; padding: 8pt; margin-top: 12pt; font-family: monospace; font-size: 8pt; line-height: 1.5; }
      `}</style>

      <div className="no-print" style={{ position: "sticky", top: 0, background: "#0a0a0a", color: "white", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <Link href={`/aufsicht?q=${bericht.quartal}`} style={{ color: "white", fontSize: "13px" }}>
          ← Bericht-Cockpit
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <PrintButton />
        </div>
      </div>

      <div className="a4">
        <header style={{ marginBottom: 24 }}>
          <p className="meta" style={{ textTransform: "uppercase", letterSpacing: 2, fontSize: 8, marginBottom: 4 }}>
            Shalem Care eG i.G. · Aufsichtsrats-Quartalsbericht · KonTraG · GenG § 38
          </p>
          <h1>
            Quartalsbericht {bericht.quartal} {bericht.jahr}
          </h1>
          <p className="meta">
            Erstellt am{" "}
            {new Date(bericht.erstellt_am).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            {" · "}Unterzeichner: {bericht.unterzeichner}
          </p>
          <div className="ampel" style={{ borderColor: ampelFarbe, color: ampelFarbe, marginTop: 14 }}>
            <strong>Risiko-Ampel: {bericht.risiko_ampel.toUpperCase()}</strong>
            <p style={{ fontSize: 9, color: "black", margin: "4pt 0 0 0" }}>
              {bericht.risiko_ampel === "gruen"
                ? "Operative Lage stabil, keine außerordentlichen Maßnahmen erforderlich."
                : bericht.risiko_ampel === "gelb"
                  ? "Moderate Risiken erkannt, kontinuierliche Beobachtung + selektive Eingriffe."
                  : "Erhöhtes Risiko-Niveau, sofortige Eskalation an Vorstand + Generalversammlung empfohlen."}
            </p>
          </div>
        </header>

        <section>
          <h2>Zusammenfassung</h2>
          <p>{bericht.zusammenfassung}</p>
        </section>

        {bericht.sektionen.map((s) => (
          <section key={s.nummer}>
            <h2>
              {s.nummer}. {s.titel}
            </h2>
            <p>{s.inhalt}</p>
            {s.metriken && s.metriken.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Kennzahl</th>
                    <th>Wert</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {s.metriken.map((m, i) => (
                    <tr key={i}>
                      <td>{m.label}</td>
                      <td style={{ fontFamily: "monospace" }}>{m.wert}</td>
                      <td style={{ color: m.trend ? TREND_FARBE[m.trend] : "#000" }}>
                        {m.trend ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {s.warnung && (
              <p style={{ background: "#fef3c7", padding: "6pt 8pt", border: "0.5pt solid #ca8a04", borderRadius: 3, fontSize: 9 }}>
                ⚠ {s.warnung}
              </p>
            )}
          </section>
        ))}

        <section>
          <h2>Empfehlungen an den Vorstand</h2>
          <ol style={{ fontSize: 10, lineHeight: 1.6, paddingLeft: 18 }}>
            {bericht.empfehlungen_an_vorstand.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2>Empfehlungen an die Generalversammlung</h2>
          <ol style={{ fontSize: 10, lineHeight: 1.6, paddingLeft: 18 }}>
            {bericht.empfehlungen_an_generalversammlung.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ol>
        </section>

        <div className="footer">
          <h3 style={{ margin: "0 0 4pt 0", fontSize: 10 }}>eIDAS-Signatur-Container</h3>
          <div className="sig-box">
            <div>
              <strong>Stufe:</strong> {eidas.signaturStufe} (qualifiziert · gerichtsfest)
            </div>
            <div>
              <strong>VDA:</strong> {eidas.vda}
            </div>
            <div>
              <strong>Hash:</strong> {eidas.dokumentHash}
            </div>
            <div>
              <strong>Zeitstempel:</strong> {new Date(eidas.zeitstempel).toLocaleString("de-DE")} · {eidas.tsa}
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>Unterzeichner:</strong>
              <ul style={{ margin: "2pt 0 0 14pt", padding: 0 }}>
                {eidas.unterzeichner.map((u, i) => (
                  <li key={i}>
                    {u.name} · {u.rolle}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>PAdES-Container:</strong> {eidas.padesGroesseKb} KB · Validierung {eidas.validierung}
            </div>
            {eidas.auditUrl && (
              <div style={{ marginTop: 4 }}>
                <strong>Audit-Trail:</strong> {eidas.auditUrl}
              </div>
            )}
          </div>
          <p style={{ fontSize: 7.5, marginTop: 6, color: "#666" }}>
            Phase A · Hash + Signatur sind Stub-Werte. Die echte qualifizierte
            Signatur erfolgt in Phase B über D-Trust Sign-Me oder gleichwertigen
            VDA. Bis dahin gilt nur die handschriftliche Unterschrift des
            Aufsichtsrats-Vorsitzenden auf dem ausgedruckten Dokument.
          </p>
        </div>
      </div>
    </div>
  );
}
