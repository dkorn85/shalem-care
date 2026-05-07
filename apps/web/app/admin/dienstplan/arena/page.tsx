// /admin/dienstplan/arena · Vollbild-Arena (kein AppShell)

import { DienstplanArena } from "@/components/DienstplanArena";

export const metadata = {
  title: "Dienstplan-Arena · Vollbild",
};

export default async function ArenaPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const sp = await searchParams;
  const heute = new Date();
  const dayOfWeek = heute.getDay() || 7;
  const monday = new Date(heute);
  monday.setDate(heute.getDate() - (dayOfWeek - 1));
  const weekStart = sp.start ?? monday.toISOString().slice(0, 10);

  return <DienstplanArena weekStart={weekStart} />;
}
