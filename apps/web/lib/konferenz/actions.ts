"use server";

import { revalidatePath } from "next/cache";
import {
  starteKonferenz,
  beendeKonferenz,
  vertageKonferenz,
  aktualisiereLiveNotizen,
  setzeAgendaStatus,
  fuegeBeschlussHinzu,
  setzeBeschlussStatus,
  loescheBeschluss,
} from "./store";
import type { AgendaPunkt, Beschluss } from "./store";

function revalidateKonferenz(id: string) {
  revalidatePath(`/konferenz/${id}`);
  revalidatePath("/admin");
  revalidatePath("/pflege");
  revalidatePath("/arzt");
  revalidatePath("/therapie");
  revalidatePath("/sozial");
  revalidatePath("/ehrenamt");
  revalidatePath("/klient");
}

export async function konferenzStarten(input: { id: string }) {
  starteKonferenz(input.id);
  revalidateKonferenz(input.id);
}

export async function konferenzBeenden(input: { id: string; naechsteKonferenz?: string }) {
  beendeKonferenz(input.id, input.naechsteKonferenz);
  revalidateKonferenz(input.id);
}

export async function konferenzVertagen(input: { id: string }) {
  vertageKonferenz(input.id);
  revalidateKonferenz(input.id);
}

export async function liveNotizenSpeichern(input: { id: string; notizen: string }) {
  aktualisiereLiveNotizen(input.id, input.notizen);
  revalidateKonferenz(input.id);
}

export async function agendaStatusSetzen(input: {
  id: string;
  agendaId: string;
  status: AgendaPunkt["status"];
  notiz?: string;
}) {
  setzeAgendaStatus(input.id, input.agendaId, input.status, input.notiz);
  revalidateKonferenz(input.id);
}

export async function beschlussHinzufuegen(input: {
  id: string;
  was: string;
  wer: string;
  bis: string;
}) {
  fuegeBeschlussHinzu(input.id, input.was, input.wer, input.bis);
  revalidateKonferenz(input.id);
}

export async function beschlussStatusSetzen(input: {
  id: string;
  beschlussId: string;
  status: Beschluss["status"];
}) {
  setzeBeschlussStatus(input.id, input.beschlussId, input.status);
  revalidateKonferenz(input.id);
}

export async function beschlussLoeschen(input: { id: string; beschlussId: string }) {
  loescheBeschluss(input.id, input.beschlussId);
  revalidateKonferenz(input.id);
}
