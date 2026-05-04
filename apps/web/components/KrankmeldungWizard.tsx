"use client";

import { useState, useTransition } from "react";
import { meldeKrank, suchArzttermine, bucheArzttermin, ausstellenTeleAU, attachEAUtoKrankmeldung, beantrageKrankengeld, meldeWiederArbeitsfaehig } from "@/lib/krankmeldung/actions";
import { SYMPTOM_LABEL, AU_TYPE_LABEL, STATUS_LABEL, TERMINART_LABEL } from "@/lib/krankmeldung/types";
import type { SymptomKategorie, AUType, Krankmeldung, Arztterminart, Arzttermin } from "@/lib/krankmeldung/types";
import type { AvailableSlot } from "@/lib/krankmeldung/doctor-api";

type Krankenkasse = { name: string; ik: string };

export function KrankmeldungWizard({
  personId,
  personName,
  tariffGrade,
  aktiv,
  termineFuerAktiv,
  krankenkassen,
}: {
  personId: string;
  personName: string;
  tariffGrade: string;
  aktiv: Krankmeldung | null;
  termineFuerAktiv: Arzttermin[];
  krankenkassen: Krankenkasse[];
}) {
  if (aktiv) {
    return <AktiveKrankmeldungView km={aktiv} termine={termineFuerAktiv} personId={personId} />;
  }
  return <NeueKrankmeldungForm personId={personId} personName={personName} tariffGrade={tariffGrade} krankenkassen={krankenkassen} />;
}

// ─── Aktive Krankmeldung anzeigen + Aktionen ──────────────

function AktiveKrankmeldungView({ km, termine, personId }: { km: Krankmeldung; termine: Arzttermin[]; personId: string }) {
  const [busy, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showTermin, setShowTermin] = useState(false);
  const [bisDatum, setBisDatum] = useState<string>(new Date().toISOString().slice(0, 10));

  const teleAU = () => {
    setFeedback(null);
    start(async () => {
      const r = await ausstellenTeleAU({ krankmeldungId: km.id, personId });
      if (r.ok) setFeedback(`✓ Tele-AU ausgestellt (${r.eauReferenz}), gültig bis ${r.gueltigBis} · ${r.arztName}`);
      else setFeedback(`✕ ${r.error}`);
    });
  };

  const krankengeld = () => {
    setFeedback(null);
    start(async () => {
      const r = await beantrageKrankengeld(km.id);
      if (r.ok) setFeedback(`✓ Krankengeld beantragt — Antrag ${r.antragId}`);
      else setFeedback(`✕ ${r.error}`);
    });
  };

  const wiederGesund = () => {
    setFeedback(null);
    start(async () => {
      const r = await meldeWiederArbeitsfaehig(km.id, bisDatum);
      if (r.ok) setFeedback("✓ Wieder arbeitsfähig — vielen Dank für die Genesung 🌿");
      else setFeedback(`✕ ${r.error}`);
    });
  };

  return (
    <div className="space-y-5">
      <section className="surface rounded-2xl p-5 sm:p-6 relative overflow-hidden anim-slideUp">
        <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--mon))" }} />
        <div className="ml-2.5">
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Aktive Krankmeldung</p>
          <h3 className="font-display text-[20px] font-semibold tracking-tight2 mt-1">
            {SYMPTOM_LABEL[km.symptomKategorie]}
          </h3>
          <p className="text-[13px] text-mute mt-1">
            {km.vonDatum} – {km.bisDatum ?? km.voraussichtlichBis} · {AU_TYPE_LABEL[km.auType]} ·{" "}
            <span style={{ color: "rgb(var(--mon))" }}>{STATUS_LABEL[km.status]}</span>
          </p>
          {km.freitext && <p className="text-[13px] text-mute mt-2 italic">„{km.freitext}"</p>}
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-2.5">
        <Stat label="Betroffene Schichten" value={km.betroffeneSlotIds.length} hint={km.autoReplacement ? `Auto-Vertretung +${(km.bonusAufschlagBps / 100).toFixed(0)}%` : "ohne Auto-Vertretung"} />
        <Stat label="eAU bei Kasse" value={km.krankenkasse?.eauVersendet ? "Ja" : "Nein"} hint={km.krankenkasse?.name ?? "—"} />
        <Stat label="Termine" value={termine.length} hint={termine[0]?.zeitslot ? new Date(termine[0].zeitslot).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "kein Termin"} />
      </section>

      {feedback && (
        <div
          className="rounded-lg p-3 text-[13px]"
          style={{
            background: feedback.startsWith("✓") ? "rgb(var(--thu) / 0.1)" : "rgb(var(--mon) / 0.1)",
            color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))",
          }}
        >
          {feedback}
        </div>
      )}

      {/* Aktions-Sektion */}
      <section className="surface rounded-2xl p-5 space-y-4">
        <h4 className="font-display text-[16px] font-semibold tracking-tight2">Was du jetzt tun kannst</h4>

        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={teleAU}
            disabled={busy || km.status === "au_eingegangen"}
            className="surface-hover rounded-xl p-4 text-left"
          >
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Online-AU</p>
            <p className="text-[14px] font-medium mt-1">📞 Tele-AU sofort anfordern</p>
            <p className="text-[12px] text-mute mt-1">
              Über zugelassene Tele-Praxis (gematik eAU). Funktioniert für Erkältung, Magen-Darm,
              Kopfschmerz, Fieber.
            </p>
          </button>

          <button
            onClick={() => setShowTermin((s) => !s)}
            disabled={busy}
            className="surface-hover rounded-xl p-4 text-left"
          >
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Arzttermin</p>
            <p className="text-[14px] font-medium mt-1">🎥 Video- oder Präsenztermin</p>
            <p className="text-[12px] text-mute mt-1">
              KRY · jameda · doctor.api · Shalem-Tele — System sucht passenden Slot in deiner Nähe.
            </p>
          </button>

          <button
            onClick={krankengeld}
            disabled={busy}
            className="surface-hover rounded-xl p-4 text-left"
          >
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">SGB V § 44</p>
            <p className="text-[14px] font-medium mt-1">💶 Krankengeld beantragen</p>
            <p className="text-[12px] text-mute mt-1">
              Möglich ab Tag 43 (nach 6 Wo Lohnfortzahlung).
              {km.krankenkasse?.krankengeldAntragId && (
                <> · Antrag <span className="font-mono">{km.krankenkasse.krankengeldAntragId}</span></>
              )}
            </p>
          </button>

          <div className="surface-hover rounded-xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Genesung</p>
            <p className="text-[14px] font-medium mt-1">🌿 Wieder arbeitsfähig</p>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="date"
                value={bisDatum}
                onChange={(e) => setBisDatum(e.target.value)}
                className="input text-[12px] flex-1"
              />
              <button onClick={wiederGesund} disabled={busy} className="btn btn-primary text-[12px]">
                {busy ? "..." : "Melden"}
              </button>
            </div>
          </div>
        </div>

        {showTermin && (
          <ArztterminPanel
            personId={personId}
            symptomKategorie={km.symptomKategorie}
            krankmeldungId={km.id}
            onClose={() => setShowTermin(false)}
          />
        )}
      </section>

      {/* Verlauf */}
      {km.verlauf.length > 0 && (
        <section className="surface rounded-2xl p-5">
          <h4 className="font-display text-[14px] font-semibold tracking-tight2 mb-3">Verlauf</h4>
          <ul className="space-y-1.5 text-[12px]">
            {[...km.verlauf].reverse().map((v, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="font-mono text-soft shrink-0 w-32">
                  {new Date(v.at).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span>{v.event.replace(/_/g, " ")}</span>
                {v.meta && <span className="text-soft italic">— {v.meta}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Termine */}
      {termine.length > 0 && (
        <section className="surface rounded-2xl p-5">
          <h4 className="font-display text-[14px] font-semibold tracking-tight2 mb-3">Arzttermine</h4>
          <ul className="space-y-2.5">
            {termine.map((t) => (
              <li key={t.id} className="surface-mute rounded-xl p-3">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[14px] font-medium">{t.praxisName}</span>
                  <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>
                    {TERMINART_LABEL[t.art]}
                  </span>
                  <span className="text-[11px] text-soft font-mono">
                    {new Date(t.zeitslot).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-[12px] text-mute mt-0.5">
                  {t.fachrichtung}{t.arztName && ` · ${t.arztName}`} · {t.durationMin} min
                </p>
                {t.videoCallUrl && (
                  <a
                    href={t.videoCallUrl}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-primary text-[12px] mt-2 inline-flex"
                  >
                    🎥 Videocall öffnen
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="surface rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div className="font-display font-semibold text-[18px] mt-0.5">{value}</div>
      {hint && <div className="text-[11px] text-soft mt-0.5">{hint}</div>}
    </div>
  );
}

// ─── Arzttermin-Panel ─────────────────────────────────────

function ArztterminPanel({
  personId,
  symptomKategorie,
  krankmeldungId,
  onClose,
}: {
  personId: string;
  symptomKategorie: SymptomKategorie;
  krankmeldungId?: string;
  onClose: () => void;
}) {
  const [slots, setSlots] = useState<AvailableSlot[] | null>(null);
  const [preferVideo, setPreferVideo] = useState(true);
  const [anliegen, setAnliegen] = useState("");
  const [pending, start] = useTransition();
  const [bookingResult, setBookingResult] = useState<{ id: string; url?: string } | null>(null);

  const search = () => {
    start(async () => {
      const r = await suchArzttermine({ symptomKategorie, preferVideo });
      if (r.ok) setSlots(r.slots);
    });
  };

  const book = (slot: AvailableSlot) => {
    start(async () => {
      const art: Arztterminart = slot.videoCallSupported && preferVideo ? "video" : "praesenz";
      const r = await bucheArzttermin({
        slot,
        personId,
        art,
        anliegen: anliegen || `${SYMPTOM_LABEL[symptomKategorie]}-Beschwerden`,
        krankmeldungId,
      });
      if (r.ok) setBookingResult({ id: r.terminId, url: r.videoCallUrl });
    });
  };

  return (
    <div className="rounded-xl border border-app-soft p-4 space-y-3 anim-fadeIn">
      <header className="flex items-baseline justify-between gap-3">
        <h5 className="font-display text-[14px] font-semibold tracking-tight2">Arzttermin finden</h5>
        <button onClick={onClose} className="btn btn-ghost text-[11px]">Schließen</button>
      </header>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-[12px]">
          <input
            type="checkbox"
            checked={preferVideo}
            onChange={(e) => setPreferVideo(e.target.checked)}
            className="w-4 h-4"
          />
          Bevorzugt Videosprechstunde
        </label>
        <input
          type="text"
          value={anliegen}
          onChange={(e) => setAnliegen(e.target.value)}
          placeholder="Anliegen (kurz, optional)"
          className="input text-[12px] flex-1 min-w-[200px]"
        />
        <button onClick={search} disabled={pending} className="btn text-[12px]">
          {pending ? "Suche..." : "Slots suchen"}
        </button>
      </div>

      {slots && (
        <ul className="space-y-1.5">
          {slots.length === 0 ? (
            <li className="text-[12px] text-soft">Keine freien Slots gefunden.</li>
          ) : slots.map((s, i) => (
            <li key={i} className="surface-mute rounded-lg p-2.5 flex items-center gap-2 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <div className="text-[12px] font-medium">{s.praxisName}</div>
                <div className="text-[11px] text-soft">
                  {s.fachrichtung} · {s.arztName ?? "—"} · {s.durationMin} min · {s.provider}
                  {s.videoCallSupported && " · 🎥"}
                  {s.freeText && ` · ${s.freeText}`}
                </div>
              </div>
              <div className="font-mono text-[11px] text-mute">
                {new Date(s.zeitslot).toLocaleString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </div>
              <button onClick={() => book(s)} disabled={pending} className="btn btn-primary text-[11px]">
                Buchen
              </button>
            </li>
          ))}
        </ul>
      )}

      {bookingResult && (
        <div className="rounded-lg p-3 text-[12px]" style={{ background: "rgb(var(--thu) / 0.1)", color: "rgb(var(--thu))" }}>
          ✓ Termin gebucht (Ref: {bookingResult.id})
          {bookingResult.url && (
            <a href={bookingResult.url} target="_blank" rel="noopener" className="ml-2 underline">
              🎥 Videocall öffnen
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Neue Krankmeldung — Wizard ────────────────────────────

function NeueKrankmeldungForm({
  personId,
  personName,
  tariffGrade,
  krankenkassen,
}: {
  personId: string;
  personName: string;
  tariffGrade: string;
  krankenkassen: Krankenkasse[];
}) {
  const [symptom, setSymptom] = useState<SymptomKategorie>("atemwege");
  const [freitext, setFreitext] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const inDays = (n: number) => {
    const d = new Date(); d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const [von, setVon] = useState(today);
  const [bis, setBis] = useState(inDays(2));
  const [auType, setAuType] = useState<AUType>("eigenmeldung");
  const [autoRepl, setAutoRepl] = useState(true);
  const [bonusBps, setBonusBps] = useState<number>(1500);
  const [kkName, setKkName] = useState<string>("");
  const [kkIk, setKkIk] = useState<string>("");
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const submit = () => {
    setFeedback(null);
    start(async () => {
      const r = await meldeKrank({
        personId,
        symptomKategorie: symptom,
        freitext,
        vonDatum: von,
        voraussichtlichBis: bis,
        auType,
        krankenkasseName: kkName || undefined,
        krankenkasseIK: kkIk || undefined,
        autoReplacement: autoRepl,
        bonusAufschlagBps: bonusBps,
      });
      if (!r.ok) {
        setFeedback(`✕ ${r.error}`);
      } else {
        setFeedback(
          `✓ Krankmeldung erfasst · ${r.betroffeneShifts} Schicht${r.betroffeneShifts === 1 ? "" : "en"} betroffen` +
          (r.ersatzAngebote.length > 0
            ? ` · ${r.ersatzAngebote.length} Ersatz-Angebot${r.ersatzAngebote.length === 1 ? "" : "e"} im Markt veröffentlicht`
            : "")
        );
      }
    });
  };

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 space-y-4 anim-slideUp">
      <header>
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Krank?</p>
        <h3 className="font-display text-[20px] font-semibold tracking-tight2 mt-1">
          Krankmeldung — Schritt 1
        </h3>
        <p className="text-[13px] text-mute mt-1 max-w-prose">
          Du meldest dich krank — und Shalem übernimmt im Hintergrund den Rest:
          Auto-Vertretung mit Bonus, eAU-Versand an deine Krankenkasse, Vorschlag
          für einen Tele-Arzttermin. Tarif: {tariffGrade.replace("TVOED-P_", "")} ·
          {" "}{personName}.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium mb-1">Was hast du?</label>
          <select value={symptom} onChange={(e) => setSymptom(e.target.value as SymptomKategorie)} className="select text-[13px]">
            {Object.entries(SYMPTOM_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1">Bescheinigungs-Art</label>
          <select value={auType} onChange={(e) => setAuType(e.target.value as AUType)} className="select text-[13px]">
            {Object.entries(AU_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-medium mb-1">Beschreibung (freiwillig, an dich selbst)</label>
        <textarea
          value={freitext}
          onChange={(e) => setFreitext(e.target.value)}
          rows={2}
          placeholder="z.B. Halsschmerzen seit gestern Abend, leichtes Fieber 37,8 °C — keine Atemnot."
          className="textarea text-[13px]"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium mb-1">Von</label>
          <input type="date" value={von} onChange={(e) => setVon(e.target.value)} className="input text-[13px]" />
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1">Voraussichtlich bis</label>
          <input type="date" value={bis} onChange={(e) => setBis(e.target.value)} className="input text-[13px]" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium mb-1">Krankenkasse</label>
          <select
            value={kkIk}
            onChange={(e) => {
              setKkIk(e.target.value);
              const k = krankenkassen.find((x) => x.ik === e.target.value);
              setKkName(k?.name ?? "");
            }}
            className="select text-[13px]"
          >
            <option value="">— wähle Kasse —</option>
            {krankenkassen.map((k) => (
              <option key={k.ik} value={k.ik}>{k.name}</option>
            ))}
          </select>
          <p className="text-[11px] text-soft mt-1">eAU geht direkt via gematik an deine Kasse.</p>
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1">IK-Nummer</label>
          <input
            type="text"
            value={kkIk}
            onChange={(e) => setKkIk(e.target.value)}
            placeholder="9-stellig"
            className="input text-[13px] font-mono"
          />
        </div>
      </div>

      <div className="surface-mute rounded-xl p-4 space-y-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <input
            type="checkbox"
            id="autoRepl"
            checked={autoRepl}
            onChange={(e) => setAutoRepl(e.target.checked)}
            className="w-4 h-4 mt-0.5"
          />
          <label htmlFor="autoRepl" className="text-[14px] font-medium">
            Auto-Vertretung aktivieren
          </label>
        </div>
        <p className="text-[12px] text-mute">
          Shalem postet deine betroffenen Schichten sofort im Tausch-Markt mit Bonus,
          damit Kolleg:innen schnell übernehmen können. Du musst nichts weiter tun.
        </p>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-soft font-medium">
            Bonus-Aufschlag · +{(bonusBps / 100).toFixed(0)} %
          </label>
          <input
            type="range"
            min={0}
            max={3000}
            step={250}
            value={bonusBps}
            onChange={(e) => setBonusBps(parseInt(e.target.value))}
            className="w-full mt-1.5"
            disabled={!autoRepl}
          />
          <div className="flex justify-between text-[10px] text-soft font-mono">
            <span>+0%</span>
            <span>+15% Standard</span>
            <span>+30% (Last-Minute)</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className="rounded-lg p-3 text-[13px]"
          style={{
            background: feedback.startsWith("✓") ? "rgb(var(--thu) / 0.1)" : "rgb(var(--mon) / 0.1)",
            color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))",
          }}
        >
          {feedback}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-3 border-t border-app-soft">
        <button onClick={submit} disabled={pending} className="btn btn-primary text-[13px]">
          {pending ? "..." : "Krankmeldung absenden"}
        </button>
      </div>

      <p className="text-[11px] text-soft">
        Hinweis: Eigenmeldung gilt je nach Tarif für 1–3 Tage. Ab Tag 4 (TVöD: Tag 4)
        ist eine ärztliche Bescheinigung Pflicht. Tele-AU ist möglich, sobald die
        Krankmeldung angelegt ist.
      </p>
    </section>
  );
}
