import type { Slot, Extension } from "@medplum/fhirtypes";

export type ShiftType = "early" | "late" | "night" | "intermediate";
export type SwapStatus = "open" | "matched" | "approved" | "withdrawn";
export type Tariff = "TVOED-P" | "AVR-CARITAS" | "AVR-DIAKONIE" | "INDIVIDUAL";

const NS = "https://shalem.care/fhir";

export const EXT = {
  shiftType: `${NS}/shift-type`,
  tariff: `${NS}/tariff`,
  qualificationRequired: `${NS}/qualification-required`,
  swapStatus: `${NS}/swap-status`,
  swapTarget: `${NS}/swap-target`,
} as const;

export function getExtension(slot: Slot, url: string): Extension | undefined {
  return slot.extension?.find((e) => e.url === url);
}

export function getShiftType(slot: Slot): ShiftType | undefined {
  return getExtension(slot, EXT.shiftType)?.valueCode as ShiftType | undefined;
}

export function getSwapStatus(slot: Slot): SwapStatus | undefined {
  return getExtension(slot, EXT.swapStatus)?.valueCode as SwapStatus | undefined;
}

export function getTariff(slot: Slot): Tariff | undefined {
  return getExtension(slot, EXT.tariff)?.valueCoding?.code as Tariff | undefined;
}

export function isOpenForSwap(slot: Slot): boolean {
  return getSwapStatus(slot) === "open";
}

export function getQualificationCode(slot: Slot): string | undefined {
  const ext = getExtension(slot, EXT.qualificationRequired);
  return ext?.valueCoding?.display ?? ext?.valueCoding?.code;
}

export function buildShiftSlot(opts: {
  scheduleRef: string;
  start: string;
  end: string;
  shiftType: ShiftType;
  tariff: Tariff;
  qualificationCode: string;
  qualificationDisplay: string;
}): Slot {
  return {
    resourceType: "Slot",
    meta: { profile: [`${NS}/StructureDefinition/ShalemShift`] },
    schedule: { reference: opts.scheduleRef },
    status: "busy",
    start: opts.start,
    end: opts.end,
    extension: [
      { url: EXT.shiftType, valueCode: opts.shiftType },
      {
        url: EXT.tariff,
        valueCoding: {
          system: `${NS}/CodeSystem/tariff`,
          code: opts.tariff,
          display: opts.tariff,
        },
      },
      {
        url: EXT.qualificationRequired,
        valueCoding: {
          system: "http://terminology.hl7.org/CodeSystem/v2-0360",
          code: opts.qualificationCode,
          display: opts.qualificationDisplay,
        },
      },
    ],
  };
}
