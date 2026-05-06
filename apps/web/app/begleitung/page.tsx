import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";

export const metadata = {
  title: "Würde-Begleitung · Berührung + Nähe",
  description: "Cockpit für ausgebildete Berührungs- und Sterbe-Begleiter:innen — sensible Pflege jenseits medizinischer Versorgung.",
};

const BEGLEITUNGEN = [
  { id: "wb-2026-01", klient: "Helga Reinhardt", typ: "Hand- + Schulter-Berührung · 30 min", einrichtung: "St. Lukas WB-A", einwilligung: "schriftlich, 2026-03-12", letzte: "vor 3 Tagen" },
  { id: "wb-2026-02", klient: "Otto Tannhäuser", typ: "Sterbe-Begleitung · Nacht-Wache", einrichtung: "St. Lukas WB-A", einwilligung: "Patientenverfügung", letzte: "letzte Nacht" },
  { id: "wb-2026-03", klient: "Margot Volkmann (verstorben)", typ: "Trauer-Begleitung Tochter", einrichtung: "—", einwilligung: "Tochter-Anfrage", letzte: "abgeschlossen" },
  { id: "wb-2026-04", klient: "Friedrich Liebenau", typ: "Lese-Stunden + Nähe-Spaziergang", einrichtung: "Augsburg Süd", einwilligung: "schriftlich + Tochter", letzte: "vor 2 Tagen" },
];

const ANGEFRAGT = [
  { klient: "Konrad Heuser", anfrage: "Familie sucht Berührungs-Begleitung 2× wöchentlich", einrichtung: "Geriatrie München", offen_seit: "vor 4 Tagen" },
  { klient: "Edith Niemeyer", anfrage: "Nacht-Anwesenheit nach Diagnose Demenz fortgeschritten", einrichtung: "München-Nord", offen_seit: "gestern" },
];

const QUALIFIKATION = [
  { name: "DGCC-Casemanagement-Schein", haben: 7, brauchen: 4, hinweis: "fortgeschrittene Begleiter:innen" },
  { name: "Berkana Berührungs-Pflege", haben: 5, brauchen: 3, hinweis: "Pflichtfortbildung neue Mitglieder" },
  { name: "Sterbebegleitung (Hospizbasis)", haben: 9, brauchen: 6, hinweis: "ehrenamtl. Hospiz-Verein" },
];

export default function BegleitungPage() {
  return (
    <AppShell role="begleitung" user={{ id: "wb-001", name: "Marlene Voss", subtitle: "Würde-Begleitung · ICW + Berkana", initials: "MV" }} station="Würde-Genossenschaft">
      <RolePastelHeader
        rolle="begleitung"
        eyebrow="Würde-Begleitung · Berührung in den letzten Lebensphasen"
        titel="Servus, Marlene."
        loopSrc="/loops/atmo-begleitung.mp4"
        patternSrc="/patterns/lavender-still.png"
        rightSlot={
          <div className="relative aspect-[4/3] w-full max-w-xs rounded-2xl overflow-hidden">
            <Image src="/akte/header-begleitung.png" alt="" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover" priority />
          </div>
        }
      >
        {BEGLEITUNGEN.length} aktive Begleitungen · {ANGEFRAGT.length} Anfragen offen.
        Jeder Auftrag mit dokumentierter Einwilligung der Klient:in oder gesetzlichen Betreuung.
      </RolePastelHeader>

      <section className="surface rounded-2xl p-5 mb-5">
        <p className="text-[11px] uppercase tracking-wider font-medium mb-2" style={{ color: "rgb(var(--wed))" }}>
          ⚠ Achtung · Würde-Standard der Genossenschaft
        </p>
        <p className="text-[12px] text-soft leading-relaxed">
          Würde-Begleitung ist <em>keine</em> medizinische und <em>keine</em> sexuelle Dienstleistung. Sie ist
          gewissenhaft ausgebildete Nähe — Hand-Halten, Vorlesen, Schweigen, Berührung in Würde, Sterbe-Wache,
          Trauer-Begleitung. Jeder Auftrag erfordert <strong>schriftliche Einwilligung</strong> der Klient:in
          (oder Vorsorge-Bevollmächtigten bei eingeschränkter Geschäftsfähigkeit) und einen dokumentierten
          Schulungsabschluss der begleitenden Person. Bei Verdacht auf Grenzüberschreitung greift die
          Eskalations-Kette der Stationsleitung.
        </p>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Kpi label="Aktive Begleitungen" value={BEGLEITUNGEN.filter((b) => b.letzte !== "abgeschlossen").length} farbe="var(--wed)" icon="🤲" />
        <Kpi label="Anfragen offen"      value={ANGEFRAGT.length} farbe="var(--accent)" icon="📩" />
        <Kpi label="Sterbe-Wachen"        value={BEGLEITUNGEN.filter((b) => b.typ.includes("Sterbe")).length} farbe="var(--vibe-profile)" icon="🕊" />
        <Kpi label="Einwilligungen ok"    value="100 %" farbe="var(--thu)" icon="✓" />
      </section>

      <section className="surface rounded-2xl p-5 mb-5">
        <header className="mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Aktive Begleitungen</h2>
          <p className="text-[11px] text-soft">jede mit Einwilligungs-Quelle dokumentiert</p>
        </header>
        <ul className="space-y-2">
          {BEGLEITUNGEN.map((b) => (
            <li key={b.id} className="surface-mute rounded-lg p-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="text-[13px] font-medium">{b.klient}</span>
                <span className="text-[11px] text-mute">{b.letzte}</span>
              </div>
              <p className="text-[12px] text-soft mt-0.5">{b.typ}</p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded surface" style={{ color: "rgb(var(--thu))" }}>
                  ✓ Einwilligung: {b.einwilligung}
                </span>
                {b.einrichtung !== "—" && <span className="text-[10px] text-mute">{b.einrichtung}</span>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid lg:grid-cols-2 gap-4 mb-5">
        <div className="surface rounded-2xl p-5">
          <header className="mb-3">
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Anfragen aus Familien + Pflege</h2>
            <p className="text-[11px] text-soft">noch nicht zugewiesen</p>
          </header>
          <ul className="space-y-2">
            {ANGEFRAGT.map((a, i) => (
              <li key={i} className="surface-mute rounded-lg p-2.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-[12px] font-medium">{a.klient}</span>
                  <span className="text-[11px] text-mute">{a.offen_seit}</span>
                </div>
                <p className="text-[11px] text-soft mt-0.5">{a.anfrage}</p>
                <p className="text-[10px] text-mute mt-0.5">{a.einrichtung}</p>
                <button type="button" className="text-[11px] mt-2 px-2 py-0.5 rounded transition-all" style={{ color: "rgb(var(--wed))", boxShadow: "inset 0 0 0 1px rgb(var(--wed) / 0.4)" }}>
                  → Begleitung übernehmen + Einwilligung einholen
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface rounded-2xl p-5">
          <header className="mb-3">
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Qualifikations-Pool</h2>
            <p className="text-[11px] text-soft">Begleiter:innen mit Schulungsabschluss</p>
          </header>
          <ul className="space-y-2">
            {QUALIFIKATION.map((q) => {
              const verfuegbar = q.haben - q.brauchen;
              const farbe = verfuegbar > 1 ? "var(--thu)" : verfuegbar === 1 ? "var(--wed)" : "var(--mon)";
              return (
                <li key={q.name} className="surface-mute rounded-lg p-2.5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span className="text-[12px] font-medium">{q.name}</span>
                    <span className="text-[11px] font-mono" style={{ color: `rgb(${farbe})` }}>
                      {q.haben} / {q.brauchen} min
                    </span>
                  </div>
                  <p className="text-[10px] text-mute mt-0.5">{q.hinweis}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Anbindung</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Anfragen kommen aus <Link href="/ehrenamt" className="underline-offset-2 hover:underline">/ehrenamt</Link> (Hospizdienst-Spuren),
          <Link href="/sozial" className="underline-offset-2 hover:underline"> /sozial</Link> (Casemanagement)
          und <Link href="/klient" className="underline-offset-2 hover:underline">/klient</Link>-Selbstbuchung.
          Übergänge zur <Link href="/bestatter" className="underline-offset-2 hover:underline">/bestatter</Link>-Trauerbegleitung sind dokumentiert.
        </p>
      </section>
    </AppShell>
  );
}

function Kpi({ label, value, farbe, icon }: { label: string; value: number | string; farbe: string; icon: string }) {
  return (
    <div className="surface rounded-xl p-3 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2 flex items-baseline justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
          <div className="font-display font-bold text-[20px] mt-0.5 leading-none" style={{ color: `rgb(${farbe})` }}>{value}</div>
        </div>
        <span aria-hidden className="text-[18px] opacity-60">{icon}</span>
      </div>
    </div>
  );
}
