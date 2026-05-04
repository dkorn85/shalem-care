"use server";

import { revalidatePath } from "next/cache";
import { undoLastAction, undoActionById, listRecentActions } from "./undo";

export async function undoLastAction_action() {
  const result = await undoLastAction();

  // Revalidate alles wo Daten sichtbar werden
  revalidatePath("/");
  revalidatePath("/tausch");
  revalidatePath("/admin");
  revalidatePath("/admin/genehmigungen");
  revalidatePath("/admin/disposition");
  revalidatePath("/admin/team");
  revalidatePath("/admin/dienstplan");
  revalidatePath("/system");
  revalidatePath("/system/[bundeslandId]", "layout");
  revalidatePath("/system/[bundeslandId]/[einrichtungId]", "layout");

  return result;
}

export async function undoActionById_action(actionId: string) {
  const result = await undoActionById(actionId);
  revalidatePath("/", "layout");
  return result;
}

export async function listRecentActions_action() {
  return listRecentActions(10);
}
