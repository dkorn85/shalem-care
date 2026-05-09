// Status-Badge für Identitäten — wird überall angezeigt, wo eine Klient-
// oder Mitarbeiter-ID auftaucht (Bett-Belegung, Klient-Akte-Header,
// Mitarbeiter-Liste). Klick führt zur Identity-Detail-Page (oder Claim).

import Link from "next/link";
import { getIdentity } from "@/lib/identity/store";

const STATUS_FARBE = {
  unbeansprucht: "var(--vibe-approval)",
  geclaimt:      "var(--thu)",
  widerrufen:    "var(--mon)",
} as const;

const STATUS_LABEL = {
  unbeansprucht: "unbeansprucht",
  geclaimt:      "geclaimt",
  widerrufen:    "widerrufen",
} as const;

const STATUS_GLYPH = {
  unbeansprucht: "○",
  geclaimt:      "●",
  widerrufen:    "⊘",
} as const;

export function IdentityBadge({
  id,
  size = "sm",
  klickbar = true,
}: {
  id: string;
  size?: "xs" | "sm" | "md";
  klickbar?: boolean;
}) {
  const e = getIdentity(id);
  if (!e) return null;

  const farbe = STATUS_FARBE[e.claimStatus];
  const glyph = STATUS_GLYPH[e.claimStatus];
  const label = STATUS_LABEL[e.claimStatus];
  const padding = size === "xs" ? "px-1 py-0" : size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";
  const text = size === "xs" ? "text-[9px]" : size === "sm" ? "text-[10px]" : "text-[11px]";

  const inner = (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-mono ${padding} ${text}`}
      style={{
        background: `rgb(${farbe} / 0.15)`,
        color: `rgb(${farbe})`,
      }}
      title={`ID ${e.id} · ${label}${e.claimedAt ? ` · seit ${e.claimedAt.slice(0, 10)}` : ""}`}
    >
      <span aria-hidden>{glyph}</span>
      <span>{label}</span>
    </span>
  );

  if (!klickbar) return inner;
  return (
    <Link href={`/identity/${e.id}`} className="hover:underline underline-offset-2">
      {inner}
    </Link>
  );
}

// Token-Anzeige zum Weitergeben — groß, monospace, kopierbar.
export function ClaimTokenAnzeige({ token, label = "Claim-Code" }: { token: string; label?: string }) {
  return (
    <div className="rounded-lg p-3 inline-flex flex-col items-start gap-1" style={{ background: "rgb(var(--vibe-approval) / 0.10)", boxShadow: "inset 0 0 0 1.5px rgb(var(--vibe-approval) / 0.40)" }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>
        {label}
      </p>
      <code className="font-mono text-[20px] font-bold tracking-wider" style={{ color: "rgb(var(--vibe-approval))" }}>
        {token}
      </code>
    </div>
  );
}
