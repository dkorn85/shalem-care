"use server";

import { generateHud, type DienstplanHud, type HudFilter } from "@/lib/dienstplan/hud-store";

export async function regenerateHudAction(filter: HudFilter): Promise<DienstplanHud> {
  return generateHud(filter);
}
