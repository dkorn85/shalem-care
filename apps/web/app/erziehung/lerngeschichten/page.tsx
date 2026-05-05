import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const GESCHICHTEN = [
  {
    id: "lg-1",
    kind: "Mia S. (3;5)",
    titel: "Mia kommt jetzt selbstständig in den Kreis",
    datum: "vor 2 Tagen",
    autorin: "Yvonne",
    bildungsbereich: "Soziales & Gefühle",
    typ: "Eingewöhnung Phase 2 abgeschlossen",
    status: "veroeffentlicht",
    text: 'Heute beim Sing-Kreis hat Mia zum ersten Mal ohne Aufforderung in der Mitte Platz genommen. Sie hat sich zu Tarek und Aisha gesetzt, hat gewinkt und mitgesungen — der ganze Refrain von „Mein Hut, der hat drei Ecken". Beim Schluss-Kreis hat sie aktiv ihren Tag erzählt: „Ich war im Werkbereich und hab ein Auto gebaut. Mit Henri." Drei Sätze hintereinander, ungefragt. Eingewöhnung Phase 2 ist offiziell abgeschlossen. Wir bleiben aufmerksam für die typischen kleinen Rückschritte in den nächsten Wochen — aber heute ist ein Meilenstein.',
  },
  {
    id: "lg-2",
    kind: "Tarek B. (4;1)",
    titel: "Tarek hat heute zum ersten Mal aktiv um Hilfe gebeten",
    datum: "vor 4 Tagen",
    autorin: "Yvonne",
    bildungsbereich: "Sprache & Kommunikation",
    typ: "Sozialer Meilenstein",
    status: "entwurf",
    text: 'Beim Werkbereich hat Tarek mit dem Holzleim gekämpft — Deckel klemmt. Er hat zu mir geschaut, „Yvonne … bitte" gesagt und auf den Deckel gezeigt. Das war seine erste explizite Hilfsanfrage in voller Sprache. Anika sagt, sie hat ihn die letzten Wochen oft beobachtet, wie er leise nach Lösungen suchte. Heute hat er Mut gefasst. (Foto vom Werk angehängt — sein erstes selbstgemaltes Bild für die Mama.)',
  },
  {
    id: "lg-3",
    kind: "Henri F. (5;7)",
    titel: "Henri organisiert das Vorlese-Quartett",
    datum: "letzte Woche",
    autorin: "Yasemin (Adler)",
    bildungsbereich: "Mathematik & Logik · Soziales",
    typ: "Schulreife-Beobachtung",
    status: "veroeffentlicht",
    text: 'Henri hat in der Adler-Gruppe vier Bücher zu vier Gruppen-Fächern zugeordnet (Tiere, Berufe, Jahreszeiten, Helden). Die Zuordnung war ohne Hinweis fast vollständig korrekt. Beim Vorlesen hat er die anderen Kinder nach Themenwunsch gefragt und vermittelt: „Lukas will Tiere, du wolltest Berufe — wir machen erst Tiere, dann Berufe." Selbstorganisierte Konfliktlösung mit Begründung. Schulreife-Indikator deutlich.',
  },
  {
    id: "lg-4",
    kind: "Liana M. (3;8)",
    titel: "Liana erzählt auf Russisch und übersetzt",
    datum: "vor 8 Tagen",
    autorin: "Yvonne",
    bildungsbereich: "Sprache & Kommunikation",
    typ: "Mehrsprachigkeit aktiv",
    status: "veroeffentlicht",
    text: 'Im Sing-Kreis hat Liana das Lied „Сорока-белобока" auf Russisch vorgestellt. Sie hat dabei spontan übersetzt („Das ist die Elster, sie kocht Brei für Kinder") — fast wortgetreu. BISC-Sprachstand wird nächsten Mittwoch erfasst, aber heute war der Moment einen Eintrag wert.',
  },
];

const STATUS_FARBE: Record<string, string> = {
  veroeffentlicht: "var(--thu)",
  entwurf:         "var(--vibe-approval)",
};

export const metadata = { title: "Erziehung · Lerngeschichten" };

export default async function LerngeschichtenPage() {
  return (
    <AppShell role="erziehung" user={{ id: "erzieher-001", name: "Yvonne Berger", subtitle: "Erzieherin", initials: "YB" }} station="Kita Sonnenblume">
      <header className="mb-6">
        <Link href="/erziehung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Lerngeschichten</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Beobachtende Bildungsdoku · jeder Eintrag würdigt einen Bildungs-Moment.
          Kein Defizit-Listing — Stärken sehen und festhalten.
        </p>
      </header>

      <ul className="space-y-4">
        {GESCHICHTEN.map((g) => (
          <article key={g.id} className="surface rounded-2xl p-5">
            <header className="flex items-baseline gap-2 flex-wrap mb-2">
              <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[g.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[g.status]})` }}>
                {g.status === "entwurf" ? "Entwurf" : "Veröffentlicht"}
              </span>
              <span className="text-[11px] text-soft font-mono">{g.datum}</span>
              <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{g.bildungsbereich}</span>
            </header>
            <h2 className="font-display text-[18px] font-semibold tracking-tight2 leading-snug">{g.titel}</h2>
            <p className="text-[12px] text-mute mt-1.5">{g.kind} · von {g.autorin} · {g.typ}</p>
            <p className="text-[14px] mt-3 leading-relaxed text-pretty">{g.text}</p>
          </article>
        ))}
      </ul>

      <section className="surface rounded-2xl p-5 mt-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Foto-Anhang per Drag-and-Drop · automatische Bildungsbereich-Klassifikation
          (KI-Unterstützung) · Eltern-App: Veröffentlichte Geschichten landen direkt im Eltern-Postfach.
        </p>
      </section>
    </AppShell>
  );
}
