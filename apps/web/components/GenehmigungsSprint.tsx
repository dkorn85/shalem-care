"use client";

// GenehmigungsSprint · Vollbild-Swipe-Stack für alle pending Approvals.
//
// Mechanik: Karte oben im Stack zeigt 1 Approval. User swipt rechts (Approve)
// oder links (Reject) — per Tastatur (←/→), Maus (Buttons), oder Drag-Geste.
// Combo bei aufeinanderfolgenden Sprint-Sessions ohne Skip. Backlog-Score
// in der Topbar zeigt verbleibende Karten · Konfetti wenn Stack leer.
//
// KI-Empfehlung steht prominent als Hinweis · Risk-Flags in Pillen.

import { useEffect, useMemo, useRef, useState } from "react";
import { entscheideKarte } from "@/lib/approval/sprint-actions";
import {
  farbeFuer,
  labelFuer,
  type ApprovalKarte,
} from "@/lib/approval/sprint-store";

const EMPFEHL_FARBE: Record<ApprovalKarte["empfehlung"], string> = {
  approve: "var(--vibe-approval)",
  reject: "var(--mon)",
  vorsicht: "var(--sun)",
};

const EMPFEHL_LABEL: Record<ApprovalKarte["empfehlung"], string> = {
  approve: "✓ Empfehlung: Annehmen",
  reject: "✗ Empfehlung: Ablehnen",
  vorsicht: "⚠ Empfehlung: prüfen",
};

const TYP_EMOJI: Record<string, string> = {
  tausch: "🔄",
  hkp: "📜",
  pflegegrad: "🏛",
  ausschuettung: "💶",
};

export function GenehmigungsSprint({ initialKarten }: { initialKarten: ApprovalKarte[] }) {
  const [stack, setStack] = useState<ApprovalKarte[]>(initialKarten);
  const [pos, setPos] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [istAnimiert, setIstAnimiert] = useState<"approve" | "reject" | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; ton: "ok" | "fail" } | null>(null);
  const [konfetti, setKonfetti] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startStack = useRef(initialKarten.length);
  const sessionStart = useRef(Date.now());

  const aktuell = stack[pos];
  const verbleibend = stack.length - pos;
  const erledigt = pos;

  // Tastatur-Shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (pending) return;
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "j" || e.key.toLowerCase() === "y") {
        entscheide(true);
      } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "n") {
        entscheide(false);
      } else if (e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        skip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, pos, stack]);

  function flash(text: string, ton: "ok" | "fail") {
    setFeedback({ text, ton });
    window.setTimeout(() => setFeedback(null), 1500);
  }

  async function entscheide(approve: boolean) {
    if (!aktuell || pending) return;
    setPending(true);
    setIstAnimiert(approve ? "approve" : "reject");
    setError(null);

    // KI-Empfehlung gefolgt = Combo-Stein
    const folgtEmpfehlung =
      (approve && aktuell.empfehlung === "approve") ||
      (!approve && aktuell.empfehlung === "reject") ||
      (aktuell.empfehlung === "vorsicht");
    if (folgtEmpfehlung) {
      const c = combo + 1;
      setCombo(c);
      setMaxCombo(Math.max(maxCombo, c));
      setScore((s) => s + 10 + c * 2);
      flash(`+${10 + c * 2} ${comboPhrase(c)}`, "ok");
    } else {
      setCombo(0);
      setScore((s) => s + 5);
      flash("+5 abweichend von KI", "fail");
    }

    try {
      const r = await entscheideKarte({
        typ: aktuell.typ,
        ursprungsId: aktuell.ursprungsId,
        approve,
      });
      if (!r.ok) {
        setError(r.error ?? "Aktion fehlgeschlagen");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }

    // Animation und nächste Karte
    window.setTimeout(() => {
      setIstAnimiert(null);
      setPos((p) => p + 1);
      setPending(false);
      // Konfetti wenn Stack leer
      if (pos + 1 >= stack.length) {
        setKonfetti(true);
        flash("🎉 Alle Approvals abgearbeitet!", "ok");
        setTimeout(() => setKonfetti(false), 5000);
      }
    }, 380);
  }

  function skip() {
    if (!aktuell) return;
    flash("⏭ Übersprungen", "fail");
    setCombo(0);
    setIstAnimiert("reject");
    setTimeout(() => {
      setIstAnimiert(null);
      setStack((s) => [...s.slice(0, pos), ...s.slice(pos + 1), s[pos]]);
    }, 250);
  }

  if (!aktuell) {
    return (
      <FertigPanel
        score={score}
        maxCombo={maxCombo}
        anzahl={startStack.current}
        dauerSek={Math.round((Date.now() - sessionStart.current) / 1000)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgb(var(--bg))" }}>
      <Topbar
        verbleibend={verbleibend}
        erledigt={erledigt}
        gesamt={stack.length}
        combo={combo}
        maxCombo={maxCombo}
        score={score}
      />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
        {/* Stack: hintere 2 Karten als Schatten */}
        {stack.slice(pos + 1, pos + 3).map((k, i) => (
          <div
            key={k.id}
            className="absolute rounded-3xl pointer-events-none"
            style={{
              width: "min(560px, 90%)",
              height: "min(540px, 80vh)",
              background: "rgb(var(--bg-elev))",
              boxShadow: `0 4px 24px rgb(0 0 0 / ${0.05 + i * 0.05})`,
              transform: `translateY(${(i + 1) * 8}px) scale(${1 - (i + 1) * 0.04})`,
              opacity: 0.6 - i * 0.2,
              border: `1px solid rgb(${farbeFuer(k.typ)} / 0.2)`,
              zIndex: 1,
            }}
          />
        ))}

        <KarteAnzeige karte={aktuell} animiert={istAnimiert} />
      </div>

      <BottomActions
        karte={aktuell}
        pending={pending}
        onApprove={() => entscheide(true)}
        onReject={() => entscheide(false)}
        onSkip={skip}
      />

      {feedback && <FeedbackToast {...feedback} />}
      {konfetti && <Konfetti />}
      {error && (
        <div
          className="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg text-[12px] font-mono"
          style={{ background: "rgb(var(--mon))", color: "white" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────

function Topbar({
  verbleibend,
  erledigt,
  gesamt,
  combo,
  maxCombo,
  score,
}: {
  verbleibend: number;
  erledigt: number;
  gesamt: number;
  combo: number;
  maxCombo: number;
  score: number;
}) {
  const fortschritt = (erledigt / Math.max(1, gesamt)) * 100;
  return (
    <div className="border-b shrink-0" style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}>
      <div className="flex items-center justify-between gap-3 px-4 py-2 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <a href="/admin/genehmigungen" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">
            ← Verlassen
          </a>
          <h1 className="font-display text-[16px] font-bold tracking-tight2">Genehmigungs-Sprint</h1>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-soft">
            {erledigt}/{gesamt} erledigt · {verbleibend} offen
          </span>
          {combo > 1 && (
            <span
              className="px-2 py-0.5 rounded font-display font-bold animate-pulse"
              style={{
                background: combo > 5 ? "rgb(var(--mon))" : combo > 2 ? "rgb(var(--accent))" : "rgb(var(--vibe-team))",
                color: "white",
              }}
            >
              {combo}× Combo
            </span>
          )}
          {maxCombo > 0 && <span className="text-soft">Best {maxCombo}×</span>}
          <span className="px-2 py-0.5 rounded font-bold" style={{ background: "rgb(var(--vibe-approval) / 0.15)", color: "rgb(var(--vibe-approval))" }}>
            {score} pts
          </span>
        </div>
      </div>
      <div className="h-1 bg-[rgb(var(--bg-mute))] overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${fortschritt}%`, background: "linear-gradient(90deg, rgb(var(--accent)), rgb(var(--vibe-approval)))" }}
        />
      </div>
    </div>
  );
}

// ─── Karten-Anzeige ──────────────────────────────────────────────

function KarteAnzeige({ karte, animiert }: { karte: ApprovalKarte; animiert: "approve" | "reject" | null }) {
  const farbe = farbeFuer(karte.typ);
  const empFarbe = EMPFEHL_FARBE[karte.empfehlung];
  return (
    <article
      className="rounded-3xl p-6 sm:p-8 flex flex-col relative z-10"
      style={{
        width: "min(560px, 90%)",
        height: "min(540px, 80vh)",
        background: "rgb(var(--bg-elev))",
        boxShadow: `0 12px 48px rgb(0 0 0 / 0.15), 0 0 0 2px rgb(${farbe} / 0.4)`,
        transform: animiert === "approve"
          ? "translateX(120%) rotate(15deg)"
          : animiert === "reject"
            ? "translateX(-120%) rotate(-15deg)"
            : "translateX(0) rotate(0)",
        opacity: animiert ? 0 : 1,
        transition: "all 0.38s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      <header className="mb-4">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono font-bold"
            style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
          >
            {TYP_EMOJI[karte.typ]} {labelFuer(karte.typ)}
          </span>
          <span className="text-[11px] text-soft font-mono ml-auto">
            wartet seit {karte.wartetSeitTagen} {karte.wartetSeitTagen === 1 ? "Tag" : "Tagen"}
          </span>
        </div>
        <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight2 leading-tight mt-3">
          {karte.titel}
        </h2>
        <p className="text-[14px] text-mute mt-1">{karte.subjekt}</p>
      </header>

      <div className="flex-1 overflow-y-auto">
        <p className="text-[13px] leading-relaxed mb-4">{karte.kontext}</p>

        {karte.flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {karte.flags.map((f, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-full font-mono"
                style={{
                  background: "rgb(var(--mon) / 0.10)",
                  color: "rgb(var(--mon))",
                }}
              >
                ⚠ {f}
              </span>
            ))}
          </div>
        )}

        {karte.betragEuro !== undefined && (
          <div
            className="rounded-lg p-3 mb-4"
            style={{ background: "rgb(var(--vibe-approval) / 0.08)" }}
          >
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-0.5">Betrag</p>
            <p className="font-display text-[20px] font-bold" style={{ color: "rgb(var(--vibe-approval))" }}>
              {karte.betragEuro.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
            </p>
          </div>
        )}
      </div>

      {/* KI-Empfehlung */}
      <div
        className="rounded-2xl p-3 mt-2"
        style={{
          background: `rgb(${empFarbe} / 0.10)`,
          border: `1px solid rgb(${empFarbe} / 0.4)`,
        }}
      >
        <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: `rgb(${empFarbe})` }}>
          ✦ Lana KI-Sicht
        </p>
        <p className="text-[14px] font-medium mb-1" style={{ color: `rgb(${empFarbe})` }}>
          {EMPFEHL_LABEL[karte.empfehlung]}
        </p>
        <p className="text-[12px] text-mute leading-relaxed">{karte.empfehlungsText}</p>
      </div>
    </article>
  );
}

// ─── Bottom Actions ─────────────────────────────────────────────

function BottomActions({
  karte,
  pending,
  onApprove,
  onReject,
  onSkip,
}: {
  karte: ApprovalKarte;
  pending: boolean;
  onApprove: () => void;
  onReject: () => void;
  onSkip: () => void;
}) {
  void karte;
  return (
    <div
      className="border-t shrink-0 px-4 py-3 flex items-center justify-center gap-3"
      style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}
    >
      <button
        onClick={onReject}
        disabled={pending}
        className="w-16 h-16 rounded-full grid place-items-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 shadow-lg"
        style={{ background: "rgb(var(--mon))", color: "white" }}
        aria-label="Ablehnen · ←"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <button
        onClick={onSkip}
        disabled={pending}
        className="w-12 h-12 rounded-full grid place-items-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
        style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
        aria-label="Skip · Leertaste"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M5 4l10 8-10 8V4zM18 4v16" />
        </svg>
      </button>
      <button
        onClick={onApprove}
        disabled={pending}
        className="w-16 h-16 rounded-full grid place-items-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 shadow-lg"
        style={{ background: "rgb(var(--vibe-approval))", color: "white" }}
        aria-label="Annehmen · →"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </button>
    </div>
  );
}

// ─── Fertig-Panel ───────────────────────────────────────────────

function FertigPanel({ score, maxCombo, anzahl, dauerSek }: { score: number; maxCombo: number; anzahl: number; dauerSek: number }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgb(var(--bg))" }}>
      <div className="text-center">
        <p className="text-[64px] mb-4">🎉</p>
        <h1 className="font-display text-[36px] font-bold tracking-tight2 mb-3">
          Stack leer · alles entschieden
        </h1>
        <div className="flex justify-center gap-6 text-[13px] mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Score</p>
            <p className="font-display text-[28px] font-bold" style={{ color: "rgb(var(--vibe-approval))" }}>
              {score}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Max-Combo</p>
            <p className="font-display text-[28px] font-bold">{maxCombo}×</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Approvals</p>
            <p className="font-display text-[28px] font-bold">{anzahl}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Zeit</p>
            <p className="font-display text-[28px] font-bold">
              {Math.floor(dauerSek / 60)}:{String(dauerSek % 60).padStart(2, "0")}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <a href="/admin/genehmigungen" className="btn btn-primary text-[13px]">
            ← Zurück zur Übersicht
          </a>
          <a href="/admin" className="text-[13px] text-soft hover:text-mute px-4 py-2">
            Admin-Cockpit
          </a>
        </div>
      </div>
      <Konfetti />
    </div>
  );
}

// ─── Effekte ────────────────────────────────────────────────────

function FeedbackToast({ text, ton }: { text: string; ton: "ok" | "fail" }) {
  const tonFarbe = ton === "ok" ? "var(--vibe-approval)" : "var(--mon)";
  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-2xl font-display font-bold text-[16px] pointer-events-none"
      style={{
        background: `rgb(${tonFarbe})`,
        color: "white",
        boxShadow: `0 8px 24px rgb(${tonFarbe} / 0.4)`,
        animation: "feedbackSlide 1.5s ease-out forwards",
      }}
    >
      {text}
      <style>{`
        @keyframes feedbackSlide {
          0% { opacity: 0; transform: translate(-50%, -16px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          80% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -8px); }
        }
      `}</style>
    </div>
  );
}

function Konfetti() {
  const stuecke = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.2,
      farbe: ["var(--mon)", "var(--tue)", "var(--wed)", "var(--thu)", "var(--fri)", "var(--sat)", "var(--sun)"][i % 7],
      size: 6 + Math.random() * 10,
      drift: -40 + Math.random() * 80,
    }));
  }, []);
  return (
    <div className="fixed inset-0 z-[55] pointer-events-none overflow-hidden">
      {stuecke.map((s) => (
        <span
          key={s.id}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: "-20px",
            width: s.size,
            height: s.size,
            background: `rgb(${s.farbe})`,
            borderRadius: 2,
            animation: `confettiFall 3.8s ${s.delay}s linear forwards`,
            ["--drift" as string]: `${s.drift}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 110vh) rotate(720deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

function comboPhrase(c: number): string {
  if (c >= 10) return "🔥 On Fire";
  if (c >= 5) return "⚡ Streak!";
  if (c >= 3) return "✨ Combo";
  if (c === 2) return "👍 Doppel";
  return "✓";
}
