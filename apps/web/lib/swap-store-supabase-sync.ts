// Supabase-Sync-Layer für den swap-store · fail-soft Schicht über
// dem bestehenden InMemorySwapStore.
//
// Pattern wie in lib/klient/wunsch-store.ts:
//  · Wenn Supabase nicht konfiguriert → noop (Memory bleibt Wahrheit)
//  · Schreib-Aktion (create/update Offer) → parallel Supabase-Upsert
//  · Lese-Hydration (Page-Loader) → ladeOffersAusSupabase()
//
// Alle Funktionen swallow-en Netzwerkfehler — der Memory-Store ist die
// Quelle der Wahrheit, Supabase ist Persistenz für Server-Restart.

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";
import type { SwapOffer } from "./swap-store";
import type { SwapState } from "./swap-machine";

type SupabaseRow = {
  id:                 string;
  state:              SwapState;
  slot_id:            string;
  offered_by:         string;
  offered_at:         string;
  seeking_slot_id:    string | null;
  seeking_free_text:  string | null;
  accepted_by:        string | null;
  accepted_at:        string | null;
  approved_by:        string | null;
  approved_at:        string | null;
  rejected_reason:    string | null;
};

type SupabaseHistoryRow = {
  offer_id:  string;
  event:     string;
  at:        string;
  actor:     string | null;
  meta:      string | null;
};

function ausRow(r: SupabaseRow, history: SwapOffer["history"]): SwapOffer {
  return {
    id:                 r.id,
    state:              r.state,
    slotId:             r.slot_id,
    offeredBy:          r.offered_by,
    offeredAt:          r.offered_at,
    seekingSlotId:      r.seeking_slot_id  ?? undefined,
    seekingFreeText:    r.seeking_free_text ?? undefined,
    acceptedBy:         r.accepted_by      ?? undefined,
    acceptedAt:         r.accepted_at      ?? undefined,
    approvedBy:         r.approved_by      ?? undefined,
    approvedAt:         r.approved_at      ?? undefined,
    rejectedReason:     r.rejected_reason  ?? undefined,
    history,
  };
}

function zuRow(o: SwapOffer): SupabaseRow {
  return {
    id:                 o.id,
    state:              o.state,
    slot_id:            o.slotId,
    offered_by:         o.offeredBy,
    offered_at:         o.offeredAt,
    seeking_slot_id:    o.seekingSlotId    ?? null,
    seeking_free_text:  o.seekingFreeText  ?? null,
    accepted_by:        o.acceptedBy       ?? null,
    accepted_at:        o.acceptedAt       ?? null,
    approved_by:        o.approvedBy       ?? null,
    approved_at:        o.approvedAt       ?? null,
    rejected_reason:    o.rejectedReason   ?? null,
  };
}

function envCreds(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

/** Speichert eine Offer in Supabase (Upsert). Fail-soft. */
export async function syncOfferZuSupabase(offer: SwapOffer): Promise<void> {
  const c = envCreds();
  if (!c) return;
  try {
    await fetch(`${c.url}/rest/v1/swap_offer?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey:        c.key,
        Authorization: `Bearer ${c.key}`,
        "Content-Type": "application/json",
        Prefer:        "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(zuRow(offer)),
      cache: "no-store",
    });
  } catch {/* fail-soft */}
}

/** Lädt alle Offers + ihre History aus Supabase, mappt auf SwapOffer-Form. */
export async function ladeOffersAusSupabase(): Promise<SwapOffer[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const [rows, historyRows] = await Promise.all([
      supabaseSelect<SupabaseRow[]>(`swap_offer?select=*&order=offered_at.desc`),
      supabaseSelect<SupabaseHistoryRow[]>(`swap_offer_history?select=*&order=at.asc`),
    ]);
    const historyByOffer = new Map<string, SwapOffer["history"]>();
    for (const h of historyRows) {
      const arr = historyByOffer.get(h.offer_id) ?? [];
      arr.push({ event: h.event, at: h.at, actor: h.actor ?? undefined, meta: h.meta ?? undefined });
      historyByOffer.set(h.offer_id, arr);
    }
    return rows.map((r) => ausRow(r, historyByOffer.get(r.id) ?? []));
  } catch {
    return [];
  }
}
