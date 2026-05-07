// /admin/ti/konnektoren · gematik-Konnektor-Anbieter-Vergleich

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  KONNEKTOREN,
  TI_LABEL,
  empfehlung,
  type Konnektor,
  type TiAnwendung,
} from "@/lib/ti/konnektor-anbieter";

export const metadata = {
  title: "TI · Konnektor-Anbieter-Vergleich",
};

const ALLE_ANWENDUNGEN: TiAnwendung[] = [
  "vsdm",
  "kim-mail",
  "erezept",
  "tim",
  "epa",
  "evb",
  "evb-haupp",
  "kep",
  "nfdm",
  "emp",
];

const FIT_FARBE: Record<Konnektor["shalemFit"], string> = {
  ja: "var(--vibe-approval)",
  vielleicht: "var(--sun)",
  nein: "var(--mon)",
};

const FIT_LABEL: Record<Konnektor["shalemFit"], string> = {
  ja: "✓ passt",
  vielleicht: "~ vielleicht",
  nein: "✗ passt nicht",
};

export default function KonnektorVergleichPage() {
  const empfohlen = empfehlung("skaliert-multi");
  const empfohlenIds = new Set(empfohlen.map((k) => k.id));

  return (
    <AppShell
      role="lead"
      user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Telematik-Infrastruktur · gematik-Konnektor · Anbieter-Vergleich
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Wer schaltet uns an die TI?
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          Sechs zugelassene Anbieter im Vergleich. Für unser
          Multi-Standort-Multi-Beruf-Modell empfehlen wir aktuell die
          Cloud-Lösung — eine TI-Anbindung, viele Cockpits.
        </p>
      </header>

      <section className="surface rounded-2xl p-4 mb-6" style={{ background: "linear-gradient(135deg, rgb(var(--vibe-approval) / 0.06), transparent)", borderLeft: "3px solid rgb(var(--vibe-approval))" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
          Empfehlung für Shalem · Multi-Träger-Modell
        </p>
        <p className="text-[14px] mb-2">
          <strong>RISE Connect Cloud</strong> als Haupt-Konnektor · keine Hardware,
          skaliert mit jedem neuen Träger. <strong>89 €/Monat</strong> deckt alle
          relevanten Anwendungen ab.
        </p>
        <p className="text-[12px] text-mute leading-relaxed">
          Begründung: keine Hardware-Box pro Standort, alle TI-Anwendungen
          inkl. eRezept und KIM, Cloud-Updates ohne IT-Team, gute API für
          Cockpit-Integration. Risiko: Internet-Abhängigkeit + Cloud-Metadaten.
        </p>
      </section>

      <section className="overflow-x-auto mb-6">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[rgb(var(--bg-mute))]">
              <th className="text-left p-2 text-[10px] uppercase tracking-wider text-soft font-mono">
                Anbieter
              </th>
              <th className="text-left p-2 text-[10px] uppercase tracking-wider text-soft font-mono">Typ</th>
              <th className="text-right p-2 text-[10px] uppercase tracking-wider text-soft font-mono">Einmal</th>
              <th className="text-right p-2 text-[10px] uppercase tracking-wider text-soft font-mono">Monat</th>
              <th className="text-left p-2 text-[10px] uppercase tracking-wider text-soft font-mono">TI-Apps</th>
              <th className="text-left p-2 text-[10px] uppercase tracking-wider text-soft font-mono">Shalem</th>
            </tr>
          </thead>
          <tbody>
            {KONNEKTOREN.map((k) => (
              <tr
                key={k.id}
                className="border-b border-[rgb(var(--bg-mute))]/40 align-top"
                style={empfohlenIds.has(k.id) ? { background: "rgb(var(--vibe-approval) / 0.05)" } : undefined}
              >
                <td className="p-2">
                  <p className="font-display font-bold tracking-tight2">{k.hersteller}</p>
                  <p className="text-[11px] text-soft">{k.produkt}</p>
                  <p className="text-[10px] text-soft font-mono mt-0.5">{k.zulassung} · ab {k.zulassungAb}</p>
                </td>
                <td className="p-2 font-mono text-[11px]">{k.typ}</td>
                <td className="p-2 text-right font-mono">
                  {k.einmalEuro === 0 ? "—" : `${k.einmalEuro.toLocaleString("de-DE")} €`}
                </td>
                <td className="p-2 text-right font-mono">{k.monatlichEuro} €</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {ALLE_ANWENDUNGEN.map((a) => {
                      const supports = k.anwendungen.includes(a);
                      return (
                        <span
                          key={a}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                          style={{
                            background: supports ? "rgb(var(--vibe-approval) / 0.15)" : "rgb(var(--bg-mute))",
                            color: supports ? "rgb(var(--vibe-approval))" : "rgb(var(--fg-mute))",
                            opacity: supports ? 1 : 0.5,
                          }}
                          title={TI_LABEL[a]}
                        >
                          {a}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="p-2">
                  <span
                    className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: `rgb(${FIT_FARBE[k.shalemFit]} / 0.15)`,
                      color: `rgb(${FIT_FARBE[k.shalemFit]})`,
                    }}
                  >
                    {FIT_LABEL[k.shalemFit]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid lg:grid-cols-2 gap-3">
        {KONNEKTOREN.map((k) => (
          <article
            key={k.id}
            className="surface rounded-2xl p-4"
            style={{
              borderLeft: `3px solid rgb(${FIT_FARBE[k.shalemFit]})`,
            }}
          >
            <header className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono">
                {k.typ}
              </p>
              <h3 className="font-display text-[16px] font-bold tracking-tight2">
                {k.hersteller} · {k.produkt}
              </h3>
              <p className="text-[12px] text-mute mt-1">
                {k.einmalEuro === 0 ? "0 €" : `${k.einmalEuro.toLocaleString("de-DE")} €`} einmal · {k.monatlichEuro} €/Monat
              </p>
            </header>

            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-1 font-mono" style={{ color: "rgb(var(--vibe-approval))" }}>
                  Pro
                </p>
                <ul className="space-y-1 text-mute">
                  {k.pro.map((p, i) => (
                    <li key={i}>· {p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-1 font-mono" style={{ color: "rgb(var(--mon))" }}>
                  Contra
                </p>
                <ul className="space-y-1 text-mute">
                  {k.contra.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-[12px] text-mute mt-3 italic leading-relaxed">
              <strong className="text-[rgb(var(--fg))] font-medium">Shalem-Fit: </strong>
              {k.shalemBegruendung}
            </p>

            {k.webRef && (
              <p className="text-[11px] text-soft font-mono mt-2">{k.webRef}</p>
            )}
          </article>
        ))}
      </section>

      <section className="surface rounded-2xl p-4 mt-6" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.06), transparent)" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
          Nächste Schritte
        </p>
        <ol className="text-[12px] text-mute space-y-1.5 leading-relaxed list-decimal list-inside">
          <li>RISE-Sales-Kontakt aufnehmen — Test-Account für 30 Tage</li>
          <li>SMC-B-Karte für Shalem Care eG i.G. beantragen (über KZBV / KZV)</li>
          <li>HBA-Karten für die ärztlichen Mit-Eigentümer:innen ordern (gematik-zugelassene Vertrauensdiensteanbieter)</li>
          <li>Pilot-Standort definieren · KIM-Postfach + erstes eRezept versenden</li>
        </ol>
      </section>
    </AppShell>
  );
}
