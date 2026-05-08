"use client";

// Wrapper für expertise-abhängiges Rendering.
//
//   <NurAbProfi rolle="pflege">…Profi-only…</NurAbProfi>
//   <NurBeiLerne rolle="pflege">…Azubi-Hilfe-Banner…</NurBeiLerne>
//   <NurBisPraxis rolle="pflege">…wird im Profi-Mode ausgeblendet…</NurBisPraxis>
//   <NurBeiLevel rolle="pflege" level="praxis">…</NurBeiLevel>
//
// Vor Mount nichts rendern — sonst Hydration-Mismatch.

import type { ReactNode } from "react";
import {
  useExpertise, levelMin, levelMax,
  type ExpertiseLevel, type ExpertiseRolle,
} from "@/lib/ui/expertise";

export function NurAb({ rolle, level, children }: { rolle: ExpertiseRolle; level: ExpertiseLevel; children: ReactNode }) {
  const { level: aktuell, mounted } = useExpertise(rolle);
  if (!mounted) return null;
  return levelMin(aktuell, level) ? <>{children}</> : null;
}

export function NurBis({ rolle, level, children }: { rolle: ExpertiseRolle; level: ExpertiseLevel; children: ReactNode }) {
  const { level: aktuell, mounted } = useExpertise(rolle);
  if (!mounted) return null;
  return levelMax(aktuell, level) ? <>{children}</> : null;
}

export function NurBeiLevel({ rolle, level, children }: { rolle: ExpertiseRolle; level: ExpertiseLevel; children: ReactNode }) {
  const { level: aktuell, mounted } = useExpertise(rolle);
  if (!mounted) return null;
  return aktuell === level ? <>{children}</> : null;
}

// Komfort-Wrapper · sprechender als generische
export function NurAbProfi({ rolle, children }: { rolle: ExpertiseRolle; children: ReactNode }) {
  return <NurAb rolle={rolle} level="profi">{children}</NurAb>;
}

export function NurBeiLerne({ rolle, children }: { rolle: ExpertiseRolle; children: ReactNode }) {
  return <NurBeiLevel rolle={rolle} level="lerne">{children}</NurBeiLevel>;
}

export function NurBisPraxis({ rolle, children }: { rolle: ExpertiseRolle; children: ReactNode }) {
  return <NurBis rolle={rolle} level="praxis">{children}</NurBis>;
}
