import { redirect } from "next/navigation";
import Image from "next/image";
import { KlientShell } from "@/components/KlientShell";
import { listKlienten, getKlient } from "@/lib/hierarchy/store";
import { store } from "@/lib/swap-store";
import { seedOnce } from "@/lib/seed";
import { createClientRequest } from "@/lib/klient/client-request";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CURRENT_KLIENT_ID = "klient-hr";

export default async function AnfragePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  seedOnce();
  const sp = await searchParams;
  const klient = getKlient(CURRENT_KLIENT_ID);
  if (!klient || !klient.isSelfBooker) {
    return (
      <KlientShell user={{ name: "Klient:in", initials: "??", relation: "self" }}>
        <p className="text-[14px] text-mute">Klient nicht gefunden oder nicht als Self-Booker freigeschaltet.</p>
      </KlientShell>
    );
  }

  // Eigene aktive Anfragen anzeigen
  const offers = await store.listOffers();
  const myOpenOffers = offers.filter((o) => o.offeredBy === klient.id && (o.state === "open" || o.state === "matched"));
  const allSlots = new Map((await store.listSlots()).map((s) => [s.id!, s]));

  const submit = async (formData: FormData) => {
    "use server";
    const date = formData.get("date") as string;
    const shiftType = formData.get("shiftType") as "early" | "late" | "night";
    const qualification = formData.get("qualification") as string;
    const taskBrief = formData.get("taskBrief") as string;
    const notes = (formData.get("notes") as string) || undefined;

    const times: Record<string, [string, string]> = {
      early: ["06:00", "14:00"],
      late: ["14:00", "22:00"],
      night: ["22:00", "06:00"],
    };
    const [s, e] = times[shiftType];
    const start = `${date}T${s}:00+02:00`;
    const isOvernight = shiftType === "night";
    const endDate = isOvernight ? new Date(`${date}T00:00:00+02:00`) : new Date(`${date}T00:00:00+02:00`);
    if (isOvernight) endDate.setDate(endDate.getDate() + 1);
    const endDateStr = format(endDate, "yyyy-MM-dd");
    const end = `${endDateStr}T${e}:00+02:00`;

    await createClientRequest({
      klientId: klient.id,
      start,
      end,
      shiftType,
      qualification: qualification || "RN",
      taskBrief,
      notes,
    });

    redirect("/klient/anfrage?ok=1");
  };

  // Default-Datum: morgen
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = format(tomorrow, "yyyy-MM-dd");

  return (
    <KlientShell
      user={{
        name: klient.name,
        initials: klient.initials,
        relation: "self",
      }}
    >
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Klient-als-Arbeitsplatz</p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.05]">
          Pflege-Anfrage stellen
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-prose">
          Du publizierst hier direkt einen Pflegebedarf. Genossenschafts-Mitglieder sehen die Anfrage im Marktplatz und können annehmen — die KI-Disposition schlägt geeignete Pflegekräfte vor.
        </p>
      </header>

      {sp.ok && (
        <div className="surface rounded-2xl p-5 mb-6 relative overflow-hidden anim-scale-in">
          <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--thu))" }} />
          <div className="ml-2.5 flex items-center gap-4">
            <Image
              src="/onboarding/confetti.png"
              alt="Erfolg"
              width={80}
              height={80}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold" style={{ color: "rgb(var(--thu))" }}>Anfrage publiziert</p>
              <p className="text-[12px] text-mute mt-1">Sie ist jetzt im Marktplatz sichtbar. Du wirst benachrichtigt, sobald jemand annimmt.</p>
            </div>
          </div>
        </div>
      )}

      <section className="mb-8">
        <form action={submit} className="surface rounded-2xl p-5 space-y-4">
          <FormField label="Tag" hint="Wann brauchst du Unterstützung?">
            <input
              type="date"
              name="date"
              required
              defaultValue={defaultDate}
              className="surface-mute rounded-lg px-3 py-2 text-[14px] w-full sm:w-auto font-mono"
            />
          </FormField>

          <FormField label="Schicht" hint="Wann am Tag?">
            <div className="flex flex-wrap gap-2">
              <RadioCard name="shiftType" value="early" label="Früh" sub="06–14 Uhr" defaultChecked />
              <RadioCard name="shiftType" value="late" label="Spät" sub="14–22 Uhr" />
              <RadioCard name="shiftType" value="night" label="Nacht" sub="22–06 Uhr" />
            </div>
          </FormField>

          <FormField label="Qualifikation" hint="Welche Pflegekraft brauchst du?">
            <select name="qualification" defaultValue="RN" className="surface-mute rounded-lg px-3 py-2 text-[14px] w-full sm:w-auto">
              <option value="RN">Pflegefachkraft (RN)</option>
              <option value="Wundmanagement">Wundmanagement</option>
              <option value="GERI">Geriatrie-Spezialisierung</option>
              <option value="ITS">Intensiv (ITS)</option>
            </select>
          </FormField>

          <FormField label="Aufgaben-Beschreibung" hint="Worum geht es konkret? (kurz)">
            <input
              type="text"
              name="taskBrief"
              required
              defaultValue="Grundpflege, Medikamente, Mobilisation"
              maxLength={120}
              className="surface-mute rounded-lg px-3 py-2 text-[14px] w-full"
            />
          </FormField>

          <FormField label="Notizen" hint="Was sollte die Pflegekraft wissen? (optional)">
            <textarea
              name="notes"
              rows={3}
              maxLength={500}
              placeholder="z. B. Schlüssel hängt beim Nachbarn, mein Kater darf nicht raus, ..."
              className="surface-mute rounded-lg px-3 py-2 text-[13px] w-full resize-none"
            />
          </FormField>

          <div className="pt-2 flex items-center justify-between gap-3">
            <p className="text-[11px] text-soft">
              Vergütung folgt aus deinem Pflegegrad ({klient.pflegegrad}) und Tarif. Plattform-Cut 4 %.
            </p>
            <button type="submit" className="btn btn-primary">Anfrage publizieren</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Deine offenen Anfragen</h2>
        {myOpenOffers.length === 0 ? (
          <p className="text-[13px] text-mute">Aktuell keine offenen Anfragen.</p>
        ) : (
          <ul className="space-y-2">
            {myOpenOffers.map((o) => {
              const slot = allSlots.get(o.slotId);
              if (!slot) return null;
              const start = new Date(slot.start!);
              const end = new Date(slot.end!);
              return (
                <li key={o.id} className="surface-mute rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium">
                      {format(start, "EEEE, d. MMMM", { locale: de })}
                      {" · "}
                      <span className="font-mono">
                        {format(start, "HH:mm")}–{format(end, "HH:mm")}
                      </span>
                    </div>
                    <div className="text-[11px] text-mute mt-0.5 truncate">{o.seekingFreeText}</div>
                  </div>
                  <span className="chip" style={{ background: o.state === "open" ? "rgb(var(--vibe-market) / 0.15)" : "rgb(var(--vibe-approval) / 0.15)", color: o.state === "open" ? "rgb(var(--vibe-market))" : "rgb(var(--vibe-approval))" }}>
                    {o.state === "open" ? "wartet" : "angenommen"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </KlientShell>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium mb-1">{label}</label>
      {hint && <p className="text-[11px] text-soft mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function RadioCard({ name, value, label, sub, defaultChecked }: { name: string; value: string; label: string; sub: string; defaultChecked?: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="block surface-mute rounded-lg px-3 py-2 text-center peer-checked:bg-[rgb(var(--mon)/0.1)] peer-checked:ring-2 peer-checked:ring-[rgb(var(--mon))] transition-colors">
        <span className="block text-[13px] font-medium">{label}</span>
        <span className="block text-[11px] text-soft mt-0.5 font-mono">{sub}</span>
      </span>
    </label>
  );
}
