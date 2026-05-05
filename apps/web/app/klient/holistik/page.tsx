import Link from "next/link";
import { KlientShell } from "@/components/KlientShell";
import { HolistikVorschlagClient } from "@/components/HolistikVorschlagClient";
import {
  MerkabaSymbol, ShalemElementGrid, SowaRigpaTriade, AyurvedaSaeulen,
} from "@/components/HolistikVisuals";

export const metadata = {
  title: "Holistische Begleitung · Meine Akte",
  description: "Vier Lese-Brillen — Merkaba, Shalem, Sowa Rigpa, Ayurveda — als sanfte Ergänzung zur schulmedizinischen Versorgung.",
};

const KLIENT = { id: "klient-hr", name: "Helga Reinhardt", initials: "HR", alter: 78, pflegegrad: 3 };

const FACH_KONTEXT = `MRT LWS L4/L5: mediolinks-betonte Bandscheibenprotrusion, Tangierung der Wurzel L5
links. Aktivierte Spondylarthrose L4/L5 mit Modic-I. Spinalkanal leicht eingeengt.

Sakraldekubitus Kategorie III, im Heilen: Fläche 12.6 → 2.8 cm² über 11 Wochen.
Wundgrund 60 % Granulation, Exsudat serös, Wundrand mazeriert.

Anamnese: Schlafstörung seit 6 Wochen (3-4× pro Nacht wach), nächtliche Unruhe,
appetitloser Tagesbeginn, Tochter Anna berichtet Stimmungsschwankungen. Lebt seit
2 Jahren in der WG St. Lukas. Vermisst eigenen Garten.`;

export default function HolistikPage() {
  return (
    <KlientShell user={{ name: KLIENT.name, initials: KLIENT.initials, relation: "self", klientId: KLIENT.id }}>
      <header className="mb-6">
        <Link href="/klient/akte" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Akte
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Holistische Begleitung · Sowa Rigpa · Ayurveda · Merkaba · Shalem</p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Was sehen <span className="rainbow-text">vier Brillen</span> zusammen?
        </h1>
        <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
          Schulmedizin sagt was es ist. Diese vier Lese-Brillen fragen, wie es eingebettet ist
          in den Tagesrhythmus, in Berührung, in Wärme und Kälte, in Tun und Sein. Lana liest die
          Akte und schlägt drei sanfte Pflege-Aktionen vor — als Ergänzung, nicht als Ersatz für
          ärztliche Versorgung.
        </p>
      </header>

      {/* Vier Mini-Symbole als Kapitel-Header */}
      <div className="surface rounded-2xl p-4 sm:p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
          <div className="text-center">
            <div className="flex justify-center mb-1.5"><MerkabaSymbol size={56} /></div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Merkaba</p>
            <p className="text-[10px] text-mute">Bewusstsein</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1.5"><ShalemElementGrid size={56} /></div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Shalem</p>
            <p className="text-[10px] text-mute">Vier Elemente</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1.5"><SowaRigpaTriade size={70} /></div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Sowa Rigpa</p>
            <p className="text-[10px] text-mute">Tibet · Drei Säfte</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1.5"><AyurvedaSaeulen height={56} /></div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Ayurveda</p>
            <p className="text-[10px] text-mute">Drei Doshas</p>
          </div>
        </div>
      </div>

      <details className="surface rounded-2xl p-4 mb-6" open={false}>
        <summary className="text-[11px] uppercase tracking-wider text-soft font-medium cursor-pointer">
          Was die KI gerade liest (Original-Fachtext)
        </summary>
        <p className="text-[13px] leading-relaxed mt-2 whitespace-pre-wrap">{FACH_KONTEXT}</p>
      </details>

      <HolistikVorschlagClient
        klientId={KLIENT.id}
        klientName={KLIENT.name}
        alter={KLIENT.alter}
        pflegegrad={KLIENT.pflegegrad}
        fachKontext={FACH_KONTEXT}
      />

      <section className="surface rounded-2xl p-5 mt-8">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Worum es bei dieser Brille NICHT geht</p>
        <ul className="text-[12px] text-mute leading-relaxed space-y-1 list-disc pl-5">
          <li>Keine Diagnose, keine Heilversprechen.</li>
          <li>Keine Substitution für Ärzt:in, Pflegekraft, Physio.</li>
          <li>Keine esoterische Abhängigkeit — nur eine zweite Lese-Linie.</li>
          <li>Konkrete Vorschläge bewegen sich auf Lebensführungs-Ebene: Tagesrhythmus, Speisen, Berührung, Atem.</li>
        </ul>
        <p className="text-[12px] text-mute leading-relaxed mt-3">
          Die Vorschläge stammen aus der Verbindung von Living Wholeness Academy
          (<a href="https://chazon.eu" className="underline-offset-2 hover:underline" target="_blank" rel="noopener">chazon.eu</a>),
          tibetischer Medizin (rGyud-bzhi · Vier Tantras) und Ayurveda (Charaka-Samhita).
        </p>
      </section>
    </KlientShell>
  );
}
