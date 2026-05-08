// /klient/bescheide · Versicherten-Sicht aller eigenen Bescheide.
//
// Versicherte sieht hier ALLE Vorgänge, in denen sie als versicherte
// Person genannt ist — eAU, HKP-Genehmigungen, Krankengeld, Hilfsmittel,
// Abrechnungen. Nicht aus Sachbearbeiter-Sicht („eingegangen / in Prüfung"),
// sondern aus eigener Sicht: „läuft / entschieden / abgelehnt".
//
// Klick öffnet Detail mit Schein-Optik + Klartext-Spalte (re-use aus Kasse).

import Link from "next/link";
import { KlientShell } from "@/components/KlientShell";
import { listVorgaenge, seedKostentraegerOnce } from "@/lib/kostentraeger/store";
import { VORGANGS_LABEL, type KassenStatus } from "@/lib/kostentraeger/types";
import { seedKrankmeldungOnce } from "@/lib/krankmeldung/store";
import { seedAnfragenOnce } from "@/lib/verordnung/store";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const metadata = { title: "Klient · Meine Bescheide" };

const KLIENT_ID = "klient-hr";
const KLIENT_NAME = "Helga Reinhardt";

// Versicherten-Sicht — eigene, klartext-orientierte Status-Bezeichnungen
const KLIENT_STATUS_LABEL: Record<KassenStatus, string> = {
  eingegangen:  "läuft · noch nicht bearbeitet",
  in_pruefung:  "wird geprüft",
  rueckfrage:   "Krankenkasse hat Rückfrage",
  genehmigt:    "bewilligt ✓",
  abgelehnt:    "abgelehnt",
};

const KLIENT_STATUS_FARBE: Record<KassenStatus, string> = {
  eingegangen:  "var(--fri)",
  in_pruefung:  "var(--vibe-profile)",
  rueckfrage:   "var(--vibe-team)",
  genehmigt:    "var(--thu)",
  abgelehnt:    "var(--mon)",
};

export default async function KlientBescheidePage() {
  seedKrankmeldungOnce();
  seedAnfragenOnce();
  seedKostentraegerOnce();

  // Demo: alle Vorgänge mit dieser Klient:in als Versicherter
  const meine = listVorgaenge().filter(
    (v) => v.klientId === KLIENT_ID || v.versicherterName === KLIENT_NAME,
  );

  // „Braucht meine Aufmerksamkeit": Rückfrage (muss reagieren) oder
  // Ablehnung (Widerspruch möglich, 1 Monat-Frist)
  const aufmerksam = meine.filter((v) => v.status === "rueckfrage" || v.status === "abgelehnt");
  const aktiv = meine.filter((v) => v.status === "eingegangen" || v.status === "in_pruefung");
  const entschieden = meine.filter((v) => v.status === "genehmigt");

  return (
    <KlientShell user={{ name: KLIENT_NAME, initials: "HR", relation: "self", klientId: KLIENT_ID }}>
      <header className="mb-5">
        <Link href="/klient" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Akte
        </Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Meine Bescheide</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Alles, was die Krankenkasse über dich entschieden hat oder gerade
          entscheidet. Klick öffnet den Original-Bescheid und Lana erklärt
          daneben in Klartext, was er bedeutet und was als nächstes passiert.
        </p>
      </header>

      {/* Aufmerksamkeits-Block · prominent oben, wenn etwas zu tun ist */}
      {aufmerksam.length > 0 && (
        <section
          className="rounded-2xl p-4 mb-5"
          style={{
            background: "linear-gradient(135deg, rgb(var(--mon) / 0.10), rgb(var(--vibe-team) / 0.05))",
            boxShadow: "inset 0 0 0 1.5px rgb(var(--mon) / 0.35)",
          }}
        >
          <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
            <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--mon))" }}>
              ⚠ Braucht deine Aufmerksamkeit · {aufmerksam.length}
            </p>
            <span className="text-[10px] text-soft">{aufmerksam.filter((v) => v.status === "abgelehnt").length} Widerspruch möglich · {aufmerksam.filter((v) => v.status === "rueckfrage").length} Rückfrage</span>
          </div>
          <ul className="space-y-2">
            {aufmerksam.map((v) => (
              <BescheidKarte key={v.id} v={v} />
            ))}
          </ul>
        </section>
      )}

      <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
        <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--accent))" }}>
          ✦ Lana · so liest du diese Liste
        </p>
        <p className="text-[12px] text-mute leading-relaxed text-pretty">
          Oben siehst du, was gerade deine <strong>Aufmerksamkeit braucht</strong> — entweder hat
          die Krankenkasse eine Rückfrage, oder ein Antrag wurde abgelehnt und du kannst innerhalb
          von <strong>1 Monat Widerspruch</strong> einlegen. Darunter, was gerade <strong>läuft</strong>
          (noch in Bearbeitung) und was bereits <strong>bewilligt</strong> ist. Hilfe bekommst du
          jederzeit von deiner Pflegekraft oder einer Sozialberatung — kostet nichts.
        </p>
      </section>

      {aktiv.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-[16px] font-bold tracking-tight2 mb-2">Läuft gerade · {aktiv.length}</h2>
          <ul className="space-y-2">
            {aktiv.map((v) => (
              <BescheidKarte key={v.id} v={v} />
            ))}
          </ul>
        </section>
      )}

      {entschieden.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-[16px] font-bold tracking-tight2 mb-2">Bewilligt · {entschieden.length}</h2>
          <ul className="space-y-2">
            {entschieden.map((v) => (
              <BescheidKarte key={v.id} v={v} />
            ))}
          </ul>
        </section>
      )}

      {meine.length === 0 && (
        <p className="surface rounded-2xl p-6 text-[13px] text-soft text-center">
          Hier ist gerade nichts. Wenn die Pflege oder ein:e Ärzt:in etwas bei deiner Kasse
          beantragt, taucht es hier auf.
        </p>
      )}
    </KlientShell>
  );
}

function BescheidKarte({ v }: { v: ReturnType<typeof listVorgaenge>[number] }) {
  return (
    <li>
      <Link
        href={`/klient/bescheide/${v.id}`}
        className="surface-hover rounded-2xl p-4 block flex items-baseline gap-3 relative overflow-hidden"
      >
        <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${KLIENT_STATUS_FARBE[v.status]})` }} />
        <div className="ml-2.5 flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <span className="chip text-[10px]" style={{ background: `rgb(${KLIENT_STATUS_FARBE[v.status]} / 0.15)`, color: `rgb(${KLIENT_STATUS_FARBE[v.status]})` }}>
              {KLIENT_STATUS_LABEL[v.status]}
            </span>
            <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
              {VORGANGS_LABEL[v.typ]}
            </span>
            <span className="text-[11px] text-soft font-mono ml-auto">
              {format(new Date(v.eingegangenAm), "d. MMM yyyy", { locale: de })}
            </span>
          </div>
          <p className="text-[13px] font-medium leading-snug">{v.beschreibung}</p>
          <p className="text-[11px] text-soft mt-1">
            {v.kassenName}
            {v.einrichtungName && <> · {v.einrichtungName}</>}
            {v.notiz && <> · „{v.notiz}"</>}
          </p>
        </div>
        <span className="text-mute shrink-0 text-[13px] font-medium self-center">→</span>
      </Link>
    </li>
  );
}
