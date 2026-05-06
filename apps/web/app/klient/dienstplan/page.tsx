// Klient-Sicht des Dienstplans — gefiltert auf Bezugs-Personen.
//
// Datenschutz-Mechanik: Klient:in sieht NUR die Schichten der Personen, die
// laut CASELOADS für sie zuständig sind. Plus den aktiven KI-Plan dieser
// Personen für den aktuellen Monat. Keine Stationsleitungs-Sicht, kein
// "wer arbeitet wo sonst".

import Link from "next/link";
import { notFound } from "next/navigation";
import { KlientShell } from "@/components/KlientShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { seedOnce } from "@/lib/seed";
import { getKlient } from "@/lib/hierarchy/store";
import { CASELOADS } from "@/lib/zuordnung/store";
import { aktuelle as aktuellerKiPlan } from "@/lib/dienstplan/plan-history";
import { BerufsplanView } from "@/components/BerufsplanView";
import { generateKlientPlan } from "@/lib/berufsplan/generator";

const KLIENT_ID = "klient-hr";

const PERSON_NAMES: Record<string, string> = {
  "person-dr": "Dennis Reuter",
  "person-as-005": "Aylin Stein",
  "person-fk-004": "Felix Kaminski",
  "person-jm-006": "Jana Möbius",
  "person-st-011": "Sven Trautmann",
  "person-ed-012": "Eda Demir",
  "person-vb-008": "Veronica Bianchi",
  "person-de1": "Detektiv Eins",
  "person-lana-lead": "Lana",
  "person-therapeut-001": "Sebastian Rauer",
  "person-sozial-001": "Mira Wagner",
  "person-ehrenamt-001": "Rita Schöndorf",
  "person-arzt-001": "Dr. Susanne Hartmann",
  "person-as-pad": "Anika Stein-Padberg",
  "hwf-001": "Helmut Brandt",
  "erzieher-001": "Yvonne Berger",
};

const SCHICHT_LABEL: Record<string, string> = {
  frueh: "F", spaet: "S", nacht: "N", tag: "T", geteilter_dienst: "G",
};
const SCHICHT_FARBE: Record<string, string> = {
  frueh: "var(--mon)",
  spaet: "var(--wed)",
  nacht: "var(--sat)",
  tag: "var(--thu)",
  geteilter_dienst: "var(--fri)",
};

const BERUF_LABEL: Record<string, string> = {
  pflege: "Pflege",
  arzt: "Hausärztin",
  therapie: "Therapie",
  sozialarbeit: "Sozialarbeit",
  lead: "Leitung",
  ehrenamt: "Begleitung",
  heilerziehung: "Heilerziehung",
  hauswirtschaft: "Hauswirtschaft",
};

export const metadata = {
  title: "Mein Pflegeteam · Dienstplan",
  description: "Sehen Sie wer wann für Sie da ist — gefiltert auf Ihre Bezugspersonen.",
};

export default function KlientDienstplanPage() {
  seedOnce();
  const klient = getKlient(KLIENT_ID);
  if (!klient) notFound();

  // Personen die diese:n Klient:in betreuen
  const meineBetreuende = CASELOADS
    .filter((cl) => cl.klientIds.includes(KLIENT_ID))
    .map((cl) => ({
      personId: cl.personId,
      beruf: cl.beruf,
      rolle: cl.rolle,
      name: PERSON_NAMES[cl.personId] ?? cl.personId,
    }));

  const meineBetreuendeIds = new Set(meineBetreuende.map((p) => p.personId));

  // Aktiven KI-Plan einlesen + auf meine Bezugspersonen filtern
  const plan = aktuellerKiPlan();
  const meineSchichten = (plan?.ergebnis.zuweisungen ?? []).filter((z) =>
    meineBetreuendeIds.has(z.personId),
  );

  // Tage der nächsten 14 Tage als Achse
  const heute = new Date();
  const tage: string[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(heute);
    d.setDate(heute.getDate() + i);
    tage.push(d.toISOString().slice(0, 10));
  }

  // Pro Person + Tag die Schicht
  const schichtMap = new Map<string, string>();
  for (const z of meineSchichten) {
    schichtMap.set(`${z.personId}::${z.datumISO}`, z.schicht);
  }

  return (
    <KlientShell user={{ name: klient.name, initials: klient.initials, relation: "self", klientId: KLIENT_ID }}>
      <RolePastelHeader
        rolle="klient"
        eyebrow="Mein Pflegeteam · Wer ist wann da?"
        titel="Wer kommt zu mir?"
        loopSrc="/loops/akte-puls.mp4"
      >
        Sie sehen hier nur die Personen, die Ihnen zugeordnet sind — {meineBetreuende.length} Bezugspersonen
        aus {new Set(meineBetreuende.map((p) => p.beruf)).size} Berufsgruppen. Was andere Pflegekräfte
        an anderen Stationen machen, geht Sie nichts an und wird auch nicht angezeigt.
      </RolePastelHeader>

      {!plan?.uebernommen && (
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: "rgb(var(--accent) / 0.08)", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}
        >
          <p className="text-[12px]" style={{ color: "rgb(var(--accent))" }}>
            ⓘ Kein aktiver Dienstplan
          </p>
          <p className="text-[12px] text-soft mt-1">
            Sobald Ihre Stationsleitung den nächsten Plan bestätigt, sehen Sie hier wer wann zu Ihnen kommt.
          </p>
        </div>
      )}

      <section className="surface rounded-2xl p-4 mb-5 overflow-x-auto">
        <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-3">
          Nächste 14 Tage · {meineSchichten.length} Schicht-Einträge
        </p>
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[10px] text-soft font-medium px-2 py-1">Person</th>
              <th className="text-left text-[10px] text-soft font-medium px-2 py-1">Rolle</th>
              {tage.map((d) => {
                const dt = new Date(d);
                return (
                  <th key={d} className="text-center text-[10px] text-soft font-medium px-1 py-1 whitespace-nowrap">
                    {dt.toLocaleDateString("de-DE", { weekday: "short" }).slice(0, 2)}
                    <div className="text-[9px] font-mono">{dt.getDate()}.{dt.getMonth() + 1}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {meineBetreuende.map((p) => (
              <tr key={p.personId} className="border-t border-soft">
                <td className="px-2 py-1.5 whitespace-nowrap">{p.name}</td>
                <td className="px-2 py-1.5 text-soft text-[11px] whitespace-nowrap">{BERUF_LABEL[p.beruf] ?? p.beruf}</td>
                {tage.map((d) => {
                  const schicht = schichtMap.get(`${p.personId}::${d}`);
                  if (!schicht) {
                    return <td key={d} className="px-1 py-1.5 text-center text-mute">·</td>;
                  }
                  const farbe = SCHICHT_FARBE[schicht] ?? "var(--accent)";
                  return (
                    <td key={d} className="px-1 py-1.5 text-center">
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold font-mono"
                        style={{
                          background: `rgb(${farbe} / 0.15)`,
                          color: `rgb(${farbe})`,
                          boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.3)`,
                        }}
                        title={`${p.name} · ${schicht}`}
                      >
                        {SCHICHT_LABEL[schicht] ?? "·"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-5">
        <h2 className="text-[14px] font-medium mb-3 flex items-baseline gap-2">
          Termine über alle Berufe · 14 Tage
          <span className="text-[10px] text-soft font-mono">arzt · therapie · sozial · ehrenamt · heilerziehung · hauswirtschaft</span>
        </h2>
        <BerufsplanView items={generateKlientPlan(KLIENT_ID, 14)} leitfarbe="var(--wed)" perspektive="klient" />
      </section>

      <section className="surface rounded-2xl p-4 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-3">Mein Pflegeteam</p>
        <ul className="grid sm:grid-cols-2 gap-2">
          {meineBetreuende.map((p) => (
            <li key={p.personId} className="surface-mute rounded-lg p-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="text-[13px] font-medium">{p.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded surface text-soft">{BERUF_LABEL[p.beruf] ?? p.beruf}</span>
              </div>
              <p className="text-[11px] text-soft mt-0.5">{p.rolle}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Datenschutz · was Sie nicht sehen</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Die Plattform zeigt Ihnen nur die {meineBetreuende.length} Personen, die für Sie zuständig sind. Andere
          Pflegekräfte an anderen Stationen, andere Klient:innen, die Personalbuchhaltung — all das
          ist für Sie unsichtbar. Was Sie sehen wollen, bestimmen Sie. Wenn Sie eine Person aus Ihrem Team
          entfernen möchten, sprechen Sie mit Ihrer Stationsleitung oder nutzen Sie{" "}
          <Link href="/klient/notizen" className="underline-offset-2 hover:underline">die Notiztafel</Link>.
        </p>
      </section>
    </KlientShell>
  );
}
