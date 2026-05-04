import { redirect } from "next/navigation";
import Image from "next/image";
import { KlientShell } from "@/components/KlientShell";
import { store } from "@/lib/swap-store";
import { seedOnce } from "@/lib/seed";
import { getKlient, listPeopleAtStation } from "@/lib/hierarchy/store";
import { listRatingsBy, listRatingsFor, reputationScoreFor, seedRatingsOnce } from "@/lib/ratings/ratings-store";
import { submitRating } from "@/lib/ratings/ratings-actions";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CURRENT_KLIENT_ID = "klient-hr";

const TAGS = ["einfühlsam", "fachkompetent", "pünktlich", "freundlich", "ruhig", "zuverlässig", "humor", "kontinuität"];

export default async function BewertungPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  seedOnce();
  seedRatingsOnce();
  const sp = await searchParams;
  const klient = getKlient(CURRENT_KLIENT_ID);
  if (!klient) return null;

  const carers = listPeopleAtStation(klient.stationId!).filter((p) => p.role === "nurse" || p.role === "lead");
  const myPastRatings = listRatingsBy(CURRENT_KLIENT_ID);

  const submit = async (formData: FormData) => {
    "use server";
    const personId = formData.get("personId") as string;
    const stars = Number(formData.get("stars"));
    const text = (formData.get("text") as string) || undefined;
    const tags = formData.getAll("tags") as string[];

    await submitRating({
      ratedPersonId: personId,
      raterId: CURRENT_KLIENT_ID,
      raterType: "klient",
      stars,
      text,
      tags,
    });

    redirect("/klient/bewertung?ok=1");
  };

  // Pflegekräfte mit deren Reputation
  const carerData = carers.map((c) => ({
    person: c,
    reputation: reputationScoreFor(c.id),
    ratings: listRatingsFor(c.id),
  }));

  return (
    <KlientShell user={{ name: klient.name, initials: klient.initials, relation: "self" }}>
      <header className="mb-6 anim-slideUp">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Rückmeldung</p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.05] text-balance">
          Pflegekraft <span className="rainbow-text">bewerten</span>
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-prose text-pretty">
          Authentische Rückmeldung hilft anderen Klient:innen und der Genossenschaft. Bewertungen fließen in den Reputations-Score ein, der Teil der KI-Disposition ist.
        </p>
      </header>

      {sp.ok && (
        <div className="surface rounded-2xl p-5 mb-6 relative overflow-hidden anim-scale-in">
          <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--thu))" }} />
          <div className="ml-2.5 flex items-center gap-4">
            <Image
              src="/onboarding/confetti.png"
              alt="Bewertung gespeichert"
              width={72}
              height={72}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold" style={{ color: "rgb(var(--thu))" }}>Bewertung gespeichert</p>
              <p className="text-[12px] text-mute mt-1">Vielen Dank — sie ist sofort sichtbar im Reputations-Score.</p>
            </div>
          </div>
        </div>
      )}

      <section className="mb-10">
        <form action={submit} className="surface rounded-2xl p-5 sm:p-6 space-y-5 anim-slideUp" style={{ animationDelay: "0.05s" }}>
          <FormField label="Welche Pflegekraft?">
            <select name="personId" required className="select">
              {carerData.map((c) => (
                <option key={c.person.id} value={c.person.id}>
                  {c.person.name}
                  {c.reputation.count > 0 && ` (${(c.reputation.score / 20).toFixed(1)}★ aus ${c.reputation.count})`}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Sterne">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer group">
                  <input type="radio" name="stars" value={n} required defaultChecked={n === 5} className="peer sr-only" />
                  <span
                    className="block w-12 h-12 rounded-xl grid place-items-center transition-all peer-checked:bg-[rgb(var(--wed)/0.2)] peer-checked:scale-110 surface-mute group-hover:bg-[rgb(var(--wed)/0.15)]"
                  >
                    <Star size={22} filled />
                  </span>
                  <span className="block text-center text-[10px] text-soft mt-1 font-mono">{n}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Wie war's?" hint="Wähle Eindrücke (mehrere möglich)">
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((tag) => (
                <label key={tag} className="cursor-pointer">
                  <input type="checkbox" name="tags" value={tag} className="peer sr-only" />
                  <span className="block px-3 py-1.5 rounded-full text-[12px] font-medium surface-mute peer-checked:bg-[rgb(var(--vibe-profile)/0.15)] peer-checked:text-[rgb(var(--vibe-profile))] transition-all hover:scale-105">
                    {tag}
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="In Worten" hint="Optional, max. 280 Zeichen">
            <textarea
              name="text"
              rows={3}
              maxLength={280}
              placeholder="z. B. Frau Schmidt war heute besonders aufmerksam, hat sich Zeit für ein Gespräch genommen."
              className="textarea resize-none"
            />
          </FormField>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">Bewertung absenden</button>
          </div>
        </form>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-[18px] font-semibold tracking-tight2 mb-4">Pflegekräfte und ihr Reputations-Score</h2>
        <div className="space-y-2">
          {carerData
            .filter((c) => c.reputation.count > 0)
            .sort((a, b) => b.reputation.score - a.reputation.score)
            .map((c, idx) => (
              <article
                key={c.person.id}
                className="surface rounded-xl p-4 anim-float relative overflow-hidden"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full grid place-items-center text-[13px] font-semibold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, rgb(var(--mon)), rgb(var(--fri)))` }}
                  >
                    {c.person.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-medium">{c.person.name}</span>
                      {c.person.role === "lead" && (
                        <span className="chip" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>Lead</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Stars value={c.reputation.score / 20} />
                      <span className="text-[11px] text-soft ml-1.5 font-mono">
                        {(c.reputation.score / 20).toFixed(1)} aus {c.reputation.count}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Deine letzten Bewertungen</h2>
        {myPastRatings.length === 0 ? (
          <p className="text-[13px] text-mute">Noch keine Bewertungen abgegeben.</p>
        ) : (
          <ul className="space-y-2">
            {myPastRatings.slice(0, 5).map((r) => {
              const target = carers.find((c) => c.id === r.ratedPersonId);
              return (
                <li key={r.id} className="surface-mute rounded-xl p-3 text-[12px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-[13px]">{target?.name ?? "?"}</span>
                    <span className="font-mono text-soft">{format(new Date(r.createdAt), "d.M.", { locale: de })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Stars value={r.stars} />
                  </div>
                  {r.text && <p className="text-mute mt-1.5 italic">„{r.text}“</p>}
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

function Star({ size = 16, filled = false, dim = false }: { size?: number; filled?: boolean; dim?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "rgb(var(--wed))" : "none"} stroke={dim ? "rgb(var(--fg-soft))" : "rgb(var(--wed))"} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} filled={value >= n - 0.5} dim={value < n - 0.5} />
      ))}
    </span>
  );
}
