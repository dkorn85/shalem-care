"use server";

import { revalidatePath } from "next/cache";
import {
  markiereInBearbeitung,
  markiereErledigt,
  setzeOffen,
  delegiereInbox,
} from "./store";
import type { Berufsfeld } from "@/lib/team-um-klient/store";

const COCKPIT_ROUTE: Record<Berufsfeld, string> = {
  pflege:        "/pflege",
  arzt:          "/arzt",
  therapie:      "/therapie",
  sozialarbeit:  "/sozial",
  heilerziehung: "/heilerziehung",
  ehrenamt:      "/ehrenamt",
  hauswirtschaft:"/hauswirtschaft",
  klient:        "/klient",
  angehoerig:    "/klient",
  lead:          "/admin",
};

function revalidateBeruf(beruf: Berufsfeld) {
  revalidatePath(COCKPIT_ROUTE[beruf]);
  revalidatePath("/netz");
}

export async function inboxAnnehmen(input: { beruf: Berufsfeld; eventId: string; zugewiesenAn?: string }) {
  markiereInBearbeitung(input.beruf, input.eventId, input.zugewiesenAn);
  revalidateBeruf(input.beruf);
}

export async function inboxErledigen(input: { beruf: Berufsfeld; eventId: string; notiz?: string }) {
  markiereErledigt(input.beruf, input.eventId, input.notiz);
  revalidateBeruf(input.beruf);
}

export async function inboxOeffnen(input: { beruf: Berufsfeld; eventId: string }) {
  setzeOffen(input.beruf, input.eventId);
  revalidateBeruf(input.beruf);
}

export async function inboxDelegieren(input: {
  vonBeruf: Berufsfeld;
  zielBeruf: Berufsfeld;
  eventId: string;
  notiz?: string;
}) {
  delegiereInbox(input.vonBeruf, input.zielBeruf, input.eventId, input.notiz);
  revalidateBeruf(input.vonBeruf);
  revalidateBeruf(input.zielBeruf);
}
