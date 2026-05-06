"use server";

import { revalidatePath } from "next/cache";
import { store } from "../swap-store";
import { getStationOfPerson, getStation } from "../hierarchy/store";
import { hourlyRateFor } from "../tariff";
import { recordAction } from "../undo/undo";
import {
  createKrankmeldung,
  updateKrankmeldungStatus,
  setBisDatum,
  attachEAU,
  attachArzttermin,
  getKrankmeldung,
  createArzttermin,
  updateArzttermineStatus,
  seedKrankmeldungOnce,
} from "./store";
import { searchAvailableSlots, bookSlot, requestTeleAU, type AvailableSlot } from "./doctor-api";
import {
  sendEAUtoKrankenkasse,
  requestKrankengeld,
  computeKrankengeldFristen,
} from "./krankenkasse-api";
import { computeBonusFor, publishReplacementOffer } from "./auto-replacement";
import type { AUType, SymptomKategorie, Arztterminart } from "./types";
import { entwurfClaimAusKrankmeldung } from "../solidartopf/auto-claim";
import { seedSolidarTopfOnce } from "../solidartopf/store";

type Result<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

// ─── Krank melden (Schritt 1: Erstmeldung) ─────────────────

export async function meldeKrank(input: {
  personId: string;
  symptomKategorie: SymptomKategorie;
  freitext: string;
  vonDatum: string;             // YYYY-MM-DD
  voraussichtlichBis: string;    // YYYY-MM-DD
  auType: AUType;
  krankenkasseName?: string;
  krankenkasseIK?: string;
  autoReplacement: boolean;
  bonusAufschlagBps: number;
}): Promise<Result<{ krankmeldungId: string; betroffeneShifts: number; ersatzAngebote: string[]; solidarClaimId: string | null }>> {
  seedKrankmeldungOnce();

  const person = await store.getPerson(input.personId);
  if (!person) return { ok: false, error: "Mitarbeiter nicht gefunden." };

  const stationId = getStationOfPerson(input.personId);
  const station = stationId ? getStation(stationId) : null;
  const einrichtungId = station?.einrichtungId ?? "kh-essen-mitte";

  // Slots im AU-Zeitraum finden
  const slots = await store.listSlotsForPerson(input.personId);
  const von = input.vonDatum;
  const bis = input.voraussichtlichBis;
  const betroffene = slots.filter((s) => {
    const day = (s.start ?? "").slice(0, 10);
    return day && day >= von && day <= bis;
  });

  // Krankmeldung anlegen
  const km = createKrankmeldung({
    personId: input.personId,
    einrichtungId,
    stationId: stationId ?? undefined,
    symptomKategorie: input.symptomKategorie,
    freitext: input.freitext,
    vonDatum: input.vonDatum,
    voraussichtlichBis: input.voraussichtlichBis,
    auType: input.auType,
    betroffeneSlotIds: betroffene.map((s) => s.id!).filter(Boolean),
    autoReplacement: input.autoReplacement,
    bonusAufschlagBps: input.bonusAufschlagBps,
    krankenkasse: input.krankenkasseName && input.krankenkasseIK
      ? {
          name: input.krankenkasseName,
          ikNummer: input.krankenkasseIK,
          eauVersendet: false,
        }
      : undefined,
  });

  // Auto-Replacement: für jeden betroffenen Slot ein Angebot publizieren
  const ersatzAngebote: string[] = [];
  if (input.autoReplacement) {
    const baseRate = hourlyRateFor(person.tariffGrade);
    for (const slot of betroffene) {
      const bonus = computeBonusFor(slot, baseRate);
      // override: wenn der User selbst einen niedrigeren Bonus gewählt hat, respektieren
      const finalBonus = Math.max(input.bonusAufschlagBps, 0);
      const r = await publishReplacementOffer({
        slotId: slot.id!,
        bonusBps: finalBonus || bonus.bonusBps,
        reason: bonus.reason,
        offeredBy: input.personId,
        krankmeldungId: km.id,
      });
      if (r.ok) ersatzAngebote.push(r.offerId);
    }
  }

  recordAction({
    actor: input.personId,
    description: `Krank gemeldet (${input.vonDatum} – ${input.voraussichtlichBis})`,
    category: "shift",
    inverse: { type: "noop", reason: "Krankmeldung wird durch Genesung beendet, nicht zurückgenommen" },
  });

  // ─── Solidar-Topf · Auto-Claim ────────────────────────────────────────
  // Wer krank wird, soll keine zweite Hürde haben. Die Genossenschaft
  // erstellt aus der Krankmeldung sofort einen Topf-Claim — Approval
  // läuft im Hintergrund über die Stationsleitung.
  let solidarClaimId: string | null = null;
  try {
    seedSolidarTopfOnce();
    const claim = entwurfClaimAusKrankmeldung(km, person, betroffene);
    solidarClaimId = claim.id;
  } catch {
    // Topf-Fehler darf Krankmeldung nicht blockieren — Person muss
    // krank werden dürfen, auch wenn der Topf-Service hängt.
  }

  revalidatePath("/profil/krankmeldung");
  revalidatePath("/profil");
  revalidatePath("/");
  revalidatePath("/dienst");
  revalidatePath("/admin");
  revalidatePath("/admin/dienstplan");
  revalidatePath("/tausch");
  revalidatePath("/admin/genehmigungen");
  revalidatePath("/genossenschaft/solidartopf");

  return {
    ok: true,
    krankmeldungId: km.id,
    betroffeneShifts: betroffene.length,
    ersatzAngebote,
    solidarClaimId,
  };
}

// ─── eAU vom Arzt eintragen / hochladen ────────────────────

export async function attachEAUtoKrankmeldung(input: {
  krankmeldungId: string;
  eauReferenz: string;
  vonDatum: string;
  bisDatum: string;
}): Promise<Result> {
  const km = getKrankmeldung(input.krankmeldungId);
  if (!km) return { ok: false, error: "Krankmeldung nicht gefunden." };

  const updated = attachEAU(input.krankmeldungId, input.eauReferenz);
  if (!updated) return { ok: false, error: "Aktualisierung fehlgeschlagen." };

  // Falls Krankenkasse hinterlegt: an die Kasse weiterleiten
  if (km.krankenkasse?.ikNummer) {
    await sendEAUtoKrankenkasse({
      ikNummer: km.krankenkasse.ikNummer,
      eauReferenz: input.eauReferenz,
      arztName: "—",
      vonDatum: input.vonDatum,
      bisDatum: input.bisDatum,
    });
  }

  revalidatePath("/profil/krankmeldung");
  return { ok: true };
}

// ─── Krankengeld beantragen (nach Tag 43) ──────────────────

export async function beantrageKrankengeld(krankmeldungId: string): Promise<Result<{ antragId: string }>> {
  const km = getKrankmeldung(krankmeldungId);
  if (!km) return { ok: false, error: "Krankmeldung nicht gefunden." };
  if (!km.krankenkasse?.ikNummer) {
    return { ok: false, error: "Krankenkasse nicht hinterlegt." };
  }
  const fristen = computeKrankengeldFristen(km.vonDatum);
  const today = new Date().toISOString().slice(0, 10);
  if (today < fristen.krankengeldAb) {
    return { ok: false, error: `Krankengeld kann erst ab ${fristen.krankengeldAb} beantragt werden (nach 6 Wo Lohnfortzahlung).` };
  }

  const r = await requestKrankengeld({
    ikNummer: km.krankenkasse.ikNummer,
    vonDatum: fristen.krankengeldAb,
  });
  if (!r.ok) return { ok: false, error: r.reason };

  km.krankenkasse.krankengeldAntragId = r.antragId;
  updateKrankmeldungStatus(krankmeldungId, "krankengeld", r.antragId);

  revalidatePath("/profil/krankmeldung");
  return { ok: true, antragId: r.antragId };
}

// ─── Wieder arbeitsfähig melden ────────────────────────────

export async function meldeWiederArbeitsfaehig(krankmeldungId: string, bisDatum: string): Promise<Result> {
  const km = getKrankmeldung(krankmeldungId);
  if (!km) return { ok: false, error: "Krankmeldung nicht gefunden." };
  setBisDatum(krankmeldungId, bisDatum);
  updateKrankmeldungStatus(krankmeldungId, "wieder_arbeitsfaehig");
  revalidatePath("/profil/krankmeldung");
  revalidatePath("/profil");
  revalidatePath("/");
  return { ok: true };
}

// ─── Arzttermin: Slots suchen, buchen, Tele-AU ─────────────

export async function suchArzttermine(input: {
  symptomKategorie: SymptomKategorie;
  preferVideo?: boolean;
}): Promise<Result<{ slots: AvailableSlot[] }>> {
  const slots = await searchAvailableSlots({
    symptomKategorie: input.symptomKategorie,
    preferVideo: input.preferVideo,
  });
  return { ok: true, slots };
}

export async function bucheArzttermin(input: {
  slot: AvailableSlot;
  personId: string;
  art: Arztterminart;
  anliegen: string;
  krankmeldungId?: string;
}): Promise<Result<{ terminId: string; videoCallUrl?: string }>> {
  const r = await bookSlot({
    slot: input.slot,
    personId: input.personId,
    anliegen: input.anliegen,
    krankmeldungId: input.krankmeldungId,
  });
  if (!r.ok) return { ok: false, error: "Buchung fehlgeschlagen." };

  const termin = createArzttermin({
    personId: input.personId,
    art: input.art,
    praxisName: input.slot.praxisName,
    arztName: input.slot.arztName,
    fachrichtung: input.slot.fachrichtung,
    zeitslot: input.slot.zeitslot,
    durationMin: input.slot.durationMin,
    videoCallUrl: r.videoCallUrl,
    videoCallProvider: input.slot.provider,
    status: "bestaetigt",
    notiz: input.anliegen,
    krankmeldungId: input.krankmeldungId,
  });

  if (input.krankmeldungId) {
    attachArzttermin(input.krankmeldungId, termin.id);
  }

  revalidatePath("/profil/krankmeldung");
  return { ok: true, terminId: termin.id, videoCallUrl: r.videoCallUrl };
}

export async function ausstellenTeleAU(input: {
  krankmeldungId: string;
  personId: string;
}): Promise<Result<{ eauReferenz: string; gueltigBis: string; arztName: string }>> {
  const km = getKrankmeldung(input.krankmeldungId);
  if (!km) return { ok: false, error: "Krankmeldung nicht gefunden." };

  const r = await requestTeleAU({
    personId: input.personId,
    symptomKategorie: km.symptomKategorie,
    freitext: km.freitext,
    krankmeldungId: input.krankmeldungId,
  });
  if (!r.ok) return { ok: false, error: r.reason };

  attachEAU(input.krankmeldungId, r.eauReferenz);
  setBisDatum(input.krankmeldungId, r.gueltigBis);

  if (km.krankenkasse?.ikNummer) {
    await sendEAUtoKrankenkasse({
      ikNummer: km.krankenkasse.ikNummer,
      eauReferenz: r.eauReferenz,
      arztName: r.arztName,
      vonDatum: km.vonDatum,
      bisDatum: r.gueltigBis,
    });
  }

  revalidatePath("/profil/krankmeldung");
  return { ok: true, eauReferenz: r.eauReferenz, gueltigBis: r.gueltigBis, arztName: r.arztName };
}

export async function bestaetigeArzttermin(terminId: string) {
  const t = updateArzttermineStatus(terminId, "stattgefunden");
  if (t) revalidatePath("/profil/krankmeldung");
  return { ok: !!t };
}
