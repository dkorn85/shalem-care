import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CoordinatorClient } from "@/components/CoordinatorClient";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { computeCoordinatorSuggestions } from "@/lib/dispo/actions";

export const metadata = {
  title: "KI-Koordinator",
  description: "Einrichtungs-übergreifende Schicht-Disposition mit erklärbaren KI-Vorschlägen.",
};

export default async function KoordinatorPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const r = await computeCoordinatorSuggestions();

  return (
    <AppShell
      role="lead"
      user={{ id: lead.id, name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Genossenschafts-Koordinator"
    >
      <header className="mb-6">
        <Link href="/admin/dienstplan" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Dienstplan
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">KI-Koordinator · Einrichtungs-übergreifend</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Schicht-Disposition</h1>
        <p className="text-[13px] text-mute mt-1.5 max-w-prose">
          Alle freien Slots aus Träger-Imports und manuellen Anlagen, mit Top-3-Vorschlägen aus dem
          Genossenschafts-Pool. Hard-Constraints (ArbZG, Qualifikation, Geo-Radius, Ruhezeit) blockieren
          ungeeignete Kandidaten transparent. Soft-Score: Wunsch · Kontinuität · Nähe · Erfahrung ·
          Fairness · Erholt · Bewertung.
        </p>
      </header>

      <CoordinatorClient initial={r.ok ? r.suggestions : []} />

      <p className="text-[11px] text-soft mt-8 max-w-prose">
        Phase 2: Live-Updates via Server-Sent-Events, Auto-Annahme bei high-confidence + Mitarbeiter-Opt-In,
        Lookahead-Optimierung (mehrere Slots gleichzeitig statt Greedy).
      </p>
    </AppShell>
  );
}
