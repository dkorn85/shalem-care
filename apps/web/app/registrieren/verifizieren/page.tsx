// /registrieren/verifizieren — rollen-spezifische Echtheits-Prüfung.
//
// Nach dem OAuth-Signup landet die Person hier, wählt ihre Rolle, sieht
// welche Nachweise nötig sind und lädt sie hoch. Files landen im privaten
// Supabase-Storage-Bucket "verifizierungen", Metadaten in der
// `verifications`-Tabelle mit Status "eingereicht". Pruefung danach
// durch Service-Role-Personen über /admin/verifikationen.

import Link from "next/link";
import { ROLLEN, type RegistrierRolle, type VerifikationsFeld } from "@/lib/auth/rollen";
import { verifikationFormAction } from "@/lib/auth/verification-upload";
import { getCurrentUser } from "@/lib/auth/client";

export const metadata = {
  title: "Echtheits-Prüfung · Shalem Care",
  description: "Wähle deine Rolle und reiche die nötigen Nachweise ein.",
};

type SearchParams = { rolle?: RegistrierRolle; error?: string };

export default async function VerifizierenPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const aktiveRolle = params.rolle && ROLLEN[params.rolle] ? params.rolle : null;
  const errorMsg = params.error;
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-4xl mx-auto px-6 sm:px-12 py-10 space-y-10">
        <header>
          <Link href="/registrieren" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Anmeldung</Link>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Schritt 2 · Echtheits-Prüfung</p>
          <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-tight">
            {aktiveRolle ? <>Verifizierung als <span className="rainbow-text">{ROLLEN[aktiveRolle].label}</span></> : <>Welche <span className="rainbow-text">Rolle</span> bist du?</>}
          </h1>
          <p className="text-[13px] text-mute mt-2 max-w-prose leading-relaxed">
            {aktiveRolle ? (
              <>{ROLLEN[aktiveRolle].beschreibung} Wir brauchen die folgenden Nachweise — die werden verschlüsselt im privaten Storage abgelegt und nur der Prüfungs-Stelle gezeigt.</>
            ) : (
              <>Je nach Rolle ist die Echtheits-Prüfung anders. Pflegekräfte zeigen Examensurkunde + IK, Ärzt:innen LANR + Approbation, Klient:innen brauchen nur ihre Pflegekassen-Nummer (optional).</>
            )}
          </p>
        </header>

        {!user && (
          <section className="surface rounded-xl p-4" style={{ background: "rgb(var(--mon) / 0.06)" }}>
            <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--mon))" }}>Nicht eingeloggt</p>
            <p className="text-[13px] leading-relaxed">
              Du musst erst einen <Link href="/registrieren" className="underline">Account anlegen</Link> oder
              dich <Link href="/anmelden" className="underline">anmelden</Link>, bevor du Nachweise einreichen kannst.
            </p>
          </section>
        )}

        {errorMsg && (
          <section className="surface rounded-xl p-4" style={{ background: "rgb(var(--mon) / 0.06)" }}>
            <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--mon))" }}>Fehler</p>
            <p className="text-[13px] leading-relaxed">{errorMsg}</p>
          </section>
        )}

        {!aktiveRolle && <RollenAuswahl />}

        {aktiveRolle && <VerifikationsFormular rolle={aktiveRolle} kannEinreichen={!!user} />}

        <footer className="text-center text-[11px] text-soft pt-4">
          <Link href="/" className="hover:text-[rgb(var(--fg))]">← Startseite</Link>
        </footer>
      </article>
    </main>
  );
}

function RollenAuswahl() {
  const ordnung: RegistrierRolle[] = [
    "klient", "angehoerig",
    "pflege", "arzt", "therapie", "sozialarbeit", "heilerziehung",
    "ehrenamt", "hauswirtschaft", "erziehung", "lead",
    "genossenschaftsmitglied",
  ];
  const gefiltert = ordnung.filter((r) => ROLLEN[r]);
  return (
    <ul className="grid sm:grid-cols-2 gap-2">
      {gefiltert.map((id) => {
        const r = ROLLEN[id];
        return (
          <li key={id}>
            <Link
              href={`/registrieren/verifizieren?rolle=${id}`}
              className="surface-hover rounded-xl p-4 block relative overflow-hidden"
            >
              <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${r.farbe})` }} />
              <div className="ml-2.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-display text-[15px] font-semibold tracking-tight2">{r.label}</span>
                  <span className="chip text-[10px]" style={{ background: `rgb(${r.farbe} / 0.15)`, color: `rgb(${r.farbe})` }}>
                    {r.vertrauenMin === "basis" ? "Basis-Konto reicht" : r.vertrauenMin === "verifiziert" ? "Identität geprüft" : "Echtheits-zertifiziert"}
                  </span>
                </div>
                <p className="text-[12px] text-mute mt-1 leading-snug">{r.beschreibung}</p>
                <p className="text-[10px] text-soft mt-1.5 font-mono">
                  {r.verifikation.length} {r.verifikation.length === 1 ? "Nachweis" : "Nachweise"} · → {r.cockpitPfad}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function VerifikationsFormular({ rolle, kannEinreichen }: { rolle: RegistrierRolle; kannEinreichen: boolean }) {
  const r = ROLLEN[rolle];
  return (
    <form action={verifikationFormAction} encType="multipart/form-data" className="space-y-5">
      <input type="hidden" name="rolle" value={rolle} />
      {r.verifikation.map((feld) => (
        <FeldEingabe key={feld.key} feld={feld} />
      ))}
      <div className="surface rounded-xl p-4" style={{ background: "rgb(var(--accent) / 0.04)" }}>
        <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--accent))" }}>Datenschutz · DSGVO Art. 32 + 17</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Hochgeladene Urkunden werden in einem privaten Supabase-Storage-Bucket abgelegt
          (verschlüsselt at-rest in Frankfurt, RLS-geschützt — niemand außer dir und der
          Prüfungs-Stelle sieht sie). Nach erfolgreicher Verifikation kannst du Daten oder
          Konto jederzeit löschen.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <button type="submit" disabled={!kannEinreichen} className="btn btn-primary text-[13px] disabled:opacity-50">
          Zur Prüfung einreichen →
        </button>
        <Link href="/registrieren/verifizieren" className="btn text-[13px]">
          Andere Rolle wählen
        </Link>
      </div>
      <p className="text-[11px] text-soft leading-relaxed">
        <strong>Status-Lifecycle:</strong> nach Submit landet deine Anfrage als <code className="font-mono text-[11px]">eingereicht</code> in der
        Datenbank. Eine berechtigte Prüfungs-Stelle (Stationsleitung oder Beruf-Verband) sieht sie auf
        <code className="font-mono text-[11px]"> /admin/verifikationen</code> und setzt den Status auf <em>verifiziert</em> oder <em>abgelehnt</em>. Du bekommst
        eine Email-Benachrichtigung sobald geprüft.
      </p>
    </form>
  );
}

function FeldEingabe({ feld }: { feld: VerifikationsFeld }) {
  if (feld.typ === "datei") {
    return (
      <label className="block">
        <span className="text-[12px] font-medium block mb-1.5">
          {feld.label} {feld.pflicht && <span style={{ color: "rgb(var(--mon))" }}>*</span>}
        </span>
        {feld.hilfe && <span className="text-[11px] text-soft block mb-1.5">{feld.hilfe}</span>}
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          name={feld.key}
          required={feld.pflicht}
          className="block w-full text-[12px] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[12px] file:font-medium file:bg-[rgb(var(--accent)/0.15)] file:text-[rgb(var(--accent))] hover:file:bg-[rgb(var(--accent)/0.25)]"
        />
      </label>
    );
  }
  if (feld.typ === "auswahl") {
    return (
      <label className="block">
        <span className="text-[12px] font-medium block mb-1.5">
          {feld.label} {feld.pflicht && <span style={{ color: "rgb(var(--mon))" }}>*</span>}
        </span>
        <select
          name={feld.key}
          required={feld.pflicht}
          className="w-full surface-mute rounded-lg p-2 text-[13px] focus:outline-none focus:ring-1"
          style={{ ["--tw-ring-color" as string]: "rgb(var(--accent) / 0.4)" }}
          defaultValue=""
        >
          <option value="" disabled>— bitte wählen —</option>
          {feld.optionen?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  // text / ik / lanr — alle als input.text mit Pattern
  const pattern = feld.typ === "ik" ? "[0-9]{9}" : feld.typ === "lanr" ? "[0-9]{9}" : undefined;
  return (
    <label className="block">
      <span className="text-[12px] font-medium block mb-1.5">
        {feld.label} {feld.pflicht && <span style={{ color: "rgb(var(--mon))" }}>*</span>}
      </span>
      {feld.hilfe && <span className="text-[11px] text-soft block mb-1.5">{feld.hilfe}</span>}
      <input
        type="text"
        name={feld.key}
        required={feld.pflicht}
        pattern={pattern}
        inputMode={pattern ? "numeric" : undefined}
        className="w-full surface-mute rounded-lg p-2 text-[13px] font-mono focus:outline-none focus:ring-1"
        style={{ ["--tw-ring-color" as string]: "rgb(var(--accent) / 0.4)" }}
      />
    </label>
  );
}
