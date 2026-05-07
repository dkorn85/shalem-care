"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { erstelleHkp } from "@/lib/pvs/eVerordnung/actions";
import type { HkpZiffer } from "@/lib/pvs/abrechnung/types";

const KLIENTEN = [
  { id: "klient-hr", name: "Helga Reinhardt · 76 J · PG 3" },
  { id: "klient-wb", name: "Wilhelm Brand · 81 J · PG 4" },
  { id: "klient-im", name: "Inge Mayrhofer · 79 J · PG 3" },
];

export function VerordnungNeuForm({ hkpBasis }: { hkpBasis: HkpZiffer[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [klientId, setKlientId] = useState(KLIENTEN[0].id);
  const [ziffer, setZiffer] = useState(hkpBasis[0].ziffer);
  const [haeufigkeit, setHaeufigkeit] = useState(hkpBasis[0].haeufigkeit);
  const [dauerWochen, setDauerWochen] = useState(4);
  const [diagnosen, setDiagnosen] = useState("L89.13, E11.9");
  const [begruendung, setBegruendung] = useState(
    "Behandlungspflege erforderlich, Klient:in kann die Maßnahme nicht selbst durchführen.",
  );

  function onZifferChange(val: string) {
    setZiffer(val);
    const found = hkpBasis.find((h) => h.ziffer === val);
    if (found) setHaeufigkeit(found.haeufigkeit);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const found = hkpBasis.find((h) => h.ziffer === ziffer);
    if (!found) return;
    start(async () => {
      const res = await erstelleHkp({
        typ: "hkp",
        ausstellerId: "person-arzt-001",
        ausstellerLanr: "999999900",
        ausstellerBsnr: "999999901",
        klientId,
        versichertenStatus: {
          krankenkasse: "AOK Rheinland/Hamburg",
          versichertenNr: "X123456789",
          iknr: "108310400",
        },
        leistung: {
          art: "haeusliche-krankenpflege",
          code: ziffer,
          bezeichnung: found.bezeichnung,
          haeufigkeit,
          dauerWochen,
        },
        diagnosen: diagnosen.split(",").map((d) => d.trim()).filter(Boolean),
        datumAusstellung: new Date().toISOString().slice(0, 10),
        begruendung,
      });
      if (!res.ok) {
        setError(res.error ?? "Fehler beim Erstellen");
        return;
      }
      router.push(`/admin/verordnungen/${res.id}`);
    });
  }

  return (
    <form onSubmit={submit} className="surface rounded-2xl p-5 sm:p-6 max-w-3xl space-y-4">
      <Field label="Klient:in">
        <select
          value={klientId}
          onChange={(e) => setKlientId(e.target.value)}
          className="w-full text-[14px] px-3 py-2 rounded-lg surface-mute border-0"
        >
          {KLIENTEN.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="HKP-Ziffer · § 37 SGB V">
        <select
          value={ziffer}
          onChange={(e) => onZifferChange(e.target.value)}
          className="w-full text-[14px] px-3 py-2 rounded-lg surface-mute border-0"
        >
          {hkpBasis.map((h) => (
            <option key={h.ziffer} value={h.ziffer}>
              {h.ziffer} · {h.bezeichnung}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Häufigkeit">
          <input
            type="text"
            value={haeufigkeit}
            onChange={(e) => setHaeufigkeit(e.target.value)}
            className="w-full text-[14px] px-3 py-2 rounded-lg surface-mute border-0"
          />
        </Field>
        <Field label="Dauer · Wochen">
          <input
            type="number"
            min={1}
            max={26}
            value={dauerWochen}
            onChange={(e) => setDauerWochen(Number(e.target.value))}
            className="w-full text-[14px] px-3 py-2 rounded-lg surface-mute border-0"
          />
        </Field>
      </div>

      <Field label="ICD-10-Diagnosen · komma-separiert">
        <input
          type="text"
          value={diagnosen}
          onChange={(e) => setDiagnosen(e.target.value)}
          placeholder="z.B. L89.13, E11.9"
          className="w-full text-[14px] px-3 py-2 rounded-lg surface-mute border-0 font-mono"
        />
      </Field>

      <Field label="Begründung">
        <textarea
          value={begruendung}
          onChange={(e) => setBegruendung(e.target.value)}
          rows={3}
          className="w-full text-[14px] px-3 py-2 rounded-lg surface-mute border-0"
        />
      </Field>

      {error && (
        <p className="text-[12px] font-mono" style={{ color: "rgb(var(--mon))" }}>
          {error}
        </p>
      )}

      <div className="flex items-baseline gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-md font-medium text-[14px] disabled:opacity-40"
          style={{ background: "rgb(var(--accent))", color: "white" }}
        >
          {pending ? "…" : "Verordnung anlegen (Entwurf)"}
        </button>
        <p className="text-[11px] text-soft">
          Anlegen erstellt einen Entwurf. Ausstellen + KIM-Versand erfolgt
          danach im Detail-View.
        </p>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-soft font-mono block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
