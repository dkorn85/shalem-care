import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getAntrag, seedAntraegeOnce } from "@/lib/pflegegrad/antrag-store";
import {
  ANTRAG_PIPELINE,
  STATUS_FARBE,
  STATUS_LABEL,
  PHASE_TIPP,
  fortschritt,
} from "@/lib/pflegegrad/antrag-types";
import { MODULE } from "@/lib/pflegegrad/check";
import { PflegegradAntragActions } from "@/components/PflegegradAntragActions";

export const metadata = {
  title: "Pflegegrad-Antrag · Detail",
};

export default async function AntragDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  seedAntraegeOnce();
  const { id } = await params;
  const a = getAntrag(id);
  if (!a) notFound();

  const f = fortschritt(a.status);
  const farbe = STATUS_FARBE[a.status];

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/admin/pflegegrad" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Pipeline</Link>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
            style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
          >
            {STATUS_LABEL[a.status]}
          </span>
          <h1 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2 leading-[1.1]">
            {a.art === "erstantrag" ? "Pflegegrad-Erstantrag" : a.art === "hoehergruppierung" ? "Höhergruppierung" : "Widerspruch"}
          </h1>
        </div>
        <p className="text-[13px] text-soft font-mono mt-2">
          {a.id} · Klient {a.klientId} · {a.pflegekasse}
        </p>
      </header>

      <section className="surface rounded-2xl p-5 mb-6">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-4">
          Pipeline-Status
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
          {ANTRAG_PIPELINE.map((p, i) => {
            const aktiv = i < f;
            const aktuell = i === f - 1;
            const stufeFarbe = STATUS_FARBE[p.status];
            return (
              <li
                key={p.status}
                className="rounded-xl p-3 relative"
                style={{
                  background: aktiv ? `rgb(${stufeFarbe} / 0.1)` : "rgb(var(--bg-mute))",
                  borderLeft: `3px solid rgb(${aktiv ? stufeFarbe : "var(--bg-mute)"})`,
                  boxShadow: aktuell ? `0 0 0 2px rgb(${stufeFarbe} / 0.4)` : undefined,
                }}
              >
                <p className="font-mono text-[10px] text-soft mb-1">Schritt {i + 1}</p>
                <p
                  className="font-display font-bold text-[13px] tracking-tight2"
                  style={{ color: aktiv ? `rgb(${stufeFarbe})` : "rgb(var(--fg-mute))" }}
                >
                  <span aria-hidden className="mr-1">{p.emoji}</span>
                  {p.akteur}
                </p>
                <p className="text-[11px] text-soft mt-1">{STATUS_LABEL[p.status]}</p>
              </li>
            );
          })}
        </ol>
        <div className="surface-mute rounded-xl p-3 text-[12px] text-mute leading-relaxed">
          <strong className="text-[rgb(var(--fg))] font-medium">Tipp für diese Phase: </strong>
          {PHASE_TIPP[a.status]}
        </div>
      </section>

      <PflegegradAntragActions antrag={a} />

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="surface rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Antrag</p>
          <ul className="space-y-1 text-[13px] text-mute">
            <li>Art: {a.art}</li>
            <li>Pflegekasse: {a.pflegekasse}</li>
            {a.pflegekasseIk && <li>IK: {a.pflegekasseIk}</li>}
            <li>Eingereicht: {a.datumAntrag}</li>
            <li>Selbst-Score: {a.selbstScore ?? "—"}</li>
            <li>Vermuteter PG: {a.vermuteterPg ?? "—"}</li>
          </ul>
          {a.notiz && (
            <p className="text-[12px] text-mute mt-3 italic leading-relaxed">{a.notiz}</p>
          )}
        </div>

        <div className="surface rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Verlauf</p>
          <ol className="space-y-1.5 text-[12px]">
            {a.zeitstempel.map((z, i) => (
              <li key={i} className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-soft">{z.datum}</span>
                <span className="text-mute">{STATUS_LABEL[z.status]}</span>
              </li>
            ))}
          </ol>
        </div>

        {a.mdGutachten && (
          <div className="surface rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">MD-Gutachten</p>
            <p className="text-[13px] mb-3">
              <span className="font-mono text-soft">{a.mdGutachten.besuchsDatum}</span>{" "}
              · Gutachter:in <span className="font-mono">{a.mdGutachten.gutachterId}</span>
            </p>
            <table className="w-full text-[12px] mb-3">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-soft font-mono border-b border-[rgb(var(--bg-mute))]">
                  <th className="text-left py-1">Modul</th>
                  <th className="text-right py-1">Punkte</th>
                </tr>
              </thead>
              <tbody>
                {a.mdGutachten.modulPunkte.map((mp) => {
                  const m = MODULE.find((x) => x.id === mp.modulId);
                  return (
                    <tr key={mp.modulId}>
                      <td className="py-1">{m?.titel ?? mp.modulId}</td>
                      <td className="py-1 text-right font-mono">{mp.punkte}</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-[rgb(var(--bg-mute))]">
                  <td className="py-1 font-medium">Gesamtscore</td>
                  <td className="py-1 text-right font-display font-bold" style={{ color: "rgb(var(--vibe-stats))" }}>
                    {a.mdGutachten.gesamtScore}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Empfohlener PG</td>
                  <td className="py-1 text-right font-display font-bold">
                    {a.mdGutachten.empfohlenerPg ?? "—"}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-[12px] text-mute italic leading-relaxed">{a.mdGutachten.befund}</p>
          </div>
        )}

        {a.bescheid && (
          <div className="surface rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Bescheid</p>
            <ul className="space-y-1 text-[13px] text-mute">
              <li>Datum: <span className="font-mono">{a.bescheid.datum}</span></li>
              <li>
                Bewilligter PG:{" "}
                <span className="font-display font-bold" style={{ color: "rgb(var(--vibe-approval))" }}>
                  {a.bescheid.bewilligterPg ?? "kein PG"}
                </span>
              </li>
              <li>Geltend ab: <span className="font-mono">{a.bescheid.gueltigAb}</span></li>
              {a.bescheid.befristetBis && (
                <li>Befristet bis: <span className="font-mono">{a.bescheid.befristetBis}</span></li>
              )}
              <li>
                Widerspruchsfrist:{" "}
                <span className="font-mono">{a.bescheid.widerspruchsFristBis}</span>
              </li>
            </ul>
            <p className="text-[12px] text-mute mt-3 italic leading-relaxed">
              {a.bescheid.begruendung}
            </p>
          </div>
        )}

        {a.widerspruch && (
          <div className="surface rounded-2xl p-5" style={{ borderLeft: "3px solid rgb(var(--mon))" }}>
            <p className="text-[10px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>
              Widerspruch · läuft
            </p>
            <p className="text-[13px] mb-2">
              Eingelegt am <span className="font-mono">{a.widerspruch.datum}</span>
              {a.widerspruch.beistand && <> · Beistand <strong>{a.widerspruch.beistand}</strong></>}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {a.widerspruch.gruende.map((g) => (
                <span key={g} className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[rgb(var(--bg-mute))]">
                  {g}
                </span>
              ))}
            </div>
            <p className="text-[12px] text-mute leading-relaxed">{a.widerspruch.begruendung}</p>
            {a.widerspruch.belege && a.widerspruch.belege.length > 0 && (
              <ul className="text-[11px] text-soft mt-3 space-y-0.5">
                {a.widerspruch.belege.map((b, i) => (
                  <li key={i}>📎 {b}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </AppShell>
  );
}
