import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { offerSwap } from "@/lib/swap-actions";
import { getShiftType } from "@/lib/fhir";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { redirect } from "next/navigation";
import Link from "next/link";

const SHIFT_LABEL: Record<string, string> = { early: "Früh", late: "Spät", night: "Nacht" };

async function submitOffer(formData: FormData) {
  "use server";
  const slotId = formData.get("slotId") as string;
  const seekingFreeText = (formData.get("seekingFreeText") as string)?.trim() || undefined;
  await offerSwap({ slotId, seekingFreeText });
  redirect("/tausch");
}

export default async function AnbietenPage() {
  seedOnce();
  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
  const mySlots = await store.listSlotsForPerson(CURRENT_USER_ID);

  return (
    <AppShell
      role="nurse"
      user={{ name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <Link href="/tausch" className="text-[13px] text-soft hover:text-mute">← Tausch-Markt</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2 mt-2">Schicht anbieten</h1>
        <p className="text-[13px] text-mute mt-1">Wähle deine Schicht und schreib kurz, was du dafür möchtest.</p>
      </header>

      <form action={submitOffer} className="surface rounded-2xl p-6 max-w-xl space-y-5">
        <div>
          <label className="block text-[13px] font-medium mb-1.5">Welche Schicht?</label>
          <select name="slotId" required className="select">
            {mySlots.map((s) => {
              const t = getShiftType(s);
              return (
                <option key={s.id!} value={s.id!}>
                  {format(new Date(s.start!), "EEEE d.M.", { locale: de })} · {t ? SHIFT_LABEL[t] : "Schicht"} · {format(new Date(s.start!), "HH")}–{format(new Date(s.end!), "HH")}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-medium mb-1.5">Was suchst du im Tausch?</label>
          <textarea
            name="seekingFreeText"
            rows={3}
            placeholder="z.B. Spätschicht in KW 20, oder einfach abgeben"
            className="textarea"
          />
          <p className="text-[11px] text-soft mt-1.5">Frei lassen, wenn du nur abgeben willst — jemand übernimmt dann ohne Gegenleistung.</p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className="btn btn-primary">Anbieten →</button>
          <Link href="/tausch" className="btn btn-ghost">Abbrechen</Link>
        </div>
      </form>
    </AppShell>
  );
}
