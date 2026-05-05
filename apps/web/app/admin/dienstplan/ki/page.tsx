import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { KiDienstplanGenerator } from "@/components/KiDienstplanGenerator";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import {
  PERSONAL_BUDGETS,
  BERUF_BUDGET,
  sollStundenProMonat,
  istStundenAusSlots,
  type Beruf,
} from "@/lib/dienstplan/budget";

export const metadata = {
  title: "KI-Monatsplan · Shalem Care",
  description: "Soll-Stunden je Beruf · KI-gestützte Plan-Simulation für den ganzen Monat.",
};

const PERSON_NAMES: Record<string, string> = {
  "person-dr": "Dennis Reuter",
  "person-as-005": "Aylin Stein (Wundexpertin)",
  "person-fk-004": "Felix Kaminski",
  "person-jm-006": "Jana Möbius",
  "person-st-011": "Sven Trautmann",
  "person-ed-012": "Eda Demir",
  "person-vb-008": "Veronica Bianchi",
  "person-de1": "Detektiv Eins",
  "person-lana-lead": "Lana",
  "person-therapeut-001": "Sebastian Rauer",
  "person-sozial-001": "Mira Wagner",
  "erzieher-001": "Yvonne Berger",
  "person-as-pad": "Anika Stein-Padberg",
  "hwf-001": "Helmut Brandt",
  "person-ehrenamt-001": "Rita Schöndorf",
  "person-arzt-001": "Dr. Susanne Hartmann",
};

const BERUF_LABEL: Record<Beruf, string> = {
  pflege: "Pflege",
  lead: "Stationsleitung",
  arzt: "Ärzt:innen",
  therapie: "Therapie",
  sozialarbeit: "Sozialarbeit",
  heilerziehung: "Heilerziehung",
  hauswirtschaft: "Hauswirtschaft",
  erziehung: "Erziehung",
  ehrenamt: "Ehrenamt",
};

export default async function KiDienstplanPage() {
  seedOnce();

  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;

  const heute = new Date();
  const jahr = heute.getFullYear();
  const monat = heute.getMonth() + 1;

  // Soll/Ist pro Person
  const personenStatus = await Promise.all(
    PERSONAL_BUDGETS.map(async (pb) => {
      let ist = 0;
      try {
        const slots = await store.listSlotsForPerson(pb.personId);
        ist = istStundenAusSlots(slots, jahr, monat);
      } catch {
        ist = 0;
      }
      const soll = sollStundenProMonat(pb.personId);
      return {
        personId: pb.personId,
        name: PERSON_NAMES[pb.personId] ?? pb.personId,
        beruf: pb.beruf,
        soll,
        ist,
        saldo: Math.round((ist - soll) * 10) / 10,
        kommentar: pb.kommentar,
      };
    }),
  );

  // Aggregat pro Beruf
  type Aggr = { soll: number; ist: number; personenAnzahl: number };
  const proBeruf = personenStatus.reduce<Record<string, Aggr>>((acc, p) => {
    if (!acc[p.beruf]) acc[p.beruf] = { soll: 0, ist: 0, personenAnzahl: 0 };
    acc[p.beruf].soll += p.soll;
    acc[p.beruf].ist += p.ist;
    acc[p.beruf].personenAnzahl += 1;
    return acc;
  }, {});

  return (
    <AppShell
      role="lead"
      user={{ id: lead.id, name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="KI-Monatsplan"
    >
      <header className="mb-6">
        <Link href="/admin/dienstplan" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← zum Wochen-Dienstplan
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Monatsplan · KI-gestützt</p>
        <h1 className="font-display text-[28px] sm:text-[32px] font-bold tracking-tight2 leading-[1.05]">
          Stunden im Blick. <span className="rainbow-text">Plan in einer Minute</span>.
        </h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose leading-relaxed">
          Pro Beruf gibt es ein Soll-Stunden-Budget (TVöD-VKA / TV-Ärzte). Je Person ist ein
          Teilzeit-Faktor hinterlegt. Die KI nimmt diese Werte plus deinen Bedarf, plus ArbZG,
          und schlägt einen kompletten Monatsplan vor — den du übernimmst, korrigierst oder
          verwirfst.
        </p>
      </header>

      {/* ─── Soll-Stunden pro Beruf ─── */}
      <section className="mb-6">
        <header className="mb-2">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Soll-Stunden pro Berufsgruppe · {jahr}-{String(monat).padStart(2, "0")}</h2>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(proBeruf) as Beruf[]).map((b) => {
            const aggr = proBeruf[b];
            const std = BERUF_BUDGET[b];
            const aus = aggr.soll > 0 ? Math.round((aggr.ist / aggr.soll) * 100) : 0;
            return (
              <div key={b} className="surface rounded-xl p-4">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-[13px] font-bold">{BERUF_LABEL[b]}</span>
                  <span className="text-[10px] text-soft">{aggr.personenAnzahl} {aggr.personenAnzahl === 1 ? "Person" : "Personen"}</span>
                </div>
                <p className="text-[10px] text-soft mb-2 italic">{std.beschreibung}</p>
                <div className="grid grid-cols-3 gap-2 text-[12px] mb-2">
                  <Stat label="Soll" wert={`${aggr.soll} h`} />
                  <Stat label="Ist" wert={`${aggr.ist} h`} />
                  <Stat label="∑ Saldo" wert={`${aggr.ist - aggr.soll > 0 ? "+" : ""}${Math.round((aggr.ist - aggr.soll) * 10) / 10} h`} />
                </div>
                <div className="h-1.5 rounded surface-mute overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min(aus, 110)}%`,
                      background: aus >= 95 && aus <= 105
                        ? "rgb(var(--thu))"
                        : aus < 90 ? "rgb(var(--sat))" : "rgb(var(--wed))",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── KI-Generator ─── */}
      <KiDienstplanGenerator defaultJahr={jahr} defaultMonat={monat} />

      {/* ─── Personen-Tabelle (Soll/Ist) ─── */}
      <section className="surface rounded-2xl p-5">
        <header className="mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Soll-Stunden pro Person · {jahr}-{String(monat).padStart(2, "0")}</h2>
          <p className="text-[12px] text-mute mt-1">
            Vertragsstand · Teilzeit-Faktor pro Person ist in <code className="font-mono text-[11px]">lib/dienstplan/budget.ts</code> hinterlegt.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="text-left text-soft">
                <th className="px-2 py-1.5 font-medium">Person</th>
                <th className="px-2 py-1.5 font-medium">Beruf</th>
                <th className="px-2 py-1.5 font-medium font-mono text-right">Soll</th>
                <th className="px-2 py-1.5 font-medium font-mono text-right">Ist (Slots)</th>
                <th className="px-2 py-1.5 font-medium font-mono text-right">Saldo</th>
                <th className="px-2 py-1.5 font-medium">Vertrag</th>
              </tr>
            </thead>
            <tbody>
              {personenStatus.map((p) => (
                <tr key={p.personId} className="border-t border-soft">
                  <td className="px-2 py-1.5">{p.name}</td>
                  <td className="px-2 py-1.5 text-soft">{BERUF_LABEL[p.beruf]}</td>
                  <td className="px-2 py-1.5 font-mono text-right">{p.soll} h</td>
                  <td className="px-2 py-1.5 font-mono text-right text-soft">{p.ist} h</td>
                  <td
                    className="px-2 py-1.5 font-mono text-right"
                    style={{ color: p.saldo === 0 ? "rgb(var(--thu))" : p.saldo < 0 ? "rgb(var(--sat))" : "rgb(var(--wed))" }}
                  >
                    {p.saldo > 0 ? "+" : ""}{p.saldo} h
                  </td>
                  <td className="px-2 py-1.5 text-[11px] text-mute">{p.kommentar ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, wert }: { label: string; wert: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div className="font-mono">{wert}</div>
    </div>
  );
}
